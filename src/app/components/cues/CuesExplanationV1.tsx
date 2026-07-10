import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RexnetReport } from '../../study/dataV1';
import { ClassBadge } from '../ClassBadge';

// Study-mode cues (RExNet) explanation, fed by the structured report parsed
// from data_v1's explanation_md. Like the other study conditions, it never
// shows the model's predicted class or the true label — only the per-contrast
// acoustic cue relations. Contrast/exemplar audio is intentionally absent
// (the generated wavs are not hosted); only the sample's own audio plays.
interface CuesExplanationV1Props {
  audioUrl: string;
  report: RexnetReport;
  sampleId?: string;
  randomFoil?: boolean;
  hideDropdown?: boolean;
  domain?: string;
}

function getDeterministicFoil<T>(sampleId: string, options: T[]): T | undefined {
  if (options.length === 0) return undefined;
  let hash = 0;
  for (let i = 0; i < sampleId.length; i++) {
    hash = sampleId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % options.length;
  return options[index];
}

export function CuesExplanationV1({
  audioUrl,
  report,
  sampleId,
  randomFoil = false,
  hideDropdown = false,
  domain,
}: CuesExplanationV1Props) {
  const contrasts = report.contrasts;
  const deterministicFoil =
    randomFoil && sampleId ? getDeterministicFoil(sampleId, contrasts) : contrasts[0];

  const birdClasses = new Set([
    'Eastern Towhee',
    'Wood Thrush',
    'Black-capped Chickadee',
    'Tufted Titmouse',
    'Ovenbird',
  ]);
  const isBird =
    domain === 'bird' ||
    contrasts.some((c) => birdClasses.has(c.contrastClass));
  const effectiveDomain = isBird ? 'bird' : 'lung';

  const [selectedClass, setSelectedClass] = useState(
    deterministicFoil?.contrastClass ?? contrasts[0]?.contrastClass ?? ''
  );

  useEffect(() => {
    if (randomFoil) {
      const foil = sampleId ? getDeterministicFoil(sampleId, contrasts) : contrasts[0];
      if (foil && foil.contrastClass !== selectedClass) {
        setSelectedClass(foil.contrastClass);
      }
    } else if (contrasts.length > 0 && !contrasts.some((c) => c.contrastClass === selectedClass)) {
      setSelectedClass(contrasts[0].contrastClass);
    }
  }, [contrasts, randomFoil, sampleId, selectedClass]);

  const selected = contrasts.find((c) => c.contrastClass === selectedClass) ?? contrasts[0];

  const visibleCues = selected?.cues.filter(
    (cue) =>
      !cue.cue.toLowerCase().includes('trill rate') &&
      !cue.cue.toLowerCase().includes('gap ratio')
  ) ?? [];
  const visibleCuesCorrect = visibleCues.filter((cue) => cue.agree).length;

  return (
    <div className="w-full space-y-6 mx-3">
      {/* Audio Player Section */}
      <div className="mb-6 pt-6">
        <div className="flex flex-col gap-2 max-w-md">
          <span className="text-gray-600">Play this sound recording:</span>
          <audio controls className="w-full h-10" src={audioUrl} data-log-id="original-audio">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      {/* Cue Relations Section */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Acoustic Cue Comparison</h2>
          <p className="text-gray-600">
            The system compares this sound against a representative example of each
            contrast category using measurable acoustic cues. For each cue, the measured
            relation is shown next to the relation the system predicted.
          </p>
        </div>

        {contrasts.length === 0 ? (
          <p className="text-gray-500 italic">No cue comparisons available for this sample.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {hideDropdown ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">
                    Comparing against Counterfactual Class:
                  </span>
                  {selected?.contrastClass && (
                    <ClassBadge className={selected.contrastClass} size="sm" />
                  )}
                </div>
              ) : (
                <>
                  <span className="text-gray-600 font-medium">Compare against:</span>
                  <Select value={selected?.contrastClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-64" data-log-id="contrast-select">
                      <SelectValue placeholder="Select a contrast category" />
                    </SelectTrigger>
                    <SelectContent>
                      {contrasts.map((c) => (
                        <SelectItem key={c.contrastClass} value={c.contrastClass}>
                          {c.contrastClass}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selected?.contrastClass && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Counterfactual Class:</span>
                      <ClassBadge className={selected.contrastClass} size="sm" />
                    </div>
                  )}
                </>
              )}
            </div>

            {selected && (
              <div className="overflow-x-auto">
                <table className="divide-y divide-gray-400 text-sm border-b border-gray-400">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Acoustic Cue</th>
                      {/* <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">This Sound</th> */}
                      {/* <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">{selected.contrastClass} Sound</th> */}
                      {/* <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Measured Relation</th> */}
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">System Predicted</th>
                      {/* <th className="px-4 py-2 text-center font-medium text-gray-500 uppercase">Match</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-400">
                    {visibleCues.map((cue) => (
                      <tr key={cue.cue}>
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{cue.cue}</td>
                        {/* <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500 tabular-nums">{cue.targetValue}</td> */}
                        {/* <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500 tabular-nums">{cue.foilValue}</td> */}
                        {/* <td className="px-4 py-2 whitespace-nowrap text-gray-800">{cue.heuristicRelation}</td> */}
                        <td className="px-4 py-2 whitespace-nowrap text-gray-800">{cue.predictedRelation}</td>
                        {/* <td className={`px-4 py-2 whitespace-nowrap text-center font-semibold ${cue.agree ? 'text-emerald-600' : 'text-red-500'}`}>
                          {cue.agree ? '✓' : '✗'}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selected.cuesCorrect !== null && selected.cuesTotal !== null && (
                  <p className="text-sm text-gray-500 mt-2">
                    The system's predicted relations match the measured relations for{' '}
                    {visibleCuesCorrect} of {visibleCues.length} cues.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reference Table Section */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Acoustic Cues Reference Table</h3>
        <p className="text-sm text-gray-600 mb-4">
          Reference table summarizing the ranking of each acoustic attribute across{' '}
          {isBird ? 'bird sound' : 'lung sound'} categories (
          <span className="font-medium">
            {isBird
              ? 'Eastern Towhee · Wood Thrush · Black-capped Chickadee · Tufted Titmouse · Ovenbird'
              : 'Crackle · Normal · Wheeze · Rhonchi · Stridor'}
          </span>
          ):
        </p>
        <ReferenceTableV1 domain={effectiveDomain} />
      </div>
    </div>
  );
}

export interface CueReferenceRow {
  cue: string;
  metric: string;
  description: string;
  ranking: string;
}

export const LUNG_CUE_ROWS: CueReferenceRow[] = [
  {
    cue: 'Loudness / Intensity',
    metric: 'energy_level',
    description: 'Overall volume/strength of the breath sounds.',
    ranking: 'Normal < Crackle < Wheeze ~ Rhonchi ~ Stridor',
  },
  {
    cue: 'Pitch / Brightness (high vs low)',
    metric: 'spectral_centroid_hi',
    description: 'Brightness centre of the adventitious sound, measured above the breath fundamental.',
    ranking: 'Normal < Stridor ~ Wheeze ~ Crackle < Rhonchi',
  },
  {
    cue: 'Spectral Width (broad vs narrow/tonal)',
    metric: 'spectral_bandwidth',
    description: 'How spread-out the energy is across frequencies (broad/noisy vs narrow/tonal).',
    ranking: 'Stridor < Rhonchi ~ Wheeze < Crackle < Normal',
  },
  {
    cue: 'High-Frequency Shrillness',
    metric: 'hf_content',
    description: 'Fraction of energy sitting in the high band (shrill vs low rumble).',
    ranking: 'Normal < Stridor < Crackle ~ Wheeze ~ Rhonchi',
  },
  {
    cue: 'Crackle Spikiness (popping)',
    metric: 'crest_factor',
    description: 'How impulsive/spiky the peaks are vs the background breath.',
    ranking: 'Stridor ~ Rhonchi ~ Wheeze < Crackle ~ Normal',
  },
  {
    cue: 'Crackle / Event Density',
    metric: 'event_rate',
    description: 'Number of discrete sound events per second.',
    ranking: 'Wheeze ~ Crackle ~ Normal ~ Rhonchi ~ Stridor',
  },
];

export const BIRD_CUE_ROWS: CueReferenceRow[] = [
  {
    cue: 'Average Song Pitch',
    metric: 'average_pitch',
    description: 'Mean fundamental frequency (F0) of the song.',
    ranking: 'Ovenbird ~ Black-capped Chickadee ~ Tufted Titmouse ~ Wood Thrush ~ Eastern Towhee',
  },
  {
    cue: 'High-Pitch Shrillness',
    metric: 'hf_content',
    description: 'Fraction of energy in the high band.',
    ranking: 'Black-capped Chickadee ~ Tufted Titmouse ~ Eastern Towhee ~ Wood Thrush ≪ Ovenbird',
  },
  // {
  //   cue: 'Trill Rate / Note Tempo',
  //   metric: 'event_rate',
  //   description: 'Notes/syllables per second.',
  //   ranking: 'Black-capped Chickadee ~ Ovenbird ~ Wood Thrush ~ Eastern Towhee ~ Tufted Titmouse',
  // },
  // {
  //   cue: 'Gap Ratio / Pause Duration',
  //   metric: 'silence_ratio',
  //   description: 'Fraction of the clip that is silence between notes.',
  //   ranking: 'Black-capped Chickadee ~ Tufted Titmouse ~ Ovenbird ~ Eastern Towhee ~ Wood Thrush',
  // },
  {
    cue: 'Note Frequency Span',
    metric: 'spectral_bandwidth',
    description: 'Frequency spread of the notes (broadband/buzzy vs pure tone).',
    ranking: 'Ovenbird ≪ Black-capped Chickadee < Wood Thrush ~ Tufted Titmouse ~ Eastern Towhee',
  },
  {
    cue: 'Vocal Inflection Speed',
    metric: 'pitch_modulation_velocity',
    description: 'How fast pitch changes frame-to-frame (warble speed).',
    ranking: 'Black-capped Chickadee ~ Wood Thrush ~ Eastern Towhee ~ Tufted Titmouse ~ Ovenbird',
  },
];

export function ReferenceTableV1({ domain = 'lung' }: { domain?: string }) {
  const isBird = domain === 'bird';
  const rows = isBird ? BIRD_CUE_ROWS : LUNG_CUE_ROWS;

  return (
    <div className="mb-6">
      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-400 text-sm border-b border-gray-400 w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Acoustic Cue</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Class Ranking (low → high)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-400">
            {rows.map((row) => (
              <tr key={row.cue}>
                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                  {row.cue}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {row.description}
                </td>
                <td className="px-4 py-2 text-gray-800 font-medium min-w-[320px]">
                  {row.ranking}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-2">
          Legend: <span className="font-semibold">&lt;</span> moderate difference &middot;{' '}
          <span className="font-semibold">&laquo;</span> strong difference &middot;{' '}
          <span className="font-semibold">~</span> negligible difference (essentially tied)
        </p>
      </div>
    </div>
  );
}
