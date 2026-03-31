package com.designpatternplayground.backend.pattern.api;

import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;

public interface DesignPatternDemo {

	String getCode();

	PatternMetadata getMetadata();

	PatternSchema getSchema();

	PatternExecutionResult execute(PatternExecutionRequest request);
}
