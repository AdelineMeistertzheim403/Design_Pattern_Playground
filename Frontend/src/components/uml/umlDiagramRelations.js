// Routage des relations UML (ancrages, offsets, labels, markers).

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

export function buildRelationMeta(relations) {
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

export function buildRelationPoints(relation, classesById, relationMeta, options = {}) {
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

export function getRelationLabelPosition(relation, points, options = {}) {
  if (options.useExplicitPosition === true) {
    const x = Number(relation.labelX)
    const y = Number(relation.labelY)

    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { x, y }
    }
  }

  return getPolylinePointAt(points, 0.5)
}

export function getRelationMarkers(defsId, relation) {
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
