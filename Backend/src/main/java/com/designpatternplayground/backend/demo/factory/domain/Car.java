package com.designpatternplayground.backend.demo.factory.domain;

public class Car implements Vehicle {

	@Override
	public String type() {
		return "CAR";
	}

	@Override
	public String label() {
		return "Voiture";
	}

	@Override
	public String description() {
		return "Vehicule routier cree pour des scenarios urbains ou longue distance.";
	}
}
