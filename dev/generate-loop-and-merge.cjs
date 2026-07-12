#!/usr/bin/env node
// Regenerates the Qualtrics Loop & Merge tables from the v1 study bundle.
//
// One TSV per domain x condition: dev/loop-and-merge-<domain>-<xai>.tsv with
// rows "sampleId<TAB>domain<TAB>xai<TAB>aiPrediction<TAB>trueLabel"
// (Field 1-5). aiPrediction/trueLabel are for experimenter analysis only —
// never surface them in the Qualtrics-facing iframe URL. Paste a file's
// contents into Block options -> Loop & Merge (static list) and pair it with
// the iframe snippet:
//   .../#/study/v1/${lm://Field/2}/test/${lm://Field/1}?pid=${e://Field/PROLIFIC_PID}&xai=${lm://Field/3}
//
// If the optional practice bundle public/data_v1_train exists (same layout as
// data_v1), a second set dev/loop-and-merge-train-<domain>-<xai>.tsv is
// generated from it (pair those with .../train/... study URLs).
//
// Usage: node dev/generate-loop-and-merge.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_V1 = path.join(ROOT, 'public', 'data_v1');
const DATA_V1_TRAIN = path.join(ROOT, 'public', 'data_v1_train');
const XAI_CONDITIONS = [
  'similes',
  'onomatopoeia',
  'similes_dualview',
  'onomatopoeia_dualview',
  'similes_dualview_approx',
  'onomatopoeia_dualview_approx',
  'rexnet',
  'examples',
  'noxai',
];

// Mirrors modelKeyForXai in src/app/study/dataV1.ts: maps a study xai
// condition to the per-sample model key that backs its predicted_label.
// noxai has no backing model (audio only).
function modelKeyForXai(domain, xai) {
  if (xai.startsWith('onomatopoeia')) return `fused_onomatopoeia_${domain}`;
  if (xai.startsWith('similes')) return `fused_simile_${domain}`;
  if (xai === 'rexnet') return 'rexnet';
  if (xai === 'examples') return 'proto';
  return undefined;
}

const manifest = JSON.parse(fs.readFileSync(path.join(DATA_V1, 'manifest.json'), 'utf8'));

// Generates the per-domain x per-condition TSVs for one bundle root.
// filePrefix distinguishes the outputs (''
// for the main bundle, 'train-' for the practice subset).
function generateForRoot(dataRoot, filePrefix) {
  // The train bundle may ship without a manifest; fall back to the main
  // manifest's domains, keeping only those present in the bundle.
  const domains = manifest.domains.filter((d) =>
    fs.existsSync(path.join(dataRoot, d, 'core_samples.json'))
  );

  for (const domain of domains) {
    const core = JSON.parse(fs.readFileSync(path.join(dataRoot, domain, 'core_samples.json'), 'utf8'));
    const trueLabelById = new Map(core.map((s) => [s.sample_id, s.true_label]));
    const ids = core.map((s) => s.sample_id);

    // Cache per-sample model predictions, keyed by modelKey, loaded once per id.
    const predictionsById = new Map();
    for (const id of ids) {
      const samplePath = path.join(dataRoot, domain, 'samples', `${id}.json`);
      const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
      const byModelKey = {};
      for (const [modelKey, model] of Object.entries(sample.models ?? {})) {
        if (model && typeof model === 'object' && 'predicted_label' in model) {
          byModelKey[modelKey] = model.predicted_label;
        }
      }
      predictionsById.set(id, byModelKey);
    }

    for (const xai of XAI_CONDITIONS) {
      const modelKey = modelKeyForXai(domain, xai);
      const outPath = path.join(__dirname, `loop-and-merge-${filePrefix}${domain}-${xai}.tsv`);
      const rows = ids.map((id) => {
        const aiPrediction = modelKey ? (predictionsById.get(id)[modelKey] ?? '') : '';
        const trueLabel = trueLabelById.get(id) ?? '';
        return `${id}\t${domain}\t${xai}\t${aiPrediction}\t${trueLabel}`;
      });
      fs.writeFileSync(outPath, rows.join('\n') + '\n');
      console.log(`${path.basename(outPath)}: ${ids.length} rows`);
    }
  }
}

generateForRoot(DATA_V1, '');

if (fs.existsSync(DATA_V1_TRAIN)) {
  generateForRoot(DATA_V1_TRAIN, 'train-');
} else {
  console.log('public/data_v1_train not found — skipping train TSVs.');
}
