package com.designpatternplayground.backend.quiz.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.quiz.application.QuizDashboardService;
import com.designpatternplayground.backend.quiz.domain.QuizDashboardResponse;

@RestController
@RequestMapping("/api/quiz")
public class QuizDashboardController {

	private final QuizDashboardService quizDashboardService;

	public QuizDashboardController(QuizDashboardService quizDashboardService) {
		this.quizDashboardService = quizDashboardService;
	}

	@GetMapping("/dashboard")
	public QuizDashboardResponse getDashboard(Authentication authentication) {
		return quizDashboardService.getDashboard((AuthenticatedUser) authentication.getPrincipal());
	}
}
