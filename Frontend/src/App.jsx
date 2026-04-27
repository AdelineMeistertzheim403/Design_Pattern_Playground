import { Suspense, lazy } from 'react'
import SiteHeader from './components/SiteHeader'
import usePlaygroundApp from './hooks/usePlaygroundApp'
import SiteFooter from './components/SiteFooter'
import SeoHead from './components/SeoHead'
import {
  buildAdminSvgScenesPath,
  buildAdminUmlPath,
  buildLegalNoticePath,
  buildPatternPath,
  buildPatternQuizPath,
  buildProgressPath,
} from './app/playgroundUtils'

const AuthDialog = lazy(() => import('./components/AuthDialog'))
const ExecutionScene = lazy(() => import('./components/ExecutionScene'))
const HomePage = lazy(() => import('./pages/HomePage'))
const AdminSvgScenesPage = lazy(() => import('./pages/AdminSvgScenesPage'))
const AdminUmlPage = lazy(() => import('./pages/AdminUmlPage'))
const LegalNoticePage = lazy(() => import('./pages/LegalNoticePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PatternPage = lazy(() => import('./pages/PatternPage'))
const PatternQuizPage = lazy(() => import('./pages/PatternQuizPage'))
const QuizDashboardPage = lazy(() => import('./pages/QuizDashboardPage'))
const UmlDiagram = lazy(() => import('./components/UmlDiagram'))
const VisualizationModal = lazy(() => import('./components/VisualizationModal'))

function PageLoadingFallback() {
  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full rounded-[28px] border border-black/10 bg-white/80 px-5 py-10 text-sm leading-7 text-stone-600 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
        Chargement de la page...
      </div>
    </div>
  )
}

function PatternModals({
  route,
  selectedPattern,
  isSceneModalOpen,
  isUmlModalOpen,
  setActiveVisualModal,
  visualExecution,
  visualSourceLabel,
  umlDiagram,
  svgScene,
}) {
  if (route.name !== 'pattern' || !selectedPattern) {
    return null
  }

  return (
    <>
      {isSceneModalOpen ? (
        <Suspense fallback={null}>
          <VisualizationModal
            title={`Scene SVG ${selectedPattern.name}`}
            onClose={() => setActiveVisualModal(null)}
          >
            <ExecutionScene
              customSvgScene={svgScene}
              execution={visualExecution}
              isExpanded
              patternCode={selectedPattern.code}
              sourceLabel={visualSourceLabel}
            />
          </VisualizationModal>
        </Suspense>
      ) : null}

      {isUmlModalOpen ? (
        <Suspense fallback={null}>
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
        </Suspense>
      ) : null}
    </>
  )
}

export default function App() {
  const {
    route,
    patterns,
    visiblePatterns,
    filteredPatternsCount,
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
  } = usePlaygroundApp()

  const pageKind = route.name === 'home'
    ? 'home'
    : route.name === 'pattern' && selectedPattern
      ? 'pattern'
      : route.name === 'quiz' && selectedPattern
        ? 'quiz'
        : route.name === 'progress'
          ? 'progress'
          : route.name === 'adminUml' || route.name === 'adminSvgScenes'
            ? 'admin'
          : route.name === 'legalNotice'
            ? 'legalNotice'
            : 'notFound'

  return (
    <div className="flex min-h-screen flex-col">
      <SeoHead
        learningContent={learningContent}
        pageKind={pageKind}
        patterns={patterns}
        selectedPattern={selectedPattern}
      />

      <SiteHeader
        currentUser={currentUser}
        routeName={route.name}
        status={status}
        onNavigateHome={() => navigate('/')}
        onNavigateProgress={() => navigate(buildProgressPath())}
        onNavigateAdminUml={() => navigate(buildAdminUmlPath())}
        onNavigateAdminSvgScenes={() => navigate(buildAdminSvgScenesPath())}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          {route.name === 'home' ? (
            <HomePage
              currentUser={currentUser}
              patterns={patterns}
              visiblePatterns={visiblePatterns}
              filteredPatternsCount={filteredPatternsCount}
              catalogFilters={catalogFilters}
              catalogFilterOptions={catalogFilterOptions}
              catalogPage={catalogPage}
              totalPatternPages={totalPatternPages}
              status={status}
              onOpenAuth={openAuth}
              onOpenPattern={(code) => navigate(buildPatternPath(code))}
              onCatalogFilterChange={handleCatalogFilterChange}
              onCatalogPageChange={handleCatalogPageChange}
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
              svgScene={svgScene}
              visualExecution={visualExecution}
              visualSourceLabel={visualSourceLabel}
              onFieldValueChange={updateFieldValue}
              onNavigateHome={() => navigate('/')}
              onNavigatePattern={(code) => navigate(buildPatternPath(code))}
              onNavigateQuiz={() => {
                if (currentUser) {
                  navigate(buildPatternQuizPath(selectedPattern.code))
                  return
                }

                openAuth('login')
              }}
              onOpenAuth={openAuth}
              onSubmit={handleExecute}
            />
          ) : route.name === 'quiz' && selectedPattern ? (
            <PatternQuizPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              selectedPattern={selectedPattern}
              status={status}
              onNavigateHome={() => navigate('/')}
              onNavigatePattern={() => navigate(buildPatternPath(selectedPattern.code))}
              onOpenAuth={openAuth}
            />
          ) : route.name === 'progress' ? (
            <QuizDashboardPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              onNavigateHome={() => navigate('/')}
              onOpenAuth={openAuth}
              onOpenPattern={(code) => navigate(buildPatternPath(code))}
              onOpenQuiz={(code) => navigate(buildPatternQuizPath(code))}
            />
          ) : route.name === 'adminUml' ? (
            <AdminUmlPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              patterns={patterns}
              onNavigateHome={() => navigate('/')}
            />
          ) : route.name === 'adminSvgScenes' ? (
            <AdminSvgScenesPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              patterns={patterns}
              onNavigateHome={() => navigate('/')}
            />
          ) : route.name === 'legalNotice' ? (
            <LegalNoticePage onNavigateHome={() => navigate('/')} />
          ) : (
            <NotFoundPage onNavigateHome={() => navigate('/')} />
          )}
        </Suspense>
      </main>

      <SiteFooter onNavigateLegalNotice={() => navigate(buildLegalNoticePath())} />

      <PatternModals
        isSceneModalOpen={isSceneModalOpen}
        isUmlModalOpen={isUmlModalOpen}
        route={route}
        selectedPattern={selectedPattern}
        setActiveVisualModal={setActiveVisualModal}
        umlDiagram={umlDiagram}
        svgScene={svgScene}
        visualExecution={visualExecution}
        visualSourceLabel={visualSourceLabel}
      />

      {isAuthOpen ? (
        <Suspense fallback={null}>
          <AuthDialog
            backendStatus={backendStatus}
            currentUser={currentUser}
            error={authError}
            formValues={authFormValues}
            isOpen={isAuthOpen}
            mode={authMode}
            pending={authPending}
            passwordChangePending={passwordChangePending}
            passwordChangeValues={passwordChangeValues}
            onClose={() => setIsAuthOpen(false)}
            onFieldChange={updateAuthField}
            onLogout={handleLogout}
            onModeChange={(nextMode) => {
              setAuthMode(nextMode)
              setAuthError('')
            }}
            onPasswordChangeField={updatePasswordChangeField}
            onPasswordChangeSubmit={handlePasswordChangeSubmit}
            onSubmit={handleAuthSubmit}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
