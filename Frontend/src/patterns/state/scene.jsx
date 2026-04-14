import { useMemo } from 'react'

import { ScenePlaybackControls, buildPlaybackFrames, useScenePlayback } from '../shared/scenePlayback'
import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  STATE_LABELS,
  estimateTextWidth,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function extractStateModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.timeline)) {
    return null
  }

  const timeline = output.timeline.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    actionCode: `${step.actionCode ?? ''}`.trim().toUpperCase(),
    actionLabel: `${step.actionLabel ?? step.actionCode ?? 'Action'}`,
    fromState: `${step.fromState ?? 'IDLE'}`.trim().toUpperCase(),
    toState: `${step.toState ?? step.fromState ?? 'IDLE'}`.trim().toUpperCase(),
    accepted: Boolean(step.accepted),
    detail: `${step.detail ?? ''}`.trim(),
  }))

  const initialState = `${output.initialState ?? timeline[0]?.fromState ?? 'IDLE'}`.trim().toUpperCase()
  const finalState = `${output.finalState ?? timeline[timeline.length - 1]?.toState ?? initialState}`.trim().toUpperCase()
  const visitedStates = Array.isArray(output.visitedStates)
    ? output.visitedStates.map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
    : [...new Set([initialState, ...timeline.flatMap((step) => [step.fromState, step.toState])])]

  return {
    mode: `${output.mode ?? 'WITH_STATE'}`,
    modeLabel: `${output.modeLabel ?? 'Avec State'}`,
    useState: `${output.mode ?? 'WITH_STATE'}` !== 'WITHOUT_STATE',
    characterName: `${output.characterName ?? 'Arena Bot'}`,
    initialState,
    finalState,
    currentStateLabel: `${output.currentStateLabel ?? STATE_LABELS[finalState] ?? finalState}`,
    actionCount: safeNumber(output.actionCount, timeline.length),
    acceptedTransitions: safeNumber(output.acceptedTransitions, timeline.filter((step) => step.accepted).length),
    ignoredActions: safeNumber(output.ignoredActions, timeline.filter((step) => !step.accepted).length),
    availableActions: Array.isArray(output.availableActions)
      ? output.availableActions.map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
      : [],
    visitedStates,
    timeline,
  }
}

export default function StateScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractStateModel(execution)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const playback = useScenePlayback(
    useMemo(
      () => buildPlaybackFrames(model.timeline.map((step) => ({ title: step.actionCode })), 'State ready'),
      [model.timeline],
    ),
    900,
  )
  const visibleTimeline = model.timeline.slice(0, playback.currentFrame.visibleStepCount)
  const latestStep = visibleTimeline[visibleTimeline.length - 1] ?? null
  const latestAcceptedStep = [...visibleTimeline].reverse().find((step) => step.accepted) ?? null
  const acceptedTransitionsCount = visibleTimeline.filter((step) => step.accepted).length
  const ignoredActionsCount = visibleTimeline.length - acceptedTransitionsCount
  const currentFinalState = latestAcceptedStep?.toState ?? model.initialState
  const currentStateLabel = STATE_LABELS[currentFinalState] ?? currentFinalState
  const currentVisitedStates = [...new Set([model.initialState, ...visibleTimeline.flatMap((step) => [step.fromState, step.toState])])]

  const viewBoxWidth = 1120
  const graphX = 36
  const graphY = 170
  const graphWidth = 1048
  const graphHeight = isExpanded ? 820 : 720
  const timelineX = graphX
  const timelineY = graphY + graphHeight + 28
  const timelineWidth = graphWidth
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.timeline.length / timelineColumns))
  const timelineRowHeight = isExpanded ? 142 : 150
  const timelineGap = 12
  const timelineHeight = 124 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `state-scene-${isExpanded ? 'expanded' : 'compact'}`
  const contextDescriptionLines = wrapText(
    model.useState
      ? 'delegue chaque action a l etat courant'
      : 'decide chaque transition via des conditions centrales',
    28,
  )
  const summaryActionLines = wrapText(
    `prochaines actions : ${model.availableActions.join(' · ') || 'aucune'}`,
    30,
  )
  const stateNodes = {
    IDLE: { x: graphX + 110, y: graphY + 314, width: 230, height: 108 },
    RUNNING: { x: graphX + 412, y: graphY + 158, width: 238, height: 108 },
    ATTACKING: { x: graphX + 718, y: graphY + 314, width: 236, height: 108 },
    JUMPING: { x: graphX + 412, y: graphY + 520, width: 238, height: 108 },
  }

  const activeStateNode = stateNodes[currentFinalState]
  const contextCard = { x: graphX + 28, y: graphY + 28, width: 276, height: 118 }
  const summaryCard = { x: graphX + graphWidth - 318, y: graphY + 42, width: 286, height: 132 }

  const transitionDefinitions = [
    { key: 'idle-run', from: 'IDLE', to: 'RUNNING', action: 'START_RUN', offset: -18, labelShiftY: -46, labelShiftX: -14 },
    { key: 'run-idle', from: 'RUNNING', to: 'IDLE', action: 'STOP', offset: 18, labelShiftY: 46, labelShiftX: 12 },
    { key: 'idle-jump', from: 'IDLE', to: 'JUMPING', action: 'JUMP', offset: -14, labelShiftX: -10 },
    { key: 'run-jump', from: 'RUNNING', to: 'JUMPING', action: 'JUMP', offset: 0 },
    { key: 'jump-idle', from: 'JUMPING', to: 'IDLE', action: 'LAND', offset: 14, labelShiftY: 26 },
    { key: 'idle-attack', from: 'IDLE', to: 'ATTACKING', action: 'ATTACK', offset: -22, labelShiftY: -52 },
    { key: 'run-attack', from: 'RUNNING', to: 'ATTACKING', action: 'ATTACK', offset: 16, labelShiftY: -20, labelShiftX: 18 },
    { key: 'attack-idle', from: 'ATTACKING', to: 'IDLE', action: 'FINISH_ATTACK', offset: 22, labelShiftY: 52, labelShiftX: 22 },
  ]

  const transitionUsage = visibleTimeline.reduce((accumulator, step) => {
    if (!step.accepted) {
      return accumulator
    }

    const key = `${step.fromState}->${step.toState}:${step.actionCode}`
    accumulator[key] = (accumulator[key] ?? 0) + 1
    return accumulator
  }, {})
  const latestAcceptedTransitionKey = latestAcceptedStep
    ? `${latestAcceptedStep.fromState}->${latestAcceptedStep.toState}:${latestAcceptedStep.actionCode}`
    : null

  const getAnchor = (box, side) => {
    if (side === 'left') {
      return { x: box.x, y: box.y + box.height / 2 }
    }

    if (side === 'top') {
      return { x: box.x + box.width / 2, y: box.y }
    }

    if (side === 'bottom') {
      return { x: box.x + box.width / 2, y: box.y + box.height }
    }

    return { x: box.x + box.width, y: box.y + box.height / 2 }
  }

  const buildPathBetweenStates = (fromCode, toCode, offset = 0) => {
    const from = stateNodes[fromCode]
    const to = stateNodes[toCode]
    const fromCenterX = from.x + from.width / 2
    const fromCenterY = from.y + from.height / 2
    const toCenterX = to.x + to.width / 2
    const toCenterY = to.y + to.height / 2
    const dx = toCenterX - fromCenterX
    const dy = toCenterY - fromCenterY
    const horizontal = Math.abs(dx) >= Math.abs(dy)
    const start = horizontal
      ? getAnchor(from, dx >= 0 ? 'right' : 'left')
      : getAnchor(from, dy >= 0 ? 'bottom' : 'top')
    const end = horizontal
      ? getAnchor(to, dx >= 0 ? 'left' : 'right')
      : getAnchor(to, dy >= 0 ? 'top' : 'bottom')

    if (horizontal) {
      const curve = Math.max(72, Math.abs(dx) * 0.36)
      return `M ${start.x} ${start.y + offset} C ${start.x + Math.sign(dx) * curve} ${start.y + offset} ${end.x - Math.sign(dx) * curve} ${end.y + offset} ${end.x} ${end.y + offset}`
    }

    const curve = Math.max(72, Math.abs(dy) * 0.36)
    return `M ${start.x + offset} ${start.y} C ${start.x + offset} ${start.y + Math.sign(dy) * curve} ${end.x + offset} ${end.y - Math.sign(dy) * curve} ${end.x + offset} ${end.y}`
  }

  const getLabelPosition = (fromCode, toCode, offset = 0, shiftX = 0, shiftY = 0) => {
    const from = stateNodes[fromCode]
    const to = stateNodes[toCode]
    return {
      x: (from.x + from.width / 2 + to.x + to.width / 2) / 2 + (Math.abs(offset) > 0 ? offset * 1.3 : 0) + shiftX,
      y: (from.y + from.height / 2 + to.y + to.height / 2) / 2 - 10 + offset * 0.25 + shiftY,
    }
  }

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Character State Simulator
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
              <stop offset="100%" stopColor="rgba(211,236,230,0.86)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-arrow-muted`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#b7aa99" />
            </marker>
          </defs>

          <rect x="36" y="44" width="1048" height="92" rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x="64" y="80" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useState ? 'STATE MACHINE' : 'CONDITIONAL FLOW'}
          </text>
          <text x="64" y="112" fontSize="28" fontWeight="700" fill="#241f18">
            {model.characterName} · {currentStateLabel}
          </text>
          <text x="392" y="86" fontSize="13" fontWeight="600" fill="#5f5548">
            Etat initial : {STATE_LABELS[model.initialState] ?? model.initialState}
          </text>
          <text x="392" y="112" fontSize="13" fontWeight="600" fill="#5f5548">
            Etat final : {currentStateLabel}
          </text>
          <text x="1056" y="82" textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {acceptedTransitionsCount} transition(s)
          </text>
          <text x="1056" y="108" textAnchor="end" fontSize="13" fill="#5f5548">
            {ignoredActionsCount} action(s) ignoree(s)
          </text>
          {latestStep ? (
            <text x="1056" y="130" textAnchor="end" fontSize="12" fontWeight="600" fill="#5f5548">
              Derniere action : {latestStep.actionCode}
            </text>
          ) : null}

          <rect x={graphX} y={graphY} width={graphWidth} height={graphHeight} rx="34" fill="rgba(255,250,242,0.94)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graphX + 24} y={graphY + 24} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            GRAPHE DES ETATS
          </text>

          <rect x={contextCard.x} y={contextCard.y} width={contextCard.width} height={contextCard.height} rx="24" fill="rgba(211,236,230,0.94)" stroke="#246b5e" strokeWidth="2" className="scene-node-shadow" />
          <text x={contextCard.x + 18} y={contextCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#577166">
            CONTEXT
          </text>
          <text x={contextCard.x + 18} y={contextCard.y + 50} fontSize="20" fontWeight="700" fill="#153f38">
            {model.useState ? 'CharacterContext' : 'SwitchController'}
          </text>
          {contextDescriptionLines.map((line, index) => (
            <text key={`context-line-${index}`} x={contextCard.x + 18} y={contextCard.y + 76 + index * 16} fontSize="12" fill="#215247">
              {line}
            </text>
          ))}

          <rect x={summaryCard.x} y={summaryCard.y} width={summaryCard.width} height={summaryCard.height} rx="24" fill="rgba(245,227,210,0.92)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
          <text x={summaryCard.x + 18} y={summaryCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
            ETAT ACTIF
          </text>
          <text x={summaryCard.x + 18} y={summaryCard.y + 52} fontSize="24" fontWeight="700" fill="#5f2d20">
            {currentStateLabel}
          </text>
          {summaryActionLines.map((line, index) => (
            <text key={`summary-line-${index}`} x={summaryCard.x + 18} y={summaryCard.y + 80 + index * 16} fontSize="12" fill="#7a4634">
              {line}
            </text>
          ))}

          <path
            d={`M ${contextCard.x + contextCard.width} ${contextCard.y + contextCard.height / 2} L ${contextCard.x + contextCard.width + 74} ${contextCard.y + contextCard.height / 2} L ${contextCard.x + contextCard.width + 74} ${activeStateNode.y + activeStateNode.height / 2} L ${activeStateNode.x <= contextCard.x + contextCard.width ? activeStateNode.x + activeStateNode.width : activeStateNode.x} ${activeStateNode.y + activeStateNode.height / 2}`}
            fill="none"
            stroke="#246b5e"
            strokeWidth="2.8"
            strokeDasharray="12 8"
            markerEnd={`url(#${defsId}-arrow)`}
            className="scene-flow-line"
          />

          {transitionDefinitions.map((transition) => {
            const path = buildPathBetweenStates(transition.from, transition.to, transition.offset)
            const count = transitionUsage[`${transition.from}->${transition.to}:${transition.action}`] ?? 0
            const isActive = count > 0
            const isRecent = latestAcceptedTransitionKey === `${transition.from}->${transition.to}:${transition.action}`
            const labelPosition = getLabelPosition(
              transition.from,
              transition.to,
              transition.offset,
              transition.labelShiftX ?? 0,
              transition.labelShiftY ?? 0,
            )
            const labelWidth = Math.max(78, Math.ceil(estimateTextWidth(transition.action, 10) + 24))

            return (
              <g key={transition.key}>
                <path
                  d={path}
                  fill="none"
                  stroke={isRecent ? '#c25737' : isActive ? '#246b5e' : 'rgba(143,127,107,0.68)'}
                  strokeWidth={isRecent ? '4.2' : isActive ? '3.4' : '2.2'}
                  strokeDasharray={isRecent ? '16 8' : isActive ? '14 8' : '0'}
                  markerEnd={`url(#${defsId}-${isActive || isRecent ? 'arrow' : 'arrow-muted'})`}
                  className={isRecent ? 'state-recent-path' : isActive ? 'scene-flow-line' : ''}
                />
                {isRecent ? (
                  <circle r="5.5" fill="#c25737" opacity="0.96">
                    <animateMotion dur="1.55s" repeatCount="indefinite" path={path} />
                  </circle>
                ) : null}
                <rect
                  x={labelPosition.x - labelWidth / 2}
                  y={labelPosition.y - 12}
                  width={labelWidth}
                  height="22"
                  rx="11"
                  fill={isRecent ? 'rgba(245,227,210,0.98)' : isActive ? 'rgba(211,236,230,0.96)' : 'rgba(255,250,242,0.92)'}
                  stroke={isRecent ? 'rgba(194,87,55,0.2)' : isActive ? 'rgba(36,107,94,0.16)' : 'rgba(36,31,24,0.08)'}
                />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="0.14em"
                  fill={isRecent ? '#8b3620' : isActive ? '#153f38' : '#6d6459'}
                >
                  {transition.action}
                </text>
                {count > 0 ? (
                  <text x={labelPosition.x + labelWidth / 2 + 8} y={labelPosition.y + 3} fontSize="10" fontWeight="700" fill={isRecent ? '#c25737' : '#246b5e'}>
                    x{count}
                  </text>
                ) : null}
              </g>
            )
          })}

          {Object.entries(stateNodes).map(([code, node]) => {
            const isActive = currentFinalState === code
            const isVisited = currentVisitedStates.includes(code)

            return (
              <g key={code}>
                {isActive ? (
                  <rect
                    x={node.x - 10}
                    y={node.y - 10}
                    width={node.width + 20}
                    height={node.height + 20}
                    rx="34"
                    fill="rgba(194,87,55,0.08)"
                    stroke="rgba(194,87,55,0.22)"
                    strokeWidth="2"
                    className="state-active-halo"
                  />
                ) : null}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx="28"
                  fill={isActive ? '#241f18' : isVisited ? 'rgba(255,244,220,0.98)' : 'rgba(255,250,242,0.95)'}
                  stroke={isActive ? '#241f18' : isVisited ? '#9a7130' : 'rgba(36,31,24,0.12)'}
                  strokeWidth="2"
                  className="scene-node-shadow"
                />
                <text x={node.x + 18} y={node.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={isActive ? 'rgba(255,248,238,0.7)' : isVisited ? '#7a571f' : '#7f7469'}>
                  {isActive ? 'ACTIVE STATE' : isVisited ? 'VISITED STATE' : 'STATE'}
                </text>
                <text x={node.x + 18} y={node.y + 54} fontSize="22" fontWeight="700" fill={isActive ? '#fff8ee' : isVisited ? '#5c4218' : '#241f18'}>
                  {STATE_LABELS[code]}
                </text>
                <text x={node.x + 18} y={node.y + 80} fontSize="12" fill={isActive ? 'rgba(255,248,238,0.74)' : isVisited ? '#7a571f' : '#5f5548'}>
                  {code}
                </text>
                {isActive ? (
                  <text x={node.x + node.width - 18} y={node.y + 24} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#f1b29e">
                    NOW
                  </text>
                ) : null}
              </g>
            )
          })}

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            TIMELINE
          </text>
          <text x={timelineX + 24} y={timelineY + 62} fontSize="24" fontWeight="700" fill="#241f18">
            {model.actionCount} action(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 88} fontSize="13" fill="#5f5548">
            les transitions refusees restent visibles pour comprendre les limites de chaque etat
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 106} width={timelineWidth - 32} height={timelineHeight - 130}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.timeline.map((step, index) => (
                  <div
                    key={`${step.index}-${step.actionCode}`}
                    className={`min-h-[132px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] transition ${
                      latestStep && step.index === latestStep.index
                        ? step.accepted
                          ? 'state-recent-card border-orange-200 bg-orange-50/95'
                          : 'state-recent-card border-amber-300 bg-amber-50/96'
                        : step.accepted
                          ? 'border-emerald-200 bg-emerald-50/90'
                          : 'border-amber-200 bg-amber-50/92'
                    } ${index > playback.currentFrame.currentStepIndex ? 'opacity-30' : ''} ${index === playback.currentFrame.currentStepIndex ? 'ring-2 ring-black/20' : ''}`}
                    style={{ visibility: index < playback.currentFrame.visibleStepCount || index === playback.currentFrame.currentStepIndex ? 'visible' : 'hidden' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                        Step {step.index}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        latestStep && step.index === latestStep.index
                          ? step.accepted
                            ? 'text-orange-800'
                            : 'text-amber-900'
                          : step.accepted ? 'text-emerald-800' : 'text-amber-900'
                      }`}>
                        {latestStep && step.index === latestStep.index
                          ? step.accepted ? 'dernier move' : 'dernier essai'
                          : step.accepted ? 'transition acceptee' : 'action ignoree'}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-stone-900">{step.actionCode}</p>
                    <p className="mt-1 text-[12px] text-stone-700">
                      {STATE_LABELS[step.fromState] ?? step.fromState} → {STATE_LABELS[step.toState] ?? step.toState}
                    </p>
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
