import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Floating "audio is loading" pill for guide pages, pinned top-right below
// the dev navbar. Guide pages mount dozens of <audio> elements (per-class
// training clips plus the practice-subset explanation UIs) whose files keep
// downloading well after the page renders; this surfaces that so users don't
// press a play button that silently does nothing yet.
//
// Watches by polling rather than per-element listeners: audio elements mount
// and unmount as the async guide sections resolve, and a 400ms sweep of
// document.querySelectorAll is far simpler than tracking that churn. An
// element counts as loading while the browser is actively fetching it and it
// isn't yet playable through (this also catches a click on a play button for
// a not-yet-buffered clip).
export function AudioLoadingIndicator() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = () => {
      const audios = document.querySelectorAll('audio');
      let anyLoading = false;
      audios.forEach((el) => {
        if (
          el.networkState === HTMLMediaElement.NETWORK_LOADING &&
          el.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA
        ) {
          anyLoading = true;
        }
      });
      setLoading(anyLoading);
    };
    check();
    const id = window.setInterval(check, 400);
    return () => window.clearInterval(id);
  }, []);

  if (!loading) return null;

  return (
    <div
      className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-md pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      <span>Audio is loading…</span>
    </div>
  );
}
