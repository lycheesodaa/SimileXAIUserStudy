import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { STUDY_DOMAINS } from './domainRegistry';
import { createStudyLogger } from './logger';
import { useStudyInstrumentation } from './useStudyInstrumentation';

// Study-mode entry point, embedded in Qualtrics as an iframe:
//   test:  /#/study/v1/:domain/test/:sampleId?pid=<participant>&xai=<condition>&pos=<loop position>
//   train: /#/study/v1/:domain/train?pid=<participant>&xai=<condition>
// (unversioned /#/study/... redirects here; /#/v1/... is the navbar'd dev twin)
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
  const { domain, mode, sampleId } = useParams<{ domain: string; mode: string; sampleId?: string }>();
  const [searchParams] = useSearchParams();

  const pid = searchParams.get('pid') || 'unknown';
  const pos = searchParams.get('pos');

  const isTrain = mode === 'train';
  const domainCfg = domain ? STUDY_DOMAINS[domain] : undefined;
  const xaiType = searchParams.get('xai') || domainCfg?.defaultXai || 'similes';
  const xaiCfg = domainCfg?.xaiVariants[xaiType];

  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
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
    xaiCfg.getSample(sampleId).then((sample) => {
      if (cancelled) return;
      setLoad(sample ? { status: 'ready', sample } : { status: 'missing' });
    });
    return () => {
      cancelled = true;
    };
  }, [xaiCfg, sampleId, isTrain]);

  const lookupFailed = !xaiCfg || load.status === 'missing';
  const sample = load.status === 'ready' ? load.sample : undefined;

  const logger = useMemo(
    () =>
      createStudyLogger({
        pid,
        domain: domain || 'unknown',
        mode: mode || 'unknown',
        sampleId: sampleId || (isTrain ? 'none' : 'unknown'),
        xaiType,
      }),
    // one logger per mounted study page (domain/mode/sample change = new session)
    [pid, domain, mode, sampleId, isTrain, xaiType]
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
    logger.log('lookup_error', { domain, mode, sampleId, xaiType });
    logger.flush();
    return () => logger.dispose();
  }, [lookupFailed, logger, domain, mode, sampleId, xaiType]);

  if (lookupFailed) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 text-center p-8">
        This item could not be loaded. Please continue with the survey.
      </div>
    );
  }

  if (load.status === 'loading') {
    return <div className="min-h-[300px]" aria-busy="true" />;
  }

  if (isTrain) {
    return <>{xaiCfg.renderTrain()}</>;
  }

  return <>{xaiCfg.render(sample, { isStudy: true })}</>;
}
