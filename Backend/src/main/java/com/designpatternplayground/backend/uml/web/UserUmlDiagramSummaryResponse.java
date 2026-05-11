package com.designpatternplayground.backend.uml.web;

import java.time.LocalDateTime;

public record UserUmlDiagramSummaryResponse(
	String code,
	String name,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {
}
