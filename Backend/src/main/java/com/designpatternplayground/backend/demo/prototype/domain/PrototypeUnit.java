package com.designpatternplayground.backend.demo.prototype.domain;

public final class PrototypeUnit {

	private final String id;
	private final String label;
	private final String serial;
	private String shellColorHex;
	private String shellLabel;
	private final int baseAttack;
	private final int baseDefense;
	private final int baseSpeed;
	private final PrototypeCompanionState companionState;

	public PrototypeUnit(
		String id,
		String label,
		String serial,
		String shellColorHex,
		String shellLabel,
		int baseAttack,
		int baseDefense,
		int baseSpeed,
		PrototypeCompanionState companionState
	) {
		this.id = id;
		this.label = label;
		this.serial = serial;
		this.shellColorHex = shellColorHex;
		this.shellLabel = shellLabel;
		this.baseAttack = baseAttack;
		this.baseDefense = baseDefense;
		this.baseSpeed = baseSpeed;
		this.companionState = companionState;
	}

	public PrototypeUnit shallowClone(String id, String label, String serial) {
		return new PrototypeUnit(
			id,
			label,
			serial,
			shellColorHex,
			shellLabel,
			baseAttack,
			baseDefense,
			baseSpeed,
			companionState
		);
	}

	public PrototypeUnit deepClone(String id, String label, String serial) {
		return new PrototypeUnit(
			id,
			label,
			serial,
			shellColorHex,
			shellLabel,
			baseAttack,
			baseDefense,
			baseSpeed,
			companionState.deepCopy()
		);
	}

	public void retuneShell(String shellColorHex, String shellLabel) {
		this.shellColorHex = shellColorHex;
		this.shellLabel = shellLabel;
	}

	public void applyCompanionMutation(PrototypeMutationPreset preset) {
		companionState.applyPreset(preset);
	}

	public boolean sharesCompanionWith(PrototypeUnit other) {
		return this.companionState == other.companionState;
	}

	public String companionReferenceId() {
		return Integer.toHexString(System.identityHashCode(companionState)).toUpperCase();
	}

	public String id() {
		return id;
	}

	public String label() {
		return label;
	}

	public String serial() {
		return serial;
	}

	public String shellColorHex() {
		return shellColorHex;
	}

	public String shellLabel() {
		return shellLabel;
	}

	public int baseAttack() {
		return baseAttack;
	}

	public int baseDefense() {
		return baseDefense;
	}

	public int baseSpeed() {
		return baseSpeed;
	}

	public int attack() {
		return baseAttack + companionState.bonusAttack();
	}

	public int defense() {
		return baseDefense + companionState.bonusDefense();
	}

	public int speed() {
		return baseSpeed + companionState.bonusSpeed();
	}

	public PrototypeCompanionState companionState() {
		return companionState;
	}
}
