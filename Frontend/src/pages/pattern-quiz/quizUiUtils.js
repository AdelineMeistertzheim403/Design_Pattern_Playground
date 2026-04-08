export const difficultyLabels = {
  EASY: 'Facile',
  MEDIUM: 'Intermediaire',
  HARD: 'Avancee',
}

export function cloneAnswer(answer) {
  if (Array.isArray(answer)) {
    return [...answer]
  }

  if (answer && typeof answer === 'object') {
    return { ...answer }
  }

  return answer
}

export function getMasteryLabel(percent) {
  if (percent >= 90) {
    return 'Maitrise forte'
  }

  if (percent >= 75) {
    return 'Quiz valide'
  }

  if (percent >= 50) {
    return 'Base acquise'
  }

  return 'A consolider'
}
