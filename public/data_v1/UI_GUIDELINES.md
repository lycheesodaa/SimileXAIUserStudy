# `data_v1` UI Presentation Guidelines

**Audience:** developers (and AI coding assistants) building the Vue explanation UI on top of this
bundle. This file is the contract for *how the model's decision-making must be surfaced to a user*.
It is prescriptive: follow it so the UI stays faithful to what the models actually computed and does
not over-claim.

This bundle is produced by `scripts/export_frontend_bundle.py`. If a field is not described here,
treat it as advisory metadata, not something to render as a claim about the model.

---

## 0. First principle: show the decision, then let the user interrogate it

Every model in this bundle is an *explainable* classifier. The UI's job is not to display a score;
it is to let a user answer three questions for one audio clip:

1. **What did the model decide?** (predicted label, was it right, how confident)
2. **Why?** (which concepts / prototypes / counterfactuals drove it, and how much)
3. **Can I trust this explanation?** (faithfulness, agreement across models, provenance caveats)

Design each sample view around that progression. Do not lead with a single trust number — lead with
the decision and the evidence, and treat trust metrics as *qualifiers on the evidence*.

---

## 1. Bundle layout (what you fetch)

```
data_v1/
  manifest.json                 # schema version, domains, per-domain model catalog, audio base URLs
  metrics.json                  # global/aggregate model metrics (optional, for a "methods" page)
  samples_annotation.csv        # flat human-annotation sheet (NOT for the UI runtime)
  <domain>/                     # domain in {lung, bird}
    core_samples.json           # index: one row per selected clip (meta + flags). Load this first.
    samples/<sample_id>.json    # the per-clip detail file. Fetch on demand when a clip is opened.
    audio/<file>.wav            # sample + prototype clips (loudness-normalized)
    concepts/<concept_set>.json # concept catalog: name, category, rendered-clip URL
    <resource-dir>/<file>.wav   # rendered concept clips (similes / onomatopoeia)
```

**Load order:** `manifest.json` → domain `core_samples.json` (build the list/grid) → a single
`samples/<id>.json` when the user opens a clip. Never eager-load all sample files.

**Audio URLs** are already absolute when `manifest.audio_base_url` is set; otherwise they are
bundle-relative. Always read the URL from the JSON (`detail.audio`, `proto.prototypes[].audio`,
concept catalog `audio`) — never construct audio paths yourself.

---

## 2. The models, and how each must be presented

The per-clip `models` object contains several keys. `manifest.models[domain]` is the authoritative
catalog. Group them for the user by **family**, not by raw key:

| Family key(s) | What it is | Core UI element |
|---|---|---|
| `lf_cbm_similes_adapted`, `lf_cbm_onomatopoeia_adapted` | Linear concept-bottleneck model. Prediction = sum of `head_weight × activation` over human-readable concepts. | Ranked **concept contribution** list |
| `fused_<set>_<domain>` | Same, but concept activations fuse a text branch (CLAP) and an audio branch (BEATs) at weight `beta`. | Same concept list **+ a dual-branch breakdown** |
| `fused_beta_breakdown_*` | The two z-standardised similarity sides (`clap_z`, `beats_z`) that blend into the fused score. Companion to the fused card. | Side-by-side branch bars (see §5) |
| `fused_attr_breakdown_*` | Approx. CLAP/BEATs split of the *activation the head reads*; `clap_contribution + beats_contribution ≈ contribution`. | Stacked contribution bars |
| `rexnet` | Reflective/counterfactual explainer; ships an inlined markdown report + counterfactual hit stats. | Rendered markdown + CF badge |
| `proto` | Example-based: top-3 nearest **prototype recordings** with similarity/weight/contribution. | Playable prototype cards |

### 2.1 Concept-contribution list (LF-CBM & fused) — the central widget

Each entry in `models.<cbm_key>.concepts`:

```json
{ "concept": "Like the sound of a soft summer wind through pine trees.",
  "category": "Normal", "activation": -1.09, "head_weight": -11.82, "contribution": 12.90 }
```

Rules:

- **Sort by `|contribution|` descending** — the list is already sorted this way; preserve it.
- **`contribution` is the signed driver** of the decision. `contribution = head_weight × activation`.
  Show it as a diverging bar (positive = pushes *toward* the predicted class, negative = *against*).
  This sign is the single most important quantity — do not hide it or show only magnitude.
- **Show the concept text verbatim.** These similes/onomatopoeia are the whole point; do not
  truncate them into a chip without a tooltip/expander showing the full string.
- **`category`** is the concept's ground-truth class association (e.g. `Wheeze`). Use it to color/tag
  concepts, and to let the user see whether the top drivers' categories match the predicted label —
  that visual match *is* the intuition behind faithfulness (§4).
- **Attach the rendered concept audio.** Join `concept` → `concepts/<set>.json` (match on the concept
  string) to get a playable clip URL. Let the user hear "what a wheeze-like flute note sounds like"
  next to their sample. This is a key affordance — a concept the user can *listen to* is far more
  convincing than text.
- This is the **full non-zero list, not top-k.** It can be long; default to showing the top ~8–10 and
  an expander for the rest. Do not silently drop the tail — the long tail of small contributions is
  real model behavior.
- **Do not renormalize contributions into percentages that sum to 100.** Contributions are signed and
  there is also a bias term you don't have; a "% of decision" framing is misleading. Show absolute
  signed magnitudes on a shared axis instead.
- **The card is already scoped to the predicted class.** `concepts` only contains similes whose head
  weight for the *predicted* class is non-zero. Do **not** render any concept that isn't in this list,
  and do **not** compute your own contributions against a different class row (e.g. Normal or the true
  label) — a concept that is strong evidence for *Normal* has no place in a *Crackle* explanation.

> **Bar length/direction = `contribution`, full stop.** The correct value for each evidence bar is the
> `contribution` field, read straight from the JSON. Do not recompute it in the frontend from raw
> activations and a weight matrix — if you do, you risk using the wrong class row and surfacing
> concepts that carry zero weight for the prediction. If your bars show concepts that aren't in
> `models.<key>.concepts`, or numbers that don't equal `contribution`, the panel is on the wrong data.

#### Reconciling the evidence list with the faithfulness score (READ THIS)

These are **two different rankings of two different quantities**, and they will not line up — that is
expected, not a bug:

| | Evidence bars (§2.1) | Faithfulness (§4) |
|---|---|---|
| Quantity | `contribution` = `head_weight × activation` | raw `activation` (concept similarity) |
| Ranked by | `|contribution|` | `activation`, take top 5 |
| Question answered | "what drove *this* decision" | "do the loudest concepts match the true class" |

A worked example (sample `hflung_trunc_2019-05-07-16-03-02-L2_10_3`, true & predicted = **Crackle**,
`faithful = 1.0`): the 5 highest-**activation** concepts are all Crackle similes → 5/5 = 1.0, correct.
But the 5 highest-**contribution** rows are dominated by *Normal* concepts — because Normal similes
carry large head weights, a strongly-negative activation on them produces a large signed contribution.
So the evidence panel *should* be topped by Normal bars even though faithfulness is a perfect 1.0.
**Seeing non-Crackle concepts at the top of the evidence list does NOT contradict `faithful = 1.0`.**
If you want the UI to show *why* faithfulness is high, add a small separate "top-5 most-activated
concepts" strip (sorted by `activation`) — never re-sort the evidence bars by activation.

### 2.2 Fused dual-branch breakdowns

`fused_beta_breakdown_*` and `fused_attr_breakdown_*` are **companions to** the fused card, keyed
separately. Render them as an *expandable detail inside* the fused model's panel, not as their own
top-level models. `beta` = the CLAP (text) weight; `1 - beta` = BEATs (audio) weight; surface both as
"text branch vs audio branch."

- `fused_beta_breakdown_*`: shows *pre-bottleneck similarity* (`clap_z`, `beats_z`, `fused`). Frame as
  "where the concept match came from," not as contribution.
- `fused_attr_breakdown_*`: `clap_contribution` and `beats_contribution` **sum to the plain card's
  `contribution`**, so use it as a *stacked* decomposition of each bar in §2.1. This is the honest one
  for "how much did each branch drive the decision." Note `decomposition: "approx_activation_split"` —
  label it "approximate" in the UI.

### 2.3 Prototypes (`proto`)

`prototypes` is up to 3 nearest training recordings, each with `proto_class`, `similarity`, `weight`,
`contribution`, and a playable `audio` URL. Render as cards the user can **play back-to-back with
their own clip** ("your sound resembles these examples"). Show `proto_class` prominently and
`contribution` as the driver. The prototype is a whole recording, not a localized segment — do not
imply it highlights a moment in time.

### 2.4 RExNet (`rexnet`)

`explanation_md` is a full markdown report — render it with a sanitizing markdown component. Surface
`consensus_label` next to `predicted_label` (agreement/disagreement is meaningful), and show
`cf_hits / cf_total` as a "counterfactual checks passed" badge. `confidence` is a softmax probability
— show as a percentage but see §6 on not over-trusting it.

---

## 3. The sample list / grid (`core_samples.json`)

Each row carries `meta` and `flags`. Use them to make the list *browsable by explanation quality*,
not just alphabetical:

- `meta.band` — signal condition (`clear`, …). Good as a filter.
- `meta.typicality` — how representative the clip is (0–1). Good default sort (typical first).
- `meta.source`, `meta.source_tier` — dataset provenance. **Surface `source` somewhere**: label↔source
  is a known confound in this data (see repo memory), so a demo that hides provenance can mislead.
- `meta.label_mismatch` — the models disagree with the dataset label. Flag these clearly; they are the
  interesting cases, not errors to hide.
- `meta.agreement`, `meta.n_methods` — cross-method agreement (e.g. 15 of 21). Render as
  "15/21 methods agree" — this is a more honest trust signal than any single faithfulness number.
- `flags.*__correct`, `flags.*__faithful` — per-model booleans/scores for building a compact
  at-a-glance matrix in the row.

---

## 4. Faithfulness — compute nothing new, but present it honestly

`faithful` (per CBM card) is the **only** trust metric baked into each model card, and it has a
specific, limited meaning. **Read §4 of the companion note before rendering it.**

- **Definition:** fraction of the model's **top-5 highest-`activation` concepts** (NOT top-5 by
  contribution / evidence) whose fixed `category` matches the clip's **true** label. Range 0–1, but
  **quantized to {0, 0.2, 0.4, 0.6, 0.8, 1.0}** — it is `k/5`. It is *not* a probability or a
  continuous confidence, and it is *not* computed from the evidence bars (see the reconciliation table
  in §2.1). The bundle does not export per-concept activation *rank*, so you cannot reproduce this
  number from the concept card alone — trust the `faithful` field as given.
- **Do NOT render it as a precise percentage** ("53.7% faithful"). Render it as **"N of top-5 concepts
  matched the true class"** (multiply by 5), or as 5 discrete pips. A continuous-looking gauge implies
  a precision the number does not have.
- **Do NOT average it into a headline trust score** shown as a decimal. If you must aggregate, show a
  histogram over the 6 buckets.
- It uses the **true** label, so it measures concept–label *alignment*, not internal consistency; be
  careful with wording ("how well the top concepts line up with the correct class," not "how much you
  can trust the model").
- Cross-method `agreement` (§3) is a better headline trust signal for a lay user; prefer it for the
  top-level "should I trust this" cue and keep `faithful` inside the CBM detail panel.

---

## 5. What to compute on the UI side (allowed / expected)

Keep computation minimal and presentational. Permitted:

- **Rescale `faithful` → integer /5** for display (§4).
- **Split concepts into supporting vs opposing** by `sign(contribution)` for two-column layouts.
- **Cap + "show more"** on long concept lists (preserve order).
- **Join** concept strings to the concept catalog for audio, and to `category` for coloring.
- **Stacked bars** from `fused_attr_breakdown_*` (`clap_contribution` + `beats_contribution`).
- **Per-sample model-agreement matrix** from the `*__correct` flags.

Not permitted (would misrepresent the model):

- Renormalizing contributions to sum to 100% / pie charts of "decision share."
- Inventing a composite "trust score" that blends `faithful`, `confidence`, and `agreement` into one
  opaque number.
- Interpolating `faithful` to look continuous, or relabeling it "accuracy"/"confidence."
- Implying prototypes or concepts localize a *moment* in the audio (they don't).

---

## 6. Cross-cutting honesty rules

- **Always pair a prediction with `correct` and provenance.** A confident wrong prediction on a
  confounded source is exactly what this demo should expose, not smooth over.
- **`confidence` (RExNet/Proto) is a raw softmax value** and these models are often over-confident.
  Show it, but never as the primary trust cue; pair with `correct` and `cf_hits/cf_total`.
- **Missing model keys are expected** — not every clip has every model. Render defensively; a missing
  card means "not available for this clip," not an error.
- **`audio` can be `null`** (unmatched concept clip). Degrade gracefully (disabled play button).
- **Keep concept text and category exactly as given.** They are model outputs, not UI copy.

---

## 7. Suggested per-clip layout (reference, not mandatory)

1. **Header:** true label · each model's predicted label + ✓/✗ · "15/21 methods agree" · source badge.
2. **Player:** the sample clip (`detail.audio`).
3. **Tabs per model family** (CBM / Fused / Prototypes / RExNet):
   - CBM/Fused: diverging concept-contribution bars (§2.1), each row playable; "N/5 top concepts
     matched true class" pip strip; fused adds the branch-split expander (§2.2).
   - Prototypes: 3 playable example cards vs the sample.
   - RExNet: rendered markdown + CF badge + consensus.
4. **Footer / "about this explanation":** provenance caveat (label↔source confound), what faithfulness
   does and doesn't mean, link to `metrics.json` methods page.
