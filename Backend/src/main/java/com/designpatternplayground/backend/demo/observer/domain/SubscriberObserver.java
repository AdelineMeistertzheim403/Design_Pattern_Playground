package com.designpatternplayground.backend.demo.observer.domain;

public class SubscriberObserver implements NotificationObserver {

	private final String name;

	public SubscriberObserver(String name) {
		this.name = name;
	}

	@Override
	public String name() {
		return name;
	}

	@Override
	public NotificationReceipt update(String subjectName, String message) {
		return new NotificationReceipt(
			name,
			name + " recoit la notification de " + subjectName + " : " + message
		);
	}
}
