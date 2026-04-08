package com.designpatternplayground.backend.demo.prototype.domain;

public final class PrototypeCompanionState {

	private String code;
	private String label;
	private String colorHex;
	private String effectLabel;
	private String syncKey;
	private int bonusAttack;
	private int bonusDefense;
	private int bonusSpeed;

	public PrototypeCompanionState(
		String code,
		String label,
		String colorHex,
		String effectLabel,
		String syncKey,
		int bonusAttack,
		int bonusDefense,
		int bonusSpeed
	) {
		this.code = code;
		this.label = label;
		this.colorHex = colorHex;
		this.effectLabel = effectLabel;
		this.syncKey = syncKey;
		this.bonusAttack = bonusAttack;
		this.bonusDefense = bonusDefense;
		this.bonusSpeed = bonusSpeed;
	}

	public PrototypeCompanionState deepCopy() {
		return new PrototypeCompanionState(code, label, colorHex, effectLabel, syncKey, bonusAttack, bonusDefense, bonusSpeed);
	}

	public void applyPreset(PrototypeMutationPreset preset) {
		this.code = preset.code();
		this.label = preset.label();
		this.colorHex = preset.colorHex();
		this.effectLabel = preset.effectLabel();
		this.syncKey = preset.syncKey();
		this.bonusAttack = preset.bonusAttack();
		this.bonusDefense = preset.bonusDefense();
		this.bonusSpeed = preset.bonusSpeed();
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public String colorHex() {
		return colorHex;
	}

	public String effectLabel() {
		return effectLabel;
	}

	public String syncKey() {
		return syncKey;
	}

	public int bonusAttack() {
		return bonusAttack;
	}

	public int bonusDefense() {
		return bonusDefense;
	}

	public int bonusSpeed() {
		return bonusSpeed;
	}
}
