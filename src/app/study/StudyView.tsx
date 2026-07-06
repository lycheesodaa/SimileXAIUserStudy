import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { STUDY_DOMAINS } from './domainRegistry';
import { createStudyLogger } from './logger';
import { useStudyInstrumentation } from './useStudyInstrumentation';

// Study-mode entry point, embedded in Qualtrics as an iframe:
//   test:  /#/study/:domain/test/:sampleId?pid=<participant>&xai=<condition>&pos=<loop position>
//   train: /#/study/:domain/train?pid=<participant>&xai=<condition>
// The URL carries no class labels; Qualtrics Loop & Merge decides which
// sample (and in what order) each participant sees. The xai param selects the
// condition (similes_v3, rexnet, rexnet_foil, onomatopoeia, examples, ...);
// an unrecognized value renders the neutral fallback and logs lookup_error
// rather than silently showing the wrong condition. Train mode shows the
// condition's training/practice descriptions without any sample or navbar.
export function StudyView() {
  const { domain, mode, sampleId } = useParams<{ domain: string; mode: string; sampleId?: string }>();
  const [searchParams] = useSearchParams();

  const pid = searchParams.get('pid') || 'unknown';
  const pos = searchParams.get('pos');

  const isTrain = mode === 'train';
  const domainCfg = domain ? STUDY_DOMAINS[domain] : undefined;
  const xaiType = searchParams.get('xai') || domainCfg?.defaultXai || 'similes_v3';
  const xaiCfg = domainCfg?.xaiVariants[xaiType];
  const sample = !isTrain && xaiCfg && sampleId ? xaiCfg.getSample(sampleId) : undefined;

  const lookupFailed = !xaiCfg || (!isTrain && !sample);

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

  // Instrumentation runs for both modes; skipped entirely on failed lookups.
  useStudyInstrumentation(logger, sample, lookupFailed ? undefined : xaiCfg, pos);

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

  if (isTrain) {
    return <>{xaiCfg.renderTrain()}</>;
  }

  return <>{xaiCfg.render(sample!)}</>;
}
