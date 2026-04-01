package com.designpatternplayground.backend.demo.singleton;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.IntStream;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.singleton.domain.ClientPerspective;
import com.designpatternplayground.backend.demo.singleton.domain.GlobalSettingsManager;
import com.designpatternplayground.backend.demo.singleton.domain.SingletonSettingsProvider;
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
public class SingletonPatternDemo implements DesignPatternDemo {

	private static final String WITH_SINGLETON = "WITH_SINGLETON";
	private static final String WITHOUT_SINGLETON = "WITHOUT_SINGLETON";
	private static final String EMPTY_VALUE = "non defini";

	@Override
	public String getCode() {
		return "singleton";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"singleton",
			"Singleton",
			PatternType.CREATIONAL,
			"Garantit qu un service central ne possede qu une seule instance accessible depuis tous les clients.",
			"Partager la meme configuration globale, le meme logger ou le meme gestionnaire audio dans toute l application.",
			"BEGINNER"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField(
				"mode",
				"Mode",
				FieldType.SELECT,
				true,
				List.of(WITH_SINGLETON, WITHOUT_SINGLETON),
				WITH_SINGLETON
			),
			new PatternField(
				"clients",
				"Clients",
				FieldType.LIST,
				true,
				null,
				"UI Panel, Backend Job, Analytics Service"
			),
			new PatternField(
				"settingKey",
				"Cle de configuration",
				FieldType.TEXT,
				true,
				null,
				"theme"
			),
			new PatternField(
				"settingValue",
				"Valeur appliquee",
				FieldType.TEXT,
				true,
				null,
				"emerald"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		SingletonConfig config = toConfig(request.parameters());
		boolean useSingleton = WITH_SINGLETON.equals(config.mode().toUpperCase(Locale.ROOT));
		List<String> logs = new ArrayList<>();
		String writerClient = config.clients().get(0);
		List<ClientPerspective> clientViews = useSingleton
			? simulateWithSingleton(config, logs, writerClient)
			: simulateWithoutSingleton(config, logs, writerClient);
		List<String> uniqueInstanceIds = clientViews.stream()
			.map(ClientPerspective::instanceId)
			.distinct()
			.toList();
		int instanceCount = uniqueInstanceIds.size();
		boolean coherent = clientViews.stream()
			.allMatch(view -> config.settingValue().equals(view.visibleValue()));
		String coherenceLabel = coherent
			? "Tous les clients observent la meme configuration."
			: "Chaque client voit un etat local different.";

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", useSingleton ? WITH_SINGLETON : WITHOUT_SINGLETON);
		output.put("modeLabel", useSingleton ? "Avec Singleton" : "Sans Singleton");
		output.put("writerClient", writerClient);
		output.put("settingKey", config.settingKey());
		output.put("settingValue", config.settingValue());
		output.put("clientCount", config.clients().size());
		output.put("instanceCount", instanceCount);
		output.put("coherent", coherent);
		output.put("coherenceLabel", coherenceLabel);
		output.put("uniqueInstanceIds", uniqueInstanceIds);
		output.put("clientViews", clientViews.stream()
			.map(view -> Map.of(
				"client", view.clientName(),
				"instanceId", view.instanceId(),
				"visibleValue", view.visibleValue(),
				"shared", view.shared()
			))
			.toList());

		return new PatternExecutionResult(
			getCode(),
			useSingleton
				? "Singleton distribue une seule instance partagee, ce qui aligne tous les clients sur le meme etat global."
				: "Sans Singleton, chaque client cree sa propre instance et les modifications se propagent mal.",
			logs,
			output,
			buildVisualization(config, clientViews, uniqueInstanceIds, coherenceLabel, useSingleton)
		);
	}

	private List<ClientPerspective> simulateWithSingleton(SingletonConfig config, List<String> logs, String writerClient) {
		SingletonSettingsProvider provider = new SingletonSettingsProvider();
		GlobalSettingsManager sharedManager = provider.getInstance();
		List<ClientPerspective> views = new ArrayList<>();

		logs.add("Activation du mode Singleton.");

		for (String client : config.clients()) {
			logs.add(client + " demande l instance globale.");
			GlobalSettingsManager manager = provider.getInstance();

			if (client.equals(writerClient)) {
				manager.update(config.settingKey(), config.settingValue());
				logs.add(client + " modifie " + config.settingKey() + " = " + config.settingValue() + ".");
			}

			String visibleValue = manager.read(config.settingKey()).orElse(EMPTY_VALUE);
			logs.add(client + " recupere l instance " + manager.instanceId() + " et lit " + config.settingKey() + " = " + visibleValue + ".");
			views.add(new ClientPerspective(client, manager.instanceId(), visibleValue, manager == sharedManager));
		}

		return views;
	}

	private List<ClientPerspective> simulateWithoutSingleton(SingletonConfig config, List<String> logs, String writerClient) {
		List<ClientPerspective> views = new ArrayList<>();
		logs.add("Mode sans Singleton : chaque client cree sa propre instance.");

		IntStream.range(0, config.clients().size()).forEach(index -> {
			String client = config.clients().get(index);
			GlobalSettingsManager manager = new GlobalSettingsManager("instance-" + (index + 1));
			logs.add(client + " cree " + manager.instanceId() + ".");

			if (client.equals(writerClient)) {
				manager.update(config.settingKey(), config.settingValue());
				logs.add(client + " modifie " + config.settingKey() + " = " + config.settingValue() + " sur sa copie locale.");
			}

			String visibleValue = manager.read(config.settingKey()).orElse(EMPTY_VALUE);
			logs.add(client + " lit " + config.settingKey() + " = " + visibleValue + " sur " + manager.instanceId() + ".");
			views.add(new ClientPerspective(client, manager.instanceId(), visibleValue, false));
		});

		return views;
	}

	private VisualizationGraph buildVisualization(
		SingletonConfig config,
		List<ClientPerspective> clientViews,
		List<String> uniqueInstanceIds,
		String coherenceLabel,
		boolean useSingleton
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode(
			"summary",
			"Etat global",
			"output",
			Map.of("message", coherenceLabel)
		));

		for (int index = 0; index < clientViews.size(); index += 1) {
			ClientPerspective view = clientViews.get(index);
			String clientId = "client-" + index;

			nodes.add(new VisualizationNode(clientId, view.clientName(), "client", Map.of("selected", index == 0)));
			edges.add(new VisualizationEdge(clientId, "instance-" + view.instanceId(), "getInstance"));
		}

		for (String instanceId : uniqueInstanceIds) {
			ClientPerspective reference = clientViews.stream()
				.filter(view -> view.instanceId().equals(instanceId))
				.findFirst()
				.orElseThrow();
			String nodeId = "instance-" + instanceId;

			nodes.add(new VisualizationNode(
				nodeId,
				useSingleton ? "GlobalSettingsManager" : instanceId,
				useSingleton ? "singleton" : "instance",
				Map.of("detail", config.settingKey() + " = " + reference.visibleValue())
			));
			edges.add(new VisualizationEdge(nodeId, "summary", "state"));
		}

		return new VisualizationGraph(nodes, edges);
	}

	private SingletonConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String mode = requireText(parameters.get("mode"), "mode").toUpperCase(Locale.ROOT);
		if (!WITH_SINGLETON.equals(mode) && !WITHOUT_SINGLETON.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_SINGLETON ou WITHOUT_SINGLETON.");
		}

		List<String> clients = extractClients(parameters.get("clients"));
		if (clients.isEmpty()) {
			throw new InvalidPatternConfigurationException("Au moins un client est obligatoire.");
		}

		String settingKey = requireText(parameters.get("settingKey"), "settingKey");
		String settingValue = requireText(parameters.get("settingValue"), "settingValue");

		return new SingletonConfig(mode, clients, settingKey, settingValue);
	}

	private String requireText(Object value, String fieldName) {
		if (value == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String normalized = value.toString().trim();
		if (normalized.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}

		return normalized;
	}

	private List<String> extractClients(Object rawClients) {
		if (rawClients == null) {
			return List.of();
		}

		List<String> values;
		if (rawClients instanceof List<?> clientList) {
			values = clientList.stream()
				.map(value -> value == null ? "" : value.toString())
				.toList();
		} else {
			values = List.of(rawClients.toString().split(","));
		}

		return values.stream()
			.map(String::trim)
			.filter(value -> !value.isEmpty())
			.collect(java.util.stream.Collectors.collectingAndThen(
				java.util.stream.Collectors.toCollection(LinkedHashSet::new),
				List::copyOf
			));
	}
}
