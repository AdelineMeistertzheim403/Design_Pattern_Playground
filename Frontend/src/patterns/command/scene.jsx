import { useEffect, useMemo, useState } from 'react'

import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function normalizeCommandStackEntries(entries) {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries.map((entry, index) => ({
    id: `${entry?.actionCode ?? entry?.code ?? 'command'}-${index}`,
    actionCode: `${entry?.actionCode ?? entry?.code ?? 'COMMAND'}`.trim().toUpperCase(),
    actionLabel: `${entry?.actionLabel ?? entry?.label ?? entry?.actionCode ?? 'Commande'}`.trim(),
    commandClass: `${entry?.commandClass ?? entry?.className ?? 'BoardCommand'}`.trim(),
  }))
}

function extractCommandModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.history)) {
    return null
  }

  const history = output.history.map((step, index) => ({
    index: safeNumber(step.index, index + 1),
    actionCode: `${step.actionCode ?? 'ACTION'}`.trim().toUpperCase(),
    actionLabel: `${step.actionLabel ?? step.actionCode ?? 'Action'}`.trim(),
    operationType: `${step.operationType ?? 'EXECUTE'}`.trim().toUpperCase(),
    accepted: Boolean(step.accepted),
    detail: `${step.detail ?? ''}`.trim(),
    positionX: safeNumber(step.positionX, 0),
    positionY: safeNumber(step.positionY, 0),
    beaconCount: safeNumber(step.beaconCount, 0),
    undoDepth: safeNumber(step.undoDepth, 0),
    redoDepth: safeNumber(step.redoDepth, 0),
    undoStack: normalizeCommandStackEntries(step.undoStack),
    redoStack: normalizeCommandStackEntries(step.redoStack),
  }))

  return {
    mode: `${output.mode ?? 'WITH_COMMAND'}`.trim(),
    modeLabel: `${output.modeLabel ?? 'Avec Command'}`.trim(),
    useCommand: `${output.mode ?? 'WITH_COMMAND'}`.trim().toUpperCase() !== 'WITHOUT_COMMAND',
    boardName: `${output.boardName ?? 'Arena Grid'}`.trim(),
    actorName: `${output.actorName ?? 'Pixel Bot'}`.trim(),
    boardSize: Math.max(3, safeNumber(output.boardSize, 5)),
    positionX: safeNumber(output.positionX, history[history.length - 1]?.positionX ?? 0),
    positionY: safeNumber(output.positionY, history[history.length - 1]?.positionY ?? 0),
    beaconCount: safeNumber(output.beaconCount, history[history.length - 1]?.beaconCount ?? 0),
    actionCount: safeNumber(output.actionCount, history.length),
    executedCommands: safeNumber(output.executedCommands, history.filter((step) => step.accepted).length),
    blockedCommands: safeNumber(output.blockedCommands, history.filter((step) => !step.accepted).length),
    successfulControlCommands: safeNumber(
      output.successfulControlCommands,
      history.filter((step) => step.accepted && (step.actionCode === 'UNDO' || step.actionCode === 'REDO')).length,
    ),
    undoStack: normalizeCommandStackEntries(output.undoStack),
    redoStack: normalizeCommandStackEntries(output.redoStack),
    history,
  }
}

function buildCommandPlaybackFrames(model) {
  if (!model) {
    return []
  }

  return [
    {
      id: 'command-initial',
      stepIndex: 0,
      actionCode: 'INIT',
      actionLabel: 'Position initiale',
      operationType: 'INIT',
      accepted: true,
      detail: model.useCommand
        ? 'Le receiver attend la premiere commande.'
        : 'Le receiver attend la premiere action directe.',
      positionX: 0,
      positionY: 0,
      beaconCount: 0,
      undoDepth: 0,
      redoDepth: 0,
      undoStack: [],
      redoStack: [],
    },
    ...model.history.map((step) => ({
      ...step,
      id: `command-step-${step.index}`,
      stepIndex: step.index,
    })),
  ]
}

export default function CommandScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractCommandModel(execution), [execution])
  const playbackFrames = useMemo(() => buildCommandPlaybackFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(
    Math.max(0, playbackFrames.length - 1),
  )
  const [isPlaying, setIsPlaying] = useState(false)

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, playbackFrames.length - 1))
    setIsPlaying(false)
  }, [playbackFrames.length, model.mode, model.boardName, model.actorName])

  useEffect(() => {
    if (playMode === 'STEP') {
      setIsPlaying(false)
    }
  }, [playMode])

  useEffect(() => {
    if (!isPlaying || playMode !== 'AUTO' || currentFrameIndex >= playbackFrames.length - 1) {
      if (currentFrameIndex >= playbackFrames.length - 1) {
        setIsPlaying(false)
      }
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentFrameIndex((index) => Math.min(index + 1, playbackFrames.length - 1))
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [currentFrameIndex, delayMs, isPlaying, playMode, playbackFrames.length])

  const currentFrame = playbackFrames[currentFrameIndex] ?? playbackFrames[playbackFrames.length - 1]
  const visibleFrames = playbackFrames.slice(0, currentFrameIndex + 1)
  const visibleHistory = visibleFrames.slice(1)
  const acceptedVisibleCount = visibleHistory.filter((step) => step.accepted && !['UNDO', 'REDO'].includes(step.actionCode)).length
  const controlVisibleCount = visibleHistory.filter((step) => step.accepted && ['UNDO', 'REDO'].includes(step.actionCode)).length
  const blockedVisibleCount = visibleHistory.filter((step) => !step.accepted).length
  const visibleUndoStack = currentFrame?.undoStack ?? []
  const visibleRedoStack = currentFrame?.redoStack ?? []
  const viewBoxWidth = 1380
  const leftPanel = { x: 36, y: 172, width: 282, height: 660 }
  const boardX = 342
  const boardY = 172
  const boardSizePx = isExpanded ? 720 : 660
  const cellSize = boardSizePx / model.boardSize
  const undoPanel = { x: 1044, y: 172, width: 300, height: 320 }
  const redoPanel = { x: 1044, y: 512, width: 300, height: 320 }
  const timelineX = 36
  const timelineY = boardY + boardSizePx + 32
  const timelineWidth = 1308
  const timelineColumns = isExpanded ? 3 : 2
  const timelineRows = Math.max(1, Math.ceil(model.history.length / timelineColumns))
  const timelineRowHeight = 148
  const timelineGap = 12
  const timelineHeight = 124 + timelineRows * timelineRowHeight + Math.max(0, timelineRows - 1) * timelineGap
  const viewBoxHeight = timelineY + timelineHeight + 36
  const defsId = `command-scene-${isExpanded ? 'expanded' : 'compact'}`
  const descriptionLines = wrapText(
    model.useCommand
      ? 'Chaque action voyage comme un objet. L invoker peut donc empiler, annuler et rejouer.'
      : 'Le controleur appelle directement le receiver. Les mutations partent, mais l historique est perdu.',
    32,
  )
  const actorBadge = model.actorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    || 'BOT'
  const acceptedPathPoints = [
    { x: 0, y: 0, accepted: true, index: 0 },
    ...visibleHistory
      .filter((step) => step.accepted)
      .map((step) => ({
        x: step.positionX,
        y: step.positionY,
        accepted: true,
        index: step.index,
        operationType: step.operationType,
      })),
  ]
  const visitedCells = [...new Set(acceptedPathPoints.map((point) => `${point.x},${point.y}`))]
    .map((cell) => {
      const [x, y] = cell.split(',')
      return {
        x: safeNumber(x, 0),
        y: safeNumber(y, 0),
      }
    })
  const pointToBoard = (point) => ({
    x: boardX + point.x * cellSize + cellSize / 2,
    y: boardY + (model.boardSize - 1 - point.y) * cellSize + cellSize / 2,
  })
  const travelPath = acceptedPathPoints
    .map((point, index) => {
      const position = pointToBoard(point)
      return `${index === 0 ? 'M' : 'L'} ${position.x} ${position.y}`
    })
    .join(' ')

  function handleLaunchDemo() {
    if (playbackFrames.length === 0) {
      return
    }

    setCurrentFrameIndex(0)
    setIsPlaying(playMode === 'AUTO')
  }

  function handleResetToFinalState() {
    setCurrentFrameIndex(Math.max(0, playbackFrames.length - 1))
    setIsPlaying(false)
  }

  function handlePreviousStep() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.max(0, index - 1))
  }

  function handleNextStep() {
    setIsPlaying(false)
    setCurrentFrameIndex((index) => Math.min(index + 1, playbackFrames.length - 1))
  }

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Undo / Redo Simulator
          </TitleTag>
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
            Pas a pas
          </button>
          {playMode === 'AUTO' ? (
            <select
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 outline-none focus:border-black/20"
              value={delayMs}
              onChange={(event) => setDelayMs(Number(event.target.value))}
            >
              <option value={600}>0.6 s / action</option>
              <option value={900}>0.9 s / action</option>
              <option value={1400}>1.4 s / action</option>
            </select>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5" type="button" onClick={handleLaunchDemo}>
            Lancer la demo
          </button>
          {playMode === 'AUTO' ? (
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40"
              disabled={currentFrameIndex >= playbackFrames.length - 1 && !isPlaying}
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
            >
              {isPlaying ? 'Pause' : 'Reprendre'}
            </button>
          ) : null}
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40" disabled={currentFrameIndex === 0} type="button" onClick={handlePreviousStep}>
            Etape precedente
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40" disabled={currentFrameIndex >= playbackFrames.length - 1} type="button" onClick={handleNextStep}>
            Etape suivante
          </button>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20" type="button" onClick={handleResetToFinalState}>
            Retour a la fin
          </button>
        </div>
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-header`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,249,239,0.98)" />
              <stop offset="100%" stopColor="rgba(211,236,230,0.84)" />
            </linearGradient>
            <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#246b5e" />
            </marker>
          </defs>

          <rect x="36" y="44" width="1308" height="94" rx="32" fill={`url(#${defsId}-header)`} stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x="64" y="80" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useCommand ? 'COMMAND PLAYGROUND' : 'DIRECT MUTATION MODE'}
          </text>
          <text x="64" y="112" fontSize="28" fontWeight="700" fill="#241f18">
            {model.actorName} · {model.boardName}
          </text>
          <text x="430" y="86" fontSize="13" fontWeight="600" fill="#5f5548">
            Position courante : ({currentFrame.positionX}, {currentFrame.positionY})
          </text>
          <text x="430" y="112" fontSize="13" fontWeight="600" fill="#5f5548">
            Balises actives : {currentFrame.beaconCount}
          </text>
          <text x="1280" y="82" textAnchor="end" fontSize="24" fontWeight="700" fill="#241f18">
            {currentFrame.stepIndex}/{model.actionCount} etape(s)
          </text>
          <text x="1280" y="108" textAnchor="end" fontSize="13" fill="#5f5548">
            {playMode === 'AUTO'
              ? `T+${Math.max(0, currentFrameIndex * delayMs) / 1000}s`
              : currentFrameIndex === 0
                ? 'Sequence en attente'
                : `Action visible : ${currentFrame.actionCode}`}
          </text>

          <rect x={leftPanel.x} y={leftPanel.y} width={leftPanel.width} height={leftPanel.height} rx="30" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" className="scene-node-shadow" />
          <text x={leftPanel.x + 22} y={leftPanel.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.useCommand ? 'AVEC COMMAND' : 'SANS COMMAND'}
          </text>
          <text x={leftPanel.x + 22} y={leftPanel.y + 64} fontSize="24" fontWeight="700" fill="#241f18">
            {model.useCommand ? 'Historique reversible' : 'Actions jetables'}
          </text>
          {descriptionLines.map((line, index) => (
            <text key={`command-description-${index}`} x={leftPanel.x + 22} y={leftPanel.y + 96 + index * 16} fontSize="13" fill="#5f5548">
              {line}
            </text>
          ))}

          {[
            { label: 'Executions valides', value: acceptedVisibleCount, tone: '#153f38', background: 'rgba(211,236,230,0.94)' },
            { label: 'Undo / Redo utiles', value: controlVisibleCount, tone: '#5f2d20', background: 'rgba(245,227,210,0.94)' },
            { label: 'Blocages', value: blockedVisibleCount, tone: '#7a4634', background: 'rgba(255,244,220,0.96)' },
            { label: 'Balises actives', value: currentFrame.beaconCount, tone: '#5f2d20', background: 'rgba(255,249,239,0.98)' },
          ].map((metric, index) => {
            const y = leftPanel.y + 176 + index * 108
            return (
              <g key={metric.label}>
                <rect x={leftPanel.x + 18} y={y} width={leftPanel.width - 36} height="92" rx="24" fill={metric.background} stroke="rgba(36,31,24,0.08)" />
                <text x={leftPanel.x + 36} y={y + 24} fontSize="10" fontWeight="700" letterSpacing="0.18em" fill="#7a6c5d">
                  {metric.label}
                </text>
                <text x={leftPanel.x + 36} y={y + 58} fontSize="28" fontWeight="700" fill={metric.tone}>
                  {metric.value}
                </text>
                {metric.label === 'Balises actives'
                  ? Array.from({ length: Math.min(currentFrame.beaconCount, 4) }, (_, iconIndex) => (
                    <g key={`beacon-card-${iconIndex}`} transform={`translate(${leftPanel.x + 162 + iconIndex * 24} ${y + 52}) rotate(45)`}>
                      <rect x="-7" y="-7" width="14" height="14" rx="4" fill="#c25737" />
                    </g>
                  ))
                  : null}
                {metric.label === 'Balises actives' && currentFrame.beaconCount > 4 ? (
                  <text x={leftPanel.x + leftPanel.width - 54} y={y + 58} fontSize="13" fontWeight="700" fill="#5f2d20">
                    +{currentFrame.beaconCount - 4}
                  </text>
                ) : null}
              </g>
            )
          })}

          <rect x={boardX} y={boardY} width={boardSizePx} height={boardSizePx} rx="34" fill="rgba(255,250,242,0.98)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" className="scene-node-shadow" />
          <text x={boardX + 24} y={boardY + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            ARENA BOARD
          </text>
          <text x={boardX + boardSizePx - 24} y={boardY + 30} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            {model.boardSize} x {model.boardSize}
          </text>

          {Array.from({ length: model.boardSize }, (_, rowIndex) => (
            Array.from({ length: model.boardSize }, (_, columnIndex) => {
              const logicalY = model.boardSize - 1 - rowIndex
              const isVisited = visitedCells.some((cell) => cell.x === columnIndex && cell.y === logicalY)
              return (
                <rect
                  key={`board-cell-${columnIndex}-${logicalY}`}
                  x={boardX + columnIndex * cellSize + 10}
                  y={boardY + rowIndex * cellSize + 10}
                  width={cellSize - 20}
                  height={cellSize - 20}
                  rx="18"
                  fill={isVisited ? 'rgba(211,236,230,0.72)' : 'rgba(255,249,239,0.92)'}
                  stroke={isVisited ? 'rgba(36,107,94,0.18)' : 'rgba(36,31,24,0.08)'}
                />
              )
            })
          ))}

          {travelPath ? (
            <>
              <path
                d={travelPath}
                fill="none"
                stroke={model.useCommand ? '#246b5e' : '#c25737'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={model.useCommand ? '0' : '14 10'}
                opacity="0.84"
              />
              {acceptedPathPoints.slice(1).map((point) => {
                const position = pointToBoard(point)
                return (
                  <g key={`travel-point-${point.index}`}>
                    <circle cx={position.x} cy={position.y} r="13" fill="#fff8ee" stroke="#7f5c3f" strokeWidth="2" />
                    <text x={position.x} y={position.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5f2d20">
                      {point.index}
                    </text>
                  </g>
                )
              })}
            </>
          ) : null}

          <g transform={`translate(${boardX + currentFrame.positionX * cellSize + cellSize / 2} ${boardY + (model.boardSize - 1 - currentFrame.positionY) * cellSize + cellSize / 2})`}>
            <circle r="36" fill={model.useCommand ? '#241f18' : '#5f2d20'} className={isPlaying ? 'state-active-halo' : ''} />
            <circle r="20" fill="rgba(255,248,238,0.14)" />
            <text textAnchor="middle" y="4" fontSize="14" fontWeight="700" fill="#fff8ee">
              {actorBadge}
            </text>
          </g>

          {[{ title: 'UNDO STACK', entries: visibleUndoStack, panel: undoPanel }, { title: 'REDO STACK', entries: visibleRedoStack, panel: redoPanel }].map(({ title, entries, panel }) => (
            <g key={title}>
              <rect x={panel.x} y={panel.y} width={panel.width} height={panel.height} rx="30" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" className="scene-node-shadow" />
              <text x={panel.x + 22} y={panel.y + 30} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
                {title}
              </text>
              <text x={panel.x + panel.width - 22} y={panel.y + 30} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
                {entries.length} element(s)
              </text>
              <foreignObject x={panel.x + 16} y={panel.y + 50} width={panel.width - 32} height={panel.height - 70}>
                <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
                  {entries.length > 0 ? (
                    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-1">
                      {entries.map((entry, index) => (
                        <div key={entry.id} className="rounded-[18px] border border-black/8 bg-white/90 px-3 py-2 shadow-[0_12px_24px_rgba(48,39,24,0.08)]">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                            {index === 0 ? 'top of stack' : `slot ${index + 1}`}
                          </p>
                          <p className="mt-1 text-[13px] font-semibold text-stone-900">{entry.actionLabel}</p>
                          <p className="mt-1 text-[11px] text-stone-600">{entry.commandClass}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[22px] border border-dashed border-black/10 bg-[rgba(255,249,239,0.74)] px-4 text-center text-[13px] leading-6 text-stone-500">
                      {model.useCommand
                        ? 'Pile vide pour le moment.'
                        : 'Aucune pile disponible sans pattern.'}
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          ))}

          <path d={`M ${leftPanel.x + leftPanel.width} ${leftPanel.y + 270} C ${leftPanel.x + leftPanel.width + 84} ${leftPanel.y + 270} ${boardX - 80} ${boardY + 120} ${boardX} ${boardY + 120}`} fill="none" stroke="#7a5a3f" strokeWidth="3" strokeDasharray="12 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
          <path d={`M ${boardX + boardSizePx} ${boardY + 112} C ${boardX + boardSizePx + 54} ${boardY + 112} ${undoPanel.x - 40} ${undoPanel.y + 68} ${undoPanel.x} ${undoPanel.y + 68}`} fill="none" stroke="#246b5e" strokeWidth="2.8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />
          <path d={`M ${boardX + boardSizePx} ${boardY + 432} C ${boardX + boardSizePx + 54} ${boardY + 432} ${redoPanel.x - 40} ${redoPanel.y + 68} ${redoPanel.x} ${redoPanel.y + 68}`} fill="none" stroke="#c25737" strokeWidth="2.8" strokeDasharray="12 8" markerEnd={`url(#${defsId}-arrow)`} className="scene-flow-line" />

          <rect x={timelineX} y={timelineY} width={timelineWidth} height={timelineHeight} rx="34" fill="rgba(255,250,242,0.96)" stroke="rgba(36,31,24,0.1)" strokeWidth="2" />
          <text x={timelineX + 24} y={timelineY + 32} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#5f5548">
            TIMELINE
          </text>
          <text x={timelineX + 24} y={timelineY + 62} fontSize="24" fontWeight="700" fill="#241f18">
            Historique d execution
          </text>
          <text x={timelineX + 24} y={timelineY + 88} fontSize="13" fill="#5f5548">
            chaque carte capture l etat de la grille juste apres l action, l annulation ou le blocage
          </text>

          <foreignObject x={timelineX + 16} y={timelineY + 106} width={timelineWidth - 32} height={timelineHeight - 126}>
            <div className="h-full" xmlns="http://www.w3.org/1999/xhtml">
              <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: `repeat(${timelineColumns}, minmax(0, 1fr))` }}>
                {model.history.map((step) => {
                  const cardClass = step.operationType === 'BLOCKED'
                    ? 'border-amber-300 bg-amber-50/96'
                    : step.operationType === 'UNDO'
                      ? 'border-orange-200 bg-orange-50/95'
                      : step.operationType === 'REDO'
                        ? 'border-blue-200 bg-blue-50/95'
                        : step.operationType === 'DIRECT'
                          ? 'border-red-200 bg-red-50/92'
                          : 'border-emerald-200 bg-emerald-50/90'

                  return (
                    <div
                      key={`${step.index}-${step.actionCode}`}
                      className={`min-h-[134px] rounded-[18px] border px-3 py-3 shadow-[0_12px_24px_rgba(48,39,24,0.08)] ${
                        step.index > currentFrame.stepIndex ? 'opacity-45' : ''
                      } ${
                        step.index === currentFrame.stepIndex ? 'ring-2 ring-stone-950/15' : ''
                      } ${cardClass}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                          Step {step.index}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-700">
                          {step.index === currentFrame.stepIndex ? 'NOW' : step.operationType}
                        </p>
                      </div>
                      <p className="mt-2 text-[13px] font-semibold text-stone-900">{step.actionCode}</p>
                      <p className="mt-1 text-[12px] text-stone-700">
                        pos ({step.positionX}, {step.positionY}) · balises {step.beaconCount}
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-600">{step.detail}</p>
                      <p className="mt-3 text-[11px] font-medium text-stone-500">
                        undo {step.undoDepth} · redo {step.redoDepth}
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
