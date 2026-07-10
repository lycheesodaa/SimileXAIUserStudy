interface NoXaiExplanationProps {
  originalAudioUrl?: string;
}

// Baseline (control) condition: just the recording and a neutral prompt —
// no explanation of any kind.
export function NoXaiExplanation({ originalAudioUrl }: NoXaiExplanationProps) {
  return (
    <div className="space-y-6 mx-3">
      <div className="mb-6">
        <div className="pt-6">
          <div className="flex flex-col gap-2">
            <span className="text-gray-600">Play this sound recording:</span>
            {originalAudioUrl ? (
              <audio controls className="w-full max-w-md h-10" src={originalAudioUrl}>
                Your browser does not support the audio element.
              </audio>
            ) : (
              <span className="text-sm text-gray-400 italic">No audio available for this sample</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-600">
        Listen to the recording above. You may replay it as many times as you like
        before answering the questions that follow.
      </p>
    </div>
  );
}
