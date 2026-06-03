# RexNet Contrastive Audio XAI Report
        
This report presents an example-based, concept-grounded contrastive explanation of the model's classification of the given audio sample.

---

## Classification Overview

* **Target File**: `hflung_steth_20190423_14_57_09_3.wav`
* **True Target Concept**: `Rhonchi`
* **Base CNN Prediction**: `Rhonchi` (Confidence: **91.05%**)
* **RexNet Contrastive Prediction (Consensus)**: `Rhonchi`
* **Prediction Correctness**: **CORRECT**

---

## Multi-Contrast Explanations

To fully explain this sound, we compared it against representative **contrast/foil concepts** in the `lung_sounds` domain. 
Below are the detailed side-by-side acoustic cue comparison tables and the model's NNRank ordinal predictions.


### Target vs. Contrast Concept: `Coarse Crackle`

* **Contrast Exemplar Sound**: `sprsound_66232959_4.2_1_p2_4302_1.wav`
* **Contrastive Prediction**: `Rhonchi` (Confidence: **82.04%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Coarse Crackle`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Rhonchi)</th>
    <th align="center">Original Foil Exemplar (Coarse Crackle)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/rhonchi_30751_target.wav" type="audio/wav">
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
        <source src="audio/rhonchi_30751_vs_class0_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-33.9639` | `-40.1919` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0286` | `0.0008` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `1.6000` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.3216` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `11.4261` | `16.1425` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Spectral Width (Fineness)** | `446.9532` | `531.8420` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Fine Crackle`

* **Contrast Exemplar Sound**: `sprsound_65019620_3.4_0_p4_1815_0.wav`
* **Contrastive Prediction**: `Rhonchi` (Confidence: **82.60%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Fine Crackle`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Rhonchi)</th>
    <th align="center">Original Foil Exemplar (Fine Crackle)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/rhonchi_30751_target.wav" type="audio/wav">
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
        <source src="audio/rhonchi_30751_vs_class1_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-33.9639` | `-54.0524` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0286` | `0.0006` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `11.4261` | `9.0868` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Spectral Width (Fineness)** | `446.9532` | `777.6409` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Normal`

* **Contrast Exemplar Sound**: `icbhi_216_1b1_Pl_sc_Meditron_8.wav`
* **Contrastive Prediction**: `Rhonchi` (Confidence: **82.16%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Normal`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Rhonchi)</th>
    <th align="center">Original Foil Exemplar (Normal)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/rhonchi_30751_target.wav" type="audio/wav">
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
        <source src="audio/rhonchi_30751_vs_class2_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-33.9639` | `-20.6362` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0286` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `11.4261` | `3.5890` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Spectral Width (Fineness)** | `446.9532` | `338.6614` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Stridor`

* **Contrast Exemplar Sound**: `sprsound_64999124_1.5_0_p4_5704_0.wav`
* **Contrastive Prediction**: `Rhonchi` (Confidence: **80.15%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Stridor`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Rhonchi)</th>
    <th align="center">Original Foil Exemplar (Stridor)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/rhonchi_30751_target.wav" type="audio/wav">
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
        <source src="audio/rhonchi_30751_vs_class4_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-33.9639` | `-38.6100` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0286` | `0.0000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `2.0000` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.4432` | `Target is LOWER` | `Target is LOWER` | **AGREE** |
| **Crackle Spikiness** | `11.4261` | `10.2898` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Spectral Width (Fineness)** | `446.9532` | `650.8252` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***

### Target vs. Contrast Concept: `Wheeze`

* **Contrast Exemplar Sound**: `icbhi_211_1p2_Pl_mc_AKGC417L_0.wav`
* **Contrastive Prediction**: `Rhonchi` (Confidence: **73.41%**)
* **NNRank Relation Predictor Accuracy**: **6/6 Cues Correct**

#### Side-by-Side Audio Comparison (Full Context)
Listen to the target sample against the representative grounded exemplar of class `Wheeze`:

<table>
  <tr>
    <th align="center">Target Sound Sample (Rhonchi)</th>
    <th align="center">Original Foil Exemplar (Wheeze)</th>
    <th align="center">Generated Foil Contrast</th>
  </tr>
  <tr>
    <td align="center">
      <audio controls>
        <source src="audio/rhonchi_30751_target.wav" type="audio/wav">
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
        <source src="audio/rhonchi_30751_vs_class5_contrast.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </td>
  </tr>
</table>

#### Acoustic Concept Cue Relation Predictions
The model predicts the ordinal relationship of 6 DSP heuristic concepts between the target and foil.

| Concept Cue | Target Value | Foil Value | Heuristic Relation | Model predicted relation | Match |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Loudness / Intensity** | `-33.9639` | `-4.8853` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **High-Frequency Sharpness** | `0.0286` | `0.0037` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Breath / Crackle Frequency** | `0.2000` | `0.2000` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Pause Ratio** | `0.0000` | `0.0064` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Crackle Spikiness** | `11.4261` | `1.7128` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |
| **Spectral Width (Fineness)** | `446.9532` | `775.5483` | `Target is SIMILAR` | `Target is SIMILAR` | **AGREE** |

***
