import { useState, useEffect } from 'react';
import { Play, Pause, Plus, Loader2 } from 'lucide-react';
import { SimileList } from '../similes/SimileList';
import { CustomSimileInput } from '../similes/CustomSimileInput';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
}: CombinedExplanationProps) {
  // Simile State
  const [rankedSimiles, setRankedSimiles] = useState<LungSound['similes']>(similes);

  // Cues State
  const baselineOptions = Object.values(CUE_RELATIONS);
  const [selectedBaselineId, setSelectedBaselineId] = useState(baselineOptions[0].id);

  useEffect(() => {
    setRankedSimiles(similes);
  }, [similes]);

  const handleAddSimileToRanked = (newSimile: LungSound['similes'][0]) => {
    setRankedSimiles([...rankedSimiles, newSimile]);
  };

  return (
    <div className="space-y-6 mx-3 pb-12">
      {/* 1. Shared Audio Player Section */}
      <div className="mb-6">
        <div className="pt-6">
          <div className="flex flex-col gap-2">
            <span className="text-gray-600">Play this lung sound recording:</span>
            {originalAudioUrl ? (
              <audio
                controls
                className="w-full max-w-md h-10"
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${originalAudioUrl}`}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <span className="text-sm text-gray-400 italic">No audio available for this sample</span>
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
          <div className="flex items-center mb-6">
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
            <span>, the current recording has:</span>
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
