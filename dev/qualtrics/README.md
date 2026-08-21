# Qualtrics auditory-skill screeners

Two drop-in blocks for the participant-intake survey.

| File pair | Instrument | Participant time |
|---|---|---|
| `gold-msi-musical-training.*` | Gold-MSI Musical Training subscale (7 self-report items) | **~35-45 s** |
| `mini-proms-melody.*` | mini-PROMS, Melody subtest only (8 listening trials) | **~3-4 min** (see below) |

Each pair is one Qualtrics **Text / Graphic** question: paste the `.html` into the
Rich Content Editor's `<>` HTML view, and the `.js` into that question's
JavaScript panel.

---

## mini-PROMS timing

Per trial the participant hears standard, standard, comparison:

```
3 x melody (~4 s)            = 12 s
2 x inter-stimulus gap (1.5) =  3 s
response (5-pt confidence)   = ~5 s
                               ----
                             ~ 20 s / trial
```

- 8 trials ≈ **2:40 of trial time**
- plus instructions + audio preload + a practice trial ≈ **+45 s**
- realistic total: **3:00-4:00**, and longer on slow connections

To fit ~2 minutes, drop `TRIALS` to 5 items — but that costs reliability, and a
5-item subtest is a weak individual-difference measure. If your budget is really
under a minute, use the Gold-MSI block alone.

## Setup — mini-PROMS

1. **Get the stimuli.** PROMS / mini-PROMS audio is not redistributable; request
   it from the authors (Zentner & Strauss, University of Innsbruck / the PROMS
   project site). The code here is the delivery harness only — the `TRIALS`
   array ships with placeholder filenames and a made-up answer key that you
   **must** replace with the official trial order and key.
2. Upload the audio to **Library > Files**. Copy each file's URL and paste the
   full URL into the `std` / `cmp` fields, or set `BASE_URL` if your files sit
   under one browsable prefix.
3. In **Survey Flow**, add an Embedded Data element *above* the block with:
   `PROMS_MEL_score`, `PROMS_MEL_max`, `PROMS_MEL_pct`, `PROMS_MEL_raw`,
   `PROMS_MEL_rt`, `PROMS_MEL_secs`.
4. Put the question on a page of its own (Next is hidden and auto-clicked).

### Implementation notes

- Uses **Web Audio** (fetch + `decodeAudioData` + `AudioBufferSourceNode`)
  rather than `<audio>` elements, so the 1.5 s inter-stimulus interval is
  sample-accurate instead of being at the mercy of buffering. All files are
  preloaded before the intro screen appears.
- Mobile autoplay policy is handled by resuming the `AudioContext` inside the
  Start click; every later playback is scheduled on the already-unlocked
  context.
- Each trial plays **once only** — the Play button disables itself and the
  response scale is revealed after the audio ends.
- Scoring follows PROMS: **1** for a confident correct answer, **0.5** for a
  hedged correct answer, **0** for "don't know" or any incorrect answer.
  Max = number of trials.
- `PROMS_MEL_raw` is `trialid:response:score` pipe-joined; response is +2
  (definitely same) to -2 (definitely different).

## Setup — Gold-MSI

1. **Verify the item wording** in `ITEMS` against the official Gold-MSI v1.0
   inventory (Mullensiefen, Gingras, Musil & Stewart, 2014; CC BY-NC-SA,
   free download from the Goldsmiths MSI site). The strings in the file are
   transcribed from memory for convenience and item `MT7` in particular should
   be checked for subscale membership before you field it.
2. Add Embedded Data fields `GMSI_MT_sum`, `GMSI_MT_mean`, `GMSI_MT_raw`,
   `GMSI_MT_secs` above the block in Survey Flow.

Scoring: items 1-7, reverse items recoded `8 - x`, subscale = **sum, range
7-49**. `GMSI_MT_raw` records `itemid:response:scored` so you can re-score
later if a reverse flag turns out to be wrong.

> You can also build this natively as a Qualtrics matrix question with no code
> at all — the only thing the JS buys you is automatic reverse-scoring into
> Embedded Data and per-item response logging. If you would rather score in
> analysis, the native matrix is less to maintain.
