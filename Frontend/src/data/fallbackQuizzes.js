import { fallbackQuizzesByCode } from '../patterns/dataRegistry'

export const fallbackQuizzes = fallbackQuizzesByCode

export function getFallbackQuiz(code) {
  return fallbackQuizzes[code] ?? null
}
