import { ExampleList } from './ExampleList';
import { LungSound } from '../../data_v2';

interface ExampleExplanationProps {
  audioName: string;
  classification: string;
  confidence: number;
  examples: LungSound['examples'];
  originalAudioUrl?: string;
}

export function ExampleExplanation({
  audioName,
  classification,
  confidence,
  examples,
  originalAudioUrl,
}: ExampleExplanationProps) {
  return (
    <div className="space-y-6 mx-3">
      {/* Audio Player Section */}
      <div className="mb-6">
        <div className="pt-6">
          <div className="flex flex-col gap-2">
            <span className="text-gray-600">Play this lung sound recording:</span>
            {originalAudioUrl ? (
              <audio
                controls
                className="w-full max-w-md h-10"
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${originalAudioUrl}`}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <span className="text-sm text-gray-400 italic">No audio available for this sample</span>
            )}
          </div>
        </div>
      </div>

      {/* Example-Based Explanations */}
      <div className="mb-6">
        <div className="mb-4">
          <p className="text-gray-600">
            The system identifies the following similar training example(s) to help explain this classification.
          </p>
        </div>
        <div>
          <ExampleList examples={examples} />
        </div>
      </div>
    </div>
  );
}
