import { ReactNode } from 'react';
import { LUNG_SOUND_DATA_V3, LungSoundV3 } from '../data_v3';
import { LUNG_SOUND_DATA, LungSound } from '../data_v2';
import { SimileExplanationV3 } from '../components/similes/SimileExplanationV3';
import { SimileExplanation } from '../components/similes/SimileExplanation';
import { SimilePractice } from '../components/similes/SimilePractice';
import { CuesExplanation } from '../components/cues/CuesExplanation';
import { CuesPractice } from '../components/cues/CuesPractice';
import { ExampleExplanation } from '../components/examples/ExampleExplanation';
import { ExamplesPractice } from '../components/examples/ExamplesPractice';
import { NoXaiExplanation } from '../components/noxai/NoXaiExplanation';
import { NoXaiPractice } from '../components/noxai/NoXaiPractice';

// A study domain groups the XAI variants (conditions) available for one kind
// of data. Each variant owns its dataset lookup, audio-identity resolution,
// test render and train render, so variants may use different datasets with
// different sample-id schemes. Adding a future condition (e.g. similes_v4)
// means adding one StudyXaiVariant entry to the domain's xaiVariants.
export interface StudyXaiVariant<S = unknown> {
  /** 'minimal' logs only session lifecycle, audio and visibility/focus events
   *  (no click or scroll tracking). Default: 'full'. */
  logging?: 'full' | 'minimal';
  /** Sample ids exposed here end up in Qualtrics URLs — they must be opaque
   *  (no class labels). */
  getSample(sampleId: string): S | undefined;
  /** Resolve which audio a media event belongs to, from the element's src. */
  audioIdForSrc(sample: S, src: string): string;
  render(sample: S): ReactNode;
  /** Training/practice descriptions shown before the test items (no sample). */
  renderTrain(): ReactNode;
}

export interface StudyDomainConfig {
  defaultXai: string;
  xaiVariants: Record<string, StudyXaiVariant<any>>;
}

// ─── Lung: similes_v3 (V3 dataset, S3 audio, opaque icbhi_* ids) ─────────────

const v3ById = new Map<string, LungSoundV3>(
  LUNG_SOUND_DATA_V3.map((d) => [d.id, d])
);

// V3 audio srcs are absolute S3 URLs, so exact equality works.
const v3AudioIdForSrc = (sample: LungSoundV3, src: string): string => {
  if (!src) return 'unknown';
  if (src.startsWith('blob:')) return 'custom';
  if (sample.originalAudioUrl && src === sample.originalAudioUrl) return 'original';
  const simile = sample.similes.find((s) => s.withinClassAudioUrl && src === s.withinClassAudioUrl);
  return simile ? simile.id : 'unknown';
};

const lungSimilesV3: StudyXaiVariant<LungSoundV3> = {
  getSample: (sampleId) => v3ById.get(sampleId),
  audioIdForSrc: v3AudioIdForSrc,
  // Pass predictedType (never the true label) so a future change that renders
  // the classification cannot leak ground truth in study mode.
  render: (sample) => (
    <SimileExplanationV3
      audioName={sample.name}
      classification={sample.predictedType}
      similes={sample.similes}
      originalAudioUrl={sample.originalAudioUrl}
    />
  ),
  renderTrain: () => <SimilePractice />,
};

// ─── Lung: rexnet / onomatopoeia / examples (V2 dataset, local audio) ─────────

// V2 ids embed the class label (e.g. "coarse-crackle-9269"), which must not
// appear in Qualtrics URLs. The numeric suffix is unique across the dataset,
// so study URLs use the opaque alias "lungausc_<number>" instead.
const v2ByAlias = new Map<string, LungSound>(
  LUNG_SOUND_DATA.map((d) => [`lungausc_${d.id.split('-').pop()}`, d])
);

// V2 audio urls are root-relative paths rendered with BASE_URL prepended (and
// URL-encoded — filenames contain spaces), so compare decoded pathname suffixes.
const decodedPathname = (src: string): string => {
  try {
    return decodeURIComponent(new URL(src, window.location.origin).pathname);
  } catch {
    return src;
  }
};
const v2PathMatches = (src: string, storedPath?: string): boolean =>
  !!storedPath && decodedPathname(src).endsWith(storedPath);

const v2AudioIdForSrc = (sample: LungSound, src: string): string => {
  if (!src) return 'unknown';
  if (src.startsWith('blob:')) return 'custom';
  if (v2PathMatches(src, sample.originalAudioUrl)) return 'original';
  const simile = sample.similes.find((s) => v2PathMatches(src, s.withinClassAudioUrl));
  if (simile) return simile.id;
  // Prototype audio ids ("coarse crackle_9269-ex1") embed the class label —
  // log by rank instead.
  const example = sample.examples.find((x) => v2PathMatches(src, x.audioUrl));
  if (example) return `example-rank${example.rank}`;
  // RexNet contrast audio is built inside CuesExplanation, not stored on the
  // sample: .../<prefix>_vs_<baselineClass>_contrast.wav
  const contrast = /_vs_(.+)_contrast\.wav$/.exec(decodedPathname(src));
  if (contrast) return `contrast-${contrast[1]}`;
  return 'unknown';
};

const v2Features = (sample: LungSound) =>
  Object.entries(sample.features).map(([name, value]) => ({ name, value: value as string }));

// randomFoil=true shows a single deterministic contrast class instead of the
// full baseline dropdown (dev navbar's "Hide True Label (Single Foil)").
const lungRexnet = (randomFoil: boolean): StudyXaiVariant<LungSound> => ({
  getSample: (sampleId) => v2ByAlias.get(sampleId),
  audioIdForSrc: v2AudioIdForSrc,
  render: (sample) => (
    <CuesExplanation
      sampleId={sample.id}
      audioName={sample.name}
      features={v2Features(sample)}
      comparisons={sample.CFcomparison}
      highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
      originalAudioUrl={sample.originalAudioUrl}
      pathology={sample.pathology}
      randomFoil={randomFoil}
    />
  ),
  renderTrain: () => <CuesPractice />,
});

const lungOnomatopoeia: StudyXaiVariant<LungSound> = {
  getSample: (sampleId) => v2ByAlias.get(sampleId),
  audioIdForSrc: v2AudioIdForSrc,
  render: (sample) => (
    <SimileExplanation
      audioName={sample.name}
      classification={sample.type}
      confidence={87}
      similes={sample.similes}
      originalAudioUrl={sample.originalAudioUrl}
      isOnomatopoeia={true}
    />
  ),
  renderTrain: () => <SimilePractice isOnomatopoeia={true} />,
};

const lungExamples: StudyXaiVariant<LungSound> = {
  getSample: (sampleId) => v2ByAlias.get(sampleId),
  audioIdForSrc: v2AudioIdForSrc,
  render: (sample) => (
    <ExampleExplanation
      audioName={sample.name}
      classification={sample.type}
      confidence={87}
      examples={sample.examples}
      originalAudioUrl={sample.originalAudioUrl}
    />
  ),
  renderTrain: () => <ExamplesPractice />,
};

// ─── Lung: noxai (control — audio only, no explanation, V3 dataset) ──────────

const lungNoXai: StudyXaiVariant<LungSoundV3> = {
  logging: 'minimal',
  getSample: (sampleId) => v3ById.get(sampleId),
  audioIdForSrc: v3AudioIdForSrc,
  render: (sample) => <NoXaiExplanation originalAudioUrl={sample.originalAudioUrl} />,
  renderTrain: () => <NoXaiPractice />,
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const lung: StudyDomainConfig = {
  defaultXai: 'similes_v3',
  xaiVariants: {
    similes_v3: lungSimilesV3,
    rexnet: lungRexnet(false),
    rexnet_foil: lungRexnet(true),
    onomatopoeia: lungOnomatopoeia,
    examples: lungExamples,
    noxai: lungNoXai,
  },
};

export const STUDY_DOMAINS: Record<string, StudyDomainConfig> = {
  lung,
};
