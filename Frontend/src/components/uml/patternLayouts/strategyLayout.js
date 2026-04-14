// Layout UML pour Strategy.

import { getRowHeight, getRowWidth, withPosition } from './patternLayoutUtils'

export function buildStrategyLayout(boxesById) {
  const context = boxesById.context
  const strategy = boxesById.strategy
  const card = boxesById.card
  const paypal = boxesById.paypal
  const crypto = boxesById.crypto

  if (!context || !strategy || !card || !paypal || !crypto) {
    return null
  }

  const marginX = 92
  const marginY = 74
  const columnGap = 142
  const rowGap = 138
  const bottomRow = [card, paypal, crypto]
  const bottomRowWidth = getRowWidth(bottomRow, columnGap)
  const rightAreaWidth = Math.max(bottomRowWidth, strategy.width)
  const width = marginX * 2 + context.width + columnGap + rightAreaWidth
  const rightAreaX = marginX + context.width + columnGap
  const topStartX = rightAreaX + (rightAreaWidth - strategy.width) / 2
  const bottomStartX = rightAreaX + (rightAreaWidth - bottomRowWidth) / 2
  const topY = marginY
  const contextY = topY + (strategy.height - context.height) / 2
  const bottomY = topY + strategy.height + rowGap
  const height = Math.max(
    bottomY + getRowHeight(bottomRow) + marginY,
    contextY + context.height + marginY,
  )

  return {
    viewBox: `0 0 ${width} ${height}`,
    boxes: [
      withPosition(strategy, topStartX, topY),
      withPosition(context, marginX, contextY),
      withPosition(card, bottomStartX, bottomY),
      withPosition(paypal, bottomStartX + card.width + columnGap, bottomY),
      withPosition(crypto, bottomStartX + card.width + columnGap + paypal.width + columnGap, bottomY),
    ],
  }
}
