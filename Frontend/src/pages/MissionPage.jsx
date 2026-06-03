import { Suspense, lazy, useMemo } from 'react'
import { getMissionById, getMissionCatalog } from '../missions/catalog'

const MissionCatalogPage = lazy(() => import('./missions/MissionCatalogPage'))
const MissionDetailPage = lazy(() => import('./missions/MissionDetailPage'))

function MissionSectionFallback() {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white/80 px-5 py-10 text-sm leading-7 text-stone-600 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
      Chargement de la mission...
    </div>
  )
}

export default function MissionPage({
  backendStatus,
  currentUser,
  initialMissionId,
  patterns,
  onNavigateHelp,
  onNavigateMission,
  onNavigatePattern,
}) {
  const missions = useMemo(() => getMissionCatalog(), [])
  const selectedMission = useMemo(
    () => (initialMissionId ? getMissionById(initialMissionId) : null),
    [initialMissionId],
  )

  if (!selectedMission) {
    return (
      <Suspense fallback={<MissionSectionFallback />}>
        <MissionCatalogPage
          missions={missions}
          onNavigateHelp={onNavigateHelp}
          onOpenMission={(missionId) => onNavigateMission(missionId)}
        />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<MissionSectionFallback />}>
      <MissionDetailPage
        backendStatus={backendStatus}
        currentUser={currentUser}
        mission={selectedMission}
        patterns={patterns}
        onNavigateHelp={onNavigateHelp}
        onNavigateMission={onNavigateMission}
        onNavigatePattern={onNavigatePattern}
      />
    </Suspense>
  )
}
