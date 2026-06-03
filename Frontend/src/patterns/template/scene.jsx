import { createElement, useEffect, useMemo, useState } from 'react'

import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function extractTemplateModel(execution) {
  const output = execution?.output
  if (!output || !Array.isArray(output.steps)) {
    return null
  }

  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    stageCode: `${step.stageCode ?? ''}`.trim().toUpperCase(),
    stageLabel: `${step.stageLabel ?? 'Etape'}`.trim(),
    actorLabel: `${step.actorLabel ?? ''}`.trim(),
    status: `${step.status ?? ''}`.trim().toUpperCase(),
    detail: `${step.detail ?? ''}`.trim(),
    variableStage: Boolean(step.variableStage),
  }))

  return {
    mode: `${output.mode ?? 'WITH_TEMPLATE_METHOD'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Template Method'}`.trim(),
    workflowName: `${output.workflowName ?? 'Workflow Builder'}`.trim(),
    workflowCode: `${output.workflowCode ?? 'RELEASE_PIPELINE'}`.trim().toUpperCase(),
    workflowLabel: `${output.workflowLabel ?? 'Release Pipeline'}`.trim(),
    workflowDescription: `${output.workflowDescription ?? ''}`.trim(),
    ambianceLabel: `${output.ambianceLabel ?? ''}`.trim(),
    prepareLabel: `${output.prepareLabel ?? 'Prepare'}`.trim(),
    prepareDetail: `${output.prepareDetail ?? ''}`.trim(),
    executeLabel: `${output.executeLabel ?? 'Execute'}`.trim(),
    executeDetail: `${output.executeDetail ?? ''}`.trim(),
    finalizeLabel: `${output.finalizeLabel ?? 'Finalize'}`.trim(),
    finalizeDetail: `${output.finalizeDetail ?? ''}`.trim(),
    manualDriftDetail: `${output.manualDriftDetail ?? ''}`.trim(),
    skeletonLabel: `${output.skeletonLabel ?? 'AbstractWorkflowTemplate'}`.trim(),
    clientLabel: `${output.clientLabel ?? 'WorkflowClient'}`.trim(),
    resultLabel: `${output.resultLabel ?? ''}`.trim(),
    templateUsed: Boolean(output.templateUsed),
    finalizationGuaranteed: Boolean(output.finalizationGuaranteed),
    stableWorkflow: Boolean(output.stableWorkflow),
    duplicateBoilerplateCount: safeNumber(output.duplicateBoilerplateCount, 0),
    latencyMs: safeNumber(output.latencyMs, 0),
    fixedStageCount: safeNumber(output.fixedStageCount, 3),
    steps,
  }
}

function buildTemplateFrames(model) {
  if (!model) {
    return []
  }

  const introDetail = model.templateUsed
    ? `Le client declenche ${model.skeletonLabel} puis le squelette verrouille prepare -> execute -> finalize.`
    : `Le client enchaine le workflow a la main. Chaque etape doit etre recodee et la cloture peut deriver.`

  return [
    {
      id: 'template-initial',
      index: 0,
      stageCode: 'START',
      stageLabel: 'Workflow ready',
      actorLabel: model.clientLabel,
      status: 'READY',
      detail: introDetail,
      variableStage: false,
      visibleStepCount: 0,
      currentStageCode: null,
      currentStageLabel: model.workflowLabel,
      resultLabel: 'Workflow ready',
    },
    ...model.steps.map((step, index) => ({
      ...step,
      id: `template-step-${step.index}`,
      visibleStepCount: index + 1,
      currentStageCode: step.stageCode,
      currentStageLabel: step.stageLabel,
      resultLabel: step.stageLabel,
    })),
  ]
}

function StageCard({
  card,
  label,
  title,
  detail,
  status,
  variableStage = false,
}) {
  const isWarning = status === 'FRAGILE' || status === 'WARNING'
  const isCustom = variableStage
  const fill = isWarning
    ? 'rgba(245,227,210,0.96)'
    : isCustom
      ? '#241f18'
      : 'rgba(255,249,239,0.98)'
  const stroke = isWarning ? '#c25737' : isCustom ? '#241f18' : '#7f5c3f'
  const titleColor = isWarning ? '#5f2d20' : isCustom ? '#fff8ee' : '#3d2d20'
  const subtle = isWarning ? '#8b5b49' : isCustom ? 'rgba(255,248,238,0.64)' : '#7f5c3f'
  const detailColor = isWarning ? '#7a4634' : isCustom ? 'rgba(255,248,238,0.76)' : '#5f5548'
  const titleLines = wrapText(title, 20).slice(0, 2)
  const titleLineHeight = 24
  const titleStartY = card.y + 56
  const detailY = titleStartY + titleLines.length * titleLineHeight + 10

  return (
    <g>
      {status === 'ACTIVE' ? (
        <rect
          x={card.x - 8}
          y={card.y - 8}
          width={card.width + 16}
          height={card.height + 16}
          rx="32"
          fill="rgba(36,31,24,0.06)"
          stroke="rgba(36,31,24,0.18)"
          strokeWidth="2"
          className="state-active-halo"
        />
      ) : null}
      <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="28" fill={fill} stroke={stroke} strokeWidth="2" className="scene-node-shadow" />
      <text x={card.x + 16} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={subtle}>
        {label}
      </text>
      <text x={card.x + card.width - 16} y={card.y + 24} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={isWarning ? '#c25737' : isCustom ? '#d8c4a8' : '#246b5e'}>
        {status}
      </text>
      {titleLines.map((line, index) => (
        <text key={`${line}-${index}`} x={card.x + 16} y={titleStartY + index * titleLineHeight} fontSize="22" fontWeight="700" fill={titleColor}>
          {line}
        </text>
      ))}
      <foreignObject x={card.x + 14} y={detailY} width={card.width - 28} height={card.height - (detailY - card.y) - 20}>
        <div className="h-full overflow-hidden text-[12px] leading-5" style={{ color: detailColor }} xmlns="http://www.w3.org/1999/xhtml">
          <p className="m-0">{detail}</p>
        </div>
      </foreignObject>
      {variableStage ? (
        <rect x={card.x + card.width - 72} y={card.y + card.height - 28} width="54" height="18" rx="9" fill="rgba(255,248,238,0.16)" />
      ) : null}
      {variableStage ? (
        <text x={card.x + card.width - 45} y={card.y + card.height - 15} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="0.18em" fill="#fff8ee">
          HOOK
        </text>
      ) : null}
      {status === 'ACTIVE' ? (
        <rect x={card.x + 16} y={card.y + card.height - 28} width="54" height="18" rx="9" fill={isCustom ? 'rgba(255,248,238,0.16)' : '#241f18'} />
      ) : null}
      {status === 'ACTIVE' ? (
        <text x={card.x + 43} y={card.y + card.height - 15} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="0.18em" fill="#fff8ee">
          NOW
        </text>
      ) : null}
    </g>
  )
}

function TimelineCard({ card, step, isCurrent }) {
  const statusTone = step.status === 'FRAGILE' || step.status === 'WARNING'
    ? 'rgba(245,227,210,0.98)'
    : step.variableStage
      ? 'rgba(214,228,241,0.94)'
      : 'rgba(255,249,239,0.98)'
  const statusText = step.status === 'FRAGILE' || step.status === 'WARNING'
    ? '#7a4634'
    : step.variableStage
      ? '#27465f'
      : '#5f5548'
  const titleLines = wrapText(step.stageLabel, 24).slice(0, 2)
  const titleStartY = card.y + 56
  const detailY = titleStartY + titleLines.length * 20 + 22

  return (
    <g>
      <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="24" fill={statusTone} stroke={isCurrent ? '#241f18' : 'rgba(36,31,24,0.12)'} strokeWidth={isCurrent ? '2.5' : '1.5'} />
      {isCurrent ? (
        <rect x={card.x + card.width - 72} y={card.y + 14} width="54" height="18" rx="9" fill="#241f18" />
      ) : null}
      {isCurrent ? (
        <text x={card.x + card.width - 45} y={card.y + 27} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="0.18em" fill="#fff8ee">
          NOW
        </text>
      ) : null}
      <circle cx={card.x + 22} cy={card.y + 22} r="12" fill="#241f18" />
      <text x={card.x + 22} y={card.y + 26} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff8ee">
        {step.index}
      </text>
      <text x={card.x + 44} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={statusText}>
        {step.stageCode}
      </text>
      {titleLines.map((line, index) => (
        <text key={`${line}-${index}`} x={card.x + 18} y={titleStartY + index * 20} fontSize="18" fontWeight="700" fill="#241f18">
          {line}
        </text>
      ))}
      <text x={card.x + 18} y={titleStartY + titleLines.length * 20 + 4} fontSize="11" fill="#6c6257">
        {step.actorLabel}
      </text>
      <foreignObject x={card.x + 16} y={detailY} width={card.width - 32} height={card.height - (detailY - card.y) - 12}>
        <div className="h-full overflow-hidden text-[12px] leading-5 text-[#5f5548]" xmlns="http://www.w3.org/1999/xhtml">
          <p className="m-0">{step.detail}</p>
        </div>
      </foreignObject>
    </g>
  )
}

export default function TemplateScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractTemplateModel(execution), [execution])
  const frames = useMemo(() => buildTemplateFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(Math.max(0, frames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }, [frames.length, model?.mode, model?.workflowCode, model?.workflowName, model?.executeLabel])

  useEffect(() => {
    if (playMode === 'STEP') {
      setIsPlaying(false)
    }
  }, [playMode])

  useEffect(() => {
    if (!isPlaying || playMode !== 'AUTO' || currentFrameIndex >= frames.length - 1) {
      if (currentFrameIndex >= frames.length - 1) {
        setIsPlaying(false)
      }
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentFrameIndex((index) => Math.min(index + 1, frames.length - 1))
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [currentFrameIndex, delayMs, frames.length, isPlaying, playMode])

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const currentFrame = frames[currentFrameIndex] ?? frames[frames.length - 1]
  const visibleSteps = model.steps.slice(0, currentFrame.visibleStepCount)
  const activeStep = currentFrameIndex > 0 ? visibleSteps[visibleSteps.length - 1] ?? null : null
  const activeStageCode = currentFrame.currentStageCode
  const currentResultLabel = currentFrameIndex > 0 ? currentFrame.resultLabel : model.resultLabel

  function handleLaunchDemo() {
    setCurrentFrameIndex(0)
    setIsPlaying(playMode === 'AUTO')
  }

  function handleReset() {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }

  function handlePrevious() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.max(0, index - 1))
  }

  function handleNext() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.min(index + 1, frames.length - 1))
  }

  const viewBoxWidth = 1260
  const metrics = { x: 36, y: 40, width: 1188, height: 112 }
  const graph = { x: 36, y: 176, width: 1188, height: 592 }
  const clientCard = { x: 72, y: 320, width: 248, height: 174 }
  const skeletonCard = { x: 438, y: 226, width: 360, height: 224 }
  const resultCard = { x: 948, y: 266, width: 244, height: 142 }
  const prepareCard = { x: 142, y: 534, width: 284, height: 194 }
  const executeCard = { x: 488, y: 534, width: 284, height: 194 }
  const finalizeCard = { x: 834, y: 534, width: 284, height: 194 }
  const timelineX = 36
  const timelineY = 802
  const timelineWidth = 1188
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineCardHeight = 164
  const timelineGap = 14
  const timelineHeight = 112 + timelineRows * timelineCardHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 36
  const defsId = `template-scene-${isExpanded ? 'expanded' : 'compact'}`

  const clientToSkeleton = `M ${clientCard.x + clientCard.width} ${clientCard.y + clientCard.height / 2} C ${clientCard.x + clientCard.width + 74} ${clientCard.y + clientCard.height / 2 - 12} ${skeletonCard.x - 78} ${skeletonCard.y + skeletonCard.height / 2} ${skeletonCard.x} ${skeletonCard.y + skeletonCard.height / 2}`
  const skeletonToPrepare = `M ${skeletonCard.x + 54} ${skeletonCard.y + skeletonCard.height} C ${skeletonCard.x + 30} ${skeletonCard.y + skeletonCard.height + 84} ${prepareCard.x + prepareCard.width / 2} ${prepareCard.y - 30} ${prepareCard.x + prepareCard.width / 2} ${prepareCard.y}`
  const skeletonToExecute = `M ${skeletonCard.x + skeletonCard.width / 2} ${skeletonCard.y + skeletonCard.height} L ${skeletonCard.x + skeletonCard.width / 2} ${executeCard.y}`
  const skeletonToFinalize = `M ${skeletonCard.x + skeletonCard.width - 54} ${skeletonCard.y + skeletonCard.height} C ${skeletonCard.x + skeletonCard.width - 30} ${skeletonCard.y + skeletonCard.height + 84} ${finalizeCard.x + finalizeCard.width / 2} ${finalizeCard.y - 30} ${finalizeCard.x + finalizeCard.width / 2} ${finalizeCard.y}`
  const finalizeToResult = `M ${finalizeCard.x + finalizeCard.width / 2} ${finalizeCard.y} C ${finalizeCard.x + finalizeCard.width / 2 + 26} ${finalizeCard.y - 94} ${resultCard.x + resultCard.width / 2 - 22} ${resultCard.y + resultCard.height + 54} ${resultCard.x + resultCard.width / 2} ${resultCard.y + resultCard.height}`
  const workflowLines = wrapText(model.workflowDescription, 42).slice(0, 4)
  const workflowNameLines = wrapText(model.workflowName, 18).slice(0, 2)
  const skeletonLabelLines = wrapText(model.skeletonLabel, 22).slice(0, 2)
  const resultLabelLines = wrapText(model.resultLabel, 18).slice(0, 2)
  const stableMessage = model.templateUsed
    ? 'Le canevas prepare -> execute -> finalise reste garanti.'
    : 'Le workflow avance, mais sa cloture depend du code manuel.'

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scène SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Workflow Builder')}
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white/72 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Lecture</span>
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              playMode === 'AUTO'
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white text-stone-700'
            }`}
            type="button"
            onClick={() => setPlayMode('AUTO')}
          >
            Auto
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              playMode === 'STEP'
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white text-stone-700'
            }`}
            type="button"
            onClick={() => setPlayMode('STEP')}
          >
            Pas à pas
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {playMode === 'AUTO' ? (
            <label className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-stone-700">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Tempo</span>
              <select
                className="bg-transparent font-semibold outline-none"
                value={delayMs}
                onChange={(event) => setDelayMs(Number(event.target.value))}
              >
                <option value={700}>700 ms</option>
                <option value={900}>900 ms</option>
                <option value={1200}>1200 ms</option>
              </select>
            </label>
          ) : null}

          <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5" type="button" onClick={handleLaunchDemo}>
            Animer la scène
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handlePrevious} disabled={currentFrameIndex === 0}>
            Précédent
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handleNext} disabled={currentFrameIndex >= frames.length - 1}>
            Suivant
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

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
            TEMPLATE METHOD LOOP
          </text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">
            {model.workflowLabel}
          </text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">
            {model.modeLabel} · {model.ambianceLabel} · {visibleSteps.length}/{model.fixedStageCount} étapes jouees
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 60} textAnchor="end" fontSize="24" fontWeight="700" fill={model.stableWorkflow ? '#153f38' : '#c25737'}>
            {currentResultLabel}
          </text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 88} textAnchor="end" fontSize="13" fill="#5f5548">
            {model.duplicateBoilerplateCount} bloc(s) commun(s) · {model.latencyMs} ms
          </text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            LIVE WORKFLOW
          </text>

          <g>
            <rect x={clientCard.x} y={clientCard.y} width={clientCard.width} height={clientCard.height} rx="28" fill="rgba(231,198,167,0.92)" stroke="#c25737" strokeWidth="2" className="scene-node-shadow" />
            <text x={clientCard.x + 18} y={clientCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#8b5b49">
              CLIENT
            </text>
            {workflowNameLines.map((line, index) => (
              <text key={`${line}-${index}`} x={clientCard.x + 18} y={clientCard.y + 56 + index * 24} fontSize="24" fontWeight="700" fill="#5f2d20">
                {line}
              </text>
            ))}
            <text x={clientCard.x + 18} y={clientCard.y + 90 + (workflowNameLines.length - 1) * 24} fontSize="12" fill="#7a4634">
              {model.clientLabel}
            </text>
            <foreignObject x={clientCard.x + 16} y={clientCard.y + 104 + (workflowNameLines.length - 1) * 24} width={clientCard.width - 32} height={clientCard.height - 118 - (workflowNameLines.length - 1) * 24}>
              <div className="h-full overflow-hidden text-[12px] leading-5 text-[#7a4634]" xmlns="http://www.w3.org/1999/xhtml">
                <p className="m-0">{stableMessage}</p>
              </div>
            </foreignObject>
          </g>

          <g>
            <rect x={skeletonCard.x} y={skeletonCard.y} width={skeletonCard.width} height={skeletonCard.height} rx="32" fill={model.templateUsed ? '#241f18' : 'rgba(214,228,241,0.94)'} stroke={model.templateUsed ? '#241f18' : '#426c8d'} strokeWidth="2" className="scene-node-shadow" />
            <text x={skeletonCard.x + 22} y={skeletonCard.y + 28} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.templateUsed ? 'rgba(255,248,238,0.64)' : '#607488'}>
              {model.templateUsed ? 'TEMPLATE' : 'MANUAL FLOW'}
            </text>
            {skeletonLabelLines.map((line, index) => (
              <text key={`${line}-${index}`} x={skeletonCard.x + 22} y={skeletonCard.y + 64 + index * 26} fontSize="26" fontWeight="700" fill={model.templateUsed ? '#fff8ee' : '#27465f'}>
                {line}
              </text>
            ))}
            <text x={skeletonCard.x + 22} y={skeletonCard.y + 102 + (skeletonLabelLines.length - 1) * 26} fontSize="12" fill={model.templateUsed ? 'rgba(255,248,238,0.76)' : '#547086'}>
              {'prepare() -> executeSpecificStep() -> finalize()'}
            </text>
            <foreignObject x={skeletonCard.x + 18} y={skeletonCard.y + 120 + (skeletonLabelLines.length - 1) * 26} width={skeletonCard.width - 36} height={skeletonCard.height - 140 - (skeletonLabelLines.length - 1) * 26}>
              <div className={`h-full overflow-hidden text-[13px] leading-5 ${model.templateUsed ? 'text-white/78' : 'text-[#4f6274]'}`} xmlns="http://www.w3.org/1999/xhtml">
                {workflowLines.map((line, index) => (
                  <p key={`${line}-${index}`} className="m-0">
                    {line}
                  </p>
                ))}
              </div>
            </foreignObject>
          </g>

          <g>
            <rect x={resultCard.x} y={resultCard.y} width={resultCard.width} height={resultCard.height} rx="28" fill={model.stableWorkflow ? 'rgba(211,236,230,0.94)' : 'rgba(245,227,210,0.96)'} stroke={model.stableWorkflow ? '#246b5e' : '#c25737'} strokeWidth="2" className="scene-node-shadow" />
            <text x={resultCard.x + 18} y={resultCard.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.stableWorkflow ? '#577166' : '#8b5b49'}>
              RESULTAT
            </text>
            {resultLabelLines.map((line, index) => (
              <text key={`${line}-${index}`} x={resultCard.x + 18} y={resultCard.y + 58 + index * 22} fontSize="22" fontWeight="700" fill={model.stableWorkflow ? '#153f38' : '#5f2d20'}>
                {line}
              </text>
            ))}
            <text x={resultCard.x + 18} y={resultCard.y + 94 + (resultLabelLines.length - 1) * 22} fontSize="12" fill={model.stableWorkflow ? '#215247' : '#7a4634'}>
              {activeStep?.detail ?? (model.finalizationGuaranteed ? 'finalization guaranteed' : 'cleanup drift')}
            </text>
          </g>

          <StageCard
            card={prepareCard}
            label="STAGE 1"
            title={model.prepareLabel}
            detail={activeStageCode === 'PREPARE' && activeStep ? activeStep.detail : model.prepareDetail}
            status={activeStageCode === 'PREPARE' ? 'ACTIVE' : 'READY'}
          />
          <StageCard
            card={executeCard}
            label="STAGE 2"
            title={model.executeLabel}
            detail={activeStageCode === 'EXECUTE' && activeStep ? activeStep.detail : model.executeDetail}
            status={activeStageCode === 'EXECUTE' ? 'ACTIVE' : 'CUSTOM'}
            variableStage
          />
          <StageCard
            card={finalizeCard}
            label="STAGE 3"
            title={model.finalizeLabel}
            detail={
              activeStageCode === 'FINALIZE'
                ? activeStep?.detail ?? (model.finalizationGuaranteed ? model.finalizeDetail : model.manualDriftDetail)
                : model.finalizationGuaranteed
                  ? model.finalizeDetail
                  : model.manualDriftDetail
            }
            status={activeStageCode === 'FINALIZE' ? 'ACTIVE' : model.finalizationGuaranteed ? 'READY' : 'FRAGILE'}
          />

          <path d={clientToSkeleton} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
          <path d={skeletonToPrepare} fill="none" stroke="#246b5e" strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
          <path d={skeletonToExecute} fill="none" stroke="#426c8d" strokeWidth="3" strokeDasharray="12 8" markerEnd={`url(#${defsId}-success-arrow)`} className="scene-flow-line" />
          <path d={skeletonToFinalize} fill="none" stroke={model.finalizationGuaranteed ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.finalizationGuaranteed ? 'success' : 'warning'}-arrow)`} className="scene-flow-line" />
          <path d={finalizeToResult} fill="none" stroke={model.finalizationGuaranteed ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.finalizationGuaranteed ? 'success' : 'warning'}-arrow)`} className="scene-flow-line" />

          <circle r="5" fill="#246b5e" opacity="0.96">
            <animateMotion dur="1.9s" repeatCount="indefinite" path={clientToSkeleton} />
          </circle>
          <circle r="5" fill="#426c8d" opacity="0.96">
            <animateMotion dur="1.9s" repeatCount="indefinite" path={skeletonToExecute} begin="0.15s" />
          </circle>
          <circle r="5" fill={model.finalizationGuaranteed ? '#246b5e' : '#c25737'} opacity="0.96">
            <animateMotion dur="1.9s" repeatCount="indefinite" path={finalizeToResult} begin="0.35s" />
          </circle>
          {activeStageCode === 'PREPARE' ? (
            <circle cx={prepareCard.x + prepareCard.width - 18} cy={prepareCard.y + 18} r="10" fill="#246b5e" className="state-active-halo" />
          ) : null}
          {activeStageCode === 'EXECUTE' ? (
            <circle cx={executeCard.x + executeCard.width - 18} cy={executeCard.y + 18} r="10" fill="#426c8d" className="state-active-halo" />
          ) : null}
          {activeStageCode === 'FINALIZE' ? (
            <circle cx={finalizeCard.x + finalizeCard.width - 18} cy={finalizeCard.y + 18} r="10" fill={model.finalizationGuaranteed ? '#246b5e' : '#c25737'} className="state-active-halo" />
          ) : null}

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="30" fill="rgba(255,249,239,0.98)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            PAS A PAS
          </text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">
            Timeline du workflow
          </text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">
            {visibleSteps.length}/{model.steps.length} étapes · {model.templateUsed ? 'squelette stable' : 'workflow manuel fragile'}
          </text>

          {model.steps.map((step, index) => {
            const column = index % timelineColumns
            const row = Math.floor(index / timelineColumns)
            const cardWidth = (timelineWidth - 48 - timelineGap * (timelineColumns - 1)) / timelineColumns
            const card = {
              x: timelineX + 24 + column * (cardWidth + timelineGap),
              y: timelineY + 106 + row * (timelineCardHeight + timelineGap),
              width: cardWidth,
              height: timelineCardHeight,
            }

            return <TimelineCard key={`${step.stageCode}-${step.index}`} card={card} step={step} isCurrent={index === currentFrameIndex - 1} />
          })}
        </svg>
      </ZoomableViewport>
    </div>
  )
}
