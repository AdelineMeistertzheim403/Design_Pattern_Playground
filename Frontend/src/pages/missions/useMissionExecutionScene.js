import { useMemo } from 'react'
import {
  buildPlaybackFrames,
  useScenePlayback,
} from '../../patterns/shared/scenePlayback'
import { buildMissionStageSteps } from '../../missions/resultModel'
import {
  buildMissionSceneLayout,
  missionToneById,
} from './missionExecutionSceneModel'

export default function useMissionExecutionScene({
  mission,
  result,
  patternsByCode,
  activePatternCode,
}) {
  const tone = missionToneById[mission.id] ?? {
    accent: '#246b5e',
    soft: '#dff3ee',
    danger: '#c25737',
  }

  const stageSteps = useMemo(
    () => result.sceneData?.stageSteps ?? buildMissionStageSteps({ result, patternsByCode }),
    [patternsByCode, result],
  )

  const layout = useMemo(
    () => buildMissionSceneLayout(stageSteps),
    [stageSteps],
  )

  const playback = useScenePlayback(buildPlaybackFrames(stageSteps, 'Mission ready'), 850)
  const visibleStepCount = playback.currentFrame.visibleStepCount ?? stageSteps.length
  const activeStage = stageSteps.find((step) => step.patternCode === playback.currentFrame.step?.patternCode)
    ?? stageSteps.find((step) => step.patternCode === activePatternCode)
    ?? stageSteps[0]
    ?? null

  return {
    activeStage,
    layout,
    playback,
    stageSteps,
    tone,
    visibleStepCount,
  }
}
