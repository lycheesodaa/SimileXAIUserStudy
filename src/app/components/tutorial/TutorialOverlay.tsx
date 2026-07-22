import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

// Generic guided-tour engine for the /tutorial/ mode. The children (a real
// explanation UI, rendered from a real sample) are made static and
// non-interactable (inert + pointer-events-none); the tour then spotlights one
// element at a time and shows a tooltip card next to it.
//
// Steps address elements via [data-tutorial="..."] attributes placed in the
// explanation components (first match inside the tutorial content wins).
// Steps whose selector matches nothing are dropped automatically, so
// conditional UI (dual-view bars, "show weaker evidence" toggles) can share
// one step list.
export interface TutorialStep {
  /** CSS selector resolved inside the tutorial content; omit for a centered
   *  card (welcome / done). */
  target?: string;
  title: string;
  body: ReactNode;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  children: ReactNode;
}

const SPOT_PAD = 6;
const TOOLTIP_W = 340;
const TOOLTIP_GAP = 14;
// Rough tooltip height used only to pick above/below placement.
const TOOLTIP_H_EST = 230;

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay({ steps, children }: TutorialOverlayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // Steps whose target exists in the mounted content; null until measured.
  const [available, setAvailable] = useState<TutorialStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<SpotRect | null>(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    setAvailable(steps.filter((s) => !s.target || root.querySelector(s.target)));
    setIndex(0);
  }, [steps]);

  const step = available?.[index];

  // Bring the target into view when the step changes.
  useEffect(() => {
    if (!step?.target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    contentRef.current
      ?.querySelector(step.target)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [step]);

  // Track the target's viewport rect every frame: cheap (one rect read), and
  // it stays glued to the element through smooth scrolling and resizes.
  useEffect(() => {
    if (!step?.target) {
      setRect(null);
      return;
    }
    let raf = 0;
    let last = '';
    const tick = () => {
      const el = contentRef.current?.querySelector(step.target!);
      if (el) {
        const r = el.getBoundingClientRect();
        const key = `${r.top}|${r.left}|${r.width}|${r.height}`;
        if (key !== last) {
          last = key;
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const count = available?.length ?? 0;
  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(count - 1, i + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(count - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);

  // Tooltip placement: centered when there is no target; otherwise below the
  // spotlight if it fits, else above, horizontally clamped to the viewport.
  let tooltipStyle: CSSProperties;
  if (!rect) {
    tooltipStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TOOLTIP_W,
      maxWidth: 'calc(100vw - 24px)',
    };
  } else {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const below = rect.top + rect.height + SPOT_PAD + TOOLTIP_GAP;
    const placeBelow = below + TOOLTIP_H_EST < vh || rect.top < TOOLTIP_H_EST + TOOLTIP_GAP;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - TOOLTIP_W / 2, 12),
      Math.max(vw - TOOLTIP_W - 12, 12)
    );
    tooltipStyle = {
      position: 'fixed',
      left,
      width: TOOLTIP_W,
      maxWidth: 'calc(100vw - 24px)',
      ...(placeBelow
        ? { top: Math.min(below, vh - 60) }
        : { bottom: Math.max(vh - rect.top + SPOT_PAD + TOOLTIP_GAP, 12) }),
    };
  }

  const isFirst = index === 0;
  const isLast = index === count - 1;

  return (
    <div className="relative">
      {/* The explanation UI itself: fully visible but static — inert blocks
          focus/AT interaction, pointer-events-none blocks the mouse. */}
      <div
        ref={contentRef}
        className="pointer-events-none select-none"
        {...({ inert: '' } as object)}
      >
        {children}
      </div>

      {/* Dim + spotlight. The huge box-shadow darkens everything around the
          cutout; pointer-events-none keeps page scrolling alive. */}
      {rect ? (
        <div
          className="fixed z-[60] pointer-events-none rounded-lg border-2 border-cyan-400"
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
            transition: 'top 150ms, left 150ms, width 150ms, height 150ms',
          }}
        />
      ) : (
        <div className="fixed inset-0 z-[60] pointer-events-none bg-slate-900/55" />
      )}

      {/* Tooltip card */}
      {step && (
        <div
          className="z-[70] bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex flex-col gap-3"
          style={tooltipStyle}
          role="dialog"
          aria-label={step.title}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-semibold text-cyan-800">{step.title}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {index + 1} / {count}
            </span>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">{step.body}</div>
          <div className={`flex items-center pt-1 ${isLast ? 'justify-start' : 'justify-between'}`}>
            {!isLast && (
              <button
                onClick={goPrev}
                disabled={isFirst}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border transition-colors ${
                  isFirst
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                data-log-id="tutorial-back"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={() => setIndex(0)}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                data-log-id="tutorial-restart"
              >
                <RotateCcw size={14} /> Restart Tour
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
                data-log-id="tutorial-next"
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
