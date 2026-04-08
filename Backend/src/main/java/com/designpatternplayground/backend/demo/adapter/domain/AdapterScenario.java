package com.designpatternplayground.backend.demo.adapter.domain;

import java.util.Arrays;
import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public enum AdapterScenario {

	VGA_TO_HDMI(
		"VGA_TO_HDMI",
		"Legacy console -> Smart screen",
		"LegacyConsole",
		"VGA output",
		"Analog video",
		"%s :: 640x480 analog frame",
		"VgaToHdmiAdapter",
		"Convertit un flux VGA analogique vers une sortie HDMI comprise par l ecran moderne.",
		"SmartScreen",
		"HDMI input",
		"HDMI digital",
		"%s :: HDMI 1080p bridge",
		"Le SmartScreen attend une entree HDMI numerique. Un branchement direct VGA echoue.",
		"L adaptateur encapsule le signal analogique et expose une sortie HDMI exploitable."
	),
	SERIAL_TO_REST(
		"SERIAL_TO_REST",
		"Factory sensor -> Cloud dashboard",
		"FactorySensor",
		"RS-232 port",
		"Serial frames",
		"FRAME[%s]|crc=42",
		"SerialToRestAdapter",
		"Traduit des trames serie vers un appel REST JSON attendu par le dashboard cloud.",
		"CloudDashboard",
		"HTTPS endpoint",
		"REST JSON",
		"{\"event\":\"%s\",\"transport\":\"https\"}",
		"Le dashboard cloud attend une requete REST JSON. Une trame serie brute ne peut pas etre consommee telle quelle.",
		"L adaptateur mappe la trame serie et publie un payload JSON sur l endpoint HTTP cible."
	),
	XML_TO_JSON(
		"XML_TO_JSON",
		"Legacy CRM -> Mobile API",
		"LegacyCRM",
		"SOAP XML feed",
		"XML envelope",
		"<event><label>%s</label></event>",
		"XmlToJsonAdapter",
		"Traduit un message XML historique vers un DTO JSON accepte par une API mobile moderne.",
		"MobileApi",
		"JSON endpoint",
		"REST JSON",
		"{\"label\":\"%s\",\"source\":\"legacy-crm\"}",
		"L API mobile ne parle pas SOAP XML. Le contrat cible impose un payload JSON simple.",
		"L adaptateur consomme le XML historique et renvoie un DTO JSON compatible avec l API."
	);

	private final String code;
	private final String label;
	private final String sourceSystem;
	private final String sourceInterface;
	private final String sourceProtocol;
	private final String sourceSignalTemplate;
	private final String adapterClassName;
	private final String adapterRole;
	private final String targetSystem;
	private final String targetInterface;
	private final String targetProtocol;
	private final String targetSignalTemplate;
	private final String failureReason;
	private final String successDetail;

	AdapterScenario(
		String code,
		String label,
		String sourceSystem,
		String sourceInterface,
		String sourceProtocol,
		String sourceSignalTemplate,
		String adapterClassName,
		String adapterRole,
		String targetSystem,
		String targetInterface,
		String targetProtocol,
		String targetSignalTemplate,
		String failureReason,
		String successDetail
	) {
		this.code = code;
		this.label = label;
		this.sourceSystem = sourceSystem;
		this.sourceInterface = sourceInterface;
		this.sourceProtocol = sourceProtocol;
		this.sourceSignalTemplate = sourceSignalTemplate;
		this.adapterClassName = adapterClassName;
		this.adapterRole = adapterRole;
		this.targetSystem = targetSystem;
		this.targetInterface = targetInterface;
		this.targetProtocol = targetProtocol;
		this.targetSignalTemplate = targetSignalTemplate;
		this.failureReason = failureReason;
		this.successDetail = successDetail;
	}

	public String code() {
		return code;
	}

	public String label() {
		return label;
	}

	public String sourceSystem() {
		return sourceSystem;
	}

	public String sourceInterface() {
		return sourceInterface;
	}

	public String sourceProtocol() {
		return sourceProtocol;
	}

	public String adapterClassName() {
		return adapterClassName;
	}

	public String adapterRole() {
		return adapterRole;
	}

	public String targetSystem() {
		return targetSystem;
	}

	public String targetInterface() {
		return targetInterface;
	}

	public String targetProtocol() {
		return targetProtocol;
	}

	public String failureReason() {
		return failureReason;
	}

	public String successDetail() {
		return successDetail;
	}

	public String sourceSignal(String payloadLabel) {
		return sourceSignalTemplate.formatted(payloadLabel);
	}

	public String adaptedSignal(String payloadLabel) {
		return targetSignalTemplate.formatted(payloadLabel);
	}

	public static AdapterScenario fromCode(String code) {
		return Arrays.stream(values())
			.filter(value -> value.code.equals(code == null ? "" : code.trim().toUpperCase(Locale.ROOT)))
			.findFirst()
			.orElseThrow(() -> new InvalidPatternConfigurationException("Scenario Adapter inconnu : " + code));
	}
}
