package com.designpatternplayground.backend.demo.prototype;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.prototype.domain.PrototypeArchetype;
import com.designpatternplayground.backend.demo.prototype.domain.PrototypeMutationPreset;
import com.designpatternplayground.backend.demo.prototype.domain.PrototypeUnit;
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
public class PrototypePatternDemo implements DesignPatternDemo {

	private static final String WITH_PROTOTYPE = "WITH_PROTOTYPE";
	private static final String WITHOUT_PROTOTYPE = "WITHOUT_PROTOTYPE";
	private static final String[] CLONE_SHELL_PALETTE = {
		"#d7b28d",
		"#d8c29f",
		"#c9a87a",
		"#b7d1d8",
		"#d6b2c6",
		"#aac9b8"
	};
	private static final String[] CLONE_SHELL_LABELS = {
		"coque sable",
		"coque ivoire",
		"coque cuivre",
		"coque azur",
		"coque rosee",
		"coque jade"
	};

	@Override
	public String getCode() {
		return "prototype";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"prototype",
			"Prototype",
			PatternType.CREATIONAL,
			"Duplique un objet deja configure pour creer rapidement de nouvelles variantes sans repasser par toute la construction.",
			"Cloner un robot, un drone ou un avatar puis observer la difference entre une copie superficielle et une copie profonde.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_PROTOTYPE, WITHOUT_PROTOTYPE), WITH_PROTOTYPE),
			new PatternField("blueprintName", "Nom du blueprint", FieldType.TEXT, true, null, "Echo Forge"),
			new PatternField(
				"archetype",
				"Archetype source",
				FieldType.SELECT,
				true,
				List.of("SCOUT_DRONE", "SIEGE_MECH", "ARCANE_SENTINEL"),
				"SCOUT_DRONE"
			),
			new PatternField("cloneCount", "Nombre de clones", FieldType.NUMBER, true, null, "4"),
			new PatternField(
				"mutationTarget",
				"Clone a muter",
				FieldType.SELECT,
				true,
				List.of("CLONE_2", "CLONE_3", "CLONE_4", "CLONE_5", "CLONE_6"),
				"CLONE_2"
			),
			new PatternField(
				"mutationPreset",
				"Mutation appliquee",
				FieldType.SELECT,
				true,
				List.of("OVERCLOCK", "FORTIFY", "STEALTH"),
				"OVERCLOCK"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		PrototypeConfig config = toConfig(request.parameters());
		boolean usePrototype = WITH_PROTOTYPE.equals(config.mode());
		PrototypeArchetype archetype = PrototypeArchetype.fromCode(config.archetype());
		PrototypeMutationPreset mutationPreset = PrototypeMutationPreset.fromCode(config.mutationPreset());
		PrototypeUnit prototypeSeed = archetype.seed(config.blueprintName());
		List<String> logs = new ArrayList<>();
		List<PrototypeUnit> initialClones = createClones(prototypeSeed, config.blueprintName(), config.cloneCount(), usePrototype);
		List<PrototypeUnit> finalClones = createClones(prototypeSeed, config.blueprintName(), config.cloneCount(), usePrototype);
		int mutationTargetIndex = resolveMutationTargetIndex(config.mutationTarget(), finalClones.size());
		PrototypeUnit mutationTarget = finalClones.get(mutationTargetIndex);

		mutationTarget.applyCompanionMutation(mutationPreset);

		List<String> affectedCloneIds = finalClones.stream()
			.filter(clone -> clone.sharesCompanionWith(mutationTarget))
			.map(PrototypeUnit::id)
			.toList();

		logs.add("Le prototype source " + config.blueprintName() + " sort deja configure pour l archetype " + archetype.label() + ".");
		logs.add(usePrototype
			? "Chaque clone appelle clone() et duplique aussi le coeur imbrique. La reference profonde change a chaque copie."
			: "Sans Prototype, le client recopie le chassis mais garde la meme reference de coeur imbrique entre tous les clones.");
		logs.add(mutationTarget.label() + " recoit le preset " + mutationPreset.label() + " sur son coeur " + mutationTarget.companionState().label() + ".");
		logs.add(affectedCloneIds.size() > 1
			? "La mutation se propage a " + affectedCloneIds.size() + " clones car l etat imbrique est partage."
			: "La mutation reste isolee sur " + mutationTarget.label() + " grace a une copie profonde du coeur.");

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", usePrototype ? "Avec Prototype" : "Sans Prototype");
		output.put("copyDepthLabel", usePrototype ? "Copie profonde" : "Copie superficielle");
		output.put("blueprintName", config.blueprintName());
		output.put("archetype", archetype.code());
		output.put("archetypeLabel", archetype.label());
		output.put("archetypeDescription", archetype.description());
		output.put("cloneCount", config.cloneCount());
		output.put("sharedNestedState", !usePrototype);
		output.put("mutationTargetId", mutationTarget.id());
		output.put("mutationTargetLabel", mutationTarget.label());
		output.put("mutationPreset", mutationPreset.code());
		output.put("mutationPresetLabel", mutationPreset.label());
		output.put("mutationDetail", mutationPreset.detail());
		output.put("propagationCount", affectedCloneIds.size());
		output.put(
			"propagationLabel",
			affectedCloneIds.size() > 1
				? affectedCloneIds.size() + " clones impactes par la meme reference de coeur"
				: "1 clone impacte : l etat profond reste isole"
		);
		output.put("prototypeSeed", toCloneMap(prototypeSeed, false, false));
		output.put("initialClones", initialClones.stream().map(clone -> toCloneMap(clone, false, false)).toList());
		output.put(
			"clones",
			finalClones.stream()
				.map(clone -> toCloneMap(clone, clone.id().equals(mutationTarget.id()), affectedCloneIds.contains(clone.id())))
				.toList()
		);
		output.put("steps", List.of(
			toStepMap(1, "SEED", "Prototype source", "Le blueprint de base est pret avec sa coque et son coeur initial.", List.of(), 0),
			toStepMap(2, "CLONE", "Duplication", "Les clones sortent du meme gabarit. Le vrai piege se joue dans l etat imbrique.", List.of(), config.cloneCount()),
			toStepMap(3, "MUTATE", "Mutation ciblee", mutationTarget.label() + " recoit " + mutationPreset.label() + ".", List.of(mutationTarget.id()), config.cloneCount()),
			toStepMap(4, "OBSERVE", "Propagation", affectedCloneIds.size() > 1
				? "La mutation se diffuse a tous les clones relies au meme coeur."
				: "La mutation reste limitee au clone cible.", affectedCloneIds, config.cloneCount())
		));

		return new PatternExecutionResult(
			getCode(),
			usePrototype
				? "Prototype accelere la duplication d un objet deja configure. Avec une copie profonde, chaque clone garde ensuite son etat imbrique isole."
				: "Sans Prototype, la duplication semble rapide mais laisse souvent un etat imbrique partage. Une mutation locale fuit alors vers les autres clones.",
			logs,
			output,
			buildVisualization(usePrototype, prototypeSeed, finalClones, mutationTarget, affectedCloneIds)
		);
	}

	private List<PrototypeUnit> createClones(PrototypeUnit prototypeSeed, String blueprintName, int cloneCount, boolean usePrototype) {
		List<PrototypeUnit> clones = new ArrayList<>();

		for (int index = 0; index < cloneCount; index++) {
			int cloneNumber = index + 1;
			String cloneId = "clone-" + cloneNumber;
			PrototypeUnit clone = usePrototype
				? prototypeSeed.deepClone(cloneId, blueprintName + " #" + cloneNumber, "CLN-" + String.format("%03d", cloneNumber))
				: prototypeSeed.shallowClone(cloneId, blueprintName + " #" + cloneNumber, "CLN-" + String.format("%03d", cloneNumber));
			clone.retuneShell(CLONE_SHELL_PALETTE[index % CLONE_SHELL_PALETTE.length], CLONE_SHELL_LABELS[index % CLONE_SHELL_LABELS.length]);
			clones.add(clone);
		}

		return clones;
	}

	private VisualizationGraph buildVisualization(
		boolean usePrototype,
		PrototypeUnit prototypeSeed,
		List<PrototypeUnit> finalClones,
		PrototypeUnit mutationTarget,
		List<String> affectedCloneIds
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode(
			"prototype-seed",
			prototypeSeed.label(),
			"factory",
			Map.of("detail", usePrototype ? "deep clone source" : "manual shallow source")
		));

		if (usePrototype) {
			for (PrototypeUnit clone : finalClones) {
				nodes.add(new VisualizationNode(
					clone.id(),
					clone.label(),
					"product",
					Map.of(
						"detail", clone.companionState().label(),
						"active", clone.id().equals(mutationTarget.id())
					)
				));
				nodes.add(new VisualizationNode(
					clone.id() + "-module",
					clone.companionState().label(),
					"component",
					Map.of("detail", clone.companionReferenceId())
				));
				edges.add(new VisualizationEdge("prototype-seed", clone.id(), "clone"));
				edges.add(new VisualizationEdge(clone.id(), clone.id() + "-module", "owns"));
			}
		} else {
			nodes.add(new VisualizationNode(
				"shared-module",
				mutationTarget.companionState().label(),
				"decorator",
				Map.of("detail", "shared nested state")
			));
			for (PrototypeUnit clone : finalClones) {
				nodes.add(new VisualizationNode(
					clone.id(),
					clone.label(),
					"product",
					Map.of(
						"detail", clone.companionState().label(),
						"active", clone.id().equals(mutationTarget.id())
					)
				));
				edges.add(new VisualizationEdge("prototype-seed", clone.id(), "copy"));
				edges.add(new VisualizationEdge("shared-module", clone.id(), "shared"));
			}
		}

		nodes.add(new VisualizationNode(
			"result",
			affectedCloneIds.size() > 1 ? "Propagation" : "Isolation",
			"output",
			Map.of("message", affectedCloneIds.size() > 1 ? "shared nested mutation" : "isolated deep mutation")
		));
		edges.add(new VisualizationEdge(mutationTarget.id(), "result", "mutate"));

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toCloneMap(PrototypeUnit clone, boolean mutatedDirectly, boolean affectedByMutation) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("id", clone.id());
		map.put("label", clone.label());
		map.put("serial", clone.serial());
		map.put("shellColorHex", clone.shellColorHex());
		map.put("shellLabel", clone.shellLabel());
		map.put("attack", clone.attack());
		map.put("defense", clone.defense());
		map.put("speed", clone.speed());
		map.put("moduleCode", clone.companionState().code());
		map.put("moduleLabel", clone.companionState().label());
		map.put("moduleColorHex", clone.companionState().colorHex());
		map.put("moduleEffect", clone.companionState().effectLabel());
		map.put("moduleSyncKey", clone.companionState().syncKey());
		map.put("moduleReferenceId", clone.companionReferenceId());
		map.put("mutatedDirectly", mutatedDirectly);
		map.put("affectedByMutation", affectedByMutation);
		return map;
	}

	private Map<String, Object> toStepMap(
		int index,
		String stepCode,
		String title,
		String detail,
		List<String> affectedCloneIds,
		int visibleCloneCount
	) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		map.put("index", index);
		map.put("stepCode", stepCode);
		map.put("title", title);
		map.put("detail", detail);
		map.put("affectedCloneIds", affectedCloneIds);
		map.put("visibleCloneCount", visibleCloneCount);
		return map;
	}

	private PrototypeConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres Prototype sont obligatoires.");
		}

		String mode = requireText(parameters, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_PROTOTYPE.equals(mode) && !WITHOUT_PROTOTYPE.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_PROTOTYPE ou WITHOUT_PROTOTYPE.");
		}

		return new PrototypeConfig(
			mode,
			requireText(parameters, "blueprintName"),
			requireText(parameters, "archetype").toUpperCase(Locale.ROOT),
			requireInteger(parameters, "cloneCount", 2, 6),
			requireText(parameters, "mutationTarget").toUpperCase(Locale.ROOT),
			requireText(parameters, "mutationPreset").toUpperCase(Locale.ROOT)
		);
	}

	private int resolveMutationTargetIndex(String mutationTarget, int cloneCount) {
		int targetIndex;
		try {
			targetIndex = Integer.parseInt(mutationTarget.replace("CLONE_", "")) - 1;
		} catch (NumberFormatException exception) {
			throw new InvalidPatternConfigurationException("mutationTarget doit suivre le format CLONE_2.");
		}

		return Math.max(0, Math.min(cloneCount - 1, targetIndex));
	}

	private String requireText(Map<String, Object> parameters, String fieldName) {
		Object rawValue = parameters.get(fieldName);
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String value = rawValue.toString().trim();
		if (value.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}

		return value;
	}

	private int requireInteger(Map<String, Object> parameters, String fieldName, int minimum, int maximum) {
		Object rawValue = parameters.get(fieldName);
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		int value;
		try {
			value = Integer.parseInt(rawValue.toString().trim());
		} catch (NumberFormatException exception) {
			throw new InvalidPatternConfigurationException(fieldName + " doit etre un entier.");
		}

		if (value < minimum || value > maximum) {
			throw new InvalidPatternConfigurationException(fieldName + " doit etre compris entre " + minimum + " et " + maximum + ".");
		}

		return value;
	}
}
