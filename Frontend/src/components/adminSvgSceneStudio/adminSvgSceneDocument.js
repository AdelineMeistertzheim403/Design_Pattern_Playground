const DEFAULT_VIEW_BOX = '0 0 1200 720'

const TONES = {
  amber: { fill: '#e7c6a7', stroke: '#c25737', text: '#5f2d20' },
  mint: { fill: '#d3ece6', stroke: '#246b5e', text: '#153f38' },
  paper: { fill: '#fff9ef', stroke: '#7f5c3f', text: '#3d2d20' },
  blue: { fill: '#d6e4f1', stroke: '#426c8d', text: '#27465f' },
  dark: { fill: '#241f18', stroke: '#241f18', text: '#fffaf2' },
}

export { DEFAULT_VIEW_BOX, TONES }

export function slugify(value) {
  return `${value ?? ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapeXml(value) {
  return `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function parseViewBox(viewBox) {
  const parts = `${viewBox ?? DEFAULT_VIEW_BOX}`.split(/\s+/).map(Number)
  if (parts.length === 4 && parts.every(Number.isFinite)) {
    return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] }
  }

  return { minX: 0, minY: 0, width: 1200, height: 720 }
}

export function formatViewBox(viewBox) {
  return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`
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

function parsePathEndpoints(pathData) {
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
  if (side === 'left') {
    return { x: element.x, y: element.y + element.height / 2 }
  }

  if (side === 'right') {
    return { x: element.x + element.width, y: element.y + element.height / 2 }
  }

  if (side === 'top') {
    return { x: element.x + element.width / 2, y: element.y }
  }

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

export function createDefaultDraft(name = 'Scene SVG') {
  return {
    viewBox: DEFAULT_VIEW_BOX,
    playbackMode: 'auto',
    elements: [
      { id: `element-${Date.now()}-1`, type: 'rect', label: 'Client', subtitle: 'demande une action', x: 150, y: 220, width: 250, height: 132, tone: 'amber' },
      { id: `element-${Date.now()}-2`, type: 'rect', label: name, subtitle: 'orchestration', x: 475, y: 220, width: 250, height: 132, tone: 'mint' },
      { id: `element-${Date.now()}-3`, type: 'rect', label: 'Resultat', subtitle: 'retour visible', x: 800, y: 220, width: 250, height: 132, tone: 'paper' },
    ],
    arrows: [
      { id: `arrow-${Date.now()}-1`, label: 'flow', x1: 400, y1: 286, x2: 475, y2: 286, dashed: false, curvature: 0, stepIndex: 0, animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e' } },
      { id: `arrow-${Date.now()}-2`, label: 'flow', x1: 725, y1: 286, x2: 800, y2: 286, dashed: false, curvature: 0, stepIndex: 1, animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e' } },
    ],
    steps: [
      { label: 'Demande client' },
      { label: 'Resultat produit' },
    ],
  }
}

function getTranslateOffset(node) {
  const transform = node?.getAttribute?.('transform') ?? ''
  const match = transform.match(/translate\(\s*([-0-9.]+)[,\s]+([-0-9.]+)/)
  if (!match) {
    return { x: 0, y: 0 }
  }

  return { x: Number(match[1]) || 0, y: Number(match[2]) || 0 }
}

function parseLegacySvg(document, fallbackName) {
  const svg = document.querySelector('svg')
  const draft = {
    viewBox: svg?.getAttribute('viewBox') || DEFAULT_VIEW_BOX,
    playbackMode: 'auto',
    elements: [],
    arrows: [],
    steps: [],
  }

  document.querySelectorAll('path[d]').forEach((path, index) => {
    const d = path.getAttribute('d') ?? ''
    const endpoints = parsePathEndpoints(d)
    if (!endpoints || !path.getAttribute('marker-end')) {
      return
    }

    draft.arrows.push({
      id: `arrow-imported-${index}`,
      label: '',
      ...endpoints,
      dashed: (path.getAttribute('stroke-dasharray') ?? '0') !== '0',
      curvature: 0,
      stepIndex: index,
      animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e' },
    })
  })

  document.querySelectorAll('rect').forEach((rect, index) => {
    const width = Number(rect.getAttribute('width'))
    const height = Number(rect.getAttribute('height'))
    if (!Number.isFinite(width) || !Number.isFinite(height) || (width >= 1000 && height >= 600)) {
      return
    }

    const offset = getTranslateOffset(rect.parentElement)
    const label = rect.parentElement?.querySelector('text')?.textContent?.trim() || `Element ${index + 1}`
    const subtitle = rect.parentElement?.querySelectorAll('text')?.[1]?.textContent?.trim() || ''
    draft.elements.push({
      id: `element-imported-rect-${index}`,
      type: 'rect',
      label,
      subtitle,
      x: (Number(rect.getAttribute('x')) || 0) + offset.x,
      y: (Number(rect.getAttribute('y')) || 0) + offset.y,
      width,
      height,
      fontSize: 26,
      tone: 'paper',
    })
  })

  document.querySelectorAll('ellipse,circle').forEach((shape, index) => {
    const isCircle = shape.tagName.toLowerCase() === 'circle'
    const rx = isCircle ? Number(shape.getAttribute('r')) : Number(shape.getAttribute('rx'))
    const ry = isCircle ? rx : Number(shape.getAttribute('ry'))
    const cx = Number(shape.getAttribute('cx'))
    const cy = Number(shape.getAttribute('cy'))
    if (![rx, ry, cx, cy].every(Number.isFinite)) {
      return
    }

    const label = shape.parentElement?.querySelector('text')?.textContent?.trim() || `Noeud ${index + 1}`
    draft.elements.push({
      id: `element-imported-ellipse-${index}`,
      type: 'ellipse',
      label,
      subtitle: '',
      x: cx - rx,
      y: cy - ry,
      width: rx * 2,
      height: ry * 2,
      fontSize: 24,
      tone: 'blue',
    })
  })

  document.querySelectorAll('svg > text').forEach((text, index) => {
    draft.elements.push({
      id: `element-imported-text-${index}`,
      type: 'text',
      label: text.textContent?.trim() || fallbackName,
      subtitle: '',
      x: Number(text.getAttribute('x')) || 160,
      y: Number(text.getAttribute('y')) || 160,
      width: 180,
      height: 48,
      fontSize: Number(text.getAttribute('font-size')) || 30,
      tone: 'dark',
    })
  })

  return draft.elements.length || draft.arrows.length ? draft : createDefaultDraft(fallbackName)
}

export function getElementCenter(element) {
  return {
    x: element.x + (element.width ?? element.rx * 2 ?? 160) / 2,
    y: element.y + (element.height ?? element.ry * 2 ?? 92) / 2,
  }
}

export function createDraftFromVisualization(execution, fallbackName) {
  const visualization = execution?.visualization
  const nodes = Array.isArray(visualization?.nodes) ? visualization.nodes : []
  const edges = Array.isArray(visualization?.edges) ? visualization.edges : []

  if (!nodes.length) {
    return createDefaultDraft(fallbackName)
  }

  const columns = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(nodes.length))))
  const positions = new Map()
  const elements = nodes.map((node, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const x = 120 + column * 340
    const y = 140 + row * 180
    const width = node.type === 'output' || node.type === 'memory' ? 260 : 280
    const height = node.type === 'cluster' ? 138 : 124
    const element = {
      id: `element-${node.id}`,
      sourceNodeId: node.id,
      type: node.type === 'memory' ? 'ellipse' : 'rect',
      label: node.label ?? node.id,
      subtitle: node.data?.detail ?? node.data?.message ?? '',
      x,
      y,
      width,
      height,
      fontSize: 24,
      tone: node.type === 'pool' || node.type === 'factory'
        ? 'mint'
        : node.type === 'output' || node.type === 'memory'
          ? 'amber'
          : node.type === 'flyweight'
            ? 'blue'
            : 'paper',
    }

    positions.set(node.id, getElementCenter(element))
    return element
  })

  const arrows = edges.map((edge, index) => {
    const start = positions.get(edge.from) ?? { x: 180, y: 180 }
    const end = positions.get(edge.to) ?? { x: 440, y: 180 }
    return {
      id: `arrow-${index}-${edge.from}-${edge.to}`,
      label: edge.label ?? '',
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      dashed: ['share', 'copy', 'measure'].includes(edge.label),
      curvature: 0,
    }
  })

  return {
    viewBox: '0 0 1200 820',
    playbackMode: 'auto',
    elements,
    arrows: arrows.map((arrow, index) => ({
      ...arrow,
      stepIndex: index,
      animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e' },
    })),
    steps: edges.map((edge) => ({ label: edge.label || `${edge.from} -> ${edge.to}` })),
  }
}

function createFlyweightDraft(execution, fallbackName) {
  const output = execution?.output
  if (!output) {
    return createDraftFromVisualization(execution, fallbackName)
  }

  const objectCount = Number(output.objectCount ?? 2400)
  const variants = Array.isArray(output.variants) ? output.variants.slice(0, 6) : []
  const useFlyweight = output.mode === 'WITH_FLYWEIGHT'
  const elements = [
    { id: 'element-scene', sourceNodeId: 'scene', type: 'rect', label: `${objectCount.toLocaleString('fr-FR')} ${`${output.assetLabel ?? 'objets'}`.toLowerCase()}`, subtitle: useFlyweight ? 'etat extrinseque par objet' : 'etat complet duplique', x: 70, y: 150, width: 330, height: 150, fontSize: 24, tone: 'blue' },
    { id: 'element-factory', sourceNodeId: 'factory', type: 'rect', label: 'SceneObjectFlyweightFactory', subtitle: useFlyweight ? 'cache actif' : 'cache contourne', x: 465, y: 150, width: 330, height: 150, fontSize: 22, tone: 'mint' },
    { id: 'element-memory', sourceNodeId: 'metrics', type: 'rect', label: 'Memoire', subtitle: `${output.memoryCurrentKb ?? 0} KB / ${output.memoryWithoutFlyweightKb ?? 0} KB`, x: 850, y: 150, width: 280, height: 150, fontSize: 24, tone: 'amber' },
    { id: 'element-instances', sourceNodeId: 'instances', type: 'ellipse', label: `${output.realInstances ?? 0} instance(s)`, subtitle: useFlyweight ? 'partage actif' : 'duplication totale', x: 470, y: 500, width: 320, height: 130, fontSize: 24, tone: useFlyweight ? 'mint' : 'amber' },
    ...variants.map((variant, index) => ({
      id: `element-variant-${index}`,
      sourceNodeId: `flyweight-${index + 1}`,
      type: 'rect',
      label: variant.label ?? `${output.assetLabel ?? 'Asset'} ${index + 1}`,
      subtitle: useFlyweight ? 'instance partagee' : `${variant.objects ?? 0} copie(s)`,
      x: 80 + index * 176,
      y: 340,
      width: 150,
      height: 104,
      fontSize: 17,
      tone: 'paper',
    })),
  ]
  const centers = new Map(elements.map((element) => [element.sourceNodeId, getElementCenter(element)]))
  const arrowPairs = [
    ['scene', 'factory', 'spawn'],
    ['factory', 'metrics', 'measure'],
    ['scene', 'instances', 'allocate'],
    ...variants.map((_, index) => ['factory', `flyweight-${index + 1}`, useFlyweight ? 'share' : 'copy']),
  ]

  return {
    viewBox: '0 0 1200 720',
    playbackMode: 'auto',
    elements,
    arrows: arrowPairs.map(([from, to, label], index) => {
      const start = centers.get(from) ?? { x: 200, y: 200 }
      const end = centers.get(to) ?? { x: 500, y: 200 }
      return {
        id: `arrow-flyweight-${index}`,
        label,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        dashed: ['share', 'copy', 'measure'].includes(label),
        curvature: 0,
        stepIndex: index,
        animation: {
          enabled: true,
          durationSeconds: label === 'measure' ? 2.2 : 1.7,
          color: useFlyweight ? '#246b5e' : '#c25737',
        },
      }
    }),
    steps: arrowPairs.map(([, , label]) => ({ label })),
  }
}

export async function createDraftFromPatternExecution(code, fallbackName, loadFallbackSchema, executeFallbackPattern, normalizeParameters, buildInitialParameters) {
  try {
    const schema = await loadFallbackSchema(code)
    const parameters = normalizeParameters(schema, buildInitialParameters(schema))
    const execution = await executeFallbackPattern(code, parameters)
    return code === 'flyweight'
      ? createFlyweightDraft(execution, fallbackName)
      : createDraftFromVisualization(execution, fallbackName)
  } catch {
    return createDefaultDraft(fallbackName)
  }
}

export function parseStoredDraft(svgMarkup, fallbackName) {
  if (!svgMarkup) {
    return createDefaultDraft(fallbackName)
  }

  try {
    const document = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const metadata = document.querySelector('metadata[data-dpp-svg-scene="true"]')
    if (!metadata?.textContent) {
      return parseLegacySvg(document, fallbackName)
    }

    const parsed = JSON.parse(metadata.textContent)
    if (!Array.isArray(parsed.elements) || !Array.isArray(parsed.arrows)) {
      return createDefaultDraft(fallbackName)
    }

    return {
      viewBox: parsed.viewBox || DEFAULT_VIEW_BOX,
      playbackMode: parsed.playbackMode === 'step' ? 'step' : 'auto',
      elements: parsed.elements,
      arrows: parsed.arrows,
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    }
  } catch {
    return createDefaultDraft(fallbackName)
  }
}

function serializeSvgNode(node) {
  return new XMLSerializer().serializeToString(node)
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
      .map((node) => serializeSvgNode(node))
      .join('')
  } catch {
    return rawMarkup
  }
}

function escapeReplacementPattern(value) {
  return `${value ?? ''}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function formatRuntimeLocale(value) {
  const number = Number(value)
  if (Number.isFinite(number)) {
    return number.toLocaleString('fr-FR')
  }

  return `${value ?? ''}`
}

function addRuntimeReplacement(replacements, from, to) {
  const source = `${from ?? ''}`.trim()
  if (!source || !to) {
    return
  }

  replacements.push([source, to])
}

function collectRuntimeTemplateReplacements(replacements, value, path) {
  if (value === undefined || value === null || !path) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectRuntimeTemplateReplacements(replacements, item, `${path}.${index}`)
    })
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, childValue]) => {
      collectRuntimeTemplateReplacements(replacements, childValue, `${path}.${key}`)
    })
    return
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    addRuntimeReplacement(replacements, trimmed, `{{${path}}}`)
    addRuntimeReplacement(replacements, trimmed.toLowerCase(), `{{${path}|lower}}`)
    addRuntimeReplacement(replacements, trimmed.toUpperCase(), `{{${path}|upper}}`)
    return
  }

  if (typeof value === 'number') {
    addRuntimeReplacement(replacements, formatRuntimeLocale(value), `{{${path}|locale}}`)
    addRuntimeReplacement(replacements, value, `{{${path}}}`)
  }
}

function getModePatternLabel(mode) {
  const patternPart = `${mode ?? ''}`
    .trim()
    .toUpperCase()
    .replace(/^WITH(?:OUT)?_/, '')
    .replace(/_/g, ' ')
    .trim()

  if (!patternPart) {
    return ''
  }

  return patternPart
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function buildRuntimeTemplateReplacements(execution) {
  const output = execution?.output ?? {}
  const replacements = []

  collectRuntimeTemplateReplacements(replacements, output, 'output')
  collectRuntimeTemplateReplacements(replacements, execution?.visualization, 'execution.visualization')

  ;[
    'objectCount',
    'memoryCurrentKb',
    'memoryWithoutFlyweightKb',
    'savedMemoryKb',
    'savingsPercent',
    'simulatedFrameCostMs',
    'realInstances',
    'sharedVariantCount',
  ].forEach((field) => {
    if (output[field] !== undefined && output[field] !== null) {
      addRuntimeReplacement(replacements, formatRuntimeLocale(output[field]), `{{output.${field}|locale}}`)
      addRuntimeReplacement(replacements, output[field], `{{output.${field}}}`)
    }
  })

  ;['assetLabel', 'modeLabel', 'performanceLabel', 'mode'].forEach((field) => {
    if (output[field]) {
      addRuntimeReplacement(replacements, output[field], `{{output.${field}}}`)
      addRuntimeReplacement(replacements, `${output[field]}`.toLowerCase(), `{{output.${field}|lower}}`)
      addRuntimeReplacement(replacements, `${output[field]}`.toUpperCase(), `{{output.${field}|upper}}`)
    }
  })

  if (Array.isArray(output.variants)) {
    output.variants.forEach((variant, index) => {
      addRuntimeReplacement(replacements, variant?.label, `{{output.variants.${index}.label}}`)
      if (variant?.objects !== undefined && variant?.objects !== null) {
        addRuntimeReplacement(replacements, formatRuntimeLocale(variant.objects), `{{output.variants.${index}.objects|locale}}`)
      }
    })
  }

  const modePatternLabel = getModePatternLabel(output.mode)
  if (modePatternLabel) {
    addRuntimeReplacement(replacements, `Avec ${modePatternLabel}`, '{{computed.patternMode.title}}')
    addRuntimeReplacement(replacements, `Sans ${modePatternLabel}`, '{{computed.patternMode.title}}')
    addRuntimeReplacement(replacements, `AVEC ${modePatternLabel.toUpperCase()}`, '{{computed.patternMode.upper}}')
    addRuntimeReplacement(replacements, `SANS ${modePatternLabel.toUpperCase()}`, '{{computed.patternMode.upper}}')
  }

  addRuntimeReplacement(replacements, 'ETAT EXTRINSIQUE PAR OBJET', '{{computed.flyweight.objectStateLabel}}')
  addRuntimeReplacement(replacements, 'ETAT COMPLET DUPLIQUE', '{{computed.flyweight.objectStateLabel}}')
  addRuntimeReplacement(replacements, 'etat extrinseque par objet', '{{computed.flyweight.objectStateSubtitle}}')
  addRuntimeReplacement(replacements, 'etat complet duplique', '{{computed.flyweight.objectStateSubtitle}}')
  addRuntimeReplacement(replacements, 'POOL PARTAGE', '{{computed.flyweight.poolTitle}}')
  addRuntimeReplacement(replacements, 'INSTANCE STORM', '{{computed.flyweight.poolTitle}}')
  addRuntimeReplacement(replacements, `${formatRuntimeLocale(output.sharedVariantCount ?? output.variantCount ?? 0)} variante(s) alimentent toute la foule`, '{{computed.flyweight.poolSubtitle}}')
  addRuntimeReplacement(replacements, 'Chaque objet conserve son propre etat intrinsique', '{{computed.flyweight.poolSubtitle}}')
  addRuntimeReplacement(replacements, 'cache actif', '{{computed.flyweight.factoryCacheLabel}}')
  addRuntimeReplacement(replacements, 'cache contourne', '{{computed.flyweight.factoryCacheLabel}}')
  addRuntimeReplacement(replacements, 'partage actif', '{{computed.flyweight.instanceShareLabel}}')
  addRuntimeReplacement(replacements, 'duplication totale', '{{computed.flyweight.instanceShareLabel}}')

  return replacements
    .filter(([from]) => !from.includes('{{'))
    .sort((left, right) => right[0].length - left[0].length)
}

function applyRuntimeTemplates(value, execution) {
  if (!value || !execution?.output) {
    return value
  }

  return buildRuntimeTemplateReplacements(execution).reduce((current, [from, to]) => (
    current.replace(new RegExp(escapeReplacementPattern(from), 'g'), to)
  ), `${value}`)
}

function applyRuntimeTemplatesToMarkup(rawMarkup, execution) {
  if (!rawMarkup || !execution?.output) {
    return rawMarkup
  }

  try {
    const document = new DOMParser().parseFromString(`<svg>${rawMarkup}</svg>`, 'image/svg+xml')
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT)
    const textNodes = []
    let node = walker.nextNode()

    while (node) {
      textNodes.push(node)
      node = walker.nextNode()
    }

    textNodes.forEach((textNode) => {
      textNode.nodeValue = applyRuntimeTemplates(textNode.nodeValue, execution)
    })

    return Array.from(document.documentElement.children)
      .map((child) => serializeSvgNode(child))
      .join('')
  } catch {
    return applyRuntimeTemplates(rawMarkup, execution)
  }
}

export function createDraftFromRenderedSvg(svg, fallbackName, execution = null) {
  if (!svg) {
    return createDefaultDraft(fallbackName)
  }

  const viewBox = svg.getAttribute('viewBox') || DEFAULT_VIEW_BOX
  const arrows = Array.from(svg.querySelectorAll('path[d]'))
    .map((path, index) => {
      if (!path.getAttribute('marker-end')) {
        return null
      }

      const endpoints = parsePathEndpoints(path.getAttribute('d'))
      if (!endpoints) {
        return null
      }

      const motion = path.parentElement?.querySelector('animateMotion')
      return {
        id: `arrow-rendered-${index}`,
        label: applyRuntimeTemplates(path.parentElement?.querySelector('text')?.textContent?.trim() ?? '', execution),
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
  const rawElements = Array.from(svg.children)
    .filter((node) => !['defs', 'metadata', 'title', 'desc'].includes(node.tagName.toLowerCase()))
    .filter((node) => !arrowPathNodes.has(node) && !Array.from(node.querySelectorAll?.('path[d][marker-end]') ?? []).some((path) => arrowPathNodes.has(path)))
    .filter((node) => !node.querySelector?.('animateMotion') && node.tagName.toLowerCase() !== 'animateMotion')
    .map((node, index) => {
      let box = null
      try {
        box = node.getBBox()
      } catch {
        box = null
      }

      const x = Number.isFinite(box?.x) ? Math.round(box.x) : 0
      const y = Number.isFinite(box?.y) ? Math.round(box.y) : 0
      const width = Number.isFinite(box?.width) && box.width > 0 ? Math.round(box.width) : 80
      const height = Number.isFinite(box?.height) && box.height > 0 ? Math.round(box.height) : 40

      return {
        id: `raw-rendered-${index}`,
        type: 'raw',
        label: node.tagName.toLowerCase(),
        rawMarkup: applyRuntimeTemplatesToMarkup(sanitizeRawMarkup(serializeSvgNode(node)), execution),
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
    .filter((element) => element.rawMarkup && element.width > 0 && element.height > 0)

  return {
    viewBox,
    playbackMode: 'auto',
    elements: rawElements.length ? rawElements : createDefaultDraft(fallbackName).elements,
    arrows,
    steps: arrows.map((arrow) => ({ label: arrow.label || 'flow' })),
  }
}

export function generateSvgMarkup(draft) {
  const metadata = escapeXml(JSON.stringify(draft))
  const sceneBox = parseViewBox(draft.viewBox)
  const background = `<rect width="${sceneBox.width}" height="${sceneBox.height}" rx="32" fill="#fffaf2"/>`
  const defs = `<defs>
  <marker id="scene-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f"/>
  </marker>
</defs>`
  const arrows = draft.arrows.map((arrow) => `
  <g>
    <path d="${buildArrowPath(arrow)}" fill="none" stroke="#7a5a3f" stroke-width="5" stroke-dasharray="${arrow.dashed ? '12 10' : '0'}" marker-end="url(#scene-arrow)"/>
    ${arrow.animation?.enabled === false ? '' : `<circle r="5" fill="${escapeXml(arrow.animation?.color ?? '#246b5e')}" opacity="0.95"><animateMotion dur="${Number(arrow.animation?.durationSeconds ?? 1.8)}s" repeatCount="indefinite" path="${buildArrowPath(arrow)}"/></circle>`}
    ${arrow.label ? `<text x="${(arrow.x1 + arrow.x2) / 2}" y="${(arrow.y1 + arrow.y2) / 2 - 12}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#6a5544">${escapeXml(arrow.label)}</text>` : ''}
  </g>`).join('')
  const elements = draft.elements.map((element) => {
    const tone = TONES[element.tone] ?? TONES.paper
    if (element.type === 'ellipse') {
      const cx = element.x + element.width / 2
      const cy = element.y + element.height / 2
      return `
  <g>
    <ellipse cx="${cx}" cy="${cy}" rx="${element.width / 2}" ry="${element.height / 2}" fill="${tone.fill}" stroke="${tone.stroke}" stroke-width="4"/>
    <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${element.fontSize ?? 24}" font-weight="700" fill="${tone.text}">${escapeXml(element.label)}</text>
  </g>`
    }

    if (element.type === 'text') {
      return `
  <text x="${element.x}" y="${element.y}" font-family="Inter, Arial, sans-serif" font-size="${element.fontSize ?? 30}" font-weight="700" fill="${tone.text}">${escapeXml(element.label)}</text>`
    }

    if (element.type === 'raw') {
      const scaleX = element.baseWidth > 0 ? element.width / element.baseWidth : 1
      const scaleY = element.baseHeight > 0 ? element.height / element.baseHeight : 1
      return `
  <g transform="translate(${element.x} ${element.y}) scale(${scaleX} ${scaleY}) translate(${-element.baseX} ${-element.baseY})">
    ${sanitizeRawMarkup(element.rawMarkup)}
  </g>`
    }

    return `
  <g>
    <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" rx="24" fill="${tone.fill}" stroke="${tone.stroke}" stroke-width="4"/>
    <text x="${element.x + element.width / 2}" y="${element.y + 56}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${element.fontSize ?? 28}" font-weight="700" fill="${tone.text}">${escapeXml(element.label)}</text>
    ${element.subtitle ? `<text x="${element.x + element.width / 2}" y="${element.y + 92}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" fill="${tone.text}">${escapeXml(element.subtitle)}</text>` : ''}
  </g>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(draft.viewBox)}" role="img">
<metadata data-dpp-svg-scene="true">${metadata}</metadata>
${defs}
${background}
${elements}
${arrows}
</svg>`
}
