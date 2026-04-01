package com.designpatternplayground.backend.demo.singleton.domain;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

public class GlobalSettingsManager {

	private final String instanceId;
	private final Map<String, String> settings = new LinkedHashMap<>();

	public GlobalSettingsManager(String instanceId) {
		this.instanceId = instanceId;
	}

	public String instanceId() {
		return instanceId;
	}

	public void update(String key, String value) {
		settings.put(key, value);
	}

	public Optional<String> read(String key) {
		return Optional.ofNullable(settings.get(key));
	}
}
