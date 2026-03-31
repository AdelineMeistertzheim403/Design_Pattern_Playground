package com.designpatternplayground.backend.pattern.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.designpatternplayground.backend.pattern.service.PatternNotFoundException;

@RestControllerAdvice
public class RestExceptionHandler {

	@ExceptionHandler(PatternNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ErrorResponse handlePatternNotFound(PatternNotFoundException exception) {
		return new ErrorResponse(exception.getMessage());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse handleIllegalArgument(IllegalArgumentException exception) {
		return new ErrorResponse(exception.getMessage());
	}
}
