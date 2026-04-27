package com.designpatternplayground.backend.svgscene.application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.designpatternplayground.backend.auth.security.AuthenticatedUser;
import com.designpatternplayground.backend.svgscene.domain.SvgSceneDocument;
import com.designpatternplayground.backend.svgscene.domain.SvgSceneRepository;
import com.designpatternplayground.backend.svgscene.web.SvgSceneResponse;
import com.designpatternplayground.backend.svgscene.web.SvgSceneSaveRequest;

@Service
public class SvgSceneService {

	private static final int MAX_SVG_LENGTH = 1_000_000;
	private static final Pattern SCRIPT_TAG = Pattern.compile("<\\s*script\\b", Pattern.CASE_INSENSITIVE);
	private static final Pattern EVENT_HANDLER = Pattern.compile("\\son[a-z]+\\s*=", Pattern.CASE_INSENSITIVE);
	private static final Pattern JAVASCRIPT_URL = Pattern.compile("javascript\\s*:", Pattern.CASE_INSENSITIVE);

	private final SvgSceneRepository svgSceneRepository;

	public SvgSceneService(SvgSceneRepository svgSceneRepository) {
		this.svgSceneRepository = svgSceneRepository;
	}

	@Transactional(readOnly = true)
	public SvgSceneResponse getByCode(String code) {
		return svgSceneRepository.findByCodeIgnoreCase(normalizeCode(code))
			.map(this::toResponse)
			.orElse(null);
	}

	@Transactional(readOnly = true)
	public List<SvgSceneResponse> listAll() {
		return svgSceneRepository.findAllByOrderByUpdatedAtDesc().stream()
			.map(this::toResponse)
			.toList();
	}

	@Transactional
	public SvgSceneResponse save(String code, SvgSceneSaveRequest request, AuthenticatedUser actor) {
		String normalizedCode = normalizeCode(code);
		String requestCode = normalizeCode(request.code());
		if (!normalizedCode.equals(requestCode)) {
			throw new IllegalArgumentException("Le code du chemin et le code du payload doivent correspondre.");
		}

		String svgMarkup = validateSvgMarkup(request.svgMarkup());
		LocalDateTime now = LocalDateTime.now();
		SvgSceneDocument document = svgSceneRepository.findByCodeIgnoreCase(normalizedCode)
			.orElseGet(() -> new SvgSceneDocument(
				normalizedCode,
				request.name().trim(),
				svgMarkup,
				now,
				now,
				actor.username()
			));

		document.setCode(normalizedCode);
		document.setName(request.name().trim());
		document.setSvgMarkup(svgMarkup);
		document.setUpdatedAt(now);
		document.setUpdatedBy(actor.username());

		if (document.getCreatedAt() == null) {
			document.setCreatedAt(now);
		}

		return toResponse(svgSceneRepository.save(document));
	}

	private SvgSceneResponse toResponse(SvgSceneDocument document) {
		return new SvgSceneResponse(
			document.getCode(),
			document.getName(),
			document.getSvgMarkup(),
			document.getCreatedAt(),
			document.getUpdatedAt(),
			document.getUpdatedBy()
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

	private String validateSvgMarkup(String svgMarkup) {
		String trimmed = svgMarkup == null ? "" : svgMarkup.trim();
		if (trimmed.isBlank()) {
			throw new IllegalArgumentException("Le SVG est obligatoire.");
		}

		if (trimmed.length() > MAX_SVG_LENGTH) {
			throw new IllegalArgumentException("Le SVG ne peut pas depasser " + MAX_SVG_LENGTH + " caracteres.");
		}

		String lowerCase = trimmed.toLowerCase(Locale.ROOT);
		if (!lowerCase.startsWith("<svg") || !lowerCase.endsWith("</svg>")) {
			throw new IllegalArgumentException("La scene doit etre un document SVG complet.");
		}

		if (SCRIPT_TAG.matcher(trimmed).find() || EVENT_HANDLER.matcher(trimmed).find() || JAVASCRIPT_URL.matcher(trimmed).find()) {
			throw new IllegalArgumentException("Le SVG ne peut pas contenir de script, d attribut on* ou d URL javascript.");
		}

		return trimmed;
	}
}
