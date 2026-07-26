// Regenerates src/app/study/foilOverrides.ts — the locked-in counterfactual
// (contrast) class for every sample listed in a bundle's split CSVs.
//
//   node dev/gen_foil_overrides.mjs
//
// By default each sample keeps the class the old getDeterministicFoil() hash
// picked, and any value already present in the current foilOverrides.ts wins,
// so re-running after a bundle refresh never silently re-aims a sample that
// has already been pinned (or hand-edited). Pass --reset to ignore the
// existing table and re-derive every entry from the hash.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(repoRoot, 'public');
const OUT_FILE = path.join(repoRoot, 'src', 'app', 'study', 'foilOverrides.ts');
const DOMAINS = ['lung', 'bird'];
const keepExisting = !process.argv.includes('--reset');

// Mirrors getDeterministicFoil() in src/app/components/cues/CuesExplanationV1.tsx.
function hashPick(sampleId, options) {
  let hash = 0;
  for (let i = 0; i < sampleId.length; i++) {
    hash = sampleId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return options[Math.abs(hash) % options.length];
}

// Contrast classes, in report order, from a rexnet explanation_md.
function contrastsOf(md) {
  const out = [];
  const re = /^### Target vs\. Contrast Concept: `([^`]+)`/gm;
  let m;
  while ((m = re.exec(md)) !== null) out.push(m[1]);
  return out;
}

// Same column handling as loadSplitSamples() in src/app/study/dataV1.ts.
function readSplitCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map((c) => c.trim().toLowerCase());
  const hasHeader = header.includes('sample_id');
  const domainCol = hasHeader ? header.indexOf('domain') : 0;
  const idCol = hasHeader ? header.indexOf('sample_id') : 1;
  const rows = [];
  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = line.split(',');
    const domain = cells[domainCol]?.trim();
    const sampleId = cells[idCol]?.trim();
    if (!domain || !sampleId || !DOMAINS.includes(domain)) continue;
    rows.push({ domain, sampleId });
  }
  return rows;
}

// Parses the current table back out of foilOverrides.ts (root -> id -> class),
// so hand-edited pins survive a regeneration.
function readExistingTable() {
  if (!keepExisting || !fs.existsSync(OUT_FILE)) return {};
  const text = fs.readFileSync(OUT_FILE, 'utf8');
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
    if (root && entry) table[root][entry[1].replace(/\\'/g, "'")] = entry[2].replace(/\\'/g, "'");
  }
  return table;
}

const existing = readExistingTable();
const q = (s) => `'${s.replace(/'/g, "\\'")}'`;

const roots = fs
  .readdirSync(PUBLIC_DIR)
  .filter((d) => /^data_v/.test(d) && fs.statSync(path.join(PUBLIC_DIR, d)).isDirectory())
  .sort();

const perRoot = [];
const warnings = [];

for (const root of roots) {
  const csvs = fs
    .readdirSync(path.join(PUBLIC_DIR, root))
    .filter((f) => f.endsWith('.csv') && /^(training|testing|post-test)/.test(f))
    .sort();
  if (csvs.length === 0) continue;

  // sample -> which split lists it appears in (a sample can be in several).
  const splitsById = new Map();
  for (const csv of csvs) {
    for (const { domain, sampleId } of readSplitCsv(path.join(PUBLIC_DIR, root, csv))) {
      const key = `${domain}\t${sampleId}`;
      const entry = splitsById.get(key) ?? { domain, sampleId, splits: [] };
      entry.splits.push(csv.replace(/\.csv$/, ''));
      splitsById.set(key, entry);
    }
  }

  const rows = [];
  for (const { domain, sampleId, splits } of splitsById.values()) {
    const sampleFile = path.join(PUBLIC_DIR, root, domain, 'samples', `${sampleId}.json`);
    if (!fs.existsSync(sampleFile)) {
      warnings.push(`${root}/${domain}: no sample json for ${sampleId}`);
      continue;
    }
    const md = JSON.parse(fs.readFileSync(sampleFile, 'utf8')).models?.rexnet?.explanation_md;
    if (!md) continue; // no cues condition for this sample — nothing to pin
    const contrasts = contrastsOf(md);
    if (contrasts.length === 0) continue;

    const pinned = existing[root]?.[sampleId];
    const kept =
      pinned && contrasts.some((c) => c.toLowerCase() === pinned.toLowerCase())
        ? contrasts.find((c) => c.toLowerCase() === pinned.toLowerCase())
        : undefined;
    if (pinned && !kept) {
      warnings.push(
        `${root}/${domain}: pinned foil "${pinned}" for ${sampleId} is not a contrast class ` +
          `(${contrasts.join(', ')}) — re-derived from the hash`
      );
    }
    rows.push({ domain, sampleId, splits, foil: kept ?? hashPick(sampleId, contrasts) });
  }
  if (rows.length > 0) perRoot.push({ root, rows });
}

let out = `// Locked-in counterfactual (contrast) class per study sample.
//
// The cues condition shows exactly one contrast class out of the several the
// RExNet report carries. That pick used to come from getDeterministicFoil():
// stable for a given sample id, but arbitrary, and it silently moves when a
// bundle's contrast list changes (the same clip picks a different foil in
// data_v6 than in data_v1 whenever the predicted class differs). This table
// pins the choice for every sample listed in a bundle's split CSVs
// (training / testing / post-test and their *-formative variants), so the
// study shows the same counterfactual on every run and every rebuild.
//
// Keys: bundle root -> sample id -> contrast class. A value must name one of
// that sample's contrast classes (matched case-insensitively); an unknown or
// missing entry falls back to the deterministic hash, so a partial table is
// safe. Hand-edit a value to re-aim one sample at a different counterfactual.
//
// Generated by dev/gen_foil_overrides.mjs, which preserves existing values —
// regenerating after a bundle refresh only adds the samples that are new.

export const FOIL_OVERRIDES: Record<string, Record<string, string>> = {
`;

for (const { root, rows } of perRoot) {
  out += `  ${q(root)}: {\n`;
  for (const domain of DOMAINS) {
    const domainRows = rows
      .filter((r) => r.domain === domain)
      .sort(
        (a, b) =>
          a.splits.join().localeCompare(b.splits.join()) || a.sampleId.localeCompare(b.sampleId)
      );
    if (domainRows.length === 0) continue;
    out += `    // ── ${domain} ──\n`;
    for (const r of domainRows) {
      out += `    ${q(r.sampleId)}: ${q(r.foil)}, // ${r.splits.join(', ')}\n`;
    }
  }
  out += `  },\n`;
}

out += `};

/** The pinned counterfactual class for a study sample, or undefined when the
 *  sample is not in the table (dev browsing outside the split CSVs, or a
 *  bundle that ships no split lists). Callers fall back to the hash. */
export function pinnedFoilClass(
  root: string | undefined,
  sampleId: string | undefined
): string | undefined {
  if (!root || !sampleId) return undefined;
  return FOIL_OVERRIDES[root]?.[sampleId];
}
`;

fs.writeFileSync(OUT_FILE, out);
for (const w of warnings) console.warn('warning:', w);
console.log(
  `wrote ${path.relative(repoRoot, OUT_FILE)} — ` +
    perRoot.map(({ root, rows }) => `${root}: ${rows.length}`).join(', ')
);
