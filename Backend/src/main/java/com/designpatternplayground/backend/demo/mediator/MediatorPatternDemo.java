package com.designpatternplayground.backend.demo.mediator;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.mediator.domain.ChatDelivery;
import com.designpatternplayground.backend.demo.mediator.domain.ChatParticipant;
import com.designpatternplayground.backend.demo.mediator.domain.ChatRoomMediator;
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
public class MediatorPatternDemo implements DesignPatternDemo {

	private static final String WITH_MEDIATOR = "WITH_MEDIATOR";
	private static final String WITHOUT_MEDIATOR = "WITHOUT_MEDIATOR";

	@Override
	public String getCode() {
		return "mediator";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"mediator",
			"Mediator",
			PatternType.BEHAVIORAL,
			"Centralise des interactions entre plusieurs objets pour eviter qu ils se connaissent tous directement.",
			"Construire un systeme de chat ou les joueurs passent par un hub central plutot que de se coupler chacun a tous les autres.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_MEDIATOR, WITHOUT_MEDIATOR), WITH_MEDIATOR),
			new PatternField("roomName", "Nom du salon", FieldType.TEXT, true, null, "Arena Chat"),
			new PatternField("participants", "Participants", FieldType.LIST, true, null, "Luna, Kiro, Nova"),
			new PatternField("senderName", "Expediteur", FieldType.TEXT, true, null, "Luna"),
			new PatternField("message", "Message", FieldType.TEXT, true, null, "Focus target center lane")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		MediatorConfig config = toConfig(request.parameters());
		boolean useMediator = WITH_MEDIATOR.equals(config.mode());
		List<String> logs = new ArrayList<>();
		List<ChatParticipant> participants = config.participants().stream()
			.map(ChatParticipant::new)
			.toList();
		ChatParticipant sender = participants.stream()
			.filter(participant -> participant.name().equals(config.senderName()))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("senderName doit appartenir aux participants."));
		List<String> recipients = participants.stream()
			.map(ChatParticipant::name)
			.filter(name -> !name.equals(config.senderName()))
			.toList();
		List<ChatDelivery> deliveries;

		if (useMediator) {
			ChatRoomMediator mediator = new ChatRoomMediator(config.roomName());
			logs.add("Creation du ChatRoomMediator " + config.roomName() + ".");

			for (ChatParticipant participant : participants) {
				mediator.register(participant);
			}

			logs.add("Enregistrement des participants dans le mediator : " + String.join(", ", config.participants()) + ".");
			logs.add(sender.name() + " envoie son message au hub central.");

			deliveries = sender.sendThroughMediator(config.message());
			for (ChatDelivery delivery : deliveries) {
				logs.add(config.roomName() + " transmet le message a " + delivery.to() + ".");
			}
		} else {
			logs.add("Mode sans Mediator : " + sender.name() + " connait directement tous les autres joueurs.");
			deliveries = new ArrayList<>();
			int deliveryIndex = 1;

			for (ChatParticipant participant : participants) {
				if (!participant.name().equals(sender.name())) {
					deliveries.add(participant.receive(sender.name(), config.message(), "direct link", "DIRECT", deliveryIndex));
					logs.add(sender.name() + " envoie directement un message a " + participant.name() + ".");
					deliveryIndex += 1;
				}
			}
		}

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useMediator ? "Avec Mediator" : "Sans Mediator");
		output.put("roomName", config.roomName());
		output.put("participants", config.participants());
		output.put("participantCount", config.participants().size());
		output.put("senderName", config.senderName());
		output.put("recipients", recipients);
		output.put("recipientCount", recipients.size());
		output.put("message", config.message());
		output.put("deliveredCount", deliveries.size());
		output.put("senderCouplingCount", useMediator ? 1 : recipients.size());
		output.put("directLinkCount", useMediator ? 0 : recipients.size());
		output.put("deliveryModeLabel", useMediator ? "Transit via mediator" : "Messages directs");
		output.put("deliveries", deliveries.stream().map(this::toDeliveryMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useMediator
				? "Mediator centralise les conversations dans un hub unique. Les participants ne dependent plus directement les uns des autres."
				: "Sans Mediator, l expediteur connait chaque destinataire et multiplie les liens directs entre objets du chat.",
			logs,
			output,
			buildVisualization(useMediator, config.roomName(), config.senderName(), recipients, config.message())
		);
	}

	private VisualizationGraph buildVisualization(
		boolean useMediator,
		String roomName,
		String senderName,
		List<String> recipients,
		String message
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		nodes.add(new VisualizationNode("sender", senderName, "client", Map.of("detail", "expediteur")));
		nodes.add(new VisualizationNode(
			"mediator",
			useMediator ? "ChatRoomMediator" : "Mediator bypassed",
			"context",
			Map.of("detail", roomName)
		));

		for (int index = 0; index < recipients.size(); index += 1) {
			nodes.add(new VisualizationNode(
				"recipient-" + index,
				recipients.get(index),
				"observer",
				Map.of("detail", "colleague")
			));
		}

		nodes.add(new VisualizationNode("result", "Deliveries", "output", Map.of("message", message)));

		List<VisualizationEdge> edges = new ArrayList<>();
		if (useMediator) {
			edges.add(new VisualizationEdge("sender", "mediator", "send"));
			for (int index = 0; index < recipients.size(); index += 1) {
				edges.add(new VisualizationEdge("mediator", "recipient-" + index, "relay"));
			}
		} else {
			for (int index = 0; index < recipients.size(); index += 1) {
				edges.add(new VisualizationEdge("sender", "recipient-" + index, "direct"));
			}
		}
		edges.add(new VisualizationEdge(useMediator ? "mediator" : "sender", "result", "summary"));

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toDeliveryMap(ChatDelivery delivery) {
		return Map.of(
			"index", delivery.index(),
			"from", delivery.from(),
			"to", delivery.to(),
			"via", delivery.via(),
			"transport", delivery.transport(),
			"detail", delivery.detail()
		);
	}

	private MediatorConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
		}

		String mode = requireText(parameters, "mode");
		if (!WITH_MEDIATOR.equals(mode) && !WITHOUT_MEDIATOR.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_MEDIATOR ou WITHOUT_MEDIATOR.");
		}

		String senderName = requireText(parameters, "senderName");
		List<String> participants = normalizeParticipants(parameters.get("participants"), senderName);
		if (participants.size() < 3) {
			throw new InvalidPatternConfigurationException("Au moins trois participants sont requis pour la demo Mediator.");
		}

		return new MediatorConfig(
			mode,
			requireText(parameters, "roomName"),
			participants,
			senderName,
			requireText(parameters, "message")
		);
	}

	private List<String> normalizeParticipants(Object rawValue, String senderName) {
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException("participants est obligatoire.");
		}

		List<String> values = (rawValue instanceof List<?> list ? list : List.of(rawValue.toString().split(","))).stream()
			.map(Object::toString)
			.map(String::trim)
			.filter(value -> !value.isEmpty())
			.collect(java.util.stream.Collectors.toCollection(ArrayList::new));

		if (values.stream().noneMatch(senderName::equals)) {
			values.add(0, senderName);
		}

		return values.stream()
			.collect(java.util.stream.Collectors.collectingAndThen(
				java.util.stream.Collectors.toCollection(LinkedHashSet::new),
				ArrayList::new
			));
	}

	private String requireText(Map<String, Object> parameters, String fieldName) {
		Object rawValue = parameters.get(fieldName);
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String normalized = rawValue.toString().trim();
		if (normalized.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}
		return normalized;
	}
}
