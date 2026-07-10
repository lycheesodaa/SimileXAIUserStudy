import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RexnetReport } from '../../study/dataV1';

// Study-mode cues (RExNet) explanation, fed by the structured report parsed
// from data_v1's explanation_md. Like the other study conditions, it never
// shows the model's predicted class or the true label — only the per-contrast
// acoustic cue relations. Contrast/exemplar audio is intentionally absent
// (the generated wavs are not hosted); only the sample's own audio plays.
interface CuesExplanationV1Props {
  audioUrl: string;
  report: RexnetReport;
}

export function CuesExplanationV1({ audioUrl, report }: CuesExplanationV1Props) {
  const contrasts = report.contrasts;
  const [selectedClass, setSelectedClass] = useState(contrasts[0]?.contrastClass ?? '');
  const selected = contrasts.find((c) => c.contrastClass === selectedClass) ?? contrasts[0];

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
            <div className="flex items-center gap-3 mb-4">
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
            </div>

            {selected && (
              <div className="overflow-x-auto">
                <table className="divide-y divide-gray-400 text-sm border-b border-gray-400">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Acoustic Cue</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">This Sound</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">{selected.contrastClass} Sound</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Measured Relation</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">System Predicted</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-500 uppercase">Match</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-400">
                    {selected.cues.map((cue) => (
                      <tr key={cue.cue}>
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{cue.cue}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500 tabular-nums">{cue.targetValue}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-gray-500 tabular-nums">{cue.foilValue}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-800">{cue.heuristicRelation}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-800">{cue.predictedRelation}</td>
                        <td className={`px-4 py-2 whitespace-nowrap text-center font-semibold ${cue.agree ? 'text-emerald-600' : 'text-red-500'}`}>
                          {cue.agree ? '✓' : '✗'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selected.cuesCorrect !== null && selected.cuesTotal !== null && (
                  <p className="text-sm text-gray-500 mt-2">
                    The system's predicted relations match the measured relations for{' '}
                    {selected.cuesCorrect} of {selected.cuesTotal} cues.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
