export interface LungSound {
  id: string;
  name: string;
  type: string;
  description: string;
  audioUrl: string; // Placeholder
  features: {
    pitch: 'High' | 'Medium' | 'Low';
    loudness: 'High' | 'Medium' | 'Low';
    duration: 'Long' | 'Medium' | 'Short';
    continuity: 'Continuous' | 'Discontinuous';
    quality: string;
  };
  comparison: {
    normal: {
      pitch: 'Higher' | 'Lower' | 'Similar';
      loudness: 'Higher' | 'Lower' | 'Similar';
      duration: 'Longer' | 'Shorter' | 'Similar';
      continuity: 'Different' | 'Similar';
    };
    wheeze: {
      pitch: 'Higher' | 'Lower' | 'Similar';
      loudness: 'Higher' | 'Lower' | 'Similar';
      duration: 'Longer' | 'Shorter' | 'Similar';
      continuity: 'Different' | 'Similar';
    };
  };
  similes: Array<{
    id: string;
    text: string;
    category: string;
    relatedFeatures: string;
    confidence: number;
  }>;
}

export const LUNG_SOUND_DATA: LungSound[] = [
  {
    id: 'case-1',
    name: 'Case Study 1',
    type: 'Fine Crackles',
    description: 'Discontinuous, high-pitched, short popping sounds heard during inspiration.',
    audioUrl: '', 
    features: {
      pitch: 'High',
      loudness: 'Medium',
      duration: 'Short',
      continuity: 'Discontinuous',
      quality: 'Explosive'
    },
    comparison: {
      normal: {
        pitch: 'Higher',
        loudness: 'Similar',
        duration: 'Shorter',
        continuity: 'Different'
      },
      wheeze: {
        pitch: 'Higher',
        loudness: 'Lower',
        duration: 'Shorter',
        continuity: 'Different'
      }
    },
    similes: [
      { id: 's1', text: "Like tearing a piece of velcro", category: "Fine Crackles", relatedFeatures: "Mechanical", confidence: 92 },
      { id: 's2', text: "Like wood popping in a fireplace", category: "Fine Crackles", relatedFeatures: "Nature", confidence: 88 },
      // { id: 's3', text: "Like rubbing hair between your fingers near your ear", category: "Fine Crackles", relatedFeatures: "Domestic", confidence: 85 },
      { id: 's4', text: "Like salt falling on a hot pan", category: "Fine Crackles", relatedFeatures: "Domestic", confidence: 76 },
      { id: 's5', text: "Like ripping a heavy piece of canvas or fabric", category: "Coarse Crackles", relatedFeatures: "Domestic", confidence: 80 }
    ]
  },
  {
    id: 'case-2',
    name: 'Case Study 08A',
    type: 'Wheezes',
    description: 'Continuous, musical sounds, high-pitched, heard during expiration.',
    audioUrl: '',
    features: {
      pitch: 'High',
      loudness: 'High',
      duration: 'Long',
      continuity: 'Continuous',
      quality: 'Musical'
    },
    comparison: {
      normal: {
        pitch: 'Higher',
        loudness: 'Higher',
        duration: 'Longer',
        continuity: 'Different'
      },
      wheeze: {
        pitch: 'Similar',
        loudness: 'Similar',
        duration: 'Similar',
        continuity: 'Similar'
      }
    },
    similes: [
      { id: 's5', text: "Like a high-pitched whistle", category: "Wheezes", relatedFeatures: "Mechanical", confidence: 95 },
      { id: 's6', text: "Like wind blowing through a narrow tunnel", category: "Wheezes", relatedFeatures: "Nature", confidence: 89 },
      { id: 's7', text: "Like a squeaky door hinge", category: "Wheezes", relatedFeatures: "Domestic", confidence: 82 }
    ]
  },
  {
    id: 'case-3',
    name: 'Case Study 22C',
    type: 'Rhonchi',
    description: 'Low-pitched, snoring quality, continuous sounds.',
    audioUrl: '',
    features: {
      pitch: 'Low',
      loudness: 'Medium',
      duration: 'Long',
      continuity: 'Continuous',
      quality: 'Snoring'
    },
    comparison: {
      normal: {
        pitch: 'Lower',
        loudness: 'Higher',
        duration: 'Longer',
        continuity: 'Different'
      },
      wheeze: {
        pitch: 'Lower',
        loudness: 'Similar',
        duration: 'Similar',
        continuity: 'Similar'
      }
    },
    similes: [
      { id: 's8', text: "Like a snoring sleeper", category: "Rhonchi", relatedFeatures: "Domestic", confidence: 94 },
      { id: 's9', text: "Like a low moan", category: "Rhonchi", relatedFeatures: "Abstract", confidence: 85 },
      { id: 's10', text: "Like air bubbling through fluid", category: "Rhonchi", relatedFeatures: "Mechanical", confidence: 78 }
    ]
  }
];
