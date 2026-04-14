package com.designpatternplayground.backend.progress.application;

import java.util.List;

final class ProgressionLevels {

	private ProgressionLevels() {
	}

	static final List<Integer> THRESHOLDS = List.of(0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200);
	static final List<String> RANKS = List.of(
		"Novice",
		"Apprenti",
		"Analyste",
		"Concepteur",
		"Architecte",
		"Maitre des patterns"
	);

	static int levelForXp(int xp) {
		int level = 1;
		for (int index = 0; index < THRESHOLDS.size(); index++) {
			if (xp >= THRESHOLDS.get(index)) {
				level = index + 1;
			}
		}
		return level;
	}

	static int currentLevelXp(int xp) {
		int level = levelForXp(xp);
		return THRESHOLDS.get(Math.max(0, level - 1));
	}

	static Integer nextLevelXp(int xp) {
		int level = levelForXp(xp);
		return level >= THRESHOLDS.size() ? null : THRESHOLDS.get(level);
	}

	static String rankForXp(int xp) {
		int level = levelForXp(xp);
		if (level <= 2) {
			return RANKS.get(0);
		}
		if (level <= 4) {
			return RANKS.get(1);
		}
		if (level <= 6) {
			return RANKS.get(2);
		}
		if (level <= 8) {
			return RANKS.get(3);
		}
		if (level <= 10) {
			return RANKS.get(4);
		}
		return RANKS.get(5);
	}
}
