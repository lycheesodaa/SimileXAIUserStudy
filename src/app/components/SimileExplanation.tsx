import { useState } from 'react';
import { Play, Pause, Volume2, MoreVertical, Star, ThumbsUp, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { LikertScale } from './LikertScale';
import { LungSound } from '../data';
import waveformImg from '@/assets/waveform.png';

interface SimileExplanationProps {
  audioName: string;
  classification: string;
  confidence: number;
  similes: LungSound['similes'];
}

export function SimileExplanation({
  audioName,
  classification,
  confidence,
  similes,
}: SimileExplanationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSimiles, setSelectedSimiles] = useState<string[]>([]);
  const [simileRatings, setSimileRatings] = useState<{ [key: string]: number }>({});
  const [userConfidence, setUserConfidence] = useState<number>(50);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleSimileSelection = (simileId: string) => {
    setSelectedSimiles((prev) =>
      prev.includes(simileId) ? prev.filter((id) => id !== simileId) : [...prev, simileId]
    );
  };

  const handleRating = (simileId: string, rating: number) => {
    setSimileRatings((prev) => ({
      ...prev,
      [simileId]: rating,
    }));
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

      {/* Classification Result */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <span className="text-gray-600">The system has classified this lung sound as: </span>
              <Badge variant="default" className="text-lg px-4 py-1 bg-blue-600">
                {classification}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Confidence:</span>
              <div className="flex-1 max-w-md">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${confidence}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Simile-Based Explanations */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Through Similes</CardTitle>
          <p className="text-gray-600">
            In the following most relevant segments highlighted in the audio:
          </p>
          <div>
            <img src={waveformImg} width={300} alt="Waveform" />
          </div>

          <p className="text-gray-600">
            The system detects the following similes that help explain this classification. 
            <br />
            Select the ones that help you best understand this classification. 
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {similes.map((simile) => (
              <Card
                key={simile.id}
                className={`border-2 transition-all ${
                  selectedSimiles.includes(simile.id)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Simile Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <Button
                            variant={selectedSimiles.includes(simile.id) ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => toggleSimileSelection(simile.id)}
                            className="mt-1"
                          >
                            {selectedSimiles.includes(simile.id) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <ThumbsUp className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <p className="text-lg font-medium mb-2">{simile.text}</p>
                            {/* <Badge variant="secondary" className="mr-2 mb-2">
                              {simile.category}
                            </Badge> */}
                            <Badge variant="outline" className="mr-2 mb-2 bg-slate-50">
                              {simile.relatedFeatures}
                            </Badge>
                            {simile.confidence && (
                              <Badge variant="outline" className="mr-2 mb-2 text-gray-500">
                                {simile.confidence}% Match
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating Section */}
                    {/* <div className="ml-14 space-y-2">
                      <Label className="text-sm text-gray-600">
                        How understandable is this simile to you?
                      </Label>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">Not at all</span>
                        <Slider
                          value={[simileRatings[simile.id] || 50]}
                          onValueChange={(value) => handleRating(simile.id, value[0])}
                          max={100}
                          step={1}
                          className="flex-1 max-w-md"
                        />
                        <span className="text-xs text-gray-500">Very much</span>
                        <span className="text-sm font-medium min-w-[3rem] text-right">
                          {simileRatings[simile.id] || 50}%
                        </span>
                      </div>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Agreement Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 mt-[-16px]">
          {/* Selected Similes Summary */}
          {selectedSimiles.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                You selected {selectedSimiles.length} simile{selectedSimiles.length !== 1 ? 's' : ''}{' '}
                as most helpful:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSimiles.map((id) => {
                  const simile = similes.find((s) => s.id === id);
                  return simile ? (
                    <Badge key={id} variant="default" className="bg-blue-600">
                      {simile.category}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Dominant Category Assessment */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Which dominant category do you think the audio belongs to?</Label>
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
          </div>

          {/* Confidence in Classification */}
          {/* <div className="space-y-2 pt-8 border-t">
            <Label>How confident are you in this classification after reviewing the similes?</Label>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs text-gray-500">Not confident</span>
              <Slider
                value={[userConfidence]}
                onValueChange={(value) => setUserConfidence(value[0])}
                max={100}
                step={1}
                className="flex-1 max-w-md"
              />
              <span className="text-xs text-gray-500">Very confident</span>
              <span className="text-sm font-medium min-w-[3rem] text-right">{userConfidence}%</span>
            </div>
          </div> */}

          {/* Agreement Questions */}
          {/* <div className="space-y-4">
            <Label>Please rate your agreement with the following statements:</Label>
            <div className="space-y-4">
              <AgreementQuestion question="The similes helped me understand the classification" />
              <AgreementQuestion question="I feel confident I could explain this classification to others" />
              <AgreementQuestion question="The system's explanation is transparent and trustworthy" />
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

function AgreementQuestion({ question }: { question: string }) {
  const [value, setValue] = useState<string>('');

  return (
    <div className="space-y-2">
      <p className="text-sm">{question}</p>
      <RadioGroup value={value} onValueChange={setValue} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="strongly-disagree" id={`${question}-sd`} />
          <Label htmlFor={`${question}-sd`} className="text-xs font-normal">
            Strongly disagree
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disagree" id={`${question}-d`} />
          <Label htmlFor={`${question}-d`} className="text-xs font-normal">
            Disagree
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="neutral" id={`${question}-n`} />
          <Label htmlFor={`${question}-n`} className="text-xs font-normal">
            Neither agree nor disagree
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="agree" id={`${question}-a`} />
          <Label htmlFor={`${question}-a`} className="text-xs font-normal">
            Agree
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="strongly-agree" id={`${question}-sa`} />
          <Label htmlFor={`${question}-sa`} className="text-xs font-normal">
            Strongly agree
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
