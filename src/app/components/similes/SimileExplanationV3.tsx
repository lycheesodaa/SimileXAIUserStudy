import { ReactNode, useState, useRef } from 'react';
import { Play, Pause, HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SimilePractice } from './SimilePractice';
import { ClassBadge, resolveConceptCategory } from '../ClassBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export interface SimileItem {
  id: string;
  text: string;
  confidence: number;
  /** Raw model score to print in the bar label when `confidence` is a
   *  normalized bar-width value (e.g. contribution / max |contribution|). */
  displayValue?: number;
  /** Dual-view (beta breakdown) only: the signed evidence contributed by each
   *  fusion branch, in the same raw units as displayValue. When both are set,
   *  displayValue must equal clapValue + beatsValue. */
  clapValue?: number;
  beatsValue?: number;
  /** Activation-only view: whether the classifier's sparse head actually uses
   *  this concept (non-zero head weight). Undefined outside that view. */
  usedByHead?: boolean;
  /** Render the descriptor negated ("NOT like a whistle"). Set by the v2 bundle
   *  for concepts whose head weight is negative, regardless of evidence sign. */
  negate?: boolean;
  category?: string;
  withinClassAudioUrl?: string;
}

interface SimileExplanationV3Props {
  audioName: string;
  classification: string;
  similes: SimileItem[];
  originalAudioUrl?: string;
  isOnomatopoeia?: boolean;
  /** Minimum |confidence| for a simile to appear in the tornado plot. */
  threshold?: number;
  /** Bars are raw activations (head-independent match strength), not signed
   *  evidence for the prediction: swaps the copy/axis wording and shows the
   *  per-item usedByHead badge. */
  activationView?: boolean;
  /** Drawer content; defaults to the legacy hardcoded SimilePractice. */
  cheatsheet?: ReactNode;
  /** Force the cheatsheet drawer open regardless of the internal toggle. Used
   *  by the tutorial to physically reveal the drawer on its cheatsheet step. */
  forceDrawerOpen?: boolean;
  /** Study domain ('lung' | 'bird'), used to word the recording label.
   *  Defaults to lung wording when unset. */
  domain?: string;
}

// Only one generated sample plays at a time: starting one pauses whichever was
// playing. Module-level rather than context so it spans every player on the
// page — the tornado rows and the cheatsheet drawer — without threading state
// through the components between them. Driven off the 'play' event, so it holds
// no matter what started playback.
let currentlyPlaying: HTMLAudioElement | null = null;

// Exported so the plain recording play button (RecordingPlayButton) shares this
// single coordinator: within a drawer that mixes generated concept clips and
// real class recordings, starting any one still pauses whatever was playing.
export const pauseOthers = (el: HTMLAudioElement) => {
  if (currentlyPlaying && currentlyPlaying !== el) currentlyPlaying.pause();
  currentlyPlaying = el;
};

export const GENERATED_SAMPLE_NOTE =
  'Note that these generated samples may not be entirely representative of the given text. ' +
  'You can choose to rely on your subjective experience of the text instead.';

// Blue is the plain generated referent clip; amber is the same concept applied
// to a real recording of the class (the cheatsheet's styled_audio).
const AUDIO_PLAYER_VARIANTS = {
  blue: 'text-blue-600 hover:bg-blue-50',
  amber: 'text-amber-500 hover:bg-amber-50',
};

export function SimileAudioPlayer({
  url,
  logId,
  variant = 'blue',
  tooltip = GENERATED_SAMPLE_NOTE,
}: {
  url: string;
  logId?: string;
  variant?: keyof typeof AUDIO_PLAYER_VARIANTS;
  tooltip?: ReactNode;
}) {
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
      {/* The shared tooltip's provider defaults to no delay; half a second
          keeps the note from flashing up while the pointer crosses the row. */}
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <button
            onClick={togglePlay}
            className={`p-1.5 rounded-full transition-colors ${AUDIO_PLAYER_VARIANTS[variant]}`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            data-log-id={logId}
            data-tutorial={variant === 'blue' ? 'concept-play' : undefined}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6} className="max-w-xs leading-relaxed">
          {tooltip}
        </TooltipContent>
      </Tooltip>
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

export function SimileExplanationV3({
  audioName,
  classification,
  similes,
  originalAudioUrl,
  isOnomatopoeia = false,
  threshold = 0.25,
  activationView = false,
  cheatsheet,
  forceDrawerOpen = false,
  domain,
}: SimileExplanationV3Props) {
  // Word the recording prompt for the input domain; fall back to lung wording.
  const domainNoun = domain === 'bird' ? 'bird sound' : 'lung sound';
  const magnitude = (s: SimileItem) => Math.abs(s.displayValue ?? s.confidence);

  // Raw evidence values this close to 0 are effectively no evidence; drop them
  // rather than render a sliver bar with a "0.00" label. The activation view is
  // meant to show the full concept list (including non-firing ones), so it opts
  // out of this floor.
  const MIN_EVIDENCE = activationView ? 0 : 0.01;

  // Filter and sort similes for the tornado plot
  const filteredSimiles = similes
    .filter((s) => Math.abs(s.confidence) >= threshold && magnitude(s) >= MIN_EVIDENCE)
    .sort((a, b) => magnitude(b) - magnitude(a));

  const isDualView = filteredSimiles.some(
    (s) => s.clapValue !== undefined && s.beatsValue !== undefined
  );
  // Onomatopoeia tokens are much shorter than simile sentences; a narrower
  // plot and label column avoid a large empty gutter on the left.
  const plotWidthClass = isOnomatopoeia ? 'max-w-4xl' : 'max-w-4xl';
  const rowGridClass = isOnomatopoeia ? 'grid-cols-[16rem_1fr]' : 'grid-cols-[1fr_2fr]';

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerOpen = forceDrawerOpen || isDrawerOpen;
  const [showMinor, setShowMinor] = useState(false);

  // Only the top MAX_MAJOR_COUNT bars are visible by default; everything else
  // gets tucked into the collapsible "weaker evidence" section.
  const MAX_MAJOR_COUNT = 3;
  const majorSimiles = filteredSimiles.slice(0, MAX_MAJOR_COUNT);
  const minorSimiles = filteredSimiles.slice(MAX_MAJOR_COUNT);

  const getAudioUrl = (path: string | undefined) => {
    if (!path) return '';
    // All audio URLs are now absolute S3 paths, no need for server prepending
    return path;
  };

  const renderRow = (s: SimileItem) => {
    const isPositive = s.confidence >= 0;
    const barWidth = `${Math.abs(s.confidence) * 100}%`;
    const rawValue = s.displayValue ?? s.confidence;
    const barLabel = rawValue.toFixed(2);

    const generic = isPositive ? 'bg-blue-400' : 'bg-red-400';
    const darker = isPositive ? 'bg-blue-600' : 'bg-red-600';
    // Segments listed center-outward: CLAP (generic shade) first,
    // BEATs (darker) second when the branches agree in sign; a
    // single net-value segment when they oppose each other.
    let segments: { frac: number; cls: string }[];
    if (s.clapValue !== undefined && s.beatsValue !== undefined) {
      if (s.clapValue * s.beatsValue >= 0) {
        const total = Math.abs(s.clapValue) + Math.abs(s.beatsValue);
        segments =
          total > 0
            ? [
                { frac: Math.abs(s.clapValue) / total, cls: generic },
                { frac: Math.abs(s.beatsValue) / total, cls: darker },
              ]
            : [{ frac: 1, cls: generic }];
      } else {
        segments = [
          {
            frac: 1,
            cls: Math.abs(s.clapValue) >= Math.abs(s.beatsValue) ? generic : darker,
          },
        ];
      }
    } else {
      segments = [{ frac: 1, cls: generic }];
    }
    // DOM order is left-to-right; the negative side grows leftward
    // from the center line, so its segments render reversed.
    const orderedSegments = isPositive ? segments : [...segments].reverse();

    const bar = (
      <div
        className={`h-6 ${isPositive ? 'rounded-r-sm' : 'rounded-l-sm'} flex overflow-hidden relative flex-shrink-0`}
        style={{ width: barWidth, minWidth: '4px' }}
        data-tutorial={orderedSegments.length > 1 ? 'split-bar' : undefined}
      >
        {orderedSegments.map((seg, i) => (
          <div key={i} className={`h-full ${seg.cls}`} style={{ width: `${seg.frac * 100}%` }} />
        ))}
      </div>
    );
    // The value always sits in the half opposite the coloured bar, flush
    // against the center line: left of center (flush right) for positive
    // bars, right of center (flush left) for negative bars.
    const valueLabel = (
      <span className={`text-xs text-gray-600 ${isPositive ? 'mr-1' : 'ml-1'}`}>
        {barLabel}
      </span>
    );

    const categoryClass = resolveConceptCategory(s.text, s.category);

    return (
      <div key={s.id} className={`grid ${rowGridClass} gap-4 items-center mb-2`} data-tutorial="evidence-row">
        <div className="flex justify-between items-center gap-2 text-sm text-gray-700 leading-tight">
          <div
            className="flex items-center gap-1 flex-shrink-0"
            data-tutorial={categoryClass ? 'category-badge' : undefined}
          >
            <div className="w-11 flex justify-start">
              {categoryClass && (
                <ClassBadge className={categoryClass} useAbbrev size="xs" />
              )}
            </div>
            {activationView && (
              <div className="w-10 flex justify-start">
                {s.usedByHead && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide text-cyan-700 bg-cyan-50 border border-cyan-200 rounded px-1 flex-shrink-0"
                    title="The classifier uses this concept in its decision"
                    data-tutorial="used-badge"
                  >
                    used
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end items-center gap-2 text-right">
            <span>
              {s.negate && (
                <span className="font-semibold text-red-600 uppercase mr-1">not</span>
              )}
              {s.text}
            </span>
            {/* {s.withinClassAudioUrl && (
              <SimileAudioPlayer url={getAudioUrl(s.withinClassAudioUrl)} logId={`simile-play-${s.id}`} />
            )} */}
          </div>
        </div>
        <div className="relative w-full h-8 flex items-center bg-gray-50 rounded-sm" data-tutorial="evidence-bar">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 z-10" />

          {/* Negative half: red bar, or the positive value flush to center */}
          <div className="w-1/2 h-full flex justify-end items-center pr-px">
            {isPositive ? valueLabel : bar}
          </div>

          {/* Positive half: blue bar, or the negative value flush to center */}
          <div className="w-1/2 h-full flex justify-start items-center pl-px">
            {isPositive ? bar : valueLabel}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 mx-3">
      {/* Audio Player Section */}
      <div className="mb-6">
        <div className="pt-6">
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

      {/* Tornado Plot Section */}
      <div className="mb-6">
        <div className="mb-4" data-tutorial="explanation-header">
          <h2 className="text-xl font-semibold mb-2">{isOnomatopoeia ? 'Onomatopoeia' : 'Simile'} Explanation</h2>
          <p className="text-gray-600">
            {activationView
              ? `Each bar shows how strongly the system hears each ${isOnomatopoeia ? 'onomatopoeia' : 'simile'} in this recording — including ones the classifier does not use in its decision.`
              : `The system detects the following ${isOnomatopoeia ? 'onomatopoeia(s)' : 'simile(s)'} as positive or negative evidence for this classification.`}
          </p>
          {isDualView && (
            <p className="text-sm text-gray-500 mt-2 italic" data-tutorial="dualview-legend">
              Each bar splits the {activationView ? 'match' : 'evidence'} between the system's two listening branches:{' '}
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-400 align-middle ml-0.5 mb-0.5" />
              <span className="inline-block w-3 h-3 rounded-sm bg-red-400 align-middle ml-0.5 mr-0.5 mb-0.5" />{' '}
              lighter = language,{' '}
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-600 align-middle ml-0.5 mb-0.5" />
              <span className="inline-block w-3 h-3 rounded-sm bg-red-600 align-middle ml-0.5 mr-0.5 mb-0.5" />{' '}
              darker = acoustic.
              <br/>
              When the two branches disagree, only the net
              {activationView ? ' match' : ' evidence'} is shown, in the shade of the branch that dominates.
            </p>
          )}
        </div>

        {filteredSimiles.length === 0 ? (
          <p className="text-gray-500 italic">No strong evidence found.</p>
        ) : (
          <div
            className={`w-full ${plotWidthClass} flex flex-col gap-3 mt-6`}
            data-tutorial="evidence-plot"
          >
            <div className={`grid ${rowGridClass} gap-4 items-center mb-2`}>
              <div></div>
              <div className="relative w-full flex text-xs font-semibold text-gray-500 uppercase tracking-wider" data-tutorial="evidence-axis">
                <div className="w-1/2 text-right pr-2">{activationView ? 'Negative Match' : 'Negative Evidence'}</div>
                <div className="w-1/2 text-left pl-2">{activationView ? 'Positive Match' : 'Positive Evidence'}</div>
              </div>
            </div>

            {majorSimiles.map((s) => renderRow(s))}

            {minorSimiles.length > 0 && (
              <>
                <button
                  onClick={() => setShowMinor((v) => !v)}
                  className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
                  data-log-id="minor-evidence-toggle"
                  data-tutorial="weaker-toggle"
                >
                  {showMinor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showMinor
                    ? 'Hide weaker evidence'
                    // : `Show ${minorSimiles.length} weaker ${isOnomatopoeia ? 'onomatopoeia' : 'simile'}${minorSimiles.length === 1 ? '' : 's'} (|evidence| < ${MINOR_BELOW})`}
                    : `Show weaker evidence`}
                </button>
                {showMinor && minorSimiles.map((s) => renderRow(s))}
              </>
            )}
          </div>
        )}
      </div>
    </div>

      {/* Floating Button */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-cyan-700 transition-colors z-40"
        title="Open Simile Cheatsheet"
        data-log-id="cheatsheet-open"
        data-tutorial="cheatsheet-button"
      >
        <HelpCircle size={28} />
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
              <h2 className="text-xl font-semibold text-cyan-800">{isOnomatopoeia ? 'Onomatopoeia' : 'Simile'} Cheatsheet</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {cheatsheet ?? <SimilePractice isOnomatopoeia={isOnomatopoeia} inDrawer />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
