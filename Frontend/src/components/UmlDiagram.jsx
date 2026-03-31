function wrapText(text, maxLength = 28) {
  if (!text) {
    return []
  }

  const words = `${text}`.split(/\s+/).filter(Boolean)
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (candidate.length <= maxLength) {
      currentLine = candidate
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function getTone(tone) {
  if (tone === 'teal') {
    return {
      fill: 'rgba(211, 236, 230, 0.94)',
      stroke: '#246b5e',
      text: '#153f38',
    }
  }

  if (tone === 'accent') {
    return {
      fill: 'rgba(231, 198, 167, 0.92)',
      stroke: '#c25737',
      text: '#5f2d20',
    }
  }

  return {
    fill: 'rgba(255, 249, 239, 0.98)',
    stroke: '#7a5a3f',
    text: '#3d2d20',
  }
}

function getAnchor(box, side) {
  if (side === 'left') {
    return { x: box.x, y: box.y + box.height / 2 }
  }

  if (side === 'top') {
    return { x: box.x + box.width / 2, y: box.y }
  }

  if (side === 'bottom') {
    return { x: box.x + box.width / 2, y: box.y + box.height }
  }

  return { x: box.x + box.width, y: box.y + box.height / 2 }
}

function buildPath(relation, classesById) {
  const fromBox = classesById[relation.from]
  const toBox = classesById[relation.to]

  if (!fromBox || !toBox) {
    return null
  }

  const start = getAnchor(fromBox, relation.fromSide ?? 'right')
  const end = getAnchor(toBox, relation.toSide ?? 'left')
  const points = [start, ...(relation.points ?? []), end]

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

export default function UmlDiagram({ diagram, patternName }) {
  if (!diagram) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/15 bg-white/70 px-5 py-12 text-sm leading-7 text-stone-600">
        Aucun diagramme UML n est encore defini pour ce pattern.
      </div>
    )
  }

  const defsId = `uml-${patternName?.toLowerCase?.() ?? 'pattern'}`
  const classesById = Object.fromEntries(diagram.classes.map((box) => [box.id, box]))

  return (
    <div className="rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(247,240,226,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-2 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">UML</p>
          <h3 className="mt-2 text-2xl text-stone-950">Diagramme du pattern</h3>
        </div>
        <span className="rounded-full border border-black/10 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600">
          {patternName}
        </span>
      </div>

      <svg className="mt-4 h-auto w-full" viewBox={diagram.viewBox} role="img">
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
        </defs>

        {diagram.relations.map((relation, index) => {
          const path = buildPath(relation, classesById)
          if (!path) {
            return null
          }

          return (
            <g key={`${relation.from}-${relation.to}-${index}`}>
              <path
                d={path}
                fill="none"
                stroke="#7a5a3f"
                strokeWidth="2.2"
                strokeDasharray={relation.dashed ? '10 8' : '0'}
                markerEnd={`url(#${defsId}-${relation.marker === 'triangle' ? 'triangle' : 'arrow'})`}
              />
              <rect
                x={relation.labelX - 44}
                y={relation.labelY - 12}
                width="88"
                height="24"
                rx="12"
                fill="rgba(255,250,242,0.96)"
                stroke="rgba(36,31,24,0.08)"
              />
              <text
                x={relation.labelX}
                y={relation.labelY + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.14em"
                fill="#6a5544"
              >
                {relation.label.toUpperCase()}
              </text>
            </g>
          )
        })}

        {diagram.classes.map((box) => {
          const tone = getTone(box.tone)
          const contentLines = [...(box.fields ?? []), ...(box.methods ?? [])]
          const headerHeight = 44
          const fieldsHeight = (box.fields?.length ?? 0) * 18

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
              <line x1="0" y1={headerHeight} x2={box.width} y2={headerHeight} stroke={tone.stroke} strokeOpacity="0.45" />
              {box.fields?.length ? (
                <line
                  x1="0"
                  y1={headerHeight + fieldsHeight + 14}
                  x2={box.width}
                  y2={headerHeight + fieldsHeight + 14}
                  stroke={tone.stroke}
                  strokeOpacity="0.35"
                />
              ) : null}

              <text
                x={box.width / 2}
                y="16"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                letterSpacing="0.2em"
                fill={tone.text}
                opacity="0.62"
              >
                {`<<${box.stereotype}>>`}
              </text>
              {wrapText(box.title, 20).map((line, index) => (
                <text
                  key={`${box.id}-title-${index}`}
                  x={box.width / 2}
                  y={34 + index * 16}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="700"
                  fill={tone.text}
                >
                  {line}
                </text>
              ))}

              {(box.fields ?? []).map((line, index) => (
                <text
                  key={`${box.id}-field-${index}`}
                  x="18"
                  y={68 + index * 18}
                  fontSize="12"
                  fontWeight="500"
                  fill={tone.text}
                >
                  {line}
                </text>
              ))}

              {(box.methods ?? []).map((line, index) => (
                <text
                  key={`${box.id}-method-${index}`}
                  x="18"
                  y={box.fields?.length ? 96 + (box.fields.length - 1) * 18 + index * 18 : 68 + index * 18}
                  fontSize="12"
                  fontWeight="500"
                  fill={tone.text}
                >
                  {line}
                </text>
              ))}

              {contentLines.length === 0 ? (
                <text
                  x="18"
                  y="74"
                  fontSize="12"
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
    </div>
  )
}
