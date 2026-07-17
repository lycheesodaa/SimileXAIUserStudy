import { ReferenceTableV1 } from './CuesExplanationV1';

const LUNG_CLASSES = ['Crackle', 'Normal', 'Wheeze', 'Rhonchi', 'Stridor'];
const BIRD_CLASSES = [
  'Eastern Towhee',
  'Wood Thrush',
  'Black-capped Chickadee',
  'Tufted Titmouse',
  'Ovenbird',
];

interface CuesPracticeProps {
  domain?: string;
}

export function CuesPractice({ domain }: CuesPracticeProps) {
  const isBird = domain === 'bird';
  const classes = isBird ? BIRD_CLASSES : LUNG_CLASSES;

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
              There are <strong>{classes.length}</strong> different {isBird ? 'bird sound' : 'lung sound'} categories that we are interested in:
            </p>
            <ol className="list-decimal ml-10 space-y-1 mb-4">
              {classes.map((c) => (
                <li key={c}>{c}</li>
              ))}
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
            <ReferenceTableV1 domain={isBird ? 'bird' : 'lung'} />
          </div>
        </div>
      </div>
    </div>
  );
}
