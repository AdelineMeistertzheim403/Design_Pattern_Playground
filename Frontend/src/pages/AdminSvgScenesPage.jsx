import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getAdminSvgScene,
  listAdminSvgScenes,
  saveAdminSvgScene,
} from '../lib/api'
import {
  executeFallbackPattern,
  loadFallbackSchema,
  loadPatternSceneComponent,
} from '../patterns/loaders'
import {
  buildInitialParameters,
  normalizeParameters,
} from '../app/playgroundUtils'

const DEFAULT_VIEW_BOX = '0 0 1200 720'
const TONES = {
  amber: { fill: '#e7c6a7', stroke: '#c25737', text: '#5f2d20' },
  mint: { fill: '#d3ece6', stroke: '#246b5e', text: '#153f38' },
  paper: { fill: '#fff9ef', stroke: '#7f5c3f', text: '#3d2d20' },
  blue: { fill: '#d6e4f1', stroke: '#426c8d', text: '#27465f' },
  dark: { fill: '#241f18', stroke: '#241f18', text: '#fffaf2' },
}

function slugify(value) {
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

function parseViewBox(viewBox) {
  const parts = `${viewBox ?? DEFAULT_VIEW_BOX}`.split(/\s+/).map(Number)
  if (parts.length === 4 && parts.every(Number.isFinite)) {
    return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] }
  }

  return { minX: 0, minY: 0, width: 1200, height: 720 }
}

function formatViewBox(viewBox) {
  return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`
}

function buildArrowPath(arrow) {
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

function getElementAnchor(element, side) {
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

function findAttachmentTarget(point, elements) {
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

function createDefaultDraft(name = 'Scene SVG') {
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

function createDraftFromVisualization(execution, fallbackName) {
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

async function createDraftFromPatternExecution(code, fallbackName) {
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

function parseStoredDraft(svgMarkup, fallbackName) {
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

function sanitizeRawMarkup(rawMarkup) {
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

function createDraftFromRenderedSvg(svg, fallbackName, execution = null) {
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

function getElementCenter(element) {
  return {
    x: element.x + (element.width ?? element.rx * 2 ?? 160) / 2,
    y: element.y + (element.height ?? element.ry * 2 ?? 92) / 2,
  }
}

function generateSvgMarkup(draft) {
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

function AccessMessage({ currentUser, onNavigateHome }) {
  const isAdmin = currentUser?.role === 'ADMIN'
  const title = !currentUser ? 'Edition SVG reservee' : isAdmin ? 'Mode Admin SVG indisponible' : 'Acces admin requis'
  const message = !currentUser
    ? 'Cette page necessite une session authentifiee avec un compte admin.'
    : isAdmin
      ? 'Le backend doit etre actif pour charger et enregistrer les scenes SVG.'
      : 'Le compte courant n a pas le role ADMIN.'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-black/10 bg-white/85 p-8 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Admin SVG</p>
        <h1 className="mt-3 text-4xl text-stone-950">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">{message}</p>
        {!currentUser ? (
          <button className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white" type="button" onClick={onNavigateHome}>
            Retour a l accueil
          </button>
        ) : null}
      </section>
    </div>
  )
}

export default function AdminSvgScenesPage({
  backendStatus,
  currentUser,
  patterns,
  onNavigateHome,
}) {
  const [storedScenes, setStoredScenes] = useState([])
  const [selectedCode, setSelectedCode] = useState('')
  const [sceneName, setSceneName] = useState('')
  const [draft, setDraft] = useState(() => createDefaultDraft())
  const [selectedElementId, setSelectedElementId] = useState('')
  const [selectedElementIds, setSelectedElementIds] = useState([])
  const [selectedArrowId, setSelectedArrowId] = useState('')
  const [newSceneCode, setNewSceneCode] = useState('')
  const [newSceneName, setNewSceneName] = useState('')
  const [notice, setNotice] = useState('')
  const [loadPending, setLoadPending] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [renderedSource, setRenderedSource] = useState(null)
  const svgRef = useRef(null)
  const sourceSceneRef = useRef(null)
  const dragRef = useRef(null)

  const isAdmin = currentUser?.role === 'ADMIN'
  const viewBox = parseViewBox(draft.viewBox)
  const selectedElement = draft.elements.find((element) => element.id === selectedElementId) ?? null
  const selectedArrow = draft.arrows.find((arrow) => arrow.id === selectedArrowId) ?? null
  const SourceSceneComponent = renderedSource?.SceneComponent ?? null
  const svgMarkup = useMemo(() => generateSvgMarkup(draft), [draft])

  const sceneOptions = useMemo(() => {
    const fromPatterns = patterns.map((pattern) => ({ code: pattern.code, name: pattern.name }))
    const customOnly = storedScenes
      .filter((item) => !fromPatterns.some((pattern) => pattern.code === item.code))
      .map((item) => ({ code: item.code, name: item.name }))

    const combined = [...fromPatterns, ...customOnly]
    if (selectedCode && !combined.some((item) => item.code === selectedCode)) {
      combined.push({ code: selectedCode, name: sceneName || selectedCode })
    }

    return combined.sort((left, right) => left.name.localeCompare(right.name, 'fr'))
  }, [patterns, sceneName, selectedCode, storedScenes])

  const getSvgPoint = (event) => {
    const svg = svgRef.current
    if (!svg) {
      return null
    }

    const rect = svg.getBoundingClientRect()
    return {
      x: Math.round(viewBox.minX + (event.clientX - rect.left) * (viewBox.width / rect.width)),
      y: Math.round(viewBox.minY + (event.clientY - rect.top) * (viewBox.height / rect.height)),
    }
  }

  const selectElement = (elementId, event) => {
    const multi = event?.ctrlKey || event?.metaKey || event?.shiftKey
    setSelectedArrowId('')
    setSelectedElementId(elementId)
    setSelectedElementIds((currentIds) => {
      if (!multi) {
        return [elementId]
      }

      return currentIds.includes(elementId)
        ? currentIds.filter((id) => id !== elementId)
        : [...currentIds, elementId]
    })
  }

  useEffect(() => {
    if (!isAdmin || backendStatus !== 'connected') {
      return
    }

    let ignore = false
    const loadIndex = async () => {
      try {
        const items = await listAdminSvgScenes()
        if (!ignore) {
          setStoredScenes(items ?? [])
          setSelectedCode((currentCode) => currentCode || patterns[0]?.code || items[0]?.code || '')
        }
      } catch (error) {
        if (!ignore) {
          setNotice(error.message)
        }
      }
    }

    loadIndex()
    return () => {
      ignore = true
    }
  }, [backendStatus, isAdmin, patterns])

  useEffect(() => {
    if (!selectedCode || !isAdmin || backendStatus !== 'connected') {
      return
    }

    let ignore = false
    setLoadPending(true)
    setNotice('')

    const loadScene = async () => {
      const option = sceneOptions.find((item) => item.code === selectedCode)
      const fallbackName = option?.name ?? selectedCode
      setRenderedSource(null)

      try {
        const stored = await getAdminSvgScene(selectedCode)
        if (ignore) {
          return
        }

        if (stored?.svgMarkup) {
          setSceneName(stored.name ?? fallbackName)
          setDraft(parseStoredDraft(stored.svgMarkup, stored.name ?? fallbackName))
          setSelectedElementId('')
          setSelectedElementIds([])
          setSelectedArrowId('')
          return
        }
      } catch {
        // Built-in patterns may not have a persisted custom scene yet.
      }

      if (!ignore) {
        setSceneName(fallbackName)
        const schema = await loadFallbackSchema(selectedCode)
        const parameters = normalizeParameters(schema, buildInitialParameters(schema))
        const execution = await executeFallbackPattern(selectedCode, parameters)
        const SceneComponent = await loadPatternSceneComponent(selectedCode)

        if (SceneComponent) {
          setDraft(createDefaultDraft(fallbackName))
          setRenderedSource({
            code: selectedCode,
            execution,
            SceneComponent,
          })
          setNotice('Import de la scene SVG existante en cours...')
        } else {
          setDraft(createDraftFromVisualization(execution, fallbackName))
        }
        setSelectedElementId('')
        setSelectedElementIds([])
        setSelectedArrowId('')
      }
    }

    loadScene()
      .catch((error) => {
        if (!ignore) {
          setNotice(error.message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadPending(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [backendStatus, isAdmin, sceneOptions, selectedCode])

  useEffect(() => {
    if (!renderedSource || renderedSource.code !== selectedCode) {
      return
    }

    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        if (cancelled) {
          return
        }

        const svg = sourceSceneRef.current?.querySelector('svg')
        if (!svg) {
          setNotice('Impossible de trouver le SVG rendu par la scene existante.')
          return
        }

        setDraft(createDraftFromRenderedSvg(svg, sceneName || selectedCode, renderedSource.execution))
        setSelectedElementId('')
        setSelectedElementIds([])
        setSelectedArrowId('')
        setNotice('Scene SVG existante importee depuis le rendu du pattern.')
      }, 0)
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [renderedSource, sceneName, selectedCode])

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragRef.current
      if (!drag) {
        return
      }

      const point = getSvgPoint(event)
      if (!point) {
        return
      }

      if (drag.mode === 'move-element') {
        const selectedIds = drag.selectedIds?.length ? drag.selectedIds : [drag.id]
        setDraft((currentDraft) => ({
          ...currentDraft,
          elements: currentDraft.elements.map((element) => {
            if (!selectedIds.includes(element.id)) {
              return element
            }

            return {
              ...element,
              x: (drag.startElements[element.id]?.x ?? element.x) + point.x - drag.startPoint.x,
              y: (drag.startElements[element.id]?.y ?? element.y) + point.y - drag.startPoint.y,
            }
          }),
          arrows: currentDraft.arrows.map((arrow) => {
            let nextArrow = arrow
            const movedFrom = arrow.fromElementId && selectedIds.includes(arrow.fromElementId)
              ? currentDraft.elements.find((element) => element.id === arrow.fromElementId)
              : null
            const movedTo = arrow.toElementId && selectedIds.includes(arrow.toElementId)
              ? currentDraft.elements.find((element) => element.id === arrow.toElementId)
              : null

            if (movedFrom) {
              const startElement = drag.startElements[movedFrom.id] ?? movedFrom
              const nextElement = {
                ...movedFrom,
                x: startElement.x + point.x - drag.startPoint.x,
                y: startElement.y + point.y - drag.startPoint.y,
              }
              const anchor = getElementAnchor(nextElement, arrow.fromSide ?? 'right')
              nextArrow = { ...nextArrow, x1: anchor.x, y1: anchor.y }
            }

            if (movedTo) {
              const startElement = drag.startElements[movedTo.id] ?? movedTo
              const nextElement = {
                ...movedTo,
                x: startElement.x + point.x - drag.startPoint.x,
                y: startElement.y + point.y - drag.startPoint.y,
              }
              const anchor = getElementAnchor(nextElement, arrow.toSide ?? 'left')
              nextArrow = { ...nextArrow, x2: anchor.x, y2: anchor.y }
            }

            return nextArrow
          }),
        }))
        return
      }

      if (drag.mode === 'resize-element') {
        setDraft((currentDraft) => ({
          ...currentDraft,
          elements: currentDraft.elements.map((element) => (
            element.id === drag.id
              ? {
                ...element,
                width: Math.max(element.type === 'text' ? 80 : 120, drag.startElement.width + point.x - drag.startPoint.x),
                height: Math.max(element.type === 'text' ? 40 : 80, drag.startElement.height + point.y - drag.startPoint.y),
              }
              : element
          )),
          arrows: currentDraft.arrows.map((arrow) => {
            const nextElement = {
              ...drag.startElement,
              width: Math.max(drag.startElement.type === 'text' ? 80 : 120, drag.startElement.width + point.x - drag.startPoint.x),
              height: Math.max(drag.startElement.type === 'text' ? 40 : 80, drag.startElement.height + point.y - drag.startPoint.y),
            }
            let nextArrow = arrow
            if (arrow.fromElementId === drag.id) {
              const anchor = getElementAnchor(nextElement, arrow.fromSide ?? 'right')
              nextArrow = { ...nextArrow, x1: anchor.x, y1: anchor.y }
            }
            if (arrow.toElementId === drag.id) {
              const anchor = getElementAnchor(nextElement, arrow.toSide ?? 'left')
              nextArrow = { ...nextArrow, x2: anchor.x, y2: anchor.y }
            }
            return nextArrow
          }),
        }))
        return
      }

      if (drag.mode === 'arrow-start' || drag.mode === 'arrow-end') {
        const target = findAttachmentTarget(point, draft.elements)
        const nextPoint = target?.anchor ?? point
        setDraft((currentDraft) => ({
          ...currentDraft,
          arrows: currentDraft.arrows.map((arrow) => {
            if (arrow.id !== drag.id) {
              return arrow
            }

            return drag.mode === 'arrow-start'
              ? { ...arrow, x1: nextPoint.x, y1: nextPoint.y, fromElementId: target?.elementId, fromSide: target?.side }
              : { ...arrow, x2: nextPoint.x, y2: nextPoint.y, toElementId: target?.elementId, toSide: target?.side }
          }),
        }))
      }
    }

    const handlePointerUp = () => {
      dragRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draft.elements, viewBox.height, viewBox.minX, viewBox.minY, viewBox.width])

  const updateSelectedElement = (updater) => {
    if (!selectedElement) {
      return
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      elements: currentDraft.elements.map((element) => (
        element.id === selectedElement.id ? updater(element) : element
      )),
    }))
  }

  const updateSelectedArrow = (updater) => {
    if (!selectedArrow) {
      return
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      arrows: currentDraft.arrows.map((arrow) => (
        arrow.id === selectedArrow.id ? updater(arrow) : arrow
      )),
    }))
  }

  const startElementDrag = (event, element) => {
    event.stopPropagation()
    const point = getSvgPoint(event)
    if (!point) {
      return
    }

    const selectedIds = selectedElementIds.includes(element.id)
      ? selectedElementIds
      : [element.id]
    const startElements = Object.fromEntries(
      draft.elements
        .filter((currentElement) => selectedIds.includes(currentElement.id))
        .map((currentElement) => [currentElement.id, currentElement]),
    )

    dragRef.current = {
      mode: 'move-element',
      id: element.id,
      selectedIds,
      startPoint: point,
      startElements,
    }
    selectElement(element.id, event)
  }

  const addElement = (type) => {
    const element = {
      id: `element-${Date.now()}`,
      type,
      label: type === 'text' ? 'Texte' : type === 'ellipse' ? 'Noeud' : 'Element',
      subtitle: type === 'rect' ? 'detail' : '',
      x: 160 + draft.elements.length * 28,
      y: 140 + draft.elements.length * 24,
      width: type === 'text' ? 180 : 230,
      height: type === 'text' ? 48 : 120,
      fontSize: type === 'text' ? 30 : 26,
      tone: type === 'ellipse' ? 'blue' : 'paper',
    }

    setDraft((currentDraft) => ({ ...currentDraft, elements: [...currentDraft.elements, element] }))
    setSelectedElementId(element.id)
    setSelectedElementIds([element.id])
    setSelectedArrowId('')
  }

  const addArrow = () => {
    const first = draft.elements[0] ? getElementCenter(draft.elements[0]) : { x: 250, y: 250 }
    const second = draft.elements[1] ? getElementCenter(draft.elements[1]) : { x: 520, y: 250 }
    const arrow = {
      id: `arrow-${Date.now()}`,
      label: 'flow',
      x1: first.x,
      y1: first.y,
      x2: second.x,
      y2: second.y,
      dashed: false,
      curvature: 0,
      stepIndex: draft.arrows.length,
      animation: { enabled: true, durationSeconds: 1.8, color: '#246b5e' },
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      arrows: [...currentDraft.arrows, arrow],
      steps: [...(currentDraft.steps ?? []), { label: arrow.label }],
    }))
    setSelectedArrowId(arrow.id)
    setSelectedElementId('')
    setSelectedElementIds([])
  }

  const deleteSelection = () => {
    if (selectedElementIds.length > 0) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        elements: currentDraft.elements.filter((element) => !selectedElementIds.includes(element.id)),
      }))
      setSelectedElementId('')
      setSelectedElementIds([])
      return
    }

    if (selectedArrow) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        arrows: currentDraft.arrows.filter((arrow) => arrow.id !== selectedArrow.id),
      }))
      setSelectedArrowId('')
    }
  }

  const handleCreateScene = () => {
    const code = slugify(newSceneCode)
    const name = newSceneName.trim()
    if (!code || !name) {
      setNotice('Renseigne un code et un nom pour creer une scene.')
      return
    }

    setSelectedCode(code)
    setSceneName(name)
    setDraft(createDefaultDraft(name))
    setSelectedElementId('')
    setSelectedElementIds([])
    setSelectedArrowId('')
    setNotice('Nouvelle scene initialisee. Tu peux maintenant la composer dans le canvas.')
  }

  const handleReimportPatternScene = async () => {
    if (!selectedCode) {
      setNotice('Choisis un pattern avant de reimporter sa scene SVG.')
      return
    }

    setLoadPending(true)
    setNotice('')

    try {
      const option = sceneOptions.find((item) => item.code === selectedCode)
      const fallbackName = option?.name ?? sceneName ?? selectedCode
      const schema = await loadFallbackSchema(selectedCode)
      const parameters = normalizeParameters(schema, buildInitialParameters(schema))
      const execution = await executeFallbackPattern(selectedCode, parameters)
      const SceneComponent = await loadPatternSceneComponent(selectedCode)

      setSceneName((currentName) => currentName || fallbackName)
      if (SceneComponent) {
        setDraft(createDefaultDraft(fallbackName))
        setRenderedSource({
          code: selectedCode,
          execution,
          SceneComponent,
        })
        setNotice('Reimport de la scene SVG existante en cours...')
      } else {
        setRenderedSource(null)
        setDraft(createDraftFromVisualization(execution, fallbackName))
        setNotice('Scene reconstruite depuis la visualisation du pattern.')
      }
      setSelectedElementId('')
      setSelectedElementIds([])
      setSelectedArrowId('')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoadPending(false)
    }
  }

  const handleSave = async () => {
    if (!selectedCode) {
      setNotice('Choisis une scene ou cree un nouveau code avant de sauvegarder.')
      return
    }

    setSavePending(true)
    setNotice('')

    try {
      const saved = await saveAdminSvgScene(selectedCode, {
        code: selectedCode,
        name: sceneName.trim() || selectedCode,
        svgMarkup,
      })
      const freshIndex = await listAdminSvgScenes()
      setStoredScenes(freshIndex ?? [])
      setSceneName(saved.name)
      setDraft(parseStoredDraft(saved.svgMarkup, saved.name))
      setNotice(`Scene SVG enregistree par ${saved.updatedBy}.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSavePending(false)
    }
  }

  if (!currentUser || !isAdmin || backendStatus !== 'connected') {
    return <AccessMessage currentUser={currentUser} onNavigateHome={onNavigateHome} />
  }

  if (currentUser.forcePasswordChange) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Admin SVG</p>
          <h1 className="mt-3 text-4xl text-stone-950">Changement de mot de passe requis</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
            Le compte admin par defaut doit d abord changer son mot de passe initial depuis la fenetre Compte.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {SourceSceneComponent ? (
        <div
          ref={sourceSceneRef}
          className="pointer-events-none fixed left-[-10000px] top-0 w-[1200px] opacity-0"
          aria-hidden="true"
        >
          <SourceSceneComponent
            execution={renderedSource.execution}
            isExpanded
            panelClassName="p-0"
            svgClassName="h-auto w-full"
            TitleTag="h2"
            sourceLabel="Import admin"
          />
        </div>
      ) : null}

      <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.92))] p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Admin SVG</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl text-stone-950">Editeur visuel de scenes SVG</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Compose la scene dans le canvas, deplace les elements, redimensionne-les, ajuste les fleches et sauvegarde le SVG en base.
            </p>
          </div>
          <button
            className="rounded-full border border-black/10 bg-stone-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={savePending}
            type="button"
            onClick={handleSave}
          >
            {savePending ? 'Enregistrement...' : 'Sauvegarder en base'}
          </button>
        </div>
        {notice ? (
          <p className="mt-4 rounded-2xl border border-black/8 bg-white/80 px-4 py-3 text-sm text-stone-700">{notice}</p>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)_340px]">
        <aside className="flex flex-col gap-6">
          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Source</p>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Scene a editer</span>
              <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
                <option value="">Choisir une scene</option>
                {sceneOptions.map((item) => (
                  <option key={item.code} value={item.code}>{item.name} ({item.code})</option>
                ))}
              </select>
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Nom de la scene</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={sceneName} onChange={(event) => setSceneName(event.target.value)} />
            </label>
            <button
              className="mt-4 w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800 disabled:opacity-60"
              disabled={!selectedCode || loadPending}
              type="button"
              onClick={handleReimportPatternScene}
            >
              Reimporter la scene du pattern
            </button>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">ViewBox</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 font-mono text-sm text-stone-900 outline-none" value={draft.viewBox} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: event.target.value }))} />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Largeur scene</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={viewBox.width} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: formatViewBox({ ...parseViewBox(currentDraft.viewBox), width: Number(event.target.value) || 1200 }) }))} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">Hauteur scene</span>
                <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={viewBox.height} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, viewBox: formatViewBox({ ...parseViewBox(currentDraft.viewBox), height: Number(event.target.value) || 720 }) }))} />
              </label>
            </div>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Lecture</span>
              <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={draft.playbackMode ?? 'auto'} onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, playbackMode: event.target.value }))}>
                <option value="auto">Animation automatique</option>
                <option value="step">Pas a pas</option>
              </select>
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Etapes</span>
              <textarea
                className="min-h-24 rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none"
                value={(draft.steps ?? []).map((step) => step.label).join('\n')}
                onChange={(event) => setDraft((currentDraft) => ({
                  ...currentDraft,
                  steps: event.target.value.split('\n').map((label) => ({ label: label.trim() })).filter((step) => step.label),
                }))}
              />
            </label>
            {loadPending ? <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">Chargement...</p> : null}
          </section>

          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Ajouter</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => addElement('rect')}>Boite</button>
              <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => addElement('ellipse')}>Cercle</button>
              <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => addElement('text')}>Texte</button>
              <button className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800" type="button" onClick={addArrow}>Fleche</button>
            </div>
            <button className="mt-4 w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-800" type="button" onClick={() => setDraft(createDefaultDraft(sceneName || selectedCode || 'Scene SVG'))}>
              Reinitialiser le canvas
            </button>
          </section>

          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Nouveau</p>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Code</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" placeholder="ma-nouvelle-scene" value={newSceneCode} onChange={(event) => setNewSceneCode(event.target.value)} />
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm text-stone-700">
              <span className="font-semibold text-stone-900">Nom</span>
              <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" placeholder="Nouvelle scene" value={newSceneName} onChange={(event) => setNewSceneName(event.target.value)} />
            </label>
            <button className="mt-4 rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white" type="button" onClick={handleCreateScene}>
              Creer un brouillon
            </button>
          </section>
        </aside>

        <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.94))] p-4 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          <svg
            ref={svgRef}
            className="h-auto w-full rounded-[24px] border border-black/10 bg-[#fffaf2]"
            viewBox={draft.viewBox}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedElementId('')
                setSelectedElementIds([])
                setSelectedArrowId('')
              }
            }}
          >
            <defs>
              <marker id="admin-svg-editor-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
              </marker>
            </defs>
            <rect width={viewBox.width} height={viewBox.height} rx="32" fill="#fffaf2" />

            {draft.arrows.map((arrow) => {
              const isActive = arrow.id === selectedArrowId
              return (
                <g key={arrow.id}>
                  <path d={buildArrowPath(arrow)} fill="none" stroke="transparent" strokeWidth="22" className="cursor-pointer" onPointerDown={(event) => {
                    event.stopPropagation()
                    setSelectedArrowId(arrow.id)
                    setSelectedElementId('')
                    setSelectedElementIds([])
                  }} />
                  <path d={buildArrowPath(arrow)} fill="none" stroke={isActive ? '#c25737' : '#7a5a3f'} strokeWidth={isActive ? '6' : '4'} strokeDasharray={arrow.dashed ? '12 10' : '0'} markerEnd="url(#admin-svg-editor-arrow)" />
                  {arrow.label ? <text x={(arrow.x1 + arrow.x2) / 2} y={(arrow.y1 + arrow.y2) / 2 - 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#6a5544">{arrow.label}</text> : null}
                  {isActive ? (
                    <>
                      <circle cx={arrow.x1} cy={arrow.y1} r="11" fill="#fffaf2" stroke="#c25737" strokeWidth="3" className="cursor-grab" onPointerDown={(event) => {
                        event.stopPropagation()
                        dragRef.current = { mode: 'arrow-start', id: arrow.id }
                      }} />
                      <circle cx={arrow.x2} cy={arrow.y2} r="11" fill="#fffaf2" stroke="#c25737" strokeWidth="3" className="cursor-grab" onPointerDown={(event) => {
                        event.stopPropagation()
                        dragRef.current = { mode: 'arrow-end', id: arrow.id }
                      }} />
                    </>
                  ) : null}
                </g>
              )
            })}

            {draft.elements.map((element) => {
              const tone = TONES[element.tone] ?? TONES.paper
              const isActive = selectedElementIds.includes(element.id)
              const center = getElementCenter(element)
              return (
                <g key={element.id} className="cursor-pointer" onPointerDown={(event) => {
                  event.stopPropagation()
                  selectElement(element.id, event)
                }}>
                  {element.type === 'ellipse' ? (
                    <ellipse cx={center.x} cy={center.y} rx={element.width / 2} ry={element.height / 2} fill={tone.fill} stroke={isActive ? '#c25737' : tone.stroke} strokeWidth={isActive ? '5' : '4'} className="cursor-move" onPointerDown={(event) => startElementDrag(event, element)} />
                  ) : element.type === 'text' ? (
                    <text x={element.x} y={element.y} fontSize={element.fontSize ?? 30} fontWeight="700" fill={tone.text} className="cursor-move select-none" onPointerDown={(event) => startElementDrag(event, element)}>{element.label}</text>
                  ) : element.type === 'raw' ? (
                    <g
                      className="cursor-move"
                      transform={`translate(${element.x} ${element.y}) scale(${element.baseWidth > 0 ? element.width / element.baseWidth : 1} ${element.baseHeight > 0 ? element.height / element.baseHeight : 1}) translate(${-element.baseX} ${-element.baseY})`}
                      onPointerDown={(event) => startElementDrag(event, element)}
                      dangerouslySetInnerHTML={{ __html: sanitizeRawMarkup(element.rawMarkup) }}
                    />
                  ) : (
                    <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="24" fill={tone.fill} stroke={isActive ? '#c25737' : tone.stroke} strokeWidth={isActive ? '5' : '4'} className="cursor-move" onPointerDown={(event) => startElementDrag(event, element)} />
                  )}
                  {element.type !== 'text' && element.type !== 'raw' ? (
                    <>
                      <text x={center.x} y={element.y + Math.min(56, element.height / 2)} textAnchor="middle" fontSize={element.fontSize ?? 26} fontWeight="700" fill={tone.text} className="pointer-events-none select-none">{element.label}</text>
                      {element.subtitle ? <text x={center.x} y={element.y + Math.min(92, element.height - 22)} textAnchor="middle" fontSize="16" fill={tone.text} className="pointer-events-none select-none">{element.subtitle}</text> : null}
                    </>
                  ) : null}
                  {isActive ? (
                    <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="10" fill="none" stroke="#c25737" strokeDasharray="10 7" strokeWidth="3" pointerEvents="none" />
                  ) : null}
                  {isActive ? (
                    <rect x={element.x + element.width - 16} y={element.y + element.height - 16} width="16" height="16" rx="4" fill="#c25737" className="cursor-se-resize" onPointerDown={(event) => {
                      event.stopPropagation()
                      const point = getSvgPoint(event)
                      if (point) {
                        dragRef.current = { mode: 'resize-element', id: element.id, startPoint: point, startElement: element }
                      }
                    }} />
                  ) : null}
                </g>
              )
            })}

            {draft.arrows.map((arrow) => {
              const isActive = arrow.id === selectedArrowId
              return (
                <g key={`${arrow.id}-top-layer`}>
                  <path d={buildArrowPath(arrow)} fill="none" stroke="transparent" strokeWidth="24" className="cursor-pointer" onPointerDown={(event) => {
                    event.stopPropagation()
                    setSelectedArrowId(arrow.id)
                    setSelectedElementId('')
                    setSelectedElementIds([])
                  }} />
                  <path d={buildArrowPath(arrow)} fill="none" stroke={isActive ? '#c25737' : '#7a5a3f'} strokeWidth={isActive ? '6' : '4'} strokeDasharray={arrow.dashed ? '12 10' : '0'} markerEnd="url(#admin-svg-editor-arrow)" pointerEvents="none" />
                  {(draft.playbackMode ?? 'auto') === 'auto' && arrow.animation?.enabled !== false ? (
                    <circle key={`${arrow.id}-${buildArrowPath(arrow)}-${arrow.animation?.durationSeconds ?? 1.8}`} r="5" fill={arrow.animation?.color ?? '#246b5e'} opacity="0.95" pointerEvents="none">
                      <animateMotion dur={`${arrow.animation?.durationSeconds ?? 1.8}s`} repeatCount="indefinite" path={buildArrowPath(arrow)} />
                    </circle>
                  ) : null}
                  {arrow.label ? <text x={(arrow.x1 + arrow.x2) / 2} y={(arrow.y1 + arrow.y2) / 2 - 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#6a5544" pointerEvents="none">{arrow.label}</text> : null}
                  {isActive ? (
                    <>
                      <circle cx={arrow.x1} cy={arrow.y1} r="11" fill="#fffaf2" stroke="#c25737" strokeWidth="3" className="cursor-grab" onPointerDown={(event) => {
                        event.stopPropagation()
                        dragRef.current = { mode: 'arrow-start', id: arrow.id }
                      }} />
                      <circle cx={arrow.x2} cy={arrow.y2} r="11" fill="#fffaf2" stroke="#c25737" strokeWidth="3" className="cursor-grab" onPointerDown={(event) => {
                        event.stopPropagation()
                        dragRef.current = { mode: 'arrow-end', id: arrow.id }
                      }} />
                    </>
                  ) : null}
                </g>
              )
            })}
          </svg>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Inspecteur</p>
            {selectedElement ? (
              <div className="mt-4 flex flex-col gap-4">
                {selectedElementIds.length > 1 ? (
                  <p className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                    {selectedElementIds.length} elements selectionnes
                  </p>
                ) : null}
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Libelle</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedElement.label} onChange={(event) => updateSelectedElement((element) => ({ ...element, label: event.target.value }))} />
                </label>
                {selectedElement.type !== 'text' ? (
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Sous-titre</span>
                    <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedElement.subtitle ?? ''} onChange={(event) => updateSelectedElement((element) => ({ ...element, subtitle: event.target.value }))} />
                  </label>
                ) : null}
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Couleur</span>
                  <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedElement.tone} onChange={(event) => updateSelectedElement((element) => ({ ...element, tone: event.target.value }))}>
                    {Object.keys(TONES).map((tone) => <option key={tone} value={tone}>{tone}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['x', 'y', 'width', 'height', 'fontSize'].map((field) => (
                    <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                      <span className="font-semibold text-stone-900">{field}</span>
                      <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={selectedElement[field] ?? ''} onChange={(event) => updateSelectedElement((element) => ({ ...element, [field]: Number(event.target.value) }))} />
                    </label>
                  ))}
                </div>
                {selectedElement.type === 'raw' ? (
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Markup SVG de l element</span>
                    <textarea
                      className="min-h-40 rounded-2xl border border-black/10 bg-[#241f18] px-3 py-3 font-mono text-[11px] leading-5 text-[#fffaf2] outline-none"
                      value={selectedElement.rawMarkup ?? ''}
                      onChange={(event) => updateSelectedElement((element) => ({ ...element, rawMarkup: event.target.value }))}
                    />
                  </label>
                ) : null}
                <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={deleteSelection}>Supprimer</button>
              </div>
            ) : selectedArrow ? (
              <div className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Etiquette</span>
                  <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.label} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, label: event.target.value }))} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['x1', 'y1', 'x2', 'y2'].map((field) => (
                    <label key={field} className="flex flex-col gap-2 text-sm text-stone-700">
                      <span className="font-semibold text-stone-900">{field}</span>
                      <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" type="number" value={selectedArrow[field]} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, [field]: Number(event.target.value) }))} />
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-3 text-sm text-stone-700">
                  <input checked={selectedArrow.dashed} type="checkbox" onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, dashed: event.target.checked }))} />
                  Trait pointille
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Courbure</span>
                  <input min="-300" max="300" step="10" type="range" value={selectedArrow.curvature ?? 0} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, curvature: Number(event.target.value) }))} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Depart accroche</span>
                    <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.fromElementId ?? ''} onChange={(event) => {
                      const element = draft.elements.find((item) => item.id === event.target.value)
                      const side = selectedArrow.fromSide ?? 'right'
                      const anchor = element ? getElementAnchor(element, side) : null
                      updateSelectedArrow((arrow) => ({ ...arrow, fromElementId: event.target.value || undefined, ...(anchor ? { x1: anchor.x, y1: anchor.y } : {}) }))
                    }}>
                      <option value="">Libre</option>
                      {draft.elements.map((element) => <option key={element.id} value={element.id}>{element.label}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Cote depart</span>
                    <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.fromSide ?? 'right'} onChange={(event) => {
                      const element = draft.elements.find((item) => item.id === selectedArrow.fromElementId)
                      const anchor = element ? getElementAnchor(element, event.target.value) : null
                      updateSelectedArrow((arrow) => ({ ...arrow, fromSide: event.target.value, ...(anchor ? { x1: anchor.x, y1: anchor.y } : {}) }))
                    }}>
                      {['top', 'right', 'bottom', 'left'].map((side) => <option key={side} value={side}>{side}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Arrivee accroche</span>
                    <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.toElementId ?? ''} onChange={(event) => {
                      const element = draft.elements.find((item) => item.id === event.target.value)
                      const side = selectedArrow.toSide ?? 'left'
                      const anchor = element ? getElementAnchor(element, side) : null
                      updateSelectedArrow((arrow) => ({ ...arrow, toElementId: event.target.value || undefined, ...(anchor ? { x2: anchor.x, y2: anchor.y } : {}) }))
                    }}>
                      <option value="">Libre</option>
                      {draft.elements.map((element) => <option key={element.id} value={element.id}>{element.label}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Cote arrivee</span>
                    <select className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" value={selectedArrow.toSide ?? 'left'} onChange={(event) => {
                      const element = draft.elements.find((item) => item.id === selectedArrow.toElementId)
                      const anchor = element ? getElementAnchor(element, event.target.value) : null
                      updateSelectedArrow((arrow) => ({ ...arrow, toSide: event.target.value, ...(anchor ? { x2: anchor.x, y2: anchor.y } : {}) }))
                    }}>
                      {['top', 'right', 'bottom', 'left'].map((side) => <option key={side} value={side}>{side}</option>)}
                    </select>
                  </label>
                </div>
                <label className="flex items-center gap-3 text-sm text-stone-700">
                  <input checked={selectedArrow.animation?.enabled !== false} type="checkbox" onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...(arrow.animation ?? {}), enabled: event.target.checked } }))} />
                  Animation active
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Duree</span>
                    <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" min="0.2" step="0.1" type="number" value={selectedArrow.animation?.durationSeconds ?? 1.8} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...(arrow.animation ?? {}), durationSeconds: Number(event.target.value) } }))} />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-stone-700">
                    <span className="font-semibold text-stone-900">Etape</span>
                    <input className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-stone-900 outline-none" min="0" type="number" value={selectedArrow.stepIndex ?? 0} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, stepIndex: Number(event.target.value) }))} />
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">Couleur animation</span>
                  <input className="h-12 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-900 outline-none" type="color" value={selectedArrow.animation?.color ?? '#246b5e'} onChange={(event) => updateSelectedArrow((arrow) => ({ ...arrow, animation: { ...(arrow.animation ?? {}), color: event.target.value } }))} />
                </label>
                <button className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" type="button" onClick={deleteSelection}>Supprimer</button>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-stone-700">
                Selectionne une forme, un texte ou une fleche pour modifier ses proprietes.
              </p>
            )}
          </section>

          <section className="rounded-[30px] border border-black/10 bg-white/85 p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">SVG genere</p>
            <textarea className="mt-4 h-56 w-full resize-y rounded-2xl border border-black/10 bg-[#241f18] px-3 py-3 font-mono text-[11px] leading-5 text-[#fffaf2] outline-none" readOnly value={svgMarkup} />
          </section>
        </aside>
      </div>
    </div>
  )
}
