import ZoomableViewport from './ZoomableViewport'

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

const NO_SPACE_BEFORE_TOKENS = new Set([',', '.', ';', ':', ')', ']', '}', '>', '<', '(', '[', '{'])
const NO_SPACE_AFTER_CHARACTERS = new Set(['<', '(', '[', '{'])

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

function splitLongToken(token, maxChunkLength = 12) {
  if (!token || token.length <= maxChunkLength) {
    return [token]
  }

  const parts = []
  let cursor = 0

  while (cursor < token.length) {
    parts.push(token.slice(cursor, cursor + maxChunkLength))
    cursor += maxChunkLength
  }

  return parts
}

function tokenizeForWrap(text) {
  return `${text ?? ''}`
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([<>(){}\[\],.:;])/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .flatMap((token) => (
      /^[<>(){}\[\],.:;]$/.test(token)
        ? [token]
        : splitLongToken(token)
    ))
}

function appendToken(line, token) {
  if (!line) {
    return token
  }

  const lastCharacter = line[line.length - 1]

  if (NO_SPACE_BEFORE_TOKENS.has(token) || NO_SPACE_AFTER_CHARACTERS.has(lastCharacter)) {
    return `${line}${token}`
  }

  return `${line} ${token}`
}

function wrapText(text, maxLength = 24) {
  if (!text) {
    return []
  }

  const words = tokenizeForWrap(text)
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const candidate = appendToken(currentLine, word)
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

function estimateTextWidth(text, fontSize) {
  return `${text ?? ''}`.length * fontSize * 0.58
}

function getFittedFontSize(lines, baseFontSize, minimumFontSize, availableWidth) {
  if (!lines?.length || availableWidth <= 0) {
    return baseFontSize
  }

  const widestLine = Math.max(...lines.map((line) => estimateTextWidth(line, baseFontSize)))
  if (widestLine <= availableWidth) {
    return baseFontSize
  }

  const scaledFontSize = Math.floor(baseFontSize * (availableWidth / widestLine))
  return Math.max(minimumFontSize, Math.min(baseFontSize, scaledFontSize))
}

function getNodeCaption(node) {
  return node.data?.message ?? node.data?.detail ?? null
}

function getNodeTextLayout(node) {
  const titleMaxLength = node.type === 'event' || node.type === 'output' ? 24 : 18
  const subtitleMaxLength = node.type === 'event' || node.type === 'output' ? 28 : 22

  return {
    titleLines: wrapText(node.label, titleMaxLength),
    subtitleLines: wrapText(getNodeCaption(node), subtitleMaxLength),
  }
}

function getNodeSize(node) {
  const { titleLines, subtitleLines } = getNodeTextLayout(node)
  const minimumWidth = node.type === 'event' || node.type === 'output'
    ? 220
    : node.type === 'strategy' || node.type === 'observer'
      ? 190
      : 180
  const minimumHeight = node.type === 'event' ? 108 : node.type === 'output' ? 96 : 86
  const contentWidth = Math.max(
    estimateTextWidth(node.type.toUpperCase(), 10),
    ...titleLines.map((line) => estimateTextWidth(line, 18)),
    ...subtitleLines.map((line) => estimateTextWidth(line, 11)),
  )
  const width = Math.max(minimumWidth, Math.ceil(contentWidth + 46))
  const titleHeight = Math.max(titleLines.length, 1) * 18
  const subtitleHeight = subtitleLines.length ? 18 + subtitleLines.length * 14 : 0

  return {
    width,
    height: Math.max(minimumHeight, 56 + titleHeight + subtitleHeight),
  }
}

function buildSizeMap(nodes) {
  return Object.fromEntries(nodes.map((node) => [node.id, getNodeSize(node)]))
}

function createLayout(width, height, positions) {
  return {
    width,
    height,
    positions,
    viewBox: `0 0 ${width} ${height}`,
  }
}

function buildFactoryLayout(nodes) {
  const orderedNodes = ['client', 'factory', 'product']
    .map((id) => nodes.find((node) => node.id === id))
    .filter(Boolean)

  if (orderedNodes.length === 0) {
    return createLayout(880, 360, {})
  }

  const marginX = 56
  const marginY = 56
  const gap = 96
  const sizes = buildSizeMap(orderedNodes)
  const maxHeight = Math.max(...orderedNodes.map((node) => sizes[node.id].height))
  const positions = {}
  let cursorX = marginX

  orderedNodes.forEach((node) => {
    const size = sizes[node.id]
    positions[node.id] = {
      x: cursorX,
      y: marginY + (maxHeight - size.height) / 2,
      ...size,
    }
    cursorX += size.width + gap
  })

  const width = cursorX - gap + marginX
  const height = maxHeight + marginY * 2

  return createLayout(width, height, positions)
}

function buildStrategyLayout(nodes) {
  const context = nodes.find((node) => node.id === 'context')
  const result = nodes.find((node) => node.id === 'result')
  const strategies = nodes.filter((node) => node.type === 'strategy')

  if (!context || !result || strategies.length === 0) {
    return buildFallbackLayout(nodes)
  }

  const sizes = buildSizeMap(nodes)
  const marginX = 56
  const marginY = 56
  const columnGap = 92
  const rowGap = 34
  const leftWidth = sizes[context.id].width
  const middleWidth = Math.max(...strategies.map((node) => sizes[node.id].width))
  const rightWidth = sizes[result.id].width
  const strategiesHeight = strategies.reduce((total, node, index) => (
    total + sizes[node.id].height + (index > 0 ? rowGap : 0)
  ), 0)
  const contentHeight = Math.max(
    sizes[context.id].height,
    sizes[result.id].height,
    strategiesHeight,
  )
  const positions = {}
  const strategyColumnX = marginX + leftWidth + columnGap
  const resultX = strategyColumnX + middleWidth + columnGap

  positions[context.id] = {
    x: marginX,
    y: marginY + (contentHeight - sizes[context.id].height) / 2,
    ...sizes[context.id],
  }
  positions[result.id] = {
    x: resultX,
    y: marginY + (contentHeight - sizes[result.id].height) / 2,
    ...sizes[result.id],
  }

  let cursorY = marginY + (contentHeight - strategiesHeight) / 2
  strategies.forEach((node) => {
    positions[node.id] = {
      x: strategyColumnX + (middleWidth - sizes[node.id].width) / 2,
      y: cursorY,
      ...sizes[node.id],
    }
    cursorY += sizes[node.id].height + rowGap
  })

  const width = resultX + rightWidth + marginX
  const height = contentHeight + marginY * 2

  return createLayout(width, height, positions)
}

function buildObserverLayout(nodes) {
  const subject = nodes.find((node) => node.id === 'subject')
  const event = nodes.find((node) => node.id === 'event')
  const observers = nodes.filter((node) => node.type === 'observer')

  if (!subject || !event || observers.length === 0) {
    return buildFallbackLayout(nodes)
  }

  const sizes = buildSizeMap(nodes)
  const marginX = 56
  const marginY = 56
  const columnGap = 94
  const rowGap = 34
  const leftWidth = sizes[subject.id].width
  const middleWidth = sizes[event.id].width
  const rightWidth = Math.max(...observers.map((node) => sizes[node.id].width))
  const observersHeight = observers.reduce((total, node, index) => (
    total + sizes[node.id].height + (index > 0 ? rowGap : 0)
  ), 0)
  const contentHeight = Math.max(
    sizes[subject.id].height,
    sizes[event.id].height,
    observersHeight,
  )
  const positions = {}
  const eventX = marginX + leftWidth + columnGap
  const observerColumnX = eventX + middleWidth + columnGap

  positions[subject.id] = {
    x: marginX,
    y: marginY + (contentHeight - sizes[subject.id].height) / 2,
    ...sizes[subject.id],
  }
  positions[event.id] = {
    x: eventX,
    y: marginY + (contentHeight - sizes[event.id].height) / 2,
    ...sizes[event.id],
  }

  let cursorY = marginY + (contentHeight - observersHeight) / 2
  observers.forEach((node) => {
    positions[node.id] = {
      x: observerColumnX + (rightWidth - sizes[node.id].width) / 2,
      y: cursorY,
      ...sizes[node.id],
    }
    cursorY += sizes[node.id].height + rowGap
  })

  const width = observerColumnX + rightWidth + marginX
  const height = contentHeight + marginY * 2

  return createLayout(width, height, positions)
}

function buildFallbackLayout(nodes) {
  if (nodes.length === 0) {
    return createLayout(880, 420, {})
  }

  const sizes = buildSizeMap(nodes)
  const marginX = 56
  const marginY = 56
  const columnGap = 58
  const rowGap = 44
  const columnCount = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(nodes.length))))
  const positions = {}
  const columnWidths = Array.from({ length: columnCount }, (_, columnIndex) => (
    Math.max(...nodes
      .filter((_, index) => index % columnCount === columnIndex)
      .map((node) => sizes[node.id].width))
  ))
  const rowCount = Math.ceil(nodes.length / columnCount)
  const rowHeights = Array.from({ length: rowCount }, (_, rowIndex) => (
    Math.max(...nodes
      .filter((_, index) => Math.floor(index / columnCount) === rowIndex)
      .map((node) => sizes[node.id].height))
  ))

  nodes.forEach((node, index) => {
    const column = index % columnCount
    const row = Math.floor(index / columnCount)
    const x = marginX + columnWidths.slice(0, column).reduce((total, width) => total + width + columnGap, 0)
    const y = marginY + rowHeights.slice(0, row).reduce((total, height) => total + height + rowGap, 0)

    positions[node.id] = {
      x: x + (columnWidths[column] - sizes[node.id].width) / 2,
      y: y + (rowHeights[row] - sizes[node.id].height) / 2,
      ...sizes[node.id],
    }
  })

  const width = marginX * 2 + columnWidths.reduce((total, item) => total + item, 0) + columnGap * (columnCount - 1)
  const height = marginY * 2 + rowHeights.reduce((total, item) => total + item, 0) + rowGap * (rowCount - 1)

  return createLayout(width, height, positions)
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
  isExpanded = false,
  onOpenModal,
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
  const panelClassName = isExpanded
    ? 'rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.94))] p-6 shadow-[0_30px_90px_rgba(24,20,14,0.16)] lg:p-8'
    : 'rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
  const svgClassName = isExpanded
    ? 'h-auto min-h-[420px] w-full'
    : 'h-auto w-full'
  const TitleTag = isExpanded ? 'h2' : 'h3'

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Demo visuelle
          </TitleTag>
        </div>
        {onOpenModal ? (
          <button
            className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white"
            type="button"
            onClick={onOpenModal}
          >
            {sourceLabel}
          </button>
        ) : (
          <span className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
            {sourceLabel}
          </span>
        )}
      </div>

      <ZoomableViewport enabled={isExpanded} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
      <svg className={svgClassName} viewBox={layout.viewBox} role="img">
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
          const edgeLabel = edge.label.toUpperCase()
          const edgeLabelWidth = Math.max(72, Math.ceil(estimateTextWidth(edgeLabel, 11) + 28))

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
