package com.designpatternplayground.backend.progress.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.progress.application.ProgressActivityService;
import com.designpatternplayground.backend.progress.domain.RecentActivityResponse;

@RestController
@RequestMapping("/api/progress")
public class ProgressActivityController {

	private final ProgressActivityService progressActivityService;

	public ProgressActivityController(ProgressActivityService progressActivityService) {
		this.progressActivityService = progressActivityService;
	}

	@GetMapping("/activity")
	public RecentActivityResponse getRecentActivity(
		Authentication authentication,
		@RequestParam(defaultValue = "30") int limit
	) {
		return progressActivityService.getRecentActivity((AuthenticatedUser) authentication.getPrincipal(), limit);
	}
}
