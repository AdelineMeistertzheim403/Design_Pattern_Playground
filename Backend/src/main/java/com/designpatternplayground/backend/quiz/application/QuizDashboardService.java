package com.designpatternplayground.backend.quiz.application;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.pattern.application.PatternService;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;
import com.designpatternplayground.backend.quiz.domain.QuizDashboardPatternProgress;
import com.designpatternplayground.backend.quiz.domain.QuizDashboardResponse;
import com.designpatternplayground.backend.quiz.domain.UserQuizProgress;
import com.designpatternplayground.backend.quiz.domain.UserQuizProgressRepository;

@Service
public class QuizDashboardService {

	private final PatternService patternService;
	private final PatternQuizService patternQuizService;
	private final UserQuizProgressRepository userQuizProgressRepository;

	public QuizDashboardService(
		PatternService patternService,
		PatternQuizService patternQuizService,
		UserQuizProgressRepository userQuizProgressRepository
	) {
		this.patternService = patternService;
		this.patternQuizService = patternQuizService;
		this.userQuizProgressRepository = userQuizProgressRepository;
	}

	@Transactional(readOnly = true)
	public QuizDashboardResponse getDashboard(AuthenticatedUser authenticatedUser) {
		Map<String, UserQuizProgress> progressByPatternCode = userQuizProgressRepository.findAllByUser_Id(authenticatedUser.id())
			.stream()
			.collect(Collectors.toMap(
				progress -> normalize(progress.getPatternCode()),
				Function.identity()
			));

		List<QuizDashboardPatternProgress> patterns = patternService.getAllPatterns().stream()
			.map(pattern -> toDashboardPattern(pattern, progressByPatternCode.get(normalize(pattern.code()))))
			.toList();

		int totalBestPoints = patterns.stream()
			.mapToInt(QuizDashboardPatternProgress::bestPoints)
			.sum();
		int totalMaxPoints = patterns.stream()
			.mapToInt(QuizDashboardPatternProgress::maxPoints)
			.sum();
		int totalAttempts = patterns.stream()
			.mapToInt(QuizDashboardPatternProgress::attemptsCount)
			.sum();
		int startedPatterns = (int) patterns.stream()
			.filter(pattern -> pattern.attemptsCount() > 0)
			.count();
		int validatedPatterns = (int) patterns.stream()
			.filter(QuizDashboardPatternProgress::badgeUnlocked)
			.count();

		return new QuizDashboardResponse(
			patterns.size(),
			startedPatterns,
			validatedPatterns,
			totalBestPoints,
			totalMaxPoints,
			totalAttempts,
			patterns
		);
	}

	private QuizDashboardPatternProgress toDashboardPattern(PatternMetadata pattern, UserQuizProgress progress) {
		PatternQuiz quiz = patternQuizService.getQuiz(pattern.code());

		if (progress == null) {
			return new QuizDashboardPatternProgress(
				pattern.code(),
				pattern.name(),
				pattern.type().name(),
				pattern.complexityLevel(),
				pattern.description(),
				pattern.useCase(),
				quiz.badgeLabel(),
				quiz.passingPercent(),
				quiz.questions().size(),
				quiz.maxPoints(),
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				false,
				null,
				null
			);
		}

		return new QuizDashboardPatternProgress(
			pattern.code(),
			pattern.name(),
			pattern.type().name(),
			pattern.complexityLevel(),
			pattern.description(),
			pattern.useCase(),
			progress.getBadgeLabel(),
			quiz.passingPercent(),
			progress.getQuestionCount() == 0 ? quiz.questions().size() : progress.getQuestionCount(),
			progress.getMaxPoints() == 0 ? quiz.maxPoints() : progress.getMaxPoints(),
			progress.getAttemptsCount(),
			progress.getBestPoints(),
			progress.getBestPointsPercent(),
			progress.getBestCorrectPercent(),
			progress.getLastPoints(),
			progress.getLastPointsPercent(),
			progress.getLastCorrectPercent(),
			progress.getCumulativePoints(),
			progress.isBadgeUnlocked(),
			progress.getBadgeUnlockedAt(),
			progress.getLastAttemptAt()
		);
	}

	private String normalize(String code) {
		return code == null ? "" : code.trim().toLowerCase(Locale.ROOT);
	}
}
