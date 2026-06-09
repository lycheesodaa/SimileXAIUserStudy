import { useState, useRef } from 'react';
import { Play, Pause, HelpCircle, X } from 'lucide-react';
import { LungSoundV3 } from '../../data_v3';
import { SimilePractice } from './SimilePractice';

interface SimileExplanationV3Props {
  audioName: string;
  classification: string;
  similes: LungSoundV3['similes'];
  originalAudioUrl?: string;
  isOnomatopoeia?: boolean;
}

function SimileAudioPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center flex-shrink-0">
      <button 
        onClick={togglePlay} 
        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <audio 
        ref={audioRef} 
        src={url} 
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)} 
        onPlay={() => setIsPlaying(true)} 
        className="hidden" 
      />
    </div>
  );
}

export function SimileExplanationV3({
  audioName,
  classification,
  similes,
  originalAudioUrl,
  isOnomatopoeia = false,
}: SimileExplanationV3Props) {
  // Filter and sort similes for the tornado plot
  // Exclude absolute confidence < 0.25
  const filteredSimiles = similes
    .filter((s) => Math.abs(s.confidence) >= 0.25)
    .sort((a, b) => Math.abs(b.confidence) - Math.abs(a.confidence));

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
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

      {/* Tornado Plot Section */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Simile Evidence (Tornado Plot)</h2>
          <p className="text-gray-600">
            The system detects the following {isOnomatopoeia ? 'onomatopoeia(s)' : 'simile(s)'} as positive or negative evidence for this classification.
          </p>
        </div>

        {filteredSimiles.length === 0 ? (
          <p className="text-gray-500 italic">No strong evidence found (absolute score &ge; 0.25).</p>
        ) : (
          <div className="w-full max-w-4xl flex flex-col gap-3 mt-6">
            <div className="grid grid-cols-[1fr_2fr] gap-4 items-center mb-2">
              <div></div>
              <div className="relative w-full flex text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="w-1/2 text-right pr-2">Negative Evidence</div>
                <div className="w-1/2 text-left pl-2">Positive Evidence</div>
              </div>
            </div>

            {filteredSimiles.map((s) => {
              const isPositive = s.confidence >= 0;
              const barWidth = `${Math.abs(s.confidence) * 100}%`;

              return (
                <div key={s.id} className="grid grid-cols-[1fr_2fr] gap-4 items-center mb-2">
                  <div className="flex justify-end items-center gap-2 text-right text-sm text-gray-700 leading-tight">
                    <span>{s.text}</span>
                    {s.withinClassAudioUrl && (
                      <SimileAudioPlayer url={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${s.withinClassAudioUrl}`} />
                    )}
                  </div>
                  <div className="relative w-full h-8 flex items-center bg-gray-50 rounded-sm">
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 z-10" />

                    {/* Negative half */}
                    <div className="w-1/2 h-full flex justify-end items-center pr-px">
                      {!isPositive && (
                        <div
                          className="h-6 bg-red-400 rounded-l-sm flex items-center justify-start overflow-hidden relative"
                          style={{ width: barWidth, minWidth: '4px' }}
                        >
                          <span className="text-xs text-white absolute right-1">
                            {s.confidence.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Positive half */}
                    <div className="w-1/2 h-full flex justify-start items-center pl-px">
                      {isPositive && (
                        <div
                          className="h-6 bg-blue-400 rounded-r-sm flex items-center justify-end overflow-hidden relative"
                          style={{ width: barWidth, minWidth: '4px' }}
                        >
                          <span className="text-xs text-white absolute left-1">
                            {s.confidence.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

      {/* Floating Button */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-cyan-700 transition-colors z-40"
        title="Open Simile Cheatsheet"
      >
        <HelpCircle size={28} />
      </button>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-cyan-800">Simile Cheatsheet</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Reuse SimilePractice directly */}
              <SimilePractice isOnomatopoeia={isOnomatopoeia} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
