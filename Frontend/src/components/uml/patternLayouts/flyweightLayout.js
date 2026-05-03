// Layout UML pour Flyweight.

import { withPosition } from './patternLayoutUtils'

export function buildFlyweightLayout(boxesById) {
  const client = boxesById.client
  const extrinsic = boxesById.extrinsic
  const factory = boxesById.factory
  const flyweight = boxesById.flyweight
  const concrete = boxesById.concrete

  if (!client || !extrinsic || !factory || !flyweight || !concrete) {
    return null
  }

  const marginX = 92
  const marginY = 74
  const columnGap = 154
  const rowGap = 134
  const leftColumnWidth = Math.max(client.width, extrinsic.width)
  const rightColumnWidth = Math.max(flyweight.width, concrete.width)
  const leftColumnHeight = client.height + rowGap + extrinsic.height
  const rightColumnHeight = flyweight.height + rowGap + concrete.height
  const sideColumnsHeight = Math.max(leftColumnHeight, rightColumnHeight)
  const width = marginX * 2 + leftColumnWidth + columnGap + factory.width + columnGap + rightColumnWidth
  const centerX = marginX + leftColumnWidth + columnGap
  const leftX = marginX
  const rightX = centerX + factory.width + columnGap
  const topY = marginY
  const leftBottomY = topY + client.height + rowGap
  const rightBottomY = topY + flyweight.height + rowGap
  const factoryY = marginY + (sideColumnsHeight - factory.height) / 2
  const height = marginY * 2 + sideColumnsHeight

  return {
    viewBox: `0 0 ${width} ${height}`,
    boxes: [
      withPosition(client, leftX + (leftColumnWidth - client.width) / 2, topY),
      withPosition(extrinsic, leftX + (leftColumnWidth - extrinsic.width) / 2, leftBottomY),
      withPosition(factory, centerX, factoryY),
      withPosition(flyweight, rightX + (rightColumnWidth - flyweight.width) / 2, topY),
      withPosition(concrete, rightX + (rightColumnWidth - concrete.width) / 2, rightBottomY),
    ],
  }
}
