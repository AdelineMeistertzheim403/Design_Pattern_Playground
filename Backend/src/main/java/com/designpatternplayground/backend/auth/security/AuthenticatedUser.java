package com.designpatternplayground.backend.auth.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public record AuthenticatedUser(
	Long id,
	String username,
	String role,
	boolean forcePasswordChange
) {

	public Collection<? extends GrantedAuthority> authorities() {
		String normalizedRole = role == null || role.isBlank() ? "USER" : role;
		return List.of(
			new SimpleGrantedAuthority("ROLE_USER"),
			new SimpleGrantedAuthority("ROLE_" + normalizedRole)
		);
	}

	public boolean isAdmin() {
		return "ADMIN".equalsIgnoreCase(role);
	}
}
