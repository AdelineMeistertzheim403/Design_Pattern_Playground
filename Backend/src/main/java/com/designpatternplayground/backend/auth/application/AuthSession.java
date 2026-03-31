package com.designpatternplayground.backend.auth.application;

import com.designpatternplayground.backend.auth.web.AuthUserResponse;

public record AuthSession(
	String accessToken,
	String refreshToken,
	AuthUserResponse user
) {
}
