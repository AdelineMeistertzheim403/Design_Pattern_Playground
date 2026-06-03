import { useMemo } from 'react'
import {
  ScenePlaybackControls,
} from '../../patterns/shared/scenePlayback'
import ExecutionScene from '../../components/ExecutionScene'
import useMissionExecutionScene from './useMissionExecutionScene'

function buildExecutionDelta(currentExecution, previousExecution) {
  const currentNodes = currentExecution?.visualization?.nodes ?? []
  const previousNodes = previousExecution?.visualization?.nodes ?? []
  const currentEdges = currentExecution?.visualization?.edges ?? []
  const previousEdges = previousExecution?.visualization?.edges ?? []
  const previousNodeMap = new Map(previousNodes.map((node) => [node.id, node]))
  const currentEdgeMap = new Map(currentEdges.map((edge) => [`${edge.from}::${edge.to}::${edge.label ?? ''}`, edge]))
  const previousEdgeMap = new Map(previousEdges.map((edge) => [`${edge.from}::${edge.to}::${edge.label ?? ''}`, edge]))

  const changedNodeIds = currentNodes
    .filter((node) => {
      const previousNode = previousNodeMap.get(node.id)
      if (!previousNode) {
        return true
      }

      return JSON.stringify({
        type: node.type,
        label: node.label,
        data: node.data ?? null,
      }) !== JSON.stringify({
        type: previousNode.type,
        label: previousNode.label,
        data: previousNode.data ?? null,
      })
    })
    .map((node) => node.id)

  const addedEdgeKeys = currentEdges
    .filter((edge) => !previousEdgeMap.has(`${edge.from}::${edge.to}::${edge.label ?? ''}`))
    .map((edge) => `${edge.from}::${edge.to}::${edge.label ?? ''}`)

  const modifiedEdgeKeys = currentEdges
    .filter((edge) => {
      const edgeKey = `${edge.from}::${edge.to}::${edge.label ?? ''}`
      const previousEdge = previousEdgeMap.get(edgeKey)
      if (!previousEdge) {
        return false
      }

      return JSON.stringify({
        label: edge.label ?? null,
        data: edge.data ?? null,
      }) !== JSON.stringify({
        label: previousEdge.label ?? null,
        data: previousEdge.data ?? null,
      })
    })
    .map((edge) => `${edge.from}::${edge.to}::${edge.label ?? ''}`)

  const removedEdgeKeys = previousEdges
    .filter((edge) => !currentEdgeMap.has(`${edge.from}::${edge.to}::${edge.label ?? ''}`))
    .map((edge) => `${edge.from}::${edge.to}::${edge.label ?? ''}`)

  const changedEdgeKeys = [...addedEdgeKeys, ...modifiedEdgeKeys, ...removedEdgeKeys]
  const edgeKindsByKey = Object.fromEntries([
    ...addedEdgeKeys.map((edgeKey) => [edgeKey, 'added']),
    ...modifiedEdgeKeys.map((edgeKey) => [edgeKey, 'modified']),
    ...removedEdgeKeys.map((edgeKey) => [edgeKey, 'removed']),
  ])

  const currentOutput = currentExecution?.output ?? {}
  const previousOutput = previousExecution?.output ?? {}
  const outputKeys = new Set([...Object.keys(currentOutput), ...Object.keys(previousOutput)])
  const changedOutputKeys = [...outputKeys].filter((key) => (
    JSON.stringify(currentOutput[key]) !== JSON.stringify(previousOutput[key])
  ))

  return {
    changedNodeIds,
    addedEdgeKeys,
    modifiedEdgeKeys,
    removedEdgeKeys,
    changedEdgeKeys,
    edgeKindsByKey,
    changedOutputKeys,
    hasChanges: changedNodeIds.length > 0 || changedEdgeKeys.length > 0 || changedOutputKeys.length > 0,
  }
}

function MissionStageCard({ step, x, y, width, height, active, visible, tone }) {
  return (
    <g opacity={visible ? 1 : 0.25}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="26"
        fill={step.status === 'validated' ? tone.soft : '#fff1df'}
        stroke={active ? tone.accent : '#d6d3d1'}
        strokeWidth={active ? 3 : 1.5}
      />
      <text x={x + 22} y={y + 28} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#78716c">
        {step.stageLabel.toUpperCase()}
      </text>
      <text x={x + 22} y={y + 58} fontSize="20" fontWeight="700" fill="#1c1917">
        {step.title}
      </text>
      <foreignObject x={x + 18} y={y + 74} width={width - 36} height={height - 92}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '13px', lineHeight: 1.5, color: '#44403c' }}>
          {step.summary}
        </div>
      </foreignObject>
    </g>
  )
}

function MissionMetricChip({ x, y, metric, tone, width = 146 }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height="78" rx="20" fill={tone.soft} stroke="#d6d3d1" strokeWidth="1" />
      <text x={x + 14} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.14em" fill="#78716c">
        {metric.key.toUpperCase()}
      </text>
      <text x={x + 14} y={y + 56} fontSize="18" fontWeight="700" fill="#1c1917">
        {metric.value}
      </text>
    </g>
  )
}

function getMissionHeroLine(missionId) {
  const labelsByMissionId = {
    'complex-combat-system': 'Style + buffs : deux axes à coordonner pour un combat lisible.',
    'massive-multiplayer-world': 'Création massive + état partagé : garder la charge sous contrôle.',
    'smart-notification-platform': 'Diffusion multi-abonnés + canal adaptable sans couplage fort.',
    'game-save-system': 'Historique d’actions + snapshots : revenir en arrière sans casser le flux.',
    'modular-ui-system': 'Arborescence UI + enrichissements visuels runtime.',
    'secure-api-gateway': 'Pipeline de contrôles + accès protégé à la ressource sensible.',
    'multi-device-control-system': 'Commandes historisables + coordination multi-devices.',
    'dynamic-rendering-engine': 'Deux axes de variation à faire évoluer sans explosion de classes.',
    'intelligent-file-scanner': 'Parcours d’arbre + analyses spécialisées sur les mêmes nœuds.',
    'smart-code-interpreter': 'Structure de script + exécution pas à pas dans un contexte partagé.',
  }

  return labelsByMissionId[missionId] ?? 'Combiner plusieurs responsabilités tout en gardant une architecture nette.'
}

function getMissionScenePalette(missionId) {
  const paletteByMissionId = {
    'memory-overload': {
      bgFrom: '#f2fbf8',
      bgTo: '#dcefe8',
      laneFrom: '#e6f7f0',
      laneTo: '#f4fbf8',
      orbSecondary: '#cde7de',
    },
    'global-logger': {
      bgFrom: '#f4f7ff',
      bgTo: '#e5ecff',
      laneFrom: '#e7edff',
      laneTo: '#f5f7ff',
      orbSecondary: '#d8dff9',
    },
    'dynamic-payment-system': {
      bgFrom: '#eefaf8',
      bgTo: '#daefea',
      laneFrom: '#dff5f0',
      laneTo: '#f4fbf9',
      orbSecondary: '#d6ece4',
    },
    'notification-system': {
      bgFrom: '#f2f8ff',
      bgTo: '#ddeeff',
      laneFrom: '#e5f1ff',
      laneTo: '#f6faff',
      orbSecondary: '#dbe9f7',
    },
    'character-state-machine': {
      bgFrom: '#f3f6fb',
      bgTo: '#e3eaf4',
      laneFrom: '#e8eef8',
      laneTo: '#f7f9fc',
      orbSecondary: '#dbe3ef',
    },
    'custom-object-builder': {
      bgFrom: '#fff5ee',
      bgTo: '#f4e3d5',
      laneFrom: '#f8e9de',
      laneTo: '#fff8f2',
      orbSecondary: '#f1decf',
    },
    'power-up-system': {
      bgFrom: '#f9f3ff',
      bgTo: '#eee4ff',
      laneFrom: '#f1e8ff',
      laneTo: '#fbf7ff',
      orbSecondary: '#e7daf8',
    },
    'undo-system': {
      bgFrom: '#f1f6ff',
      bgTo: '#dfe9ff',
      laneFrom: '#e8efff',
      laneTo: '#f8faff',
      orbSecondary: '#dbe4f7',
    },
    'request-processing-pipeline': {
      bgFrom: '#eefbf8',
      bgTo: '#dbf0ea',
      laneFrom: '#e1f6f0',
      laneTo: '#f6fcfa',
      orbSecondary: '#d2eae1',
    },
    'complex-combat-system': {
      bgFrom: '#f8f3ff',
      bgTo: '#e9ddff',
      laneFrom: '#f0e6ff',
      laneTo: '#faf6ff',
      orbSecondary: '#e5d4f7',
    },
    'massive-multiplayer-world': {
      bgFrom: '#eefaf5',
      bgTo: '#d9eee4',
      laneFrom: '#e3f6ee',
      laneTo: '#f6fcf9',
      orbSecondary: '#d2e8dd',
    },
    'smart-notification-platform': {
      bgFrom: '#f2f7ff',
      bgTo: '#dfeaf8',
      laneFrom: '#e7effc',
      laneTo: '#f7faff',
      orbSecondary: '#d5e2f4',
    },
    'game-save-system': {
      bgFrom: '#f2f6ff',
      bgTo: '#dfe8ff',
      laneFrom: '#e8eeff',
      laneTo: '#f8faff',
      orbSecondary: '#d8e1f8',
    },
    'modular-ui-system': {
      bgFrom: '#fff7ef',
      bgTo: '#f2e5d4',
      laneFrom: '#f8eadb',
      laneTo: '#fff9f2',
      orbSecondary: '#efddc8',
    },
    'secure-api-gateway': {
      bgFrom: '#eef8fb',
      bgTo: '#dcecf3',
      laneFrom: '#e4f2f8',
      laneTo: '#f7fbfd',
      orbSecondary: '#d2e3ea',
    },
    'multi-device-control-system': {
      bgFrom: '#f2f2ff',
      bgTo: '#e3e2fb',
      laneFrom: '#e9e8ff',
      laneTo: '#f9f8ff',
      orbSecondary: '#dad8f0',
    },
    'dynamic-rendering-engine': {
      bgFrom: '#fff3eb',
      bgTo: '#f2dfd3',
      laneFrom: '#f8e8df',
      laneTo: '#fff8f3',
      orbSecondary: '#edd8cc',
    },
    'intelligent-file-scanner': {
      bgFrom: '#effaf1',
      bgTo: '#dbeedc',
      laneFrom: '#e5f6e8',
      laneTo: '#f7fcf8',
      orbSecondary: '#d2e8d4',
    },
    'smart-code-interpreter': {
      bgFrom: '#f3f2ff',
      bgTo: '#e3e2fb',
      laneFrom: '#ecebff',
      laneTo: '#faf9ff',
      orbSecondary: '#d9d8f2',
    },
  }

  return paletteByMissionId[missionId] ?? {
    bgFrom: '#fffcf7',
    bgTo: '#efe4d5',
    laneFrom: '#f6f2e8',
    laneTo: '#f8f5ee',
    orbSecondary: '#f4d7ca',
  }
}

function getMissionMotionProfile(missionId) {
  const profileByMissionId = {
    'memory-overload': { flowDuration: 8.6, pulseDuration: 3.2, floatDuration: 7.6, easing: 'linear' },
    'global-logger': { flowDuration: 9.8, pulseDuration: 3.8, floatDuration: 8.8, easing: 'ease-in-out' },
    'dynamic-payment-system': { flowDuration: 7.9, pulseDuration: 3.1, floatDuration: 7.1, easing: 'cubic-bezier(0.28, 0.82, 0.32, 1)' },
    'notification-system': { flowDuration: 6.8, pulseDuration: 2.9, floatDuration: 6.5, easing: 'ease-out' },
    'character-state-machine': { flowDuration: 9.4, pulseDuration: 3.5, floatDuration: 8.4, easing: 'ease-in-out' },
    'custom-object-builder': { flowDuration: 8.8, pulseDuration: 3.4, floatDuration: 8.2, easing: 'cubic-bezier(0.2, 0.82, 0.3, 1)' },
    'power-up-system': { flowDuration: 7.2, pulseDuration: 2.7, floatDuration: 6.9, easing: 'ease-out' },
    'undo-system': { flowDuration: 9.6, pulseDuration: 3.7, floatDuration: 8.7, easing: 'ease-in-out' },
    'request-processing-pipeline': { flowDuration: 7.1, pulseDuration: 3.0, floatDuration: 6.8, easing: 'linear' },
    'complex-combat-system': { flowDuration: 6.6, pulseDuration: 2.6, floatDuration: 6.2, easing: 'cubic-bezier(0.23, 0.93, 0.33, 1)' },
    'massive-multiplayer-world': { flowDuration: 8.1, pulseDuration: 3.1, floatDuration: 7.4, easing: 'linear' },
    'smart-notification-platform': { flowDuration: 6.4, pulseDuration: 2.5, floatDuration: 6.0, easing: 'ease-out' },
    'game-save-system': { flowDuration: 10.4, pulseDuration: 4.0, floatDuration: 9.4, easing: 'ease-in-out' },
    'modular-ui-system': { flowDuration: 8.7, pulseDuration: 3.4, floatDuration: 8.0, easing: 'cubic-bezier(0.24, 0.84, 0.38, 1)' },
    'secure-api-gateway': { flowDuration: 7.6, pulseDuration: 3.3, floatDuration: 7.0, easing: 'linear' },
    'multi-device-control-system': { flowDuration: 6.9, pulseDuration: 2.8, floatDuration: 6.6, easing: 'ease-in-out' },
    'dynamic-rendering-engine': { flowDuration: 8.0, pulseDuration: 3.0, floatDuration: 7.5, easing: 'cubic-bezier(0.25, 0.86, 0.34, 1)' },
    'intelligent-file-scanner': { flowDuration: 7.4, pulseDuration: 3.2, floatDuration: 7.0, easing: 'ease-in-out' },
    'smart-code-interpreter': { flowDuration: 6.7, pulseDuration: 2.8, floatDuration: 6.4, easing: 'cubic-bezier(0.22, 0.86, 0.36, 1)' },
  }

  return profileByMissionId[missionId] ?? {
    flowDuration: 8.2,
    pulseDuration: 3.2,
    floatDuration: 7.5,
    easing: 'ease-in-out',
  }
}

function buildMissionMotionStyle(profile) {
  return {
    '--mission-flow-duration': `${profile.flowDuration}s`,
    '--mission-pulse-duration': `${profile.pulseDuration}s`,
    '--mission-float-duration': `${profile.floatDuration}s`,
    '--mission-easing': profile.easing,
  }
}

function getDualMissionVisualSpec(missionId) {
  const specsByMissionId = {
    'complex-combat-system': {
      leftRole: 'STYLE TACTIQUE',
      rightRole: 'STACK DE BUFFS',
      connectorLabel: 'SYNERGIE ATTAQUE + BONUS',
      pulseLabel: 'Combat runtime',
    },
    'massive-multiplayer-world': {
      leftRole: 'CREATION ENTITES',
      rightRole: 'ETAT PARTAGE',
      connectorLabel: 'MONDE MASSIF STABILISE',
      pulseLabel: 'Charge serveur',
    },
    'smart-notification-platform': {
      leftRole: 'SELECTION CANAL',
      rightRole: 'DIFFUSION ABONNES',
      connectorLabel: 'DELIVERY ADAPTATIF',
      pulseLabel: 'Propagation alerts',
    },
    'game-save-system': {
      leftRole: 'HISTORIQUE ACTIONS',
      rightRole: 'SNAPSHOT ETAT',
      connectorLabel: 'REWIND FIABLE',
      pulseLabel: 'Checkpoint actif',
    },
    'modular-ui-system': {
      leftRole: 'ARBRE UI',
      rightRole: 'LAYERS VISUELS',
      connectorLabel: 'INTERFACE COMPOSABLE',
      pulseLabel: 'UI modulaire',
    },
    'secure-api-gateway': {
      leftRole: 'PIPELINE CONTROLES',
      rightRole: 'GARDE-RESSOURCE',
      connectorLabel: 'ACCES SECURISE',
      pulseLabel: 'Gateway shield',
    },
    'multi-device-control-system': {
      leftRole: 'COMMANDES',
      rightRole: 'COORDINATION HUB',
      connectorLabel: 'SYNCHRO MULTI-DEVICE',
      pulseLabel: 'Device orchestra',
    },
    'dynamic-rendering-engine': {
      leftRole: 'CHOIX RENDU',
      rightRole: 'ABSTRACTION BRIDGEE',
      connectorLabel: 'DOUBLE AXE DECOUPLE',
      pulseLabel: 'Render matrix',
    },
    'intelligent-file-scanner': {
      leftRole: 'ARBRE FICHIERS',
      rightRole: 'ANALYSES VISITOR',
      connectorLabel: 'SCAN MULTI-PASSES',
      pulseLabel: 'Traversal scope',
    },
    'smart-code-interpreter': {
      leftRole: 'STRUCTURE SCRIPT',
      rightRole: 'EXECUTION SEMANTIQUE',
      connectorLabel: 'LANGAGE INTERPRETE',
      pulseLabel: 'Script runtime',
    },
  }

  return specsByMissionId[missionId] ?? {
    leftRole: 'PATTERN A',
    rightRole: 'PATTERN B',
    connectorLabel: 'COMBINAISON ORCHESTREE',
    pulseLabel: 'Mission pulse',
  }
}

function MissionThemeOrnaments({ missionId, width, tone, visibleStepCount }) {
  const sharedOpacity = visibleStepCount >= 2 ? 1 : 0.45

  if (missionId === 'complex-combat-system') {
    return (
      <g opacity={sharedOpacity}>
        <circle cx={width / 2 - 70} cy="244" r="18" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <path d={`M ${width / 2 - 80} 244 L ${width / 2 - 60} 244`} stroke={tone.accent} strokeWidth="3" strokeLinecap="round" />
        <path d={`M ${width / 2 - 70} 234 L ${width / 2 - 70} 254`} stroke={tone.accent} strokeWidth="3" strokeLinecap="round" />
        <rect x={width / 2 + 34} y="228" width="32" height="32" rx="10" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <text x={width / 2 + 50} y="249" textAnchor="middle" fontSize="14" fontWeight="700" fill={tone.accent}>+</text>
      </g>
    )
  }

  if (missionId === 'massive-multiplayer-world') {
    return (
      <g opacity={sharedOpacity}>
        <circle cx={width / 2 - 90} cy="244" r="10" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <circle cx={width / 2 - 66} cy="244" r="10" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <circle cx={width / 2 - 42} cy="244" r="10" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <rect x={width / 2 + 24} y="228" width="52" height="32" rx="12" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <text x={width / 2 + 50} y="248" textAnchor="middle" fontSize="11" fontWeight="700" fill={tone.accent}>POOL</text>
      </g>
    )
  }

  if (missionId === 'smart-notification-platform') {
    return (
      <g opacity={sharedOpacity}>
        <rect x={width / 2 - 86} y="228" width="34" height="28" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <rect x={width / 2 - 42} y="228" width="34" height="28" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <rect x={width / 2 + 2} y="228" width="34" height="28" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <path d={`M ${width / 2 - 26} 272 L ${width / 2 - 26} 260`} stroke={tone.accent} strokeWidth="2.5" />
        <path d={`M ${width / 2 + 18} 272 L ${width / 2 + 18} 260`} stroke={tone.accent} strokeWidth="2.5" />
      </g>
    )
  }

  if (missionId === 'game-save-system') {
    return (
      <g opacity={sharedOpacity}>
        <circle cx={width / 2 - 64} cy="244" r="16" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <path d={`M ${width / 2 - 64} 236 L ${width / 2 - 64} 244 L ${width / 2 - 54} 248`} stroke={tone.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={width / 2 + 20} y="228" width="38" height="32" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <path d={`M ${width / 2 + 32} 236 L ${width / 2 + 46} 236`} stroke={tone.accent} strokeWidth="2.5" />
      </g>
    )
  }

  if (missionId === 'modular-ui-system') {
    return (
      <g opacity={sharedOpacity}>
        <rect x={width / 2 - 90} y="226" width="56" height="36" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <rect x={width / 2 - 28} y="226" width="56" height="36" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <rect x={width / 2 + 34} y="226" width="56" height="36" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" opacity="0.86" />
      </g>
    )
  }

  if (missionId === 'secure-api-gateway') {
    return (
      <g opacity={sharedOpacity}>
        <path d={`M ${width / 2 - 72} 262 L ${width / 2 - 72} 234 L ${width / 2 - 54} 224 L ${width / 2 - 36} 234 L ${width / 2 - 36} 262 Z`} fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <rect x={width / 2 + 16} y="230" width="40" height="32" rx="10" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <circle cx={width / 2 + 36} cy="244" r="4" fill={tone.accent} />
      </g>
    )
  }

  if (missionId === 'multi-device-control-system') {
    return (
      <g opacity={sharedOpacity}>
        <circle cx={width / 2 - 58} cy="244" r="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <circle cx={width / 2 - 28} cy="228" r="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <circle cx={width / 2 - 28} cy="260" r="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <circle cx={width / 2 + 22} cy="244" r="10" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <line x1={width / 2 - 58} y1="244" x2={width / 2 + 12} y2="244" stroke={tone.accent} strokeWidth="2.5" />
        <line x1={width / 2 - 28} y1="228" x2={width / 2 + 12} y2="240" stroke={tone.accent} strokeWidth="2.5" />
        <line x1={width / 2 - 28} y1="260" x2={width / 2 + 12} y2="248" stroke={tone.accent} strokeWidth="2.5" />
      </g>
    )
  }

  if (missionId === 'dynamic-rendering-engine') {
    return (
      <g opacity={sharedOpacity}>
        <rect x={width / 2 - 88} y="228" width="42" height="30" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <path d={`M ${width / 2 - 34} 243 L ${width / 2 + 10} 243`} stroke={tone.accent} strokeWidth="2.5" />
        <circle cx={width / 2 + 32} cy="243" r="16" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
      </g>
    )
  }

  if (missionId === 'intelligent-file-scanner') {
    return (
      <g opacity={sharedOpacity}>
        <rect x={width / 2 - 90} y="228" width="34" height="26" rx="6" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <rect x={width / 2 - 46} y="228" width="34" height="26" rx="6" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <circle cx={width / 2 + 28} cy="242" r="14" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <line x1={width / 2 + 38} y1="252" x2={width / 2 + 50} y2="264" stroke={tone.accent} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    )
  }

  if (missionId === 'smart-code-interpreter') {
    return (
      <g opacity={sharedOpacity}>
        <rect x={width / 2 - 90} y="228" width="68" height="34" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <text x={width / 2 - 56} y="249" textAnchor="middle" fontSize="11" fontWeight="700" fill={tone.accent}>{'{ }'}</text>
        <rect x={width / 2 + 6} y="228" width="68" height="34" rx="8" fill="#ffffff" stroke={tone.accent} strokeWidth="2" />
        <text x={width / 2 + 40} y="249" textAnchor="middle" fontSize="11" fontWeight="700" fill={tone.accent}>RUN</text>
      </g>
    )
  }

  return null
}

function DualPatternMissionScene({
  mission,
  result,
  stageSteps,
  activeStage,
  playback,
  tone,
  viewBoxWidth,
  visibleStepCount,
}) {
  const firstStep = stageSteps[0] ?? null
  const secondStep = stageSteps[1] ?? null
  const extraStepCount = Math.max(0, stageSteps.length - 2)
  const sceneWidth = Math.max(1240, viewBoxWidth)
  const activeTitle = activeStage?.title ?? 'Aucune phase active'
  const activeSummary = activeStage?.summary ?? 'Lance la mission pour activer la progression scène par scène.'
  const primaryMetrics = activeStage?.metrics?.slice(0, 3) ?? []
  const visualSpec = getDualMissionVisualSpec(mission.id)
  const palette = getMissionScenePalette(mission.id)
  const motionProfile = getMissionMotionProfile(mission.id)
  const dualBgId = `missionDualSceneBg-${mission.id}`
  const dualLaneId = `missionDualLane-${mission.id}`

  return (
    <svg className="mission-scene-svg block h-auto min-w-full" style={buildMissionMotionStyle(motionProfile)} viewBox={`0 0 ${sceneWidth} 620`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={dualBgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.bgFrom} />
          <stop offset="100%" stopColor={palette.bgTo} />
        </linearGradient>
        <linearGradient id={dualLaneId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.laneFrom} />
          <stop offset="100%" stopColor={palette.laneTo} />
        </linearGradient>
        <marker id="missionArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={tone.accent} />
        </marker>
      </defs>

      <rect x="0" y="0" width={sceneWidth} height="620" fill={`url(#${dualBgId})`} />
      <circle className="mission-scene-orb mission-scene-orb-primary" cx={sceneWidth - 148} cy="92" r="88" fill={tone.soft} opacity="0.9" />
      <circle className="mission-scene-orb mission-scene-orb-secondary" cx="120" cy="548" r="92" fill={palette.orbSecondary} opacity="0.58" />

      <rect x="40" y="36" width="520" height="122" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x="62" y="70" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION DUAL FLOW</text>
      <text x="62" y="100" fontSize="28" fontWeight="700" fill="#1c1917">{mission.title}</text>
      <text x="62" y="128" fontSize="14" fill="#57534e">{getMissionHeroLine(mission.id)}</text>

      <rect className="mission-scene-pulse" x={sceneWidth - 374} y="36" width="334" height="122" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x={sceneWidth - 352} y="70" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">{visualSpec.pulseLabel.toUpperCase()}</text>
      <text x={sceneWidth - 352} y="100" fontSize="24" fontWeight="700" fill={result.success ? tone.accent : tone.danger}>
        {activeTitle}
      </text>
      <text x={sceneWidth - 352} y="128" fontSize="14" fill="#57534e">
        {playback.currentFrame.currentStepIndex >= 0
          ? `Phase ${playback.currentFrame.currentStepIndex + 1} / ${stageSteps.length}`
          : 'État initial'}
      </text>

      <rect x="40" y="190" width={Math.max(1160, viewBoxWidth - 80)} height="220" rx="32" fill={`url(#${dualLaneId})`} stroke="#d6d3d1" strokeWidth="1.5" />
      <MissionThemeOrnaments missionId={mission.id} tone={tone} visibleStepCount={visibleStepCount} width={sceneWidth} />

      <rect x="74" y="228" width="312" height="146" rx="28" fill="#ffffff" stroke={activeStage?.patternCode === firstStep?.patternCode ? tone.accent : '#d6d3d1'} strokeWidth={activeStage?.patternCode === firstStep?.patternCode ? 3 : 1.5} opacity={visibleStepCount >= 1 ? 1 : 0.3} />
      <text x="98" y="256" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#78716c">{visualSpec.leftRole}</text>
      <text x="98" y="286" fontSize="22" fontWeight="700" fill="#1c1917">{firstStep?.title ?? 'Premier pattern'}</text>
      <foreignObject x="94" y="300" width="276" height="64">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '13px', lineHeight: 1.4, color: '#44403c' }}>
          {firstStep?.summary ?? 'Sélectionne le premier pattern pour alimenter la mission.'}
        </div>
      </foreignObject>

      <rect x={sceneWidth - 386} y="228" width="312" height="146" rx="28" fill="#ffffff" stroke={activeStage?.patternCode === secondStep?.patternCode ? tone.accent : '#d6d3d1'} strokeWidth={activeStage?.patternCode === secondStep?.patternCode ? 3 : 1.5} opacity={visibleStepCount >= 2 ? 1 : 0.3} />
      <text x={sceneWidth - 362} y="256" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#78716c">{visualSpec.rightRole}</text>
      <text x={sceneWidth - 362} y="286" fontSize="22" fontWeight="700" fill="#1c1917">{secondStep?.title ?? 'Second pattern'}</text>
      <foreignObject x={sceneWidth - 366} y="300" width="276" height="64">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '13px', lineHeight: 1.4, color: '#44403c' }}>
          {secondStep?.summary ?? 'Sélectionne le second pattern pour compléter la solution.'}
        </div>
      </foreignObject>

      <line className="mission-scene-link" x1="398" y1="302" x2={sceneWidth - 398} y2="302" stroke={tone.accent} strokeWidth="6" strokeLinecap="round" markerEnd="url(#missionArrow)" opacity={visibleStepCount >= 2 ? 1 : 0.35} />
      <text x={sceneWidth / 2} y="286" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.16em" fill="#78716c">
        {visualSpec.connectorLabel}
      </text>

      {extraStepCount > 0 ? (
        <g>
          <rect x={sceneWidth / 2 - 114} y="340" width="228" height="44" rx="20" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
          <text x={sceneWidth / 2} y="368" textAnchor="middle" fontSize="12" fontWeight="700" fill="#57534e">
            +{extraStepCount} phase(s) complémentaire(s)
          </text>
        </g>
      ) : null}

      <rect x="40" y="438" width="560" height="148" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x="62" y="468" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION IMPACT</text>
      <text x="62" y="500" fontSize="22" fontWeight="700" fill="#1c1917">{activeTitle}</text>
      <foreignObject x="58" y="512" width="528" height="62">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '13px', lineHeight: 1.5, color: '#44403c' }}>
          {activeSummary}
        </div>
      </foreignObject>

      <rect x={sceneWidth - 560} y="438" width="520" height="148" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x={sceneWidth - 538} y="468" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">LIVE METRICS</text>
      {primaryMetrics.map((metric, index) => (
        <MissionMetricChip
          key={`${metric.key}-${index}`}
          metric={metric}
          tone={tone}
          width={150}
          x={sceneWidth - 538 + index * 160}
          y={492}
        />
      ))}
    </svg>
  )
}

function DefaultMissionScene({
  mission,
  result,
  stageSteps,
  activeStage,
  playback,
  tone,
  visibleStepCount,
  layout,
}) {
  const {
    stageHeight,
    stageStartX,
    stageWidth,
    stageY,
    stageLineY,
    stageGap,
    viewBoxWidth,
  } = layout
  const palette = getMissionScenePalette(mission.id)
  const motionProfile = getMissionMotionProfile(mission.id)
  const defaultBgId = `missionSceneBg-${mission.id}`

  return (
    <svg className="mission-scene-svg block h-auto min-w-full" style={buildMissionMotionStyle(motionProfile)} viewBox={`0 0 ${viewBoxWidth} 620`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={defaultBgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.bgFrom} />
          <stop offset="100%" stopColor={palette.bgTo} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={viewBoxWidth} height="620" fill={`url(#${defaultBgId})`} />
      <circle className="mission-scene-orb mission-scene-orb-primary" cx={viewBoxWidth - 140} cy="92" r="92" fill={tone.soft} opacity="0.9" />
      <circle className="mission-scene-orb mission-scene-orb-secondary" cx="124" cy="540" r="86" fill={palette.orbSecondary} opacity="0.75" />

      <rect x="40" y="38" width="320" height="118" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x="62" y="72" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION</text>
      <text x="62" y="104" fontSize="28" fontWeight="700" fill="#1c1917">{mission.title}</text>
      <text x="62" y="132" fontSize="14" fill="#57534e">Score {result.score}/100 · {result.success ? 'Solution validée' : 'Solution fragile'}</text>

      <rect className="mission-scene-pulse" x={viewBoxWidth - 360} y="38" width="320" height="118" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x={viewBoxWidth - 338} y="72" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION PULSE</text>
      <text x={viewBoxWidth - 338} y="104" fontSize="24" fontWeight="700" fill={result.success ? tone.accent : tone.danger}>
        {activeStage?.title ?? 'Awaiting run'}
      </text>
      <text x={viewBoxWidth - 338} y="132" fontSize="14" fill="#57534e">
        {playback.currentFrame.currentStepIndex >= 0
          ? `Phase ${playback.currentFrame.currentStepIndex + 1} / ${stageSteps.length}`
          : 'État initial'}
      </text>

      <line
        className="mission-scene-link"
        x1={stageStartX + 6}
        y1={stageLineY}
        x2={stageStartX + stageSteps.length * stageWidth + Math.max(0, stageSteps.length - 1) * stageGap - 6}
        y2={stageLineY}
        stroke="#d6d3d1"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {stageSteps.map((step, index) => {
        const x = stageStartX + index * (stageWidth + stageGap)
        const isVisible = index < visibleStepCount
        const isActive = activeStage?.patternCode === step.patternCode
        const markerX = x + stageWidth / 2

        return (
          <g key={step.id}>
            <circle cx={markerX} cy={stageLineY} r="18" fill={isVisible ? tone.accent : '#d6d3d1'} />
            <text x={markerX} y={stageLineY + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
              {index + 1}
            </text>
            <MissionStageCard
              active={isActive}
              height={stageHeight}
              step={step}
              tone={tone}
              visible={isVisible}
              width={stageWidth}
              x={x}
              y={stageY}
            />
          </g>
        )
      })}

      <rect x="40" y="432" width="460" height="148" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x="62" y="462" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION IMPACT</text>
      <text x="62" y="494" fontSize="22" fontWeight="700" fill="#1c1917">{activeStage?.title ?? 'Aucune phase active'}</text>
      <foreignObject x="58" y="508" width="428" height="58">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '13px', lineHeight: 1.5, color: '#44403c' }}>
          {activeStage?.summary ?? 'Lance la mission pour activer une phase de simulation.'}
        </div>
      </foreignObject>

      <rect x={viewBoxWidth - 500} y="432" width="460" height="148" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
      <text x={viewBoxWidth - 478} y="462" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">LIVE METRICS</text>
      {activeStage?.metrics?.slice(0, 3).map((metric, index) => (
        <MissionMetricChip
          key={`${metric.key}-${index}`}
          metric={metric}
          tone={tone}
          x={viewBoxWidth - 478 + index * 144}
          y={486}
        />
      ))}
    </svg>
  )
}

export default function MissionExecutionScene({
  mission,
  result,
  patternsByCode,
  activePatternCode,
  onSelectPattern,
}) {
  const {
    activeStage,
    layout,
    playback,
    stageSteps,
    tone,
    visibleStepCount,
  } = useMissionExecutionScene({
    activePatternCode,
    mission,
    patternsByCode,
    result,
  })
  const hasDualPatternFlow = (mission.expectedPatterns?.length ?? 0) >= 2
  const activeStepCode = playback.currentFrame.step?.patternCode ?? activeStage?.patternCode ?? null
  const activeExecution = activeStepCode ? (result.executionResults?.[activeStepCode] ?? null) : null
  const activeStepIndex = stageSteps.findIndex((step) => step.patternCode === activeStepCode)
  const previousStepCode = activeStepIndex > 0 ? stageSteps[activeStepIndex - 1]?.patternCode : null
  const previousExecution = previousStepCode ? (result.executionResults?.[previousStepCode] ?? null) : null
  const executionDelta = useMemo(
    () => buildExecutionDelta(activeExecution, previousExecution),
    [activeExecution, previousExecution],
  )
  const focusStepIndex = stageSteps.findIndex((step) => step.patternCode === result.focusPattern)
  const activePatternName = activeStepCode ? (patternsByCode[activeStepCode]?.name ?? activeStepCode) : null

  function selectMissionStep(patternCode, stepIndex) {
    onSelectPattern(patternCode)
    if (typeof playback.handleGoToFrame === 'function') {
      playback.handleGoToFrame(Math.max(0, stepIndex + 1))
    }
  }

  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Scène mission</p>
          <h3 className="mt-2 text-2xl text-stone-950">
            {hasDualPatternFlow ? 'Simulation SVG dual-pattern' : 'Simulation SVG dédiée au scénario'}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-700">
            {hasDualPatternFlow
              ? 'Cette scène met visuellement en relation les deux patterns attendus par la mission pour coller à l’énoncé.'
              : 'Cette scène est propre au mode mission. Elle orchestre les phases du scénario et ne reprend pas la scène SVG d’une page pattern.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-black/10 bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-stone-700"
            type="button"
            onClick={() => selectMissionStep(result.focusPattern, focusStepIndex >= 0 ? focusStepIndex : 0)}
          >
            Focus mission
          </button>
          {stageSteps.map((step, index) => (
            <button
              key={step.patternCode}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeStepCode === step.patternCode ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-[var(--panel)] text-stone-700'}`}
              type="button"
              onClick={() => selectMissionStep(step.patternCode, index)}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      <ScenePlaybackControls playback={playback} className="mt-5" />

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,#fffdf8_0%,#f6f0e6_100%)]">
        {hasDualPatternFlow ? (
          <DualPatternMissionScene
            mission={mission}
            result={result}
            stageSteps={stageSteps}
            activeStage={activeStage}
            playback={playback}
            tone={tone}
            viewBoxWidth={layout.viewBoxWidth}
            visibleStepCount={visibleStepCount}
          />
        ) : (
          <DefaultMissionScene
            mission={mission}
            result={result}
            stageSteps={stageSteps}
            activeStage={activeStage}
            playback={playback}
            tone={tone}
            visibleStepCount={visibleStepCount}
            layout={layout}
          />
        )}
      </div>

      <article className="mt-5 rounded-[24px] border border-black/10 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Replay d’étape mission</p>
            <h4 className="mt-2 text-xl font-semibold text-stone-900">
              {activeStepIndex >= 0
                ? `Étape ${activeStepIndex + 1} · ${activePatternName ?? 'Pattern actif'}`
                : 'État initial de la mission'}
            </h4>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-700">
              Cette vue réutilise la même logique de scène que la page pattern, avec les données d’exécution de la mission.
            </p>
          </div>
          {activeStage?.summary ? (
            <div className="max-w-xl rounded-2xl border border-black/10 bg-[var(--panel)] px-4 py-3 text-sm leading-6 text-stone-700">
              {activeStage.summary}
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          {activeExecution && activeStepCode ? (
            <div className="grid gap-4">
              <ExecutionScene
                execution={activeExecution}
                patternCode={activeStepCode}
                sourceLabel={`Mission ${mission.title} · ${activePatternName ?? activeStepCode}`}
              />

              {activeStepIndex > 0 ? (
                <article className="rounded-[22px] border border-black/10 bg-[var(--panel)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Delta étape</p>
                      <p className="mt-1 text-sm text-stone-700">
                        Étape {activeStepIndex + 1} comparée à l’étape {activeStepIndex}.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700">
                        Nœuds modifiés : {executionDelta.changedNodeIds.length}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700">
                        Edges ajoutées : {executionDelta.addedEdgeKeys.length}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700">
                        Edges modifiées : {executionDelta.modifiedEdgeKeys.length}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700">
                        Edges supprimées : {executionDelta.removedEdgeKeys.length}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700">
                        Sorties modifiées : {executionDelta.changedOutputKeys.length}
                      </span>
                    </div>
                  </div>

                  {executionDelta.hasChanges ? (
                    <>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {executionDelta.changedNodeIds.slice(0, 8).map((nodeId) => (
                          <span key={nodeId} className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                            Nœud : {nodeId}
                          </span>
                        ))}
                        {executionDelta.addedEdgeKeys.slice(0, 8).map((edgeKey) => (
                          <span key={edgeKey} className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">
                            Edge ajoutée : {edgeKey.replaceAll('::', ' -> ')}
                          </span>
                        ))}
                        {executionDelta.modifiedEdgeKeys.slice(0, 8).map((edgeKey) => (
                          <span key={edgeKey} className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                            Edge modifiée : {edgeKey.replaceAll('::', ' -> ')}
                          </span>
                        ))}
                        {executionDelta.removedEdgeKeys.slice(0, 8).map((edgeKey) => (
                          <span key={edgeKey} className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
                            Edge supprimée : {edgeKey.replaceAll('::', ' -> ')}
                          </span>
                        ))}
                        {executionDelta.changedOutputKeys.slice(0, 8).map((key) => (
                          <span key={key} className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            Output: {key}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4">
                        <ExecutionScene
                          execution={activeExecution}
                          patternCode={activeStepCode}
                          sourceLabel={`Delta mission · ${activePatternName ?? activeStepCode}`}
                          forceGeneric
                          highlightNodeIds={executionDelta.changedNodeIds}
                          highlightEdgeKeys={executionDelta.changedEdgeKeys}
                          highlightEdgeKinds={executionDelta.edgeKindsByKey}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-stone-600">Aucune différence détectée entre les deux étapes.</p>
                  )}
                </article>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[20px] border border-dashed border-black/15 bg-[var(--panel)] px-4 py-8 text-sm leading-7 text-stone-600">
              Lance l’animation ou avance d’une étape pour afficher la scène spécialisée du pattern courant.
            </div>
          )}
        </div>
      </article>
    </section>
  )
}
