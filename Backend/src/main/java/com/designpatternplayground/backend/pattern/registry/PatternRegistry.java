package com.designpatternplayground.backend.pattern.registry;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.PatternNotFoundException;
import com.designpatternplayground.backend.pattern.api.DesignPatternDemo;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;

@Component
public class PatternRegistry {

	private final Map<String, DesignPatternDemo> demos;

	public PatternRegistry(List<DesignPatternDemo> demoList) {
		this.demos = demoList.stream()
			.collect(Collectors.toUnmodifiableMap(
				demo -> normalize(demo.getCode()),
				demo -> demo
			));
	}

	public DesignPatternDemo getByCode(String code) {
		DesignPatternDemo demo = demos.get(normalize(code));
		if (demo == null) {
			throw new PatternNotFoundException(code);
		}
		return demo;
	}

	public List<PatternMetadata> getAllMetadata() {
		return demos.values().stream()
			.map(DesignPatternDemo::getMetadata)
			.sorted(Comparator.comparing(PatternMetadata::type).thenComparing(PatternMetadata::name))
			.toList();
	}

	private String normalize(String code) {
		return code == null ? "" : code.trim().toLowerCase(Locale.ROOT);
	}
}
