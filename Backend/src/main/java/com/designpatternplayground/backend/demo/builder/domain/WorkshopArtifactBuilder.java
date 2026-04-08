package com.designpatternplayground.backend.demo.builder.domain;

import java.util.ArrayList;
import java.util.List;

public class WorkshopArtifactBuilder implements ArtifactBuilder {

	private String buildName;
	private BuilderProductType productType;
	private SilhouetteOption silhouette;
	private CoreModuleOption coreModule;
	private AddonOption addonModule;
	private FinishStyleOption finishStyle;
	private BuildStats runningStats;
	private List<BuildStage> stages;

	@Override
	public void reset(String buildName, BuilderProductType productType) {
		this.buildName = buildName;
		this.productType = productType;
		this.silhouette = null;
		this.coreModule = null;
		this.addonModule = null;
		this.finishStyle = null;
		this.runningStats = BuildStats.zero();
		this.stages = new ArrayList<>();
	}

	@Override
	public void applySilhouette(SilhouetteOption silhouette) {
		this.silhouette = silhouette;
		appendStage(
			"SILHOUETTE",
			productType.silhouetteStageLabel(),
			silhouette.code(),
			silhouette.labelFor(productType),
			silhouette.detailFor(productType, buildName),
			silhouette.stats()
		);
	}

	@Override
	public void applyCoreModule(CoreModuleOption coreModule) {
		this.coreModule = coreModule;
		appendStage(
			"CORE",
			productType.coreStageLabel(),
			coreModule.code(),
			coreModule.labelFor(productType),
			coreModule.detailFor(productType, buildName),
			coreModule.stats()
		);
	}

	@Override
	public void applyAddonModule(AddonOption addonModule) {
		this.addonModule = addonModule;
		appendStage(
			"ADDON",
			productType.addonStageLabel(),
			addonModule.code(),
			addonModule.labelFor(productType),
			addonModule.detailFor(productType, buildName),
			addonModule.stats()
		);
	}

	@Override
	public void applyFinishStyle(FinishStyleOption finishStyle) {
		this.finishStyle = finishStyle;
		appendStage(
			"FINISH",
			productType.finishStageLabel(),
			finishStyle.code(),
			finishStyle.labelFor(productType),
			finishStyle.detailFor(productType, buildName),
			finishStyle.stats()
		);
	}

	@Override
	public BuiltArtifact build() {
		return new BuiltArtifact(
			buildName,
			productType,
			silhouette.code(),
			silhouette.labelFor(productType),
			coreModule.code(),
			coreModule.labelFor(productType),
			addonModule.code(),
			addonModule.labelFor(productType),
			finishStyle.code(),
			finishStyle.labelFor(productType),
			List.copyOf(stages),
			runningStats
		);
	}

	private void appendStage(
		String stageCode,
		String stageLabel,
		String optionCode,
		String optionLabel,
		String detail,
		BuildStats deltaStats
	) {
		runningStats = runningStats.add(deltaStats);
		stages.add(new BuildStage(
			stages.size() + 1,
			stageCode,
			stageLabel,
			optionCode,
			optionLabel,
			detail,
			deltaStats,
			runningStats
		));
	}
}
