package com.designpatternplayground.backend.progress.domain;

import java.util.List;

public record RecentActivityResponse(
	List<RecentActivityItemResponse> items
) {
}
