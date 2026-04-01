import AuthDialog from './components/AuthDialog'
import ExecutionScene from './components/ExecutionScene'
import SiteHeader from './components/SiteHeader'
import UmlDiagram from './components/UmlDiagram'
import VisualizationModal from './components/VisualizationModal'
import usePlaygroundApp from './hooks/usePlaygroundApp'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import PatternPage from './pages/PatternPage'
import { buildPatternPath } from './app/playgroundUtils'

function PatternModals({
  route,
  selectedPattern,
  isSceneModalOpen,
  isUmlModalOpen,
  setActiveVisualModal,
  visualExecution,
  visualSourceLabel,
  umlDiagram,
}) {
  if (route.name !== 'pattern' || !selectedPattern) {
    return null
  }

  return (
    <>
      {isSceneModalOpen ? (
        <VisualizationModal
          title={`Scene SVG ${selectedPattern.name}`}
          onClose={() => setActiveVisualModal(null)}
        >
          <ExecutionScene
            execution={visualExecution}
            isExpanded
            patternCode={selectedPattern.code}
            sourceLabel={visualSourceLabel}
          />
        </VisualizationModal>
      ) : null}

      {isUmlModalOpen ? (
        <VisualizationModal
          title={`Diagramme UML ${selectedPattern.name}`}
          onClose={() => setActiveVisualModal(null)}
        >
          <UmlDiagram
            diagram={umlDiagram}
            isExpanded
            patternCode={selectedPattern.code}
            patternName={selectedPattern.name}
          />
        </VisualizationModal>
      ) : null}
    </>
  )
}

export default function App() {
  const {
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
  } = usePlaygroundApp()

  return (
    <>
      <SiteHeader
        currentUser={currentUser}
        status={status}
        onNavigateHome={() => navigate('/')}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      {route.name === 'home' ? (
        <HomePage
          currentUser={currentUser}
          patterns={patterns}
          visiblePatterns={visiblePatterns}
          search={search}
          status={status}
          onOpenAuth={openAuth}
          onOpenPattern={(code) => navigate(buildPatternPath(code))}
          onSearchChange={handleSearchChange}
        />
      ) : route.name === 'pattern' && selectedPattern ? (
        <PatternPage
          currentUser={currentUser}
          execution={execution}
          executionError={executionError}
          formValues={formValues}
          hasDraftChanges={hasDraftChanges}
          isExecuting={isExecuting}
          learningContent={learningContent}
          onOpenSceneModal={() => setActiveVisualModal('scene')}
          onOpenUmlModal={() => setActiveVisualModal('uml')}
          patterns={patterns}
          schema={schema}
          selectedPattern={selectedPattern}
          status={status}
          umlDiagram={umlDiagram}
          visualExecution={visualExecution}
          visualSourceLabel={visualSourceLabel}
          onFieldValueChange={updateFieldValue}
          onNavigateHome={() => navigate('/')}
          onNavigatePattern={(code) => navigate(buildPatternPath(code))}
          onOpenAuth={openAuth}
          onSubmit={handleExecute}
        />
      ) : (
        <NotFoundPage onNavigateHome={() => navigate('/')} />
      )}

      <PatternModals
        isSceneModalOpen={isSceneModalOpen}
        isUmlModalOpen={isUmlModalOpen}
        route={route}
        selectedPattern={selectedPattern}
        setActiveVisualModal={setActiveVisualModal}
        umlDiagram={umlDiagram}
        visualExecution={visualExecution}
        visualSourceLabel={visualSourceLabel}
      />

      <AuthDialog
        backendStatus={backendStatus}
        currentUser={currentUser}
        error={authError}
        formValues={authFormValues}
        isOpen={isAuthOpen}
        mode={authMode}
        pending={authPending}
        onClose={() => setIsAuthOpen(false)}
        onFieldChange={updateAuthField}
        onLogout={handleLogout}
        onModeChange={(nextMode) => {
          setAuthMode(nextMode)
          setAuthError('')
        }}
        onSubmit={handleAuthSubmit}
      />
    </>
  )
}
