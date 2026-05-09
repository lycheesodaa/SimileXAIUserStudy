import { useState } from 'react';
import { Play, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LungSound } from '../../data';

interface SimileListProps {
  similes: LungSound['similes'];
  onRankChange: (newSimiles: LungSound['similes']) => void;
}

export function SimileList({ similes, onRankChange }: SimileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

    const newRanked = [...similes];
    const draggedItem = newRanked[draggedIndex];

    newRanked.splice(draggedIndex, 1);
    newRanked.splice(targetIndex, 0, draggedItem);

    onRankChange(newRanked);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-1">
      {similes.map((simile, index) => (
        <div
          key={simile.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`border-2 transition-all rounded-md cursor-grab active:cursor-grabbing ${
            draggedIndex === index
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
                  {simile.withinClassAudioUrl && (
                    <audio
                      controls
                      className="h-8 w-48"
                      aria-label={`Audio example for: ${simile.text}`}
                      src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${simile.withinClassAudioUrl}`}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
