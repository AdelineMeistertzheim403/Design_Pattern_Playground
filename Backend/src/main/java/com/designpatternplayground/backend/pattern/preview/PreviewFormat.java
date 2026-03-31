package com.designpatternplayground.backend.pattern.preview;

public enum PreviewFormat {
	TEXT("text"),
	CHECKLIST("checklist");

	private final String apiValue;

	PreviewFormat(String apiValue) {
		this.apiValue = apiValue;
	}

	public String apiValue() {
		return apiValue;
	}

	public static PreviewFormat from(String rawFormat) {
		if (rawFormat == null || rawFormat.isBlank()) {
			return TEXT;
		}

		for (PreviewFormat format : values()) {
			if (format.apiValue.equalsIgnoreCase(rawFormat)) {
				return format;
			}
		}

		throw new IllegalArgumentException("Unsupported preview format: " + rawFormat);
	}
}
