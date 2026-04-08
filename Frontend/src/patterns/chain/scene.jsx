import ZoomableViewport from '../../components/ZoomableViewport'
import {
  CHAIN_STAGE_META,
  EmptyScenePlaceholder,
  SceneMetaBadges,
  estimateTextWidth,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function extractChainModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.steps)) {
    return null
  }

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    handlerCode: `${step.handlerCode ?? 'AUTH'}`.trim().toUpperCase(),
    handlerLabel: `${step.handlerLabel ?? 'Handler'}`.trim(),
    status: `${step.status ?? 'PASSED'}`.trim().toUpperCase(),
    passed: Boolean(step.passed),
    detail: `${step.detail ?? ''}`.trim(),
  }))

  return {
    mode: `${output.mode ?? 'WITH_CHAIN'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Chain of Responsibility'}`.trim(),
    useChain: `${output.mode ?? 'WITH_CHAIN'}`.trim().toUpperCase() !== 'WITHOUT_CHAIN',
    requestName: `${output.requestName ?? 'Export mensuel'}`.trim(),
    tokenLabel: `${output.tokenLabel ?? output.tokenState ?? 'Token valide'}`.trim(),
    payloadLabel: `${output.payloadLabel ?? output.payloadState ?? 'Payload valide'}`.trim(),
    processingTargetLabel: `${output.processingTargetLabel ?? output.processingTarget ?? 'Export de rapport'}`.trim(),
    finalDecision: `${output.finalDecision ?? 'REJECTED'}`.trim().toUpperCase(),
    decisionLabel: `${output.decisionLabel ?? ''}`.trim(),
    accepted: Boolean(output.accepted),
    handledBy: `${output.handledBy ?? ''}`.trim(),
    stoppedAt: `${output.stoppedAt ?? steps[steps.length - 1]?.handlerCode ?? 'AUTH'}`.trim().toUpperCase(),
    passedHandlers: safeNumber(output.passedHandlers, steps.filter((step) => step.passed).length),
    stepCount: safeNumber(output.stepCount, steps.length),
    visitedHandlers: Array.isArray(output.visitedHandlers)
      ? output.visitedHandlers.map((value) => `${value}`.trim().toUpperCase()).filter(Boolean)
      : steps.map((step) => step.handlerCode),
    steps,
  }
}

export default function ChainScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = extractChainModel(execution)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const viewBoxWidth = 1120
  const metricsX = 36
  const metricsY = 40
  const metricsWidth = 1048
  const metricsHeight = 102
  const pipelineX = 36
  const pipelineY = 166
  const pipelineWidth = 1048
  const pipelineHeight = 320
  const requestCard = { x: 58, y: 282, width: 212, height: 120 }
  const stageY = 260
  const stageWidth = isExpanded ? 202 : 194
  const stageHeight = 126
  const stageGap = 28
  const stageStartX = 326
  const stageOrder = ['AUTH', 'VALIDATION', 'PROCESSING']
  const stageBoxes = stageOrder.reduce((accumulator, code, index) => {
    accumulator[code] = {
      x: stageStartX + index * (stageWidth + stageGap),
      y: stageY,
      width: stageWidth,
      height: stageHeight,
    }
    return accumulator
  }, {})
  const resultCard = { x: 350, y: 516, width: 420, height: 116 }
  const timelineX = pipelineX
  const timelineY = resultCard.y + resultCard.height + 24
  const timelineWidth = pipelineWidth
  const timelineColumns = 3
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 126
  const timelineGap = 12
  const timelineHeight = 120 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 36
  const defsId = `chain-scene-${isExpanded ? 'expanded' : 'compact'}`
  const stepByCode = Object.fromEntries(model.steps.map((step) => [step.handlerCode, step]))
  const lastStep = model.steps[model.steps.length - 1]
  const rejected = !model.accepted

  const segmentColor = (active, critical = false) => (
    critical ? '#c25737' : active ? '#246b5e' : 'rgba(143,127,107,0.48)'
  )

  const requestAnchor = { x: requestCard.x + requestCard.width, y: requestCard.y + requestCard.height / 2 }
  const authLeft = { x: stageBoxes.AUTH.x, y: stageBoxes.AUTH.y + stageBoxes.AUTH.height / 2 }
  const authRight = { x: stageBoxes.AUTH.x + stageBoxes.AUTH.width, y: stageBoxes.AUTH.y + stageBoxes.AUTH.height / 2 }
  const validationLeft = { x: stageBoxes.VALIDATION.x, y: stageBoxes.VALIDATION.y + stageBoxes.VALIDATION.height / 2 }
  const validationRight = { x: stageBoxes.VALIDATION.x + stageBoxes.VALIDATION.width, y: stageBoxes.VALIDATION.y + stageBoxes.VALIDATION.height / 2 }
  const processingLeft = { x: stageBoxes.PROCESSING.x, y: stageBoxes.PROCESSING.y + stageBoxes.PROCESSING.height / 2 }
  const processingBottom = { x: stageBoxes.PROCESSING.x + stageBoxes.PROCESSING.width / 2, y: stageBoxes.PROCESSING.y + stageBoxes.PROCESSING.height }
  const authBottom = { x: stageBoxes.AUTH.x + stageBoxes.AUTH.width / 2, y: stageBoxes.AUTH.y + stageBoxes.AUTH.height }
  const validationBottom = { x: stageBoxes.VALIDATION.x + stageBoxes.VALIDATION.width / 2, y: stageBoxes.VALIDATION.y + stageBoxes.VALIDATION.height }
  const resultTop = { x: resultCard.x + resultCard.width / 2, y: resultCard.y }

  const requestToAuthPath = `M ${requestAnchor.x} ${requestAnchor.y} L ${authLeft.x} ${authLeft.y}`
  const authToValidationPath = `M ${authRight.x} ${authRight.y} L ${validationLeft.x} ${validationLeft.y}`
  const validationToProcessingPath = `M ${validationRight.x} ${validationRight.y} L ${processingLeft.x} ${processingLeft.y}`
  const processingToResultPath = `M ${processingBottom.x} ${processingBottom.y} L ${processingBottom.x} ${resultTop.y - 20} L ${resultTop.x} ${resultTop.y - 20} L ${resultTop.x} ${resultTop.y}`
  const authToResultPath = `M ${authBottom.x} ${authBottom.y} L ${authBottom.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y}`
  const validationToResultPath = `M ${validationBottom.x} ${validationBottom.y} L ${validationBottom.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y - 26} L ${resultTop.x} ${resultTop.y}`

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Validation Pipeline
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(211,236,230,0.84)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-arrow-danger`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect x={metricsX} y={metricsY} width={metricsWidth} height={metricsHeight} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metricsX + 28} y={metricsY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            RESPONSIBILITY FLOW
          </text>
          <text x={metricsX + 28} y={metricsY + 66} fontSize="30" fontWeight="700" fill="#241f18">
            {model.modeLabel}
          </text>
          <text x={metricsX + 28} y={metricsY + 90} fontSize="13" fill="#5f5548">
            {model.requestName} · {model.processingTargetLabel}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 58} textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {model.accepted ? 'ACCEPTEE' : 'REJETEE'}
          </text>
          <text x={metricsX + metricsWidth - 28} y={metricsY + 86} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.passedHandlers}/{model.stepCount} maillon(x)
          </text>

          <rect x={pipelineX} y={pipelineY} width={pipelineWidth} height={pipelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={pipelineX + 24} y={pipelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            PIPELINE
          </text>

          {!model.useChain ? (
            <g>
              <rect x={pipelineX + 24} y={pipelineY + 44} width="520" height="44" rx="18" fill="rgba(245,227,210,0.88)" stroke="rgba(194,87,55,0.18)" strokeWidth="1.5" />
              <text x={pipelineX + 44} y={pipelineY + 71} fontSize="12" fontWeight="600" fill="#7a4634">
                Sans pattern, un RequestController enchaine tous les checks en inline.
              </text>
            </g>
          ) : null}

          <g>
            <rect x={requestCard.x} y={requestCard.y} width={requestCard.width} height={requestCard.height} rx="28" fill="rgba(231,198,167,0.9)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={requestCard.x + 18} y={requestCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              REQUEST
            </text>
            {wrapText(model.requestName, 18).slice(0, 2).map((line, index) => (
              <text key={`chain-request-${index}`} x={requestCard.x + 18} y={requestCard.y + 52 + index * 20} fontSize="20" fontWeight="700" fill="#5f2d20">
                {line}
              </text>
            ))}
            <text x={requestCard.x + 18} y={requestCard.y + 94} fontSize="12" fill="#7a4634">
              {model.tokenLabel}
            </text>
            <text x={requestCard.x + 18} y={requestCard.y + 112} fontSize="12" fill="#7a4634">
              {model.payloadLabel}
            </text>
          </g>

          <path d={requestToAuthPath} fill="none" stroke={segmentColor(model.visitedHandlers.includes('AUTH'))} strokeWidth="3" strokeDasharray={model.visitedHandlers.includes('AUTH') ? '14 8' : '0'} markerEnd={`url(#${defsId}-arrow)`} className={model.visitedHandlers.includes('AUTH') ? 'scene-flow-line' : ''} />
          {model.visitedHandlers.includes('AUTH') ? (
            <circle r="5" fill="#246b5e" opacity="0.95">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={requestToAuthPath} />
            </circle>
          ) : null}

          <path d={authToValidationPath} fill="none" stroke={segmentColor(model.visitedHandlers.includes('VALIDATION'))} strokeWidth="3" strokeDasharray={model.visitedHandlers.includes('VALIDATION') ? '14 8' : '0'} markerEnd={`url(#${defsId}-arrow)`} className={model.visitedHandlers.includes('VALIDATION') ? 'scene-flow-line' : ''} />
          {model.visitedHandlers.includes('VALIDATION') ? (
            <circle r="5" fill="#246b5e" opacity="0.95">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={authToValidationPath} begin="0.2s" />
            </circle>
          ) : null}

          <path d={validationToProcessingPath} fill="none" stroke={segmentColor(model.visitedHandlers.includes('PROCESSING'))} strokeWidth="3" strokeDasharray={model.visitedHandlers.includes('PROCESSING') ? '14 8' : '0'} markerEnd={`url(#${defsId}-arrow)`} className={model.visitedHandlers.includes('PROCESSING') ? 'scene-flow-line' : ''} />
          {model.visitedHandlers.includes('PROCESSING') ? (
            <circle r="5" fill="#246b5e" opacity="0.95">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={validationToProcessingPath} begin="0.4s" />
            </circle>
          ) : null}

          <path
            d={model.accepted ? processingToResultPath : model.stoppedAt === 'AUTH' ? authToResultPath : validationToResultPath}
            fill="none"
            stroke={segmentColor(true, rejected)}
            strokeWidth="3.2"
            strokeDasharray="14 8"
            markerEnd={`url(#${defsId}-${rejected ? 'arrow-danger' : 'arrow'})`}
            className="scene-flow-line"
          />
          <circle r="5.2" fill={rejected ? '#c25737' : '#246b5e'} opacity="0.95">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={model.accepted ? processingToResultPath : model.stoppedAt === 'AUTH' ? authToResultPath : validationToResultPath}
              begin="0.55s"
            />
          </circle>

          {stageOrder.map((code) => {
            const box = stageBoxes[code]
            const step = stepByCode[code]
            const visited = model.visitedHandlers.includes(code)
            const isCurrent = model.stoppedAt === code
            const meta = CHAIN_STAGE_META[code]
            const status = step?.status ?? 'PENDING'
            const palette = isCurrent && status === 'REJECTED'
              ? { fill: 'rgba(245,227,210,0.96)', stroke: '#c25737', text: '#5f2d20', subtle: '#8b5b49' }
              : isCurrent
                ? { fill: '#241f18', stroke: '#241f18', text: '#fff8ee', subtle: 'rgba(255,248,238,0.68)' }
                : visited
                  ? { fill: 'rgba(211,236,230,0.96)', stroke: '#246b5e', text: '#153f38', subtle: '#577166' }
                  : { fill: 'rgba(255,250,242,0.96)', stroke: 'rgba(36,31,24,0.12)', text: '#241f18', subtle: '#7f7469' }

            return (
              <g key={code}>
                <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="28" fill={palette.fill} stroke={palette.stroke} strokeWidth="2" className="scene-node-shadow" />
                <text x={box.x + 18} y={box.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={palette.subtle}>
                  {model.useChain ? 'HANDLER' : 'INLINE CHECK'}
                </text>
                <text x={box.x + 18} y={box.y + 52} fontSize="20" fontWeight="700" fill={palette.text}>
                  {meta.title}
                </text>
                <text x={box.x + 18} y={box.y + 74} fontSize="12" fill={palette.subtle}>
                  {meta.subtitle}
                </text>
                <rect
                  x={box.x + 18}
                  y={box.y + 88}
                  width={Math.max(92, estimateTextWidth(status, 10) + 26)}
                  height="24"
                  rx="12"
                  fill={isCurrent && status === 'REJECTED' ? 'rgba(194,87,55,0.12)' : visited ? 'rgba(255,255,255,0.16)' : 'rgba(36,31,24,0.06)'}
                  stroke={isCurrent && status === 'REJECTED' ? 'rgba(194,87,55,0.2)' : 'transparent'}
                />
                <text x={box.x + 31} y={box.y + 104} fontSize="10" fontWeight="700" letterSpacing="0.14em" fill={palette.text}>
                  {status}
                </text>
              </g>
            )
          })}

          <g>
            <rect
              x={resultCard.x}
              y={resultCard.y}
              width={resultCard.width}
              height={resultCard.height}
              rx="30"
              fill={model.accepted ? 'rgba(211,236,230,0.96)' : 'rgba(245,227,210,0.96)'}
              stroke={model.accepted ? '#246b5e' : '#c25737'}
              strokeWidth="2"
              className="scene-node-shadow"
            />
            <text x={resultCard.x + 22} y={resultCard.y + 26} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.accepted ? '#577166' : '#8b5b49'}>
              OUTCOME
            </text>
            <text x={resultCard.x + 22} y={resultCard.y + 58} fontSize="24" fontWeight="700" fill={model.accepted ? '#153f38' : '#5f2d20'}>
              {model.accepted ? 'Request accepted' : 'Request rejected'}
            </text>
            {wrapText(model.decisionLabel || (model.accepted ? `Traitee par ${model.handledBy}` : `Stoppee par ${model.handledBy}`), 44)
              .slice(0, 2)
              .map((line, index) => (
                <text key={`chain-decision-${index}`} x={resultCard.x + 22} y={resultCard.y + 84 + index * 16} fontSize="12" fill={model.accepted ? '#215247' : '#7a4634'}>
                  {line}
                </text>
              ))}
          </g>

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ETAPES DE LA CHAINE
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            {model.stepCount} maillon(x) visite(s)
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            lis la progression de la requete pour voir exactement ou elle est acceptee ou stoppee
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 102} width={timelineWidth - 32} height={timelineHeight - 118}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.steps.map((step) => {
                  const highlighted = step.index === lastStep.index
                  const cardClassName = highlighted
                    ? step.status === 'REJECTED'
                      ? 'border-orange-200 bg-orange-50/95'
                      : 'border-stone-900 bg-stone-950 text-white'
                    : step.status === 'REJECTED'
                      ? 'border-amber-200 bg-amber-50/92'
                      : 'border-emerald-200 bg-emerald-50/90'

                  return (
                    <div
                      key={`${step.index}-${step.handlerCode}`}
                      className={`min-h-[118px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${cardClassName}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${highlighted && step.status !== 'REJECTED' ? 'text-white/70' : 'text-stone-500'}`}>
                          Step {step.index}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                          highlighted
                            ? step.status === 'REJECTED'
                              ? 'text-orange-900'
                              : 'text-white/72'
                            : step.status === 'REJECTED'
                              ? 'text-amber-900'
                              : 'text-emerald-800'
                        }`}>
                          {step.status}
                        </p>
                      </div>
                      <p className={`mt-2 text-[13px] font-semibold ${highlighted && step.status !== 'REJECTED' ? 'text-white' : 'text-stone-900'}`}>
                        {step.handlerLabel}
                      </p>
                      <p className={`mt-2 text-[12px] leading-5 ${highlighted && step.status !== 'REJECTED' ? 'text-white/78' : 'text-stone-600'}`}>
                        {step.detail}
                      </p>
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
