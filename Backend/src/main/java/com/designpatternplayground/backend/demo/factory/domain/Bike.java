package com.designpatternplayground.backend.demo.factory.domain;

public class Bike implements Vehicle {

	@Override
	public String type() {
		return "BIKE";
	}

	@Override
	public String label() {
		return "Moto";
	}

	@Override
	public String description() {
		return "Vehicule agile cree pour des scenarios de livraison ou de mobilite rapide.";
	}
}
