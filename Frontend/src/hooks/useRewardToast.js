import { useEffect, useState } from 'react'

export default function useRewardToast(reward, durationMs = 5200) {
  const [visibleReward, setVisibleReward] = useState(null)

  useEffect(() => {
    if (!reward) {
      return undefined
    }

    setVisibleReward(reward)
    const timeoutId = window.setTimeout(() => {
      setVisibleReward(null)
    }, durationMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [durationMs, reward])

  return {
    rewardToast: visibleReward,
    dismissRewardToast: () => setVisibleReward(null),
  }
}
