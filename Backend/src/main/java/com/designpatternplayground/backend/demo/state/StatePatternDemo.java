package com.designpatternplayground.backend.demo.state;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.IntStream;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.state.domain.AttackingState;
import com.designpatternplayground.backend.demo.state.domain.CharacterAction;
import com.designpatternplayground.backend.demo.state.domain.CharacterContext;
import com.designpatternplayground.backend.demo.state.domain.CharacterState;
import com.designpatternplayground.backend.demo.state.domain.IdleState;
import com.designpatternplayground.backend.demo.state.domain.JumpingState;
import com.designpatternplayground.backend.demo.state.domain.RunningState;
import com.designpatternplayground.backend.demo.state.domain.StateTransitionStep;
import com.designpatternplayground.backend.pattern.api.DesignPatternDemo;
import com.designpatternplayground.backend.pattern.domain.FieldType;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternField;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;
import com.designpatternplayground.backend.pattern.domain.PatternType;
import com.designpatternplayground.backend.pattern.domain.VisualizationEdge;
import com.designpatternplayground.backend.pattern.domain.VisualizationGraph;
import com.designpatternplayground.backend.pattern.domain.VisualizationNode;

@Component
public class StatePatternDemo implements DesignPatternDemo {

	private static final List<String> STATE_CODES = List.of("IDLE", "RUNNING", "JUMPING", "ATTACKING");
	private static final String WITH_STATE = "WITH_STATE";
	private static final String WITHOUT_STATE = "WITHOUT_STATE";

	@Override
	public String getCode() {
		return "state";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"state",
			"State",
			PatternType.BEHAVIORAL,
			"Fait varier le comportement d un contexte selon son etat interne sans multiplier les conditions dans le code client.",
			"Piloter une machine a etats de personnage, un workflow ou un cycle de vie UI avec des transitions explicites.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_STATE, WITHOUT_STATE), WITH_STATE),
			new PatternField("characterName", "Nom du personnage", FieldType.TEXT, true, null, "Arena Bot"),
			new PatternField("initialState", "Etat initial", FieldType.SELECT, true, STATE_CODES, "IDLE"),
			new PatternField(
				"actions",
				"Sequence d actions",
				FieldType.LIST,
				true,
				null,
				"START_RUN, JUMP, LAND, ATTACK, FINISH_ATTACK, STOP"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		StateConfig config = toConfig(request.parameters());
		boolean useState = WITH_STATE.equals(config.mode());
		CharacterState initialState = stateFromCode(config.initialState());
		List<String> logs = new ArrayList<>();
		List<StateTransitionStep> timeline;
		CharacterState finalState;

		if (useState) {
			CharacterContext context = new CharacterContext(config.characterName(), initialState);
			logs.add("Creation du contexte pour " + config.characterName() + " avec l etat initial " + initialState.code() + ".");

			timeline = IntStream.range(0, config.actions().size())
				.mapToObj(index -> {
					CharacterAction action = CharacterAction.fromCode(config.actions().get(index));
					// In the State version, each concrete state decides locally whether it accepts
					// an action and what the next state should be.
					StateTransitionStep step = context.dispatch(action, index + 1);
					logs.add("Action " + step.index() + " - " + step.actionCode() + " : " + step.detail());
					return step;
				})
				.toList();

			finalState = context.currentState();
		} else {
			logs.add("Mode sans State : le contexte garde une logique de transition basee sur des conditions.");
			logs.add("Creation du controleur conditionnel pour " + config.characterName() + " avec l etat initial " + initialState.code() + ".");

			String currentStateCode = initialState.code();
			List<StateTransitionStep> mutableTimeline = new ArrayList<>();

			for (int index = 0; index < config.actions().size(); index += 1) {
				CharacterAction action = CharacterAction.fromCode(config.actions().get(index));
				// This branch intentionally centralizes transitions to show how quickly the
				// imperative alternative becomes harder to read and extend.
				StateTransitionStep step = dispatchWithoutStatePattern(currentStateCode, action, config.characterName(), index + 1);
				currentStateCode = step.toState();
				logs.add("Action " + step.index() + " - " + step.actionCode() + " : " + step.detail());
				mutableTimeline.add(step);
			}

			timeline = List.copyOf(mutableTimeline);
			finalState = stateFromCode(currentStateCode);
		}

		long acceptedTransitions = timeline.stream().filter(StateTransitionStep::accepted).count();
		long ignoredActions = timeline.size() - acceptedTransitions;
		List<String> visitedStates = timeline.stream()
			.flatMap(step -> java.util.stream.Stream.of(step.fromState(), step.toState()))
			.collect(java.util.stream.Collectors.collectingAndThen(
				java.util.stream.Collectors.toCollection(LinkedHashSet::new),
				ArrayList::new
			));

		if (visitedStates.isEmpty()) {
			visitedStates = new ArrayList<>(List.of(initialState.code()));
		}

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		// The output captures both the final state and the traversed timeline because the
		// frontend uses it for explanation, metrics and visual summary cards.
		output.put("mode", useState ? WITH_STATE : WITHOUT_STATE);
		output.put("modeLabel", useState ? "Avec State" : "Sans State");
		output.put("characterName", config.characterName());
		output.put("initialState", initialState.code());
		output.put("finalState", finalState.code());
		output.put("currentStateLabel", finalState.label());
		output.put("actionCount", config.actions().size());
		output.put("acceptedTransitions", acceptedTransitions);
		output.put("ignoredActions", ignoredActions);
		output.put("availableActions", finalState.availableActions().stream().map(CharacterAction::code).toList());
		output.put("visitedStates", visitedStates);
		output.put("timeline", timeline.stream()
			.map(step -> Map.of(
				"index", step.index(),
				"actionCode", step.actionCode(),
				"actionLabel", step.actionLabel(),
				"fromState", step.fromState(),
				"toState", step.toState(),
				"accepted", step.accepted(),
				"detail", step.detail()
			))
			.toList());

		return new PatternExecutionResult(
			getCode(),
			useState
				? "State encapsule les transitions dans chaque etat concret, ce qui rend le contexte plus lisible et plus simple a faire evoluer."
				: "Sans State, le contexte conserve les transitions dans une logique conditionnelle centrale plus difficile a maintenir.",
			logs,
			output,
			buildVisualization(useState, finalState, timeline, visitedStates)
		);
	}

	private VisualizationGraph buildVisualization(
		boolean useState,
		CharacterState finalState,
		List<StateTransitionStep> timeline,
		List<String> visitedStates
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		nodes.add(new VisualizationNode(
			"context",
			useState ? "CharacterContext" : "SwitchController",
			"context",
			Map.of("detail", useState ? "etat courant" : "if / else centralise")
		));
		nodes.add(new VisualizationNode("idle", "IdleState", "state", Map.of(
			"active", "IDLE".equals(finalState.code()),
			"visited", visitedStates.contains("IDLE")
		)));
		nodes.add(new VisualizationNode("running", "RunningState", "state", Map.of(
			"active", "RUNNING".equals(finalState.code()),
			"visited", visitedStates.contains("RUNNING")
		)));
		nodes.add(new VisualizationNode("jumping", "JumpingState", "state", Map.of(
			"active", "JUMPING".equals(finalState.code()),
			"visited", visitedStates.contains("JUMPING")
		)));
		nodes.add(new VisualizationNode("attacking", "AttackingState", "state", Map.of(
			"active", "ATTACKING".equals(finalState.code()),
			"visited", visitedStates.contains("ATTACKING")
		)));
		nodes.add(new VisualizationNode(
			"result",
			"Etat final",
			"output",
			Map.of("message", finalState.code() + " apres " + timeline.size() + " action(s)")
		));

		List<VisualizationEdge> edges = new ArrayList<>();
		edges.add(new VisualizationEdge("context", finalState.code().toLowerCase(), useState ? "holds" : "switch"));
		edges.add(new VisualizationEdge("idle", "running", "START_RUN"));
		edges.add(new VisualizationEdge("running", "idle", "STOP"));
		edges.add(new VisualizationEdge("idle", "jumping", "JUMP"));
		edges.add(new VisualizationEdge("running", "jumping", "JUMP"));
		edges.add(new VisualizationEdge("jumping", "idle", "LAND"));
		edges.add(new VisualizationEdge("idle", "attacking", "ATTACK"));
		edges.add(new VisualizationEdge("running", "attacking", "ATTACK"));
		edges.add(new VisualizationEdge("attacking", "idle", "FINISH_ATTACK"));
		edges.add(new VisualizationEdge(finalState.code().toLowerCase(), "result", "current"));

		return new VisualizationGraph(nodes, edges);
	}

	private StateConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String mode = requireMode(parameters.get("mode"));
		String characterName = requirePlainText(parameters.get("characterName"), "characterName");
		String initialState = requireUppercaseText(parameters.get("initialState"), "initialState");
		List<String> actions = extractActions(parameters.get("actions"));

		if (actions.isEmpty()) {
			throw new InvalidPatternConfigurationException("Au moins une action est obligatoire.");
		}

		return new StateConfig(mode, characterName, initialState, actions);
	}

	private String requireMode(Object value) {
		String mode = requirePlainText(value, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_STATE.equals(mode) && !WITHOUT_STATE.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_STATE ou WITHOUT_STATE.");
		}
		return mode;
	}

	private StateTransitionStep dispatchWithoutStatePattern(
		String currentStateCode,
		CharacterAction action,
		String characterName,
		int index
	) {
		String nextState = currentStateCode;
		boolean accepted = false;
		String detail;

		switch (currentStateCode) {
			case "IDLE" -> {
				switch (action) {
					case START_RUN -> {
						nextState = "RUNNING";
						accepted = true;
						detail = characterName + " quitte Idle et passe en Running.";
					}
					case JUMP -> {
						nextState = "JUMPING";
						accepted = true;
						detail = characterName + " saute depuis Idle et entre en Jumping.";
					}
					case ATTACK -> {
						nextState = "ATTACKING";
						accepted = true;
						detail = characterName + " declenche une attaque depuis Idle.";
					}
					default -> detail = action.label() + " ne produit rien tant que " + characterName + " est en Idle.";
				}
			}
			case "RUNNING" -> {
				switch (action) {
					case STOP -> {
						nextState = "IDLE";
						accepted = true;
						detail = characterName + " s arrete et revient en Idle.";
					}
					case JUMP -> {
						nextState = "JUMPING";
						accepted = true;
						detail = characterName + " saute en gardant son elan et passe en Jumping.";
					}
					case ATTACK -> {
						nextState = "ATTACKING";
						accepted = true;
						detail = characterName + " interrompt sa course pour attaquer.";
					}
					default -> detail = action.label() + " est ignoree tant que " + characterName + " est en Running.";
				}
			}
			case "JUMPING" -> {
				if (action == CharacterAction.LAND) {
					nextState = "IDLE";
					accepted = true;
					detail = characterName + " atterrit et repasse en Idle.";
				} else {
					detail = action.label() + " est impossible pendant que " + characterName + " est en Jumping.";
				}
			}
			case "ATTACKING" -> {
				if (action == CharacterAction.FINISH_ATTACK) {
					nextState = "IDLE";
					accepted = true;
					detail = characterName + " termine son attaque et revient en Idle.";
				} else {
					detail = action.label() + " est ignoree tant que " + characterName + " est en Attacking.";
				}
			}
			default -> throw new InvalidPatternConfigurationException("Etat initial inconnu : " + currentStateCode);
		}

		return new StateTransitionStep(
			index,
			action.code(),
			action.label(),
			currentStateCode,
			nextState,
			accepted,
			detail
		);
	}

	private CharacterState stateFromCode(String rawState) {
		String stateCode = requireUppercaseText(rawState, "initialState");

		return switch (stateCode) {
			case "IDLE" -> new IdleState();
			case "RUNNING" -> new RunningState();
			case "JUMPING" -> new JumpingState();
			case "ATTACKING" -> new AttackingState();
			default -> throw new InvalidPatternConfigurationException("Etat initial inconnu : " + rawState);
		};
	}

	private List<String> extractActions(Object rawActions) {
		if (rawActions == null) {
			return List.of();
		}

		List<String> values;
		if (rawActions instanceof List<?> actionList) {
			values = actionList.stream()
				.map(value -> value == null ? "" : value.toString())
				.toList();
		} else {
			values = List.of(rawActions.toString().split(","));
		}

		return values.stream()
			.map(String::trim)
			.filter(value -> !value.isEmpty())
			.toList();
	}

	private String requirePlainText(Object value, String fieldName) {
		if (value == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String normalized = value.toString().trim();
		if (normalized.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}

		return normalized;
	}

	private String requireUppercaseText(Object value, String fieldName) {
		return requirePlainText(value, fieldName).toUpperCase(java.util.Locale.ROOT);
	}
}
