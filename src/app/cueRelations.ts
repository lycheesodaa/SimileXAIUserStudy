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
  },
  'stridor': {
    id: 'stridor',
    name: 'Stridor',
    features: {
      pitch: 'High',
      loudness: 'Loud',
      duration: 'Long',
      continuity: 'Continuous',
    }
  }
};

// Direction glyph for the comparison relations shown in the cue explanations.
// Glyph only, no colour: the arrow encodes direction without the severity
// reading a warm/cool palette would add. Matches on the direction word so it
// works for both the plain 'Higher' form and RExNet's 'Target is HIGHER'.
export function cueComparisonGlyph(comparison: string): string {
  if (/(higher|longer)/i.test(comparison)) return '↑';
  if (/(lower|shorter)/i.test(comparison)) return '↓';
  return '≈';
}

// Valence-neutral colour pairing for the same relations, parked in case we want
// the direction reinforced by hue as well as by the glyph. Amber/teal rather
// than red/blue so the styling reads as direction, not severity.
export function cueComparisonStyle(comparison: string): { glyph: string; colorClass: string } {
  if (/(higher|longer)/i.test(comparison)) {
    return { glyph: '↑', colorClass: 'text-amber-600 font-medium' };
  }
  if (/(lower|shorter)/i.test(comparison)) {
    return { glyph: '↓', colorClass: 'text-teal-600 font-medium' };
  }
  return { glyph: '≈', colorClass: 'text-gray-500 font-medium' };
}
