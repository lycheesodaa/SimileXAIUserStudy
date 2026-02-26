import { useState } from 'react';
import { Play, Pause, Volume2, MoreVertical } from 'lucide-react';
import waveformImg from '@/assets/waveform.png';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

interface AcousticFeature {
  name: string;
  value: string;
}

interface AudioDetectionSystemProps {
  audioName: string;
  baselineOptions: string[];
  features: AcousticFeature[];
  highlightedMoments?: string[];
}

export function AudioDetectionSystem({
  audioName,
  baselineOptions,
  features,
  highlightedMoments = [],
}: AudioDetectionSystemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBaseline, setSelectedBaseline] = useState(baselineOptions[0]);
  const [featureComparisons, setFeatureComparisons] = useState<{
    [key: string]: string;
  }>({});

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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl text-cyan-600">{audioName}</h2>

      {/* Audio Player Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Play this lung sound recording.</span>
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Through Cues</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 mt-[-20px]">
          {/* <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-600">The system has analyzed that the sound has</span>
            <Select value={selectedBaseline} onValueChange={setSelectedBaseline}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baselineOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Play className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-gray-600">.</span>
          </div> */}

          {/* Acoustic Features */}
          <div className="space-y-4">
            <div>
              <p className="mb-2">The system has analyzed that the audio has</p>
              <ul className="space-y-2 ml-6">
                {features.map((feature, index) => (
                  <li key={index} className="list-disc">
                    {getFeatureText(feature)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Highlighted Moments */}
            {highlightedMoments.length > 0 && (
              <div>
                <p className="mb-2">During the most relevant segments highlighted below:</p>
                {/* <ul className="space-y-2 ml-6">
                  {highlightedMoments.map((moment, index) => (
                    <li key={index} className="list-disc">
                      <span className="italic bg-gray-100 px-1">"{moment}"</span>
                    </li>
                  ))}
                </ul> */}
                <div>
                  <img src={waveformImg} width={300} alt="Waveform" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Questions */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Q3. The audio{' '}
            <Button variant="ghost" size="icon" className="inline-flex">
              <Play className="w-4 h-4" />
            </Button>{' '}
            <Button variant="ghost" size="icon" className="inline-flex">
              <Volume2 className="w-4 h-4" />
            </Button>{' '}
            <Button variant="ghost" size="icon" className="inline-flex">
              <MoreVertical className="w-4 h-4" />
            </Button>{' '}
            has __ (cue) __ that is __ (higher / lower / similar) __ than {selectedBaseline}.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-normal text-gray-600"></th>
                  <th className="text-center p-2 font-normal text-gray-600">Lower</th>
                  <th className="text-center p-2 font-normal text-gray-600">Similar</th>
                  <th className="text-center p-2 font-normal text-gray-600">Higher</th>
                  <th className="text-center p-2 font-normal text-gray-600">Cannot tell</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 text-gray-600">{feature.value}</td>
                    <td className="text-center p-2">
                      <RadioGroup
                        value={featureComparisons[feature.name] || ''}
                        onValueChange={(value) =>
                          setFeatureComparisons((prev) => ({
                            ...prev,
                            [feature.name]: value,
                          }))
                        }
                      >
                        <RadioGroupItem value="lower" />
                      </RadioGroup>
                    </td>
                    <td className="text-center p-2">
                      <RadioGroup
                        value={featureComparisons[feature.name] || ''}
                        onValueChange={(value) =>
                          setFeatureComparisons((prev) => ({
                            ...prev,
                            [feature.name]: value,
                          }))
                        }
                      >
                        <RadioGroupItem value="similar" />
                      </RadioGroup>
                    </td>
                    <td className="text-center p-2">
                      <RadioGroup
                        value={featureComparisons[feature.name] || ''}
                        onValueChange={(value) =>
                          setFeatureComparisons((prev) => ({
                            ...prev,
                            [feature.name]: value,
                          }))
                        }
                      >
                        <RadioGroupItem value="higher" />
                      </RadioGroup>
                    </td>
                    <td className="text-center p-2">
                      <RadioGroup
                        value={featureComparisons[feature.name] || ''}
                        onValueChange={(value) =>
                          setFeatureComparisons((prev) => ({
                            ...prev,
                            [feature.name]: value,
                          }))
                        }
                      >
                        <RadioGroupItem value="cannot" />
                      </RadioGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}

      {/* Additional Likelihood Assessment */}
      <div className="max-w-3xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Which dominant category do you think the audio belongs to?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LikertScale
              categories={[
                'Normal',
                'Wheeze',
                'Fine Crackles',
                'Coarse Crackles',
                'Rhonchi',
                'Pleural Rub',
                'Other',
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
