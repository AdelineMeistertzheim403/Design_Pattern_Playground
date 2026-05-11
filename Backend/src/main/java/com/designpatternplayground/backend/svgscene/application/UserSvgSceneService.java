package com.designpatternplayground.backend.svgscene.application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.domain.UserAccount;
import com.designpatternplayground.backend.auth.domain.UserAccountRepository;
import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.svgscene.domain.UserSvgSceneDocument;
import com.designpatternplayground.backend.svgscene.domain.UserSvgSceneRepository;
import com.designpatternplayground.backend.svgscene.web.SvgSceneResponse;
import com.designpatternplayground.backend.svgscene.web.SvgSceneSaveRequest;

@Service
public class UserSvgSceneService {

	private final UserSvgSceneRepository userSvgSceneRepository;
	private final UserAccountRepository userAccountRepository;
	private final SvgSceneService svgSceneService;

	public UserSvgSceneService(
		UserSvgSceneRepository userSvgSceneRepository,
		UserAccountRepository userAccountRepository,
		SvgSceneService svgSceneService
	) {
		this.userSvgSceneRepository = userSvgSceneRepository;
		this.userAccountRepository = userAccountRepository;
		this.svgSceneService = svgSceneService;
	}

	@Transactional(readOnly = true)
	public List<SvgSceneResponse> listForUser(AuthenticatedUser actor) {
		return userSvgSceneRepository.findAllByOwnerIdOrderByUpdatedAtDesc(actor.id()).stream()
			.map(this::toResponse)
			.toList();
	}

	@Transactional(readOnly = true)
	public SvgSceneResponse getForUser(String code, AuthenticatedUser actor) {
		return userSvgSceneRepository.findByOwnerIdAndCodeIgnoreCase(actor.id(), normalizeCode(code))
			.map(this::toResponse)
			.orElse(null);
	}

	@Transactional
	public SvgSceneResponse saveForUser(String code, SvgSceneSaveRequest request, AuthenticatedUser actor) {
		String normalizedCode = normalizeCode(code);
		String requestCode = normalizeCode(request.code());
		if (!normalizedCode.equals(requestCode)) {
			throw new IllegalArgumentException("Le code du chemin et le code du payload doivent correspondre.");
		}

		String svgMarkup = svgSceneService.validateAndNormalizeMarkup(request.svgMarkup());
		UserAccount owner = userAccountRepository.findById(actor.id())
			.orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
		LocalDateTime now = LocalDateTime.now();

		UserSvgSceneDocument document = userSvgSceneRepository
			.findByOwnerIdAndCodeIgnoreCase(actor.id(), normalizedCode)
			.orElseGet(() -> new UserSvgSceneDocument(
				owner,
				normalizedCode,
				request.name().trim(),
				svgMarkup,
				now,
				now
			));

		document.setOwner(owner);
		document.setCode(normalizedCode);
		document.setName(request.name().trim());
		document.setSvgMarkup(svgMarkup);
		document.setUpdatedAt(now);

		if (document.getCreatedAt() == null) {
			document.setCreatedAt(now);
		}

		return toResponse(userSvgSceneRepository.save(document));
	}

	private SvgSceneResponse toResponse(UserSvgSceneDocument document) {
		return new SvgSceneResponse(
			document.getCode(),
			document.getName(),
			document.getSvgMarkup(),
			document.getCreatedAt(),
			document.getUpdatedAt(),
			document.getOwner().getUsername()
		);
	}

	private String normalizeCode(String code) {
		if (code == null) {
			throw new IllegalArgumentException("Le code est obligatoire.");
		}

		String normalized = code.trim().toLowerCase(Locale.ROOT);
		if (normalized.isBlank()) {
			throw new IllegalArgumentException("Le code est obligatoire.");
		}

		if (!normalized.matches("[a-z0-9-]+")) {
			throw new IllegalArgumentException("Le code doit contenir uniquement des lettres minuscules, chiffres et tirets.");
		}

		return normalized;
	}
}
