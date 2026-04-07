package com.designpatternplayground.backend.demo.mediator;

import java.util.List;

public record MediatorConfig(
	String mode,
	String roomName,
	List<String> participants,
	String senderName,
	String message
) {
}
