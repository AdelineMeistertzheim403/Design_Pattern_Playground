export default function ProgressCard({
  label,
  value,
  detail,
  tone = 'default',
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50'
    : tone === 'warning'
      ? 'border-amber-200 bg-amber-50'
      : 'border-black/10 bg-white/84'

  return (
    <article className={`rounded-[24px] border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className="mt-3 text-3xl text-stone-950">{value}</p>
      <p className="mt-3 text-sm leading-7 text-stone-700">{detail}</p>
    </article>
  )
}
