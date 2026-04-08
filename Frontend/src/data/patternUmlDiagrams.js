import { patternUmlDiagramsByCode } from '../patterns/dataRegistry'

export const patternUmlDiagrams = patternUmlDiagramsByCode

export function getPatternUmlDiagram(code) {
  return patternUmlDiagrams[code] ?? null
}
