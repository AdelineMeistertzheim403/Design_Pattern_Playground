package com.designpatternplayground.backend.common.exception;

public class UsernameAlreadyExistsException extends RuntimeException {

	public UsernameAlreadyExistsException(String username) {
		super("Le pseudo '" + username + "' existe deja.");
	}
}
