import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { STUDY_DOMAINS } from './domainRegistry';
import { DATA_V1_TRAIN_ROOT, loadCoreSamples, loadSplitSamples } from './dataV1';
import { createStudyLogger } from './logger';
import { useStudyInstrumentation } from './useStudyInstrumentation';

// Study-mode entry point, embedded in Qualtrics as an iframe:
//   test:     /#/study/v1/:domain/test/:sampleId?pid=<participant>&xai=<condition>&pos=<loop position>
//   train:    /#/study/v1/:domain/train/:sampleId?pid=<participant>&xai=<condition>&pos=<loop position>
//   guide:    /#/study/v1/:domain/guide?pid=<participant>&xai=<condition>
//   tutorial: /#/study/v1/:domain/tutorial/:sampleId??pid=<participant>&xai=<condition>
// (unversioned /#/study/... redirects here; /#/v1/... is the navbar'd dev twin)
// test and train both render one sample's explanation; they differ only in
// which curated split supplies the default sample when the URL omits one
// (testing.csv vs training.csv, both at the data_v1 root). tutorial mode
// renders the condition's explanation UI from a real sample (defaulting to
// the first testing split sample) as a static guided tour; guide mode shows
// the practice descriptions plus, when public/data_v1_train/<domain> exists,
// an explanation UI for each sample in that practice subset.
// The URL carries no class labels; Qualtrics Loop & Merge decides which
// sample (and in what order) each participant sees. The xai param selects the
// condition (similes, onomatopoeia, similes_dualview_approx,
// onomatopoeia_dualview_approx, similes_actv, onomatopoeia_actv,
// similes_dualview_actv, onomatopoeia_dualview_actv, rexnet, examples,
// noxai); an unrecognized
// value renders the neutral fallback and logs lookup_error rather than
// silently showing the wrong condition. Guide mode shows the condition's
// training/practice descriptions without any sample or navbar.
//
// Samples are fetched from public/data_v1 at runtime (variant getSample is
// async), so the view holds a small load state machine; instrumentation only
// starts once the sample is ready, so exactly one session_start fires.
type LoadState = {
  // The route (domain/mode/sample/xai) this state was produced for.
  key: string;
  status: 'loading' | 'ready' | 'missing';
  sample?: unknown;
};

export function StudyView() {
  const rawParams = useParams<{ domain: string; mode?: string; sampleId?: string }>();
  const [searchParams] = useSearchParams();

  const domain = (rawParams.domain || 'lung').trim();
  const mode = (rawParams.mode || 'test').trim();
  const rawSampleId = rawParams.sampleId?.trim();

  const pid = (searchParams.get('pid') || 'unknown').trim();
  const pos = searchParams.get('pos');

  const isGuide = mode === 'guide';
  const isTrain = mode === 'train';
  const isTutorial = mode === 'tutorial';
  const domainCfg = STUDY_DOMAINS[domain];
  const xaiType = (searchParams.get('xai') || domainCfg?.defaultXai || 'similes').trim();
  const xaiCfg = domainCfg?.xaiVariants[xaiType];

  // A loaded sample is only valid for the route it was fetched for; a stale
  // one must render as loading, never be handed to a different condition's
  // render() (shape mismatch = crash = blank iframe).
  const viewKey = `${domain}|${mode}|${rawSampleId ?? ''}|${xaiType}`;

  const [resolved, setResolved] = useState<{ key: string; sampleId?: string }>({
    key: viewKey,
    sampleId: rawSampleId,
  });
  useEffect(() => {
    if (rawSampleId || isGuide || !domain) {
      setResolved({ key: viewKey, sampleId: rawSampleId });
      return;
    }
    // No sample in the URL: default to the first sample of the mode's split
    // (training.csv for train, testing.csv for test/tutorial), falling back
    // to the full core list if the split file is missing.
    let cancelled = false;
    setResolved({ key: viewKey, sampleId: undefined });
    loadSplitSamples(domain, isTrain ? 'train' : 'test')
      .then((list) => list ?? loadCoreSamples(domain))
      .then((list) => {
        if (!cancelled && list?.[0]) {
          setResolved({ key: viewKey, sampleId: list[0].sample_id });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [rawSampleId, isGuide, isTrain, domain, viewKey]);

  const resolvedSampleId = resolved.key === viewKey ? resolved.sampleId : undefined;

  const [load, setLoad] = useState<LoadState>({ key: viewKey, status: 'loading' });
  useEffect(() => {
    if (isGuide) {
      setLoad({ key: viewKey, status: 'ready' });
      return;
    }
    if (!xaiCfg || !resolvedSampleId) {
      setLoad({ key: viewKey, status: !xaiCfg ? 'missing' : 'loading' });
      return;
    }
    let cancelled = false;
    setLoad({ key: viewKey, status: 'loading' });
    xaiCfg.getSample(resolvedSampleId).then((sample) => {
      if (cancelled) return;
      setLoad(sample ? { key: viewKey, status: 'ready', sample } : { key: viewKey, status: 'missing' });
    });
    return () => {
      cancelled = true;
    };
  }, [xaiCfg, resolvedSampleId, isGuide, viewKey]);

  // Optional practice subset for guide mode: every sample found in the
  // data_v1_train bundle, mapped through the active condition. Missing bundle
  // (404) resolves undefined and leaves the list empty — guide renders as
  // descriptions-only, exactly as before the subset existed.
  const [trainViews, setTrainViews] = useState<unknown[]>([]);
  useEffect(() => {
    if (!isGuide || !xaiCfg) return;
    let cancelled = false;
    setTrainViews([]);
    loadCoreSamples(domain, DATA_V1_TRAIN_ROOT).then(async (list) => {
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

  // Stale load states (fetched for a previous route) render as loading.
  const loadStatus = load.key === viewKey ? load.status : 'loading';
  const lookupFailed =
    !xaiCfg || loadStatus === 'missing' || (isTutorial && !xaiCfg.renderTutorial);
  const sample = loadStatus === 'ready' && load.key === viewKey ? load.sample : undefined;

  const logger = useMemo(
    () =>
      createStudyLogger({
        pid,
        domain: domain || 'unknown',
        mode: mode || 'unknown',
        sampleId: resolvedSampleId || (isGuide ? 'none' : 'unknown'),
        xaiType,
      }),
    // one logger per mounted study page (domain/mode/sample change = new session)
    [pid, domain, mode, resolvedSampleId, isGuide, xaiType]
  );

  // Instrumentation runs for all modes; skipped entirely on failed lookups
  // and while the sample is still loading (no premature session_start).
  useStudyInstrumentation(
    logger,
    sample,
    lookupFailed || loadStatus !== 'ready' ? undefined : xaiCfg,
    pos
  );

  // Broken Qualtrics piping should be detectable in logs, not silent —
  // but participants get a neutral message with no study details.
  useEffect(() => {
    if (!lookupFailed) return;
    logger.log('lookup_error', { domain, mode, sampleId: resolvedSampleId, xaiType });
    logger.flush();
    return () => logger.dispose();
  }, [lookupFailed, logger, domain, mode, resolvedSampleId, xaiType]);

  if (lookupFailed) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 text-center p-8">
        This item could not be loaded. Please continue with the survey.
      </div>
    );
  }

  if (loadStatus === 'loading') {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-500"
        aria-busy="true"
      >
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading explanation...</span>
      </div>
    );
  }

  if (isGuide) {
    return (
      <>
        {xaiCfg.renderTrain()}
        {trainViews.map((v, i) => (
          <div key={i} className="mt-8 pt-4 border-t border-gray-200">
            {xaiCfg.render(v, { isStudy: true })}
          </div>
        ))}
      </>
    );
  }

  if (isTutorial) {
    return <>{xaiCfg.renderTutorial!(sample)}</>;
  }

  return <>{xaiCfg.render(sample, { isStudy: true })}</>;
}
