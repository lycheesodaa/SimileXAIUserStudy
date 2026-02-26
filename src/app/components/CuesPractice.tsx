import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ReferenceTable } from './ReferenceTable';

export function CuesPractice() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Cues Practice Mode</CardTitle>
          <CardDescription>
            Review how different lung classifications map to common descriptive cues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            In this section, you can review the common acoustic cues that help
            identify different lung sounds. Familiarizing yourself with these attributes
            will improve your recognition skills.
          </p>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>Review the Reference Table to understand how cues map to sounds.</li>
              <li>Pay attention to variations in pitch, loudness, and continuity.</li>
            </ul>
          </div>
          <div>
            <ReferenceTable />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
