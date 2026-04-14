import { useEffect, useMemo, useState } from 'react'
import { buildInitialParameters, normalizeParameters } from '../../app/playgroundUtils'
import { executePattern, getPatternSchema, submitMissionResult } from '../../lib/api'
import { evaluateMissionSolution } from '../../missions/engine'
import { buildMissionResult } from '../../missions/resultModel'
import { executeFallbackPattern, loadFallbackSchema } from '../../patterns/loaders'
import { executeMissionPattern, mapPatternsByCode } from './missionPageShared'

export default function useMissionDetail({ backendStatus, currentUser, mission, patterns }) {
  const [selectedPatterns, setSelectedPatterns] = useState([])
  const [activeConfigPattern, setActiveConfigPattern] = useState(null)
  const [activeResultPattern, setActiveResultPattern] = useState(null)
  const [schemasByPattern, setSchemasByPattern] = useState({})
  const [configurations, setConfigurations] = useState({})
  const [result, setResult] = useState(null)
  const [executionPending, setExecutionPending] = useState(false)
  const [error, setError] = useState('')

  const patternsByCode = useMemo(() => mapPatternsByCode(patterns), [patterns])

  useEffect(() => {
    setSelectedPatterns([])
    setActiveConfigPattern(null)
    setActiveResultPattern(null)
    setSchemasByPattern({})
    setConfigurations({})
    setResult(null)
    setError('')
  }, [mission.id])

  useEffect(() => {
    let ignore = false

    async function loadSchemas() {
      const missingPatternCodes = selectedPatterns.filter((patternCode) => !schemasByPattern[patternCode])
      if (!missingPatternCodes.length) {
        return
      }

      const loadedEntries = await Promise.all(
        missingPatternCodes.map(async (patternCode) => {
          try {
            if (backendStatus === 'connected') {
              return [patternCode, await getPatternSchema(patternCode)]
            }
          } catch {
            // Fallback below.
          }

          return [patternCode, await loadFallbackSchema(patternCode)]
        }),
      )

      if (ignore) {
        return
      }

      setSchemasByPattern((currentSchemas) => {
        const nextSchemas = { ...currentSchemas }
        loadedEntries.forEach(([patternCode, schema]) => {
          nextSchemas[patternCode] = schema
        })
        return nextSchemas
      })

      setConfigurations((currentConfigurations) => {
        const nextConfigurations = { ...currentConfigurations }

        loadedEntries.forEach(([patternCode, schema]) => {
          if (!nextConfigurations[patternCode]) {
            nextConfigurations[patternCode] = buildInitialParameters(schema)
          }
        })

        return nextConfigurations
      })
    }

    loadSchemas()

    return () => {
      ignore = true
    }
  }, [backendStatus, schemasByPattern, selectedPatterns])

  useEffect(() => {
    if (!selectedPatterns.length) {
      setActiveConfigPattern(null)
      return
    }

    if (!activeConfigPattern || !selectedPatterns.includes(activeConfigPattern)) {
      setActiveConfigPattern(selectedPatterns[0])
    }
  }, [activeConfigPattern, selectedPatterns])

  useEffect(() => {
    if (!result) {
      setActiveResultPattern(null)
      return
    }

    if (!activeResultPattern || !result.executionResults[activeResultPattern]) {
      setActiveResultPattern(result.focusPattern ?? Object.keys(result.executionResults)[0] ?? null)
    }
  }, [activeResultPattern, result])

  function addPatternToSolution(patternCode) {
    if (!mission.candidatePatterns.includes(patternCode)) {
      return
    }

    setResult(null)
    setError('')

    setSelectedPatterns((currentPatterns) => (
      currentPatterns.includes(patternCode)
        ? currentPatterns
        : [...currentPatterns, patternCode]
    ))
  }

  function removePatternFromSolution(patternCode) {
    setResult(null)
    setError('')
    setSelectedPatterns((currentPatterns) => currentPatterns.filter((currentPattern) => currentPattern !== patternCode))
  }

  function handleConfigFieldChange(field, value) {
    if (!activeConfigPattern) {
      return
    }

    setConfigurations((currentConfigurations) => ({
      ...currentConfigurations,
      [activeConfigPattern]: {
        ...(currentConfigurations[activeConfigPattern] ?? {}),
        [field.name]: value,
      },
    }))
  }

  async function handleExecuteMission(event) {
    event.preventDefault()

    if (selectedPatterns.length === 0) {
      setError('Compose une solution avant de lancer la mission.')
      return
    }

    setExecutionPending(true)
    setError('')
    const startedAt = Date.now()

    try {
      const normalizedConfigurations = Object.fromEntries(
        selectedPatterns.map((patternCode) => {
          const schema = schemasByPattern[patternCode]
          const values = configurations[patternCode] ?? {}
          return [patternCode, schema ? normalizeParameters(schema, values) : values]
        }),
      )

      const executionEntries = await Promise.all(
        selectedPatterns.map(async (patternCode) => [
          patternCode,
          await executeMissionPattern({
            backendStatus,
            patternCode,
            parameters: normalizedConfigurations[patternCode],
            executePattern,
            executeFallbackPattern,
          }),
        ]),
      )

      const executionResults = Object.fromEntries(executionEntries)
      const evaluation = evaluateMissionSolution({
        mission,
        selectedPatterns,
        configurations: normalizedConfigurations,
        executionResults,
        patternsByCode,
      })

      let progression = null
      if (backendStatus === 'connected' && currentUser) {
        try {
          progression = await submitMissionResult({
            missionId: mission.id,
            success: evaluation.success,
            score: evaluation.score,
            durationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
            selectedPatterns,
          })
        } catch {
          progression = null
        }
      }

      setResult({
        ...buildMissionResult({
        evaluation,
        executionResults,
        normalizedConfigurations,
        patternsByCode,
        }),
        progression,
      })
    } catch (requestError) {
      setResult(null)
      setError(requestError.message ?? "L execution de la mission a echoue.")
    } finally {
      setExecutionPending(false)
    }
  }

  return {
    activeConfigPattern,
    activeExecution: activeResultPattern ? result?.executionResults?.[activeResultPattern] ?? null : null,
    activePatternConfig: activeConfigPattern ? (configurations[activeConfigPattern] ?? {}) : {},
    activeResultPattern,
    activeSchema: activeConfigPattern ? schemasByPattern[activeConfigPattern] : null,
    addPatternToSolution,
    error,
    executionPending,
    handleConfigFieldChange,
    handleExecuteMission,
    patternsByCode,
    removePatternFromSolution,
    result,
    selectedPatterns,
    setActiveConfigPattern,
    setActiveResultPattern,
  }
}
