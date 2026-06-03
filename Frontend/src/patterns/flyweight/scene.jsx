import { createElement } from 'react'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  FLYWEIGHT_SWATCHES,
  SceneMetaBadges,
  safeNumber,
} from '../shared/sceneShared'

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

export default function FlyweightScene({
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
    return <EmptyScenePlaceholder />
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
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scène SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Memory Battle')}
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
            {model.realInstances.toLocaleString('fr-FR')} instance(s) réelle(s)
          </text>
          <text x={statsX + 24} y={poolY + 90} fontSize="14" fill="#5f5548">
            {model.useFlyweight
              ? `${model.sharedVariantCount.toLocaleString('fr-FR')} variante(s) alimentent toute la foule`
              : 'Chaque objet conserve son propre etat intrinsique'}
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
