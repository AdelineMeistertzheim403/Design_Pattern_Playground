import { Suspense, lazy, useEffect, useState } from 'react'
import SpaLink from '../../components/SpaLink'
import { buildHelpPath, buildMissionPath } from '../../app/playgroundUtils'
import { MissionBrief, ResultPill } from './missionPageShared'
import MissionSolutionComposerSection from './MissionSolutionComposerSection'
import useMissionDetail from './useMissionDetail'

const MissionConfigSection = lazy(() => import('./MissionConfigSection'))
const MissionResultSection = lazy(() => import('./MissionResultSection'))

function MissionDetailSectionFallback({ label }) {
  return (
    <div className="rounded-[24px] border border-black/10 bg-white px-4 py-8 text-sm leading-7 text-stone-600">
      Chargement de la section {label}...
    </div>
  )
}

function MissionContextColumn({ mission, missionLogs, onNavigateMission, showMissionLogs = true }) {
  return (
    <aside className="grid content-start gap-4">
      <article className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_12px_34px_rgba(47,37,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <ResultPill>{mission.mode}</ResultPill>
            <ResultPill>{mission.difficulty}</ResultPill>
          </div>
          <SpaLink
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            href={buildMissionPath()}
            onNavigate={() => onNavigateMission('')}
          >
            Retour au catalogue
          </SpaLink>
        </div>

        <div className="mt-4">
          <MissionBrief mission={mission} compact />
        </div>
      </article>

      <article className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_12px_34px_rgba(47,37,22,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Ce que la simulation doit prouver</p>
        <p className="mt-2 text-sm leading-7 text-stone-700">
          La mission ne valide pas seulement un nom de pattern : elle vérifie aussi que la configuration choisie produit le comportement attendu.
        </p>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Critères de réussite</p>
        <ul className="mt-2 grid gap-2 text-sm leading-7 text-stone-700">
          {mission.successCriteria.map((criterion) => (
            <li key={criterion} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-3 py-2">
              {criterion}
            </li>
          ))}
        </ul>
      </article>

      {showMissionLogs ? (
        <article className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_12px_34px_rgba(47,37,22,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Journal de mission</p>
          {missionLogs.length ? (
            <ul className="mt-3 grid gap-2">
              {missionLogs.map((line, index) => (
                <li key={`${line}-${index}`} className="rounded-2xl border border-black/10 bg-[var(--panel)] px-3 py-2 text-sm leading-7 text-stone-700">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-7 text-stone-600">Le journal apparaîtra après la première exécution de mission.</p>
          )}
        </article>
      ) : null}
    </aside>
  )
}

function MissionProgressSummary({ result, selectedPatterns }) {
  return (
    <article className="h-full rounded-[24px] border border-black/10 bg-white px-4 py-3 shadow-[0_14px_36px_rgba(47,37,22,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Progression</p>

      <div className="mt-2.5 grid gap-3 lg:grid-cols-2">
        <div>
          {result?.progression ? (
            <>
              <div className="flex flex-wrap gap-1.5 text-xs text-emerald-900">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold">+{result.progression.xpGained} XP</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold">Niveau {result.progression.level}</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold">{result.progression.rank}</span>
              </div>

              {result.progression.newlyUnlockedBadges?.length ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {result.progression.newlyUnlockedBadges.map((badge) => (
                    <ResultPill key={badge.code} tone="success">
                      Nouveau badge: {badge.name}
                    </ResultPill>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm leading-6 text-stone-600">
              Lance la mission pour afficher la progression joueur et les indicateurs de performance.
            </p>
          )}
        </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:content-start">
            <article className={`rounded-[16px] border p-2.5 ${result ? (result.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50') : 'border-black/10 bg-[var(--panel)]'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Statut</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">{result ? (result.success ? 'Mission réussie' : 'Mission à corriger') : 'En attente'}</p>
          </article>

            <article className="rounded-[16px] border border-black/10 bg-[var(--panel)] p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Score</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">{result ? `${result.score}/100` : '-'}</p>
          </article>

            <article className="rounded-[16px] border border-black/10 bg-[var(--panel)] p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Patterns choisis</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">{selectedPatterns.length}</p>
          </article>

            <article className="rounded-[16px] border border-black/10 bg-[var(--panel)] p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Phases validées</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {result ? `${result.validatedPatternCount}/${result.patternReports.length}` : '-'}
            </p>
          </article>
        </div>
      </div>
    </article>
  )
}

export default function MissionDetailPage({
  backendStatus,
  currentUser,
  mission,
  patterns,
  onNavigateHelp,
  onNavigateMission,
  onNavigatePattern,
}) {
  const [currentView, setCurrentView] = useState('setup')

  const {
    activeConfigPattern,
    activeExecution,
    activePatternConfig,
    activeResultPattern,
    activeSchema,
    addPatternToSolution,
    error,
    executionPending,
    handleConfigFieldChange,
    handleExecuteMission,
    patternsByCode,
    removePatternFromSolution,
    result,
    selectedPatterns,
    setActiveConfigPattern,
    setActiveResultPattern,
  } = useMissionDetail({
    backendStatus,
    currentUser,
    mission,
    patterns,
  })

  const missionLogs = [...(result?.logs ?? []), ...(activeExecution?.logs ?? [])]
  const hasExecutionResult = Boolean(result)

  useEffect(() => {
    setCurrentView('setup')
  }, [mission.id])

  async function handleLaunchMission() {
    const didExecute = await handleExecuteMission()
    if (didExecute) {
      setCurrentView('execution')
    }
  }

  const showProgressHeader = currentView === 'execution' || hasExecutionResult

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className={`grid items-stretch gap-4 ${showProgressHeader ? 'xl:grid-cols-2' : ''}`}>
        <article className="h-full rounded-[24px] border border-black/10 bg-white px-4 py-3 shadow-[0_14px_36px_rgba(47,37,22,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              {currentView === 'setup' ? 'Mission · Préparation' : 'Mission · Exécution'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <SpaLink
                aria-label="Ouvrir l’aide du mode mission"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-bold text-stone-800 transition hover:border-black/20"
                href={buildHelpPath('missions')}
                title="Aide du mode mission"
                onNavigate={onNavigateHelp}
              >
                ?
              </SpaLink>

              {currentView === 'execution' ? (
                <button
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                  type="button"
                  onClick={() => setCurrentView('setup')}
                >
                  Retour à la configuration
                </button>
              ) : null}

              {currentView === 'setup' && hasExecutionResult ? (
                <button
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                  type="button"
                  onClick={() => setCurrentView('execution')}
                >
                  Voir la dernière exécution
                </button>
              ) : null}
            </div>
          </div>

          <h1 className="mt-2 text-3xl text-stone-950">{mission.title}</h1>
          <p className="mt-2 text-sm leading-6 text-stone-700">{mission.description}</p>
        </article>

        {showProgressHeader ? <MissionProgressSummary result={result} selectedPatterns={selectedPatterns} /> : null}
      </header>

      {currentView === 'setup' ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <MissionContextColumn
            mission={mission}
            missionLogs={missionLogs}
            onNavigateMission={onNavigateMission}
            showMissionLogs={false}
          />

          <div className="grid content-start gap-4">
            <MissionSolutionComposerSection
              activeConfigPattern={activeConfigPattern}
              error={error}
              executionPending={executionPending}
              mission={mission}
              onAddPattern={addPatternToSolution}
              onExecuteMission={handleLaunchMission}
              onNavigatePattern={onNavigatePattern}
              onRemovePattern={removePatternFromSolution}
              onSelectPattern={setActiveConfigPattern}
              patternsByCode={patternsByCode}
              selectedPatterns={selectedPatterns}
            />

            <Suspense fallback={<MissionDetailSectionFallback label="configuration" />}>
              <MissionConfigSection
                activeConfigPattern={activeConfigPattern}
                activePatternConfig={activePatternConfig}
                activeSchema={activeSchema}
                mission={mission}
                onFieldValueChange={handleConfigFieldChange}
                onSelectPattern={setActiveConfigPattern}
                patternsByCode={patternsByCode}
                selectedPatterns={selectedPatterns}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
          <MissionContextColumn
            mission={mission}
            missionLogs={missionLogs}
            onNavigateMission={onNavigateMission}
          />

          <Suspense fallback={<MissionDetailSectionFallback label="simulation" />}>
            <MissionResultSection
              activeResultPattern={activeResultPattern}
              mission={mission}
              onSelectResultPattern={setActiveResultPattern}
              patternsByCode={patternsByCode}
              result={result}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
