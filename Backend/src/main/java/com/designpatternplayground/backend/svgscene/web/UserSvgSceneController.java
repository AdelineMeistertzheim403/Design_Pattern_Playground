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

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.svgscene.application.UserSvgSceneService;

@RestController
@RequestMapping("/api/svg-scene-studio/scenes")
public class UserSvgSceneController {

	private final UserSvgSceneService userSvgSceneService;

	public UserSvgSceneController(UserSvgSceneService userSvgSceneService) {
		this.userSvgSceneService = userSvgSceneService;
	}

	@GetMapping
	public List<SvgSceneResponse> listScenes(Authentication authentication) {
		return userSvgSceneService.listForUser((AuthenticatedUser) authentication.getPrincipal());
	}

	@GetMapping("/{code}")
	public SvgSceneResponse getScene(@PathVariable String code, Authentication authentication) {
		return userSvgSceneService.getForUser(code, (AuthenticatedUser) authentication.getPrincipal());
	}

	@PutMapping("/{code}")
	public SvgSceneResponse saveScene(
		@PathVariable String code,
		@Valid @RequestBody SvgSceneSaveRequest request,
		Authentication authentication
	) {
		return userSvgSceneService.saveForUser(code, request, (AuthenticatedUser) authentication.getPrincipal());
	}
}
