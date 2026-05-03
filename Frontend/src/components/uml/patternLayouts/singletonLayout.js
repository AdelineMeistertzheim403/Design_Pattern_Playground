// Layout UML pour Singleton.

import { withPosition } from './patternLayoutUtils'

export function buildSingletonLayout(boxesById) {
  const client = boxesById.client
  const singleton = boxesById.singleton
  const clients = boxesById.clients
  const state = boxesById.state

  if (!client || !singleton || !clients || !state) {
    return null
  }

  const marginX = 92
  const marginY = 78
  const columnGap = 150
  const rowGap = 140
  const width = marginX * 2 + client.width + columnGap + singleton.width + columnGap + clients.width
  const singletonX = marginX + client.width + columnGap
  const leftY = marginY + 64
  const rightY = marginY + 64
  const singletonY = marginY
  const stateX = singletonX
  const stateY = singletonY + singleton.height + rowGap

  return {
    viewBox: `0 0 ${width} ${stateY + state.height + marginY}`,
    boxes: [
      withPosition(client, marginX, leftY),
      withPosition(singleton, singletonX, singletonY),
      withPosition(clients, singletonX + singleton.width + columnGap, rightY),
      withPosition(state, stateX, stateY),
    ],
  }
}
