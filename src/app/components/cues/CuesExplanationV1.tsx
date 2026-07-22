import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DataRoot, RexnetReport } from '../../study/dataV1';
import { ClassBadge } from '../ClassBadge';
import { SimileAudioPlayer } from '../similes/SimileExplanationV3';

// Study-mode cues (RExNet) explanation, fed by the structured report parsed
// from data_v1's explanation_md. Like the other study conditions, it never
// shows the model's predicted class or the true label — only the per-contrast
// acoustic cue relations. Contrast/exemplar audio is displayed when present
// (e.g. in v6/v6.1/v7); otherwise, only the sample's own audio plays.
interface CuesExplanationV1Props {
  audioUrl: string;
  report: RexnetReport;
  sampleId?: string;
  randomFoil?: boolean;
  hideDropdown?: boolean;
  domain?: string;
  root?: DataRoot;
}

const CUE_NAME_MAP_BIRD_V1: Record<string, string> = {
  'peak frequency': 'Song Pitch (high vs low)',
  'peak_frequency': 'Song Pitch (high vs low)',
  'spectral bandwidth': 'Note Frequency Span',
  'spectral_bandwidth': 'Note Frequency Span',
  'high-frequency energy': 'High-Pitch Shrillness',
  'high_frequency_energy': 'High-Pitch Shrillness',
  'hf_content': 'High-Pitch Shrillness',
  'syllable rate': 'Trill / Note Tempo',
  'syllable_rate': 'Trill / Note Tempo',
  'trill rate': 'Trill / Note Tempo',
  'tonality': 'Pure whistle vs buzzy/broadband',
  'fm extent': 'Pitch Sweep (frequency glide)',
  'fm_extent': 'Pitch Sweep (frequency glide)',
};

const CUE_NAME_MAP_BIRD_V7: Record<string, string> = {
  'spectral_centroid_hi': 'Song Brightness (high vs low)',
  'spectral centroid (high)': 'Song Brightness (high vs low)',
  'spectral centroid': 'Song Brightness (high vs low)',
  'tonality': 'Pure whistle vs buzzy/broadband',
  'energy_level': 'Loudness / Carrying Power',
  'energy level': 'Loudness / Carrying Power',
  'high-frequency energy': 'High-Pitch Shrillness',
  'high_frequency_energy': 'High-Pitch Shrillness',
  'hf_content': 'High-Pitch Shrillness',
  'fm extent': 'Pitch Sweep (frequency glide)',
  'fm_extent': 'Pitch Sweep (frequency glide)',
  'peak frequency': 'Song Pitch (high vs low)',
  'peak_frequency': 'Song Pitch (high vs low)',
};

const CUE_NAME_MAP_LUNG: Record<string, string> = {
  'loudness / intensity': 'Loudness / Intensity',
  'energy_level': 'Loudness / Intensity',
  'energy level': 'Loudness / Intensity',
  'pitch / brightness (high vs low)': 'Pitch / Brightness (high vs low)',
  'spectral centroid (high)': 'Pitch / Brightness (high vs low)',
  'spectral_centroid_hi': 'Pitch / Brightness (high vs low)',
  'spectral bandwidth': 'Spectral Width (broad vs narrow/tonal)',
  'spectral_bandwidth': 'Spectral Width (broad vs narrow/tonal)',
  'spectral width (broad vs narrow/tonal)': 'Spectral Width (broad vs narrow/tonal)',
  'high-frequency energy': 'High-Frequency Shrillness',
  'high-frequency shrillness': 'High-Frequency Shrillness',
  'hf_content': 'High-Frequency Shrillness',
  'crackle spikiness (popping)': 'Spikiness (popping)',
  'spikiness (popping)': 'Spikiness (popping)',
  'crest factor': 'Spikiness (popping)',
  'crest_factor': 'Spikiness (popping)',
  'crackle / event density': 'Crackle / Event Density',
  'event_rate': 'Crackle / Event Density',
};

export function prettifyCueName(cueName: string, isBird: boolean, isV7: boolean = false): string {
  const key = cueName.trim().toLowerCase();
  if (isBird) {
    const map = isV7 ? CUE_NAME_MAP_BIRD_V7 : CUE_NAME_MAP_BIRD_V1;
    if (map[key]) return map[key];
  }
  if (!isBird && CUE_NAME_MAP_LUNG[key]) {
    return CUE_NAME_MAP_LUNG[key];
  }
  return (isV7 ? CUE_NAME_MAP_BIRD_V7[key] : CUE_NAME_MAP_BIRD_V1[key]) || CUE_NAME_MAP_LUNG[key] || cueName;
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
  hideDropdown: hideDropdownProp,
  domain,
  root,
}: CuesExplanationV1Props) {
  const hideDropdown = import.meta.env.PROD ? (hideDropdownProp ?? true) : false;
  const contrasts = report.contrasts;
  const deterministicFoil =
    randomFoil && sampleId ? getDeterministicFoil(sampleId, contrasts) : contrasts[0];

  const birdClasses = new Set([
    'Eastern Towhee',
    'Wood Thrush',
    'Black-capped Chickadee',
    'Tufted Titmouse',
    'Ovenbird',
    'Blue Jay',
  ]);
  const isBird =
    domain === 'bird' ||
    contrasts.some((c) => birdClasses.has(c.contrastClass));
  const effectiveDomain = isBird ? 'bird' : 'lung';
  const domainNoun = isBird ? 'bird sound' : 'lung sound';

  const [selectedClass, setSelectedClass] = useState(
    deterministicFoil?.contrastClass ?? contrasts[0]?.contrastClass ?? ''
  );

  // Re-derive the initial selection only when the sample/report changes;
  // selectedClass is deliberately excluded so user picks aren't reverted.
  useEffect(() => {
    const initial =
      randomFoil && sampleId ? getDeterministicFoil(sampleId, contrasts) : contrasts[0];
    if (initial) {
      setSelectedClass(initial.contrastClass);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contrasts, randomFoil, sampleId]);

  const selected = contrasts.find((c) => c.contrastClass === selectedClass) ?? contrasts[0];

  const isV7 = root === 'data_v7';
  const visibleCues = selected?.cues.filter((cue) => {
    const raw = cue.cue.toLowerCase();
    const pretty = prettifyCueName(cue.cue, isBird, isV7).toLowerCase();

    if (raw.includes('event density') || pretty.includes('event density')) {
      return false;
    }

    if (isV7) {
      if (
        raw.includes('shrillness') ||
        pretty.includes('shrillness') ||
        raw.includes('hf_content') ||
        raw.includes('high-frequency energy') ||
        raw.includes('song pitch') ||
        pretty.includes('song pitch') ||
        raw.includes('peak frequency') ||
        raw.includes('peak_frequency')
      ) {
        return false;
      }
    } else {
      if (
        raw.includes('pitch sweep') ||
        pretty.includes('pitch sweep') ||
        raw.includes('fm extent') ||
        raw.includes('fm_extent')
      ) {
        return false;
      }
    }

    return true;
  }) ?? [];
  const visibleCuesCorrect = visibleCues.filter((cue) => cue.agree).length;

  return (
    <div className="w-full space-y-6 px-3">
      {/* Audio Player Section */}
      <div className="mb-6 pt-6">
        <div className="flex flex-col gap-2 max-w-md" data-tutorial="original-audio">
          <span className="text-gray-600">Play this {domainNoun} recording:</span>
          <audio controls className="w-full h-10" src={audioUrl} data-log-id="original-audio">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      {/* Cue Relations Section */}
      <div className="mb-6">
        <div className="mb-4" data-tutorial="cues-header">
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
            <div className="flex items-center gap-3 mb-4 flex-wrap" data-tutorial="contrast-class">
              {hideDropdown ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">
                    Comparing against Counterfactual Class:
                  </span>
                  {selected?.contrastClass && (
                    <ClassBadge className={selected.contrastClass} size="sm" />
                  )}
                  {/* {selected?.foilAudioUrl && (
                    <SimileAudioPlayer
                      url={selected.foilAudioUrl}
                      logId={`cues-contrast-audio-${selected.contrastClass.replace(/\W+/g, '-')}`}
                    />
                  )} */}
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
                      {/* {selected?.foilAudioUrl && (
                        <SimileAudioPlayer
                          url={selected.foilAudioUrl}
                          logId={`cues-contrast-audio-${selected.contrastClass.replace(/\W+/g, '-')}`}
                        />
                      )} */}
                    </div>
                  )}
                </>
              )}
            </div>

            {selected && (
              <div className="overflow-x-auto">
                <table className="divide-y divide-gray-400 text-sm border-b border-gray-400" data-tutorial="cue-table">
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
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                          {prettifyCueName(cue.cue, isBird, isV7)}
                        </td>
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
                {/* {selected.cuesCorrect !== null && selected.cuesTotal !== null && (
                  <p className="text-sm text-gray-500 mt-2" data-tutorial="cue-match-summary">
                    The system's predicted relations match the measured relations for{' '}
                    {visibleCuesCorrect} of {visibleCues.length} cues.
                  </p>
                )} */}
              </div>
            )}
          </>
        )}
      </div>

      {/* Reference Table Section */}
      <div className="mt-8 pt-4 border-t border-gray-200" data-tutorial="reference-table">
        <h3 className="text-lg font-semibold mb-2">Acoustic Cues Reference Table</h3>
        <p className="text-sm text-gray-600 mb-4">
          Reference table summarizing the ranking of each acoustic attribute across{' '}
          {isBird ? 'bird sound' : 'lung sound'} categories (
          <span className="font-medium">
            {isBird
              ? isV7
                ? 'Eastern Towhee · Wood Thrush · Black-capped Chickadee · Tufted Titmouse · Blue Jay'
                : 'Eastern Towhee · Wood Thrush · Black-capped Chickadee · Tufted Titmouse · Ovenbird'
              : 'Crackle · Normal · Wheeze · Rhonchi · Stridor'}
          </span>
          ):
        </p>
        <ReferenceTableV1 domain={effectiveDomain} root={root} />
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
    cue: 'Spikiness (popping)',
    metric: 'crest_factor',
    description: 'How impulsive/spiky the peaks are vs the background breath.',
    ranking: 'Stridor ~ Rhonchi ~ Wheeze < Crackle ~ Normal',
  },
  // {
  //   cue: 'Crackle / Event Density',
  //   metric: 'event_rate',
  //   description: 'Number of discrete sound events per second.',
  //   ranking: 'Wheeze ~ Crackle ~ Normal ~ Rhonchi ~ Stridor',
  // },
];

export const BIRD_CUE_ROWS_V1: CueReferenceRow[] = [
  {
    cue: 'Song Pitch (high vs low)',
    metric: 'peak_frequency',
    description: 'Dominant (peak) frequency of the song, tracked over the 0.6–12 kHz band.',
    ranking: 'Tufted Titmouse < Black-capped Chickadee ~ Wood Thrush ~ Eastern Towhee < Ovenbird',
  },
  {
    cue: 'Note Frequency Span',
    metric: 'spectral_bandwidth',
    description: 'Frequency spread of the notes (broadband/buzzy vs pure tone).',
    ranking: 'Ovenbird ≪ Black-capped Chickadee < Wood Thrush ~ Tufted Titmouse ~ Eastern Towhee',
  },
  {
    cue: 'High-Pitch Shrillness',
    metric: 'hf_content',
    description: 'Fraction of energy in the high band.',
    ranking: 'Black-capped Chickadee ~ Tufted Titmouse ~ Eastern Towhee ~ Wood Thrush ≪ Ovenbird',
  },
  {
    cue: 'Trill / Note Tempo',
    metric: 'syllable_rate',
    description: 'Onset-detected notes/syllables per second (trill rate).',
    ranking: 'Wood Thrush ~ Eastern Towhee ~ Black-capped Chickadee < Tufted Titmouse ≪ Ovenbird',
  },
  {
    cue: 'Pure whistle vs buzzy/broadband',
    metric: 'tonality',
    description: 'Spectral flatness — low = pure tone/whistle, high = broadband/buzzy.',
    ranking: 'Ovenbird < Wood Thrush ~ Tufted Titmouse ~ Black-capped Chickadee ~ Eastern Towhee',
  },
];

export const BIRD_CUE_ROWS_V7: CueReferenceRow[] = [
  {
    cue: 'Song Brightness (high vs low)',
    metric: 'spectral_centroid_hi',
    description: 'Energy centre above 300 Hz — how bright/piercing the song sits.',
    ranking: 'Wood Thrush < Tufted Titmouse ~ Black-capped Chickadee < Eastern Towhee < Blue Jay',
  },
  {
    cue: 'Pure whistle vs buzzy/broadband',
    metric: 'tonality',
    description: 'Spectral flatness — low = pure tone/whistle, high = broadband/buzzy.',
    ranking: 'Black-capped Chickadee ~ Wood Thrush ~ Tufted Titmouse < Eastern Towhee < Blue Jay',
  },
  {
    cue: 'Loudness / Carrying Power',
    metric: 'energy_level',
    description: 'Overall RMS level of the clip in dB.',
    ranking: 'Blue Jay < Eastern Towhee ~ Tufted Titmouse ~ Wood Thrush ~ Black-capped Chickadee',
  },
  // {
  //   cue: 'High-Pitch Shrillness',
  //   metric: 'hf_content',
  //   description: 'Fraction of energy above 2 kHz.',
  //   ranking: 'Black-capped Chickadee ~ Tufted Titmouse ~ Eastern Towhee ~ Wood Thrush ~ Blue Jay',
  // },
  {
    cue: 'Pitch Sweep (frequency glide)',
    metric: 'fm_extent',
    description: '10–90th-percentile sweep range of the dominant-frequency contour.',
    ranking: 'Wood Thrush ~ Tufted Titmouse < Eastern Towhee ~ Blue Jay ~ Black-capped Chickadee',
  },
  // {
  //   cue: 'Song Pitch (high vs low)',
  //   metric: 'peak_frequency',
  //   description: 'Dominant (peak) frequency, tracked over the 0.6–12 kHz band.',
  //   ranking: 'Tufted Titmouse ~ Wood Thrush ~ Eastern Towhee ~ Black-capped Chickadee ~ Blue Jay',
  // },
];

export const BIRD_CUE_ROWS = BIRD_CUE_ROWS_V1;

export function ReferenceTableV1({ domain = 'lung', root }: { domain?: string; root?: DataRoot }) {
  const isBird = domain === 'bird';
  const isV7 = root === 'data_v7';
  const rows = isBird ? (isV7 ? BIRD_CUE_ROWS_V7 : BIRD_CUE_ROWS_V1) : LUNG_CUE_ROWS;

  return (
    <div className="mb-6">
      <div className="w-full">
        <table className="divide-y divide-gray-400 text-sm border-b border-gray-400 w-full table-fixed">
          <thead>
            <tr>
              <th className="w-1/4 px-4 py-2 text-left font-medium text-gray-500 uppercase">Acoustic Cue</th>
              <th className="w-2/5 px-4 py-2 text-left font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Class Ranking (low → high)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-400">
            {rows.map((row) => (
              <tr key={row.cue}>
                <td className="px-4 py-2 font-medium text-gray-900">
                  {row.cue}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {row.description}
                </td>
                <td className="px-4 py-2 text-gray-800 font-medium">
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

