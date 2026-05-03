import { createElement, useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import { EmptyScenePlaceholder, SceneMetaBadges, safeNumber, wrapText } from '../shared/sceneShared'

function normalizeArtifact(rawArtifact) {
  if (!rawArtifact || typeof rawArtifact !== 'object') {
    return null
  }

  return {
    slotCode: `${rawArtifact.slotCode ?? ''}`.trim().toUpperCase(),
    slotLabel: `${rawArtifact.slotLabel ?? 'Artifact'}`.trim(),
    className: `${rawArtifact.className ?? ''}`.trim(),
    label: `${rawArtifact.label ?? ''}`.trim(),
    detail: `${rawArtifact.detail ?? ''}`.trim(),
  }
}

function extractModel(execution) {
  const output = execution?.output
  if (!output) {
    return null
  }

  const hero = normalizeArtifact(output.hero)
  const transport = normalizeArtifact(output.transport)
  const relic = normalizeArtifact(output.relic)

  if (!hero || !transport || !relic) {
    return null
  }

  const steps = Array.isArray(output.steps)
    ? output.steps.map((step, index) => ({
        index: safeNumber(step.index, index + 1),
        stageCode: `${step.stageCode ?? ''}`.trim().toUpperCase(),
        title: `${step.title ?? 'Etape'}`.trim(),
        actorLabel: `${step.actorLabel ?? ''}`.trim(),
        detail: `${step.detail ?? ''}`.trim(),
        coherentFamily: Boolean(step.coherentFamily),
        usesFactory: Boolean(step.usesFactory),
      }))
    : []

  return {
    mode: `${output.mode ?? 'WITH_ABSTRACT_FACTORY'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Abstract Factory'}`.trim(),
    generatorLabel: `${output.generatorLabel ?? 'Theme Generator'}`.trim(),
    themeCode: `${output.themeCode ?? 'SCI_FI'}`.trim().toUpperCase(),
    themeLabel: `${output.themeLabel ?? 'Sci-Fi'}`.trim(),
    factoryClassName: `${output.factoryClassName ?? 'ThemeFactory'}`.trim(),
    familyLabel: `${output.familyLabel ?? ''}`.trim(),
    moodLabel: `${output.moodLabel ?? ''}`.trim(),
    coherentFamily: Boolean(output.coherentFamily),
    resultLabel: `${output.resultLabel ?? ''}`.trim(),
    manualTouchCount: safeNumber(output.manualTouchCount, 0),
    familySize: safeNumber(output.familySize, 3),
    driftThemeLabel: `${output.driftThemeLabel ?? ''}`.trim(),
    hero,
    transport,
    relic,
    steps,
  }
}

function FamilyCard({ card, artifact, tone, active, badgeLabel }) {
  const titleLines = wrapText(artifact.label, 18).slice(0, 2)
  const titleStartY = card.y + 64
  const detailY = titleStartY + titleLines.length * 22 + 12

  return (
    <g opacity={active ? 1 : 0.86}>
      <rect
        x={card.x}
        y={card.y}
        width={card.width}
        height={card.height}
        rx="28"
        fill={tone.fill}
        stroke={tone.stroke}
        strokeWidth="2"
        className="scene-node-shadow"
      />
      <text x={card.x + 18} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={tone.subtle}>
        {artifact.slotLabel.toUpperCase()}
      </text>
      <text x={card.x + card.width - 18} y={card.y + 24} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={active ? tone.badge : '#c25737'}>
        {badgeLabel}
      </text>
      {titleLines.map((line, index) => (
        <text key={`${artifact.slotCode}-${line}-${index}`} x={card.x + 18} y={titleStartY + index * 22} fontSize="20" fontWeight="700" fill={tone.title}>
          {line}
        </text>
      ))}
      <text x={card.x + 18} y={detailY - 8} fontSize="11" fill={tone.subtle}>
        {artifact.className}
      </text>
      <foreignObject x={card.x + 16} y={detailY} width={card.width - 32} height={card.height - (detailY - card.y) - 16}>
        <div className="h-full overflow-hidden text-[12px] leading-5" style={{ color: tone.detail }} xmlns="http://www.w3.org/1999/xhtml">
          <p className="m-0">{artifact.detail}</p>
        </div>
      </foreignObject>
    </g>
  )
}

export default function AbstractFactoryScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractModel(execution), [execution])
  const playbackFrames = useMemo(
    () => buildPlaybackFrames(model?.steps ?? [], 'Theme selected'),
    [model],
  )
  const playback = useScenePlayback(playbackFrames, 900)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const visibleStepCount = playback.currentFrame.visibleStepCount
  const currentStepIndex = playback.currentFrame.currentStepIndex

  const viewBoxWidth = 1240
  const metrics = { x: 34, y: 36, width: 1172, height: 112 }
  const graph = { x: 34, y: 172, width: 1172, height: 462 }
  const clientCard = { x: 68, y: 252, width: 232, height: 138 }
  const factoryCard = { x: 360, y: 226, width: 284, height: 182 }
  const heroCard = { x: 730, y: 204, width: 210, height: 194 }
  const transportCard = { x: 966, y: 204, width: 210, height: 194 }
  const relicCard = { x: 848, y: 424, width: 210, height: 194 }
  const resultCard = { x: 360, y: 456, width: 284, height: 132 }
  const timelineX = 34
  const timelineY = graph.y + graph.height + 30
  const timelineWidth = 1172
  const timelineColumns = isExpanded ? 4 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 154
  const timelineGap = 12
  const timelineHeight = 112 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 30
  const defsId = `abstract-factory-${isExpanded ? 'expanded' : 'compact'}`
  const clientToFactory = `M ${clientCard.x + clientCard.width} ${clientCard.y + clientCard.height / 2} C 328 ${clientCard.y + clientCard.height / 2 - 18} 334 ${factoryCard.y + factoryCard.height / 2} ${factoryCard.x} ${factoryCard.y + factoryCard.height / 2}`
  const factoryToHero = `M ${factoryCard.x + factoryCard.width} ${factoryCard.y + 44} C 688 ${factoryCard.y + 36} 700 ${heroCard.y + 34} ${heroCard.x} ${heroCard.y + 34}`
  const factoryToTransport = `M ${factoryCard.x + factoryCard.width} ${factoryCard.y + 96} C 714 ${factoryCard.y + 106} 860 ${transportCard.y + 40} ${transportCard.x} ${transportCard.y + 40}`
  const factoryToRelic = `M ${factoryCard.x + factoryCard.width} ${factoryCard.y + 148} C 704 ${factoryCard.y + 188} 766 ${relicCard.y + 34} ${relicCard.x} ${relicCard.y + 34}`
  const factoryToResult = `M ${factoryCard.x + factoryCard.width / 2} ${factoryCard.y + factoryCard.height} C ${factoryCard.x + factoryCard.width / 2} ${factoryCard.y + factoryCard.height + 26} ${resultCard.x + resultCard.width / 2} ${resultCard.y - 18} ${resultCard.x + resultCard.width / 2} ${resultCard.y}`
  const titleFill = model.coherentFamily ? '#153f38' : '#5f2d20'
  const accentStroke = model.coherentFamily ? '#246b5e' : '#c25737'
  const familyTone = model.coherentFamily
    ? { fill: 'rgba(211,236,230,0.94)', stroke: '#246b5e', subtle: '#577166', title: '#153f38', detail: '#215247', badge: '#246b5e' }
    : { fill: 'rgba(245,227,210,0.96)', stroke: '#c25737', subtle: '#8b5b49', title: '#5f2d20', detail: '#7a4634', badge: '#c25737' }

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          {createElement(
            TitleTag,
            { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' },
            'Theme Generator',
          )}
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ScenePlaybackControls playback={playback} />

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(214,228,241,0.84)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={accentStroke} />
            </marker>
          </defs>

          <rect x={metrics.x} y={metrics.y} width={metrics.width} height={metrics.height} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metrics.x + 26} y={metrics.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ABSTRACT FACTORY LAB
          </text>
          <text x={metrics.x + 26} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.generatorLabel}
          </text>
          <text x={metrics.x + 26} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.themeLabel} {'->'} {model.familyLabel}
          </text>
          <text x={metrics.x + metrics.width - 26} y={metrics.y + 58} textAnchor="end" fontSize="24" fontWeight="700" fill={titleFill}>
            {model.resultLabel}
          </text>
          <text x={metrics.x + metrics.width - 26} y={metrics.y + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.familySize} produits · {model.manualTouchCount} point(s) de creation
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            FAMILY GENERATION FLOW
          </text>

          <g>
            <rect x={clientCard.x} y={clientCard.y} width={clientCard.width} height={clientCard.height} rx="28" fill="rgba(231,198,167,0.92)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={clientCard.x + 18} y={clientCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">CLIENT</text>
            <text x={clientCard.x + 18} y={clientCard.y + 58} fontSize="22" fontWeight="700" fill="#5f2d20">{model.themeLabel}</text>
            <foreignObject x={clientCard.x + 16} y={clientCard.y + 70} width={clientCard.width - 32} height={clientCard.height - 86}>
              <div className="h-full overflow-hidden text-[12px] leading-5 text-[#7a4634]" xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">{model.moodLabel}</p>
              </div>
            </foreignObject>
          </g>

          <g>
            <rect x={factoryCard.x} y={factoryCard.y} width={factoryCard.width} height={factoryCard.height} rx="30" fill="#241f18" stroke="#241f18" strokeWidth="2" className="scene-node-shadow" />
            <text x={factoryCard.x + 18} y={factoryCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="rgba(255,248,238,0.64)">
              {model.coherentFamily ? 'ABSTRACT FACTORY' : 'MANUAL ASSEMBLY'}
            </text>
            <text x={factoryCard.x + 18} y={factoryCard.y + 60} fontSize="24" fontWeight="700" fill="#fff8ee">
              {model.coherentFamily ? model.factoryClassName : 'ThemePickerClient'}
            </text>
            <text x={factoryCard.x + 18} y={factoryCard.y + 88} fontSize="12" fill="rgba(255,248,238,0.74)">
              {model.coherentFamily ? 'family creation contract' : 'concrete picks'}
            </text>
            <foreignObject x={factoryCard.x + 16} y={factoryCard.y + 102} width={factoryCard.width - 32} height={factoryCard.height - 118}>
              <div className="h-full overflow-hidden text-[12px] leading-5 text-white/80" xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">
                  {model.coherentFamily
                    ? 'Une seule factory concrete cree hero, transport et relique sans fuite de classes concretes.'
                    : `Le client choisit chaque produit separement et peut melanger ${model.themeLabel} avec ${model.driftThemeLabel}.`}
                </p>
              </div>
            </foreignObject>
          </g>

          <FamilyCard card={heroCard} artifact={model.hero} tone={familyTone} active badgeLabel="MATCH" />
          <FamilyCard card={transportCard} artifact={model.transport} tone={familyTone} active={model.coherentFamily} badgeLabel={model.coherentFamily ? 'MATCH' : 'DRIFT'} />
          <FamilyCard card={relicCard} artifact={model.relic} tone={familyTone} active badgeLabel="MATCH" />

          <g>
            <rect x={resultCard.x} y={resultCard.y} width={resultCard.width} height={resultCard.height} rx="26" fill={model.coherentFamily ? 'rgba(214,228,241,0.92)' : 'rgba(245,227,210,0.96)'} stroke={accentStroke} strokeWidth="2" />
            <text x={resultCard.x + 18} y={resultCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.coherentFamily ? '#547086' : '#8b5b49'}>
              RESULT
            </text>
            <text x={resultCard.x + 18} y={resultCard.y + 58} fontSize="22" fontWeight="700" fill={titleFill}>
              {model.resultLabel}
            </text>
            <foreignObject x={resultCard.x + 16} y={resultCard.y + 68} width={resultCard.width - 32} height={resultCard.height - 84}>
              <div className="h-full overflow-hidden text-[12px] leading-5" style={{ color: model.coherentFamily ? '#3e5d77' : '#7a4634' }} xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">
                  {model.coherentFamily
                    ? 'Les trois objets viennent du meme theme et peuvent evoluer ensemble.'
                    : `${model.transport.label} introduit une derive de famille et casse le theme global.`}
                </p>
              </div>
            </foreignObject>
          </g>

          <path d={clientToFactory} fill="none" stroke={accentStroke} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
          <path d={factoryToHero} fill="none" stroke={accentStroke} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
          <path d={factoryToTransport} fill="none" stroke={accentStroke} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
          <path d={factoryToRelic} fill="none" stroke={accentStroke} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
          <path d={factoryToResult} fill="none" stroke={accentStroke} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />

          <circle r="5" fill={accentStroke} opacity="0.96">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={clientToFactory} />
          </circle>
          <circle r="5" fill={accentStroke} opacity="0.96">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={factoryToHero} begin="0.18s" />
          </circle>
          <circle r="5" fill={accentStroke} opacity="0.96">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={factoryToTransport} begin="0.34s" />
          </circle>
          <circle r="5" fill={accentStroke} opacity="0.96">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={factoryToRelic} begin="0.5s" />
          </circle>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            GENERATION FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.steps.length} etape(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            suis le point ou la coherence de famille est garantie ou perdue
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.steps.map((step, index) => (
                  <div
                    key={`${step.index}-${step.stageCode}`}
                    className={`min-h-[140px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] transition ${
                      step.coherentFamily
                        ? 'border-emerald-200 bg-emerald-50/90'
                        : 'border-orange-200 bg-orange-50/92'
                    } ${index > currentStepIndex ? 'opacity-30' : ''} ${index === currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                    style={{ visibility: index < visibleStepCount || index === currentStepIndex ? 'visible' : 'hidden' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Step {step.index}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${step.coherentFamily ? 'text-emerald-800' : 'text-orange-900'}`}>
                        {step.coherentFamily ? 'MATCH' : 'DRIFT'}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-stone-900">{step.title}</p>
                    <p className="mt-1 text-[12px] text-stone-700">{step.actorLabel}</p>
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
