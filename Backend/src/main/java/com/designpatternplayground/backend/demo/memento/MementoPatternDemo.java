package com.designpatternplayground.backend.demo.memento;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.memento.domain.MementoCheckpoint;
import com.designpatternplayground.backend.demo.memento.domain.MementoPreset;
import com.designpatternplayground.backend.demo.memento.domain.MementoStep;
import com.designpatternplayground.backend.demo.memento.domain.MementoWorkspaceState;
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
public class MementoPatternDemo implements DesignPatternDemo {

	private static final String WITH_MEMENTO = "WITH_MEMENTO";
	private static final String WITHOUT_MEMENTO = "WITHOUT_MEMENTO";
	private static final String SNAPSHOT_ALPHA = "SNAPSHOT_ALPHA";
	private static final String SNAPSHOT_BETA = "SNAPSHOT_BETA";

	@Override
	public String getCode() {
		return "memento";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			getCode(),
			"Memento",
			PatternType.BEHAVIORAL,
			"Capture et restaure un etat interne sans exposer directement les details de cet etat au client.",
			"Sauvegarder une scene, appliquer des mutations risquees puis restaurer proprement un checkpoint comme dans un jeu ou un editeur.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_MEMENTO, WITHOUT_MEMENTO), WITH_MEMENTO),
			new PatternField(
				"presetCode",
				"Scene",
				FieldType.SELECT,
				true,
				List.of("PIXEL_GARDEN", "ARCADE_HUB", "CONTROL_ROOM"),
				"PIXEL_GARDEN"
			),
			new PatternField("workspaceName", "Nom de la session", FieldType.TEXT, true, null, "Save & Restore"),
			new PatternField(
				"restoreTarget",
				"Checkpoint a restaurer",
				FieldType.SELECT,
				true,
				List.of(SNAPSHOT_ALPHA, SNAPSHOT_BETA),
				SNAPSHOT_ALPHA
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		MementoConfig config = toConfig(request.parameters());
		boolean useMemento = WITH_MEMENTO.equals(config.mode());
		MementoPreset preset = MementoPreset.fromCode(config.presetCode());
		MementoWorkspaceState initialState = preset.initialState();
		// The demo builds several fully materialized states so the frontend can compare
		// exact restoration versus a manual, lossy rollback attempt.
		MementoWorkspaceState styledState = new MementoWorkspaceState(
			initialState.sceneLabel(),
			useMemento ? "Aurora Bloom" : "Solar Bloom",
			initialState.energy(),
			initialState.layerCount(),
			initialState.annotationCount() + 2,
			"Focused"
		);
		MementoCheckpoint checkpointAlpha = new MementoCheckpoint(
			SNAPSHOT_ALPHA,
			"Checkpoint Alpha",
			3,
			"Capture juste apres la personnalisation de la scene.",
			styledState
		);
		MementoWorkspaceState boostedState = new MementoWorkspaceState(
			styledState.sceneLabel(),
			styledState.theme(),
			styledState.energy() + 18,
			styledState.layerCount() + 2,
			styledState.annotationCount() + 1,
			"Boosted"
		);
		MementoCheckpoint checkpointBeta = new MementoCheckpoint(
			SNAPSHOT_BETA,
			"Checkpoint Beta",
			5,
			"Snapshot juste avant une mutation critique.",
			boostedState
		);
		MementoWorkspaceState emergencyState = new MementoWorkspaceState(
			boostedState.sceneLabel(),
			"Crimson Rewind",
			24,
			boostedState.layerCount() + 1,
			boostedState.annotationCount() + 3,
			"Critical"
		);
		MementoCheckpoint restoreTarget = SNAPSHOT_BETA.equals(config.restoreTarget()) ? checkpointBeta : checkpointAlpha;
		MementoWorkspaceState restoredState = useMemento
			? restoreTarget.snapshotState()
			: new MementoWorkspaceState(
				// Without Memento, the client reconstructs only fragments of the previous state,
				// which intentionally leaves drift in the restored scene.
				restoreTarget.snapshotState().sceneLabel(),
				restoreTarget.snapshotState().theme(),
				emergencyState.energy(),
				restoreTarget.snapshotState().layerCount(),
				emergencyState.annotationCount(),
				"Manual rewind"
			);

		List<MementoStep> steps = List.of(
			// The timeline is intentionally verbose because it feeds both logs and visual playback
			// in the frontend without requiring another transformation layer.
			new MementoStep(
				1,
				"INIT",
				"Etat initial",
				"SceneEditor",
				"Le workspace charge la scene de base et expose l etat courant a l originator.",
				false,
				null,
				initialState
			),
			new MementoStep(
				2,
				"STYLE",
				"Personnalisation",
				"SceneEditor",
				"Le theme et les annotations changent avant le premier savepoint.",
				false,
				null,
				styledState
			),
			new MementoStep(
				3,
				"SAVE_ALPHA",
				"Sauvegarde Alpha",
				useMemento ? "Caretaker" : "Client notes",
				useMemento
					? "Le caretaker stocke un memento complet sans exposer l interieur de la scene."
					: "Le client note quelques valeurs visibles, mais pas un snapshot fiable.",
				true,
				checkpointAlpha.code(),
				styledState
			),
			new MementoStep(
				4,
				"BOOST",
				"Mutation avancee",
				"SceneEditor",
				"La scene gagne des couches et de l energie avant un second snapshot.",
				false,
				null,
				boostedState
			),
			new MementoStep(
				5,
				"SAVE_BETA",
				"Sauvegarde Beta",
				useMemento ? "Caretaker" : "Client notes",
				useMemento
					? "Un second memento capture exactement l etat juste avant la mutation critique."
					: "Le client enregistre un deuxieme checkpoint partiel base sur des notes visibles.",
				true,
				checkpointBeta.code(),
				boostedState
			),
			new MementoStep(
				6,
				"CRASH",
				"Mutation critique",
				"SceneEditor",
				"Une mutation risquee pousse la scene dans un etat critique avec energie basse et annotations surchargees.",
				false,
				null,
				emergencyState
			),
			new MementoStep(
				7,
				"RESTORE",
				"Restauration",
				useMemento ? "Originator" : "Client rewind",
				useMemento
					? "L originator recharge le snapshot choisi et revient exactement a l etat capture."
					: preset.manualDriftDetail(),
				false,
				restoreTarget.code(),
				restoredState
			)
		);

		List<MementoCheckpoint> checkpoints = List.of(checkpointAlpha, checkpointBeta);
		List<String> logs = List.of(
			config.workspaceName() + " ouvre " + preset.label() + ".",
			useMemento
				? "Les savepoints passent par caretaker + memento, sans exposer la structure interne de la scene."
				: "Sans Memento, le client essaie de memoriser l etat via des notes partielles.",
			"Checkpoint Alpha capture " + checkpointAlpha.snapshotState().theme() + " avec " + checkpointAlpha.snapshotState().annotationCount() + " annotation(s).",
			"Checkpoint Beta capture " + checkpointBeta.snapshotState().layerCount() + " couches avant la mutation critique.",
			useMemento
				? "La restauration sur " + restoreTarget.label() + " revient exactement a l etat capture."
				: preset.manualDriftDetail()
		);

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useMemento ? "Avec Memento" : "Sans Memento");
		output.put("workspaceName", config.workspaceName());
		output.put("presetCode", preset.code());
		output.put("presetLabel", preset.label());
		output.put("presetDescription", preset.description());
		output.put("restoreTarget", restoreTarget.code());
		output.put("restoreTargetLabel", restoreTarget.label());
		output.put("rewindBenefit", preset.rewindBenefit());
		output.put("manualDriftDetail", preset.manualDriftDetail());
		output.put("exactRestore", useMemento);
		output.put("snapshotCount", checkpoints.size());
		output.put("stepCount", steps.size());
		output.put("initialState", toStateMap(initialState));
		output.put("restoredState", toStateMap(restoredState));
		output.put("resultLabel", useMemento ? "Restore exact" : "Restore partiel");
		output.put("checkpoints", checkpoints.stream().map(this::toCheckpointMap).toList());
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useMemento
				? "Memento isole la capture d etat dans un objet snapshot. Le caretaker empile les savepoints et l originator peut restaurer exactement un ancien etat."
				: "Sans Memento, le client tente de rejouer un ancien etat avec des notes partielles. La restauration semble marcher, mais plusieurs champs restent derives.",
			logs,
			output,
			buildVisualization(useMemento, restoreTarget, restoredState)
		);
	}

	private MementoConfig toConfig(Map<String, Object> parameters) {
		String mode = toStringValue(parameters.get("mode"), WITH_MEMENTO).toUpperCase(Locale.ROOT);
		if (!WITH_MEMENTO.equals(mode) && !WITHOUT_MEMENTO.equals(mode)) {
			throw new InvalidPatternConfigurationException("Mode Memento inconnu : " + mode);
		}

		return new MementoConfig(
			mode,
			toStringValue(parameters.get("presetCode"), "PIXEL_GARDEN"),
			toStringValue(parameters.get("workspaceName"), "Save & Restore"),
			toStringValue(parameters.get("restoreTarget"), SNAPSHOT_ALPHA).toUpperCase(Locale.ROOT)
		);
	}

	private VisualizationGraph buildVisualization(
		boolean useMemento,
		MementoCheckpoint restoreTarget,
		MementoWorkspaceState restoredState
	) {
		return new VisualizationGraph(
			List.of(
				new VisualizationNode("client", "EditorClient", "client", Map.of("detail", "asks save / restore")),
				new VisualizationNode(
					"originator",
					"SceneOriginator",
					"context",
					Map.of("detail", "owns scene state", "active", true)
				),
				new VisualizationNode(
					"caretaker",
					useMemento ? "SnapshotCaretaker" : "LooseNotes",
					"cluster",
					Map.of("detail", useMemento ? "stores mementos" : "stores partial notes")
				),
				new VisualizationNode("alpha", "Checkpoint Alpha", "component", Map.of("detail", "first savepoint")),
				new VisualizationNode("beta", "Checkpoint Beta", "component", Map.of("detail", "second savepoint")),
				new VisualizationNode(
					"result",
					useMemento ? "Exact restore" : "Partial restore",
					"output",
					Map.of("message", restoreTarget.label() + " -> " + restoredState.theme())
				)
			),
			List.of(
				new VisualizationEdge("client", "originator", "edit"),
				new VisualizationEdge("originator", "caretaker", useMemento ? "create memento" : "write notes"),
				new VisualizationEdge("caretaker", "alpha", "save A"),
				new VisualizationEdge("caretaker", "beta", "save B"),
				new VisualizationEdge("caretaker", "originator", "restore " + restoreTarget.code()),
				new VisualizationEdge("originator", "result", useMemento ? "exact" : "drift")
			)
		);
	}

	private Map<String, Object> toCheckpointMap(MementoCheckpoint checkpoint) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("code", checkpoint.code());
		map.put("label", checkpoint.label());
		map.put("stepIndex", checkpoint.stepIndex());
		map.put("note", checkpoint.note());
		map.put("snapshotState", toStateMap(checkpoint.snapshotState()));
		return map;
	}

	private Map<String, Object> toStepMap(MementoStep step) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("index", step.index());
		map.put("actionCode", step.actionCode());
		map.put("actionLabel", step.actionLabel());
		map.put("actorLabel", step.actorLabel());
		map.put("detail", step.detail());
		map.put("snapshotCreated", step.snapshotCreated());
		map.put("checkpointCode", step.checkpointCode());
		map.put("state", toStateMap(step.state()));
		return map;
	}

	private Map<String, Object> toStateMap(MementoWorkspaceState state) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("sceneLabel", state.sceneLabel());
		map.put("theme", state.theme());
		map.put("energy", state.energy());
		map.put("layerCount", state.layerCount());
		map.put("annotationCount", state.annotationCount());
		map.put("alertLevel", state.alertLevel());
		return map;
	}

	private String toStringValue(Object rawValue, String fallback) {
		if (rawValue == null) {
			return fallback;
		}

		String value = rawValue.toString().trim();
		return value.isEmpty() ? fallback : value;
	}
}
