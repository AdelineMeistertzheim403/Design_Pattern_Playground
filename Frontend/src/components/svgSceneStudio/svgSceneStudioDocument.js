export const DEFAULT_VIEW_BOX = '0 0 1200 720'
export const STEP_TIMING_SECONDS = 0.9
export const TONES = {
  amber: { fill: '#e7c6a7', stroke: '#c25737', text: '#5f2d20' },
  mint: { fill: '#d3ece6', stroke: '#246b5e', text: '#153f38' },
  paper: { fill: '#fff9ef', stroke: '#7f5c3f', text: '#3d2d20' },
  blue: { fill: '#d6e4f1', stroke: '#426c8d', text: '#27465f' },
  dark: { fill: '#241f18', stroke: '#241f18', text: '#fffaf2' },
}

export function slugify(value) {
  return `${value ?? ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function cloneDraft(draft) {
  return JSON.parse(JSON.stringify(draft))
}

export function parseViewBox(viewBox) {
  const parts = `${viewBox ?? DEFAULT_VIEW_BOX}`.split(/\s+/).map(Number)
  return parts.length === 4 && parts.every(Number.isFinite)
    ? { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] }
    : { minX: 0, minY: 0, width: 1200, height: 720 }
}

export function formatViewBox(viewBox) {
  return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`
}

export function getElementCenter(element) {
  return {
    x: element.x + (element.width ?? 160) / 2,
    y: element.y + (element.height ?? 92) / 2,
  }
}

export function buildArrowPath(arrow) {
  if (arrow.curvature) {
    const midX = (arrow.x1 + arrow.x2) / 2
    const midY = (arrow.y1 + arrow.y2) / 2
    const dx = arrow.x2 - arrow.x1
    const dy = arrow.y2 - arrow.y1
    const length = Math.hypot(dx, dy) || 1
    const controlX = midX + (-dy / length) * arrow.curvature
    const controlY = midY + (dx / length) * arrow.curvature
    return `M ${arrow.x1} ${arrow.y1} Q ${Math.round(controlX)} ${Math.round(controlY)} ${arrow.x2} ${arrow.y2}`
  }

  return `M ${arrow.x1} ${arrow.y1} L ${arrow.x2} ${arrow.y2}`
}

export function parsePathEndpoints(pathData) {
  const numbers = `${pathData ?? ''}`.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  if (numbers.length < 4) {
    return null
  }

  return {
    x1: numbers[0],
    y1: numbers[1],
    x2: numbers[numbers.length - 2],
    y2: numbers[numbers.length - 1],
  }
}

export function getElementAnchor(element, side) {
  if (side === 'left') return { x: element.x, y: element.y + element.height / 2 }
  if (side === 'right') return { x: element.x + element.width, y: element.y + element.height / 2 }
  if (side === 'top') return { x: element.x + element.width / 2, y: element.y }
  return { x: element.x + element.width / 2, y: element.y + element.height }
}

export function findAttachmentTarget(point, elements) {
  const margin = 34
  let bestTarget = null

  elements.forEach((element) => {
    const near = point.x >= element.x - margin
      && point.x <= element.x + element.width + margin
      && point.y >= element.y - margin
      && point.y <= element.y + element.height + margin

    if (!near) {
      return
    }

    ;['top', 'right', 'bottom', 'left'].forEach((side) => {
      const anchor = getElementAnchor(element, side)
      const distance = Math.hypot(point.x - anchor.x, point.y - anchor.y)
      if (!bestTarget || distance < bestTarget.distance) {
        bestTarget = { elementId: element.id, side, anchor, distance }
      }
    })
  })

  return bestTarget?.distance <= 120 ? bestTarget : null
}

export function sanitizeRawMarkup(rawMarkup) {
  if (!rawMarkup) {
    return ''
  }

  try {
    const document = new DOMParser().parseFromString(`<svg>${rawMarkup}</svg>`, 'image/svg+xml')
    document.querySelectorAll('animateMotion').forEach((animation) => {
      animation.parentElement?.remove()
    })
    return Array.from(document.documentElement.children)
      .map((node) => new XMLSerializer().serializeToString(node))
      .join('')
  } catch {
    return rawMarkup
  }
}

export function escapeXml(value) {
  return `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function clampNumber(value, fallbackValue, minValue = 0) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return fallbackValue
  }

  return Math.max(minValue, numericValue)
}

export function normalizeElementAnimation(animation = {}) {
  return {
    enabled: animation.enabled !== false,
    stepIndex: Math.max(0, Math.round(Number(animation.stepIndex ?? 0) || 0)),
    fadeInSeconds: clampNumber(animation.fadeInSeconds, 0.45, 0.1),
    delaySeconds: clampNumber(animation.delaySeconds, 0, 0),
  }
}

export function normalizeArrowAnimation(animation = {}) {
  return {
    enabled: animation.enabled !== false,
    durationSeconds: clampNumber(animation.durationSeconds, 1.8, 0.1),
    color: animation.color || '#246b5e',
    pointRadius: clampNumber(animation.pointRadius, 5, 1),
    delaySeconds: clampNumber(animation.delaySeconds, 0, 0),
  }
}

export function normalizeSceneDraft(inputDraft) {
  return {
    ...inputDraft,
    playbackMode: inputDraft.playbackMode === 'step' ? 'step' : 'auto',
    elements: (inputDraft.elements ?? []).map((element) => ({
      ...element,
      animation: normalizeElementAnimation(element.animation),
    })),
    arrows: (inputDraft.arrows ?? []).map((arrow, index) => ({
      ...arrow,
      stepIndex: Math.max(0, Math.round(Number(arrow.stepIndex ?? index) || 0)),
      animation: normalizeArrowAnimation(arrow.animation),
    })),
    steps: Array.isArray(inputDraft.steps) ? inputDraft.steps : [],
  }
}

export function computeStepBeginSeconds(stepIndex = 0, delaySeconds = 0) {
  return Math.max(0, stepIndex) * STEP_TIMING_SECONDS + Math.max(0, delaySeconds)
}

export function moveArrayItem(items, fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
    return items
  }

  const nextItems = [...items]
  const [movedItem] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, movedItem)
  return nextItems
}

export function createDefaultDraft(name = 'Scene SVG', code = '') {
  const seed = Date.now()
  return normalizeSceneDraft({
    code: code || `scene-svg-${seed}`,
    name,
    viewBox: DEFAULT_VIEW_BOX,
    playbackMode: 'auto',
    elements: [
      { id: `element-${seed}-1`, type: 'rect', label: 'Client', subtitle: 'source', x: 140, y: 220, width: 240, height: 120, fontSize: 24, tone: 'amber', animation: { enabled: true, stepIndex: 0, fadeInSeconds: 0.45, delaySeconds: 0 } },
      { id: `element-${seed}-2`, type: 'rect', label: name, subtitle: 'orchestration', x: 470, y: 220, width: 260, height: 120, fontSize: 24, tone: 'mint', animation: { enabled: true, stepIndex: 1, fadeInSeconds: 0.45, delaySeconds: 0 } },
      { id: `element-${seed}-3`, type: 'rect', label: 'Resultat', subtitle: 'retour', x: 820, y: 220, width: 220, height: 120, fontSize: 24, tone: 'paper', animation: { enabled: true, stepIndex: 2, fadeInSeconds: 0.45, delaySeconds: 0 } },
    ],
    arrows: [
      { id: `arrow-${seed}-1`, label: 'flow', x1: 380, y1: 280, x2: 470, y2: 280, dashed: false, curvature: 0, fromElementId: undefined, toElementId: undefined, stepIndex: 0, animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e', pointRadius: 5, delaySeconds: 0 } },
      { id: `arrow-${seed}-2`, label: 'flow', x1: 730, y1: 280, x2: 820, y2: 280, dashed: false, curvature: 0, fromElementId: undefined, toElementId: undefined, stepIndex: 1, animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e', pointRadius: 5, delaySeconds: 0 } },
    ],
    steps: [{ label: 'Demande' }, { label: 'Resultat' }],
  })
}

export function parseStoredDraft(svgMarkup, fallbackName = 'Scene SVG', fallbackCode = '') {
  if (!svgMarkup) {
    return createDefaultDraft(fallbackName, fallbackCode)
  }

  try {
    const document = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const metadata = document.querySelector('metadata[data-dpp-svg-scene="true"]')
    if (metadata?.textContent) {
      const parsed = JSON.parse(metadata.textContent)
      if (Array.isArray(parsed.elements) && Array.isArray(parsed.arrows)) {
        return normalizeSceneDraft({
          code: parsed.code || fallbackCode || slugify(fallbackName) || `scene-svg-${Date.now()}`,
          name: parsed.name || fallbackName,
          viewBox: parsed.viewBox || DEFAULT_VIEW_BOX,
          playbackMode: parsed.playbackMode === 'step' ? 'step' : 'auto',
          elements: parsed.elements,
          arrows: parsed.arrows,
          steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        })
      }
    }
  } catch {
    // Fall through to default import below.
  }

  return createDraftFromMarkup(svgMarkup, fallbackName, fallbackCode)
}

export function createDraftFromMarkup(svgMarkup, fallbackName = 'Scene SVG', fallbackCode = '') {
  try {
    const document = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const svg = document.querySelector('svg')
    if (!svg) {
      return createDefaultDraft(fallbackName, fallbackCode)
    }

    const arrows = Array.from(svg.querySelectorAll('path[d][marker-end]'))
      .map((path, index) => {
        const endpoints = parsePathEndpoints(path.getAttribute('d'))
        if (!endpoints) {
          return null
        }

        const motion = path.parentElement?.querySelector('animateMotion')
        return {
          id: `arrow-import-${index}-${Date.now()}`,
          label: path.parentElement?.querySelector('text')?.textContent?.trim() ?? '',
          ...endpoints,
          dashed: (path.getAttribute('stroke-dasharray') ?? '0') !== '0',
          curvature: 0,
          stepIndex: index,
          animation: {
            enabled: Boolean(motion),
            durationSeconds: Number(`${motion?.getAttribute('dur') ?? '1.8'}`.replace('s', '')) || 1.8,
            color: path.getAttribute('stroke') || '#246b5e',
          },
        }
      })
      .filter(Boolean)

    const arrowPathNodes = new Set(Array.from(svg.querySelectorAll('path[d][marker-end]')))
    const elements = Array.from(svg.children)
      .filter((node) => !['defs', 'metadata', 'title', 'desc'].includes(node.tagName.toLowerCase()))
      .filter((node) => !arrowPathNodes.has(node) && !node.querySelector?.('animateMotion'))
      .map((node, index) => {
        let box = null
        try {
          box = node.getBBox?.() ?? null
        } catch {
          box = null
        }

        const x = Number.isFinite(box?.x) ? Math.round(box.x) : 40 + index * 20
        const y = Number.isFinite(box?.y) ? Math.round(box.y) : 40 + index * 20
        const width = Number.isFinite(box?.width) && box.width > 0 ? Math.round(box.width) : 180
        const height = Number.isFinite(box?.height) && box.height > 0 ? Math.round(box.height) : 80

        return {
          id: `element-import-${index}-${Date.now()}`,
          type: 'raw',
          label: node.tagName.toLowerCase(),
          rawMarkup: sanitizeRawMarkup(new XMLSerializer().serializeToString(node)),
          x,
          y,
          baseX: x,
          baseY: y,
          width,
          height,
          baseWidth: width,
          baseHeight: height,
          fontSize: 14,
          tone: 'paper',
        }
      })

    return normalizeSceneDraft({
      code: fallbackCode || slugify(fallbackName) || `scene-svg-${Date.now()}`,
      name: fallbackName,
      viewBox: svg.getAttribute('viewBox') || DEFAULT_VIEW_BOX,
      playbackMode: 'auto',
      elements: elements.length ? elements : createDefaultDraft(fallbackName, fallbackCode).elements,
      arrows,
      steps: arrows.map((arrow) => ({ label: arrow.label || 'flow' })),
    })
  } catch {
    return createDefaultDraft(fallbackName, fallbackCode)
  }
}

export function buildImportedElementLabel(element, index) {
  if (element.label && `${element.label}`.trim()) {
    return element.label
  }

  const typeLabel = element.type === 'raw'
    ? 'Element SVG'
    : element.type === 'ellipse'
      ? 'Noeud'
      : element.type === 'text'
        ? 'Texte'
        : 'Boite'

  return `${typeLabel} ${index + 1}`
}

export function cloneImportedElement(element, index) {
  const seed = Date.now()

  return {
    ...element,
    id: `import-${seed}-${index}`,
    label: buildImportedElementLabel(element, index),
    x: 0,
    y: 0,
  }
}

export function exportFile(filename, blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function generateSvgMarkup(draft) {
  const metadata = escapeXml(JSON.stringify(draft))
  const sceneBox = parseViewBox(draft.viewBox)

  const defs = `<defs>
  <marker id="scene-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f"/>
  </marker>
</defs>`

  const elements = draft.elements.map((element) => {
    const tone = TONES[element.tone] ?? TONES.paper
    const elementAnimation = normalizeElementAnimation(element.animation)
    const stepBeginSeconds = computeStepBeginSeconds(elementAnimation.stepIndex, elementAnimation.delaySeconds)
    const elementOpenTag = draft.playbackMode === 'step' && elementAnimation.enabled
      ? `<g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="${elementAnimation.fadeInSeconds}s" begin="${stepBeginSeconds}s" fill="freeze"/>`
      : '<g>'
    const elementCloseTag = '</g>'

    if (element.type === 'ellipse') {
      const center = getElementCenter(element)
      return `${elementOpenTag}
  <ellipse cx="${center.x}" cy="${center.y}" rx="${element.width / 2}" ry="${element.height / 2}" fill="${tone.fill}" stroke="${tone.stroke}" stroke-width="4"/>
  <text x="${center.x}" y="${center.y + 6}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${element.fontSize ?? 24}" font-weight="700" fill="${tone.text}">${escapeXml(element.label)}</text>
  ${element.subtitle ? `<text x="${center.x}" y="${center.y + 34}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" fill="${tone.text}">${escapeXml(element.subtitle)}</text>` : ''}
${elementCloseTag}`
    }

    if (element.type === 'text') {
      return `${elementOpenTag}<text x="${element.x}" y="${element.y}" font-family="Inter, Arial, sans-serif" font-size="${element.fontSize ?? 30}" font-weight="700" fill="${tone.text}">${escapeXml(element.label)}</text>${elementCloseTag}`
    }

    if (element.type === 'raw') {
      const scaleX = element.baseWidth > 0 ? element.width / element.baseWidth : 1
      const scaleY = element.baseHeight > 0 ? element.height / element.baseHeight : 1
      return `${elementOpenTag}<g transform="translate(${element.x} ${element.y}) scale(${scaleX} ${scaleY}) translate(${-element.baseX} ${-element.baseY})">
  ${sanitizeRawMarkup(element.rawMarkup)}
</g>${elementCloseTag}`
    }

    return `${elementOpenTag}
  <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" rx="24" fill="${tone.fill}" stroke="${tone.stroke}" stroke-width="4"/>
  <text x="${element.x + element.width / 2}" y="${element.y + 56}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${element.fontSize ?? 26}" font-weight="700" fill="${tone.text}">${escapeXml(element.label)}</text>
  ${element.subtitle ? `<text x="${element.x + element.width / 2}" y="${element.y + Math.min(92, element.height - 16)}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" fill="${tone.text}">${escapeXml(element.subtitle)}</text>` : ''}
${elementCloseTag}`
  }).join('')

  const arrows = draft.arrows.map((arrow) => {
    const path = buildArrowPath(arrow)
    const animation = normalizeArrowAnimation(arrow.animation)
    const stepBeginSeconds = computeStepBeginSeconds(arrow.stepIndex, animation.delaySeconds)
    const pointMarkup = animation.enabled === false
      ? ''
      : draft.playbackMode === 'step'
        ? `<circle r="${animation.pointRadius}" fill="${escapeXml(animation.color)}" opacity="0">
  <set attributeName="opacity" to="1" begin="${stepBeginSeconds}s" />
  <set attributeName="opacity" to="0" begin="${stepBeginSeconds + animation.durationSeconds}s" />
  <animateMotion begin="${stepBeginSeconds}s" dur="${animation.durationSeconds}s" repeatCount="1" fill="freeze" path="${path}"/>
</circle>`
        : `<circle r="${animation.pointRadius}" fill="${escapeXml(animation.color)}" opacity="0.95"><animateMotion dur="${animation.durationSeconds}s" repeatCount="indefinite" path="${path}"/></circle>`
    const visibilityAnimation = draft.playbackMode === 'step'
      ? `<animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="${stepBeginSeconds}s" fill="freeze"/>`
      : ''
    return `<g ${draft.playbackMode === 'step' ? 'opacity="0"' : ''}>
  ${visibilityAnimation}
  <path d="${path}" fill="none" stroke="#7a5a3f" stroke-width="5" stroke-dasharray="${arrow.dashed ? '12 10' : '0'}" marker-end="url(#scene-arrow)"/>
  ${pointMarkup}
  ${arrow.label ? `<text x="${(arrow.x1 + arrow.x2) / 2}" y="${(arrow.y1 + arrow.y2) / 2 - 12}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#6a5544">${escapeXml(arrow.label)}</text>` : ''}
</g>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(draft.viewBox)}" role="img">
<metadata data-dpp-svg-scene="true">${metadata}</metadata>
${defs}
<rect width="${sceneBox.width}" height="${sceneBox.height}" rx="32" fill="#fffaf2"/>
${elements}
${arrows}
</svg>`
}
