import { ReferenceTableV1 } from './CuesExplanationV1';
import { ClassClipButtons, useClassSections } from '../guide/ClassGuide';
import { DataRoot, usesV7BirdCues } from '../../study/dataV1';
import { ClassBadge } from '../ClassBadge';

const LUNG_CLASSES = ['Crackle', 'Normal', 'Wheeze', 'Rhonchi', 'Stridor'];
const BIRD_CLASSES_V1 = [
  'Eastern Towhee',
  'Wood Thrush',
  'Black-capped Chickadee',
  'Tufted Titmouse',
  'Ovenbird',
];
const BIRD_CLASSES_V7 = [
  'Eastern Towhee',
  'Wood Thrush',
  'Black-capped Chickadee',
  'Tufted Titmouse',
  'Blue Jay',
];

interface CuesPracticeProps {
  domain?: string;
  /** Bundle whose training.csv supplies the per-class example recordings;
   *  bundles without one render the class list without play buttons. */
  root?: DataRoot;
}

export function CuesPractice({ domain, root }: CuesPracticeProps) {
  const isBird = domain === 'bird';
  const isV7 = usesV7BirdCues(root);
  const classes = isBird ? (isV7 ? BIRD_CLASSES_V7 : BIRD_CLASSES_V1) : LUNG_CLASSES;
  const sections = useClassSections(isBird ? 'bird' : 'lung', root);
  const sectionFor = (c: string) => sections?.find((s) => s.label === c);

  return (
    <div className="flex flex-col gap-6 my-6 mx-3">
      <div className="mb-6">
        <div className="space-y-4 text-gray-700">
          <p>
            In this section, you can review the common acoustic cues that help
            identify different {isBird ? 'bird sound' : 'lung sound'} categories. Familiarizing
            yourself with these attributes will improve your recognition skills.
          </p>
          <div>
            <p className="mb-4">
              There are <strong>{classes.length}</strong> different {isBird ? 'bird sound' : 'lung sound'} categories that we are interested in
              {sections?.length ? '. Press the play button next to a category to hear an example recording' : ''}:
            </p>
            <ol className="list-decimal ml-10 space-y-1 mb-4">
              {classes.map((c) => {
                const section = sectionFor(c);
                return (
                  <li key={c}>
                    <span className="inline-flex items-center gap-2 align-middle">
                      <ClassBadge className={c} useAbbrev size="xs" />
                      {c}
                      {section && <ClassClipButtons section={section} />}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <p>
            These categories can be described using different combinations of acoustic cues.
            Below is a reference table that summarizes the common acoustic cues that help identify
            different {isBird ? 'bird sounds' : 'lung sounds'}.
          </p>

          <p>
            <i>While the table will be displayed in each task instance, it may be helpful to take a few seconds to internalize the attributes' meanings
              to improve efficiency of recognition.</i>
          </p>

          <div>
            <ReferenceTableV1 domain={isBird ? 'bird' : 'lung'} root={root} />
          </div>
        </div>
      </div>
    </div>
  );
}

