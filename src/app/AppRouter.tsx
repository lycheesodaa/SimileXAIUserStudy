import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { SimilePractice } from './components/SimilePractice';
import { SimileExplanation } from './components/SimileExplanation';
import { CuesPractice } from './components/CuesPractice';
import { CuesExplanation } from './components/CuesExplanation';
import { LUNG_SOUND_DATA } from './data';

// Extract features from LUNG_SOUND_DATA[0] to match AcousticFeature interface
const absoluteAudioFeatures = Object.entries(LUNG_SOUND_DATA[0].features).map(([key, val]) => ({
  name: key,
  value: val,
}));

export function AppRouter() {
  return (
    <HashRouter>
      <div className="w-full bg-transparent">
        <Routes>
          <Route path="/" element={<Navigate to="/similes/practice" replace />} />
          
          <Route path="/similes/practice" element={<SimilePractice />} />
          
          <Route path="/similes/test" element={
            <SimileExplanation
              audioName={LUNG_SOUND_DATA[0].name}
              classification={LUNG_SOUND_DATA[0].type}
              confidence={87}
              similes={LUNG_SOUND_DATA[0].similes}
            />
          } />
          
          <Route path="/cues/practice" element={<CuesPractice />} />
          
          <Route path="/cues/test" element={
            <CuesExplanation
              audioName={LUNG_SOUND_DATA[0].name}
              baselineOptions={['Normal', 'Reference Sample A', 'Reference Sample B']}
              features={absoluteAudioFeatures}
              highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
            />
          } />
        </Routes>
      </div>
    </HashRouter>
  );
}
