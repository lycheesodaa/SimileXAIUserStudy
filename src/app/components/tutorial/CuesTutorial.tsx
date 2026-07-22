import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { CuesExplanationV1 } from '../cues/CuesExplanationV1';
import { RexnetReport } from '../../study/dataV1';

// Guided tour of the acoustic-cue (RExNet) explanation UI, rendered from a
// real sample in the same static configuration participants see in the study
// (fixed counterfactual class, no dropdown).
interface CuesTutorialProps {
  audioUrl: string;
  report: RexnetReport;
  sampleId?: string;
  domain?: string;
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
    target: '[data-tutorial="cues-header"]',
    title: 'Acoustic cue comparison',
    body: (
      <>
        The system explains its classification by comparing this recording against a
        representative example of another category, using <b>measurable acoustic cues</b> such
        as loudness or pitch.
      </>
    ),
  },
  {
    target: '[data-tutorial="contrast-class"]',
    title: 'The counterfactual class',
    body: (
      <>
        This badge shows which <b>contrast category</b> the recording is being compared
        against — i.e. "how does this sound differ from a typical sound of that class?".
      </>
    ),
  },
  {
    target: '[data-tutorial="cue-table"]',
    title: 'Cue relations',
    body: (
      <>
        Each row is one acoustic cue. The <b>System Predicted</b> column states the relation the
        system predicted between this sound and the contrast class for that cue (e.g. higher,
        lower, or similar).
      </>
    ),
  },
  {
    target: '[data-tutorial="cue-match-summary"]',
    title: 'Agreement with measurements',
    body: (
      <>
        This line summarizes how many of the system's predicted relations agree with the
        relations actually measured from the audio — a rough indicator of how well-grounded the
        explanation is.
      </>
    ),
  },
  {
    target: '[data-tutorial="reference-table"]',
    title: 'The reference table',
    body: (
      <>
        This table summarizes how each acoustic cue typically ranks across <b>all</b>{' '}
        categories, so you can put the predicted relations above into context. The legend below
        it explains the ranking symbols.
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

export function CuesTutorial({ audioUrl, report, sampleId, domain }: CuesTutorialProps) {
  return (
    <TutorialOverlay steps={STEPS}>
      <CuesExplanationV1
        audioUrl={audioUrl}
        report={report}
        sampleId={sampleId}
        randomFoil={true}
        hideDropdown={true}
        domain={domain}
      />
    </TutorialOverlay>
  );
}
