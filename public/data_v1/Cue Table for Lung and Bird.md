# Audio Cue Reference Tables — Lung & Bird

Per-class acoustic-cue rankings for the two **currently active** domains, **Lung Auscultation** and **Bird Sounds**. Regenerated 2026-07-10.

## How these rankings are derived

- **Model-independent.** Each cue is a deterministic DSP measurement on the raw audio (`src/utils/cue_utils.py::extract_heuristic_cues`), so the rankings describe the *data*, not any RExNet checkpoint. They are unaffected by the pending lung retrain.
- **Label-blind.** Cues are extracted with `label=None` (domain-default DSP params) so every class is measured with the *same ruler* — a fair cross-class comparison. Per-class DSP configs in `DOMAIN_DSP_CONFIG` are deliberately **not** used here (they would leak the label and make cues incomparable across classes).
- **Class means, n≤120/class (seed 42).** Ranking is by class-mean cue value, low → high. With ~120 samples the *mean* of each class is estimated precisely even though individual recordings overlap heavily.
- **Separator = effect size** (Cohen's *d* = gap between adjacent class means ÷ pooled within-class SD): `≪` strong (*d* ≥ 0.5), `&lt;` moderate (0.2 ≤ *d* &lt; 0.5), `~` negligible (*d* &lt; 0.2 — order is real but the classes overlap almost entirely on this cue).

> **Read `~` as "essentially tied."** These DSP cues have large natural within-class variance, so most single-recording comparisons will look similar. The per-sample XAI reports (`evaluate_rexnet_xai.py`) show stronger LOWER/HIGHER splits precisely because they compare two individual clips, which vary far more than class means.


---

## 🫁 Lung Auscultation

Classes: **Crackle · Normal · Wheeze · Rhonchi · Stridor**

| Acoustic Cue | Model Metric | Description | Class Ranking (low → high) |
| :--- | :--- | :--- | :--- |
| **Loudness / Intensity** | `energy_level` | Overall volume/strength of the breath sounds. | Normal &lt; Crackle &lt; Wheeze ~ Rhonchi ~ Stridor |
| **Pitch / Brightness (high vs low)** | `spectral_centroid_hi` | Brightness centre of the adventitious sound, measured above the breath fundamental. | Normal &lt; Stridor ~ Wheeze ~ Crackle &lt; Rhonchi |
| **Spectral Width (broad vs narrow/tonal)** | `spectral_bandwidth` | How spread-out the energy is across frequencies (broad/noisy vs narrow/tonal). | Stridor &lt; Rhonchi ~ Wheeze &lt; Crackle &lt; Normal |
| **High-Frequency Shrillness** | `hf_content` | Fraction of energy sitting in the high band (shrill vs low rumble). | Normal &lt; Stridor &lt; Crackle ~ Wheeze ~ Rhonchi |
| **Crackle Spikiness (popping)** | `crest_factor` | How impulsive/spiky the peaks are vs the background breath. | Stridor ~ Rhonchi ~ Wheeze &lt; Crackle ~ Normal |
| **Crackle / Event Density** | `event_rate` | Number of discrete sound events per second. | Wheeze ~ Crackle ~ Normal ~ Rhonchi ~ Stridor |


---

## 🐦 Bird Sounds

Classes: **Eastern Towhee · Wood Thrush · Black-capped Chickadee · Tufted Titmouse · Ovenbird**

| Acoustic Cue | Model Metric | Description | Class Ranking (low → high) |
| :--- | :--- | :--- | :--- |
| **Average Song Pitch** | `average_pitch` | Mean fundamental frequency (F0) of the song. | Ovenbird ~ Black-capped Chickadee ~ Tufted Titmouse ~ Wood Thrush ~ Eastern Towhee |
| **High-Pitch Shrillness** | `hf_content` | Fraction of energy in the high band. | Black-capped Chickadee ~ Tufted Titmouse ~ Eastern Towhee ~ Wood Thrush ≪ Ovenbird |
| **Trill Rate / Note Tempo** | `event_rate` | Notes/syllables per second. | Black-capped Chickadee ~ Ovenbird ~ Wood Thrush ~ Eastern Towhee ~ Tufted Titmouse |
| **Gap Ratio / Pause Duration** | `silence_ratio` | Fraction of the clip that is silence between notes. | Black-capped Chickadee ~ Tufted Titmouse ~ Ovenbird ~ Eastern Towhee ~ Wood Thrush |
| **Note Frequency Span** | `spectral_bandwidth` | Frequency spread of the notes (broadband/buzzy vs pure tone). | Ovenbird ≪ Black-capped Chickadee &lt; Wood Thrush ~ Tufted Titmouse ~ Eastern Towhee |
| **Vocal Inflection Speed** | `pitch_modulation_velocity` | How fast pitch changes frame-to-frame (warble speed). | Black-capped Chickadee ~ Wood Thrush ~ Eastern Towhee ~ Tufted Titmouse ~ Ovenbird |


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


### 🐦 Bird Sounds

| Class | average_pitch | hf_content | event_rate | silence_ratio | spectral_bandwidth | pitch_modulation_velocity |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Eastern Towhee | 4.34e+03 | 0.494 | 0.248 | 0.015 | 4.8e+03 | 303 |
| Wood Thrush | 4.22e+03 | 0.536 | 0.237 | 0.0263 | 4.78e+03 | 299 |
| Black-capped Chickadee | 4.01e+03 | 0.459 | 0.203 | 0.00024 | 4.72e+03 | 284 |
| Tufted Titmouse | 4.02e+03 | 0.476 | 0.253 | 0.00756 | 4.79e+03 | 304 |
| Ovenbird | 3.94e+03 | 0.678 | 0.215 | 0.0124 | 4.37e+03 | 329 |
| _pooled SD_ | 1.05e+03 | 0.213 | 0.268 | 0.0893 | 265 | 127 |
