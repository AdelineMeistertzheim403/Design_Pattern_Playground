package com.designpatternplayground.backend.demo.singleton.domain;

public class SingletonSettingsProvider {

	private final GlobalSettingsManager instance = new GlobalSettingsManager("instance-1");

	public GlobalSettingsManager getInstance() {
		return instance;
	}
}
