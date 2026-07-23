#!/usr/bin/env node
// Regenerates the Qualtrics Loop & Merge tables from a versioned study bundle.
//
// One TSV per split x domain x condition:
//   dev/loop-and-merge/<version>/test/<domain>/<xai>.tsv   (testing.csv)
//   dev/loop-and-merge/<version>/train/<domain>/<xai>.tsv  (training.csv)
// with rows "sampleId<TAB>domain<TAB>xai<TAB>aiPrediction<TAB>trueLabel"
// (Field 1-5). aiPrediction/trueLabel are for experimenter analysis only —
// never surface them in the Qualtrics-facing iframe URL. Paste a file's
// contents into Block options -> Loop & Merge (static list) and pair it with
// the iframe snippet:
//   .../#/study/<version>/${lm://Field/2}/test/${lm://Field/1}?pid=${e://Field/PROLIFIC_PID}&xai=${lm://Field/3}
// (swap /test/ for /train/ for the training.csv-derived files).
//
// Mirrors loadSplitSamples in src/app/study/dataV1.ts: training.csv and
// testing.csv at the bundle root each list domain,sample_id rows that
// restrict which core samples belong to that split; only those ids are
// emitted here.
//
// XAI_CONDITIONS mirrors the xaiVariants keys in makeV1Domain
// (src/app/study/domainRegistry.tsx) — keep the two in sync when a variant is
// added, renamed or retired there.
//
// Usage: node dev/generate-loop-and-merge.cjs [version]   (default: v1)
const fs = require('fs');
const path = require('path');

const VERSION = process.argv[2] || 'v1';
const ROOT = path.join(__dirname, '..');
const DATA_V1 = path.join(ROOT, 'public', `data_${VERSION}`);
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
// Order matters: it drives the diagonal wrong-pick assignment below and the
// row order of the emitted formative.tsv. Keep it a subset of XAI_CONDITIONS.
const FORMATIVE_CONDITIONS = ['similes', 'onomatopoeia', 'examples', 'rexnet'];

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

// Builds the formative.tsv rows for one domain from the formative id pool,
// replacing the old hand-authored template. The pool (testing-formative.csv,
// via `ids`) is one block of N_cond samples per class; within each block
// exactly one sample is a wrong prediction and the rest are correct.
//
// Selection rule (reproduces the original hand-built formative.tsv exactly):
//   * One sample per class is taken from each condition -> class-balanced, and
//     every pool sample is used exactly once (a partition).
//   * Wrong pick sits on a diagonal: condition c receives the WRONG sample for
//     class c; with more classes than conditions the LAST condition absorbs the
//     overflow classes (so it carries >1 wrong).
//   * The block's correct samples go to the remaining conditions, in fixed
//     condition order matched to ascending pool (source) order.
//   * Emit iterates conditions, then classes (= ascending pool order).
function buildFormativeRows(domain, ids, predictionsById, trueLabelById) {
  const conditions = FORMATIVE_CONDITIONS;
  const nCond = conditions.length;

  const predFor = (id, xai) => {
    const modelKey = modelKeyForXai(domain, xai);
    return modelKey ? (predictionsById.get(id)?.[modelKey] ?? '') : '';
  };

  // Class order = order of first appearance of the true label across the pool.
  const classOrder = [];
  for (const id of ids) {
    const t = trueLabelById.get(id) ?? '';
    if (!classOrder.includes(t)) classOrder.push(t);
  }

  // Per-class blocks in pool order; wrongness read from the first condition
  // (the curated pool shares the same wrong sample across conditions).
  const baseXai = conditions[0];
  const blocks = new Map();
  for (const id of ids) {
    const t = trueLabelById.get(id) ?? '';
    if (!blocks.has(t)) blocks.set(t, []);
    blocks.get(t).push({ id, wrong: predFor(id, baseXai) !== t });
  }

  // assignment: condition -> Map(class -> sampleId)
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

  const rows = [];
  for (const xai of conditions) {
    for (const cls of classOrder) {
      const id = assignment.get(xai).get(cls);
      if (id === undefined) continue;
      const aiPrediction = predFor(id, xai);
      const trueLabel = trueLabelById.get(id) ?? '';
      rows.push(`${id}\t${domain}\t${xai}\t${aiPrediction}\t${trueLabel}`);
    }
  }
  return rows;
}

// Generates the per-domain x per-condition TSVs for one split, under
// dev/loop-and-merge/<splitDir>/<domain>/<xai>.tsv.
function generateForSplit(splitIdsByDomain, splitDir) {
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

    const outDir = path.join(OUT_ROOT, splitDir, domain);
    fs.mkdirSync(outDir, { recursive: true });

    for (const xai of XAI_CONDITIONS) {
      const modelKey = modelKeyForXai(domain, xai);
      const outPath = path.join(outDir, `${xai}.tsv`);
      const rows = ids.map((id) => {
        const aiPrediction = modelKey ? (predictionsById.get(id)[modelKey] ?? '') : '';
        const trueLabel = trueLabelById.get(id) ?? '';
        return `${id}\t${domain}\t${xai}\t${aiPrediction}\t${trueLabel}`;
      });
      fs.writeFileSync(outPath, rows.join('\n') + '\n');
      console.log(`${path.relative(__dirname, outPath)}: ${ids.length} rows`);
    }

    if (splitDir === 'test-formative') {
      const formativeRows = buildFormativeRows(domain, ids, predictionsById, trueLabelById);
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
