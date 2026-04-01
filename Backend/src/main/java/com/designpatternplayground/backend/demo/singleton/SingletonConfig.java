package com.designpatternplayground.backend.demo.singleton;

import java.util.List;

public record SingletonConfig(
	String mode,
	List<String> clients,
	String settingKey,
	String settingValue
) {
}
