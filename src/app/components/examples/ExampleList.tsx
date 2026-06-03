import { Badge } from '../ui/badge';
import { LungSound } from '../../data_v2';

interface ExampleListProps {
  examples: LungSound['examples'];
}

export function ExampleList({ examples }: ExampleListProps) {
  if (!examples || examples.length === 0) {
    return <div className="text-gray-400 italic bg-gray-50 border p-4 rounded text-center">No example-based explanations available.</div>;
  }

  return (
    <div className="space-y-3">
      {examples.map((example) => {
        const audioSrc = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${example.audioUrl}`;
        return (
          <div
            key={example.id}
            className="border-2 border-gray-200 bg-white transition-all rounded-md"
          >
            <div className="px-4 py-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center mt-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm border bg-indigo-50 border-indigo-200 text-indigo-600">
                          {example.rank}
                        </div>
                      </div>
                      <div className="flex-1 mt-1">
                        <p className="text-lg font-medium mb-2">Similar Training Example (Prototype #{example.prototypeIdx})</p>
                        <div className="flex flex-wrap gap-2 mb-2 items-center">
                          <div>
                            <span className="text-sm text-gray-500">True Class: </span>
                            <Badge variant="secondary" className="mr-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100">
                              {example.className}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Similarity Weight: </span>
                            <Badge variant="outline" className="text-gray-600 font-medium">
                              {example.weight.toFixed(4)}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Active Segment: </span>
                            <Badge variant="outline" className="text-gray-600 font-medium border-dashed">
                              {example.activeWindow}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center justify-center pt-2">
                    <audio
                      controls
                      className="h-8 w-48"
                      aria-label={`Audio example for prototype ${example.prototypeIdx}`}
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
