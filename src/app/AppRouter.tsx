import { HashRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router';
import { SimilePractice } from './components/similes/SimilePractice';
import { SimileExplanation } from './components/similes/SimileExplanation';
import { CuesPractice } from './components/cues/CuesPractice';
import { CuesExplanation } from './components/cues/CuesExplanation';
import { CombinedExplanation } from './components/combined/CombinedExplanation';
import { ExampleExplanation } from './components/examples/ExampleExplanation';
import { LUNG_SOUND_DATA, PATHOLOGY_LABELS } from './data_v2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIRST_PATHOLOGY = LUNG_SOUND_DATA[0]?.pathology || 'coarse_crackles';

function resolvePathologyAndIndex(pathology: string | undefined, localIndexStr: string | undefined): number {
  if (!pathology) return 0;
  const filtered = LUNG_SOUND_DATA.filter((d) => d.pathology === pathology);
  if (filtered.length === 0) return 0;

  if (!localIndexStr) return LUNG_SOUND_DATA.indexOf(filtered[0]);

  const parsed = parseInt(localIndexStr, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > filtered.length) {
    return LUNG_SOUND_DATA.indexOf(filtered[0]);
  }

  return LUNG_SOUND_DATA.indexOf(filtered[parsed - 1]);
}

function getPathForGlobalIndex(currentIndex: number): string {
  const target = LUNG_SOUND_DATA[currentIndex];
  if (!target) return '';
  const filtered = LUNG_SOUND_DATA.filter((d) => d.pathology === target.pathology);
  const localIndex = filtered.indexOf(target) + 1;
  return `${target.pathology}/${localIndex}`;
}

// ─── Sample Navigator ──────────────────────────────────────────────────────────
// Shown on Simile test pages so users can switch pathology + sample without
// having to manually edit the URL.

function SampleNavigator() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');
  const xaiType = pathParts[1] || 'similes';
  const mode = pathParts[2] || 'practice';
  const pathology = pathParts[3] || FIRST_PATHOLOGY;
  const localIndexStr = pathParts[4] || '1';

  // Find index in LUNG_SOUND_DATA
  const index = resolvePathologyAndIndex(pathology, localIndexStr);
  const current = LUNG_SOUND_DATA[index];

  // Derive unique pathologies in insertion order
  const pathologies = Array.from(new Set(LUNG_SOUND_DATA.map((d) => d.pathology)));

  // Samples for the currently selected pathology
  const samplesForPathology = LUNG_SOUND_DATA.filter((d) => d.pathology === current.pathology);

  const handleXaiTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newXaiType = e.target.value;
    if (mode === 'practice') {
      navigate(`/${newXaiType}/practice`);
    } else {
      navigate(`/${newXaiType}/test/${pathology}/${localIndexStr}`);
    }
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value;
    if (newMode === 'practice') {
      navigate(`/${xaiType}/practice`);
    } else {
      navigate(`/${xaiType}/test/${pathology}/${localIndexStr}`);
    }
  };

  const handlePathologyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPathology = e.target.value;
    navigate(`/${xaiType}/test/${newPathology}/1`);
  };

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const localIdx = parseInt(e.target.value, 10);
    navigate(`/${xaiType}/test/${pathology}/${localIdx + 1}`);
  };

  const prevIndex = index > 0 ? index - 1 : null;
  const nextIndex = index < LUNG_SOUND_DATA.length - 1 ? index + 1 : null;

  return (
    <div
      style={{
        background: '#f0f9ff',
        borderBottom: '1px solid #bae6fd',
        padding: '8px 12px',
      }}
    >
      {/* Row 1: Global controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: mode === 'test' ? '8px' : '0',
        }}
      >
        <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 700 }}>XAI User Study</span>

        {/* XAI Type Dropdown */}
        <label style={{ fontSize: '13px', color: '#0369a1' }}>
          XAI Type&nbsp;
          <select
            value={xaiType}
            onChange={handleXaiTypeChange}
            style={{
              fontSize: '13px',
              padding: '3px 6px',
              borderRadius: '6px',
              border: '1px solid #7dd3fc',
              background: '#fff',
              color: '#0c4a6e',
              cursor: 'pointer',
            }}
          >
            <option value="similes">Similes</option>
            <option value="rexnet">RexNet</option>
            <option value="onomatopoeia">Onomatopoeia</option>
            <option value="examples">Examples</option>
          </select>
        </label>

        {/* Mode Dropdown */}
        <label style={{ fontSize: '13px', color: '#0369a1' }}>
          Mode&nbsp;
          <select
            value={mode}
            onChange={handleModeChange}
            style={{
              fontSize: '13px',
              padding: '3px 6px',
              borderRadius: '6px',
              border: '1px solid #7dd3fc',
              background: '#fff',
              color: '#0c4a6e',
              cursor: 'pointer',
            }}
          >
            <option value="practice">Practice</option>
            <option value="test">Test</option>
          </select>
        </label>
      </div>

      {/* Row 2: Pathology/Sample navigation (Only shown in Test mode) */}
      {mode === 'test' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px dashed #bae6fd',
          }}
        >
          <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 600 }}>Navigate sample:</span>

          {/* Pathology dropdown */}
          <label style={{ fontSize: '13px', color: '#0369a1' }}>
            Pathology&nbsp;
            <select
              value={pathology}
              onChange={handlePathologyChange}
              style={{
                fontSize: '13px',
                padding: '3px 6px',
                borderRadius: '6px',
                border: '1px solid #7dd3fc',
                background: '#fff',
                color: '#0c4a6e',
                cursor: 'pointer',
              }}
            >
              {pathologies.map((p) => (
                <option key={p} value={p}>
                  {PATHOLOGY_LABELS[p] ?? p}
                </option>
              ))}
            </select>
          </label>

          {/* Sample ID dropdown */}
          <label style={{ fontSize: '13px', color: '#0369a1' }}>
            Sample&nbsp;
            <select
              value={samplesForPathology.indexOf(current)}
              onChange={handleSampleChange}
              style={{
                fontSize: '13px',
                padding: '3px 6px',
                borderRadius: '6px',
                border: '1px solid #7dd3fc',
                background: '#fff',
                color: '#0c4a6e',
                cursor: 'pointer',
              }}
            >
              {samplesForPathology.map((d, localIdx) => (
                <option key={d.id} value={localIdx}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          {/* Prev / Next buttons */}
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <button
              onClick={() => prevIndex !== null && navigate(`/${xaiType}/test/${getPathForGlobalIndex(prevIndex)}`)}
              disabled={prevIndex === null}
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid #7dd3fc',
                background: prevIndex === null ? '#e0f2fe' : '#0ea5e9',
                color: prevIndex === null ? '#93c5fd' : '#fff',
                cursor: prevIndex === null ? 'not-allowed' : 'pointer',
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => nextIndex !== null && navigate(`/${xaiType}/test/${getPathForGlobalIndex(nextIndex)}`)}
              disabled={nextIndex === null}
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid #7dd3fc',
                background: nextIndex === null ? '#e0f2fe' : '#0ea5e9',
                color: nextIndex === null ? '#93c5fd' : '#fff',
                cursor: nextIndex === null ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Route Wrappers ────────────────────────────────────────────────────────────

function SimileExplanationWrapper() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  const index = resolvePathologyAndIndex(pathology, localIndex);
  const data = LUNG_SOUND_DATA[index];

  return (
    <SimileExplanation
      audioName={data.name}
      classification={data.type}
      confidence={87}
      similes={data.similes}
      originalAudioUrl={data.originalAudioUrl}
    />
  );
}

function OnomatopoeiaExplanationWrapper() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  const index = resolvePathologyAndIndex(pathology, localIndex);
  const data = LUNG_SOUND_DATA[index];

  return (
    <SimileExplanation
      audioName={data.name}
      classification={data.type}
      confidence={87}
      similes={data.similes}
      originalAudioUrl={data.originalAudioUrl}
      isOnomatopoeia={true}
    />
  );
}

function CuesExplanationWrapper() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  const index = resolvePathologyAndIndex(pathology, localIndex);
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
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  const index = resolvePathologyAndIndex(pathology, localIndex);
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
      originalAudioUrl={data.originalAudioUrl}
    />
  );
}

function ExampleExplanationWrapper() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  const index = resolvePathologyAndIndex(pathology, localIndex);
  const data = LUNG_SOUND_DATA[index];

  return (
    <ExampleExplanation
      audioName={data.name}
      classification={data.type}
      confidence={87}
      examples={data.examples}
      originalAudioUrl={data.originalAudioUrl}
    />
  );
}

function ExamplesPractice() {
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

function NavigateToRexnet() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  return <Navigate to={`/rexnet/test/${pathology}/${localIndex}`} replace />;
}

export function AppRouter() {
  return (
    <HashRouter>
      <div className="w-full bg-transparent">
        <SampleNavigator />
        <Routes>
          <Route path="/" element={<Navigate to="/similes/practice" replace />} />

          {/* Similes */}
          <Route path="/similes/practice" element={<SimilePractice />} />
          <Route path="/similes/test" element={<Navigate to={`/similes/test/${FIRST_PATHOLOGY}/1`} replace />} />
          <Route path="/similes/test/:pathology/:localIndex" element={<SimileExplanationWrapper />} />

          {/* RexNet */}
          <Route path="/rexnet/practice" element={<CuesPractice />} />
          <Route path="/rexnet/test" element={<Navigate to={`/rexnet/test/${FIRST_PATHOLOGY}/1`} replace />} />
          <Route path="/rexnet/test/:pathology/:localIndex" element={<CuesExplanationWrapper />} />

          {/* Onomatopoeia */}
          <Route path="/onomatopoeia/practice" element={<SimilePractice isOnomatopoeia={true} />} />
          <Route path="/onomatopoeia/test" element={<Navigate to={`/onomatopoeia/test/${FIRST_PATHOLOGY}/1`} replace />} />
          <Route path="/onomatopoeia/test/:pathology/:localIndex" element={<OnomatopoeiaExplanationWrapper />} />

          {/* Examples */}
          <Route path="/examples/practice" element={<ExamplesPractice />} />
          <Route path="/examples/test" element={<Navigate to={`/examples/test/${FIRST_PATHOLOGY}/1`} replace />} />
          <Route path="/examples/test/:pathology/:localIndex" element={<ExampleExplanationWrapper />} />

          {/* Legacy redirects for cues */}
          <Route path="/cues/practice" element={<Navigate to="/rexnet/practice" replace />} />
          <Route path="/cues/test" element={<Navigate to="/rexnet/test" replace />} />
          <Route path="/cues/test/:pathology/:localIndex" element={<NavigateToRexnet />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
