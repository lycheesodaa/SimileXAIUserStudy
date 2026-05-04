import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { CuesExplanation } from './components/CuesExplanation';
import { SimileExplanation } from './components/SimileExplanation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { LUNG_SOUND_DATA } from './data';
import { ReferenceTable } from './components/ReferenceTable';
import { SimilePractice } from './components/SimilePractice';
import { CuesPractice } from './components/CuesPractice';

function AppContent() {
  const navigate = useNavigate();
  const { viewMode = 'similes', testMode = 'practice' } = useParams();

  const handleViewModeChange = (val: string) => {
    navigate(`/${val}/${testMode}`);
  };

  const handleTestModeChange = (val: string) => {
    navigate(`/${viewMode}/${val}`);
  };

  // Extract features from LUNG_SOUND_DATA[0] to match AcousticFeature interface
  const absoluteAudioFeatures = Object.entries(LUNG_SOUND_DATA[0].features).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  // lungSoundSimiles replaced by LUNG_SOUND_DATA

  return (
    <div className="w-full bg-transparent">
      {viewMode === "similes" && testMode === "practice" && (
        <SimilePractice />
      )}

      {viewMode === "similes" && testMode === "test" && (
        <SimileExplanation
          audioName={LUNG_SOUND_DATA[0].name}
          classification={LUNG_SOUND_DATA[0].type}
          confidence={87}
          similes={LUNG_SOUND_DATA[0].similes}
        />
      )}

      {viewMode === "cues" && testMode === "practice" && (
        <CuesPractice />
      )}

      {viewMode === "cues" && testMode === "test" && (
        <CuesExplanation
          audioName={LUNG_SOUND_DATA[0].name}
          baselineOptions={['Normal', 'Reference Sample A', 'Reference Sample B']}
          features={absoluteAudioFeatures}
          highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/similes/practice" replace />} />
      <Route path="/:viewMode/:testMode" element={<AppContent />} />
    </Routes>
  );
}
