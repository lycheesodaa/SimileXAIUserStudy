export function ExamplesPractice() {
  return (
    <div className="flex flex-col gap-6 my-6 mx-3 text-gray-700">
      <div className="space-y-4">
        <p>
          In this section, you can review how example-based explanations help explain classifications.
        </p>
        <p>
          Example-based explanations display the most similar actual training examples (prototypes) along with their similarity weights and active segments to help explain why the system made a particular classification.
        </p>
        <p>
          <i>Please switch to <strong>Test</strong> mode to see how these examples are shown and used to explain specific test lung sound recordings.</i>
        </p>
      </div>
    </div>
  );
}
