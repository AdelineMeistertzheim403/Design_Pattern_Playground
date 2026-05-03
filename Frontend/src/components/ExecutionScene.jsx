import { useEffect, useState } from 'react'
import ZoomableViewport from './ZoomableViewport'

import { hasSpecializedPatternScene } from '../patterns/catalog'
import { loadPatternSceneComponent } from '../patterns/loaders'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  buildLayout,
  estimateTextWidth,
  getEdgeLabelPosition,
  getFittedFontSize,
  getNodeTextLayout,
  getPathData,
  getTone,
} from '../patterns/shared/sceneShared'

function SceneLoadingPlaceholder({ panelClassName }) {
  return (
    <div className={panelClassName}>
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-black/10 bg-white/70 px-6 py-10 text-sm leading-7 text-stone-600">
        Chargement de la scene specialisee...
      </div>
    </div>
  )
}

export default function ExecutionScene({
  execution,
  patternCode,
  sourceLabel,
  isExpanded = false,
  onOpenModal,
  forceGeneric = false,
  highlightNodeIds = [],
  highlightEdgeKeys = [],
  highlightEdgeKinds = {},
}) {
  const visualization = execution?.visualization
  const shouldLoadPatternScene = Boolean(visualization?.nodes?.length) && hasSpecializedPatternScene(patternCode) && !forceGeneric
  const highlightedNodeSet = new Set(highlightNodeIds)
  const highlightedEdgeSet = new Set(highlightEdgeKeys)
  const [sceneModuleState, setSceneModuleState] = useState({
    status: 'idle',
    component: null,
  })

  function buildEdgeKey(edge) {
    return `${edge.from}::${edge.to}::${edge.label ?? ''}`
  }

  useEffect(() => {
    let ignore = false

    if (!shouldLoadPatternScene) {
      setSceneModuleState({
        status: 'ready',
        component: null,
      })
      return () => {
        ignore = true
      }
    }

    setSceneModuleState({
      status: 'loading',
      component: null,
    })

    const loadScene = async () => {
      try {
        const component = await loadPatternSceneComponent(patternCode)
        if (!ignore) {
          setSceneModuleState({
            status: 'ready',
            component,
          })
        }
      } catch {
        if (!ignore) {
          setSceneModuleState({
            status: 'error',
            component: null,
          })
        }
      }
    }

    loadScene()

    return () => {
      ignore = true
    }
  }, [patternCode, shouldLoadPatternScene])

  if (!visualization?.nodes?.length) {
    return <EmptyScenePlaceholder />
  }

  const panelClassName = isExpanded
    ? 'rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.94))] p-6 shadow-[0_30px_90px_rgba(24,20,14,0.16)] lg:p-8'
    : 'rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
  const svgClassName = isExpanded
    ? 'h-auto min-h-[420px] w-full'
    : 'h-auto w-full'
  const TitleTag = isExpanded ? 'h2' : 'h3'
  const SceneComponent = sceneModuleState.component

  if (shouldLoadPatternScene && sceneModuleState.status === 'loading' && !SceneComponent) {
    return <SceneLoadingPlaceholder panelClassName={panelClassName} />
  }

  if (SceneComponent && execution?.output) {
    return (
      <SceneComponent
        execution={execution}
        isExpanded={isExpanded}
        panelClassName={panelClassName}
        svgClassName={svgClassName}
        TitleTag={TitleTag}
        sourceLabel={sourceLabel}
        onOpenModal={onOpenModal}
      />
    )
  }

  const layout = buildLayout(patternCode, visualization)
  const positions = layout.positions
  const defsId = `scene-${patternCode}`

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Demo visuelle
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={layout.viewBox} role="img">
          <defs>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
            </marker>
            <radialGradient id={`${defsId}-halo`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(36,107,94,0.18)" />
              <stop offset="100%" stopColor="rgba(36,107,94,0)" />
            </radialGradient>
          </defs>

          <circle
            cx={Math.round(layout.width * 0.18)}
            cy={Math.round(layout.height * 0.22)}
            r={Math.max(84, Math.min(112, layout.width * 0.11))}
            fill={`url(#${defsId}-halo)`}
          />
          <circle
            cx={Math.round(layout.width * 0.86)}
            cy={Math.round(layout.height * 0.82)}
            r={Math.max(92, Math.min(128, layout.width * 0.12))}
            fill="rgba(194,87,55,0.08)"
          />

          {(visualization.edges ?? []).map((edge, index) => {
            const source = positions[edge.from]
            const target = positions[edge.to]
            const pathData = getPathData(patternCode, edge, positions)

            if (!source || !target || !pathData) {
              return null
            }

            const labelPosition = getEdgeLabelPosition(source, target)
            const animated = ['notify', 'publish', 'execute', 'create'].includes(edge.label)
            const edgeKey = buildEdgeKey(edge)
            const isEdgeHighlighted = highlightedEdgeSet.has(edgeKey)
            const edgeKind = highlightEdgeKinds[edgeKey] ?? null
            const edgeLabel = `${edge.label ?? 'link'}`.toUpperCase()
            const edgeLabelWidth = Math.max(72, Math.ceil(estimateTextWidth(edgeLabel, 11) + 28))
            const edgeClassName = [
              animated ? 'scene-flow-line' : null,
              isEdgeHighlighted ? 'scene-edge-highlight' : null,
              isEdgeHighlighted && edgeKind === 'added' ? 'scene-edge-highlight-added' : null,
              isEdgeHighlighted && edgeKind === 'modified' ? 'scene-edge-highlight-modified' : null,
            ].filter(Boolean).join(' ')

            return (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={animated ? '#246b5e' : '#8b6b4e'}
                  strokeDasharray={animated ? '10 8' : '0'}
                  strokeWidth={isEdgeHighlighted ? '3.2' : '2.6'}
                  markerEnd={`url(#${defsId}-arrow)`}
                  className={edgeClassName}
                />

                {animated ? (
                  <circle r="5" fill="#c25737" opacity="0.9">
                    <animateMotion dur="2.4s" repeatCount="indefinite" path={pathData} begin={`${index * 0.16}s`} />
                  </circle>
                ) : null}

                <rect
                  x={labelPosition.x - edgeLabelWidth / 2}
                  y={labelPosition.y - 12}
                  width={edgeLabelWidth}
                  height="24"
                  rx="12"
                  fill="rgba(255,250,242,0.94)"
                  stroke="rgba(36,31,24,0.08)"
                />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  letterSpacing="0.18em"
                  fill="#6a5544"
                >
                  {edgeLabel}
                </text>
              </g>
            )
          })}

          {(visualization.nodes ?? []).map((node) => {
            const position = positions[node.id]
            if (!position) {
              return null
            }

            const tone = getTone(node)
            const isHighlighted = highlightedNodeSet.has(node.id)
            const { titleLines, subtitleLines } = getNodeTextLayout(node)
            const titleFontSize = getFittedFontSize(titleLines, 18, 15, position.width - 44)
            const subtitleFontSize = getFittedFontSize(subtitleLines, 11, 10, position.width - 44)
            const titleLineHeight = titleFontSize + 4
            const subtitleLineHeight = subtitleFontSize + 3

            return (
              <g key={node.id} transform={`translate(${position.x} ${position.y})`}>
                <rect
                  width={position.width}
                  height={position.height}
                  rx="24"
                  fill={tone.fill}
                  stroke={tone.stroke}
                  strokeWidth={isHighlighted ? '3.2' : '2.5'}
                  className={isHighlighted ? 'scene-node-shadow scene-node-highlight' : 'scene-node-shadow'}
                />
                <text x="22" y="24" fontSize="10" fontWeight="700" letterSpacing="0.2em" fill={tone.subtle}>
                  {node.type.toUpperCase()}
                </text>
                {titleLines.map((line, index) => (
                  <text
                    key={`${node.id}-title-${index}`}
                    x="22"
                    y={50 + index * titleLineHeight}
                    fontSize={titleFontSize}
                    fontWeight="700"
                    fill={tone.text}
                  >
                    {line}
                  </text>
                ))}
                {subtitleLines.map((line, index) => (
                  <text
                    key={`${node.id}-subtitle-${index}`}
                    x="22"
                    y={position.height - 16 - (subtitleLines.length - index - 1) * subtitleLineHeight}
                    fontSize={subtitleFontSize}
                    fontWeight="500"
                    fill={tone.subtle}
                  >
                    {line}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </ZoomableViewport>
    </div>
  )
}
