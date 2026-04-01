package com.designpatternplayground.backend.demo.flyweight.domain;

import java.util.LinkedHashMap;
import java.util.Map;

public class SceneObjectFlyweightFactory {

	private final Map<String, SharedSceneAsset> cache = new LinkedHashMap<>();

	public SharedSceneAsset getFlyweight(FlyweightAssetProfile profile, int variantIndex) {
		String variantCode = profile.code() + "-" + variantIndex;

		return cache.computeIfAbsent(
			variantCode,
			key -> new SharedSceneAsset(
				key,
				profile.label() + " " + variantIndex,
				profile.intrinsicStateKb(),
				profile.description()
			)
		);
	}

	public int size() {
		return cache.size();
	}
}
