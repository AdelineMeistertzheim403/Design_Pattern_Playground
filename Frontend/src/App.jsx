import { Suspense, lazy, useState } from 'react'
import SiteHeader from './components/SiteHeader'
import usePlaygroundApp from './hooks/usePlaygroundApp'
import SiteFooter from './components/SiteFooter'
import SeoHead from './components/SeoHead'
import {
  buildAdminSvgScenesPath,
  buildAdminUmlPath,
  buildBadgesPath,
  buildLegalNoticePath,
  buildMissionPath,
  buildPatternPath,
  buildPatternQuizPath,
  buildProgressPath,
  buildRecentActivityPath,
  buildSvgSceneStudioPath,
  buildUmlStudioPath,
} from './app/playgroundUtils'
import { savePendingUmlStudioLaunch } from './app/umlStudioStorage'

const AuthDialog = lazy(() => import('./components/AuthDialog'))
const BadgesPage = lazy(() => import('./pages/BadgesPage'))
const ExecutionScene = lazy(() => import('./components/ExecutionScene'))
const HomePage = lazy(() => import('./pages/HomePage'))
const AdminSvgScenesPage = lazy(() => import('./pages/AdminSvgScenesPage'))
const AdminUmlPage = lazy(() => import('./pages/AdminUmlPage'))
const LegalNoticePage = lazy(() => import('./pages/LegalNoticePage'))
const MissionPage = lazy(() => import('./pages/MissionPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PatternPage = lazy(() => import('./pages/PatternPage'))
const PatternQuizPage = lazy(() => import('./pages/PatternQuizPage'))
const QuizDashboardPage = lazy(() => import('./pages/QuizDashboardPage'))
const RecentActivityPage = lazy(() => import('./pages/RecentActivityPage'))
const UmlStudioLaunchModal = lazy(() => import('./components/UmlStudioLaunchModal'))
const UmlStudioPage = lazy(() => import('./pages/UmlStudioPage'))
const SvgSceneStudioPage = lazy(() => import('./pages/SvgSceneStudioPage'))
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
  const [isUmlStudioLaunchOpen, setIsUmlStudioLaunchOpen] = useState(false)
  const [umlStudioLaunchRequest, setUmlStudioLaunchRequest] = useState(null)
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
    executionSource,
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
        : route.name === 'missions'
          ? 'missions'
        : route.name === 'progress' || route.name === 'badges' || route.name === 'activity'
          ? 'progress'
          : route.name === 'adminUml' || route.name === 'adminSvgScenes' || route.name === 'umlStudio' || route.name === 'svgSceneStudio'
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
        onOpenUmlStudio={() => setIsUmlStudioLaunchOpen(true)}
        onNavigateAdminUml={() => navigate(buildAdminUmlPath())}
        onNavigateMissions={() => navigate(buildMissionPath())}
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
              executionSource={executionSource}
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
              onOpenBadges={() => navigate(buildBadgesPath())}
              onOpenActivity={() => navigate(buildRecentActivityPath())}
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
          ) : route.name === 'umlStudio' ? (
            <UmlStudioPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              launchRequest={umlStudioLaunchRequest}
              patterns={patterns}
              onOpenAuth={openAuth}
              onNavigateHome={() => navigate('/')}
            />
          ) : route.name === 'svgSceneStudio' ? (
            <SvgSceneStudioPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              launchRequest={umlStudioLaunchRequest}
              patterns={patterns}
              onOpenAuth={openAuth}
              onNavigateHome={() => navigate('/')}
            />
          ) : route.name === 'activity' ? (
            <RecentActivityPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              onNavigateHome={() => navigate('/')}
              onNavigateProgress={() => navigate(buildProgressPath())}
              onNavigateLink={(href) => navigate(href)}
              onOpenAuth={openAuth}
            />
          ) : route.name === 'badges' ? (
            <BadgesPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              onNavigateHome={() => navigate('/')}
              onNavigateProgress={() => navigate(buildProgressPath())}
              onOpenAuth={openAuth}
            />
          ) : route.name === 'missions' ? (
            <MissionPage
              backendStatus={backendStatus}
              currentUser={currentUser}
              initialMissionId={route.missionId ?? null}
              patterns={patterns}
              onNavigateMission={(missionId) => navigate(buildMissionPath(missionId))}
              onNavigatePattern={(code) => navigate(buildPatternPath(code))}
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

      {isUmlStudioLaunchOpen ? (
        <Suspense fallback={null}>
          <UmlStudioLaunchModal
            backendStatus={backendStatus}
            currentUser={currentUser}
            patterns={patterns}
            onClose={() => setIsUmlStudioLaunchOpen(false)}
            onCreateBlank={(editorType, diagramType = 'class') => {
              const payload = { editorType, diagramType, kind: 'blank', requestId: Date.now() }
              savePendingUmlStudioLaunch(payload)
              setUmlStudioLaunchRequest(payload)
              setIsUmlStudioLaunchOpen(false)
              navigate(editorType === 'svg-scene' ? buildSvgSceneStudioPath() : buildUmlStudioPath())
            }}
            onOpenSaved={({ editorType, storage, id }) => {
              const payload = { editorType, kind: 'saved', storage, id, requestId: Date.now() }
              savePendingUmlStudioLaunch(payload)
              setUmlStudioLaunchRequest(payload)
              setIsUmlStudioLaunchOpen(false)
              navigate(editorType === 'svg-scene' ? buildSvgSceneStudioPath() : buildUmlStudioPath())
            }}
            onOpenTemplate={(editorType, patternCode, diagramType = 'class') => {
              const payload = { editorType, diagramType, kind: 'template', code: patternCode, requestId: Date.now() }
              savePendingUmlStudioLaunch(payload)
              setUmlStudioLaunchRequest(payload)
              setIsUmlStudioLaunchOpen(false)
              navigate(editorType === 'svg-scene' ? buildSvgSceneStudioPath() : buildUmlStudioPath())
            }}
          />
        </Suspense>
      ) : null}

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
