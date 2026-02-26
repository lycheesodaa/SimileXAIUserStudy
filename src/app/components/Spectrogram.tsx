import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useMemo } from 'react';

const generateData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    name: i,
    value: Math.random() * 100,
    highlight: Math.random() > 0.8,
  }));
};

export function Spectrogram({ active = false }: { active?: boolean }) {
  const data = useMemo(() => generateData(60), []);

  return (
    <div className="h-24 w-full bg-slate-900 rounded-md overflow-hidden relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={1}>
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.highlight ? '#60A5FA' : '#1E293B'} 
                fillOpacity={active ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Playhead overlay */}
      {active && (
        <div className="absolute top-0 bottom-0 left-0 w-full pointer-events-none">
          <div className="h-full w-0.5 bg-red-500 animate-[scan_2s_linear_infinite]" />
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0% { left: 0%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
