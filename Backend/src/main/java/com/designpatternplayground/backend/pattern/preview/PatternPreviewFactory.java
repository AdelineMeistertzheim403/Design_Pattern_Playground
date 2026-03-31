package com.designpatternplayground.backend.pattern.preview;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class PatternPreviewFactory {

	private final Map<PreviewFormat, PatternPreviewFormatter> formatters;

	public PatternPreviewFactory(List<PatternPreviewFormatter> formatters) {
		this.formatters = new EnumMap<>(PreviewFormat.class);

		for (PatternPreviewFormatter formatter : formatters) {
			PatternPreviewFormatter previous = this.formatters.put(formatter.format(), formatter);
			if (previous != null) {
				throw new IllegalStateException("Duplicate formatter registered for " + formatter.format());
			}
		}
	}

	public PatternPreviewFormatter get(PreviewFormat format) {
		PatternPreviewFormatter formatter = formatters.get(format);
		if (formatter == null) {
			throw new IllegalArgumentException("No formatter registered for " + format);
		}
		return formatter;
	}
}
