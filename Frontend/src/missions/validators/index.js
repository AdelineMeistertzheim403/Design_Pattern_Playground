import { behavioralValidators } from './behavioralValidators'
import { creationalValidators } from './creationalValidators'
import { structuralValidators } from './structuralValidators'

export const patternValidators = {
  ...creationalValidators,
  ...structuralValidators,
  ...behavioralValidators,
}

export function evaluatePattern(patternCode, config) {
  const validator = patternValidators[patternCode]

  if (!validator) {
    return {
      ok: false,
      summary: 'Ce pattern n’est pas encore évalué par le moteur mission.',
    }
  }

  return validator(config)
}
