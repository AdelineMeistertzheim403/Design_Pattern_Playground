import { Suspense, lazy } from 'react'
import PatternConfigurationSection from './pattern-page/PatternConfigurationSection'
import PatternHeroSection from './pattern-page/PatternHeroSection'

const PatternExecutionResultSection = lazy(() => import('./pattern-page/PatternExecutionResultSection'))
const PatternLearningSection = lazy(() => import('./pattern-page/PatternLearningSection'))
const PatternVisualizationSection = lazy(() => import('./pattern-page/PatternVisualizationSection'))

function DeferredSectionPlaceholder({
  title,
  description,
  className = '',
}) {
  return (
    <section className={`rounded-[34px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Chargement</p>
      <h2 className="mt-3 text-3xl text-stone-950">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">{description}</p>
    </section>
  )
}

export default function PatternPage({
  selectedPattern,
  patterns,
  schema,
  formValues,
  execution,
  executionError,
  isExecuting,
  learningContent,
  umlDiagram,
  currentUser,
  status,
  onNavigateHome,
  onNavigatePattern,
  onNavigateQuiz,
  onOpenAuth,
  onFieldValueChange,
  onSubmit,
  visualExecution,
  visualSourceLabel,
  hasDraftChanges,
  onOpenSceneModal,
  onOpenUmlModal,
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <PatternHeroSection
        currentUser={currentUser}
        learningContent={learningContent}
        patterns={patterns}
        selectedPattern={selectedPattern}
        status={status}
        onNavigateHome={onNavigateHome}
        onNavigatePattern={onNavigatePattern}
        onNavigateQuiz={onNavigateQuiz}
        onOpenAuth={onOpenAuth}
      />

      <PatternConfigurationSection
        executionError={executionError}
        formValues={formValues}
        isExecuting={isExecuting}
        schema={schema}
        selectedPattern={selectedPattern}
        onFieldValueChange={onFieldValueChange}
        onSubmit={onSubmit}
      />

      <Suspense
        fallback={(
          <DeferredSectionPlaceholder
            className="min-h-[320px]"
            description="Le rendu visuel et le diagramme UML sont charges dans un chunk dedie a la page pattern."
            title="Chargement de la visualisation"
          />
        )}
      >
        <PatternVisualizationSection
          selectedPattern={selectedPattern}
          umlDiagram={umlDiagram}
          visualExecution={visualExecution}
          visualSourceLabel={visualSourceLabel}
          onOpenSceneModal={onOpenSceneModal}
          onOpenUmlModal={onOpenUmlModal}
        />
      </Suspense>

      <Suspense
        fallback={(
          <DeferredSectionPlaceholder
            description="Les logs et la synthese d execution sont charges separement du shell de la page."
            title="Chargement du retour d execution"
          />
        )}
      >
        <PatternExecutionResultSection
          execution={execution}
          hasDraftChanges={hasDraftChanges}
        />
      </Suspense>

      <Suspense
        fallback={(
          <DeferredSectionPlaceholder
            description="Le contenu pedagogique et le pas a pas sont charges dans un chunk dedie."
            title="Chargement du contenu pedagogique"
          />
        )}
      >
        <PatternLearningSection
          learningContent={learningContent}
          selectedPattern={selectedPattern}
        />
      </Suspense>
    </div>
  )
}
