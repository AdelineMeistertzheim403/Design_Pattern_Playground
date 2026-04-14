import { Suspense, lazy } from 'react'
import CollapsiblePanel from '../../components/CollapsiblePanel'
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
  activeExecution,
  activeResultPattern,
  mission,
  onSelectResultPattern,
  patternsByCode,
  result,
  selectedPatterns,
}) {
  const {
    rewardToast,
    dismissRewardToast,
  } = useRewardToast(result?.progression ?? null)

  return (
    <CollapsiblePanel
      eyebrow="Simulation"
      title="Resultat de mission"
      description="Le score combine le choix des patterns et la qualite de leur configuration. La scene SVG ci-dessous est propre au scenario mission."
      bodyClassName="grid gap-4"
    >
      {result ? (
        <>
          <RewardToast reward={rewardToast} onDismiss={dismissRewardToast} />

          {result.progression ? (
            <article className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Progression</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-emerald-900">
                <span className="rounded-full bg-white px-4 py-2 font-semibold">+{result.progression.xpGained} XP</span>
                <span className="rounded-full bg-white px-4 py-2 font-semibold">Niveau {result.progression.level}</span>
                <span className="rounded-full bg-white px-4 py-2 font-semibold">{result.progression.rank}</span>
              </div>
              {result.progression.newlyUnlockedBadges?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.progression.newlyUnlockedBadges.map((badge) => (
                    <ResultPill key={badge.code} tone="success">
                      Nouveau badge: {badge.name}
                    </ResultPill>
                  ))}
                </div>
              ) : null}
            </article>
          ) : null}

          <div className="grid gap-4 md:grid-cols-4">
            <article className={`rounded-[22px] border p-4 ${result.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Statut</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">{result.success ? 'Mission reussie' : 'Mission a corriger'}</p>
            </article>

            <article className="rounded-[22px] border border-black/10 bg-[var(--panel)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Score</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">{result.score}/100</p>
            </article>

            <article className="rounded-[22px] border border-black/10 bg-[var(--panel)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Patterns choisis</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">{selectedPatterns.length}</p>
            </article>

            <article className="rounded-[22px] border border-black/10 bg-[var(--panel)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Phases validees</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">{result.validatedPatternCount}/{result.patternReports.length}</p>
            </article>
          </div>

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

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[24px] border border-black/10 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Diagnostic</p>

              <div className="mt-4 grid gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Points solides</p>
                  <ul className="mt-2 grid gap-2 text-sm leading-7 text-stone-700">
                    {(result.strengths.length ? result.strengths : ['Aucun point fort valide pour le moment.']).map((entry) => (
                      <li key={entry} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-3 py-2">
                        {entry}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-stone-900">Ecarts a corriger</p>
                  <ul className="mt-2 grid gap-2 text-sm leading-7 text-stone-700">
                    {(result.gaps.length ? result.gaps : ['Aucun ecart detecte.']).map((entry) => (
                      <li key={entry} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-3 py-2">
                        {entry}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-black/10 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Briques de solution</p>
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

              <div className="mt-4 grid gap-3">
                {result.patternReports.filter((report) => report.selected).map((report) => (
                  <div
                    key={report.patternCode}
                    className={`rounded-[20px] border px-4 py-4 ${report.ok ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50/80'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{report.patternName}</p>
                        <p className="mt-1 text-sm leading-6 text-stone-700">{report.summary}</p>
                      </div>
                      <ResultPill tone={report.ok ? 'success' : 'danger'}>
                        {report.ok ? 'Valide' : 'A revoir'}
                      </ResultPill>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <Suspense fallback={<MissionSceneFallback />}>
            <MissionExecutionScene
              activePatternCode={activeResultPattern}
              mission={mission}
              patternsByCode={patternsByCode}
              result={result}
              onSelectPattern={onSelectResultPattern}
            />
          </Suspense>

          <article className="rounded-[24px] border border-black/10 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Journal de mission</p>
            <ul className="mt-3 grid gap-2">
              {[...(result.logs ?? []), ...(activeExecution?.logs ?? [])].map((line, index) => (
                <li key={`${line}-${index}`} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-3 py-2 text-sm leading-7 text-stone-700">
                  {line}
                </li>
              ))}
            </ul>
          </article>
        </>
      ) : (
        <div className="rounded-[24px] border border-dashed border-black/15 bg-[var(--panel)] px-4 py-8 text-sm leading-7 text-stone-600">
          Compose une solution, configure-la puis lance la mission pour afficher la scene SVG dediee au scenario.
        </div>
      )}
    </CollapsiblePanel>
  )
}
