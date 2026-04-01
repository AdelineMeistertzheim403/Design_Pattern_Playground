package com.designpatternplayground.backend.quiz.application;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.domain.UserAccount;
import com.designpatternplayground.backend.auth.domain.UserAccountRepository;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;
import com.designpatternplayground.backend.quiz.domain.QuestionType;
import com.designpatternplayground.backend.quiz.domain.QuizAnswerSubmission;
import com.designpatternplayground.backend.quiz.domain.QuizProgressResponse;
import com.designpatternplayground.backend.quiz.domain.QuizQuestion;
import com.designpatternplayground.backend.quiz.domain.QuizQuestionResult;
import com.designpatternplayground.backend.quiz.domain.QuizSubmissionRequest;
import com.designpatternplayground.backend.quiz.domain.QuizSubmissionResult;
import com.designpatternplayground.backend.quiz.domain.UserQuizProgress;
import com.designpatternplayground.backend.quiz.domain.UserQuizProgressRepository;

@Service
public class PatternQuizProgressService {

	private final PatternQuizService patternQuizService;
	private final UserAccountRepository userAccountRepository;
	private final UserQuizProgressRepository userQuizProgressRepository;

	public PatternQuizProgressService(
		PatternQuizService patternQuizService,
		UserAccountRepository userAccountRepository,
		UserQuizProgressRepository userQuizProgressRepository
	) {
		this.patternQuizService = patternQuizService;
		this.userAccountRepository = userAccountRepository;
		this.userQuizProgressRepository = userQuizProgressRepository;
	}

	@Transactional(readOnly = true)
	public QuizProgressResponse getProgress(String patternCode, AuthenticatedUser authenticatedUser) {
		PatternQuiz quiz = patternQuizService.getQuiz(patternCode);

		return userQuizProgressRepository.findByUser_IdAndPatternCodeIgnoreCase(authenticatedUser.id(), patternCode)
			.map(progress -> toResponse(progress, quiz))
			.orElseGet(() -> emptyProgress(quiz));
	}

	@Transactional
	public QuizSubmissionResult submit(
		String patternCode,
		AuthenticatedUser authenticatedUser,
		QuizSubmissionRequest request
	) {
		PatternQuiz quiz = patternQuizService.getQuiz(patternCode);
		UserAccount user = userAccountRepository.getReferenceById(authenticatedUser.id());
		Map<String, QuizAnswerSubmission> answersByQuestionId = (request.answers() == null ? List.<QuizAnswerSubmission>of() : request.answers())
			.stream()
			.filter(answer -> answer.questionId() != null)
			.collect(Collectors.toMap(
				QuizAnswerSubmission::questionId,
				Function.identity(),
				(left, right) -> right
			));

		List<QuizQuestionResult> questionResults = quiz.questions().stream()
			.map(question -> evaluateQuestion(question, answersByQuestionId.get(question.id())))
			.toList();

		int correctAnswers = (int) questionResults.stream()
			.filter(QuizQuestionResult::correct)
			.count();
		int questionCount = quiz.questions().size();
		int correctPercent = questionCount == 0
			? 0
			: (int) Math.round((correctAnswers * 100.0) / questionCount);
		int earnedPoints = questionResults.stream()
			.mapToInt(QuizQuestionResult::earnedPoints)
			.sum();
		int maxPoints = quiz.maxPoints();
		int pointsPercent = maxPoints == 0
			? 0
			: (int) Math.round((earnedPoints * 100.0) / maxPoints);
		boolean badgeUnlocked = correctPercent >= quiz.passingPercent();

		UserQuizProgress progress = userQuizProgressRepository.findByUser_IdAndPatternCodeIgnoreCase(authenticatedUser.id(), patternCode)
			.orElseGet(() -> new UserQuizProgress(user, quiz.patternCode(), quiz.badgeLabel()));

		LocalDateTime attemptedAt = LocalDateTime.now();
		progress.recordAttempt(
			earnedPoints,
			maxPoints,
			pointsPercent,
			correctAnswers,
			questionCount,
			correctPercent,
			badgeUnlocked,
			quiz.passingPercent(),
			attemptedAt
		);

		UserQuizProgress savedProgress = userQuizProgressRepository.save(progress);

		return new QuizSubmissionResult(
			quiz.patternCode(),
			correctAnswers,
			questionCount,
			correctPercent,
			earnedPoints,
			maxPoints,
			pointsPercent,
			badgeUnlocked,
			quiz.badgeLabel(),
			questionResults,
			toResponse(savedProgress, quiz)
		);
	}

	private QuizQuestionResult evaluateQuestion(QuizQuestion question, QuizAnswerSubmission answer) {
		boolean isCorrect = switch (question.type()) {
			case QCM_SINGLE, TRUE_FALSE -> Objects.equals(
				firstOrNull(answer == null ? List.of() : answer.selectedChoiceIds()),
				firstOrNull(question.correctChoiceIds())
			);
			case QCM_MULTIPLE -> sorted(answer == null ? List.of() : answer.selectedChoiceIds())
				.equals(sorted(question.correctChoiceIds()));
			case MATCHING -> Objects.equals(
				answer == null ? Map.of() : emptyIfNull(answer.matchingAnswers()),
				question.correctPairs().stream()
					.collect(Collectors.toMap(pair -> pair.leftId(), pair -> pair.rightId()))
			);
			case ORDERING -> sortedOrdering(answer == null ? List.of() : answer.orderedItemIds())
				.equals(question.correctOrder());
		};

		return new QuizQuestionResult(
			question.id(),
			isCorrect,
			isCorrect ? question.points() : 0,
			question.points()
		);
	}

	private List<String> sorted(List<String> values) {
		return (values == null ? List.<String>of() : values).stream()
			.sorted()
			.toList();
	}

	private List<String> sortedOrdering(List<String> values) {
		return values == null ? List.of() : values;
	}

	private String firstOrNull(List<String> values) {
		return values == null || values.isEmpty() ? null : values.get(0);
	}

	private Map<String, String> emptyIfNull(Map<String, String> value) {
		return value == null ? Collections.emptyMap() : value;
	}

	private QuizProgressResponse emptyProgress(PatternQuiz quiz) {
		return new QuizProgressResponse(
			quiz.patternCode(),
			0,
			0,
			0,
			quiz.maxPoints(),
			0,
			0,
			quiz.questions().size(),
			0,
			0,
			0,
			0,
			0,
			false,
			quiz.badgeLabel(),
			quiz.passingPercent(),
			null,
			null
		);
	}

	private QuizProgressResponse toResponse(UserQuizProgress progress, PatternQuiz quiz) {
		return new QuizProgressResponse(
			progress.getPatternCode(),
			progress.getAttemptsCount(),
			progress.getCumulativePoints(),
			progress.getBestPoints(),
			progress.getMaxPoints() == 0 ? quiz.maxPoints() : progress.getMaxPoints(),
			progress.getBestPointsPercent(),
			progress.getBestCorrectAnswers(),
			progress.getQuestionCount() == 0 ? quiz.questions().size() : progress.getQuestionCount(),
			progress.getBestCorrectPercent(),
			progress.getLastPoints(),
			progress.getLastPointsPercent(),
			progress.getLastCorrectAnswers(),
			progress.getLastCorrectPercent(),
			progress.isBadgeUnlocked(),
			progress.getBadgeLabel(),
			quiz.passingPercent(),
			progress.getBadgeUnlockedAt(),
			progress.getLastAttemptAt()
		);
	}
}
