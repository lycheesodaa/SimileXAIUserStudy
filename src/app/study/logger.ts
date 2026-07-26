// Batching interaction logger for study mode. Buffers events and POSTs them
// to `${VITE_SERVER_URL}/log`. Logging must never break the UI: all transport
// failures are swallowed (failed batches are re-queued once, buffer bounded).

export interface StudyLoggerContext {
  // Qualtrics ResponseID — the join key against the survey export, and the
  // only participant id guaranteed present in every deployment phase. Also
  // names the server-side log file, so it must stay filename-safe.
  responseId: string;
  // Secondary ids, logged but never keyed on: a manually assigned pilot label
  // and (once deployed) the Prolific PID. Absent when Qualtrics doesn't pass
  // them, which is why they're optional rather than "unknown".
  userId?: string;
  prolificPid?: string;
  domain: string;
  mode: string; // "guide" | "test" | "post" | "tutorial"
  sampleId: string; // "none" in guide mode
  xaiType: string;
}

export interface StudyEvent {
  seq: number;
  t: string;
  tMs: number;
  type: string;
  payload?: Record<string, unknown>;
}

export interface StudyLogger {
  sessionId: string;
  log(type: string, payload?: Record<string, unknown>): void;
  flush(useBeacon?: boolean): void;
  dispose(): void;
}

const FLUSH_EVERY_MS = 5000;
const FLUSH_AT_EVENTS = 20;
const MAX_BUFFER = 500;
const REQUEST_TIMEOUT_MS = 10000;

// A stalled tunnel would otherwise hold a `keepalive` request open for the
// browser default (minutes) and burn one of the few keepalive slots. Undefined
// on browsers without AbortSignal.timeout — no timeout is still better than a
// synchronous throw inside flush().
const requestSignal = (): AbortSignal | undefined => {
  try {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  } catch {
    return undefined;
  }
};

export function createStudyLogger(ctx: StudyLoggerContext): StudyLogger {
  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `s-${Math.random().toString(36).slice(2)}`;
  const mountT = performance.now();
  const serverUrl = import.meta.env.VITE_SERVER_URL as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  let buffer: StudyEvent[] = [];
  let seq = 0;
  let disposed = false;

  const makeBody = (events: StudyEvent[], includeApiKey: boolean) =>
    JSON.stringify({
      sessionId,
      responseId: ctx.responseId,
      ...(ctx.userId ? { userId: ctx.userId } : {}),
      ...(ctx.prolificPid ? { prolificPid: ctx.prolificPid } : {}),
      domain: ctx.domain,
      mode: ctx.mode,
      sampleId: ctx.sampleId,
      xaiType: ctx.xaiType,
      clientTime: new Date().toISOString(),
      ...(includeApiKey && apiKey ? { apiKey } : {}),
      events,
    });

  const send = (events: StudyEvent[], useBeacon: boolean) => {
    if (!serverUrl || events.length === 0) return;
    const url = `${serverUrl}/log`;

    if (useBeacon && navigator.sendBeacon) {
      // sendBeacon cannot set headers, and an application/json Blob triggers a
      // CORS preflight that can be dropped during unload — so use text/plain
      // and put the api key in the body.
      const blob = new Blob([makeBody(events, true)], { type: 'text/plain' });
      if (navigator.sendBeacon(url, blob)) return;
      // beacon rejected (payload too large / queue full) — fall through to fetch
    }

    fetch(url, {
      method: 'POST',
      keepalive: true,
      signal: requestSignal(),
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      body: makeBody(events, false),
    }).catch(() => {
      // Re-queue once so a transient failure isn't data loss; a batch that
      // fails twice is dropped (events carry no `requeued` flag twice).
      if (disposed) return;
      const retriable = events.filter((e) => !(e.payload as any)?.__requeued);
      retriable.forEach((e) => {
        e.payload = { ...(e.payload || {}), __requeued: true };
      });
      buffer = [...retriable, ...buffer].slice(0, MAX_BUFFER);
    });
  };

  const flush = (useBeacon = false) => {
    if (buffer.length === 0) return;
    const events = buffer;
    buffer = [];
    send(events, useBeacon);
  };

  const interval = window.setInterval(() => flush(false), FLUSH_EVERY_MS);

  return {
    sessionId,
    log(type, payload) {
      if (disposed) return;
      buffer.push({
        seq: ++seq,
        t: new Date().toISOString(),
        tMs: Math.round(performance.now() - mountT),
        type,
        payload,
      });
      if (buffer.length > MAX_BUFFER) buffer = buffer.slice(-MAX_BUFFER);
      if (buffer.length >= FLUSH_AT_EVENTS) flush(false);
    },
    flush,
    dispose() {
      flush(true);
      disposed = true;
      window.clearInterval(interval);
    },
  };
}
