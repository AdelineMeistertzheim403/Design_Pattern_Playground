// Utils communs aux layouts UML par pattern.

import { buildFallbackLayout } from '../umlDiagramFallbackLayout'

export function withPosition(box, x, y) {
  return {
    ...box,
    x,
    y,
  }
}

export function getRowWidth(boxes, gap) {
  return boxes.reduce((total, box, index) => total + box.width + (index > 0 ? gap : 0), 0)
}

export function getRowHeight(boxes) {
  return Math.max(...boxes.map((box) => box.height))
}

export function buildDefaultLayout(boxesById) {
  return buildFallbackLayout(Object.values(boxesById))
}
