import { createElement, useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import { EmptyScenePlaceholder, SceneMetaBadges, safeNumber, wrapText } from '../shared/sceneShared'

function extractBridgeModel(execution) {
  const output = execution?.output
  if (!output || !Array.isArray(output.steps)) {
    return null
  }

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    stageCode: `${step.stageCode ?? `STEP_${index + 1}`}`.trim().toUpperCase(),
    title: `${step.title ?? 'Etape'}`.trim(),
    actorLabel: `${step.actorLabel ?? 'Actor'}`.trim(),
    detail: `${step.detail ?? ''}`.trim(),
    abstractionStable: Boolean(step.abstractionStable),
    implementationReusable: Boolean(step.implementationReusable),
  }))

  return {
    mode: `${output.mode ?? 'WITH_BRIDGE'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Bridge'}`.trim(),
    useBridge: `${output.mode ?? 'WITH_BRIDGE'}`.trim().toUpperCase() !== 'WITHOUT_BRIDGE',
    objectName: `${output.objectName ?? 'Switch Engine'}`.trim(),
    shapeCode: `${output.shapeCode ?? 'CIRCLE'}`.trim().toUpperCase(),
    shapeLabel: `${output.shapeLabel ?? 'Circle'}`.trim(),
    shapeClassName: `${output.shapeClassName ?? 'CircleShape'}`.trim(),
    shapeDetail: `${output.shapeDetail ?? ''}`.trim(),
    renderCode: `${output.renderCode ?? 'VECTOR_ENGINE'}`.trim().toUpperCase(),
    renderLabel: `${output.renderLabel ?? 'Vector Engine'}`.trim(),
    renderClassName: `${output.renderClassName ?? 'VectorRenderEngine'}`.trim(),
    renderStyle: `${output.renderStyle ?? ''}`.trim(),
    bridgeBenefit: `${output.bridgeBenefit ?? ''}`.trim(),
    abstractionStable: Boolean(output.abstractionStable),
    implementationReusable: Boolean(output.implementationReusable),
    subclassCount: safeNumber(output.subclassCount, 0),
    combinationCount: safeNumber(output.combinationCount, 0),
    stepCount: safeNumber(output.stepCount, steps.length),
    resultLabel: `${output.resultLabel ?? 'Bridge linked'}`.trim(),
    steps,
  }
}

export default function BridgeScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractBridgeModel(execution), [execution])
  const playbackFrames = useMemo(
    () => buildPlaybackFrames(model?.steps ?? [], 'Bridge ready'),
    [model?.steps],
  )
  const playback = useScenePlayback(playbackFrames, 900)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const visibleStepCount = playback.currentFrame.visibleStepCount
  const currentStepIndex = playback.currentFrame.currentStepIndex

  const viewBoxWidth = 1180
  const metrics = { x: 36, y: 40, width: 1108, height: 108 }
  const graph = { x: 36, y: 172, width: 1108, height: 494 }
  const clientCard = { x: 66, y: 246, width: 220, height: 128 }
  const abstractionCard = { x: 352, y: 214, width: 292, height: 220 }
  const bridgeCard = { x: 468, y: 472, width: 256, height: 136 }
  const implementationCard = { x: 798, y: 228, width: 286, height: 214 }
  const resultCard = { x: 820, y: 468, width: 264, height: 156 }
  const timelineX = 36
  const timelineY = graph.y + graph.height + 34
  const timelineWidth = 1108
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 154
  const timelineGap = 12
  const timelineHeight = 118 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 38
  const defsId = `bridge-scene-${isExpanded ? 'expanded' : 'compact'}`
  const clientToAbstraction = `M ${clientCard.x + clientCard.width} ${clientCard.y + clientCard.height / 2} C 312 ${clientCard.y + clientCard.height / 2 - 20} 320 ${abstractionCard.y + abstractionCard.height / 2} ${abstractionCard.x} ${abstractionCard.y + abstractionCard.height / 2}`
  const abstractionToBridge = `M ${abstractionCard.x + abstractionCard.width / 2} ${abstractionCard.y + abstractionCard.height} C ${abstractionCard.x + abstractionCard.width / 2} ${abstractionCard.y + abstractionCard.height + 42} ${bridgeCard.x + bridgeCard.width / 2} ${bridgeCard.y - 26} ${bridgeCard.x + bridgeCard.width / 2} ${bridgeCard.y}`
  const bridgeToImplementation = `M ${bridgeCard.x + bridgeCard.width} ${bridgeCard.y + bridgeCard.height / 2} C 754 ${bridgeCard.y + bridgeCard.height / 2 - 28} 760 ${implementationCard.y + implementationCard.height / 2} ${implementationCard.x} ${implementationCard.y + implementationCard.height / 2}`
  const implementationToResult = `M ${implementationCard.x + implementationCard.width / 2} ${implementationCard.y + implementationCard.height} C ${implementationCard.x + implementationCard.width / 2 + 14} ${implementationCard.y + implementationCard.height + 28} ${resultCard.x + resultCard.width / 2} ${resultCard.y - 18} ${resultCard.x + resultCard.width / 2} ${resultCard.y}`
  const shapeLines = wrapText(model.shapeDetail, 32).slice(0, 4)
  const engineLines = wrapText(model.renderStyle, 30).slice(0, 4)

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scène SVG</p>
          {createElement(
            TitleTag,
            { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' },
            'Switch Engine',
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
            <marker id={`${defsId}-success-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-warning-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect x={metrics.x} y={metrics.y} width={metrics.width} height={metrics.height} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metrics.x + 28} y={metrics.y + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            BRIDGE ENGINE LAB
          </text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.objectName}
          </text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.shapeLabel} {'->'} {model.renderLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 58} textAnchor="end" fontSize="24" fontWeight="700" fill={model.useBridge ? '#153f38' : '#c25737'}>
            {model.resultLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.subclassCount} classe(s) concretes · {model.combinationCount} combinaison(s)
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ABSTRACTION / IMPLEMENTATION
          </text>

          <g>
            <rect x={clientCard.x} y={clientCard.y} width={clientCard.width} height={clientCard.height} rx="28" fill="rgba(231,198,167,0.92)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={clientCard.x + 18} y={clientCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">CLIENT</text>
            <text x={clientCard.x + 18} y={clientCard.y + 58} fontSize="24" fontWeight="700" fill="#5f2d20">{model.objectName}</text>
            <text x={clientCard.x + 18} y={clientCard.y + 84} fontSize="12" fill="#7a4634">render(shape)</text>
          </g>

          <g>
            <rect x={abstractionCard.x} y={abstractionCard.y} width={abstractionCard.width} height={abstractionCard.height} rx="30" fill="#241f18" stroke="#241f18" strokeWidth="2" className="scene-node-shadow" />
            <text x={abstractionCard.x + 22} y={abstractionCard.y + 28} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="rgba(255,248,238,0.64)">ABSTRACTION</text>
            <text x={abstractionCard.x + 22} y={abstractionCard.y + 64} fontSize="28" fontWeight="700" fill="#fff8ee">{model.shapeClassName}</text>
            <text x={abstractionCard.x + 22} y={abstractionCard.y + 90} fontSize="12" fill="rgba(255,248,238,0.76)">{model.shapeLabel}</text>
            <foreignObject x={abstractionCard.x + 18} y={abstractionCard.y + 104} width={abstractionCard.width - 36} height={abstractionCard.height - 122}>
              <div className="h-full overflow-hidden text-[12px] leading-5 text-white/78" xmlns="http://www.w3.org/1999/xhtml">
                {shapeLines.map((line, index) => (
                  <p key={`${line}-${index}`} className="m-0">{line}</p>
                ))}
              </div>
            </foreignObject>
          </g>

          <g opacity={model.useBridge ? 1 : 0.9}>
            <rect x={bridgeCard.x} y={bridgeCard.y} width={bridgeCard.width} height={bridgeCard.height} rx="24" fill={model.useBridge ? 'rgba(214,228,241,0.94)' : 'rgba(245,227,210,0.96)'} stroke={model.useBridge ? '#426c8d' : '#c25737'} strokeWidth="2" className="scene-node-shadow" />
            <text x={bridgeCard.x + 18} y={bridgeCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useBridge ? '#547086' : '#8b5b49'}>
              {model.useBridge ? 'BRIDGE' : 'CONCRETE COMBO'}
            </text>
            <text x={bridgeCard.x + 18} y={bridgeCard.y + 56} fontSize="20" fontWeight="700" fill={model.useBridge ? '#27465f' : '#5f2d20'}>
              {model.useBridge ? 'RenderEngine bridge' : 'ShapeEngineSubclass'}
            </text>
            <foreignObject x={bridgeCard.x + 18} y={bridgeCard.y + 68} width={bridgeCard.width - 36} height={bridgeCard.height - 80}>
              <div className={`h-full overflow-hidden text-[12px] leading-5 ${model.useBridge ? 'text-[#3e5d77]' : 'text-[#7a4634]'}`} xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">{model.useBridge ? 'runtime binding' : 'hard-coded pair'}</p>
              </div>
            </foreignObject>
          </g>

          <g>
            <rect x={implementationCard.x} y={implementationCard.y} width={implementationCard.width} height={implementationCard.height} rx="30" fill={model.useBridge ? 'rgba(211,236,230,0.94)' : 'rgba(255,244,220,0.96)'} stroke={model.useBridge ? '#246b5e' : '#9a7130'} strokeWidth="2" className="scene-node-shadow" />
            <text x={implementationCard.x + 18} y={implementationCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useBridge ? '#577166' : '#7a571f'}>IMPLEMENTATION</text>
            <text x={implementationCard.x + 18} y={implementationCard.y + 58} fontSize="24" fontWeight="700" fill={model.useBridge ? '#153f38' : '#5c4218'}>{model.renderClassName}</text>
            <text x={implementationCard.x + 18} y={implementationCard.y + 82} fontSize="12" fill={model.useBridge ? '#215247' : '#7d5018'}>{model.renderLabel}</text>
            <foreignObject x={implementationCard.x + 16} y={implementationCard.y + 96} width={implementationCard.width - 32} height={implementationCard.height - 114}>
              <div className={`h-full overflow-hidden text-[12px] leading-5 ${model.useBridge ? 'text-[#215247]' : 'text-[#7d5018]'}`} xmlns="http://www.w3.org/1999/xhtml">
                {engineLines.map((line, index) => (
                  <p key={`${line}-${index}`} className="m-0">{line}</p>
                ))}
              </div>
            </foreignObject>
          </g>

          <g>
            <rect x={resultCard.x} y={resultCard.y} width={resultCard.width} height={resultCard.height} rx="24" fill={model.useBridge ? 'rgba(214,228,241,0.92)' : 'rgba(245,227,210,0.96)'} stroke={model.useBridge ? '#426c8d' : '#c25737'} strokeWidth="2" />
            <text x={resultCard.x + 18} y={resultCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useBridge ? '#547086' : '#8b5b49'}>RESULT</text>
            <text x={resultCard.x + 18} y={resultCard.y + 56} fontSize="20" fontWeight="700" fill={model.useBridge ? '#27465f' : '#5f2d20'}>{model.resultLabel}</text>
            <foreignObject x={resultCard.x + 18} y={resultCard.y + 68} width={resultCard.width - 36} height={resultCard.height - 82}>
              <div className={`h-full overflow-hidden text-[12px] leading-5 ${model.useBridge ? 'text-[#3e5d77]' : 'text-[#7a4634]'}`} xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">{model.useBridge ? model.bridgeBenefit : 'shape + engine fused together'}</p>
              </div>
            </foreignObject>
          </g>

          <path d={clientToAbstraction} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
          <path d={abstractionToBridge} fill="none" stroke={model.useBridge ? '#426c8d' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.useBridge ? 'success' : 'warning'}-arrow)`} className="scene-flow-line" />
          <path d={bridgeToImplementation} fill="none" stroke={model.useBridge ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.useBridge ? 'success' : 'warning'}-arrow)`} className="scene-flow-line" />
          <path d={implementationToResult} fill="none" stroke={model.useBridge ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.useBridge ? 'success' : 'warning'}-arrow)`} className="scene-flow-line" />

          <circle r="5" fill="#246b5e" opacity="0.96">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={clientToAbstraction} />
          </circle>
          <circle r="5" fill={model.useBridge ? '#426c8d' : '#c25737'} opacity="0.96">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={abstractionToBridge} begin="0.2s" />
          </circle>
          <circle r="5" fill={model.useBridge ? '#246b5e' : '#c25737'} opacity="0.96">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={bridgeToImplementation} begin="0.35s" />
          </circle>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">SWITCH FEED</text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">{model.stepCount} étape(s)</text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">observe comment la forme reste stable pendant que le moteur change</text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.steps.map((step, index) => (
                  <div
                    key={`${step.index}-${step.stageCode}`}
                    className={`min-h-[140px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] transition ${
                      step.abstractionStable && step.implementationReusable
                        ? 'border-emerald-200 bg-emerald-50/90'
                        : 'border-orange-200 bg-orange-50/92'
                    } ${index > currentStepIndex ? 'opacity-30' : ''} ${index === currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                    style={{ visibility: index < visibleStepCount || index === currentStepIndex ? 'visible' : 'hidden' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Step {step.index}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${step.abstractionStable && step.implementationReusable ? 'text-emerald-800' : 'text-orange-900'}`}>
                        {step.abstractionStable && step.implementationReusable ? 'FLEX' : 'RIGID'}
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
