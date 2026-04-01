# Backend

Backend Spring Boot du `Design Pattern Playground`.

Ce document explique comment ajouter un nouveau design pattern dans l'API.

## Vue d'ensemble

Le backend expose les patterns via un contrat commun :

- [DesignPatternDemo.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/api/DesignPatternDemo.java)
- [PatternController.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/web/PatternController.java)
- [PatternRegistry.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/registry/PatternRegistry.java)

Quand un bean Spring `@Component` implemente `DesignPatternDemo`, il est automatiquement detecte par le registre. Il n'y a donc rien a declarer a la main dans un tableau central.

## Contrat a respecter

Un pattern doit fournir 4 choses :

1. `getCode()`
Le code technique stable du pattern, par exemple `decorator`, `command`, `builder`.

2. `getMetadata()`
Les informations affichees dans le catalogue :
- `code`
- `name`
- `type`
- `description`
- `useCase`
- `complexityLevel`

3. `getSchema()`
Le schema dynamique du formulaire frontend, base sur :
- [PatternSchema.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/PatternSchema.java)
- [PatternField.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/PatternField.java)
- [FieldType.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/FieldType.java)

4. `execute()`
La demonstration elle-meme, qui retourne :
- un `summary`
- des `logs`
- un `output`
- une `visualization`

Le type de retour est :
- [PatternExecutionResult.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/PatternExecutionResult.java)

La requete recue par le pattern est :
- [PatternExecutionRequest.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/PatternExecutionRequest.java)

## Structure recommandee

Pour un nouveau pattern `decorator`, cree ce type d'arborescence :

```text
Backend/src/main/java/com/designpatternplayground/backend/demo/decorator/
├── DecoratorConfig.java
├── DecoratorPatternDemo.java
└── domain/
    ├── Component.java
    ├── ConcreteComponent.java
    ├── BaseDecorator.java
    └── SpeedBoostDecorator.java
```

Regarde comme reference :

- [FactoryPatternDemo.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/demo/factory/FactoryPatternDemo.java)
- [FlyweightPatternDemo.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/demo/flyweight/FlyweightPatternDemo.java)
- [StatePatternDemo.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/demo/state/StatePatternDemo.java)

## Etapes pour ajouter un pattern

### 1. Creer le package du pattern

Cree un nouveau dossier dans :

```text
Backend/src/main/java/com/designpatternplayground/backend/demo/<pattern-code>/
```

Exemple :

```text
Backend/src/main/java/com/designpatternplayground/backend/demo/decorator/
```

### 2. Creer un objet de configuration

Ajoute une classe simple pour convertir `Map<String, Object>` vers un modele lisible.

Exemple :

```java
package com.designpatternplayground.backend.demo.decorator;

public record DecoratorConfig(
	String baseCharacter,
	boolean shield,
	boolean fire
) {
}
```

L'objectif est d'eviter de manipuler `request.parameters()` partout dans `execute()`.

### 3. Creer le domaine de demonstration

Ajoute dans `domain/` les classes qui illustrent vraiment le pattern.

Le principe du projet est pedagogique :

- le domaine doit etre petit
- les roles doivent etre faciles a lire
- les noms doivent raconter le pattern

Exemples existants :

- `PaymentContext` / `PaymentStrategy` pour `Strategy`
- `NotificationPublisher` / `SubscriberObserver` pour `Observer`
- `CharacterContext` / `IdleState` / `RunningState` pour `State`

### 4. Creer la classe `*PatternDemo`

La classe principale doit :

- etre annotee `@Component`
- implementer `DesignPatternDemo`
- exposer metadata, schema et execution

Exemple minimal :

```java
package com.designpatternplayground.backend.demo.decorator;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.pattern.api.DesignPatternDemo;
import com.designpatternplayground.backend.pattern.domain.FieldType;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionRequest;
import com.designpatternplayground.backend.pattern.domain.PatternExecutionResult;
import com.designpatternplayground.backend.pattern.domain.PatternField;
import com.designpatternplayground.backend.pattern.domain.PatternMetadata;
import com.designpatternplayground.backend.pattern.domain.PatternSchema;
import com.designpatternplayground.backend.pattern.domain.PatternType;
import com.designpatternplayground.backend.pattern.domain.VisualizationGraph;

@Component
public class DecoratorPatternDemo implements DesignPatternDemo {

	@Override
	public String getCode() {
		return "decorator";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"decorator",
			"Decorator",
			PatternType.STRUCTURAL,
			"Ajoute des responsabilites a un objet sans modifier sa classe.",
			"Empiler des bonus ou des effets sur un personnage.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("baseCharacter", "Personnage", FieldType.TEXT, true, null, "Runner"),
			new PatternField("shield", "Shield", FieldType.BOOLEAN, true, null, "true"),
			new PatternField("fire", "Fire", FieldType.BOOLEAN, true, null, "false")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		DecoratorConfig config = toConfig(request.parameters());

		return new PatternExecutionResult(
			getCode(),
			"Le personnage est enrichi progressivement par des decorators.",
			List.of("Creation du composant de base.", "Ajout des decorators selectionnes."),
			Map.of("character", config.baseCharacter()),
			new VisualizationGraph(List.of(), List.of())
		);
	}

	private DecoratorConfig toConfig(Map<String, Object> parameters) {
		return new DecoratorConfig(
			String.valueOf(parameters.get("baseCharacter")),
			Boolean.parseBoolean(String.valueOf(parameters.get("shield"))),
			Boolean.parseBoolean(String.valueOf(parameters.get("fire")))
		);
	}
}
```

### 5. Valider les parametres proprement

Quand une valeur est absente ou invalide, leve :

- [InvalidPatternConfigurationException.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/common/exception/InvalidPatternConfigurationException.java)

Exemple :

```java
if (parameters == null) {
	throw new InvalidPatternConfigurationException("Les parametres sont obligatoires.");
}
```

Ne laisse pas partir des `NullPointerException` generiques si tu peux produire un message metier clair.

### 6. Soigner la sortie `output`

`output` est lu par le frontend dans la zone "Retour d execution" et parfois par les scenes specifiques.

Bonnes pratiques :

- utiliser une `LinkedHashMap` si l'ordre est important
- preferer des cles stables
- fournir des labels deja lisibles quand c'est utile
- garder une structure simple pour le front

Exemple :

```java
LinkedHashMap<String, Object> output = new LinkedHashMap<>();
output.put("mode", "WITH_DECORATOR");
output.put("powerUps", List.of("SHIELD", "FIRE"));
output.put("finalSpeed", 12);
```

### 7. Construire une `visualization`

Le frontend peut deja afficher une scene generique a partir de :

- [VisualizationGraph.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/VisualizationGraph.java)
- [VisualizationNode.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/VisualizationNode.java)
- [VisualizationEdge.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/domain/VisualizationEdge.java)

Minimum recommande :

- 2 a 6 noeuds significatifs
- des labels courts
- des `type` coherents (`context`, `strategy`, `observer`, `factory`, `output`, etc.)
- des `data.detail` ou `data.message` quand une info doit etre reprise visuellement

Exemple :

```java
new VisualizationGraph(
	List.of(
		new VisualizationNode("component", "Character", "component", Map.of()),
		new VisualizationNode("decorator", "ShieldDecorator", "decorator", Map.of("detail", "+ defense"))
	),
	List.of(
		new VisualizationEdge("decorator", "component", "wraps")
	)
)
```

### 8. Aucun changement requis dans le registre ou le controller

Si ta classe est bien :

- dans le package scanne par Spring
- annotee `@Component`
- et implemente `DesignPatternDemo`

alors :

- [PatternRegistry.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/pattern/registry/PatternRegistry.java) la verra automatiquement
- [PatternController.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/main/java/com/designpatternplayground/backend/web/PatternController.java) l'exposera automatiquement

## Tests a mettre a jour

Le point a ne pas oublier est :

- [PatternControllerTest.java](/home/adeline/Documents/Design_Patern_Playground/Backend/src/test/java/com/designpatternplayground/backend/web/PatternControllerTest.java)

Quand tu ajoutes un pattern :

1. mets a jour le nombre attendu dans `shouldExposeAvailablePatterns()`
2. ajoute un test d'execution pour ton nouveau pattern
3. ajoute un test de schema si le pattern a des champs importants

Exemple de squelette :

```java
@Test
void shouldExecuteDecoratorPattern() throws Exception {
	mockMvc.perform(post("/api/patterns/execute")
		.contentType(MediaType.APPLICATION_JSON)
		.content("""
			{
			  "patternCode": "decorator",
			  "parameters": {
			    "baseCharacter": "Runner",
			    "shield": true,
			    "fire": false
			  }
			}
			"""))
		.andExpect(status().isOk())
		.andExpect(jsonPath("$.patternCode").value("decorator"))
		.andExpect(jsonPath("$.output.mode").value("WITH_DECORATOR"));
}
```

## Checklist backend

- package `demo/<code>/` cree
- config du pattern creee
- domaine pedagogique cree
- classe `*PatternDemo` ajoutee avec `@Component`
- metadata correctes
- schema correct
- validation metier propre
- `summary`, `logs`, `output`, `visualization` retournes
- tests `PatternControllerTest` mis a jour

## Commandes utiles

Depuis le dossier `Backend` :

```bash
./mvnw test
./mvnw spring-boot:run
```

API utiles une fois le pattern ajoute :

```bash
GET  /api/patterns
GET  /api/patterns/<code>
GET  /api/patterns/<code>/schema
POST /api/patterns/execute
```

## Conseils de conception

- Concentre la logique pedagogique dans un seul petit domaine.
- Choisis un cas d'usage concret et visuel.
- Stabilise les noms de champs du schema et de l'output.
- Garde l'output assez riche pour le frontend, mais sans surmodeliser.
- Si le pattern merite une scene front specifique, pense des le backend aux donnees dont cette scene aura besoin.
