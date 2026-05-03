import { Suspense, lazy } from 'react'
import RewardToast from '../../components/RewardToast'
import useRewardToast from '../../hooks/useRewardToast'
import { ResultPill } from './missionPageShared'

const MissionExecutionScene = lazy(() => import('./MissionExecutionScene'))

function MissionSceneFallback() {
  return (
    <div className="rounded-[24px] border border-black/10 bg-white px-4 py-8 text-sm leading-7 text-stone-600">
      Chargement de la scene mission...
    </div>
  )
}

export default function MissionResultSection({
  activeResultPattern,
  mission,
  onSelectResultPattern,
  patternsByCode,
  result,
}) {
  const {
    rewardToast,
    dismissRewardToast,
  } = useRewardToast(result?.progression ?? null)

  return (
    <section className="grid content-start gap-4">
      <article className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_12px_34px_rgba(47,37,22,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Simulation</p>
        <h2 className="mt-2 text-2xl text-stone-950">Execution de mission</h2>
        <p className="mt-1 text-sm leading-7 text-stone-700">
          Le score combine le choix des patterns et la qualite de leur configuration.
        </p>
      </article>

      {result ? (
        <>
          <RewardToast reward={rewardToast} onDismiss={dismissRewardToast} />

          <article className="rounded-[24px] border border-black/10 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Lecture du resultat</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">{result.feedback}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <ResultPill tone={result.success ? 'success' : 'danger'}>
                {result.success ? 'Solution coherente' : 'Solution incomplete'}
              </ResultPill>
              {result.unexpectedPatterns.map((patternCode) => (
                <ResultPill key={patternCode} tone="danger">
                  Hors cible: {patternsByCode[patternCode]?.name ?? patternCode}
                </ResultPill>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-black/10 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Simulation</p>
                <p className="mt-1 text-sm leading-7 text-stone-600">
                  Clique sur une brique pour la mettre au centre de la scene mission.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.patternReports
                  .filter((report) => report.selected && result.executionResults[report.patternCode])
                  .map((report) => (
                    <button
                      key={report.patternCode}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        report.patternCode === activeResultPattern
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-black/10 bg-[var(--panel)] text-stone-700'
                      }`}
                      type="button"
                      onClick={() => onSelectResultPattern(report.patternCode)}
                    >
                      {report.patternName}
                    </button>
                  ))}
              </div>
            </div>
          </article>

          <Suspense fallback={<MissionSceneFallback />}>
            <MissionExecutionScene
              activePatternCode={activeResultPattern}
              mission={mission}
              patternsByCode={patternsByCode}
              result={result}
              onSelectPattern={onSelectResultPattern}
            />
          </Suspense>

        </>
      ) : (
        <div className="rounded-[24px] border border-dashed border-black/15 bg-[var(--panel)] px-4 py-8 text-sm leading-7 text-stone-600">
          Compose une solution, configure-la puis lance la mission pour afficher la scene SVG dediee au scenario.
        </div>
      )}
    </section>
  )
}
