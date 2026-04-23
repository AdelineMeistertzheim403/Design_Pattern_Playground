package com.designpatternplayground.backend.uml.web;

import java.time.LocalDateTime;

import tools.jackson.databind.JsonNode;

public record UmlDiagramResponse(
	String code,
	String name,
	JsonNode diagram,
	LocalDateTime createdAt,
	LocalDateTime updatedAt,
	String updatedBy
) {
}
