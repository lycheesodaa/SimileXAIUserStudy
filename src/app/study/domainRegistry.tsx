import { ReactNode } from 'react';
import { SimileExplanationV3, SimileItem } from '../components/similes/SimileExplanationV3';
import { CuesExplanationV1 } from '../components/cues/CuesExplanationV1';
import { CuesPractice } from '../components/cues/CuesPractice';
import { ExampleExplanation, ExampleItem } from '../components/examples/ExampleExplanation';
import { ExamplesCheatsheet } from '../components/examples/ExamplesCheatsheet';
import { ExamplesTutorial } from '../components/tutorial/ExamplesTutorial';
import { SimileTutorial } from '../components/tutorial/SimileTutorial';
import { CuesTutorial } from '../components/tutorial/CuesTutorial';
import { NoXaiExplanation } from '../components/noxai/NoXaiExplanation';
import { NoXaiPractice } from '../components/noxai/NoXaiPractice';
import { ConceptCheatsheet } from '../components/concepts/ConceptCheatsheet';
import { ClassGuide } from '../components/guide/ClassGuide';
import {
  ConceptSet,
  DATA_V1_ROOT,
  DATA_V1_TRAIN_ROOT,
  DataRoot,
  isPositiveOnlySimiles,
  negativeWeightsAsNot,
  RexnetReport,
  V1ActivationsModel,
  V1AttrBreakdownModel,
  V1BetaBreakdownModel,
  activationsModelKey,
  attrBreakdownModelKey,
  V1FusedModel,
  V1Sample,
  betaBreakdownModelKey,
  fusedModelKey,
  loadConcepts,
  loadSample,
  parseRexnetReport,
  prettifyOnomatopoeia,
} from './dataV1';

// A study domain groups the XAI variants (conditions) available for one kind
// of data. Every condition is backed by the modular v1 bundle in
// public/data_v1/ (one JSON per sample, fetched at runtime and cached), so a
// variant's getSample is async and resolves to a pre-mapped view model that
// both render() and audioIdForSrc() consume synchronously. Adding a domain
// means one makeV1Domain(<domain>) entry — the bundle layout and model keys
// are uniform across domains.
export interface StudyXaiVariant<S = unknown> {
  /** 'minimal' logs only session lifecycle, audio and visibility/focus events
   *  (no click or scroll tracking). Default: 'full'. */
  logging?: 'full' | 'minimal';
  /** Sample ids exposed here end up in Qualtrics URLs — they must be opaque
   *  (no class labels). Resolves undefined on missing sample/model/fetch
   *  failure, which StudyView surfaces as lookup_error. `root` selects the
   *  bundle (default data_v1; data_v1_train for the practice subset). */
  getSample(sampleId: string, root?: DataRoot): Promise<S | undefined>;
  /** Resolve which audio a media event belongs to, from the element's src. */
  audioIdForSrc(sample: S, src: string): string;
  render(sample: S, ctx?: { isStudy?: boolean }): ReactNode;
  /** Training/practice descriptions shown before the test items (no sample).
   *  `root` selects which bundle's concept lists back the content (default
   *  data_v1); variants without bundle-driven content ignore it. */
  renderTrain(root?: DataRoot): ReactNode;
  /** Guided tour of the explanation UI (tutorial mode), rendered from a real
   *  sample but static/non-interactable. Absent = no tutorial (e.g. noxai). */
  renderTutorial?(sample: S): ReactNode;
}

export interface StudyDomainConfig {
  defaultXai: string;
  xaiVariants: Record<string, StudyXaiVariant<any>>;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const slugify = (s: string): string =>
  s.toLowerCase().replace(/\W+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// v1 filenames are opaque sample ids or concept phrases — never class labels —
// so a filename fallback is safe and more useful in logs than 'unknown'.
const filenameOf = (src: string): string => {
  try {
    return decodeURIComponent(new URL(src).pathname.split('/').pop() || 'unknown');
  } catch {
    return 'unknown';
  }
};

const audioIdOrFallback = (src: string, resolve: (src: string) => string | undefined): string => {
  if (!src) return 'unknown';
  if (src.startsWith('blob:')) return 'custom';
  return resolve(src) ?? filenameOf(src);
};

// ─── Fused simile / onomatopoeia conditions ───────────────────────────────────

interface FusedView {
  sample: V1Sample;
  items: SimileItem[];
  predictedLabel: string;
  /** Bundle whose concept lists back this view's cheatsheet (train subset
   *  maps to the live v1 bundle, which it mirrors and has no concepts/ of
   *  its own). */
  conceptsRoot: DataRoot;
  root?: DataRoot;
}

// The practice subset has no concepts/ dir; its cheatsheets read the live v1
// bundle it mirrors, exactly as they did before roots were threaded through.
const conceptsRootFor = (root: DataRoot | undefined): DataRoot =>
  !root || root === DATA_V1_TRAIN_ROOT ? DATA_V1_ROOT : root;

const fusedVariant = (
  domain: string,
  set: ConceptSet,
  // 'beta' / 'attr' split the contribution bars by fusion branch; 'actv' shows
  // the head-independent activation card (all concepts, incl. sparsity-dropped
  // ones); 'actv_dual' additionally splits each kept concept's activation into
  // its clap/beats attributions.
  mode?: 'beta' | 'attr' | 'actv' | 'actv_dual'
): StudyXaiVariant<FusedView> => ({
  getSample: async (sampleId, root) => {
    const conceptsRoot = conceptsRootFor(root);
    const [sample, conceptMap] = await Promise.all([
      loadSample(domain, sampleId, root),
      loadConcepts(domain, set, conceptsRoot),
    ]);
    const model = sample?.models[fusedModelKey(domain, set)] as V1FusedModel | undefined;
    if (!sample || !model?.concepts?.length) return undefined;

    // Registry-flagged bundles (v2/v4) reframe a concept whose *head weight* is
    // negative as a negation of the descriptor ("NOT like a whistle"). This is
    // independent of the row's evidence sign: a negative-evidence row can have
    // a positive head weight (no NOT), and a positive-evidence row a negative
    // head weight (NOT).
    const negate = (headWeight: number | undefined): boolean =>
      negativeWeightsAsNot(root ?? DATA_V1_ROOT) && (headWeight ?? 0) < 0;

    if (mode === 'actv' || mode === 'actv_dual') {
      // Activation-only card: the full concept list (not just the sparse
      // head's subset), bar = raw activation. usedByHead lets the UI mark
      // which of the firing concepts the classifier actually relied on. In
      // the dual variant, concepts the head kept also get the attr
      // breakdown's branch split (clap_attribution + beats_attribution ==
      // activation exactly); dropped concepts have no branch data and render
      // as plain bars.
      const actv = sample.models[activationsModelKey(domain, set)] as
        | V1ActivationsModel
        | undefined;
      if (!actv?.concepts?.length) return undefined;
      const attr =
        mode === 'actv_dual'
          ? (sample.models[attrBreakdownModelKey(domain, set)] as V1AttrBreakdownModel | undefined)
          : undefined;
      const attrByConcept = new Map((attr?.concepts ?? []).map((c) => [c.concept, c]));
      const maxAbs = Math.max(...actv.concepts.map((c) => Math.abs(c.activation)), 1e-9);
      const items: SimileItem[] = actv.concepts.map((c) => {
        const a = attrByConcept.get(c.concept);
        return {
          id: slugify(c.concept),
          text: set === 'onomatopoeia' ? prettifyOnomatopoeia(c.concept) : c.concept,
          category: c.category ?? conceptMap?.get(c.concept)?.category,
          confidence: c.activation / maxAbs,
          displayValue: c.activation,
          usedByHead: c.used_by_head,
          negate: negate(c.head_weight),
          ...(a ? { clapValue: a.clap_attribution, beatsValue: a.beats_attribution } : {}),
          withinClassAudioUrl: conceptMap?.get(c.concept)?.audio,
        };
      });
      return { sample, items, predictedLabel: actv.predicted_label, conceptsRoot, root };
    }

    if (mode === 'attr') {
      // Approximate branch attribution of the deployed activation: the bundle
      // ships clap/beats contributions that sum exactly to the plain view's
      // contribution, so bars, order and net labels match the plain condition;
      // only the two-shade split is added.
      const attr = sample.models[attrBreakdownModelKey(domain, set)] as
        | V1AttrBreakdownModel
        | undefined;
      if (!attr?.concepts?.length) return undefined;
      const attrByConcept = new Map(attr.concepts.map((c) => [c.concept, c]));
      const maxAbs = Math.max(...model.concepts.map((c) => Math.abs(c.contribution)), 1e-9);
      const items: SimileItem[] = model.concepts.flatMap((c) => {
        const a = attrByConcept.get(c.concept);
        if (!a) return [];
        return [
          {
            id: slugify(c.concept),
            text: set === 'onomatopoeia' ? prettifyOnomatopoeia(c.concept) : c.concept,
            category: c.category ?? conceptMap?.get(c.concept)?.category,
            confidence: c.contribution / maxAbs,
            displayValue: c.contribution,
            clapValue: a.clap_contribution,
            beatsValue: a.beats_contribution,
            negate: negate(c.head_weight),
            withinClassAudioUrl: conceptMap?.get(c.concept)?.audio,
          },
        ];
      });
      if (!items.length) return undefined;
      return { sample, items, predictedLabel: model.predicted_label, conceptsRoot, root };
    }

    if (mode === 'beta') {
      // Beta-breakdown view: per-concept evidence is decomposed into the two
      // fusion branches. Branch evidence = mixing weight × branch z × the
      // predicted-class head weight (taken from the fused model), so
      // clap + beats = fused_z × head_weight = the bar's net value. Note this
      // net differs from the plain view's contribution (activation ×
      // head_weight): the bundle's breakdown z's and the fused model's
      // activations come from different normalization stages upstream.
      const breakdown = sample.models[betaBreakdownModelKey(domain, set)] as
        | V1BetaBreakdownModel
        | undefined;
      if (!breakdown?.concepts?.length) return undefined;
      const zByConcept = new Map(breakdown.concepts.map((c) => [c.concept, c]));
      const dualItems = model.concepts.flatMap((c) => {
        const z = zByConcept.get(c.concept);
        if (!z) return [];
        const clap = breakdown.clap_weight * z.clap_z * c.head_weight;
        const beats = breakdown.beats_weight * z.beats_z * c.head_weight;
        return [
          {
            id: slugify(c.concept),
            text: set === 'onomatopoeia' ? prettifyOnomatopoeia(c.concept) : c.concept,
            category: c.category ?? conceptMap?.get(c.concept)?.category,
            net: clap + beats,
            clapValue: clap,
            beatsValue: beats,
            negate: negate(c.head_weight),
            withinClassAudioUrl: conceptMap?.get(c.concept)?.audio,
          },
        ];
      });
      if (!dualItems.length) return undefined;
      const maxAbs = Math.max(...dualItems.map((i) => Math.abs(i.net)), 1e-9);
      const items: SimileItem[] = dualItems
        .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
        .map(({ net, ...rest }) => ({ ...rest, confidence: net / maxAbs, displayValue: net }));
      return { sample, items, predictedLabel: model.predicted_label, conceptsRoot, root };
    }

    // Bar width is normalized to the sample's max |contribution|; the raw
    // contribution is what gets printed in the bar label.
    const maxAbs = Math.max(...model.concepts.map((c) => Math.abs(c.contribution)), 1e-9);
    const items: SimileItem[] = model.concepts.map((c) => ({
      id: slugify(c.concept),
      text: set === 'onomatopoeia' ? prettifyOnomatopoeia(c.concept) : c.concept,
      category: c.category ?? conceptMap?.get(c.concept)?.category,
      confidence: c.contribution / maxAbs,
      displayValue: c.contribution,
      negate: negate(c.head_weight),
      withinClassAudioUrl: conceptMap?.get(c.concept)?.audio,
    }));
    return { sample, items, predictedLabel: model.predicted_label, conceptsRoot, root };
  },
  audioIdForSrc: (view, src) =>
    audioIdOrFallback(src, (s) => {
      if (s === view.sample.audio) return 'original';
      return view.items.find((i) => i.withinClassAudioUrl === s)?.id;
    }),
  render: (view) => (
    <SimileExplanationV3
      audioName={view.sample.sample_id}
      classification={view.predictedLabel}
      similes={view.items}
      originalAudioUrl={view.sample.audio}
      isOnomatopoeia={set === 'onomatopoeia'}
      threshold={0}
      activationView={mode === 'actv' || mode === 'actv_dual'}
      positiveOnly={isPositiveOnlySimiles(view.root)}
      cheatsheet={<ConceptCheatsheet domain={domain} set={set} root={view.conceptsRoot} />}
      domain={domain}
    />
  ),
  // Guide page: the concept cheatsheet, with each class heading carrying its
  // training.csv example recording and markdown-notes description
  // (withClassGuide — never set on the in-study cheatsheet drawer).
  renderTrain: (root) => (
    <ConceptCheatsheet domain={domain} set={set} root={conceptsRootFor(root)} withClassGuide />
  ),
  renderTutorial: (view) => (
    <SimileTutorial
      audioName={view.sample.sample_id}
      classification={view.predictedLabel}
      similes={view.items}
      originalAudioUrl={view.sample.audio}
      isOnomatopoeia={set === 'onomatopoeia'}
      dualview={mode === 'beta' || mode === 'attr' || mode === 'actv_dual'}
      positiveOnly={isPositiveOnlySimiles(view.root)}
      domain={domain}
    />
  ),
});

// ─── RexNet (cues) condition ──────────────────────────────────────────────────

interface RexnetView {
  sample: V1Sample;
  report: RexnetReport;
  root?: DataRoot;
}

const rexnetVariant = (domain: string): StudyXaiVariant<RexnetView> => ({
  getSample: async (sampleId, root) => {
    const sample = await loadSample(domain, sampleId, root);
    const model = sample?.models.rexnet;
    if (!sample || !model?.explanation_md) return undefined;
    // Parsing (rather than rendering the report markdown raw) keeps the true
    // label and correctness verdicts embedded in it out of the DOM.
    const report = parseRexnetReport(model.explanation_md, model.class_exemplars);
    if (report.contrasts.length === 0) return undefined;
    return { sample, report, root };
  },
  audioIdForSrc: (view, src) =>
    audioIdOrFallback(src, (s) => (s === view.sample.audio ? 'original' : undefined)),
  render: (view) => (
    <CuesExplanationV1
      audioUrl={view.sample.audio}
      report={view.report}
      sampleId={view.sample.sample_id}
      randomFoil={true}
      hideDropdown={import.meta.env.PROD}
      domain={domain}
      root={view.root}
    />
  ),
  // Guide page: CuesPractice's own class list carries the per-class example
  // recordings (no descriptions for this condition).
  renderTrain: (root) => <CuesPractice domain={domain} root={root} />,
  renderTutorial: (view) => (
    <CuesTutorial
      audioUrl={view.sample.audio}
      report={view.report}
      sampleId={view.sample.sample_id}
      domain={domain}
      root={view.root}
    />
  ),
});

// ─── Proto (examples) condition ───────────────────────────────────────────────

interface ProtoView {
  sample: V1Sample;
  examples: ExampleItem[];
  predictedLabel: string;
  confidence: number;
  /** Bundle whose training split backs the cheatsheet drawer's per-class
   *  example recordings (train subset maps to the live v1 bundle it mirrors). */
  cheatsheetRoot: DataRoot;
}

// How many prototypes the examples condition surfaces. v1-v7 ship exactly
// three per sample; the v8 bundles ship five, which is more rows than the
// condition is designed around (and than the tutorial's "top three" wording
// assumes), so the view is capped here rather than per bundle. Prototype rank
// already follows contribution order in every shipped bundle, so ranks 1-3 are
// the three largest bars — the ones a participant would have seen on top.
const MAX_PROTO_EXAMPLES = 3;

const protoVariant = (domain: string): StudyXaiVariant<ProtoView> => ({
  getSample: async (sampleId, root) => {
    const sample = await loadSample(domain, sampleId, root);
    const model = sample?.models.proto;
    if (!sample || !model?.prototypes?.length) return undefined;
    const examples: ExampleItem[] = [...model.prototypes]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, MAX_PROTO_EXAMPLES)
      .map((p) => ({
        id: `example-rank${p.rank}`,
        rank: p.rank,
        className: p.proto_class,
        weight: p.weight,
        similarity: p.similarity,
        contribution: p.contribution,
        audioUrl: p.audio,
      }));
    return {
      sample,
      examples,
      predictedLabel: model.predicted_label,
      confidence: model.confidence,
      cheatsheetRoot: conceptsRootFor(root),
    };
  },
  audioIdForSrc: (view, src) =>
    audioIdOrFallback(src, (s) => {
      if (s === view.sample.audio) return 'original';
      return view.examples.find((e) => e.audioUrl === s)?.id;
    }),
  render: (view) => (
    <ExampleExplanation
      audioName={view.sample.sample_id}
      classification={view.predictedLabel}
      confidence={Math.round(view.confidence * 100)}
      examples={view.examples}
      originalAudioUrl={view.sample.audio}
      domain={domain}
      cheatsheet={<ExamplesCheatsheet domain={domain} root={view.cheatsheetRoot} />}
    />
  ),
  // Guide page: no class descriptions here — class names + example recordings
  // only, after the example-based intro text.
  renderTrain: (root) => (
    <>
      {/* <ExamplesTutorial /> */}
      <ClassGuide domain={domain} root={root} />
    </>
  ),
  renderTutorial: (view) => (
    <ExamplesTutorial examples={view.examples} originalAudioUrl={view.sample.audio} domain={domain} />
  ),
});

// ─── noxai (control — audio only, no explanation) ─────────────────────────────

const noXaiVariant = (domain: string): StudyXaiVariant<V1Sample> => ({
  logging: 'minimal',
  getSample: (sampleId, root) => loadSample(domain, sampleId, root),
  audioIdForSrc: (sample, src) =>
    audioIdOrFallback(src, (s) => (s === sample.audio ? 'original' : undefined)),
  render: (sample) => <NoXaiExplanation originalAudioUrl={sample.audio} />,
  // Guide page: class names + example recordings so the control condition can
  // still familiarize with the categories (no explanations involved).
  renderTrain: (root) => (
    <>
      {/* <NoXaiPractice /> */}
      <ClassGuide domain={domain} root={root} />
    </>
  ),
});

// ─── Registry ─────────────────────────────────────────────────────────────────

const makeV1Domain = (domain: string): StudyDomainConfig => ({
  defaultXai: 'similes',
  xaiVariants: {
    similes: fusedVariant(domain, 'similes'),
    similes_actv: fusedVariant(domain, 'similes', 'actv'),
    // The beta-breakdown dual view is redundant now that the activation views
    // exist; the 'beta' branch in fusedVariant stays for easy reinstatement.
    // similes_dualview: fusedVariant(domain, 'similes', 'beta'),
    similes_dualview_approx: fusedVariant(domain, 'similes', 'attr'),
    similes_dualview_actv: fusedVariant(domain, 'similes', 'actv_dual'),
    onomatopoeia: fusedVariant(domain, 'onomatopoeia'),
    onomatopoeia_actv: fusedVariant(domain, 'onomatopoeia', 'actv'),
    // onomatopoeia_dualview: fusedVariant(domain, 'onomatopoeia', 'beta'),
    onomatopoeia_dualview_approx: fusedVariant(domain, 'onomatopoeia', 'attr'),
    onomatopoeia_dualview_actv: fusedVariant(domain, 'onomatopoeia', 'actv_dual'),
    rexnet: rexnetVariant(domain),
    examples: protoVariant(domain),
    noxai: noXaiVariant(domain),
  },
});

export const STUDY_DOMAINS: Record<string, StudyDomainConfig> = {
  lung: makeV1Domain('lung'),
  bird: makeV1Domain('bird'),
};
