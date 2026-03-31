package com.designpatternplayground.backend.demo.observer.domain;

import java.util.ArrayList;
import java.util.List;

public class NotificationPublisher {

	private final String name;
	private final List<NotificationObserver> observers = new ArrayList<>();

	public NotificationPublisher(String name) {
		this.name = name;
	}

	public String name() {
		return name;
	}

	public void subscribe(NotificationObserver observer) {
		observers.add(observer);
	}

	public List<NotificationReceipt> notifyObservers(String message) {
		return observers.stream()
			.map(observer -> observer.update(name, message))
			.toList();
	}
}
