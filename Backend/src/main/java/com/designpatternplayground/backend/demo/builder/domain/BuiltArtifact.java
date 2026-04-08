package com.designpatternplayground.backend.demo.builder.domain;

import java.util.List;

public record BuiltArtifact(
	String buildName,
	BuilderProductType productType,
	String silhouetteCode,
	String silhouetteLabel,
	String coreModuleCode,
	String coreModuleLabel,
	String addonModuleCode,
	String addonModuleLabel,
	String finishStyleCode,
	String finishStyleLabel,
	List<BuildStage> stages,
	BuildStats stats
) {
}
