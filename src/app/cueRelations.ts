// used for the cue relations table
export interface CueFeatureSet {
  pitch: string;
  loudness: string;
  duration: string;
  continuity: string;
}

export interface CueRelationData {
  id: string;
  name: string;
  features: CueFeatureSet;
}

export const CUE_RELATIONS: Record<string, CueRelationData> = {
  'normal': {
    id: 'normal',
    name: 'Normal Breathing',
    features: {
      pitch: 'Low to Medium',
      loudness: 'Medium',
      duration: 'Medium',
      continuity: 'Continuous',
    }
  },
  'wheezes': {
    id: 'wheezes',
    name: 'Wheezes',
    features: {
      pitch: 'High',
      loudness: 'High',
      duration: 'Long',
      continuity: 'Continuous',
    }
  },
  'fine-crackles': {
    id: 'fine-crackles',
    name: 'Fine Crackles',
    features: {
      pitch: 'High',
      loudness: 'Low to Medium',
      duration: 'Short',
      continuity: 'Discontinuous',
    }
  },
  'coarse-crackles': {
    id: 'coarse-crackles',
    name: 'Coarse Crackles',
    features: {
      pitch: 'Low',
      loudness: 'Loud',
      duration: 'Short',
      continuity: 'Discontinuous',
    }
  },
  'rhonchi': {
    id: 'rhonchi',
    name: 'Rhonchi',
    features: {
      pitch: 'Low',
      loudness: 'Medium',
      duration: 'Long',
      continuity: 'Continuous',
    }
  }
};
