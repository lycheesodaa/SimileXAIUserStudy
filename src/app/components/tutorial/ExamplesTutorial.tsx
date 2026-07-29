import { useMemo, useState } from 'react';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { ExampleExplanation, ExampleItem, contributionOf } from '../examples/ExampleExplanation';
import { ExamplesCheatsheet } from '../examples/ExamplesCheatsheet';

// The cheatsheet step opens the drawer and spotlights its panel; shared here so
// the step definition and the onStepChange handler agree on the selector.
const CHEATSHEET_TARGET = '[data-tutorial="cheatsheet-panel"]';

// Renamed from ExamplesPractice: the intro text now doubles as the header of a
// guided tour of the example-based explanation UI. Without a sample (the
// legacy train-mode / v0.1 practice usage) it renders the intro text alone;
// with one, it adds the static explanation UI and tooltips through it.
interface ExamplesTutorialProps {
  examples?: ExampleItem[];
  originalAudioUrl?: string;
  domain?: string;
}

// ─── Worked example ──────────────────────────────────────────────────────────
// A closing step that reasons over the actual top rows on screen, so
// participants see how the plot is meant to be read, not just what it contains.

const TOP_N = 3;

function workedExampleSteps(examples: ExampleItem[]): TutorialStep[] {
  const sorted = [...examples].sort((a, b) => contributionOf(b) - contributionOf(a));
  const top = sorted.slice(0, TOP_N);
  if (top.length < 2) return [];

  // Share of the plot's total contribution held by the leading class's rows in
  // the top group — the basis for calling the evidence strong or weak.
  const total = sorted.reduce((sum, e) => sum + Math.abs(contributionOf(e)), 0);
  const counts = new Map<string, number>();
  top.forEach((e) => counts.set(e.className, (counts.get(e.className) ?? 0) + 1));
  const [leadClass, leadCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const leadShare =
    total > 0
      ? top
          .filter((e) => e.className === leadClass)
          .reduce((sum, e) => sum + Math.abs(contributionOf(e)), 0) / total
      : 0;
  const strength = leadShare >= 0.5 ? 'high' : leadShare >= 0.3 ? 'moderate' : 'low';
  const values = top.map((e) => contributionOf(e).toFixed(2)).join(', ');
  const unanimous = leadCount === top.length;
  const pct = Math.round(leadShare * 100);

  return [
    {
      target: '[data-tutorial="examples-plot"]',
      title: 'Example: reading the plot',
      body: unanimous ? (
        <>
          Here the top {top.length} examples all belong to <b>{leadClass}</b>, and they carry fair contribution values.
          Several strongly-contributing examples of a single class suggest a <b>{strength}</b> likelihood
          that the recording is {leadClass} too.
          <br />
          <br />
          Short bars with lower contribution values would instead mean the
          evidence is weak or mixed.
        </>
      ) : (
        <>
          Here the top {top.length} examples are <b>split across classes</b> ({leadClass} leads
          with {leadCount} of {top.length}; contributions {values}). When the strongest examples
          disagree, no single class is strongly supported — this points to a <b>{strength}</b>{' '}
          likelihood for {leadClass}.
          <br />
          <br />
          Had all {top.length} come from one class with long bars, that would instead suggest a
          high likelihood of that class.
        </>
      ),
    },
  ];
}

const STEPS: TutorialStep[] = [
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
    target: '[data-tutorial="examples-header"]',
    title: 'The explanation',
    body: (
      <>
        The system explains its classification by showing the <b>most similar training
          examples</b> (prototypes) it relied on when classifying this recording.
      </>
    ),
  },
  {
    target: '[data-tutorial="example-card"]',
    title: 'A similar training example',
    body: (
      <>
        Each row is one real training recording the system found similar to the recording
        above. Rows are ordered from most to least similar.
      </>
    ),
  },
  {
    target: '[data-tutorial="example-rank"]',
    title: 'Rank',
    body: <>The rank of this example: #1 is the training example most similar to the recording.</>,
  },
  {
    target: '[data-tutorial="example-class"]',
    title: 'True class',
    body: (
      <>
        The class associated with this training example. Highly similar examples of a class are
        evidence that the recording belongs to that class too.
      </>
    ),
  },
  {
    target: '[data-tutorial="example-weight"]',
    title: 'Contribution',
    body: (
      <>
        How much this example contributed to the classification — its similarity to the
        recording multiplied by its learned weight. Longer bars mean this example weighed
        more heavily in the classification.
      </>
    ),
  },
  {
    target: '[data-tutorial="example-audio"]',
    title: 'Listen and compare',
    body: (
      <>
        Each example comes with its own play button, so during the study you can listen and
        judge the similarity for yourself.
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

// Shown last, after the worked example, so the reference drawer is introduced
// once participants already understand how to read the plot. The button is
// spotlighted first (drawer still closed), then the panel it opens — otherwise
// the drawer appears with no explanation of where from.
const CHEATSHEET_BUTTON_STEP: TutorialStep = {
  target: '[data-tutorial="cheatsheet-button"]',
  title: 'The cheatsheet button',
  body: (
    <>
      This floating button in the <b>bottom right corner</b> is always there. It opens the{' '}
      <b>cheatsheet</b>, which you can pull up at any time during the study — let's open it now.
    </>
  ),
};

const CHEATSHEET_STEP: TutorialStep = {
  target: CHEATSHEET_TARGET,
  alwaysShow: true,
  placement: 'left',
  title: 'The cheatsheet',
  body: (
    <>
      This is the <b>cheatsheet</b> — a reference list that groups a handful of training recordings
      under each sound category.
      <br />
      <br />
      The play button beside each entry plays one of those <b>real training example
      recordings</b>, so you can familiarise yourself with how each category tends to sound.
    </>
  ),
};

function Intro() {
  return (
    <div className="flex flex-col gap-6 my-6 mx-3 text-gray-700">
      <div className="space-y-4">
        <p>
          In this section, you can review how example-based explanations help explain classifications.
        </p>
        <p>
          Example-based explanations display the most similar actual training examples (prototypes) along with their similarity weights to help explain why the system made a particular classification.
        </p>
        {/* <p>
          <i>Please switch to <strong>Test</strong> mode to see how these examples are shown and used to explain specific test lung sound recordings.</i>
        </p> */}
      </div>
    </div>
  );
}

export function ExamplesTutorial({ examples, originalAudioUrl, domain }: ExamplesTutorialProps) {
  // Stable identity: a fresh steps array on every render would reset the tour.
  const steps = useMemo(() => {
    const done = STEPS[STEPS.length - 1];
    return [
      ...STEPS.slice(0, -1),
      ...workedExampleSteps(examples ?? []),
      CHEATSHEET_BUTTON_STEP,
      CHEATSHEET_STEP,
      done,
    ];
  }, [examples]);

  // Physically reveal the cheatsheet drawer while its describing step is active.
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  if (!examples?.length) {
    return <Intro />;
  }
  return (
    <TutorialOverlay
      steps={steps}
      onStepChange={(step) => setCheatsheetOpen(step?.target === CHEATSHEET_TARGET)}
    >
      <Intro />
      <ExampleExplanation
        audioName=""
        classification=""
        confidence={0}
        examples={examples}
        originalAudioUrl={originalAudioUrl}
        domain={domain}
        cheatsheet={<ExamplesCheatsheet domain={domain ?? 'lung'} />}
        forceDrawerOpen={cheatsheetOpen}
      />
    </TutorialOverlay>
  );
}
