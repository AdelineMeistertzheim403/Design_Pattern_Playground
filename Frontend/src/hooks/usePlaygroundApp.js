import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import {
  executePattern,
  getCurrentUser,
  getPatternSchema,
  getPatterns,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../lib/api'
import { statusMap } from '../app/playgroundConstants'
import { defaultPatternCode, fallbackPatterns, fallbackPatternsByCode } from '../patterns/catalog'
import { defaultLearningContent, emptyPatternSchema } from '../patterns/defaults'
import {
  executeFallbackPattern,
  loadFallbackSchema,
  loadPatternLearningContent,
  loadPatternUmlDiagram,
} from '../patterns/loaders'
import {
  buildInitialParameters,
  clearPersistedSession,
  loadPersistedUser,
  normalizeParameters,
  parseRoute,
  persistSession,
} from '../app/playgroundUtils'

export default function usePlaygroundApp() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname))
  const [patterns, setPatterns] = useState(fallbackPatterns)
  const [schema, setSchema] = useState(emptyPatternSchema)
  const [formValues, setFormValues] = useState({})
  const [execution, setExecution] = useState(null)
  const [executionError, setExecutionError] = useState('')
  const [lastExecutedPayload, setLastExecutedPayload] = useState(null)
  const [backendStatus, setBackendStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authFormValues, setAuthFormValues] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authPending, setAuthPending] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => loadPersistedUser())
  const [activeVisualModal, setActiveVisualModal] = useState(null)
  const [learningContent, setLearningContent] = useState(defaultLearningContent)
  const [umlDiagram, setUmlDiagram] = useState(null)
  const [previewExecution, setPreviewExecution] = useState(null)
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const loadPatterns = async () => {
      try {
        const apiPatterns = await getPatterns()
        if (ignore || apiPatterns.length === 0) {
          return
        }

        setPatterns(apiPatterns)
        setBackendStatus('connected')
      } catch {
        if (!ignore) {
          setPatterns(fallbackPatterns)
          setBackendStatus('fallback')
        }
      }
    }

    loadPatterns()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (backendStatus !== 'connected') {
      return
    }

    let ignore = false

    const syncCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        if (ignore) {
          return
        }

        setCurrentUser(user)
        persistSession(user)
      } catch {
        try {
          const response = await refreshUserSession()
          if (ignore) {
            return
          }

          setCurrentUser(response.user)
          persistSession(response.user)
        } catch {
          if (!ignore) {
            clearPersistedSession()
            setCurrentUser(null)
          }
        }
      }
    }

    syncCurrentUser()

    return () => {
      ignore = true
    }
  }, [backendStatus])

  const selectedPattern = route.name === 'pattern' || route.name === 'quiz'
    ? (
      patterns.find((pattern) => pattern.code === route.code)
      ?? fallbackPatternsByCode[route.code]
      ?? null
    )
    : null

  const activePatternCode = selectedPattern?.code ?? defaultPatternCode
  const shouldLoadPatternDetail = route.name === 'pattern' && Boolean(selectedPattern)

  useEffect(() => {
    setActiveVisualModal(null)
  }, [route.name, activePatternCode])

  useEffect(() => {
    let ignore = false

    if (!shouldLoadPatternDetail) {
      return () => {
        ignore = true
      }
    }

    setExecution(null)
    setExecutionError('')
    setLastExecutedPayload(null)
    setPreviewExecution(null)

    const loadPatternDetail = async () => {
      const [localSchema, localLearningContent, localUmlDiagram] = await Promise.all([
        loadFallbackSchema(activePatternCode),
        loadPatternLearningContent(activePatternCode),
        loadPatternUmlDiagram(activePatternCode),
      ])

      if (ignore) {
        return
      }

      setSchema(localSchema)
      setFormValues(buildInitialParameters(localSchema))
      setLearningContent(localLearningContent)
      setUmlDiagram(localUmlDiagram)

      if (backendStatus !== 'connected' || !selectedPattern) {
        return
      }

      try {
        const apiSchema = await getPatternSchema(activePatternCode)
        if (!ignore) {
          setSchema(apiSchema)
          setFormValues(buildInitialParameters(apiSchema))
        }
      } catch {
        if (!ignore) {
          setBackendStatus('fallback')
        }
      }
    }

    loadPatternDetail()

    return () => {
      ignore = true
    }
  }, [activePatternCode, backendStatus, selectedPattern, shouldLoadPatternDetail])

  useEffect(() => {
    let ignore = false

    if (!shouldLoadPatternDetail || !schema?.fields?.length) {
      setPreviewExecution(null)
      return () => {
        ignore = true
      }
    }

    const loadPreview = async () => {
      try {
        const nextPreviewExecution = await executeFallbackPattern(
          activePatternCode,
          normalizeParameters(schema, formValues),
        )

        if (!ignore) {
          setPreviewExecution(nextPreviewExecution)
        }
      } catch {
        if (!ignore) {
          setPreviewExecution(null)
        }
      }
    }

    loadPreview()

    return () => {
      ignore = true
    }
  }, [activePatternCode, formValues, schema, shouldLoadPatternDetail])

  const visiblePatterns = patterns.filter((pattern) => {
    const haystack = `${pattern.name} ${pattern.type} ${pattern.description} ${pattern.useCase}`.toLowerCase()
    return haystack.includes(deferredSearch.trim().toLowerCase())
  })

  const status = statusMap[backendStatus] ?? statusMap.fallback

  const draftPayload = {
    patternCode: activePatternCode,
    parameters: normalizeParameters(schema, formValues),
  }

  const hasDraftChanges = Boolean(
    lastExecutedPayload
    && JSON.stringify(lastExecutedPayload) !== JSON.stringify(draftPayload),
  )

  const visualExecution = execution && !hasDraftChanges
    ? execution
    : (previewExecution ?? execution)

  const visualSourceLabel = execution && !hasDraftChanges ? 'Derniere execution' : 'Apercu live'
  const isSceneModalOpen = activeVisualModal === 'scene'
  const isUmlModalOpen = activeVisualModal === 'uml'

  function navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }

    setRoute(parseRoute(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openAuth(nextMode) {
    setAuthMode(nextMode)
    setAuthError('')
    setIsAuthOpen(true)
  }

  function updateFieldValue(field, nextValue) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field.name]: nextValue,
    }))
  }

  function updateAuthField(name, value) {
    setAuthFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleExecute(event) {
    event.preventDefault()
    setIsExecuting(true)
    setExecutionError('')

    const payload = draftPayload

    try {
      const result = backendStatus === 'connected'
        ? await executePattern(payload)
        : await executeFallbackPattern(activePatternCode, payload.parameters)

      setExecution(result)
      setLastExecutedPayload(payload)
    } catch (error) {
      if (backendStatus === 'connected') {
        setBackendStatus('fallback')

        try {
          setExecution(await executeFallbackPattern(activePatternCode, payload.parameters))
          setLastExecutedPayload(payload)
        } catch {
          setExecution(null)
          setLastExecutedPayload(null)
          setExecutionError(error.message ?? "L execution a echoue.")
        }
      } else {
        setExecution(null)
        setLastExecutedPayload(null)
        setExecutionError(error.message ?? "L execution a echoue.")
      }
    } finally {
      setIsExecuting(false)
    }
  }

  function applyAuthenticatedSession(response) {
    persistSession(response.user)
    setCurrentUser(response.user)
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthPending(true)
    setAuthError('')

    try {
      const response = authMode === 'register'
        ? await registerUser(authFormValues)
        : await loginUser(authFormValues)

      applyAuthenticatedSession(response)
      setAuthFormValues({ username: '', password: '' })
      setIsAuthOpen(false)
    } catch (error) {
      setAuthError(error.message ?? "L authentification a echoue.")
    } finally {
      setAuthPending(false)
    }
  }

  async function revokeSessionOnServer() {
    try {
      await logoutUser()
    } catch {
      // The local session will still be cleared below.
    }
  }

  async function handleLogout() {
    await revokeSessionOnServer()

    clearPersistedSession()
    setCurrentUser(null)
    setIsAuthOpen(false)
  }

  function handleSearchChange(event) {
    const nextValue = event.target.value
    startTransition(() => setSearch(nextValue))
  }

  return {
    route,
    patterns,
    visiblePatterns,
    search,
    status,
    backendStatus,
    currentUser,
    selectedPattern,
    schema,
    formValues,
    execution,
    executionError,
    isExecuting,
    learningContent,
    umlDiagram,
    visualExecution,
    visualSourceLabel,
    hasDraftChanges,
    isAuthOpen,
    authMode,
    authFormValues,
    authError,
    authPending,
    isSceneModalOpen,
    isUmlModalOpen,
    navigate,
    openAuth,
    updateFieldValue,
    updateAuthField,
    handleExecute,
    handleAuthSubmit,
    handleLogout,
    handleSearchChange,
    setActiveVisualModal,
    setIsAuthOpen,
    setAuthMode,
    setAuthError,
    activePatternCode,
  }
}
