import { Suspense, lazy } from 'react'
import CollapsiblePanel from '../../components/CollapsiblePanel'
import MissionOverviewSection from './MissionOverviewSection'
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

export default function MissionDetailPage({
  backendStatus,
  currentUser,
  mission,
  patterns,
  onNavigateMission,
  onNavigatePattern,
}) {
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

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <CollapsiblePanel
        eyebrow="Mission"
        title={mission.title}
        description={mission.description}
        bodyClassName="grid gap-5"
      >
        <MissionOverviewSection mission={mission} onNavigateMission={onNavigateMission} />

        <form className="grid gap-4" onSubmit={handleExecuteMission}>
          <MissionSolutionComposerSection
            activeConfigPattern={activeConfigPattern}
            error={error}
            executionPending={executionPending}
            mission={mission}
            onAddPattern={addPatternToSolution}
            onExecuteMission={handleExecuteMission}
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
        </form>
      </CollapsiblePanel>

      <Suspense fallback={<MissionDetailSectionFallback label="resultat" />}>
        <MissionResultSection
          activeExecution={activeExecution}
          activeResultPattern={activeResultPattern}
          mission={mission}
          onSelectResultPattern={setActiveResultPattern}
          patternsByCode={patternsByCode}
          result={result}
          selectedPatterns={selectedPatterns}
        />
      </Suspense>
    </div>
  )
}
