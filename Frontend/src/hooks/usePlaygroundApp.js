import { startTransition, useEffect, useMemo, useState } from 'react'
import {
  changeUserPassword,
  executePattern,
  getCurrentUser,
  getPatternSvgScene,
  getPatternUml,
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
  inferPatternUseCaseCategory,
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
  const [catalogFilters, setCatalogFilters] = useState({
    type: 'ALL',
    level: 'ALL',
    useCase: 'ALL',
  })
  const [catalogPage, setCatalogPage] = useState(1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authFormValues, setAuthFormValues] = useState({ username: '', password: '' })
  const [passwordChangeValues, setPasswordChangeValues] = useState({ currentPassword: '', newPassword: '' })
  const [authError, setAuthError] = useState('')
  const [authPending, setAuthPending] = useState(false)
  const [passwordChangePending, setPasswordChangePending] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => loadPersistedUser())
  const [activeVisualModal, setActiveVisualModal] = useState(null)
  const [learningContent, setLearningContent] = useState(defaultLearningContent)
  const [umlDiagram, setUmlDiagram] = useState(null)
  const [svgScene, setSvgScene] = useState(null)
  const [previewExecution, setPreviewExecution] = useState(null)

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
    setSvgScene(null)

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

      try {
        const storedDiagram = await getPatternUml(activePatternCode)
        if (!ignore && storedDiagram?.diagram) {
          setUmlDiagram(storedDiagram.diagram)
        }
      } catch {
        // Keep the local fallback diagram when no persisted version exists.
      }

      try {
        const storedScene = await getPatternSvgScene(activePatternCode)
        if (!ignore && storedScene?.svgMarkup) {
          setSvgScene(storedScene)
        }
      } catch {
        // Keep the generated runtime scene when no persisted version exists.
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

  const catalogFilterOptions = useMemo(() => {
    const typeOptions = [
      { value: 'ALL', label: 'Tous les types' },
      ...Array.from(new Set(patterns.map((pattern) => pattern.type)))
        .filter(Boolean)
        .map((value) => ({ value, label: value })),
    ]
    const levelOptions = [
      { value: 'ALL', label: 'Tous les niveaux' },
      ...Array.from(new Set(patterns.map((pattern) => pattern.complexityLevel)))
        .filter(Boolean)
        .map((value) => ({ value, label: value })),
    ]
    const useCaseOptions = [
      { value: 'ALL', label: 'Tous les cas d usage' },
      ...Array.from(new Set(patterns.map((pattern) => inferPatternUseCaseCategory(pattern))))
        .filter(Boolean)
        .map((value) => ({ value, label: value })),
    ]

    return {
      type: typeOptions,
      level: levelOptions,
      useCase: useCaseOptions,
    }
  }, [patterns])

  const filteredPatterns = useMemo(() => (
    patterns.filter((pattern) => {
      if (catalogFilters.type !== 'ALL' && pattern.type !== catalogFilters.type) {
        return false
      }

      if (catalogFilters.level !== 'ALL' && pattern.complexityLevel !== catalogFilters.level) {
        return false
      }

      if (catalogFilters.useCase !== 'ALL' && inferPatternUseCaseCategory(pattern) !== catalogFilters.useCase) {
        return false
      }

      return true
    })
  ), [catalogFilters.level, catalogFilters.type, catalogFilters.useCase, patterns])

  const totalPatternPages = Math.max(1, Math.ceil(filteredPatterns.length / 3))
  const visiblePatterns = filteredPatterns.slice((catalogPage - 1) * 3, catalogPage * 3)

  useEffect(() => {
    setCatalogPage((currentPage) => Math.min(currentPage, totalPatternPages))
  }, [totalPatternPages])

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

  function updatePasswordChangeField(name, value) {
    setPasswordChangeValues((currentValues) => ({
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
      setPasswordChangeValues({ currentPassword: '', newPassword: '' })
      setIsAuthOpen(Boolean(response.user?.forcePasswordChange))
    } catch (error) {
      setAuthError(error.message ?? "L authentification a echoue.")
    } finally {
      setAuthPending(false)
    }
  }

  async function handlePasswordChangeSubmit(event) {
    event.preventDefault()
    setPasswordChangePending(true)
    setAuthError('')

    try {
      const response = await changeUserPassword(passwordChangeValues)
      applyAuthenticatedSession(response)
      setPasswordChangeValues({ currentPassword: '', newPassword: '' })
      setIsAuthOpen(false)
    } catch (error) {
      setAuthError(error.message ?? "La mise a jour du mot de passe a echoue.")
    } finally {
      setPasswordChangePending(false)
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
    setPasswordChangeValues({ currentPassword: '', newPassword: '' })
  }

  function handleCatalogFilterChange(filterName, nextValue) {
    startTransition(() => {
      setCatalogFilters((currentFilters) => ({
        ...currentFilters,
        [filterName]: nextValue,
      }))
      setCatalogPage(1)
    })
  }

  function handleCatalogPageChange(nextPage) {
    setCatalogPage(Math.max(1, Math.min(nextPage, totalPatternPages)))
  }

  return {
    route,
    patterns,
    visiblePatterns,
    filteredPatternsCount: filteredPatterns.length,
    catalogFilters,
    catalogFilterOptions,
    catalogPage,
    totalPatternPages,
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
    svgScene,
    visualExecution,
    visualSourceLabel,
    hasDraftChanges,
    isAuthOpen,
    authMode,
    authFormValues,
    passwordChangeValues,
    authError,
    authPending,
    passwordChangePending,
    isSceneModalOpen,
    isUmlModalOpen,
    navigate,
    openAuth,
    updateFieldValue,
    updateAuthField,
    updatePasswordChangeField,
    handleExecute,
    handleAuthSubmit,
    handlePasswordChangeSubmit,
    handleLogout,
    handleCatalogFilterChange,
    handleCatalogPageChange,
    setActiveVisualModal,
    setIsAuthOpen,
    setAuthMode,
    setAuthError,
    activePatternCode,
  }
}
