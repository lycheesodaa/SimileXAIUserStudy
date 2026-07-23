import { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { pauseOthers } from './similes/SimileExplanationV3';

// Plain play/pause button for an *actual* recording (a real audio sample, not
// an AI-generated concept clip). Deliberately has none of SimileAudioPlayer's
// "these generated samples may not be representative" tooltip, which would be
// misleading on genuine recordings. Shares the SimileExplanationV3 coordinator
// so only one clip plays at a time across a page/drawer, whatever started it.
export function RecordingPlayButton({
  url,
  logId,
  label = 'recording',
}: {
  url: string;
  logId?: string;
  label?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) el.pause();
    else el.play();
  };

  return (
    <div className="flex items-center flex-shrink-0">
      <button
        onClick={togglePlay}
        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
        aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
        data-log-id={logId}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={(e) => {
          pauseOthers(e.currentTarget);
          setIsPlaying(true);
        }}
        className="hidden"
      />
    </div>
  );
}
