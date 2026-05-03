import { Suspense, lazy, useEffect, useState } from 'react'
import usePatternQuiz from '../hooks/usePatternQuiz'
import usePatternQuizProgress from '../hooks/usePatternQuizProgress'
import { submitPatternQuiz } from '../lib/api'
import {
  createInitialAnswer,
  evaluateQuestion,
  moveOrderingItem,
  serializeQuizAnswer,
  summarizeCompletedQuiz,
} from '../quiz/quizUtils'
import { typeLabels } from '../app/playgroundConstants'
import AccessGate from './pattern-quiz/AccessGate'
import ProgressCard from './pattern-quiz/ProgressCard'
import { cloneAnswer } from './pattern-quiz/quizUiUtils'

const QuizQuestionCard = lazy(() => import('./pattern-quiz/QuizQuestionCard'))
const QuizSummary = lazy(() => import('./pattern-quiz/QuizSummary'))
const MAX_AUTO_SUBMISSION_ATTEMPTS = 2

function DeferredQuizPlaceholder({
  title,
  description,
}) {
  return (
    <section className="rounded-[34px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_45px_rgba(47,37,22,0.08)] backdrop-blur-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Chargement</p>
      <h2 className="mt-3 text-3xl text-stone-950">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">{description}</p>
    </section>
  )
}

export default function PatternQuizPage({
  backendStatus,
  currentUser,
  selectedPattern,
  status,
  onNavigateHome,
  onNavigatePattern,
  onOpenAuth,
}) {
  const quizEnabled = Boolean(currentUser && backendStatus === 'connected')
  const { quiz, quizError, isQuizLoading } = usePatternQuiz(
    selectedPattern.code,
    selectedPattern.complexityLevel,
    backendStatus,
    quizEnabled,
  )
  const {
    progress,
    setProgress,
    progressError,
    isProgressLoading,
  } = usePatternQuizProgress(selectedPattern.code, backendStatus, quizEnabled)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [draftAnswer, setDraftAnswer] = useState(null)
  const [currentEvaluation, setCurrentEvaluation] = useState(null)
  const [completedQuestions, setCompletedQuestions] = useState([])
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submissionError, setSubmissionError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmittedProgress, setHasSubmittedProgress] = useState(false)
  const [submissionAttemptCount, setSubmissionAttemptCount] = useState(0)

  const totalQuestions = quiz?.questions?.length ?? 0
  const currentQuestion = quiz && currentIndex < totalQuestions
    ? quiz.questions[currentIndex]
    : null

  useEffect(() => {
    setCurrentIndex(0)
    setDraftAnswer(null)
    setCurrentEvaluation(null)
    setCompletedQuestions([])
    setSubmissionResult(null)
    setSubmissionError('')
    setIsSubmitting(false)
    setHasSubmittedProgress(false)
    setSubmissionAttemptCount(0)
  }, [quiz?.patternCode])

  useEffect(() => {
    setDraftAnswer(createInitialAnswer(currentQuestion))
    setCurrentEvaluation(null)
  }, [currentQuestion, currentQuestion?.id])

  useEffect(() => {
    let ignore = false

    const submitProgress = async () => {
      if (!quizEnabled || !quiz || totalQuestions === 0) {
        return
      }

      if (
        completedQuestions.length !== totalQuestions
        || submissionResult
        || isSubmitting
        || hasSubmittedProgress
        || submissionAttemptCount >= MAX_AUTO_SUBMISSION_ATTEMPTS
      ) {
        return
      }

      setIsSubmitting(true)
      setSubmissionAttemptCount((current) => current + 1)
      setSubmissionError('')

      try {
        const payload = {
          answers: completedQuestions
            .map((result) => serializeQuizAnswer(result.question, result.answer))
            .filter(Boolean),
        }
        const result = await submitPatternQuiz(selectedPattern.code, payload)

        if (!ignore) {
          setSubmissionResult(result)
          setHasSubmittedProgress(true)
          setProgress(result.progress)
        }
      } catch (error) {
        if (!ignore) {
          setSubmissionError(error.message ?? "La progression n a pas pu etre enregistree.")
        }
      } finally {
        if (!ignore) {
          setIsSubmitting(false)
        }
      }
    }

    submitProgress()

    return () => {
      ignore = true
    }
  }, [
    completedQuestions,
    hasSubmittedProgress,
    isSubmitting,
    quiz,
    quizEnabled,
    selectedPattern.code,
    setProgress,
    submissionAttemptCount,
    submissionResult,
    totalQuestions,
  ])

  function handleSingleChoice(choiceId) {
    setDraftAnswer(choiceId)
  }

  function handleMultipleChoice(choiceId) {
    setDraftAnswer((currentAnswer) => {
      const current = Array.isArray(currentAnswer) ? currentAnswer : []
      return current.includes(choiceId)
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId]
    })
  }

  function handleMatchingChange(leftId, rightId) {
    setDraftAnswer((currentAnswer) => ({
      ...(currentAnswer ?? {}),
      [leftId]: rightId,
    }))
  }

  function handleOrderingMove(fromIndex, toIndex) {
    setDraftAnswer((currentAnswer) => moveOrderingItem(currentAnswer, fromIndex, toIndex))
  }

  function handleSubmitQuestion() {
    if (!currentQuestion) {
      return
    }

    const evaluation = {
      questionId: currentQuestion.id,
      ...evaluateQuestion(currentQuestion, draftAnswer),
    }
    setCurrentEvaluation(evaluation)
    setCompletedQuestions((currentResults) => [
      ...currentResults,
      {
        question: currentQuestion,
        answer: cloneAnswer(draftAnswer),
        ...evaluation,
      },
    ])
  }

  function handleNextQuestion() {
    setCurrentEvaluation(null)
    setCurrentIndex((current) => current + 1)
  }

  function handleRestartQuiz() {
    setCurrentIndex(0)
    setCurrentEvaluation(null)
    setCompletedQuestions([])
    setSubmissionResult(null)
    setSubmissionError('')
    setHasSubmittedProgress(false)
    setSubmissionAttemptCount(0)
    setDraftAnswer(createInitialAnswer(quiz?.questions?.[0] ?? null))
  }

  if (!currentUser) {
    return (
      <AccessGate
        onNavigateHome={onNavigateHome}
        onNavigatePattern={onNavigatePattern}
        onOpenAuth={onOpenAuth}
        selectedPattern={selectedPattern}
      />
    )
  }

  if (backendStatus !== 'connected') {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Quiz indisponible</p>
          <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">{selectedPattern.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
            Le quiz necessite une API connectee pour charger les questions protegees et enregistrer la progression utilisateur.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
              type="button"
              onClick={onNavigatePattern}
            >
              Retour au playground
            </button>
          </div>
        </section>
      </div>
    )
  }

  const localSummary = summarizeCompletedQuiz(quiz, completedQuestions)
  const displayedProgress = submissionResult?.progress ?? progress

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigateHome}
              >
                Retour a l accueil
              </button>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigatePattern}
              >
                Retour au playground
              </button>
              <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ring-1 ${status.tone}`}>
                {status.label}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Quiz · {typeLabels[selectedPattern.type] ?? selectedPattern.type}
              </p>
              <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">{selectedPattern.name}</h1>
            </div>

            <p className="max-w-3xl text-base leading-7 text-stone-700">
              {quiz?.description ?? "Un quiz pedagogique pour valider ce que tu as retenu du pattern apres la demo et l UML."}
            </p>
          </div>

          <div className="grid gap-4 self-start md:grid-cols-2 xl:grid-cols-1">
            <ProgressCard
              detail={displayedProgress
                ? `Tentatives : ${displayedProgress.attemptsCount}. Cumul : ${displayedProgress.cumulativePoints} pts.`
                : 'La progression personnelle sera visible des que le quiz sera charge.'}
              label="Meilleur score"
              value={displayedProgress ? `${displayedProgress.bestPoints} / ${displayedProgress.maxPoints} pts` : '—'}
            />
            <ProgressCard
              detail={`Seuil de validation : ${quiz?.passingPercent ?? 75}% de bonnes reponses. Progression actuelle : ${Math.min(completedQuestions.length, totalQuestions)} / ${totalQuestions || '—'} questions.`}
              label="Badge"
              tone={displayedProgress?.badgeUnlocked || localSummary.badgeUnlocked ? 'success' : 'warning'}
              value={displayedProgress?.badgeUnlocked || localSummary.badgeUnlocked ? (quiz?.badgeLabel ?? 'Badge valide') : 'A obtenir'}
            />
            <ProgressCard
              detail="Chaque question rapporte un nombre de points qui depend du pattern et de sa difficulte."
              label="Barème"
              value={quiz ? `${quiz.maxPoints} pts max` : '—'}
            />
          </div>
        </div>
      </section>

      {isProgressLoading ? (
        <div className="rounded-[24px] border border-black/10 bg-white/84 px-5 py-5 text-sm leading-7 text-stone-700">
          Chargement de la progression en cours...
        </div>
      ) : null}

      {progressError ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-7 text-amber-900">
          {progressError}
        </div>
      ) : null}

      {isQuizLoading ? (
        <div className="rounded-[26px] border border-black/10 bg-white/80 px-5 py-10 text-sm leading-7 text-stone-700 shadow-[0_18px_45px_rgba(47,37,22,0.08)]">
          Chargement du quiz en cours...
        </div>
      ) : null}

      {!isQuizLoading && quizError ? (
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-10 text-sm leading-7 text-red-700">
          {quizError}
        </div>
      ) : null}

      {!isQuizLoading && !quiz && !quizError ? (
        <div className="rounded-[26px] border border-dashed border-black/15 bg-[var(--panel)] px-5 py-10 text-sm leading-7 text-stone-600">
          Aucun quiz n est disponible pour ce pattern pour le moment.
        </div>
      ) : null}

      {!isQuizLoading && quiz && currentQuestion ? (
        <Suspense
          fallback={(
            <DeferredQuizPlaceholder
              description="Le renderer de question et ses editeurs specialises sont charges dans un chunk dedie."
              title="Chargement de la question"
            />
          )}
        >
          <QuizQuestionCard
            answer={draftAnswer}
            evaluation={currentEvaluation}
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={totalQuestions}
            onMatchingChange={handleMatchingChange}
            onMultipleChoice={handleMultipleChoice}
            onNext={handleNextQuestion}
            onOrderingMove={handleOrderingMove}
            onSingleChoice={handleSingleChoice}
            onSubmit={handleSubmitQuestion}
          />
        </Suspense>
      ) : null}

      {!isQuizLoading && quiz && !currentQuestion && completedQuestions.length === totalQuestions && totalQuestions > 0 ? (
        <Suspense
          fallback={(
            <DeferredQuizPlaceholder
              description="Le recapitulatif final du quiz est charge separement du shell de la page."
              title="Chargement du resultat du quiz"
            />
          )}
        >
          <QuizSummary
            completedQuestions={completedQuestions}
            isSubmitting={isSubmitting}
            progress={displayedProgress}
            quiz={quiz}
            submissionError={submissionError}
            submissionResult={submissionResult}
            onNavigatePattern={onNavigatePattern}
            onRestart={handleRestartQuiz}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
