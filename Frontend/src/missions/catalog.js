import { completeMissions } from './catalog/completeMissions'
import { debugMissions } from './catalog/debugMissions'

export const missionCatalog = [
  ...debugMissions,
  ...completeMissions,
]

export const missionCatalogById = Object.fromEntries(
  missionCatalog.map((mission) => [mission.id, mission]),
)

export function getMissionCatalog() {
  return missionCatalog
}

export function getMissionById(missionId) {
  return missionCatalogById[missionId] ?? null
}
