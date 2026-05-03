import { evaluatePattern } from './validators'

export function evaluateMissionSolution({
  mission,
  selectedPatterns,
  configurations,
  executionResults,
  patternsByCode,
}) {
  const expectedPatterns = mission.expectedPatterns ?? []
  const missingPatterns = expectedPatterns.filter((patternCode) => !selectedPatterns.includes(patternCode))
  const unexpectedPatterns = selectedPatterns.filter((patternCode) => !expectedPatterns.includes(patternCode))
  const executionOrder = (mission.simulationOrder ?? selectedPatterns).filter((patternCode) => selectedPatterns.includes(patternCode))

  const patternReports = selectedPatterns.map((patternCode) => {
    const definition = patternsByCode[patternCode]
    const validation = evaluatePattern(patternCode, configurations[patternCode] ?? {})
    const execution = executionResults[patternCode] ?? null

    return {
      patternCode,
      patternName: definition?.name ?? patternCode,
      selected: true,
      expected: expectedPatterns.includes(patternCode),
      execution,
      ...validation,
    }
  })

  const matchedExpectedCount = expectedPatterns.filter((patternCode) => selectedPatterns.includes(patternCode)).length
  const validatedExpectedCount = expectedPatterns.filter((patternCode) => (
    patternReports.some((report) => report.patternCode === patternCode && report.ok)
  )).length

  const expectedSelectionScore = expectedPatterns.length
    ? (matchedExpectedCount / expectedPatterns.length) * 60
    : 60
  const configScore = expectedPatterns.length
    ? (validatedExpectedCount / expectedPatterns.length) * 40
    : 40
  const penaltyScore = unexpectedPatterns.length * 8
  const rawScore = Math.round(expectedSelectionScore + configScore - penaltyScore)
  const score = Math.max(0, Math.min(100, rawScore))

  const success = missingPatterns.length === 0
    && expectedPatterns.every((patternCode) => patternReports.some((report) => report.patternCode === patternCode && report.ok))

  const strengths = patternReports
    .filter((report) => report.selected && report.ok)
    .map((report) => `${report.patternName}: ${report.summary}`)

  const gaps = [
    ...(missingPatterns.length ? ['La solution ne couvre pas encore tous les besoins structurels de la mission.'] : []),
    ...patternReports
      .filter((report) => report.selected && !report.ok)
      .map((report) => `${report.patternName}: ${report.summary}`),
    ...unexpectedPatterns.map((patternCode) => {
      const definition = patternsByCode[patternCode]
      return `${definition?.name ?? patternCode}: ce choix ajoute de la complexite sans couvrir le coeur du probleme.`
    }),
  ]

  const feedback = success
    ? 'La mission tient la route: la combinaison choisie couvre bien le probleme et la simulation confirme la qualite de la solution.'
    : score >= 70
      ? 'La direction est bonne, mais la solution reste incomplete ou trop fragile sur certains points.'
      : 'La mission n est pas encore resolue. Le choix ou la configuration restent trop eloignes du probleme cible.'

  const logs = [
    `Mission analysee: ${mission.title}`,
    `Patterns selectionnes: ${selectedPatterns.length ? selectedPatterns.join(', ') : 'aucun'}`,
    ...patternReports.map((report) => `${report.patternName}: ${report.summary}`),
  ]

  const focusPattern = mission.preferredSimulationPattern && selectedPatterns.includes(mission.preferredSimulationPattern)
    ? mission.preferredSimulationPattern
    : executionOrder[0]
      ?? selectedPatterns[0]
      ?? mission.preferredSimulationPattern
      ?? null

  return {
    success,
    score,
    feedback,
    logs,
    strengths,
    gaps,
    missingPatterns,
    unexpectedPatterns,
    patternReports,
    focusPattern,
    executionOrder,
    validatedPatternCount: patternReports.filter((report) => report.ok).length,
  }
}
