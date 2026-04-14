// Layouts UML (taille des boites + positionnement par pattern).

import { estimateTextWidth, getFittedFontSize, wrapText } from './umlDiagramText'
import { buildFallbackLayout } from './umlDiagramFallbackLayout'

export function parseViewBox(viewBox) {
  const parts = `${viewBox ?? ''}`.split(/\s+/).map(Number)

  if (parts.length === 4 && parts.every((value) => Number.isFinite(value))) {
    return {
      minX: parts[0],
      minY: parts[1],
      width: parts[2],
      height: parts[3],
    }
  }

  return {
    minX: 0,
    minY: 0,
    width: 960,
    height: 600,
  }
}

function getWrappedMembers(lines, maxLength = 28) {
  return (lines ?? []).flatMap((line) => wrapText(line, maxLength))
}

export function getBoxLayout(box) {
  const titleLines = wrapText(box.title, 22)
  const fieldLines = getWrappedMembers(box.fields, 24)
  const methodLines = getWrappedMembers(box.methods, 24)
  const stereotypeLabel = `<<${box.stereotype}>>`
  const baseWidth = box.width ?? 210
  const contentWidth = Math.max(
    estimateTextWidth(stereotypeLabel, 10),
    ...titleLines.map((line) => estimateTextWidth(line, 18)),
    ...fieldLines.map((line) => estimateTextWidth(line, 12)),
    ...methodLines.map((line) => estimateTextWidth(line, 12)),
  )
  const width = Math.min(340, Math.max(baseWidth, Math.ceil(contentWidth + 44)))
  const stereotypeFontSize = getFittedFontSize([stereotypeLabel], 10, 9, width - 40)
  const titleFontSize = getFittedFontSize(titleLines, 18, 15, width - 40)
  const memberFontSize = getFittedFontSize(
    [...fieldLines, ...methodLines, 'Aucun membre pour cette vue simplifiee'],
    12,
    10,
    width - 36,
  )
  const titleStartY = 34
  const titleLineHeight = titleFontSize + 4
  const memberLineHeight = memberFontSize + 6
  const headerHeight = 24 + titleLines.length * titleLineHeight + 16
  const memberStartY = headerHeight + 22
  const fieldDividerY = fieldLines.length ? memberStartY + fieldLines.length * memberLineHeight - 8 : null
  const methodStartY = fieldLines.length ? memberStartY + fieldLines.length * memberLineHeight + 14 : memberStartY
  const contentBottomY = methodLines.length
    ? methodStartY + methodLines.length * memberLineHeight
    : fieldLines.length
      ? memberStartY + fieldLines.length * memberLineHeight
      : memberStartY + memberLineHeight
  const height = Math.max(box.height ?? 118, contentBottomY + 20)

  return {
    ...box,
    width,
    height,
    titleLines,
    fieldLines,
    methodLines,
    titleStartY,
    titleLineHeight,
    memberStartY,
    memberLineHeight,
    headerHeight,
    fieldDividerY,
    methodStartY,
    stereotypeFontSize,
    titleFontSize,
    memberFontSize,
  }
}

import {
  buildAbstractFactoryLayout,
  buildAdapterLayout,
  buildBridgeLayout,
  buildBuilderLayout,
  buildChainLayout,
  buildCommandLayout,
  buildCompositeLayout,
  buildDecoratorLayout,
  buildFactoryLayout,
  buildFacadeLayout,
  buildFlyweightLayout,
  buildInterpreterLayout,
  buildIteratorLayout,
  buildMediatorLayout,
  buildMementoLayout,
  buildObserverLayout,
  buildPrototypeLayout,
  buildProxyLayout,
  buildSingletonLayout,
  buildStateLayout,
  buildStrategyLayout,
  buildTemplateLayout,
  buildVisitorLayout,
} from './patternLayouts'

export function buildPatternLayout(patternCode, boxes) {
  const boxesById = Object.fromEntries(boxes.map((box) => [box.id, box]))

  if (patternCode === 'factory') {
    return buildFactoryLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'abstract-factory') {
    return buildAbstractFactoryLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'adapter') {
    return buildAdapterLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'bridge') {
    return buildBridgeLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'builder') {
    return buildBuilderLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'chain') {
    return buildChainLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'command') {
    return buildCommandLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'composite') {
    return buildCompositeLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'decorator') {
    return buildDecoratorLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'facade') {
    return buildFacadeLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'strategy') {
    return buildStrategyLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'interpreter') {
    return buildInterpreterLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'iterator') {
    return buildIteratorLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'mediator') {
    return buildMediatorLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'memento') {
    return buildMementoLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'observer') {
    return buildObserverLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'flyweight') {
    return buildFlyweightLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'prototype') {
    return buildPrototypeLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'proxy') {
    return buildProxyLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'singleton') {
    return buildSingletonLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'state') {
    return buildStateLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'template') {
    return buildTemplateLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  if (patternCode === 'visitor') {
    return buildVisitorLayout(boxesById) ?? buildFallbackLayout(boxes)
  }

  return buildFallbackLayout(boxes)
}
