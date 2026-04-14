import {
  ScenePlaybackControls,
} from '../../patterns/shared/scenePlayback'
import useMissionExecutionScene from './useMissionExecutionScene'

function MissionStageCard({ step, x, y, width, height, active, visible, tone }) {
  return (
    <g opacity={visible ? 1 : 0.25}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="26"
        fill={step.status === 'validated' ? tone.soft : '#fff1df'}
        stroke={active ? tone.accent : '#d6d3d1'}
        strokeWidth={active ? 3 : 1.5}
      />
      <text x={x + 22} y={y + 28} fontSize="11" fontWeight="700" letterSpacing="0.18em" fill="#78716c">
        {step.stageLabel.toUpperCase()}
      </text>
      <text x={x + 22} y={y + 58} fontSize="20" fontWeight="700" fill="#1c1917">
        {step.title}
      </text>
      <foreignObject x={x + 18} y={y + 74} width={width - 36} height={height - 92}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '13px', lineHeight: 1.5, color: '#44403c' }}>
          {step.summary}
        </div>
      </foreignObject>
    </g>
  )
}

export default function MissionExecutionScene({
  mission,
  result,
  patternsByCode,
  activePatternCode,
  onSelectPattern,
}) {
  const {
    activeStage,
    layout,
    playback,
    stageSteps,
    tone,
    visibleStepCount,
  } = useMissionExecutionScene({
    activePatternCode,
    mission,
    patternsByCode,
    result,
  })

  const {
    stageHeight,
    stageStartX,
    stageWidth,
    stageY,
    stageLineY,
    viewBoxWidth,
  } = layout

  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Mission Scene</p>
          <h3 className="mt-2 text-2xl text-stone-950">Simulation SVG dediee au scenario</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-700">
            Cette scene est propre au mode mission. Elle orchestre les phases du scenario et ne reprend pas la scene SVG d une page pattern.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-black/10 bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-stone-700"
            type="button"
            onClick={() => onSelectPattern(result.focusPattern)}
          >
            Focus mission
          </button>
          {stageSteps.map((step) => (
            <button
              key={step.patternCode}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activePatternCode === step.patternCode ? 'border-stone-950 bg-stone-950 text-white' : 'border-black/10 bg-[var(--panel)] text-stone-700'}`}
              type="button"
              onClick={() => onSelectPattern(step.patternCode)}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      <ScenePlaybackControls playback={playback} className="mt-5" />

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,#fffdf8_0%,#f6f0e6_100%)]">
        <svg className="block h-auto min-w-full" viewBox={`0 0 ${viewBoxWidth} 620`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="missionSceneBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffcf7" />
              <stop offset="100%" stopColor="#efe4d5" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={viewBoxWidth} height="620" fill="url(#missionSceneBg)" />
          <circle cx={viewBoxWidth - 140} cy="92" r="92" fill={tone.soft} opacity="0.9" />
          <circle cx="124" cy="540" r="86" fill="#f4d7ca" opacity="0.75" />

          <rect x="40" y="38" width="320" height="118" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
          <text x="62" y="72" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION</text>
          <text x="62" y="104" fontSize="28" fontWeight="700" fill="#1c1917">{mission.title}</text>
          <text x="62" y="132" fontSize="14" fill="#57534e">Score {result.score}/100 · {result.success ? 'Solution validee' : 'Solution fragile'}</text>

          <rect x={viewBoxWidth - 360} y="38" width="320" height="118" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
          <text x={viewBoxWidth - 338} y="72" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION PULSE</text>
          <text x={viewBoxWidth - 338} y="104" fontSize="24" fontWeight="700" fill={result.success ? tone.accent : tone.danger}>
            {activeStage?.title ?? 'Awaiting run'}
          </text>
          <text x={viewBoxWidth - 338} y="132" fontSize="14" fill="#57534e">
            {playback.currentFrame.currentStepIndex >= 0
              ? `Phase ${playback.currentFrame.currentStepIndex + 1} / ${stageSteps.length}`
              : 'Etat initial'}
          </text>

          <line
            x1={stageStartX + 6}
            y1={stageLineY}
            x2={stageStartX + stageSteps.length * stageWidth + Math.max(0, stageSteps.length - 1) * stageGap - 6}
            y2={stageLineY}
            stroke="#d6d3d1"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {stageSteps.map((step, index) => {
            const x = stageStartX + index * (stageWidth + stageGap)
            const isVisible = index < visibleStepCount
            const isActive = activeStage?.patternCode === step.patternCode
            const markerX = x + stageWidth / 2

            return (
              <g key={step.id}>
                <circle cx={markerX} cy={stageLineY} r="18" fill={isVisible ? tone.accent : '#d6d3d1'} />
                <text x={markerX} y={stageLineY + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
                  {index + 1}
                </text>
                <MissionStageCard
                  active={isActive}
                  height={stageHeight}
                  step={step}
                  tone={tone}
                  visible={isVisible}
                  width={stageWidth}
                  x={x}
                  y={stageY}
                />
              </g>
            )
          })}

          <rect x="40" y="432" width="460" height="148" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
          <text x="62" y="462" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">MISSION IMPACT</text>
          <text x="62" y="494" fontSize="22" fontWeight="700" fill="#1c1917">{activeStage?.title ?? 'Aucune phase active'}</text>
          <foreignObject x="58" y="508" width="428" height="58">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '13px', lineHeight: 1.5, color: '#44403c' }}>
              {activeStage?.summary ?? 'Lance la mission pour activer une phase de simulation.'}
            </div>
          </foreignObject>

          <rect x={viewBoxWidth - 500} y="432" width="460" height="148" rx="28" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1.5" />
          <text x={viewBoxWidth - 478} y="462" fontSize="12" fontWeight="700" letterSpacing="0.18em" fill="#78716c">LIVE METRICS</text>
          {activeStage?.metrics?.slice(0, 3).map((metric, index) => (
            <g key={`${metric.key}-${index}`}>
              <rect
                x={viewBoxWidth - 478 + index * 144}
                y="486"
                width="128"
                height="72"
                rx="20"
                fill={tone.soft}
                stroke="#d6d3d1"
                strokeWidth="1"
              />
              <text x={viewBoxWidth - 462 + index * 144} y="510" fontSize="10" fontWeight="700" letterSpacing="0.14em" fill="#78716c">
                {metric.key.toUpperCase()}
              </text>
              <text x={viewBoxWidth - 462 + index * 144} y="542" fontSize="18" fontWeight="700" fill="#1c1917">
                {metric.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
