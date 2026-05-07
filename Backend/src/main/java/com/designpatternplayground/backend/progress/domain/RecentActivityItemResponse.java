package com.designpatternplayground.backend.progress.domain;

import java.time.LocalDateTime;

public record RecentActivityItemResponse(
	String type,
	String title,
	String detail,
	String relatedCode,
	LocalDateTime occurredAt
) {
}
