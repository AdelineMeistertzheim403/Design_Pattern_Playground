package com.designpatternplayground.backend.demo.observer.domain;

public record NotificationReceipt(
	String observerName,
	String detail
) {
}
