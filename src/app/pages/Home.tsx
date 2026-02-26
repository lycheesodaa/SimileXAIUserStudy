import { Link } from "react-router";

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="bg-blue-50 p-6 rounded-2xl w-full max-w-2xl text-left border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Lung Sound XAI Explorer</h1>
        <p className="text-lg text-gray-700 mb-6">
          Explore two different approaches for explaining lung sound classifications:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/cues" className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-300">
            <h2 className="text-xl font-semibold text-blue-600 mb-2 group-hover:text-blue-700">Cue-based Analysis</h2>
            <p className="text-gray-600 text-sm">
              Detailed breakdown of acoustic features (pitch, duration, rhythm) compared to normal breathing. Adapted from vocal emotion analysis.
            </p>
          </Link>
          
          <Link to="/similes" className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-purple-300">
            <h2 className="text-xl font-semibold text-purple-600 mb-2 group-hover:text-purple-700">Simile-based Analysis</h2>
            <p className="text-gray-600 text-sm">
              Use relatable auditory comparisons (e.g., "sounds like velcro") to scaffold understanding of complex lung sounds.
            </p>
          </Link>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 max-w-lg">
        <p>Current prototype focuses on user interface flow for scaffolding understanding.</p>
      </div>
    </div>
  );
}
