import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { STUDY_DOMAINS } from './domainRegistry';
import { DATA_V1_TRAIN_ROOT, loadCoreSamples } from './dataV1';
import { createStudyLogger } from './logger';
import { useStudyInstrumentation } from './useStudyInstrumentation';

// Study-mode entry point, embedded in Qualtrics as an iframe:
//   test:     /#/study/v1/:domain/test/:sampleId?pid=<participant>&xai=<condition>&pos=<loop position>
//   train:    /#/study/v1/:domain/train?pid=<participant>&xai=<condition>
//   tutorial: /#/study/v1/:domain/tutorial/:sampleId??pid=<participant>&xai=<condition>
// (unversioned /#/study/... redirects here; /#/v1/... is the navbar'd dev twin)
// tutorial mode renders the condition's explanation UI from a real sample
// (defaulting to the first core sample) as a static guided tour; train mode
// shows the practice descriptions plus, when public/data_v1_train/<domain>
// exists, an explanation UI for each sample in that practice subset.
// The URL carries no class labels; Qualtrics Loop & Merge decides which
// sample (and in what order) each participant sees. The xai param selects the
// condition (similes, onomatopoeia, similes_dualview, onomatopoeia_dualview,
// similes_dualview_approx, onomatopoeia_dualview_approx, rexnet, examples,
// noxai); an unrecognized
// value renders the neutral fallback and logs lookup_error rather than
// silently showing the wrong condition. Train mode shows the condition's
// training/practice descriptions without any sample or navbar.
//
// Samples are fetched from public/data_v1 at runtime (variant getSample is
// async), so the view holds a small load state machine; instrumentation only
// starts once the sample is ready, so exactly one session_start fires.
type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; sample?: unknown }
  | { status: 'missing' };

export function StudyView() {
  const rawParams = useParams<{ domain: string; mode?: string; sampleId?: string }>();
  const [searchParams] = useSearchParams();

  const domain = (rawParams.domain || 'lung').trim();
  const mode = (rawParams.mode || 'test').trim();
  const rawSampleId = rawParams.sampleId?.trim();

  const pid = (searchParams.get('pid') || 'unknown').trim();
  const pos = searchParams.get('pos');

  const isTrain = mode === 'train';
  const isTutorial = mode === 'tutorial';
  const domainCfg = STUDY_DOMAINS[domain];
  const xaiType = (searchParams.get('xai') || domainCfg?.defaultXai || 'similes').trim();
  const xaiCfg = domainCfg?.xaiVariants[xaiType];

  const [resolvedSampleId, setResolvedSampleId] = useState<string | undefined>(rawSampleId);
  useEffect(() => {
    if (rawSampleId) {
      setResolvedSampleId(rawSampleId);
      return;
    }
    if (!isTrain && domain) {
      loadCoreSamples(domain).then((list) => {
        if (list?.[0]) {
          setResolvedSampleId(list[0].sample_id);
        }
      });
    }
  }, [rawSampleId, isTrain, domain]);

  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  useEffect(() => {
    if (isTrain) {
      setLoad({ status: 'ready' });
      return;
    }
    if (!xaiCfg || !resolvedSampleId) {
      if (!xaiCfg) {
        setLoad({ status: 'missing' });
      } else {
        setLoad({ status: 'loading' });
      }
      return;
    }
    let cancelled = false;
    setLoad({ status: 'loading' });
    xaiCfg.getSample(resolvedSampleId).then((sample) => {
      if (cancelled) return;
      setLoad(sample ? { status: 'ready', sample } : { status: 'missing' });
    });
    return () => {
      cancelled = true;
    };
  }, [xaiCfg, resolvedSampleId, isTrain]);

  // Optional practice subset for train mode: every sample found in the
  // data_v1_train bundle, mapped through the active condition. Missing bundle
  // (404) resolves undefined and leaves the list empty — train renders as
  // descriptions-only, exactly as before the subset existed.
  const [trainViews, setTrainViews] = useState<unknown[]>([]);
  useEffect(() => {
    if (!isTrain || !xaiCfg) return;
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
  }, [isTrain, xaiCfg, domain]);

  const lookupFailed =
    !xaiCfg || load.status === 'missing' || (isTutorial && !xaiCfg.renderTutorial);
  const sample = load.status === 'ready' ? load.sample : undefined;

  const logger = useMemo(
    () =>
      createStudyLogger({
        pid,
        domain: domain || 'unknown',
        mode: mode || 'unknown',
        sampleId: resolvedSampleId || (isTrain ? 'none' : 'unknown'),
        xaiType,
      }),
    // one logger per mounted study page (domain/mode/sample change = new session)
    [pid, domain, mode, resolvedSampleId, isTrain, xaiType]
  );

  // Instrumentation runs for both modes; skipped entirely on failed lookups
  // and while the sample is still loading (no premature session_start).
  useStudyInstrumentation(
    logger,
    sample,
    lookupFailed || load.status !== 'ready' ? undefined : xaiCfg,
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

  if (load.status === 'loading') {
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

  if (isTrain) {
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
