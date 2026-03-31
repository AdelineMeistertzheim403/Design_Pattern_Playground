package com.designpatternplayground.backend.demo.factory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.factory.domain.Vehicle;
import com.designpatternplayground.backend.demo.factory.domain.VehicleFactory;
import com.designpatternplayground.backend.pattern.api.DesignPatternDemo;
import com.designpatternplayground.backend.pattern.domain.FieldType;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternField;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;
import com.designpatternplayground.backend.pattern.domain.PatternType;
import com.designpatternplayground.backend.pattern.domain.VisualizationEdge;
import com.designpatternplayground.backend.pattern.domain.VisualizationGraph;
import com.designpatternplayground.backend.pattern.domain.VisualizationNode;

@Component
public class FactoryPatternDemo implements DesignPatternDemo {

	@Override
	public String getCode() {
		return "factory";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"factory",
			"Factory Method",
			PatternType.CREATIONAL,
			"Centralise la creation d objets derriere une fabrique dediee au lieu de disperser les constructeurs.",
			"Choisir la bonne implementation de vehicule selon le scenario demande.",
			"BEGINNER"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField(
				"vehicleType",
				"Type de vehicule",
				FieldType.SELECT,
				true,
				List.of("CAR", "BIKE"),
				"CAR"
			)
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		FactoryConfig config = toConfig(request.parameters());
		List<String> logs = new ArrayList<>();

		logs.add("Creation du point d entree factory.");
		logs.add("Demande de creation pour le type " + config.vehicleType() + ".");

		VehicleFactory factory = new VehicleFactory();
		Vehicle vehicle = factory.createVehicle(config.vehicleType());

		logs.add("Instantiation du produit concret : " + vehicle.label() + ".");
		logs.add("Retour du produit sans exposer le constructeur au client.");

		Map<String, Object> output = Map.of(
			"vehicleType", vehicle.type(),
			"vehicleLabel", vehicle.label(),
			"description", vehicle.description()
		);

		VisualizationGraph visualization = new VisualizationGraph(
			List.of(
				new VisualizationNode("client", "Client", "client", Map.of()),
				new VisualizationNode("factory", "VehicleFactory", "factory", Map.of()),
				new VisualizationNode("product", vehicle.label(), "product", Map.of("type", vehicle.type()))
			),
			List.of(
				new VisualizationEdge("client", "factory", "request"),
				new VisualizationEdge("factory", "product", "create")
			)
		);

		return new PatternExecutionResult(
			getCode(),
			"Factory Method centralise la creation du produit derriere une interface stable.",
			logs,
			output,
			visualization
		);
	}

	private FactoryConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null || parameters.get("vehicleType") == null) {
			throw new InvalidPatternConfigurationException("vehicleType est obligatoire.");
		}

		return new FactoryConfig(parameters.get("vehicleType").toString());
	}
}
