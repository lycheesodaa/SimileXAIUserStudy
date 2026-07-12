#!/usr/bin/env node
// Regenerates the per-class concept Loop & Merge tables from the v1 study
// bundle's concept files (data_v1/<domain>/concepts/<set>.json).
//
// One TSV per domain x concept set: dev/loop-and-merge-concepts-<domain>-<set>.tsv
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
// Usage: node dev/generate-concept-loop-and-merge.cjs
const fs = require('fs');
const path = require('path');

const DATA_V1 = path.join(__dirname, '..', 'public', 'data_v1');
const CONCEPT_SETS = ['similes', 'onomatopoeia'];

const prettifyOnomatopoeia = (concept) =>
  concept.replace(/_gemini_tts$/, '').replace(/_/g, ' ');

// Hand-picked exemplar recording per class; the row's Field 2 is the sample's
// hosted audio URL, read from its data_v1 sample JSON.
const EXEMPLAR_SAMPLES = {
  lung: {
    Crackle: 'hflung_trunc_2019-07-17-11-06-06-L2_9_15',
    Normal: 'icbhi_116_1b2_Pl_sc_Meditron_3',
    Rhonchi: 'hflung_trunc_2019-07-16-11-46-52-L5_11_18',
    Stridor: 'hflung_trunc_2019-05-28-14-44-45-L5_5_12',
    Wheeze: 'fraiwan_140',
  },
  bird: {
    'Black-capped Chickadee': 'bird_Recording_4_Recording_4_Segment_22_263',
    'Eastern Towhee': 'bird_Recording_4_Recording_4_Segment_09_140',
    Ovenbird: 'bird_Recording_1_Recording_1_Segment_24_4',
    'Tufted Titmouse': 'bird_Recording_1_Recording_1_Segment_23_10',
    'Wood Thrush': 'bird_Recording_2_Recording_2_Segment_04_25',
  },
};

function exemplarAudioUrl(domain, category) {
  const id = EXEMPLAR_SAMPLES[domain]?.[category];
  if (!id) throw new Error(`${domain}: no exemplar sample configured for ${category}`);
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

    const outPath = path.join(__dirname, `loop-and-merge-concepts-${domain}-${set}.tsv`);
    fs.writeFileSync(outPath, rows.join('\n') + '\n');
    console.log(`${path.basename(outPath)}: ${rows.length} rows`);
  }
}
