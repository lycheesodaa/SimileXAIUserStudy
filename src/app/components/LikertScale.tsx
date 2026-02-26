import { useState } from 'react';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

interface LikertScaleProps {
  categories: string[];
  onValueChange?: (values: { [key: string]: number }) => void;
}

export function LikertScale({ categories, onValueChange }: LikertScaleProps) {
  const [values, setValues] = useState<{ [key: string]: number }>(
    categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
  );

  const handleChange = (category: string, value: number) => {
    const newValues = { ...values, [category]: value };
    setValues(newValues);
    onValueChange?.(newValues);
  };

  const total = Object.values(values).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <i>Note: at least one choice must be more than 0%, and all % likelihoods need to sum to 100.</i>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs text-gray-500 pl-30 pr-15">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
          <span>50</span>
          <span>60</span>
          <span>70</span>
          <span>80</span>
          <span>90</span>
          <span>100</span>
        </div>

        {categories.map((category) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center gap-4">
              <Label className="w-26 justify-end text-sm">{category}</Label>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-100 rounded relative overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200"
                    style={{ width: `${values[category]}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={values[category]}
                  onChange={(e) => handleChange(category, Number(e.target.value))}
                  className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer"
                />
              </div>
              <span className="w-12 text-sm font-medium">{values[category]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Label>Total:</Label>
        <span className={`font-bold ${total === 100 ? 'text-green-600' : 'text-red-600'}`}>
          {total}
        </span>
      </div>
    </div>
  );
}
