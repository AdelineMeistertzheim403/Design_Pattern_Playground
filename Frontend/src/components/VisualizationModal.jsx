import { useEffect } from 'react'

export default function VisualizationModal({
  children,
  title,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,20,14,0.72)] px-4 py-6 backdrop-blur-md sm:px-6"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-7xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Fermer la fenetre"
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/92 text-lg font-semibold text-stone-800 shadow-[0_12px_30px_rgba(24,20,14,0.16)] transition hover:-translate-y-0.5 hover:border-black/20"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="max-h-[88vh] overflow-auto rounded-[34px]">
          {children}
        </div>
      </div>
    </div>
  )
}
