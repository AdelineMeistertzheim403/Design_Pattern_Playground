export const missionToneById = {
  'memory-overload': {
    accent: '#246b5e',
    soft: '#dff3ee',
    danger: '#c25737',
  },
  'global-logger': {
    accent: '#3f4f8f',
    soft: '#e5e9fb',
    danger: '#8f5f2a',
  },
  'complex-combat-system': {
    accent: '#7c3aed',
    soft: '#efe7ff',
    danger: '#c25737',
  },
}

export function buildMissionSceneLayout(stageSteps) {
  const stageWidth = 268
  const stageHeight = 160
  const stageGap = 34
  const stageStartX = 52
  const stageY = 220
  const stageLineY = stageY + 80
  const viewBoxWidth = Math.max(1180, stageStartX * 2 + stageSteps.length * stageWidth + Math.max(0, stageSteps.length - 1) * stageGap)

  return {
    stageWidth,
    stageHeight,
    stageGap,
    stageStartX,
    stageY,
    stageLineY,
    viewBoxWidth,
  }
}
