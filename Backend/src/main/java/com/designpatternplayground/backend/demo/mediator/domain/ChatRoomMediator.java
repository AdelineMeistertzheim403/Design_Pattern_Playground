package com.designpatternplayground.backend.demo.mediator.domain;

import java.util.ArrayList;
import java.util.List;

public class ChatRoomMediator implements ChatMediator {

	private final String roomName;
	private final List<ChatParticipant> participants = new ArrayList<>();

	public ChatRoomMediator(String roomName) {
		this.roomName = roomName;
	}

	public String roomName() {
		return roomName;
	}

	public void register(ChatParticipant participant) {
		participants.add(participant);
		participant.attachMediator(this);
	}

	public List<ChatParticipant> participants() {
		return List.copyOf(participants);
	}

	@Override
	public List<ChatDelivery> broadcast(ChatParticipant sender, String message) {
		List<ChatDelivery> deliveries = new ArrayList<>();
		int index = 1;

		for (ChatParticipant participant : participants) {
			if (!participant.name().equals(sender.name())) {
				deliveries.add(participant.receive(sender.name(), message, roomName, "MEDIATED", index));
				index += 1;
			}
		}

		return List.copyOf(deliveries);
	}
}
