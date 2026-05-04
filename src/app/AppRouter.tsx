import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router';
import { SimilePractice } from './components/similes/SimilePractice';
import { SimileExplanation } from './components/similes/SimileExplanation';
import { CuesPractice } from './components/cues/CuesPractice';
import { CuesExplanation } from './components/cues/CuesExplanation';
import { CombinedExplanation } from './components/combined/CombinedExplanation';
import { LUNG_SOUND_DATA } from './data';

function SimileExplanationWrapper() {
  const { id } = useParams<{ id: string }>();
  let index = 0;
  if (id) {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= LUNG_SOUND_DATA.length) {
      index = parsed - 1;
    }
  }
  const data = LUNG_SOUND_DATA[index];

  return (
    <SimileExplanation
      audioName={data.name}
      classification={data.type}
      confidence={87}
      similes={data.similes}
    />
  );
}

function CuesExplanationWrapper() {
  const { id } = useParams<{ id: string }>();
  let index = 0;
  if (id) {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= LUNG_SOUND_DATA.length) {
      index = parsed - 1;
    }
  }
  const data = LUNG_SOUND_DATA[index];

  const absoluteAudioFeatures = Object.entries(data.features).map(([key, val]) => ({
    name: key,
    value: val as string,
  }));

  return (
    <CuesExplanation
      audioName={data.name}
      features={absoluteAudioFeatures}
      comparisons={data.CFcomparison}
      highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
    />
  );
}

function CombinedExplanationWrapper() {
  const { id } = useParams<{ id: string }>();
  let index = 0;
  if (id) {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= LUNG_SOUND_DATA.length) {
      index = parsed - 1;
    }
  }
  const data = LUNG_SOUND_DATA[index];

  const absoluteAudioFeatures = Object.entries(data.features).map(([key, val]) => ({
    name: key,
    value: val as string,
  }));

  return (
    <CombinedExplanation
      audioName={data.name}
      classification={data.type}
      confidence={87}
      similes={data.similes}
      features={absoluteAudioFeatures}
      comparisons={data.CFcomparison}
      highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
    />
  );
}

export function AppRouter() {
  return (
    <HashRouter>
      <div className="w-full bg-transparent">
        <Routes>
          <Route path="/" element={<Navigate to="/similes/practice" replace />} />

          <Route path="/similes/practice" element={<SimilePractice />} />

          <Route path="/similes/test" element={<Navigate to="/similes/test/1" replace />} />
          <Route path="/similes/test/:id" element={<SimileExplanationWrapper />} />

          <Route path="/cues/practice" element={<CuesPractice />} />

          <Route path="/cues/test" element={<Navigate to="/cues/test/1" replace />} />
          <Route path="/cues/test/:id" element={<CuesExplanationWrapper />} />

          <Route path="/combined/test" element={<Navigate to="/combined/test/1" replace />} />
          <Route path="/combined/test/:id" element={<CombinedExplanationWrapper />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
