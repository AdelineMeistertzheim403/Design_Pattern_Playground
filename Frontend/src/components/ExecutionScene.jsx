const toneMap = {
  client: {
    fill: 'rgba(231, 198, 167, 0.9)',
    stroke: '#c25737',
    text: '#5f2d20',
  },
  factory: {
    fill: 'rgba(211, 236, 230, 0.92)',
    stroke: '#246b5e',
    text: '#153f38',
  },
  product: {
    fill: 'rgba(255, 249, 239, 0.98)',
    stroke: '#79553b',
    text: '#3d2d20',
  },
  context: {
    fill: 'rgba(211, 236, 230, 0.92)',
    stroke: '#246b5e',
    text: '#153f38',
  },
  strategy: {
    fill: 'rgba(255, 249, 239, 0.98)',
    stroke: '#7f5c3f',
    text: '#3d2d20',
  },
  output: {
    fill: 'rgba(194, 87, 55, 0.12)',
    stroke: '#c25737',
    text: '#5f2d20',
  },
  subject: {
    fill: 'rgba(211, 236, 230, 0.94)',
    stroke: '#246b5e',
    text: '#153f38',
  },
  event: {
    fill: 'rgba(255, 249, 239, 0.98)',
    stroke: '#7f5c3f',
    text: '#3d2d20',
  },
  observer: {
    fill: 'rgba(231, 198, 167, 0.84)',
    stroke: '#c25737',
    text: '#5f2d20',
  },
}

function getTone(node) {
  const isActive = node.data?.active || node.data?.selected

  if (isActive) {
    return {
      fill: '#241f18',
      stroke: '#241f18',
      text: '#fffaf2',
      subtle: 'rgba(255, 250, 242, 0.68)',
    }
  }

  const tone = toneMap[node.type] ?? toneMap.product
  return {
    ...tone,
    subtle: 'rgba(36, 31, 24, 0.56)',
  }
}

function wrapText(text, maxLength = 24) {
  if (!text) {
    return []
  }

  const words = `${text}`.split(/\s+/).filter(Boolean)
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (candidate.length <= maxLength) {
      currentLine = candidate
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function getNodeCaption(node) {
  return node.data?.message ?? node.data?.detail ?? null
}

function getDefaultNodeSize(node) {
  if (node.type === 'event') {
    return { width: 190, height: 96 }
  }

  if (node.type === 'strategy' || node.type === 'observer') {
    return { width: 180, height: 86 }
  }

  return { width: 190, height: 86 }
}

function buildFactoryLayout(nodes) {
  const layout = {
    viewBox: '0 0 860 340',
    positions: {},
  }

  nodes.forEach((node) => {
    const size = getDefaultNodeSize(node)
    if (node.id === 'client') {
      layout.positions[node.id] = { x: 58, y: 126, ...size }
    } else if (node.id === 'factory') {
      layout.positions[node.id] = { x: 334, y: 126, ...size }
    } else if (node.id === 'product') {
      layout.positions[node.id] = { x: 610, y: 126, ...size }
    }
  })

  return layout
}

function buildStrategyLayout(nodes) {
  const layout = {
    viewBox: '0 0 940 430',
    positions: {},
  }

  const strategies = nodes.filter((node) => node.type === 'strategy')
  const baseY = 70
  const gap = 110

  nodes.forEach((node) => {
    const size = getDefaultNodeSize(node)
    if (node.id === 'context') {
      layout.positions[node.id] = { x: 64, y: 162, ...size }
    } else if (node.id === 'result') {
      layout.positions[node.id] = { x: 676, y: 162, width: 200, height: 96 }
    }
  })

  strategies.forEach((node, index) => {
    layout.positions[node.id] = {
      x: 362,
      y: baseY + index * gap,
      ...getDefaultNodeSize(node),
    }
  })

  return layout
}

function buildObserverLayout(nodes) {
  const layout = {
    viewBox: '0 0 960 420',
    positions: {},
  }

  const observers = nodes.filter((node) => node.type === 'observer')
  const singleY = 166
  const startY = 64
  const gap = observers.length > 1 ? 248 / (observers.length - 1) : 0

  nodes.forEach((node) => {
    if (node.id === 'subject') {
      layout.positions[node.id] = { x: 56, y: 156, width: 196, height: 92 }
    } else if (node.id === 'event') {
      layout.positions[node.id] = { x: 364, y: 146, width: 204, height: 108 }
    }
  })

  observers.forEach((node, index) => {
    layout.positions[node.id] = {
      x: 688,
      y: observers.length === 1 ? singleY : startY + index * gap,
      width: 188,
      height: 88,
    }
  })

  return layout
}

function buildFallbackLayout(nodes) {
  const layout = {
    viewBox: '0 0 880 420',
    positions: {},
  }

  nodes.forEach((node, index) => {
    const column = index % 3
    const row = Math.floor(index / 3)
    layout.positions[node.id] = {
      x: 56 + column * 258,
      y: 56 + row * 144,
      ...getDefaultNodeSize(node),
    }
  })

  return layout
}

function buildLayout(patternCode, visualization) {
  const nodes = visualization?.nodes ?? []

  if (patternCode === 'factory') {
    return buildFactoryLayout(nodes)
  }

  if (patternCode === 'strategy') {
    return buildStrategyLayout(nodes)
  }

  if (patternCode === 'observer') {
    return buildObserverLayout(nodes)
  }

  return buildFallbackLayout(nodes)
}

function getAnchor(position, side) {
  if (side === 'left') {
    return { x: position.x, y: position.y + position.height / 2 }
  }

  if (side === 'top') {
    return { x: position.x + position.width / 2, y: position.y }
  }

  if (side === 'bottom') {
    return { x: position.x + position.width / 2, y: position.y + position.height }
  }

  return { x: position.x + position.width, y: position.y + position.height / 2 }
}

function getPathData(patternCode, edge, positions) {
  const source = positions[edge.from]
  const target = positions[edge.to]

  if (!source || !target) {
    return null
  }

  const startSide = source.x <= target.x ? 'right' : 'left'
  const endSide = source.x <= target.x ? 'left' : 'right'
  const start = getAnchor(source, startSide)
  const end = getAnchor(target, endSide)

  if (patternCode === 'observer' && edge.label === 'notify') {
    const curve = (end.x - start.x) * 0.42
    return `M ${start.x} ${start.y} C ${start.x + curve} ${start.y} ${end.x - curve} ${end.y} ${end.x} ${end.y}`
  }

  if (patternCode === 'strategy' && edge.from === 'context') {
    const curve = (end.x - start.x) * 0.34
    return `M ${start.x} ${start.y} C ${start.x + curve} ${start.y} ${end.x - curve} ${end.y} ${end.x} ${end.y}`
  }

  const curve = (end.x - start.x) * 0.34
  return `M ${start.x} ${start.y} C ${start.x + curve} ${start.y} ${end.x - curve} ${end.y} ${end.x} ${end.y}`
}

function getEdgeLabelPosition(source, target) {
  return {
    x: (source.x + source.width / 2 + target.x + target.width / 2) / 2,
    y: (source.y + source.height / 2 + target.y + target.height / 2) / 2 - 10,
  }
}

export default function ExecutionScene({
  execution,
  patternCode,
  sourceLabel,
}) {
  const visualization = execution?.visualization

  if (!visualization?.nodes?.length) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  const layout = buildLayout(patternCode, visualization)
  const positions = layout.positions
  const defsId = `scene-${patternCode}`

  return (
    <div className="rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <h3 className="mt-2 text-2xl text-stone-950">Demo visuelle</h3>
        </div>
        <span className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
          {sourceLabel}
        </span>
      </div>

      <svg className="mt-4 h-auto w-full" viewBox={layout.viewBox} role="img">
        <defs>
          <marker
            id={`${defsId}-arrow`}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
          </marker>
          <radialGradient id={`${defsId}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(36,107,94,0.18)" />
            <stop offset="100%" stopColor="rgba(36,107,94,0)" />
          </radialGradient>
        </defs>

        <circle cx="150" cy="72" r="96" fill={`url(#${defsId}-halo)`} />
        <circle cx="810" cy="356" r="108" fill="rgba(194,87,55,0.08)" />

        {(visualization.edges ?? []).map((edge, index) => {
          const source = positions[edge.from]
          const target = positions[edge.to]
          const pathData = getPathData(patternCode, edge, positions)

          if (!source || !target || !pathData) {
            return null
          }

          const labelPosition = getEdgeLabelPosition(source, target)
          const animated = ['notify', 'publish', 'execute', 'create'].includes(edge.label)

          return (
            <g key={`${edge.from}-${edge.to}-${index}`}>
              <path
                d={pathData}
                fill="none"
                stroke={animated ? '#246b5e' : '#8b6b4e'}
                strokeDasharray={animated ? '10 8' : '0'}
                strokeWidth="2.6"
                markerEnd={`url(#${defsId}-arrow)`}
                className={animated ? 'scene-flow-line' : ''}
              />

              {animated ? (
                <circle r="5" fill="#c25737" opacity="0.9">
                  <animateMotion
                    dur="2.4s"
                    repeatCount="indefinite"
                    path={pathData}
                    begin={`${index * 0.16}s`}
                  />
                </circle>
              ) : null}

              <rect
                x={labelPosition.x - 34}
                y={labelPosition.y - 12}
                width="68"
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
                {edge.label.toUpperCase()}
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
          const titleLines = wrapText(node.label, 18).slice(0, 2)
          const subtitleLines = wrapText(getNodeCaption(node), 22).slice(0, 2)

          return (
            <g key={node.id} transform={`translate(${position.x} ${position.y})`}>
              <rect
                width={position.width}
                height={position.height}
                rx="24"
                fill={tone.fill}
                stroke={tone.stroke}
                strokeWidth="2.5"
                className="scene-node-shadow"
              />
              <text
                x="22"
                y="24"
                fontSize="10"
                fontWeight="700"
                letterSpacing="0.2em"
                fill={tone.subtle}
              >
                {node.type.toUpperCase()}
              </text>
              {titleLines.map((line, index) => (
                <text
                  key={`${node.id}-title-${index}`}
                  x="22"
                  y={50 + index * 18}
                  fontSize="18"
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
                  y={position.height - 16 - (subtitleLines.length - index - 1) * 14}
                  fontSize="11"
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
    </div>
  )
}
