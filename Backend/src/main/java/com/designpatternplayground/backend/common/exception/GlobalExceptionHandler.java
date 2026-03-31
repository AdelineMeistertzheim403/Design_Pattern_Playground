package com.designpatternplayground.backend.common.exception;

import java.time.LocalDateTime;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.designpatternplayground.backend.common.model.ApiError;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(PatternNotFoundException.class)
	public ResponseEntity<ApiError> handlePatternNotFound(
		PatternNotFoundException exception,
		HttpServletRequest request
	) {
		return buildError(
			HttpStatus.NOT_FOUND,
			exception.getMessage(),
			request.getRequestURI()
		);
	}

	@ExceptionHandler({
		InvalidPatternConfigurationException.class,
		MethodArgumentNotValidException.class,
		IllegalArgumentException.class
	})
	public ResponseEntity<ApiError> handleBadRequest(
		Exception exception,
		HttpServletRequest request
	) {
		String message = exception.getMessage();
		if (exception instanceof MethodArgumentNotValidException validationException
			&& validationException.getBindingResult().getFieldError() != null) {
			message = validationException.getBindingResult().getFieldError().getDefaultMessage();
		}

		return buildError(
			HttpStatus.BAD_REQUEST,
			message,
			request.getRequestURI()
		);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleGeneric(
		Exception exception,
		HttpServletRequest request
	) {
		return buildError(
			HttpStatus.INTERNAL_SERVER_ERROR,
			exception.getMessage(),
			request.getRequestURI()
		);
	}

	private ResponseEntity<ApiError> buildError(
		HttpStatus status,
		String message,
		String path
	) {
		return ResponseEntity.status(status).body(
			new ApiError(
				LocalDateTime.now(),
				status.value(),
				status.getReasonPhrase(),
				message,
				path
			)
		);
	}
}
