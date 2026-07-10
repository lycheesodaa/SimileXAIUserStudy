#!/usr/bin/env node
// Regenerates the Qualtrics Loop & Merge tables from the v1 study bundle.
//
// One TSV per domain x condition: dev/loop-and-merge-<domain>-<xai>.tsv with
// rows "sampleId<TAB>domain<TAB>xai" (Field 1/2/3). Paste a file's contents
// into Block options -> Loop & Merge (static list) and pair it with the
// iframe snippet:
//   .../#/study/v1/${lm://Field/2}/test/${lm://Field/1}?pid=${e://Field/PROLIFIC_PID}&xai=${lm://Field/3}
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
  'rexnet',
  'examples',
  'noxai',
];

const manifest = JSON.parse(fs.readFileSync(path.join(DATA_V1, 'manifest.json'), 'utf8'));

for (const domain of manifest.domains) {
  const core = JSON.parse(fs.readFileSync(path.join(DATA_V1, domain, 'core_samples.json'), 'utf8'));
  const ids = core.map((s) => s.sample_id);
  for (const xai of XAI_CONDITIONS) {
    const outPath = path.join(__dirname, `loop-and-merge-${domain}-${xai}.tsv`);
    fs.writeFileSync(outPath, ids.map((id) => `${id}\t${domain}\t${xai}`).join('\n') + '\n');
    console.log(`${path.basename(outPath)}: ${ids.length} rows`);
  }
}
