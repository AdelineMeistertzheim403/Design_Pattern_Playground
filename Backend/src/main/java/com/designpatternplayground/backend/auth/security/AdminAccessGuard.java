package com.designpatternplayground.backend.auth.security;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.AuthenticationFailedException;

@Component
public class AdminAccessGuard {

	public void ensureAdminAccessAllowed(AuthenticatedUser user) {
		if (user.forcePasswordChange()) {
			throw new AuthenticationFailedException("Le mot de passe initial doit etre change avant d acceder au mode admin.");
		}
	}
}
