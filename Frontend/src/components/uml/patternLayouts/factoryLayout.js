// Layout UML pour Factory Method.

import { getRowHeight, getRowWidth, withPosition } from './patternLayoutUtils'

export function buildFactoryLayout(boxesById) {
  const factory = boxesById.factory
  const vehicle = boxesById.vehicle
  const car = boxesById.car
  const bike = boxesById.bike

  if (!factory || !vehicle || !car || !bike) {
    return null
  }

  const marginX = 88
  const marginY = 74
  const columnGap = 156
  const rowGap = 148
  const topRow = [factory, vehicle]
  const bottomRow = [car, bike]
  const topRowWidth = getRowWidth(topRow, columnGap)
  const bottomRowWidth = getRowWidth(bottomRow, columnGap)
  const contentWidth = Math.max(topRowWidth, bottomRowWidth)
  const width = marginX * 2 + contentWidth
  const topStartX = marginX + (contentWidth - topRowWidth) / 2
  const bottomStartX = marginX + (contentWidth - bottomRowWidth) / 2
  const topY = marginY
  const bottomY = topY + getRowHeight(topRow) + rowGap

  return {
    viewBox: `0 0 ${width} ${bottomY + getRowHeight(bottomRow) + marginY}`,
    boxes: [
      withPosition(factory, topStartX, topY),
      withPosition(vehicle, topStartX + factory.width + columnGap, topY),
      withPosition(car, bottomStartX, bottomY),
      withPosition(bike, bottomStartX + car.width + columnGap, bottomY),
    ],
  }
}
