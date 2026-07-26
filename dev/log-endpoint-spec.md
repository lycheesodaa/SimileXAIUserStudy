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
- `413` if over the size caps (see "Hard caps")
- **Never reject on schema oddities** — missing fields, unknown event types, extra keys: log-and-accept. Losing study data is worse than storing dirty data. Wrap parsing in try/except; if the body isn't even valid JSON, or if the ids fail the filename check, quarantine it (see "Quarantine") and still return `204`.

## Request body (one "batch")

Each POST is one batch: session metadata + an array of events.

```json
{
  "sessionId": "3f9c2a1e-8d4b-4e2a-9c1f-...",
  "responseId": "R_1a2B3c4D5e6F7g8",
  "userId": "pilot-07",
  "prolificPid": "5f8a9b3c2d1e0a4b6c8d9e2f",
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
| `sessionId` | Random UUID per iframe mount (= per Qualtrics question view). Unique per (participant × item view). Names the log file together with `responseId`. |
| `responseId` | Qualtrics `ResponseID` (`R_...`), or `"unknown"` if the survey didn't pass it. **The join key against the Qualtrics export**, and the only participant id guaranteed present in every deployment phase. Names the log file. Opaque string — do not parse. |
| `userId` | Optional. Manually assigned pilot label. Absent once the study moves to Prolific. Logged, never keyed on. |
| `prolificPid` | Optional. Prolific participant id — stable *across* studies, so it is the most identifying field in the payload; treat the log directory accordingly. Absent during the manual pilot. Logged, never keyed on. |
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

## Storage: append-only JSONL, one file per mount

```
DATA_DIR / f"{response_id}_{session_id}.jsonl"
```

Opened in `"a"` mode, **one JSON object per event** (not per batch), then `f.flush()` and `os.fsync()`. Do the write via `asyncio.to_thread` (or `aiofiles`) so the event loop stays unblocked.

**Never a single shared JSON array file.** Read-parse-append-rewrite is not atomic; concurrent requests silently drop events or truncate the file.

### Explode the batch into rows

The client sends one envelope containing N events. Storage wants N flat rows, with the session metadata denormalized onto each. Field mapping:

| Stored field | Source |
|---|---|
| `event_id` | *(none — see note below)* |
| `seq` | `events[].seq` |
| `response_id` | `responseId` |
| `user_id` / `prolific_pid` | `userId` / `prolificPid` (omit if absent) |
| `session_id` | `sessionId` |
| `condition` | `xaiType` |
| `domain`, `mode`, `sample_id` | `domain`, `mode`, `sampleId` |
| `event_type` | `events[].type` |
| `payload` | `events[].payload` (free-form; new fields must not require a migration mid-pilot) |
| `client_ts` | `events[].t` — browser clock, only valid for reaction-time *deltas*. Participant clocks are wrong. |
| `t_ms` | `events[].tMs` — ms since page mount; prefer this over `client_ts` deltas |
| `server_ts` | Stamped server-side per event at receipt. **Authoritative for ordering.** |
| `batch_client_ts` | `clientTime` (when the batch was sent, not when the event happened) |

**On `event_id`:** the client does not generate a per-event UUID. It sends a 1-based `seq` per session, so the dedupe key is **`(session_id, seq)`** — which is strictly better than a UUID here, because it also reveals *gaps* (a batch lost entirely) rather than just duplicates. Dedupe in pandas on `(session_id, seq)`, keeping the first `server_ts`. Duplicates are expected: the client retries a failed batch once.

- Strip `apiKey` from the body before writing anything.
- Optionally add the client IP. `__requeued: true` inside a payload marks a retried event — keep it as a retry marker or strip it, but don't treat it as an error.
- Create `DATA_DIR` if missing. No database needed.

### Sanitize the ids before they touch a filename

`responseId` and `sessionId` arrive over HTTP as user-controlled input (they come from URL query params). Both must match:

```
^[A-Za-z0-9_-]{1,64}$
```

Anything else is a path-traversal risk. Qualtrics `ResponseID` (`R_1a2B3c4D5e6F7g8`), the client's UUID `sessionId`, and the `"unknown"` fallback all pass. A failure here goes to quarantine — **do not** build the path first and validate after.

### Quarantine

Sanitization must not become a way to lose data, which would contradict the log-and-accept rule above. So nothing is ever rejected on content:

- Body isn't valid JSON, **or** `responseId`/`sessionId` fail the regex → append the **raw request body** plus `{"_error": "<reason>", "server_ts": ..., "client_ip": ...}` to `DATA_DIR / "_invalid.jsonl"`.
- Still return `204`.
- The filename `_invalid.jsonl` is a server constant, so no untrusted input reaches the filesystem on this path.
- Check this file during the daily health check; a non-empty `_invalid.jsonl` means a survey link is malformed, and it's recoverable by hand.

### File count — expected, not a bug

`sessionId` is per iframe **mount** = per Qualtrics question view, **not** per participant. A participant who sees ~20 items produces ~20 files; a few hundred participants means low thousands of small files. This is intentional: separate files per mount means concurrent requests never contend for the same file, so no lock is needed at all. Merging per participant happens manually afterwards (`glob` + concat on `response_id`), not on the write path.

## Hard caps

The shared secret is visible in client-side JS, so it is friction, not security. These caps are the real protection:

- **Max `Content-Length`**: 1 MB. Real batches are a few KB; the client's buffer is capped at 500 events.
- **Max events per batch**: 1000 (client flushes at 20, hard-caps its buffer at 500).
- **Per-IP rate limit**: generous enough for legitimate use — every participant flushes every ~5 s, and a whole lab may share one NAT'd IP. Something like 120 requests/min/IP.
- Over the cap → `413`. This is the one case where dropping data is correct.

## CORS (critical — the frontend is on a different origin)

The SPA is served from GitHub Pages (origin `https://lycheesodaa.github.io`). The existing CORS middleware already allows this origin for `/generate-from-simile` — extend it (or confirm it covers) the new route:

- Allowed origin: the GitHub Pages origin (plus `http://localhost:5173` for local dev testing).
- Allowed methods: `POST`, `OPTIONS`.
- Allowed headers: `Content-Type`, `X-API-Key`.
- The preflight (`OPTIONS /log`) must succeed **without** the API key — browsers send preflights without custom headers, so do not put the auth check in middleware that runs on OPTIONS.

## Acceptance tests

```bash
# 1. Normal path — JSON + header auth → 204, 2 rows in R_test1_sess-1.jsonl
curl -i -X POST "$SERVER_URL/log" \
  -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" \
  -d '{"sessionId":"sess-1","responseId":"R_test1","userId":"curl","domain":"lung","mode":"test","sampleId":"x","xaiType":"similes","clientTime":"2026-07-06T00:00:00Z","events":[{"seq":1,"t":"2026-07-06T00:00:00Z","tMs":1,"type":"session_start","payload":{}},{"seq":2,"t":"2026-07-06T00:00:01Z","tMs":900,"type":"audio_play","payload":{"audioId":"original"}}]}'

# 2. Beacon path — text/plain + apiKey in body → 204
curl -i -X POST "$SERVER_URL/log" \
  -H "Content-Type: text/plain" \
  -d '{"sessionId":"sess-2","apiKey":"'$API_KEY'","responseId":"R_test2","domain":"lung","mode":"post","sampleId":"x","xaiType":"similes","clientTime":"2026-07-06T00:00:00Z","events":[]}'

# 3. No key anywhere → 401
curl -i -X POST "$SERVER_URL/log" -H "Content-Type: application/json" -d '{"sessionId":"sess-3","events":[]}'

# 4. Malformed body WITH valid key → still 204, one row in _invalid.jsonl
curl -i -X POST "$SERVER_URL/log" -H "Content-Type: text/plain" -H "X-API-Key: $API_KEY" -d 'not json{{{'

# 5. Path traversal in responseId → still 204, quarantined, NO file written outside DATA_DIR
curl -i -X POST "$SERVER_URL/log" \
  -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" \
  -d '{"sessionId":"sess-5","responseId":"../../etc/passwd","domain":"lung","mode":"test","sampleId":"x","xaiType":"similes","clientTime":"2026-07-06T00:00:00Z","events":[{"seq":1,"t":"2026-07-06T00:00:00Z","tMs":1,"type":"session_start"}]}'

# 6. Duplicate batch (simulates the client's retry) → 204; two rows share
#    (session_id, seq) and collapse to one on dedupe. Re-run test 1 verbatim.

# 7. Oversized batch → 413
python3 -c 'import json;print(json.dumps({"sessionId":"sess-7","responseId":"R_test7","domain":"lung","mode":"test","sampleId":"x","xaiType":"similes","clientTime":"2026-07-06T00:00:00Z","events":[{"seq":i,"t":"2026-07-06T00:00:00Z","tMs":i,"type":"click","payload":{"logId":"x"*200}} for i in range(5000)]}))' \
  | curl -i -X POST "$SERVER_URL/log" -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" --data-binary @-

# 8. CORS preflight → 2xx with correct Access-Control-Allow-* headers, no auth required
curl -i -X OPTIONS "$SERVER_URL/log" \
  -H "Origin: https://lycheesodaa.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, x-api-key"
```

After each 204, confirm: one line **per event** appended to `{response_id}_{session_id}.jsonl`, each with `server_ts` set, `condition`/`response_id` denormalized onto it, and no `apiKey` field anywhere.

## Deployment & ops

The server is a single uvicorn process on a university machine, exposed via a Cloudflare **named** tunnel (stable hostname — not a `trycloudflare.com` quick tunnel). Scale is a few hundred participants total, ~20–50 concurrent: no load balancer, no queue, no Postgres. (If a local GPU model is ever served from the same app, *that* needs a real request queue — out of scope here.)

- `async def` handlers throughout; `httpx.AsyncClient` for any outbound call, never sync `def` + `requests`. One blocking write on the event loop stalls every concurrent participant.
- Run uvicorn and `cloudflared` as systemd services with `Restart=always` **and** `systemctl enable` — lab machines reboot for patches unannounced, and a study that silently stops logging looks like a study with no data.
- Keep `DATA_DIR` off scratch space subject to a cleanup policy. Verify this before piloting, not after.
- Nightly cron: rsync `DATA_DIR` to institutional storage.
- Daily health check: count today's events and alert if zero; also alert if `_invalid.jsonl` grew.
- Ship a small read-only loader that globs the JSONL into pandas/SQLite for inspection during piloting, deduping on `(session_id, seq)`. The JSONL files remain the source of truth — corrections are new rows, never edits.
- If any endpoint proxies to a third-party LLM API (e.g. `/generate-from-simile`): hard `max_tokens` cap, and keep responses under the ~100 s Cloudflare tunnel timeout (error 524) — stream if needed.

## Frontend reference (do not modify — for understanding only)

Client transport lives in the UI repo at `src/app/study/logger.ts`:
- Primary: `fetch(url, { method:'POST', keepalive:true, signal: AbortSignal.timeout(10_000), headers:{'Content-Type':'application/json','X-API-Key':...}, body })`
- Unload fallback: `navigator.sendBeacon(url, new Blob([body], { type:'text/plain' }))` with `apiKey` in the body. Fired on `visibilitychange`→`hidden` and on `pagehide` — deliberately **not** `beforeunload`, which is unreliable on mobile.
- Failed batches are retried once with `"__requeued": true` injected into event payloads → server may receive duplicates; dedupe key is `(sessionId, seq)`.
- Identity comes from URL query params set by Qualtrics, read in `src/app/study/StudyView.tsx`:
  `?rid=${e://Field/ResponseID}&uid=${e://Field/user_id}&ppid=${e://Field/PROLIFIC_PID}&xai=<condition>&pos=<loop position>`
  (`rid` also accepted as `pid` for links fielded before the rename). No cookies or localStorage — the iframe is third-party context, where Safari ITP and Chrome storage partitioning break both silently.
