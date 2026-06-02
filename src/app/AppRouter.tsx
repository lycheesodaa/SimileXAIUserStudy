import { HashRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router';
import { SimilePractice } from './components/similes/SimilePractice';
import { SimileExplanation } from './components/similes/SimileExplanation';
import { CuesPractice } from './components/cues/CuesPractice';
import { CuesExplanation } from './components/cues/CuesExplanation';
import { CombinedExplanation } from './components/combined/CombinedExplanation';
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

function getPathForGlobalIndex(currentIndex: number, basePath: string): string {
  const target = LUNG_SOUND_DATA[currentIndex];
  if (!target) return basePath;
  const filtered = LUNG_SOUND_DATA.filter((d) => d.pathology === target.pathology);
  const localIndex = filtered.indexOf(target) + 1;
  return `${basePath}/${target.pathology}/${localIndex}`;
}

// ─── Sample Navigator ──────────────────────────────────────────────────────────
// Shown on Simile test pages so users can switch pathology + sample without
// having to manually edit the URL.

interface SampleNavigatorProps {
  currentIndex: number; // 0-based index into LUNG_SOUND_DATA
  basePath: string;     // e.g. '/similes/test'
}

function SampleNavigator({ currentIndex, basePath }: SampleNavigatorProps) {
  const navigate = useNavigate();
  const current = LUNG_SOUND_DATA[currentIndex];

  // Derive unique pathologies in insertion order
  const pathologies = Array.from(new Set(LUNG_SOUND_DATA.map((d) => d.pathology)));

  // Samples for the currently selected pathology
  const samplesForPathology = LUNG_SOUND_DATA.filter((d) => d.pathology === current.pathology);

  const handlePathologyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPathology = e.target.value;
    // Go to first sample of that pathology
    navigate(`${basePath}/${newPathology}/1`);
  };

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const localIdx = parseInt(e.target.value, 10);
    navigate(`${basePath}/${current.pathology}/${localIdx + 1}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        background: '#f0f9ff',
        borderBottom: '1px solid #bae6fd',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 600 }}>Navigate sample:</span>

      {/* Pathology dropdown */}
      <label style={{ fontSize: '13px', color: '#0369a1' }}>
        Pathology&nbsp;
        <select
          value={current.pathology}
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
          {samplesForPathology.map((d, localIdx) => {
            return (
              <option key={d.id} value={localIdx}>
                {d.name}
              </option>
            );
          })}
        </select>
      </label>

      {/* Prev / Next buttons */}
      <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
        <button
          onClick={() => currentIndex > 0 && navigate(getPathForGlobalIndex(currentIndex - 1, basePath))}
          disabled={currentIndex === 0}
          style={{
            fontSize: '12px',
            padding: '3px 10px',
            borderRadius: '6px',
            border: '1px solid #7dd3fc',
            background: currentIndex === 0 ? '#e0f2fe' : '#0ea5e9',
            color: currentIndex === 0 ? '#93c5fd' : '#fff',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ← Prev
        </button>
        <button
          onClick={() =>
            currentIndex < LUNG_SOUND_DATA.length - 1 &&
            navigate(getPathForGlobalIndex(currentIndex + 1, basePath))
          }
          disabled={currentIndex === LUNG_SOUND_DATA.length - 1}
          style={{
            fontSize: '12px',
            padding: '3px 10px',
            borderRadius: '6px',
            border: '1px solid #7dd3fc',
            background: currentIndex === LUNG_SOUND_DATA.length - 1 ? '#e0f2fe' : '#0ea5e9',
            color: currentIndex === LUNG_SOUND_DATA.length - 1 ? '#93c5fd' : '#fff',
            cursor:
              currentIndex === LUNG_SOUND_DATA.length - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Route Wrappers ────────────────────────────────────────────────────────────

function SimileExplanationWrapper() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  const index = resolvePathologyAndIndex(pathology, localIndex);
  const data = LUNG_SOUND_DATA[index];

  return (
    <>
      <SampleNavigator currentIndex={index} basePath="/similes/test" />
      <SimileExplanation
        audioName={data.name}
        classification={data.type}
        confidence={87}
        similes={data.similes}
        originalAudioUrl={data.originalAudioUrl}
      />
    </>
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
    <>
      <SampleNavigator currentIndex={index} basePath="/cues/test" />
      <CuesExplanation
        audioName={data.name}
        features={absoluteAudioFeatures}
        comparisons={data.CFcomparison}
        highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
      />
    </>
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
    <>
      <SampleNavigator currentIndex={index} basePath="/combined/test" />
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
    </>
  );
}

export function AppRouter() {
  return (
    <HashRouter>
      <div className="w-full bg-transparent">
        <Routes>
          <Route path="/" element={<Navigate to="/similes/practice" replace />} />

          <Route path="/similes/practice" element={<SimilePractice />} />

          <Route path="/similes/test" element={<Navigate to={`/similes/test/${FIRST_PATHOLOGY}/1`} replace />} />
          <Route path="/similes/test/:pathology/:localIndex" element={<SimileExplanationWrapper />} />

          <Route path="/cues/practice" element={<CuesPractice />} />

          <Route path="/cues/test" element={<Navigate to={`/cues/test/${FIRST_PATHOLOGY}/1`} replace />} />
          <Route path="/cues/test/:pathology/:localIndex" element={<CuesExplanationWrapper />} />

          <Route path="/combined/test" element={<Navigate to={`/combined/test/${FIRST_PATHOLOGY}/1`} replace />} />
          <Route path="/combined/test/:pathology/:localIndex" element={<CombinedExplanationWrapper />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
