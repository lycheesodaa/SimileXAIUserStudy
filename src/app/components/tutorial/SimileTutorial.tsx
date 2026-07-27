import { useMemo, useState } from 'react';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { SimileExplanationV3, SimileItem } from '../similes/SimileExplanationV3';
import { ConceptCheatsheet } from '../concepts/ConceptCheatsheet';
import { ConceptSet } from '../../study/dataV1';
import { resolveConceptCategory } from '../ClassBadge';

// The cheatsheet step opens the drawer and spotlights its panel; shared here so
// the step definition and the onStepChange handler agree on the selector.
const CHEATSHEET_TARGET = '[data-tutorial="cheatsheet-panel"]';

// Guided tour of the simile / onomatopoeia explanation UI (plain and both
// dual-view variants). Rendered from a real sample; the dual-view-only steps
// target elements that simply don't exist in the plain condition, so the
// overlay drops them there.
interface SimileTutorialProps {
  audioName: string;
  classification: string;
  similes: SimileItem[];
  originalAudioUrl?: string;
  isOnomatopoeia?: boolean;
  /** Whether the underlying condition splits bars into branch segments. */
  dualview?: boolean;
  /** Study domain ('lung' | 'bird'), forwarded to word the recording label. */
  domain?: string;
}

// ─── Worked example ──────────────────────────────────────────────────────────
// A closing step that reasons over the rows actually on screen. It mirrors
// SimileExplanationV3's own filtering/ordering (threshold 0, the 0.01 evidence
// floor, sorted by magnitude, top 3 shown) so "the top three" means the three
// bars the participant can see.

const TOP_N = 3;

function workedExampleSteps(similes: SimileItem[], nounPlural: string): TutorialStep[] {
  const magnitude = (s: SimileItem) => Math.abs(s.displayValue ?? s.confidence);
  const shown = similes.filter((s) => magnitude(s) >= 0.01).sort((a, b) => magnitude(b) - magnitude(a));
  const top = shown.slice(0, TOP_N);
  if (top.length < 2) return [];

  // Only positive bars argue *for* a class, so the reasoning is built on those.
  const positives = top
    .map((s) => ({ s, category: resolveConceptCategory(s.text, s.category) }))
    .filter((e) => e.s.confidence >= 0 && e.category);
  if (positives.length === 0) return [];

  const counts = new Map<string, number>();
  positives.forEach((e) => counts.set(e.category!, (counts.get(e.category!) ?? 0) + 1));
  const [leadClass, leadCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  const total = shown.reduce((sum, s) => sum + magnitude(s), 0);
  const leadShare =
    total > 0
      ? positives
          .filter((e) => e.category === leadClass)
          .reduce((sum, e) => sum + magnitude(e.s), 0) / total
      : 0;
  const strength = leadShare >= 0.5 ? 'high' : leadShare >= 0.3 ? 'moderate' : 'low';
  const unanimous = leadCount === top.length;
  const pct = Math.round(leadShare * 100);
  const leadTexts = positives
    .filter((e) => e.category === leadClass)
    .map((e) => `"${e.s.text}"`)
    .join(', ');

  return [
    {
      target: '[data-tutorial="evidence-plot"]',
      title: 'Example: reading the plot',
      body: unanimous ? (
        <>
          Here the top {top.length} {nounPlural} — <i>{leadTexts}</i> — are all positive evidence and all
          associated with <b>{leadClass}</b>. Several strong {nounPlural} pointing at one category suggest 
          a <b>{strength}</b> likelihood that the recording is {leadClass}.
          <br />
          <br />
          Short bars, low values, or negative evidence, may instead mean the prediction is weak or mixed.
        </>
      ) : (
        <>
          Here the strongest evidence is <b>mixed</b>: {leadClass} leads with {leadCount} of the
          top {top.length} {nounPlural} (<i>{leadTexts}</i>).
          The remaining bars are negative, which counts against the classification, so this suggests
          only a <b>fair</b> likelihood for <b>{leadClass}</b>.
          <br />
          <br />
          Had all {top.length} {nounPlural}'s evidences been positive, that
          may suggest a <i>higher</i> likelihood of {leadClass}.
        </>
      ),
    },
  ];
}

function buildSteps(isOnomatopoeia: boolean, similes: SimileItem[]): TutorialStep[] {
  const noun = isOnomatopoeia ? 'onomatopoeia' : 'simile';
  const nounPlural = isOnomatopoeia ? 'onomatopoeia' : 'similes';
  return [
    {
      title: 'Welcome — a quick tour',
      body: (
        <>
          This short tour walks you through each part of the explanation screen you will see
          during the study. The screen behind this card is a <b>static preview</b> — you cannot
          click it while the tour is running. Use <b>Next</b> and <b>Back</b> (or the arrow keys)
          to move through the tour.
        </>
      ),
    },
    {
      target: '[data-tutorial="original-audio"]',
      title: 'The sound recording',
      body: (
        <>
          Every screen starts with the recording the AI system classified. During the study you
          can play and replay it as many times as you like.
        </>
      ),
    },
    {
      target: '[data-tutorial="explanation-header"]',
      title: 'The explanation',
      body: isOnomatopoeia ? (
        <>
          The system explains its classification using <b>onomatopoeia</b> — words that imitate
          sounds (like "buzz" or "rattle") — that it detected in the recording.
        </>
      ) : (
        <>
          The system explains its classification using <b>similes</b> — comparisons to familiar
          everyday sounds — that it detected in the recording.
        </>
      ),
    },
    {
      target: '[data-tutorial="evidence-axis"]',
      title: 'Positive vs negative evidence',
      body: (
        <>
          Each {noun} counts either <b>for</b> the classification (bars pointing right, in blue)
          or <b>against</b> it (bars pointing left, in red).
        </>
      ),
    },
    {
      target: '[data-tutorial="evidence-row"]',
      title: 'One piece of evidence',
      body: (
        <>
          Each row is one {noun} the system listened for, together with how strongly it weighed
          into the decision. Rows are ordered from strongest to weakest evidence.
        </>
      ),
    },
    {
      target: '[data-tutorial="category-badge"]',
      title: 'Sound category',
      body: (
        <>This badge shows the sound category this {noun} is typically associated with.</>
      ),
    },
    {
      target: '[data-tutorial="concept-play"]',
      title: `Hear the ${noun}`,
      body: (
        <>
          Press this play button to hear a generated sample of the {noun} — useful when you
          don't know what a {noun} sounds like. <br /><br />
          <i>
            Note that these generated samples may not be entirely representative of the given text.
            You can choose to rely on your subjective experience of the text instead.
          </i>
        </>
      ),
    },
    {
      target: '[data-tutorial="evidence-bar"]',
      title: 'Evidence strength',
      body: (
        <>
          The bar's <b>length and direction</b> show how strongly, and in which direction, this{' '}
          {noun} influenced the system. The number is the raw evidence value.
        </>
      ),
    },
    // ── Dual-view only (dropped automatically in the plain condition) ────────
    {
      target: '[data-tutorial="dualview-legend"]',
      title: 'Two listening branches',
      body: (
        <>
          In this version each bar splits the evidence between the system's two listening
          branches: the <b>lighter</b> shade is the language-based branch, the <b>darker</b>{' '}
          shade the acoustic branch.
        </>
      ),
    },
    {
      target: '[data-tutorial="split-bar"]',
      title: 'A split bar',
      body: (
        <>
          Here both branches agree: the lighter segment is the language branch's share of the
          evidence and the darker segment the acoustic branch's. When the branches disagree,
          only the net evidence is shown, in the shade of the branch that dominates.
        </>
      ),
    },
    // ── Optional extras ──────────────────────────────────────────────────────
    {
      target: '[data-tutorial="weaker-toggle"]',
      title: 'Weaker evidence',
      body: (
        <>
          {nounPlural[0].toUpperCase() + nounPlural.slice(1)} with only a small influence are
          tucked away here. During the study you can click this to reveal them.
        </>
      ),
    },
    // ── Worked example, after every component has been introduced ────────────
    ...workedExampleSteps(similes, nounPlural),
    // ── Cheatsheet, last, once participants can already read the plot ─────────
    {
      target: CHEATSHEET_TARGET,
      alwaysShow: true,
      placement: 'left',
      title: 'The cheatsheet',
      body: (
        <>
          The floating button in the <b>bottom right corner</b> opens this <b>cheatsheet</b> — a reference list you can
          pull up at any time during the study. Every {noun} is grouped under the sound category it
          is typically associated with.
          <br />
          <br />
          The play button beside each entry plays a <b>generated audio sample</b> of that {noun}, so
          you can hear what it refers to. <i>These samples are synthesised and may not perfectly
          match the text — treat them as a rough guide.</i>
        </>
      ),
    },
    {
      title: "That's it!",
      body: (
        <>
          You have now seen every part of the explanation screen. Use <b>Restart Tour</b> to view the
          tutorial again, or proceed with the task.
        </>
      ),
    },
  ];
}

export function SimileTutorial({
  audioName,
  classification,
  similes,
  originalAudioUrl,
  isOnomatopoeia = false,
  domain,
}: SimileTutorialProps) {
  // Stable identity: a fresh steps array on every render would reset the tour.
  const steps = useMemo(() => buildSteps(isOnomatopoeia, similes), [isOnomatopoeia, similes]);
  // Physically reveal the cheatsheet drawer while its describing step is active.
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const set: ConceptSet = isOnomatopoeia ? 'onomatopoeia' : 'similes';
  return (
    <TutorialOverlay
      steps={steps}
      onStepChange={(step) => setCheatsheetOpen(step?.target === CHEATSHEET_TARGET)}
    >
      <SimileExplanationV3
        audioName={audioName}
        classification={classification}
        similes={similes}
        originalAudioUrl={originalAudioUrl}
        isOnomatopoeia={isOnomatopoeia}
        threshold={0}
        domain={domain}
        cheatsheet={<ConceptCheatsheet domain={domain ?? 'lung'} set={set} />}
        forceDrawerOpen={cheatsheetOpen}
      />
    </TutorialOverlay>
  );
}
