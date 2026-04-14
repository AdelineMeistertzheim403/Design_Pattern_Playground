import ZoomableViewport from './ZoomableViewport'
import {
  buildPatternLayout,
  buildRelationMeta,
  buildRelationPoints,
  estimateTextWidth,
  getBoxLayout,
  getRelationLabelPosition,
  getRelationMarkers,
  getTone,
  parseViewBox,
} from './uml'

/**
 * Rendu UML utilise dans les pages pattern et la modale UML.
 */
export default function UmlDiagram({
  diagram,
  patternCode,
  patternName,
  isExpanded = false,
  onOpenModal,
}) {
  if (!diagram) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        Aucun diagramme UML n est encore defini pour ce pattern.
      </div>
    )
  }

  const defsId = `uml-${patternName?.toLowerCase?.() ?? 'pattern'}`
  const boxLayouts = diagram.classes.map((box) => getBoxLayout(box))
  const baseViewBox = parseViewBox(diagram.viewBox)
  const useAbsoluteLayout = diagram.layout === 'absolute'
  const arrangedLayout = useAbsoluteLayout
    ? {
        boxes: boxLayouts,
        viewBox: `${baseViewBox.minX} ${baseViewBox.minY} ${baseViewBox.width} ${baseViewBox.height}`,
      }
    : buildPatternLayout(patternCode, boxLayouts)
  const classesById = Object.fromEntries(arrangedLayout.boxes.map((box) => [box.id, box]))
  const computedViewBox = arrangedLayout.viewBox ?? `${baseViewBox.minX} ${baseViewBox.minY} ${baseViewBox.width} ${baseViewBox.height}`
  const relationMetaList = buildRelationMeta(diagram.relations)
  const panelClassName = isExpanded
    ? 'rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.94))] p-6 shadow-[0_30px_90px_rgba(24,20,14,0.16)] lg:p-8'
    : 'rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
  const svgClassName = isExpanded
    ? 'h-auto min-h-[460px] w-full'
    : 'h-auto w-full'
  const TitleTag = isExpanded ? 'h2' : 'h3'

  return (
    <div className={panelClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">UML</p>
          <TitleTag className={isExpanded ? 'mt-2 text-3xl text-stone-950 sm:text-[2.1rem]' : 'mt-2 text-2xl text-stone-950'}>
            Diagramme du pattern
          </TitleTag>
        </div>
        {onOpenModal ? (
          <button
            className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white"
            type="button"
            onClick={onOpenModal}
          >
            {patternName}
          </button>
        ) : (
          <span className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
            {patternName}
          </span>
        )}
      </div>

      <ZoomableViewport enabled={isExpanded} viewportClassName={isExpanded ? 'mt-6' : 'mt-4'}>
        <svg className={svgClassName} viewBox={computedViewBox} role="img">
          <defs>
            <marker
              id={`${defsId}-arrow`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7a5a3f" />
            </marker>
            <marker
              id={`${defsId}-triangle`}
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M 0 6 L 10 0 L 10 12 z" fill="#fff9ef" stroke="#7a5a3f" strokeWidth="1.2" />
            </marker>
            <marker
              id={`${defsId}-diamond`}
              markerWidth="12"
              markerHeight="12"
              refX="0"
              refY="6"
              orient="auto"
            >
              <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="#fff9ef" stroke="#7a5a3f" strokeWidth="1.2" />
            </marker>
          </defs>

          {diagram.relations.map((relation, index) => {
            const points = buildRelationPoints(relation, classesById, relationMetaList[index], {
              useRelationWaypoints: useAbsoluteLayout,
            })
            if (!points) {
              return null
            }

            const path = points
              .map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
              .join(' ')
            const labelPosition = getRelationLabelPosition(relation, points, {
              useExplicitPosition: useAbsoluteLayout,
            })
            const label = relation.label.toUpperCase()
            const labelWidth = Math.max(88, Math.ceil(estimateTextWidth(label, 11) + 28))
            const markers = getRelationMarkers(defsId, relation)

            return (
              <g key={`${relation.from}-${relation.to}-${index}`} className="uml-relation">
                <path
                  className="uml-relation-line"
                  d={path}
                  fill="none"
                  stroke="#7a5a3f"
                  strokeWidth="2.2"
                  strokeDasharray={relation.dashed ? '10 8' : '0'}
                  markerEnd={markers.markerEnd}
                  markerStart={markers.markerStart}
                />
                <rect
                  className="uml-relation-label-bg"
                  x={labelPosition.x - labelWidth / 2}
                  y={labelPosition.y - 12}
                  width={labelWidth}
                  height="24"
                  rx="12"
                  fill="rgba(255,250,242,0.96)"
                  stroke="rgba(36,31,24,0.08)"
                />
                <text
                  className="uml-relation-label-text"
                  x={labelPosition.x}
                  y={labelPosition.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="0.14em"
                  fill="#6a5544"
                >
                  {label}
                </text>
              </g>
            )
          })}

          {arrangedLayout.boxes.map((box) => {
            const tone = getTone(box)
            const hasFields = box.fieldLines.length > 0
            const hasMethods = box.methodLines.length > 0
            const hasContent = hasFields || hasMethods

            return (
              <g key={box.id} transform={`translate(${box.x} ${box.y})`}>
                <rect
                  width={box.width}
                  height={box.height}
                  rx="18"
                  fill={tone.fill}
                  stroke={tone.stroke}
                  strokeWidth="2.4"
                  className="scene-node-shadow"
                />
                <line x1="0" y1={box.headerHeight} x2={box.width} y2={box.headerHeight} stroke={tone.stroke} strokeOpacity="0.45" />
                {hasFields ? (
                  <line
                    x1="0"
                    y1={box.fieldDividerY}
                    x2={box.width}
                    y2={box.fieldDividerY}
                    stroke={tone.stroke}
                    strokeOpacity="0.35"
                  />
                ) : null}

                <text
                  x={box.width / 2}
                  y="16"
                  textAnchor="middle"
                  fontSize={box.stereotypeFontSize}
                  fontWeight="700"
                  letterSpacing="0.2em"
                  fill={tone.text}
                  opacity="0.62"
                >
                  {`<<${box.stereotype}>>`}
                </text>
                {box.titleLines.map((line, index) => (
                  <text
                    key={`${box.id}-title-${index}`}
                    x={box.width / 2}
                    y={box.titleStartY + index * box.titleLineHeight}
                    textAnchor="middle"
                    fontSize={box.titleFontSize}
                    fontWeight="700"
                    fill={tone.text}
                  >
                    {line}
                  </text>
                ))}

                {box.fieldLines.map((line, index) => (
                  <text
                    key={`${box.id}-field-${index}`}
                    x="18"
                    y={box.memberStartY + index * box.memberLineHeight}
                    fontSize={box.memberFontSize}
                    fontWeight="500"
                    fill={tone.text}
                  >
                    {line}
                  </text>
                ))}

                {box.methodLines.map((line, index) => (
                  <text
                    key={`${box.id}-method-${index}`}
                    x="18"
                    y={box.methodStartY + index * box.memberLineHeight}
                    fontSize={box.memberFontSize}
                    fontWeight="500"
                    fill={tone.text}
                  >
                    {line}
                  </text>
                ))}

                {!hasContent ? (
                  <text
                    x="18"
                    y={box.memberStartY}
                    fontSize={box.memberFontSize}
                    fontWeight="500"
                    fill={tone.text}
                    opacity="0.72"
                  >
                    Aucun membre pour cette vue simplifiee
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </ZoomableViewport>
    </div>
  )
}
