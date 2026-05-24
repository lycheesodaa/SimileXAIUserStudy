import { Play } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LungSound } from '../../data_v2';

interface SimileListProps {
  similes: LungSound['similes'];
  onRankChange?: (newSimiles: LungSound['similes']) => void;
}

export function SimileList({ similes, onRankChange }: SimileListProps) {
  return (
    <div className="space-y-1">
      {similes.map((simile, index) => (
        <div
          key={simile.id}
          className="border-2 border-gray-200 bg-white transition-all rounded-md"
        >
          <div className="px-4 py-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center mt-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm border ${
                        simile.category === 'Custom'
                          ? 'bg-blue-100 border-blue-200 text-blue-500'
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      }`}>
                        {simile.category === 'Custom' ? 'C' : index + 1}
                      </div>
                    </div>
                    <div className="flex-1 mt-1">
                      <p className="text-lg font-medium mb-2">{simile.text}</p>
                      {simile.category === 'Custom' ? (
                        <div className="flex flex-wrap gap-2 mb-2 items-center">
                          <Badge variant="default" className="bg-blue-500 text-white font-semibold shadow-sm">
                            Custom Simile
                          </Badge>
                          {((simile.visqolVnsim !== undefined && simile.visqolVnsim !== null) || (simile.confidence !== undefined)) && (
                            <Badge variant="outline" className="border-blue-200 text-blue-500 bg-blue-50/50 font-medium">
                              VNSIM Match: {(() => {
                                const rawVal = simile.visqolVnsim ?? simile.confidence ?? 100;
                                return (rawVal <= 1 ? rawVal * 100 : rawVal).toFixed(1);
                              })()}%
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mb-2 items-center">
                          <div>
                            <span className="text-sm text-gray-500">Commonly associated with: </span>
                            <Badge variant="secondary" className="mr-2">
                              {simile.category}
                            </Badge>
                          </div>
                          {simile.confidence && (
                            <Badge variant="outline" className="text-gray-500 font-medium">
                              {simile.confidence}% Match
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex items-center justify-center pt-2">
                  {simile.withinClassAudioUrl ? (() => {
                    const isBlobOrAbsolute = simile.withinClassAudioUrl.startsWith('blob:') || simile.withinClassAudioUrl.startsWith('http');
                    const audioSrc = isBlobOrAbsolute 
                      ? simile.withinClassAudioUrl 
                      : `${import.meta.env.BASE_URL.replace(/\/$/, '')}${simile.withinClassAudioUrl}`;
                    return (
                      <audio
                        controls
                        className="h-8 w-48"
                        aria-label={`Audio example for: ${simile.text}`}
                        src={audioSrc}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    );
                  })() : (
                    <span className="text-xs text-gray-400 italic bg-gray-50 border px-2 py-1 rounded">No reference audio</span>
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
