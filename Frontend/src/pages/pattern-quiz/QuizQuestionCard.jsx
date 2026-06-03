import CollapsiblePanel from '../../components/CollapsiblePanel'
import {
  getChoiceLabel,
  getMatchingRightLabel,
  isAnswerComplete,
} from '../../quiz/quizUtils'
import { difficultyLabels } from './quizUiUtils'

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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Élément de gauche</p>
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
  if (!evaluation || evaluation.questionId !== question.id) {
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
          {evaluation.isCorrect ? 'Bonne réponse' : 'À revoir'}
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

export default function QuizQuestionCard({
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
            {isLastQuestion ? 'Voir le résultat' : 'Question suivante'}
          </button>
        )}
      </div>

      <div className="mt-6">
        <QuestionFeedback evaluation={evaluation} question={question} />
      </div>
    </CollapsiblePanel>
  )
}
