package com.designpatternplayground.backend.demo.mediator.domain;

import java.util.List;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public class ChatParticipant {

	private final String name;
	private ChatMediator mediator;

	public ChatParticipant(String name) {
		this.name = name;
	}

	public String name() {
		return name;
	}

	public void attachMediator(ChatMediator mediator) {
		this.mediator = mediator;
	}

	public List<ChatDelivery> sendThroughMediator(String message) {
		if (mediator == null) {
			throw new InvalidPatternConfigurationException("Aucun mediator n'est associe a " + name + ".");
		}
		return mediator.broadcast(this, message);
	}

	public ChatDelivery receive(String senderName, String message, String via, String transport, int index) {
		return new ChatDelivery(
			index,
			senderName,
			name,
			via,
			transport,
			name + " recoit \"" + message + "\" depuis " + senderName + " via " + via + "."
		);
	}
}
