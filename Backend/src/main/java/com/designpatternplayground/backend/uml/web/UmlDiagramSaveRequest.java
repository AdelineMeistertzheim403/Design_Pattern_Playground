package com.designpatternplayground.backend.uml.web;

import tools.jackson.databind.JsonNode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UmlDiagramSaveRequest(
	@NotBlank(message = "Le code est obligatoire.")
	@Size(max = 80, message = "Le code ne peut pas depasser 80 caracteres.")
	String code,

	@NotBlank(message = "Le nom est obligatoire.")
	@Size(max = 120, message = "Le nom ne peut pas depasser 120 caracteres.")
	String name,

	@NotNull(message = "Le diagramme est obligatoire.")
	JsonNode diagram
) {
}
