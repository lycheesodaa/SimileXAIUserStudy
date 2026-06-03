# RexNet Contrastive Audio XAI Report
        
This report presents an example-based, concept-grounded contrastive explanation of the model's classification of the given audio sample.

---

## Classification Overview

* **Target File**: `sprsound_64743918_7.0_0_p4_2689_0.wav`
* **True Target Concept**: `Fine Crackle`
* **Base CNN Prediction**: `Fine Crackle` (Confidence: **99.35%**)
* **RexNet Contrastive Prediction (Consensus)**: `Fine Crackle`
* **Prediction Correctness**: **CORRECT**

---

## Multi-Contrast Explanations

To fully explain this sound, we compared it against representative **contrast/foil concepts** in the `lung_sounds` domain. 
Below are the detailed side-by-side acoustic cue comparison tables and the model's NNRank ordinal predictions.


### Target vs. Contrast Concept: `Coarse Crackle`

* **Contrast Exemplar Sound**: `sprsound_66232959_4.2_1_p2_4302_1.wav`
* **Contrastive Prediction**: `Fine Crackle` (Confidence: **96.38%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Coarse Crackle`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Fine Crackle)</th>
    <th align="center">Original Foil Exemplar (Coarse Crackle)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_target.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/sprsound_66232959_4.2_1_p2_4302_1_class0_exemplar.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_vs_class0_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-49.9155` | `-40.1919` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0013` | `0.0008` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `1.6000` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.3216` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `31.1577` | `16.1425` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Spectral Width (Fineness)** | `669.6628` | `531.8420` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Normal`

* **Contrast Exemplar Sound**: `icbhi_216_1b1_Pl_sc_Meditron_8.wav`
* **Contrastive Prediction**: `Fine Crackle` (Confidence: **98.66%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Normal`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Fine Crackle)</th>
    <th align="center">Original Foil Exemplar (Normal)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_target.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/icbhi_216_1b1_Pl_sc_Meditron_8_class2_exemplar.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_vs_class2_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-49.9155` | `-20.6362` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0013` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `31.1577` | `3.5890` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Spectral Width (Fineness)** | `669.6628` | `338.6614` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Rhonchi`

* **Contrast Exemplar Sound**: `sprsound_66315749_1.4_1_p4_5378_0.wav`
* **Contrastive Prediction**: `Fine Crackle` (Confidence: **97.62%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Rhonchi`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Fine Crackle)</th>
    <th align="center">Original Foil Exemplar (Rhonchi)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_target.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/sprsound_66315749_1.4_1_p4_5378_0_class3_exemplar.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_vs_class3_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-49.9155` | `-21.6069` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0013` | `0.0053` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.6000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.4288` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Crackle Spikiness** | `31.1577` | `7.7658` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Spectral Width (Fineness)** | `669.6628` | `324.0090` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Stridor`

* **Contrast Exemplar Sound**: `sprsound_64999124_1.5_0_p4_5704_0.wav`
* **Contrastive Prediction**: `Fine Crackle` (Confidence: **96.62%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Stridor`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Fine Crackle)</th>
    <th align="center">Original Foil Exemplar (Stridor)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_target.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/sprsound_64999124_1.5_0_p4_5704_0_class4_exemplar.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_vs_class4_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-49.9155` | `-38.6100` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0013` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `2.0000` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.4432` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Crackle Spikiness** | `31.1577` | `10.2898` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Spectral Width (Fineness)** | `669.6628` | `650.8252` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Wheeze`

* **Contrast Exemplar Sound**: `icbhi_211_1p2_Pl_mc_AKGC417L_0.wav`
* **Contrastive Prediction**: `Fine Crackle` (Confidence: **98.83%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Wheeze`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Fine Crackle)</th>
    <th align="center">Original Foil Exemplar (Wheeze)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_target.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/icbhi_211_1p2_Pl_mc_AKGC417L_0_class5_exemplar.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/fine crackle_9570_vs_class5_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-49.9155` | `-4.8853` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0013` | `0.0037` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0064` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `31.1577` | `1.7128` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Spectral Width (Fineness)** | `669.6628` | `775.5483` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***
