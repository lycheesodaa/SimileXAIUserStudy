import { useMemo } from 'react';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { SimileExplanationV3, SimileItem } from '../similes/SimileExplanationV3';

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
}

function buildSteps(isOnomatopoeia: boolean): TutorialStep[] {
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
          Press this play button to hear what the {noun} itself sounds like — useful when you
          want to compare it against the recording.
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
    {
      target: '[data-tutorial="cheatsheet-button"]',
      title: 'The cheatsheet',
      body: (
        <>
          This button opens a reference list of all {nounPlural} with playable audio, in case
          you want to refresh your memory during the study.
        </>
      ),
    },
    {
      title: "That's it!",
      body: (
        <>
          You have now seen every part of the explanation screen. Use <b>Back</b> to review any
          step, or restart the tour from the beginning.
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
}: SimileTutorialProps) {
  // Stable identity: a fresh steps array on every render would reset the tour.
  const steps = useMemo(() => buildSteps(isOnomatopoeia), [isOnomatopoeia]);
  return (
    <TutorialOverlay steps={steps}>
      <SimileExplanationV3
        audioName={audioName}
        classification={classification}
        similes={similes}
        originalAudioUrl={originalAudioUrl}
        isOnomatopoeia={isOnomatopoeia}
        threshold={0}
      />
    </TutorialOverlay>
  );
}
