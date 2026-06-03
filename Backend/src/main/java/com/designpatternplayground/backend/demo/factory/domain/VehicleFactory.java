package com.designpatternplayground.backend.demo.factory.domain;

import java.util.Locale;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public class VehicleFactory {

	public Vehicle createVehicle(String type) {
		return switch (type.toUpperCase(Locale.ROOT)) {
			case "CAR" -> new Car();
			case "BIKE" -> new Bike();
			default -> throw new InvalidPatternConfigurationException("Type de véhicule inconnu : " + type);
		};
	}
}
