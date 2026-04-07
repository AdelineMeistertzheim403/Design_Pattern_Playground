import { useEffect, useMemo, useState } from 'react'

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
  cluster: {
    fill: 'rgba(214, 228, 241, 0.94)',
    stroke: '#426c8d',
    text: '#27465f',
  },
  pool: {
    fill: 'rgba(211, 236, 230, 0.94)',
    stroke: '#246b5e',
    text: '#153f38',
  },
  flyweight: {
    fill: 'rgba(255, 244, 220, 0.98)',
    stroke: '#9a7130',
    text: '#5c4218',
  },
  memory: {
    fill: 'rgba(194, 87, 55, 0.12)',
    stroke: '#c25737',
    text: '#5f2d20',
  },
  singleton: {
    fill: '#241f18',
    stroke: '#241f18',
    text: '#fffaf2',
  },
  instance: {
    fill: 'rgba(214, 228, 241, 0.94)',
    stroke: '#426c8d',
    text: '#27465f',
  },
  state: {
    fill: 'rgba(255, 244, 220, 0.98)',
    stroke: '#9a7130',
    text: '#5c4218',
  },
  component: {
    fill: 'rgba(255, 249, 239, 0.98)',
    stroke: '#7f5c3f',
    text: '#3d2d20',
  },
  decorator: {
    fill: 'rgba(211, 236, 230, 0.94)',
    stroke: '#246b5e',
    text: '#153f38',
  },
}

const FLYWEIGHT_SWATCHES = [
  { fill: '#246b5e', stroke: '#153f38' },
  { fill: '#c25737', stroke: '#5f2d20' },
  { fill: '#d48a2d', stroke: '#7d5018' },
  { fill: '#426c8d', stroke: '#27465f' },
  { fill: '#8f5e9f', stroke: '#52305c' },
  { fill: '#3b8d5f', stroke: '#24563a' },
  { fill: '#bc5077', stroke: '#6a2640' },
  { fill: '#8d6a46', stroke: '#4e3925' },
]

const STATE_LABELS = {
  IDLE: 'Idle',
  RUNNING: 'Running',
  JUMPING: 'Jumping',
  ATTACKING: 'Attacking',
}

const DECORATOR_SWATCHES = {
  BASE: {
    fill: 'rgba(255, 249, 239, 0.96)',
    stroke: '#7f5c3f',
    text: '#3d2d20',
    glow: 'rgba(127, 92, 63, 0.22)',
  },
  FIRE: {
    fill: 'rgba(231, 198, 167, 0.94)',
    stroke: '#c25737',
    text: '#5f2d20',
    glow: 'rgba(194, 87, 55, 0.22)',
  },
  SHIELD: {
    fill: 'rgba(214, 228, 241, 0.94)',
    stroke: '#426c8d',
    text: '#27465f',
    glow: 'rgba(66, 108, 141, 0.2)',
  },
  SPEED: {
    fill: 'rgba(211, 236, 230, 0.96)',
    stroke: '#246b5e',
    text: '#153f38',
    glow: 'rgba(36, 107, 94, 0.2)',
  },
  ICE: {
    fill: 'rgba(228, 240, 250, 0.96)',
    stroke: '#5b86b1',
    text: '#27465f',
    glow: 'rgba(91, 134, 177, 0.2)',
  },
}

const CHAIN_STAGE_META = {
  AUTH: {
    title: 'Authentication',
    subtitle: 'controle du token',
  },
  VALIDATION: {
    title: 'Validation',
    subtitle: 'controle du payload',
  },
  PROCESSING: {
    title: 'Processing',
    subtitle: 'traitement metier',
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

function safeNumber(value, fallbackValue = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallbackValue
}

function getExecutionModeLabel(execution) {
  const rawLabel = execution?.output?.modeLabel
  return typeof rawLabel === 'string' && rawLabel.trim() ? rawLabel.trim() : null
}

function SceneMetaBadges({
  execution,
  onOpenModal,
  sourceLabel,
}) {
  const modeLabel = getExecutionModeLabel(execution)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {modeLabel ? (
        <span className="rounded-full border border-black/10 bg-[var(--panel)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-700">
          {modeLabel}
        </span>
      ) : null}
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
  )
}

function extractStateModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.timeline)) {
    return null
  }

  const timeline = output.timeline.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    actionCode: `${step.actionCode ?? ''}`.trim().toUpperCase(),
    actionLabel: `${step.actionLabel ?? step.actionCode ?? 'Action'}`,
    fromState: `${step.fromState ?? 'IDLE'}`.trim().toUpperCase(),
    toState: `${step.toState ?? step.fromState ?? 'IDLE'}`.trim().toUpperCase(),
    accepted: Boolean(step.accepted),
    detail: `${step.detail ?? ''}`.trim(),
  }))

  const initialState = `${output.initialState ?? timeline[0]?.fromState ?? 'IDLE'}`.trim().toUpperCase()
  const finalState = `${output.finalState ?? timeline[timeline.length - 1]?.toState ?? initialState}`.trim().toUpperCase()
  const visitedStates = Array.isArray(output.visitedStates)
    ? output.visitedStates.map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
    : [...new Set([initialState, ...timeline.flatMap((step) => [step.fromState, step.toState])])]

  return {
    mode: `${output.mode ?? 'WITH_STATE'}`,
    modeLabel: `${output.modeLabel ?? 'Avec State'}`,
    useState: `${output.mode ?? 'WITH_STATE'}` !== 'WITHOUT_STATE',
    characterName: `${output.characterName ?? 'Arena Bot'}`,
    initialState,
    finalState,
    currentStateLabel: `${output.currentStateLabel ?? STATE_LABELS[finalState] ?? finalState}`,
    actionCount: safeNumber(output.actionCount, timeline.length),
    acceptedTransitions: safeNumber(output.acceptedTransitions, timeline.filter((step) => step.accepted).length),
    ignoredActions: safeNumber(output.ignoredActions, timeline.filter((step) => !step.accepted).length),
    availableActions: Array.isArray(output.availableActions)
      ? output.availableActions.map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
      : [],
    visitedStates,
    timeline,
  }
}

function extractSingletonModel(execution) {
  const output = execution?.output

  if (!output || output.instanceCount === undefined || !Array.isArray(output.clientViews)) {
    return null
  }

  const clientViews = output.clientViews.map((view, index) => ({
    id: `client-view-${index}`,
    client: `${view.client ?? `Client ${index + 1}`}`,
    instanceId: `${view.instanceId ?? `instance-${index + 1}`}`,
    visibleValue: `${view.visibleValue ?? 'non defini'}`,
    shared: Boolean(view.shared),
  }))

  return {
    mode: `${output.mode ?? 'WITH_SINGLETON'}`,
    modeLabel: `${output.modeLabel ?? 'Avec Singleton'}`,
    writerClient: `${output.writerClient ?? clientViews[0]?.client ?? 'Client 1'}`,
    settingKey: `${output.settingKey ?? 'theme'}`,
    settingValue: `${output.settingValue ?? 'emerald'}`,
    instanceCount: safeNumber(output.instanceCount, clientViews.length),
    clientCount: safeNumber(output.clientCount, clientViews.length),
    coherent: Boolean(output.coherent),
    coherenceLabel: `${output.coherenceLabel ?? ''}`.trim() || 'Etat en cours',
    uniqueInstanceIds: Array.isArray(output.uniqueInstanceIds)
      ? output.uniqueInstanceIds.map((value) => `${value}`)
      : [...new Set(clientViews.map((view) => view.instanceId))],
    clientViews,
  }
}

function extractFlyweightModel(execution) {
  const output = execution?.output

  if (!output || output.objectCount === undefined) {
    return null
  }

  const objectCount = safeNumber(output.objectCount, 0)
  const sharedVariantCount = safeNumber(output.sharedVariantCount ?? output.variantCount, 1)
  const realInstances = safeNumber(output.realInstances, sharedVariantCount)
  const memoryCurrentKb = safeNumber(output.memoryCurrentKb, 0)
  const memoryWithoutFlyweightKb = safeNumber(output.memoryWithoutFlyweightKb, memoryCurrentKb)
  const savedMemoryKb = safeNumber(output.savedMemoryKb, 0)
  const savingsPercent = safeNumber(output.savingsPercent, 0)
  const simulatedFrameCostMs = safeNumber(output.simulatedFrameCostMs, 0)

  return {
    assetLabel: `${output.assetLabel ?? 'Objets'}`,
    assetType: `${output.assetType ?? 'TREE'}`,
    modeLabel: `${output.modeLabel ?? 'Avec Flyweight'}`,
    objectCount,
    sharedVariantCount: Math.max(1, sharedVariantCount),
    realInstances,
    memoryCurrentKb,
    memoryWithoutFlyweightKb,
    savedMemoryKb,
    savingsPercent,
    simulatedFrameCostMs,
    performanceLabel: `${output.performanceLabel ?? ''}`.trim() || 'Simulation en cours',
    useFlyweight: `${output.mode ?? ''}` === 'WITH_FLYWEIGHT' || realInstances < objectCount,
    variants: Array.isArray(output.variants) ? output.variants : [],
  }
}

function normalizeCommandStackEntries(entries) {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries.map((entry, index) => ({
    id: `${entry?.actionCode ?? entry?.code ?? 'command'}-${index}`,
    actionCode: `${entry?.actionCode ?? entry?.code ?? 'COMMAND'}`.trim().toUpperCase(),
    actionLabel: `${entry?.actionLabel ?? entry?.label ?? entry?.actionCode ?? 'Commande'}`.trim(),
    commandClass: `${entry?.commandClass ?? entry?.className ?? 'BoardCommand'}`.trim(),
  }))
}

function extractCommandModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.history)) {
    return null
  }

  const history = output.history.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    actionCode: `${step.actionCode ?? 'ACTION'}`.trim().toUpperCase(),
    actionLabel: `${step.actionLabel ?? step.actionCode ?? 'Action'}`.trim(),
    operationType: `${step.operationType ?? 'EXECUTE'}`.trim().toUpperCase(),
    accepted: Boolean(step.accepted),
    detail: `${step.detail ?? ''}`.trim(),
    positionX: safeNumber(step.positionX, 0),
    positionY: safeNumber(step.positionY, 0),
    beaconCount: safeNumber(step.beaconCount, 0),
    undoDepth: safeNumber(step.undoDepth, 0),
    redoDepth: safeNumber(step.redoDepth, 0),
    undoStack: normalizeCommandStackEntries(step.undoStack),
    redoStack: normalizeCommandStackEntries(step.redoStack),
  }))

  const visitedCells = Array.isArray(output.visitedCells)
    ? output.visitedCells
      .map((cell) => `${cell}`.split(','))
      .filter((parts) => parts.length === 2)
      .map(([x, y]) => ({
        x: safeNumber(x, 0),
        y: safeNumber(y, 0),
      }))
    : []

  return {
    mode: `${output.mode ?? 'WITH_COMMAND'}`.trim(),
    modeLabel: `${output.modeLabel ?? 'Avec Command'}`.trim(),
    useCommand: `${output.mode ?? 'WITH_COMMAND'}`.trim().toUpperCase() !== 'WITHOUT_COMMAND',
    boardName: `${output.boardName ?? 'Arena Grid'}`.trim(),
    actorName: `${output.actorName ?? 'Pixel Bot'}`.trim(),
    boardSize: Math.max(3, safeNumber(output.boardSize, 5)),
    positionX: safeNumber(output.positionX, history[history.length - 1]?.positionX ?? 0),
    positionY: safeNumber(output.positionY, history[history.length - 1]?.positionY ?? 0),
    beaconCount: safeNumber(output.beaconCount, history[history.length - 1]?.beaconCount ?? 0),
    actionCount: safeNumber(output.actionCount, history.length),
    executedCommands: safeNumber(output.executedCommands, history.filter((step) => step.accepted).length),
    blockedCommands: safeNumber(output.blockedCommands, history.filter((step) => !step.accepted).length),
    successfulControlCommands: safeNumber(
      output.successfulControlCommands,
      history.filter((step) => step.accepted && (step.actionCode === 'UNDO' || step.actionCode === 'REDO')).length,
    ),
    undoStack: normalizeCommandStackEntries(output.undoStack),
    redoStack: normalizeCommandStackEntries(output.redoStack),
    visitedCells,
    history,
  }
}

function extractChainModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.steps)) {
    return null
  }

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    handlerCode: `${step.handlerCode ?? 'AUTH'}`.trim().toUpperCase(),
    handlerLabel: `${step.handlerLabel ?? 'Handler'}`.trim(),
    status: `${step.status ?? 'PASSED'}`.trim().toUpperCase(),
    passed: Boolean(step.passed),
    detail: `${step.detail ?? ''}`.trim(),
  }))

  return {
    mode: `${output.mode ?? 'WITH_CHAIN'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Chain of Responsibility'}`.trim(),
    useChain: `${output.mode ?? 'WITH_CHAIN'}`.trim().toUpperCase() !== 'WITHOUT_CHAIN',
    requestName: `${output.requestName ?? 'Export mensuel'}`.trim(),
    tokenLabel: `${output.tokenLabel ?? output.tokenState ?? 'Token valide'}`.trim(),
    payloadLabel: `${output.payloadLabel ?? output.payloadState ?? 'Payload valide'}`.trim(),
    processingTargetLabel: `${output.processingTargetLabel ?? output.processingTarget ?? 'Export de rapport'}`.trim(),
    finalDecision: `${output.finalDecision ?? 'REJECTED'}`.trim().toUpperCase(),
    decisionLabel: `${output.decisionLabel ?? ''}`.trim(),
    accepted: Boolean(output.accepted),
    handledBy: `${output.handledBy ?? ''}`.trim(),
    stoppedAt: `${output.stoppedAt ?? steps[steps.length - 1]?.handlerCode ?? 'AUTH'}`.trim().toUpperCase(),
    passedHandlers: safeNumber(output.passedHandlers, steps.filter((step) => step.passed).length),
    stepCount: safeNumber(output.stepCount, steps.length),
    visitedHandlers: Array.isArray(output.visitedHandlers)
      ? output.visitedHandlers.map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
      : steps.map((step) => step.handlerCode),
    steps,
  }
}

function extractMediatorModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.deliveries)) {
    return null
  }

  const deliveries = output.deliveries.map((delivery, index) => ({
    index: safeNumber(delivery.index, index + 1),
    from: `${delivery.from ?? ''}`.trim(),
    to: `${delivery.to ?? ''}`.trim(),
    via: `${delivery.via ?? ''}`.trim(),
    transport: `${delivery.transport ?? 'MEDIATED'}`.trim().toUpperCase(),
    detail: `${delivery.detail ?? ''}`.trim(),
  }))

  return {
    mode: `${output.mode ?? 'WITH_MEDIATOR'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Mediator'}`.trim(),
    useMediator: `${output.mode ?? 'WITH_MEDIATOR'}`.trim().toUpperCase() !== 'WITHOUT_MEDIATOR',
    roomName: `${output.roomName ?? 'Arena Chat'}`.trim(),
    participants: Array.isArray(output.participants) ? output.participants.map((value) => `${value}`.trim()).filter(Boolean) : [],
    participantCount: safeNumber(output.participantCount, 0),
    senderName: `${output.senderName ?? 'Luna'}`.trim(),
    recipients: Array.isArray(output.recipients) ? output.recipients.map((value) => `${value}`.trim()).filter(Boolean) : [],
    recipientCount: safeNumber(output.recipientCount, deliveries.length),
    message: `${output.message ?? ''}`.trim(),
    deliveredCount: safeNumber(output.deliveredCount, deliveries.length),
    senderCouplingCount: safeNumber(output.senderCouplingCount, 1),
    directLinkCount: safeNumber(output.directLinkCount, 0),
    deliveryModeLabel: `${output.deliveryModeLabel ?? ''}`.trim(),
    deliveries,
  }
}

function buildFlyweightSamples(model, layout) {
  const {
    sampleCount,
    columnCount,
    rowGap,
    columnGap,
    startX,
    startY,
  } = layout

  return Array.from({ length: sampleCount }, (_, index) => {
    const column = index % columnCount
    const row = Math.floor(index / columnCount)
    const variantIndex = index % model.sharedVariantCount
    const swatch = FLYWEIGHT_SWATCHES[variantIndex % FLYWEIGHT_SWATCHES.length]
    const scale = 0.88 + (variantIndex % 4) * 0.08

    return {
      id: `sample-${index}`,
      x: startX + column * columnGap + (row % 2) * 3,
      y: startY + row * rowGap + (column % 3) * 1.4,
      variantIndex,
      swatch,
      scale,
    }
  })
}

function renderFlyweightGlyph(sample, assetType) {
  const { swatch, scale } = sample

  if (assetType === 'PARTICLE') {
    return (
      <g transform={`translate(${sample.x} ${sample.y}) scale(${scale})`}>
        <circle cx="0" cy="0" r="7" fill={swatch.fill} fillOpacity="0.9" stroke={swatch.stroke} strokeWidth="1.2" />
        <circle cx="0" cy="0" r="3" fill="#fff7ec" fillOpacity="0.86" />
      </g>
    )
  }

  if (assetType === 'BULLET') {
    return (
      <g transform={`translate(${sample.x} ${sample.y}) rotate(-12) scale(${scale})`}>
        <rect x="-8" y="-4" width="16" height="8" rx="4" fill={swatch.fill} stroke={swatch.stroke} strokeWidth="1.2" />
        <path d="M 8 -4 L 14 0 L 8 4 Z" fill={swatch.stroke} />
      </g>
    )
  }

  return (
    <g transform={`translate(${sample.x} ${sample.y}) scale(${scale})`}>
      <rect x="-2.4" y="4" width="4.8" height="10" rx="1.4" fill="#6d4a31" />
      <path d="M 0 -16 L 11 -1 L -11 -1 Z" fill={swatch.fill} stroke={swatch.stroke} strokeWidth="1.15" />
      <path d="M 0 -9 L 9 3 L -9 3 Z" fill={swatch.fill} fillOpacity="0.88" />
    </g>
  )
}

function renderFlyweightScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractFlyweightModel(execution)

  if (!model) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  const viewBoxWidth = 1120
  const stageX = 36
  const stageY = 88
  const stageWidth = 700
  const statsX = 770
  const statsWidth = 314
  const statsHeight = 228
  const poolY = 344
  const poolHeight = isExpanded ? 356 : 324
  const memoryRatio = model.memoryWithoutFlyweightKb > 0
    ? Math.min(1, model.memoryCurrentKb / model.memoryWithoutFlyweightKb)
    : 0
  const sampleCount = Math.min(model.objectCount, isExpanded ? 420 : 260)
  const columnCount = isExpanded ? 24 : 18
  const rowGap = isExpanded ? 24 : 26
  const columnGap = isExpanded ? 26 : 31
  const rowCount = Math.max(1, Math.ceil(sampleCount / columnCount))
  const objectFrameX = stageX + 24
  const objectFrameY = stageY + 114
  const objectFrameWidth = stageWidth - 48
  const sampleStartX = objectFrameX + (isExpanded ? 34 : 30)
  const sampleStartY = objectFrameY + (isExpanded ? 42 : 38)
  const sampleGlyphHeight = model.assetType === 'TREE' ? 30 : 18
  const sampleViewportHeight = Math.max(
    isExpanded ? 310 : 256,
    (sampleStartY - objectFrameY) + (rowCount - 1) * rowGap + sampleGlyphHeight + 24,
  )
  const objectLabelHeight = 56
  const objectFrameHeight = sampleViewportHeight + objectLabelHeight
  const stageHeight = (objectFrameY - stageY) + objectFrameHeight + 26
  const viewBoxHeight = Math.max(
    isExpanded ? 780 : 720,
    stageY + stageHeight + 40,
    poolY + poolHeight + 48,
  )
  const sampleObjects = buildFlyweightSamples(model, {
    sampleCount,
    columnCount,
    rowGap,
    columnGap,
    startX: sampleStartX,
    startY: sampleStartY,
  })
  const extraObjects = Math.max(0, model.objectCount - sampleObjects.length)
  const connectionStartY = objectFrameY + Math.min(sampleViewportHeight * 0.5, sampleViewportHeight - 28)
  const connectionPath = `M ${stageX + stageWidth} ${connectionStartY} C 790 ${connectionStartY} 782 ${poolY + 88} ${statsX} ${poolY + 88}`
  const defsId = `flyweight-scene-${isExpanded ? 'expanded' : 'compact'}`
  const scrollRegionX = statsX + 18
  const scrollRegionY = poolY + 120
  const scrollRegionWidth = statsWidth - 36
  const scrollRegionHeight = poolHeight - 146

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Memory Battle
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-stage`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(214,228,241,0.62)" />
              <stop offset="100%" stopColor="rgba(255,250,242,0.98)" />
            </linearGradient>
            <linearGradient id={`${defsId}-memory-current`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#246b5e" />
              <stop offset="100%" stopColor="#3e9b84" />
            </linearGradient>
            <linearGradient id={`${defsId}-memory-baseline`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c25737" />
              <stop offset="100%" stopColor="#df8a6e" />
            </linearGradient>
            <clipPath id={`${defsId}-samples-clip`}>
              <rect
                x={objectFrameX + 16}
                y={objectFrameY + 16}
                width={objectFrameWidth - 32}
                height={sampleViewportHeight - 10}
                rx="24"
              />
            </clipPath>
            <marker
              id={`${defsId}-arrow`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={model.useFlyweight ? '#246b5e' : '#c25737'} />
            </marker>
          </defs>

          <circle cx="190" cy="124" r="114" fill="rgba(36,107,94,0.08)" />
          <circle cx="982" cy={viewBoxHeight - 126} r="136" fill="rgba(194,87,55,0.08)" />

          <rect
            x={stageX}
            y={stageY}
            width={stageWidth}
            height={stageHeight}
            rx="34"
            fill={`url(#${defsId}-stage)`}
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={stageX + 26} y={stageY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5a5147">
            SCENE SAMPLE
          </text>
          <text x={stageX + 26} y={stageY + 64} fontSize="28" fontWeight="700" fill="#241f18">
            {model.objectCount.toLocaleString('fr-FR')} objets a l ecran
          </text>
          <text x={stageX + 26} y={stageY + 92} fontSize="15" fontWeight="500" fill="#5d554b">
            Echantillon visuel {sampleObjects.length.toLocaleString('fr-FR')} / {model.objectCount.toLocaleString('fr-FR')} · {model.assetLabel}
          </text>

          <rect
            x={objectFrameX}
            y={objectFrameY}
            width={objectFrameWidth}
            height={objectFrameHeight}
            rx="28"
            fill="rgba(255,255,255,0.58)"
          />
          <rect
            x={stageX + 26}
            y={objectFrameY + objectFrameHeight - 42}
            width={216}
            height="28"
            rx="14"
            fill={model.useFlyweight ? 'rgba(36,107,94,0.14)' : 'rgba(194,87,55,0.14)'}
            stroke={model.useFlyweight ? 'rgba(36,107,94,0.28)' : 'rgba(194,87,55,0.28)'}
          />
          <text x={stageX + 42} y={objectFrameY + objectFrameHeight - 23} fontSize="11" fontWeight="700" letterSpacing="0.16em" fill="#5f5548">
            {model.useFlyweight ? 'ETAT EXTRINSIQUE PAR OBJET' : 'ETAT COMPLET DUPLIQUE'}
          </text>

          <g clipPath={`url(#${defsId}-samples-clip)`}>
            {sampleObjects.map((sample) => renderFlyweightGlyph(sample, model.assetType))}
          </g>

          {extraObjects > 0 ? (
            <>
              <rect
                x={stageX + stageWidth - 226}
                y={objectFrameY + objectFrameHeight - 42}
                width="200"
                height="28"
                rx="14"
                fill="rgba(36,31,24,0.08)"
              />
              <text
                x={stageX + stageWidth - 126}
                y={objectFrameY + objectFrameHeight - 23}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.16em"
                fill="#5f5548"
              >
                +{extraObjects.toLocaleString('fr-FR')} objets supplementaires
              </text>
            </>
          ) : null}

          <rect
            x={statsX}
            y={stageY}
            width={statsWidth}
            height={statsHeight}
            rx="30"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={statsX + 24} y={stageY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ANALYSE LIVE
          </text>
          <text x={statsX + 24} y={stageY + 62} fontSize="26" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={statsX + 24} y={stageY + 90} fontSize="14" fill="#5f5548">
            {model.performanceLabel}
          </text>

          <text x={statsX + 24} y={stageY + 126} fontSize="11" fontWeight="700" letterSpacing="0.14em" fill="#786e62">
            MEMOIRE COURANTE
          </text>
          <rect x={statsX + 24} y={stageY + 138} width="248" height="16" rx="8" fill="rgba(36,31,24,0.1)" />
          <rect x={statsX + 24} y={stageY + 138} width={248 * memoryRatio} height="16" rx="8" fill={`url(#${defsId}-memory-current)`} />
          <text x={statsX + 24} y={stageY + 176} fontSize="13" fontWeight="600" fill="#241f18">
            {model.memoryCurrentKb.toLocaleString('fr-FR')} KB / {model.memoryWithoutFlyweightKb.toLocaleString('fr-FR')} KB
          </text>
          <text x={statsX + 24} y={stageY + 201} fontSize="12" fill="#5f5548">
            Economie : {model.savedMemoryKb.toLocaleString('fr-FR')} KB · {model.savingsPercent.toLocaleString('fr-FR')}%
          </text>
          <text x={statsX + 24} y={stageY + 224} fontSize="12" fill="#5f5548">
            Cout frame simule : {model.simulatedFrameCostMs.toLocaleString('fr-FR')} ms
          </text>

          <rect
            x={statsX}
            y={poolY}
            width={statsWidth}
            height={poolHeight}
            rx="30"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={statsX + 24} y={poolY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useFlyweight ? 'POOL PARTAGE' : 'INSTANCE STORM'}
          </text>
          <text x={statsX + 24} y={poolY + 62} fontSize="26" fontWeight="700" fill="#241f18">
            {model.realInstances.toLocaleString('fr-FR')} instance(s) reelle(s)
          </text>
          <text x={statsX + 24} y={poolY + 90} fontSize="14" fill="#5f5548">
            {model.useFlyweight
              ? `${model.sharedVariantCount.toLocaleString('fr-FR')} variante(s) alimentent toute la foule`
              : 'Chaque objet conserve son propre etat intrinsique'}
          </text>
          <text x={statsX + statsWidth - 24} y={poolY + 90} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.12em" fill="#8a7663">
          </text>

          <path
            d={connectionPath}
            fill="none"
            stroke={model.useFlyweight ? '#246b5e' : '#c25737'}
            strokeWidth="3"
            strokeDasharray={model.useFlyweight ? '14 9' : '8 7'}
            markerEnd={`url(#${defsId}-arrow)`}
            className={model.useFlyweight ? 'scene-flow-line' : ''}
          />
          <circle r="5" fill={model.useFlyweight ? '#246b5e' : '#c25737'} opacity="0.95">
            <animateMotion dur={model.useFlyweight ? '2.2s' : '1.35s'} repeatCount="indefinite" path={connectionPath} />
          </circle>

          <foreignObject x={scrollRegionX} y={scrollRegionY} width={scrollRegionWidth} height={scrollRegionHeight}>
            <div className="flyweight-instance-scroll h-full overflow-y-auto pr-1" xmlns="http://www.w3.org/1999/xhtml">
              <div className="space-y-2.5 pb-2">
                {model.variants.map((variant, index) => {
                  const swatch = FLYWEIGHT_SWATCHES[index % FLYWEIGHT_SWATCHES.length]

                  return (
                    <div
                      key={`${variant.code}-${index}`}
                      className="rounded-[18px] border border-black/8 bg-white/90 px-3 py-2 shadow-[0_12px_24px_rgba(48,39,24,0.08)]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border"
                          style={{ backgroundColor: swatch.fill, borderColor: swatch.stroke }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold text-stone-900">{variant.label}</p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                            {model.useFlyweight ? 'instance partagee' : 'copies regroupees'}
                          </p>
                        </div>
                        <p className="text-right text-[11px] font-bold text-stone-700">
                          {safeNumber(variant.objects, 0).toLocaleString('fr-FR')} objets
                        </p>
                      </div>
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

function buildCommandPlaybackFrames(model) {
  if (!model) {
    return []
  }

  return [
    {
      id: 'command-initial',
      stepIndex: 0,
      actionCode: 'INIT',
      actionLabel: 'Position initiale',
      operationType: 'INIT',
      accepted: true,
      detail: model.useCommand
        ? 'Le receiver attend la premiere commande.'
        : 'Le receiver attend la premiere action directe.',
      positionX: 0,
      positionY: 0,
      beaconCount: 0,
      undoDepth: 0,
      redoDepth: 0,
      undoStack: [],
      redoStack: [],
    },
    ...model.history.map((step) => ({
      ...step,
      id: `command-step-${step.index}`,
      stepIndex: step.index,
    })),
  ]
}

function CommandScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractCommandModel(execution), [execution])
  const playbackFrames = useMemo(() => buildCommandPlaybackFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(
    Math.max(0, playbackFrames.length - 1),
  )
  const [isPlaying, setIsPlaying] = useState(false)

  if (!model) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, playbackFrames.length - 1))
    setIsPlaying(false)
  }, [playbackFrames.length, model.mode, model.boardName, model.actorName])

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

  const currentFrame = playbackFrames[currentFrameIndex] ?? playbackFrames[playbackFrames.length - 1]
  const visibleFrames = playbackFrames.slice(0, currentFrameIndex + 1)
  const visibleHistory = visibleFrames.slice(1)
  const acceptedVisibleCount = visibleHistory.filter((step) => step.accepted && !['UNDO', 'REDO'].includes(step.actionCode)).length
  const controlVisibleCount = visibleHistory.filter((step) => step.accepted && ['UNDO', 'REDO'].includes(step.actionCode)).length
  const blockedVisibleCount = visibleHistory.filter((step) => !step.accepted).length
  const visibleUndoStack = currentFrame?.undoStack ?? []
  const visibleRedoStack = currentFrame?.redoStack ?? []
  const viewBoxWidth = 1380
  const leftPanel = { x: 36, y: 172, width: 282, height: 660 }
  const boardX = 342
  const boardY = 172
  const boardSizePx = isExpanded ? 720 : 660
  const cellSize = boardSizePx / model.boardSize
  const undoPanel = { x: 1044, y: 172, width: 300, height: 320 }
  const redoPanel = { x: 1044, y: 512, width: 300, height: 320 }
  const timelineX = 36
  const timelineY = boardY + boardSizePx + 32
  const timelineWidth = 1308
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.history.length / timelineColumns))
  const timelineRowHeight = 148
  const timelineGap = 12
  const timelineHeight = 124 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 36
  const defsId = `command-scene-${isExpanded ? 'expanded' : 'compact'}`
  const descriptionLines = wrapText(
    model.useCommand
      ? 'Chaque action voyage comme un objet. L invoker peut donc empiler, annuler et rejouer.'
      : 'Le controleur appelle directement le receiver. Les mutations partent, mais l historique est perdu.',
    32,
  )
  const actorBadge = model.actorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    || 'BOT'
  const acceptedPathPoints = [
    { x: 0, y: 0, accepted: true, index: 0 },
    ...visibleHistory
      .filter((step) => step.accepted)
      .map((step) => ({
        x: step.positionX,
        y: step.positionY,
        accepted: true,
        index: step.index,
        operationType: step.operationType,
      })),
  ]
  const visitedCells = [...new Set(acceptedPathPoints.map((point) => `${point.x},${point.y}`))]
    .map((cell) => {
      const [x, y] = cell.split(',')
      return {
        x: safeNumber(x, 0),
        y: safeNumber(y, 0),
      }
    })
  const pointToBoard = (point) => ({
    x: boardX + point.x * cellSize + cellSize / 2,
    y: boardY + (model.boardSize - 1 - point.y) * cellSize + cellSize / 2,
  })
  const travelPath = acceptedPathPoints
    .map((point, index) => {
      const position = pointToBoard(point)
      return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`
    })
    .join(' ')

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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Undo / Redo Simulator
          </TitleTag>
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
            Pas a pas
          </button>

          {playMode === 'AUTO' ? (
            <select
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 outline-none focus:border-black/20"
              value={delayMs}
              onChange={(event) => setDelayMs(Number(event.target.value))}
            >
              <option value={600}>0.6 s / action</option>
              <option value={900}>0.9 s / action</option>
              <option value={1400}>1.4 s / action</option>
            </select>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            type="button"
            onClick={handleLaunchDemo}
          >
            Lancer la demo
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
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40"
            disabled={currentFrameIndex === 0}
            type="button"
            onClick={handlePreviousStep}
          >
            Etape precedente
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40"
            disabled={currentFrameIndex >= playbackFrames.length - 1}
            type="button"
            onClick={handleNextStep}
          >
            Etape suivante
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={handleResetToFinalState}
          >
            Retour a la fin
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
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
          </defs>

          <rect
            x="36"
            y="44"
            width="1308"
            height="94"
            rx="32"
            fill={`url(#${defsId}-header)`}
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x="64" y="80" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useCommand ? 'COMMAND PLAYGROUND' : 'DIRECT MUTATION MODE'}
          </text>
          <text x="64" y="112" fontSize="28" fontWeight="700" fill="#241f18">
            {model.actorName} · {model.boardName}
          </text>
          <text x="430" y="86" fontSize="13" fontWeight="600" fill="#5f5548">
            Position courante : ({currentFrame.positionX}, {currentFrame.positionY})
          </text>
          <text x="430" y="112" fontSize="13" fontWeight="600" fill="#5f5548">
            Balises actives : {currentFrame.beaconCount}
          </text>
          <text x="1280" y="82" textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {currentFrame.stepIndex}/{model.actionCount} etape(s)
          </text>
          <text x="1280" y="108" textAnchor="end" fontSize="13" fill="#5f5548">
            {playMode === 'AUTO'
              ? `T+${Math.max(0, currentFrameIndex * delayMs) / 1000}s`
              : currentFrameIndex === 0
                ? 'Sequence en attente'
                : `Action visible : ${currentFrame.actionCode}`}
          </text>

          <rect
            x={leftPanel.x}
            y={leftPanel.y}
            width={leftPanel.width}
            height={leftPanel.height}
            rx="30"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
            className="scene-node-shadow"
          />
          <text x={leftPanel.x + 22} y={leftPanel.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useCommand ? 'AVEC COMMAND' : 'SANS COMMAND'}
          </text>
          <text x={leftPanel.x + 22} y={leftPanel.y + 64} fontSize="24" fontWeight="700" fill="#241f18">
            {model.useCommand ? 'Historique reversible' : 'Actions jetables'}
          </text>
          {descriptionLines.map((line, index) => (
            <text
              key={`command-description-${index}`}
              x={leftPanel.x + 22}
              y={leftPanel.y + 96 + index * 16}
              fontSize="13"
              fill="#5f5548"
            >
              {line}
            </text>
          ))}

          {[
            { label: 'Executions valides', value: acceptedVisibleCount, tone: '#153f38', background: 'rgba(211,236,230,0.94)' },
            { label: 'Undo / Redo utiles', value: controlVisibleCount, tone: '#5f2d20', background: 'rgba(245,227,210,0.94)' },
            { label: 'Blocages', value: blockedVisibleCount, tone: '#7a4634', background: 'rgba(255,244,220,0.96)' },
            { label: 'Balises actives', value: currentFrame.beaconCount, tone: '#5f2d20', background: 'rgba(255,249,239,0.98)' },
          ].map((metric, index) => {
            const y = leftPanel.y + 176 + index * 108
            return (
              <g key={metric.label}>
                <rect
                  x={leftPanel.x + 18}
                  y={y}
                  width={leftPanel.width - 36}
                  height="92"
                  rx="24"
                  fill={metric.background}
                  stroke="rgba(36,31,24,0.08)"
                />
                <text x={leftPanel.x + 36} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#7a6c5d">
                  {metric.label}
                </text>
                <text x={leftPanel.x + 36} y={y + 58} fontSize="28" fontWeight="700" fill={metric.tone}>
                  {metric.value}
                </text>
                {metric.label === 'Balises actives'
                  ? Array.from({ length: Math.min(currentFrame.beaconCount, 4) }, (_, iconIndex) => (
                    <g
                      key={`beacon-card-${iconIndex}`}
                      transform={`translate(${leftPanel.x + 162 + iconIndex * 24} ${y + 52}) rotate(45)`}
                    >
                      <rect x="-7" y="-7" width="14" height="14" rx="4" fill="#c25737" />
                    </g>
                  ))
                  : null}
                {metric.label === 'Balises actives' && currentFrame.beaconCount > 4 ? (
                  <text x={leftPanel.x + leftPanel.width - 54} y={y + 58} fontSize="13" fontWeight="700" fill="#5f2d20">
                    +{currentFrame.beaconCount - 4}
                  </text>
                ) : null}
              </g>
            )
          })}

          <rect
            x={boardX}
            y={boardY}
            width={boardSizePx}
            height={boardSizePx}
            rx="34"
            fill="rgba(255,250,242,0.98)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
            className="scene-node-shadow"
          />
          <text x={boardX + 24} y={boardY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ARENA BOARD
          </text>
          <text x={boardX + boardSizePx - 24} y={boardY + 30} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.boardSize} x {model.boardSize}
          </text>

          {Array.from({ length: model.boardSize }, (_, rowIndex) => (
            Array.from({ length: model.boardSize }, (_, columnIndex) => {
              const logicalY = model.boardSize - 1 - rowIndex
              const isVisited = visitedCells.some((cell) => cell.x === columnIndex && cell.y === logicalY)
              return (
                <rect
                  key={`board-cell-${columnIndex}-${logicalY}`}
                  x={boardX + columnIndex * cellSize + 10}
                  y={boardY + rowIndex * cellSize + 10}
                  width={cellSize - 20}
                  height={cellSize - 20}
                  rx="18"
                  fill={isVisited ? 'rgba(211,236,230,0.72)' : 'rgba(255,249,239,0.92)'}
                  stroke={isVisited ? 'rgba(36,107,94,0.18)' : 'rgba(36,31,24,0.08)'}
                />
              )
            })
          ))}

          {travelPath ? (
            <>
              <path
                d={travelPath}
                fill="none"
                stroke={model.useCommand ? '#246b5e' : '#c25737'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={model.useCommand ? '0' : '14 10'}
                opacity="0.84"
              />
              {acceptedPathPoints.slice(1).map((point) => {
                const position = pointToBoard(point)
                return (
                  <g key={`travel-point-${point.index}`}>
                    <circle cx={position.x} cy={position.y} r="13" fill="#fff8ee" stroke="#7f5c3f" strokeWidth="2" />
                    <text x={position.x} y={position.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5f2d20">
                      {point.index}
                    </text>
                  </g>
                )
              })}
            </>
          ) : null}

          <g transform={`translate(${boardX + currentFrame.positionX * cellSize + cellSize / 2} ${boardY + (model.boardSize - 1 - currentFrame.positionY) * cellSize + cellSize / 2})`}>
            <circle
              r="36"
              fill={model.useCommand ? '#241f18' : '#5f2d20'}
              className={isPlaying ? 'state-active-halo' : ''}
            />
            <circle r="20" fill="rgba(255,248,238,0.14)" />
            <text textAnchor="middle" y="4" fontSize="14" fontWeight="700" fill="#fff8ee">
              {actorBadge}
            </text>
          </g>

          {[{ title: 'UNDO STACK', entries: visibleUndoStack, panel: undoPanel }, { title: 'REDO STACK', entries: visibleRedoStack, panel: redoPanel }].map(({ title, entries, panel }) => (
            <g key={title}>
              <rect
                x={panel.x}
                y={panel.y}
                width={panel.width}
                height={panel.height}
                rx="30"
                fill="rgba(255,250,242,0.96)"
                stroke="rgba(36,31,24,0.1)"
                strokeWidth="2"
                className="scene-node-shadow"
              />
              <text x={panel.x + 22} y={panel.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
                {title}
              </text>
              <text x={panel.x + panel.width - 22} y={panel.y + 30} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
                {entries.length} element(s)
              </text>
              <foreignObject x={panel.x + 16} y={panel.y + 50} width={panel.width - 32} height={panel.height - 70}>
                <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
                  {entries.length > 0 ? (
                    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-1">
                      {entries.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="rounded-[18px] border border-black/8 bg-white/90 px-3 py-2 shadow-[0_12px_24px_rgba(48,39,24,0.08)]"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                            {index === 0 ? 'top of stack' : `slot ${index + 1}`}
                          </p>
                          <p className="mt-1 text-[13px] font-semibold text-stone-900">{entry.actionLabel}</p>
                          <p className="mt-1 text-[11px] text-stone-600">{entry.commandClass}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[22px] border border-dashed border-black/10 bg-[rgba(255,249,239,0.74)] px-4 text-center text-[13px] leading-6 text-stone-500">
                      {model.useCommand
                        ? 'Pile vide pour le moment.'
                        : 'Aucune pile disponible sans pattern.'}
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          ))}

          <path
            d={`M ${leftPanel.x + leftPanel.width} ${leftPanel.y + 270} C ${leftPanel.x + leftPanel.width + 84} ${leftPanel.y + 270} ${boardX - 80} ${boardY + 120} ${boardX} ${boardY + 120}`}
            fill="none"
            stroke="#7a5a3f"
            strokeWidth="3"
            strokeDasharray="12 8"
            markerEnd={`url(#${defsId}-arrow)`}
            className="scene-flow-line"
          />
          <path
            d={`M ${boardX + boardSizePx} ${boardY + 112} C ${boardX + boardSizePx + 54} ${boardY + 112} ${undoPanel.x - 40} ${undoPanel.y + 68} ${undoPanel.x} ${undoPanel.y + 68}`}
            fill="none"
            stroke="#246b5e"
            strokeWidth="2.8"
            markerEnd={`url(#${defsId}-arrow)`}
            className="scene-flow-line"
          />
          <path
            d={`M ${boardX + boardSizePx} ${boardY + 432} C ${boardX + boardSizePx + 54} ${boardY + 432} ${redoPanel.x - 40} ${redoPanel.y + 68} ${redoPanel.x} ${redoPanel.y + 68}`}
            fill="none"
            stroke="#c25737"
            strokeWidth="2.8"
            strokeDasharray="12 8"
            markerEnd={`url(#${defsId}-arrow)`}
            className="scene-flow-line"
          />

          <rect
            x={timelineX}
            y={timelineY}
            width={timelineWidth}
            height={timelineHeight}
            rx="34"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={timelineX + 24} y={timelineY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            TIMELINE
          </text>
          <text x={timelineX + 24} y={timelineY + 62} fontSize="24" fontWeight="700" fill="#241f18">
            Historique d execution
          </text>
          <text x={timelineX + 24} y={timelineY + 88} fontSize="13" fill="#5f5548">
            chaque carte capture l etat de la grille juste apres l action, l annulation ou le blocage
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 106} width={timelineWidth - 32} height={timelineHeight - 126}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div
                className="grid gap-3 pb-2"
                style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}
              >
                {model.history.map((step) => {
                  const cardClass = step.operationType === 'BLOCKED'
                    ? 'border-amber-300 bg-amber-50/96'
                    : step.operationType === 'UNDO'
                      ? 'border-orange-200 bg-orange-50/95'
                      : step.operationType === 'REDO'
                        ? 'border-blue-200 bg-blue-50/95'
                        : step.operationType === 'DIRECT'
                          ? 'border-red-200 bg-red-50/92'
                          : 'border-emerald-200 bg-emerald-50/90'

                  return (
                    <div
                      key={`${step.index}-${step.actionCode}`}
                      className={`min-h-[134px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${
                        step.index > currentFrame.stepIndex ? 'opacity-45' : ''
                      } ${
                        step.index === currentFrame.stepIndex
                          ? 'ring-2 ring-stone-950/15'
                          : ''
                      } ${cardClass}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                          Step {step.index}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-700">
                          {step.index === currentFrame.stepIndex ? 'NOW' : step.operationType}
                        </p>
                      </div>
                      <p className="mt-2 text-[13px] font-semibold text-stone-900">{step.actionCode}</p>
                      <p className="mt-1 text-[12px] text-stone-700">
                        pos ({step.positionX}, {step.positionY}) · balises {step.beaconCount}
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-600">{step.detail}</p>
                      <p className="mt-3 text-[11px] font-medium text-stone-500">
                        undo {step.undoDepth} · redo {step.redoDepth}
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

function extractDecoratorModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.stack)) {
    return null
  }

  const stack = output.stack.map((layer, index) => ({
    index,
    code: `${layer.code ?? (index === 0 ? 'BASE' : `LAYER_${index}`)}`.trim().toUpperCase(),
    layerClass: `${layer.layerClass ?? 'DecoratorLayer'}`.trim(),
    layerLabel: `${layer.layerLabel ?? layer.layerClass ?? 'Layer'}`.trim(),
    effect: `${layer.effect ?? ''}`.trim(),
    attack: safeNumber(layer.attack, 0),
    defense: safeNumber(layer.defense, 0),
    speed: safeNumber(layer.speed, 0),
    control: safeNumber(layer.control, 0),
  }))

  return {
    mode: `${output.mode ?? 'WITH_DECORATOR'}`,
    modeLabel: `${output.modeLabel ?? 'Avec Decorator'}`,
    useDecorator: `${output.mode ?? 'WITH_DECORATOR'}` !== 'WITHOUT_DECORATOR',
    characterName: `${output.characterName ?? 'Ember Knight'}`,
    baseLabel: `${output.baseLabel ?? stack[0]?.layerLabel ?? 'BaseCharacter'}`,
    baseType: `${output.baseType ?? 'WARRIOR'}`,
    decoratorCount: safeNumber(output.decoratorCount, Math.max(0, stack.length - 1)),
    attack: safeNumber(output.attack, stack[stack.length - 1]?.attack ?? 0),
    defense: safeNumber(output.defense, stack[stack.length - 1]?.defense ?? 0),
    speed: safeNumber(output.speed, stack[stack.length - 1]?.speed ?? 0),
    control: safeNumber(output.control, stack[stack.length - 1]?.control ?? 0),
    activeEffects: Array.isArray(output.activeEffects) ? output.activeEffects : [],
    challengeGoal: `${output.challengeGoal ?? 'attaque >= 20 et defense >= 10'}`,
    challengeMet: Boolean(output.challengeMet),
    classExplosionExamples: Array.isArray(output.classExplosionExamples) ? output.classExplosionExamples : [],
    stack,
    decoratorLayers: stack.filter((layer) => layer.code !== 'BASE'),
  }
}

function renderDecoratorScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractDecoratorModel(execution)

  if (!model) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  const viewBoxWidth = 1260
  const leftX = 36
  const leftWidth = 272
  const stackX = 354
  const stackWidth = 308
  const stackCardHeight = 92
  const stackGap = 18
  const stackTop = 156
  const displayLayers = [...model.decoratorLayers].reverse()
  const baseY = stackTop + displayLayers.length * (stackCardHeight + stackGap) + 20
  const baseHeight = 108
  const finalX = 716
  const finalWidth = 510
  const finalY = 140
  const finalHeight = 596
  const classIntroLines = wrapText('Un effet de plus creerait une nouvelle sous-classe.', 30)
  const classExamples = (model.classExplosionExamples.length > 0 ? model.classExplosionExamples : ['BaseFireShield']).slice(0, 3)
  const activeEffects = (model.activeEffects.length > 0 ? model.activeEffects : ['Socle de base']).slice(0, 6)
  const activeEffectsHeight = Math.max(238, 128 + activeEffects.length * 34)
  const activeEffectsY = 354
  const wrapperOrderY = finalY + 446
  const wrapperOrderHeight = finalHeight - (wrapperOrderY - finalY) - 30
  const viewBoxHeight = Math.max(860, baseY + baseHeight + 56, activeEffectsY + activeEffectsHeight + 24)
  const defsId = `decorator-scene-${isExpanded ? 'expanded' : 'compact'}`
  const outermostY = displayLayers.length > 0 ? stackTop + stackCardHeight / 2 : baseY + baseHeight / 2
  const linkPath = `M ${stackX + stackWidth} ${outermostY} C 692 ${outermostY} 682 ${finalY + 214} ${finalX} ${finalY + 214}`
  const finalStats = [
    { label: 'ATK', value: model.attack },
    { label: 'DEF', value: model.defense },
    { label: 'SPD', value: model.speed },
    { label: 'CTRL', value: model.control },
  ]
  const challengeGoalLines = wrapText(`${model.baseLabel} · ${model.challengeGoal}`, 34)

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Stack Builder
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
            </marker>
            <radialGradient id={`${defsId}-bg-left`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(36,107,94,0.18)" />
              <stop offset="100%" stopColor="rgba(36,107,94,0)" />
            </radialGradient>
            <radialGradient id={`${defsId}-bg-right`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(194,87,55,0.14)" />
              <stop offset="100%" stopColor="rgba(194,87,55,0)" />
            </radialGradient>
          </defs>

          <circle cx="158" cy="154" r="118" fill={`url(#${defsId}-bg-left)`} />
          <circle cx="972" cy="220" r="136" fill={`url(#${defsId}-bg-right)`} />

          <rect
            x={leftX}
            y="144"
            width={leftWidth}
            height="186"
            rx="28"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={leftX + 22} y="174" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            SANS DECORATOR
          </text>
          <text x={leftX + 22} y="206" fontSize="24" fontWeight="700" fill="#241f18">
            Explosion de classes
          </text>
          {classIntroLines.map((line, index) => (
            <text key={`class-intro-${index}`} x={leftX + 22} y={232 + index * 16} fontSize="13" fill="#5f5548">
              {line}
            </text>
          ))}
          <foreignObject x={leftX + 18} y="264" width={leftWidth - 36} height="54">
            <div className="flex h-full flex-col gap-2 overflow-hidden" xmlns="http://www.w3.org/1999/xhtml">
              {classExamples.map((name) => (
                <div
                  key={name}
                  className="rounded-full bg-[rgba(231,198,167,0.26)] px-3 py-1 text-[11px] leading-4 text-[#5f2d20]"
                >
                  {name}
                </div>
              ))}
            </div>
          </foreignObject>

          <rect
            x={leftX}
            y={activeEffectsY}
            width={leftWidth}
            height={activeEffectsHeight}
            rx="28"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={leftX + 22} y={activeEffectsY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            EFFETS ACTIFS
          </text>
          <text x={leftX + 22} y={activeEffectsY + 62} fontSize="24" fontWeight="700" fill="#241f18">
            {model.decoratorCount.toLocaleString('fr-FR')} couche(s)
          </text>
          <foreignObject x={leftX + 18} y={activeEffectsY + 82} width={leftWidth - 36} height={activeEffectsHeight - 100}>
            <div className="flex h-full flex-col gap-2 overflow-y-auto pr-1" xmlns="http://www.w3.org/1999/xhtml">
              {activeEffects.map((effect, index) => (
                <div
                  key={`${effect}-${index}`}
                  className={`rounded-2xl px-3 py-2 text-[11px] leading-4 ${
                    index === 0
                      ? 'bg-[rgba(255,244,220,0.94)] text-[#3d2d20]'
                      : 'bg-[rgba(211,236,230,0.7)] text-[#153f38]'
                  }`}
                >
                  {effect}
                </div>
              ))}
            </div>
          </foreignObject>

          <text x={stackX} y="118" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useDecorator ? 'PILE DE WRAPPERS' : 'CLASSE COMBINEE'}
          </text>

          {displayLayers.map((layer, index) => {
            const swatch = DECORATOR_SWATCHES[layer.code] ?? DECORATOR_SWATCHES.BASE
            const y = stackTop + index * (stackCardHeight + stackGap)
            const wrappedTargetY = index === displayLayers.length - 1
              ? baseY + baseHeight / 2
              : y + stackCardHeight + stackGap + stackCardHeight / 2

            return (
              <g key={`${layer.code}-${index}`}>
                <rect
                  x={stackX}
                  y={y}
                  width={stackWidth}
                  height={stackCardHeight}
                  rx="24"
                  fill={swatch.fill}
                  stroke={swatch.stroke}
                  strokeWidth="2.2"
                  className="scene-node-shadow"
                />
                <text x={stackX + 22} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="rgba(36,31,24,0.58)">
                  DECORATOR
                </text>
                <text x={stackX + 22} y={y + 50} fontSize="20" fontWeight="700" fill={swatch.text}>
                  {layer.layerLabel}
                </text>
                <text x={stackX + 22} y={y + 72} fontSize="12" fill={swatch.text}>
                  ATK {layer.attack} · DEF {layer.defense} · SPD {layer.speed} · CTRL {layer.control}
                </text>

                <path
                  d={`M ${stackX + stackWidth / 2} ${y + stackCardHeight} L ${stackX + stackWidth / 2} ${wrappedTargetY - 10}`}
                  fill="none"
                  stroke={swatch.stroke}
                  strokeWidth="2.6"
                  strokeDasharray="8 7"
                  markerEnd={`url(#${defsId}-arrow)`}
                />
              </g>
            )
          })}

          <rect
            x={stackX}
            y={baseY}
            width={stackWidth}
            height={baseHeight}
            rx="26"
            fill={DECORATOR_SWATCHES.BASE.fill}
            stroke={DECORATOR_SWATCHES.BASE.stroke}
            strokeWidth="2.2"
            className="scene-node-shadow"
          />
          <text x={stackX + 22} y={baseY + 26} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="rgba(36,31,24,0.58)">
            COMPONENT
          </text>
          <text x={stackX + 22} y={baseY + 56} fontSize="22" fontWeight="700" fill="#241f18">
            {model.baseLabel}
          </text>
          <text x={stackX + 22} y={baseY + 80} fontSize="12" fill="#5f5548">
            {model.characterName}
          </text>

          <path
            d={linkPath}
            fill="none"
            stroke="#7a5a3f"
            strokeWidth="3"
            strokeDasharray="12 8"
            markerEnd={`url(#${defsId}-arrow)`}
            className="scene-flow-line"
          />
          <circle r="5" fill="#c25737" opacity="0.92">
            <animateMotion dur="2.1s" repeatCount="indefinite" path={linkPath} />
          </circle>

          <rect
            x={finalX}
            y={finalY}
            width={finalWidth}
            height={finalHeight}
            rx="34"
            fill="rgba(255,250,242,0.98)"
            stroke={model.challengeMet ? '#246b5e' : 'rgba(36,31,24,0.12)'}
            strokeWidth={model.challengeMet ? '2.8' : '2'}
            className="scene-node-shadow"
          />
          <text x={finalX + 28} y={finalY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useDecorator ? 'BUILD FINAL' : 'BUILD FINAL MONOLITHIQUE'}
          </text>
          <text x={finalX + 28} y={finalY + 64} fontSize="30" fontWeight="700" fill="#241f18">
            {model.characterName}
          </text>
          {challengeGoalLines.map((line, index) => (
            <text key={`challenge-line-${index}`} x={finalX + 28} y={finalY + 92 + index * 18} fontSize="14" fill="#5f5548">
              {line}
            </text>
          ))}

          <g transform={`translate(${finalX + 382} ${finalY + 172})`}>
            <circle r="82" fill="rgba(36,31,24,0.95)" />
            <circle r="56" fill="rgba(255,250,242,0.12)" />
            {model.decoratorLayers.map((layer, index) => {
              const swatch = DECORATOR_SWATCHES[layer.code] ?? DECORATOR_SWATCHES.BASE
              const radius = 98 + index * 18
              const duration = `${14 - Math.min(index, 4) * 2}s`

              return (
                <circle
                  key={`${layer.code}-aura`}
                  r={radius}
                  fill="none"
                  stroke={swatch.stroke}
                  strokeWidth="10"
                  strokeOpacity="0.26"
                  strokeDasharray="18 22"
                >
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    from={`0 0 0`}
                    to={`${index % 2 === 0 ? 360 : -360} 0 0`}
                    dur={duration}
                    repeatCount="indefinite"
                  />
                </circle>
              )
            })}
            <path d="M -28 28 Q 0 -78 28 28" fill="none" stroke="#fff8ee" strokeWidth="10" strokeLinecap="round" />
            <circle cx="-18" cy="-6" r="7" fill="#fff8ee" />
            <circle cx="18" cy="-6" r="7" fill="#fff8ee" />
          </g>

          <rect
            x={finalX + 28}
            y={finalY + 128}
            width="164"
            height="30"
            rx="15"
            fill={model.challengeMet ? 'rgba(36,107,94,0.16)' : 'rgba(194,87,55,0.14)'}
            stroke={model.challengeMet ? 'rgba(36,107,94,0.2)' : 'rgba(194,87,55,0.18)'}
          />
          <text x={finalX + 110} y={finalY + 148} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.16em" fill={model.challengeMet ? '#153f38' : '#5f2d20'}>
            {model.challengeMet ? 'OBJECTIF VALIDE' : 'BUILD A OPTIMISER'}
          </text>

          {finalStats.map((stat, index) => {
            const x = finalX + 28 + (index % 2) * 184
            const y = finalY + 270 + Math.floor(index / 2) * 84
            return (
              <g key={stat.label}>
                <rect
                  x={x}
                  y={y}
                  width="166"
                  height="64"
                  rx="22"
                  fill="rgba(255,249,239,0.98)"
                  stroke="rgba(36,31,24,0.1)"
                />
                <text x={x + 18} y={y + 22} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#7a6c5d">
                  {stat.label}
                </text>
                <text x={x + 18} y={y + 50} fontSize="24" fontWeight="700" fill="#241f18">
                  {stat.value}
                </text>
              </g>
            )
          })}

          <text x={finalX + 28} y={wrapperOrderY} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            WRAPPER ORDER
          </text>
          <foreignObject x={finalX + 28} y={wrapperOrderY + 16} width={finalWidth - 56} height={wrapperOrderHeight}>
            <div className="flex h-full flex-wrap content-start gap-2 overflow-y-auto pr-1" xmlns="http://www.w3.org/1999/xhtml">
              {model.stack.map((layer, index) => {
                const swatch = DECORATOR_SWATCHES[layer.code] ?? DECORATOR_SWATCHES.BASE

                return (
                  <div
                    key={`${layer.code}-pill-${index}`}
                    className="rounded-full px-3 py-1 text-[11px] leading-4"
                    style={{
                      backgroundColor: swatch.glow,
                      color: swatch.text,
                    }}
                  >
                    {index + 1}. {layer.code === 'BASE' ? model.baseLabel : layer.code}
                  </div>
                )
              })}
            </div>
          </foreignObject>
        </svg>
      </ZoomableViewport>
    </div>
  )
}

function renderStateScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractStateModel(execution)

  if (!model) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  const viewBoxWidth = 1120
  const graphX = 36
  const graphY = 170
  const graphWidth = 1048
  const graphHeight = isExpanded ? 820 : 720
  const timelineX = graphX
  const timelineY = graphY + graphHeight + 28
  const timelineWidth = graphWidth
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.timeline.length / timelineColumns))
  const timelineRowHeight = isExpanded ? 142 : 150
  const timelineGap = 12
  const timelineHeight = 124 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `state-scene-${isExpanded ? 'expanded' : 'compact'}`
  const contextDescriptionLines = wrapText(
    model.useState
      ? 'delegue chaque action a l etat courant'
      : 'decide chaque transition via des conditions centrales',
    28,
  )
  const summaryActionLines = wrapText(
    `prochaines actions : ${model.availableActions.join(' · ') || 'aucune'}`,
    30,
  )
  const latestStep = model.timeline[model.timeline.length - 1] ?? null
  const latestAcceptedStep = [...model.timeline].reverse().find((step) => step.accepted) ?? null

  const stateNodes = {
    IDLE: { x: graphX + 110, y: graphY + 314, width: 230, height: 108 },
    RUNNING: { x: graphX + 412, y: graphY + 158, width: 238, height: 108 },
    ATTACKING: { x: graphX + 718, y: graphY + 314, width: 236, height: 108 },
    JUMPING: { x: graphX + 412, y: graphY + 520, width: 238, height: 108 },
  }

  const activeStateNode = stateNodes[model.finalState]
  const contextCard = {
    x: graphX + 28,
    y: graphY + 28,
    width: 276,
    height: 118,
  }
  const summaryCard = { x: graphX + graphWidth - 318, y: graphY + 42, width: 286, height: 132 }

  const transitionDefinitions = [
    { key: 'idle-run', from: 'IDLE', to: 'RUNNING', action: 'START_RUN', offset: -18, labelShiftY: -46, labelShiftX: -14 },
    { key: 'run-idle', from: 'RUNNING', to: 'IDLE', action: 'STOP', offset: 18, labelShiftY: 46, labelShiftX: 12 },
    { key: 'idle-jump', from: 'IDLE', to: 'JUMPING', action: 'JUMP', offset: -14, labelShiftX: -10 },
    { key: 'run-jump', from: 'RUNNING', to: 'JUMPING', action: 'JUMP', offset: 0 },
    { key: 'jump-idle', from: 'JUMPING', to: 'IDLE', action: 'LAND', offset: 14, labelShiftY: 26 },
    { key: 'idle-attack', from: 'IDLE', to: 'ATTACKING', action: 'ATTACK', offset: -22, labelShiftY: -52 },
    { key: 'run-attack', from: 'RUNNING', to: 'ATTACKING', action: 'ATTACK', offset: 16, labelShiftY: -20, labelShiftX: 18 },
    { key: 'attack-idle', from: 'ATTACKING', to: 'IDLE', action: 'FINISH_ATTACK', offset: 22, labelShiftY: 52, labelShiftX: 22 },
  ]

  const transitionUsage = model.timeline.reduce((accumulator, step) => {
    if (!step.accepted) {
      return accumulator
    }

    const key = `${step.fromState}->${step.toState}:${step.actionCode}`
    accumulator[key] = (accumulator[key] ?? 0) + 1
    return accumulator
  }, {})
  const latestAcceptedTransitionKey = latestAcceptedStep
    ? `${latestAcceptedStep.fromState}->${latestAcceptedStep.toState}:${latestAcceptedStep.actionCode}`
    : null

  const getAnchor = (box, side) => {
    if (side === 'left') {
      return { x: box.x, y: box.y + box.height / 2 }
    }

    if (side === 'top') {
      return { x: box.x + box.width / 2, y: box.y }
    }

    if (side === 'bottom') {
      return { x: box.x + box.width / 2, y: box.y + box.height }
    }

    return { x: box.x + box.width, y: box.y + box.height / 2 }
  }

  const buildPathBetweenStates = (fromCode, toCode, offset = 0) => {
    const from = stateNodes[fromCode]
    const to = stateNodes[toCode]
    const fromCenterX = from.x + from.width / 2
    const fromCenterY = from.y + from.height / 2
    const toCenterX = to.x + to.width / 2
    const toCenterY = to.y + to.height / 2
    const dx = toCenterX - fromCenterX
    const dy = toCenterY - fromCenterY
    const horizontal = Math.abs(dx) >= Math.abs(dy)
    const start = horizontal
      ? getAnchor(from, dx >= 0 ? 'right' : 'left')
      : getAnchor(from, dy >= 0 ? 'bottom' : 'top')
    const end = horizontal
      ? getAnchor(to, dx >= 0 ? 'left' : 'right')
      : getAnchor(to, dy >= 0 ? 'top' : 'bottom')

    if (horizontal) {
      const curve = Math.max(72, Math.abs(dx) * 0.36)
      return `M ${start.x} ${start.y + offset} C ${start.x + Math.sign(dx) * curve} ${start.y + offset} ${end.x - Math.sign(dx) * curve} ${end.y + offset} ${end.x} ${end.y + offset}`
    }

    const curve = Math.max(72, Math.abs(dy) * 0.36)
    return `M ${start.x + offset} ${start.y} C ${start.x + offset} ${start.y + Math.sign(dy) * curve} ${end.x + offset} ${end.y - Math.sign(dy) * curve} ${end.x + offset} ${end.y}`
  }

  const getLabelPosition = (fromCode, toCode, offset = 0, shiftX = 0, shiftY = 0) => {
    const from = stateNodes[fromCode]
    const to = stateNodes[toCode]
    return {
      x: (from.x + from.width / 2 + to.x + to.width / 2) / 2 + (Math.abs(offset) > 0 ? offset * 1.3 : 0) + shiftX,
      y: (from.y + from.height / 2 + to.y + to.height / 2) / 2 - 10 + offset * 0.25 + shiftY,
    }
  }

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Character State Simulator
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(211,236,230,0.86)" />
            </linearGradient>
            <marker
              id={`${defsId}-arrow`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker
              id={`${defsId}-arrow-muted`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#b7aa99" />
            </marker>
          </defs>

          <rect
            x="36"
            y="44"
            width="1048"
            height="92"
            rx="32"
            fill={`url(#${defsId}-metrics)`}
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x="64" y="80" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useState ? 'STATE MACHINE' : 'CONDITIONAL FLOW'}
          </text>
          <text x="64" y="112" fontSize="28" fontWeight="700" fill="#241f18">
            {model.characterName} · {model.currentStateLabel}
          </text>
          <text x="392" y="86" fontSize="13" fontWeight="600" fill="#5f5548">
            Etat initial : {STATE_LABELS[model.initialState] ?? model.initialState}
          </text>
          <text x="392" y="112" fontSize="13" fontWeight="600" fill="#5f5548">
            Etat final : {STATE_LABELS[model.finalState] ?? model.finalState}
          </text>
          <text x="1056" y="82" textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {model.acceptedTransitions} transition(s)
          </text>
          <text x="1056" y="108" textAnchor="end" fontSize="13" fill="#5f5548">
            {model.ignoredActions} action(s) ignoree(s)
          </text>
          {latestStep ? (
            <text x="1056" y="130" textAnchor="end" fontSize="12" fontWeight="600" fill="#5f5548">
              Derniere action : {latestStep.actionCode}
            </text>
          ) : null}

          <rect
            x={graphX}
            y={graphY}
            width={graphWidth}
            height={graphHeight}
            rx="34"
            fill="rgba(255,250,242,0.94)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={graphX + 24} y={graphY + 24} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            GRAPHE DES ETATS
          </text>

          <rect
            x={contextCard.x}
            y={contextCard.y}
            width={contextCard.width}
            height={contextCard.height}
            rx="24"
            fill="rgba(211,236,230,0.94)"
            stroke="#246b5e"
            strokeWidth="2"
            className="scene-node-shadow"
          />
          <text x={contextCard.x + 18} y={contextCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#577166">
            CONTEXT
          </text>
          <text x={contextCard.x + 18} y={contextCard.y + 50} fontSize="20" fontWeight="700" fill="#153f38">
            {model.useState ? 'CharacterContext' : 'SwitchController'}
          </text>
          {contextDescriptionLines.map((line, index) => (
            <text
              key={`context-line-${index}`}
              x={contextCard.x + 18}
              y={contextCard.y + 76 + index * 16}
              fontSize="12"
              fill="#215247"
            >
              {line}
            </text>
          ))}

          <rect
            x={summaryCard.x}
            y={summaryCard.y}
            width={summaryCard.width}
            height={summaryCard.height}
            rx="24"
            fill="rgba(245,227,210,0.92)"
            stroke="#c25737"
            strokeWidth="2"
            className="scene-node-shadow"
          />
          <text x={summaryCard.x + 18} y={summaryCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
            ETAT ACTIF
          </text>
          <text x={summaryCard.x + 18} y={summaryCard.y + 52} fontSize="24" fontWeight="700" fill="#5f2d20">
            {STATE_LABELS[model.finalState] ?? model.finalState}
          </text>
          {summaryActionLines.map((line, index) => (
            <text
              key={`summary-line-${index}`}
              x={summaryCard.x + 18}
              y={summaryCard.y + 80 + index * 16}
              fontSize="12"
              fill="#7a4634"
            >
              {line}
            </text>
          ))}

          <path
            d={`M ${contextCard.x + contextCard.width} ${contextCard.y + contextCard.height / 2} L ${
              contextCard.x + contextCard.width + 74
            } ${contextCard.y + contextCard.height / 2} L ${
              contextCard.x + contextCard.width + 74
            } ${activeStateNode.y + activeStateNode.height / 2} L ${
              activeStateNode.x <= contextCard.x + contextCard.width
                ? activeStateNode.x + activeStateNode.width
                : activeStateNode.x
            } ${activeStateNode.y + activeStateNode.height / 2}`}
            fill="none"
            stroke="#246b5e"
            strokeWidth="2.8"
            strokeDasharray="12 8"
            markerEnd={`url(#${defsId}-arrow)`}
            className="scene-flow-line"
          />

          {transitionDefinitions.map((transition) => {
            const path = buildPathBetweenStates(transition.from, transition.to, transition.offset)
            const count = transitionUsage[`${transition.from}->${transition.to}:${transition.action}`] ?? 0
            const isActive = count > 0
            const isRecent = latestAcceptedTransitionKey === `${transition.from}->${transition.to}:${transition.action}`
            const labelPosition = getLabelPosition(
              transition.from,
              transition.to,
              transition.offset,
              transition.labelShiftX ?? 0,
              transition.labelShiftY ?? 0,
            )
            const labelWidth = Math.max(78, Math.ceil(estimateTextWidth(transition.action, 10) + 24))

            return (
              <g key={transition.key}>
                <path
                  d={path}
                  fill="none"
                  stroke={isRecent ? '#c25737' : isActive ? '#246b5e' : 'rgba(143,127,107,0.68)'}
                  strokeWidth={isRecent ? '4.2' : isActive ? '3.4' : '2.2'}
                  strokeDasharray={isRecent ? '16 8' : isActive ? '14 8' : '0'}
                  markerEnd={`url(#${defsId}-${isActive || isRecent ? 'arrow' : 'arrow-muted'})`}
                  className={isRecent ? 'state-recent-path' : isActive ? 'scene-flow-line' : ''}
                />
                {isRecent ? (
                  <circle r="5.5" fill="#c25737" opacity="0.96">
                    <animateMotion dur="1.55s" repeatCount="indefinite" path={path} />
                  </circle>
                ) : null}
                <rect
                  x={labelPosition.x - labelWidth / 2}
                  y={labelPosition.y - 12}
                  width={labelWidth}
                  height="22"
                  rx="11"
                  fill={isRecent ? 'rgba(245,227,210,0.98)' : isActive ? 'rgba(211,236,230,0.96)' : 'rgba(255,250,242,0.92)'}
                  stroke={isRecent ? 'rgba(194,87,55,0.2)' : isActive ? 'rgba(36,107,94,0.16)' : 'rgba(36,31,24,0.08)'}
                />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="0.14em"
                  fill={isRecent ? '#8b3620' : isActive ? '#153f38' : '#6d6459'}
                >
                  {transition.action}
                </text>
                {count > 0 ? (
                  <text
                    x={labelPosition.x + labelWidth / 2 + 8}
                    y={labelPosition.y + 3}
                    fontSize="10"
                    fontWeight="700"
                    fill={isRecent ? '#c25737' : '#246b5e'}
                  >
                    x{count}
                  </text>
                ) : null}
              </g>
            )
          })}

          {Object.entries(stateNodes).map(([code, node]) => {
            const isActive = model.finalState === code
            const isVisited = model.visitedStates.includes(code)

            return (
              <g key={code}>
                {isActive ? (
                  <rect
                    x={node.x - 10}
                    y={node.y - 10}
                    width={node.width + 20}
                    height={node.height + 20}
                    rx="34"
                    fill="rgba(194,87,55,0.08)"
                    stroke="rgba(194,87,55,0.22)"
                    strokeWidth="2"
                    className="state-active-halo"
                  />
                ) : null}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx="28"
                  fill={isActive ? '#241f18' : isVisited ? 'rgba(255,244,220,0.98)' : 'rgba(255,250,242,0.95)'}
                  stroke={isActive ? '#241f18' : isVisited ? '#9a7130' : 'rgba(36,31,24,0.12)'}
                  strokeWidth="2"
                  className="scene-node-shadow"
                />
                <text
                  x={node.x + 18}
                  y={node.y + 24}
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="0.18em"
                  fill={isActive ? 'rgba(255,248,238,0.7)' : isVisited ? '#7a571f' : '#7f7469'}
                >
                  {isActive ? 'ACTIVE STATE' : isVisited ? 'VISITED STATE' : 'STATE'}
                </text>
                <text
                  x={node.x + 18}
                  y={node.y + 54}
                  fontSize="22"
                  fontWeight="700"
                  fill={isActive ? '#fff8ee' : isVisited ? '#5c4218' : '#241f18'}
                >
                  {STATE_LABELS[code]}
                </text>
                <text
                  x={node.x + 18}
                  y={node.y + 80}
                  fontSize="12"
                  fill={isActive ? 'rgba(255,248,238,0.74)' : isVisited ? '#7a571f' : '#5f5548'}
                >
                  {code}
                </text>
                {isActive ? (
                  <text
                    x={node.x + node.width - 18}
                    y={node.y + 24}
                    textAnchor="end"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.18em"
                    fill="#f1b29e"
                  >
                    NOW
                  </text>
                ) : null}
              </g>
            )
          })}

          <rect
            x={timelineX}
            y={timelineY}
            width={timelineWidth}
            height={timelineHeight}
            rx="34"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={timelineX + 24} y={timelineY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            TIMELINE
          </text>
          <text x={timelineX + 24} y={timelineY + 62} fontSize="24" fontWeight="700" fill="#241f18">
            {model.actionCount} action(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 88} fontSize="13" fill="#5f5548">
            les transitions refusees restent visibles pour comprendre les limites de chaque etat
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 106} width={timelineWidth - 32} height={timelineHeight - 130}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div
                className="grid gap-3 pb-2"
                style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}
              >
                {model.timeline.map((step) => (
                  <div
                    key={`${step.index}-${step.actionCode}`}
                    className={`min-h-[132px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${
                      latestStep && step.index === latestStep.index
                        ? step.accepted
                          ? 'state-recent-card border-orange-200 bg-orange-50/95'
                          : 'state-recent-card border-amber-300 bg-amber-50/96'
                        : step.accepted
                          ? 'border-emerald-200 bg-emerald-50/90'
                          : 'border-amber-200 bg-amber-50/92'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Step {step.index}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        latestStep && step.index === latestStep.index
                          ? step.accepted
                            ? 'text-orange-800'
                            : 'text-amber-900'
                          : step.accepted ? 'text-emerald-800' : 'text-amber-900'
                      }`}>
                        {latestStep && step.index === latestStep.index
                          ? step.accepted ? 'dernier move' : 'dernier essai'
                          : step.accepted ? 'transition acceptee' : 'action ignoree'}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-stone-900">{step.actionCode}</p>
                    <p className="mt-1 text-[12px] text-stone-700">
                      {STATE_LABELS[step.fromState] ?? step.fromState} → {STATE_LABELS[step.toState] ?? step.toState}
                    </p>
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

function renderChainScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractChainModel(execution)

  if (!model) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  const viewBoxWidth = 1120
  const metricsX = 36
  const metricsY = 40
  const metricsWidth = 1048
  const metricsHeight = 102
  const pipelineX = 36
  const pipelineY = 166
  const pipelineWidth = 1048
  const pipelineHeight = 320
  const requestCard = { x: 58, y: 282, width: 212, height: 120 }
  const stageY = 260
  const stageWidth = isExpanded ? 202 : 194
  const stageHeight = 126
  const stageGap = 28
  const stageStartX = 326
  const stageOrder = ['AUTH', 'VALIDATION', 'PROCESSING']
  const stageBoxes = stageOrder.reduce((accumulator, code, index) => {
    accumulator[code] = {
      x: stageStartX + index * (stageWidth + stageGap),
      y: stageY,
      width: stageWidth,
      height: stageHeight,
    }
    return accumulator
  }, {})
  const resultCard = { x: 350, y: 516, width: 420, height: 116 }
  const timelineX = pipelineX
  const timelineY = resultCard.y + resultCard.height + 24
  const timelineWidth = pipelineWidth
  const timelineColumns = 3
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 126
  const timelineGap = 12
  const timelineHeight = 120 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 36
  const defsId = `chain-scene-${isExpanded ? 'expanded' : 'compact'}`
  const stepByCode = Object.fromEntries(model.steps.map((step) => [step.handlerCode, step]))
  const lastStep = model.steps[model.steps.length - 1]
  const rejected = !model.accepted

  const segmentColor = (active, critical = false) => (
    critical ? '#c25737' : active ? '#246b5e' : 'rgba(143,127,107,0.48)'
  )

  const requestAnchor = {
    x: requestCard.x + requestCard.width,
    y: requestCard.y + requestCard.height / 2,
  }
  const authLeft = {
    x: stageBoxes.AUTH.x,
    y: stageBoxes.AUTH.y + stageBoxes.AUTH.height / 2,
  }
  const authRight = {
    x: stageBoxes.AUTH.x + stageBoxes.AUTH.width,
    y: stageBoxes.AUTH.y + stageBoxes.AUTH.height / 2,
  }
  const validationLeft = {
    x: stageBoxes.VALIDATION.x,
    y: stageBoxes.VALIDATION.y + stageBoxes.VALIDATION.height / 2,
  }
  const validationRight = {
    x: stageBoxes.VALIDATION.x + stageBoxes.VALIDATION.width,
    y: stageBoxes.VALIDATION.y + stageBoxes.VALIDATION.height / 2,
  }
  const processingLeft = {
    x: stageBoxes.PROCESSING.x,
    y: stageBoxes.PROCESSING.y + stageBoxes.PROCESSING.height / 2,
  }
  const processingBottom = {
    x: stageBoxes.PROCESSING.x + stageBoxes.PROCESSING.width / 2,
    y: stageBoxes.PROCESSING.y + stageBoxes.PROCESSING.height,
  }
  const authBottom = {
    x: stageBoxes.AUTH.x + stageBoxes.AUTH.width / 2,
    y: stageBoxes.AUTH.y + stageBoxes.AUTH.height,
  }
  const validationBottom = {
    x: stageBoxes.VALIDATION.x + stageBoxes.VALIDATION.width / 2,
    y: stageBoxes.VALIDATION.y + stageBoxes.VALIDATION.height,
  }
  const resultTop = {
    x: resultCard.x + resultCard.width / 2,
    y: resultCard.y,
  }

  const requestToAuthPath = `M ${requestAnchor.x} ${requestAnchor.y} L ${authLeft.x} ${authLeft.y}`
  const authToValidationPath = `M ${authRight.x} ${authRight.y} L ${validationLeft.x} ${validationLeft.y}`
  const validationToProcessingPath = `M ${validationRight.x} ${validationRight.y} L ${processingLeft.x} ${processingLeft.y}`
  const processingToResultPath = `M ${processingBottom.x} ${processingBottom.y} L ${processingBottom.x} ${resultTop.y - 20} L ${resultTop.x} ${resultTop.y - 20} L ${resultTop.x} ${resultTop.y}`
  const authToResultPath = `M ${authBottom.x} ${authBottom.y} L ${authBottom.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y}`
  const validationToResultPath = `M ${validationBottom.x} ${validationBottom.y} L ${validationBottom.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y}`

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Validation Pipeline
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
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
            <marker id={`${defsId}-arrow-danger`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect
            x={metricsX}
            y={metricsY}
            width={metricsWidth}
            height={metricsHeight}
            rx="32"
            fill={`url(#${defsId}-metrics)`}
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={metricsX + 28} y={metricsY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            RESPONSIBILITY FLOW
          </text>
          <text x={metricsX + 28} y={metricsY + 66} fontSize="30" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={metricsX + 28} y={metricsY + 90} fontSize="13" fill="#5f5548">
            {model.requestName} · {model.processingTargetLabel}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 58} textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {model.accepted ? 'ACCEPTEE' : 'REJETEE'}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.passedHandlers}/{model.stepCount} maillon(x)
          </text>

          <rect
            x={pipelineX}
            y={pipelineY}
            width={pipelineWidth}
            height={pipelineHeight}
            rx="34"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={pipelineX + 24} y={pipelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            PIPELINE
          </text>

          {!model.useChain ? (
            <g>
              <rect
                x={pipelineX + 24}
                y={pipelineY + 44}
                width="520"
                height="44"
                rx="18"
                fill="rgba(245,227,210,0.88)"
                stroke="rgba(194,87,55,0.18)"
                strokeWidth="1.5"
              />
              <text x={pipelineX + 44} y={pipelineY + 71} fontSize="12" fontWeight="600" fill="#7a4634">
                Sans pattern, un RequestController enchaine tous les checks en inline.
              </text>
            </g>
          ) : null}

          <g>
            <rect
              x={requestCard.x}
              y={requestCard.y}
              width={requestCard.width}
              height={requestCard.height}
              rx="28"
              fill="rgba(231,198,167,0.9)"
              stroke="#c25737"
              strokeWidth="2"
              className="scene-node-shadow"
            />
            <text x={requestCard.x + 18} y={requestCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              REQUEST
            </text>
            {wrapText(model.requestName, 18).slice(0, 2).map((line, index) => (
              <text
                key={`chain-request-${index}`}
                x={requestCard.x + 18}
                y={requestCard.y + 52 + index * 20}
                fontSize="20"
                fontWeight="700"
                fill="#5f2d20"
              >
                {line}
              </text>
            ))}
            <text x={requestCard.x + 18} y={requestCard.y + 94} fontSize="12" fill="#7a4634">
              {model.tokenLabel}
            </text>
            <text x={requestCard.x + 18} y={requestCard.y + 112} fontSize="12" fill="#7a4634">
              {model.payloadLabel}
            </text>
          </g>

          <path
            d={requestToAuthPath}
            fill="none"
            stroke={segmentColor(model.visitedHandlers.includes('AUTH'))}
            strokeWidth="3"
            strokeDasharray={model.visitedHandlers.includes('AUTH') ? '14 8' : '0'}
            markerEnd={`url(#${defsId}-arrow)`}
            className={model.visitedHandlers.includes('AUTH') ? 'scene-flow-line' : ''}
          />
          {model.visitedHandlers.includes('AUTH') ? (
            <circle r="5" fill="#246b5e" opacity="0.95">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={requestToAuthPath} />
            </circle>
          ) : null}

          <path
            d={authToValidationPath}
            fill="none"
            stroke={segmentColor(model.visitedHandlers.includes('VALIDATION'))}
            strokeWidth="3"
            strokeDasharray={model.visitedHandlers.includes('VALIDATION') ? '14 8' : '0'}
            markerEnd={`url(#${defsId}-arrow)`}
            className={model.visitedHandlers.includes('VALIDATION') ? 'scene-flow-line' : ''}
          />
          {model.visitedHandlers.includes('VALIDATION') ? (
            <circle r="5" fill="#246b5e" opacity="0.95">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={authToValidationPath} begin="0.2s" />
            </circle>
          ) : null}

          <path
            d={validationToProcessingPath}
            fill="none"
            stroke={segmentColor(model.visitedHandlers.includes('PROCESSING'))}
            strokeWidth="3"
            strokeDasharray={model.visitedHandlers.includes('PROCESSING') ? '14 8' : '0'}
            markerEnd={`url(#${defsId}-arrow)`}
            className={model.visitedHandlers.includes('PROCESSING') ? 'scene-flow-line' : ''}
          />
          {model.visitedHandlers.includes('PROCESSING') ? (
            <circle r="5" fill="#246b5e" opacity="0.95">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={validationToProcessingPath} begin="0.4s" />
            </circle>
          ) : null}

          <path
            d={model.accepted ? processingToResultPath : model.stoppedAt === 'AUTH' ? authToResultPath : validationToResultPath}
            fill="none"
            stroke={segmentColor(true, rejected)}
            strokeWidth="3.2"
            strokeDasharray="14 8"
            markerEnd={`url(#${defsId}-${rejected ? 'arrow-danger' : 'arrow'})`}
            className="scene-flow-line"
          />
          <circle r="5.2" fill={rejected ? '#c25737' : '#246b5e'} opacity="0.95">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={model.accepted ? processingToResultPath : model.stoppedAt === 'AUTH' ? authToResultPath : validationToResultPath}
              begin="0.55s"
            />
          </circle>

          {stageOrder.map((code) => {
            const box = stageBoxes[code]
            const step = stepByCode[code]
            const visited = model.visitedHandlers.includes(code)
            const isCurrent = model.stoppedAt === code
            const meta = CHAIN_STAGE_META[code]
            const status = step?.status ?? 'PENDING'
            const palette = isCurrent && status === 'REJECTED'
              ? {
                fill: 'rgba(245,227,210,0.96)',
                stroke: '#c25737',
                text: '#5f2d20',
                subtle: '#8b5b49',
              }
              : isCurrent
                ? {
                  fill: '#241f18',
                  stroke: '#241f18',
                  text: '#fff8ee',
                  subtle: 'rgba(255,248,238,0.68)',
                }
                : visited
                  ? {
                    fill: 'rgba(211,236,230,0.96)',
                    stroke: '#246b5e',
                    text: '#153f38',
                    subtle: '#577166',
                  }
                  : {
                    fill: 'rgba(255,250,242,0.96)',
                    stroke: 'rgba(36,31,24,0.12)',
                    text: '#241f18',
                    subtle: '#7f7469',
                  }

            return (
              <g key={code}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  rx="28"
                  fill={palette.fill}
                  stroke={palette.stroke}
                  strokeWidth="2"
                  className="scene-node-shadow"
                />
                <text x={box.x + 18} y={box.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={palette.subtle}>
                  {model.useChain ? 'HANDLER' : 'INLINE CHECK'}
                </text>
                <text x={box.x + 18} y={box.y + 52} fontSize="20" fontWeight="700" fill={palette.text}>
                  {meta.title}
                </text>
                <text x={box.x + 18} y={box.y + 74} fontSize="12" fill={palette.subtle}>
                  {meta.subtitle}
                </text>
                <rect
                  x={box.x + 18}
                  y={box.y + 88}
                  width={Math.max(92, estimateTextWidth(status, 10) + 26)}
                  height="24"
                  rx="12"
                  fill={isCurrent && status === 'REJECTED' ? 'rgba(194,87,55,0.12)' : visited ? 'rgba(255,255,255,0.16)' : 'rgba(36,31,24,0.06)'}
                  stroke={isCurrent && status === 'REJECTED' ? 'rgba(194,87,55,0.2)' : 'transparent'}
                />
                <text x={box.x + 31} y={box.y + 104} fontSize="10" fontWeight="700" letterSpacing="0.14em" fill={palette.text}>
                  {status}
                </text>
              </g>
            )
          })}

          <g>
            <rect
              x={resultCard.x}
              y={resultCard.y}
              width={resultCard.width}
              height={resultCard.height}
              rx="30"
              fill={model.accepted ? 'rgba(211,236,230,0.96)' : 'rgba(245,227,210,0.96)'}
              stroke={model.accepted ? '#246b5e' : '#c25737'}
              strokeWidth="2"
              className="scene-node-shadow"
            />
            <text x={resultCard.x + 22} y={resultCard.y + 26} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.accepted ? '#577166' : '#8b5b49'}>
              OUTCOME
            </text>
            <text x={resultCard.x + 22} y={resultCard.y + 58} fontSize="24" fontWeight="700" fill={model.accepted ? '#153f38' : '#5f2d20'}>
              {model.accepted ? 'Request accepted' : 'Request rejected'}
            </text>
            {wrapText(model.decisionLabel || (model.accepted ? `Traitee par ${model.handledBy}` : `Stoppee par ${model.handledBy}`), 44)
              .slice(0, 2)
              .map((line, index) => (
                <text
                  key={`chain-decision-${index}`}
                  x={resultCard.x + 22}
                  y={resultCard.y + 84 + index * 16}
                  fontSize="12"
                  fill={model.accepted ? '#215247' : '#7a4634'}
                >
                  {line}
                </text>
              ))}
          </g>

          <rect
            x={timelineX}
            y={timelineY}
            width={timelineWidth}
            height={timelineHeight}
            rx="34"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ETAPES DE LA CHAINE
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.stepCount} maillon(x) visite(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            lis la progression de la requete pour voir exactement ou elle est acceptee ou stoppee
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div
                className="grid gap-3 pb-2"
                style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}
              >
                {model.steps.map((step) => {
                  const highlighted = step.index === lastStep.index
                  const cardClassName = highlighted
                    ? step.status === 'REJECTED'
                      ? 'border-orange-200 bg-orange-50/95'
                      : 'border-stone-900 bg-stone-950 text-white'
                    : step.status === 'REJECTED'
                      ? 'border-amber-200 bg-amber-50/92'
                      : 'border-emerald-200 bg-emerald-50/90'

                  return (
                    <div
                      key={`${step.index}-${step.handlerCode}`}
                      className={`min-h-[118px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${cardClassName}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${highlighted && step.status !== 'REJECTED' ? 'text-white/70' : 'text-stone-500'}`}>
                          Step {step.index}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                          highlighted
                            ? step.status === 'REJECTED'
                              ? 'text-orange-900'
                              : 'text-white/72'
                            : step.status === 'REJECTED'
                              ? 'text-amber-900'
                              : 'text-emerald-800'
                        }`}>
                          {step.status}
                        </p>
                      </div>
                      <p className={`mt-2 text-[13px] font-semibold ${highlighted && step.status !== 'REJECTED' ? 'text-white' : 'text-stone-900'}`}>
                        {step.handlerLabel}
                      </p>
                      <p className={`mt-2 text-[12px] leading-5 ${highlighted && step.status !== 'REJECTED' ? 'text-white/78' : 'text-stone-600'}`}>
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

function renderMediatorScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractMediatorModel(execution)

  if (!model) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  const viewBoxWidth = 1120
  const cardHeight = 84
  const cardGap = 18
  const recipientsHeight = model.recipients.length * cardHeight + Math.max(0, model.recipients.length - 1) * cardGap
  const metricsX = 36
  const metricsY = 40
  const metricsWidth = 1048
  const metricsHeight = 104
  const graphX = 36
  const graphY = 168
  const graphWidth = 1048
  const graphHeight = Math.max(isExpanded ? 430 : 380, 210 + recipientsHeight)
  const senderCard = {
    x: 56,
    y: graphY + Math.max(110, (graphHeight - 132) / 2),
    width: 226,
    height: 132,
  }
  const mediatorCard = {
    x: 426,
    y: graphY + Math.max(82, (graphHeight - 170) / 2),
    width: 268,
    height: 170,
  }
  const recipientX = 836
  const recipientStartY = graphY + Math.max(56, (graphHeight - recipientsHeight) / 2)
  const messagePanel = {
    x: 318,
    y: graphY + graphHeight - 112,
    width: 490,
    height: 88,
  }
  const timelineX = graphX
  const timelineY = graphY + graphHeight + 24
  const timelineWidth = graphWidth
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.deliveries.length / timelineColumns))
  const timelineRowHeight = 126
  const timelineGap = 12
  const timelineHeight = 118 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `mediator-scene-${isExpanded ? 'expanded' : 'compact'}`
  const senderAnchor = {
    x: senderCard.x + senderCard.width,
    y: senderCard.y + senderCard.height / 2,
  }
  const mediatorLeft = {
    x: mediatorCard.x,
    y: mediatorCard.y + mediatorCard.height / 2,
  }
  const mediatorRight = {
    x: mediatorCard.x + mediatorCard.width,
    y: mediatorCard.y + mediatorCard.height / 2,
  }
  const messageLines = wrapText(model.message, 44).slice(0, 2)

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Chat Hub Simulator
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(214,228,241,0.82)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-arrow-direct`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect
            x={metricsX}
            y={metricsY}
            width={metricsWidth}
            height={metricsHeight}
            rx="32"
            fill={`url(#${defsId}-metrics)`}
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={metricsX + 28} y={metricsY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            MEDIATOR HUB
          </text>
          <text x={metricsX + 28} y={metricsY + 66} fontSize="30" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={metricsX + 28} y={metricsY + 92} fontSize="13" fill="#5f5548">
            {model.roomName} · {model.deliveryModeLabel}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 58} textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {model.deliveredCount} livraison(s)
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            couplage expediteur : {model.senderCouplingCount}
          </text>

          <rect
            x={graphX}
            y={graphY}
            width={graphWidth}
            height={graphHeight}
            rx="34"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={graphX + 24} y={graphY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            CHAT GRAPH
          </text>

          <g>
            <rect
              x={senderCard.x}
              y={senderCard.y}
              width={senderCard.width}
              height={senderCard.height}
              rx="30"
              fill="rgba(231,198,167,0.9)"
              stroke="#c25737"
              strokeWidth="2"
              className="scene-node-shadow"
            />
            <text x={senderCard.x + 18} y={senderCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              SENDER
            </text>
            <text x={senderCard.x + 18} y={senderCard.y + 54} fontSize="24" fontWeight="700" fill="#5f2d20">
              {model.senderName}
            </text>
            <text x={senderCard.x + 18} y={senderCard.y + 84} fontSize="12" fill="#7a4634">
              {model.useMediator ? 'emet un seul message vers le hub' : `contacte ${model.recipientCount} destinataire(s)`}
            </text>
            <text x={senderCard.x + 18} y={senderCard.y + 106} fontSize="12" fill="#7a4634">
              participants : {model.participantCount}
            </text>
          </g>

          <g opacity={model.useMediator ? 1 : 0.48}>
            <rect
              x={mediatorCard.x}
              y={mediatorCard.y}
              width={mediatorCard.width}
              height={mediatorCard.height}
              rx="34"
              fill={model.useMediator ? '#241f18' : 'rgba(214,228,241,0.72)'}
              stroke={model.useMediator ? '#241f18' : '#426c8d'}
              strokeWidth="2"
              className="scene-node-shadow"
            />
            <text
              x={mediatorCard.x + 22}
              y={mediatorCard.y + 28}
              fontSize="10"
              fontWeight="700"
              letterSpacing="0.18em"
              fill={model.useMediator ? 'rgba(255,248,238,0.64)' : '#6b7a88'}
            >
              {model.useMediator ? 'MEDIATOR HUB' : 'BYPASSED HUB'}
            </text>
            <text
              x={mediatorCard.x + 22}
              y={mediatorCard.y + 68}
              fontSize="28"
              fontWeight="700"
              fill={model.useMediator ? '#fff8ee' : '#27465f'}
            >
              ChatRoomMediator
            </text>
            {wrapText(model.useMediator ? 'coordonne les relais entre participants' : 'present dans le design mais contourne dans les messages directs', 34)
              .slice(0, 3)
              .map((line, index) => (
                <text
                  key={`mediator-card-${index}`}
                  x={mediatorCard.x + 22}
                  y={mediatorCard.y + 96 + index * 18}
                  fontSize="13"
                  fill={model.useMediator ? 'rgba(255,248,238,0.72)' : '#4f6274'}
                >
                  {line}
                </text>
              ))}
          </g>

          {model.useMediator ? (
            <>
              <path
                d={`M ${senderAnchor.x} ${senderAnchor.y} L ${mediatorLeft.x} ${mediatorLeft.y}`}
                fill="none"
                stroke="#246b5e"
                strokeWidth="3"
                strokeDasharray="14 8"
                markerEnd={`url(#${defsId}-arrow)`}
                className="scene-flow-line"
              />
              <circle r="5" fill="#246b5e" opacity="0.96">
                <animateMotion
                  dur="1.7s"
                  repeatCount="indefinite"
                  path={`M ${senderAnchor.x} ${senderAnchor.y} L ${mediatorLeft.x} ${mediatorLeft.y}`}
                />
              </circle>
            </>
          ) : null}

          {model.recipientCount > 0 ? model.recipients.map((recipient, index) => {
            const y = recipientStartY + index * (cardHeight + cardGap)
            const card = { x: recipientX, y, width: 232, height: cardHeight }
            const directPath = `M ${senderAnchor.x} ${senderAnchor.y} L ${card.x} ${card.y + card.height / 2}`
            const relayedPath = `M ${mediatorRight.x} ${mediatorRight.y} L ${card.x} ${card.y + card.height / 2}`

            return (
              <g key={recipient}>
                <rect
                  x={card.x}
                  y={card.y}
                  width={card.width}
                  height={card.height}
                  rx="24"
                  fill="rgba(255,250,242,0.96)"
                  stroke={model.useMediator ? '#246b5e' : '#c25737'}
                  strokeWidth="2"
                  className="scene-node-shadow"
                />
                <text x={card.x + 18} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useMediator ? '#577166' : '#8b5b49'}>
                  RECIPIENT
                </text>
                <text x={card.x + 18} y={card.y + 52} fontSize="20" fontWeight="700" fill="#241f18">
                  {recipient}
                </text>
                <text x={card.x + 18} y={card.y + 70} fontSize="12" fill="#5f5548">
                  {model.useMediator ? `recoit via ${model.roomName}` : 'recoit en direct'}
                </text>

                <path
                  d={model.useMediator ? relayedPath : directPath}
                  fill="none"
                  stroke={model.useMediator ? '#246b5e' : '#c25737'}
                  strokeWidth="3"
                  strokeDasharray="14 8"
                  markerEnd={`url(#${defsId}-${model.useMediator ? 'arrow' : 'arrow-direct'})`}
                  className="scene-flow-line"
                />
                <circle r="5" fill={model.useMediator ? '#246b5e' : '#c25737'} opacity="0.96">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="indefinite"
                    path={model.useMediator ? relayedPath : directPath}
                    begin={`${index * 0.18}s`}
                  />
                </circle>
              </g>
            )
          }) : null}

          <g>
            <rect
              x={messagePanel.x}
              y={messagePanel.y}
              width={messagePanel.width}
              height={messagePanel.height}
              rx="24"
              fill="rgba(255,244,220,0.96)"
              stroke="rgba(154,113,48,0.42)"
              strokeWidth="2"
            />
            <text x={messagePanel.x + 18} y={messagePanel.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#7a571f">
              MESSAGE
            </text>
            {messageLines.map((line, index) => (
              <text
                key={`mediator-message-${index}`}
                x={messagePanel.x + 18}
                y={messagePanel.y + 52 + index * 18}
                fontSize="15"
                fontWeight="600"
                fill="#5c4218"
              >
                {line}
              </text>
            ))}
          </g>

          <rect
            x={timelineX}
            y={timelineY}
            width={timelineWidth}
            height={timelineHeight}
            rx="34"
            fill="rgba(255,250,242,0.96)"
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            DELIVERY FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.deliveredCount} message(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            observe si le message passe par le hub ou part en direct vers chaque destinataire
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div
                className="grid gap-3 pb-2"
                style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}
              >
                {model.deliveries.map((delivery) => (
                  <div
                    key={`${delivery.index}-${delivery.to}`}
                    className={`min-h-[118px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${
                      delivery.transport === 'MEDIATED'
                        ? 'border-emerald-200 bg-emerald-50/90'
                        : 'border-orange-200 bg-orange-50/92'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Delivery {delivery.index}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        delivery.transport === 'MEDIATED' ? 'text-emerald-800' : 'text-orange-900'
                      }`}>
                        {delivery.transport}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-stone-900">
                      {delivery.from} → {delivery.to}
                    </p>
                    <p className="mt-1 text-[12px] text-stone-700">via {delivery.via}</p>
                    <p className="mt-2 text-[12px] leading-5 text-stone-600">{delivery.detail}</p>
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

function renderSingletonScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractSingletonModel(execution)

  if (!model) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        La scene visuelle apparaitra ici des qu une demo ou un apercu local sera disponible.
      </div>
    )
  }

  const viewBoxWidth = 1120
  const clientCardHeight = 82
  const clientGap = 22
  const clientsHeight = model.clientViews.length * clientCardHeight + Math.max(0, model.clientViews.length - 1) * clientGap
  const viewBoxHeight = Math.max(isExpanded ? 760 : 660, 240 + clientsHeight)
  const defsId = `singleton-scene-${isExpanded ? 'expanded' : 'compact'}`
  const clientColumnX = 48
  const clientColumnY = 156
  const clientCardWidth = 268
  const metricsX = 392
  const metricsY = 52
  const metricsWidth = 680
  const metricsHeight = 108
  const instanceColumnX = 590
  const singleInstanceWidth = 414
  const singleInstanceHeight = 196
  const singleInstanceY = 214
  const stackedInstanceWidth = 372
  const stackedInstanceHeight = 92
  const stackedInstanceGap = 26
  const useSingleton = model.mode === 'WITH_SINGLETON' || model.instanceCount === 1
  const uniqueInstanceIds = model.uniqueInstanceIds
  const instanceViews = uniqueInstanceIds.map((instanceId) => ({
    instanceId,
    visibleValue: model.clientViews.find((view) => view.instanceId === instanceId)?.visibleValue ?? 'non defini',
    clients: model.clientViews.filter((view) => view.instanceId === instanceId).map((view) => view.client),
  }))
  const totalInstancesHeight = instanceViews.length * stackedInstanceHeight + Math.max(0, instanceViews.length - 1) * stackedInstanceGap
  const stackedStartY = Math.max(176, (viewBoxHeight - totalInstancesHeight) / 2)

  const buildPath = (startX, startY, endX, endY) => {
    const curve = Math.max(82, (endX - startX) * 0.38)
    return `M ${startX} ${startY} C ${startX + curve} ${startY} ${endX - curve} ${endY} ${endX} ${endY}`
  }

  const connectionEntries = model.clientViews.map((view, index) => {
    const clientY = clientColumnY + index * (clientCardHeight + clientGap)
    const sourceX = clientColumnX + clientCardWidth
    const sourceY = clientY + clientCardHeight / 2

    if (useSingleton) {
      return {
        key: `${view.client}-${view.instanceId}`,
        path: buildPath(sourceX, sourceY, instanceColumnX, singleInstanceY + singleInstanceHeight / 2),
        highlight: view.client === model.writerClient,
      }
    }

    const instanceIndex = instanceViews.findIndex((instance) => instance.instanceId === view.instanceId)
    const targetY = stackedStartY + instanceIndex * (stackedInstanceHeight + stackedInstanceGap)

    return {
      key: `${view.client}-${view.instanceId}`,
      path: buildPath(sourceX, sourceY, instanceColumnX, targetY + stackedInstanceHeight / 2),
      highlight: view.client === model.writerClient,
    }
  })

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Shared Instance Dashboard
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(211,236,230,0.84)" />
            </linearGradient>
            <marker
              id={`${defsId}-arrow`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={useSingleton ? '#246b5e' : '#426c8d'} />
            </marker>
          </defs>

          <circle cx="164" cy="108" r="104" fill="rgba(36,107,94,0.08)" />
          <circle cx="972" cy={viewBoxHeight - 102} r="124" fill="rgba(194,87,55,0.08)" />

          <rect
            x={metricsX}
            y={metricsY}
            width={metricsWidth}
            height={metricsHeight}
            rx="34"
            fill={`url(#${defsId}-metrics)`}
            stroke="rgba(36,31,24,0.1)"
            strokeWidth="2"
          />
          <text x={metricsX + 28} y={metricsY + 34} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            SINGLETON CHECK
          </text>
          <text x={metricsX + 28} y={metricsY + 68} fontSize="30" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={metricsX + 28} y={metricsY + 95} fontSize="14" fill="#5f5548">
            {model.coherenceLabel}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 62} textAnchor="end" fontSize="25" fontWeight="700" fill="#241f18">
            {model.instanceCount} instance(s)
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 92} textAnchor="end" fontSize="14" fill="#5f5548">
            {model.clientCount} client(s)
          </text>

          <text x={clientColumnX} y={clientColumnY - 26} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            CLIENTS
          </text>
          {model.clientViews.map((view, index) => {
            const y = clientColumnY + index * (clientCardHeight + clientGap)
            const isWriter = view.client === model.writerClient

            return (
              <g key={view.id}>
                <rect
                  x={clientColumnX}
                  y={y}
                  width={clientCardWidth}
                  height={clientCardHeight}
                  rx="24"
                  fill={isWriter ? 'rgba(231,198,167,0.9)' : 'rgba(255,250,242,0.96)'}
                  stroke={isWriter ? '#c25737' : 'rgba(36,31,24,0.12)'}
                  strokeWidth="2"
                  className="scene-node-shadow"
                />
                <text x={clientColumnX + 22} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#78685c">
                  {isWriter ? 'WRITER CLIENT' : 'CLIENT'}
                </text>
                <text x={clientColumnX + 22} y={y + 48} fontSize="18" fontWeight="700" fill="#241f18">
                  {view.client}
                </text>
                <text x={clientColumnX + 22} y={y + 68} fontSize="12" fill="#5f5548">
                  voit {model.settingKey} = {view.visibleValue}
                </text>
              </g>
            )
          })}

          {connectionEntries.map((entry, index) => (
            <g key={entry.key}>
              <path
                d={entry.path}
                fill="none"
                stroke={entry.highlight ? '#c25737' : (useSingleton ? '#246b5e' : '#426c8d')}
                strokeWidth={entry.highlight ? '3.2' : '2.6'}
                strokeDasharray={entry.highlight ? '12 8' : '0'}
                markerEnd={`url(#${defsId}-arrow)`}
                className={entry.highlight ? 'scene-flow-line' : ''}
              />
              {entry.highlight ? (
                <circle r="5" fill="#c25737" opacity="0.95">
                  <animateMotion dur="1.9s" repeatCount="indefinite" path={entry.path} begin={`${index * 0.12}s`} />
                </circle>
              ) : null}
            </g>
          ))}

          {useSingleton ? (
            <g>
              <rect
                x={instanceColumnX}
                y={singleInstanceY}
                width={singleInstanceWidth}
                height={singleInstanceHeight}
                rx="34"
                fill="#241f18"
                stroke="#241f18"
                strokeWidth="2"
                className="scene-node-shadow"
              />
              <text x={instanceColumnX + 28} y={singleInstanceY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="rgba(255,250,242,0.64)">
                INSTANCE UNIQUE
              </text>
              <text x={instanceColumnX + 28} y={singleInstanceY + 72} fontSize="30" fontWeight="700" fill="#fff8ee">
                GlobalSettingsManager
              </text>
              <rect
                x={instanceColumnX + 28}
                y={singleInstanceY + 96}
                width={singleInstanceWidth - 56}
                height="54"
                rx="18"
                fill="rgba(255,250,242,0.1)"
                stroke="rgba(255,250,242,0.12)"
              />
              <text x={instanceColumnX + 48} y={singleInstanceY + 127} fontSize="14" fontWeight="700" fill="#fff8ee">
                {model.settingKey} = {model.settingValue}
              </text>
              <text x={instanceColumnX + 48} y={singleInstanceY + 148} fontSize="12" fill="rgba(255,250,242,0.7)">
                meme reference renvoyee a tous les clients
              </text>
              <text x={instanceColumnX + 28} y={singleInstanceY + 176} fontSize="12" fill="rgba(255,250,242,0.78)">
                Clients relies : {model.clientViews.map((view) => view.client).join(' · ')}
              </text>
            </g>
          ) : (
            instanceViews.map((instance, index) => {
              const y = stackedStartY + index * (stackedInstanceHeight + stackedInstanceGap)
              const isPrimary = instance.clients.includes(model.writerClient)

              return (
                <g key={instance.instanceId}>
                  <rect
                    x={instanceColumnX}
                    y={y}
                    width={stackedInstanceWidth}
                    height={stackedInstanceHeight}
                    rx="24"
                    fill={isPrimary ? 'rgba(231,198,167,0.9)' : 'rgba(214,228,241,0.94)'}
                    stroke={isPrimary ? '#c25737' : '#426c8d'}
                    strokeWidth="2"
                    className="scene-node-shadow"
                  />
                  <text x={instanceColumnX + 22} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6c6257">
                    INSTANCE LOCALE
                  </text>
                  <text x={instanceColumnX + 22} y={y + 48} fontSize="19" fontWeight="700" fill="#241f18">
                    {instance.instanceId}
                  </text>
                  <text x={instanceColumnX + 22} y={y + 69} fontSize="12" fill="#5f5548">
                    {model.settingKey} = {instance.visibleValue}
                  </text>
                  <text x={instanceColumnX + stackedInstanceWidth - 22} y={y + 69} textAnchor="end" fontSize="12" fill="#5f5548">
                    {instance.clients.join(', ')}
                  </text>
                </g>
              )
            })
          )}
        </svg>
      </ZoomableViewport>
    </div>
  )
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

  if (patternCode === 'state' && execution?.output) {
    return renderStateScene({
      execution,
      isExpanded,
      panelClassName,
      svgClassName,
      TitleTag,
      sourceLabel,
      onOpenModal,
    })
  }

  if (patternCode === 'mediator' && execution?.output) {
    return renderMediatorScene({
      execution,
      isExpanded,
      panelClassName,
      svgClassName,
      TitleTag,
      sourceLabel,
      onOpenModal,
    })
  }

  if (patternCode === 'chain' && execution?.output) {
    return renderChainScene({
      execution,
      isExpanded,
      panelClassName,
      svgClassName,
      TitleTag,
      sourceLabel,
      onOpenModal,
    })
  }

  if (patternCode === 'singleton' && execution?.output) {
    return renderSingletonScene({
      execution,
      isExpanded,
      panelClassName,
      svgClassName,
      TitleTag,
      sourceLabel,
      onOpenModal,
    })
  }

  if (patternCode === 'flyweight' && execution?.output) {
    return renderFlyweightScene({
      execution,
      isExpanded,
      panelClassName,
      svgClassName,
      TitleTag,
      sourceLabel,
      onOpenModal,
    })
  }

  if (patternCode === 'command' && execution?.output) {
    return <CommandScene
      execution={execution}
      isExpanded={isExpanded}
      panelClassName={panelClassName}
      svgClassName={svgClassName}
      TitleTag={TitleTag}
      sourceLabel={sourceLabel}
      onOpenModal={onOpenModal}
    />
  }

  if (patternCode === 'decorator' && execution?.output) {
    return renderDecoratorScene({
      execution,
      isExpanded,
      panelClassName,
      svgClassName,
      TitleTag,
      sourceLabel,
      onOpenModal,
    })
  }

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
