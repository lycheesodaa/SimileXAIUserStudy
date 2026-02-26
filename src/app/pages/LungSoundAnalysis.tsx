import { useState } from "react";
import { Play, Pause, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { ProbabilitySlider, LikertScale } from "../components/FormComponents";
import { AudioPlayer } from "../components/AudioPlayer";

export function LungSoundAnalysis() {
  const [selectedComparison, setSelectedComparison] = useState("Normal Breathing");
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    { name: "Pitch (Frequency)", comparison: "Higher", highlight: "text-blue-600 font-bold" },
    { name: "Duration (Time)", comparison: "Longer", highlight: "text-blue-600 font-bold" },
    { name: "Regularity", comparison: "Similar", highlight: "text-gray-500 italic" },
    { name: "Intensity (Loudness)", comparison: "Lower", highlight: "text-red-500 font-bold" },
    { name: "Musicality", comparison: "Higher", highlight: "text-blue-600 font-bold" },
  ];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="bg-blue-100 text-blue-700 p-2 rounded-lg text-lg">Case #42</span>
          Lung Sound Analysis
        </h1>
        <p className="mt-2 text-gray-600">
          Listen to the audio clip and review the AI-generated cue analysis below.
        </p>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Player & Visuals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Audio</h2>
            <AudioPlayer label="Patient Recording (Right Lower Lobe)" className="bg-blue-50/50 border-blue-100" />
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Spectrogram Analysis</h3>
              {/* Mock Spectrogram Visual */}
              <div className="h-48 bg-gray-900 rounded-lg overflow-hidden relative group">
                <div className="absolute inset-0 opacity-80 flex items-end justify-center gap-[1px]">
                  {Array.from({ length: 120 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-gradient-to-t from-blue-900 via-purple-500 to-yellow-300"
                      style={{ 
                        height: `${30 + Math.random() * 60}%`, 
                        opacity: Math.random() * 0.8 + 0.2 
                      }} 
                    />
                  ))}
                </div>
                {/* Highlight Overlay */}
                <div className="absolute top-1/2 left-1/4 w-32 h-20 bg-yellow-400/20 border-2 border-yellow-400 rounded-md flex items-center justify-center">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">High Pitch Region</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Breakdown (Image 1 Style) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Comparative Feature Analysis</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <span>Compared with:</span>
                <select 
                  className="bg-transparent font-medium text-blue-700 outline-none cursor-pointer hover:text-blue-800"
                  value={selectedComparison}
                  onChange={(e) => setSelectedComparison(e.target.value)}
                >
                  <option>Normal Breathing</option>
                  <option>Crackle (Fine)</option>
                  <option>Rhonchi</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">The system has analyzed that, compared with <span className="font-semibold text-gray-900">{selectedComparison}</span>, this lung sound has:</p>
              
              <ul className="space-y-3 pl-4 border-l-2 border-blue-100 ml-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <span className={`w-2 h-2 rounded-full ${feature.comparison === 'Higher' ? 'bg-blue-500' : feature.comparison === 'Lower' ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <span className={feature.highlight}>{feature.comparison}</span> 
                    <span className="font-medium text-gray-900">{feature.name}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" /> Highlighted Moments
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-600 italic text-center">
                    "Continuous musical sounds detected during <span className="bg-yellow-200 px-1 rounded text-gray-900 not-italic font-medium">expiration phase</span> indicating possible airway narrowing."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Q2, Q3, Q4 (Image 2 Style) */}
        <div className="space-y-6">
            
          {/* Classification Probability (Q2) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">AI Prediction Confidence</h2>
            <div className="space-y-1">
              <ProbabilitySlider label="Wheeze" initialValue={82} color="bg-blue-600" />
              <ProbabilitySlider label="Stridor" initialValue={12} color="bg-blue-300" />
              <ProbabilitySlider label="Crackle" initialValue={4} color="bg-gray-300" />
              <ProbabilitySlider label="Normal" initialValue={2} color="bg-gray-200" />
            </div>
            <p className="text-xs text-gray-400 mt-4 text-right">Model Confidence: 94%</p>
          </div>

          {/* Feature Matrix (Q3) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Verify Features</h2>
            <p className="text-sm text-gray-600 mb-4">
              Do you agree that the sound has <span className="font-semibold text-blue-600">higher pitch</span> than a standard Wheeze?
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-xs">
                    <th className="py-2 font-medium">Feature</th>
                    <th className="py-2 text-center font-medium">Lower</th>
                    <th className="py-2 text-center font-medium">Similar</th>
                    <th className="py-2 text-center font-medium">Higher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {["Pitch", "Duration", "Intensity"].map((f) => (
                    <tr key={f} className="group hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-700">{f}</td>
                      <td className="text-center"><input type="radio" name={f} className="accent-blue-600" /></td>
                      <td className="text-center"><input type="radio" name={f} className="accent-blue-600" defaultChecked /></td>
                      <td className="text-center"><input type="radio" name={f} className="accent-blue-600" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agreement (Q4) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Feedback</h2>
            <LikertScale question="The highlighted cues helped me identify the sound." />
            <LikertScale question="I agree with the AI's classification." />
          </div>

        </div>
      </div>
    </div>
  );
}
