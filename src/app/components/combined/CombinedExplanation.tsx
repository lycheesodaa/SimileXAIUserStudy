import { useState, useEffect } from 'react';
import { SimileList } from '../similes/SimileList';
import { CustomSimileInput } from '../similes/CustomSimileInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ReferenceTable } from '../cues/ReferenceTable';
import { LungSound } from '../../data_v2';
import { CUE_RELATIONS } from '../../cueRelations';

const BASELINE_TO_CLASS_INDEX: Record<string, string> = {
  'coarse-crackles': 'class0',
  'fine-crackles': 'class1',
  'normal': 'class2',
  'rhonchi': 'class3',
  'stridor': 'class4',
  'wheezes': 'class5',
};

interface AcousticFeature {
  name: string;
  value: string;
}

interface CombinedExplanationProps {
  audioName: string;
  classification: string;
  confidence: number;
  similes: LungSound['similes'];
  features: AcousticFeature[];
  comparisons?: Record<string, Record<string, string>>;
  highlightedMoments?: string[];
  originalAudioUrl?: string;
  pathology?: string;
  sampleId?: string;
  randomFoil?: boolean;
}

function getDeterministicFoil(sampleId: string, options: any[]) {
  if (options.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < sampleId.length; i++) {
    hash = sampleId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % options.length;
  return options[index];
}

export function CombinedExplanation({
  audioName,
  classification,
  confidence,
  similes,
  features,
  comparisons = {},
  highlightedMoments = [],
  originalAudioUrl,
  pathology,
  sampleId,
  randomFoil = false,
}: CombinedExplanationProps) {
  // Simile State
  const [rankedSimiles, setRankedSimiles] = useState<LungSound['similes']>(similes);

  // Cues State
  const filteredOptions = Object.values(CUE_RELATIONS).filter(
    (option) => comparisons && comparisons[option.id]
  );

  const baselineOptions = (randomFoil && sampleId)
    ? [getDeterministicFoil(sampleId, filteredOptions)].filter(Boolean) as typeof filteredOptions
    : filteredOptions;

  const [selectedBaselineId, setSelectedBaselineId] = useState(
    baselineOptions[0]?.id || Object.values(CUE_RELATIONS)[0].id
  );

  useEffect(() => {
    setRankedSimiles(similes);
  }, [similes]);

  useEffect(() => {
    if (baselineOptions.length > 0 && !baselineOptions.some(o => o.id === selectedBaselineId)) {
      setSelectedBaselineId(baselineOptions[0].id);
    }
  }, [comparisons, baselineOptions, selectedBaselineId]);

  const handleAddSimileToRanked = (newSimile: LungSound['similes'][0]) => {
    setRankedSimiles([...rankedSimiles, newSimile]);
  };

  const classIndex = BASELINE_TO_CLASS_INDEX[selectedBaselineId];
  let contrastAudioUrl = '';
  if (originalAudioUrl && pathology && classIndex) {
    const filename = originalAudioUrl.split('/').pop() || '';
    const prefix = filename.replace('_original.wav', '');
    contrastAudioUrl = `/audio/lungausc_v2/rexnet/${pathology}/${prefix}_vs_${classIndex}_contrast.wav`;
  }

  const selectedBaselineName = baselineOptions.find(o => o.id === selectedBaselineId)?.name || 'Comparison';

  return (
    <div className="space-y-6 mx-3 pb-12">
      {/* 1. Shared Audio Player Section */}
      <div className="mb-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="flex flex-col gap-2">
            <span className="text-gray-600 font-medium">Target Lung Sound (Current):</span>
            {originalAudioUrl ? (
              <audio
                controls
                className="w-full h-10"
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${originalAudioUrl}`}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <span className="text-sm text-gray-400 italic">No audio available for this sample</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-gray-600 font-medium">
              Contrast Foil Sound ({selectedBaselineName}):
            </span>
            {contrastAudioUrl ? (
              <audio
                key={selectedBaselineId} // Key ensures the element reloads and updates the source immediately when selection changes
                controls
                className="w-full h-10"
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${contrastAudioUrl}`}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <span className="text-sm text-gray-400 italic">No contrast audio available</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Simile-Based Explanations */}
      <div className="mb-6">
        <div className="mb-4">
          <p className="text-gray-600">
            The system detects the following simile(s) to help explain this classification.
          </p>
        </div>

        <div>
          <SimileList 
            similes={rankedSimiles} 
            onRankChange={setRankedSimiles} 
          />
          <CustomSimileInput 
            audioName={audioName} 
            originalAudioUrl={originalAudioUrl} 
            onSimileAdded={handleAddSimileToRanked} 
          />
        </div>
      </div>


      {/* 3. Cue-Based Explanations */}
      <div className="mb-6 border-t pt-4">
        <div className="text-gray-600">
          <div className="flex items-center mb-6 flex-wrap gap-y-2">
            <span className="text-gray-600">In addition, the system has analyzed that compared to</span>
            <Select value={selectedBaselineId} onValueChange={setSelectedBaselineId}>
              <SelectTrigger className="w-[200px] mx-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baselineOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-600">, the current recording has:</span>
          </div>

          <div>
            <ul className="space-y-2 ml-6">
              {['pitch', 'loudness', 'duration', 'continuity'].map((featureKey, index) => {
                const comparisonVal = comparisons?.[selectedBaselineId]?.[featureKey];

                if (!comparisonVal) {
                  const rawVal = features.find(f => f.name === featureKey)?.value;
                  return (
                    <li key={index} className="list-disc text-gray-600">
                      <span className="capitalize font-semibold">{featureKey}:</span> {rawVal}
                    </li>
                  );
                }

                let colorClass = 'text-gray-500 font-medium';
                if (comparisonVal === 'Higher' || comparisonVal === 'Longer') colorClass = 'text-red-500 font-medium';
                if (comparisonVal === 'Lower' || comparisonVal === 'Shorter') colorClass = 'text-blue-500 font-medium';
                if (comparisonVal === 'Similar') colorClass = 'text-gray-500 font-medium';

                return (
                  <li key={index} className="list-disc text-gray-600">
                    <span className={colorClass}>{comparisonVal}</span>{' '}
                    <span className="capitalize font-semibold">{featureKey}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-12">
            <ReferenceTable />
          </div>
        </div>
      </div>
    </div>
  );
}
