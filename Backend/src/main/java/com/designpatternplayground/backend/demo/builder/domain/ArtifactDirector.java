package com.designpatternplayground.backend.demo.builder.domain;

public class ArtifactDirector {

	public void construct(
		String buildName,
		BuilderProductType productType,
		SilhouetteOption silhouette,
		CoreModuleOption coreModule,
		AddonOption addonModule,
		FinishStyleOption finishStyle,
		ArtifactBuilder builder
	) {
		builder.reset(buildName, productType);
		builder.applySilhouette(silhouette);
		builder.applyCoreModule(coreModule);
		builder.applyAddonModule(addonModule);
		builder.applyFinishStyle(finishStyle);
	}
}
