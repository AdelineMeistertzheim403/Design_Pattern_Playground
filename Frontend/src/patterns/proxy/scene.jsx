import { useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function extractProxyModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.steps)) {
    return null
  }

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    stageCode: `${step.stageCode ?? `STEP_${index + 1}`}`.trim().toUpperCase(),
    title: `${step.title ?? 'Etape'}`.trim(),
    actorLabel: `${step.actorLabel ?? ''}`.trim(),
    status: `${step.status ?? 'READY'}`.trim().toUpperCase(),
    detail: `${step.detail ?? ''}`.trim(),
    latencyMs: safeNumber(step.latencyMs, 0),
  }))

  return {
    mode: `${output.mode ?? 'WITH_PROXY'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Proxy'}`.trim(),
    useProxy: `${output.mode ?? 'WITH_PROXY'}`.trim().toUpperCase() !== 'WITHOUT_PROXY',
    requestLabel: `${output.requestLabel ?? 'Open premium vault'}`.trim(),
    requesterRole: `${output.requesterRole ?? 'GUEST'}`.trim().toUpperCase(),
    requesterLabel: `${output.requesterLabel ?? 'Guest'}`.trim(),
    resourceCode: `${output.resourceCode ?? 'VAULT_VIDEO'}`.trim().toUpperCase(),
    resourceLabel: `${output.resourceLabel ?? 'Vault Video'}`.trim(),
    resourceDescription: `${output.resourceDescription ?? ''}`.trim(),
    subjectLabel: `${output.subjectLabel ?? 'SecureMediaService'}`.trim(),
    payloadLabel: `${output.payloadLabel ?? ''}`.trim(),
    payloadWeightMb: safeNumber(output.payloadWeightMb, 0),
    cacheLabel: `${output.cacheLabel ?? 'Cache froid'}`.trim(),
    accessGranted: Boolean(output.accessGranted),
    blocked: Boolean(output.blocked),
    securityLeak: Boolean(output.securityLeak),
    cacheHit: Boolean(output.cacheHit),
    lazyLoadTriggered: Boolean(output.lazyLoadTriggered),
    eagerLoadTriggered: Boolean(output.eagerLoadTriggered),
    accessDecisionLabel: `${output.accessDecisionLabel ?? ''}`.trim(),
    latencyMs: safeNumber(output.latencyMs, 0),
    steps,
  }
}

export default function ProxyScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractProxyModel(execution)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const playback = useScenePlayback(
    useMemo(() => buildPlaybackFrames(model.steps, 'Proxy ready'), [model.steps]),
    900,
  )
  const visibleStepCount = playback.currentFrame.visibleStepCount
  const currentStepIndex = playback.currentFrame.currentStepIndex

  const viewBoxWidth = 1160
  const metrics = { x: 36, y: 40, width: 1088, height: 104 }
  const graph = { x: 36, y: 166, width: 1088, height: 404 }
  const requesterCard = { x: 68, y: 256, width: 236, height: 170 }
  const proxyCard = { x: 438, y: 226, width: 268, height: 198 }
  const resourceCard = { x: 840, y: 248, width: 244, height: 178 }
  const resultCard = { x: 380, y: 458, width: 396, height: 84 }
  const timelineX = 36
  const timelineY = 594
  const timelineWidth = 1088
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 132
  const timelineGap = 12
  const timelineHeight = 118 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 38
  const defsId = `proxy-scene-${isExpanded ? 'expanded' : 'compact'}`
  const requesterAnchor = { x: requesterCard.x + requesterCard.width, y: requesterCard.y + requesterCard.height / 2 }
  const proxyLeft = { x: proxyCard.x, y: proxyCard.y + proxyCard.height / 2 }
  const proxyRight = { x: proxyCard.x + proxyCard.width, y: proxyCard.y + proxyCard.height / 2 }
  const resourceLeft = { x: resourceCard.x, y: resourceCard.y + resourceCard.height / 2 }
  const resourceBottom = { x: resourceCard.x + resourceCard.width / 2, y: resourceCard.y + resourceCard.height }
  const proxyBottom = { x: proxyCard.x + proxyCard.width / 2, y: proxyCard.y + proxyCard.height }
  const resultTop = { x: resultCard.x + resultCard.width / 2, y: resultCard.y }
  const requestToProxyPath = `M ${requesterAnchor.x} ${requesterAnchor.y} C 346 ${requesterAnchor.y} 380 ${proxyLeft.y} ${proxyLeft.x} ${proxyLeft.y}`
  const requestToResourcePath = `M ${requesterAnchor.x} ${requesterAnchor.y} C 462 ${requesterAnchor.y - 64} 718 ${resourceLeft.y - 64} ${resourceLeft.x} ${resourceLeft.y}`
  const proxyToResourcePath = `M ${proxyRight.x} ${proxyRight.y} C 764 ${proxyRight.y} 776 ${resourceLeft.y} ${resourceLeft.x} ${resourceLeft.y}`
  const proxyToResultPath = `M ${proxyBottom.x} ${proxyBottom.y} L ${proxyBottom.x} ${resultTop.y - 18} L ${resultTop.x} ${resultTop.y - 18} L ${resultTop.x} ${resultTop.y}`
  const resourceToResultPath = `M ${resourceBottom.x} ${resourceBottom.y} L ${resourceBottom.x} ${resultTop.y - 18} L ${resultTop.x} ${resultTop.y - 18} L ${resultTop.x} ${resultTop.y}`
  const showProxyLoader = model.useProxy && model.lazyLoadTriggered
  const showResourceLoader = !model.useProxy && model.eagerLoadTriggered
  const decisionTone = model.blocked
    ? { fill: '#c25737', label: 'BLOCKED' }
    : model.securityLeak
      ? { fill: '#c25737', label: 'EXPOSED' }
      : { fill: '#246b5e', label: 'DELIVERED' }

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Access Control
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
              <stop offset="100%" stopColor="rgba(214,228,241,0.84)" />
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
            PROXY GATE
          </text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.requesterLabel} · {model.resourceLabel} · {model.cacheLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 60} textAnchor="end" fontSize="24" fontWeight="700" fill={decisionTone.fill}>
            {decisionTone.label}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 88} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.latencyMs} ms simules
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            LIVE FLOW
          </text>

          <g>
            <rect x={requesterCard.x} y={requesterCard.y} width={requesterCard.width} height={requesterCard.height} rx="30" fill="rgba(231,198,167,0.92)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={requesterCard.x + 18} y={requesterCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              REQUESTER
            </text>
            <text x={requesterCard.x + 18} y={requesterCard.y + 56} fontSize="26" fontWeight="700" fill="#5f2d20">
              {model.requesterLabel}
            </text>
            <text x={requesterCard.x + 18} y={requesterCard.y + 82} fontSize="12" fill="#7a4634">
              {model.requestLabel}
            </text>
            <text x={requesterCard.x + 18} y={requesterCard.y + 108} fontSize="11" fontWeight="700" letterSpacing="0.14em" fill="#8b5b49">
              ROLE
            </text>
            <text x={requesterCard.x + 18} y={requesterCard.y + 128} fontSize="14" fontWeight="700" fill="#5f2d20">
              {model.requesterRole}
            </text>
          </g>

          {model.useProxy ? (
            <>
              <g>
                <rect x={proxyCard.x} y={proxyCard.y} width={proxyCard.width} height={proxyCard.height} rx="34" fill={model.blocked ? 'rgba(245,227,210,0.96)' : '#241f18'} stroke={model.blocked ? '#c25737' : '#241f18'} strokeWidth="2" className="scene-node-shadow" />
                <text x={proxyCard.x + 20} y={proxyCard.y + 28} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.blocked ? '#8b5b49' : 'rgba(255,248,238,0.64)'}>
                  PROXY
                </text>
                <text x={proxyCard.x + 20} y={proxyCard.y + 64} fontSize="26" fontWeight="700" fill={model.blocked ? '#5f2d20' : '#fff8ee'}>
                  AccessProxy
                </text>
                <text x={proxyCard.x + 20} y={proxyCard.y + 90} fontSize="12" fill={model.blocked ? '#7a4634' : 'rgba(255,248,238,0.78)'}>
                  {model.accessDecisionLabel}
                </text>
                <foreignObject x={proxyCard.x + 18} y={proxyCard.y + 108} width={proxyCard.width - 36} height="62">
                  <div className={`h-full overflow-hidden text-[13px] leading-5 ${model.blocked ? 'text-[#7a4634]' : 'text-white/78'}`} xmlns="http://www.w3.org/1999/xhtml">
                    <p>
                      {model.cacheHit
                        ? 'Le proxy garde deja la reponse chaude.'
                        : model.lazyLoadTriggered
                          ? 'Le proxy attend la vraie demande avant de charger la ressource.'
                          : 'Le proxy forwarde ou bloque selon le role et le cache.'}
                    </p>
                  </div>
                </foreignObject>
                {showProxyLoader ? (
                  <g transform={`translate(${proxyCard.x + proxyCard.width - 44} ${proxyCard.y + 44})`}>
                    <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(255,248,238,0.22)" strokeWidth="4" />
                    <path d="M 0 -16 A 16 16 0 0 1 14 8" fill="none" stroke="#45b6c9" strokeWidth="4" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="1.25s" repeatCount="indefinite" />
                    </path>
                  </g>
                ) : null}
              </g>

              <path d={requestToProxyPath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <circle r="5" fill="#246b5e" opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={requestToProxyPath} />
              </circle>
            </>
          ) : null}

          <g opacity={model.useProxy && model.blocked ? 0.35 : 1}>
            <rect x={resourceCard.x} y={resourceCard.y} width={resourceCard.width} height={resourceCard.height} rx="30" fill="rgba(211,236,230,0.94)" stroke="#246b5e" strokeWidth="2" className="scene-node-shadow" />
            <text x={resourceCard.x + 18} y={resourceCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#577166">
              REAL SUBJECT
            </text>
            <text x={resourceCard.x + 18} y={resourceCard.y + 54} fontSize="24" fontWeight="700" fill="#153f38">
              {model.resourceLabel}
            </text>
            <text x={resourceCard.x + 18} y={resourceCard.y + 78} fontSize="12" fill="#215247">
              {model.subjectLabel}
            </text>
            <foreignObject x={resourceCard.x + 16} y={resourceCard.y + 90} width={resourceCard.width - 32} height="58">
              <div className="h-full overflow-hidden text-[12px] leading-5 text-[#215247]" xmlns="http://www.w3.org/1999/xhtml">
                <p>{model.resourceDescription}</p>
              </div>
            </foreignObject>
            <text x={resourceCard.x + 18} y={resourceCard.y + 164} fontSize="12" fontWeight="700" fill="#215247">
              {model.payloadWeightMb} MB · {model.payloadLabel}
            </text>
            {showResourceLoader ? (
              <g transform={`translate(${resourceCard.x + resourceCard.width - 40} ${resourceCard.y + 40})`}>
                <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(36,107,94,0.18)" strokeWidth="4" />
                <path d="M 0 -16 A 16 16 0 0 1 14 8" fill="none" stroke="#246b5e" strokeWidth="4" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="1.15s" repeatCount="indefinite" />
                </path>
              </g>
            ) : null}
          </g>

          {!model.useProxy ? (
            <>
              <path d={requestToResourcePath} fill="none" stroke={model.securityLeak ? '#c25737' : '#246b5e'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.securityLeak ? 'danger' : 'success'}-arrow)`} className="scene-flow-line" />
              <circle r="5" fill={model.securityLeak ? '#c25737' : '#246b5e'} opacity="0.96">
                <animateMotion dur="1.9s" repeatCount="indefinite" path={requestToResourcePath} />
              </circle>
            </>
          ) : !model.blocked ? (
            <>
              <path d={proxyToResourcePath} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
              <circle r="5" fill="#426c8d" opacity="0.96">
                <animateMotion dur="1.8s" repeatCount="indefinite" path={proxyToResourcePath} begin="0.2s" />
              </circle>
            </>
          ) : null}

          <g>
            <rect x={resultCard.x} y={resultCard.y} width={resultCard.width} height={resultCard.height} rx="28" fill={model.blocked ? 'rgba(245,227,210,0.96)' : model.securityLeak ? 'rgba(245,227,210,0.96)' : 'rgba(214,228,241,0.92)'} stroke={decisionTone.fill} strokeWidth="2" />
            <text x={resultCard.x + 18} y={resultCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
              OUTCOME
            </text>
            <text x={resultCard.x + 18} y={resultCard.y + 52} fontSize="22" fontWeight="700" fill={decisionTone.fill}>
              {model.accessDecisionLabel}
            </text>
            <text x={resultCard.x + 18} y={resultCard.y + 74} fontSize="12" fill="#5f5548">
              {model.blocked
                ? 'La requete s arrete avant la ressource reelle.'
                : model.securityLeak
                  ? 'Le payload revient malgre un role non autorise.'
                  : 'La reponse revient dans un flux medie et lisible.'}
            </text>
          </g>

          {model.useProxy ? (
            <path
              d={model.blocked ? proxyToResultPath : resourceToResultPath}
              fill="none"
              stroke={model.blocked ? '#c25737' : '#246b5e'}
              strokeWidth="3.1"
              strokeDasharray="14 8"
              markerEnd={`url(#${defsId}-${model.blocked ? 'danger' : 'success'}-arrow)`}
              className="scene-flow-line"
            />
          ) : (
            <path
              d={resourceToResultPath}
              fill="none"
              stroke={model.securityLeak ? '#c25737' : '#246b5e'}
              strokeWidth="3.1"
              strokeDasharray="14 8"
              markerEnd={`url(#${defsId}-${model.securityLeak ? 'danger' : 'success'}-arrow)`}
              className="scene-flow-line"
            />
          )}

          <circle r="5.2" fill={decisionTone.fill} opacity="0.96">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={model.useProxy ? (model.blocked ? proxyToResultPath : resourceToResultPath) : resourceToResultPath}
              begin="0.5s"
            />
          </circle>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            EXECUTION FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.steps.length} etape(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            controle, chargement et verdict se lisent ici dans l ordre runtime
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.steps.map((step, index) => {
                  const tone = step.status === 'BLOCKED' || step.status === 'EXPOSED'
                    ? {
                        card: 'border-[#c25737]/30 bg-[rgba(245,227,210,0.94)]',
                        tag: 'bg-[#c25737] text-white',
                        title: 'text-[#5f2d20]',
                        body: 'text-[#7a4634]',
                      }
                    : step.status === 'LOADING'
                      ? {
                          card: 'border-[#426c8d]/20 bg-[rgba(214,228,241,0.9)]',
                          tag: 'bg-[#426c8d] text-white',
                          title: 'text-[#27465f]',
                          body: 'text-[#4f6274]',
                        }
                      : {
                          card: 'border-[#246b5e]/18 bg-[rgba(211,236,230,0.9)]',
                          tag: 'bg-[#246b5e] text-white',
                          title: 'text-[#153f38]',
                          body: 'text-[#356258]',
                        }

                  return (
                    <article
                      key={`${step.index}-${step.stageCode}`}
                      className={`rounded-[24px] border px-4 py-4 shadow-[0_8px_22px_rgba(36,31,24,0.05)] transition ${tone.card} ${index > currentStepIndex ? 'opacity-30' : ''} ${index === currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                      style={{ visibility: index < visibleStepCount || index === currentStepIndex ? 'visible' : 'hidden' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                            {step.actorLabel}
                          </p>
                          <h4 className={`mt-2 text-lg font-semibold ${tone.title}`}>{step.title}</h4>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone.tag}`}>
                          {step.status}
                        </span>
                      </div>
                      <p className={`mt-3 text-sm leading-6 ${tone.body}`}>{step.detail}</p>
                      <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                        <span>{step.stageCode}</span>
                        <span>{step.latencyMs} ms</span>
                      </div>
                    </article>
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
