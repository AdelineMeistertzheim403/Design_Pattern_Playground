import { createElement, useEffect, useMemo, useState } from 'react'

import ZoomableViewport from '../../components/ZoomableViewport'
import {
  BUILDER_FINISH_PALETTES,
  BUILDER_STAGE_SWATCHES,
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
} from '../shared/sceneShared'

function extractBuilderModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.stages)) {
    return null
  }

  const stages = output.stages.map((stage, index) => ({
    index: safeNumber(stage.index, index + 1),
    stageCode: `${stage.stageCode ?? 'SILHOUETTE'}`.trim().toUpperCase(),
    stageLabel: `${stage.stageLabel ?? 'Etape'}`.trim(),
    optionCode: `${stage.optionCode ?? 'OPTION'}`.trim().toUpperCase(),
    optionLabel: `${stage.optionLabel ?? 'Option'}`.trim(),
    detail: `${stage.detail ?? ''}`.trim(),
    deltaAgility: safeNumber(stage.deltaAgility, 0),
    deltaResilience: safeNumber(stage.deltaResilience, 0),
    deltaUtility: safeNumber(stage.deltaUtility, 0),
    deltaStyle: safeNumber(stage.deltaStyle, 0),
    agility: safeNumber(stage.agility, 0),
    resilience: safeNumber(stage.resilience, 0),
    utility: safeNumber(stage.utility, 0),
    style: safeNumber(stage.style, 0),
    totalScore: safeNumber(stage.totalScore, 0),
  }))

  return {
    mode: `${output.mode ?? 'WITH_BUILDER'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Builder'}`.trim(),
    useBuilder: `${output.mode ?? 'WITH_BUILDER'}`.trim().toUpperCase() !== 'WITHOUT_BUILDER',
    buildName: `${output.buildName ?? 'Aurora Mk II'}`.trim(),
    productType: `${output.productType ?? 'CAR'}`.trim().toUpperCase(),
    productLabel: `${output.productLabel ?? 'Objet'}`.trim(),
    productDescription: `${output.productDescription ?? ''}`.trim(),
    silhouetteCode: `${output.silhouetteCode ?? 'BALANCED'}`.trim().toUpperCase(),
    silhouetteLabel: `${output.silhouetteLabel ?? 'Balanced'}`.trim(),
    coreModuleCode: `${output.coreModuleCode ?? 'ELECTRIC'}`.trim().toUpperCase(),
    coreModuleLabel: `${output.coreModuleLabel ?? 'Electric'}`.trim(),
    addonModuleCode: `${output.addonModuleCode ?? 'SUPPORT'}`.trim().toUpperCase(),
    addonModuleLabel: `${output.addonModuleLabel ?? 'Support'}`.trim(),
    finishStyleCode: `${output.finishStyleCode ?? 'CLASSIC'}`.trim().toUpperCase(),
    finishStyleLabel: `${output.finishStyleLabel ?? 'Classic'}`.trim(),
    agility: safeNumber(output.agility, stages.at(-1)?.agility ?? 0),
    resilience: safeNumber(output.resilience, stages.at(-1)?.resilience ?? 0),
    utility: safeNumber(output.utility, stages.at(-1)?.utility ?? 0),
    style: safeNumber(output.style, stages.at(-1)?.style ?? 0),
    totalScore: safeNumber(output.totalScore, stages.at(-1)?.totalScore ?? 0),
    challengeGoal: `${output.challengeGoal ?? 'utility >= 9 et style >= 7'}`.trim(),
    challengeMet: Boolean(output.challengeMet),
    readyLabel: `${output.readyLabel ?? 'Blueprint valide'}`.trim(),
    stageCount: safeNumber(output.stageCount, stages.length),
    monolithicPainPoints: Array.isArray(output.monolithicPainPoints) ? output.monolithicPainPoints : [],
    stages,
  }
}

function buildBuilderPlaybackFrames(model) {
  if (!model) {
    return []
  }

  if (!model.useBuilder) {
    return [
      {
        id: 'builder-initial',
        stepIndex: 0,
        visibleStageCount: 0,
        title: 'Attente',
        detail: 'Le client prepare encore tous les parametres du constructeur geant.',
        agility: 0,
        resilience: 0,
        utility: 0,
        style: 0,
        totalScore: 0,
      },
      {
        id: 'builder-final',
        stepIndex: model.stages.length,
        visibleStageCount: model.stages.length,
        title: 'Constructeur geant',
        detail: 'Tous les parametres arrivent d un bloc et le produit apparait d un coup.',
        agility: model.agility,
        resilience: model.resilience,
        utility: model.utility,
        style: model.style,
        totalScore: model.totalScore,
      },
    ]
  }

  return [
    {
      id: 'builder-initial',
      stepIndex: 0,
      visibleStageCount: 0,
      title: 'Preparation',
      detail: 'Le Director attend le premier ordre de construction.',
      agility: 0,
      resilience: 0,
      utility: 0,
      style: 0,
      totalScore: 0,
    },
    ...model.stages.map((stage) => ({
      id: `builder-stage-${stage.index}`,
      stepIndex: stage.index,
      visibleStageCount: stage.index,
      title: `${stage.stageLabel} · ${stage.optionLabel}`,
      detail: stage.detail,
      agility: stage.agility,
      resilience: stage.resilience,
      utility: stage.utility,
      style: stage.style,
      totalScore: stage.totalScore,
    })),
  ]
}

function renderBuilderCar(model, visibleStageCount, board) {
  const palette = BUILDER_FINISH_PALETTES[model.finishStyleCode] ?? BUILDER_FINISH_PALETTES.CLASSIC
  const centerX = board.x + board.width / 2
  const baseY = board.y + board.height * 0.64
  const geometry = {
    COMPACT: { bodyWidth: 220, bodyHeight: 72, roofWidth: 112, roofHeight: 42, wheelOffset: 74 },
    BALANCED: { bodyWidth: 248, bodyHeight: 78, roofWidth: 126, roofHeight: 48, wheelOffset: 86 },
    GRAND: { bodyWidth: 292, bodyHeight: 90, roofWidth: 146, roofHeight: 56, wheelOffset: 102 },
  }[model.silhouetteCode] ?? { bodyWidth: 248, bodyHeight: 78, roofWidth: 126, roofHeight: 48, wheelOffset: 86 }

  const bodyX = centerX - geometry.bodyWidth / 2
  const bodyY = baseY - geometry.bodyHeight

  return (
    <>
      {visibleStageCount >= 1 ? (
        <g>
          <ellipse cx={centerX} cy={baseY + 38} rx={geometry.bodyWidth * 0.45} ry="16" fill="rgba(36,31,24,0.08)" />
          <path
            d={`M ${bodyX + 20} ${bodyY + 6} Q ${centerX - geometry.roofWidth / 2} ${bodyY - geometry.roofHeight} ${centerX} ${bodyY - geometry.roofHeight}
               Q ${centerX + geometry.roofWidth / 2} ${bodyY - geometry.roofHeight} ${bodyX + geometry.bodyWidth - 24} ${bodyY + 18}
               L ${bodyX + geometry.bodyWidth - 8} ${bodyY + geometry.bodyHeight - 12}
               Q ${centerX} ${bodyY + geometry.bodyHeight + 8} ${bodyX + 8} ${bodyY + geometry.bodyHeight - 10} Z`}
            fill={palette.base}
            stroke={palette.accent}
            strokeWidth="4"
          />
          <rect x={centerX - 44} y={bodyY - geometry.roofHeight + 12} width="88" height="32" rx="14" fill="rgba(255,250,242,0.78)" stroke={palette.accent} />
          <circle cx={centerX - geometry.wheelOffset} cy={baseY + 10} r="32" fill="#241f18" />
          <circle cx={centerX + geometry.wheelOffset} cy={baseY + 10} r="32" fill="#241f18" />
          <circle cx={centerX - geometry.wheelOffset} cy={baseY + 10} r="15" fill="#fff7ec" />
          <circle cx={centerX + geometry.wheelOffset} cy={baseY + 10} r="15" fill="#fff7ec" />
        </g>
      ) : null}

      {visibleStageCount >= 2 ? (
        <g>
          {model.coreModuleCode === 'ELECTRIC' ? (
            <>
              <rect x={centerX - 34} y={bodyY + 18} width="68" height="30" rx="12" fill="#fff7ec" stroke="#246b5e" strokeWidth="3" />
              <path d={`M ${centerX - 4} ${bodyY + 18} L ${centerX + 14} ${bodyY + 18} L ${centerX + 2} ${bodyY + 42} L ${centerX + 18} ${bodyY + 42} L ${centerX - 8} ${bodyY + 70} L ${centerX} ${bodyY + 46} L ${centerX - 16} ${bodyY + 46} Z`} fill="#246b5e" />
            </>
          ) : model.coreModuleCode === 'ARCANE' ? (
            <g transform={`translate(${centerX} ${bodyY + 34})`}>
              <path d="M 0 -22 L 20 0 L 0 24 L -20 0 Z" fill="#b88bd0" stroke="#6c4580" strokeWidth="3" />
              <circle cx="0" cy="0" r="6" fill="#fff7ec" />
            </g>
          ) : (
            <>
              <rect x={centerX - 54} y={bodyY - geometry.roofHeight + 2} width="108" height="24" rx="10" fill="#20334d" stroke="#426c8d" strokeWidth="3" />
              <line x1={centerX - 18} y1={bodyY - geometry.roofHeight + 2} x2={centerX - 18} y2={bodyY - geometry.roofHeight + 26} stroke="#6ea8cf" />
              <line x1={centerX + 18} y1={bodyY - geometry.roofHeight + 2} x2={centerX + 18} y2={bodyY - geometry.roofHeight + 26} stroke="#6ea8cf" />
            </>
          )}
        </g>
      ) : null}

      {visibleStageCount >= 3 ? (
        <g>
          {model.addonModuleCode === 'DEFENSE' ? (
            <path d={`M ${bodyX - 10} ${bodyY + 40} Q ${centerX} ${bodyY - 40} ${bodyX + geometry.bodyWidth + 10} ${bodyY + 40}`} fill="none" stroke="#426c8d" strokeWidth="8" strokeLinecap="round" />
          ) : model.addonModuleCode === 'MOBILITY' ? (
            <>
              <path d={`M ${bodyX + geometry.bodyWidth - 6} ${bodyY + 22} L ${bodyX + geometry.bodyWidth + 34} ${bodyY + 6} L ${bodyX + geometry.bodyWidth + 20} ${bodyY + 34} Z`} fill="#c25737" />
              <path d={`M ${bodyX - 34} ${bodyY + 40} Q ${bodyX - 70} ${bodyY + 50} ${bodyX - 24} ${bodyY + 70}`} fill="none" stroke="#c25737" strokeWidth="5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <rect x={centerX - 72} y={bodyY - geometry.roofHeight - 18} width="144" height="16" rx="8" fill="#f6ece0" stroke="#7f5c3f" strokeWidth="3" />
              <rect x={centerX - 56} y={bodyY - geometry.roofHeight - 42} width="32" height="24" rx="8" fill="#246b5e" />
              <rect x={centerX + 24} y={bodyY - geometry.roofHeight - 42} width="32" height="24" rx="8" fill="#426c8d" />
            </>
          )}
        </g>
      ) : null}

      {visibleStageCount >= 4 ? (
        <g>
          {model.finishStyleCode === 'CLASSIC' ? (
            <path d={`M ${bodyX + 36} ${bodyY + 28} H ${bodyX + geometry.bodyWidth - 36}`} stroke="#fff7ec" strokeWidth="6" strokeLinecap="round" />
          ) : model.finishStyleCode === 'NEON' ? (
            <>
              <rect x={bodyX - 8} y={bodyY - geometry.roofHeight - 8} width={geometry.bodyWidth + 16} height={geometry.bodyHeight + geometry.roofHeight + 24} rx="34" fill="none" stroke="#45b6c9" strokeWidth="6" opacity="0.7" />
              <circle cx={centerX + geometry.wheelOffset + 40} cy={bodyY - geometry.roofHeight + 10} r="10" fill="#45b6c9" />
            </>
          ) : (
            <>
              <path d={`M ${centerX + 54} ${bodyY + 8} C ${centerX + 82} ${bodyY - 8} ${centerX + 94} ${bodyY + 34} ${centerX + 50} ${bodyY + 40}`} fill="#7aa66d" stroke="#246b5e" strokeWidth="3" />
              <path d={`M ${centerX + 54} ${bodyY + 8} C ${centerX + 44} ${bodyY + 18} ${centerX + 42} ${bodyY + 28} ${centerX + 50} ${bodyY + 40}`} fill="none" stroke="#fff7ec" strokeWidth="2" />
            </>
          )}
        </g>
      ) : null}
    </>
  )
}

function renderBuilderCharacter(model, visibleStageCount, board) {
  const palette = BUILDER_FINISH_PALETTES[model.finishStyleCode] ?? BUILDER_FINISH_PALETTES.CLASSIC
  const centerX = board.x + board.width / 2
  const baseY = board.y + board.height * 0.74
  const geometry = {
    COMPACT: { torsoWidth: 84, torsoHeight: 126, shoulder: 28, legSpread: 34 },
    BALANCED: { torsoWidth: 102, torsoHeight: 140, shoulder: 38, legSpread: 42 },
    GRAND: { torsoWidth: 126, torsoHeight: 156, shoulder: 48, legSpread: 50 },
  }[model.silhouetteCode] ?? { torsoWidth: 102, torsoHeight: 140, shoulder: 38, legSpread: 42 }

  const torsoY = baseY - geometry.torsoHeight

  return (
    <>
      {visibleStageCount >= 1 ? (
        <g>
          <ellipse cx={centerX} cy={baseY + 28} rx={geometry.torsoWidth * 0.62} ry="14" fill="rgba(36,31,24,0.08)" />
          <circle cx={centerX} cy={torsoY - 34} r="34" fill={palette.base} stroke={palette.accent} strokeWidth="4" />
          <rect x={centerX - geometry.torsoWidth / 2} y={torsoY} width={geometry.torsoWidth} height={geometry.torsoHeight} rx="34" fill={palette.base} stroke={palette.accent} strokeWidth="4" />
          <line x1={centerX - geometry.legSpread} y1={baseY - 12} x2={centerX - geometry.legSpread - 18} y2={baseY + 64} stroke="#241f18" strokeWidth="16" strokeLinecap="round" />
          <line x1={centerX + geometry.legSpread} y1={baseY - 12} x2={centerX + geometry.legSpread + 18} y2={baseY + 64} stroke="#241f18" strokeWidth="16" strokeLinecap="round" />
          <line x1={centerX - geometry.shoulder} y1={torsoY + 40} x2={centerX - geometry.shoulder - 54} y2={torsoY + 96} stroke="#241f18" strokeWidth="14" strokeLinecap="round" />
          <line x1={centerX + geometry.shoulder} y1={torsoY + 40} x2={centerX + geometry.shoulder + 54} y2={torsoY + 96} stroke="#241f18" strokeWidth="14" strokeLinecap="round" />
        </g>
      ) : null}

      {visibleStageCount >= 2 ? (
        <g>
          {model.coreModuleCode === 'ELECTRIC' ? (
            <path d={`M ${centerX + 88} ${torsoY + 34} L ${centerX + 118} ${torsoY + 12} L ${centerX + 96} ${torsoY + 72} L ${centerX + 126} ${torsoY + 72} L ${centerX + 74} ${torsoY + 134} L ${centerX + 88} ${torsoY + 88} L ${centerX + 58} ${torsoY + 88} Z`} fill="#246b5e" />
          ) : model.coreModuleCode === 'ARCANE' ? (
            <>
              <line x1={centerX + 92} y1={torsoY + 12} x2={centerX + 92} y2={torsoY + 154} stroke="#6c4580" strokeWidth="8" strokeLinecap="round" />
              <path d={`M ${centerX + 92} ${torsoY - 12} L ${centerX + 116} ${torsoY + 18} L ${centerX + 92} ${torsoY + 48} L ${centerX + 68} ${torsoY + 18} Z`} fill="#b88bd0" stroke="#6c4580" strokeWidth="3" />
            </>
          ) : (
            <>
              <rect x={centerX - 24} y={torsoY + 26} width="48" height="24" rx="12" fill="#e0b14d" stroke="#7d5018" strokeWidth="3" />
              <line x1={centerX} y1={torsoY + 50} x2={centerX} y2={torsoY + 154} stroke="#7d5018" strokeWidth="8" strokeLinecap="round" />
            </>
          )}
        </g>
      ) : null}

      {visibleStageCount >= 3 ? (
        <g>
          {model.addonModuleCode === 'DEFENSE' ? (
            <circle cx={centerX - 114} cy={torsoY + 104} r="44" fill="rgba(214,228,241,0.9)" stroke="#426c8d" strokeWidth="4" />
          ) : model.addonModuleCode === 'MOBILITY' ? (
            <>
              <path d={`M ${centerX - 28} ${torsoY + 50} C ${centerX - 92} ${torsoY + 18} ${centerX - 124} ${torsoY + 72} ${centerX - 76} ${torsoY + 118}`} fill="none" stroke="#c25737" strokeWidth="7" strokeLinecap="round" />
              <path d={`M ${centerX + 28} ${torsoY + 50} C ${centerX + 92} ${torsoY + 18} ${centerX + 124} ${torsoY + 72} ${centerX + 76} ${torsoY + 118}`} fill="none" stroke="#c25737" strokeWidth="7" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx={centerX - 118} cy={torsoY + 26} r="24" fill="#246b5e" />
              <circle cx={centerX - 118} cy={torsoY + 26} r="9" fill="#fff7ec" />
            </>
          )}
        </g>
      ) : null}

      {visibleStageCount >= 4 ? (
        <g>
          {model.finishStyleCode === 'CLASSIC' ? (
            <path d={`M ${centerX - 42} ${torsoY + 12} L ${centerX} ${torsoY + 118} L ${centerX + 42} ${torsoY + 12}`} fill="rgba(127,92,63,0.3)" stroke={palette.accent} strokeWidth="4" />
          ) : model.finishStyleCode === 'NEON' ? (
            <circle cx={centerX} cy={torsoY + 52} r="132" fill="none" stroke="#45b6c9" strokeWidth="8" opacity="0.6" />
          ) : (
            <>
              <path d={`M ${centerX - 74} ${torsoY - 8} C ${centerX - 108} ${torsoY - 36} ${centerX - 104} ${torsoY + 22} ${centerX - 66} ${torsoY + 20}`} fill="#7aa66d" stroke="#246b5e" strokeWidth="3" />
              <path d={`M ${centerX + 74} ${torsoY - 8} C ${centerX + 108} ${torsoY - 36} ${centerX + 104} ${torsoY + 22} ${centerX + 66} ${torsoY + 20}`} fill="#7aa66d" stroke="#246b5e" strokeWidth="3" />
            </>
          )}
        </g>
      ) : null}
    </>
  )
}

function renderBuilderHouse(model, visibleStageCount, board) {
  const palette = BUILDER_FINISH_PALETTES[model.finishStyleCode] ?? BUILDER_FINISH_PALETTES.CLASSIC
  const centerX = board.x + board.width / 2
  const baseY = board.y + board.height * 0.76
  const geometry = {
    COMPACT: { bodyWidth: 210, bodyHeight: 152, roofHeight: 84 },
    BALANCED: { bodyWidth: 250, bodyHeight: 170, roofHeight: 94 },
    GRAND: { bodyWidth: 300, bodyHeight: 190, roofHeight: 104 },
  }[model.silhouetteCode] ?? { bodyWidth: 250, bodyHeight: 170, roofHeight: 94 }
  const bodyX = centerX - geometry.bodyWidth / 2
  const bodyY = baseY - geometry.bodyHeight

  return (
    <>
      {visibleStageCount >= 1 ? (
        <g>
          <ellipse cx={centerX} cy={baseY + 20} rx={geometry.bodyWidth * 0.48} ry="16" fill="rgba(36,31,24,0.08)" />
          <rect x={bodyX} y={bodyY} width={geometry.bodyWidth} height={geometry.bodyHeight} rx="16" fill={palette.base} stroke={palette.accent} strokeWidth="4" />
          <rect x={centerX - 26} y={bodyY + geometry.bodyHeight - 70} width="52" height="70" rx="10" fill="#fff7ec" stroke={palette.accent} strokeWidth="3" />
        </g>
      ) : null}

      {visibleStageCount >= 2 ? (
        <g>
          <path d={`M ${bodyX - 12} ${bodyY + 12} L ${centerX} ${bodyY - geometry.roofHeight} L ${bodyX + geometry.bodyWidth + 12} ${bodyY + 12} Z`} fill="#7f5c3f" stroke="#5f2d20" strokeWidth="4" />
          {model.coreModuleCode === 'ELECTRIC' ? (
            <rect x={centerX - 30} y={bodyY + 34} width="60" height="34" rx="10" fill="#fff7ec" stroke="#246b5e" strokeWidth="3" />
          ) : model.coreModuleCode === 'ARCANE' ? (
            <path d={`M ${centerX} ${bodyY - 58} L ${centerX + 18} ${bodyY - 20} L ${centerX} ${bodyY + 18} L ${centerX - 18} ${bodyY - 20} Z`} fill="#b88bd0" stroke="#6c4580" strokeWidth="3" />
          ) : (
            <rect x={centerX - 58} y={bodyY - geometry.roofHeight + 26} width="116" height="26" rx="8" fill="#20334d" stroke="#426c8d" strokeWidth="3" />
          )}
        </g>
      ) : null}

      {visibleStageCount >= 3 ? (
        <g>
          {model.addonModuleCode === 'DEFENSE' ? (
            <>
              <rect x={bodyX + geometry.bodyWidth - 42} y={bodyY - 82} width="42" height="124" rx="10" fill="rgba(214,228,241,0.9)" stroke="#426c8d" strokeWidth="4" />
              <path d={`M ${bodyX + geometry.bodyWidth - 21} ${bodyY - 110} L ${bodyX + geometry.bodyWidth} ${bodyY - 82} L ${bodyX + geometry.bodyWidth - 42} ${bodyY - 82} Z`} fill="#426c8d" />
            </>
          ) : model.addonModuleCode === 'MOBILITY' ? (
            <rect x={bodyX + geometry.bodyWidth + 16} y={bodyY + geometry.bodyHeight - 66} width="92" height="66" rx="12" fill="#f6ece0" stroke="#c25737" strokeWidth="4" />
          ) : (
            <>
              <rect x={bodyX - 108} y={bodyY + geometry.bodyHeight - 72} width="92" height="72" rx="14" fill="#d6eadf" stroke="#246b5e" strokeWidth="4" />
              <circle cx={bodyX - 62} cy={bodyY + geometry.bodyHeight - 24} r="14" fill="#7aa66d" />
            </>
          )}
        </g>
      ) : null}

      {visibleStageCount >= 4 ? (
        <g>
          {model.finishStyleCode === 'CLASSIC' ? (
            <path d={`M ${bodyX + 28} ${bodyY + 44} H ${bodyX + geometry.bodyWidth - 28}`} stroke="#fff7ec" strokeWidth="6" strokeLinecap="round" />
          ) : model.finishStyleCode === 'NEON' ? (
            <rect x={bodyX - 10} y={bodyY - geometry.roofHeight - 12} width={geometry.bodyWidth + 20} height={geometry.bodyHeight + geometry.roofHeight + 26} rx="26" fill="none" stroke="#45b6c9" strokeWidth="6" opacity="0.65" />
          ) : (
            <>
              <circle cx={bodyX + 22} cy={bodyY + geometry.bodyHeight + 8} r="14" fill="#7aa66d" />
              <circle cx={bodyX + geometry.bodyWidth - 22} cy={bodyY + geometry.bodyHeight + 8} r="14" fill="#7aa66d" />
            </>
          )}
        </g>
      ) : null}

      {visibleStageCount >= 1 ? (
        Array.from({ length: 4 }, (_, index) => (
          <rect
            key={`house-window-${index}`}
            x={bodyX + 34 + index * ((geometry.bodyWidth - 68) / 4)}
            y={bodyY + 62}
            width="26"
            height="34"
            rx="8"
            fill="rgba(255,250,242,0.78)"
            stroke={palette.accent}
          />
        ))
      ) : null}
    </>
  )
}

function renderBuilderArtifact(model, visibleStageCount, board) {
  if (visibleStageCount === 0) {
    return null
  }

  if (model.productType === 'CHARACTER') {
    return renderBuilderCharacter(model, visibleStageCount, board)
  }

  if (model.productType === 'HOUSE') {
    return renderBuilderHouse(model, visibleStageCount, board)
  }

  return renderBuilderCar(model, visibleStageCount, board)
}

export default function BuilderScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractBuilderModel(execution), [execution])
  const playbackFrames = useMemo(() => buildBuilderPlaybackFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(
    Math.max(0, playbackFrames.length - 1),
  )
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, playbackFrames.length - 1))
    setIsPlaying(false)
  }, [playbackFrames.length, model?.mode, model?.buildName, model?.productType])

  useEffect(() => {
    if (playMode === 'STEP') {
      setIsPlaying(false)
    }
  }, [playMode])

  useEffect(() => {
    if (!isPlaying || playMode !== 'AUTO' || currentFrameIndex >= playbackFrames.length - 1) {
      if (currentFrameIndex >= playbackFrames.length - 1) {
        setIsPlaying(false)
      }
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentFrameIndex((index) => Math.min(index + 1, playbackFrames.length - 1))
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [currentFrameIndex, delayMs, isPlaying, playMode, playbackFrames.length])

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const currentFrame = playbackFrames[currentFrameIndex] ?? playbackFrames[playbackFrames.length - 1]
  const visibleStageCount = currentFrame?.visibleStageCount ?? 0
  const visibleStages = model.useBuilder
    ? model.stages.slice(0, visibleStageCount)
    : visibleStageCount > 0
      ? model.stages
      : []
  const currentStage = model.useBuilder && visibleStageCount > 0
    ? visibleStages[visibleStages.length - 1]
    : null
  const viewBoxWidth = 1380
  const board = { x: 338, y: 178, width: 640, height: 500 }
  const leftPanel = { x: 36, y: 178, width: 274, height: 500 }
  const rightPanel = { x: 1010, y: 178, width: 334, height: 500 }
  const timeline = { x: 36, y: 706, width: 1308, height: 286 }
  const viewBoxHeight = 1032
  const defsId = `builder-scene-${isExpanded ? 'expanded' : 'compact'}`
  const stageListTop = leftPanel.y + 154

  function handleLaunchDemo() {
    if (playbackFrames.length === 0) {
      return
    }

    setCurrentFrameIndex(0)
    setIsPlaying(playMode === 'AUTO')
  }

  function handleResetToFinalState() {
    setCurrentFrameIndex(Math.max(0, playbackFrames.length - 1))
    setIsPlaying(false)
  }

  function handlePreviousStep() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.max(0, index - 1))
  }

  function handleNextStep() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.min(index + 1, playbackFrames.length - 1))
  }

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scène SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Build Your Object')}
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white/72 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Lecture</span>
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              playMode === 'AUTO'
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white text-stone-700'
            }`}
            type="button"
            onClick={() => setPlayMode('AUTO')}
          >
            Auto
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              playMode === 'STEP'
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white text-stone-700'
            }`}
            type="button"
            onClick={() => setPlayMode('STEP')}
          >
            Pas à pas
          </button>
          {playMode === 'AUTO' ? (
            <select
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 outline-none focus:border-black/20"
              value={delayMs}
              onChange={(event) => setDelayMs(Number(event.target.value))}
            >
              <option value={600}>0.6 s / etape</option>
              <option value={900}>0.9 s / etape</option>
              <option value={1400}>1.4 s / etape</option>
            </select>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5" type="button" onClick={handleLaunchDemo}>
            Animer l assemblage
          </button>
          {playMode === 'AUTO' ? (
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40"
              disabled={currentFrameIndex >= playbackFrames.length - 1 && !isPlaying}
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
            >
              {isPlaying ? 'Pause' : 'Reprendre'}
            </button>
          ) : null}
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40" disabled={currentFrameIndex === 0} type="button" onClick={handlePreviousStep}>
            Étape précédente
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40" disabled={currentFrameIndex >= playbackFrames.length - 1} type="button" onClick={handleNextStep}>
            Étape suivante
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20" type="button" onClick={handleResetToFinalState}>
            Retour à la fin
          </button>
        </div>
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-header`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(211,236,230,0.84)" />
            </linearGradient>
          </defs>

          <rect x="36" y="44" width="1308" height="98" rx="32" fill={`url(#${defsId}-header)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x="64" y="80" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useBuilder ? 'BUILDER WORKSHOP' : 'MONOLITHIC CONSTRUCTOR MODE'}
          </text>
          <text x="64" y="112" fontSize="28" fontWeight="700" fill="#241f18">
            {model.buildName} · {model.productLabel}
          </text>
          <text x="1280" y="82" textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {visibleStageCount}/{model.stageCount} étape(s)
          </text>
          <text x="1280" y="108" textAnchor="end" fontSize="13" fill="#5f5548">
            {playMode === 'AUTO'
              ? `T+${Math.max(0, currentFrameIndex * delayMs) / 1000}s`
              : currentFrameIndex === 0
                ? 'Assemblage en attente'
                : currentFrame.title}
          </text>

          <rect x={leftPanel.x} y={leftPanel.y} width={leftPanel.width} height={leftPanel.height} rx="30" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" className="scene-node-shadow" />
          <text x={leftPanel.x + 22} y={leftPanel.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useBuilder ? 'PROCESSUS' : 'CONTRASTE'}
          </text>
          <text x={leftPanel.x + 22} y={leftPanel.y + 64} fontSize="24" fontWeight="700" fill="#241f18">
            {model.useBuilder ? 'Construction progressive' : 'Build d un bloc'}
          </text>
          <foreignObject x={leftPanel.x + 20} y={leftPanel.y + 78} width={leftPanel.width - 40} height="58">
            <div className="h-full overflow-hidden text-[13px] leading-5 text-stone-600" xmlns="http://www.w3.org/1999/xhtml">
              <p>
                {model.useBuilder
                  ? 'Le director garde l ordre et le builder pose chaque piece.'
                  : 'Le client pousse tous les parametres au meme endroit puis espere un resultat lisible.'}
              </p>
            </div>
          </foreignObject>

          {model.stages.map((stage, index) => {
            const tone = BUILDER_STAGE_SWATCHES[stage.stageCode] ?? BUILDER_STAGE_SWATCHES.SILHOUETTE
            const isVisible = visibleStageCount >= index + 1
            const isCurrent = currentStage?.stageCode === stage.stageCode
            const y = stageListTop + index * 82
            return (
              <g key={stage.stageCode}>
                <rect x={leftPanel.x + 18} y={y} width={leftPanel.width - 36} height="72" rx="22" fill={isVisible ? tone.fill : 'rgba(255,249,239,0.7)'} stroke={isCurrent ? '#241f18' : tone.stroke} strokeWidth={isCurrent ? 3 : 2} />
                <text x={leftPanel.x + 34} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#7a6c5d">
                  {stage.stageLabel}
                </text>
                <text x={leftPanel.x + 34} y={y + 50} fontSize="15" fontWeight="700" fill={tone.text}>
                  {stage.optionLabel}
                </text>
                <text x={leftPanel.x + leftPanel.width - 34} y={y + 50} textAnchor="end" fontSize="11" fontWeight="700" fill="#5f5548">
                  {isCurrent ? 'NOW' : isVisible ? `+${stage.deltaUtility + stage.deltaStyle}` : 'LOCK'}
                </text>
              </g>
            )
          })}

          <rect x={board.x} y={board.y} width={board.width} height={board.height} rx="34" fill="rgba(255,250,242,0.98)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" className="scene-node-shadow" />
          <text x={board.x + 24} y={board.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ASSEMBLY CANVAS
          </text>
          <text x={board.x + 24} y={board.y + 62} fontSize="24" fontWeight="700" fill="#241f18">
            {currentFrame.title}
          </text>
          <text x={board.x + 24} y={board.y + 88} fontSize="13" fill="#5f5548">
            {currentFrame.detail}
          </text>

          <rect x={board.x + 22} y={board.y + 116} width={board.width - 44} height={board.height - 142} rx="30" fill="rgba(247,240,226,0.74)" stroke="rgba(36,31,24,0.06)" />

          {visibleStageCount === 0 ? (
            <g>
              <circle cx={board.x + board.width / 2} cy={board.y + board.height / 2 + 12} r="84" fill="rgba(36,31,24,0.06)" stroke="rgba(36,31,24,0.08)" strokeDasharray="12 10" />
              <text x={board.x + board.width / 2} y={board.y + board.height / 2} textAnchor="middle" fontSize="16" fontWeight="700" fill="#7a6c5d">
                {model.useBuilder ? 'En attente de la premiere etape' : 'Parametres en preparation'}
              </text>
            </g>
          ) : (
            renderBuilderArtifact(model, visibleStageCount, {
              x: board.x + 22,
              y: board.y + 116,
              width: board.width - 44,
              height: board.height - 142,
            })
          )}

          <rect x={rightPanel.x} y={rightPanel.y} width={rightPanel.width} height={rightPanel.height} rx="30" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" className="scene-node-shadow" />
          <text x={rightPanel.x + 22} y={rightPanel.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            FINAL BLUEPRINT
          </text>
          <text x={rightPanel.x + 22} y={rightPanel.y + 64} fontSize="24" fontWeight="700" fill="#241f18">
            {model.readyLabel}
          </text>
          <foreignObject x={rightPanel.x + 18} y={rightPanel.y + 84} width={rightPanel.width - 36} height={rightPanel.height - 102}>
            <div className="h-full overflow-y-auto pr-1 builder-scroll-area" xmlns="http://www.w3.org/1999/xhtml">
              <div className="space-y-4 pb-2">
                <p className="text-[13px] leading-5 text-stone-600">
                  {model.productDescription}
                </p>

                <div className="space-y-3">
                  {[
                    { label: 'AGI', value: currentFrame.agility, max: 16, color: '#246b5e' },
                    { label: 'RES', value: currentFrame.resilience, max: 16, color: '#426c8d' },
                    { label: 'UTI', value: currentFrame.utility, max: 16, color: '#c25737' },
                    { label: 'STYLE', value: currentFrame.style, max: 16, color: '#7f5c3f' },
                  ].map((metric) => {
                    const width = `${Math.max(10, Math.min(100, (metric.value / metric.max) * 100))}%`
                    return (
                      <div key={metric.label} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">
                          <span>{metric.label}</span>
                          <span className="text-[13px] tracking-normal text-stone-900">{metric.value}</span>
                        </div>
                        <div className="h-[18px] overflow-hidden rounded-full bg-black/8">
                          <div className="h-full rounded-full" style={{ width, backgroundColor: metric.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-[20px] border border-black/8 bg-white/88 px-4 py-3 shadow-[0_10px_24px_rgba(48,39,24,0.06)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">Score total</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[32px] font-bold leading-none text-stone-950">{currentFrame.totalScore}</p>
                    <p className="text-right text-[12px] leading-5 text-stone-600">{model.challengeGoal}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  {(model.useBuilder
                    ? ['Client -> Director', 'Director -> Builder', 'Builder -> Product']
                    : model.monolithicPainPoints.slice(0, 3)
                  ).map((entry, index) => (
                    <div
                      key={`${entry}-${index}`}
                      className="rounded-[16px] border border-black/8 bg-white/88 px-3 py-2 text-[12px] font-medium leading-5 text-stone-700 shadow-[0_10px_24px_rgba(48,39,24,0.06)]"
                    >
                      {entry}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </foreignObject>

          <rect x={timeline.x} y={timeline.y} width={timeline.width} height={timeline.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timeline.x + 24} y={timeline.y + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            PAS A PAS
          </text>
          <text x={timeline.x + 24} y={timeline.y + 62} fontSize="24" fontWeight="700" fill="#241f18">
            Construction du produit
          </text>
          <text x={timeline.x + 24} y={timeline.y + 88} fontSize="13" fill="#5f5548">
            avec Builder, l objet se complete progressivement ; sans Builder, il apparait d un seul coup
          </text>

          <foreignObject x={timeline.x + 16} y={timeline.y + 108} width={timeline.width - 32} height={timeline.height - 126}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid h-full gap-3 pb-2 sm:grid-cols-2 xl:grid-cols-4">
                {model.stages.map((stage) => {
                  const isVisible = visibleStageCount >= stage.index
                  const isCurrent = currentStage?.stageCode === stage.stageCode
                  const tone = BUILDER_STAGE_SWATCHES[stage.stageCode] ?? BUILDER_STAGE_SWATCHES.SILHOUETTE

                  return (
                    <div
                      key={`${stage.stageCode}-${stage.optionCode}`}
                      className={`min-h-[136px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${
                        isVisible ? 'bg-white/95' : 'bg-stone-50/70 opacity-55'
                      } ${isCurrent ? 'ring-2 ring-stone-950/15' : ''}`}
                      style={{ borderColor: tone.stroke }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Étape {stage.index}
                      </p>
                      <p className="mt-2 text-[13px] font-semibold" style={{ color: tone.text }}>
                        {stage.stageLabel}
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-stone-800">{stage.optionLabel}</p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-600">{stage.detail}</p>
                      <p className="mt-3 text-[11px] font-medium text-stone-500">
                        +AGI {stage.deltaAgility} · +RES {stage.deltaResilience} · +UTI {stage.deltaUtility} · +STYLE {stage.deltaStyle}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </foreignObject>
        </svg>
      </ZoomableViewport>
    </div>
  )
}
