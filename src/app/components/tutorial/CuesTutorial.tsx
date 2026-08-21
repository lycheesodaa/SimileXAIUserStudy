import { useMemo } from 'react';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import {
  BIRD_CUE_ROWS_V1,
  BIRD_CUE_ROWS_V7,
  CueReferenceRow,
  CuesExplanationV1,
  LUNG_CUE_ROWS,
  filterVisibleCues,
  prettifyCueName,
  resolveFoilContrast,
  resolveIsBird,
} from '../cues/CuesExplanationV1';
import { DataRoot, RexnetReport, usesV7BirdCues } from '../../study/dataV1';
import { ClassBadge } from '../ClassBadge';

// Guided tour of the acoustic-cue (RExNet) explanation UI, rendered from a
// real sample in the same static configuration participants see in the study
// (fixed counterfactual class, no dropdown).
interface CuesTutorialProps {
  audioUrl: string;
  report: RexnetReport;
  sampleId?: string;
  domain?: string;
  root?: DataRoot;
}

// ─── Worked example ──────────────────────────────────────────────────────────
// The last tour steps walk through the reasoning on one concrete cue row, so
// they have to reproduce exactly what the participant sees: the same
// pinned contrast class (FOIL_OVERRIDES) and the same filtered cue list as
// CuesExplanationV1 renders (randomFoil + hideDropdown, as configured below).

interface WorkedExample {
  /** Prettified cue name — also the key of the matching reference-table row. */
  cueName: string;
  contrastClass: string;
  relation: 'higher' | 'lower' | 'similar';
  ranking: string;
  /** Classes the relation points towards, read off the reference ranking. */
  candidates: string[];
}

// "Normal < Crackle < Wheeze ~ Rhonchi ~ Stridor" → [[Normal], [Crackle],
// [Wheeze, Rhonchi, Stridor]], ordered low → high. '~' ties share a tier.
function parseRanking(ranking: string): string[][] {
  return ranking
    .split(/[<≪«]/)
    .map((tier) => tier.split('~').map((c) => c.trim()).filter(Boolean))
    .filter((tier) => tier.length > 0);
}

function referenceRows(isBird: boolean, isV7: boolean): CueReferenceRow[] {
  if (!isBird) return LUNG_CUE_ROWS;
  return isV7 ? BIRD_CUE_ROWS_V7 : BIRD_CUE_ROWS_V1;
}

function buildWorkedExample(
  report: RexnetReport,
  sampleId: string | undefined,
  domain: string | undefined,
  root: DataRoot | undefined
): WorkedExample | null {
  const contrasts = report.contrasts;
  const selected = resolveFoilContrast(sampleId, contrasts, root) ?? contrasts[0];
  if (!selected) return null;

  const isBird = resolveIsBird(domain, contrasts);
  const isV7 = usesV7BirdCues(root);
  const rows = referenceRows(isBird, isV7);

  const candidates: WorkedExample[] = [];
  for (const cue of filterVisibleCues(selected.cues, isBird, isV7)) {
    const cueName = prettifyCueName(cue.cue, isBird, isV7);
    const row = rows.find((r) => r.cue === cueName);
    if (!row) continue;

    const predicted = cue.predictedRelation.toUpperCase();
    const relation: WorkedExample['relation'] = predicted.includes('HIGHER')
      ? 'higher'
      : predicted.includes('LOWER')
        ? 'lower'
        : 'similar';

    const tiers = parseRanking(row.ranking);
    const tierIdx = tiers.findIndex((tier) => tier.includes(selected.contrastClass));
    if (tierIdx === -1) continue;

    const pointsTo =
      relation === 'higher'
        ? tiers.slice(tierIdx + 1).flat()
        : relation === 'lower'
          ? tiers.slice(0, tierIdx).flat()
          : tiers[tierIdx].filter((c) => c !== selected.contrastClass);
    if (pointsTo.length === 0) continue;

    candidates.push({
      cueName,
      contrastClass: selected.contrastClass,
      relation,
      ranking: row.ranking,
      candidates: pointsTo,
    });
  }

  // Pick the most instructive row: a directional relation reads far more
  // clearly than "similar", and a relation that rules some categories out
  // teaches more than one that merely excludes the contrast class itself.
  const classCount = new Set(rows.flatMap((r) => parseRanking(r.ranking).flat())).size;
  const score = (c: WorkedExample) =>
    (c.relation === 'similar' ? 0 : 2) + (c.candidates.length < classCount - 1 ? 1 : 0);
  return candidates.sort((a, b) => score(b) - score(a))[0] ?? null;
}

// Class names in the tour text are rendered as the same coloured pill the
// participant sees on the screen behind the card, so the worked example is
// visually tied to the counterfactual badge and the reference-table rows.
function classBadge(name: string) {
  return <ClassBadge className={name} size="xs" extraClasses="align-middle mx-0.5" />;
}

// Ranking strings ("Normal < Crackle < Wheeze ~ Rhonchi") spell class names out
// verbatim, so the counterfactual can be swapped for its badge in place — the
// participant can then see at a glance where it sits in the order.
function renderRanking(ranking: string, highlight: string) {
  const parts = ranking.split(highlight);
  if (parts.length === 1) return <b>{ranking}</b>;
  return parts.map((part, i) => (
    <span key={i}>
      {i > 0 && classBadge(highlight)}
      <b>{part}</b>
    </span>
  ));
}

function joinClasses(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
}

function workedExampleSteps(w: WorkedExample | null): TutorialStep[] {
  if (!w) return [];
  const relationPhrase =
    w.relation === 'higher' ? 'higher than' : w.relation === 'lower' ? 'lower than' : 'similar to';
  const contrastBadge = classBadge(w.contrastClass);
  const positionPhrase =
    w.relation === 'higher'
      ? <>ranks <b>above</b> {contrastBadge}</>
      : w.relation === 'lower'
        ? <>ranks <b>below</b> {contrastBadge}</>
        : <>sits at a <b>similar level</b> to {contrastBadge}</>;

  return [
    {
      target: `[data-cue="${w.cueName}"]`,
      title: 'Example: reading one row',
      body: (
        <>
          Take this row. It says the <b>{w.cueName}</b> of this recording is{' '}
          <b>{relationPhrase}</b> that of a typical {contrastBadge} sound — the counterfactual
          class pinned in the badge above the table.
        </>
      ),
    },
    {
      target: `[data-cue-ref="${w.cueName}"]`,
      title: 'Example: what that suggests',
      body: (
        <>
          The reference table ranks {w.cueName} across categories as{' '}
          {renderRanking(w.ranking, w.contrastClass)}. So a sound that {positionPhrase} on this cue
          could be <b>{joinClasses(w.candidates)}</b>.
          <br />
          <br />
          Reading every row this way — and weighing which categories the cues agree on — is how
          you can narrow down what the <b>system predicted</b>.
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

export function CuesTutorial({ audioUrl, report, sampleId, domain, root }: CuesTutorialProps) {
  // Stable identity: a fresh steps array on every render would reset the tour.
  const steps = useMemo(() => {
    const worked = buildWorkedExample(report, sampleId, domain, root);
    const done = STEPS[STEPS.length - 1];
    return [...STEPS.slice(0, -1), ...workedExampleSteps(worked), done];
  }, [report, sampleId, domain, root]);

  return (
    <TutorialOverlay steps={steps}>
      <CuesExplanationV1
        audioUrl={audioUrl}
        report={report}
        sampleId={sampleId}
        randomFoil={true}
        hideDropdown={true}
        domain={domain}
        root={root}
      />
    </TutorialOverlay>
  );
}

