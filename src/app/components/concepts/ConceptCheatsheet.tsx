import { useEffect, useState } from 'react';
import { SimileAudioPlayer } from '../similes/SimileExplanationV3';
import { ConceptEntry, ConceptSet, DataRoot, loadConcepts, prettifyOnomatopoeia } from '../../study/dataV1';

// Training/practice content generated from the bundle's shared concept lookup
// (<root>/<domain>/concepts/<set>.json): the concepts grouped by category,
// each with its generated audio. Used both as the train-mode page and as the
// cheatsheet drawer inside the simile/onomatopoeia explanations. `root`
// selects the bundle whose concept vocabulary is shown (default data_v1), so
// versioned bundles with reworked similes surface their own lists.
interface ConceptCheatsheetProps {
  domain: string;
  set: ConceptSet;
  root?: DataRoot;
}

export function ConceptCheatsheet({ domain, set, root }: ConceptCheatsheetProps) {
  const isOnomatopoeia = set === 'onomatopoeia';
  const [concepts, setConcepts] = useState<ConceptEntry[] | undefined | 'error'>(undefined);

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

  const noun = isOnomatopoeia ? 'onomatopoeia' : 'simile';
  const nounPlural = isOnomatopoeia ? 'onomatopoeias' : 'similes';

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
        <p>
          <i>
            Some {nounPlural} may be more intuitive than others, and it may be helpful to take a few
            seconds to internalize the associations to improve efficiency of recognition.
          </i>
        </p>

        <div className="space-y-8 mt-6">
          {[...byCategory.entries()].map(([category, entries], idx) => (
            <section key={category}>
              <div className="flex items-center gap-4 border-b pb-2 mb-3">
                <h3 className="text-xl font-semibold text-cyan-800">
                  {idx + 1}. {category}
                </h3>
              </div>
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
          ))}
        </div>
      </div>
    </div>
  );
}
