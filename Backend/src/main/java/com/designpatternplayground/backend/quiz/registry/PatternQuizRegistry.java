package com.designpatternplayground.backend.quiz.registry;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.QuizNotFoundException;
import com.designpatternplayground.backend.quiz.api.PatternQuizProvider;
import com.designpatternplayground.backend.quiz.domain.PatternQuiz;

@Component
public class PatternQuizRegistry {

	private final Map<String, PatternQuizProvider> providers;

	public PatternQuizRegistry(List<PatternQuizProvider> providerList) {
		this.providers = providerList.stream()
			.collect(Collectors.toUnmodifiableMap(
				provider -> normalize(provider.getPatternCode()),
				provider -> provider
			));
	}

	public PatternQuiz getByPatternCode(String code) {
		PatternQuizProvider provider = providers.get(normalize(code));
		if (provider == null) {
			throw new QuizNotFoundException(code);
		}
		return provider.getQuiz();
	}

	private String normalize(String code) {
		return code == null ? "" : code.trim().toLowerCase(Locale.ROOT);
	}
}
