# RexNet Contrastive Audio XAI Report
        
This report presents an example-based, concept-grounded contrastive explanation of the model's classification of the given audio sample.

---

## Classification Overview

* **Target File**: `hflung_steth_20181210_09_01_49_12.wav`
* **True Target Concept**: `Wheeze`
* **Base CNN Prediction**: `Stridor` (Confidence: **59.72%**)
* **RexNet Contrastive Prediction (Consensus)**: `Stridor`
* **Prediction Correctness**: **INCORRECT**

---

## Multi-Contrast Explanations

To fully explain this sound, we compared it against representative **contrast/foil concepts** in the `lung_sounds` domain. 
Below are the detailed side-by-side acoustic cue comparison tables and the model's NNRank ordinal predictions.


### Target vs. Contrast Concept: `Coarse Crackle`

* **Contrast Exemplar Sound**: `sprsound_66232959_4.2_1_p2_4302_1.wav`
* **Contrastive Prediction**: `Stridor` (Confidence: **58.12%**)
* **NNRank Relation Predictor Accuracy**: **5/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Coarse Crackle`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Stridor)</th>
    <th align="center">Original Foil Exemplar (Coarse Crackle)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/wheeze_32992_target.wav" type="audio/wav">
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
        <source src="audio/wheeze_32992_vs_class0_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-36.1529` | `-40.1919` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.3197` | `0.0008` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `1.6000` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.3216` | `Target is SIMILAR` | `Target is LOWER` | **DISAGREE** |
| **Crackle Spikiness** | `22.2583` | `16.1425` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Spectral Width (Fineness)** | `478.2803` | `531.8420` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Fine Crackle`

* **Contrast Exemplar Sound**: `sprsound_65019620_3.4_0_p4_1815_0.wav`
* **Contrastive Prediction**: `Stridor` (Confidence: **77.31%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Fine Crackle`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Stridor)</th>
    <th align="center">Original Foil Exemplar (Fine Crackle)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/wheeze_32992_target.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/sprsound_65019620_3.4_0_p4_1815_0_class1_exemplar.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
    <td align="center">
      <audio controls>
        <source src="audio/wheeze_32992_vs_class1_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-36.1529` | `-54.0524` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.3197` | `0.0006` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `22.2583` | `9.0868` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Spectral Width (Fineness)** | `478.2803` | `777.6409` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Normal`

* **Contrast Exemplar Sound**: `icbhi_216_1b1_Pl_sc_Meditron_8.wav`
* **Contrastive Prediction**: `Stridor` (Confidence: **80.86%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Normal`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Stridor)</th>
    <th align="center">Original Foil Exemplar (Normal)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/wheeze_32992_target.wav" type="audio/wav">
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
        <source src="audio/wheeze_32992_vs_class2_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-36.1529` | `-20.6362` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.3197` | `0.0000` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `22.2583` | `3.5890` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Spectral Width (Fineness)** | `478.2803` | `338.6614` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Rhonchi`

* **Contrast Exemplar Sound**: `sprsound_66315749_1.4_1_p4_5378_0.wav`
* **Contrastive Prediction**: `Stridor` (Confidence: **74.47%**)
* **NNRank Relation Predictor Accuracy**: **5/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Rhonchi`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Stridor)</th>
    <th align="center">Original Foil Exemplar (Rhonchi)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/wheeze_32992_target.wav" type="audio/wav">
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
        <source src="audio/wheeze_32992_vs_class3_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-36.1529` | `-21.6069` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.3197` | `0.0053` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.6000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.4288` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Crackle Spikiness** | `22.2583` | `7.7658` | `Target is SIMILAR` | `Target is HIGHER` | **DISAGREE** |
| **Spectral Width (Fineness)** | `478.2803` | `324.0090` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Wheeze`

* **Contrast Exemplar Sound**: `icbhi_211_1p2_Pl_mc_AKGC417L_0.wav`
* **Contrastive Prediction**: `Stridor` (Confidence: **91.91%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Wheeze`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Stridor)</th>
    <th align="center">Original Foil Exemplar (Wheeze)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/wheeze_32992_target.wav" type="audio/wav">
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
        <source src="audio/wheeze_32992_vs_class5_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-36.1529` | `-4.8853` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.3197` | `0.0037` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0064` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `22.2583` | `1.7128` | `Target is HIGHER` | `Target is HIGHER` | **AGREE** |
| **Spectral Width (Fineness)** | `478.2803` | `775.5483` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***
