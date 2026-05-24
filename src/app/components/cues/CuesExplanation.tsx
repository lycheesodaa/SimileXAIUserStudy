import { useState } from 'react';
import { Play, Pause, Volume2, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ReferenceTable } from './ReferenceTable';
import { LungSound } from '../../data_v2';
import { CUE_RELATIONS } from '../../cueRelations';

interface AcousticFeature {
  name: string;
  value: string;
}

interface CuesExplanationProps {
  audioName: string;
  features: AcousticFeature[];
  comparisons?: Record<string, Record<string, string>>;
  highlightedMoments?: string[];
}

export function CuesExplanation({
  audioName,
  features,
  comparisons = {},
  highlightedMoments = [],
}: CuesExplanationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const baselineOptions = Object.values(CUE_RELATIONS);
  const [selectedBaselineId, setSelectedBaselineId] = useState(baselineOptions[0].id);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const getFeatureText = (feature: AcousticFeature) => {
    return (
      <span className="capitalize">
        <span className="font-semibold">{feature.name}:</span> {feature.value}
      </span>
    );
  };



  return (
    <div className="w-full space-y-6 mx-3">
      {/* Audio Player Section */}
      <div className="pt-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Play this lung sound recording:</span>
          <Button variant="ghost" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          {/* <Button variant="ghost" size="icon">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button> */}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="mb-6">
        {/* <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Understanding Through Cues</h2>
        </div> */}
        <div className="text-gray-600">
          <div className="flex items-center mb-6">
            <span className="text-gray-600">The system has analyzed that compared to</span>
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
            <Button variant="ghost" size="icon">
              <Play className="w-4 h-4" />
            </Button>
            <span>, the current recording</span>
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <span>
              has:
            </span>
          </div>

          <div>
            <ul className="space-y-2 ml-6">
              {['pitch', 'loudness', 'duration', 'continuity'].map((featureKey, index) => {
                const comparisonVal = comparisons?.[selectedBaselineId]?.[featureKey];

                // Fallback to raw value if comparison not available
                if (!comparisonVal) {
                  const rawVal = features.find(f => f.name === featureKey)?.value;
                  return (
                    <li key={index} className="list-disc">
                      <span className="capitalize font-semibold">{featureKey}:</span> {rawVal}
                    </li>
                  );
                }

                let colorClass = 'text-gray-500 font-medium';
                if (comparisonVal === 'Higher' || comparisonVal === 'Longer') colorClass = 'text-red-500 font-medium';
                if (comparisonVal === 'Lower' || comparisonVal === 'Shorter') colorClass = 'text-blue-500 font-medium';
                if (comparisonVal === 'Similar') colorClass = 'text-gray-500 font-medium';

                return (
                  <li key={index} className="list-disc">
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

          {/* Acoustic Features */}
          {/* <div className="space-y-4"> */}
          {/* Highlighted Moments */}
          {/* {highlightedMoments.length > 0 && (
              <div>
                <p className="mb-2">During the most relevant segments highlighted below:</p>
                <ul className="space-y-2 ml-6">
                  {highlightedMoments.map((moment, index) => (
                    <li key={index} className="list-disc">
                      <span className="italic bg-gray-100 px-1">"{moment}"</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <img src={waveformImg} width={300} alt="Waveform" />
                </div>
              </div>
            )} */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
