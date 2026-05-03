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
  'dynamic-payment-system': {
    accent: '#0f766e',
    soft: '#d7f3ef',
    danger: '#b45309',
  },
  'notification-system': {
    accent: '#0284c7',
    soft: '#dff2ff',
    danger: '#c2410c',
  },
  'character-state-machine': {
    accent: '#334155',
    soft: '#e7edf5',
    danger: '#be123c',
  },
  'custom-object-builder': {
    accent: '#9a3412',
    soft: '#fde7d8',
    danger: '#b91c1c',
  },
  'power-up-system': {
    accent: '#7e22ce',
    soft: '#f1e7ff',
    danger: '#b91c1c',
  },
  'undo-system': {
    accent: '#1d4ed8',
    soft: '#e1eaff',
    danger: '#b45309',
  },
  'request-processing-pipeline': {
    accent: '#115e59',
    soft: '#dcf6f1',
    danger: '#b91c1c',
  },
  'complex-combat-system': {
    accent: '#7c3aed',
    soft: '#efe7ff',
    danger: '#c25737',
  },
  'massive-multiplayer-world': {
    accent: '#0f766e',
    soft: '#daf5ee',
    danger: '#b45309',
  },
  'smart-notification-platform': {
    accent: '#0f4c81',
    soft: '#e2edf8',
    danger: '#b45309',
  },
  'game-save-system': {
    accent: '#1d4ed8',
    soft: '#e4ecff',
    danger: '#be123c',
  },
  'modular-ui-system': {
    accent: '#7c3f00',
    soft: '#fcefdc',
    danger: '#b91c1c',
  },
  'secure-api-gateway': {
    accent: '#155e75',
    soft: '#dff3f8',
    danger: '#be123c',
  },
  'multi-device-control-system': {
    accent: '#4f46e5',
    soft: '#e8e7ff',
    danger: '#b45309',
  },
  'dynamic-rendering-engine': {
    accent: '#7c2d12',
    soft: '#f9e8df',
    danger: '#be123c',
  },
  'intelligent-file-scanner': {
    accent: '#166534',
    soft: '#def4e4',
    danger: '#b91c1c',
  },
  'smart-code-interpreter': {
    accent: '#4338ca',
    soft: '#e8e8ff',
    danger: '#b45309',
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
