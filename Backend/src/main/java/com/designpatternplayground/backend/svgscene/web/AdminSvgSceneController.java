package com.designpatternplayground.backend.svgscene.web;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.designpatternplayground.backend.auth.security.AdminAccessGuard;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.svgscene.application.SvgSceneService;

@RestController
@RequestMapping("/api/admin/svg-scenes")
public class AdminSvgSceneController {

	private final SvgSceneService svgSceneService;
	private final AdminAccessGuard adminAccessGuard;

	public AdminSvgSceneController(SvgSceneService svgSceneService, AdminAccessGuard adminAccessGuard) {
		this.svgSceneService = svgSceneService;
		this.adminAccessGuard = adminAccessGuard;
	}

	@GetMapping
	public List<SvgSceneResponse> listScenes(Authentication authentication) {
		adminAccessGuard.ensureAdminAccessAllowed((AuthenticatedUser) authentication.getPrincipal());
		return svgSceneService.listAll();
	}

	@GetMapping("/{code}")
	public SvgSceneResponse getScene(@PathVariable String code, Authentication authentication) {
		adminAccessGuard.ensureAdminAccessAllowed((AuthenticatedUser) authentication.getPrincipal());
		return svgSceneService.getByCode(code);
	}

	@PutMapping("/{code}")
	public SvgSceneResponse saveScene(
		@PathVariable String code,
		@Valid @RequestBody SvgSceneSaveRequest request,
		Authentication authentication
	) {
		AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
		adminAccessGuard.ensureAdminAccessAllowed(user);
		return svgSceneService.save(code, request, user);
	}
}
