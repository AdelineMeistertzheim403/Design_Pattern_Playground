package com.designpatternplayground.backend.svgscene.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SvgSceneSaveRequest(
	@NotBlank(message = "Le code est obligatoire.")
	@Size(max = 80, message = "Le code ne peut pas depasser 80 caracteres.")
	String code,

	@NotBlank(message = "Le nom est obligatoire.")
	@Size(max = 120, message = "Le nom ne peut pas depasser 120 caracteres.")
	String name,

	@NotBlank(message = "Le SVG est obligatoire.")
	String svgMarkup
) {
}
