#!/usr/bin/env node
// Regenerates the per-class concept Loop & Merge tables from a versioned
// study bundle's concept files (data_<version>/<domain>/concepts/<set>.json).
//
// One TSV per domain x concept set:
//   dev/loop-and-merge-concepts-<version>-<domain>-<set>.tsv
// with one row per class:
//   Field 1      class name
//   Field 2      exemplar recording URL for the class (see EXEMPLAR_SAMPLES)
//   Field 3-12   the class's 10 concepts (similes verbatim; onomatopoeia
//                prettified the way the UI renders them, mirroring
//                prettifyOnomatopoeia in src/app/study/dataV1.ts)
//   Field 13-22  the matching generated-audio URLs, same order
// Class order and within-class concept order follow the JSON file, which is
// also the order ConceptCheatsheet shows participants.
//
// Usage: node dev/generate-concept-loop-and-merge.cjs [version]   (default: v1)
const fs = require('fs');
const path = require('path');

const VERSION = process.argv[2] || 'v1';
const DATA_V1 = path.join(__dirname, '..', 'public', `data_${VERSION}`);
const CONCEPT_SETS = ['similes', 'onomatopoeia'];

const prettifyOnomatopoeia = (concept) =>
  concept.replace(/_gemini_tts$/, '').replace(/_/g, ' ');

// Exemplar recording per class, pulled from the data version's training.csv;
// the row's Field 2 is the sample's hosted audio URL, read from its sample JSON.
function loadExemplarsFromTrainingCsv() {
  const csvPath = path.join(DATA_V1, 'training.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`training.csv not found for version ${VERSION} at ${csvPath}`);
  }
  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return {};

  const header = lines[0].split(',').map((c) => c.trim().toLowerCase());
  const hasHeader = header.includes('sample_id');
  const col = hasHeader
    ? { domain: header.indexOf('domain'), id: header.indexOf('sample_id') }
    : { domain: 0, id: 1 };

  const exemplars = {};
  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = line.split(',');
    const domain = cells[col.domain]?.trim();
    const sampleId = cells[col.id]?.trim();
    if (!domain || !sampleId) continue;

    const samplePath = path.join(DATA_V1, domain, 'samples', `${sampleId}.json`);
    if (!fs.existsSync(samplePath)) {
      throw new Error(`${domain}/${sampleId}: listed in training.csv but sample JSON not found at ${samplePath}`);
    }
    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
    if (!sample.true_label) {
      throw new Error(`${domain}/${sampleId}: sample JSON has no true_label`);
    }
    const category = sample.true_label;
    if (!exemplars[domain]) exemplars[domain] = {};
    if (exemplars[domain][category]) {
      throw new Error(
        `${domain}: training.csv has multiple samples configured for category "${category}" (${exemplars[domain][category]} and ${sampleId})`
      );
    }
    exemplars[domain][category] = sampleId;
  }
  return exemplars;
}

const EXEMPLAR_SAMPLES = loadExemplarsFromTrainingCsv();

function exemplarAudioUrl(domain, category) {
  const id = EXEMPLAR_SAMPLES[domain]?.[category];
  if (!id) throw new Error(`${domain}: no exemplar sample configured in training.csv for ${category}`);
  const sample = JSON.parse(
    fs.readFileSync(path.join(DATA_V1, domain, 'samples', `${id}.json`), 'utf8')
  );
  if (!sample.audio) throw new Error(`${domain}/${id}: sample JSON has no audio URL`);
  if (sample.true_label !== category) {
    throw new Error(`${domain}/${id}: true_label ${sample.true_label} != ${category}`);
  }
  return sample.audio;
}

const manifest = JSON.parse(fs.readFileSync(path.join(DATA_V1, 'manifest.json'), 'utf8'));

for (const domain of manifest.domains) {
  for (const set of CONCEPT_SETS) {
    const entries = JSON.parse(
      fs.readFileSync(path.join(DATA_V1, domain, 'concepts', `${set}.json`), 'utf8')
    );

    // Group by class, preserving file order (first appearance) both for the
    // class rows and the concepts within each row.
    const byCategory = new Map();
    for (const e of entries) {
      const list = byCategory.get(e.category) ?? [];
      list.push(e);
      byCategory.set(e.category, list);
    }

    const rows = [...byCategory.entries()].map(([category, list]) => {
      if (list.length !== 10) {
        throw new Error(`${domain}/${set}: ${category} has ${list.length} concepts, expected 10`);
      }
      const texts = list.map((e) =>
        set === 'onomatopoeia' ? prettifyOnomatopoeia(e.concept) : e.concept
      );
      const audio = list.map((e) => e.audio);
      return [category, exemplarAudioUrl(domain, category), ...texts, ...audio].join('\t');
    });

    const outPath = path.join(__dirname, `loop-and-merge-concepts-${VERSION}-${domain}-${set}.tsv`);
    fs.writeFileSync(outPath, rows.join('\n') + '\n');
    console.log(`${path.basename(outPath)}: ${rows.length} rows`);
  }
}
