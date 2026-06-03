import CollapsiblePanel from '../../components/CollapsiblePanel'
import RewardToast from '../../components/RewardToast'
import useRewardToast from '../../hooks/useRewardToast'
import { summarizeCompletedQuiz } from '../../quiz/quizUtils'
import ProgressCard from './ProgressCard'
import { getMasteryLabel } from './quizUiUtils'

export default function QuizSummary({
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
  const {
    rewardToast,
    dismissRewardToast,
  } = useRewardToast(submissionResult?.progression ?? null)

  return (
    <div className="grid gap-6">
      <RewardToast reward={rewardToast} onDismiss={dismissRewardToast} />

      <section className="reveal rounded-[34px] border border-black/10 bg-[var(--panel)] px-6 py-8 shadow-[0_26px_70px_rgba(47,37,22,0.12)] sm:px-10 sm:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Résultat du quiz</p>
            <h1 className="mt-3 text-4xl text-stone-950 sm:text-5xl">
              {summary.earnedPoints} / {summary.maxPoints} pts
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
              {getMasteryLabel(summary.correctPercent)}. Tu as réussi {summary.correctAnswers} question(s) sur {summary.questionCount},
              soit {summary.correctPercent}% de bonnes réponses et {summary.pointsPercent}% du score possible.
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
              detail={`Seuil de validation : ${quiz.passingPercent}% de bonnes réponses.`}
              label="Badge"
              tone={summary.badgeUnlocked ? 'success' : 'warning'}
              value={summary.badgeUnlocked ? quiz.badgeLabel : 'Verrouillé'}
            />
            <ProgressCard
              detail={persistedProgress
                ? `Tentatives enregistrées : ${persistedProgress.attemptsCount}. Meilleur score : ${persistedProgress.bestPoints} pts.`
                : 'La progression sera visible ici dès que la tentative sera enregistrée.'}
              label="Progression"
              value={persistedProgress ? `${persistedProgress.bestCorrectPercent}% max` : '—'}
            />
          </div>
        </div>
      </section>

      {submissionResult?.progression ? (
        <section className="rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-[0_18px_45px_rgba(36,107,94,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Récompenses</p>
              <h2 className="mt-2 text-2xl text-stone-950">Progression mise à jour</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900">
                +{submissionResult.progression.xpGained} XP
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900">
                Niveau {submissionResult.progression.level}
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900">
                {submissionResult.progression.rank}
              </span>
            </div>
          </div>

          {submissionResult.progression.newlyUnlockedBadges?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {submissionResult.progression.newlyUnlockedBadges.map((badge) => (
                <span key={badge.code} className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-900">
                  Nouveau badge : {badge.name}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

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
        description="Chaque question conserve sa correction et le détail des points associés."
        eyebrow="Débrief"
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
                {result.isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
              </p>
            </article>
          ))}
        </div>
      </CollapsiblePanel>
    </div>
  )
}
