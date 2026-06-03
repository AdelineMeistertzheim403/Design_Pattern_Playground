import { createElement, useEffect, useMemo, useState } from 'react'

import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function normalizeTreeNode(node, index) {
  return {
    id: `${node?.id ?? `node-${index + 1}`}`.trim(),
    parentId: node?.parentId == null ? null : `${node.parentId}`.trim(),
    label: `${node?.label ?? 'node'}`.trim(),
    kind: `${node?.kind ?? 'FILE'}`.trim().toUpperCase(),
    depth: safeNumber(node?.depth, 0),
    sizeMb: safeNumber(node?.sizeMb, 0),
    infected: Boolean(node?.infected),
    visited: Boolean(node?.visited),
    matched: Boolean(node?.matched),
  }
}

function normalizeStep(step, index) {
  return {
    index: safeNumber(step?.index, index + 1),
    nodeId: `${step?.nodeId ?? ''}`.trim(),
    nodeLabel: `${step?.nodeLabel ?? 'Element'}`.trim(),
    nodeKind: `${step?.nodeKind ?? 'FILE'}`.trim().toUpperCase(),
    depth: safeNumber(step?.depth, 0),
    detail: `${step?.detail ?? ''}`.trim(),
    matched: Boolean(step?.matched),
  }
}

function extractVisitorModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.treeNodes) || !Array.isArray(output.traversalSteps)) {
    return null
  }

  const treeNodes = output.treeNodes.map((node, index) => normalizeTreeNode(node, index))
  const traversalSteps = output.traversalSteps.map((step, index) => normalizeStep(step, index))

  return {
    mode: `${output.mode ?? 'WITH_VISITOR'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Visitor'}`.trim(),
    useVisitor: `${output.mode ?? 'WITH_VISITOR'}`.trim().toUpperCase() !== 'WITHOUT_VISITOR',
    treePreset: `${output.treePreset ?? 'ASSET_PACK'}`.trim().toUpperCase(),
    treeLabel: `${output.treeLabel ?? 'Asset Pack'}`.trim(),
    treeDescription: `${output.treeDescription ?? ''}`.trim(),
    visitorType: `${output.visitorType ?? 'COUNT_ELEMENTS'}`.trim().toUpperCase(),
    visitorLabel: `${output.visitorLabel ?? 'Count Elements'}`.trim(),
    visitorDescription: `${output.visitorDescription ?? ''}`.trim(),
    searchTerm: `${output.searchTerm ?? ''}`.trim(),
    visitedCount: safeNumber(output.visitedCount, traversalSteps.length),
    matchedCount: safeNumber(output.matchedCount, 0),
    resultLabel: `${output.resultLabel ?? 'Result'}`.trim(),
    resultDetail: `${output.resultDetail ?? ''}`.trim(),
    folderCount: safeNumber(output.folderCount, 0),
    fileCount: safeNumber(output.fileCount, 0),
    pricedFileCount: safeNumber(output.pricedFileCount, 0),
    totalValueMb: safeNumber(output.totalValueMb, 0),
    infectedCount: safeNumber(output.infectedCount, 0),
    found: Boolean(output.found),
    foundLabel: `${output.foundLabel ?? ''}`.trim(),
    matchedNodeIds: Array.isArray(output.matchedNodeIds)
      ? output.matchedNodeIds.map((id) => `${id}`.trim()).filter(Boolean)
      : [],
    treeNodes,
    traversalSteps,
  }
}

function buildFrames(model) {
  if (!model) {
    return []
  }

  const introDetail = model.useVisitor
    ? `Le client choisit ${model.visitorLabel} puis lance accept(visitor) sur ${model.treeLabel}.`
    : `Le client traverse ${model.treeLabel} avec un moteur manuel base sur les types concrets.`

  return [
    {
      id: 'intro',
      title: 'Structure prete',
      detail: introDetail,
      currentStep: null,
      currentNodeId: null,
      visitedIds: [],
      matchedIds: [],
      currentPathNodeIds: [],
    },
    ...model.traversalSteps.map((step, index) => ({
      id: `step-${step.index}`,
      title: `Étape ${step.index}`,
      detail: step.detail,
      currentStep: step,
      currentNodeId: step.nodeId,
      visitedIds: model.traversalSteps.slice(0, index + 1).map((item) => item.nodeId),
      matchedIds: model.traversalSteps.slice(0, index + 1).filter((item) => item.matched).map((item) => item.nodeId),
      currentPathNodeIds: [],
    })),
  ]
}

function buildTreeLayout(nodes, area) {
  const maxDepth = Math.max(...nodes.map((node) => node.depth), 0)
  const nodeWidth = 220
  const nodeHeight = 92
  const horizontalGap = maxDepth === 0 ? 0 : (area.width - nodeWidth) / maxDepth
  const verticalGap = 18
  const nodesByDepth = nodes.reduce((accumulator, node) => {
    if (!accumulator[node.depth]) {
      accumulator[node.depth] = []
    }
    accumulator[node.depth].push(node)
    return accumulator
  }, {})

  const positions = {}
  Object.entries(nodesByDepth).forEach(([depthKey, depthNodes]) => {
    const depth = Number(depthKey)
    const stackHeight = depthNodes.length * nodeHeight + Math.max(0, depthNodes.length - 1) * verticalGap
    const startY = area.y + Math.max(18, (area.height - stackHeight) / 2)

    depthNodes.forEach((node, index) => {
      positions[node.id] = {
        x: area.x + depth * horizontalGap,
        y: startY + index * (nodeHeight + verticalGap),
        width: nodeWidth,
        height: nodeHeight,
      }
    })
  })

  return positions
}

function buildPathNodeIds(nodeId, parentById) {
  const ids = []
  let currentId = nodeId

  while (currentId) {
    ids.push(currentId)
    currentId = parentById[currentId] ?? null
  }

  return ids.reverse()
}

function buildMetrics(model) {
  switch (model.visitorType) {
    case 'COUNT_ELEMENTS':
      return [
        { label: 'Dossiers', value: model.folderCount },
        { label: 'Fichiers', value: model.fileCount },
        { label: 'Visites', value: model.visitedCount },
      ]
    case 'CALCULATE_VALUE':
      return [
        { label: 'Fichiers valorises', value: model.pricedFileCount },
        { label: 'Total MB', value: model.totalValueMb },
        { label: 'Visites', value: model.visitedCount },
      ]
    case 'FIND_ELEMENT':
      return [
        { label: 'Trouve', value: model.found ? 'Oui' : 'Non' },
        { label: 'Terme', value: model.searchTerm || 'n/a' },
        { label: 'Visites', value: model.visitedCount },
      ]
    default:
      return [
        { label: 'Menaces', value: model.infectedCount },
        { label: 'Matches', value: model.matchedCount },
        { label: 'Visites', value: model.visitedCount },
      ]
  }
}

function TreeNodeCard({
  node,
  position,
  isVisited,
  isCurrent,
  isMatched,
}) {
  const palette = isCurrent
    ? {
        fill: '#241f18',
        stroke: '#241f18',
        text: '#fff8ee',
        subtle: 'rgba(255,248,238,0.68)',
      }
    : isMatched
      ? {
          fill: 'rgba(245,227,210,0.96)',
          stroke: '#c25737',
          text: '#5f2d20',
          subtle: '#8b5b49',
        }
      : isVisited
        ? {
            fill: 'rgba(211,236,230,0.96)',
            stroke: '#246b5e',
            text: '#153f38',
            subtle: '#577166',
          }
        : node.kind === 'FOLDER'
          ? {
              fill: 'rgba(214,228,241,0.94)',
              stroke: '#426c8d',
              text: '#27465f',
              subtle: '#547086',
            }
          : {
              fill: 'rgba(255,250,242,0.96)',
              stroke: '#7f5c3f',
              text: '#3d2d20',
              subtle: '#6a5544',
            }

  return (
    <g transform={`translate(${position.x} ${position.y})`}>
      <rect
        width={position.width}
        height={position.height}
        rx="24"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={isCurrent ? '3' : '2'}
        className="scene-node-shadow"
      />
      <text x="16" y="24" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={palette.subtle}>
        {node.kind === 'FOLDER' ? 'FOLDER' : 'FILE'}
      </text>
      {wrapText(node.label, 18).slice(0, 2).map((line, index) => (
        <text key={`${node.id}-${index}`} x="16" y={48 + index * 18} fontSize="18" fontWeight="700" fill={palette.text}>
          {line}
        </text>
      ))}
      <text x="16" y="78" fontSize="12" fill={palette.subtle}>
        {node.kind === 'FOLDER' ? 'branche de structure' : `${node.sizeMb} MB`}
      </text>
      {node.kind === 'FILE' ? (
        <text x={position.width - 16} y="24" textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={node.infected ? '#c25737' : palette.subtle}>
          {node.infected ? 'FLAGGED' : 'CLEAN'}
        </text>
      ) : (
        <text x={position.width - 16} y="24" textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={palette.subtle}>
          DEPTH {node.depth}
        </text>
      )}
      {isCurrent ? (
        <text x={position.width - 16} y={position.height - 14} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#fff8ee">
          NOW
        </text>
      ) : null}
      {isMatched && !isCurrent ? (
        <text x={position.width - 16} y={position.height - 14} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#c25737">
          MATCH
        </text>
      ) : null}
    </g>
  )
}

export default function VisitorScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractVisitorModel(execution), [execution])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const frames = useMemo(() => buildFrames(model), [model])
  const [currentFrameIndex, setCurrentFrameIndex] = useState(Math.max(0, frames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }, [frames.length, model?.mode, model?.treePreset, model?.visitorType, model?.searchTerm])

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
  const parentById = Object.fromEntries(model.treeNodes.map((node) => [node.id, node.parentId]))
  const currentPathNodeIds = currentFrame.currentNodeId
    ? buildPathNodeIds(currentFrame.currentNodeId, parentById)
    : []
  const currentPathSet = new Set(currentPathNodeIds)
  const visitedSet = new Set(currentFrame.visitedIds)
  const matchedSet = new Set(model.matchedNodeIds)
  const highlightedMatchSet = new Set(currentFrame.matchedIds)
  const metrics = buildMetrics(model)
  const matchedNodes = model.treeNodes.filter((node) => matchedSet.has(node.id))
  const maxNodesInDepth = Math.max(
    ...Object.values(
      model.treeNodes.reduce((accumulator, node) => {
        accumulator[node.depth] = (accumulator[node.depth] ?? 0) + 1
        return accumulator
      }, {}),
    ),
    1,
  )

  const viewBoxWidth = 1440
  const metricsCard = { x: 36, y: 40, width: 1368, height: 108 }
  const treeAreaHeight = Math.max(440, maxNodesInDepth * 92 + Math.max(0, maxNodesInDepth - 1) * 18 + 40)
  const treeArea = { x: 58, y: 204, width: 804, height: treeAreaHeight }
  const sideCard = { x: 900, y: 204, width: 504, height: 644 }
  const mainSectionBottom = Math.max(treeArea.y + treeArea.height, sideCard.y + sideCard.height)
  const timelineX = 36
  const timelineY = mainSectionBottom + 32
  const timelineWidth = 1368
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.traversalSteps.length / timelineColumns))
  const timelineRowHeight = 126
  const timelineGap = 12
  const timelineHeight = 122 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `visitor-scene-${isExpanded ? 'expanded' : 'compact'}`
  const positions = buildTreeLayout(model.treeNodes, treeArea)

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

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scène SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Structure Analyzer')}
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
          <button
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            type="button"
            onClick={handleLaunchDemo}
          >
            Animer la scène
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={handlePrevious}
          >
            Étape précédente
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={handleNext}
          >
            Étape suivante
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={handleReset}
          >
            Revenir au final
          </button>
        </div>
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(211,236,230,0.84)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
          </defs>

          <rect x={metricsCard.x} y={metricsCard.y} width={metricsCard.width} height={metricsCard.height} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metricsCard.x + 28} y={metricsCard.y + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            VISITOR PASS
          </text>
          <text x={metricsCard.x + 28} y={metricsCard.y + 66} fontSize="30" fontWeight="700" fill="#241f18">
            {model.treeLabel} · {model.visitorLabel}
          </text>
          <text x={metricsCard.x + 28} y={metricsCard.y + 92} fontSize="13" fill="#5f5548">
            {model.modeLabel} · {model.treeDescription}
          </text>

          <g transform={`translate(${metricsCard.x + 840} ${metricsCard.y + 22})`}>
            {metrics.map((metric, index) => (
              <g key={metric.label} transform={`translate(${index * 166} 0)`}>
                <rect width="148" height="64" rx="22" fill="rgba(255,250,242,0.92)" stroke="rgba(36,31,24,0.08)" />
                <text x="16" y="22" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
                  {metric.label.toUpperCase()}
                </text>
                <text x="16" y="48" fontSize="24" fontWeight="700" fill="#241f18">
                  {metric.value}
                </text>
              </g>
            ))}
          </g>

          <rect x={treeArea.x - 22} y={treeArea.y - 18} width={treeArea.width + 44} height={treeArea.height + 36} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={treeArea.x} y={treeArea.y - 34} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ANALYZED TREE
          </text>
          <text x={treeArea.x} y={treeArea.y - 8} fontSize="22" fontWeight="700" fill="#241f18">
            Parcours anime de la structure
          </text>

          {model.treeNodes.map((node) => {
            if (!node.parentId) {
              return null
            }

            const source = positions[node.parentId]
            const target = positions[node.id]
            if (!source || !target) {
              return null
            }

            const isOnCurrentPath = currentPathSet.has(node.parentId) && currentPathSet.has(node.id)
            const pathData = `M ${source.x + source.width} ${source.y + source.height / 2} C ${source.x + source.width + 48} ${source.y + source.height / 2} ${target.x - 48} ${target.y + target.height / 2} ${target.x} ${target.y + target.height / 2}`

            return (
              <g key={`${node.parentId}-${node.id}`}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isOnCurrentPath ? '#246b5e' : 'rgba(127,92,63,0.28)'}
                  strokeWidth={isOnCurrentPath ? '3.2' : '2'}
                  strokeDasharray={isOnCurrentPath ? '12 8' : '0'}
                  markerEnd={`url(#${defsId}-arrow)`}
                  className={isOnCurrentPath ? 'scene-flow-line' : ''}
                />
                {isOnCurrentPath ? (
                  <circle r="5" fill="#246b5e" opacity="0.96">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path={pathData} />
                  </circle>
                ) : null}
              </g>
            )
          })}

          {model.treeNodes.map((node) => (
            <TreeNodeCard
              key={node.id}
              node={node}
              position={positions[node.id]}
              isVisited={visitedSet.has(node.id)}
              isCurrent={currentFrame.currentNodeId === node.id}
              isMatched={matchedSet.has(node.id) || highlightedMatchSet.has(node.id)}
            />
          ))}

          <rect x={sideCard.x} y={sideCard.y} width={sideCard.width} height={sideCard.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={sideCard.x + 24} y={sideCard.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ACTIVE ANALYSIS
          </text>
          <text x={sideCard.x + 24} y={sideCard.y + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.useVisitor ? 'Visitor hub' : 'Manual analyzer'}
          </text>
          <text x={sideCard.x + 24} y={sideCard.y + 86} fontSize="13" fill="#5f5548">
            {model.visitorDescription}
          </text>

          <rect x={sideCard.x + 24} y={sideCard.y + 112} width={sideCard.width - 48} height="84" rx="24" fill="rgba(211,236,230,0.94)" stroke="#246b5e" strokeWidth="2" />
          <text x={sideCard.x + 42} y={sideCard.y + 138} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#577166">
            RESULT
          </text>
          <text x={sideCard.x + 42} y={sideCard.y + 168} fontSize="24" fontWeight="700" fill="#153f38">
            {model.resultLabel}
          </text>
          {wrapText(model.resultDetail, 46).slice(0, 2).map((line, index) => (
            <text key={`visitor-result-${index}`} x={sideCard.x + 42} y={sideCard.y + 188 + index * 16} fontSize="12" fill="#215247">
              {line}
            </text>
          ))}

          <rect x={sideCard.x + 24} y={sideCard.y + 214} width={sideCard.width - 48} height="102" rx="24" fill="rgba(255,249,239,0.98)" stroke="rgba(36,31,24,0.08)" strokeWidth="2" />
          <text x={sideCard.x + 42} y={sideCard.y + 240} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
            CURRENT STEP
          </text>
          <text x={sideCard.x + 42} y={sideCard.y + 270} fontSize="20" fontWeight="700" fill="#241f18">
            {currentFrame.currentStep ? currentFrame.currentStep.nodeLabel : 'Ready'}
          </text>
          <text x={sideCard.x + 42} y={sideCard.y + 292} fontSize="12" fill="#6a5544">
            {currentFrame.currentStep ? currentFrame.currentStep.nodeKind : 'Traversal not started yet'}
          </text>
          {wrapText(currentFrame.detail, 46).slice(0, 3).map((line, index) => (
            <text key={`visitor-current-${index}`} x={sideCard.x + 42} y={sideCard.y + 316 + index * 16} fontSize="12" fill="#5f5548">
              {line}
            </text>
          ))}

          <rect x={sideCard.x + 24} y={sideCard.y + 336} width={sideCard.width - 48} height="88" rx="24" fill="rgba(214,228,241,0.94)" stroke="#426c8d" strokeWidth="2" />
          <text x={sideCard.x + 42} y={sideCard.y + 362} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#547086">
            PROGRESSION
          </text>
          <text x={sideCard.x + 42} y={sideCard.y + 390} fontSize="22" fontWeight="700" fill="#27465f">
            {Math.max(0, currentFrameIndex)} / {model.traversalSteps.length}
          </text>
          <text x={sideCard.x + 42} y={sideCard.y + 412} fontSize="12" fill="#3e5d77">
            noeuds visites durant cette lecture
          </text>

          <foreignObject x={sideCard.x + 24} y={sideCard.y + 438} width={sideCard.width - 48} height="182">
            <div className="flex h-full flex-col rounded-[22px] border border-black/8 bg-white/86 px-4 py-4" xmlns="http://www.w3.org/1999/xhtml">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Matched nodes</p>
                <p className="text-sm font-semibold text-stone-700">{matchedNodes.length}</p>
              </div>
              <div className="mt-3 flex-1 overflow-y-auto pr-1">
                {matchedNodes.length ? (
                  <div className="space-y-2">
                    {matchedNodes.map((node) => (
                      <div key={node.id} className="rounded-[16px] border border-orange-200 bg-orange-50/88 px-3 py-3">
                        <p className="text-sm font-semibold text-stone-900">{node.label}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">
                          {node.kind === 'FOLDER' ? 'folder match' : node.infected ? 'flagged file' : 'file match'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-black/10 px-3 py-4 text-sm leading-6 text-stone-600">
                    Aucun noeud mis en evidence pour cette analyse.
                  </div>
                )}
              </div>
            </div>
          </foreignObject>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            TRAVERSAL FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.traversalSteps.length} étape(s) dans l arbre
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            suis le chemin pour voir comment le visitor explore la structure noeud par noeud
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 104} width={timelineWidth - 32} height={timelineHeight - 120}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.traversalSteps.map((step) => {
                  const isCurrent = currentFrame.currentStep?.index === step.index
                  const isVisited = step.index <= currentFrameIndex
                  const isMatched = step.matched
                  return (
                    <div
                      key={`${step.index}-${step.nodeId}`}
                      className={`min-h-[118px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${
                        isCurrent
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : isMatched
                            ? 'border-orange-200 bg-orange-50/92'
                            : isVisited
                              ? 'border-emerald-200 bg-emerald-50/90'
                              : 'border-black/8 bg-white/88'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isCurrent ? 'text-white/60' : 'text-stone-500'}`}>
                          Étape {step.index}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                          isCurrent
                            ? 'text-white/72'
                            : isMatched
                              ? 'text-orange-700'
                              : isVisited
                                ? 'text-emerald-700'
                                : 'text-stone-400'
                        }`}>
                          {step.nodeKind}
                        </p>
                      </div>
                      <p className={`mt-2 text-base font-semibold ${isCurrent ? 'text-white' : 'text-stone-900'}`}>
                        {step.nodeLabel}
                      </p>
                      <p className={`mt-1 text-sm leading-6 ${isCurrent ? 'text-white/78' : 'text-stone-600'}`}>
                        {step.detail}
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
