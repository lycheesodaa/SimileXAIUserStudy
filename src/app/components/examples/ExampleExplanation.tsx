import { Fragment, ReactNode, useState, useRef } from 'react';
import { Play, Pause, HelpCircle, X } from 'lucide-react';
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
  /** Precomputed similarity × weight from the proto bundle; falls back to the
   *  product (or the bare weight for legacy data without similarity). */
  contribution?: number;
}

interface ExampleExplanationProps {
  audioName: string;
  classification: string;
  confidence: number;
  examples: ExampleItem[];
  originalAudioUrl?: string;
  /** Study domain ('lung' | 'bird'), used to word the recording label.
   *  Defaults to lung wording when unset. */
  domain?: string;
  /** Cheatsheet drawer content (per-class example recordings). Omit to hide
   *  the floating reference button entirely. */
  cheatsheet?: ReactNode;
  /** Force the cheatsheet drawer open regardless of the internal toggle. Used
   *  by the tutorial to physically reveal the drawer on its cheatsheet step. */
  forceDrawerOpen?: boolean;
}

// Bar value for one example. Exported so the tutorial can rank the examples
// exactly as they are displayed when it talks about "the top three".
export const contributionOf = (e: ExampleItem) =>
  e.contribution ?? (e.similarity !== undefined ? e.similarity * e.weight : e.weight);

// Only one example plays at a time: starting one pauses whichever was playing.
// Module-level so it spans every row without threading state through props.
let currentlyPlaying: HTMLAudioElement | null = null;

const pauseOthers = (el: HTMLAudioElement) => {
  if (currentlyPlaying && currentlyPlaying !== el) currentlyPlaying.pause();
  currentlyPlaying = el;
};

function ExampleAudioPlayer({ url, logId, label }: { url: string; logId?: string; label: string }) {
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
    <div className="flex items-center flex-shrink-0" data-tutorial="example-audio">
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

export function ExampleExplanation({
  audioName,
  classification,
  confidence,
  examples,
  originalAudioUrl,
  domain,
  cheatsheet,
  forceDrawerOpen = false,
}: ExampleExplanationProps) {
  // Word the recording prompt for the input domain; fall back to lung wording.
  const domainNoun = domain === 'bird' ? 'bird sound' : 'lung sound';

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerOpen = forceDrawerOpen || isDrawerOpen;

  const getAudioUrl = (path: string) =>
    // v1 data uses absolute S3 URLs; legacy v2 paths are root-relative.
    path.startsWith('http') ? path : `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

  const sorted = [...examples].sort((a, b) => contributionOf(b) - contributionOf(a));
  const maxContribution = Math.max(...sorted.map(contributionOf), 0);

  const renderRow = (e: ExampleItem) => {
    const contribution = contributionOf(e);
    const barWidth = maxContribution > 0 ? `${(contribution / maxContribution) * 100}%` : '0%';
    const breakdown =
      e.similarity !== undefined
        ? `similarity ${e.similarity.toFixed(2)} × weight ${e.weight.toFixed(2)}`
        : undefined;

    // The value sits in white flush against the left edge inside the bar;
    // bars too short to hold it get the label in gray just outside instead.
    const labelFits = maxContribution > 0 && contribution / maxContribution >= 0.15;

    // Two sibling cells of the shared outer grid: its auto-sized label column
    // hugs the widest label, so no gutter opens up left of the badges.
    return (
      <Fragment key={e.id}>
        <div
          className="flex justify-between items-center gap-2 text-sm text-gray-700 leading-tight"
          data-tutorial="example-card"
        >
          <div className="w-11 flex justify-start flex-shrink-0" data-tutorial="example-class">
            <ClassBadge className={e.className} useAbbrev size="xs" />
          </div>
          <div className="flex justify-end items-center gap-2 text-right">
            <span data-tutorial="example-rank">Training example #{e.rank}</span>
            <ExampleAudioPlayer
              url={getAudioUrl(e.audioUrl)}
              logId={`example-play-${e.id}`}
              label={`similar training example ${e.rank}`}
            />
          </div>
        </div>
        <div
          className="relative w-full h-8 flex items-center bg-gray-50 rounded-sm"
          data-tutorial="example-weight"
        >
          {/* Divider marking the bar baseline */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-400 z-10" />
          <div
            className="h-6 bg-blue-400 rounded-r-sm flex-shrink-0 flex items-center"
            style={{ width: barWidth, minWidth: '4px' }}
          >
            {labelFits && (
              <span className="text-xs text-white pl-1.5 whitespace-nowrap" title={breakdown}>
                {contribution.toFixed(2)}
              </span>
            )}
          </div>
          {!labelFits && (
            <span className="text-xs text-gray-600 ml-1" title={breakdown}>
              {contribution.toFixed(2)}
            </span>
          )}
        </div>
      </Fragment>
    );
  };

  return (
    <>
    <div className="space-y-4 mx-3">
      {/* Audio Player Section */}
      <div>
        <div className="pt-4">
          <div className="flex flex-col gap-2" data-tutorial="original-audio">
            <span className="text-gray-600">Play this {domainNoun} recording:</span>
            {originalAudioUrl ? (
              <audio
                controls
                className="w-full max-w-md h-10"
                src={getAudioUrl(originalAudioUrl)}
                data-log-id="original-audio"
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <span className="text-sm text-gray-400 italic">No audio available for this sample</span>
            )}
          </div>
        </div>
      </div>

      {/* Contribution Plot Section */}
      <div>
        <div className="mb-3" data-tutorial="examples-header">
          <h2 className="text-xl font-semibold mb-2">Example Explanation</h2>
          <p className="text-gray-600">
            The system identifies the following similar training example(s) as evidence for this
            classification. Each bar shows how much that example contributed.
          </p>
        </div>

        {sorted.length === 0 ? (
          <p className="text-gray-500 italic">No example-based explanations available.</p>
        ) : (
          // Single grid so every row shares the auto-sized label column,
          // which hugs the widest label instead of opening a left gutter.
          <div
            className="w-full max-w-2xl mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center"
            data-tutorial="examples-plot"
          >
            <div></div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-2">
              Contribution
            </div>
            {sorted.map((e) => renderRow(e))}
          </div>
        )}
      </div>
    </div>

      {cheatsheet && (
        <>
          {/* Floating Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="fixed bottom-6 right-6 h-14 px-5 bg-cyan-600 text-white rounded-full shadow-xl flex items-center justify-center gap-2 hover:bg-cyan-700 transition-colors z-40"
            title="Open Example Cheatsheet"
            data-log-id="cheatsheet-open"
            data-tutorial="cheatsheet-button"
          >
            <HelpCircle size={24} />
            <span className="font-semibold">Cheatsheet</span>
          </button>

          {/* Drawer Overlay */}
          {drawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
              />

              {/* Drawer content */}
              <div
                className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
                data-tutorial="cheatsheet-panel"
              >
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                  <h2 className="text-xl font-semibold text-cyan-800">Example Cheatsheet</h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">{cheatsheet}</div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
