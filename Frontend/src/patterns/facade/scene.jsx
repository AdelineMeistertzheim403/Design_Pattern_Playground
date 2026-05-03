import { createElement, useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function extractFacadeModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.steps)) {
    return null
  }

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    stageCode: `${step.stageCode ?? `STEP_${index + 1}`}`.trim().toUpperCase(),
    systemCode: `${step.systemCode ?? ''}`.trim().toUpperCase(),
    title: `${step.title ?? 'Etape'}`.trim(),
    actorLabel: `${step.actorLabel ?? ''}`.trim(),
    status: `${step.status ?? 'READY'}`.trim().toUpperCase(),
    detail: `${step.detail ?? ''}`.trim(),
  }))

  return {
    mode: `${output.mode ?? 'WITH_FACADE'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Facade'}`.trim(),
    useFacade: `${output.mode ?? 'WITH_FACADE'}`.trim().toUpperCase() !== 'WITHOUT_FACADE',
    triggerLabel: `${output.triggerLabel ?? 'Start'}`.trim(),
    routineCode: `${output.routineCode ?? 'CINEMA_MODE'}`.trim().toUpperCase(),
    routineLabel: `${output.routineLabel ?? 'Cinema Mode'}`.trim(),
    routineDescription: `${output.routineDescription ?? ''}`.trim(),
    ambianceLabel: `${output.ambianceLabel ?? ''}`.trim(),
    audioAction: `${output.audioAction ?? ''}`.trim(),
    lightAction: `${output.lightAction ?? ''}`.trim(),
    securityAction: `${output.securityAction ?? ''}`.trim(),
    audioReady: Boolean(output.audioReady),
    lightReady: Boolean(output.lightReady),
    securityReady: Boolean(output.securityReady),
    systemsReady: Boolean(output.systemsReady),
    missedSubsystems: Array.isArray(output.missedSubsystems) ? output.missedSubsystems.map((item) => `${item}`.trim()).filter(Boolean) : [],
    manualTouchCount: safeNumber(output.manualTouchCount, 1),
    orchestrationLabel: `${output.orchestrationLabel ?? ''}`.trim(),
    resultLabel: `${output.resultLabel ?? ''}`.trim(),
    latencyMs: safeNumber(output.latencyMs, 0),
    steps,
  }
}

function SubsystemCard({
  card,
  label,
  title,
  detail,
  ready,
}) {
  const fill = ready ? 'rgba(211,236,230,0.94)' : 'rgba(245,227,210,0.96)'
  const stroke = ready ? '#246b5e' : '#c25737'
  const subtle = ready ? '#577166' : '#8b5b49'
  const titleColor = ready ? '#153f38' : '#5f2d20'
  const detailColor = ready ? '#215247' : '#7a4634'

  return (
    <g>
      <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="28" fill={fill} stroke={stroke} strokeWidth="2" className="scene-node-shadow" />
      <text x={card.x + 18} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={subtle}>
        {label}
      </text>
      <text x={card.x + 18} y={card.y + 54} fontSize="23" fontWeight="700" fill={titleColor}>
        {title}
      </text>
      <text x={card.x + card.width - 18} y={card.y + 24} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={ready ? '#246b5e' : '#c25737'}>
        {ready ? 'READY' : 'MISSED'}
      </text>
      <foreignObject x={card.x + 16} y={card.y + 70} width={card.width - 32} height={card.height - 84}>
        <div className="h-full overflow-hidden text-[12px] leading-5" style={{ color: detailColor }} xmlns="http://www.w3.org/1999/xhtml">
          <p>{detail}</p>
        </div>
      </foreignObject>
      {ready ? (
        <circle cx={card.x + card.width - 28} cy={card.y + card.height - 22} r="6" fill="#246b5e">
          <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
        </circle>
      ) : (
        <path d={`M ${card.x + card.width - 38} ${card.y + card.height - 30} L ${card.x + card.width - 18} ${card.y + card.height - 14} M ${card.x + card.width - 18} ${card.y + card.height - 30} L ${card.x + card.width - 38} ${card.y + card.height - 14}`} stroke="#c25737" strokeWidth="3" strokeLinecap="round" />
      )}
    </g>
  )
}

export default function FacadeScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractFacadeModel(execution), [execution])

  const playback = useScenePlayback(
    useMemo(() => buildPlaybackFrames(model?.steps ?? [], 'Facade ready'), [model]),
    900,
  )

  if (!model) {
    return <EmptyScenePlaceholder />
  }
  const visibleStepCount = playback.currentFrame.visibleStepCount
  const currentStepIndex = playback.currentFrame.currentStepIndex

  const viewBoxWidth = 1180
  const metrics = { x: 36, y: 40, width: 1108, height: 104 }
  const graph = { x: 36, y: 166, width: 1108, height: 436 }
  const controlCard = { x: 72, y: 250, width: 232, height: 176 }
  const facadeCard = { x: 426, y: 228, width: 268, height: 194 }
  const audioCard = { x: 810, y: 194, width: 274, height: 110 }
  const lightCard = { x: 810, y: 330, width: 274, height: 110 }
  const securityCard = { x: 810, y: 466, width: 274, height: 110 }
  const resultCard = { x: 368, y: 468, width: 300, height: 92 }
  const timelineX = 36
  const timelineY = 626
  const timelineWidth = 1108
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 136
  const timelineGap = 12
  const timelineHeight = 118 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 38
  const defsId = `facade-scene-${isExpanded ? 'expanded' : 'compact'}`
  const controlAnchor = { x: controlCard.x + controlCard.width, y: controlCard.y + controlCard.height / 2 }
  const facadeLeft = { x: facadeCard.x, y: facadeCard.y + facadeCard.height / 2 }
  const facadeRight = { x: facadeCard.x + facadeCard.width, y: facadeCard.y + facadeCard.height / 2 }
  const facadeBottom = { x: facadeCard.x + facadeCard.width / 2, y: facadeCard.y + facadeCard.height }
  const resultTop = { x: resultCard.x + resultCard.width / 2, y: resultCard.y }
  const audioLeft = { x: audioCard.x, y: audioCard.y + audioCard.height / 2 }
  const lightLeft = { x: lightCard.x, y: lightCard.y + lightCard.height / 2 }
  const securityLeft = { x: securityCard.x, y: securityCard.y + securityCard.height / 2 }
  const directAudioPath = `M ${controlAnchor.x} ${controlAnchor.y} C 410 ${controlAnchor.y - 100} 620 ${audioLeft.y - 30} ${audioLeft.x} ${audioLeft.y}`
  const directLightPath = `M ${controlAnchor.x} ${controlAnchor.y} C 420 ${controlAnchor.y} 640 ${lightLeft.y} ${lightLeft.x} ${lightLeft.y}`
  const directSecurityPath = `M ${controlAnchor.x} ${controlAnchor.y} C 430 ${controlAnchor.y + 108} 650 ${securityLeft.y + 32} ${securityLeft.x} ${securityLeft.y}`
  const toFacadePath = `M ${controlAnchor.x} ${controlAnchor.y} C 356 ${controlAnchor.y} 382 ${facadeLeft.y} ${facadeLeft.x} ${facadeLeft.y}`
  const facadeToAudioPath = `M ${facadeRight.x} ${facadeRight.y - 40} C 744 ${facadeRight.y - 44} 756 ${audioLeft.y} ${audioLeft.x} ${audioLeft.y}`
  const facadeToLightPath = `M ${facadeRight.x} ${facadeRight.y} C 752 ${facadeRight.y} 760 ${lightLeft.y} ${lightLeft.x} ${lightLeft.y}`
  const facadeToSecurityPath = `M ${facadeRight.x} ${facadeRight.y + 40} C 746 ${facadeRight.y + 64} 760 ${securityLeft.y} ${securityLeft.x} ${securityLeft.y}`
  const statusToResultPath = model.useFacade
    ? `M ${facadeBottom.x} ${facadeBottom.y} L ${facadeBottom.x} ${resultTop.y - 16} L ${resultTop.x} ${resultTop.y - 16} L ${resultTop.x} ${resultTop.y}`
    : `M ${controlAnchor.x - 48} ${controlAnchor.y + 84} C 324 ${controlAnchor.y + 162} 362 ${resultTop.y - 24} ${resultTop.x} ${resultTop.y}`
  const routineLines = wrapText(model.routineDescription, 34).slice(0, 3)
  const missedLabel = model.missedSubsystems.length ? `Sous-systeme manque : ${model.missedSubsystems.join(', ')}` : 'Tous les modules sont alignes.'

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'One-click system')}
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
            FACADE HUB
          </text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.routineLabel}
          </text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.modeLabel} · {model.orchestrationLabel} · {model.ambianceLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 58} textAnchor="end" fontSize="24" fontWeight="700" fill={model.systemsReady ? '#153f38' : '#c25737'}>
            {model.resultLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.manualTouchCount} action(s) client · {model.latencyMs} ms
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            LIVE ORCHESTRATION
          </text>

          <g>
            <rect x={controlCard.x} y={controlCard.y} width={controlCard.width} height={controlCard.height} rx="30" fill="rgba(231,198,167,0.92)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={controlCard.x + 18} y={controlCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              CONTROL
            </text>
            <text x={controlCard.x + 18} y={controlCard.y + 58} fontSize="28" fontWeight="700" fill="#5f2d20">
              {model.triggerLabel}
            </text>
            <text x={controlCard.x + 18} y={controlCard.y + 84} fontSize="12" fill="#7a4634">
              {model.useFacade ? 'one click trigger' : 'manual dispatch'}
            </text>
            <foreignObject x={controlCard.x + 16} y={controlCard.y + 98} width={controlCard.width - 32} height="64">
              <div className="h-full overflow-hidden text-[12px] leading-5 text-[#7a4634]" xmlns="http://www.w3.org/1999/xhtml">
                {routineLines.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>
            </foreignObject>
          </g>

          <g opacity={model.useFacade ? 1 : 0.42}>
            <rect x={facadeCard.x} y={facadeCard.y} width={facadeCard.width} height={facadeCard.height} rx="34" fill={model.useFacade ? '#241f18' : 'rgba(214,228,241,0.9)'} stroke={model.useFacade ? '#241f18' : '#426c8d'} strokeWidth="2" className="scene-node-shadow" />
            <text x={facadeCard.x + 22} y={facadeCard.y + 28} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useFacade ? 'rgba(255,248,238,0.64)' : '#607488'}>
              {model.useFacade ? 'FACADE' : 'BYPASSED'}
            </text>
            <text x={facadeCard.x + 22} y={facadeCard.y + 66} fontSize="27" fontWeight="700" fill={model.useFacade ? '#fff8ee' : '#27465f'}>
              {model.useFacade ? 'SmartHomeFacade' : 'NoFacade'}
            </text>
            <text x={facadeCard.x + 22} y={facadeCard.y + 92} fontSize="12" fill={model.useFacade ? 'rgba(255,248,238,0.78)' : '#547086'}>
              {model.orchestrationLabel}
            </text>
            <foreignObject x={facadeCard.x + 18} y={facadeCard.y + 108} width={facadeCard.width - 36} height="66">
              <div className={`h-full overflow-hidden text-[13px] leading-5 ${model.useFacade ? 'text-white/76' : 'text-[#4f6274]'}`} xmlns="http://www.w3.org/1999/xhtml">
                <p>
                  {model.useFacade
                    ? 'Une seule methode coordonne les trois sous-systemes dans un ordre stable.'
                    : 'Le client saute la facade et doit retenir seul la choregraphie complete.'}
                </p>
              </div>
            </foreignObject>
          </g>

          <SubsystemCard card={audioCard} label="AUDIO" title="AudioSystem" detail={model.audioAction} ready={model.audioReady} defsId={defsId} />
          <SubsystemCard card={lightCard} label="LIGHT" title="LightSystem" detail={model.lightAction} ready={model.lightReady} defsId={defsId} />
          <SubsystemCard card={securityCard} label="SECURITY" title="SecuritySystem" detail={model.securityAction} ready={model.securityReady} defsId={defsId} />

          {model.useFacade ? (
            <>
              <path d={toFacadePath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <path d={facadeToAudioPath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <path d={facadeToLightPath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <path d={facadeToSecurityPath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <circle r="5" fill="#246b5e" opacity="0.96">
                <animateMotion dur="1.7s" repeatCount="indefinite" path={toFacadePath} />
              </circle>
              <circle r="5" fill="#45b6c9" opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={facadeToAudioPath} begin="0.1s" />
              </circle>
              <circle r="5" fill="#426c8d" opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={facadeToLightPath} begin="0.25s" />
              </circle>
              <circle r="5" fill="#d48a2d" opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={facadeToSecurityPath} begin="0.4s" />
              </circle>
            </>
          ) : (
            <>
              <path d={directAudioPath} fill="none" stroke={model.audioReady ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.audioReady ? 'success' : 'danger'}-arrow)`} className="scene-flow-line" />
              <path d={directLightPath} fill="none" stroke={model.lightReady ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.lightReady ? 'success' : 'danger'}-arrow)`} className="scene-flow-line" />
              <path d={directSecurityPath} fill="none" stroke={model.securityReady ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.securityReady ? 'success' : 'danger'}-arrow)`} className="scene-flow-line" />
              <circle r="5" fill={model.audioReady ? '#246b5e' : '#c25737'} opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={directAudioPath} />
              </circle>
              <circle r="5" fill={model.lightReady ? '#426c8d' : '#c25737'} opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={directLightPath} begin="0.18s" />
              </circle>
              <circle r="5" fill={model.securityReady ? '#d48a2d' : '#c25737'} opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={directSecurityPath} begin="0.36s" />
              </circle>
            </>
          )}

          <path d={statusToResultPath} fill="none" stroke={model.systemsReady ? '#246b5e' : '#c25737'} strokeWidth="2.6" strokeDasharray="10 8" markerEnd={`url(#${defsId}-${model.systemsReady ? 'success' : 'danger'}-arrow)`} className="scene-flow-line" />

          <g>
            <rect x={resultCard.x} y={resultCard.y} width={resultCard.width} height={resultCard.height} rx="28" fill={model.systemsReady ? 'rgba(214,228,241,0.94)' : 'rgba(245,227,210,0.96)'} stroke={model.systemsReady ? '#426c8d' : '#c25737'} strokeWidth="2" />
            <text x={resultCard.x + 18} y={resultCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.systemsReady ? '#547086' : '#8b5b49'}>
              GLOBAL STATE
            </text>
            <text x={resultCard.x + 18} y={resultCard.y + 52} fontSize="22" fontWeight="700" fill={model.systemsReady ? '#27465f' : '#5f2d20'}>
              {model.resultLabel}
            </text>
            <text x={resultCard.x + 18} y={resultCard.y + 76} fontSize="12" fill={model.systemsReady ? '#3e5d77' : '#7a4634'}>
              {missedLabel}
            </text>
          </g>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ACTIVATION FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.steps.length} etape(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            compare la choregraphie one-click a la dispersion manuelle
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.steps.map((step, index) => (
                  <div
                    key={`${step.index}-${step.stageCode}`}
                    className={`min-h-[118px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] transition ${
                      step.status === 'MISSED' || step.status === 'PARTIAL'
                        ? 'border-orange-200 bg-orange-50/92'
                        : step.stageCode === 'FACADE'
                          ? 'border-sky-200 bg-sky-50/92'
                          : 'border-emerald-200 bg-emerald-50/90'
                    } ${index > currentStepIndex ? 'opacity-30' : ''} ${index === currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                    style={{ visibility: index < visibleStepCount || index === currentStepIndex ? 'visible' : 'hidden' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Step {step.index}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        step.status === 'MISSED' || step.status === 'PARTIAL'
                          ? 'text-orange-900'
                          : step.stageCode === 'FACADE'
                            ? 'text-sky-800'
                            : 'text-emerald-800'
                      }`}>
                        {step.status}
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
