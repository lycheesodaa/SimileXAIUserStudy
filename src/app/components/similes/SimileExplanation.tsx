import { useState, useEffect } from 'react';
import { Play, Pause, GripVertical, Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { LungSound } from '../../data';

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
  const [rankedSimiles, setRankedSimiles] = useState<LungSound['similes']>(similes);
  const [simileRatings, setSimileRatings] = useState<{ [key: string]: number }>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [customSimileText, setCustomSimileText] = useState('');
  const [hasAddedCustomSimile, setHasAddedCustomSimile] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleAddSimile = async () => {
    if (!customSimileText.trim() || isQuerying || hasAddedCustomSimile) return;

    setIsQuerying(true);

    // TODO backend model call
    try {
      // Simulate backend call
      await fetch('http://localhost:5000/api/query-simile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: customSimileText,
          audioId: audioName
        }),
      }).catch(() => {
        // Silently catch fetch errors for the dummy demo
        console.log('Note: Backend endpoint not found, using dummy fallback.');
      });

      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newSimile = {
        id: `custom-${Date.now()}`,
        text: customSimileText,
        category: 'User-Generated',
        relatedFeatures: 'Custom',
        confidence: 100,
      };

      setRankedSimiles([...rankedSimiles, newSimile]);
      setCustomSimileText('');
      setHasAddedCustomSimile(true);
    } catch (error) {
      console.error('Failed to query backend:', error);
    } finally {
      setIsQuerying(false);
    }
  };

  useEffect(() => {
    setRankedSimiles(similes);
  }, [similes]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newRanked = [...rankedSimiles];
    const draggedItem = newRanked[draggedIndex];

    newRanked.splice(draggedIndex, 1);
    newRanked.splice(targetIndex, 0, draggedItem);

    setRankedSimiles(newRanked);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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
            The system detects the following few similes to help explain this classification.
            <br />
            You may rank them in the order of how helpful they are to you in understanding the given recording.
            <br />
            <br />
            <span className="text-sm italic">Drag and drop the cards to reorder them.</span>
          </p>
        </div>
        <div>
          <div className="space-y-1">
            {rankedSimiles.map((simile, index) => (
              <div
                key={simile.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`border-2 transition-all rounded-md cursor-grab active:cursor-grabbing ${draggedIndex === index
                    ? 'border-blue-400 bg-blue-50 opacity-60'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className="px-4 py-3">
                  <div className="space-y-2">
                    {/* Simile Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center justify-center text-gray-400 mt-3">
                            <GripVertical className="h-5 w-5 mb-1" />
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div className="flex-1 mt-1">
                            <p className="text-lg font-medium mb-2">{simile.text}</p>
                            <span className="text-sm text-gray-500">Commonly associated with: </span>
                            <Badge variant="secondary" className="mr-2 mb-2">
                              {simile.category}
                            </Badge>
                            {/* <Badge variant="outline" className="mr-2 mb-2 bg-slate-50">
                              {simile.relatedFeatures}
                            </Badge> */}
                            {/* TODO maybe change % match to high/medium/low */}
                            {simile.confidence && (
                              <Badge variant="outline" className="mr-2 mb-2 text-gray-500">
                                {simile.confidence}% Match
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Play Button on the Right */}
                      <div className="ml-4 flex items-center justify-center pt-2">
                        <Button
                          variant="ghost"
                          title="Play Simile Sound"
                          onClick={(e) => e.stopPropagation()} // Prevent drag interactions
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>


                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Simile Input */}
          {!hasAddedCustomSimile && (
            <div className="mt-4 flex gap-2 items-center border-t pt-4">
              <div className="flex-1">
                <Input
                  placeholder="Type your own simile here..."
                  value={customSimileText}
                  onChange={(e) => setCustomSimileText(e.target.value)}
                  disabled={isQuerying}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSimile();
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleAddSimile}
                className="flex gap-2 min-w-[120px]"
                disabled={isQuerying || !customSimileText.trim()}
              >
                {isQuerying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isQuerying ? 'Querying...' : 'Add Simile'}
              </Button>
            </div>
          )}
          {hasAddedCustomSimile && (
            <div className="mt-4 pt-4 border-t text-sm text-gray-500 italic text-center">
              You have already added a custom simile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
