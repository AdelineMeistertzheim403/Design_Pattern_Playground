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
import com.designpatternplayground.backend.progress.application.ProgressTrackingService;
import com.designpatternplayground.backend.progress.domain.MissionProgressSummaryResponse;
import com.designpatternplayground.backend.progress.domain.ProgressBadgeResponse;
import com.designpatternplayground.backend.progress.domain.ProgressProfileResponse;
import com.designpatternplayground.backend.progress.domain.UserMissionProgressRepository;
import com.designpatternplayground.backend.progress.domain.UserPatternProgress;
import com.designpatternplayground.backend.progress.domain.UserPatternProgressRepository;
import com.designpatternplayground.backend.progress.domain.UserProgressProfile;
import com.designpatternplayground.backend.progress.domain.UserProgressProfileRepository;
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
	private final UserPatternProgressRepository userPatternProgressRepository;
	private final UserProgressProfileRepository userProgressProfileRepository;
	private final UserMissionProgressRepository userMissionProgressRepository;
	private final ProgressTrackingService progressTrackingService;

	public QuizDashboardService(
		PatternService patternService,
		PatternQuizService patternQuizService,
		UserQuizProgressRepository userQuizProgressRepository,
		UserPatternProgressRepository userPatternProgressRepository,
		UserProgressProfileRepository userProgressProfileRepository,
		UserMissionProgressRepository userMissionProgressRepository,
		ProgressTrackingService progressTrackingService
	) {
		this.patternService = patternService;
		this.patternQuizService = patternQuizService;
		this.userQuizProgressRepository = userQuizProgressRepository;
		this.userPatternProgressRepository = userPatternProgressRepository;
		this.userProgressProfileRepository = userProgressProfileRepository;
		this.userMissionProgressRepository = userMissionProgressRepository;
		this.progressTrackingService = progressTrackingService;
	}

	@Transactional(readOnly = true)
	public QuizDashboardResponse getDashboard(AuthenticatedUser authenticatedUser) {
		Map<String, UserQuizProgress> progressByPatternCode = userQuizProgressRepository.findAllByUser_Id(authenticatedUser.id())
			.stream()
			.collect(Collectors.toMap(
				progress -> normalize(progress.getPatternCode()),
				Function.identity()
			));
		Map<String, UserPatternProgress> masteryByPatternCode = userPatternProgressRepository.findAllByUser_Id(authenticatedUser.id())
			.stream()
			.collect(Collectors.toMap(
				progress -> normalize(progress.getPatternCode()),
				Function.identity()
			));

		List<QuizDashboardPatternProgress> patterns = patternService.getAllPatterns().stream()
			.map(pattern -> toDashboardPattern(
				pattern,
				progressByPatternCode.get(normalize(pattern.code())),
				masteryByPatternCode.get(normalize(pattern.code()))
			))
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

		ProgressProfileResponse profile = progressTrackingService.getProfileResponse(authenticatedUser.id());
		List<ProgressBadgeResponse> badges = progressTrackingService.getBadgeResponses(authenticatedUser.id());
		UserProgressProfile userProfile = userProgressProfileRepository.findByUser_Id(authenticatedUser.id()).orElse(null);
		int attemptedMissions = userMissionProgressRepository.findAllByUser_Id(authenticatedUser.id()).size();
		MissionProgressSummaryResponse missions = new MissionProgressSummaryResponse(
			attemptedMissions,
			userProfile == null ? 0 : userProfile.getSuccessfulMissionCount(),
			userProfile == null ? 0 : userProfile.getSuccessfulAdvancedMissionCount(),
			userProfile == null ? 0 : userProfile.getMultiPatternMissionSuccessCount(),
			userProfile == null ? 0 : userProfile.getBestSuccessStreak(),
			userProfile == null ? 0 : userProfile.getBestHardMissionSuccessStreak()
		);

		return new QuizDashboardResponse(
			patterns.size(),
			startedPatterns,
			validatedPatterns,
			totalBestPoints,
			totalMaxPoints,
			totalAttempts,
			profile,
			missions,
			badges,
			patterns
		);
	}

	private QuizDashboardPatternProgress toDashboardPattern(
		PatternMetadata pattern,
		UserQuizProgress progress,
		UserPatternProgress masteryProgress
	) {
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
				null,
				masteryProgress == null ? 0 : masteryProgress.getCompletionPercentage(),
				masteryLabel(masteryProgress == null ? 0 : masteryProgress.getCompletionPercentage()),
				masteryProgress != null && masteryProgress.isDemoCompleted(),
				masteryProgress != null && masteryProgress.isQuizPassed(),
				masteryProgress != null && masteryProgress.isMissionCompleted(),
				masteryProgress != null && masteryProgress.isAdvancedMissionCompleted(),
				masteryProgress != null && masteryProgress.isMastered(),
				masteryProgress == null ? null : masteryProgress.getMasteredAt()
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
			progress.getLastAttemptAt(),
			masteryProgress == null ? 0 : masteryProgress.getCompletionPercentage(),
			masteryLabel(masteryProgress == null ? 0 : masteryProgress.getCompletionPercentage()),
			masteryProgress != null && masteryProgress.isDemoCompleted(),
			masteryProgress != null && masteryProgress.isQuizPassed(),
			masteryProgress != null && masteryProgress.isMissionCompleted(),
			masteryProgress != null && masteryProgress.isAdvancedMissionCompleted(),
			masteryProgress != null && masteryProgress.isMastered(),
			masteryProgress == null ? null : masteryProgress.getMasteredAt()
		);
	}

	private String masteryLabel(int masteryPercent) {
		if (masteryPercent >= 100) {
			return "Maitrise";
		}
		if (masteryPercent >= 75) {
			return "Presque maitrise";
		}
		if (masteryPercent >= 50) {
			return "Comprehension solide";
		}
		if (masteryPercent >= 25) {
			return "En cours";
		}
		return "Decouverte";
	}

	private String normalize(String code) {
		return code == null ? "" : code.trim().toLowerCase(Locale.ROOT);
	}
}
