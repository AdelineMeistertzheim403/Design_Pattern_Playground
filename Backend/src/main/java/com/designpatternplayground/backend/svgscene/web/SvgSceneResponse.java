package com.designpatternplayground.backend.svgscene.web;

import java.time.LocalDateTime;

public record SvgSceneResponse(
	String code,
	String name,
	String svgMarkup,
	LocalDateTime createdAt,
	LocalDateTime updatedAt,
	String updatedBy
) {
}
