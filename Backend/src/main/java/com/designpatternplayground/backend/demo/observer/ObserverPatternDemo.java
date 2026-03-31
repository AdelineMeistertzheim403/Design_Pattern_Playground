package com.designpatternplayground.backend.demo.observer;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.observer.domain.NotificationObserver;
import com.designpatternplayground.backend.demo.observer.domain.NotificationPublisher;
import com.designpatternplayground.backend.demo.observer.domain.NotificationReceipt;
import com.designpatternplayground.backend.demo.observer.domain.SubscriberObserver;
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
public class ObserverPatternDemo implements DesignPatternDemo {

	@Override
	public String getCode() {
		return "observer";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"observer",
			"Observer",
			PatternType.BEHAVIORAL,
			"Definit une dependance un vers plusieurs afin qu un sujet notifie automatiquement ses abonnes.",
			"Diffuser un evenement produit a plusieurs modules abonnes comme une app mobile, un back office ou un journal d audit.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("subjectName", "Nom du sujet", FieldType.TEXT, true, null, "ReleasePublisher"),
			new PatternField(
				"observers",
				"Observers",
				FieldType.LIST,
				true,
				null,
				"Mobile App, Back Office, Audit Log"
			),
			new PatternField("message", "Notification", FieldType.TEXT, true, null, "Nouvelle version 1.0 publiee")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		ObserverConfig config = toConfig(request.parameters());
		List<String> logs = new ArrayList<>();

		NotificationPublisher publisher = new NotificationPublisher(config.subjectName());
		logs.add("Creation du sujet : " + publisher.name() + ".");

		List<NotificationObserver> subscribers = config.observers().stream()
			.map(SubscriberObserver::new)
			.map(NotificationObserver.class::cast)
			.toList();

		for (NotificationObserver observer : subscribers) {
			publisher.subscribe(observer);
			logs.add("Abonnement de " + observer.name() + ".");
		}

		logs.add("Emission de l evenement : " + config.message() + ".");
		List<NotificationReceipt> deliveries = publisher.notifyObservers(config.message());
		logs.add("Le sujet notifie " + deliveries.size() + " observer(s).");

		for (NotificationReceipt delivery : deliveries) {
			logs.add(delivery.detail());
		}

		Map<String, Object> output = Map.of(
			"subjectName", config.subjectName(),
			"observerCount", deliveries.size(),
			"message", config.message(),
			"observers", config.observers(),
			"deliveries", deliveries.stream()
				.map(delivery -> Map.of(
					"observer", delivery.observerName(),
					"detail", delivery.detail()
				))
				.toList()
		);

		List<VisualizationNode> nodes = new ArrayList<>();
		nodes.add(new VisualizationNode("subject", config.subjectName(), "subject", Map.of("active", true)));
		nodes.add(new VisualizationNode("event", "Evenement", "event", Map.of("message", config.message())));

		List<VisualizationEdge> edges = new ArrayList<>();
		edges.add(new VisualizationEdge("subject", "event", "publish"));

		IntStream.range(0, deliveries.size()).forEach(index -> {
			NotificationReceipt delivery = deliveries.get(index);
			String nodeId = "observer-" + index;

			nodes.add(new VisualizationNode(
				nodeId,
				delivery.observerName(),
				"observer",
				Map.of("selected", true, "detail", delivery.detail())
			));
			edges.add(new VisualizationEdge("event", nodeId, "notify"));
		});

		return new PatternExecutionResult(
			getCode(),
			"Observer relie un sujet a plusieurs abonnes afin qu ils soient tous prevenus lorsqu un evenement survient.",
			logs,
			output,
			new VisualizationGraph(nodes, edges)
		);
	}

	private ObserverConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String subjectName = normalizeRequiredText(parameters.get("subjectName"), "subjectName");
		String message = normalizeRequiredText(parameters.get("message"), "message");
		List<String> observers = extractObservers(parameters.get("observers"));

		if (observers.isEmpty()) {
			throw new InvalidPatternConfigurationException("Au moins un observer est obligatoire.");
		}

		return new ObserverConfig(subjectName, observers, message);
	}

	private String normalizeRequiredText(Object value, String fieldName) {
		if (value == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String normalized = value.toString().trim();
		if (normalized.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}

		return normalized;
	}

	private List<String> extractObservers(Object rawObservers) {
		if (rawObservers == null) {
			return List.of();
		}

		List<String> values;
		if (rawObservers instanceof List<?> observerList) {
			values = observerList.stream()
				.map(value -> value == null ? "" : value.toString())
				.toList();
		} else {
			values = List.of(rawObservers.toString().split(","));
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
