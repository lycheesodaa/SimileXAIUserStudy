import { Play, Pause, Volume2, SkipBack, SkipForward, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  label?: string;
  src?: string; // Optional, just for show
  className?: string;
}

export function AudioPlayer({ label = "Audio Clip", className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration] = useState(100); // Mock duration logic
  
  // Mock playing effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm ${className}`}>
      <div className="flex items-center gap-4 w-full">
        {/* Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Waveform / Progress */}
        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>{label}</span>
            <span>{isPlaying ? "Playing..." : "00:05"}</span>
          </div>
          <div className="h-8 bg-gray-200 rounded overflow-hidden relative group cursor-pointer" onClick={() => setProgress(Math.random() * 100)}>
            {/* Mock Waveform Bars */}
            <div className="absolute inset-0 flex items-center justify-between px-1 opacity-40 group-hover:opacity-60 transition-opacity">
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-gray-400 rounded-full transition-all duration-300"
                  style={{ 
                    height: `${20 + Math.random() * 60}%`,
                  }} 
                />
              ))}
            </div>
            {/* Progress Bar */}
            <div 
              className="absolute inset-y-0 left-0 bg-blue-500/20 border-r-2 border-blue-600 transition-all duration-100 z-10"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 text-gray-400">
            <button className="p-1 hover:text-gray-600 rounded"><Volume2 size={18} /></button>
            <button className="p-1 hover:text-gray-600 rounded"><MoreVertical size={18} /></button>
        </div>
      </div>
    </div>
  );
}
