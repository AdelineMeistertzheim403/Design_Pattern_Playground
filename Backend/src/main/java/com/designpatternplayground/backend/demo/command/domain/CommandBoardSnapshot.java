package com.designpatternplayground.backend.demo.command.domain;

public record CommandBoardSnapshot(
	int x,
	int y,
	int beaconCount
) {
}
