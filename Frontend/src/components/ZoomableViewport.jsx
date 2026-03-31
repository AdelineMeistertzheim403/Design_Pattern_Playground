import { useEffect, useRef, useState } from 'react'

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

export default function ZoomableViewport({
  children,
  enabled = false,
  maxScale = 2.8,
  minScale = 1,
  viewportClassName = '',
}) {
  const containerRef = useRef(null)
  const dragStateRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setScale(1)
      setOffset({ x: 0, y: 0 })
      setIsDragging(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !isDragging) {
      return undefined
    }

    const handlePointerMove = (event) => {
      if (!dragStateRef.current) {
        return
      }

      const deltaX = event.clientX - dragStateRef.current.x
      const deltaY = event.clientY - dragStateRef.current.y
      dragStateRef.current = { x: event.clientX, y: event.clientY }

      setOffset((currentOffset) => ({
        x: currentOffset.x + deltaX,
        y: currentOffset.y + deltaY,
      }))
    }

    const handlePointerUp = () => {
      dragStateRef.current = null
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
    }
  }, [enabled, isDragging])

  function resetView() {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  function zoomBy(nextScale) {
    setScale(clamp(nextScale, minScale, maxScale))
  }

  function handleWheel(event) {
    if (!enabled) {
      return
    }

    event.preventDefault()

    const rect = containerRef.current?.getBoundingClientRect()
    const zoomStep = event.deltaY > 0 ? -0.14 : 0.14
    const nextScale = clamp(scale + zoomStep, minScale, maxScale)

    if (!rect || nextScale === scale) {
      setScale(nextScale)
      return
    }

    const pointerX = event.clientX - rect.left - rect.width / 2
    const pointerY = event.clientY - rect.top - rect.height / 2
    const scaleRatio = nextScale / scale

    setOffset((currentOffset) => ({
      x: currentOffset.x - pointerX * (scaleRatio - 1),
      y: currentOffset.y - pointerY * (scaleRatio - 1),
    }))
    setScale(nextScale)
  }

  function handleMouseDown(event) {
    if (!enabled || event.button !== 0) {
      return
    }

    event.preventDefault()
    dragStateRef.current = { x: event.clientX, y: event.clientY }
    setIsDragging(true)
  }

  if (!enabled) {
    return <div className={viewportClassName}>{children}</div>
  }

  return (
    <div className={viewportClassName}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-black/10 bg-white/72 px-4 py-3 text-xs text-stone-600">
        <p className="font-medium leading-6">
          Roulette pour zoomer, glisser pour deplacer la vue.
        </p>
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-base font-semibold text-stone-900 transition hover:-translate-y-0.5 hover:border-black/20"
            type="button"
            onClick={() => zoomBy(scale - 0.2)}
          >
            -
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-base font-semibold text-stone-900 transition hover:-translate-y-0.5 hover:border-black/20"
            type="button"
            onClick={resetView}
          >
            1x
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-base font-semibold text-stone-900 transition hover:-translate-y-0.5 hover:border-black/20"
            type="button"
            onClick={() => zoomBy(scale + 0.2)}
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-[28px] border border-black/10 bg-white/58 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <div
          className="flex min-h-[60vh] items-center justify-center transition-transform duration-150 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transitionDuration: isDragging ? '0ms' : '150ms',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
