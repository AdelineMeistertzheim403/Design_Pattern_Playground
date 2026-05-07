// Layout UML pour State.

import { getRowWidth, withPosition } from './patternLayoutUtils'

export function buildStateLayout(boxesById) {
  const context = boxesById.context
  const state = boxesById.state
  const idle = boxesById.idle
  const running = boxesById.running
  const jumping = boxesById.jumping
  const attacking = boxesById.attacking

  if (!context || !state || !idle || !running || !jumping || !attacking) {
    return null
  }

  const marginX = 92
  const marginY = 76
  const columnGap = 150
  const stateRowGap = 124
  const gridColumnGap = 92
  const gridRowGap = 108
  const rowOne = [idle, running]
  const rowTwo = [jumping, attacking]
  const rowOneWidth = getRowWidth(rowOne, gridColumnGap)
  const rowTwoWidth = getRowWidth(rowTwo, gridColumnGap)
  const rightAreaWidth = Math.max(state.width, rowOneWidth, rowTwoWidth)
  const width = marginX * 2 + context.width + columnGap + rightAreaWidth
  const rightStartX = marginX + context.width + columnGap
  const stateX = rightStartX + (rightAreaWidth - state.width) / 2
  const stateY = marginY
  const rowOneStartX = rightStartX + (rightAreaWidth - rowOneWidth) / 2
  const rowOneY = stateY + state.height + stateRowGap
  const rowTwoStartX = rightStartX + (rightAreaWidth - rowTwoWidth) / 2
  const rowTwoY = rowOneY + Math.max(idle.height, running.height) + gridRowGap
  const rightAreaHeight = rowTwoY + Math.max(jumping.height, attacking.height) - stateY
  const contextY = stateY + (rightAreaHeight - context.height) / 2

  return {
    viewBox: `0 0 ${width} ${rowTwoY + Math.max(jumping.height, attacking.height) + marginY}`,
    boxes: [
      withPosition(context, marginX, contextY),
      withPosition(state, stateX, stateY),
      withPosition(idle, rowOneStartX, rowOneY),
      withPosition(running, rowOneStartX + idle.width + gridColumnGap, rowOneY),
      withPosition(jumping, rowTwoStartX, rowTwoY),
      withPosition(attacking, rowTwoStartX + jumping.width + gridColumnGap, rowTwoY),
    ],
  }
}
