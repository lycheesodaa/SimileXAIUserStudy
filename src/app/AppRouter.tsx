import { HashRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router';
import { createContext, useContext, useState } from 'react';
import { SimilePractice } from './components/similes/SimilePractice';
import { SimileExplanation } from './components/similes/SimileExplanation';
import { CuesPractice } from './components/cues/CuesPractice';
import { CuesExplanation } from './components/cues/CuesExplanation';
import { ExampleExplanation } from './components/examples/ExampleExplanation';
import { ExamplesPractice } from './components/examples/ExamplesPractice';
import { LUNG_SOUND_DATA, PATHOLOGY_LABELS } from './data_v2';
import { LUNG_SOUND_DATA_V3 } from './data_v3';
import { SimileExplanationV3 } from './components/similes/SimileExplanationV3';
import { StudyView } from './study/StudyView';
import { V1Navigator, V1DevView } from './components/dev/V1Browser';

export const SettingsContext = createContext<{
  randomFoil: boolean;
  setRandomFoil: (val: boolean) => void;
}>({
  randomFoil: false,
  setRandomFoil: () => {},
});

// ─── Versioned dev route spaces ────────────────────────────────────────────────
// v0.1 = data_v2 bundle (similes, rexnet, onomatopoeia, examples)
// v0.2 = data_v3 bundle (similes_v3)
// v1   = data_v1 bundle (the live study conditions, browsable with navbar)
// Participant-facing study URLs are versioned separately under /study/v1/...

const VERSIONS = ['v0.1', 'v0.2', 'v1'];
const VERSION_HOME: Record<string, string> = {
  'v0.1': '/v0.1/similes/practice',
  'v0.2': '/v0.2/similes_v3/practice',
  v1: '/v1/lung/test',
};
const XAI_TYPES_BY_VERSION: Record<string, { value: string; label: string }[]> = {
  'v0.1': [
    { value: 'similes', label: 'Similes' },
    { value: 'rexnet', label: 'RexNet' },
    { value: 'onomatopoeia', label: 'Onomatopoeia' },
    { value: 'examples', label: 'Examples' },
  ],
  'v0.2': [{ value: 'similes_v3', label: 'Similes V3' }],
};

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

// ─── Sample Navigator (v0.x legacy bundles) ────────────────────────────────────
// Shown on v0.x pages so the user can switch version, pathology and sample
// without having to manually edit the URL.

function SampleNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { randomFoil, setRandomFoil } = useContext(SettingsContext);

  // /:version/:xaiType/:mode/:pathology/:localIndex
  const pathParts = location.pathname.split('/');
  const version = pathParts[1] || 'v0.1';
  const xaiType = pathParts[2] || 'similes';
  const mode = pathParts[3] || 'practice';
  const pathology = pathParts[4] || FIRST_PATHOLOGY;
  const localIndexStr = pathParts[5] || '1';

  const xaiOptions = XAI_TYPES_BY_VERSION[version] ?? XAI_TYPES_BY_VERSION['v0.1'];

  // Select data source based on xaiType
  const dataSource = xaiType === 'similes_v3' ? LUNG_SOUND_DATA_V3 : LUNG_SOUND_DATA;

  // Custom resolve based on dataSource
  const resolveForDataSource = (path: string, locIdxStr: string, arr: any[]) => {
    const filtered = arr.filter((d) => d.pathology === path);
    if (filtered.length === 0) return 0;
    const parsed = parseInt(locIdxStr, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > filtered.length) {
      return arr.indexOf(filtered[0]);
    }
    return arr.indexOf(filtered[parsed - 1]);
  };

  const getPathForDataIndex = (currentIndex: number, arr: any[]) => {
    const target = arr[currentIndex];
    if (!target) return '';
    const filtered = arr.filter((d) => d.pathology === target.pathology);
    const localIdx = filtered.indexOf(target) + 1;
    return `${target.pathology}/${localIdx}`;
  };

  const index = resolveForDataSource(pathology, localIndexStr, dataSource);
  const current = dataSource[index];

  // Derive unique pathologies in insertion order
  const pathologies = Array.from(new Set(dataSource.map((d) => d.pathology)));

  // Samples for the currently selected pathology
  const samplesForPathology = dataSource.filter((d) => d.pathology === current?.pathology);

  const handleXaiTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newXaiType = e.target.value;
    if (mode === 'practice') {
      navigate(`/${version}/${newXaiType}/practice`);
    } else {
      navigate(`/${version}/${newXaiType}/test/${pathology}/${localIndexStr}`);
    }
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value;
    if (newMode === 'practice') {
      navigate(`/${version}/${xaiType}/practice`);
    } else {
      navigate(`/${version}/${xaiType}/test/${pathology}/${localIndexStr}`);
    }
  };

  const handlePathologyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPathology = e.target.value;
    navigate(`/${version}/${xaiType}/test/${newPathology}/1`);
  };

  const handleSampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const localIdx = parseInt(e.target.value, 10);
    navigate(`/${version}/${xaiType}/test/${pathology}/${localIdx + 1}`);
  };

  const prevIndex = index > 0 ? index - 1 : null;
  const nextIndex = index < dataSource.length - 1 ? index + 1 : null;

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

        {/* Version Dropdown */}
        <label style={{ fontSize: '13px', color: '#0369a1' }}>
          Version&nbsp;
          <select
            value={version}
            onChange={(e) => navigate(VERSION_HOME[e.target.value] ?? VERSION_HOME['v1'])}
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
            {VERSIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

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
            {xaiOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
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

        {/* Hide True Label (Single Foil) Checkbox */}
        {(xaiType === 'rexnet' || xaiType === 'combined') && mode === 'test' && (
          <label style={{ fontSize: '13px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: '8px' }}>
            <input
              type="checkbox"
              checked={randomFoil}
              onChange={(e) => setRandomFoil(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Hide True Label (Single Foil)
          </label>
        )}
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
              onClick={() => prevIndex !== null && navigate(`/${version}/${xaiType}/test/${getPathForDataIndex(prevIndex, dataSource)}`)}
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
              onClick={() => nextIndex !== null && navigate(`/${version}/${xaiType}/test/${getPathForDataIndex(nextIndex, dataSource)}`)}
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

// Dev-only chrome: hidden on /study routes so participants never see labels
// or sample navigation. /v1 gets the data_v1 browser navbar; /v0.x gets the
// legacy bundled-data navbar.
function DevNavigator() {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname.startsWith('/study')) return null;
  if (location.pathname.startsWith('/v1')) {
    return (
      <V1Navigator
        versionOptions={VERSIONS}
        onVersionChange={(v) => navigate(VERSION_HOME[v] ?? VERSION_HOME['v1'])}
      />
    );
  }
  if (location.pathname.startsWith('/v0.')) return <SampleNavigator />;
  return null; // legacy unprefixed paths redirect immediately
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

function SimileExplanationV3Wrapper() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();

  // Custom resolver for V3
  const resolveV3 = () => {
    if (!pathology) return 0;
    const filtered = LUNG_SOUND_DATA_V3.filter((d) => d.pathology === pathology);
    if (filtered.length === 0) return 0;

    if (!localIndex) return LUNG_SOUND_DATA_V3.indexOf(filtered[0]);

    const parsed = parseInt(localIndex, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > filtered.length) {
      return LUNG_SOUND_DATA_V3.indexOf(filtered[0]);
    }

    return LUNG_SOUND_DATA_V3.indexOf(filtered[parsed - 1]);
  };

  const index = resolveV3();
  const data = LUNG_SOUND_DATA_V3[index];

  if (!data) return <div>Data not found</div>;

  return (
    <SimileExplanationV3
      audioName={data.name}
      classification={data.type}
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
  const { randomFoil } = useContext(SettingsContext);

  const absoluteAudioFeatures = Object.entries(data.features).map(([key, val]) => ({
    name: key,
    value: val as string,
  }));

  return (
    <CuesExplanation
      sampleId={data.id}
      audioName={data.name}
      features={absoluteAudioFeatures}
      comparisons={data.CFcomparison}
      highlightedMoments={['First inhalation phase', 'Mid-expiration crackling']}
      originalAudioUrl={data.originalAudioUrl}
      pathology={data.pathology}
      randomFoil={randomFoil}
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

// ─── Redirects ─────────────────────────────────────────────────────────────────

// Prefixes the current path with a version segment, preserving the query
// string — keeps pre-versioning bookmarks working.
function PrefixRedirect({ prefix }: { prefix: string }) {
  const location = useLocation();
  return <Navigate to={`${prefix}${location.pathname}${location.search}`} replace />;
}

// /study/<domain>/... (unversioned, used by existing Qualtrics snippets)
// forwards to the current study version. Only non-v1 study paths reach this
// (the /study/v1 routes rank higher), so it can never redirect to itself.
function StudyVersionRedirect() {
  const location = useLocation();
  return <Navigate to={`${location.pathname.replace(/^\/study\/?/, '/study/v1/')}${location.search}`} replace />;
}

// Malformed /study/v1/... paths (wrong segment count) get the same neutral
// participant-facing message as failed lookups — never the dev navbar.
function StudyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px] text-gray-500 text-center p-8">
      This item could not be loaded. Please continue with the survey.
    </div>
  );
}

function NavigateToRexnet() {
  const { pathology, localIndex } = useParams<{ pathology: string; localIndex: string }>();
  return <Navigate to={`/v0.1/rexnet/test/${pathology}/${localIndex}`} replace />;
}

export function AppRouter() {
  const [randomFoil, setRandomFoil] = useState(false);

  return (
    <SettingsContext.Provider value={{ randomFoil, setRandomFoil }}>
      <HashRouter>
        <div className="w-full bg-transparent">
          <DevNavigator />
          <Routes>
            <Route path="/" element={<Navigate to="/v1/lung/test" replace />} />

            {/* Study mode (Qualtrics-embedded; no class labels in URL, no navbar).
                train = practice descriptions, test = one sample's explanation */}
            <Route path="/study/v1/:domain/:mode/:sampleId?" element={<StudyView />} />
            <Route path="/study/v1/*" element={<StudyFallback />} />
            <Route path="/study/*" element={<StudyVersionRedirect />} />

            {/* v1 — data_v1 dev browser (same content as /study/v1, plus navbar,
                no study logging) */}
            <Route path="/v1" element={<Navigate to="/v1/lung/test" replace />} />
            <Route path="/v1/:domain/:mode?/:sampleId?" element={<V1DevView />} />

            {/* v0.1 — data_v2 bundle */}
            <Route path="/v0.1/similes/practice" element={<SimilePractice />} />
            <Route path="/v0.1/similes/test" element={<Navigate to={`/v0.1/similes/test/${FIRST_PATHOLOGY}/1`} replace />} />
            <Route path="/v0.1/similes/test/:pathology/:localIndex" element={<SimileExplanationWrapper />} />

            <Route path="/v0.1/rexnet/practice" element={<CuesPractice />} />
            <Route path="/v0.1/rexnet/test" element={<Navigate to={`/v0.1/rexnet/test/${FIRST_PATHOLOGY}/1`} replace />} />
            <Route path="/v0.1/rexnet/test/:pathology/:localIndex" element={<CuesExplanationWrapper />} />

            <Route path="/v0.1/onomatopoeia/practice" element={<SimilePractice isOnomatopoeia={true} />} />
            <Route path="/v0.1/onomatopoeia/test" element={<Navigate to={`/v0.1/onomatopoeia/test/${FIRST_PATHOLOGY}/1`} replace />} />
            <Route path="/v0.1/onomatopoeia/test/:pathology/:localIndex" element={<OnomatopoeiaExplanationWrapper />} />

            <Route path="/v0.1/examples/practice" element={<ExamplesPractice />} />
            <Route path="/v0.1/examples/test" element={<Navigate to={`/v0.1/examples/test/${FIRST_PATHOLOGY}/1`} replace />} />
            <Route path="/v0.1/examples/test/:pathology/:localIndex" element={<ExampleExplanationWrapper />} />

            {/* Legacy redirects for cues */}
            <Route path="/v0.1/cues/practice" element={<Navigate to="/v0.1/rexnet/practice" replace />} />
            <Route path="/v0.1/cues/test" element={<Navigate to="/v0.1/rexnet/test" replace />} />
            <Route path="/v0.1/cues/test/:pathology/:localIndex" element={<NavigateToRexnet />} />

            {/* v0.2 — data_v3 bundle (similes_v3) */}
            <Route path="/v0.2/similes_v3/practice" element={<SimilePractice />} />
            <Route path="/v0.2/similes_v3/test" element={<Navigate to={`/v0.2/similes_v3/test/${FIRST_PATHOLOGY}/1`} replace />} />
            <Route path="/v0.2/similes_v3/test/:pathology/:localIndex" element={<SimileExplanationV3Wrapper />} />

            {/* Pre-versioning bookmarks */}
            <Route path="/similes/*" element={<PrefixRedirect prefix="/v0.1" />} />
            <Route path="/rexnet/*" element={<PrefixRedirect prefix="/v0.1" />} />
            <Route path="/onomatopoeia/*" element={<PrefixRedirect prefix="/v0.1" />} />
            <Route path="/examples/*" element={<PrefixRedirect prefix="/v0.1" />} />
            <Route path="/cues/*" element={<PrefixRedirect prefix="/v0.1" />} />
            <Route path="/similes_v3/*" element={<PrefixRedirect prefix="/v0.2" />} />
          </Routes>
        </div>
      </HashRouter>
    </SettingsContext.Provider>
  );
}
