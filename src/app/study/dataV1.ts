// Data access for the modular v1 study bundle under public/data_v1/:
//   data_v1/<domain>/samples/<sampleId>.json   one file per sample, all models
//   data_v1/<domain>/concepts/<set>.json       shared concept -> audio lookup
//   data_v1/<domain>/core_samples.json         the study sample list
// Sample ids are opaque (no class labels), so they are safe in Qualtrics URLs.
// All audio URLs in the bundle are absolute S3 URLs.

export interface V1FusedConcept {
  concept: string;
  category: string;
  activation: number;
  head_weight: number;
  contribution: number;
}

export interface V1FusedModel {
  family: string;
  concept_set: 'similes' | 'onomatopoeia';
  predicted_label: string;
  /** Whether predicted_label == the clip's true label. */
  correct?: boolean;
  /** Fraction of top-5 highest-activation concepts whose category matches the
   *  true label; quantized to k/5. See UI_GUIDELINES.md §4. */
  faithful?: number;
  // Sorted by |contribution| descending in the bundle.
  concepts: V1FusedConcept[];
}

export interface V1ActivationsConcept {
  concept: string;
  category: string;
  activation: number;
  /** 0 for concepts the sparse head dropped. */
  head_weight: number;
  contribution: number;
  used_by_head: boolean;
}

/** Full-concept activation card (manifest `view: "activation_only"`): every
 *  concept's raw activation for the sample — including the ones the sparse
 *  head zeroed out — sorted by activation, head-independent. Sibling of the
 *  fused card under `<fusedKey>_activations`; `of` points back to it. */
export interface V1ActivationsModel {
  family: string;
  concept_set: 'similes' | 'onomatopoeia';
  view: string;
  of: string;
  predicted_label: string;
  correct?: boolean;
  concepts: V1ActivationsConcept[];
}

export interface V1BetaBreakdownConcept {
  concept: string;
  category: string;
  clap_z: number;
  beats_z: number;
  /** = clap_weight * clap_z + beats_weight * beats_z (verified across bundle). */
  fused: number;
}

export interface V1BetaBreakdownModel {
  beta: number;
  clap_weight: number;
  beats_weight: number;
  concepts: V1BetaBreakdownConcept[];
}

export interface V1AttrBreakdownConcept {
  concept: string;
  category: string;
  /** Identical to the fused model's activation (the deployed head input). */
  activation: number;
  clap_attribution: number;
  beats_attribution: number;
  clap_share: number;
  /** = clap_attribution × head_weight; clap + beats == the fused model's
   *  contribution exactly (verified across bundle). */
  clap_contribution: number;
  beats_contribution: number;
}

/** Approximate branch attribution of the deployed cos³ CBL activation
 *  (decomposition: "approx_activation_split") — unlike the beta breakdown,
 *  this reconciles exactly with the plain fused view. */
export interface V1AttrBreakdownModel {
  beta: number;
  clap_weight: number;
  beats_weight: number;
  decomposition: string;
  concepts: V1AttrBreakdownConcept[];
}

export interface V1Prototype {
  rank: number;
  proto_class: string;
  similarity: number;
  weight: number;
  contribution: number;
  source: string;
  audio: string;
}

export interface V1ProtoModel {
  family: string;
  predicted_label: string;
  confidence: number;
  prototypes: V1Prototype[];
}

export interface V1ClassExemplar {
  class_index?: number;
  label?: string;
  audio?: string;
}

export interface V1RexnetModel {
  family: string;
  predicted_label: string;
  consensus_label: string;
  confidence: number;
  explanation_md: string;
  class_exemplars?: V1ClassExemplar[];
}

export interface V1Sample {
  sample_id: string;
  domain: string;
  audio: string;
  models: Record<string, unknown> & {
    rexnet?: V1RexnetModel;
    proto?: V1ProtoModel;
  };
}

export interface ConceptEntry {
  concept: string;
  category: string;
  audio: string;
}

export type ConceptSet = 'similes' | 'onomatopoeia';

// Fused model keys are domain-suffixed in the bundle (note: "simile", singular).
export const fusedModelKey = (domain: string, set: ConceptSet): string =>
  set === 'similes' ? `fused_simile_${domain}` : `fused_onomatopoeia_${domain}`;

export const activationsModelKey = (domain: string, set: ConceptSet): string =>
  `${fusedModelKey(domain, set)}_activations`;

export const betaBreakdownModelKey = (domain: string, set: ConceptSet): string =>
  set === 'similes'
    ? `fused_beta_breakdown_simile_${domain}`
    : `fused_beta_breakdown_onomatopoeia_${domain}`;

export const attrBreakdownModelKey = (domain: string, set: ConceptSet): string =>
  set === 'similes'
    ? `fused_attr_breakdown_simile_${domain}`
    : `fused_attr_breakdown_onomatopoeia_${domain}`;

// Maps a study xai-condition key to the per-sample model key whose
// predicted_label / correct / faithful fields back it. All simile conditions
// (plain, beta, attr, activation-only) share the one fused simile model;
// likewise onomatopoeia. noxai has no model. Used by the dev navbar to surface the
// model's verdict — never shown to participants.
export const modelKeyForXai = (domain: string, xai: string): string | undefined => {
  if (xai.startsWith('onomatopoeia')) return fusedModelKey(domain, 'onomatopoeia');
  if (xai.startsWith('similes')) return fusedModelKey(domain, 'similes');
  if (xai === 'rexnet') return 'rexnet';
  if (xai === 'examples') return 'proto';
  return undefined; // noxai (audio only)
};

// The model's own decision + trust fields, as carried on each per-sample model
// object. `faithful` is absent for rexnet; both are absent for noxai.
export interface V1ModelVerdict {
  predictedLabel?: string;
  correct?: boolean;
  faithful?: number;
}

// "rattle_rattle_rattle_gemini_tts" -> "rattle rattle rattle"
export const prettifyOnomatopoeia = (concept: string): string =>
  concept.replace(/_gemini_tts$/, '').replace(/_/g, ' ');

// Bundle registry — the single source of truth for the versioned bundles
// under public/. Each entry maps a URL version segment (/v2, /study/v2, …) to
// its bundle root plus any per-version rendering flags. All bundles share the
// v1 modular layout and model keys (samples/ + concepts/ + core_samples.json;
// only schema_version + content differ); bundles without their own
// training.csv/testing.csv fall back to core_samples in the split loaders.
// Adding a new bundle = dropping public/data_vN in place and adding one row
// here — routes, the dev navbar and root/version lookups all derive from it.
export const BUNDLE_VERSIONS = [
  { version: 'v1', root: 'data_v1' },
  // v2/v4 reframe a negative *head weight* as a negation of the descriptor
  // ("NOT like a whistle"); the other bundles have nonnegative head weights.
  { version: 'v2', root: 'data_v2', negativeWeightsAsNot: true },
  { version: 'v3', root: 'data_v3' },
  { version: 'v4', root: 'data_v4', negativeWeightsAsNot: true },
  { version: 'v5', root: 'data_v5' },
  { version: 'v6', root: 'data_v6' },
  { version: 'v6.1', root: 'data_v6.1' },
  { version: 'v7', root: 'data_v7' },
] as const satisfies readonly {
  version: string;
  root: string;
  negativeWeightsAsNot?: boolean;
}[];

// DATA_V1_TRAIN_ROOT is an optional sibling bundle with the same per-domain
// layout (samples/ + core_samples.json) holding the small practice subset
// shown in guide mode; it may simply not exist yet, in which case its loaders
// resolve undefined and guide mode shows descriptions only. It has no URL
// version of its own, so it lives outside the registry.
export const DATA_V1_ROOT = 'data_v1';
export const DATA_V1_TRAIN_ROOT = 'data_v1_train';
export type DataRoot =
  | (typeof BUNDLE_VERSIONS)[number]['root']
  | typeof DATA_V1_TRAIN_ROOT;

// The URL version segment (/v1, /v2, … and /study/v1…) selects which bundle a
// browser/study page reads from. v1 is the default/live bundle.
export const dataRootForVersion = (version: string): DataRoot =>
  BUNDLE_VERSIONS.find((b) => b.version === version)?.root ?? DATA_V1_ROOT;

export const versionForRoot = (root: DataRoot): string =>
  BUNDLE_VERSIONS.find((b) => b.root === root)?.version ?? 'v1';

// Whether the bundle encodes negative head weights as descriptor negations
// ("NOT like a whistle"). The train subset follows the live v1 bundle (false).
export const negativeWeightsAsNot = (root: DataRoot): boolean =>
  BUNDLE_VERSIONS.some(
    (b) => b.root === root && 'negativeWeightsAsNot' in b && b.negativeWeightsAsNot === true
  );

const dataV1Url = (path: string, root: DataRoot = DATA_V1_ROOT): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${root}/${path}`;

// ─── Cached fetchers ─────────────────────────────────────────────────────────

const jsonCache = new Map<string, Promise<unknown | undefined>>();

// undefined on any failure (404, network, parse) — callers surface lookup_error.
function fetchJson<T>(url: string): Promise<T | undefined> {
  let pending = jsonCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => (res.ok ? res.json() : undefined))
      .catch(() => undefined)
      .then((value) => {
        // Don't cache failures: a transient network error on one Qualtrics
        // page shouldn't poison later pages in the same iframe session.
        if (value === undefined) jsonCache.delete(url);
        return value;
      });
    jsonCache.set(url, pending);
  }
  return pending as Promise<T | undefined>;
}

const textCache = new Map<string, Promise<string | undefined>>();

function fetchText(url: string): Promise<string | undefined> {
  let pending = textCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => (res.ok ? res.text() : undefined))
      .catch(() => undefined)
      .then((value) => {
        if (value === undefined) textCache.delete(url);
        return value;
      });
    textCache.set(url, pending);
  }
  return pending;
}

export function loadSample(
  domain: string,
  sampleId: string,
  root: DataRoot = DATA_V1_ROOT
): Promise<V1Sample | undefined> {
  return fetchJson<V1Sample>(
    dataV1Url(`${domain}/samples/${encodeURIComponent(sampleId)}.json`, root)
  );
}

// core_samples.json rows carry more (meta, per-model flags); the dev browser
// only needs id + true label for its sample dropdown. Never used in study mode.
export interface CoreSampleInfo {
  sample_id: string;
  true_label: string;
}

export function loadCoreSamples(
  domain: string,
  root: DataRoot = DATA_V1_ROOT
): Promise<CoreSampleInfo[] | undefined> {
  return fetchJson<CoreSampleInfo[]>(dataV1Url(`${domain}/core_samples.json`, root));
}

// ─── Study splits (training.csv / testing.csv / post-test.csv) ───────────────
// The bundle root carries curated sample lists that restrict which core
// samples each browsing mode exposes: training.csv (one sample per class,
// shown in guide mode), testing.csv (test + tutorial modes) and post-test.csv
// (post mode). All files span all domains and only need domain + sample_id
// columns (positions 0/1, or found by header when a `sample_id` header row is
// present); true labels come from the domain's core_samples.json, keeping the
// committed CSVs free of any study metadata.
// All referenced samples live in the main bundle.

export type StudySplit = 'train' | 'test' | 'post';

const SPLIT_FILES: Record<StudySplit, string> = {
  train: 'training.csv',
  test: 'testing.csv',
  post: 'post-test.csv',
};

export async function loadSplitSamples(
  domain: string,
  split: StudySplit,
  root: DataRoot = DATA_V1_ROOT
): Promise<CoreSampleInfo[] | undefined> {
  const [text, core] = await Promise.all([
    fetchText(dataV1Url(SPLIT_FILES[split], root)),
    loadCoreSamples(domain, root),
  ]);
  if (text === undefined) return undefined;
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return undefined;

  // Header-aware column mapping; headerless files use positional columns.
  const header = lines[0].split(',').map((c) => c.trim().toLowerCase());
  const hasHeader = header.includes('sample_id');
  const col = hasHeader
    ? { domain: header.indexOf('domain'), id: header.indexOf('sample_id') }
    : { domain: 0, id: 1 };

  const labelById = new Map((core ?? []).map((s) => [s.sample_id, s.true_label]));
  const samples: CoreSampleInfo[] = [];
  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = line.split(',');
    // The domain filter also drops non-data lines (e.g. training.csv's note row).
    if (cells[col.domain]?.trim() !== domain) continue;
    const sampleId = cells[col.id]?.trim();
    if (!sampleId) continue;
    samples.push({ sample_id: sampleId, true_label: labelById.get(sampleId) ?? '' });
  }
  return samples.length > 0 ? samples : undefined;
}

// ─── Class description notes (guide mode) ────────────────────────────────────
// Bundles may ship per-domain markdown notes at the bundle root ("Similes for
// Lung Sounds.md", "Bracketed Onomatopoeia for Bird Sounds.md", …). Each class
// is a "### N. Class Name (code)" heading followed by a one-line blockquote
// description (then the concept bullets, which the guide does not surface).
// Missing file resolves undefined — guide pages fall back to class names only.

export interface ClassNote {
  /** Heading title with the numbering stripped, e.g. "Crackles (Rales)". */
  className: string;
  description: string;
}

const classNotesFile = (domain: string, set: ConceptSet): string => {
  const domainWord = domain.charAt(0).toUpperCase() + domain.slice(1);
  const prefix = set === 'onomatopoeia' ? 'Bracketed Onomatopoeia' : 'Similes';
  return `${prefix} for ${domainWord} Sounds.md`;
};

export async function loadClassNotes(
  domain: string,
  set: ConceptSet,
  root: DataRoot = DATA_V1_ROOT
): Promise<ClassNote[] | undefined> {
  const text = await fetchText(dataV1Url(encodeURIComponent(classNotesFile(domain, set)), root));
  if (text === undefined) return undefined;
  const notes: ClassNote[] = [];
  // Sections alternate: [preamble, title1, body1, title2, body2, …]
  const sections = text.split(/^###\s*\d+\.\s*(.+)$/m);
  for (let i = 1; i < sections.length; i += 2) {
    const className = sections[i].trim();
    const description = (sections[i + 1] ?? '')
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith('>'))
      .map((l) => l.replace(/^\s*>\s*/, '').replace(/^_|_$/g, '').trim())
      .join(' ')
      .trim();
    notes.push({ className, description });
  }
  return notes.length > 0 ? notes : undefined;
}

/** Match a bundle true_label ("Crackle") to its notes heading ("Crackles
 *  (Rales)") — the label is always a prefix of the heading. */
export const classNoteForLabel = (
  notes: ClassNote[] | undefined,
  label: string
): ClassNote | undefined =>
  notes?.find((n) => n.className.toLowerCase().startsWith(label.toLowerCase()));

export async function loadConcepts(
  domain: string,
  set: ConceptSet,
  root: DataRoot = DATA_V1_ROOT
): Promise<Map<string, ConceptEntry> | undefined> {
  const entries = await fetchJson<ConceptEntry[]>(dataV1Url(`${domain}/concepts/${set}.json`, root));
  if (!entries) return undefined;
  return new Map(entries.map((e) => [e.concept, e]));
}

// ─── RexNet report parsing ────────────────────────────────────────────────────
// rexnet ships a markdown report (explanation_md). We parse it into structured
// data instead of rendering it raw: the report embeds the true label and
// correctness verdicts, which must never reach the participant-facing DOM, and
// its <audio> tags reference files that are not hosted anywhere.

export interface RexnetCueRow {
  cue: string;
  targetValue: string;
  foilValue: string;
  heuristicRelation: string;
  predictedRelation: string;
  agree: boolean;
}

export interface RexnetContrast {
  contrastClass: string;
  prediction: string;
  confidencePct: number | null;
  cuesCorrect: number | null;
  cuesTotal: number | null;
  cues: RexnetCueRow[];
  foilAudioUrl?: string;
}

export interface RexnetReport {
  contrasts: RexnetContrast[];
}

const stripMd = (s: string): string => s.replace(/[`*]/g, '').trim();

export function parseRexnetReport(
  md: string,
  classExemplars?: Array<{ class_index?: number; label?: string; audio?: string }>
): RexnetReport {
  const contrasts: RexnetContrast[] = [];
  // Split into per-contrast sections; the first chunk is the report preamble.
  const sections = md.split(/^### Target vs\. Contrast Concept: `([^`]+)`/m);
  for (let i = 1; i < sections.length; i += 2) {
    const contrastClass = sections[i];
    const body = sections[i + 1] ?? '';

    const predictionMatch = /\*\*Contrastive Prediction\*\*: `([^`]+)`(?:\s*\(Confidence: \*\*([\d.]+)%\*\*\))?/.exec(body);
    const accuracyMatch = /\*\*(\d+)\/(\d+) Cues Correct\*\*/.exec(body);

    const cues: RexnetCueRow[] = [];
    // Table rows: | **Cue** | `target` | `foil` | `heuristic` | `predicted` | **AGREE** |
    const rowRe = /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/gm;
    let row: RegExpExecArray | null;
    while ((row = rowRe.exec(body)) !== null) {
      cues.push({
        cue: stripMd(row[1]),
        targetValue: stripMd(row[2]),
        foilValue: stripMd(row[3]),
        heuristicRelation: stripMd(row[4]),
        predictedRelation: stripMd(row[5]),
        agree: /AGREE/i.test(row[6]) && !/DISAGREE/i.test(row[6]),
      });
    }

    let foilAudioUrl: string | undefined = undefined;
    if (classExemplars && classExemplars.length > 0) {
      const match = classExemplars.find(
        (e) => e.label && e.label.trim().toLowerCase() === contrastClass.trim().toLowerCase()
      );
      if (match?.audio) {
        foilAudioUrl = match.audio;
      }
    }

    if (!foilAudioUrl) {
      const sourceMatches = [...body.matchAll(/<source\s+src=["']([^"']+)["']/gi)];
      if (sourceMatches.length >= 2) {
        foilAudioUrl = sourceMatches[1][1];
      } else if (sourceMatches.length === 1) {
        foilAudioUrl = sourceMatches[0][1];
      }
    }

    contrasts.push({
      contrastClass,
      prediction: predictionMatch ? predictionMatch[1] : '',
      confidencePct: predictionMatch?.[2] ? parseFloat(predictionMatch[2]) : null,
      cuesCorrect: accuracyMatch ? parseInt(accuracyMatch[1], 10) : null,
      cuesTotal: accuracyMatch ? parseInt(accuracyMatch[2], 10) : null,
      cues,
      foilAudioUrl,
    });
  }
  return { contrasts };
}
