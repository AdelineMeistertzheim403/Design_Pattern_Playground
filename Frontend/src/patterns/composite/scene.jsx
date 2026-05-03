import { createElement, useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function extractCompositeModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.treeNodes) || !Array.isArray(output.steps)) {
    return null
  }

  const treeNodes = output.treeNodes.map((node) => ({
    id: `${node.id ?? ''}`.trim(),
    parentId: node.parentId ? `${node.parentId}`.trim() : null,
    label: `${node.label ?? ''}`.trim(),
    kind: `${node.kind ?? 'FILE'}`.trim().toUpperCase(),
    depth: safeNumber(node.depth, 0),
    sizeMb: safeNumber(node.sizeMb, 0),
    processed: Boolean(node.processed),
  }))

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    stageCode: `${step.stageCode ?? `STEP_${index + 1}`}`.trim().toUpperCase(),
    title: `${step.title ?? 'Etape'}`.trim(),
    actorLabel: `${step.actorLabel ?? ''}`.trim(),
    status: `${step.status ?? 'READY'}`.trim().toUpperCase(),
    detail: `${step.detail ?? ''}`.trim(),
  }))

  return {
    modeLabel: `${output.modeLabel ?? 'Avec Composite'}`.trim(),
    useComposite: Boolean(output.uniformTraversal),
    rootName: `${output.rootName ?? 'workspace'}`.trim(),
    blueprintLabel: `${output.blueprintLabel ?? 'Game Assets'}`.trim(),
    blueprintDescription: `${output.blueprintDescription ?? ''}`.trim(),
    operationLabel: `${output.operationLabel ?? 'Scan tree'}`.trim(),
    operationResultLabel: `${output.operationResultLabel ?? ''}`.trim(),
    compositeBenefit: `${output.compositeBenefit ?? ''}`.trim(),
    manualGapDetail: `${output.manualGapDetail ?? ''}`.trim(),
    nodeCount: safeNumber(output.nodeCount, treeNodes.length),
    containerCount: safeNumber(output.containerCount, 0),
    fileCount: safeNumber(output.fileCount, 0),
    processedCount: safeNumber(output.processedCount, 0),
    missedCount: safeNumber(output.missedCount, 0),
    processedLeafCount: safeNumber(output.processedLeafCount, 0),
    totalSizeMb: safeNumber(output.totalSizeMb, 0),
    processedSizeMb: safeNumber(output.processedSizeMb, 0),
    maxDepth: safeNumber(output.maxDepth, 0),
    treeNodes,
    steps,
  }
}

function buildTreeLayout(graph, nodesByDepth, maxDepth) {
  const cardWidth = 184
  const cardHeight = 86
  const rowGap = 18
  const topPadding = 66
  const bottomPadding = 124
  const availableHeight = Math.max(
    260,
    Math.max(...Object.values(nodesByDepth).map((nodes) => nodes.length), 1) * (cardHeight + rowGap),
  )
  const treeHeight = availableHeight
  const graphHeight = topPadding + treeHeight + bottomPadding
  const leftInset = graph.x + 42
  const usableWidth = graph.width - cardWidth - 84
  const depthGap = maxDepth > 0 ? usableWidth / maxDepth : 0
  const positions = {}

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const columnNodes = nodesByDepth[depth] ?? []
    const totalColumnHeight = columnNodes.length * cardHeight + Math.max(0, columnNodes.length - 1) * rowGap
    const startY = graph.y + topPadding + Math.max(0, (treeHeight - totalColumnHeight) / 2)
    const x = leftInset + depth * depthGap

    columnNodes.forEach((node, index) => {
      positions[node.id] = {
        x,
        y: startY + index * (cardHeight + rowGap),
        width: cardWidth,
        height: cardHeight,
      }
    })
  }

  return { positions, graphHeight }
}

function TreeNodeCard({ node, position }) {
  const palette = node.kind === 'ROOT'
    ? {
        fill: node.processed ? '#241f18' : 'rgba(214,228,241,0.9)',
        stroke: node.processed ? '#241f18' : '#426c8d',
        title: node.processed ? '#fff8ee' : '#27465f',
        subtle: node.processed ? 'rgba(255,248,238,0.68)' : '#607488',
        badge: node.processed ? '#246b5e' : '#426c8d',
      }
    : node.kind === 'FOLDER'
      ? {
          fill: node.processed ? 'rgba(214,228,241,0.94)' : 'rgba(245,227,210,0.96)',
          stroke: node.processed ? '#426c8d' : '#c25737',
          title: node.processed ? '#27465f' : '#5f2d20',
          subtle: node.processed ? '#547086' : '#8b5b49',
          badge: node.processed ? '#426c8d' : '#c25737',
        }
      : {
          fill: node.processed ? 'rgba(211,236,230,0.94)' : 'rgba(255,244,220,0.96)',
          stroke: node.processed ? '#246b5e' : '#d48a2d',
          title: node.processed ? '#153f38' : '#6f4e17',
          subtle: node.processed ? '#577166' : '#8a6124',
          badge: node.processed ? '#246b5e' : '#d48a2d',
        }

  const titleLines = wrapText(node.label, node.kind === 'FILE' ? 16 : 14).slice(0, 3)

  return (
    <g>
      <rect x={position.x} y={position.y} width={position.width} height={position.height} rx="24" fill={palette.fill} stroke={palette.stroke} strokeWidth="2" className="scene-node-shadow" />
      <text x={position.x + 16} y={position.y + 22} fontSize="10" fontWeight="700" letterSpacing="0.16em" fill={palette.subtle}>
        {node.kind}
      </text>
      <text x={position.x + position.width - 16} y={position.y + 22} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.16em" fill={palette.badge}>
        {node.processed ? 'READY' : 'MISSED'}
      </text>
      {titleLines.map((line, index) => (
        <text
          key={`${node.id}-${line}-${index}`}
          x={position.x + 16}
          y={position.y + 48 + index * 16}
          fontSize={node.kind === 'ROOT' ? 20 : 16}
          fontWeight="700"
          fill={palette.title}
        >
          {line}
        </text>
      ))}
      <text x={position.x + 16} y={position.y + position.height - 14} fontSize="11" fill={palette.subtle}>
        {node.kind === 'FILE' ? `${node.sizeMb} MB` : `depth ${node.depth}`}
      </text>
    </g>
  )
}

export default function CompositeScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractCompositeModel(execution), [execution])

  const playback = useScenePlayback(
    useMemo(() => buildPlaybackFrames(model?.steps ?? [], 'Tree ready'), [model]),
    900,
  )

  if (!model) {
    return <EmptyScenePlaceholder />
  }
  const visibleStepCount = playback.currentFrame.visibleStepCount
  const currentStepIndex = playback.currentFrame.currentStepIndex

  const nodesByDepth = Object.groupBy(model.treeNodes, (node) => node.depth)
  const maxDepth = Math.max(...model.treeNodes.map((node) => node.depth), 0)
  const viewBoxWidth = 1220
  const metrics = { x: 36, y: 40, width: 1148, height: 104 }
  const graphBase = { x: 36, y: 168, width: 1148, height: 0 }
  const { positions, graphHeight } = buildTreeLayout(graphBase, nodesByDepth, maxDepth)
  const graph = { ...graphBase, height: graphHeight }
  const resultStrip = { x: graph.x + 24, y: graph.y + graph.height - 86, width: graph.width - 48, height: 62 }
  const timelineX = 36
  const timelineY = graph.y + graph.height + 26
  const timelineWidth = 1148
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 132
  const timelineGap = 12
  const timelineHeight = 118 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 38
  const defsId = `composite-scene-${isExpanded ? 'expanded' : 'compact'}`
  const summaryLabel = model.missedCount === 0
    ? `${model.processedCount} / ${model.nodeCount} noeuds parcours`
    : `${model.missedCount} noeud(s) hors parcours`

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Tree Builder')}
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ScenePlaybackControls playback={playback} />

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(214,228,241,0.82)" />
            </linearGradient>
            <marker id={`${defsId}-success-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-danger-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect x={metrics.x} y={metrics.y} width={metrics.width} height={metrics.height} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metrics.x + 28} y={metrics.y + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            COMPOSITE TREE
          </text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.blueprintLabel}
          </text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.modeLabel} · {model.operationLabel} · root {model.rootName}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 58} textAnchor="end" fontSize="24" fontWeight="700" fill={model.missedCount === 0 ? '#153f38' : '#c25737'}>
            {model.operationResultLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.processedSizeMb} / {model.totalSizeMb} MB
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            LIVE TREE
          </text>
          <text x={graph.x + 24} y={graph.y + 56} fontSize="13" fill="#5f5548">
            {model.blueprintDescription}
          </text>

          {model.treeNodes.filter((node) => node.parentId).map((node) => {
            const source = positions[node.parentId]
            const target = positions[node.id]

            if (!source || !target) {
              return null
            }

            const startX = source.x + source.width
            const startY = source.y + source.height / 2
            const endX = target.x
            const endY = target.y + target.height / 2
            const path = `M ${startX} ${startY} C ${startX + 54} ${startY} ${endX - 54} ${endY} ${endX} ${endY}`
            const ok = node.processed

            return (
              <g key={`${node.parentId}-${node.id}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={ok ? '#246b5e' : '#c25737'}
                  strokeWidth="2.8"
                  strokeDasharray="10 8"
                  markerEnd={`url(#${defsId}-${ok ? 'success' : 'danger'}-arrow)`}
                  className="scene-flow-line"
                />
                <circle r="4.5" fill={ok ? '#246b5e' : '#c25737'} opacity="0.96">
                  <animateMotion dur="2s" repeatCount="indefinite" path={path} />
                </circle>
              </g>
            )
          })}

          {model.treeNodes.map((node) => {
            const position = positions[node.id]
            if (!position) {
              return null
            }

            return <TreeNodeCard key={node.id} node={node} position={position} />
          })}

          <rect x={resultStrip.x} y={resultStrip.y} width={resultStrip.width} height={resultStrip.height} rx="24" fill={model.missedCount === 0 ? 'rgba(214,228,241,0.94)' : 'rgba(245,227,210,0.96)'} stroke={model.missedCount === 0 ? '#426c8d' : '#c25737'} strokeWidth="2" />
          <text x={resultStrip.x + 18} y={resultStrip.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.missedCount === 0 ? '#547086' : '#8b5b49'}>
            AGGREGATE RESULT
          </text>
          <text x={resultStrip.x + 18} y={resultStrip.y + 48} fontSize="14" fontWeight="700" fill={model.missedCount === 0 ? '#27465f' : '#5f2d20'}>
            {summaryLabel}
          </text>
          <text x={resultStrip.x + resultStrip.width - 18} y={resultStrip.y + 48} textAnchor="end" fontSize="12" fill={model.missedCount === 0 ? '#3e5d77' : '#7a4634'}>
            {model.useComposite ? model.compositeBenefit : model.manualGapDetail}
          </text>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            EXECUTION FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.steps.length} etape(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            compare la recursion uniforme au fan-out manuel du client
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.steps.map((step, index) => (
                  <div
                    key={`${step.index}-${step.stageCode}`}
                    className={`min-h-[118px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] transition ${
                      step.status === 'MISSED' || step.status === 'PARTIAL'
                        ? 'border-orange-200 bg-orange-50/92'
                        : step.stageCode === 'COMPONENT_CALL'
                          ? 'border-sky-200 bg-sky-50/92'
                          : 'border-emerald-200 bg-emerald-50/90'
                    } ${index > currentStepIndex ? 'opacity-30' : ''} ${index === currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                    style={{ visibility: index < visibleStepCount || index === currentStepIndex ? 'visible' : 'hidden' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Step {step.index}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        step.status === 'MISSED' || step.status === 'PARTIAL'
                          ? 'text-orange-900'
                          : step.stageCode === 'COMPONENT_CALL'
                            ? 'text-sky-800'
                            : 'text-emerald-800'
                      }`}>
                        {step.status}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-stone-900">{step.title}</p>
                    <p className="mt-1 text-[12px] text-stone-700">{step.actorLabel}</p>
                    <p className="mt-2 text-[12px] leading-5 text-stone-600">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </foreignObject>
        </svg>
      </ZoomableViewport>
    </div>
  )
}
