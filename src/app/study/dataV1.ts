// Data access for the modular v1 study bundle under public/data_v1/:
//   data_v1/<domain>/samples/<sampleId>.json   one file per sample, all models
//   data_v1/<domain>/concepts/<set>.json       shared concept -> audio lookup
//   data_v1/<domain>/core_samples.json         the study sample list
// Sample ids are opaque (no class labels), so they are safe in Qualtrics URLs.
// All audio URLs in the bundle are absolute S3 URLs.

export interface V1FusedConcept {
  concept: string;
  category: string;
  activation: number;
  head_weight: number;
  contribution: number;
}

export interface V1FusedModel {
  family: string;
  concept_set: 'similes' | 'onomatopoeia';
  predicted_label: string;
  /** Whether predicted_label == the clip's true label. */
  correct?: boolean;
  /** Fraction of top-5 highest-activation concepts whose category matches the
   *  true label; quantized to k/5. See UI_GUIDELINES.md §4. */
  faithful?: number;
  // Sorted by |contribution| descending in the bundle.
  concepts: V1FusedConcept[];
}

export interface V1BetaBreakdownConcept {
  concept: string;
  category: string;
  clap_z: number;
  beats_z: number;
  /** = clap_weight * clap_z + beats_weight * beats_z (verified across bundle). */
  fused: number;
}

export interface V1BetaBreakdownModel {
  beta: number;
  clap_weight: number;
  beats_weight: number;
  concepts: V1BetaBreakdownConcept[];
}

export interface V1AttrBreakdownConcept {
  concept: string;
  category: string;
  /** Identical to the fused model's activation (the deployed head input). */
  activation: number;
  clap_attribution: number;
  beats_attribution: number;
  clap_share: number;
  /** = clap_attribution × head_weight; clap + beats == the fused model's
   *  contribution exactly (verified across bundle). */
  clap_contribution: number;
  beats_contribution: number;
}

/** Approximate branch attribution of the deployed cos³ CBL activation
 *  (decomposition: "approx_activation_split") — unlike the beta breakdown,
 *  this reconciles exactly with the plain fused view. */
export interface V1AttrBreakdownModel {
  beta: number;
  clap_weight: number;
  beats_weight: number;
  decomposition: string;
  concepts: V1AttrBreakdownConcept[];
}

export interface V1Prototype {
  rank: number;
  proto_class: string;
  similarity: number;
  weight: number;
  contribution: number;
  source: string;
  audio: string;
}

export interface V1ProtoModel {
  family: string;
  predicted_label: string;
  confidence: number;
  prototypes: V1Prototype[];
}

export interface V1RexnetModel {
  family: string;
  predicted_label: string;
  consensus_label: string;
  confidence: number;
  explanation_md: string;
}

export interface V1Sample {
  sample_id: string;
  domain: string;
  audio: string;
  models: Record<string, unknown> & {
    rexnet?: V1RexnetModel;
    proto?: V1ProtoModel;
  };
}

export interface ConceptEntry {
  concept: string;
  category: string;
  audio: string;
}

export type ConceptSet = 'similes' | 'onomatopoeia';

// Fused model keys are domain-suffixed in the bundle (note: "simile", singular).
export const fusedModelKey = (domain: string, set: ConceptSet): string =>
  set === 'similes' ? `fused_simile_${domain}` : `fused_onomatopoeia_${domain}`;

export const betaBreakdownModelKey = (domain: string, set: ConceptSet): string =>
  set === 'similes'
    ? `fused_beta_breakdown_simile_${domain}`
    : `fused_beta_breakdown_onomatopoeia_${domain}`;

export const attrBreakdownModelKey = (domain: string, set: ConceptSet): string =>
  set === 'similes'
    ? `fused_attr_breakdown_simile_${domain}`
    : `fused_attr_breakdown_onomatopoeia_${domain}`;

// Maps a study xai-condition key to the per-sample model key whose
// predicted_label / correct / faithful fields back it. All three simile
// conditions (plain, beta, attr) share the one fused simile model; likewise
// onomatopoeia. noxai has no model. Used by the dev navbar to surface the
// model's verdict — never shown to participants.
export const modelKeyForXai = (domain: string, xai: string): string | undefined => {
  if (xai.startsWith('onomatopoeia')) return fusedModelKey(domain, 'onomatopoeia');
  if (xai.startsWith('similes')) return fusedModelKey(domain, 'similes');
  if (xai === 'rexnet') return 'rexnet';
  if (xai === 'examples') return 'proto';
  return undefined; // noxai (audio only)
};

// The model's own decision + trust fields, as carried on each per-sample model
// object. `faithful` is absent for rexnet; both are absent for noxai.
export interface V1ModelVerdict {
  predictedLabel?: string;
  correct?: boolean;
  faithful?: number;
}

// "rattle_rattle_rattle_gemini_tts" -> "rattle rattle rattle"
export const prettifyOnomatopoeia = (concept: string): string =>
  concept.replace(/_gemini_tts$/, '').replace(/_/g, ' ');

// Bundle roots under public/. DATA_V1_TRAIN_ROOT is an optional sibling bundle
// with the same per-domain layout (samples/ + core_samples.json) holding the
// small practice subset shown in train mode; it may simply not exist yet, in
// which case its loaders resolve undefined and train mode shows no samples.
export const DATA_V1_ROOT = 'data_v1';
export const DATA_V1_TRAIN_ROOT = 'data_v1_train';
export type DataRoot = typeof DATA_V1_ROOT | typeof DATA_V1_TRAIN_ROOT;

const dataV1Url = (path: string, root: DataRoot = DATA_V1_ROOT): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${root}/${path}`;

// ─── Cached fetchers ─────────────────────────────────────────────────────────

const jsonCache = new Map<string, Promise<unknown | undefined>>();

// undefined on any failure (404, network, parse) — callers surface lookup_error.
function fetchJson<T>(url: string): Promise<T | undefined> {
  let pending = jsonCache.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((res) => (res.ok ? res.json() : undefined))
      .catch(() => undefined)
      .then((value) => {
        // Don't cache failures: a transient network error on one Qualtrics
        // page shouldn't poison later pages in the same iframe session.
        if (value === undefined) jsonCache.delete(url);
        return value;
      });
    jsonCache.set(url, pending);
  }
  return pending as Promise<T | undefined>;
}

export function loadSample(
  domain: string,
  sampleId: string,
  root: DataRoot = DATA_V1_ROOT
): Promise<V1Sample | undefined> {
  return fetchJson<V1Sample>(
    dataV1Url(`${domain}/samples/${encodeURIComponent(sampleId)}.json`, root)
  );
}

// core_samples.json rows carry more (meta, per-model flags); the dev browser
// only needs id + true label for its sample dropdown. Never used in study mode.
export interface CoreSampleInfo {
  sample_id: string;
  true_label: string;
}

export function loadCoreSamples(
  domain: string,
  root: DataRoot = DATA_V1_ROOT
): Promise<CoreSampleInfo[] | undefined> {
  return fetchJson<CoreSampleInfo[]>(dataV1Url(`${domain}/core_samples.json`, root));
}

export async function loadConcepts(
  domain: string,
  set: ConceptSet
): Promise<Map<string, ConceptEntry> | undefined> {
  const entries = await fetchJson<ConceptEntry[]>(dataV1Url(`${domain}/concepts/${set}.json`));
  if (!entries) return undefined;
  return new Map(entries.map((e) => [e.concept, e]));
}

// ─── RexNet report parsing ────────────────────────────────────────────────────
// rexnet ships a markdown report (explanation_md). We parse it into structured
// data instead of rendering it raw: the report embeds the true label and
// correctness verdicts, which must never reach the participant-facing DOM, and
// its <audio> tags reference files that are not hosted anywhere.

export interface RexnetCueRow {
  cue: string;
  targetValue: string;
  foilValue: string;
  heuristicRelation: string;
  predictedRelation: string;
  agree: boolean;
}

export interface RexnetContrast {
  contrastClass: string;
  prediction: string;
  confidencePct: number | null;
  cuesCorrect: number | null;
  cuesTotal: number | null;
  cues: RexnetCueRow[];
}

export interface RexnetReport {
  contrasts: RexnetContrast[];
}

const stripMd = (s: string): string => s.replace(/[`*]/g, '').trim();

export function parseRexnetReport(md: string): RexnetReport {
  const contrasts: RexnetContrast[] = [];
  // Split into per-contrast sections; the first chunk is the report preamble.
  const sections = md.split(/^### Target vs\. Contrast Concept: `([^`]+)`/m);
  for (let i = 1; i < sections.length; i += 2) {
    const contrastClass = sections[i];
    const body = sections[i + 1] ?? '';

    const predictionMatch = /\*\*Contrastive Prediction\*\*: `([^`]+)`(?:\s*\(Confidence: \*\*([\d.]+)%\*\*\))?/.exec(body);
    const accuracyMatch = /\*\*(\d+)\/(\d+) Cues Correct\*\*/.exec(body);

    const cues: RexnetCueRow[] = [];
    // Table rows: | **Cue** | `target` | `foil` | `heuristic` | `predicted` | **AGREE** |
    const rowRe = /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/gm;
    let row: RegExpExecArray | null;
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
      prediction: predictionMatch ? predictionMatch[1] : '',
      confidencePct: predictionMatch?.[2] ? parseFloat(predictionMatch[2]) : null,
      cuesCorrect: accuracyMatch ? parseInt(accuracyMatch[1], 10) : null,
      cuesTotal: accuracyMatch ? parseInt(accuracyMatch[2], 10) : null,
      cues,
    });
  }
  return { contrasts };
}
