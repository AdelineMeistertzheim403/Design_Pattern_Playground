import { useEffect, useState } from 'react'

export function buildPlaybackFrames(steps, introLabel = 'Initial state') {
  const normalizedSteps = Array.isArray(steps) ? steps : []

  return [
    {
      id: 'frame-intro',
      index: 0,
      label: introLabel,
      step: null,
      visibleStepCount: 0,
      currentStepIndex: -1,
    },
    ...normalizedSteps.map((step, index) => ({
      id: `frame-${index + 1}`,
      index: index + 1,
      label: step.title ?? step.stageLabel ?? step.stageCode ?? `Step ${index + 1}`,
      step,
      visibleStepCount: index + 1,
      currentStepIndex: index,
    })),
  ]
}

export function useScenePlayback(frames, initialDelayMs = 900) {
  const safeFrames = frames?.length ? frames : buildPlaybackFrames([])
  const [playMode, setPlayMode] = useState('AUTO')
  const [delayMs, setDelayMs] = useState(initialDelayMs)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(Math.max(0, safeFrames.length - 1))
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setCurrentFrameIndex(Math.max(0, safeFrames.length - 1))
    setIsPlaying(false)
  }, [safeFrames])

  useEffect(() => {
    if (!isPlaying || playMode !== 'AUTO' || currentFrameIndex >= safeFrames.length - 1) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setCurrentFrameIndex((value) => Math.min(value + 1, safeFrames.length - 1))
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [currentFrameIndex, delayMs, isPlaying, playMode, safeFrames.length])

  useEffect(() => {
    if (currentFrameIndex >= safeFrames.length - 1) {
      setIsPlaying(false)
    }
  }, [currentFrameIndex, safeFrames.length])

  const currentFrame = safeFrames[currentFrameIndex] ?? safeFrames[0]

  function handleLaunchDemo() {
    if (playMode === 'AUTO') {
      setCurrentFrameIndex(0)
      setIsPlaying(true)
      return
    }

    setIsPlaying(false)
    setCurrentFrameIndex((value) => Math.min(value + 1, safeFrames.length - 1))
  }

  function handlePrevious() {
    setIsPlaying(false)
    setCurrentFrameIndex((value) => Math.max(value - 1, 0))
  }

  function handleNext() {
    setIsPlaying(false)
    setCurrentFrameIndex((value) => Math.min(value + 1, safeFrames.length - 1))
  }

  function handleReset() {
    setIsPlaying(false)
    setCurrentFrameIndex(Math.max(0, safeFrames.length - 1))
  }

  function handleGoToFrame(frameIndex) {
    setIsPlaying(false)
    const boundedIndex = Math.max(0, Math.min(frameIndex, safeFrames.length - 1))
    setCurrentFrameIndex(boundedIndex)
  }

  return {
    frames: safeFrames,
    currentFrame,
    currentFrameIndex,
    playMode,
    setPlayMode,
    delayMs,
    setDelayMs,
    isPlaying,
    handleLaunchDemo,
    handlePrevious,
    handleNext,
    handleReset,
    handleGoToFrame,
  }
}

export function ScenePlaybackControls({ playback, className = '' }) {
  if (!playback) {
    return null
  }

  return (
    <div className={`mt-4 flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <button
        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${playback.playMode === 'AUTO' ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-700'}`}
        type="button"
        onClick={() => playback.setPlayMode('AUTO')}
      >
        Auto
      </button>
      <button
        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${playback.playMode === 'STEP' ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-700'}`}
        type="button"
        onClick={() => playback.setPlayMode('STEP')}
      >
        Pas a pas
      </button>
      {playback.playMode === 'AUTO' ? (
        <label className="ml-1 flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Delai
          <input
            className="h-2 w-28 accent-stone-900"
            type="range"
            min="450"
            max="1600"
            step="50"
            value={playback.delayMs}
            onChange={(event) => playback.setDelayMs(Number(event.target.value))}
          />
          <span className="font-bold text-stone-700">{playback.delayMs} ms</span>
        </label>
      ) : null}
      <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5" type="button" onClick={playback.handleLaunchDemo}>
        {playback.playMode === 'AUTO' ? (playback.isPlaying ? 'Animation...' : 'Animer la scene') : 'Etape suivante'}
      </button>
      <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={playback.handlePrevious} disabled={playback.currentFrameIndex === 0}>
        Precedent
      </button>
      <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={playback.handleNext} disabled={playback.currentFrameIndex >= playback.frames.length - 1}>
        Suivant
      </button>
      <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700" type="button" onClick={playback.handleReset}>
        Reset
      </button>
      <p className="ml-auto text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
        {playback.currentFrame.currentStepIndex >= 0
          ? `Step ${playback.currentFrame.currentStepIndex + 1} / ${Math.max(0, playback.frames.length - 1)}`
          : 'Etat initial'}
      </p>
    </div>
  )
}
