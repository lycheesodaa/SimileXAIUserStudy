import { useEffect, useState } from 'react';
import { SimileAudioPlayer } from '../similes/SimileExplanationV3';
import { ClassClipButtons, useClassSections } from '../guide/ClassGuide';
import { ConceptEntry, ConceptSet, DataRoot, loadConcepts, prettifyOnomatopoeia } from '../../study/dataV1';
import { ClassBadge, CLASS_METADATA, getClassMetadata } from '../ClassBadge';
import { Play } from 'lucide-react';

// Training/practice content generated from the bundle's shared concept lookup
// (<root>/<domain>/concepts/<set>.json): the concepts grouped by category,
// each with its generated audio. Used both as the guide-mode page and as the
// cheatsheet drawer inside the simile/onomatopoeia explanations. `root`
// selects the bundle whose concept vocabulary is shown (default data_v1), so
// versioned bundles with reworked similes surface their own lists.
// `withClassGuide` (guide page only — never the in-study drawer) puts each
// class's training.csv example recording next to its heading and its brief
// description (from the bundle's markdown notes) underneath.
interface ConceptCheatsheetProps {
  domain: string;
  set: ConceptSet;
  root?: DataRoot;
  withClassGuide?: boolean;
}

export function ConceptCheatsheet({ domain, set, root, withClassGuide }: ConceptCheatsheetProps) {
  const isOnomatopoeia = set === 'onomatopoeia';
  const [concepts, setConcepts] = useState<ConceptEntry[] | undefined | 'error'>(undefined);
  const classSections = useClassSections(withClassGuide ? domain : '', root, set);

  useEffect(() => {
    let cancelled = false;
    setConcepts(undefined);
    loadConcepts(domain, set, root).then((map) => {
      if (!cancelled) setConcepts(map ? [...map.values()] : 'error');
    });
    return () => {
      cancelled = true;
    };
  }, [domain, set, root]);

  if (concepts === undefined) {
    return <div className="my-6 mx-3 text-gray-400 italic">Loading…</div>;
  }
  if (concepts === 'error') {
    return <div className="my-6 mx-3 text-gray-400 italic">The reference list could not be loaded.</div>;
  }

  const byCategory = new Map<string, ConceptEntry[]>();
  for (const c of concepts) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }

  // Present classes in the fixed canonical CLASS_METADATA order rather than the
  // concept JSON's incidental order, so the tutorial page and the in-study
  // drawer always render the same, stable sequence. Categories carry the exact
  // class labels; resolve each through getClassMetadata to tolerate aliases.
  // Unknown categories (index -1) sort to the end, keeping their JSON order.
  const canonicalOrder = Object.keys(CLASS_METADATA);
  const orderIndex = (category: string) => {
    const idx = canonicalOrder.indexOf(getClassMetadata(category).className);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  const orderedCategories = [...byCategory.entries()].sort(
    ([a], [b]) => orderIndex(a) - orderIndex(b)
  );

  const noun = isOnomatopoeia ? 'onomatopoeia' : 'simile';
  const nounPlural = isOnomatopoeia ? 'onomatopoeia' : 'similes';

  return (
    <div className="my-6 mx-3">
      <div className="space-y-4 text-gray-700">
        <p className="text-gray-600">
          In this section, you can review how different sound categories may be mapped to{' '}
          {isOnomatopoeia ? 'onomatopoeic sounds (words that imitate the sound)' : 'everyday sounds'}.
        </p>

        <p>
          These are known as {nounPlural}. {nounPlural[0].toUpperCase() + nounPlural.slice(1)} can
          provide intuitive ways to recognize and communicate sounds. Press the play button next to
          a {noun} to hear it.
        </p>
        {withClassGuide && (
          <div className="space-y-4 text-gray-700">
            <p>
              There are <strong>{byCategory.size}</strong> different {domain == 'bird' ? 'bird sound' : 'lung sound'} categories that we are interested in.
              Press the play button next to a category to hear an example recording.
              {/* <Play className='inline-flex text-blue-500 mx-1 mt-[-5px]' size={18} fill="currentColor" /> */}
            </p>
            <p>
              <i>
                Some {nounPlural} may be more intuitive than others, and it may be helpful to take a few
                seconds to internalize the associations to improve efficiency of recognition.
              </i>
            </p>
          </div>
        )}


        <div className="space-y-8 mt-6">
          {orderedCategories.map(([category, entries], idx) => {
            // Concept categories carry the exact class labels, so the guide's
            // per-class sections (training.csv recording + markdown
            // description) attach directly to each heading.
            const classSection = classSections?.find((s) => s.label === category);
            return (
            <section key={category}>
              <div className="flex items-center gap-2 border-b pb-2 mb-3">
                <h3 className="text-xl font-semibold text-cyan-800 flex items-center gap-2">
                  {idx + 1}. <ClassBadge className={category} useAbbrev size="xs" /> {category}
                </h3>
                {classSection && <ClassClipButtons section={classSection} />}
              </div>
              {classSection?.note?.description && (
                <p className="italic text-gray-600 mb-3">{classSection.note.description}</p>
              )}
              <ul className="space-y-1 text-gray-700">
                {entries.map((entry) => (
                  <li key={entry.concept} className="flex items-center gap-1">
                    <SimileAudioPlayer
                      url={entry.audio}
                      logId={`cheatsheet-${entry.concept.replace(/\W+/g, '-').slice(0, 60)}`}
                    />
                    <span>{isOnomatopoeia ? prettifyOnomatopoeia(entry.concept) : entry.concept}</span>
                  </li>
                ))}
              </ul>
            </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
