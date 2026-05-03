package com.designpatternplayground.backend.progress.domain;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class MissionProgressCatalog {

	private MissionProgressCatalog() {
	}

	public static final List<MissionProgressDefinition> MISSIONS = List.of(
		new MissionProgressDefinition("memory-overload", "Memory Overload", MissionDifficulty.ADVANCED, List.of("flyweight")),
		new MissionProgressDefinition("global-logger", "Global Logger", MissionDifficulty.BEGINNER, List.of("singleton")),
		new MissionProgressDefinition("dynamic-payment-system", "Dynamic Payment System", MissionDifficulty.INTERMEDIATE, List.of("strategy")),
		new MissionProgressDefinition("notification-system", "Notification System", MissionDifficulty.INTERMEDIATE, List.of("observer")),
		new MissionProgressDefinition("character-state-machine", "Character State Machine", MissionDifficulty.INTERMEDIATE, List.of("state")),
		new MissionProgressDefinition("custom-object-builder", "Custom Object Builder", MissionDifficulty.INTERMEDIATE, List.of("builder")),
		new MissionProgressDefinition("power-up-system", "Power-Up System", MissionDifficulty.INTERMEDIATE, List.of("decorator")),
		new MissionProgressDefinition("undo-system", "Undo System", MissionDifficulty.INTERMEDIATE, List.of("command")),
		new MissionProgressDefinition("request-processing-pipeline", "Request Processing Pipeline", MissionDifficulty.INTERMEDIATE, List.of("chain")),
		new MissionProgressDefinition("complex-combat-system", "Complex Combat System", MissionDifficulty.ADVANCED, List.of("strategy", "decorator")),
		new MissionProgressDefinition("massive-multiplayer-world", "Massive Multiplayer World", MissionDifficulty.ADVANCED, List.of("flyweight", "factory")),
		new MissionProgressDefinition("smart-notification-platform", "Smart Notification Platform", MissionDifficulty.ADVANCED, List.of("observer", "strategy")),
		new MissionProgressDefinition("game-save-system", "Game Save System", MissionDifficulty.ADVANCED, List.of("memento", "command")),
		new MissionProgressDefinition("modular-ui-system", "Modular UI System", MissionDifficulty.ADVANCED, List.of("composite", "decorator")),
		new MissionProgressDefinition("secure-api-gateway", "Secure API Gateway", MissionDifficulty.ADVANCED, List.of("chain", "proxy")),
		new MissionProgressDefinition("multi-device-control-system", "Multi-device Control System", MissionDifficulty.ADVANCED, List.of("mediator", "command")),
		new MissionProgressDefinition("dynamic-rendering-engine", "Dynamic Rendering Engine", MissionDifficulty.ADVANCED, List.of("bridge", "strategy")),
		new MissionProgressDefinition("intelligent-file-scanner", "Intelligent File Scanner", MissionDifficulty.ADVANCED, List.of("composite", "visitor")),
		new MissionProgressDefinition("smart-code-interpreter", "Smart Code Interpreter", MissionDifficulty.ADVANCED, List.of("interpreter", "composite"))
	);

	public static final Map<String, MissionProgressDefinition> BY_ID = MISSIONS.stream()
		.collect(Collectors.toMap(MissionProgressDefinition::id, Function.identity()));
}
