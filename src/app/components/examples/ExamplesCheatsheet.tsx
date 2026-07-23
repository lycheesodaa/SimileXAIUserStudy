import { useEffect, useState } from 'react';
import { RecordingPlayButton } from '../RecordingPlayButton';
import { ClassBadge, CLASS_METADATA, getClassMetadata } from '../ClassBadge';
import { DataRoot, ExampleBankEntry, loadExampleBank } from '../../study/dataV1';

// Class-familiarization reference for the examples (prototype) condition. The
// example explanations point at similar training recordings, so the cheatsheet
// lets users review a few real training examples of each sound category on
// demand. Mirrors ConceptCheatsheet's role for the simile/onomatopoeia
// conditions, but there are no per-class descriptions here (the examples
// condition ships none) — just the class names and their example clips, drawn
// from the precomputed prototype bank (<root>/<domain>/example_bank.json).
// `root` selects the bundle whose bank supplies the recordings.
interface ExamplesCheatsheetProps {
  domain: string;
  root?: DataRoot;
}

export function ExamplesCheatsheet({ domain, root }: ExamplesCheatsheetProps) {
  const isBird = domain === 'bird';
  const [bank, setBank] = useState<ExampleBankEntry[] | undefined | 'error'>(undefined);

  useEffect(() => {
    let cancelled = false;
    setBank(undefined);
    loadExampleBank(domain, root).then((entries) => {
      if (!cancelled) setBank(entries ?? 'error');
    });
    return () => {
      cancelled = true;
    };
  }, [domain, root]);

  if (bank === undefined) {
    return <div className="my-6 mx-3 text-gray-400 italic">Loading…</div>;
  }
  if (bank === 'error' || bank.length === 0) {
    return <div className="my-6 mx-3 text-gray-400 italic">The reference list could not be loaded.</div>;
  }

  // Present classes in the fixed canonical CLASS_METADATA order rather than the
  // bank's incidental order, so the sequence is stable across bundles. Unknown
  // labels (index -1) sort to the end, keeping their file order.
  const canonicalOrder = Object.keys(CLASS_METADATA);
  const orderIndex = (label: string) => {
    const idx = canonicalOrder.indexOf(getClassMetadata(label).className);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  const ordered = [...bank].sort((a, b) => orderIndex(a.label) - orderIndex(b.label));

  return (
    <div className="my-6 mx-3">
      <div className="space-y-4 text-gray-700">
        <p className="text-gray-600">
          In this section, you can review a few example recordings for each{' '}
          {isBird ? 'bird sound' : 'lung sound'} category.
        </p>
        <p>
          The system explains its classifications by pointing to similar examples observed during its training. 
          Press a play button below to hear one of the training examples for each category.
        </p>
        <p>
          <i>
            The given examples are not ranked in any particular order.
          </i>
        </p>

        <div className="space-y-8 mt-6">
          {ordered.map((entry, idx) => (
            <section key={entry.label}>
              <div className="flex items-center gap-2 border-b pb-2 mb-3">
                <h3 className="text-xl font-semibold text-cyan-800 flex items-center gap-2">
                  {idx + 1}. <ClassBadge className={entry.label} useAbbrev size="xs" /> {entry.label}
                </h3>
              </div>
              <ul className="space-y-1 text-gray-700">
                {entry.clips.map((clip, i) => (
                  <li key={clip.source} className="flex items-center gap-1">
                    <RecordingPlayButton
                      url={clip.audio}
                      logId={`examplebank-${entry.label.replace(/\W+/g, '-')}-${i + 1}`}
                      label={`${entry.label} example ${i + 1}`}
                    />
                    <span>Example {i + 1}</span>
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
