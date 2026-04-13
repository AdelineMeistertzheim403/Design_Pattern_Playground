import { useEffect, useMemo, useState } from 'react'

import ZoomableViewport from '../../components/ZoomableViewport'
import { EmptyScenePlaceholder, SceneMetaBadges, safeNumber, wrapText } from '../shared/sceneShared'

function normalizeState(state) {
  return {
    sceneLabel: `${state?.sceneLabel ?? 'Workspace'}`.trim(),
    theme: `${state?.theme ?? 'Theme'}`.trim(),
    energy: safeNumber(state?.energy, 0),
    layerCount: safeNumber(state?.layerCount, 0),
    annotationCount: safeNumber(state?.annotationCount, 0),
    alertLevel: `${state?.alertLevel ?? 'Stable'}`.trim(),
  }
}

function extractMementoModel(execution) {
  const output = execution?.output
  if (!output || !Array.isArray(output.steps) || !Array.isArray(output.checkpoints)) {
    return null
  }

  const checkpoints = output.checkpoints.map((checkpoint) => ({
    code: `${checkpoint.code ?? 'SNAPSHOT'}`.trim().toUpperCase(),
    label: `${checkpoint.label ?? 'Checkpoint'}`.trim(),
    stepIndex: safeNumber(checkpoint.stepIndex, 0),
    note: `${checkpoint.note ?? ''}`.trim(),
    snapshotState: normalizeState(checkpoint.snapshotState),
  }))
  const steps = output.steps.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    actionCode: `${step.actionCode ?? 'ACTION'}`.trim().toUpperCase(),
    actionLabel: `${step.actionLabel ?? 'Action'}`.trim(),
    actorLabel: `${step.actorLabel ?? 'Actor'}`.trim(),
    detail: `${step.detail ?? ''}`.trim(),
    snapshotCreated: Boolean(step.snapshotCreated),
    checkpointCode: step.checkpointCode ? `${step.checkpointCode}`.trim().toUpperCase() : null,
    state: normalizeState(step.state),
  }))

  return {
    mode: `${output.mode ?? 'WITH_MEMENTO'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Memento'}`.trim(),
    workspaceName: `${output.workspaceName ?? 'Save & Restore'}`.trim(),
    presetCode: `${output.presetCode ?? 'PIXEL_GARDEN'}`.trim().toUpperCase(),
    presetLabel: `${output.presetLabel ?? 'Pixel Garden'}`.trim(),
    presetDescription: `${output.presetDescription ?? ''}`.trim(),
    restoreTarget: `${output.restoreTarget ?? 'SNAPSHOT_ALPHA'}`.trim().toUpperCase(),
    restoreTargetLabel: `${output.restoreTargetLabel ?? 'Checkpoint Alpha'}`.trim(),
    rewindBenefit: `${output.rewindBenefit ?? ''}`.trim(),
    manualDriftDetail: `${output.manualDriftDetail ?? ''}`.trim(),
    exactRestore: Boolean(output.exactRestore),
    snapshotCount: safeNumber(output.snapshotCount, checkpoints.length),
    stepCount: safeNumber(output.stepCount, steps.length),
    initialState: normalizeState(output.initialState),
    restoredState: normalizeState(output.restoredState),
    resultLabel: `${output.resultLabel ?? 'Restore'}`.trim(),
    checkpoints,
    steps,
  }
}

function buildFrames(model) {
  if (!model) {
    return []
  }

  return [
    {
      id: 'memento-intro',
      currentState: model.initialState,
      visibleCheckpoints: [],
      currentStep: null,
      resultState: null,
      activeCheckpointCode: null,
    },
    ...model.steps.map((step) => ({
      id: `memento-step-${step.index}`,
      currentState: step.state,
      visibleCheckpoints: model.checkpoints.filter((checkpoint) => checkpoint.stepIndex <= step.index),
      currentStep: step,
      resultState: step.actionCode === 'RESTORE' ? step.state : null,
      activeCheckpointCode: step.checkpointCode,
    })),
  ]
}

function MetricPill({ x, y, width, label, value, accent, progress }) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  return (
    <g>
      <rect x={x} y={y} width={width} height="48" rx="18" fill="rgba(255,249,239,0.96)" stroke="rgba(36,31,24,0.08)" />
      <text x={x + 16} y={y + 18} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6b6257">
        {label}
      </text>
      <text x={x + width - 16} y={y + 18} textAnchor="end" fontSize="15" fontWeight="700" fill="#241f18">
        {value}
      </text>
      <rect x={x + 16} y={y + 28} width={width - 32} height="8" rx="999" fill="rgba(36,31,24,0.08)" />
      <rect x={x + 16} y={y + 28} width={(width - 32) * clampedProgress} height="8" rx="999" fill={accent} />
    </g>
  )
}

function TimelineCard({ card, step, isCurrent }) {
  const isSave = step.actionCode.startsWith('SAVE')
  const isRestore = step.actionCode === 'RESTORE'
  const fill = isRestore
    ? 'rgba(211,236,230,0.96)'
    : isSave
      ? 'rgba(214,228,241,0.94)'
      : 'rgba(255,249,239,0.98)'
  const stroke = isRestore ? '#246b5e' : isSave ? '#426c8d' : 'rgba(36,31,24,0.12)'

  return (
    <g>
      <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="24" fill={fill} stroke={isCurrent ? '#241f18' : stroke} strokeWidth={isCurrent ? '2.5' : '1.5'} />
      {isCurrent ? <rect x={card.x + card.width - 72} y={card.y + 14} width="54" height="18" rx="9" fill="#241f18" /> : null}
      {isCurrent ? <text x={card.x + card.width - 45} y={card.y + 27} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="0.18em" fill="#fff8ee">NOW</text> : null}
      <text x={card.x + 18} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6b6257">
        STEP {step.index}
      </text>
      <text x={card.x + 18} y={card.y + 54} fontSize="19" fontWeight="700" fill="#241f18">
        {step.actionLabel}
      </text>
      <text x={card.x + 18} y={card.y + 74} fontSize="11" fill="#6c6257">
        {step.actorLabel}
      </text>
      <foreignObject x={card.x + 16} y={card.y + 88} width={card.width - 32} height={card.height - 100}>
        <div className="h-full overflow-hidden text-[12px] leading-5 text-[#5f5548]" xmlns="http://www.w3.org/1999/xhtml">
          <p className="m-0">{step.detail}</p>
        </div>
      </foreignObject>
    </g>
  )
}

export default function MementoScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractMementoModel(execution), [execution])
  const frames = useMemo(() => buildFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(Math.max(0, frames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }, [frames.length, model.mode, model.presetCode, model.workspaceName, model.restoreTarget])

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

  const currentFrame = frames[currentFrameIndex] ?? frames[frames.length - 1]
  const currentState = currentFrame.currentState
  const visibleSteps = model.steps.slice(0, currentFrameIndex)
  const resultState = currentFrame.resultState ?? model.restoredState
  const checkpoints = currentFrame.visibleCheckpoints
  const activeCheckpoint = checkpoints.find((checkpoint) => checkpoint.code === currentFrame.activeCheckpointCode)
    ?? checkpoints.find((checkpoint) => checkpoint.code === model.restoreTarget)
    ?? null
  const currentStep = currentFrame.currentStep

  function handleLaunchDemo() {
    setCurrentFrameIndex(0)
    setIsPlaying(playMode === 'AUTO')
  }

  function handlePrevious() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.max(0, index - 1))
  }

  function handleNext() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.min(index + 1, frames.length - 1))
  }

  function handleReset() {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }

  const viewBoxWidth = 1380
  const metrics = { x: 36, y: 40, width: 1308, height: 112 }
  const graph = { x: 36, y: 176, width: 1308, height: 520 }
  const editorCard = { x: 66, y: 226, width: 354, height: 392 }
  const checkpointArea = { x: 470, y: 226, width: 424, height: 392 }
  const resultCard = { x: 938, y: 226, width: 370, height: 392 }
  const timelineX = 36
  const timelineY = 726
  const timelineWidth = 1308
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.steps.length / timelineColumns))
  const timelineRowHeight = 148
  const timelineGap = 12
  const timelineHeight = 120 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 40
  const defsId = `memento-scene-${isExpanded ? 'expanded' : 'compact'}`
  const checkpointCards = checkpoints.map((checkpoint, index) => ({
    checkpoint,
    card: {
      x: checkpointArea.x + 20,
      y: checkpointArea.y + 48 + index * 152,
      width: checkpointArea.width - 40,
      height: 128,
    },
  }))
  const activeCheckpointCard = checkpointCards.find(({ checkpoint }) => checkpoint.code === activeCheckpoint?.code)?.card ?? null
  const rewindPath = activeCheckpointCard
    ? `M ${activeCheckpointCard.x + activeCheckpointCard.width} ${activeCheckpointCard.y + activeCheckpointCard.height / 2} C ${activeCheckpointCard.x + activeCheckpointCard.width + 44} ${activeCheckpointCard.y + activeCheckpointCard.height / 2 - 24} ${resultCard.x - 44} ${resultCard.y + resultCard.height / 2 + 24} ${resultCard.x} ${resultCard.y + resultCard.height / 2}`
    : null

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Save & Restore
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white/72 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Lecture</span>
          <button className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${playMode === 'AUTO' ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-700'}`} type="button" onClick={() => setPlayMode('AUTO')}>Auto</button>
          <button className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${playMode === 'STEP' ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-700'}`} type="button" onClick={() => setPlayMode('STEP')}>Pas a pas</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {playMode === 'AUTO' ? (
            <label className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-stone-700">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Tempo</span>
              <select className="bg-transparent font-semibold outline-none" value={delayMs} onChange={(event) => setDelayMs(Number(event.target.value))}>
                <option value={700}>700 ms</option>
                <option value={900}>900 ms</option>
                <option value={1200}>1200 ms</option>
              </select>
            </label>
          ) : null}
          <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5" type="button" onClick={handleLaunchDemo}>Lancer la demo</button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handlePrevious} disabled={currentFrameIndex === 0}>Precedent</button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handleNext} disabled={currentFrameIndex >= frames.length - 1}>Suivant</button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={handleReset}>Reset</button>
        </div>
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-metrics`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(214,228,241,0.84)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
            <marker id={`${defsId}-warning-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c25737" />
            </marker>
          </defs>

          <rect x={metrics.x} y={metrics.y} width={metrics.width} height={metrics.height} rx="32" fill={`url(#${defsId}-metrics)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={metrics.x + 28} y={metrics.y + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">MEMENTO REWIND</text>
          <text x={metrics.x + 28} y={metrics.y + 66} fontSize="28" fontWeight="700" fill="#241f18">{model.presetLabel}</text>
          <text x={metrics.x + 28} y={metrics.y + 92} fontSize="13" fill="#5f5548">{model.modeLabel} · {checkpoints.length}/{model.snapshotCount} snapshot(s) · {visibleSteps.length}/{model.stepCount} etapes</text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 60} textAnchor="end" fontSize="24" fontWeight="700" fill={model.exactRestore ? '#153f38' : '#c25737'}>{model.resultLabel}</text>
          <text x={metrics.x + metrics.width - 28} y={metrics.y + 88} textAnchor="end" fontSize="13" fill="#5f5548">{model.restoreTargetLabel} · {currentState.alertLevel}</text>

          <rect x={graph.x} y={graph.y} width={graph.width} height={graph.height} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={graph.x + 24} y={graph.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">LIVE SAVEPOINTS</text>

          <rect x={editorCard.x} y={editorCard.y} width={editorCard.width} height={editorCard.height} rx="30" fill="#241f18" stroke="#241f18" strokeWidth="2" className="scene-node-shadow" />
          <text x={editorCard.x + 20} y={editorCard.y + 26} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="rgba(255,248,238,0.64)">EDITOR STATE</text>
          <text x={editorCard.x + 20} y={editorCard.y + 60} fontSize="28" fontWeight="700" fill="#fff8ee">{model.workspaceName}</text>
          <text x={editorCard.x + 20} y={editorCard.y + 88} fontSize="13" fill="rgba(255,248,238,0.76)">{currentState.theme}</text>
          <foreignObject x={editorCard.x + 18} y={editorCard.y + 104} width={editorCard.width - 36} height="64">
            <div className="h-full overflow-hidden text-[12px] leading-5 text-white/78" xmlns="http://www.w3.org/1999/xhtml">
              <p className="m-0">{currentStep?.detail ?? model.presetDescription}</p>
            </div>
          </foreignObject>
          <MetricPill x={editorCard.x + 20} y={editorCard.y + 186} width={editorCard.width - 40} label="ENERGY" value={currentState.energy} accent="#246b5e" progress={currentState.energy / 100} />
          <MetricPill x={editorCard.x + 20} y={editorCard.y + 246} width={editorCard.width - 40} label="LAYERS" value={currentState.layerCount} accent="#426c8d" progress={currentState.layerCount / 8} />
          <MetricPill x={editorCard.x + 20} y={editorCard.y + 306} width={editorCard.width - 40} label="ANNOTATIONS" value={currentState.annotationCount} accent="#c25737" progress={currentState.annotationCount / 8} />

          <rect x={checkpointArea.x} y={checkpointArea.y} width={checkpointArea.width} height={checkpointArea.height} rx="30" fill="rgba(255,249,239,0.98)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={checkpointArea.x + 20} y={checkpointArea.y + 26} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">CHECKPOINT BANK</text>
          <text x={checkpointArea.x + 20} y={checkpointArea.y + 56} fontSize="24" fontWeight="700" fill="#241f18">Snapshots</text>
          <text x={checkpointArea.x + 20} y={checkpointArea.y + 82} fontSize="13" fill="#5f5548">{model.restoreTargetLabel} cible le rewind actuel</text>

          {checkpointCards.map(({ checkpoint, card }) => {
            const isActive = checkpoint.code === activeCheckpoint?.code
            return (
              <g key={checkpoint.code}>
                {isActive ? <rect x={card.x - 8} y={card.y - 8} width={card.width + 16} height={card.height + 16} rx="28" fill="rgba(36,31,24,0.06)" stroke="rgba(36,31,24,0.18)" strokeWidth="2" className="state-active-halo" /> : null}
                <rect x={card.x} y={card.y} width={card.width} height={card.height} rx="24" fill={isActive ? 'rgba(214,228,241,0.94)' : 'rgba(255,250,242,0.96)'} stroke={isActive ? '#426c8d' : 'rgba(36,31,24,0.08)'} strokeWidth={isActive ? '2.5' : '1.5'} />
                <text x={card.x + 18} y={card.y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#6b6257">{checkpoint.label.toUpperCase()}</text>
                {isActive ? <text x={card.x + card.width - 18} y={card.y + 24} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#27465f">NOW</text> : null}
                <text x={card.x + 18} y={card.y + 56} fontSize="20" fontWeight="700" fill="#241f18">{checkpoint.snapshotState.theme}</text>
                <text x={card.x + 18} y={card.y + 78} fontSize="12" fill="#5f5548">{checkpoint.note}</text>
                <text x={card.x + 18} y={card.y + 102} fontSize="11" fill="#5f5548">energy {checkpoint.snapshotState.energy} · layers {checkpoint.snapshotState.layerCount} · notes {checkpoint.snapshotState.annotationCount}</text>
              </g>
            )
          })}

          <rect x={resultCard.x} y={resultCard.y} width={resultCard.width} height={resultCard.height} rx="30" fill={model.exactRestore ? 'rgba(211,236,230,0.94)' : 'rgba(245,227,210,0.96)'} stroke={model.exactRestore ? '#246b5e' : '#c25737'} strokeWidth="2" className="scene-node-shadow" />
          <text x={resultCard.x + 20} y={resultCard.y + 26} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={model.exactRestore ? '#577166' : '#8b5b49'}>REWIND RESULT</text>
          <text x={resultCard.x + 20} y={resultCard.y + 60} fontSize="28" fontWeight="700" fill={model.exactRestore ? '#153f38' : '#5f2d20'}>{resultState.theme}</text>
          <text x={resultCard.x + 20} y={resultCard.y + 86} fontSize="13" fill={model.exactRestore ? '#215247' : '#7a4634'}>{currentFrame.resultState ? currentFrame.resultState.alertLevel : 'Awaiting restore'}</text>
          <foreignObject x={resultCard.x + 18} y={resultCard.y + 104} width={resultCard.width - 36} height="70">
            <div className={`h-full overflow-hidden text-[12px] leading-5 ${model.exactRestore ? 'text-[#215247]' : 'text-[#7a4634]'}`} xmlns="http://www.w3.org/1999/xhtml">
              <p className="m-0">{model.exactRestore ? model.rewindBenefit : model.manualDriftDetail}</p>
            </div>
          </foreignObject>
          <MetricPill x={resultCard.x + 20} y={resultCard.y + 198} width={resultCard.width - 40} label="ENERGY" value={resultState.energy} accent={model.exactRestore ? '#246b5e' : '#c25737'} progress={resultState.energy / 100} />
          <MetricPill x={resultCard.x + 20} y={resultCard.y + 258} width={resultCard.width - 40} label="LAYERS" value={resultState.layerCount} accent="#426c8d" progress={resultState.layerCount / 8} />
          <MetricPill x={resultCard.x + 20} y={resultCard.y + 318} width={resultCard.width - 40} label="ANNOTATIONS" value={resultState.annotationCount} accent="#c25737" progress={resultState.annotationCount / 8} />

          {rewindPath ? (
            <path d={rewindPath} fill="none" stroke={model.exactRestore ? '#246b5e' : '#c25737'} strokeWidth="3" strokeDasharray="14 8" markerEnd={`url(#${defsId}-${model.exactRestore ? 'arrow' : 'warning-arrow'})`} className="scene-flow-line" />
          ) : null}
          {rewindPath && currentStep?.actionCode === 'RESTORE' ? (
            <circle r="5" fill={model.exactRestore ? '#246b5e' : '#c25737'} opacity="0.96">
              <animateMotion dur="1.5s" repeatCount="indefinite" path={rewindPath} />
            </circle>
          ) : null}

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="30" fill="rgba(255,249,239,0.98)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">PAS A PAS</text>
          <text x={timelineX + 24} y={timelineY + 60} fontSize="24" fontWeight="700" fill="#241f18">Timeline du rewind</text>
          <text x={timelineX + 24} y={timelineY + 86} fontSize="13" fill="#5f5548">{visibleSteps.length}/{model.steps.length} etapes · {model.restoreTargetLabel}</text>

          {model.steps.map((step, index) => {
            const column = index % timelineColumns
            const row = Math.floor(index / timelineColumns)
            const cardWidth = (timelineWidth - 48 - timelineGap * (timelineColumns - 1)) / timelineColumns
            const card = {
              x: timelineX + 24 + column * (cardWidth + timelineGap),
              y: timelineY + 104 + row * (timelineRowHeight + timelineGap),
              width: cardWidth,
              height: timelineRowHeight,
            }
            return <TimelineCard key={`${step.actionCode}-${step.index}`} card={card} step={step} isCurrent={index === currentFrameIndex - 1} />
          })}
        </svg>
      </ZoomableViewport>
    </div>
  )
}
