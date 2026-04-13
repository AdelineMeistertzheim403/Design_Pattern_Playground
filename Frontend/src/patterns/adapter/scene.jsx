import { useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
} from '../shared/sceneShared'

function extractAdapterModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.steps)) {
    return null
  }

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    stageCode: `${step.stageCode ?? `STEP_${index + 1}`}`.trim().toUpperCase(),
    title: `${step.title ?? 'Etape'}`.trim(),
    systemLabel: `${step.systemLabel ?? ''}`.trim(),
    protocolLabel: `${step.protocolLabel ?? ''}`.trim(),
    signalLabel: `${step.signalLabel ?? ''}`.trim(),
    detail: `${step.detail ?? ''}`.trim(),
    success: Boolean(step.success),
  }))

  return {
    mode: `${output.mode ?? 'WITH_ADAPTER'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Adapter'}`.trim(),
    useAdapter: `${output.mode ?? 'WITH_ADAPTER'}`.trim().toUpperCase() !== 'WITHOUT_ADAPTER',
    scenario: `${output.scenario ?? 'VGA_TO_HDMI'}`.trim().toUpperCase(),
    scenarioLabel: `${output.scenarioLabel ?? 'Legacy console -> Smart screen'}`.trim(),
    payloadLabel: `${output.payloadLabel ?? 'Telemetry burst 42'}`.trim(),
    sourceSystem: `${output.sourceSystem ?? 'LegacyConsole'}`.trim(),
    sourceInterface: `${output.sourceInterface ?? 'VGA output'}`.trim(),
    sourceProtocol: `${output.sourceProtocol ?? 'Analog video'}`.trim(),
    sourceSignal: `${output.sourceSignal ?? ''}`.trim(),
    adapterClassName: `${output.adapterClassName ?? 'Adapter'}`.trim(),
    adapterRole: `${output.adapterRole ?? ''}`.trim(),
    targetSystem: `${output.targetSystem ?? 'SmartScreen'}`.trim(),
    targetInterface: `${output.targetInterface ?? 'HDMI input'}`.trim(),
    targetProtocol: `${output.targetProtocol ?? 'HDMI digital'}`.trim(),
    adaptedSignal: `${output.adaptedSignal ?? ''}`.trim(),
    compatible: Boolean(output.compatible),
    compatibilityLabel: `${output.compatibilityLabel ?? ''}`.trim(),
    failureReason: `${output.failureReason ?? ''}`.trim(),
    stepCount: safeNumber(output.stepCount, steps.length),
    steps,
  }
}

export default function AdapterScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractAdapterModel(execution)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const playback = useScenePlayback(
    useMemo(() => buildPlaybackFrames(model.steps, 'Signal loaded'), [model.steps]),
    900,
  )
  const visibleStepCount = playback.currentFrame.visibleStepCount
  const currentStepIndex = playback.currentFrame.currentStepIndex

  const viewBoxWidth = 1140
  const metrics = { x: 36, y: 40, width: 1068, height: 104 }
  const graph = { x: 36, y: 168, width: 1068, height: 392 }
  const sourceCard = { x: 66, y: 238, width: 252, height: 170 }
  const adapterCard = { x: 440, y: 220, width: 260, height: 188 }
  const targetCard = { x: 822, y: 238, width: 252, height: 170 }
  const signalPanel = { x: 350, y: 440, width: 410, height: 92 }
  const timelineX = 36
  const timelineY = 586
  const timelineWidth = 1068
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 142
  const timelineGap = 12
  const timelineHeight = 120 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `adapter-scene-${isExpanded ? 'expanded' : 'compact'}`
  const sourcePortAnchor = { x: sourceCard.x + sourceCard.width, y: sourceCard.y + sourceCard.height / 2 }
  const adapterLeft = { x: adapterCard.x, y: adapterCard.y + adapterCard.height / 2 }
  const adapterRight = { x: adapterCard.x + adapterCard.width, y: adapterCard.y + adapterCard.height / 2 }
  const targetPortAnchor = { x: targetCard.x, y: targetCard.y + targetCard.height / 2 }
  const directPath = `M ${sourcePortAnchor.x} ${sourcePortAnchor.y} C 496 ${sourcePortAnchor.y - 58} 646 ${targetPortAnchor.y - 58} ${targetPortAnchor.x} ${targetPortAnchor.y}`
  const firstLegPath = `M ${sourcePortAnchor.x} ${sourcePortAnchor.y} C 382 ${sourcePortAnchor.y} 394 ${adapterLeft.y} ${adapterLeft.x} ${adapterLeft.y}`
  const secondLegPath = `M ${adapterRight.x} ${adapterRight.y} C 770 ${adapterRight.y} 776 ${targetPortAnchor.y} ${targetPortAnchor.x} ${targetPortAnchor.y}`

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Plug Compatibility Lab
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ScenePlaybackControls playback={playback} />

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(214,228,241,0.82)" />
            </linearGradient>
            <marker id={`${defsId}-success-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-danger-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect x={metrics.x} y={metrics.y} width={metrics.width} height={metrics.height} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metrics.x + 28} y={metrics.y + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ADAPTER LAB
          </text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.scenarioLabel}
          </text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.sourceProtocol} {'->'} {model.targetProtocol}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 58} textAnchor="end" fontSize="24" fontWeight="700" fill={model.compatible ? '#153f38' : '#5f2d20'}>
            {model.compatibilityLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.payloadLabel}
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            LIVE CONVERSION
          </text>

          <g>
            <rect x={sourceCard.x} y={sourceCard.y} width={sourceCard.width} height={sourceCard.height} rx="30" fill="rgba(231,198,167,0.9)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={sourceCard.x + 18} y={sourceCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              SOURCE
            </text>
            <text x={sourceCard.x + 18} y={sourceCard.y + 54} fontSize="24" fontWeight="700" fill="#5f2d20">
              {model.sourceSystem}
            </text>
            <text x={sourceCard.x + 18} y={sourceCard.y + 78} fontSize="12" fill="#7a4634">
              {model.sourceInterface}
            </text>
            <foreignObject x={sourceCard.x + 16} y={sourceCard.y + 94} width={sourceCard.width - 32} height="58">
              <div className="h-full overflow-hidden text-[12px] leading-5 text-[#7a4634]" xmlns="http://www.w3.org/1999/xhtml">
                <p>{model.sourceSignal}</p>
              </div>
            </foreignObject>
          </g>

          <g opacity={model.useAdapter ? 1 : 0.45}>
            <rect x={adapterCard.x} y={adapterCard.y} width={adapterCard.width} height={adapterCard.height} rx="34" fill={model.useAdapter ? '#241f18' : 'rgba(214,228,241,0.84)'} stroke={model.useAdapter ? '#241f18' : '#426c8d'} strokeWidth="2" className="scene-node-shadow" />
            <text x={adapterCard.x + 22} y={adapterCard.y + 28} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useAdapter ? 'rgba(255,248,238,0.64)' : '#607488'}>
              {model.useAdapter ? 'ADAPTER' : 'MISSING BRIDGE'}
            </text>
            <text x={adapterCard.x + 22} y={adapterCard.y + 66} fontSize="26" fontWeight="700" fill={model.useAdapter ? '#fff8ee' : '#27465f'}>
              {model.useAdapter ? model.adapterClassName : 'NoAdapter'}
            </text>
            <foreignObject x={adapterCard.x + 18} y={adapterCard.y + 82} width={adapterCard.width - 36} height={adapterCard.height - 102}>
              <div className={`h-full overflow-hidden text-[13px] leading-5 ${model.useAdapter ? 'text-white/76' : 'text-[#4f6274]'}`} xmlns="http://www.w3.org/1999/xhtml">
                <p>{model.useAdapter ? model.adapterRole : model.failureReason}</p>
              </div>
            </foreignObject>
          </g>

          <g>
            <rect x={targetCard.x} y={targetCard.y} width={targetCard.width} height={targetCard.height} rx="30" fill={model.compatible ? 'rgba(211,236,230,0.94)' : 'rgba(255,244,220,0.96)'} stroke={model.compatible ? '#246b5e' : '#9a7130'} strokeWidth="2" className="scene-node-shadow" />
            <text x={targetCard.x + 18} y={targetCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.compatible ? '#577166' : '#7a571f'}>
              TARGET
            </text>
            <text x={targetCard.x + 18} y={targetCard.y + 54} fontSize="24" fontWeight="700" fill={model.compatible ? '#153f38' : '#5c4218'}>
              {model.targetSystem}
            </text>
            <text x={targetCard.x + 18} y={targetCard.y + 78} fontSize="12" fill={model.compatible ? '#215247' : '#7d5018'}>
              {model.targetInterface}
            </text>
            <foreignObject x={targetCard.x + 16} y={targetCard.y + 94} width={targetCard.width - 32} height="58">
              <div className={`h-full overflow-hidden text-[12px] leading-5 ${model.compatible ? 'text-[#215247]' : 'text-[#7d5018]'}`} xmlns="http://www.w3.org/1999/xhtml">
                <p>{model.compatible ? model.adaptedSignal : model.failureReason}</p>
              </div>
            </foreignObject>
          </g>

          {model.useAdapter ? (
            <>
              <path d={firstLegPath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <path d={secondLegPath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <circle r="5" fill="#246b5e" opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={firstLegPath} />
              </circle>
              <circle r="5" fill="#426c8d" opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={secondLegPath} begin="0.2s" />
              </circle>
            </>
          ) : (
            <>
              <path d={directPath} fill="none" stroke="#c25737" strokeWidth="3" strokeDasharray="12 10" markerEnd={`url(#${defsId}-danger-arrow)`} className="scene-flow-line" />
              <circle r="5" fill="#c25737" opacity="0.96">
                <animateMotion dur="1.9s" repeatCount="indefinite" path={directPath} />
              </circle>
            </>
          )}

          <g>
            <rect x={signalPanel.x} y={signalPanel.y} width={signalPanel.width} height={signalPanel.height} rx="24" fill={model.compatible ? 'rgba(214,228,241,0.92)' : 'rgba(245,227,210,0.96)'} stroke={model.compatible ? '#426c8d' : '#c25737'} strokeWidth="2" />
            <text x={signalPanel.x + 18} y={signalPanel.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.compatible ? '#547086' : '#8b5b49'}>
              SIGNAL STATUS
            </text>
            <text x={signalPanel.x + 18} y={signalPanel.y + 54} fontSize="16" fontWeight="700" fill={model.compatible ? '#27465f' : '#5f2d20'}>
              {model.compatible ? model.adaptedSignal : model.sourceSignal}
            </text>
            <text x={signalPanel.x + 18} y={signalPanel.y + 76} fontSize="12" fill={model.compatible ? '#3e5d77' : '#7a4634'}>
              {model.compatible ? model.adapterRole : model.failureReason}
            </text>
          </g>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            TRANSFORMATION FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.stepCount} etape(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            lis le flux pour voir quand le signal est converti, accepte ou rejete
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.steps.map((step, index) => (
                  <div
                    key={`${step.index}-${step.stageCode}`}
                    className={`min-h-[124px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] transition ${
                      step.success
                        ? 'border-emerald-200 bg-emerald-50/90'
                        : 'border-orange-200 bg-orange-50/92'
                    } ${index > currentStepIndex ? 'opacity-30' : ''} ${index === currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                    style={{ visibility: index < visibleStepCount || index === currentStepIndex ? 'visible' : 'hidden' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Step {step.index}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${step.success ? 'text-emerald-800' : 'text-orange-900'}`}>
                        {step.success ? 'OK' : 'BLOCKED'}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-stone-900">{step.title}</p>
                    <p className="mt-1 text-[12px] text-stone-700">{step.systemLabel} · {step.protocolLabel}</p>
                    <p className="mt-2 text-[12px] font-medium text-stone-800">{step.signalLabel}</p>
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
