import { useEffect, useState } from 'react'
import { getPatternQuizProgress } from '../lib/api'

export default function usePatternQuizProgress(patternCode, backendStatus, enabled = true) {
  const [progress, setProgress] = useState(null)
  const [progressError, setProgressError] = useState('')
  const [isProgressLoading, setIsProgressLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    if (!enabled || !patternCode || backendStatus !== 'connected') {
      setProgress(null)
      setProgressError('')
      setIsProgressLoading(false)
      return () => {
        ignore = true
      }
    }

    const loadProgress = async () => {
      setIsProgressLoading(true)
      setProgressError('')

      try {
        const nextProgress = await getPatternQuizProgress(patternCode)
        if (!ignore) {
          setProgress(nextProgress)
        }
      } catch (error) {
        if (!ignore) {
          setProgress(null)
          setProgressError(error.message ?? "La progression n a pas pu etre chargee.")
        }
      } finally {
        if (!ignore) {
          setIsProgressLoading(false)
        }
      }
    }

    loadProgress()

    return () => {
      ignore = true
    }
  }, [backendStatus, enabled, patternCode])

  return {
    progress,
    setProgress,
    progressError,
    isProgressLoading,
  }
}
