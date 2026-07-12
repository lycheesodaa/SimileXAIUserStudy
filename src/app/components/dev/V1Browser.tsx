import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { STUDY_DOMAINS } from '../../study/domainRegistry';
import {
  CoreSampleInfo,
  DATA_V1_TRAIN_ROOT,
  V1ModelVerdict,
  loadCoreSamples,
  loadSample,
  modelKeyForXai,
} from '../../study/dataV1';

// Dev-only browser for the v1 study conditions, mounted at
//   /#/v1/:domain/test/:sampleId?xai=<condition>
//   /#/v1/:domain/train?xai=<condition>
//   /#/v1/:domain/tutorial/:sampleId?xai=<condition>   (guided UI tour)
// It renders exactly what participants see via /#/study/v1/... but adds the
// navigation bar (true labels included — this is for audio quality checks)
// and creates NO study logger, so browsing never spams the /log endpoint.

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
  // /v1/:domain/:mode/:sampleId
  const parts = location.pathname.split('/');
  const domain = parts[2] || 'lung';
  const mode = parts[3] || 'test';
  const sampleId = parts[4] ? decodeURIComponent(parts[4]) : undefined;
  const domainCfg = STUDY_DOMAINS[domain];
  const xai = searchParams.get('xai') || domainCfg?.defaultXai || 'similes';
  return { domain, mode, sampleId, xai, domainCfg };
}

export function V1Navigator({ versionOptions, onVersionChange }: {
  versionOptions: string[];
  onVersionChange: (version: string) => void;
}) {
  const navigate = useNavigate();
  const { domain, mode, sampleId, xai, domainCfg } = useV1Route();

  const [samples, setSamples] = useState<CoreSampleInfo[]>([]);
  useEffect(() => {
    let cancelled = false;
    setSamples([]);
    loadCoreSamples(domain).then((list) => {
      if (!cancelled && list) setSamples(list);
    });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  // The selected condition's model verdict (predicted label / correct /
  // faithful), read from the sample JSON. Cached by loadSample, so this shares
  // the fetch V1DevView already issues. Dev-only — never shown to participants.
  const [verdict, setVerdict] = useState<V1ModelVerdict | null>(null);
  useEffect(() => {
    let cancelled = false;
    setVerdict(null);
    if (mode === 'train' || !sampleId) return;
    const key = modelKeyForXai(domain, xai);
    if (!key) return; // noxai: no model verdict to show
    loadSample(domain, sampleId).then((s) => {
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
  }, [domain, sampleId, xai, mode]);

  const goTo = (d: string, m: string, id: string | undefined, x: string) => {
    const path = m === 'train' ? `/v1/${d}/train` : `/v1/${d}/${m}${id ? `/${encodeURIComponent(id)}` : ''}`;
    navigate(`${path}?xai=${encodeURIComponent(x)}`);
  };

  const index = samples.findIndex((s) => s.sample_id === sampleId);
  const prev = index > 0 ? samples[index - 1] : null;
  const next = index >= 0 && index < samples.length - 1 ? samples[index + 1] : null;

  return (
    <div style={{ background: '#f0f9ff', borderBottom: '1px solid #bae6fd', padding: '8px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 700 }}>XAI User Study</span>

        <label style={labelStyle}>
          Version&nbsp;
          <select value="v1" onChange={(e) => onVersionChange(e.target.value)} style={selectStyle}>
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

        <label style={labelStyle}>
          XAI Type&nbsp;
          <select value={xai} onChange={(e) => goTo(domain, mode, sampleId, e.target.value)} style={selectStyle}>
            {Object.keys(domainCfg?.xaiVariants ?? {}).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Mode&nbsp;
          <select value={mode} onChange={(e) => goTo(domain, e.target.value, sampleId, xai)} style={selectStyle}>
            <option value="train">train</option>
            <option value="test">test</option>
            <option value="tutorial">tutorial</option>
          </select>
        </label>
      </div>

      {mode !== 'train' && (
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

export function V1DevView() {
  const navigate = useNavigate();
  const { domain, mode, sampleId } = useParams<{ domain: string; mode: string; sampleId?: string }>();
  const [searchParams] = useSearchParams();
  const domainCfg = domain ? STUDY_DOMAINS[domain] : undefined;
  const xai = searchParams.get('xai') || domainCfg?.defaultXai || 'similes';
  const xaiCfg = domainCfg?.xaiVariants[xai];
  const isTrain = mode === 'train';
  const isTutorial = mode === 'tutorial';

  // /v1/<domain>/test (or /tutorial) without a sample id: jump to the first
  // core sample, keeping the mode.
  useEffect(() => {
    if (isTrain || sampleId || !domainCfg) return;
    loadCoreSamples(domain!).then((list) => {
      if (list?.[0]) {
        navigate(`/v1/${domain}/${mode ?? 'test'}/${encodeURIComponent(list[0].sample_id)}?xai=${encodeURIComponent(xai)}`, { replace: true });
      }
    });
  }, [isTrain, sampleId, domain, domainCfg, mode, xai, navigate]);

  const [load, setLoad] = useState<{ status: 'loading' | 'ready' | 'missing'; view?: unknown }>({ status: 'loading' });
  useEffect(() => {
    if (isTrain) {
      setLoad({ status: 'ready' });
      return;
    }
    if (!xaiCfg || !sampleId) {
      setLoad({ status: 'missing' });
      return;
    }
    let cancelled = false;
    setLoad({ status: 'loading' });
    xaiCfg.getSample(sampleId).then((view) => {
      if (!cancelled) setLoad(view ? { status: 'ready', view } : { status: 'missing' });
    });
    return () => {
      cancelled = true;
    };
  }, [xaiCfg, sampleId, isTrain]);

  // Optional practice subset from public/data_v1_train (mirrors StudyView):
  // absent bundle = empty list = descriptions-only train mode.
  const [trainViews, setTrainViews] = useState<unknown[]>([]);
  useEffect(() => {
    if (!isTrain || !xaiCfg) return;
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
  }, [isTrain, xaiCfg, domain]);

  if (!xaiCfg || load.status === 'missing') {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 text-center p-8">
        {!xaiCfg
          ? `Unknown domain/condition: ${domain}/${xai}`
          : `Sample not found in data_v1/${domain}: ${sampleId ?? '(none)'}`}
      </div>
    );
  }
  if (load.status === 'loading') {
    return <div className="min-h-[300px]" aria-busy="true" />;
  }
  if (isTrain) {
    return (
      <>
        {xaiCfg.renderTrain()}
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
