package com.designpatternplayground.backend.demo.observer;

import java.util.List;

public record ObserverConfig(
	String mode,
	String subjectName,
	List<String> observers,
	String message
) {
}
