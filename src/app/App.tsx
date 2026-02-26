import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { AudioDetectionSystem } from './components/AudioDetectionSystem';
import { SimileExplanation } from './components/SimileExplanation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { LUNG_SOUND_DATA } from './data';
import { ReferenceTable } from './components/ReferenceTable';
import { SimilePracticeTable } from './components/SimilePracticeTable';
import { CuesPractice } from './components/CuesPractice';

export default function App() {
  const [viewMode, setViewMode] = useState('similes');
  const [testMode, setTestMode] = useState('practice');

  // Extract features from LUNG_SOUND_DATA[0] to match AcousticFeature interface
  const absoluteAudioFeatures = Object.entries(LUNG_SOUND_DATA[0].features).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  // lungSoundSimiles replaced by LUNG_SOUND_DATA

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2">Audio XAI System</h1>
            <p className="text-gray-600">
              Explainable AI interfaces for audio classification using acoustic cues and simile-based
              explanations
            </p>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full md:w-1/2">
              <TabsList className="grid w-2/3 grid-cols-2">
                <TabsTrigger value="similes">Similes</TabsTrigger>
                <TabsTrigger value="cues">Cues</TabsTrigger>
              </TabsList>
              <TabsContent value="similes" className="mt-0" />
              <TabsContent value="cues" className="mt-0" />
            </Tabs>

            <Tabs value={testMode} onValueChange={setTestMode} className="w-full md:w-1/2">
              <TabsList className="grid w-2/3 grid-cols-2 ml-auto">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>
              <TabsContent value="practice" className="mt-0" />
              <TabsContent value="test" className="mt-0" />
            </Tabs>
          </div>

          <div className="mt-0">
            {viewMode === "similes" && testMode === "practice" && (
              <SimilePracticeTable />
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
              <AudioDetectionSystem
                audioName={LUNG_SOUND_DATA[0].name}
                baselineOptions={['Normal', 'Reference Sample A', 'Reference Sample B']}
                features={absoluteAudioFeatures}
                highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
