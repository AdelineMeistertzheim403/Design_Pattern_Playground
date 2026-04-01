export function createInitialAnswer(question) {
  if (!question) {
    return null
  }

  if (question.type === 'QCM_SINGLE' || question.type === 'TRUE_FALSE') {
    return ''
  }

  if (question.type === 'QCM_MULTIPLE') {
    return []
  }

  if (question.type === 'MATCHING') {
    return Object.fromEntries((question.leftItems ?? []).map((item) => [item.id, '']))
  }

  if (question.type === 'ORDERING') {
    return (question.orderingItems ?? []).map((item) => item.id)
  }

  return null
}

export function getPointsForQuestion(patternComplexityLevel, questionDifficulty) {
  const complexity = `${patternComplexityLevel ?? ''}`.trim().toUpperCase()
  const difficulty = `${questionDifficulty ?? ''}`.trim().toUpperCase()

  if (complexity === 'ADVANCED') {
    if (difficulty === 'HARD') return 30
    if (difficulty === 'MEDIUM') return 22
    return 15
  }

  if (complexity === 'INTERMEDIATE') {
    if (difficulty === 'HARD') return 24
    if (difficulty === 'MEDIUM') return 18
    return 12
  }

  if (difficulty === 'HARD') return 20
  if (difficulty === 'MEDIUM') return 15
  return 10
}

export function normalizeQuiz(quiz, patternComplexityLevel) {
  if (!quiz) {
    return null
  }

  const questions = (quiz.questions ?? []).map((question) => {
    const points = Number.isFinite(question.points) && question.points > 0
      ? question.points
      : getPointsForQuestion(patternComplexityLevel, question.difficulty)

    return {
      ...question,
      points,
      difficulty: question.difficulty ?? 'MEDIUM',
      choices: question.choices ?? [],
      correctChoiceIds: question.correctChoiceIds ?? [],
      leftItems: question.leftItems ?? [],
      rightItems: question.rightItems ?? [],
      correctPairs: question.correctPairs ?? [],
      orderingItems: question.orderingItems ?? [],
      correctOrder: question.correctOrder ?? [],
    }
  })

  return {
    ...quiz,
    passingPercent: quiz.passingPercent ?? 75,
    badgeLabel: quiz.badgeLabel ?? 'Badge valide',
    maxPoints: questions.reduce((sum, question) => sum + question.points, 0),
    questions,
  }
}

export function isAnswerComplete(question, answer) {
  if (!question) {
    return false
  }

  if (question.type === 'QCM_SINGLE' || question.type === 'TRUE_FALSE') {
    return Boolean(answer)
  }

  if (question.type === 'QCM_MULTIPLE') {
    return Array.isArray(answer) && answer.length > 0
  }

  if (question.type === 'MATCHING') {
    return Object.values(answer ?? {}).every(Boolean)
  }

  if (question.type === 'ORDERING') {
    return Array.isArray(answer) && answer.length === (question.orderingItems ?? []).length
  }

  return false
}

function areArraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

export function evaluateQuestion(question, answer) {
  if (!question) {
    return {
      isCorrect: false,
      explanation: '',
      correctAnswer: null,
      earnedPoints: 0,
      availablePoints: 0,
    }
  }

  if (question.type === 'QCM_SINGLE' || question.type === 'TRUE_FALSE') {
    const expected = question.correctChoiceIds?.[0] ?? ''
    const isCorrect = answer === expected
    return {
      isCorrect,
      explanation: question.explanation,
      correctAnswer: expected,
      earnedPoints: isCorrect ? question.points ?? 0 : 0,
      availablePoints: question.points ?? 0,
    }
  }

  if (question.type === 'QCM_MULTIPLE') {
    const expected = [...(question.correctChoiceIds ?? [])].sort()
    const submitted = [...(Array.isArray(answer) ? answer : [])].sort()
    const isCorrect = areArraysEqual(submitted, expected)

    return {
      isCorrect,
      explanation: question.explanation,
      correctAnswer: expected,
      earnedPoints: isCorrect ? question.points ?? 0 : 0,
      availablePoints: question.points ?? 0,
    }
  }

  if (question.type === 'MATCHING') {
    const expectedMap = Object.fromEntries((question.correctPairs ?? []).map((pair) => [pair.leftId, pair.rightId]))
    const submittedEntries = Object.entries(answer ?? {})
    const isCorrect = submittedEntries.length === Object.keys(expectedMap).length
      && submittedEntries.every(([leftId, rightId]) => expectedMap[leftId] === rightId)

    return {
      isCorrect,
      explanation: question.explanation,
      correctAnswer: expectedMap,
      earnedPoints: isCorrect ? question.points ?? 0 : 0,
      availablePoints: question.points ?? 0,
    }
  }

  if (question.type === 'ORDERING') {
    const expected = question.correctOrder ?? []
    const submitted = Array.isArray(answer) ? answer : []
    const isCorrect = areArraysEqual(submitted, expected)

    return {
      isCorrect,
      explanation: question.explanation,
      correctAnswer: expected,
      earnedPoints: isCorrect ? question.points ?? 0 : 0,
      availablePoints: question.points ?? 0,
    }
  }

  return {
    isCorrect: false,
    explanation: question.explanation ?? '',
    correctAnswer: null,
    earnedPoints: 0,
    availablePoints: question.points ?? 0,
  }
}

export function getChoiceLabel(question, choiceId) {
  return (question.choices ?? []).find((choice) => choice.id === choiceId)?.label ?? choiceId
}

export function getMatchingRightLabel(question, rightId) {
  return (question.rightItems ?? []).find((item) => item.id === rightId)?.label ?? rightId
}

export function moveOrderingItem(answer, fromIndex, toIndex) {
  if (!Array.isArray(answer) || toIndex < 0 || toIndex >= answer.length) {
    return answer
  }

  const next = [...answer]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export function serializeQuizAnswer(question, answer) {
  if (!question) {
    return null
  }

  if (question.type === 'QCM_SINGLE' || question.type === 'TRUE_FALSE') {
    return {
      questionId: question.id,
      selectedChoiceIds: answer ? [answer] : [],
    }
  }

  if (question.type === 'QCM_MULTIPLE') {
    return {
      questionId: question.id,
      selectedChoiceIds: Array.isArray(answer) ? answer : [],
    }
  }

  if (question.type === 'MATCHING') {
    return {
      questionId: question.id,
      matchingAnswers: answer && typeof answer === 'object' ? answer : {},
    }
  }

  if (question.type === 'ORDERING') {
    return {
      questionId: question.id,
      orderedItemIds: Array.isArray(answer) ? answer : [],
    }
  }

  return {
    questionId: question.id,
  }
}

export function summarizeCompletedQuiz(quiz, completedQuestions) {
  const questionCount = quiz?.questions?.length ?? 0
  const correctAnswers = completedQuestions.filter((result) => result.isCorrect).length
  const earnedPoints = completedQuestions.reduce((sum, result) => sum + (result.earnedPoints ?? 0), 0)
  const maxPoints = quiz?.maxPoints ?? 0
  const correctPercent = questionCount === 0 ? 0 : Math.round((correctAnswers / questionCount) * 100)
  const pointsPercent = maxPoints === 0 ? 0 : Math.round((earnedPoints / maxPoints) * 100)
  const passingPercent = quiz?.passingPercent ?? 75

  return {
    correctAnswers,
    questionCount,
    correctPercent,
    earnedPoints,
    maxPoints,
    pointsPercent,
    badgeUnlocked: correctPercent >= passingPercent,
    badgeLabel: quiz?.badgeLabel ?? 'Badge valide',
    passingPercent,
  }
}
