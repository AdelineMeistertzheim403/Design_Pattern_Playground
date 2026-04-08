package com.designpatternplayground.backend.demo.builder.domain;

public record BuildStats(
	int agility,
	int resilience,
	int utility,
	int style
) {

	public static BuildStats zero() {
		return new BuildStats(0, 0, 0, 0);
	}

	public BuildStats add(BuildStats other) {
		return new BuildStats(
			agility + other.agility(),
			resilience + other.resilience(),
			utility + other.utility(),
			style + other.style()
		);
	}

	public int totalScore() {
		return agility + resilience + utility + style;
	}

	public String summary() {
		return "AGI " + agility + " / RES " + resilience + " / UTI " + utility + " / STYLE " + style;
	}
}
