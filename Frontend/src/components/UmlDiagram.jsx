import ZoomableViewport from './ZoomableViewport'

const NO_SPACE_BEFORE_TOKENS = new Set([',', '.', ';', ':', ')', ']', '}', '>', '<', '(', '[', '{'])
const NO_SPACE_AFTER_CHARACTERS = new Set(['<', '(', '[', '{'])

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

function wrapText(text, maxLength = 28) {
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

function getTone(box) {
  const stereotype = box.stereotype?.toLowerCase?.() ?? ''

  if (stereotype.includes('concrete')) {
    return {
      fill: 'rgba(231, 198, 167, 0.92)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  if (stereotype === 'context') {
    return {
      fill: 'rgba(211, 236, 230, 0.94)',
      stroke: '#246b5e',
      text: '#153f38',
    }
  }

  if (stereotype === 'creator') {
    return {
      fill: 'rgba(214, 228, 241, 0.94)',
      stroke: '#426c8d',
      text: '#27465f',
    }
  }

  if (stereotype === 'subject') {
    return {
      fill: 'rgba(219, 239, 228, 0.94)',
      stroke: '#2e7a56',
      text: '#1e4f38',
    }
  }

  if (stereotype === 'observer') {
    return {
      fill: 'rgba(245, 231, 201, 0.94)',
      stroke: '#a16b22',
      text: '#624313',
    }
  }

  if (stereotype === 'factory') {
    return {
      fill: 'rgba(214, 228, 241, 0.94)',
      stroke: '#426c8d',
      text: '#27465f',
    }
  }

  if (stereotype === 'client') {
    return {
      fill: 'rgba(211, 236, 230, 0.94)',
      stroke: '#246b5e',
      text: '#153f38',
    }
  }

  if (stereotype === 'extrinsic state') {
    return {
      fill: 'rgba(245, 227, 210, 0.96)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  if (stereotype === 'flyweight') {
    return {
      fill: 'rgba(255, 244, 220, 0.96)',
      stroke: '#9a7130',
      text: '#5c4218',
    }
  }

  if (stereotype === 'singleton') {
    return {
      fill: 'rgba(36, 31, 24, 0.96)',
      stroke: '#241f18',
      text: '#fff8ee',
    }
  }

  if (stereotype === 'state') {
    return {
      fill: 'rgba(255, 244, 220, 0.96)',
      stroke: '#9a7130',
      text: '#5c4218',
    }
  }

  if (stereotype === 'global state') {
    return {
      fill: 'rgba(245, 227, 210, 0.96)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  if (stereotype === 'strategy' || stereotype === 'product') {
    return {
      fill: 'rgba(255, 244, 220, 0.96)',
      stroke: '#9a7130',
      text: '#5c4218',
    }
  }

  if (box.tone === 'teal') {
    return {
      fill: 'rgba(211, 236, 230, 0.94)',
      stroke: '#246b5e',
      text: '#153f38',
    }
  }

  if (box.tone === 'accent') {
    return {
      fill: 'rgba(231, 198, 167, 0.92)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  return {
    fill: 'rgba(255, 249, 239, 0.98)',
    stroke: '#7a5a3f',
    text: '#3d2d20',
  }
}

function parseViewBox(viewBox) {
  const parts = `${viewBox ?? ''}`.split(/\s+/).map(Number)

  if (parts.length === 4 && parts.every((value) => Number.isFinite(value))) {
    return {
      minX: parts[0],
      minY: parts[1],
      width: parts[2],
      height: parts[3],
    }
  }

  return {
    minX: 0,
    minY: 0,
    width: 960,
    height: 600,
  }
}

function getWrappedMembers(lines, maxLength = 28) {
  return (lines ?? []).flatMap((line) => wrapText(line, maxLength))
}

function getBoxLayout(box) {
  const titleLines = wrapText(box.title, 22)
  const fieldLines = getWrappedMembers(box.fields, 24)
  const methodLines = getWrappedMembers(box.methods, 24)
  const stereotypeLabel = `<<${box.stereotype}>>`
  const baseWidth = box.width ?? 210
  const contentWidth = Math.max(
    estimateTextWidth(stereotypeLabel, 10),
    ...titleLines.map((line) => estimateTextWidth(line, 18)),
    ...fieldLines.map((line) => estimateTextWidth(line, 12)),
    ...methodLines.map((line) => estimateTextWidth(line, 12)),
  )
  const width = Math.min(340, Math.max(baseWidth, Math.ceil(contentWidth + 44)))
  const stereotypeFontSize = getFittedFontSize([stereotypeLabel], 10, 9, width - 40)
  const titleFontSize = getFittedFontSize(titleLines, 18, 15, width - 40)
  const memberFontSize = getFittedFontSize(
    [...fieldLines, ...methodLines, 'Aucun membre pour cette vue simplifiee'],
    12,
    10,
    width - 36,
  )
  const titleStartY = 34
  const titleLineHeight = titleFontSize + 4
  const memberLineHeight = memberFontSize + 6
  const headerHeight = 24 + titleLines.length * titleLineHeight + 16
  const memberStartY = headerHeight + 22
  const fieldDividerY = fieldLines.length ? memberStartY + fieldLines.length * memberLineHeight - 8 : null
  const methodStartY = fieldLines.length ? memberStartY + fieldLines.length * memberLineHeight + 14 : memberStartY
  const contentBottomY = methodLines.length
    ? methodStartY + methodLines.length * memberLineHeight
    : fieldLines.length
      ? memberStartY + fieldLines.length * memberLineHeight
      : memberStartY + memberLineHeight
  const height = Math.max(box.height ?? 118, contentBottomY + 20)

  return {
    ...box,
    width,
    height,
    titleLines,
    fieldLines,
    methodLines,
    titleStartY,
    titleLineHeight,
    memberStartY,
    memberLineHeight,
    headerHeight,
    fieldDividerY,
    methodStartY,
    stereotypeFontSize,
    titleFontSize,
    memberFontSize,
  }
}

function getAnchor(box, side) {
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

function getAutoSides(fromBox, toBox) {
  const fromCenterX = fromBox.x + fromBox.width / 2
  const fromCenterY = fromBox.y + fromBox.height / 2
  const toCenterX = toBox.x + toBox.width / 2
  const toCenterY = toBox.y + toBox.height / 2
  const dx = toCenterX - fromCenterX
  const dy = toCenterY - fromCenterY

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0
      ? { fromSide: 'right', toSide: 'left' }
      : { fromSide: 'left', toSide: 'right' }
  }

  return dy >= 0
    ? { fromSide: 'bottom', toSide: 'top' }
    : { fromSide: 'top', toSide: 'bottom' }
}

function inferAnchorSideFromWaypoint(box, waypoint) {
  if (!box || !waypoint) {
    return null
  }

  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  const dx = waypoint.x - centerX
  const dy = waypoint.y - centerY

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0 ? 'right' : 'left'
  }

  return dy >= 0 ? 'bottom' : 'top'
}

function offsetStraightLine(start, end, offset) {
  if (offset === 0) {
    return [start, end]
  }

  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  const normalX = -dy / length
  const normalY = dx / length

  return [
    { x: start.x + normalX * offset, y: start.y + normalY * offset },
    { x: end.x + normalX * offset, y: end.y + normalY * offset },
  ]
}

function buildRelationMeta(relations) {
  const totalsByKey = relations.reduce((accumulator, relation) => {
    const key = `${relation.from}->${relation.to}`
    accumulator[key] = (accumulator[key] ?? 0) + 1
    return accumulator
  }, {})

  const seenByKey = {}

  return relations.map((relation) => {
    const key = `${relation.from}->${relation.to}`
    const index = seenByKey[key] ?? 0
    seenByKey[key] = index + 1

    return {
      key,
      index,
      total: totalsByKey[key],
    }
  })
}

function normalizeWaypoint(point) {
  const x = Number(point?.x)
  const y = Number(point?.y)

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  return { x, y }
}

function buildRelationPoints(relation, classesById, relationMeta, options = {}) {
  const fromBox = classesById[relation.from]
  const toBox = classesById[relation.to]
  const useRelationWaypoints = options.useRelationWaypoints === true

  if (!fromBox || !toBox) {
    return null
  }

  const autoSides = getAutoSides(fromBox, toBox)
  const customWaypoints = useRelationWaypoints
    ? (relation.points ?? []).map(normalizeWaypoint).filter(Boolean)
    : []
  const fromSide = relation.fromSide
    ?? inferAnchorSideFromWaypoint(fromBox, customWaypoints[0])
    ?? autoSides.fromSide
  const toSide = relation.toSide
    ?? inferAnchorSideFromWaypoint(toBox, customWaypoints[customWaypoints.length - 1])
    ?? autoSides.toSide
  const start = getAnchor(fromBox, fromSide)
  const end = getAnchor(toBox, toSide)

  if (customWaypoints.length > 0) {
    return [start, ...customWaypoints, end]
  }

  const offset = relationMeta.total > 1
    ? (relationMeta.index - (relationMeta.total - 1) / 2) * 22
    : 0

  return offsetStraightLine(start, end, offset)
}

function buildPath(points) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

function getCurvedPathData(relation, points) {
  if (relation.style !== 'curved' || points.length !== 2) {
    return null
  }

  const [start, end] = points
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  const normalX = -dy / length
  const normalY = dx / length
  const curvature = Number(relation.curvature ?? 0)
  const control = {
    x: midX + normalX * curvature,
    y: midY + normalY * curvature,
  }

  return {
    path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
    labelPosition: {
      x: (start.x + end.x + control.x) / 3,
      y: (start.y + end.y + control.y) / 3,
    },
  }
}

function getPolylinePointAt(points, ratio = 0.5) {
  if (!points || points.length === 0) {
    return { x: 0, y: 0 }
  }

  let totalLength = 0
  const segments = []

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]
    const end = points[index]
    const length = Math.hypot(end.x - start.x, end.y - start.y)

    segments.push({ start, end, length })
    totalLength += length
  }

  if (totalLength === 0) {
    return points[0]
  }

  const targetLength = totalLength * ratio
  let walkedLength = 0

  for (const segment of segments) {
    if (walkedLength + segment.length >= targetLength) {
      const localRatio = (targetLength - walkedLength) / segment.length

      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * localRatio,
        y: segment.start.y + (segment.end.y - segment.start.y) * localRatio,
      }
    }

    walkedLength += segment.length
  }

  return points[points.length - 1]
}

function getRelationLabelPosition(relation, points, options = {}) {
  if (options.useExplicitPosition === true) {
    const x = Number(relation.labelX)
    const y = Number(relation.labelY)

    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { x, y }
    }
  }

  return getPolylinePointAt(points, 0.5)
}

function getRelationPathData(relation, points, options = {}) {
  const curvedPathData = getCurvedPathData(relation, points)
  if (curvedPathData) {
    return curvedPathData
  }

  return {
    path: buildPath(points),
    labelPosition: getRelationLabelPosition(relation, points, options),
  }
}

function getRelationMarkers(defsId, relation) {
  if (relation.marker === 'triangle') {
    return {
      markerEnd: `url(#${defsId}-triangle)`,
      markerStart: undefined,
    }
  }

  if (relation.marker === 'diamond') {
    return {
      markerEnd: undefined,
      markerStart: `url(#${defsId}-diamond)`,
    }
  }

  return {
    markerEnd: `url(#${defsId}-arrow)`,
    markerStart: undefined,
  }
}

function withPosition(box, x, y) {
  return {
    ...box,
    x,
    y,
  }
}

function getRowWidth(boxes, gap) {
  return boxes.reduce((total, box, index) => total + box.width + (index > 0 ? gap : 0), 0)
}

function getRowHeight(boxes) {
  return Math.max(...boxes.map((box) => box.height))
}

function buildFactoryLayout(boxesById) {
  const factory = boxesById.factory
  const vehicle = boxesById.vehicle
  const car = boxesById.car
  const bike = boxesById.bike

  if (!factory || !vehicle || !car || !bike) {
    return null
  }

  const marginX = 88
  const marginY = 74
  const columnGap = 156
  const rowGap = 148
  const topRow = [factory, vehicle]
  const bottomRow = [car, bike]
  const topRowWidth = getRowWidth(topRow, columnGap)
  const bottomRowWidth = getRowWidth(bottomRow, columnGap)
  const contentWidth = Math.max(topRowWidth, bottomRowWidth)
  const width = marginX * 2 + contentWidth
  const topStartX = marginX + (contentWidth - topRowWidth) / 2
  const bottomStartX = marginX + (contentWidth - bottomRowWidth) / 2
  const topY = marginY
  const bottomY = topY + getRowHeight(topRow) + rowGap

  return {
    viewBox: `0 0 ${width} ${bottomY + getRowHeight(bottomRow) + marginY}`,
    boxes: [
      withPosition(factory, topStartX, topY),
      withPosition(vehicle, topStartX + factory.width + columnGap, topY),
      withPosition(car, bottomStartX, bottomY),
      withPosition(bike, bottomStartX + car.width + columnGap, bottomY),
    ],
  }
}

function buildStrategyLayout(boxesById) {
  const context = boxesById.context
  const strategy = boxesById.strategy
  const card = boxesById.card
  const paypal = boxesById.paypal
  const crypto = boxesById.crypto

  if (!context || !strategy || !card || !paypal || !crypto) {
    return null
  }

  const marginX = 92
  const marginY = 74
  const columnGap = 142
  const rowGap = 138
  const bottomRow = [card, paypal, crypto]
  const bottomRowWidth = getRowWidth(bottomRow, columnGap)
  const rightAreaWidth = Math.max(bottomRowWidth, strategy.width)
  const width = marginX * 2 + context.width + columnGap + rightAreaWidth
  const rightAreaX = marginX + context.width + columnGap
  const topStartX = rightAreaX + (rightAreaWidth - strategy.width) / 2
  const bottomStartX = rightAreaX + (rightAreaWidth - bottomRowWidth) / 2
  const topY = marginY
  const contextY = topY + (strategy.height - context.height) / 2
  const bottomY = topY + strategy.height + rowGap
  const height = Math.max(
    bottomY + getRowHeight(bottomRow) + marginY,
    contextY + context.height + marginY,
  )

  return {
    viewBox: `0 0 ${width} ${height}`,
    boxes: [
      withPosition(strategy, topStartX, topY),
      withPosition(context, marginX, contextY),
      withPosition(card, bottomStartX, bottomY),
      withPosition(paypal, bottomStartX + card.width + columnGap, bottomY),
      withPosition(crypto, bottomStartX + card.width + columnGap + paypal.width + columnGap, bottomY),
    ],
  }
}

function buildObserverLayout(boxesById) {
  const subject = boxesById.subject
  const observer = boxesById.observer
  const subscriber = boxesById.subscriber

  if (!subject || !observer || !subscriber) {
    return null
  }

  const marginX = 88
  const marginY = 74
  const columnGap = 162
  const rowGap = 144
  const topRowWidth = subject.width + columnGap + observer.width
  const width = marginX * 2 + topRowWidth
  const topY = marginY
  const bottomY = topY + Math.max(subject.height, observer.height) + rowGap
  const observerX = marginX + subject.width + columnGap
  const subscriberX = observerX + (observer.width - subscriber.width) / 2

  return {
    viewBox: `0 0 ${width} ${bottomY + subscriber.height + marginY}`,
    boxes: [
      withPosition(subject, marginX, topY),
      withPosition(observer, observerX, topY),
      withPosition(subscriber, subscriberX, bottomY),
    ],
  }
}

function buildFlyweightLayout(boxesById) {
  const client = boxesById.client
  const extrinsic = boxesById.extrinsic
  const factory = boxesById.factory
  const flyweight = boxesById.flyweight
  const concrete = boxesById.concrete

  if (!client || !extrinsic || !factory || !flyweight || !concrete) {
    return null
  }

  const marginX = 92
  const marginY = 74
  const columnGap = 154
  const rowGap = 134
  const leftColumnWidth = Math.max(client.width, extrinsic.width)
  const rightColumnWidth = Math.max(flyweight.width, concrete.width)
  const leftColumnHeight = client.height + rowGap + extrinsic.height
  const rightColumnHeight = flyweight.height + rowGap + concrete.height
  const sideColumnsHeight = Math.max(leftColumnHeight, rightColumnHeight)
  const width = marginX * 2 + leftColumnWidth + columnGap + factory.width + columnGap + rightColumnWidth
  const centerX = marginX + leftColumnWidth + columnGap
  const leftX = marginX
  const rightX = centerX + factory.width + columnGap
  const topY = marginY
  const leftBottomY = topY + client.height + rowGap
  const rightBottomY = topY + flyweight.height + rowGap
  const factoryY = marginY + (sideColumnsHeight - factory.height) / 2
  const height = marginY * 2 + sideColumnsHeight

  return {
    viewBox: `0 0 ${width} ${height}`,
    boxes: [
      withPosition(client, leftX + (leftColumnWidth - client.width) / 2, topY),
      withPosition(extrinsic, leftX + (leftColumnWidth - extrinsic.width) / 2, leftBottomY),
      withPosition(factory, centerX, factoryY),
      withPosition(flyweight, rightX + (rightColumnWidth - flyweight.width) / 2, topY),
      withPosition(concrete, rightX + (rightColumnWidth - concrete.width) / 2, rightBottomY),
    ],
  }
}

function buildSingletonLayout(boxesById) {
  const client = boxesById.client
  const singleton = boxesById.singleton
  const clients = boxesById.clients
  const state = boxesById.state

  if (!client || !singleton || !clients || !state) {
    return null
  }

  const marginX = 92
  const marginY = 78
  const columnGap = 150
  const rowGap = 140
  const width = marginX * 2 + client.width + columnGap + singleton.width + columnGap + clients.width
  const singletonX = marginX + client.width + columnGap
  const leftY = marginY + 64
  const rightY = marginY + 64
  const singletonY = marginY
  const stateX = singletonX
  const stateY = singletonY + singleton.height + rowGap

  return {
    viewBox: `0 0 ${width} ${stateY + state.height + marginY}`,
    boxes: [
      withPosition(client, marginX, leftY),
      withPosition(singleton, singletonX, singletonY),
      withPosition(clients, singletonX + singleton.width + columnGap, rightY),
      withPosition(state, stateX, stateY),
    ],
  }
}

function buildStateLayout(boxesById) {
  const context = boxesById.context
  const state = boxesById.state
  const idle = boxesById.idle
  const running = boxesById.running
  const jumping = boxesById.jumping
  const attacking = boxesById.attacking

  if (!context || !state || !idle || !running || !jumping || !attacking) {
    return null
  }

  const marginX = 92
  const marginY = 76
  const columnGap = 150
  const stateRowGap = 124
  const gridColumnGap = 92
  const gridRowGap = 108
  const rowOne = [idle, running]
  const rowTwo = [jumping, attacking]
  const rowOneWidth = getRowWidth(rowOne, gridColumnGap)
  const rowTwoWidth = getRowWidth(rowTwo, gridColumnGap)
  const rightAreaWidth = Math.max(state.width, rowOneWidth, rowTwoWidth)
  const width = marginX * 2 + context.width + columnGap + rightAreaWidth
  const rightStartX = marginX + context.width + columnGap
  const stateX = rightStartX + (rightAreaWidth - state.width) / 2
  const stateY = marginY
  const rowOneStartX = rightStartX + (rightAreaWidth - rowOneWidth) / 2
  const rowOneY = stateY + state.height + stateRowGap
  const rowTwoStartX = rightStartX + (rightAreaWidth - rowTwoWidth) / 2
  const rowTwoY = rowOneY + Math.max(idle.height, running.height) + gridRowGap
  const rightAreaHeight = rowTwoY + Math.max(jumping.height, attacking.height) - stateY
  const contextY = stateY + (rightAreaHeight - context.height) / 2

  return {
    viewBox: `0 0 ${width} ${rowTwoY + Math.max(jumping.height, attacking.height) + marginY}`,
    boxes: [
      withPosition(context, marginX, contextY),
      withPosition(state, stateX, stateY),
      withPosition(idle, rowOneStartX, rowOneY),
      withPosition(running, rowOneStartX + idle.width + gridColumnGap, rowOneY),
      withPosition(jumping, rowTwoStartX, rowTwoY),
      withPosition(attacking, rowTwoStartX + jumping.width + gridColumnGap, rowTwoY),
    ],
  }
}

function buildFallbackLayout(boxes) {
  const marginX = 88
  const marginY = 74
  const columnGap = 102
  const rowGap = 94
  const sortedBoxes = [...boxes].sort((left, right) => (
    left.y === right.y
      ? left.x - right.x
      : left.y - right.y
  ))
  const rows = []

  sortedBoxes.forEach((box) => {
    const lastRow = rows[rows.length - 1]

    if (!lastRow || Math.abs(lastRow.referenceY - box.y) > 120) {
      rows.push({ referenceY: box.y, boxes: [box] })
      return
    }

    lastRow.boxes.push(box)
  })

  const rowWidths = rows.map((row) => getRowWidth(row.boxes, columnGap))
  const width = marginX * 2 + Math.max(...rowWidths)
  let cursorY = marginY
  const positionedBoxes = []

  rows.forEach((row, rowIndex) => {
    const rowWidth = rowWidths[rowIndex]
    const rowStartX = marginX + (width - marginX * 2 - rowWidth) / 2
    let cursorX = rowStartX
    const rowHeight = getRowHeight(row.boxes)

    row.boxes.forEach((box) => {
      positionedBoxes.push(withPosition(box, cursorX, cursorY + (rowHeight - box.height) / 2))
      cursorX += box.width + columnGap
    })

    cursorY += rowHeight + rowGap
  })

  return {
    viewBox: `0 0 ${width} ${cursorY - rowGap + marginY}`,
    boxes: positionedBoxes,
  }
}

function buildPatternLayout(patternCode, boxes) {
  const boxesById = Object.fromEntries(boxes.map((box) => [box.id, box]))

  if (patternCode === 'factory') {
    return buildFactoryLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'strategy') {
    return buildStrategyLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'observer') {
    return buildObserverLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'flyweight') {
    return buildFlyweightLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'singleton') {
    return buildSingletonLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'state') {
    return buildStateLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  return buildFallbackLayout(boxes)
}

export default function UmlDiagram({
  diagram,
  patternCode,
  patternName,
  isExpanded = false,
  onOpenModal,
}) {
  if (!diagram) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        Aucun diagramme UML n est encore defini pour ce pattern.
      </div>
    )
  }

  const defsId = `uml-${patternName?.toLowerCase?.() ?? 'pattern'}`
  const boxLayouts = diagram.classes.map((box) => getBoxLayout(box))
  const baseViewBox = parseViewBox(diagram.viewBox)
  const useAbsoluteLayout = diagram.layout === 'absolute'
  const arrangedLayout = useAbsoluteLayout
    ? {
        boxes: boxLayouts,
        viewBox: `${baseViewBox.minX} ${baseViewBox.minY} ${baseViewBox.width} ${baseViewBox.height}`,
      }
    : buildPatternLayout(patternCode, boxLayouts)
  const classesById = Object.fromEntries(arrangedLayout.boxes.map((box) => [box.id, box]))
  const computedViewBox = arrangedLayout.viewBox ?? `${baseViewBox.minX} ${baseViewBox.minY} ${baseViewBox.width} ${baseViewBox.height}`
  const relationMetaList = buildRelationMeta(diagram.relations)
  const panelClassName = isExpanded
    ? 'rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.94))] p-6 shadow-[0_30px_90px_rgba(24,20,14,0.16)] lg:p-8'
    : 'rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
  const svgClassName = isExpanded
    ? 'h-auto min-h-[460px] w-full'
    : 'h-auto w-full'
  const TitleTag = isExpanded ? 'h2' : 'h3'

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">UML</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Diagramme du pattern
          </TitleTag>
        </div>
        {onOpenModal ? (
          <button
            className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white"
            type="button"
            onClick={onOpenModal}
          >
            {patternName}
          </button>
        ) : (
          <span className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
            {patternName}
          </span>
        )}
      </div>

      <ZoomableViewport enabled={isExpanded} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
      <svg className={svgClassName} viewBox={computedViewBox} role="img">
        <defs>
          <marker
            id={`${defsId}-arrow`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
          </marker>
          <marker
            id={`${defsId}-triangle`}
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
          >
            <path d="M 0 6 L 10 0 L 10 12 z" fill="#fff9ef" stroke="#7a5a3f" strokeWidth="1.2" />
          </marker>
          <marker
            id={`${defsId}-diamond`}
            markerWidth="12"
            markerHeight="12"
            refX="0"
            refY="6"
            orient="auto"
          >
            <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="#fff9ef" stroke="#7a5a3f" strokeWidth="1.2" />
          </marker>
        </defs>

        {diagram.relations.map((relation, index) => {
          const points = buildRelationPoints(relation, classesById, relationMetaList[index], {
            useRelationWaypoints: useAbsoluteLayout,
          })
          if (!points) {
            return null
          }

          const pathData = getRelationPathData(relation, points, {
            useExplicitPosition: useAbsoluteLayout,
          })
          const label = relation.label.toUpperCase()
          const labelWidth = Math.max(88, Math.ceil(estimateTextWidth(label, 11) + 28))
          const markers = getRelationMarkers(defsId, relation)

          return (
            <g key={`${relation.from}-${relation.to}-${index}`} className="uml-relation">
              <path
                className="uml-relation-line"
                d={pathData.path}
                fill="none"
                stroke="#7a5a3f"
                strokeWidth="2.2"
                strokeDasharray={relation.dashed ? '10 8' : '0'}
                markerEnd={markers.markerEnd}
                markerStart={markers.markerStart}
              />
              <rect
                className="uml-relation-label-bg"
                x={pathData.labelPosition.x - labelWidth / 2}
                y={pathData.labelPosition.y - 12}
                width={labelWidth}
                height="24"
                rx="12"
                fill="rgba(255,250,242,0.96)"
                stroke="rgba(36,31,24,0.08)"
              />
              <text
                className="uml-relation-label-text"
                x={pathData.labelPosition.x}
                y={pathData.labelPosition.y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.14em"
                fill="#6a5544"
              >
                {label}
              </text>
            </g>
          )
        })}

        {arrangedLayout.boxes.map((box) => {
          const tone = getTone(box)
          const hasFields = box.fieldLines.length > 0
          const hasMethods = box.methodLines.length > 0
          const hasContent = hasFields || hasMethods

          return (
            <g key={box.id} transform={`translate(${box.x} ${box.y})`}>
              <rect
                width={box.width}
                height={box.height}
                rx="18"
                fill={tone.fill}
                stroke={tone.stroke}
                strokeWidth="2.4"
                className="scene-node-shadow"
              />
              <line x1="0" y1={box.headerHeight} x2={box.width} y2={box.headerHeight} stroke={tone.stroke} strokeOpacity="0.45" />
              {hasFields ? (
                <line
                  x1="0"
                  y1={box.fieldDividerY}
                  x2={box.width}
                  y2={box.fieldDividerY}
                  stroke={tone.stroke}
                  strokeOpacity="0.35"
                />
              ) : null}

              <text
                x={box.width / 2}
                y="16"
                textAnchor="middle"
                fontSize={box.stereotypeFontSize}
                fontWeight="700"
                letterSpacing="0.2em"
                fill={tone.text}
                opacity="0.62"
              >
                {`<<${box.stereotype}>>`}
              </text>
              {box.titleLines.map((line, index) => (
                <text
                  key={`${box.id}-title-${index}`}
                  x={box.width / 2}
                  y={box.titleStartY + index * box.titleLineHeight}
                  textAnchor="middle"
                  fontSize={box.titleFontSize}
                  fontWeight="700"
                  fill={tone.text}
                >
                  {line}
                </text>
              ))}

              {box.fieldLines.map((line, index) => (
                <text
                  key={`${box.id}-field-${index}`}
                  x="18"
                  y={box.memberStartY + index * box.memberLineHeight}
                  fontSize={box.memberFontSize}
                  fontWeight="500"
                  fill={tone.text}
                >
                  {line}
                </text>
              ))}

              {box.methodLines.map((line, index) => (
                <text
                  key={`${box.id}-method-${index}`}
                  x="18"
                  y={box.methodStartY + index * box.memberLineHeight}
                  fontSize={box.memberFontSize}
                  fontWeight="500"
                  fill={tone.text}
                >
                  {line}
                </text>
              ))}

              {!hasContent ? (
                <text
                  x="18"
                  y={box.memberStartY}
                  fontSize={box.memberFontSize}
                  fontWeight="500"
                  fill={tone.text}
                  opacity="0.72"
                >
                  Aucun membre pour cette vue simplifiee
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      </ZoomableViewport>
    </div>
  )
}
