import { orderedPatternDefinitions, patternSchemasByCode } from '../patterns/dataRegistry'
import { fallbackExecutorsByCode } from '../patterns/executorRegistry'

export const fallbackPatterns = orderedPatternDefinitions

const fallbackSchemas = patternSchemasByCode
const defaultSchemaCode = 'strategy'

export function getFallbackSchema(code) {
  return fallbackSchemas[code] ?? fallbackSchemas[defaultSchemaCode]
}

export function executeFallbackPattern(code, parameters) {
  const executor = fallbackExecutorsByCode[code]

  if (!executor) {
    throw new Error(`No local executor available for ${code}`)
  }

  return executor(parameters)
}
