import { useState, useEffect } from 'react';
import { Play, Pause, GripVertical, Plus, Loader2 } from 'lucide-react';
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
import { LungSound } from '../../data';
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
}

export function CombinedExplanation({
  audioName,
  classification,
  confidence,
  similes,
  features,
  comparisons = {},
  highlightedMoments = [],
}: CombinedExplanationProps) {
  // Shared State
  const [isPlaying, setIsPlaying] = useState(false);

  // Simile State
  const [rankedSimiles, setRankedSimiles] = useState<LungSound['similes']>(similes);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [customSimileText, setCustomSimileText] = useState('');
  const [hasAddedCustomSimile, setHasAddedCustomSimile] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  // Cues State
  const baselineOptions = Object.values(CUE_RELATIONS);
  const [selectedBaselineId, setSelectedBaselineId] = useState(baselineOptions[0].id);

  useEffect(() => {
    setRankedSimiles(similes);
  }, [similes]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Simile Handlers
  const handleAddSimile = async () => {
    if (!customSimileText.trim() || isQuerying || hasAddedCustomSimile) return;
    setIsQuerying(true);
    try {
      // Simulate backend call
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

  return (
    <div className="space-y-6 mx-3 pb-12">
      {/* 1. Shared Audio Player Section */}
      <div className="pt-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Play this lung sound recording:</span>
          <Button variant="ghost" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* 2. Simile-Based Explanations */}
      <div className="mb-6">
        <div className="mb-4">
          <p className="text-gray-600">
            The system detects the following few similes to help explain this classification.
            <br />
            You may rank them in the order of how helpful they are to you in understanding the given recording.
            <br />
            <br />
            <span className="text-sm italic">Drag and drop the cards to reorder them.</span>
          </p>
        </div>

        <div className="space-y-1">
          {rankedSimiles.map((simile, index) => (
            <div
              key={simile.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`border-2 transition-all rounded-md cursor-grab active:cursor-grabbing ${draggedIndex === index
                ? 'border-blue-400 bg-blue-50 opacity-60'
                : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className="px-4 py-3">
                <div className="space-y-2">
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
                          {simile.confidence && (
                            <Badge variant="outline" className="mr-2 mb-2 text-gray-500">
                              {simile.confidence}% Match
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center justify-center pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Custom Simile Input */}
          {!hasAddedCustomSimile ? (
            <div className="mt-4 flex gap-2 items-center border-t pt-4">
              <div className="flex-1">
                <Input
                  placeholder="Type your own simile here..."
                  value={customSimileText}
                  onChange={(e) => setCustomSimileText(e.target.value)}
                  disabled={isQuerying}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSimile()}
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
          ) : (
            <div className="mt-4 pt-4 border-t text-sm text-gray-500 italic text-center">
              You have already added a custom simile.
            </div>
          )}
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
