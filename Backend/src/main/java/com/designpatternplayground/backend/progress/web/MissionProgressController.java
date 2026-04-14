package com.designpatternplayground.backend.progress.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.progress.application.MissionSubmissionRequest;
import com.designpatternplayground.backend.progress.application.ProgressTrackingService;
import com.designpatternplayground.backend.progress.domain.ProgressUpdateResponse;

@RestController
@RequestMapping("/api/missions")
public class MissionProgressController {

	private final ProgressTrackingService progressTrackingService;

	public MissionProgressController(ProgressTrackingService progressTrackingService) {
		this.progressTrackingService = progressTrackingService;
	}

	@PostMapping("/submissions")
	public ProgressUpdateResponse submitMission(
		@RequestBody MissionSubmissionRequest request,
		Authentication authentication
	) {
		return progressTrackingService.recordMissionSubmitted((AuthenticatedUser) authentication.getPrincipal(), request);
	}
}
