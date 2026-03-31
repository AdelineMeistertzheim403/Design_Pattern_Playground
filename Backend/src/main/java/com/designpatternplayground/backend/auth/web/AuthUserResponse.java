package com.designpatternplayground.backend.auth.web;

import java.time.LocalDateTime;

public record AuthUserResponse(
	Long id,
	String username,
	LocalDateTime createdAt
) {
}
