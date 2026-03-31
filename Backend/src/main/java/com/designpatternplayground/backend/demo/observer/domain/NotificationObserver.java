package com.designpatternplayground.backend.demo.observer.domain;

public interface NotificationObserver {

	String name();

	NotificationReceipt update(String subjectName, String message);
}
