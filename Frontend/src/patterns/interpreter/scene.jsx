import { useEffect, useMemo, useState } from 'react'

import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
} from '../shared/sceneShared'

const facingGlyphs = {
  NORTH: 'N',
  EAST: 'E',
  SOUTH: 'S',
  WEST: 'W',
}

function normalizeStep(step, index) {
  return {
    index: safeNumber(step?.index, index),
    lineNumber: safeNumber(step?.lineNumber, 0),
    sourceLine: `${step?.sourceLine ?? ''}`.trim(),
    actionCode: `${step?.actionCode ?? 'STEP'}`.trim(),
    detail: `${step?.detail ?? ''}`.trim(),
    x: safeNumber(step?.x, 1),
    y: safeNumber(step?.y, 1),
    facing: `${step?.facing ?? 'EAST'}`.trim().toUpperCase(),
    targetReached: Boolean(step?.targetReached),
    targetHit: Boolean(step?.targetHit),
    objectiveCompleted: Boolean(step?.objectiveCompleted),
  }
}

function normalizeTreeNode(node, index) {
  return {
    id: `${node?.id ?? `node-${index}`}`.trim(),
    parentId: node?.parentId ? `${node.parentId}`.trim() : null,
    label: `${node?.label ?? ''}`.trim(),
    kind: `${node?.kind ?? 'COMMAND'}`.trim().toUpperCase(),
    depth: safeNumber(node?.depth, 0),
    lineNumber: safeNumber(node?.lineNumber, 0),
    executable: Boolean(node?.executable),
  }
}

function extractInterpreterModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.scriptLines) || !Array.isArray(output.steps)) {
    return null
  }

  return {
    mode: `${output.mode ?? 'WITH_INTERPRETER'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Interpreter'}`.trim(),
    missionName: `${output.missionName ?? 'Mission'}`.trim(),
    objectiveLabel: `${output.objectiveLabel ?? 'Objectif'}`.trim(),
    objectiveDescription: `${output.objectiveDescription ?? ''}`.trim(),
    targetLabel: `${output.targetLabel ?? 'Target'}`.trim(),
    boardWidth: safeNumber(output.boardWidth, 6),
    boardHeight: safeNumber(output.boardHeight, 6),
    startX: safeNumber(output.startX, 1),
    startY: safeNumber(output.startY, 2),
    startFacing: `${output.startFacing ?? 'EAST'}`.trim().toUpperCase(),
    targetX: safeNumber(output.targetX, 4),
    targetY: safeNumber(output.targetY, 3),
    requiresAttack: Boolean(output.requiresAttack),
    parserUsed: Boolean(output.parserUsed),
    resultLabel: `${output.resultLabel ?? ''}`.trim(),
    targetReached: Boolean(output.targetReached),
    targetHit: Boolean(output.targetHit),
    objectiveCompleted: Boolean(output.objectiveCompleted),
    finalX: safeNumber(output.finalX, 1),
    finalY: safeNumber(output.finalY, 2),
    finalFacing: `${output.finalFacing ?? 'EAST'}`.trim().toUpperCase(),
    skippedLineCount: safeNumber(output.skippedLineCount, 0),
    scriptLines: output.scriptLines.map((line) => `${line ?? ''}`),
    skippedLines: Array.isArray(output.skippedLines)
      ? output.skippedLines.map((line) => ({
          lineNumber: safeNumber(line?.lineNumber, 0),
          sourceLine: `${line?.sourceLine ?? ''}`.trim(),
          reason: `${line?.reason ?? ''}`.trim(),
        }))
      : [],
    steps: output.steps.map((step, index) => normalizeStep(step, index + 1)),
    treeNodes: Array.isArray(output.treeNodes)
      ? output.treeNodes.map((node, index) => normalizeTreeNode(node, index))
      : [],
  }
}

function buildFrames(model) {
  if (!model) {
    return []
  }

  return [
    {
      index: 0,
      lineNumber: 0,
      sourceLine: '',
      actionCode: 'START',
      detail: 'Position initiale avant execution du script.',
      x: model.startX,
      y: model.startY,
      facing: model.startFacing,
      targetReached: false,
      targetHit: false,
      objectiveCompleted: false,
    },
    ...model.steps,
  ]
}

function getTreeRowTone(node) {
  if (node.kind === 'PROGRAM') {
    return 'bg-stone-950 text-white border-stone-950'
  }

  if (node.kind === 'BLOCK') {
    return 'bg-emerald-50 text-emerald-900 border-emerald-200'
  }

  if (node.kind === 'UNSUPPORTED') {
    return 'bg-rose-50 text-rose-900 border-rose-200'
  }

  return 'bg-white text-stone-800 border-black/10'
}

export default function InterpreterScene({
  execution,
  isExpanded,
  panelClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractInterpreterModel(execution), [execution])
  const frames = useMemo(() => buildFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(900)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(Math.max(0, frames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }, [frames.length])

  useEffect(() => {
    if (!isPlaying || playMode !== 'AUTO' || currentFrameIndex >= frames.length - 1) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setCurrentFrameIndex((currentIndex) => {
        if (currentIndex >= frames.length - 1) {
          setIsPlaying(false)
          return currentIndex
        }

        const nextIndex = currentIndex + 1
        if (nextIndex >= frames.length - 1) {
          setIsPlaying(false)
        }

        return nextIndex
      })
    }, delayMs)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [currentFrameIndex, delayMs, frames.length, isPlaying, playMode])

  if (!model) {
    return <EmptyScenePlaceholder />
  }

  const currentFrame = frames[currentFrameIndex] ?? frames[frames.length - 1]
  const highlightedLineNumber = currentFrame?.lineNumber ?? 0
  const skippedLineNumbers = new Set(model.skippedLines.map((line) => line.lineNumber))

  const cellSize = isExpanded ? 66 : 56
  const boardPadding = 22
  const boardWidth = boardPadding * 2 + model.boardWidth * cellSize
  const boardHeight = boardPadding * 2 + model.boardHeight * cellSize
  const pathPoints = frames
    .slice(0, currentFrameIndex + 1)
    .map((frame) => {
      const cx = boardPadding + (frame.x - 0.5) * cellSize
      const cy = boardPadding + (frame.y - 0.5) * cellSize
      return `${cx},${cy}`
    })
    .join(' ')

  function handleReplay() {
    setCurrentFrameIndex(0)
    setIsPlaying(playMode === 'AUTO' && frames.length > 1)
  }

  function handleNextStep() {
    setCurrentFrameIndex((currentIndex) => Math.min(currentIndex + 1, frames.length - 1))
  }

  function handleReset() {
    setCurrentFrameIndex(0)
    setIsPlaying(false)
  }

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Code your logic
          </TitleTag>
        </div>
        <SceneMetaBadges execution={execution} onOpenModal={onOpenModal} sourceLabel={sourceLabel} />
      </div>

      <div className="mt-4 grid gap-4 rounded-[26px] border border-black/10 bg-white/72 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Mission</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">{model.missionName}</p>
            <p className="mt-1 text-sm leading-7 text-stone-600">{model.objectiveDescription}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${playMode === 'AUTO' ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-700'}`}
              type="button"
              onClick={() => {
                setPlayMode('AUTO')
                setIsPlaying(false)
              }}
            >
              Auto
            </button>
            <button
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${playMode === 'STEP' ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-700'}`}
              type="button"
              onClick={() => {
                setPlayMode('STEP')
                setIsPlaying(false)
              }}
            >
              Pas a pas
            </button>
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
              type="button"
              onClick={handleReplay}
            >
              Lancer la demo
            </button>
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20 disabled:opacity-40"
              disabled={playMode !== 'STEP' || currentFrameIndex >= frames.length - 1}
              type="button"
              onClick={handleNextStep}
            >
              Etape suivante
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[22px] border border-black/10 bg-[var(--panel)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Lecture</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              {model.modeLabel} · {model.parserUsed ? 'AST complet' : 'lecture lineaire'} · ligne courante {highlightedLineNumber || 'START'}
            </p>
          </div>
          <label className="rounded-[22px] border border-black/10 bg-[var(--panel)] px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Tempo auto</span>
            <div className="mt-2 flex items-center gap-4">
              <input
                className="flyweight-range"
                disabled={playMode !== 'AUTO'}
                max="1500"
                min="450"
                step="50"
                type="range"
                value={delayMs}
                onChange={(event) => setDelayMs(Number(event.target.value))}
              />
              <span className="w-20 text-right text-sm font-semibold text-stone-700">{delayMs} ms</span>
            </div>
          </label>
        </div>
      </div>

      <div className={`mt-5 grid gap-5 ${isExpanded ? 'xl:grid-cols-[320px_minmax(0,1fr)_320px]' : 'xl:grid-cols-[290px_minmax(0,1fr)_300px]'}`}>
        <section className="rounded-[28px] border border-black/10 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Script</p>
              <h4 className="mt-2 text-lg font-semibold text-stone-950">Mini langage</h4>
            </div>
            <span className="rounded-full bg-stone-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              {model.scriptLines.length} lignes
            </span>
          </div>

          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {model.scriptLines.map((line, index) => {
              const lineNumber = index + 1
              const isActive = lineNumber === highlightedLineNumber
              const isSkipped = skippedLineNumbers.has(lineNumber)

              return (
                <div
                  key={`${line}-${lineNumber}`}
                  className={`rounded-[18px] border px-3 py-2 font-mono text-sm transition ${
                    isActive
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : isSkipped
                        ? 'border-rose-200 bg-rose-50 text-rose-900'
                        : 'border-black/10 bg-[var(--panel)] text-stone-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive ? 'bg-white/14 text-white' : 'bg-white text-stone-500'}`}>
                      {lineNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="break-words leading-6">{line}</div>
                      {isSkipped ? (
                        <div className="mt-1 text-[11px] leading-5 opacity-80">
                          {model.skippedLines.find((entry) => entry.lineNumber === lineNumber)?.reason}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Arena</p>
              <h4 className="mt-2 text-lg font-semibold text-stone-950">Execution visuelle</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${model.objectiveCompleted ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                {model.resultLabel}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-700">
                {model.objectiveLabel}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(245,238,226,0.92))] p-4">
            <svg
              className="h-auto w-full"
              role="img"
              viewBox={`0 0 ${boardWidth} ${boardHeight}`}
            >
              <defs>
                <linearGradient id="interpreter-board" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffaf2" />
                  <stop offset="100%" stopColor="#efe2cf" />
                </linearGradient>
              </defs>

              <rect x="0" y="0" width={boardWidth} height={boardHeight} rx="28" fill="url(#interpreter-board)" />
              {Array.from({ length: model.boardHeight }).map((_, rowIndex) => (
                Array.from({ length: model.boardWidth }).map((__, columnIndex) => {
                  const x = boardPadding + columnIndex * cellSize
                  const y = boardPadding + rowIndex * cellSize
                  const isTarget = model.targetX === columnIndex + 1 && model.targetY === rowIndex + 1
                  const isStart = model.startX === columnIndex + 1 && model.startY === rowIndex + 1

                  return (
                    <g key={`${columnIndex}-${rowIndex}`}>
                      <rect
                        x={x}
                        y={y}
                        width={cellSize}
                        height={cellSize}
                        rx="18"
                        fill={isTarget ? 'rgba(194,87,55,0.12)' : 'rgba(255,255,255,0.82)'}
                        stroke={isTarget ? '#c25737' : 'rgba(36,31,24,0.12)'}
                      />
                      {isStart ? (
                        <text x={x + 10} y={y + 16} fontSize="10" fontWeight="700" letterSpacing="0.14em" fill="#6a5544">
                          START
                        </text>
                      ) : null}
                      {isTarget ? (
                        <text x={x + cellSize / 2} y={y + cellSize / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#c25737">
                          {model.targetLabel}
                        </text>
                      ) : null}
                    </g>
                  )
                })
              ))}

              {pathPoints ? (
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke="#246b5e"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.42"
                />
              ) : null}

              <circle
                cx={boardPadding + (model.targetX - 0.5) * cellSize}
                cy={boardPadding + (model.targetY - 0.5) * cellSize}
                r={cellSize * 0.24}
                fill={currentFrame?.targetHit ? '#246b5e' : '#c25737'}
                opacity={currentFrame?.targetHit ? '0.92' : '0.78'}
              />

              <g transform={`translate(${boardPadding + (currentFrame.x - 0.5) * cellSize} ${boardPadding + (currentFrame.y - 0.5) * cellSize})`}>
                <circle r={cellSize * 0.26} fill="#241f18" />
                <text y="5" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fffaf2">
                  {facingGlyphs[currentFrame.facing] ?? 'E'}
                </text>
              </g>
            </svg>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-black/10 bg-[var(--panel)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Ligne active</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{highlightedLineNumber || 'START'}</p>
              <p className="mt-1 text-sm leading-7 text-stone-600">{currentFrame.detail}</p>
            </div>
            <div className="rounded-[20px] border border-black/10 bg-[var(--panel)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Position</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">
                ({currentFrame.x}, {currentFrame.y})
              </p>
              <p className="mt-1 text-sm leading-7 text-stone-600">Orientation {currentFrame.facing}</p>
            </div>
            <div className="rounded-[20px] border border-black/10 bg-[var(--panel)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Cible</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">
                {currentFrame.objectiveCompleted ? 'Validee' : currentFrame.targetReached ? 'Atteinte' : 'Hors de portee'}
              </p>
              <p className="mt-1 text-sm leading-7 text-stone-600">
                {model.requiresAttack ? (currentFrame.targetHit ? 'Attaque confirmee.' : 'Attaque finale requise.') : 'Aucune attaque finale requise.'}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">AST</p>
              <h4 className="mt-2 text-lg font-semibold text-stone-950">Processus</h4>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${model.parserUsed ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
              {model.parserUsed ? 'Parser actif' : 'Parser absent'}
            </span>
          </div>

          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {model.treeNodes.map((node) => (
              <div
                key={node.id}
                className={`rounded-[18px] border px-3 py-2 ${getTreeRowTone(node)}`}
                style={{ marginLeft: `${node.depth * 14}px` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-75">
                      {node.kind}{node.lineNumber ? ` · L${node.lineNumber}` : ''}
                    </div>
                    <div className="mt-1 break-words text-sm font-semibold leading-6">{node.label}</div>
                  </div>
                  {node.lineNumber && node.lineNumber === highlightedLineNumber ? (
                    <span className="rounded-full bg-white/16 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                      NOW
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {model.skippedLines.length > 0 ? (
            <div className="mt-4 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">Lignes ignorees</p>
              <div className="mt-2 space-y-2">
                {model.skippedLines.map((line) => (
                  <div key={`${line.lineNumber}-${line.sourceLine}`} className="text-sm leading-7 text-rose-900">
                    <strong>L{line.lineNumber}</strong> · {line.reason}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-5 rounded-[28px] border border-black/10 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Timeline</p>
            <h4 className="mt-2 text-lg font-semibold text-stone-950">Execution ligne par ligne</h4>
          </div>
          <span className="rounded-full bg-stone-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            {model.steps.length} etapes
          </span>
        </div>

        <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto pr-1">
          {model.steps.map((step) => (
            <button
              key={`${step.index}-${step.lineNumber}`}
              className={`grid w-full gap-1 rounded-[20px] border px-4 py-3 text-left transition ${
                step.index === currentFrame.index
                  ? 'border-stone-950 bg-stone-950 text-white'
                  : 'border-black/10 bg-[var(--panel)] text-stone-800'
              }`}
              type="button"
              onClick={() => {
                setCurrentFrameIndex(step.index)
                setIsPlaying(false)
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">
                  Etape {step.index} · L{step.lineNumber} · {step.actionCode}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-75">
                  ({step.x},{step.y}) · {step.facing}
                </span>
              </div>
              <div className="text-sm font-semibold leading-6">{step.sourceLine}</div>
              <div className="text-sm leading-6 opacity-85">{step.detail}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
