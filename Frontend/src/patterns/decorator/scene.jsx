import { createElement } from 'react'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  DECORATOR_SWATCHES,
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

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

export default function DecoratorScene({
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
    return <EmptyScenePlaceholder />
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
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Stack Builder')}
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

          <rect x={leftX} y="144" width={leftWidth} height="186" rx="28" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
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
                <div key={name} className="rounded-full bg-[rgba(231,198,167,0.26)] px-3 py-1 text-[11px] leading-4 text-[#5f2d20]">
                  {name}
                </div>
              ))}
            </div>
          </foreignObject>

          <rect x={leftX} y={activeEffectsY} width={leftWidth} height={activeEffectsHeight} rx="28" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
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
                <rect x={stackX} y={y} width={stackWidth} height={stackCardHeight} rx="24" fill={swatch.fill} stroke={swatch.stroke} strokeWidth="2.2" className="scene-node-shadow" />
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

          <rect x={stackX} y={baseY} width={stackWidth} height={baseHeight} rx="26" fill={DECORATOR_SWATCHES.BASE.fill} stroke={DECORATOR_SWATCHES.BASE.stroke} strokeWidth="2.2" className="scene-node-shadow" />
          <text x={stackX + 22} y={baseY + 26} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="rgba(36,31,24,0.58)">
            COMPONENT
          </text>
          <text x={stackX + 22} y={baseY + 56} fontSize="22" fontWeight="700" fill="#241f18">
            {model.baseLabel}
          </text>
          <text x={stackX + 22} y={baseY + 80} fontSize="12" fill="#5f5548">
            {model.characterName}
          </text>

          <path d={linkPath} fill="none" stroke="#7a5a3f" strokeWidth="3" strokeDasharray="12 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
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
                <rect x={x} y={y} width="166" height="64" rx="22" fill="rgba(255,249,239,0.98)" stroke="rgba(36,31,24,0.1)" />
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
