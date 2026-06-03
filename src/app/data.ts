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
    id: 'fine-crackle-14893',
    name: 'Fine Crackle #14893',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/fine_crackles/fine crackle_14893_original.wav',
    features: { pitch: 'High', loudness: 'Medium', duration: 'Short', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Similar', duration: 'Shorter', continuity: 'Lower' },
      wheezes: { pitch: 'Higher', loudness: 'Lower', duration: 'Shorter', continuity: 'Lower' },
    },
    similes: [
      { id: 's1', text: 'Like the distant sound of fireworks popping.', category: 'Fine Crackles', relatedFeatures: 'Nature', confidence: 95, withinClassAudioUrl: '/audio/lungausc_v1/fine_crackles/fine crackle_14893_within_class.wav' },
    ],
  },
  {
    id: 'fine-crackle-25751',
    name: 'Fine Crackle #25751',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/fine_crackles/fine crackle_25751_original.wav',
    features: { pitch: 'High', loudness: 'Low', duration: 'Short', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Similar', duration: 'Shorter', continuity: 'Lower' },
      wheezes: { pitch: 'Higher', loudness: 'Lower', duration: 'Shorter', continuity: 'Lower' },
    },
    similes: [
      { id: 's1', text: 'Like the distant sound of fireworks popping.', category: 'Fine Crackles', relatedFeatures: 'Nature', confidence: 90, withinClassAudioUrl: '/audio/lungausc_v1/fine_crackles/fine crackle_25751_within_class.wav' },
    ],
  },
  {
    id: 'fine-crackle-46565',
    name: 'Fine Crackle #46565',
    type: 'Fine Crackles',
    pathology: 'fine_crackles',
    description: 'Mixed crackle with fine characteristics, discontinuous popping sounds.',
    originalAudioUrl: '/audio/lungausc_v1/original/fine_crackles/crackle_46565_original.wav',
    features: { pitch: 'High', loudness: 'Medium', duration: 'Short', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Similar', duration: 'Shorter', continuity: 'Lower' },
      wheezes: { pitch: 'Higher', loudness: 'Lower', duration: 'Shorter', continuity: 'Lower' },
    },
    similes: [
      { id: 's1', text: 'Like radio static on a low volume.', category: 'Fine Crackles', relatedFeatures: 'Mechanical', confidence: 96, withinClassAudioUrl: '/audio/lungausc_v1/fine_crackles/crackle_46565_within_class.wav' },
    ],
  },

  // ── Coarse Crackles ────────────────────────────────────────────────
  {
    id: 'coarse-crackle-16219',
    name: 'Coarse Crackle #16219',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/coarse_crackles/coarse crackle_16219_original.wav',
    features: { pitch: 'Low', loudness: 'High', duration: 'Short', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Shorter', continuity: 'Lower' },
      fine_crackles: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like pouring water out of a narrow-necked bottle (glug-glug).', category: 'Coarse Crackles', relatedFeatures: 'Domestic', confidence: 80, withinClassAudioUrl: '/audio/lungausc_v1/coarse_crackles/coarse crackle_16219_within_class.wav' },
    ],
  },
  {
    id: 'coarse-crackle-18953',
    name: 'Coarse Crackle #18953',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/coarse_crackles/coarse crackle_18953_original.wav',
    features: { pitch: 'Low', loudness: 'High', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Shorter', continuity: 'Lower' },
      fine_crackles: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like mud bubbling in a swamp.', category: 'Coarse Crackles', relatedFeatures: 'Nature', confidence: 92, withinClassAudioUrl: '/audio/lungausc_v1/coarse_crackles/coarse crackle_18953_within_class.wav' },
    ],
  },
  {
    id: 'coarse-crackle-20946',
    name: 'Coarse Crackle #20946',
    type: 'Coarse Crackles',
    pathology: 'coarse_crackles',
    description: 'Low-pitched, moist, bubbling sounds present during inspiration and sometimes expiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/coarse_crackles/coarse crackle_20946_original.wav',
    features: { pitch: 'Low', loudness: 'Medium', duration: 'Medium', continuity: 'Discontinuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Shorter', continuity: 'Lower' },
      fine_crackles: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like pouring water out of a narrow-necked bottle (glug-glug).', category: 'Coarse Crackles', relatedFeatures: 'Domestic', confidence: 84, withinClassAudioUrl: '/audio/lungausc_v1/coarse_crackles/coarse crackle_20946_within_class.wav' },
    ],
  },

  // ── Wheezes ────────────────────────────────────────────────────────
  {
    id: 'wheeze-20601',
    name: 'Wheeze #20601',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/wheezes/wheeze_20601_original.wav',
    features: { pitch: 'High', loudness: 'High', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      rhonchi: { pitch: 'Higher', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like the sound of a deflating balloon when the neck is stretched.', category: 'Wheezes', relatedFeatures: 'Mechanical', confidence: 83, withinClassAudioUrl: '/audio/lungausc_v1/wheezes/wheeze_20601_within_class.wav' },
    ],
  },
  {
    id: 'wheeze-46037',
    name: 'Wheeze #46037',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/wheezes/wheeze_46037_original.wav',
    features: { pitch: 'High', loudness: 'Medium', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      rhonchi: { pitch: 'Higher', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like a whale song (high frequency).', category: 'Wheezes', relatedFeatures: 'Nature', confidence: 96, withinClassAudioUrl: '/audio/lungausc_v1/wheezes/wheeze_46037_within_class.wav' },
    ],
  },
  {
    id: 'wheeze-47440',
    name: 'Wheeze #47440',
    type: 'Wheezes',
    pathology: 'wheezes',
    description: 'Continuous, musical, high-pitched sounds heard during expiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/wheezes/wheeze_47440_original.wav',
    features: { pitch: 'High', loudness: 'High', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      rhonchi: { pitch: 'Higher', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like a mosquito buzzing near your ear.', category: 'Wheezes', relatedFeatures: 'Nature', confidence: 95, withinClassAudioUrl: '/audio/lungausc_v1/wheezes/wheeze_47440_within_class.wav' },
    ],
  },

  // ── Rhonchi ────────────────────────────────────────────────────────
  {
    id: 'rhonchi-29410',
    name: 'Rhonchi #29410',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v1/original/rhonchi/rhonchi_29410_original.wav',
    features: { pitch: 'Low', loudness: 'Medium', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      wheezes: { pitch: 'Lower', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like the low moaning of a ghost in a movie.', category: 'Rhonchi', relatedFeatures: 'Abstract', confidence: 96, withinClassAudioUrl: '/audio/lungausc_v1/rhonchi/rhonchi_29410_within_class.wav' },
    ],
  },
  {
    id: 'rhonchi-48030',
    name: 'Rhonchi #48030',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v1/original/rhonchi/rhonchi_48030_original.wav',
    features: { pitch: 'Low', loudness: 'High', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      wheezes: { pitch: 'Lower', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like the low moaning of a ghost in a movie.', category: 'Rhonchi', relatedFeatures: 'Abstract', confidence: 97, withinClassAudioUrl: '/audio/lungausc_v1/rhonchi/rhonchi_48030_within_class.wav' },
    ],
  },
  {
    id: 'rhonchi-53849',
    name: 'Rhonchi #53849',
    type: 'Rhonchi',
    pathology: 'rhonchi',
    description: 'Low-pitched, snoring-quality, continuous sounds caused by airway secretions.',
    originalAudioUrl: '/audio/lungausc_v1/original/rhonchi/rhonchi_53849_original.wav',
    features: { pitch: 'Low', loudness: 'Medium', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Lower', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      wheezes: { pitch: 'Lower', loudness: 'Similar', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like the low moaning of a ghost in a movie.', category: 'Rhonchi', relatedFeatures: 'Abstract', confidence: 93, withinClassAudioUrl: '/audio/lungausc_v1/rhonchi/rhonchi_53849_within_class.wav' },
    ],
  },

  // ── Stridor ────────────────────────────────────────────────────────
  {
    id: 'stridor-27385',
    name: 'Stridor #27385',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v1/original/stridor/stridor_27385_original.wav',
    features: { pitch: 'High', loudness: 'High', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Higher', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like a foghorn in the distance (if lower pitched).', category: 'Stridor', relatedFeatures: 'Mechanical', confidence: 92, withinClassAudioUrl: '/audio/lungausc_v1/stridor/stridor_27385_within_class.wav' },
    ],
  },
  {
    id: 'stridor-45137',
    name: 'Stridor #45137',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v1/original/stridor/stridor_45137_original.wav',
    features: { pitch: 'High', loudness: 'High', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Higher', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like a foghorn in the distance (if lower pitched).', category: 'Stridor', relatedFeatures: 'Mechanical', confidence: 94, withinClassAudioUrl: '/audio/lungausc_v1/stridor/stridor_45137_within_class.wav' },
    ],
  },
  {
    id: 'stridor-50625',
    name: 'Stridor #50625',
    type: 'Stridor',
    pathology: 'stridor',
    description: 'High-pitched, harsh, musical sound caused by turbulent airflow through a narrowed airway.',
    originalAudioUrl: '/audio/lungausc_v1/original/stridor/stridor_50625_original.wav',
    features: { pitch: 'High', loudness: 'Medium', duration: 'Long', continuity: 'Continuous' },
    CFcomparison: {
      normal: { pitch: 'Higher', loudness: 'Higher', duration: 'Longer', continuity: 'Similar' },
      wheezes: { pitch: 'Similar', loudness: 'Higher', duration: 'Similar', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like a foghorn in the distance (if lower pitched).', category: 'Stridor', relatedFeatures: 'Mechanical', confidence: 97, withinClassAudioUrl: '/audio/lungausc_v1/stridor/stridor_50625_within_class.wav' },
    ],
  },

  // ── Normal ─────────────────────────────────────────────────────────
  {
    id: 'normal-907',
    name: 'Normal #907',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/normal/normal_907_original.wav',
    features: { pitch: 'Low', loudness: 'Low', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Lower', loudness: 'Lower', duration: 'Longer', continuity: 'Higher' },
      wheezes: { pitch: 'Lower', loudness: 'Lower', duration: 'Shorter', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like a gentle breeze blowing through a quiet room.', category: 'Normal', relatedFeatures: 'Nature', confidence: 96, withinClassAudioUrl: '/audio/lungausc_v1/normal/normal_907_within_class.wav' },
    ],
  },
  {
    id: 'normal-3944',
    name: 'Normal #3944',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/normal/normal_3944_original.wav',
    features: { pitch: 'Low', loudness: 'Low', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Lower', loudness: 'Lower', duration: 'Longer', continuity: 'Higher' },
      wheezes: { pitch: 'Lower', loudness: 'Lower', duration: 'Shorter', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like the soft, steady hum of a distant cooling fan.', category: 'Normal', relatedFeatures: 'Mechanical', confidence: 97, withinClassAudioUrl: '/audio/lungausc_v1/normal/normal_3944_within_class.wav' },
    ],
  },
  {
    id: 'normal-26202',
    name: 'Normal #26202',
    type: 'Normal',
    pathology: 'normal',
    description: 'Normal vesicular breath sounds — soft, low-pitched sounds heard during inspiration.',
    originalAudioUrl: '/audio/lungausc_v1/original/normal/normal_26202_original.wav',
    features: { pitch: 'Low', loudness: 'Low', duration: 'Medium', continuity: 'Continuous' },
    CFcomparison: {
      fine_crackles: { pitch: 'Lower', loudness: 'Lower', duration: 'Longer', continuity: 'Higher' },
      wheezes: { pitch: 'Lower', loudness: 'Lower', duration: 'Shorter', continuity: 'Similar' },
    },
    similes: [
      { id: 's1', text: 'Like a gentle breeze blowing through a quiet room.', category: 'Normal', relatedFeatures: 'Nature', confidence: 93, withinClassAudioUrl: '/audio/lungausc_v1/normal/normal_26202_within_class.wav' },
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
