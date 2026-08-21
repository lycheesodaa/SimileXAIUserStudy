#!/usr/bin/env node
// Regenerates the Qualtrics Loop & Merge tables from a versioned study bundle.
//
// One TSV per split x domain x condition:
//   dev/loop-and-merge/<version>/test/<domain>/<xai>.tsv   (testing.csv)
//   dev/loop-and-merge/<version>/train/<domain>/<xai>.tsv  (training.csv)
//
// Column layout by condition:
//   - similes / onomatopoeia:
//       Field 1-5: sampleId, domain, xai, aiPrediction, trueLabel
//       Field 6-10: comp_1 to comp_5 (text strings)
//   - rexnet:
//       Field 1-5: sampleId, domain, xai, aiPrediction, trueLabel
//       Field 6: counterfactual class
//       Field 7: cue 1 name, Field 8: cue 1 predicted relation
//       Field 9: cue 2 name, Field 10: cue 2 predicted relation
//       Field 11: cue 3 name, Field 12: cue 3 predicted relation
//       Field 13: cue 4 name, Field 14: cue 4 predicted relation
//       Field 15: cue 5 name, Field 16: cue 5 predicted relation
//   - examples:
//       Field 1-5: sampleId, domain, xai, aiPrediction, trueLabel
//       Field 6: example 1 class, Field 7: example 1 audio url, Field 8: example 1 similarity
//       Field 9: example 2 class, Field 10: example 2 audio url, Field 11: example 2 similarity
//       Field 12: example 3 class, Field 13: example 3 audio url, Field 14: example 3 similarity
//       Field 15: example 4 class, Field 16: example 4 audio url, Field 17: example 4 similarity
//       Field 18: example 5 class, Field 19: example 5 audio url, Field 20: example 5 similarity
//
// Usage: node dev/generate-loop-and-merge.cjs [version]   (default: v1)
const fs = require('fs');
const path = require('path');

const VERSION = process.argv[2] || 'v1';
const ROOT = path.join(__dirname, '..');
const DATA_ROOT_NAME = `data_${VERSION}`;
const DATA_V1 = path.join(ROOT, 'public', DATA_ROOT_NAME);
const OUT_ROOT = path.join(__dirname, 'loop-and-merge', VERSION);
const XAI_CONDITIONS = [
  'similes',
  'similes_actv',
  'similes_dualview_approx',
  'similes_dualview_actv',
  'onomatopoeia',
  'onomatopoeia_actv',
  'onomatopoeia_dualview_approx',
  'onomatopoeia_dualview_actv',
  'rexnet',
  'examples',
  'noxai',
];

// The conditions the formative table samples from, in output/priority order.
const FORMATIVE_CONDITIONS = ['similes', 'onomatopoeia', 'examples', 'rexnet'];

const BUNDLE_VERSIONS = [
  { version: 'v1', root: 'data_v1' },
  { version: 'v2', root: 'data_v2', negativeWeightsAsNot: true },
  { version: 'v3', root: 'data_v3' },
  { version: 'v4', root: 'data_v4', negativeWeightsAsNot: true },
  { version: 'v5', root: 'data_v5' },
  { version: 'v6', root: 'data_v6' },
  { version: 'v6.1', root: 'data_v6.1' },
  { version: 'v7', root: 'data_v7' },
  { version: 'v8', root: 'data_v8' },
];

function negativeWeightsAsNot(root) {
  return BUNDLE_VERSIONS.some(
    (b) => b.root === root && b.negativeWeightsAsNot === true
  );
}

const prettifyOnomatopoeia = (concept) =>
  concept.replace(/_gemini_tts$/, '').replace(/_/g, ' ');

// ─── RexNet / Cues mappings & helpers ──────────────────────────────────────────

const CUE_NAME_MAP_BIRD_V1 = {
  'peak frequency': 'Song Pitch (high vs low)',
  'peak_frequency': 'Song Pitch (high vs low)',
  'spectral bandwidth': 'Note Frequency Span',
  'spectral_bandwidth': 'Note Frequency Span',
  'high-frequency energy': 'High-Pitch Shrillness',
  'high_frequency_energy': 'High-Pitch Shrillness',
  'hf_content': 'High-Pitch Shrillness',
  'syllable rate': 'Trill / Note Tempo',
  'syllable_rate': 'Trill / Note Tempo',
  'trill rate': 'Trill / Note Tempo',
  'tonality': 'Pure whistle vs buzzy/broadband',
  'fm extent': 'Pitch Sweep (frequency glide)',
  'fm_extent': 'Pitch Sweep (frequency glide)',
};

const CUE_NAME_MAP_BIRD_V7 = {
  'spectral_centroid_hi': 'Song Brightness (high vs low)',
  'spectral centroid (high)': 'Song Brightness (high vs low)',
  'spectral centroid': 'Song Brightness (high vs low)',
  'tonality': 'Pure whistle vs buzzy/broadband',
  'energy_level': 'Loudness / Carrying Power',
  'energy level': 'Loudness / Carrying Power',
  'high-frequency energy': 'High-Pitch Shrillness',
  'high_frequency_energy': 'High-Pitch Shrillness',
  'hf_content': 'High-Pitch Shrillness',
  'fm extent': 'Pitch Sweep (frequency glide)',
  'fm_extent': 'Pitch Sweep (frequency glide)',
  'peak frequency': 'Song Pitch (high vs low)',
  'peak_frequency': 'Song Pitch (high vs low)',
};

const CUE_NAME_MAP_LUNG = {
  'loudness / intensity': 'Loudness / Intensity',
  'energy_level': 'Loudness / Intensity',
  'energy level': 'Loudness / Intensity',
  'pitch / brightness (high vs low)': 'Pitch / Brightness (high vs low)',
  'spectral centroid (high)': 'Pitch / Brightness (high vs low)',
  'spectral_centroid_hi': 'Pitch / Brightness (high vs low)',
  'spectral bandwidth': 'Spectral Width (broad vs narrow/tonal)',
  'spectral_bandwidth': 'Spectral Width (broad vs narrow/tonal)',
  'spectral width (broad vs narrow/tonal)': 'Spectral Width (broad vs narrow/tonal)',
  'high-frequency energy': 'High-Frequency Shrillness',
  'high-frequency shrillness': 'High-Frequency Shrillness',
  'hf_content': 'High-Frequency Shrillness',
  'crackle spikiness (popping)': 'Spikiness (popping)',
  'spikiness (popping)': 'Spikiness (popping)',
  'crest factor': 'Spikiness (popping)',
  'crest_factor': 'Spikiness (popping)',
  'crackle / event density': 'Crackle / Event Density',
  'event_rate': 'Crackle / Event Density',
};

function prettifyCueName(cueName, isBird, isV7) {
  const key = cueName.trim().toLowerCase();
  if (isBird) {
    const map = isV7 ? CUE_NAME_MAP_BIRD_V7 : CUE_NAME_MAP_BIRD_V1;
    if (map[key]) return map[key];
  }
  if (!isBird && CUE_NAME_MAP_LUNG[key]) {
    return CUE_NAME_MAP_LUNG[key];
  }
  return (isV7 ? CUE_NAME_MAP_BIRD_V7[key] : CUE_NAME_MAP_BIRD_V1[key]) || CUE_NAME_MAP_LUNG[key] || cueName;
}

function filterVisibleCues(cues, isBird, isV7) {
  return cues.filter((cue) => {
    const raw = cue.cue.toLowerCase();
    const pretty = prettifyCueName(cue.cue, isBird, isV7).toLowerCase();

    if (raw.includes('event density') || pretty.includes('event density')) {
      return false;
    }

    if (isV7 && isBird) {
      if (
        raw.includes('shrillness') ||
        pretty.includes('shrillness') ||
        raw.includes('hf_content') ||
        raw.includes('high-frequency energy') ||
        raw.includes('song pitch') ||
        pretty.includes('song pitch') ||
        raw.includes('peak frequency') ||
        raw.includes('peak_frequency')
      ) {
        return false;
      }
    } else {
      if (
        raw.includes('pitch sweep') ||
        pretty.includes('pitch sweep') ||
        raw.includes('fm extent') ||
        raw.includes('fm_extent')
      ) {
        return false;
      }
    }

    return true;
  });
}

const stripMd = (s) => s.replace(/[`*]/g, '').trim();

function parseRexnetReport(md, classExemplars) {
  const contrasts = [];
  const sections = md.split(/^### Target vs\. Contrast Concept: `([^`]+)`/m);
  for (let i = 1; i < sections.length; i += 2) {
    const contrastClass = sections[i];
    const body = sections[i + 1] ?? '';

    const cues = [];
    const rowRe = /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/gm;
    let row;
    while ((row = rowRe.exec(body)) !== null) {
      cues.push({
        cue: stripMd(row[1]),
        targetValue: stripMd(row[2]),
        foilValue: stripMd(row[3]),
        heuristicRelation: stripMd(row[4]),
        predictedRelation: stripMd(row[5]),
        agree: /AGREE/i.test(row[6]) && !/DISAGREE/i.test(row[6]),
      });
    }

    contrasts.push({
      contrastClass,
      cues,
    });
  }
  return { contrasts };
}

function readFoilOverrides() {
  const foilFile = path.join(ROOT, 'src', 'app', 'study', 'foilOverrides.ts');
  if (!fs.existsSync(foilFile)) return {};
  const text = fs.readFileSync(foilFile, 'utf8');
  const table = {};
  let root = null;
  for (const line of text.split(/\r?\n/)) {
    const rootMatch = /^ {2}'([^']+)': \{$/.exec(line);
    if (rootMatch) {
      root = rootMatch[1];
      table[root] = {};
      continue;
    }
    if (/^ {2}\},$/.test(line)) {
      root = null;
      continue;
    }
    const entry = /^ {4}'((?:[^'\\]|\\.)+)': '((?:[^'\\]|\\.)+)',/.exec(line);
    if (root && entry) {
      table[root][entry[1].replace(/\\'/g, "'")] = entry[2].replace(/\\'/g, "'");
    }
  }
  return table;
}

const FOIL_OVERRIDES = readFoilOverrides();

function getDeterministicFoil(sampleId, options) {
  if (!options || options.length === 0) return undefined;
  let hash = 0;
  for (let i = 0; i < sampleId.length; i++) {
    hash = sampleId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return options[Math.abs(hash) % options.length];
}

function resolveFoilContrast(sampleId, contrasts, root) {
  if (!contrasts || contrasts.length === 0) return undefined;
  const pinned = FOIL_OVERRIDES[root]?.[sampleId];
  if (pinned) {
    const match = contrasts.find(
      (c) => c.contrastClass.trim().toLowerCase() === pinned.trim().toLowerCase()
    );
    if (match) return match;
  }
  return sampleId ? getDeterministicFoil(sampleId, contrasts) : contrasts[0];
}

// ─── Component Extraction ─────────────────────────────────────────────────────

function extractComponents(sample, xai, domain, root) {
  if (!sample || !sample.models) return [];
  const models = sample.models;
  const isBird = domain === 'bird';
  const isV7 = root === 'data_v7' || root === 'data_v8';
  let fields = [];

  // 1. Similes
  if (xai.startsWith('similes')) {
    const isActv = xai.includes('actv');
    const modelKey = isActv
      ? `fused_simile_${domain}_activations`
      : `fused_simile_${domain}`;
    const fallbackKey = isActv
      ? 'lf_cbm_similes_adapted_activations'
      : 'lf_cbm_similes_adapted';
    const model = models[modelKey] || models[fallbackKey];
    if (model && model.concepts) {
      let concepts = [...model.concepts];
      if (isActv) {
        concepts.sort((a, b) => (b.activation ?? 0) - (a.activation ?? 0));
      } else {
        concepts.sort((a, b) => Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0));
      }
      fields = concepts.slice(0, 5).map((c) => {
        let text = c.concept;
        if (negativeWeightsAsNot(root) && (c.head_weight ?? 0) < 0) {
          text = 'NOT ' + text;
        }
        return text;
      });
    }
    while (fields.length < 5) fields.push('');
  }
  // 2. Onomatopoeia
  else if (xai.startsWith('onomatopoeia')) {
    const isActv = xai.includes('actv');
    const modelKey = isActv
      ? `fused_onomatopoeia_${domain}_activations`
      : `fused_onomatopoeia_${domain}`;
    const fallbackKey = isActv
      ? 'lf_cbm_onomatopoeia_adapted_activations'
      : 'lf_cbm_onomatopoeia_adapted';
    const model = models[modelKey] || models[fallbackKey];
    if (model && model.concepts) {
      let concepts = [...model.concepts];
      if (isActv) {
        concepts.sort((a, b) => (b.activation ?? 0) - (a.activation ?? 0));
      } else {
        concepts.sort((a, b) => Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0));
      }
      fields = concepts.slice(0, 5).map((c) => {
        let text = prettifyOnomatopoeia(c.concept);
        if (negativeWeightsAsNot(root) && (c.head_weight ?? 0) < 0) {
          text = 'NOT ' + text;
        }
        return text;
      });
    }
    while (fields.length < 5) fields.push('');
  }
  // 3. RexNet / Cues
  // Field 6: counterfactual class
  // Then pairs of (cue name, predicted relation)
  else if (xai === 'rexnet') {
    const model = models.rexnet;
    let foilClass = '';
    let cuePairs = [];
    if (model && model.explanation_md) {
      const report = parseRexnetReport(model.explanation_md, model.class_exemplars);
      const foil = resolveFoilContrast(sample.sample_id, report.contrasts, root);
      if (foil) {
        foilClass = foil.contrastClass || '';
        if (foil.cues) {
          const visibleCues = filterVisibleCues(foil.cues, isBird, isV7);
          cuePairs = visibleCues.slice(0, 5).flatMap((cue) => {
            const prettyName = prettifyCueName(cue.cue, isBird, isV7);
            return [prettyName, cue.predictedRelation || ''];
          });
        }
      }
    }
    while (cuePairs.length < 10) cuePairs.push('');
    fields = [foilClass, ...cuePairs];
  }
  // 4. Examples (Proto)
  // Triples of (class, audio url on s3, similarity)
  else if (xai === 'examples') {
    const model = models.proto;
    let protoTuples = [];
    if (model && model.prototypes) {
      let prototypes = [...model.prototypes];
      prototypes.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
      protoTuples = prototypes.slice(0, 5).flatMap((p) => {
        const cls = p.proto_class || '';
        const audio = p.audio || '';
        const sim = typeof p.similarity === 'number' ? p.similarity.toFixed(2) : (p.similarity ? String(p.similarity) : '');
        return [cls, audio, sim];
      });
    }
    while (protoTuples.length < 15) protoTuples.push('');
    fields = protoTuples;
  }
  // 5. NoXAI
  else {
    fields = ['', '', '', '', ''];
  }

  return fields.map((s) => (s ?? '').replace(/[\t\r\n]+/g, ' ').trim());
}

// Mirrors modelKeyForXai in src/app/study/dataV1.ts
function modelKeyForXai(domain, xai) {
  if (xai.startsWith('onomatopoeia')) return `fused_onomatopoeia_${domain}`;
  if (xai.startsWith('similes')) return `fused_simile_${domain}`;
  if (xai === 'rexnet') return 'rexnet';
  if (xai === 'examples') return 'proto';
  return undefined;
}

const manifest = JSON.parse(fs.readFileSync(path.join(DATA_V1, 'manifest.json'), 'utf8'));

// Parses a training.csv/testing.csv split file into domain -> ordered sample_id[].
function parseSplitCsv(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const header = lines[0].split(',').map((c) => c.trim().toLowerCase());
  const hasHeader = header.includes('sample_id');
  const col = hasHeader
    ? { domain: header.indexOf('domain'), id: header.indexOf('sample_id') }
    : { domain: 0, id: 1 };

  const idsByDomain = new Map();
  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = line.split(',');
    const domain = cells[col.domain]?.trim();
    const sampleId = cells[col.id]?.trim();
    if (!domain || !sampleId) continue;
    if (!idsByDomain.has(domain)) idsByDomain.set(domain, []);
    idsByDomain.get(domain).push(sampleId);
  }
  return idsByDomain;
}

// Builds the formative.tsv rows for one domain from the formative id pool
function buildFormativeRows(domain, ids, samplesById, predictionsById, trueLabelById) {
  const conditions = FORMATIVE_CONDITIONS;
  const nCond = conditions.length;

  const predFor = (id, xai) => {
    const modelKey = modelKeyForXai(domain, xai);
    return modelKey ? (predictionsById.get(id)?.[modelKey] ?? '') : '';
  };

  const classOrder = [];
  for (const id of ids) {
    const t = trueLabelById.get(id) ?? '';
    if (!classOrder.includes(t)) classOrder.push(t);
  }

  const baseXai = conditions[0];
  const blocks = new Map();
  for (const id of ids) {
    const t = trueLabelById.get(id) ?? '';
    if (!blocks.has(t)) blocks.set(t, []);
    blocks.get(t).push({ id, wrong: predFor(id, baseXai) !== t });
  }

  const assignment = new Map(conditions.map((c) => [c, new Map()]));
  classOrder.forEach((cls, j) => {
    const members = blocks.get(cls) ?? [];
    const wrongIds = members.filter((m) => m.wrong).map((m) => m.id);
    const correctIds = members.filter((m) => !m.wrong).map((m) => m.id);
    const designated = conditions[Math.min(j, nCond - 1)];
    if (wrongIds.length !== 1 || correctIds.length !== nCond - 1) {
      console.warn(
        `  ! ${domain}/${cls}: expected 1 wrong + ${nCond - 1} correct, got ` +
          `${wrongIds.length} wrong / ${correctIds.length} correct`,
      );
    }
    assignment.get(designated).set(cls, wrongIds[0]);
    conditions
      .filter((c) => c !== designated)
      .forEach((c, k) => assignment.get(c).set(cls, correctIds[k]));
  });

  const rawRows = [];
  let maxCols = 0;
  for (const xai of conditions) {
    for (const cls of classOrder) {
      const id = assignment.get(xai).get(cls);
      if (id === undefined) continue;
      const aiPrediction = predFor(id, xai);
      const trueLabel = trueLabelById.get(id) ?? '';
      const sample = samplesById.get(id);
      const compCols = extractComponents(sample, xai, domain, DATA_ROOT_NAME);
      const rowCols = [id, domain, xai, aiPrediction, trueLabel, ...compCols];
      if (rowCols.length > maxCols) maxCols = rowCols.length;
      rawRows.push(rowCols);
    }
  }

  // Pad all formative rows to maxCols so the TSV table has uniform column count
  return rawRows.map((cols) => {
    while (cols.length < maxCols) cols.push('');
    return cols.join('\t');
  });
}

// Generates the per-domain x per-condition TSVs for one split
function generateForSplit(splitIdsByDomain, splitDir) {
  for (const domain of manifest.domains) {
    const ids = splitIdsByDomain.get(domain);
    if (!ids || ids.length === 0) continue;

    const core = JSON.parse(fs.readFileSync(path.join(DATA_V1, domain, 'core_samples.json'), 'utf8'));
    const trueLabelById = new Map(core.map((s) => [s.sample_id, s.true_label]));

    const samplesById = new Map();
    const predictionsById = new Map();
    for (const id of ids) {
      const samplePath = path.join(DATA_V1, domain, 'samples', `${id}.json`);
      const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
      samplesById.set(id, sample);
      const byModelKey = {};
      for (const [modelKey, model] of Object.entries(sample.models ?? {})) {
        if (model && typeof model === 'object' && 'predicted_label' in model) {
          byModelKey[modelKey] = model.predicted_label;
        }
      }
      predictionsById.set(id, byModelKey);
    }

    const outDir = path.join(OUT_ROOT, splitDir, domain);
    fs.mkdirSync(outDir, { recursive: true });

    for (const xai of XAI_CONDITIONS) {
      const modelKey = modelKeyForXai(domain, xai);
      const outPath = path.join(outDir, `${xai}.tsv`);
      const rows = ids.map((id) => {
        const aiPrediction = modelKey ? (predictionsById.get(id)[modelKey] ?? '') : '';
        const trueLabel = trueLabelById.get(id) ?? '';
        const sample = samplesById.get(id);
        const compCols = extractComponents(sample, xai, domain, DATA_ROOT_NAME);
        return [id, domain, xai, aiPrediction, trueLabel, ...compCols].join('\t');
      });
      fs.writeFileSync(outPath, rows.join('\n') + '\n');
      console.log(`${path.relative(__dirname, outPath)}: ${ids.length} rows`);
    }

    if (splitDir === 'test-formative') {
      const formativeRows = buildFormativeRows(domain, ids, samplesById, predictionsById, trueLabelById);
      if (formativeRows.length > 0) {
        const outPath = path.join(outDir, 'formative.tsv');
        fs.writeFileSync(outPath, formativeRows.join('\n') + '\n');
        console.log(`${path.relative(__dirname, outPath)}: ${formativeRows.length} rows`);
      }
    }
  }
}

if (parseFloat(VERSION.replace(/^v/i, '')) < 6) {
  generateForSplit(parseSplitCsv(path.join(DATA_V1, 'testing.csv')), 'test');
  generateForSplit(parseSplitCsv(path.join(DATA_V1, 'training.csv')), 'train');
} else {
  generateForSplit(parseSplitCsv(path.join(DATA_V1, 'testing-formative.csv')), 'test-formative');
  generateForSplit(parseSplitCsv(path.join(DATA_V1, 'training-formative.csv')), 'train-formative');
  generateForSplit(parseSplitCsv(path.join(DATA_V1, 'testing.csv')), 'test');
  generateForSplit(parseSplitCsv(path.join(DATA_V1, 'training.csv')), 'train');
  generateForSplit(parseSplitCsv(path.join(DATA_V1, 'post-test.csv')), 'post-test');
}
