package com.designpatternplayground.backend.demo.observer;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Locale;
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

	private static final String WITH_OBSERVER = "WITH_OBSERVER";
	private static final String WITHOUT_OBSERVER = "WITHOUT_OBSERVER";

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
			"Définit une dépendance un vers plusieurs afin qu'un sujet notifie automatiquement ses abonnés.",
			"Diffuser un événement produit à plusieurs modules abonnés comme une app mobile, un back office ou un journal d'audit.",
			"INTERMEDIATE"
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
				List.of(WITH_OBSERVER, WITHOUT_OBSERVER),
				WITH_OBSERVER
			),
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
		boolean useObserver = WITH_OBSERVER.equals(config.mode());
		String modeLabel = useObserver ? "Avec Observer" : "Sans Observer";
		List<NotificationReceipt> deliveries;

		if (useObserver) {
			NotificationPublisher publisher = new NotificationPublisher(config.subjectName());
			logs.add("Création du sujet : " + publisher.name() + ".");

			List<NotificationObserver> subscribers = config.observers().stream()
				.map(SubscriberObserver::new)
				.map(NotificationObserver.class::cast)
				.toList();

			for (NotificationObserver observer : subscribers) {
				publisher.subscribe(observer);
				logs.add("Abonnement de " + observer.name() + ".");
			}

			logs.add("Émission de l événement : " + config.message() + ".");
			deliveries = publisher.notifyObservers(config.message());
			logs.add("Le sujet notifie " + deliveries.size() + " observer(s).");
		} else {
			logs.add("Mode sans Observer : le sujet connait explicitement toutes les cibles.");
			logs.add("Création du module émetteur : " + config.subjectName() + ".");
			deliveries = config.observers().stream()
				.map(observer -> new NotificationReceipt(
					observer,
					observer + " recoit la notification de " + config.subjectName() + " : " + config.message()
				))
				.toList();
			logs.add("Émission de l événement : " + config.message() + ".");
			logs.add("Boucle manuelle sur " + deliveries.size() + " dépendance(s) concrètes.");
		}

		for (NotificationReceipt delivery : deliveries) {
			logs.add(delivery.detail());
		}

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", useObserver ? WITH_OBSERVER : WITHOUT_OBSERVER);
		output.put("modeLabel", modeLabel);
		output.put("subjectName", config.subjectName());
		output.put("observerCount", deliveries.size());
		output.put("message", config.message());
		output.put("observers", config.observers());
		output.put("deliveries", deliveries.stream()
			.map(delivery -> Map.of(
				"observer", delivery.observerName(),
				"detail", delivery.detail()
			))
			.toList());

		List<VisualizationNode> nodes = new ArrayList<>();
		nodes.add(new VisualizationNode("subject", config.subjectName(), "subject", Map.of("active", true)));
		nodes.add(new VisualizationNode(
			"event",
			useObserver ? "Événement" : "Manual loop",
			"event",
			Map.of("message", useObserver ? config.message() : "couplage direct")
		));

		List<VisualizationEdge> edges = new ArrayList<>();
		edges.add(new VisualizationEdge("subject", "event", useObserver ? "publish" : "iterate"));

		IntStream.range(0, deliveries.size()).forEach(index -> {
			NotificationReceipt delivery = deliveries.get(index);
			String nodeId = "observer-" + index;

			nodes.add(new VisualizationNode(
				nodeId,
				delivery.observerName(),
				"observer",
				Map.of("selected", true, "detail", delivery.detail())
			));
			edges.add(new VisualizationEdge("event", nodeId, useObserver ? "notify" : "call"));
		});

		return new PatternExecutionResult(
			getCode(),
			useObserver
				? "Observer relie un sujet à plusieurs abonnés afin qu ils soient tous prévenus lorsqu un événement survient."
				: "Sans Observer, l émetteur appelle directement chaque cible concrète et augmente son couplage.",
			logs,
			output,
			new VisualizationGraph(nodes, edges)
		);
	}

	private ObserverConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les paramètres sont obligatoires.");
		}

		String mode = normalizeMode(parameters.get("mode"));
		String subjectName = normalizeRequiredText(parameters.get("subjectName"), "subjectName");
		String message = normalizeRequiredText(parameters.get("message"), "message");
		List<String> observers = extractObservers(parameters.get("observers"));

		if (observers.isEmpty()) {
			throw new InvalidPatternConfigurationException("Au moins un observer est obligatoire.");
		}

		return new ObserverConfig(mode, subjectName, observers, message);
	}

	private String normalizeMode(Object value) {
		String mode = normalizeRequiredText(value, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_OBSERVER.equals(mode) && !WITHOUT_OBSERVER.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_OBSERVER ou WITHOUT_OBSERVER.");
		}
		return mode;
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
