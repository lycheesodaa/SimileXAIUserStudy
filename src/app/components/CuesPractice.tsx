import { ReferenceTable } from './ReferenceTable';

export function CuesPractice() {
  return (
    <div className="flex flex-col gap-6 my-6 mx-3">
      <div className="mb-6">
        {/* <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Welcome to Cues Practice Mode</h2>
          <p className="text-gray-600 mb-4">
            Review how different lung classifications map to common descriptive cues.
          </p>
        </div> */}
        <div className="space-y-4 text-gray-700">
          <p>
            In this section, you can review the common acoustic cues that help
            identify different lung sounds. Familiarizing yourself with these attributes
            will improve your recognition skills.
          </p>

          <div>
            <p className="mb-4">
              There are <strong>6</strong> different lung sound categories that we are interested in:
            </p>
            <ol className="list-decimal ml-10 space-y-1 mb-4">
              <li>Normal Breathing</li>
              <li>Wheezes</li>
              <li>Fine Crackles</li>
              <li>Coarse Crackles</li>
              <li>Rhonchi</li>
              <li>Stridor</li>
            </ol>
          </div>

          <p>
            These categories can be described using different combinations of acoustic cues.
            Below is a reference table that summarizes the common acoustic cues that help identify different lung sounds.
          </p>

          <p>
            <i>While the table will be displayed in each task instance, it may be helpful to take a few seconds to internalize the attributes' meanings
              to improve efficiency of recognition.</i>
          </p>

          {/* <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>Review the Reference Table to understand how cues map to sounds.</li>
              <li>Pay attention to variations in pitch, loudness, and continuity.</li>
            </ul>
          </div> */}
          <div>
            <ReferenceTable />
          </div>
        </div>
      </div>
    </div>
  );
}
