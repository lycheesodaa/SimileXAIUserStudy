import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { STUDY_DOMAINS } from '../../study/domainRegistry';
import {
  CoreSampleInfo,
  DATA_V1_ROOT,
  DATA_V1_TRAIN_ROOT,
  DataRoot,
  StudySplit,
  V1ModelVerdict,
  dataRootForVersion,
  loadCoreSamples,
  loadSample,
  loadSplitSamples,
  modelKeyForXai,
  versionForRoot,
} from '../../study/dataV1';

// The dev browser is mounted per version-prefixed route (/v1, /v2, …); the
// prefix both selects the bundle root (versionForRoot / dataRootForVersion,
// derived from the BUNDLE_VERSIONS registry) and prefixes every nav URL it
// builds.

// Dev-only browser for the v1 study conditions, mounted at
//   /#/v1/:domain/test/:sampleId?xai=<condition>       (testing.csv samples)
//   /#/v1/:domain/post/:sampleId?xai=<condition>       (post-test.csv samples)
//   /#/v1/:domain/guide?xai=<condition>                (practice descriptions
//                                                       + per-class recordings)
//   /#/v1/:domain/tutorial/:sampleId?xai=<condition>   (guided UI tour)
// (train mode is retired — training.csv samples surface on the guide page.)
// It renders exactly what participants see via /#/study/v1/... but adds the
// navigation bar (true labels included — this is for audio quality checks)
// and creates NO study logger, so browsing never spams the /log endpoint.

// Which curated sample list a mode navigates; null = no samples (guide shows
// the condition's practice descriptions instead).
const splitForMode = (mode: string): StudySplit | null => {
  if (mode === 'guide') return null;
  // train mode retired (subsumed into guide):
  // if (mode === 'train') return 'train';
  return mode === 'post' ? 'post' : 'test';
};

// Split list, falling back to the full core list if the CSV is missing/empty
// so the browser stays usable on incomplete bundles.
const loadSamplesForMode = async (
  domain: string,
  mode: string,
  root: DataRoot = DATA_V1_ROOT
): Promise<CoreSampleInfo[]> => {
  const split = splitForMode(mode);
  if (!split) return [];
  const list = (await loadSplitSamples(domain, split, root)) ?? (await loadCoreSamples(domain, root));
  return list ?? [];
};

// Full navbar vs. the restricted one shown on the deployed build.
//   full (npm run dev):   version + domain pickers, every non-dualview
//                         condition, all four modes, sample navigation.
//   restricted (build):   XAI Type + Mode (test/tutorial) only.
// `vite build` — what the Pages deploy runs — sets DEV false, so the split
// needs no configuration. Set VITE_FULL_NAV=true to force the full navbar into
// a production build (e.g. to check `npm run preview` locally).
export const FULL_NAV = import.meta.env.DEV || import.meta.env.VITE_FULL_NAV === 'true';

// Which conditions the XAI Type dropdown offers. Dualview is always hidden;
// the activation views (_actv) and the noxai control are hidden in the
// restricted navbar only. Being off the dropdown hides nothing from the
// registry, so study routes and direct ?xai= URLs still resolve to them.
const xaiVisible = (x: string): boolean => {
  if (x.includes('dualview')) return false;
  if (!FULL_NAV && (x === 'noxai' || x.endsWith('_actv'))) return false;
  return true;
};

const selectStyle: React.CSSProperties = {
  fontSize: '13px',
  padding: '3px 6px',
  borderRadius: '6px',
  border: '1px solid #7dd3fc',
  background: '#fff',
  color: '#0c4a6e',
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = { fontSize: '13px', color: '#0369a1' };

function useV1Route() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // /<version>/:domain/:mode/:sampleId  (version = any BUNDLE_VERSIONS entry)
  const parts = location.pathname.split('/');
  const version = parts[1] || 'v1';
  const domain = parts[2] || 'lung';
  const mode = parts[3] || 'test';
  const sampleId = parts[4] ? decodeURIComponent(parts[4]) : undefined;
  const domainCfg = STUDY_DOMAINS[domain];
  const xai = searchParams.get('xai') || domainCfg?.defaultXai || 'similes';
  const root = dataRootForVersion(version);
  return { version, domain, mode, sampleId, xai, domainCfg, root };
}

export function V1Navigator({ versionOptions, onVersionChange }: {
  versionOptions: string[];
  onVersionChange: (version: string) => void;
}) {
  const navigate = useNavigate();
  const { version, domain, mode, sampleId, xai, domainCfg, root } = useV1Route();

  // Both lists below feed the sample-navigation row only, so the restricted
  // navbar skips fetching them.
  const [samples, setSamples] = useState<CoreSampleInfo[]>([]);
  useEffect(() => {
    let cancelled = false;
    setSamples([]);
    if (!FULL_NAV) return;
    loadSamplesForMode(domain, mode, root).then((list) => {
      if (!cancelled) setSamples(list);
    });
    return () => {
      cancelled = true;
    };
  }, [domain, mode, root]);

  // The selected condition's model verdict (predicted label / correct /
  // faithful), read from the sample JSON. Cached by loadSample, so this shares
  // the fetch V1DevView already issues. Dev-only — never shown to participants.
  const [verdict, setVerdict] = useState<V1ModelVerdict | null>(null);
  useEffect(() => {
    let cancelled = false;
    setVerdict(null);
    if (!FULL_NAV || mode === 'guide' || !sampleId) return;
    const key = modelKeyForXai(domain, xai);
    if (!key) return; // noxai: no model verdict to show
    loadSample(domain, sampleId, root).then((s) => {
      if (cancelled || !s) return;
      const m = s.models[key] as
        | { predicted_label?: string; correct?: boolean; faithful?: number }
        | undefined;
      if (!m) return;
      setVerdict({ predictedLabel: m.predicted_label, correct: m.correct, faithful: m.faithful });
    });
    return () => {
      cancelled = true;
    };
  }, [domain, sampleId, xai, mode, root]);

  const goTo = (d: string, m: string, id: string | undefined, x: string) => {
    const path = m === 'guide' ? `/${version}/${d}/guide` : `/${version}/${d}/${m}${id ? `/${encodeURIComponent(id)}` : ''}`;
    navigate(`${path}?xai=${encodeURIComponent(x)}`);
  };

  // Changing mode across splits (e.g. train → test) invalidates the current
  // sample id; drop it so V1DevView redirects to the new split's first sample.
  const goToMode = (m: string) => {
    const keepId = splitForMode(m) !== null && splitForMode(m) === splitForMode(mode);
    goTo(domain, m, keepId ? sampleId : undefined, xai);
  };

  const index = samples.findIndex((s) => s.sample_id === sampleId);
  const prev = index > 0 ? samples[index - 1] : null;
  const next = index >= 0 && index < samples.length - 1 ? samples[index + 1] : null;

  // The navbar sits above the tutorial overlay's dim (z-60), which is fixed to
  // the whole viewport and would otherwise grey out chrome that stays fully
  // clickable — the tour dims the explanation, not the navigation around it.
  // Still below the tour's tooltip card (z-70).
  return (
    <div
      style={{
        background: '#f0f9ff',
        borderBottom: '1px solid #bae6fd',
        padding: '8px 12px',
        position: 'relative',
        zIndex: 65,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 700 }}>XAI User Study</span>

        {FULL_NAV && (
          <>
            <label style={labelStyle}>
              Version&nbsp;
              <select value={version} onChange={(e) => onVersionChange(e.target.value)} style={selectStyle}>
                {versionOptions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Domain&nbsp;
              <select value={domain} onChange={(e) => goTo(e.target.value, mode, undefined, xai)} style={selectStyle}>
                {Object.keys(STUDY_DOMAINS).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
          </>
        )}

        <label style={labelStyle}>
          XAI Type&nbsp;
          <select value={xai} onChange={(e) => goTo(domain, mode, sampleId, e.target.value)} style={selectStyle}>
            {Object.keys(domainCfg?.xaiVariants ?? {})
              .filter(xaiVisible)
              .map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
          </select>
        </label>

        <label style={labelStyle}>
          Mode&nbsp;
          <select value={mode} onChange={(e) => goToMode(e.target.value)} style={selectStyle}>
            {FULL_NAV && (
              <>
                <option value="guide">guide</option>
                {/* train mode retired — training samples now live on the
                    guide page: */}
                {/* <option value="train">train</option> */}
                <option value="post">post</option>
              </>
            )}
            <option value="test">test</option>
            <option value="tutorial">tutorial</option>
          </select>
        </label>
      </div>

      {FULL_NAV && mode !== 'guide' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '8px', marginTop: '8px', borderTop: '1px dashed #bae6fd' }}>
          <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 600 }}>
            Navigate sample{index >= 0 ? ` (${index + 1}/${samples.length})` : ''}:
          </span>
          <label style={labelStyle}>
            Sample&nbsp;
            <select
              value={sampleId ?? ''}
              onChange={(e) => goTo(domain, mode, e.target.value, xai)}
              style={{ ...selectStyle, maxWidth: '420px' }}
            >
              {sampleId && index === -1 && <option value={sampleId}>{sampleId}</option>}
              {samples.map((s) => (
                <option key={s.sample_id} value={s.sample_id}>
                  {s.sample_id} — {s.true_label}
                </option>
              ))}
            </select>
          </label>
          {index >= 0 && (
            <span style={{ fontSize: '13px', color: '#0369a1' }}>
              True label: <b>{samples[index].true_label}</b>
            </span>
          )}
          {verdict?.predictedLabel && (
            <span style={{ fontSize: '13px', color: '#0369a1' }}>
              AI predicted: <b>{verdict.predictedLabel}</b>
              {verdict.correct != null && (
                <b style={{ color: verdict.correct ? '#15803d' : '#b91c1c' }}>
                  {' '}
                  {verdict.correct ? '✓' : '✗'}
                </b>
              )}
            </span>
          )}
          {verdict?.faithful != null && (
            <span style={{ fontSize: '13px', color: '#0369a1' }}>
              Faithfulness: <b>{Math.round(verdict.faithful * 5)}/5</b>
            </span>
          )}
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            {[{ label: '← Prev', target: prev }, { label: 'Next →', target: next }].map(({ label, target }) => (
              <button
                key={label}
                onClick={() => target && goTo(domain, mode, target.sample_id, xai)}
                disabled={!target}
                style={{
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: '1px solid #7dd3fc',
                  background: !target ? '#e0f2fe' : '#0ea5e9',
                  color: !target ? '#93c5fd' : '#fff',
                  cursor: !target ? 'not-allowed' : 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function V1DevView({ root = DATA_V1_ROOT }: { root?: DataRoot }) {
  const navigate = useNavigate();
  const version = versionForRoot(root);
  const { domain, mode, sampleId } = useParams<{ domain: string; mode: string; sampleId?: string }>();
  const [searchParams] = useSearchParams();
  const domainCfg = domain ? STUDY_DOMAINS[domain] : undefined;
  const xai = searchParams.get('xai') || domainCfg?.defaultXai || 'similes';
  const xaiCfg = domainCfg?.xaiVariants[xai];
  const isGuide = mode === 'guide';
  const isTutorial = mode === 'tutorial';

  // A loaded view is only valid for the exact route (condition + sample) it
  // was fetched for. Without this key, the render after an xai/mode change
  // would hand the previous condition's view — a different shape — to the new
  // condition's render() and crash before any effect could recover (the blank
  // page + never-populated sample id in the URL).
  const viewKey = `${version}|${domain}|${mode}|${sampleId ?? ''}|${xai}`;

  // /v1/<domain>/test|train|tutorial without a sample id: jump to the first
  // sample of the mode's split, keeping the mode.
  useEffect(() => {
    if (isGuide || sampleId || !domainCfg) return;
    loadSamplesForMode(domain!, mode ?? 'test', root).then((list) => {
      if (list[0]) {
        navigate(`/${version}/${domain}/${mode ?? 'test'}/${encodeURIComponent(list[0].sample_id)}?xai=${encodeURIComponent(xai)}`, { replace: true });
      }
    });
  }, [isGuide, sampleId, domain, domainCfg, mode, xai, navigate, root, version]);

  const [load, setLoad] = useState<{ key: string; status: 'loading' | 'ready' | 'missing'; view?: unknown }>({
    key: viewKey,
    status: 'loading',
  });
  useEffect(() => {
    if (isGuide) {
      setLoad({ key: viewKey, status: 'ready' });
      return;
    }
    if (!xaiCfg || !sampleId) {
      // No sample id yet: the redirect effect above is about to supply one.
      setLoad({ key: viewKey, status: !xaiCfg ? 'missing' : 'loading' });
      return;
    }
    let cancelled = false;
    setLoad({ key: viewKey, status: 'loading' });
    xaiCfg.getSample(sampleId, root).then((view) => {
      if (!cancelled) setLoad(view ? { key: viewKey, status: 'ready', view } : { key: viewKey, status: 'missing' });
    });
    return () => {
      cancelled = true;
    };
  }, [xaiCfg, sampleId, isGuide, viewKey, root]);

  // Optional practice subset from public/data_v1_train (mirrors StudyView):
  // absent bundle = empty list = descriptions-only guide mode.
  const [trainViews, setTrainViews] = useState<unknown[]>([]);
  useEffect(() => {
    if (!isGuide || !xaiCfg) return;
    let cancelled = false;
    setTrainViews([]);
    loadCoreSamples(domain!, DATA_V1_TRAIN_ROOT).then(async (list) => {
      if (!list || cancelled) return;
      const views = await Promise.all(
        list.map((s) => xaiCfg.getSample(s.sample_id, DATA_V1_TRAIN_ROOT))
      );
      if (!cancelled) setTrainViews(views.filter((v) => v !== undefined));
    });
    return () => {
      cancelled = true;
    };
  }, [isGuide, xaiCfg, domain]);

  // A load state fetched for a previous route is stale — treat it as loading
  // until the effect for the current route lands.
  const status = load.key === viewKey ? load.status : 'loading';

  if (!xaiCfg || status === 'missing') {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 text-center p-8">
        {!xaiCfg
          ? `Unknown domain/condition: ${domain}/${xai}`
          : `Sample not found in ${root}/${domain}: ${sampleId ?? '(none)'}`}
      </div>
    );
  }
  if (status === 'loading') {
    return <div className="min-h-[300px]" aria-busy="true" />;
  }
  if (isGuide) {
    return (
      <>
        {xaiCfg.renderTrain(root)}
        {trainViews.map((v, i) => (
          <div key={i} className="mt-8 pt-4 border-t border-gray-200">
            {xaiCfg.render(v, { isStudy: false })}
          </div>
        ))}
      </>
    );
  }
  if (isTutorial) {
    if (!xaiCfg.renderTutorial) {
      return (
        <div className="flex items-center justify-center min-h-[300px] text-gray-500 text-center p-8">
          No tutorial available for condition: {xai}
        </div>
      );
    }
    return <>{xaiCfg.renderTutorial(load.view)}</>;
  }
  return <>{xaiCfg.render(load.view, { isStudy: false })}</>;
}
