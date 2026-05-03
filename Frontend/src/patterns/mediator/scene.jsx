import { createElement, useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function extractMediatorModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.deliveries)) {
    return null
  }

  const deliveries = output.deliveries.map((delivery, index) => ({
    index: safeNumber(delivery.index, index + 1),
    from: `${delivery.from ?? ''}`.trim(),
    to: `${delivery.to ?? ''}`.trim(),
    via: `${delivery.via ?? ''}`.trim(),
    transport: `${delivery.transport ?? 'MEDIATED'}`.trim().toUpperCase(),
    detail: `${delivery.detail ?? ''}`.trim(),
  }))

  return {
    mode: `${output.mode ?? 'WITH_MEDIATOR'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Mediator'}`.trim(),
    useMediator: `${output.mode ?? 'WITH_MEDIATOR'}`.trim().toUpperCase() !== 'WITHOUT_MEDIATOR',
    roomName: `${output.roomName ?? 'Arena Chat'}`.trim(),
    participants: Array.isArray(output.participants) ? output.participants.map((value) => `${value}`.trim()).filter(Boolean) : [],
    participantCount: safeNumber(output.participantCount, 0),
    senderName: `${output.senderName ?? 'Luna'}`.trim(),
    recipients: Array.isArray(output.recipients) ? output.recipients.map((value) => `${value}`.trim()).filter(Boolean) : [],
    recipientCount: safeNumber(output.recipientCount, deliveries.length),
    message: `${output.message ?? ''}`.trim(),
    deliveredCount: safeNumber(output.deliveredCount, deliveries.length),
    senderCouplingCount: safeNumber(output.senderCouplingCount, 1),
    directLinkCount: safeNumber(output.directLinkCount, 0),
    deliveryModeLabel: `${output.deliveryModeLabel ?? ''}`.trim(),
    deliveries,
  }
}

export default function MediatorScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractMediatorModel(execution), [execution])

  const playback = useScenePlayback(
    useMemo(
      () => buildPlaybackFrames((model?.deliveries ?? []).map((delivery) => ({ title: `Delivery ${delivery.index}` })), 'Message ready'),
      [model],
    ),
    900,
  )

  if (!model) {
    return <EmptyScenePlaceholder />
  }
  const visibleStepCount = playback.currentFrame.visibleStepCount
  const currentStepIndex = playback.currentFrame.currentStepIndex

  const viewBoxWidth = 1120
  const cardHeight = 84
  const cardGap = 18
  const recipientsHeight = model.recipients.length * cardHeight + Math.max(0, model.recipients.length - 1) * cardGap
  const metricsX = 36
  const metricsY = 40
  const metricsWidth = 1048
  const metricsHeight = 104
  const graphX = 36
  const graphY = 168
  const graphWidth = 1048
  const graphHeight = Math.max(isExpanded ? 430 : 380, 210 + recipientsHeight)
  const senderCard = { x: 56, y: graphY + Math.max(110, (graphHeight - 132) / 2), width: 226, height: 132 }
  const mediatorCard = { x: 426, y: graphY + Math.max(82, (graphHeight - 170) / 2), width: 268, height: 170 }
  const recipientX = 836
  const recipientStartY = graphY + Math.max(56, (graphHeight - recipientsHeight) / 2)
  const messagePanel = { x: 318, y: graphY + graphHeight - 112, width: 490, height: 88 }
  const timelineX = graphX
  const timelineY = graphY + graphHeight + 24
  const timelineWidth = graphWidth
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.deliveries.length / timelineColumns))
  const timelineRowHeight = 126
  const timelineGap = 12
  const timelineHeight = 118 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `mediator-scene-${isExpanded ? 'expanded' : 'compact'}`
  const senderAnchor = { x: senderCard.x + senderCard.width, y: senderCard.y + senderCard.height / 2 }
  const mediatorLeft = { x: mediatorCard.x, y: mediatorCard.y + mediatorCard.height / 2 }
  const mediatorRight = { x: mediatorCard.x + mediatorCard.width, y: mediatorCard.y + mediatorCard.height / 2 }
  const messageLines = wrapText(model.message, 44).slice(0, 2)

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Chat Hub Simulator')}
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
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-arrow-direct`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect x={metricsX} y={metricsY} width={metricsWidth} height={metricsHeight} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metricsX + 28} y={metricsY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            MEDIATOR HUB
          </text>
          <text x={metricsX + 28} y={metricsY + 66} fontSize="30" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={metricsX + 28} y={metricsY + 92} fontSize="13" fill="#5f5548">
            {model.roomName} · {model.deliveryModeLabel}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 58} textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {model.deliveredCount} livraison(s)
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            couplage expediteur : {model.senderCouplingCount}
          </text>

          <rect x={graphX} y={graphY} width={graphWidth} height={graphHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graphX + 24} y={graphY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            CHAT GRAPH
          </text>

          <g>
            <rect x={senderCard.x} y={senderCard.y} width={senderCard.width} height={senderCard.height} rx="30" fill="rgba(231,198,167,0.9)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={senderCard.x + 18} y={senderCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              SENDER
            </text>
            <text x={senderCard.x + 18} y={senderCard.y + 54} fontSize="24" fontWeight="700" fill="#5f2d20">
              {model.senderName}
            </text>
            <text x={senderCard.x + 18} y={senderCard.y + 84} fontSize="12" fill="#7a4634">
              {model.useMediator ? 'emet un seul message vers le hub' : `contacte ${model.recipientCount} destinataire(s)`}
            </text>
            <text x={senderCard.x + 18} y={senderCard.y + 106} fontSize="12" fill="#7a4634">
              participants : {model.participantCount}
            </text>
          </g>

          <g opacity={model.useMediator ? 1 : 0.48}>
            <rect x={mediatorCard.x} y={mediatorCard.y} width={mediatorCard.width} height={mediatorCard.height} rx="34" fill={model.useMediator ? '#241f18' : 'rgba(214,228,241,0.72)'} stroke={model.useMediator ? '#241f18' : '#426c8d'} strokeWidth="2" className="scene-node-shadow" />
            <text x={mediatorCard.x + 22} y={mediatorCard.y + 28} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useMediator ? 'rgba(255,248,238,0.64)' : '#6b7a88'}>
              {model.useMediator ? 'MEDIATOR HUB' : 'BYPASSED HUB'}
            </text>
            <text x={mediatorCard.x + 22} y={mediatorCard.y + 68} fontSize="28" fontWeight="700" fill={model.useMediator ? '#fff8ee' : '#27465f'}>
              ChatRoomMediator
            </text>
            {wrapText(model.useMediator ? 'coordonne les relais entre participants' : 'present dans le design mais contourne dans les messages directs', 34)
              .slice(0, 3)
              .map((line, index) => (
                <text
                  key={`mediator-card-${index}`}
                  x={mediatorCard.x + 22}
                  y={mediatorCard.y + 96 + index * 18}
                  fontSize="13"
                  fill={model.useMediator ? 'rgba(255,248,238,0.72)' : '#4f6274'}
                >
                  {line}
                </text>
              ))}
          </g>

          {model.useMediator ? (
            <>
              <path d={`M ${senderAnchor.x} ${senderAnchor.y} L ${mediatorLeft.x} ${mediatorLeft.y}`} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
              <circle r="5" fill="#246b5e" opacity="0.96">
                <animateMotion dur="1.7s" repeatCount="indefinite" path={`M ${senderAnchor.x} ${senderAnchor.y} L ${mediatorLeft.x} ${mediatorLeft.y}`} />
              </circle>
            </>
          ) : null}

          {model.recipientCount > 0 ? model.recipients.map((recipient, index) => {
            const y = recipientStartY + index * (cardHeight + cardGap)
            const card = { x: recipientX, y, width: 232, height: cardHeight }
            const directPath = `M ${senderAnchor.x} ${senderAnchor.y} L ${card.x} ${card.y + card.height / 2}`
            const relayedPath = `M ${mediatorRight.x} ${mediatorRight.y} L ${card.x} ${card.y + card.height / 2}`

            return (
              <g key={recipient}>
                <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="24" fill="rgba(255,250,242,0.96)" stroke={model.useMediator ? '#246b5e' : '#c25737'} strokeWidth="2" className="scene-node-shadow" />
                <text x={card.x + 18} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.useMediator ? '#577166' : '#8b5b49'}>
                  RECIPIENT
                </text>
                <text x={card.x + 18} y={card.y + 52} fontSize="20" fontWeight="700" fill="#241f18">
                  {recipient}
                </text>
                <text x={card.x + 18} y={card.y + 70} fontSize="12" fill="#5f5548">
                  {model.useMediator ? `recoit via ${model.roomName}` : 'recoit en direct'}
                </text>

                <path
                  d={model.useMediator ? relayedPath : directPath}
                  fill="none"
                  stroke={model.useMediator ? '#246b5e' : '#c25737'}
                  strokeWidth="3"
                  strokeDasharray="14 8"
                  markerEnd={`url(#${defsId}-${model.useMediator ? 'arrow' : 'arrow-direct'})`}
                  className="scene-flow-line"
                />
                <circle r="5" fill={model.useMediator ? '#246b5e' : '#c25737'} opacity="0.96">
                  <animateMotion dur="1.85s" repeatCount="indefinite" path={model.useMediator ? relayedPath : directPath} begin={`${index * 0.18}s`} />
                </circle>
              </g>
            )
          }) : null}

          <g>
            <rect x={messagePanel.x} y={messagePanel.y} width={messagePanel.width} height={messagePanel.height} rx="24" fill="rgba(255,244,220,0.96)" stroke="rgba(154,113,48,0.42)" strokeWidth="2" />
            <text x={messagePanel.x + 18} y={messagePanel.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#7a571f">
              MESSAGE
            </text>
            {messageLines.map((line, index) => (
              <text key={`mediator-message-${index}`} x={messagePanel.x + 18} y={messagePanel.y + 52 + index * 18} fontSize="15" fontWeight="600" fill="#5c4218">
                {line}
              </text>
            ))}
          </g>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            DELIVERY FEED
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.deliveredCount} message(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            observe si le message passe par le hub ou part en direct vers chaque destinataire
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.deliveries.map((delivery, index) => (
                  <div
                    key={`${delivery.index}-${delivery.to}`}
                    className={`min-h-[118px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] transition ${
                      delivery.transport === 'MEDIATED'
                        ? 'border-emerald-200 bg-emerald-50/90'
                        : 'border-orange-200 bg-orange-50/92'
                    } ${index > currentStepIndex ? 'opacity-30' : ''} ${index === currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                    style={{ visibility: index < visibleStepCount || index === currentStepIndex ? 'visible' : 'hidden' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Delivery {delivery.index}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${delivery.transport === 'MEDIATED' ? 'text-emerald-800' : 'text-orange-900'}`}>
                        {delivery.transport}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-stone-900">
                      {delivery.from} → {delivery.to}
                    </p>
                    <p className="mt-1 text-[12px] text-stone-700">via {delivery.via}</p>
                    <p className="mt-2 text-[12px] leading-5 text-stone-600">{delivery.detail}</p>
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
