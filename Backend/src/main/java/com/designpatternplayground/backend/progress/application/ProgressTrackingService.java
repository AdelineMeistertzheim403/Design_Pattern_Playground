package com.designpatternplayground.backend.progress.application;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.domain.UserAccount;
import com.designpatternplayground.backend.auth.domain.UserAccountRepository;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.pattern.application.PatternService;
import com.designpatternplayground.backend.progress.domain.BadgeDefinition;
import com.designpatternplayground.backend.progress.domain.MissionProgressCatalog;
import com.designpatternplayground.backend.progress.domain.MissionProgressDefinition;
import com.designpatternplayground.backend.progress.domain.ProgressBadgeCatalog;
import com.designpatternplayground.backend.progress.domain.ProgressBadgeResponse;
import com.designpatternplayground.backend.progress.domain.ProgressProfileResponse;
import com.designpatternplayground.backend.progress.domain.ProgressUpdateResponse;
import com.designpatternplayground.backend.progress.domain.UserBadgeUnlock;
import com.designpatternplayground.backend.progress.domain.UserBadgeUnlockRepository;
import com.designpatternplayground.backend.progress.domain.UserMissionProgress;
import com.designpatternplayground.backend.progress.domain.UserMissionProgressRepository;
import com.designpatternplayground.backend.progress.domain.UserPatternProgress;
import com.designpatternplayground.backend.progress.domain.UserPatternProgressRepository;
import com.designpatternplayground.backend.progress.domain.UserProgressProfile;
import com.designpatternplayground.backend.progress.domain.UserProgressProfileRepository;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;

@Service
public class ProgressTrackingService {

	private final UserAccountRepository userAccountRepository;
	private final UserProgressProfileRepository userProgressProfileRepository;
	private final UserPatternProgressRepository userPatternProgressRepository;
	private final UserBadgeUnlockRepository userBadgeUnlockRepository;
	private final UserMissionProgressRepository userMissionProgressRepository;
	private final PatternService patternService;

	public ProgressTrackingService(
		UserAccountRepository userAccountRepository,
		UserProgressProfileRepository userProgressProfileRepository,
		UserPatternProgressRepository userPatternProgressRepository,
		UserBadgeUnlockRepository userBadgeUnlockRepository,
		UserMissionProgressRepository userMissionProgressRepository,
		PatternService patternService
	) {
		this.userAccountRepository = userAccountRepository;
		this.userProgressProfileRepository = userProgressProfileRepository;
		this.userPatternProgressRepository = userPatternProgressRepository;
		this.userBadgeUnlockRepository = userBadgeUnlockRepository;
		this.userMissionProgressRepository = userMissionProgressRepository;
		this.patternService = patternService;
	}

	@Transactional
	public ProgressUpdateResponse recordDemoCompleted(AuthenticatedUser authenticatedUser, String patternCode) {
		UserAccount user = userAccountRepository.getReferenceById(authenticatedUser.id());
		LocalDateTime now = LocalDateTime.now();
		UserProgressProfile profile = getOrCreateProfile(user);
		UserPatternProgress patternProgress = getOrCreatePatternProgress(user, patternCode);

		int xpGained = 0;
		if (patternProgress.markDemoCompleted(now)) {
			xpGained += 10;
			profile.recordDemoCompletion();
			profile.awardXp(10, now);
			if (patternProgress.getCompletionPercentage() == 20) {
				xpGained += awardFirstPatternTouchBonus(profile, now);
			}
		}

		List<ProgressBadgeResponse> newBadges = unlockEligibleBadges(user, profile);
		saveProgress(profile, patternProgress, null);
		return toUpdateResponse(profile, xpGained, newBadges);
	}

	@Transactional
	public ProgressUpdateResponse recordQuizSubmitted(
		AuthenticatedUser authenticatedUser,
		PatternQuiz quiz,
		int correctPercent
	) {
		UserAccount user = userAccountRepository.getReferenceById(authenticatedUser.id());
		LocalDateTime now = LocalDateTime.now();
		UserProgressProfile profile = getOrCreateProfile(user);
		UserPatternProgress patternProgress = getOrCreatePatternProgress(user, quiz.patternCode());

		int xpGained = 0;
		boolean passed = correctPercent >= quiz.passingPercent();
		boolean perfect = correctPercent == 100;

		if (passed) {
			profile.recordQuizSuccess(perfect);
			profile.recordSuccess();
			if (patternProgress.markQuizPassed(now)) {
				int quizXp = perfect ? 50 : 30;
				xpGained += quizXp;
				profile.awardXp(quizXp, now);
				if (patternProgress.getCompletionPercentage() == 30) {
					xpGained += awardFirstPatternTouchBonus(profile, now);
				}
			} else if (perfect) {
				int bonusXp = 20;
				xpGained += bonusXp;
				profile.awardXp(bonusXp, now);
			}
		} else {
			profile.resetSuccessStreak();
		}

		if (profile.getConsecutiveSuccessCount() == 3) {
			xpGained += 30;
			profile.awardXp(30, now);
		}

		List<ProgressBadgeResponse> newBadges = unlockEligibleBadges(user, profile);
		saveProgress(profile, patternProgress, null);
		return toUpdateResponse(profile, xpGained, newBadges);
	}

	@Transactional
	public ProgressUpdateResponse recordMissionSubmitted(
		AuthenticatedUser authenticatedUser,
		MissionSubmissionRequest request
	) {
		UserAccount user = userAccountRepository.getReferenceById(authenticatedUser.id());
		MissionProgressDefinition definition = resolveMission(request.missionId());
		LocalDateTime now = LocalDateTime.now();
		UserProgressProfile profile = getOrCreateProfile(user);
		UserMissionProgress missionProgress = userMissionProgressRepository.findByUser_IdAndMissionId(authenticatedUser.id(), definition.id())
			.orElseGet(() -> new UserMissionProgress(user, definition.id()));

		boolean firstMissionSuccess = missionProgress.recordAttempt(request.success(), request.score(), request.durationSeconds(), now);
		int xpGained = 0;

		List<UserPatternProgress> changedPatterns = new ArrayList<>();
		if (request.success()) {
			profile.recordMissionSuccess(definition.isAdvanced(), definition.isMultiPattern());
			profile.recordSuccess();
			if (definition.isAdvanced()) {
				profile.recordHardMissionSuccess();
			}
			if (firstMissionSuccess) {
				int missionXp = definition.xpReward();
				xpGained += missionXp;
				profile.awardXp(missionXp, now);
			}

			for (String patternCode : request.selectedPatterns()) {
				if (!definition.relatedPatterns().contains(normalize(patternCode))) {
					continue;
				}
				UserPatternProgress patternProgress = getOrCreatePatternProgress(user, patternCode);
				if (patternProgress.markMissionCompleted(definition.isAdvanced(), now)) {
					changedPatterns.add(patternProgress);
					if (patternProgress.getCompletionPercentage() == (definition.isAdvanced() ? 20 : 30)) {
						xpGained += awardFirstPatternTouchBonus(profile, now);
					}
				}
			}

			if (profile.getConsecutiveSuccessCount() == 3) {
				xpGained += 30;
				profile.awardXp(30, now);
			}
		} else {
			profile.resetSuccessStreak();
			if (definition.isAdvanced()) {
				profile.resetHardMissionSuccessStreak();
			}
		}

		if (request.success() && !definition.isAdvanced()) {
			profile.resetHardMissionSuccessStreak();
		}

		List<ProgressBadgeResponse> newBadges = unlockEligibleBadges(user, profile);

		saveProgress(profile, null, missionProgress);
		if (!changedPatterns.isEmpty()) {
			userPatternProgressRepository.saveAll(changedPatterns);
		}

		return toUpdateResponse(profile, xpGained, newBadges);
	}

	@Transactional(readOnly = true)
	public ProgressProfileResponse getProfileResponse(Long userId) {
		UserProgressProfile profile = userProgressProfileRepository.findByUser_Id(userId).orElse(null);
		int totalXp = profile == null ? 0 : profile.getTotalXp();
		int unlockedBadgeCount = (int) userBadgeUnlockRepository.countByUser_Id(userId);

		return new ProgressProfileResponse(
			totalXp,
			ProgressionLevels.levelForXp(totalXp),
			ProgressionLevels.currentLevelXp(totalXp),
			ProgressionLevels.nextLevelXp(totalXp),
			ProgressionLevels.rankForXp(totalXp),
			unlockedBadgeCount,
			ProgressBadgeCatalog.BADGES.size()
		);
	}

	@Transactional(readOnly = true)
	public List<ProgressBadgeResponse> getBadgeResponses(Long userId) {
		Map<String, UserBadgeUnlock> unlocks = userBadgeUnlockRepository.findAllByUser_IdOrderByUnlockedAtDesc(userId)
			.stream()
			.collect(Collectors.toMap(UserBadgeUnlock::getBadgeCode, Function.identity()));

		return ProgressBadgeCatalog.BADGES.stream()
			.map(definition -> {
				UserBadgeUnlock unlock = unlocks.get(definition.code());
				return new ProgressBadgeResponse(
					definition.code(),
					definition.name(),
					definition.description(),
					definition.category().name(),
					definition.secret(),
					unlock != null,
					unlock == null ? null : unlock.getUnlockedAt()
				);
			})
			.toList();
	}

	private MissionProgressDefinition resolveMission(String missionId) {
		MissionProgressDefinition definition = MissionProgressCatalog.BY_ID.get(normalize(missionId));
		if (definition == null) {
			throw new IllegalArgumentException("Mission inconnue: " + missionId);
		}
		return definition;
	}

	private int awardFirstPatternTouchBonus(UserProgressProfile profile, LocalDateTime now) {
		profile.awardXp(20, now);
		return 20;
	}

	private UserProgressProfile getOrCreateProfile(UserAccount user) {
		return userProgressProfileRepository.findByUser_Id(user.getId())
			.orElseGet(() -> new UserProgressProfile(user));
	}

	private UserPatternProgress getOrCreatePatternProgress(UserAccount user, String patternCode) {
		return userPatternProgressRepository.findByUser_IdAndPatternCodeIgnoreCase(user.getId(), patternCode)
			.orElseGet(() -> new UserPatternProgress(user, normalize(patternCode)));
	}

	private void saveProgress(UserProgressProfile profile, UserPatternProgress patternProgress, UserMissionProgress missionProgress) {
		userProgressProfileRepository.save(profile);
		if (patternProgress != null) {
			userPatternProgressRepository.save(patternProgress);
		}
		if (missionProgress != null) {
			userMissionProgressRepository.save(missionProgress);
		}
	}

	private List<ProgressBadgeResponse> unlockEligibleBadges(UserAccount user, UserProgressProfile profile) {
		List<String> badgeCodes = new ArrayList<>();
		Long userId = user.getId();
		int masteredCount = (int) userPatternProgressRepository.findAllByUser_Id(userId).stream()
			.filter(UserPatternProgress::isMastered)
			.count();
		int totalPatterns = patternService.getAllPatterns().size();

		if (profile.getDemoCount() >= 1) {
			badgeCodes.add("first_steps");
		}
		if (profile.getDemoCount() >= totalPatterns && totalPatterns > 0) {
			badgeCodes.add("collector");
		}
		if (profile.getSuccessfulQuizCount() >= 1) {
			badgeCodes.add("quiz_passed");
		}
		if (profile.getPerfectQuizCount() >= 1) {
			badgeCodes.add("perfect_quiz");
		}
		if (profile.getBestSuccessStreak() >= 3) {
			badgeCodes.add("streak_3");
		}
		if (profile.getSuccessfulMissionCount() >= 5) {
			badgeCodes.add("mission_solver");
		}
		if (profile.getSuccessfulMissionCount() >= 10) {
			badgeCodes.add("architect_confirmed");
		}
		if (profile.getMultiPatternMissionSuccessCount() >= 1) {
			badgeCodes.add("fusion_success");
		}
		if (profile.getMultiPatternMissionSuccessCount() >= 5) {
			badgeCodes.add("fusion_master");
		}
		if (profile.getBestHardMissionSuccessStreak() >= 3) {
			badgeCodes.add("untouchable");
		}

		Map<String, UserPatternProgress> progressByPattern = userPatternProgressRepository.findAllByUser_Id(userId).stream()
			.collect(Collectors.toMap(progress -> normalize(progress.getPatternCode()), Function.identity()));
		addMasteryBadges(progressByPattern, badgeCodes);
		if (masteredCount >= totalPatterns && totalPatterns > 0) {
			badgeCodes.add("playground_master");
		}

		List<ProgressBadgeResponse> newlyUnlocked = unlockBadges(user, badgeCodes, LocalDateTime.now());
		long unlockedBadgeCount = userBadgeUnlockRepository.countByUser_Id(userId);
		if (unlockedBadgeCount >= 20) {
			newlyUnlocked.addAll(unlockBadges(user, List.of("playground_archivist"), LocalDateTime.now()));
		}
		return newlyUnlocked;
	}

	private void addMasteryBadges(Map<String, UserPatternProgress> progressByPattern, List<String> badgeCodes) {
		addMasteryBadge(progressByPattern, badgeCodes, "strategy", "master_strategy");
		addMasteryBadge(progressByPattern, badgeCodes, "observer", "master_observer");
		addMasteryBadge(progressByPattern, badgeCodes, "singleton", "master_singleton");
		addMasteryBadge(progressByPattern, badgeCodes, "state", "master_state");
		addMasteryBadge(progressByPattern, badgeCodes, "decorator", "master_decorator");
		addMasteryBadge(progressByPattern, badgeCodes, "flyweight", "master_flyweight");
		addMasteryBadge(progressByPattern, badgeCodes, "builder", "master_builder");
		addMasteryBadge(progressByPattern, badgeCodes, "command", "master_command");
		addMasteryBadge(progressByPattern, badgeCodes, "mediator", "master_mediator");
		addMasteryBadge(progressByPattern, badgeCodes, "visitor", "master_visitor");
	}

	private void addMasteryBadge(
		Map<String, UserPatternProgress> progressByPattern,
		List<String> badgeCodes,
		String patternCode,
		String badgeCode
	) {
		UserPatternProgress progress = progressByPattern.get(patternCode);
		if (progress != null && progress.isMastered()) {
			badgeCodes.add(badgeCode);
		}
	}

	private List<ProgressBadgeResponse> unlockBadges(UserAccount user, List<String> badgeCodes, LocalDateTime now) {
		Set<String> uniqueCodes = badgeCodes.stream()
			.filter(Objects::nonNull)
			.map(this::normalize)
			.collect(Collectors.toSet());
		List<ProgressBadgeResponse> unlocked = new ArrayList<>();
		for (String badgeCode : uniqueCodes) {
			BadgeDefinition definition = ProgressBadgeCatalog.BY_CODE.get(badgeCode);
			if (definition == null) {
				continue;
			}
			boolean alreadyUnlocked = userBadgeUnlockRepository.findByUser_IdAndBadgeCode(user.getId(), badgeCode).isPresent();
			if (alreadyUnlocked) {
				continue;
			}
			userBadgeUnlockRepository.save(new UserBadgeUnlock(user, badgeCode, now));
			unlocked.add(new ProgressBadgeResponse(
				definition.code(),
				definition.name(),
				definition.description(),
				definition.category().name(),
				definition.secret(),
				true,
				now
			));
		}
		return unlocked;
	}

	private ProgressUpdateResponse toUpdateResponse(
		UserProgressProfile profile,
		int xpGained,
		List<ProgressBadgeResponse> newBadges
	) {
		int totalXp = profile.getTotalXp();
		return new ProgressUpdateResponse(
			xpGained,
			totalXp,
			ProgressionLevels.levelForXp(totalXp),
			ProgressionLevels.rankForXp(totalXp),
			newBadges
		);
	}

	private String normalize(String value) {
		return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
	}
}
