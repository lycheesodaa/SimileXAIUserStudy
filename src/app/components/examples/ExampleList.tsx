import { Badge } from '../ui/badge';
import { ClassBadge } from '../ClassBadge';

export interface ExampleItem {
  id: string;
  rank: number;
  className: string;
  weight: number;
  audioUrl: string;
  prototypeIdx?: number;
  activeWindow?: string;
  similarity?: number;
}

interface ExampleListProps {
  examples: ExampleItem[];
}

export function ExampleList({ examples }: ExampleListProps) {
  if (!examples || examples.length === 0) {
    return <div className="text-gray-400 italic bg-gray-50 border p-4 rounded text-center">No example-based explanations available.</div>;
  }

  return (
    <div className="space-y-3">
      {examples.map((example) => {
        // v1 data uses absolute S3 URLs; legacy v2 paths are root-relative.
        const audioSrc = example.audioUrl.startsWith('http')
          ? example.audioUrl
          : `${import.meta.env.BASE_URL.replace(/\/$/, '')}${example.audioUrl}`;
        return (
          <div
            key={example.id}
            className="border-2 border-gray-200 bg-white transition-all rounded-md"
            data-tutorial="example-card"
          >
            <div className="px-4 py-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center mt-2" data-tutorial="example-rank">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm border bg-indigo-50 border-indigo-200 text-indigo-600">
                          {example.rank}
                        </div>
                      </div>
                      <div className="flex-1 mt-1">
                        <p className="text-lg font-medium mb-2">
                          Similar Training Example {example.prototypeIdx !== undefined ? `(Prototype #${example.prototypeIdx})` : `#${example.rank}`}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2 items-center">
                          <div className="flex items-center gap-1.5 mr-2" data-tutorial="example-class">
                            <span className="text-sm text-gray-500">True Class:</span>
                            <ClassBadge className={example.className} size="sm" />
                          </div>
                          {example.similarity !== undefined && (
                            <div>
                              <span className="text-sm text-gray-500">Similarity: </span>
                              <Badge variant="outline" className="text-gray-600 font-medium">
                                {example.similarity.toFixed(4)}
                              </Badge>
                            </div>
                          )}
                          <div data-tutorial="example-weight">
                            <span className="text-sm text-gray-500">Similarity Weight: </span>
                            <Badge variant="outline" className="text-gray-600 font-medium">
                              {example.weight.toFixed(4)}
                            </Badge>
                          </div>
                          {example.activeWindow && (
                            <div>
                              <span className="text-sm text-gray-500">Active Segment: </span>
                              <Badge variant="outline" className="text-gray-600 font-medium border-dashed">
                                {example.activeWindow}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center justify-center pt-2" data-tutorial="example-audio">
                    <audio
                      controls
                      className="h-8 w-48"
                      aria-label={`Audio for similar training example ${example.rank}`}
                      src={audioSrc}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
