import {
  buildRelationPath,
  CLASS_HEADER_HEIGHT,
  markerEnd,
  markerStart,
} from './umlStudioDocument'

export default function UmlStudioCanvas({
  attachPreview,
  boxesById,
  defsId,
  draft,
  onBackgroundPointerDown,
  onClassMoveStart,
  onClassResizeStart,
  onClassSelect,
  onRelationEndpointPointerDown,
  onRelationSelect,
  onTextMoveStart,
  onTextResizeStart,
  onTextSelect,
  selectedClass,
  selectedRelation,
  selectedText,
  showGrid,
  svgRef,
  viewBox,
  zoom,
}) {
  return (
    <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.99),rgba(247,240,226,0.95))] p-4 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
      <div className="rounded-[28px] border border-black/10 bg-[#fffaf2] p-3">
        <div className="max-h-[72vh] overflow-auto rounded-[24px] border border-black/8 bg-[rgba(255,250,242,0.88)]">
          <svg
            ref={svgRef}
            className="block rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(231,198,167,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,235,220,0.92))]"
            viewBox={draft.viewBox}
            style={{ width: `${Math.round(viewBox.width * zoom)}px`, height: `${Math.round(viewBox.height * zoom)}px` }}
            preserveAspectRatio="xMinYMin meet"
            onPointerDown={onBackgroundPointerDown}
          >
            <defs>
              <marker id={`${defsId}-arrow`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
              </marker>
              <marker id={`${defsId}-triangle`} markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                <path d="M 0 6 L 10 0 L 10 12 z" fill="#fff9ef" stroke="context-stroke" strokeWidth="1.2" />
              </marker>
              <marker id={`${defsId}-diamond`} markerWidth="12" markerHeight="12" refX="0" refY="6" orient="auto">
                <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="#fff9ef" stroke="context-stroke" strokeWidth="1.2" />
              </marker>
              <pattern id={`${defsId}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(122,90,63,0.12)" strokeWidth="1" />
              </pattern>
            </defs>

            {showGrid ? (
              <rect
                x={viewBox.minX}
                y={viewBox.minY}
                width={viewBox.width}
                height={viewBox.height}
                fill={`url(#${defsId}-grid)`}
                pointerEvents="none"
              />
            ) : null}

            {draft.relations.map((relation) => {
              const pathData = buildRelationPath(relation, boxesById)
              if (!pathData) {
                return null
              }

              // Relations are rendered twice: a transparent thick hit area for selection,
              // then the visible stroke. This keeps thin arrows easy to pick with the mouse.
              const isActive = selectedRelation?.id === relation.id
              const labelPoint = pathData.labelPositionAt(relation.labelPosition ?? 0.5)

              return (
                <g key={relation.id}>
                  <path
                    d={pathData.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="18"
                    className="cursor-pointer"
                    onPointerDown={(event) => onRelationSelect(event, relation.id)}
                  />
                  <path
                    d={pathData.d}
                    fill="none"
                    stroke={relation.color}
                    strokeWidth={isActive ? '4' : '2.5'}
                    strokeDasharray={relation.dashed ? '10 8' : '0'}
                    markerEnd={markerEnd(defsId, relation)}
                    markerStart={markerStart(defsId, relation)}
                  />
                  <rect x={labelPoint.x - 56} y={labelPoint.y - 14} width="112" height="28" rx="14" fill="rgba(255,250,242,0.94)" stroke="rgba(36,31,24,0.08)" />
                  <text x={labelPoint.x} y={labelPoint.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="0.14em" fill={relation.color}>
                    {relation.label.toUpperCase()}
                  </text>
                  {isActive ? (
                    <>
                      {/* End handles only appear on the selected relation so the canvas stays readable. */}
                      <circle
                        cx={pathData.start.x}
                        cy={pathData.start.y}
                        r="10"
                        fill="#fffaf2"
                        stroke={relation.color}
                        strokeWidth="3"
                        className="cursor-grab"
                        data-editor-only="true"
                        onPointerDown={(event) => onRelationEndpointPointerDown(event, relation, 'from')}
                      />
                      <circle
                        cx={pathData.end.x}
                        cy={pathData.end.y}
                        r="10"
                        fill="#fffaf2"
                        stroke={relation.color}
                        strokeWidth="3"
                        className="cursor-grab"
                        data-editor-only="true"
                        onPointerDown={(event) => onRelationEndpointPointerDown(event, relation, 'to')}
                      />
                    </>
                  ) : null}
                </g>
              )
            })}

            {draft.classes.map((box) => {
              const isActive = selectedClass?.id === box.id
              const attributesStartY = CLASS_HEADER_HEIGHT + 14
              const methodsStartY = CLASS_HEADER_HEIGHT + box.attributesHeight + 14
              const methodsDividerY = CLASS_HEADER_HEIGHT + box.attributesHeight

              return (
                <g
                  key={box.id}
                  transform={`translate(${box.x} ${box.y})`}
                  onPointerDown={(event) => onClassSelect(event, box.id)}
                >
                  <rect
                    width={box.width}
                    height={box.height}
                    rx="18"
                    fill={box.fillColor}
                    stroke={box.borderColor}
                    strokeWidth={isActive ? '3.2' : '2.4'}
                    className="cursor-move"
                    onPointerDown={(event) => onClassMoveStart(event, box)}
                  />
                  {/* The class body stays intentionally compact in canvas mode; detailed editing happens in the inspector. */}
                  <text x={box.width / 2} y="20" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="0.18em" fill={box.textColor} pointerEvents="none">
                    {`<<${box.stereotype}>>`}
                  </text>
                  <text x={box.width / 2} y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill={box.textColor} pointerEvents="none">
                    {box.title}
                  </text>
                  <line
                    x1="12"
                    y1={CLASS_HEADER_HEIGHT}
                    x2={box.width - 12}
                    y2={CLASS_HEADER_HEIGHT}
                    stroke={box.borderColor}
                    strokeOpacity="0.45"
                    strokeWidth="1.4"
                    pointerEvents="none"
                  />
                  <line
                    x1="12"
                    y1={methodsDividerY}
                    x2={box.width - 12}
                    y2={methodsDividerY}
                    stroke={box.borderColor}
                    strokeOpacity="0.35"
                    strokeWidth="1.2"
                    pointerEvents="none"
                  />
                  {box.fields.slice(0, 4).map((line, index) => (
                    <text key={`${box.id}-field-${index}`} x="18" y={attributesStartY + index * 18} fontSize="12" fill={box.textColor} pointerEvents="none">
                      {line}
                    </text>
                  ))}
                  {box.methods.slice(0, 4).map((line, index) => (
                    <text key={`${box.id}-method-${index}`} x="18" y={Math.min(box.height - 18, methodsStartY + index * 18)} fontSize="12" fill={box.textColor} pointerEvents="none">
                      {line}
                    </text>
                  ))}
                  <rect
                    x={box.width - 14}
                    y={box.height - 14}
                    width="14"
                    height="14"
                    rx="4"
                    fill={box.borderColor}
                    className="cursor-se-resize"
                    data-editor-only="true"
                    onPointerDown={(event) => onClassResizeStart(event, box)}
                  />
                </g>
              )
            })}

            {draft.texts.map((text) => {
              const isActive = selectedText?.id === text.id

              return (
                <g
                  key={text.id}
                  transform={`translate(${text.x} ${text.y})`}
                  onPointerDown={(event) => onTextSelect(event, text.id)}
                >
                  <rect
                    width={text.width}
                    height={text.height}
                    rx="18"
                    fill={text.fillColor}
                    stroke={text.borderColor}
                    strokeWidth={isActive ? '3' : '2'}
                    strokeDasharray="8 7"
                    className="cursor-move"
                    onPointerDown={(event) => onTextMoveStart(event, text)}
                  />
                  {text.text.split('\n').slice(0, 4).map((line, index) => (
                    <text key={`${text.id}-${index}`} x="18" y={28 + index * (text.fontSize + 4)} fontSize={text.fontSize} fill={text.textColor} pointerEvents="none">
                      {line}
                    </text>
                  ))}
                  <rect
                    x={text.width - 14}
                    y={text.height - 14}
                    width="14"
                    height="14"
                    rx="4"
                    fill={text.borderColor}
                    className="cursor-se-resize"
                    data-editor-only="true"
                    onPointerDown={(event) => onTextResizeStart(event, text)}
                  />
                </g>
              )
            })}

            {attachPreview?.pointer ? (
              <>
                {/* Preview markers show the drop target while reconnecting an arrow endpoint. */}
                <circle
                  cx={attachPreview.pointer.x}
                  cy={attachPreview.pointer.y}
                  r="8"
                  fill="rgba(194,87,55,0.18)"
                  stroke="#c25737"
                  strokeWidth="2"
                  pointerEvents="none"
                  data-editor-only="true"
                />
                {attachPreview.target ? (
                  <circle
                    cx={attachPreview.target.anchor.x}
                    cy={attachPreview.target.anchor.y}
                    r="12"
                    fill="rgba(194,87,55,0.12)"
                    stroke="#c25737"
                    strokeWidth="3"
                    pointerEvents="none"
                    data-editor-only="true"
                  />
                ) : null}
              </>
            ) : null}
          </svg>
        </div>
      </div>
    </section>
  )
}
