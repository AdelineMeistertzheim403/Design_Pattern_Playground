import { createElement, useEffect, useMemo, useState } from 'react'

import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function normalizeItem(item, index) {
  return {
    id: `${item?.id ?? `item-${index + 1}`}`.trim(),
    label: `${item?.label ?? 'Element'}`.trim(),
    kind: `${item?.kind ?? 'ENTRY'}`.trim().toUpperCase(),
    depth: safeNumber(item?.depth, 0),
    linearIndex: safeNumber(item?.linearIndex, index),
  }
}

function normalizeStep(step, index) {
  return {
    index: safeNumber(step?.index, index + 1),
    action: `${step?.action ?? 'NEXT'}`.trim().toUpperCase(),
    actorLabel: `${step?.actorLabel ?? 'Iterator'}`.trim(),
    targetId: `${step?.targetId ?? ''}`.trim(),
    targetLabel: `${step?.targetLabel ?? 'Element'}`.trim(),
    pointerIndex: safeNumber(step?.pointerIndex, 0),
    previousStable: Boolean(step?.previousStable),
    detail: `${step?.detail ?? ''}`.trim(),
  }
}

function extractIteratorModel(execution) {
  const output = execution?.output
  if (!output || !Array.isArray(output.items) || !Array.isArray(output.steps)) {
    return null
  }

  const items = output.items.map((item, index) => normalizeItem(item, index))
  const steps = output.steps.map((step, index) => normalizeStep(step, index))
  const currentItemId = `${output.currentItemId ?? items[0]?.id ?? ''}`.trim()

  return {
    mode: `${output.mode ?? 'WITH_ITERATOR'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Iterator'}`.trim(),
    explorerName: `${output.explorerName ?? 'Traversal Explorer'}`.trim(),
    collectionCode: `${output.collectionCode ?? 'ASSET_TREE'}`.trim().toUpperCase(),
    collectionLabel: `${output.collectionLabel ?? 'Asset Tree'}`.trim(),
    collectionDescription: `${output.collectionDescription ?? ''}`.trim(),
    iteratorBenefit: `${output.iteratorBenefit ?? ''}`.trim(),
    manualDriftDetail: `${output.manualDriftDetail ?? ''}`.trim(),
    previousSupported: Boolean(output.previousSupported),
    stablePrevious: Boolean(output.stablePrevious),
    itemCount: safeNumber(output.itemCount, items.length),
    visitedCount: safeNumber(output.visitedCount, 0),
    finalPointerIndex: safeNumber(output.finalPointerIndex, 0),
    currentItemId,
    currentItemLabel: `${output.currentItemLabel ?? ''}`.trim(),
    resultLabel: `${output.resultLabel ?? ''}`.trim(),
    previousActionCount: safeNumber(output.previousActionCount, 0),
    unstableBacktrackCount: safeNumber(output.unstableBacktrackCount, 0),
    items,
    steps,
  }
}

function buildIteratorFrames(model) {
  if (!model) {
    return []
  }

  const introDetail = model.previousSupported
    ? `Le curseur cree par Iterator s aligne sur ${model.collectionLabel} et garde un retour arriere stable.`
    : `Le client parcourt ${model.collectionLabel} manuellement. Le retour arriere reste fragile.`

  return [
    {
      id: 'iterator-initial',
      index: 0,
      action: 'START',
      actorLabel: model.previousSupported ? 'CollectionIterator' : 'TraversalClient',
      targetId: '',
      targetLabel: model.items[0]?.label ?? model.collectionLabel,
      pointerIndex: -1,
      previousStable: model.stablePrevious,
      detail: introDetail,
      currentItemId: '',
      currentItemLabel: model.items[0]?.label ?? model.collectionLabel,
      visitedIds: [],
      resultLabel: 'Traversal ready',
    },
    ...model.steps.map((step, index) => {
      const visitedIds = model.steps.slice(0, index + 1).map((item) => item.targetId).filter(Boolean)
      return {
        ...step,
        id: `iterator-step-${step.index}`,
        currentItemId: step.targetId,
        currentItemLabel: step.targetLabel,
        visitedIds,
        resultLabel: step.targetLabel,
      }
    }),
  ]
}

function ItemCard({ item, card, isCurrent, isVisited }) {
  const palette = isCurrent
    ? {
        fill: '#241f18',
        stroke: '#241f18',
        text: '#fff8ee',
        subtle: 'rgba(255,248,238,0.68)',
      }
    : isVisited
      ? {
          fill: 'rgba(211,236,230,0.96)',
          stroke: '#246b5e',
          text: '#153f38',
          subtle: '#577166',
        }
      : {
          fill: item.kind === 'FILE' ? 'rgba(255,249,239,0.98)' : 'rgba(214,228,241,0.94)',
          stroke: item.kind === 'FILE' ? '#7f5c3f' : '#426c8d',
          text: item.kind === 'FILE' ? '#3d2d20' : '#27465f',
          subtle: item.kind === 'FILE' ? '#6a5544' : '#547086',
        }

  const labelLines = wrapText(item.label, 18).slice(0, 2)

  return (
    <g>
      {isCurrent ? (
        <rect
          x={card.x - 8}
          y={card.y - 8}
          width={card.width + 16}
          height={card.height + 16}
          rx="28"
          fill="rgba(36,31,24,0.06)"
          stroke="rgba(36,31,24,0.18)"
          strokeWidth="2"
          className="state-active-halo"
        />
      ) : null}
      <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="24" fill={palette.fill} stroke={palette.stroke} strokeWidth={isCurrent ? '3' : '2'} className="scene-node-shadow" />
      <text x={card.x + 16} y={card.y + 22} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={palette.subtle}>
        {item.kind}
      </text>
      <text x={card.x + card.width - 16} y={card.y + 22} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={palette.subtle}>
        #{item.linearIndex}
      </text>
      {labelLines.map((line, index) => (
        <text key={`${item.id}-${index}`} x={card.x + 16} y={card.y + 50 + index * 18} fontSize="18" fontWeight="700" fill={palette.text}>
          {line}
        </text>
      ))}
      <text x={card.x + 16 + item.depth * 14} y={card.y + card.height - 16} fontSize="11" fill={palette.subtle}>
        {item.depth > 0 ? `depth ${item.depth}` : 'root level'}
      </text>
      {isCurrent ? (
        <text x={card.x + card.width - 16} y={card.y + card.height - 16} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#fff8ee">
          NOW
        </text>
      ) : null}
    </g>
  )
}

function StepCard({ card, step, isLast }) {
  const isPrevious = step.action === 'PREVIOUS'
  const isFragile = isPrevious && !step.previousStable
  const fill = isFragile ? 'rgba(245,227,210,0.98)' : isPrevious ? 'rgba(214,228,241,0.94)' : 'rgba(255,249,239,0.98)'
  const stroke = isFragile ? '#c25737' : isPrevious ? '#426c8d' : '#7f5c3f'
  const actionColor = isFragile ? '#c25737' : isPrevious ? '#27465f' : '#3d2d20'

  return (
    <g>
      <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="22" fill={fill} stroke={stroke} strokeWidth={isLast ? '2.5' : '1.5'} />
      {isLast ? (
        <rect x={card.x + card.width - 74} y={card.y + 14} width="56" height="18" rx="9" fill="#241f18" />
      ) : null}
      {isLast ? (
        <text x={card.x + card.width - 46} y={card.y + 27} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="0.18em" fill="#fff8ee">
          NOW
        </text>
      ) : null}
      <text x={card.x + 18} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6b6257">
        STEP {step.index}
      </text>
      <text x={card.x + 18} y={card.y + 54} fontSize="20" fontWeight="700" fill={actionColor}>
        {step.action}
      </text>
      <text x={card.x + 18} y={card.y + 74} fontSize="11" fill="#6c6257">
        {step.actorLabel}
      </text>
      <text x={card.x + card.width - 18} y={card.y + 24} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6b6257">
        IDX {step.pointerIndex}
      </text>
      <foreignObject x={card.x + 16} y={card.y + 88} width={card.width - 32} height={card.height - 100}>
        <div className="h-full overflow-hidden text-[12px] leading-5 text-[#5f5548]" xmlns="http://www.w3.org/1999/xhtml">
          <p className="m-0">{step.detail}</p>
        </div>
      </foreignObject>
    </g>
  )
}

export default function IteratorScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractIteratorModel(execution), [execution])
  const frames = useMemo(() => buildIteratorFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(Math.max(0, frames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }, [frames.length, model?.mode, model?.collectionCode, model?.explorerName])

  useEffect(() => {
    if (playMode === 'STEP') {
      setIsPlaying(false)
    }
  }, [playMode])

  useEffect(() => {
    if (!isPlaying || playMode !== 'AUTO' || currentFrameIndex >= frames.length - 1) {
      if (currentFrameIndex >= frames.length - 1) {
        setIsPlaying(false)
      }
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentFrameIndex((index) => Math.min(index + 1, frames.length - 1))
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [currentFrameIndex, delayMs, frames.length, isPlaying, playMode])

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const currentFrame = frames[currentFrameIndex] ?? frames[frames.length - 1]

  function handleLaunchDemo() {
    setCurrentFrameIndex(0)
    setIsPlaying(playMode === 'AUTO')
  }

  function handleReset() {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }

  function handlePrevious() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.max(0, index - 1))
  }

  function handleNext() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.min(index + 1, frames.length - 1))
  }

  const viewBoxWidth = 1240
  const metrics = { x: 36, y: 40, width: 1168, height: 108 }
  const graph = { x: 36, y: 168, width: 1168, height: 418 }
  const collectionArea = { x: 64, y: 242, width: 744, height: 280 }
  const controlCard = { x: 850, y: 238, width: 318, height: 156 }
  const resultCard = { x: 850, y: 414, width: 318, height: 134 }
  const timelineX = 36
  const timelineY = 612
  const timelineWidth = 1168
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineCardHeight = 148
  const timelineGap = 14
  const timelineHeight = 112 + timelineRows * timelineCardHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `iterator-scene-${isExpanded ? 'expanded' : 'compact'}`

  const visibleSteps = model.steps.slice(0, currentFrameIndex)
  const visitedIdSet = new Set(currentFrame.visitedIds)
  const currentStep = currentFrameIndex > 0 ? visibleSteps[visibleSteps.length - 1] ?? null : null
  const activeItemId = currentFrame.currentItemId || model.currentItemId
  const activeItemLabel = currentFrame.currentItemLabel || model.currentItemLabel
  const resultLabel = currentFrame.resultLabel || model.resultLabel

  const itemCards = model.items.map((item, index) => {
    const columns = model.collectionCode === 'ASSET_TREE' ? 2 : Math.min(3, model.items.length)
    const row = Math.floor(index / columns)
    const column = index % columns
    const cardWidth = model.collectionCode === 'ASSET_TREE' ? 330 : 220
    const cardHeight = 96
    const columnGap = model.collectionCode === 'ASSET_TREE' ? 28 : 18
    const rowGap = 18
    const baseX = collectionArea.x + column * (cardWidth + columnGap)
    const offsetX = model.collectionCode === 'ASSET_TREE' ? item.depth * 18 : 0
    const x = baseX + offsetX
    const y = collectionArea.y + row * (cardHeight + rowGap)

    return {
      item,
      card: { x, y, width: cardWidth - offsetX, height: cardHeight },
    }
  })

  const currentCard = itemCards.find(({ item }) => item.id === activeItemId)?.card ?? itemCards[0]?.card
  const cursorPath = currentCard
    ? `M ${controlCard.x} ${controlCard.y + controlCard.height / 2} C 826 ${controlCard.y + controlCard.height / 2} ${currentCard.x + currentCard.width + 36} ${currentCard.y + currentCard.height / 2} ${currentCard.x + currentCard.width} ${currentCard.y + currentCard.height / 2}`
    : null

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scène SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Traversal Explorer')}
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {playMode === 'AUTO' ? (
            <label className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-stone-700">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Tempo</span>
              <select
                className="bg-transparent font-semibold outline-none"
                value={delayMs}
                onChange={(event) => setDelayMs(Number(event.target.value))}
              >
                <option value={700}>700 ms</option>
                <option value={900}>900 ms</option>
                <option value={1200}>1200 ms</option>
              </select>
            </label>
          ) : null}

          <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5" type="button" onClick={handleLaunchDemo}>
            Animer la scène
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handlePrevious} disabled={currentFrameIndex === 0}>
            Précédent
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handleNext} disabled={currentFrameIndex >= frames.length - 1}>
            Suivant
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(214,228,241,0.84)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-warning-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect x={metrics.x} y={metrics.y} width={metrics.width} height={metrics.height} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metrics.x + 28} y={metrics.y + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ITERATOR CURSOR
          </text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.collectionLabel}
          </text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.modeLabel} · {model.itemCount} element(s) · {model.visitedCount} visites
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 60} textAnchor="end" fontSize="24" fontWeight="700" fill={model.stablePrevious ? '#153f38' : '#c25737'}>
            {model.resultLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 88} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.previousActionCount} retour(s) arriere · {model.unstableBacktrackCount} fragile(s)
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            LIVE TRAVERSAL
          </text>

          {itemCards.map(({ item, card }) => (
            <ItemCard
              key={item.id}
              item={item}
              card={card}
              isCurrent={item.id === activeItemId}
              isVisited={visitedIdSet.has(item.id)}
            />
          ))}

          <g>
            <rect x={controlCard.x} y={controlCard.y} width={controlCard.width} height={controlCard.height} rx="28" fill="#241f18" stroke="#241f18" strokeWidth="2" className="scene-node-shadow" />
            <text x={controlCard.x + 18} y={controlCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="rgba(255,248,238,0.64)">
              CURSOR CONTROL
            </text>
            <text x={controlCard.x + 18} y={controlCard.y + 56} fontSize="24" fontWeight="700" fill="#fff8ee">
              {currentStep?.action ?? 'START'}
            </text>
            <text x={controlCard.x + 18} y={controlCard.y + 80} fontSize="12" fill="rgba(255,248,238,0.74)">
              {currentStep?.actorLabel ?? (model.previousSupported ? 'CollectionIterator' : 'TraversalClient')}
            </text>
            <foreignObject x={controlCard.x + 16} y={controlCard.y + 92} width={controlCard.width - 32} height={controlCard.height - 106}>
              <div className="h-full overflow-hidden text-[12px] leading-5 text-white/78" xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">{currentStep?.detail ?? model.iteratorBenefit}</p>
              </div>
            </foreignObject>
          </g>

          <g>
            <rect x={resultCard.x} y={resultCard.y} width={resultCard.width} height={resultCard.height} rx="28" fill={model.stablePrevious ? 'rgba(211,236,230,0.94)' : 'rgba(245,227,210,0.96)'} stroke={model.stablePrevious ? '#246b5e' : '#c25737'} strokeWidth="2" className="scene-node-shadow" />
            <text x={resultCard.x + 18} y={resultCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.stablePrevious ? '#577166' : '#8b5b49'}>
              RESULTAT
            </text>
            <text x={resultCard.x + 18} y={resultCard.y + 56} fontSize="22" fontWeight="700" fill={model.stablePrevious ? '#153f38' : '#5f2d20'}>
              {activeItemLabel}
            </text>
            <foreignObject x={resultCard.x + 16} y={resultCard.y + 72} width={resultCard.width - 32} height={resultCard.height - 86}>
              <div className={`h-full overflow-hidden text-[12px] leading-5 ${model.stablePrevious ? 'text-[#215247]' : 'text-[#7a4634]'}`} xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">{currentStep?.detail ?? (model.stablePrevious ? model.iteratorBenefit : model.manualDriftDetail)}</p>
              </div>
            </foreignObject>
          </g>

          {cursorPath ? (
            <path
              d={cursorPath}
              fill="none"
              stroke={model.stablePrevious ? '#246b5e' : '#c25737'}
              strokeWidth="3"
              strokeDasharray="14 8"
              markerEnd={`url(#${defsId}-${model.stablePrevious ? 'arrow' : 'warning-arrow'})`}
              className="scene-flow-line"
            />
          ) : null}
          {cursorPath ? (
            <circle r="5" fill={model.stablePrevious ? '#246b5e' : '#c25737'} opacity="0.96">
              <animateMotion dur="1.9s" repeatCount="indefinite" path={cursorPath} />
            </circle>
          ) : null}
          {currentCard ? (
            <circle
              cx={currentCard.x + currentCard.width - 18}
              cy={currentCard.y + 18}
              r="10"
              fill={model.stablePrevious ? '#246b5e' : '#c25737'}
              className="state-active-halo"
            />
          ) : null}
          {currentCard ? (
            <text
              x={currentCard.x + currentCard.width - 18}
              y={currentCard.y + 22}
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              letterSpacing="0.14em"
              fill="#fff8ee"
            >
              GO
            </text>
          ) : null}

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="30" fill="rgba(255,249,239,0.98)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            NEXT / PREVIOUS
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            Timeline de parcours
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            {visibleSteps.length}/{model.steps.length} étapes · curseur sur {resultLabel}
          </text>

          {model.steps.map((step, index) => {
            const column = index % timelineColumns
            const row = Math.floor(index / timelineColumns)
            const cardWidth = (timelineWidth - 48 - timelineGap * (timelineColumns - 1)) / timelineColumns
            const card = {
              x: timelineX + 24 + column * (cardWidth + timelineGap),
              y: timelineY + 106 + row * (timelineCardHeight + timelineGap),
              width: cardWidth,
              height: timelineCardHeight,
            }

            return <StepCard key={`${step.index}-${step.action}`} card={card} step={step} isLast={index === currentFrameIndex - 1} />
          })}
        </svg>
      </ZoomableViewport>
    </div>
  )
}
