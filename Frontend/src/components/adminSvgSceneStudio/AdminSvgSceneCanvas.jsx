import { buildArrowPath, getElementCenter, sanitizeRawMarkup, TONES } from './adminSvgSceneDocument'

export default function AdminSvgSceneCanvas({
  draft,
  onArrowEndpointPointerDown,
  onArrowSelect,
  onBackgroundPointerDown,
  onElementDragStart,
  onElementResizeStart,
  onElementSelect,
  selectedArrowId,
  selectedElementIds,
  svgRef,
  viewBox,
}) {
  return (
    <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.94))] p-4 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
      <svg ref={svgRef} className="h-auto w-full rounded-[24px] border border-black/10 bg-[#fffaf2]" viewBox={draft.viewBox} onPointerDown={onBackgroundPointerDown}>
        <defs>
          <marker id="admin-svg-editor-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
          </marker>
        </defs>
        <rect width={viewBox.width} height={viewBox.height} rx="32" fill="#fffaf2" />

        {draft.elements.map((element) => {
          const tone = TONES[element.tone] ?? TONES.paper
          const isActive = selectedElementIds.includes(element.id)
          const center = getElementCenter(element)
          return (
            <g key={element.id} className="cursor-pointer" onPointerDown={(event) => onElementSelect(event, element.id)}>
              {element.type === 'ellipse' ? (
                <ellipse cx={center.x} cy={center.y} rx={element.width / 2} ry={element.height / 2} fill={tone.fill} stroke={isActive ? '#c25737' : tone.stroke} strokeWidth={isActive ? '5' : '4'} className="cursor-move" onPointerDown={(event) => onElementDragStart(event, element)} />
              ) : element.type === 'text' ? (
                <text x={element.x} y={element.y} fontSize={element.fontSize ?? 30} fontWeight="700" fill={tone.text} className="cursor-move select-none" onPointerDown={(event) => onElementDragStart(event, element)}>{element.label}</text>
              ) : element.type === 'raw' ? (
                <g
                  className="cursor-move"
                  transform={`translate(${element.x} ${element.y}) scale(${element.baseWidth > 0 ? element.width / element.baseWidth : 1} ${element.baseHeight > 0 ? element.height / element.baseHeight : 1}) translate(${-element.baseX} ${-element.baseY})`}
                  onPointerDown={(event) => onElementDragStart(event, element)}
                  dangerouslySetInnerHTML={{ __html: sanitizeRawMarkup(element.rawMarkup) }}
                />
              ) : (
                <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="24" fill={tone.fill} stroke={isActive ? '#c25737' : tone.stroke} strokeWidth={isActive ? '5' : '4'} className="cursor-move" onPointerDown={(event) => onElementDragStart(event, element)} />
              )}
              {element.type !== 'text' && element.type !== 'raw' ? (
                <>
                  <text x={center.x} y={element.y + Math.min(56, element.height / 2)} textAnchor="middle" fontSize={element.fontSize ?? 26} fontWeight="700" fill={tone.text} className="pointer-events-none select-none">{element.label}</text>
                  {element.subtitle ? <text x={center.x} y={element.y + Math.min(92, element.height - 22)} textAnchor="middle" fontSize="16" fill={tone.text} className="pointer-events-none select-none">{element.subtitle}</text> : null}
                </>
              ) : null}
              {isActive ? <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="10" fill="none" stroke="#c25737" strokeDasharray="10 7" strokeWidth="3" pointerEvents="none" /> : null}
              {isActive ? <rect x={element.x + element.width - 16} y={element.y + element.height - 16} width="16" height="16" rx="4" fill="#c25737" className="cursor-se-resize" onPointerDown={(event) => onElementResizeStart(event, element)} /> : null}
            </g>
          )
        })}

        {draft.arrows.map((arrow) => {
          const isActive = arrow.id === selectedArrowId
          const path = buildArrowPath(arrow)
          return (
            <g key={arrow.id}>
              <path d={path} fill="none" stroke="transparent" strokeWidth="24" className="cursor-pointer" onPointerDown={(event) => onArrowSelect(event, arrow.id)} />
              <path d={path} fill="none" stroke={isActive ? '#c25737' : '#7a5a3f'} strokeWidth={isActive ? '6' : '4'} strokeDasharray={arrow.dashed ? '12 10' : '0'} markerEnd="url(#admin-svg-editor-arrow)" pointerEvents="none" />
              {(draft.playbackMode ?? 'auto') === 'auto' && arrow.animation?.enabled !== false ? (
                <circle key={`${arrow.id}-${path}-${arrow.animation?.durationSeconds ?? 1.8}`} r="5" fill={arrow.animation?.color ?? '#246b5e'} opacity="0.95" pointerEvents="none">
                  <animateMotion dur={`${arrow.animation?.durationSeconds ?? 1.8}s`} repeatCount="indefinite" path={path} />
                </circle>
              ) : null}
              {arrow.label ? <text x={(arrow.x1 + arrow.x2) / 2} y={(arrow.y1 + arrow.y2) / 2 - 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#6a5544" pointerEvents="none">{arrow.label}</text> : null}
              {isActive ? (
                <>
                  <circle cx={arrow.x1} cy={arrow.y1} r="11" fill="#fffaf2" stroke="#c25737" strokeWidth="3" className="cursor-grab" onPointerDown={(event) => onArrowEndpointPointerDown(event, arrow.id, 'start')} />
                  <circle cx={arrow.x2} cy={arrow.y2} r="11" fill="#fffaf2" stroke="#c25737" strokeWidth="3" className="cursor-grab" onPointerDown={(event) => onArrowEndpointPointerDown(event, arrow.id, 'end')} />
                </>
              ) : null}
            </g>
          )
        })}
      </svg>
    </section>
  )
}
