export interface LungSound {
  id: string;
  name: string;
  type: string;
  pathology: string;
  description: string;
  originalAudioUrl: string;
  features: {
    pitch: 'High' | 'Medium' | 'Low';
    loudness: 'High' | 'Medium' | 'Low';
    duration: 'Long' | 'Medium' | 'Short';
    continuity: 'Continuous' | 'Discontinuous';
  };
  CFcomparison: Record<string, {
    pitch: 'Higher' | 'Lower' | 'Similar';
    loudness: 'Higher' | 'Lower' | 'Similar';
    duration: 'Longer' | 'Shorter' | 'Similar';
    continuity: 'Higher' | 'Lower' | 'Similar';
  }>;
  similes: Array<{
    id: string;
    text: string;
    category: string;
    relatedFeatures: string;
    confidence: number;
    withinClassAudioUrl?: string;
    visqolMosLqo?: number | null;
    visqolVnsim?: number | null;
    genToOrig?: number | null;
  }>;
}

export const LUNG_SOUND_DATA: LungSound[] = [
  // ── Fine Crackles ──────────────────────────────────────────────────
  {
    id: 'fine-crackle-12206',
    name: 'Fine Crackles #12206',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12206_original.wav',
    features: { pitch: 'High', loudness: 'Medium', duration: 'Short', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Similar', duration: 'Shorter', continuity: 'Lower' },
      wheezes: { pitch: 'Higher', loudness: 'Lower', duration: 'Shorter', continuity: 'Lower' },
    },
    similes: [
      { 
        id: 's1-12206', 
        text: 'Like pulling apart a strip of Velcro slowly.', 
        category: 'Fine Crackles', 
        relatedFeatures: 'Mechanical', 
        confidence: 95, 
        withinClassAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12206_within_class_top1.wav' 
      },
      { 
        id: 's2-12206', 
        text: 'Like rubbing a lock of hair between your fingers near your ear.', 
        category: 'Fine Crackles', 
        relatedFeatures: 'Nature', 
        confidence: 90, 
        withinClassAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12206_within_class_top2.wav' 
      },
      { 
        id: 's3-12206', 
        text: 'Like the fizz of a freshly poured carbonated soda.', 
        category: 'Fine Crackles', 
        relatedFeatures: 'Nature', 
        confidence: 85, 
        withinClassAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12206_within_class_top3.wav' 
      },
    ],
  },
  {
    id: 'fine-crackle-12253',
    name: 'Fine Crackles #12253',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12253_original.wav',
    features: { pitch: 'High', loudness: 'Low', duration: 'Short', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Similar', duration: 'Shorter', continuity: 'Lower' },
      wheezes: { pitch: 'Higher', loudness: 'Lower', duration: 'Shorter', continuity: 'Lower' },
    },
    similes: [
      { 
        id: 's1-12253', 
        text: 'Like radio static on a low volume.', 
        category: 'Fine Crackles', 
        relatedFeatures: 'Mechanical', 
        confidence: 96, 
        withinClassAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12253_within_class_top1.wav' 
      },
      { 
        id: 's2-12253', 
        text: 'Like wood popping and snapping in a distant campfire.', 
        category: 'Fine Crackles', 
        relatedFeatures: 'Nature', 
        confidence: 92, 
        withinClassAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12253_within_class_top2.wav' 
      },
      { 
        id: 's3-12253', 
        text: 'Like the distant sound of fireworks popping.', 
        category: 'Fine Crackles', 
        relatedFeatures: 'Nature', 
        confidence: 88, 
        withinClassAudioUrl: '/audio/lungausc_v2/fine_crackles/fine crackle_12253_within_class_top3.wav' 
      },
    ],
  },

  // ── Coarse Crackles ────────────────────────────────────────────────
  {
    id: 'coarse-crackle-10821',
    name: 'Coarse Crackles #10821',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10821_original.wav',
    features: { pitch: 'Low', loudness: 'High', duration: 'Short', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Shorter', continuity: 'Lower' },
      fine_crackles: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
    },
    similes: [
      { 
        id: 's1-10821', 
        text: 'Like pouring water out of a narrow-necked bottle (glug-glug).', 
        category: 'Coarse Crackles', 
        relatedFeatures: 'Domestic', 
        confidence: 93, 
        withinClassAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10821_within_class_top1.wav' 
      },
      { 
        id: 's2-10821', 
        text: 'Like water boiling vigorously in a pot.', 
        category: 'Coarse Crackles', 
        relatedFeatures: 'Domestic', 
        confidence: 89, 
        withinClassAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10821_within_class_top2.wav' 
      },
      { 
        id: 's3-10821', 
        text: 'Like the sound of a wet sponge being squeezed out.', 
        category: 'Coarse Crackles', 
        relatedFeatures: 'Domestic', 
        confidence: 84, 
        withinClassAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10821_within_class_top3.wav' 
      },
    ],
  },
  {
    id: 'coarse-crackle-10822',
    name: 'Coarse Crackles #10822',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10822_original.wav',
    features: { pitch: 'Low', loudness: 'High', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Shorter', continuity: 'Lower' },
      fine_crackles: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
    },
    similes: [
      { 
        id: 's1-10822', 
        text: 'Like mud bubbling in a swamp.', 
        category: 'Coarse Crackles', 
        relatedFeatures: 'Nature', 
        confidence: 94, 
        withinClassAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10822_within_class_top1.wav' 
      },
      { 
        id: 's2-10822', 
        text: 'Like slurping the last few drops of a drink through a straw.', 
        category: 'Coarse Crackles', 
        relatedFeatures: 'Domestic', 
        confidence: 91, 
        withinClassAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10822_within_class_top2.wav' 
      },
      { 
        id: 's3-10822', 
        text: 'Like rolling marbles around in a tin can.', 
        category: 'Coarse Crackles', 
        relatedFeatures: 'Mechanical', 
        confidence: 86, 
        withinClassAudioUrl: '/audio/lungausc_v2/coarse_crackles/coarse crackle_10822_within_class_top3.wav' 
      },
    ],
  },
];

// Helper: unique pathology display labels
export const PATHOLOGY_LABELS: Record<string, string> = {
  fine_crackles: 'Fine Crackles',
  coarse_crackles: 'Coarse Crackles',
  wheezes: 'Wheezes',
  rhonchi: 'Rhonchi',
  stridor: 'Stridor',
  normal: 'Normal',
};
