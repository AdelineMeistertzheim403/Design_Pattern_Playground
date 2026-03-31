package com.designpatternplayground.backend.auth.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRequest(
	@NotBlank(message = "Le pseudo est obligatoire.")
	@Size(min = 3, max = 20, message = "Le pseudo doit contenir entre 3 et 20 caracteres.")
	String username,
	@NotBlank(message = "Le mot de passe est obligatoire.")
	@Size(min = 6, max = 120, message = "Le mot de passe doit contenir entre 6 et 120 caracteres.")
	String password
) {
}
