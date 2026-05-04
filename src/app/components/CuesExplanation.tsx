import { useState } from 'react';
import { Play, Pause, Volume2, MoreVertical } from 'lucide-react';
import waveformImg from '@/assets/waveform.png';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { LikertScale } from './LikertScale';

import { LungSound } from '../data';
import { CUE_RELATIONS } from '../cueRelations';

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
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-600">The system has analyzed that compared to</span>
            <Select value={selectedBaselineId} onValueChange={setSelectedBaselineId}>
              <SelectTrigger className="w-[200px]">
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
            <div className="flex gap mr-[-8px]">
              <Button variant="ghost" size="icon">
                <Play className="w-4 h-4" />
              </Button>
            </div>
            <span>, the current recording has:</span>
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
            <div className="overflow-x-auto">
              <table className="divide-y divide-gray-400 text-sm border-b border-gray-400">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase ">Audio Cue</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase ">Description</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase ">Ranking</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-400">
                  {['pitch', 'loudness', 'duration', 'continuity'].map((featureKey) => {
                    const descriptions: Record<string, string> = {
                      pitch: 'Frequency (e.g., high or low)',
                      loudness: 'Volume or intensity',
                      duration: 'Length of the sound',
                      continuity: 'Continuous vs Discontinuous',
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
