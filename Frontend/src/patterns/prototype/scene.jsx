import { createElement, useEffect, useMemo, useState } from 'react'

import ZoomableViewport from '../../components/ZoomableViewport'
import {
  EmptyScenePlaceholder,
  SceneMetaBadges,
  safeNumber,
  wrapText,
} from '../shared/sceneShared'

function normalizeClone(clone, index = 0) {
  return {
    id: `${clone?.id ?? `clone-${index + 1}`}`.trim(),
    label: `${clone?.label ?? `Clone ${index + 1}`}`.trim(),
    serial: `${clone?.serial ?? 'CLN-000'}`.trim(),
    shellColorHex: `${clone?.shellColorHex ?? '#d7b28d'}`.trim(),
    shellLabel: `${clone?.shellLabel ?? 'coque'}`.trim(),
    attack: safeNumber(clone?.attack, 0),
    defense: safeNumber(clone?.defense, 0),
    speed: safeNumber(clone?.speed, 0),
    moduleLabel: `${clone?.moduleLabel ?? 'Module'}`.trim(),
    moduleColorHex: `${clone?.moduleColorHex ?? '#45b6c9'}`.trim(),
    moduleEffect: `${clone?.moduleEffect ?? ''}`.trim(),
    moduleSyncKey: `${clone?.moduleSyncKey ?? ''}`.trim(),
    moduleReferenceId: `${clone?.moduleReferenceId ?? 'REF-000'}`.trim(),
    mutatedDirectly: Boolean(clone?.mutatedDirectly),
    affectedByMutation: Boolean(clone?.affectedByMutation),
  }
}

function normalizeStep(step, index) {
  return {
    index: safeNumber(step?.index, index + 1),
    stepCode: `${step?.stepCode ?? `STEP_${index + 1}`}`.trim().toUpperCase(),
    title: `${step?.title ?? `Etape ${index + 1}`}`.trim(),
    detail: `${step?.detail ?? ''}`.trim(),
    affectedCloneIds: Array.isArray(step?.affectedCloneIds) ? step.affectedCloneIds.map((id) => `${id}`.trim()) : [],
    visibleCloneCount: safeNumber(step?.visibleCloneCount, 0),
  }
}

function extractPrototypeModel(execution) {
  const output = execution?.output

  if (!output || !Array.isArray(output.clones)) {
    return null
  }

  const prototypeSeed = normalizeClone(output.prototypeSeed ?? {}, 0)
  const initialClones = Array.isArray(output.initialClones)
    ? output.initialClones.map((clone, index) => normalizeClone(clone, index))
    : []
  const clones = output.clones.map((clone, index) => normalizeClone(clone, index))
  const steps = Array.isArray(output.steps)
    ? output.steps.map((step, index) => normalizeStep(step, index))
    : []

  return {
    mode: `${output.mode ?? 'WITH_PROTOTYPE'}`.trim().toUpperCase(),
    modeLabel: `${output.modeLabel ?? 'Avec Prototype'}`.trim(),
    copyDepthLabel: `${output.copyDepthLabel ?? 'Copie profonde'}`.trim(),
    blueprintName: `${output.blueprintName ?? 'Echo Forge'}`.trim(),
    archetype: `${output.archetype ?? 'SCOUT_DRONE'}`.trim().toUpperCase(),
    archetypeLabel: `${output.archetypeLabel ?? 'Prototype'}`.trim(),
    archetypeDescription: `${output.archetypeDescription ?? ''}`.trim(),
    cloneCount: safeNumber(output.cloneCount, clones.length),
    sharedNestedState: Boolean(output.sharedNestedState),
    mutationTargetId: `${output.mutationTargetId ?? clones[1]?.id ?? clones[0]?.id ?? 'clone-1'}`.trim(),
    mutationTargetLabel: `${output.mutationTargetLabel ?? 'Clone cible'}`.trim(),
    mutationPresetLabel: `${output.mutationPresetLabel ?? 'Mutation'}`.trim(),
    mutationDetail: `${output.mutationDetail ?? ''}`.trim(),
    propagationCount: safeNumber(output.propagationCount, clones.filter((clone) => clone.affectedByMutation).length),
    propagationLabel: `${output.propagationLabel ?? ''}`.trim(),
    prototypeSeed,
    initialClones,
    clones,
    steps,
  }
}

function buildPrototypeFrames(model) {
  if (!model) {
    return []
  }

  return [
    {
      id: 'seed',
      title: 'Prototype source',
      detail: 'Le gabarit initial est pret. Aucun clone n est encore materialise.',
      visibleClones: [],
      highlightedIds: [],
      showPropagation: false,
    },
    {
      id: 'clone',
      title: 'Duplication',
      detail: 'Les clones apparaissent a partir du meme blueprint avant toute mutation.',
      visibleClones: model.initialClones,
      highlightedIds: [],
      showPropagation: false,
    },
    {
      id: 'mutate',
      title: 'Mutation ciblee',
      detail: `${model.mutationTargetLabel} recoit ${model.mutationPresetLabel}.`,
      visibleClones: model.clones,
      highlightedIds: [model.mutationTargetId],
      showPropagation: false,
    },
    {
      id: 'observe',
      title: 'Observation',
      detail: model.propagationLabel,
      visibleClones: model.clones,
      highlightedIds: model.clones.filter((clone) => clone.affectedByMutation).map((clone) => clone.id),
      showPropagation: true,
    },
  ]
}

function CloneCard({ clone, x, y, width, height, isHighlighted, showPropagation }) {
  const statItems = [
    ['ATK', clone.attack],
    ['DEF', clone.defense],
    ['SPD', clone.speed],
  ]

  const borderColor = clone.mutatedDirectly
    ? '#c25737'
    : clone.affectedByMutation && showPropagation
      ? '#246b5e'
      : 'rgba(36,31,24,0.16)'
  const background = clone.mutatedDirectly
    ? 'rgba(255,245,240,0.96)'
    : clone.affectedByMutation && showPropagation
      ? 'rgba(240,250,247,0.96)'
      : 'rgba(255,250,242,0.96)'

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={height}
        rx="28"
        fill={background}
        stroke={borderColor}
        strokeWidth={isHighlighted ? '3.5' : '2'}
      />
      <rect x="0" y="0" width={width} height="18" rx="28" fill={clone.shellColorHex} opacity="0.92" />
      <text x="20" y="44" fontSize="16" fontWeight="700" fill="#241f18">
        {clone.label}
      </text>
      <text x="20" y="66" fontSize="11" fontWeight="600" letterSpacing="0.16em" fill="#6a5544">
        {clone.serial}
      </text>

      <rect x="20" y="82" width="122" height="46" rx="23" fill={clone.moduleColorHex} opacity="0.92" />
      <text x="81" y="101" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.14em" fill="#fffaf2">
        CLONED
      </text>
      <text x="81" y="117" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fffaf2">
        MODULE
      </text>
      <text x="20" y="152" fontSize="11" fontWeight="600" letterSpacing="0.12em" fill="#6a5544">
        {clone.shellLabel.toUpperCase()}
      </text>

      {clone.mutatedDirectly ? (
        <text x={width - 20} y="28" textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#c25737">
          TARGET
        </text>
      ) : clone.affectedByMutation && showPropagation ? (
        <text x={width - 20} y="28" textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#246b5e">
          SYNCED
        </text>
      ) : null}

      <foreignObject x="156" y="78" width={width - 176} height="74">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            height: '74px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '6px',
            fontFamily: 'inherit',
            fontSize: '13px',
            lineHeight: '1.4',
            color: '#3d2d20',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontWeight: 700, lineHeight: '1.25' }}>{clone.moduleLabel}</div>
          <div style={{ lineHeight: '1.35' }}>{clone.moduleEffect}</div>
        </div>
      </foreignObject>

      <g transform={`translate(20 ${height - 46})`}>
        {statItems.map(([label, value], index) => (
          <g key={label} transform={`translate(${index * 74} 0)`}>
            <rect width="60" height="28" rx="14" fill="rgba(36,31,24,0.06)" />
            <text x="10" y="18" fontSize="11" fontWeight="700" fill="#6a5544">
              {label}
            </text>
            <text x="50" y="18" textAnchor="end" fontSize="12" fontWeight="700" fill="#241f18">
              {value}
            </text>
          </g>
        ))}
      </g>

      <text x={width - 18} y={height - 16} textAnchor="end" fontSize="11" fontWeight="600" fill="#6a5544">
        {clone.moduleReferenceId}
      </text>
    </g>
  )
}

export default function PrototypeScene({
  execution,
  isExpanded,
  panelClassName,
  svgClassName,
  TitleTag,
  sourceLabel,
  onOpenModal,
}) {
  const model = useMemo(() => extractPrototypeModel(execution), [execution])
  const frames = useMemo(() => buildPrototypeFrames(model), [model])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(950)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(Math.max(0, frames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, frames.length - 1))
    setIsPlaying(false)
  }, [frames.length, model?.mode, model?.blueprintName, model?.cloneCount, model?.mutationPresetLabel])

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
  const prototypeLines = wrapText(model.archetypeDescription, 32)
  const mutationLines = wrapText(model.mutationDetail, 34)
  const impactClones = currentFrame.showPropagation
    ? model.clones.filter((clone) => clone.affectedByMutation)
    : model.clones.filter((clone) => currentFrame.highlightedIds.includes(clone.id))
  const viewBoxWidth = 1420
  const prototypeCard = { x: 40, y: 152, width: 292, height: 256 }
  const beamCard = { x: 372, y: 188, width: 250, height: 168 }
  const cloneCardWidth = 332
  const cloneCardHeight = 208
  const cloneGapX = 28
  const cloneGapY = 20
  const cloneRows = Math.max(1, Math.ceil(model.cloneCount / 2))
  const clonesAreaHeight = Math.max(286, cloneRows * cloneCardHeight + Math.max(0, cloneRows - 1) * cloneGapY)
  const clonesArea = { x: 660, y: 144, width: 720, height: clonesAreaHeight }
  const lowerPanelsY = clonesArea.y + clonesArea.height + 38
  const processPanel = { x: 40, y: lowerPanelsY, width: 394, height: 408 }
  const mutationPanel = { x: 454, y: lowerPanelsY, width: 382, height: 408 }
  const impactPanel = { x: 856, y: lowerPanelsY, width: 524, height: 408 }
  const viewBoxHeight = lowerPanelsY + impactPanel.height + 42
  const defsId = `prototype-scene-${isExpanded ? 'expanded' : 'compact'}`

  const visibleClones = currentFrame.visibleClones
  const clonePositions = Array.from({ length: model.cloneCount }, (_, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    return {
      x: clonesArea.x + column * (cloneCardWidth + cloneGapX),
      y: clonesArea.y + row * (cloneCardHeight + cloneGapY),
    }
  })

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

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Scene SVG</p>
          {createElement(TitleTag, { className: isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950' }, 'Clone Factory')}
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
                <option value={750}>750 ms</option>
                <option value={950}>950 ms</option>
                <option value={1200}>1200 ms</option>
              </select>
            </label>
          ) : null}

          <button
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            type="button"
            onClick={handleLaunchDemo}
          >
            Animer la scene
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={handlePrevious}
          >
            Etape precedente
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={handleNext}
          >
            Etape suivante
          </button>
          <button
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-black/20"
            type="button"
            onClick={handleReset}
          >
            Revenir au final
          </button>
        </div>
      </div>

      <ZoomableViewport enabled={false} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} role="img">
          <defs>
            <linearGradient id={`${defsId}-beam`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(69,182,201,0.12)" />
              <stop offset="50%" stopColor="rgba(194,87,55,0.22)" />
              <stop offset="100%" stopColor="rgba(36,107,94,0.14)" />
            </linearGradient>
            <radialGradient id={`${defsId}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(69,182,201,0.18)" />
              <stop offset="100%" stopColor="rgba(69,182,201,0)" />
            </radialGradient>
          </defs>

          <circle cx="240" cy="190" r="120" fill={`url(#${defsId}-glow)`} />
          <circle cx="1160" cy="220" r="140" fill="rgba(194,87,55,0.06)" />
          <rect x={beamCard.x - 34} y={beamCard.y + 18} width={288} height="104" rx="52" fill={`url(#${defsId}-beam)`} />

          <g transform={`translate(${prototypeCard.x} ${prototypeCard.y})`}>
            <rect width={prototypeCard.width} height={prototypeCard.height} rx="34" fill="rgba(255,249,239,0.98)" stroke="#7f5c3f" strokeWidth="2.5" />
            <rect width={prototypeCard.width} height="22" rx="34" fill={model.prototypeSeed.shellColorHex} opacity="0.95" />
            <text x="22" y="52" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
              PROTOTYPE SOURCE
            </text>
            <text x="22" y="84" fontSize="22" fontWeight="700" fill="#241f18">
              {model.blueprintName}
            </text>
            <text x="22" y="108" fontSize="13" fontWeight="600" fill="#6a5544">
              {model.archetypeLabel}
            </text>
            <foreignObject x="22" y="126" width={prototypeCard.width - 44} height="72">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  color: '#3d2d20',
                }}
              >
                {prototypeLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </foreignObject>

            <rect x="22" y="208" width="116" height="36" rx="18" fill={model.prototypeSeed.moduleColorHex} opacity="0.95" />
            <text x="80" y="230" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fffaf2">
              {model.copyDepthLabel}
            </text>
            <text x={prototypeCard.width - 22} y="230" textAnchor="end" fontSize="11" fontWeight="700" fill="#6a5544">
              {model.prototypeSeed.moduleReferenceId}
            </text>
          </g>

          <g transform={`translate(${beamCard.x} ${beamCard.y})`}>
            <rect width={beamCard.width} height={beamCard.height} rx="30" fill="rgba(255,250,242,0.92)" stroke="rgba(36,31,24,0.1)" />
            <text x="125" y="38" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
              CLONE BEAM
            </text>
            <text x="125" y="72" textAnchor="middle" fontSize="24" fontWeight="700" fill="#241f18">
              {model.copyDepthLabel}
            </text>
            <text x="125" y="102" textAnchor="middle" fontSize="13" fontWeight="600" fill="#6a5544">
              {model.sharedNestedState ? 'etat imbrique partage' : 'etat imbrique isole'}
            </text>
            <text x="125" y="132" textAnchor="middle" fontSize="13" fontWeight="600" fill="#c25737">
              {currentFrame.title}
            </text>
          </g>

          <path
            d={`M ${prototypeCard.x + prototypeCard.width + 18} ${prototypeCard.y + 126} C ${beamCard.x - 34} ${prototypeCard.y + 126}, ${beamCard.x - 26} ${beamCard.y + 72}, ${beamCard.x} ${beamCard.y + 72}`}
            fill="none"
            stroke="#7f5c3f"
            strokeWidth="3"
            strokeDasharray="10 8"
          />

          {clonePositions.map((position, index) => {
            const clone = visibleClones[index]
            const slotCenterY = position.y + cloneCardHeight / 2

            return (
              <g key={`slot-${index}`}>
                <path
                  d={`M ${beamCard.x + beamCard.width} ${beamCard.y + 84} C ${beamCard.x + beamCard.width + 40} ${beamCard.y + 84}, ${position.x - 26} ${slotCenterY}, ${position.x} ${slotCenterY}`}
                  fill="none"
                  stroke={clone ? '#246b5e' : 'rgba(36,31,24,0.12)'}
                  strokeWidth="2.5"
                  strokeDasharray={clone ? '0' : '8 8'}
                />

                {clone ? (
                  <CloneCard
                    clone={clone}
                    x={position.x}
                    y={position.y}
                    width={cloneCardWidth}
                    height={cloneCardHeight}
                    isHighlighted={currentFrame.highlightedIds.includes(clone.id)}
                    showPropagation={currentFrame.showPropagation}
                  />
                ) : (
                  <g transform={`translate(${position.x} ${position.y})`}>
                    <rect
                      width={cloneCardWidth}
                      height={cloneCardHeight}
                      rx="28"
                      fill="rgba(255,250,242,0.42)"
                      stroke="rgba(36,31,24,0.12)"
                      strokeDasharray="10 8"
                    />
                    <text x={cloneCardWidth / 2} y={cloneCardHeight / 2} textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#8a7768">
                      SLOT LIBRE
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          <g transform={`translate(${processPanel.x} ${processPanel.y})`}>
            <rect width={processPanel.width} height={processPanel.height} rx="32" fill="rgba(255,250,242,0.98)" stroke="rgba(36,31,24,0.1)" />
            <text x="24" y="40" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
              PROCESSUS
            </text>
            {frames.map((frame, index) => {
              const stepY = 60 + index * 68
              const active = index === currentFrameIndex
              return (
                <g key={frame.id} transform={`translate(18 ${stepY})`}>
                  <rect
                    width={processPanel.width - 36}
                    height="60"
                    rx="22"
                    fill={active ? '#241f18' : 'rgba(36,31,24,0.04)'}
                    stroke={active ? '#241f18' : 'rgba(36,31,24,0.08)'}
                  />
                  <text x="18" y="24" fontSize="12" fontWeight="700" letterSpacing="0.14em" fill={active ? '#fffaf2' : '#6a5544'}>
                    ETAPE {index + 1}
                  </text>
                  <text x="18" y="44" fontSize="15" fontWeight="700" fill={active ? '#fffaf2' : '#241f18'}>
                    {frame.title}
                  </text>
                </g>
              )
            })}
            <foreignObject x="22" y="338" width={processPanel.width - 44} height="56">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  color: '#3d2d20',
                  overflowY: 'auto',
                }}
              >
                {wrapText(currentFrame.detail, 46).map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </foreignObject>
          </g>

          <g transform={`translate(${mutationPanel.x} ${mutationPanel.y})`}>
            <rect width={mutationPanel.width} height={mutationPanel.height} rx="32" fill="rgba(255,250,242,0.98)" stroke="rgba(36,31,24,0.1)" />
            <text x="24" y="40" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
              MUTATION CIBLEE
            </text>
            <text x="24" y="78" fontSize="22" fontWeight="700" fill="#241f18">
              {model.mutationPresetLabel}
            </text>
            <text x="24" y="106" fontSize="13" fontWeight="600" fill="#6a5544">
              cible : {model.mutationTargetLabel}
            </text>
            <foreignObject x="24" y="126" width={mutationPanel.width - 48} height="88">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  color: '#3d2d20',
                  overflow: 'hidden',
                }}
              >
                {mutationLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </foreignObject>

            <rect x="24" y="236" width={mutationPanel.width - 48} height="56" rx="24" fill={model.sharedNestedState ? 'rgba(194,87,55,0.12)' : 'rgba(36,107,94,0.12)'} />
            <text x="44" y="260" fontSize="12" fontWeight="700" letterSpacing="0.16em" fill={model.sharedNestedState ? '#c25737' : '#246b5e'}>
              {model.sharedNestedState ? 'COPIE SUPERFICIELLE' : 'COPIE PROFONDE'}
            </text>
            <text x="44" y="280" fontSize="13" fontWeight="600" fill="#3d2d20">
              {model.sharedNestedState ? 'le coeur est partage' : 'le coeur est clone par clone'}
            </text>

            <text x="24" y="330" fontSize="12" fontWeight="700" letterSpacing="0.16em" fill="#6a5544">
              RESULTAT
            </text>
            <foreignObject x="24" y="342" width={mutationPanel.width - 48} height="48">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontFamily: 'inherit',
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: '1.3',
                  color: '#241f18',
                  overflow: 'hidden',
                }}
              >
                {wrapText(model.propagationLabel, 28).map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </foreignObject>
          </g>

          <g transform={`translate(${impactPanel.x} ${impactPanel.y})`}>
            <rect width={impactPanel.width} height={impactPanel.height} rx="32" fill="rgba(255,250,242,0.98)" stroke="rgba(36,31,24,0.1)" />
            <text x="24" y="40" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#6a5544">
              IMPACT DES REFERENCES
            </text>
            <text x="24" y="78" fontSize="24" fontWeight="700" fill="#241f18">
              {model.propagationCount} clone{model.propagationCount > 1 ? 's' : ''} touche{model.propagationCount > 1 ? 's' : ''}
            </text>
            <text x="24" y="106" fontSize="13" fontWeight="600" fill="#6a5544">
              {currentFrame.showPropagation ? 'Etat final observe' : 'Etat intermediaire'}
            </text>

            <foreignObject x="20" y="130" width={impactPanel.width - 40} height={impactPanel.height - 154}>
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  height: `${impactPanel.height - 154}px`,
                  overflowY: 'auto',
                  paddingRight: '6px',
                  fontFamily: 'inherit',
                }}
              >
                {impactClones.length > 0 ? (
                  impactClones.map((clone) => (
                    <div
                      key={clone.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minHeight: '56px',
                        borderRadius: '22px',
                        border: `2px solid ${clone.mutatedDirectly ? '#c25737' : '#246b5e'}`,
                        background: clone.mutatedDirectly ? 'rgba(255,245,240,0.96)' : 'rgba(240,250,247,0.96)',
                        padding: '10px 14px',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '999px',
                          background: clone.moduleColorHex,
                          flex: '0 0 auto',
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#241f18', lineHeight: '1.25' }}>
                          {clone.label}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6a5544', lineHeight: '1.35' }}>
                          {clone.moduleLabel} · {clone.moduleReferenceId}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.45',
                      color: '#3d2d20',
                    }}
                  >
                    Lance la lecture pour voir quels clones restent isoles et quels clones se synchronisent.
                  </div>
                )}
              </div>
            </foreignObject>
          </g>
        </svg>
      </ZoomableViewport>
    </div>
  )
}
