import { sanitizeRawMarkup, TONES } from './svgSceneStudioDocument'

function getPreviewSourceBox(element) {
  if (element.type === 'raw') {
    return {
      x: Number.isFinite(element.baseX) ? element.baseX : 0,
      y: Number.isFinite(element.baseY) ? element.baseY : 0,
      width: Math.max(1, Number.isFinite(element.baseWidth) ? element.baseWidth : element.width ?? 160),
      height: Math.max(1, Number.isFinite(element.baseHeight) ? element.baseHeight : element.height ?? 80),
    }
  }

  if (element.type === 'text') {
    return {
      x: element.x ?? 0,
      y: (element.y ?? 24) - 28,
      width: Math.max(120, element.width ?? 180),
      height: Math.max(40, element.height ?? 48),
    }
  }

  return {
    x: element.x ?? 0,
    y: element.y ?? 0,
    width: Math.max(1, element.width ?? 160),
    height: Math.max(1, element.height ?? 80),
  }
}

export default function ImportedElementPreview({ element, label }) {
  const tone = TONES[element.tone] ?? TONES.paper
  const sourceBox = getPreviewSourceBox(element)
  const previewWidth = 220
  const previewHeight = 128
  const padding = 14
  const scale = Math.min(
    (previewWidth - padding * 2) / sourceBox.width,
    (previewHeight - padding * 2) / sourceBox.height,
  )
  const fittedWidth = sourceBox.width * scale
  const fittedHeight = sourceBox.height * scale
  const translateX = (previewWidth - fittedWidth) / 2 - sourceBox.x * scale
  const translateY = (previewHeight - fittedHeight) / 2 - sourceBox.y * scale

  return (
    <svg viewBox={`0 0 ${previewWidth} ${previewHeight}`} className="h-24 w-full rounded-xl border border-black/10 bg-[#fffaf2]">
      <rect width={previewWidth} height={previewHeight} rx="16" fill="#fffaf2" />
      <g transform={`translate(${translateX} ${translateY}) scale(${scale})`}>
        {element.type === 'ellipse' ? (
          <>
            <ellipse
              cx={(element.x ?? 0) + (element.width ?? 160) / 2}
              cy={(element.y ?? 0) + (element.height ?? 80) / 2}
              rx={(element.width ?? 160) / 2}
              ry={(element.height ?? 80) / 2}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={4 / scale}
            />
            <text
              x={(element.x ?? 0) + (element.width ?? 160) / 2}
              y={(element.y ?? 0) + (element.height ?? 80) / 2 + 6}
              textAnchor="middle"
              fontSize={Math.min(18, element.fontSize ?? 18)}
              fontWeight="700"
              fill={tone.text}
            >
              {label}
            </text>
          </>
        ) : element.type === 'text' ? (
          <text
            x={element.x ?? 0}
            y={element.y ?? 24}
            fontSize={Math.min(28, element.fontSize ?? 24)}
            fontWeight="700"
            fill={tone.text}
          >
            {label}
          </text>
        ) : element.type === 'raw' ? (
          <g dangerouslySetInnerHTML={{ __html: sanitizeRawMarkup(element.rawMarkup) }} />
        ) : (
          <>
            <rect
              x={element.x ?? 0}
              y={element.y ?? 0}
              width={element.width ?? 160}
              height={element.height ?? 80}
              rx="18"
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={4 / scale}
            />
            <text
              x={(element.x ?? 0) + (element.width ?? 160) / 2}
              y={(element.y ?? 0) + Math.min(44, (element.height ?? 80) / 2 + 10)}
              textAnchor="middle"
              fontSize={18}
              fontWeight="700"
              fill={tone.text}
            >
              {label}
            </text>
            {element.subtitle ? (
              <text
                x={(element.x ?? 0) + (element.width ?? 160) / 2}
                y={(element.y ?? 0) + Math.min(72, (element.height ?? 80) - 10)}
                textAnchor="middle"
                fontSize="12"
                fill={tone.text}
              >
                {element.subtitle}
              </text>
            ) : null}
          </>
        )}
      </g>
    </svg>
  )
}
