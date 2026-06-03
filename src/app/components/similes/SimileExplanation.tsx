import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Loader2 } from 'lucide-react';
import { SimileList } from './SimileList';
import { CustomSimileInput } from './CustomSimileInput';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { LungSound } from '../../data_v2';

interface SimileExplanationProps {
  audioName: string;
  classification: string;
  confidence: number;
  similes: LungSound['similes'];
  originalAudioUrl?: string;
  isOnomatopoeia?: boolean;
}

export function SimileExplanation({
  audioName,
  classification,
  confidence,
  similes,
  originalAudioUrl,
  isOnomatopoeia = false,
}: SimileExplanationProps) {
  const [rankedSimiles, setRankedSimiles] = useState<LungSound['similes']>(similes);
  const [simileRatings, setSimileRatings] = useState<{ [key: string]: number }>({});

  const handleAddSimileToRanked = (newSimile: LungSound['similes'][0]) => {
    setRankedSimiles([...rankedSimiles, newSimile]);
  };

  useEffect(() => {
    setRankedSimiles(similes);
  }, [similes]);


  const handleRating = (simileId: string, rating: number) => {
    setSimileRatings((prev) => ({
      ...prev,
      [simileId]: rating,
    }));
  };

  return (
    <div className="space-y-6 mx-3">

      {/* Audio Player Section */}
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
            The system detects the following {isOnomatopoeia ? 'onomatopoeia(s)' : 'simile(s)'} to help explain this classification.
            {/* <br />sm 
            You may rank them in the order of how helpful they are to you in understanding the given recording.
            <br />
            <br />
            <span className="text-italic">Drag and drop the cards to reorder them.</span> */}
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
    </div>
  );
}
