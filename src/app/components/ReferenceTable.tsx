import { CUE_RELATIONS } from '../cueRelations';

export function ReferenceTable() {
  const baselineOptions = Object.values(CUE_RELATIONS);
  
  const descriptions: Record<string, string> = {
    pitch: 'Frequency (e.g., high or low)',
    loudness: 'Volume or intensity',
    duration: 'Length of the sound',
    continuity: 'Continuous > Discontinuous',
  };

  const featureScores: Record<string, Record<string, number>> = {
    pitch: {
      'High': 3,
      'Low to Medium': 2,
      'Low': 1,
    },
    loudness: {
      'Loud': 4,
      'High': 3,
      'Medium': 2,
      'Low to Medium': 1,
    },
    duration: {
      'Long': 3,
      'Medium': 2,
      'Short': 1,
    },
    continuity: {
      'Continuous': 2,
      'Discontinuous': 1,
    }
  };

  const features = ['pitch', 'loudness', 'duration', 'continuity'];

  return (
    <div className="mb-6">
      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-400 text-sm border-b border-gray-400">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Audio Cue</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Ranking</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-400">
            {features.map((featureKey) => {
              const scores = featureScores[featureKey];
              const groups: Record<number, string[]> = {};
              
              baselineOptions.forEach(option => {
                const val = option.features[featureKey as keyof typeof option.features];
                const score = scores[val] ?? 0;
                if (!groups[score]) groups[score] = [];
                groups[score].push(option.name);
              });

              const sortedScores = Object.keys(groups).map(Number).sort((a, b) => b - a);
              const rankingString = sortedScores.map(score => groups[score].join(' = ')).join(' > ');

              return (
                <tr key={featureKey}>
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 capitalize">
                    {featureKey}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                    {descriptions[featureKey]}
                  </td>
                  <td className="px-4 py-2 text-gray-800 font-medium min-w-[300px]">
                    {rankingString}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
