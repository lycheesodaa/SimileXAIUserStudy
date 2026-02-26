import { useState } from "react";

interface LikertScaleProps {
  question: string;
  onChange?: (value: number) => void;
  options?: string[];
}

export function LikertScale({ question, onChange, options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] }: LikertScaleProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2 py-4 border-b border-gray-100 last:border-0">
      <p className="text-sm font-medium text-gray-700 mb-2">{question}</p>
      <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
        {options.map((opt, idx) => (
          <label key={idx} className="flex flex-col items-center cursor-pointer group w-20 text-center">
            <span className="text-[10px] text-gray-400 mb-2 h-8 flex items-end justify-center leading-tight group-hover:text-blue-500 transition-colors">
              {opt}
            </span>
            <input
              type="radio"
              name={question}
              value={idx}
              checked={selected === idx}
              onChange={() => { setSelected(idx); onChange?.(idx); }}
              className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500 transition-transform transform group-hover:scale-110"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

interface ProbabilitySliderProps {
  label: string;
  initialValue?: number;
  color?: string;
}

export function ProbabilitySlider({ label, initialValue = 0, color = "bg-blue-600" }: ProbabilitySliderProps) {
  const [value, setValue] = useState(initialValue);
  
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="w-24 text-sm font-medium text-gray-700 text-right">{label}</span>
      <div className="flex-1 relative h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div 
          className={`absolute top-0 left-0 h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
        {/* Mock slider handle area if interactive */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 pointer-events-none">
          {value}%
        </div>
      </div>
    </div>
  );
}
