package com.designpatternplayground.backend.demo.mediator.domain;

public record ChatDelivery(
	int index,
	String from,
	String to,
	String via,
	String transport,
	String detail
) {
}
