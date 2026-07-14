#!/usr/bin/env node
// Regenerates the Qualtrics Loop & Merge tables from the v1 study bundle.
//
// One TSV per domain x condition x split: dev/loop-and-merge-<domain>-<xai>.tsv
// (testing.csv) and dev/loop-and-merge-train-<domain>-<xai>.tsv (training.csv),
// with rows "sampleId<TAB>domain<TAB>xai<TAB>aiPrediction<TAB>trueLabel"
// (Field 1-5). aiPrediction/trueLabel are for experimenter analysis only —
// never surface them in the Qualtrics-facing iframe URL. Paste a file's
// contents into Block options -> Loop & Merge (static list) and pair it with
// the iframe snippet:
//   .../#/study/v1/${lm://Field/2}/test/${lm://Field/1}?pid=${e://Field/PROLIFIC_PID}&xai=${lm://Field/3}
// (swap /test/ for /train/ for the training.csv-derived files).
//
// Mirrors loadSplitSamples in src/app/study/dataV1.ts: training.csv and
// testing.csv at the data_v1 root each list domain,sample_id rows that
// restrict which core samples belong to that split; only those ids are
// emitted here.
//
// Usage: node dev/generate-loop-and-merge.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_V1 = path.join(ROOT, 'public', 'data_v1');
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

// Parses a training.csv/testing.csv split file into domain -> ordered
// sample_id[]. Header-aware (falls back to positional domain,sample_id
// columns), mirroring loadSplitSamples in src/app/study/dataV1.ts.
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

// Generates the per-domain x per-condition TSVs for one split.
// filePrefix distinguishes the outputs ('' for testing.csv, 'train-' for
// training.csv).
function generateForSplit(splitIdsByDomain, filePrefix) {
  for (const domain of manifest.domains) {
    const ids = splitIdsByDomain.get(domain);
    if (!ids || ids.length === 0) continue;

    const core = JSON.parse(fs.readFileSync(path.join(DATA_V1, domain, 'core_samples.json'), 'utf8'));
    const trueLabelById = new Map(core.map((s) => [s.sample_id, s.true_label]));

    // Cache per-sample model predictions, keyed by modelKey, loaded once per id.
    const predictionsById = new Map();
    for (const id of ids) {
      const samplePath = path.join(DATA_V1, domain, 'samples', `${id}.json`);
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

generateForSplit(parseSplitCsv(path.join(DATA_V1, 'testing.csv')), '');
generateForSplit(parseSplitCsv(path.join(DATA_V1, 'training.csv')), 'train-');
