// Batching interaction logger for study mode. Buffers events and POSTs them
// to `${VITE_SERVER_URL}/log`. Logging must never break the UI: all transport
// failures are swallowed (failed batches are re-queued once, buffer bounded).

export interface StudyLoggerContext {
  pid: string;
  domain: string;
  mode: string; // "guide" | "train" | "test" | "tutorial"
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
      pid: ctx.pid,
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
