import { useMemo, useState } from 'react'

export const EDITABLE_SCENE_METADATA_SELECTOR = 'metadata[data-dpp-svg-scene="true"]'

const TONES = {
  amber: { fill: '#e7c6a7', stroke: '#c25737', text: '#5f2d20' },
  mint: { fill: '#d3ece6', stroke: '#246b5e', text: '#153f38' },
  paper: { fill: '#fff9ef', stroke: '#7f5c3f', text: '#3d2d20' },
  blue: { fill: '#d6e4f1', stroke: '#426c8d', text: '#27465f' },
  dark: { fill: '#241f18', stroke: '#241f18', text: '#fffaf2' },
}

export function parseEditableSceneMarkup(svgMarkup) {
  if (!svgMarkup) {
    return null
  }

  try {
    const document = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const metadata = document.querySelector(EDITABLE_SCENE_METADATA_SELECTOR)
    if (!metadata?.textContent) {
      return null
    }

    const scene = JSON.parse(metadata.textContent)
    if (!Array.isArray(scene.elements) || !Array.isArray(scene.arrows)) {
      return null
    }

    return {
      viewBox: scene.viewBox || '0 0 1200 720',
      playbackMode: scene.playbackMode === 'step' ? 'step' : 'auto',
      elements: scene.elements,
      arrows: scene.arrows,
      steps: Array.isArray(scene.steps) ? scene.steps : [],
    }
  } catch {
    return null
  }
}

function getElementCenter(element) {
  return {
    x: element.x + (element.width ?? 160) / 2,
    y: element.y + (element.height ?? 92) / 2,
  }
}

function parseViewBox(viewBox) {
  const parts = `${viewBox ?? '0 0 1200 720'}`.split(/\s+/).map(Number)
  return parts.length === 4 && parts.every(Number.isFinite)
    ? { width: parts[2], height: parts[3] }
    : { width: 1200, height: 720 }
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
      .map((node) => new XMLSerializer().serializeToString(node))
      .join('')
  } catch {
    return rawMarkup
  }
}

function formatLocale(value) {
  const number = Number(value)
  if (Number.isFinite(number)) {
    return number.toLocaleString('fr-FR')
  }

  return `${value ?? ''}`
}

function getPathValue(source, path) {
  return `${path ?? ''}`.split('.').reduce((current, segment) => {
    if (current === undefined || current === null) {
      return undefined
    }

    if (Array.isArray(current) && /^\d+$/.test(segment)) {
      return current[Number(segment)]
    }

    return current[segment]
  }, source)
}

function resolveComputedTemplate(path, execution) {
  const output = execution?.output ?? {}
  const objectCount = Number(output.objectCount ?? 0)
  const realInstances = Number(output.realInstances ?? objectCount)
  const useFlyweight = output.mode === 'WITH_FLYWEIGHT' || realInstances < objectCount
  const mode = `${output.mode ?? ''}`.trim().toUpperCase()
  const isWithoutMode = mode.startsWith('WITHOUT_')
  const modePatternLabel = mode
    .replace(/^WITH(?:OUT)?_/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

  if (path === 'computed.patternMode.title') {
    return modePatternLabel ? `${isWithoutMode ? 'Sans' : 'Avec'} ${modePatternLabel}` : ''
  }

  if (path === 'computed.patternMode.upper') {
    return modePatternLabel ? `${isWithoutMode ? 'SANS' : 'AVEC'} ${modePatternLabel.toUpperCase()}` : ''
  }

  if (path === 'computed.flyweight.objectStateLabel') {
    return useFlyweight ? 'ETAT EXTRINSIQUE PAR OBJET' : 'ETAT COMPLET DUPLIQUE'
  }

  if (path === 'computed.flyweight.objectStateSubtitle') {
    return useFlyweight ? 'etat extrinseque par objet' : 'etat complet duplique'
  }

  if (path === 'computed.flyweight.poolTitle') {
    return useFlyweight ? 'POOL PARTAGE' : 'INSTANCE STORM'
  }

  if (path === 'computed.flyweight.poolSubtitle') {
    return useFlyweight
      ? `${formatLocale(output.sharedVariantCount ?? 0)} variante(s) alimentent toute la foule`
      : 'Chaque objet conserve son propre etat intrinsique'
  }

  if (path === 'computed.flyweight.factoryCacheLabel') {
    return useFlyweight ? 'cache actif' : 'cache contourne'
  }

  if (path === 'computed.flyweight.instanceShareLabel') {
    return useFlyweight ? 'partage actif' : 'duplication totale'
  }

  return undefined
}

function resolveTemplatePath(path, execution) {
  const [rawPath, ...rawFilters] = `${path ?? ''}`.split('|').map((part) => part.trim()).filter(Boolean)
  let value = rawPath.startsWith('computed.')
    ? resolveComputedTemplate(rawPath, execution)
    : getPathValue({ execution, output: execution?.output, input: execution?.input, parameters: execution?.parameters }, rawPath)

  rawFilters.forEach((filter) => {
    if (filter === 'locale') {
      value = formatLocale(value)
    } else if (filter === 'lower') {
      value = `${value ?? ''}`.toLowerCase()
    } else if (filter === 'upper') {
      value = `${value ?? ''}`.toUpperCase()
    }
  })

  return value === undefined || value === null ? '' : `${value}`
}

function buildLegacyFlyweightTextReplacements(execution) {
  const output = execution?.output ?? {}
  const isFlyweightOutput = execution?.patternCode === 'flyweight'
    || output.mode === 'WITH_FLYWEIGHT'
    || output.mode === 'WITHOUT_FLYWEIGHT'
    || output.sharedVariantCount !== undefined

  if (!isFlyweightOutput) {
    return []
  }

  const objectCount = formatLocale(output.objectCount ?? 0)
  const realInstances = formatLocale(output.realInstances ?? 0)
  const variants = Array.isArray(output.variants) ? output.variants : []
  const extraObjects = Math.max(0, Number(output.objectCount ?? 0) - 420)
  const replacements = [
    [/2[\s\u00a0\u202f]?400 objets a l ecran/g, `${objectCount} objets a l ecran`],
    [/Echantillon visuel [\d\s\u00a0\u202f]+ \/ 2[\s\u00a0\u202f]?400 · Arbres/g, `Echantillon visuel 420 / ${objectCount} · ${output.assetLabel ?? 'Objets'}`],
    [/\+1[\s\u00a0\u202f]?980 objets supplementaires/g, `+${formatLocale(extraObjects)} objets supplementaires`],
    [/Avec Flyweight/g, output.modeLabel ?? 'Avec Flyweight'],
    [/Sans Flyweight/g, output.modeLabel ?? 'Sans Flyweight'],
    [/Stable malgre la foule/g, output.performanceLabel ?? ''],
    [/Charge tres haute mais encore contenue/g, output.performanceLabel ?? ''],
    [/Charge visible mais stable/g, output.performanceLabel ?? ''],
    [/Lag probable/g, output.performanceLabel ?? ''],
    [/Charge sensible/g, output.performanceLabel ?? ''],
    [/Acceptable a petite echelle/g, output.performanceLabel ?? ''],
    [/ETAT EXTRINSIQUE PAR OBJET/g, resolveComputedTemplate('computed.flyweight.objectStateLabel', execution)],
    [/ETAT COMPLET DUPLIQUE/g, resolveComputedTemplate('computed.flyweight.objectStateLabel', execution)],
    [/14[\s\u00a0\u202f]?688 KB \/ 129[\s\u00a0\u202f]?600 KB/g, `${formatLocale(output.memoryCurrentKb ?? 0)} KB / ${formatLocale(output.memoryWithoutFlyweightKb ?? 0)} KB`],
    [/Economie : 114[\s\u00a0\u202f]?912 KB · 88,7%/g, `Economie : ${formatLocale(output.savedMemoryKb ?? 0)} KB · ${formatLocale(output.savingsPercent ?? 0)}%`],
    [/Cout frame simule : 13,7 ms/g, `Cout frame simule : ${formatLocale(output.simulatedFrameCostMs ?? 0)} ms`],
    [/POOL PARTAGE/g, resolveComputedTemplate('computed.flyweight.poolTitle', execution)],
    [/INSTANCE STORM/g, resolveComputedTemplate('computed.flyweight.poolTitle', execution)],
    [/6 instance\(s\) reelle\(s\)/g, `${realInstances} instance(s) reelle(s)`],
    [/6 variante\(s\) alimentent toute la foule/g, resolveComputedTemplate('computed.flyweight.poolSubtitle', execution)],
    [/Chaque objet conserve son propre etat intrinsique/g, resolveComputedTemplate('computed.flyweight.poolSubtitle', execution)],
    [/instance partagee/g, output.mode === 'WITHOUT_FLYWEIGHT' ? 'copies regroupees' : 'instance partagee'],
    [/copies regroupees/g, output.mode === 'WITHOUT_FLYWEIGHT' ? 'copies regroupees' : 'instance partagee'],
  ]

  variants.slice(0, 12).forEach((variant, index) => {
    replacements.push([new RegExp(`Arbres ${index + 1}`, 'g'), variant.label ?? `${output.assetLabel ?? 'Objet'} ${index + 1}`])
    replacements.push([/400 objets/g, `${formatLocale(variant.objects ?? 0)} objets`])
  })

  return replacements
}

function buildLegacyPatternModeTextReplacements(execution) {
  const mode = `${execution?.output?.mode ?? ''}`.trim().toUpperCase()
  const modePatternLabel = mode
    .replace(/^WITH(?:OUT)?_/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

  if (!modePatternLabel) {
    return []
  }

  return [
    [new RegExp(`Avec ${modePatternLabel}`, 'g'), resolveComputedTemplate('computed.patternMode.title', execution)],
    [new RegExp(`Sans ${modePatternLabel}`, 'g'), resolveComputedTemplate('computed.patternMode.title', execution)],
    [new RegExp(`AVEC ${modePatternLabel.toUpperCase()}`, 'g'), resolveComputedTemplate('computed.patternMode.upper', execution)],
    [new RegExp(`SANS ${modePatternLabel.toUpperCase()}`, 'g'), resolveComputedTemplate('computed.patternMode.upper', execution)],
  ]
}

function reviveLegacyRuntimeText(value, execution) {
  if (!value || !execution?.output) {
    return value
  }

  const replacements = [
    ...buildLegacyPatternModeTextReplacements(execution),
    ...buildLegacyFlyweightTextReplacements(execution),
  ]

  return replacements.reduce((current, [pattern, replacement]) => (
    current.replace(pattern, replacement ?? '')
  ), value)
}

function renderTemplate(value, execution) {
  if (value === undefined || value === null) {
    return ''
  }

  const rendered = `${value}`.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, path) => resolveTemplatePath(path, execution))
  return reviveLegacyRuntimeText(rendered, execution)
}

function isArrowVisible(scene, arrow, activeStepIndex) {
  if (scene.playbackMode !== 'step') {
    return true
  }

  const stepIndex = Number.isFinite(Number(arrow.stepIndex)) ? Number(arrow.stepIndex) : 0
  return stepIndex <= activeStepIndex
}

export default function EditableSvgScene({
  scene,
  className = 'h-auto w-full',
  execution = null,
  interactive = true,
}) {
  const normalizedScene = useMemo(() => ({
    viewBox: scene?.viewBox || '0 0 1200 720',
    playbackMode: scene?.playbackMode === 'step' ? 'step' : 'auto',
    elements: Array.isArray(scene?.elements) ? scene.elements : [],
    arrows: Array.isArray(scene?.arrows) ? scene.arrows : [],
    steps: Array.isArray(scene?.steps) ? scene.steps : [],
  }), [scene])
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const sceneBox = parseViewBox(normalizedScene.viewBox)
  const hasSteps = normalizedScene.playbackMode === 'step' && normalizedScene.steps.length > 0
  const visibleArrows = normalizedScene.arrows.filter((arrow) => isArrowVisible(normalizedScene, arrow, activeStepIndex))

  return (
    <div>
      {hasSteps && interactive ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/80 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Pas a pas</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {renderTemplate(normalizedScene.steps[activeStepIndex]?.label ?? `Etape ${activeStepIndex + 1}`, execution)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-stone-800 disabled:opacity-40"
              disabled={activeStepIndex <= 0}
              type="button"
              onClick={() => setActiveStepIndex((current) => Math.max(0, current - 1))}
            >
              Precedent
            </button>
            <button
              className="rounded-full bg-stone-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
              disabled={activeStepIndex >= normalizedScene.steps.length - 1}
              type="button"
              onClick={() => setActiveStepIndex((current) => Math.min(normalizedScene.steps.length - 1, current + 1))}
            >
              Suivant
            </button>
          </div>
        </div>
      ) : null}

      <svg className={className} viewBox={normalizedScene.viewBox} role="img">
        <defs>
          <marker id="editable-scene-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
          </marker>
        </defs>
        <rect width={sceneBox.width} height={sceneBox.height} rx="32" fill="#fffaf2" />

        {visibleArrows.map((arrow, index) => {
          const pathData = buildArrowPath(arrow)
          const animation = arrow.animation ?? {}
          const animate = normalizedScene.playbackMode !== 'step' && animation.enabled !== false

          return (
            <g key={arrow.id ?? `${arrow.x1}-${arrow.y1}-${index}`}>
              <path
                d={pathData}
                fill="none"
                markerEnd="url(#editable-scene-arrow)"
                stroke="#7a5a3f"
                strokeDasharray={arrow.dashed ? '12 10' : '0'}
                strokeWidth="5"
                className={animate ? 'scene-flow-line' : ''}
              />
              {arrow.label ? (
                <text x={(arrow.x1 + arrow.x2) / 2} y={(arrow.y1 + arrow.y2) / 2 - 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#6a5544">
                  {renderTemplate(arrow.label, execution)}
                </text>
              ) : null}
            </g>
          )
        })}

        {normalizedScene.elements.map((element) => {
          const tone = TONES[element.tone] ?? TONES.paper
          const center = getElementCenter(element)

          if (element.type === 'ellipse') {
            return (
              <g key={element.id}>
                <ellipse cx={center.x} cy={center.y} rx={element.width / 2} ry={element.height / 2} fill={tone.fill} stroke={tone.stroke} strokeWidth="4" className="scene-node-shadow" />
                <text x={center.x} y={center.y + 6} textAnchor="middle" fontSize={element.fontSize ?? 24} fontWeight="700" fill={tone.text}>{renderTemplate(element.label, execution)}</text>
                {element.subtitle ? <text x={center.x} y={center.y + 32} textAnchor="middle" fontSize="14" fill={tone.text}>{renderTemplate(element.subtitle, execution)}</text> : null}
              </g>
            )
          }

          if (element.type === 'text') {
            return <text key={element.id} x={element.x} y={element.y} fontSize={element.fontSize ?? 30} fontWeight="700" fill={tone.text}>{renderTemplate(element.label, execution)}</text>
          }

          if (element.type === 'raw') {
            const scaleX = element.baseWidth > 0 ? element.width / element.baseWidth : 1
            const scaleY = element.baseHeight > 0 ? element.height / element.baseHeight : 1
            return (
              <g
                key={element.id}
                transform={`translate(${element.x} ${element.y}) scale(${scaleX} ${scaleY}) translate(${-element.baseX} ${-element.baseY})`}
                dangerouslySetInnerHTML={{ __html: renderTemplate(sanitizeRawMarkup(element.rawMarkup), execution) }}
              />
            )
          }

          return (
            <g key={element.id}>
              <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="24" fill={tone.fill} stroke={tone.stroke} strokeWidth="4" className="scene-node-shadow" />
              <text x={center.x} y={element.y + Math.min(56, element.height / 2)} textAnchor="middle" fontSize={element.fontSize ?? 26} fontWeight="700" fill={tone.text}>{renderTemplate(element.label, execution)}</text>
              {element.subtitle ? <text x={center.x} y={element.y + Math.min(92, element.height - 22)} textAnchor="middle" fontSize="16" fill={tone.text}>{renderTemplate(element.subtitle, execution)}</text> : null}
            </g>
          )
        })}

        {visibleArrows.map((arrow, index) => {
          const pathData = buildArrowPath(arrow)
          const animation = arrow.animation ?? {}
          const animate = normalizedScene.playbackMode !== 'step' && animation.enabled !== false

          return (
            <g key={`${arrow.id ?? `${arrow.x1}-${arrow.y1}-${index}`}-top`}>
              <path
                d={pathData}
                fill="none"
                markerEnd="url(#editable-scene-arrow)"
                stroke="#7a5a3f"
                strokeDasharray={arrow.dashed ? '12 10' : '0'}
                strokeWidth="5"
                className={animate ? 'scene-flow-line' : ''}
              />
              {arrow.label ? (
                <text x={(arrow.x1 + arrow.x2) / 2} y={(arrow.y1 + arrow.y2) / 2 - 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#6a5544">
                  {renderTemplate(arrow.label, execution)}
                </text>
              ) : null}
              {animate ? (
                <circle key={`${arrow.id ?? index}-${pathData}-${animation.durationSeconds ?? 1.8}`} r="5" fill={animation.color ?? '#246b5e'} opacity="0.95">
                  <animateMotion dur={`${animation.durationSeconds ?? 1.8}s`} repeatCount={animation.repeatCount ?? 'indefinite'} path={pathData} />
                </circle>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
