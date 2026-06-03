package com.designpatternplayground.backend.demo.proxy;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;
import com.designpatternplayground.backend.demo.proxy.domain.ProtectedResourceProfile;
import com.designpatternplayground.backend.demo.proxy.domain.ProxyCacheState;
import com.designpatternplayground.backend.demo.proxy.domain.ProxyRequesterRole;
import com.designpatternplayground.backend.demo.proxy.domain.ProxyStep;
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
public class ProxyPatternDemo implements DesignPatternDemo {

	private static final String WITH_PROXY = "WITH_PROXY";
	private static final String WITHOUT_PROXY = "WITHOUT_PROXY";

	@Override
	public String getCode() {
		return "proxy";
	}

	@Override
	public PatternMetadata getMetadata() {
		return new PatternMetadata(
			"proxy",
			"Proxy",
			PatternType.STRUCTURAL,
			"Place un intermédiaire devant une ressource pour contrôler l'accès, retarder son chargement ou masquer sa nature réelle.",
			"Filtrer l'accès à une ressource sensible, cacher un appel réseau lourd ou activer un lazy loading avant la vraie ressource.",
			"INTERMEDIATE"
		);
	}

	@Override
	public PatternSchema getSchema() {
		return new PatternSchema(List.of(
			new PatternField("mode", "Mode", FieldType.SELECT, true, List.of(WITH_PROXY, WITHOUT_PROXY), WITH_PROXY),
			new PatternField("requestLabel", "Nom de la requête", FieldType.TEXT, true, null, "Open premium vault"),
			new PatternField("requesterRole", "Role demandeur", FieldType.SELECT, true, List.of("ADMIN", "MEMBER", "GUEST"), "GUEST"),
			new PatternField(
				"resourceCode",
				"Ressource cible",
				FieldType.SELECT,
				true,
				List.of("VAULT_VIDEO", "REPORT_ARCHIVE", "LIVE_DASHBOARD"),
				"VAULT_VIDEO"
			),
			new PatternField("cacheState", "État du cache", FieldType.SELECT, true, List.of("COLD", "WARM"), "COLD")
		));
	}

	@Override
	public PatternExecutionResult execute(PatternExecutionRequest request) {
		ProxyConfig config = toConfig(request.parameters());
		boolean useProxy = WITH_PROXY.equals(config.mode());
		ProxyRequesterRole requesterRole = ProxyRequesterRole.fromCode(config.requesterRole());
		ProtectedResourceProfile resource = ProtectedResourceProfile.fromCode(config.resourceCode());
		ProxyCacheState cacheState = ProxyCacheState.fromCode(config.cacheState());
		boolean accessGranted = resource.allows(requesterRole);
		boolean cacheHit = cacheState == ProxyCacheState.WARM;
		boolean blocked = useProxy && !accessGranted;
		boolean lazyLoadTriggered = useProxy && accessGranted && !cacheHit && resource.lazyCapable();
		boolean eagerLoadTriggered = !useProxy && !cacheHit;
		boolean securityLeak = !useProxy && !accessGranted;
		int latencyMs = computeLatency(blocked, lazyLoadTriggered, eagerLoadTriggered, cacheHit, securityLeak);

		List<ProxyStep> steps = buildSteps(useProxy, config.requestLabel(), requesterRole, resource, blocked, accessGranted, cacheHit, lazyLoadTriggered, eagerLoadTriggered, securityLeak, latencyMs);
		List<String> logs = buildLogs(useProxy, config.requestLabel(), requesterRole, resource, blocked, cacheHit, lazyLoadTriggered, eagerLoadTriggered, securityLeak);

		String accessDecisionLabel;
		if (blocked) {
			accessDecisionLabel = "Refuse par le proxy";
		} else if (securityLeak) {
			accessDecisionLabel = "Ressource exposee sans garde";
		} else if (lazyLoadTriggered) {
			accessDecisionLabel = "Autorise apres lazy loading";
		} else if (cacheHit && useProxy) {
			accessDecisionLabel = "Autorise depuis le cache";
		} else {
			accessDecisionLabel = "Accès direct";
		}

		LinkedHashMap<String, Object> output = new LinkedHashMap<>();
		output.put("mode", config.mode());
		output.put("modeLabel", useProxy ? "Avec Proxy" : "Sans Proxy");
		output.put("requestLabel", config.requestLabel());
		output.put("requesterRole", requesterRole.code());
		output.put("requesterLabel", requesterRole.label());
		output.put("resourceCode", resource.code());
		output.put("resourceLabel", resource.label());
		output.put("resourceDescription", resource.description());
		output.put("subjectLabel", resource.subjectLabel());
		output.put("payloadLabel", resource.payloadLabel());
		output.put("payloadWeightMb", resource.payloadWeightMb());
		output.put("cacheState", cacheState.code());
		output.put("cacheLabel", cacheState.label());
		output.put("accessGranted", accessGranted);
		output.put("blocked", blocked);
		output.put("securityLeak", securityLeak);
		output.put("cacheHit", cacheHit);
		output.put("lazyLoadTriggered", lazyLoadTriggered);
		output.put("eagerLoadTriggered", eagerLoadTriggered);
		output.put("accessDecisionLabel", accessDecisionLabel);
		output.put("latencyMs", latencyMs);
		output.put("stepCount", steps.size());
		output.put("steps", steps.stream().map(this::toStepMap).toList());

		return new PatternExecutionResult(
			getCode(),
			useProxy
				? "Proxy conserve le même contrat que la ressource réelle tout en ajoutant un contrôle d accès et un chargement differe quand il devient utile."
				: "Sans Proxy, le client frappe directement la ressource. Le contrôle d accès disparait du point d entrée et les chargements lourds demarrent sans mediation.",
			logs,
			output,
			buildVisualization(useProxy, resource, blocked, accessGranted, lazyLoadTriggered, eagerLoadTriggered, securityLeak)
		);
	}

	private int computeLatency(
		boolean blocked,
		boolean lazyLoadTriggered,
		boolean eagerLoadTriggered,
		boolean cacheHit,
		boolean securityLeak
	) {
		if (blocked) {
			return 48;
		}
		if (securityLeak) {
			return 930;
		}
		if (lazyLoadTriggered) {
			return 640;
		}
		if (eagerLoadTriggered) {
			return 880;
		}
		if (cacheHit) {
			return 96;
		}
		return 220;
	}

	private List<ProxyStep> buildSteps(
		boolean useProxy,
		String requestLabel,
		ProxyRequesterRole requesterRole,
		ProtectedResourceProfile resource,
		boolean blocked,
		boolean accessGranted,
		boolean cacheHit,
		boolean lazyLoadTriggered,
		boolean eagerLoadTriggered,
		boolean securityLeak,
		int latencyMs
	) {
		List<ProxyStep> steps = new ArrayList<>();
		steps.add(new ProxyStep(
			1,
			"REQUEST",
			"Émission",
			requesterRole.label(),
			"SENT",
			"La requête " + requestLabel + " part du client vers " + (useProxy ? "le proxy" : "la ressource réelle") + ".",
			32
		));

		if (useProxy) {
			steps.add(new ProxyStep(
				2,
				"PROXY_GATE",
				"Contrôle d accès",
				"AccessProxy",
				accessGranted ? "ALLOWED" : "BLOCKED",
				accessGranted
					? "Le proxy valide le role " + requesterRole.label() + " pour " + resource.label() + "."
					: "Le proxy bloque le role " + requesterRole.label() + " avant d atteindre " + resource.subjectLabel() + ".",
				blocked ? 16 : 48
			));

			if (accessGranted) {
				if (cacheHit) {
					steps.add(new ProxyStep(
						3,
						"CACHE_HIT",
						"Cache hit",
						"AccessProxy",
						"READY",
						"Le proxy sert une version déjà préparee sans toucher au " + resource.subjectLabel() + ".",
						24
					));
				} else if (lazyLoadTriggered) {
					steps.add(new ProxyStep(
						3,
						"LAZY_LOAD",
						"Lazy loading",
						resource.subjectLabel(),
						"LOADING",
						"Le proxy déclenche le chargement differe du payload " + resource.payloadLabel() + ".",
						latencyMs - 80
					));
				} else {
					steps.add(new ProxyStep(
						3,
						"FORWARD",
						"Forward",
						resource.subjectLabel(),
						"FETCH",
						"Le proxy transmet immédiatement vers la ressource réelle.",
						120
					));
				}

				steps.add(new ProxyStep(
					4,
					"DELIVER",
					"Livraison contrôlee",
					"AccessProxy",
					"DELIVERED",
					"La reponse retourne au client avec une mediation unique et lisible.",
					28
				));
			}
		} else {
			steps.add(new ProxyStep(
				2,
				"DIRECT_ACCESS",
				"Accès direct",
				resource.subjectLabel(),
				accessGranted ? "OPEN" : "UNGUARDED",
				accessGranted
					? "Le client touche directement la ressource sans garde intermédiaire."
					: "La ressource sensible est atteinte sans verification centralisee.",
				46
			));

			if (eagerLoadTriggered) {
				steps.add(new ProxyStep(
					3,
					"EAGER_LOAD",
					"Chargement eager",
					resource.subjectLabel(),
					"LOADING",
					"La ressource charge tout de suite " + resource.payloadWeightMb() + " MB avant de repondre.",
					latencyMs - 60
				));
			}

			steps.add(new ProxyStep(
				eagerLoadTriggered ? 4 : 3,
				"RETURN",
				"Retour client",
				resource.subjectLabel(),
				securityLeak ? "EXPOSED" : "DELIVERED",
				securityLeak
					? "Le payload revient alors que le role n aurait jamais du y acceder."
					: "Le resultat revient sans mediation.",
				24
			));
		}

		return List.copyOf(steps);
	}

	private List<String> buildLogs(
		boolean useProxy,
		String requestLabel,
		ProxyRequesterRole requesterRole,
		ProtectedResourceProfile resource,
		boolean blocked,
		boolean cacheHit,
		boolean lazyLoadTriggered,
		boolean eagerLoadTriggered,
		boolean securityLeak
	) {
		List<String> logs = new ArrayList<>();
		logs.add(requesterRole.label() + " demande " + requestLabel + " sur " + resource.label() + ".");
		if (useProxy) {
			logs.add("Le proxy se place devant " + resource.subjectLabel() + " et expose le même contrat au client.");
			if (blocked) {
				logs.add("Le proxy refuse l accès avant le vrai sujet. Aucun chargement réseau lourd ne demarre.");
			} else if (cacheHit) {
				logs.add("Le proxy sert la reponse depuis son cache et evite de recontacter la ressource réelle.");
			} else if (lazyLoadTriggered) {
				logs.add("Le proxy delenche un lazy loading uniquement maintenant, car la ressource est vraiment demandee.");
			} else {
				logs.add("Le proxy forwarde directement la demande vers la ressource réelle.");
			}
		} else {
			logs.add("Sans proxy, le client cible directement " + resource.subjectLabel() + ".");
			if (eagerLoadTriggered) {
				logs.add("Le chargement commence immédiatement, même si la ressource est lourde.");
			}
			if (securityLeak) {
				logs.add("Comme aucune garde n'intercepte la requête, la ressource sensible est exposee à un role non autorise.");
			}
		}
		return logs;
	}

	private VisualizationGraph buildVisualization(
		boolean useProxy,
		ProtectedResourceProfile resource,
		boolean blocked,
		boolean accessGranted,
		boolean lazyLoadTriggered,
		boolean eagerLoadTriggered,
		boolean securityLeak
	) {
		List<VisualizationNode> nodes = new ArrayList<>();
		List<VisualizationEdge> edges = new ArrayList<>();

		nodes.add(new VisualizationNode("client", "Client request", "client", Map.of("detail", "entry point")));

		if (useProxy) {
			nodes.add(new VisualizationNode(
				"proxy",
				"AccessProxy",
				"context",
				Map.of("detail", blocked ? "blocked" : "gate + cache")
			));
			nodes.add(new VisualizationNode(
				"resource",
				resource.subjectLabel(),
				"component",
				Map.of("detail", resource.label())
			));
			if (lazyLoadTriggered) {
				nodes.add(new VisualizationNode("loader", "Lazy load", "event", Map.of("detail", resource.payloadLabel())));
			}
			nodes.add(new VisualizationNode(
				"result",
				blocked ? "Blocked" : "Delivered",
				"output",
				Map.of("message", blocked ? "request refused" : "controlled response")
			));

			edges.add(new VisualizationEdge("client", "proxy", "request"));
			if (!blocked) {
				if (lazyLoadTriggered) {
					edges.add(new VisualizationEdge("proxy", "loader", "load"));
					edges.add(new VisualizationEdge("loader", "resource", "hydrate"));
				} else {
					edges.add(new VisualizationEdge("proxy", "resource", accessGranted ? "forward" : "deny"));
				}
				edges.add(new VisualizationEdge("resource", "result", "deliver"));
			} else {
				edges.add(new VisualizationEdge("proxy", "result", "block"));
			}
		} else {
			nodes.add(new VisualizationNode(
				"resource",
				resource.subjectLabel(),
				"component",
				Map.of("detail", eagerLoadTriggered ? "eager load" : resource.label())
			));
			if (eagerLoadTriggered) {
				nodes.add(new VisualizationNode("loader", "Eager load", "event", Map.of("detail", resource.payloadLabel())));
			}
			nodes.add(new VisualizationNode(
				"result",
				securityLeak ? "Exposed" : "Delivered",
				"output",
				Map.of("message", securityLeak ? "unguarded resource" : "direct response")
			));

			edges.add(new VisualizationEdge("client", "resource", "direct"));
			if (eagerLoadTriggered) {
				edges.add(new VisualizationEdge("resource", "loader", "load"));
				edges.add(new VisualizationEdge("loader", "result", securityLeak ? "expose" : "return"));
			} else {
				edges.add(new VisualizationEdge("resource", "result", securityLeak ? "expose" : "return"));
			}
		}

		return new VisualizationGraph(nodes, edges);
	}

	private Map<String, Object> toStepMap(ProxyStep step) {
		return Map.of(
			"index", step.index(),
			"stageCode", step.stageCode(),
			"title", step.title(),
			"actorLabel", step.actorLabel(),
			"status", step.status(),
			"detail", step.detail(),
			"latencyMs", step.latencyMs()
		);
	}

	private ProxyConfig toConfig(Map<String, Object> parameters) {
		if (parameters == null) {
			throw new InvalidPatternConfigurationException("Les paramètres Proxy sont obligatoires.");
		}

		String mode = requireText(parameters, "mode").toUpperCase(Locale.ROOT);
		if (!WITH_PROXY.equals(mode) && !WITHOUT_PROXY.equals(mode)) {
			throw new InvalidPatternConfigurationException("mode doit valoir WITH_PROXY ou WITHOUT_PROXY.");
		}

		return new ProxyConfig(
			mode,
			requireText(parameters, "requestLabel"),
			requireText(parameters, "requesterRole").toUpperCase(Locale.ROOT),
			requireText(parameters, "resourceCode").toUpperCase(Locale.ROOT),
			requireText(parameters, "cacheState").toUpperCase(Locale.ROOT)
		);
	}

	private String requireText(Map<String, Object> parameters, String fieldName) {
		Object rawValue = parameters.get(fieldName);
		if (rawValue == null) {
			throw new InvalidPatternConfigurationException(fieldName + " est obligatoire.");
		}

		String value = rawValue.toString().trim();
		if (value.isEmpty()) {
			throw new InvalidPatternConfigurationException(fieldName + " ne peut pas etre vide.");
		}

		return value;
	}
}
