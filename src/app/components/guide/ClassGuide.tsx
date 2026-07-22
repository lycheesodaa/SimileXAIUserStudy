import { useEffect, useState } from 'react';
import { SimileAudioPlayer } from '../similes/SimileExplanationV3';
import { ClassBadge } from '../ClassBadge';
import {
  ClassNote,
  ConceptSet,
  DATA_V1_ROOT,
  DataRoot,
  classNoteForLabel,
  loadClassNotes,
  loadSample,
  loadSplitSamples,
} from '../../study/dataV1';

// Guide-mode class familiarization: the training.csv samples (the former
// train mode, subsumed into guide) grouped per class, so users can review
// every class on a single static page. Consumed three ways: the standalone
// ClassGuide page section (rexnet-style class list), and via useClassSections
// by CuesPractice and ConceptCheatsheet, which weave the per-class example
// recordings into their own class listings.

export interface ClassSection {
  label: string;
  /** Brief class description from the bundle's markdown notes (only when a
   *  concept set was given and the bundle ships notes). */
  note?: ClassNote;
  /** sample id + resolved audio URL, in training.csv order. */
  clips: { sampleId: string; audio: string }[];
}

/** Loads the per-class training recordings (and, when `set` is given, the
 *  class descriptions from the bundle's markdown notes). undefined while
 *  loading or when the bundle has no training split. Pass an empty `domain`
 *  to disable (callers that only conditionally show the guide). */
export function useClassSections(
  domain: string,
  root: DataRoot = DATA_V1_ROOT,
  set?: ConceptSet
): ClassSection[] | undefined {
  const [sections, setSections] = useState<ClassSection[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setSections(undefined);
    if (!domain) return;
    (async () => {
      const [split, notes] = await Promise.all([
        loadSplitSamples(domain, 'train', root),
        set ? loadClassNotes(domain, set, root) : Promise.resolve(undefined),
      ]);
      if (!split) return; // bundle has no training split — nothing to show
      const samples = await Promise.all(split.map((s) => loadSample(domain, s.sample_id, root)));
      if (cancelled) return;
      const byLabel = new Map<string, ClassSection>();
      split.forEach((info, i) => {
        const audio = samples[i]?.audio;
        if (!audio || !info.true_label) return;
        const section = byLabel.get(info.true_label) ?? {
          label: info.true_label,
          note: classNoteForLabel(notes, info.true_label),
          clips: [],
        };
        section.clips.push({ sampleId: info.sample_id, audio });
        byLabel.set(info.true_label, section);
      });
      if (!cancelled) setSections([...byLabel.values()]);
    })();
    return () => {
      cancelled = true;
    };
  }, [domain, root, set]);

  return sections;
}

/** The play button(s) for one class's example recording(s), shown inline to
 *  the right of the class name. */
export function ClassClipButtons({ section }: { section: ClassSection }) {
  return (
    <span className="flex items-center gap-1">
      {section.clips.map((clip, clipIdx) => (
        <SimileAudioPlayer
          key={clip.sampleId}
          url={clip.audio}
          logId={`classguide-${section.label.replace(/\W+/g, '-')}-${clipIdx + 1}`}
        />
      ))}
    </span>
  );
}

interface ClassGuideProps {
  domain: string;
  root?: DataRoot;
  /** Which concept set's markdown notes supply the descriptions; omit for
   *  conditions without descriptions (rexnet, examples, noxai). */
  set?: ConceptSet;
}

export function ClassGuide({ domain, root = DATA_V1_ROOT, set }: ClassGuideProps) {
  const sections = useClassSections(domain, root, set);

  if (!sections?.length) return null;

  const isBird = domain === 'bird';

  return (
    <div className="my-6 mx-3">
      <div className="space-y-4 text-gray-700">
        <p>
          There are <strong>{sections.length}</strong> different {isBird ? 'bird sound' : 'lung sound'} categories that we are interested in. 
          Press the play button next to a category to hear an example recording.
        </p>
        {/* <div className="space-y-6 mt-4">
          {sections.map((section, idx) => (
            <section key={section.label}>
              <div className="flex items-center gap-2 border-b pb-2 mb-2">
                <h3 className="text-xl font-semibold text-cyan-800">
                  {idx + 1}. {section.label}
                </h3>
                <ClassBadge className={section.label} useAbbrev size="xs" />
                <ClassClipButtons section={section} />
              </div>
              {section.note?.description && (
                <p className="italic text-gray-600">{section.note.description}</p>
              )}
            </section>
          ))}
        </div> */}

        <ol className="list-decimal ml-10 space-y-1 mb-4">
          {sections.map((section) => {
            return (
              <li key={section.label}>
                <span className="inline-flex items-center gap-2 align-middle">
                  {section.label}
                  <ClassBadge className={section.label} useAbbrev size="xs" />
                  <ClassClipButtons section={section} />
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
