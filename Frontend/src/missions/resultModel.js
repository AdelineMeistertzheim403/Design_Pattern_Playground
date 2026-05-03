function formatMetricValue(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? `${value}` : value.toFixed(1)
  }

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non'
  }

  return `${value}`
}

function extractStageMetrics(output) {
  if (!output || typeof output !== 'object' || Array.isArray(output)) {
    return []
  }

  return Object.entries(output)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .slice(0, 3)
    .map(([key, value]) => ({
      key,
      value: formatMetricValue(value),
    }))
}

export function buildMissionStageSteps({ result, patternsByCode }) {
  return (result.executionOrder ?? [])
    .map((patternCode, index) => {
      const report = result.patternReports.find((entry) => entry.patternCode === patternCode)
      const execution = result.executionResults[patternCode]
      const pattern = patternsByCode[patternCode]

      if (!report || !execution) {
        return null
      }

      return {
        id: `mission-step-${patternCode}`,
        title: pattern?.name ?? patternCode,
        stageLabel: `Phase ${index + 1}`,
        summary: report.summary,
        status: report.ok ? 'validated' : 'fragile',
        metrics: extractStageMetrics(execution.output),
        logPreview: (execution.logs ?? []).slice(0, 3),
        patternCode,
      }
    })
    .filter(Boolean)
}

export function buildMissionSceneData({ result, patternsByCode }) {
  return {
    stageSteps: buildMissionStageSteps({ result, patternsByCode }),
  }
}

export function buildMissionResult({
  evaluation,
  executionResults,
  normalizedConfigurations,
  patternsByCode,
}) {
  const baseResult = {
    ...evaluation,
    executionResults,
    normalizedConfigurations,
  }

  return {
    ...baseResult,
    sceneData: buildMissionSceneData({
      patternsByCode,
      result: baseResult,
    }),
  }
}
