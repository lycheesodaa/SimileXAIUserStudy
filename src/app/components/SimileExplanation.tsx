import { useState } from 'react';
import { Play, Pause, Volume2, MoreVertical, Star, ThumbsUp, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
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
    <div className="w-full space-y-6">


      {/* Audio Player Section */}
      <div className="mb-6">
        <div className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Play this lung sound recording.</span>
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
      </div>

      {/* Classification Result */}
      {/* <div className="mb-6">
        <div className="pt-6">
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
        </div>
      </div> */}

      {/* Simile-Based Explanations */}
      <div className="mb-6">
        <div className="mb-4">
          {/* <h2 className="text-xl font-semibold mb-2">Understanding Through Similes</h2> */}
          {/* <p className="text-gray-600">
            In the following most relevant segments highlighted in the audio:
          </p>
          <div>
            <img src={waveformImg} width={300} alt="Waveform" />
          </div> */}

          <p className="text-gray-600">
            The system detects the following similes that help explain this classification. 
            <br />
            Select the ones that help you best understand this classification. 
          </p>
        </div>
        <div>
          <div className="space-y-6">
            {similes.map((simile) => (
              <div
                key={simile.id}
                className={`border-2 transition-all ${
                  selectedSimiles.includes(simile.id)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="pt-6">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
