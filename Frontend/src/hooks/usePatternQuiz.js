import { useEffect, useState } from 'react'
import { getFallbackQuiz } from '../data/fallbackQuizzes'
import { getPatternQuiz } from '../lib/api'
import { normalizeQuiz } from '../quiz/quizUtils'

export default function usePatternQuiz(patternCode, patternComplexityLevel, backendStatus, enabled = true) {
  const [quiz, setQuiz] = useState(() => (
    enabled ? normalizeQuiz(getFallbackQuiz(patternCode), patternComplexityLevel) : null
  ))
  const [quizError, setQuizError] = useState('')
  const [isQuizLoading, setIsQuizLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    if (!enabled || !patternCode) {
      setQuiz(null)
      setQuizError('')
      setIsQuizLoading(false)
      return () => {
        ignore = true
      }
    }

    const localQuiz = normalizeQuiz(getFallbackQuiz(patternCode), patternComplexityLevel)
    setQuiz(localQuiz)
    setQuizError('')

    const loadQuiz = async () => {
      if (backendStatus !== 'connected') {
        return
      }

      setIsQuizLoading(true)

      try {
        const remoteQuiz = await getPatternQuiz(patternCode)
        if (!ignore) {
          setQuiz(normalizeQuiz(remoteQuiz, patternComplexityLevel))
        }
      } catch (error) {
        if (!ignore) {
          if (!localQuiz) {
            setQuizError(error.message ?? "Le quiz n a pas pu etre charge.")
          }
        }
      } finally {
        if (!ignore) {
          setIsQuizLoading(false)
        }
      }
    }

    loadQuiz()

    return () => {
      ignore = true
    }
  }, [backendStatus, enabled, patternCode, patternComplexityLevel])

  return {
    quiz,
    quizError,
    isQuizLoading,
  }
}
