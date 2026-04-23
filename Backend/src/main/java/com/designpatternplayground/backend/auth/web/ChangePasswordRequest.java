package com.designpatternplayground.backend.auth.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
	@NotBlank(message = "Le mot de passe actuel est obligatoire.")
	String currentPassword,

	@NotBlank(message = "Le nouveau mot de passe est obligatoire.")
	@Size(min = 6, max = 120, message = "Le mot de passe doit contenir entre 6 et 120 caracteres.")
	String newPassword
) {
}
