import { useEffect, useState } from 'react'
import { getPatternQuiz } from '../lib/api'
import { loadFallbackQuiz } from '../patterns/loaders'
import { normalizeQuiz } from '../quiz/quizUtils'

export default function usePatternQuiz(patternCode, patternComplexityLevel, backendStatus, enabled = true) {
  const [quiz, setQuiz] = useState(null)
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

    setQuiz(null)
    setQuizError('')
    setIsQuizLoading(true)

    const loadQuiz = async () => {
      const localQuiz = normalizeQuiz(
        await loadFallbackQuiz(patternCode),
        patternComplexityLevel,
      )

      if (!ignore) {
        setQuiz(localQuiz)
      }

      if (backendStatus !== 'connected') {
        if (!ignore) {
          setIsQuizLoading(false)

          if (!localQuiz) {
            setQuizError("Le quiz n a pas pu etre charge.")
          }
        }
        return
      }

      try {
        const remoteQuiz = await getPatternQuiz(patternCode)
        if (!ignore) {
          setQuiz(normalizeQuiz(remoteQuiz, patternComplexityLevel))
        }
      } catch (error) {
        if (!ignore && !localQuiz) {
          setQuizError(error.message ?? "Le quiz n a pas pu etre charge.")
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
