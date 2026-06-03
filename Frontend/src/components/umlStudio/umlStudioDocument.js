export const DEFAULT_VIEW_BOX = '0 0 1440 960'
export const BOX_DEFAULTS = { width: 220, height: 132 }
export const TEXT_DEFAULTS = { width: 240, height: 90 }
export const ACTIVITY_DEFAULTS = { width: 220, height: 96 }
export const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left']
export const CLASS_HEADER_HEIGHT = 58
export const CLASS_SECTION_MIN_HEIGHT = 48
export const CLASS_BOTTOM_PADDING = 18
export const DEFAULT_BOX_BORDER_COLOR = '#7a5a3f'
export const DEFAULT_BOX_FILL_COLOR = '#fff9ef'
export const DEFAULT_BOX_TEXT_COLOR = '#3d2d20'
export const DEFAULT_RELATION_COLOR = '#7a5a3f'
export const DEFAULT_TEXT_BORDER_COLOR = '#6a5544'
export const DEFAULT_TEXT_FILL_COLOR = '#ffffff'
export const DEFAULT_TEXT_COLOR = '#3d2d20'
export const DIAGRAM_TYPE_OPTIONS = ['class', 'activity']

export function slugify(value) {
  return `${value ?? ''}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function cloneDocument(value) {
  return JSON.parse(JSON.stringify(value))
}

export function buildViewBox(minX, minY, width, height) {
  return `${Math.round(minX)} ${Math.round(minY)} ${Math.max(640, Math.round(width))} ${Math.max(480, Math.round(height))}`
}

export function parseViewBox(viewBox) {
  const parts = `${viewBox ?? DEFAULT_VIEW_BOX}`.split(/\s+/).map(Number)
  if (parts.length === 4 && parts.every(Number.isFinite)) {
    return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] }
  }

  return { minX: 0, minY: 0, width: 1440, height: 960 }
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map((item) => `${item ?? ''}`).filter(Boolean) : []
}

function normalizePoint(point) {
  const x = Number(point?.x)
  const y = Number(point?.y)
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null
}

export function resolveClassSectionLayout(box) {
  const attributesHeight = Math.max(
    CLASS_SECTION_MIN_HEIGHT,
    Number.isFinite(Number(box?.attributesHeight)) ? Number(box.attributesHeight) : 58,
  )
  const methodsHeight = Math.max(
    CLASS_SECTION_MIN_HEIGHT,
    Number.isFinite(Number(box?.methodsHeight)) ? Number(box.methodsHeight) : 58,
  )
  const minimumHeight = CLASS_HEADER_HEIGHT + attributesHeight + methodsHeight + CLASS_BOTTOM_PADDING
  const height = Math.max(
    minimumHeight,
    Number.isFinite(Number(box?.height)) ? Number(box.height) : BOX_DEFAULTS.height,
  )

  return {
    attributesHeight,
    methodsHeight,
    height,
  }
}

export function normalizeDocument(document) {
  const source = document && typeof document === 'object' ? document : {}
  const sourceClasses = Array.isArray(source.classes) ? source.classes : []
  const sourceActivityNodes = Array.isArray(source.activityNodes) ? source.activityNodes : []
  const sourceTexts = Array.isArray(source.texts) ? source.texts : []
  const sourceRelations = Array.isArray(source.relations) ? source.relations : []

  // The editor accepts documents coming from localStorage, backend persistence and
  // design-pattern templates. Normalization keeps those sources compatible over time.
  return {
    id: source.id ?? `uml-${Date.now()}`,
    name: source.name ?? 'Nouveau diagramme UML',
    diagramType: DIAGRAM_TYPE_OPTIONS.includes(source.diagramType) ? source.diagramType : 'class',
    viewBox: source.viewBox ?? DEFAULT_VIEW_BOX,
    classes: sourceClasses.map((box, index) => ({
      ...resolveClassSectionLayout(box),
      id: box?.id ?? `class-${index + 1}`,
      title: box?.title ?? `Classe${index + 1}`,
      stereotype: box?.stereotype ?? 'Component',
      fields: normalizeList(box?.fields),
      methods: normalizeList(box?.methods),
      x: Number.isFinite(Number(box?.x)) ? Number(box.x) : 120 + index * 240,
      y: Number.isFinite(Number(box?.y)) ? Number(box.y) : 120,
      width: Number.isFinite(Number(box?.width)) ? Number(box.width) : BOX_DEFAULTS.width,
      borderColor: box?.borderColor ?? DEFAULT_BOX_BORDER_COLOR,
      fillColor: box?.fillColor ?? DEFAULT_BOX_FILL_COLOR,
      textColor: box?.textColor ?? DEFAULT_BOX_TEXT_COLOR,
    })),
    activityNodes: sourceActivityNodes.map((node, index) => ({
      id: node?.id ?? `activity-${index + 1}`,
      kind: ['start', 'end', 'action', 'decision'].includes(node?.kind) ? node.kind : 'action',
      label: node?.label ?? `Étape ${index + 1}`,
      x: Number.isFinite(Number(node?.x)) ? Number(node.x) : 120 + index * 240,
      y: Number.isFinite(Number(node?.y)) ? Number(node.y) : 120,
      width: Number.isFinite(Number(node?.width)) ? Number(node.width) : ACTIVITY_DEFAULTS.width,
      height: Number.isFinite(Number(node?.height)) ? Number(node.height) : ACTIVITY_DEFAULTS.height,
      borderColor: node?.borderColor ?? DEFAULT_BOX_BORDER_COLOR,
      fillColor: node?.fillColor ?? DEFAULT_BOX_FILL_COLOR,
      textColor: node?.textColor ?? DEFAULT_BOX_TEXT_COLOR,
    })),
    texts: sourceTexts.map((text, index) => ({
      id: text?.id ?? `text-${index + 1}`,
      text: text?.text ?? 'Nouvelle annotation',
      x: Number.isFinite(Number(text?.x)) ? Number(text.x) : 260,
      y: Number.isFinite(Number(text?.y)) ? Number(text.y) : 480 + index * 40,
      width: Number.isFinite(Number(text?.width)) ? Number(text.width) : TEXT_DEFAULTS.width,
      height: Number.isFinite(Number(text?.height)) ? Number(text.height) : TEXT_DEFAULTS.height,
      fontSize: Number.isFinite(Number(text?.fontSize)) ? Number(text.fontSize) : 18,
      borderColor: text?.borderColor ?? DEFAULT_TEXT_BORDER_COLOR,
      fillColor: text?.fillColor ?? DEFAULT_TEXT_FILL_COLOR,
      textColor: text?.textColor ?? DEFAULT_TEXT_COLOR,
    })),
    relations: sourceRelations.map((relation, index) => ({
      id: relation?.id ?? `relation-${index + 1}`,
      from: relation?.from ?? '',
      to: relation?.to ?? '',
      label: relation?.label ?? `relation-${index + 1}`,
      marker: relation?.marker ?? 'arrow',
      dashed: relation?.dashed === true,
      fromSide: SIDE_OPTIONS.includes(relation?.fromSide) ? relation.fromSide : 'right',
      toSide: SIDE_OPTIONS.includes(relation?.toSide) ? relation.toSide : 'left',
      style: relation?.style === 'curved' ? 'curved' : 'straight',
      curvature: Number.isFinite(Number(relation?.curvature)) ? Number(relation.curvature) : 0,
      points: sourceRelations[index]?.points?.map(normalizePoint).filter(Boolean) ?? [],
      labelPosition: Number.isFinite(Number(relation?.labelPosition)) ? clamp(Number(relation.labelPosition), 0, 1) : 0.5,
      color: relation?.color ?? DEFAULT_RELATION_COLOR,
    })),
  }
}

export function createEmptyDocument(diagramType = 'class') {
  return normalizeDocument({ diagramType, viewBox: DEFAULT_VIEW_BOX, classes: [], activityNodes: [], texts: [], relations: [] })
}

export function createBox(index) {
  return {
    ...resolveClassSectionLayout({ attributesHeight: 58, methodsHeight: 58, height: BOX_DEFAULTS.height }),
    id: `class-${Date.now()}-${index}`,
    title: `Classe${index}`,
    stereotype: 'Component',
    fields: ['+ attribut: Type'],
    methods: ['+ operation(): void'],
    x: 140 + index * 24,
    y: 120 + index * 24,
    width: BOX_DEFAULTS.width,
    borderColor: DEFAULT_BOX_BORDER_COLOR,
    fillColor: DEFAULT_BOX_FILL_COLOR,
    textColor: DEFAULT_BOX_TEXT_COLOR,
  }
}

export function createTextBlock(index) {
  return {
    id: `text-${Date.now()}-${index}`,
    text: 'Ajoute ici une note ou un commentaire.',
    x: 220 + index * 20,
    y: 520 + index * 24,
    width: TEXT_DEFAULTS.width,
    height: TEXT_DEFAULTS.height,
    fontSize: 18,
    borderColor: DEFAULT_TEXT_BORDER_COLOR,
    fillColor: DEFAULT_TEXT_FILL_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
  }
}

export function createActivityNode(kind, index) {
  const base = {
    id: `activity-${Date.now()}-${index}`,
    kind,
    label: kind === 'start' ? 'Départ' : kind === 'end' ? 'Fin' : kind === 'decision' ? 'Condition' : 'Action',
    x: 140 + index * 24,
    y: 120 + index * 24,
    width: kind === 'decision' ? 150 : kind === 'start' || kind === 'end' ? 48 : ACTIVITY_DEFAULTS.width,
    height: kind === 'decision' ? 150 : kind === 'start' || kind === 'end' ? 48 : ACTIVITY_DEFAULTS.height,
    borderColor: DEFAULT_BOX_BORDER_COLOR,
    fillColor: kind === 'start' ? '#3d2d20' : kind === 'end' ? '#fff9ef' : DEFAULT_BOX_FILL_COLOR,
    textColor: kind === 'start' ? '#fff9ef' : DEFAULT_BOX_TEXT_COLOR,
  }
  return base
}

export function getDiagramNodes(document) {
  return document?.diagramType === 'activity' ? (document.activityNodes ?? []) : (document.classes ?? [])
}

export function getAnchor(box, side) {
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

function getNearestSide(box, point) {
  const distances = [
    { side: 'top', distance: Math.abs(point.y - box.y) },
    { side: 'right', distance: Math.abs(point.x - (box.x + box.width)) },
    { side: 'bottom', distance: Math.abs(point.y - (box.y + box.height)) },
    { side: 'left', distance: Math.abs(point.x - box.x) },
  ]

  distances.sort((left, right) => left.distance - right.distance)
  return distances[0]?.side ?? 'right'
}

export function findAttachmentTarget(point, boxes) {
  const margin = 28
  let bestTarget = null

  boxes.forEach((box) => {
    // Attachment is intentionally tolerant so a user can drop near a side instead of
    // hitting the exact mathematical anchor on the border.
    const isNearBox = (
      point.x >= box.x - margin
      && point.x <= box.x + box.width + margin
      && point.y >= box.y - margin
      && point.y <= box.y + box.height + margin
    )

    if (!isNearBox) {
      return
    }

    const side = getNearestSide(box, point)
    const anchor = getAnchor(box, side)
    const distance = Math.hypot(point.x - anchor.x, point.y - anchor.y)

    if (!bestTarget || distance < bestTarget.distance) {
      bestTarget = {
        boxId: box.id,
        side,
        anchor,
        distance,
      }
    }
  })

  return bestTarget?.distance <= 120 ? bestTarget : null
}

export function buildRelationPath(relation, boxesById) {
  const fromBox = boxesById[relation.from]
  const toBox = boxesById[relation.to]
  if (!fromBox || !toBox) {
    return null
  }

  const start = getAnchor(fromBox, relation.fromSide)
  const end = getAnchor(toBox, relation.toSide)
  const points = (relation.points ?? []).map(normalizePoint).filter(Boolean)

  if (relation.style === 'curved' && points.length === 0) {
    // Curved relations use a generated quadratic control point when the user has not
    // added manual intermediate points. This keeps the model compact in persistence.
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.hypot(dx, dy) || 1
    const normalX = -dy / length
    const normalY = dx / length
    const control = {
      x: midX + normalX * Number(relation.curvature ?? 0),
      y: midY + normalY * Number(relation.curvature ?? 0),
    }

    const labelPositionAt = (progress) => {
      const t = clamp(progress, 0, 1)
      const inv = 1 - t
      return {
        x: inv * inv * start.x + 2 * inv * t * control.x + t * t * end.x,
        y: inv * inv * start.y + 2 * inv * t * control.y + t * t * end.y,
      }
    }

    return {
      start,
      end,
      polyline: [start, end],
      d: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      labelPositionAt,
    }
  }

  const polyline = [start, ...points, end]
  const segmentLengths = []
  let totalLength = 0

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const length = Math.hypot(polyline[index + 1].x - polyline[index].x, polyline[index + 1].y - polyline[index].y)
    segmentLengths.push(length)
    totalLength += length
  }

  return {
    start,
    end,
    polyline,
    d: polyline.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
    labelPositionAt(progress) {
      const t = clamp(progress, 0, 1)
      if (totalLength <= 0) {
        return start
      }

      let distance = totalLength * t
      for (let index = 0; index < segmentLengths.length; index += 1) {
        const segmentLength = segmentLengths[index]
        if (distance <= segmentLength || index === segmentLengths.length - 1) {
          const ratio = segmentLength > 0 ? distance / segmentLength : 0
          return {
            x: polyline[index].x + (polyline[index + 1].x - polyline[index].x) * ratio,
            y: polyline[index].y + (polyline[index + 1].y - polyline[index].y) * ratio,
          }
        }

        distance -= segmentLength
      }

      return end
    },
  }
}

export function insertRelationPoint(relation, boxesById, point) {
  const pathData = buildRelationPath(relation, boxesById)
  if (!pathData?.polyline?.length || pathData.polyline.length < 2) {
    return [...(relation.points ?? []), { x: Math.round(point.x), y: Math.round(point.y) }]
  }

  let insertIndex = relation.points?.length ?? 0
  let bestDistance = Number.POSITIVE_INFINITY

  for (let index = 0; index < pathData.polyline.length - 1; index += 1) {
    const start = pathData.polyline[index]
    const end = pathData.polyline[index + 1]
    const dx = end.x - start.x
    const dy = end.y - start.y
    const lengthSquared = dx * dx + dy * dy
    const projection = lengthSquared > 0
      ? clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1)
      : 0
    const projectedPoint = {
      x: start.x + dx * projection,
      y: start.y + dy * projection,
    }
    const distance = Math.hypot(point.x - projectedPoint.x, point.y - projectedPoint.y)

    if (distance < bestDistance) {
      bestDistance = distance
      insertIndex = index
    }
  }

  const nextPoints = [...(relation.points ?? [])]
  nextPoints.splice(insertIndex, 0, { x: Math.round(point.x), y: Math.round(point.y) })
  return nextPoints
}

export function markerEnd(defsId, relation) {
  if (relation.marker === 'triangle') {
    return `url(#${defsId}-triangle)`
  }
  if (relation.marker === 'diamond') {
    return undefined
  }
  return `url(#${defsId}-arrow)`
}

export function markerStart(defsId, relation) {
  if (relation.marker === 'diamond') {
    return `url(#${defsId}-diamond)`
  }
  return undefined
}

export function exportFile(fileName, blob) {
  // Reused by SVG and PNG export actions to keep download behaviour identical.
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
