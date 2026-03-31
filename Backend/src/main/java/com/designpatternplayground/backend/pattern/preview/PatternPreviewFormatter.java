package com.designpatternplayground.backend.pattern.preview;

import java.util.List;

import com.designpatternplayground.backend.pattern.domain.PatternExample;

public interface PatternPreviewFormatter {

	PreviewFormat format();

	List<String> preview(PatternExample pattern);
}
