import { useState } from 'react'

export default function CollapsiblePanel({
  eyebrow,
  title,
  description,
  defaultExpanded = true,
  children,
  className = '',
  bodyClassName = '',
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <section
      className={`reveal rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{eyebrow}</p>
          <h2 className="mt-3 text-3xl text-stone-950">{title}</h2>
          {description ? (
            <p className="mt-4 text-sm leading-7 text-stone-700">{description}</p>
          ) : null}
        </div>

        <button
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>{isExpanded ? 'Replier' : 'Deplier'}</span>
          <span className="text-base leading-none">{isExpanded ? '−' : '+'}</span>
        </button>
      </div>

      {isExpanded ? <div className={`mt-6 ${bodyClassName}`}>{children}</div> : null}
    </section>
  )
}
