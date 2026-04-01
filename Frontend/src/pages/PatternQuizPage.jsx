import { useEffect, useState } from 'react'
import CollapsiblePanel from '../components/CollapsiblePanel'
import usePatternQuiz from '../hooks/usePatternQuiz'
import usePatternQuizProgress from '../hooks/usePatternQuizProgress'
import { submitPatternQuiz } from '../lib/api'
import {
  createInitialAnswer,
  evaluateQuestion,
  getChoiceLabel,
  getMatchingRightLabel,
  isAnswerComplete,
  moveOrderingItem,
  serializeQuizAnswer,
  summarizeCompletedQuiz,
} from '../quiz/quizUtils'
import { typeLabels } from '../app/playgroundConstants'

const difficultyLabels = {
  EASY: 'Facile',
  MEDIUM: 'Intermediaire',
  HARD: 'Avancee',
}

function cloneAnswer(answer) {
  if (Array.isArray(answer)) {
    return [...answer]
  }

  if (answer && typeof answer === 'object') {
    return { ...answer }
  }

  return answer
}

function getMasteryLabel(percent) {
  if (percent >= 90) {
    return 'Maitrise forte'
  }

  if (percent >= 75) {
    return 'Quiz valide'
  }

  if (percent >= 50) {
    return 'Base acquise'
  }

  return 'A consolider'
}

function ChoiceQuestionEditor({
  question,
  answer,
  disabled,
  multiple = false,
  onChange,
}) {
  return (
    <div className="grid gap-3">
      {(question.choices ?? []).map((choice) => {
        const isSelected = multiple
          ? Array.isArray(answer) && answer.includes(choice.id)
          : answer === choice.id

        return (
          <button
            key={choice.id}
            className={`rounded-[24px] border px-4 py-4 text-left text-sm leading-7 transition ${
              isSelected
                ? 'border-stone-950 bg-stone-950 text-white'
                : 'border-black/10 bg-white text-stone-700'
            } ${disabled ? 'cursor-default opacity-80' : 'hover:border-black/20'}`}
            disabled={disabled}
            type="button"
            onClick={() => onChange(choice.id)}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-65">
              {multiple ? 'Choix multiple' : 'Choix unique'}
            </span>
            <p className="mt-2">{choice.label}</p>
          </button>
        )
      })}
    </div>
  )
}

function MatchingQuestionEditor({
  question,
  answer,
  disabled,
  onChange,
}) {
  return (
    <div className="grid gap-3">
      {(question.leftItems ?? []).map((leftItem) => (
        <div key={leftItem.id} className="grid gap-3 rounded-[24px] border border-black/10 bg-[var(--panel)] p-4 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Element de gauche</p>
            <p className="mt-2 text-sm leading-7 text-stone-900">{leftItem.label}</p>
          </div>

          <select
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-black/20"
            disabled={disabled}
            value={answer?.[leftItem.id] ?? ''}
            onChange={(event) => onChange(leftItem.id, event.target.value)}
          >
            <option value="">Choisir une correspondance</option>
            {(question.rightItems ?? []).map((rightItem) => (
              <option key={rightItem.id} value={rightItem.id}>
                {rightItem.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

function OrderingQuestionEditor({
  question,
  answer,
  disabled,
  onMove,
}) {
  return (
    <div className="grid gap-3">
      {(answer ?? []).map((itemId, index) => {
        const item = (question.orderingItems ?? []).find((entry) => entry.id === itemId)

        return (
          <div key={itemId} className="flex items-center gap-4 rounded-[24px] border border-black/10 bg-white px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-7 text-stone-800">{item?.label ?? itemId}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                className="rounded-full border border-black/10 bg-[var(--panel)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={disabled || index === 0}
                type="button"
                onClick={() => onMove(index, index - 1)}
              >
                Haut
              </button>
              <button
                className="rounded-full border border-black/10 bg-[var(--panel)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={disabled || index === answer.length - 1}
                type="button"
                onClick={() => onMove(index, index + 1)}
              >
                Bas
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function QuestionFeedback({
  question,
  evaluation,
}) {
  if (!evaluation) {
    return null
  }

  let correctionContent = null

  if ((question.type === 'QCM_SINGLE' || question.type === 'TRUE_FALSE') && evaluation.correctAnswer) {
    correctionContent = getChoiceLabel(question, evaluation.correctAnswer)
  } else if (question.type === 'QCM_MULTIPLE') {
    correctionContent = (evaluation.correctAnswer ?? []).map((choiceId) => getChoiceLabel(question, choiceId)).join(', ')
  } else if (question.type === 'MATCHING') {
    correctionContent = Object.entries(evaluation.correctAnswer ?? {})
      .map(([leftId, rightId]) => {
        const leftLabel = (question.leftItems ?? []).find((item) => item.id === leftId)?.label ?? leftId
        const rightLabel = getMatchingRightLabel(question, rightId)
        return `${leftLabel} -> ${rightLabel}`
      })
      .join(' | ')
  } else if (question.type === 'ORDERING') {
    correctionContent = (evaluation.correctAnswer ?? [])
      .map((itemId) => (question.orderingItems ?? []).find((item) => item.id === itemId)?.label ?? itemId)
      .join(' -> ')
  }

  return (
    <div className={`rounded-[24px] border px-5 py-5 text-sm leading-7 ${
      evaluation.isCorrect
        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
        : 'border-amber-200 bg-amber-50 text-amber-900'
    }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
          {evaluation.isCorrect ? 'Bonne reponse' : 'A revoir'}
        </p>
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
          {evaluation.earnedPoints} / {evaluation.availablePoints} pts
        </span>
      </div>
      <p className="mt-3">{evaluation.explanation}</p>
      {correctionContent ? (
        <p className="mt-3 font-semibold">
          Correction : {correctionContent}
        </p>
      ) : null}
    </div>
  )
}

function QuizQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  answer,
  evaluation,
  onSingleChoice,
  onMultipleChoice,
  onMatchingChange,
  onOrderingMove,
  onSubmit,
  onNext,
}) {
  const isLocked = Boolean(evaluation)
  const canSubmit = isAnswerComplete(question, answer)
  const isLastQuestion = questionIndex === totalQuestions - 1

  return (
    <CollapsiblePanel
      defaultExpanded
      description={`Question ${questionIndex + 1} sur ${totalQuestions}`}
      eyebrow="Quiz"
      title={question.label}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="rounded-full border border-black/10 bg-[var(--panel)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700">
          {difficultyLabels[question.difficulty] ?? question.difficulty}
        </span>
        <span className="rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700">
          {question.points} pts
        </span>
      </div>

      {question.type === 'QCM_SINGLE' || question.type === 'TRUE_FALSE' ? (
        <ChoiceQuestionEditor
          answer={answer}
          disabled={isLocked}
          question={question}
          onChange={onSingleChoice}
        />
      ) : null}

      {question.type === 'QCM_MULTIPLE' ? (
        <ChoiceQuestionEditor
          answer={answer}
          disabled={isLocked}
          multiple
          question={question}
          onChange={onMultipleChoice}
        />
      ) : null}

      {question.type === 'MATCHING' ? (
        <MatchingQuestionEditor
          answer={answer}
          disabled={isLocked}
          question={question}
          onChange={onMatchingChange}
        />
      ) : null}

      {question.type === 'ORDERING' ? (
        <OrderingQuestionEditor
          answer={answer}
          disabled={isLocked}
          question={question}
          onMove={onOrderingMove}
        />
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {!evaluation ? (
          <button
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canSubmit}
            type="button"
            onClick={onSubmit}
          >
            Valider cette question
          </button>
        ) : (
          <button
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            type="button"
            onClick={onNext}
          >
            {isLastQuestion ? 'Voir le resultat' : 'Question suivante'}
          </button>
        )}
      </div>

      <div className="mt-6">
        <QuestionFeedback evaluation={evaluation} question={question} />
      </div>
    </CollapsiblePanel>
  )
}

function ProgressCard({
  label,
  value,
  detail,
  tone = 'default',
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50'
    : tone === 'warning'
      ? 'border-amber-200 bg-amber-50'
      : 'border-black/10 bg-white/84'

  return (
    <article className={`rounded-[24px] border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className="mt-3 text-3xl text-stone-950">{value}</p>
      <p className="mt-3 text-sm leading-7 text-stone-700">{detail}</p>
    </article>
  )
}

function QuizSummary({
  quiz,
  completedQuestions,
  submissionResult,
  submissionError,
  isSubmitting,
  progress,
  onRestart,
  onNavigatePattern,
}) {
  const summary = submissionResult ?? summarizeCompletedQuiz(quiz, completedQuestions)
  const persistedProgress = submissionResult?.progress ?? progress

  return (
    <div className="grid gap-6">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Resultat du quiz</p>
            <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">
              {summary.earnedPoints} / {summary.maxPoints} pts
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
              {getMasteryLabel(summary.correctPercent)}. Tu as reussi {summary.correctAnswers} question(s) sur {summary.questionCount},
              soit {summary.correctPercent}% de bonnes reponses et {summary.pointsPercent}% du score possible.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                type="button"
                onClick={onRestart}
              >
                Rejouer le quiz
              </button>
              <button
                className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
                type="button"
                onClick={onNavigatePattern}
              >
                Retour au pattern
              </button>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <ProgressCard
              detail={`Seuil de validation : ${quiz.passingPercent}% de bonnes reponses.`}
              label="Badge"
              tone={summary.badgeUnlocked ? 'success' : 'warning'}
              value={summary.badgeUnlocked ? quiz.badgeLabel : 'Verrouille'}
            />
            <ProgressCard
              detail={persistedProgress
                ? `Tentatives enregistrees : ${persistedProgress.attemptsCount}. Meilleur score : ${persistedProgress.bestPoints} pts.`
                : 'La progression sera visible ici des que la tentative sera enregistree.'}
              label="Progression"
              value={persistedProgress ? `${persistedProgress.bestCorrectPercent}% max` : '—'}
            />
          </div>
        </div>
      </section>

      {isSubmitting ? (
        <div className="rounded-[24px] border border-black/10 bg-white/84 px-5 py-5 text-sm leading-7 text-stone-700">
          Enregistrement de la progression en cours...
        </div>
      ) : null}

      {submissionError ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-7 text-amber-900">
          {submissionError}
        </div>
      ) : null}

      <CollapsiblePanel
        defaultExpanded
        description="Chaque question conserve sa correction et le detail des points associes."
        eyebrow="Debrief"
        title="Relecture du quiz"
      >
        <div className="grid gap-4">
          {completedQuestions.map((result, index) => (
            <article
              key={result.question.id}
              className={`rounded-[24px] border px-5 py-5 ${
                result.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Question {index + 1}</p>
                <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700">
                  {result.earnedPoints} / {result.availablePoints} pts
                </span>
              </div>
              <h2 className="mt-2 text-xl text-stone-950">{result.question.label}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-700">{result.explanation}</p>
              <p className={`mt-4 text-sm font-semibold ${result.isCorrect ? 'text-emerald-900' : 'text-amber-900'}`}>
                {result.isCorrect ? 'Bonne reponse' : 'Reponse incorrecte'}
              </p>
            </article>
          ))}
        </div>
      </CollapsiblePanel>
    </div>
  )
}

function AccessGate({
  selectedPattern,
  onNavigateHome,
  onNavigatePattern,
  onOpenAuth,
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Quiz protege</p>
        <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">{selectedPattern.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
          Les quiz sont reserves aux utilisateurs connectes pour pouvoir enregistrer le score, la progression et le badge de validation.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            type="button"
            onClick={() => onOpenAuth('login')}
          >
            Se connecter
          </button>
          <button
            className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            type="button"
            onClick={() => onOpenAuth('register')}
          >
            Creer un compte
          </button>
          <button
            className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            type="button"
            onClick={onNavigatePattern}
          >
            Retour au playground
          </button>
          <button
            className="rounded-full border border-black/10 bg-white/84 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/20"
            type="button"
            onClick={onNavigateHome}
          >
            Retour a l accueil
          </button>
        </div>
      </section>
    </div>
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
  }, [quiz?.patternCode])

  useEffect(() => {
    setDraftAnswer(createInitialAnswer(currentQuestion))
    setCurrentEvaluation(null)
  }, [currentQuestion?.id])

  useEffect(() => {
    let ignore = false

    const submitProgress = async () => {
      if (!quizEnabled || !quiz || totalQuestions === 0) {
        return
      }

      if (completedQuestions.length !== totalQuestions || submissionResult || isSubmitting || hasSubmittedProgress) {
        return
      }

      setIsSubmitting(true)
      setHasSubmittedProgress(true)
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

    const evaluation = evaluateQuestion(currentQuestion, draftAnswer)
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
    setCurrentIndex((current) => current + 1)
  }

  function handleRestartQuiz() {
    setCurrentIndex(0)
    setCurrentEvaluation(null)
    setCompletedQuestions([])
    setSubmissionResult(null)
    setSubmissionError('')
    setHasSubmittedProgress(false)
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
      ) : null}

      {!isQuizLoading && quiz && !currentQuestion && completedQuestions.length === totalQuestions && totalQuestions > 0 ? (
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
      ) : null}
    </div>
  )
}
