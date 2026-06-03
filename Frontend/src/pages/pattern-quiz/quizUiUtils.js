export const difficultyLabels = {
  EASY: 'Facile',
  MEDIUM: 'Intermédiaire',
  HARD: 'Avancée',
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
    return 'Maîtrise forte'
  }

  if (percent >= 75) {
    return 'Quiz validé'
  }

  if (percent >= 50) {
    return 'Base acquise'
  }

  return 'À consolider'
}
