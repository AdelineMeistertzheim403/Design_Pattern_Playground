package com.designpatternplayground.backend.demo.factory;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.factory.domain.Bike;
import com.designpatternplayground.backend.demo.factory.domain.Car;
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

	private static final String WITH_FACTORY = "WITH_FACTORY";
	private static final String WITHOUT_FACTORY = "WITHOUT_FACTORY";

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
				"mode",
				"Mode",
				FieldType.SELECT,
				true,
				List.of(WITH_FACTORY, WITHOUT_FACTORY),
				WITH_FACTORY
			),
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
		boolean useFactory = WITH_FACTORY.equals(config.mode());
		String modeLabel = useFactory ? "Avec Factory" : "Sans Factory";

		Vehicle vehicle;
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode("client", "Client", "client", Map.of()));

		if (useFactory) {
			logs.add("Creation du point d entree factory.");
			logs.add("Demande de creation pour le type " + config.vehicleType() + ".");

			VehicleFactory factory = new VehicleFactory();
			vehicle = factory.createVehicle(config.vehicleType());

			logs.add("Instantiation du produit concret : " + vehicle.label() + ".");
			logs.add("Retour du produit sans exposer le constructeur au client.");

			nodes.add(new VisualizationNode("factory", "VehicleFactory", "factory", Map.of("detail", "creation centralisee")));
			edges.add(new VisualizationEdge("client", "factory", "request"));
			edges.add(new VisualizationEdge("factory", "product", "create"));
		} else {
			logs.add("Mode sans Factory : le client connait directement le type concret.");
			logs.add("Le client choisit le constructeur correspondant a " + config.vehicleType() + ".");

			vehicle = createVehicleDirect(config.vehicleType());

			logs.add("Le code client appelle directement new " + vehicle.label() + "().");
			logs.add("Le changement de type impose de modifier le code appelant.");

			nodes.add(new VisualizationNode(
				"factory",
				"new " + vehicle.label() + "()",
				"cluster",
				Map.of("detail", "constructeur concret expose")
			));
			edges.add(new VisualizationEdge("client", "factory", "new"));
			edges.add(new VisualizationEdge("factory", "product", "return"));
		}

		nodes.add(new VisualizationNode("product", vehicle.label(), "product", Map.of("type", vehicle.type())));

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", useFactory ? WITH_FACTORY : WITHOUT_FACTORY);
		output.put("modeLabel", modeLabel);
		output.put("vehicleType", vehicle.type());
		output.put("vehicleLabel", vehicle.label());
		output.put("description", vehicle.description());
		output.put("creationStyle", useFactory ? "Factory centralisee" : "Instantiation directe");
		output.put("constructorExposed", !useFactory);

		return new PatternExecutionResult(
			getCode(),
			useFactory
				? "Factory Method centralise la creation du produit derriere une interface stable."
				: "Sans Factory, le client instancie lui-meme le produit concret et se couple a son constructeur.",
			logs,
			output,
			new VisualizationGraph(nodes, edges)
		);
	}

	private FactoryConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null || parameters.get("vehicleType") == null || parameters.get("mode") == null) {
			throw new InvalidPatternConfigurationException("mode et vehicleType sont obligatoires.");
		}

		String mode = parameters.get("mode").toString().trim().toUpperCase(Locale.ROOT);
		if (!WITH_FACTORY.equals(mode) && !WITHOUT_FACTORY.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_FACTORY ou WITHOUT_FACTORY.");
		}

		return new FactoryConfig(mode, parameters.get("vehicleType").toString());
	}

	private Vehicle createVehicleDirect(String rawVehicleType) {
		return switch (rawVehicleType.toUpperCase(Locale.ROOT)) {
			case "CAR" -> new Car();
			case "BIKE" -> new Bike();
			default -> throw new InvalidPatternConfigurationException("Type de vehicule inconnu : " + rawVehicleType);
		};
	}
}
