// Layout UML pour Observer.

import { withPosition } from './patternLayoutUtils'

export function buildObserverLayout(boxesById) {
  const subject = boxesById.subject
  const observer = boxesById.observer
  const subscriber = boxesById.subscriber

  if (!subject || !observer || !subscriber) {
    return null
  }

  const marginX = 88
  const marginY = 74
  const columnGap = 162
  const rowGap = 144
  const topRowWidth = subject.width + columnGap + observer.width
  const width = marginX * 2 + topRowWidth
  const topY = marginY
  const bottomY = topY + Math.max(subject.height, observer.height) + rowGap
  const observerX = marginX + subject.width + columnGap
  const subscriberX = observerX + (observer.width - subscriber.width) / 2

  return {
    viewBox: `0 0 ${width} ${bottomY + subscriber.height + marginY}`,
    boxes: [
      withPosition(subject, marginX, topY),
      withPosition(observer, observerX, topY),
      withPosition(subscriber, subscriberX, bottomY),
    ],
  }
}
