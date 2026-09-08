import { ClassBadge } from '../ClassBadge';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { DataRoot, RexnetCueRow, RexnetReport } from '../../study/dataV1';
import { cueBaseName, resolveIsBird } from './CuesExplanationV1';

export type AbsoluteCueLevel = 'Low' | 'Mid' | 'High';

interface AbsoluteCueSpec {
  cue: string;
  metric: string;
  description: string;
  aliases: string[];
  lowCutoff: number;
  highCutoff: number;
  levels: Record<string, AbsoluteCueLevel>;
}

interface CuesExplanationV1AbsProps {
  audioUrl: string;
  report: RexnetReport;
  trueLabel?: string;
  domain?: string;
  root?: DataRoot;
}

// Thresholds are grand mean +/- 0.15 pooled within-class SD, using the class
// means and pooled SDs in "Absolute Cue Table for Lung and Bird.md". This is
// the z-anchored Format B definition used by the absolute reference table.
const LUNG_ABS_CUES: AbsoluteCueSpec[] = [
  {
    cue: 'Loudness / Intensity',
    metric: 'energy_level',
    description: 'Overall volume/strength of the breath sounds.',
    aliases: ['loudness / intensity', 'energy_level', 'energy level'],
    lowCutoff: -34.714,
    highCutoff: -31.966,
    levels: { Crackle: 'Mid', Normal: 'Low', Wheeze: 'Mid', Rhonchi: 'High', Stridor: 'High' },
  },
  {
    cue: 'Pitch / Brightness',
    metric: 'spectral_centroid_hi',
    description: 'Brightness centre of the adventitious sound, measured above the breath fundamental.',
    aliases: ['pitch / brightness (high vs low)', 'spectral centroid (high)', 'spectral_centroid_hi'],
    lowCutoff: 489.4,
    highCutoff: 538.6,
    levels: { Crackle: 'High', Normal: 'Low', Wheeze: 'Mid', Rhonchi: 'High', Stridor: 'Mid' },
  },
  {
    cue: 'Spectral Width',
    metric: 'spectral_bandwidth',
    description: 'How spread-out the energy is across frequencies (low: narrow/tonal; high: broad/noisy).',
    aliases: ['spectral width (broad vs narrow/tonal)', 'spectral bandwidth', 'spectral_bandwidth'],
    lowCutoff: 471.15,
    highCutoff: 521.25,
    levels: { Crackle: 'High', Normal: 'High', Wheeze: 'Mid', Rhonchi: 'Low', Stridor: 'Low' },
  },
  {
    cue: 'HF Shrillness',
    metric: 'hf_content',
    description: 'Fraction of energy sitting in the high band.',
    aliases: ['high-frequency shrillness', 'high-pitch shrillness', 'high-frequency energy', 'hf_content'],
    lowCutoff: 0.025167,
    highCutoff: 0.047877,
    levels: { Crackle: 'Mid', Normal: 'Low', Wheeze: 'Mid', Rhonchi: 'High', Stridor: 'Mid' },
  },
  {
    cue: 'Spikiness',
    metric: 'crest_factor',
    description: 'How impulsive/spiky the peaks are versus the background breath.',
    aliases: ['crackle spikiness (popping)', 'spikiness (popping)', 'crest factor', 'crest_factor'],
    lowCutoff: 10.729,
    highCutoff: 12.727,
    levels: { Crackle: 'High', Normal: 'High', Wheeze: 'Mid', Rhonchi: 'Mid', Stridor: 'Low' },
  },
  // {
  //   cue: 'Event Density',
  //   metric: 'event_rate',
  //   description: 'Number of discrete sound events per second.',
  //   aliases: ['crackle / event density', 'event density', 'event_rate'],
  //   lowCutoff: 0.353,
  //   highCutoff: 0.491,
  //   levels: { Crackle: 'Mid', Normal: 'Mid', Wheeze: 'Mid', Rhonchi: 'Mid', Stridor: 'Mid' },
  // },
];

const BIRD_ABS_CUES: AbsoluteCueSpec[] = [
  {
    cue: 'Song Brightness',
    metric: 'spectral_centroid_hi',
    description: 'Energy centre above 300 Hz (how bright/piercing the song sits).',
    aliases: ['song brightness (high vs low)', 'spectral centroid (high)', 'spectral_centroid_hi'],
    lowCutoff: 4483.7,
    highCutoff: 4822.7,
    levels: { 'Eastern Towhee': 'High', 'Wood Thrush': 'Low', 'Black-capped Chickadee': 'Mid', 'Tufted Titmouse': 'Low', 'Blue Jay': 'High' },
  },
  {
    cue: 'Buzziness',
    metric: 'tonality',
    description: 'Spectral flatness (low: pure whistle; high: broadband/buzzy).',
    aliases: ['pure whistle vs buzzy/broadband', 'tonality'],
    lowCutoff: 0.114315,
    highCutoff: 0.130245,
    levels: { 'Eastern Towhee': 'High', 'Wood Thrush': 'Low', 'Black-capped Chickadee': 'Low', 'Tufted Titmouse': 'Mid', 'Blue Jay': 'High' },
  },
  {
    cue: 'Loudness',
    metric: 'energy_level',
    description: 'Overall RMS level of the clip in dB.',
    aliases: ['loudness / carrying power', 'energy_level', 'energy level'],
    lowCutoff: -48.6745,
    highCutoff: -47.3935,
    levels: { 'Eastern Towhee': 'Mid', 'Wood Thrush': 'High', 'Black-capped Chickadee': 'High', 'Tufted Titmouse': 'Mid', 'Blue Jay': 'Low' },
  },
  // {
  //   cue: 'High-Pitch Shrillness',
  //   metric: 'hf_content',
  //   description: 'Fraction of energy above 2 kHz.',
  //   aliases: ['high-pitch shrillness', 'high-frequency energy', 'hf_content'],
  //   lowCutoff: 0.478915,
  //   highCutoff: 0.547285,
  //   levels: { 'Eastern Towhee': 'Mid', 'Wood Thrush': 'High', 'Black-capped Chickadee': 'Low', 'Tufted Titmouse': 'Mid', 'Blue Jay': 'High' },
  // },
  {
    cue: 'Pitch Sweep',
    metric: 'fm_extent',
    description: 'Sweep range of the dominant-frequency contour (low: steady; high: sweeping).',
    aliases: ['pitch sweep (frequency glide)', 'fm extent', 'fm_extent'],
    lowCutoff: 2990.95,
    highCutoff: 3565.45,
    levels: { 'Eastern Towhee': 'Mid', 'Wood Thrush': 'Low', 'Black-capped Chickadee': 'High', 'Tufted Titmouse': 'Mid', 'Blue Jay': 'High' },
  },
  {
    cue: 'Song Pitch',
    metric: 'peak_frequency',
    description: 'Dominant (peak) frequency, tracked over the 0.6-12 kHz band.',
    aliases: ['song pitch (high vs low)', 'peak frequency', 'peak_frequency'],
    lowCutoff: 2820.8,
    highCutoff: 3208.4,
    levels: { 'Eastern Towhee': 'Mid', 'Wood Thrush': 'Mid', 'Black-capped Chickadee': 'Mid', 'Tufted Titmouse': 'Low', 'Blue Jay': 'High' },
  },
];

const normalise = (value: string): string => value.trim().toLowerCase();

function findExportedCue(cues: RexnetCueRow[], spec: AbsoluteCueSpec): RexnetCueRow | undefined {
  return cues.find((cue) => spec.aliases.includes(normalise(cue.cue)));
}

function absoluteLevel(value: number, spec: AbsoluteCueSpec): AbsoluteCueLevel {
  if (value < spec.lowCutoff) return 'Low';
  if (value > spec.highCutoff) return 'High';
  return 'Mid';
}

// Ordinal-distance scoring retained for easy comparison/rollback.
// const LEVEL_SCORE: Record<AbsoluteCueLevel, number> = { Low: 0, Mid: 1, High: 2 };

export function closestAbsoluteClass(
  levels: Map<string, AbsoluteCueLevel>,
  specs: AbsoluteCueSpec[],
  trueLabel?: string
): string | undefined {
  const classes = Object.keys(specs[0]?.levels ?? {});
  if (classes.length === 0 || levels.size === 0) return undefined;

  /*
  const distances = classes.map((className) => ({
    className,
    distance: specs.reduce((sum, spec) => {
      const observed = levels.get(spec.metric);
      return observed
        ? sum + Math.abs(LEVEL_SCORE[observed] - LEVEL_SCORE[spec.levels[className]])
        : sum;
    }, 0),
  }));
  const minimum = Math.min(...distances.map((item) => item.distance));
  const tied = distances.filter((item) => item.distance === minimum);
  */

  const matchCounts = classes.map((className) => ({
    className,
    matches: specs.reduce((sum, spec) => {
      const observed = levels.get(spec.metric);
      return sum + Number(observed !== undefined && observed === spec.levels[className]);
    }, 0),
  }));
  const maximum = Math.max(...matchCounts.map((item) => item.matches));
  const tied = matchCounts.filter((item) => item.matches === maximum);
  return tied.find((item) => item.className === trueLabel)?.className ?? tied[0]?.className;
}

function LevelIndicator({ level }: { level: AbsoluteCueLevel }) {
  const Icon = level === 'High' ? ArrowUp : level === 'Low' ? ArrowDown : Minus;
  return (
    <span className="inline-flex min-w-12 items-center gap-1 text-gray-700" aria-label={`${level} level`}>
      <Icon aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
      <span>{level}</span>
    </span>
  );
}

export function AbsReferenceTable({ domain = 'lung' }: { domain?: string }) {
  const specs = domain === 'bird' ? BIRD_ABS_CUES : LUNG_ABS_CUES;
  const classes = Object.keys(specs[0].levels);

  return (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full table-fixed divide-y divide-gray-400 border-b border-gray-400 text-sm">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[32%]" />
          {classes.map((className) => (
            <col key={className} className="w-[10%]" />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="px-2 py-2 text-left font-medium uppercase text-gray-500">Acoustic Cue</th>
            <th className="px-2 py-2 text-left font-medium uppercase text-gray-500">Description</th>
            {classes.map((className) => (
              <th key={className} className="px-1 py-2 text-center font-medium leading-tight text-gray-500">
                {className}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-400 bg-white">
          {specs.map((spec) => (
            <tr key={spec.metric} data-cue-ref={cueBaseName(spec.cue)}>
              <td className="px-2 py-2 font-medium text-gray-900">{spec.cue}</td>
              <td className="px-2 py-2 text-gray-600">{spec.description}</td>
              {classes.map((className) => (
                <td key={className} className="px-1 py-2 text-center">
                  <LevelIndicator level={spec.levels[className]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-gray-500">
        Low, Mid, and High describe each class independently relative to the domain-wide acoustic scale.
      </p>
    </div>
  );
}

export function CuesExplanationV1Abs({
  audioUrl,
  report,
  trueLabel,
  domain,
}: CuesExplanationV1AbsProps) {
  const isBird = resolveIsBird(domain, report.contrasts);
  const effectiveDomain = isBird ? 'bird' : 'lung';
  const domainNoun = isBird ? 'bird sound' : 'lung sound';
  const specs = isBird ? BIRD_ABS_CUES : LUNG_ABS_CUES;
  // Target measurements are repeated in every contrast block, so the first
  // complete block is sufficient and avoids letting the selected foil affect
  // an absolute explanation.
  const exportedCues = report.contrasts.find((contrast) => contrast.cues.length > 0)?.cues ?? [];
  const rows = specs.flatMap((spec) => {
    const cue = findExportedCue(exportedCues, spec);
    if (!cue) return [];
    const value = Number.parseFloat(cue.targetValue);
    if (!Number.isFinite(value)) return [];
    return [{ spec, level: absoluteLevel(value, spec) }];
  });
  const domainClasses = Object.keys(specs[0]?.levels ?? {});
  const observedLevels = new Map(rows.map(({ spec, level }) => [spec.metric, level]));
  const hintedClass = closestAbsoluteClass(observedLevels, specs, trueLabel);

  return (
    <div className="w-full space-y-6 px-3">
      <div className="mb-6 pt-6">
        <div className="flex max-w-md flex-col gap-2" data-tutorial="original-audio">
          <span className="text-gray-600">Play this {domainNoun} recording:</span>
          <audio controls className="h-10 w-full" src={audioUrl} data-log-id="original-audio">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-4" data-tutorial="cues-header">
          <h2 className="mb-2 text-xl font-semibold">Acoustic Cue Explanation</h2>
          <p className="text-gray-600">
            The system detects the following acoustic cues to help explain this classification.
            Each cue is measured as low, medium or high among the classes.
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="italic text-gray-500">No cue explanations available for this sample.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="divide-y divide-gray-400 border-b border-gray-400 text-sm" data-tutorial="cue-table">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left font-medium uppercase text-gray-500">Acoustic Cue</th>
                  <th className="px-4 py-2 text-left font-medium uppercase text-gray-500">System Predicted</th>
                  <th className="px-4 py-2 text-left font-medium uppercase text-gray-500" data-tutorial="cue-class-hint">
                    Potential Classes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 bg-white">
                {rows.map(({ spec, level }) => {
                  const matchingClasses = domainClasses.filter(
                    (className) => spec.levels[className] === level
                  );
                  return (
                    <tr key={spec.metric} data-cue={spec.cue}>
                      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{spec.cue}</td>
                      <td className="px-4 py-2"><LevelIndicator level={level} /></td>
                      <td className="px-4 py-2" data-tutorial="cue-class-hint">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {matchingClasses.map((className) => (
                            <ClassBadge key={className} className={className} useAbbrev size="xs" />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* <p className="mt-3 text-xs text-gray-500 italic">
              Potential class tags in each row indicate categories that typically exhibit that cue level in the reference table.
            </p> */}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-gray-200 pt-4" data-tutorial="reference-table">
        <h3 className="mb-2 text-lg font-semibold">Acoustic Cues Reference Table</h3>
        <p className="mb-4 text-sm text-gray-600">
          This table shows the typical acoustic cue values (Low/Mid/High) for each {domainNoun} category.
        </p>
        <AbsReferenceTable domain={effectiveDomain} />
      </div>
    </div>
  );
}
