import React from 'react';

/**
 * Domain Class Color Scheme & Abbreviation Registry
 *
 * This file documents and assigns consistent colors and abbreviations to each
 * diagnostic/taxonomic class across both Lung Sounds and Bird Sounds domains.
 * All XAI explanations (Prototypes/Examples, RexNet counterfactuals, and
 * Similes/Onomatopoeia) use this single mapping to render class badges.
 */

export interface ClassMetadata {
  /** Canonical class label */
  className: string;
  /** Domain ('lung' | 'bird' | 'general') */
  domain: 'lung' | 'bird' | 'general';
  /** Short abbreviation (3-4 characters) */
  abbrev: string;
  /** Tailwind badge styling classes (background, text, border) */
  badgeStyle: string;
  /** Primary hex color */
  colorHex: string;
}

export const CLASS_METADATA: Record<string, ClassMetadata> = {
  // ─── Lung Sound Domain Classes ─────────────────────────────────────────────
  Normal: {
    className: 'Normal',
    domain: 'lung',
    abbrev: 'NRM',
    badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    colorHex: '#10b981',
  },
  Wheeze: {
    className: 'Wheeze',
    domain: 'lung',
    abbrev: 'WHZ',
    badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
    colorHex: '#f59e0b',
  },
  Crackle: {
    className: 'Crackle',
    domain: 'lung',
    abbrev: 'CRK',
    badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
    colorHex: '#9333ea',
  },
  Rhonchi: {
    className: 'Rhonchi',
    domain: 'lung',
    abbrev: 'RHO',
    badgeStyle: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    colorHex: '#06b6d4',
  },
  Stridor: {
    className: 'Stridor',
    domain: 'lung',
    abbrev: 'STR',
    badgeStyle: 'bg-rose-100 text-rose-800 border-rose-300',
    colorHex: '#f43f5e',
  },

  // ─── Bird Sound Domain Classes ─────────────────────────────────────────────
  'Tufted Titmouse': {
    className: 'Tufted Titmouse',
    domain: 'bird',
    abbrev: 'TUTI',
    badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300',
    colorHex: '#2563eb',
  },
  'Eastern Towhee': {
    className: 'Eastern Towhee',
    domain: 'bird',
    abbrev: 'EATO',
    badgeStyle: 'bg-orange-100 text-orange-800 border-orange-300',
    colorHex: '#ea580c',
  },
  'Wood Thrush': {
    className: 'Wood Thrush',
    domain: 'bird',
    abbrev: 'WOTH',
    badgeStyle: 'bg-teal-100 text-teal-800 border-teal-300',
    colorHex: '#0d9488',
  },
  'Black-capped Chickadee': {
    className: 'Black-capped Chickadee',
    domain: 'bird',
    abbrev: 'BCCH',
    badgeStyle: 'bg-violet-100 text-violet-800 border-violet-300',
    colorHex: '#7c3aed',
  },
  Ovenbird: {
    className: 'Ovenbird',
    domain: 'bird',
    abbrev: 'OVEN',
    badgeStyle: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    colorHex: '#c026d3',
  },
};

// Aliases for legacy or hyphenated class names
const CLASS_ALIASES: Record<string, string> = {
  'coarse-crackles': 'Crackle',
  'fine-crackles': 'Crackle',
  crackles: 'Crackle',
  crackle: 'Crackle',
  wheezes: 'Wheeze',
  wheeze: 'Wheeze',
  normal: 'Normal',
  rhonchi: 'Rhonchi',
  stridor: 'Stridor',
  'tufted titmouse': 'Tufted Titmouse',
  'eastern towhee': 'Eastern Towhee',
  'wood thrush': 'Wood Thrush',
  'black-capped chickadee': 'Black-capped Chickadee',
  ovenbird: 'Ovenbird',
};

const FALLBACK_METADATA: ClassMetadata = {
  className: 'Unknown',
  domain: 'general',
  abbrev: 'UNK',
  badgeStyle: 'bg-gray-100 text-gray-800 border-gray-300',
  colorHex: '#6b7280',
};

/**
 * Retrieves color and abbreviation metadata for any class label.
 */
export function getClassMetadata(rawClassName?: string): ClassMetadata {
  if (!rawClassName) return FALLBACK_METADATA;
  const trimmed = rawClassName.trim();
  if (CLASS_METADATA[trimmed]) return CLASS_METADATA[trimmed];

  const lower = trimmed.toLowerCase();
  const alias = CLASS_ALIASES[lower];
  if (alias && CLASS_METADATA[alias]) return CLASS_METADATA[alias];

  const foundKey = Object.keys(CLASS_METADATA).find(
    (key) => key.toLowerCase() === lower
  );
  if (foundKey) return CLASS_METADATA[foundKey];

  return {
    className: trimmed,
    domain: 'general',
    abbrev: trimmed.slice(0, 4).toUpperCase(),
    badgeStyle: 'bg-gray-100 text-gray-800 border-gray-300',
    colorHex: '#6b7280',
  };
}

/**
 * Static lookup table mapping known concept texts to their diagnostic/taxonomic class.
 */
const KNOWN_CONCEPT_CATEGORIES: Record<string, string> = {
  // Lung Similes
  'Like a banshee screaming.': 'Stridor',
  'Like a cat purring loudly against your chest.': 'Rhonchi',
  'Like a clean, unobstructed sigh.': 'Normal',
  'Like a crow cawing harshly.': 'Stridor',
  'Like a diesel engine idling nearby.': 'Rhonchi',
  'Like a distant siren wailing.': 'Wheeze',
  'Like a distinct "grumbling" of an upset stomach.': 'Rhonchi',
  'Like a flute or piccolo playing a sustained, discordant note.': 'Wheeze',
  'Like a foghorn in the distance (if lower pitched).': 'Stridor',
  'Like a gentle breeze blowing through a quiet room.': 'Normal',
  'Like a high-pitched kettle whistling on the stove.': 'Wheeze',
  'Like a low rumble of thunder far away.': 'Rhonchi',
  'Like a seal barking.': 'Stridor',
  'Like a violin being played with a loose bow.': 'Wheeze',
  'Like calm ocean waves lapping against the shore.': 'Normal',
  'Like carbonated soda fizzing directly in your ear.': 'Crackle',
  'Like crinkling a piece of cellophane wrapper right next to your ear.': 'Crackle',
  'Like crumpling dry autumn leaves in your fist.': 'Crackle',
  'Like frying bacon popping and sizzling in a pan.': 'Crackle',
  'Like heavy furniture dragging across a wooden floor.': 'Rhonchi',
  'Like inflation of a paper bag.': 'Normal',
  'Like listening to a quiet seashell.': 'Normal',
  'Like rustling dry grass.': 'Crackle',
  'Like snoring through a hollow tube.': 'Rhonchi',
  'Like stepping on fresh, crunchy snow.': 'Crackle',
  'Like tearing a piece of Velcro apart slowly.': 'Crackle',
  'Like wind rustling through leaves.': 'Normal',

  // Lung Onomatopoeia
  'blub blub blub': 'Crackle',
  'brrr brrr brrr': 'Crackle',
  'crick crick crick': 'Crackle',
  'crr crr crr': 'Crackle',
  'glug glug glug': 'Crackle',
  'krackle krackle': 'Crackle',
  'pop pop pop': 'Crackle',
  'rattle rattle rattle': 'Crackle',
  'snap snap snap': 'Crackle',
  'tic tic tic': 'Crackle',
  'weee ooo weee': 'Wheeze',
  'whhhh whhhh': 'Normal',

  // Bird Similes & Onomatopoeia
  'chick a dee dee dee': 'Black-capped Chickadee',
  'peter peter peter': 'Tufted Titmouse',
  'drink your tea': 'Eastern Towhee',
  'teacher teacher teacher': 'Ovenbird',
  'flute like song': 'Wood Thrush',
};

/**
 * Resolves the category class for a concept item, using explicit category if given
 * or falling back to the static concept lookup table.
 */
export function resolveConceptCategory(text?: string, explicitCategory?: string): string | undefined {
  if (explicitCategory) return explicitCategory;
  if (!text) return undefined;
  const cleanText = text.trim();
  if (KNOWN_CONCEPT_CATEGORIES[cleanText]) return KNOWN_CONCEPT_CATEGORIES[cleanText];

  // Fuzzy check for keywords if exact match not found
  const lower = cleanText.toLowerCase();
  if (lower.includes('chick') || lower.includes('dee dee')) return 'Black-capped Chickadee';
  if (lower.includes('peter') || lower.includes('titmouse')) return 'Tufted Titmouse';
  if (lower.includes('towhee') || lower.includes('drink your tea')) return 'Eastern Towhee';
  if (lower.includes('ovenbird') || lower.includes('teacher')) return 'Ovenbird';
  if (lower.includes('thrush')) return 'Wood Thrush';

  return undefined;
}

export interface ClassBadgeProps {
  className?: string;
  useAbbrev?: boolean;
  size?: 'xs' | 'sm' | 'md';
  extraClasses?: string;
}

/**
 * Renders a colored pill indicating a class label according to our global registry.
 */
export function ClassBadge({
  className: rawClassName,
  useAbbrev = false,
  size = 'sm',
  extraClasses = '',
}: ClassBadgeProps) {
  if (!rawClassName) return null;
  const meta = getClassMetadata(rawClassName);

  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[10px] tracking-wider'
      : size === 'sm'
      ? 'px-2 py-0.5 text-xs tracking-wide'
      : 'px-2.5 py-1 text-sm tracking-wide';

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded border uppercase ${meta.badgeStyle} ${sizeClasses} ${extraClasses}`}
      title={`Class: ${meta.className} (${meta.abbrev})`}
    >
      {useAbbrev ? meta.abbrev : meta.className}
    </span>
  );
}
