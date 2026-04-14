package com.designpatternplayground.backend.progress.application;

import java.util.ArrayList;
import java.util.Comparator;
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
import com.designpatternplayground.backend.progress.domain.MissionProgressCatalog;
import com.designpatternplayground.backend.progress.domain.MissionProgressDefinition;
import com.designpatternplayground.backend.progress.domain.ProgressBadgeCatalog;
import com.designpatternplayground.backend.progress.domain.RecentActivityItemResponse;
import com.designpatternplayground.backend.progress.domain.RecentActivityResponse;
import com.designpatternplayground.backend.progress.domain.UserBadgeUnlockRepository;
import com.designpatternplayground.backend.progress.domain.UserMissionProgress;
import com.designpatternplayground.backend.progress.domain.UserMissionProgressRepository;
import com.designpatternplayground.backend.progress.domain.UserPatternProgressRepository;
import com.designpatternplayground.backend.quiz.domain.UserQuizProgressRepository;

@Service
public class ProgressActivityService {

	private final UserBadgeUnlockRepository userBadgeUnlockRepository;
	private final UserMissionProgressRepository userMissionProgressRepository;
	private final UserPatternProgressRepository userPatternProgressRepository;
	private final UserQuizProgressRepository userQuizProgressRepository;
	private final PatternService patternService;

	public ProgressActivityService(
		UserBadgeUnlockRepository userBadgeUnlockRepository,
		UserMissionProgressRepository userMissionProgressRepository,
		UserPatternProgressRepository userPatternProgressRepository,
		UserQuizProgressRepository userQuizProgressRepository,
		PatternService patternService
	) {
		this.userBadgeUnlockRepository = userBadgeUnlockRepository;
		this.userMissionProgressRepository = userMissionProgressRepository;
		this.userPatternProgressRepository = userPatternProgressRepository;
		this.userQuizProgressRepository = userQuizProgressRepository;
		this.patternService = patternService;
	}

	@Transactional(readOnly = true)
	public RecentActivityResponse getRecentActivity(AuthenticatedUser authenticatedUser, int limit) {
		Long userId = authenticatedUser.id();
		Map<String, PatternMetadata> patternsByCode = patternService.getAllPatterns().stream()
			.collect(Collectors.toMap(
				pattern -> normalize(pattern.code()),
				Function.identity()
			));

		List<RecentActivityItemResponse> items = new ArrayList<>();
		items.addAll(buildBadgeItems(userId));
		items.addAll(buildMissionItems(userId));
		items.addAll(buildQuizItems(userId, patternsByCode));
		items.addAll(buildMasteryItems(userId, patternsByCode));

		List<RecentActivityItemResponse> sortedItems = items.stream()
			.filter(item -> item.occurredAt() != null)
			.sorted(Comparator.comparing(RecentActivityItemResponse::occurredAt).reversed())
			.limit(Math.max(1, limit))
			.toList();

		return new RecentActivityResponse(sortedItems);
	}

	private List<RecentActivityItemResponse> buildBadgeItems(Long userId) {
		return userBadgeUnlockRepository.findAllByUser_IdOrderByUnlockedAtDesc(userId).stream()
			.map(unlock -> {
				String badgeCode = unlock.getBadgeCode();
				var definition = ProgressBadgeCatalog.BY_CODE.get(badgeCode);
				String badgeName = definition == null ? badgeCode : definition.name();
				return new RecentActivityItemResponse(
					"BADGE_UNLOCKED",
					"Badge debloque",
					badgeName,
					badgeCode,
					unlock.getUnlockedAt()
				);
			})
			.toList();
	}

	private List<RecentActivityItemResponse> buildMissionItems(Long userId) {
		List<RecentActivityItemResponse> items = new ArrayList<>();

		for (UserMissionProgress progress : userMissionProgressRepository.findAllByUser_Id(userId)) {
			MissionProgressDefinition mission = MissionProgressCatalog.BY_ID.get(progress.getMissionId());
			String missionTitle = mission == null ? progress.getMissionId() : mission.title();

			if (progress.getLastSuccessAt() != null) {
				items.add(new RecentActivityItemResponse(
					"MISSION_SUCCESS",
					"Mission reussie",
					missionTitle,
					progress.getMissionId(),
					progress.getLastSuccessAt()
				));
			}

			if (progress.getLastAttemptAt() != null
				&& (progress.getLastSuccessAt() == null || progress.getLastAttemptAt().isAfter(progress.getLastSuccessAt()))) {
				items.add(new RecentActivityItemResponse(
					"MISSION_ATTEMPT",
					"Mission a revoir",
					missionTitle,
					progress.getMissionId(),
					progress.getLastAttemptAt()
				));
			}
		}

		return items;
	}

	private List<RecentActivityItemResponse> buildQuizItems(Long userId, Map<String, PatternMetadata> patternsByCode) {
		return userQuizProgressRepository.findAllByUser_Id(userId).stream()
			.filter(progress -> progress.getLastAttemptAt() != null)
			.map(progress -> {
				PatternMetadata pattern = patternsByCode.get(normalize(progress.getPatternCode()));
				String patternName = pattern == null ? progress.getPatternCode() : pattern.name();
				return new RecentActivityItemResponse(
					"QUIZ_SUBMITTED",
					"Quiz termine",
					patternName + " · " + progress.getLastCorrectPercent() + "%",
					normalize(progress.getPatternCode()),
					progress.getLastAttemptAt()
				);
			})
			.toList();
	}

	private List<RecentActivityItemResponse> buildMasteryItems(Long userId, Map<String, PatternMetadata> patternsByCode) {
		return userPatternProgressRepository.findAllByUser_Id(userId).stream()
			.filter(progress -> progress.getMasteredAt() != null)
			.map(progress -> {
				PatternMetadata pattern = patternsByCode.get(normalize(progress.getPatternCode()));
				String patternName = pattern == null ? progress.getPatternCode() : pattern.name();
				return new RecentActivityItemResponse(
					"PATTERN_MASTERED",
					"Pattern maitrise",
					patternName,
					normalize(progress.getPatternCode()),
					progress.getMasteredAt()
				);
			})
			.toList();
	}

	private String normalize(String code) {
		return code == null ? "" : code.trim().toLowerCase(Locale.ROOT);
	}
}
