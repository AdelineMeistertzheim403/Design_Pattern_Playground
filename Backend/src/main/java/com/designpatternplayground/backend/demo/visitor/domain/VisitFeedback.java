package com.designpatternplayground.backend.demo.visitor.domain;

public record VisitFeedback(
	boolean matched,
	String detail
) {
}
