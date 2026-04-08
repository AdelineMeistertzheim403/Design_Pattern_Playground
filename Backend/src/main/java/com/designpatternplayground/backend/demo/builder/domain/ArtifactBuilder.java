package com.designpatternplayground.backend.demo.builder.domain;

public interface ArtifactBuilder {

	void reset(String buildName, BuilderProductType productType);

	void applySilhouette(SilhouetteOption silhouette);

	void applyCoreModule(CoreModuleOption coreModule);

	void applyAddonModule(AddonOption addonModule);

	void applyFinishStyle(FinishStyleOption finishStyle);

	BuiltArtifact build();
}
