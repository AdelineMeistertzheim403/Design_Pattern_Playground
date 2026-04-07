package com.designpatternplayground.backend.demo.mediator.domain;

import java.util.List;

public interface ChatMediator {

	List<ChatDelivery> broadcast(ChatParticipant sender, String message);
}
