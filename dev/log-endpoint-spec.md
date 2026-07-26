# Task: Add a `POST /log` endpoint for study interaction logging

## Context

The frontend (Simile-based-Audio-XAI-UI — a Vite/React SPA on GitHub Pages, embedded as an iframe in a Qualtrics survey) now has a "study mode" that batches UI interaction events (audio plays, clicks, scroll depth, dwell time) and POSTs them to this server. The frontend is done and deployed; this endpoint is the only missing piece before the study can collect data.

The events that matter for analysis are those from `mode: "test"` and `mode: "post"`; `"guide"` and `"tutorial"` sessions are logged too but can be filtered out downstream. The server should not distinguish between them — accept and store all four the same way.

The frontend already talks to this server at one endpoint: `POST /generate-from-simile`, authenticated with an `X-API-Key` header. The new `/log` endpoint must use the **same API key** and live on the same server (the frontend reads one `VITE_SERVER_URL`).

## Endpoint contract

```
POST /log
```

**Auth — two accepted forms (either is sufficient):**
1. `X-API-Key: <key>` request header (normal path), OR
2. `"apiKey": "<key>"` field inside the JSON body (fallback path — see "Why text/plain" below)

Reject with `401` only if *neither* is present/valid.

**Content-Type — accept BOTH:**
- `application/json` (normal path: `fetch` with `keepalive: true`)
- `text/plain` (fallback path: `navigator.sendBeacon` during page unload)

In both cases the body is the same JSON — so **parse the raw request body as JSON regardless of Content-Type**; do not rely on framework content-type-gated JSON parsing. In FastAPI: take `request: Request`, do `json.loads(await request.body())`, not a typed Pydantic body param (that would 415/422 on text/plain).

**Why text/plain:** `sendBeacon` cannot set headers, and an `application/json` Blob triggers a CORS preflight that browsers may drop during unload. So the unload-time beacon sends `text/plain` with the api key inside the body.

**Response:**
- `204 No Content` on success (200 also fine)
- `401` on bad/missing key
- **Never reject on schema oddities** — missing fields, unknown event types, extra keys: log-and-accept. Losing study data is worse than storing dirty data. Wrap parsing in try/except; if the body isn't even valid JSON, store the raw text with an error marker and still return 204.

## Request body (one "batch")

Each POST is one batch: session metadata + an array of events.

```json
{
  "sessionId": "3f9c2a1e-8d4b-4e2a-9c1f-...",
  "pid": "5f8a9b3c2d1e",
  "domain": "lung",
  "mode": "test",
  "sampleId": "icbhi_222_1b1_Pr_sc_Meditron_11",
  "xaiType": "similes",
  "clientTime": "2026-07-06T10:32:16.001Z",
  "apiKey": "<present ONLY in the sendBeacon fallback — strip before storing>",
  "events": [
    { "seq": 1, "t": "2026-07-06T10:32:11.480Z", "tMs": 12,    "type": "session_start",
      "payload": { "url": "...", "referrer": "https://...qualtrics.com/...", "screen": {"w":1920,"h":1080}, "viewport": {"w":980,"h":900}, "userAgent": "...", "pos": "3" } },
    { "seq": 2, "t": "...", "tMs": 3411,  "type": "audio_play",
      "payload": { "audioId": "original", "currentTime": 0, "duration": 5.6, "playCount": 1 } },
    { "seq": 3, "t": "...", "tMs": 9020,  "type": "audio_ended",
      "payload": { "audioId": "original", "currentTime": 5.6, "duration": 5.6 } },
    { "seq": 4, "t": "...", "tMs": 15300, "type": "click",
      "payload": { "logId": "cheatsheet-open" } },
    { "seq": 5, "t": "...", "tMs": 20100, "type": "scroll_depth",
      "payload": { "maxPct": 80 } },
    { "seq": 6, "t": "...", "tMs": 41000, "type": "session_end",
      "payload": { "dwellMs": 41000, "playCounts": { "original": 2, "s59-icbhi_222_1b1_Pr_sc_Meditron_11": 1 } } }
  ]
}
```

Field semantics:

| Field | Meaning |
|---|---|
| `sessionId` | Random UUID per iframe mount (= per Qualtrics question view). Unique per (participant × item view). |
| `pid` | Participant id (Prolific PID / Qualtrics ResponseID), or `"unknown"`. Opaque string. |
| `domain` | Study domain, currently `"lung"` or `"bird"`. More domains later. |
| `mode` | `"test"` or `"post"` — both are one sample's explanation, drawn from the main (`testing.csv`) and post-test (`post-test.csv`) splits respectively. **These two are the analysis-relevant modes.** Also possible but not analysed: `"guide"` (practice/overview page, `sampleId` = `"none"`) and `"tutorial"` (static guided tour over a real sample). The old `"train"` mode is retired — its samples now surface on the guide page. |
| `sampleId` | Dataset sample id; `"none"` in guide mode. Opaque string — currently `icbhi_*` / `hflung_*` / `sprsound_*` / `fraiwan_*` (lung) and `bird_*` (bird), served from the `public/data_v1` bundle. The sample set will move to later bundles with new ids — **do not validate or enumerate sample ids server-side.** |
| `xaiType` | Explanation UI condition. Currently one of `"similes"`, `"similes_dualview_approx"`, `"onomatopoeia"`, `"onomatopoeia_dualview_approx"`, `"rexnet"`, `"examples"`, `"noxai"`. Note: activation-view variants (`"similes_actv"`, `"similes_dualview_actv"`, `"onomatopoeia_actv"`, `"onomatopoeia_dualview_actv"`) are still routable but are no longer part of the study design — expect them only from dev/exploratory sessions. More variants later — **accept any string.** |
| `clientTime` | Wall-clock time the batch was sent. |
| `events[].seq` | 1-based counter within the session. `(sessionId, seq)` is the dedupe key — the client re-sends a failed batch once, so duplicates are possible. |
| `events[].t` | Wall-clock ISO timestamp of the event. |
| `events[].tMs` | Milliseconds since the study page mounted. |
| `events[].type` | One of: `session_start`, `session_end`, `audio_play`, `audio_pause`, `audio_ended`, `audio_seeked`, `click`, `scroll_depth`, `visibility`, `iframe_focus`, `iframe_blur`, `custom_simile_request`, `custom_simile_result`, `lookup_error`. Unknown types must still be accepted. |
| `events[].payload` | Free-form object, may be absent. May contain `"__requeued": true` on retried batches — ignore. |

Batch sizes are small: the client flushes every 5 s or at 20 events, whichever first, plus a final flush on unload. Expect bodies of a few KB.

Not every session contains every event type: the `noxai` control condition logs minimally (only `session_start`/`session_end`, `audio_*`, `visibility`, `iframe_focus`/`iframe_blur` — no `click` or `scroll_depth`). Don't treat missing event types as an error.

## Storage

Lowest-risk approach (recommended): **append-only JSONL**.

- One line per received batch: the batch object plus server-added fields `receivedAt` (ISO, server clock) and optionally the client IP.
- Strip the `apiKey` field from the body before writing.
- File per day: `logs/study/YYYY-MM-DD.jsonl`. Create the directory if missing.
- Append with a lock or single-writer discipline sufficient for the server's concurrency model (a `threading.Lock` around the append is fine for FastAPI with default workers; if running multiple processes, use one file per worker or an O_APPEND single-write of the full line, which is atomic enough for lines < 4 KB on POSIX).
- No database needed. Analysis will load the JSONL into pandas; dedupe there on `(sessionId, seq)`.

## CORS (critical — the frontend is on a different origin)

The SPA is served from GitHub Pages (origin `https://lycheesodaa.github.io`). The existing CORS middleware already allows this origin for `/generate-from-simile` — extend it (or confirm it covers) the new route:

- Allowed origin: the GitHub Pages origin (plus `http://localhost:5173` for local dev testing).
- Allowed methods: `POST`, `OPTIONS`.
- Allowed headers: `Content-Type`, `X-API-Key`.
- The preflight (`OPTIONS /log`) must succeed **without** the API key — browsers send preflights without custom headers, so do not put the auth check in middleware that runs on OPTIONS.

## Acceptance tests

```bash
# 1. Normal path — JSON + header auth → 204
curl -i -X POST "$SERVER_URL/log" \
  -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" \
  -d '{"sessionId":"test-1","pid":"curl","domain":"lung","mode":"test","sampleId":"x","xaiType":"similes","clientTime":"2026-07-06T00:00:00Z","events":[{"seq":1,"t":"2026-07-06T00:00:00Z","tMs":1,"type":"session_start","payload":{}}]}'

# 2. Beacon path — text/plain + apiKey in body → 204
curl -i -X POST "$SERVER_URL/log" \
  -H "Content-Type: text/plain" \
  -d '{"sessionId":"test-2","apiKey":"'$API_KEY'","pid":"curl","domain":"lung","mode":"test","sampleId":"x","xaiType":"similes","clientTime":"2026-07-06T00:00:00Z","events":[]}'

# 3. No key anywhere → 401
curl -i -X POST "$SERVER_URL/log" -H "Content-Type: application/json" -d '{"sessionId":"test-3","events":[]}'

# 4. Malformed body WITH valid key → still 204 (stored with error marker)
curl -i -X POST "$SERVER_URL/log" -H "Content-Type: text/plain" -H "X-API-Key: $API_KEY" -d 'not json{{{'

# 5. CORS preflight → 2xx with correct Access-Control-Allow-* headers, no auth required
curl -i -X OPTIONS "$SERVER_URL/log" \
  -H "Origin: https://lycheesodaa.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, x-api-key"
```

After each 204, confirm a new line appended to today's JSONL with `receivedAt` set and no `apiKey` field.

## Frontend reference (do not modify — for understanding only)

Client transport lives in the UI repo at `src/app/study/logger.ts`:
- Primary: `fetch(url, { method:'POST', keepalive:true, headers:{'Content-Type':'application/json','X-API-Key':...}, body })`
- Unload fallback: `navigator.sendBeacon(url, new Blob([body], { type:'text/plain' }))` with `apiKey` in the body
- Failed batches are retried once with `"__requeued": true` injected into event payloads → server may receive duplicates; dedupe key is `(sessionId, seq)`.
