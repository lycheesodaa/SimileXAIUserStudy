import { useEffect } from 'react';
import { StudyXaiVariant } from './domainRegistry';
import { StudyLogger } from './logger';

// Instruments the whole study page with document/window-level listeners so no
// per-component edits are needed:
// - media events don't bubble but DO reach capture-phase document listeners
// - clicks are logged via delegation ([data-log-id] wins, else tag/title/text)
export function useStudyInstrumentation(
  logger: StudyLogger | null,
  sample: unknown, // the active variant's sample; undefined in train mode
  xaiCfg: StudyXaiVariant<any> | undefined,
  pos: string | null
) {
  useEffect(() => {
    if (!logger || !xaiCfg) return;

    // 'minimal' (e.g. the noxai control): session lifecycle, audio and
    // visibility/focus only — no click or scroll tracking.
    const minimal = xaiCfg.logging === 'minimal';

    const mountT = performance.now();
    const playCounts: Record<string, number> = {};

    logger.log('session_start', {
      url: window.location.href,
      referrer: document.referrer,
      screen: { w: window.screen.width, h: window.screen.height },
      viewport: { w: window.innerWidth, h: window.innerHeight },
      userAgent: navigator.userAgent,
      ...(pos ? { pos } : {}),
    });

    // ── Audio (capture phase; media events don't bubble) ────────────────────
    const audioIdOf = (el: EventTarget | null): string | null => {
      if (!(el instanceof HTMLMediaElement)) return null;
      const src = el.currentSrc || el.src;
      if (sample) return xaiCfg.audioIdForSrc(sample, src);
      // Train mode has no sample — identify audio by its filename.
      if (!src) return 'unknown';
      if (src.startsWith('blob:')) return 'custom';
      try {
        return decodeURIComponent(new URL(src).pathname.split('/').pop() || 'unknown');
      } catch {
        return 'unknown';
      }
    };

    const onAudioEvent = (e: Event) => {
      const audioId = audioIdOf(e.target);
      if (!audioId) return;
      const el = e.target as HTMLMediaElement;
      const payload: Record<string, unknown> = {
        audioId,
        currentTime: Math.round(el.currentTime * 100) / 100,
        duration: isFinite(el.duration) ? Math.round(el.duration * 100) / 100 : null,
      };
      if (e.type === 'play') {
        playCounts[audioId] = (playCounts[audioId] || 0) + 1;
        payload.playCount = playCounts[audioId];
      }
      logger.log(`audio_${e.type}`, payload);
    };
    const audioEvents = ['play', 'pause', 'ended', 'seeked'] as const;
    audioEvents.forEach((t) => document.addEventListener(t, onAudioEvent, true));

    // ── Clicks (delegation) ──────────────────────────────────────────────────
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tagged = target.closest?.('[data-log-id]') as HTMLElement | null;
      if (tagged) {
        logger.log('click', { logId: tagged.dataset.logId });
        return;
      }
      // [role="option"] covers portal-rendered dropdown items (e.g. the RexNet
      // baseline selector), whose chosen value would otherwise go unlogged.
      const interactive = target.closest?.('button, a, select, input, [role="button"], [role="option"], audio') as HTMLElement | null;
      if (!interactive) return;
      logger.log('click', {
        tag: interactive.tagName.toLowerCase(),
        title: interactive.getAttribute('title') || undefined,
        text: interactive.textContent?.trim().slice(0, 60) || undefined,
      });
    };
    if (!minimal) document.addEventListener('click', onClick, true);

    // ── Scroll depth (throttled, 10% buckets, max only) ──────────────────────
    let maxBucket = 0;
    let scrollTimer: number | null = null;
    const measureScroll = () => {
      scrollTimer = null;
      const doc = document.documentElement;
      const total = doc.scrollHeight;
      if (total <= 0) return;
      const depth = Math.min(1, (window.scrollY + window.innerHeight) / total);
      const bucket = Math.floor(depth * 10) * 10;
      if (bucket > maxBucket) {
        maxBucket = bucket;
        logger.log('scroll_depth', { maxPct: bucket });
      }
    };
    const onScroll = () => {
      if (scrollTimer === null) scrollTimer = window.setTimeout(measureScroll, 500);
    };
    if (!minimal) window.addEventListener('scroll', onScroll, { passive: true });

    // ── Visibility / focus ───────────────────────────────────────────────────
    const onVisibility = () => {
      logger.log('visibility', { state: document.visibilityState });
      if (document.visibilityState === 'hidden') logger.flush(true);
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onFocus = () => logger.log('iframe_focus');
    const onBlur = () => logger.log('iframe_blur');
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    // ── Lifecycle ────────────────────────────────────────────────────────────
    const onPageHide = () => {
      logger.log('session_end', {
        dwellMs: Math.round(performance.now() - mountT),
        playCounts,
      });
      logger.flush(true);
    };
    window.addEventListener('pagehide', onPageHide);

    return () => {
      audioEvents.forEach((t) => document.removeEventListener(t, onAudioEvent, true));
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onPageHide);
      // SPA navigation away from the study view (no pagehide) still ends the session
      logger.log('session_end', {
        dwellMs: Math.round(performance.now() - mountT),
        playCounts,
      });
      logger.dispose();
    };
  }, [logger, sample, xaiCfg, pos]);
}
