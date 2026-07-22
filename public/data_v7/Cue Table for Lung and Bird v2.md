# Audio Cue Reference Tables — Lung & Bird **v2** (data_v7)

Per-class acoustic-cue rankings for the two currently active domains. Supersedes [[Cue Table for Lung and Bird]] for the **`bird_sounds_v2`** dataset (2.0 s window, **Ovenbird replaced by Blue Jay**, 0.2 s min-call floor). Lung is unchanged from the 2026-07-10 regeneration and is reproduced here so this file stands alone. Bird cue set re-screened and regenerated 2026-07-22 on `data/processed/BirdSoundsDataset_v2`.

> [!info] **The bird cue set was re-screened for v2 (2026-07-22).**
> The v1 six cues were implicitly fitted to **Ovenbird**, which supplied ~79 % of their
> separability; with Blue Jay in its place their mean η² collapsed 0.106 → 0.033. A 23-cue
> screen over the v2 corpus replaced them with the top six by η² **measured on the padded
> 2.0 s window that training and inference actually use**. Mean η² recovers to **0.054**, and
> four cues now show real (`&lt;`) class splits instead of one. RExNet v2 was retrained on the
> new set. See [§ Why this set](#why-this-set) for the derivation, including the two cues that
> looked strong on the call span but were rejected for not surviving padding.

## How these rankings are derived

- **Model-independent.** Each cue is a deterministic DSP measurement on the raw audio (`src/utils/cue_utils.py::extract_heuristic_cues`), so the rankings describe the *data*, not any RExNet checkpoint.
- **Label-blind.** Cues are extracted with `label=None` (domain-default DSP params) so every class is measured with the *same ruler*. Per-class configs in `DOMAIN_DSP_CONFIG` are deliberately **not** used (they would leak the label). For bird these are now explicitly `{}`.
- **Class means, n≤120/class (seed 42).** Ranking is by class-mean cue value, low → high.
- **Separator = effect size** (Cohen's *d* = gap between adjacent class means ÷ pooled within-class SD): `≪` strong (*d* ≥ 0.5), `&lt;` moderate (0.2 ≤ *d* &lt; 0.5), `~` negligible (*d* &lt; 0.2 — the classes overlap almost entirely on this cue).
- **η²** (ANOVA effect size) measures how much of a cue's total variance is explained by class identity — the single best summary of whether a cue is worth showing.

> **Read `~` as "essentially tied."** These DSP cues have large natural within-class variance. The per-sample XAI reports (`evaluate_rexnet_xai.py`) show stronger LOWER/HIGHER splits because they compare two individual clips, which vary far more than class means.

---

## 🫁 Lung Auscultation

Classes: **Crackle · Normal · Wheeze · Rhonchi · Stridor** — *unchanged from v1.*

| Acoustic Cue | Model Metric | Description | Class Ranking (low → high) |
| :--- | :--- | :--- | :--- |
| **Loudness / Intensity** | `energy_level` | Overall volume/strength of the breath sounds. | Normal &lt; Crackle &lt; Wheeze ~ Rhonchi ~ Stridor |
| **Pitch / Brightness (high vs low)** | `spectral_centroid_hi` | Brightness centre of the adventitious sound, measured above the breath fundamental. | Normal &lt; Stridor ~ Wheeze ~ Crackle &lt; Rhonchi |
| **Spectral Width (broad vs narrow/tonal)** | `spectral_bandwidth` | How spread-out the energy is across frequencies. | Stridor &lt; Rhonchi ~ Wheeze &lt; Crackle &lt; Normal |
| **High-Frequency Shrillness** | `hf_content` | Fraction of energy sitting in the high band. | Normal &lt; Stridor &lt; Crackle ~ Wheeze ~ Rhonchi |
| **Crackle Spikiness (popping)** | `crest_factor` | How impulsive/spiky the peaks are vs the background breath. | Stridor ~ Rhonchi ~ Wheeze &lt; Crackle ~ Normal |
| **Crackle / Event Density** | `event_rate` | Number of discrete sound events per second. | Wheeze ~ Crackle ~ Normal ~ Rhonchi ~ Stridor |

---

## 🐦 Bird Sounds v2

Classes: **Eastern Towhee · Wood Thrush · Black-capped Chickadee · Tufted Titmouse · Blue Jay**

Cue set re-screened 2026-07-22. Rows ordered by η² on the **padded 2.0 s window** — the window training and inference actually measure (`η² pad`). `η² gate` is the same cue restricted to the annotated call span, shown for contrast.

| Acoustic Cue | Model Metric | Description | Class Ranking (low → high) | η² pad | η² gate |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **Song Brightness (high vs low)** | `spectral_centroid_hi` | Energy centre above 300 Hz — how bright/piercing the song sits. | Wood Thrush &lt; Tufted Titmouse ~ Black-capped Chickadee &lt; Eastern Towhee &lt; Blue Jay | **0.110** | 0.080 |
| **Pure whistle vs buzzy/broadband** | `tonality` | Spectral flatness — low = pure tone/whistle, high = broadband/buzzy. | Black-capped Chickadee ~ Wood Thrush ~ Tufted Titmouse &lt; Eastern Towhee &lt; Blue Jay | **0.072** | 0.066 |
| **Loudness / Carrying Power** | `energy_level` | Overall RMS level of the clip in dB. | Blue Jay &lt; Eastern Towhee ~ Tufted Titmouse ~ Wood Thrush ~ Black-capped Chickadee | 0.046 | 0.055 |
| **High-Pitch Shrillness** | `hf_content` | Fraction of energy above 2 kHz. | Black-capped Chickadee ~ Tufted Titmouse ~ Eastern Towhee ~ Wood Thrush ~ Blue Jay | 0.044 | 0.029 |
| **Pitch Sweep (frequency glide)** | `fm_extent` | 10–90th-percentile sweep range of the dominant-frequency contour. | Wood Thrush ~ Tufted Titmouse &lt; Eastern Towhee ~ Blue Jay ~ Black-capped Chickadee | 0.032 | 0.043 |
| **Song Pitch (high vs low)** | `peak_frequency` | Dominant (peak) frequency, tracked over the 0.6–12 kHz band. | Tufted Titmouse ~ Wood Thrush ~ Eastern Towhee ~ Black-capped Chickadee ~ Blue Jay | 0.018 | 0.043 |

**Mean η²: 0.054 padded — up from 0.033 for the inherited v1 set on this same corpus.**

Four cues now carry real class structure (a `&lt;` split somewhere in the ranking), against one for the v1 set. `spectral_centroid_hi` is the strongest cue in either bird domain and had previously been registered for **lung only**. `hf_content` survives the Ovenbird loss better on the padded window (0.044) than on the gated one (0.029), which is why it is retained while `spectral_bandwidth` is not.

---

## Why this set

### The v1 set was fitted to Ovenbird

**Short answer: it was, and Ovenbird no longer exists in v2.**

η² per cue, 5-class, measured on each dataset's own window. The **4-shared** column (Eastern Towhee, Wood Thrush, Black-capped Chickadee, Tufted Titmouse) is the control: it is near-identical across v1 and v2, which shows the collapse is caused by the **class swap**, not the 5 s → 2 s window.

| Cue | v1 5-class (Ovenbird) | v2 5-class (Blue Jay) | change | v1 4-shared | v2 4-shared |
| :--- | ---: | ---: | ---: | ---: | ---: |
| `spectral_bandwidth` | **0.275** | 0.024 | **−0.251** | 0.012 | 0.024 |
| `hf_content` | 0.122 | 0.044 | −0.078 | 0.017 | 0.029 |
| `syllable_rate` | 0.101 | 0.008 | −0.093 | 0.016 | 0.004 |
| `fm_extent` | 0.065 | 0.032 | −0.033 | 0.064 | 0.038 |
| `peak_frequency` | 0.042 | 0.018 | −0.024 | 0.013 | 0.011 |
| `tonality` | 0.034 | **0.072** | **+0.038** | 0.013 | 0.032 |
| **mean** | **0.106** | **0.033** | **−0.073** | 0.022 | 0.023 |

### Why

How far the 5th class sits from the mean of the four shared classes, in pooled SDs:

| Cue | Ovenbird (v1) | Blue Jay (v2) |
| :--- | ---: | ---: |
| `spectral_bandwidth` | **−1.51** | +0.14 |
| `hf_content` | **+0.88** | +0.37 |
| `syllable_rate` | **+0.78** | −0.17 |
| `peak_frequency` | +0.45 | +0.25 |
| `tonality` | −0.38 | **+0.58** |
| `fm_extent` | −0.20 | +0.19 |

Ovenbird's loud, narrowband, fast "teacher-teacher-TEACHER" was a **1.5 SD outlier on `spectral_bandwidth`** and ~0.8 SD on `hf_content` and `syllable_rate`. Those three cues were carrying the table almost single-handedly: removing Ovenbird drops the 5-class mean η² by 79 %, and the 4-shared baseline (0.022) shows the four retained species were never well separated by this cue set at all.

Blue Jay is distinctive in a **different direction** — its harsh, rasping, broadband scream makes it the *buzziest* class, which is why `tonality` is the one cue that *improved* (+0.038, now the best cue in the set). But its edge is only +0.58 SD, versus Ovenbird's −1.51 SD, so it cannot replace what was lost.

### The re-screen

23 candidate cues (the whole `extract_heuristic_cues` vocabulary plus `spectral_contrast`, `attack_slope`, `zcr`, and two new trill measures) were scored by η² on the v2 corpus, n=600 (120/class, seed 42), under two extraction conditions: the padded 2.0 s window and a gate to the annotated call span. **The top six by *padded* η² were adopted**, since that is the window `train_rexnet.py` and `evaluate_rexnet_xai.py` both measure.

**Dropped from v1** — `spectral_bandwidth` (η² 0.024, Ovenbird-driven) and `syllable_rate` (0.005, the *worst* of all 23 candidates). `spectral_centroid_hi` and `energy_level` were added.

### Two cues that were selected, then rejected

`event_rate` and `trill_strength` were the #2 and #5 cues on the **gated** call span and were briefly adopted on that basis. They do not survive the move to the production window:

| Cue | η² gated | η² padded |
| :--- | ---: | ---: |
| `event_rate` | 0.078 | **0.004** |
| `trill_strength` | 0.052 | **0.003** |

At a 2.0 s window the median Blue Jay call is ~0.55 s and the others ~1.0 s, so 50–70 % of every clip is centre-padded background and rate/periodicity cues are diluted toward a common value. `event_rate` is additionally quantised (events ÷ 2.0 s → multiples of 0.5): its raw SD over 750 training clips is 0.071 against a reference scale of 0.308, and the threshold optimiser returned a **0.0** similarity band — meaning it could never emit "similar", forcing every comparison to LOWER or HIGHER on what is effectively noise. Both were replaced by the padded-window runners-up, `hf_content` and `fm_extent`. All six adopted cues now optimise to real similarity bands (2.69–3.18).

Both metrics remain implemented in `cue_utils.py` and are worth revisiting **if cue extraction is ever gated to the annotated call span** (`start_time`/`end_time` are already columns in `metadata.csv`). That would be a *measurement-only* change — the served audio stays untouched and fully natural.

### Negative result: fast trills are not measurable on this corpus

Eastern Towhee and Wood Thrush both end in trills far faster than Ovenbird's, so `syllable_rate` was re-implemented at a 4 ms hop (128 vs 512) to resolve them, and a direct modulation-spectrum pair (`trill_rate`, `trill_strength`) was added. The finer hop raised the onset count (6.5 → 9.2 /s) but **did not improve separability at all** (η² 0.006 → 0.005), so it was **reverted** to librosa defaults for backwards compatibility. `trill_rate` also fails (η² 0.018): every class sits at 13–16 Hz dominant modulation, with a `fast20` energy ratio of 0.35–0.38 and a modulation centroid of 18.7–19.5 Hz — statistically indistinguishable.

The cause is contamination, not the metric. 87–93 % of clips contain other species (mean 1.8–2.4 of them), and `onset_strength` sums across *all* frequencies, so the envelope being analysed is the **dawn chorus**, not the focal bird. Every class's mixture looks alike. Neither trill measure reached the adopted set.

### Selection metric caveat

The adopted six are the **top six by η²**, which ignores redundancy: `tonality`↔`energy_level` r = 0.84 and `tonality`↔`spectral_centroid_hi` r = 0.66. An uncorrelated greedy selection (|r| &lt; 0.55) reaches a higher joint CV macro-F1 — 0.384 versus 0.327 for a comparable η²-ranked six, and even a lean 3 (`spectral_centroid_hi`, `fm_extent`, `event_rate`) manages 0.373. The η² ranking was chosen deliberately: these cues are shown to users **one at a time**, so per-cue interpretability outranks joint discriminability, and a cue that is individually meaningless is worthless in an explanation regardless of what it contributes to a joint decision boundary.

For scale: all 16 usable cues together reach only CV macro-F1 0.420 (chance 0.20), versus the CNN's 0.895. DSP cues are a *relatable* layer, never a competitive classifier.

Note also that `tonality` and `spectral_flatness` are the same computation (`mean(librosa.feature.spectral_flatness)`); never register both for one domain.

### Remaining hard core

Chickadee / Titmouse / Towhee stay poorly separated: 4-shared η² is 0.023 on the new set, essentially the same 0.022 the v1 set managed. Blue Jay's edge is only +0.63 SD on `spectral_centroid_hi` and +0.58 SD on `tonality`, versus Ovenbird's −1.51 SD on `spectral_bandwidth`. With every separator at `~` or `&lt;` and none at `≪`, class-level statements remain weakly supported; per-*pair* XAI comparisons stay usable, since two individual clips differ far more than two class means.

---

## Appendix — per-class mean cue values

### 🫁 Lung Auscultation

| Class | energy_level | spectral_centroid_hi | spectral_bandwidth | hf_content | crest_factor | event_rate |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Crackle | -34.3 | 546 | 529 | 0.0459 | 12.8 | 0.368 |
| Normal | -38.2 | 422 | 590 | 0.00911 | 14 | 0.432 |
| Wheeze | -32.1 | 526 | 483 | 0.0459 | 11.1 | 0.36 |
| Rhonchi | -31.4 | 581 | 465 | 0.0544 | 10.8 | 0.462 |
| Stridor | -30.7 | 495 | 414 | 0.0273 | 9.94 | 0.488 |
| _pooled SD_ | 9.16 | 164 | 167 | 0.0757 | 6.66 | 0.46 |

### 🐦 Bird Sounds v2  (2.0 s window, n=600, 120/class, adopted cue set)

| Class | spectral_centroid_hi | tonality | energy_level | hf_content | fm_extent | peak_frequency |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Eastern Towhee | 4970 | 0.1308 | −48.44 | 0.5097 | 3486 | 3036 |
| Wood Thrush | 4126 | 0.1116 | −47.23 | 0.5506 | 2700 | 2882 |
| Black-capped Chickadee | 4568 | 0.1065 | −47.01 | 0.4435 | 3580 | 3112 |
| Tufted Titmouse | 4380 | 0.1155 | −47.90 | 0.4813 | 3048 | 2771 |
| Blue Jay | 5222 | 0.1470 | −49.59 | 0.5804 | 3577 | 3272 |
| _pooled SD_ | 1130 | 0.0531 | 4.27 | 0.2279 | 1915 | 1292 |

Blue Jay's distance from the mean of the four shared classes, in pooled SDs: `spectral_centroid_hi` **+0.63**, `tonality` **+0.58**, `energy_level` −0.46, `hf_content` +0.37, `peak_frequency` +0.25, `fm_extent` +0.19.

### 🐦 Bird Sounds v1 — retained for comparison (5.0 s window, with Ovenbird)

| Class | peak_frequency | spectral_bandwidth | hf_content | syllable_rate | fm_extent | tonality |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Eastern Towhee | 3.23e+03 | 4.80e+03 | 0.494 | 6.61 | 3.56e+03 | 0.127 |
| Wood Thrush | 3.13e+03 | 4.78e+03 | 0.536 | 6.55 | 2.88e+03 | 0.111 |
| Black-capped Chickadee | 3.13e+03 | 4.72e+03 | 0.459 | 6.63 | 4.14e+03 | 0.119 |
| Tufted Titmouse | 2.82e+03 | 4.79e+03 | 0.476 | 7.12 | 3.32e+03 | 0.117 |
| Ovenbird | 3.66e+03 | 4.37e+03 | 0.678 | 8.07 | 3.15e+03 | 0.101 |
| _pooled SD_ | 1.30e+03 | 265 | 0.213 | 1.72 | 1.63e+03 | 0.0471 |
