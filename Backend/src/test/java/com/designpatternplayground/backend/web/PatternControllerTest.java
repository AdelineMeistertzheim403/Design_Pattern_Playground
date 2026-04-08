package com.designpatternplayground.backend.web;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class PatternControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void shouldExposeAvailablePatterns() throws Exception {
		mockMvc.perform(get("/api/patterns"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(13)))
			.andExpect(jsonPath("$[0].code", notNullValue()))
			.andExpect(jsonPath("$[0].description", notNullValue()));
	}

	@Test
	void shouldExposeSchemaForStrategy() throws Exception {
		mockMvc.perform(get("/api/patterns/strategy/schema"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.fields", hasSize(3)))
			.andExpect(jsonPath("$.fields[0].name").value("mode"))
			.andExpect(jsonPath("$.fields[1].name").value("amount"))
			.andExpect(jsonPath("$.fields[2].allowedValues", hasSize(3)));
	}

	@Test
	void shouldRejectQuizWhenUserIsNotAuthenticated() throws Exception {
		mockMvc.perform(get("/api/patterns/strategy/quiz"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void shouldExposeQuizForAuthenticatedUser() throws Exception {
		Cookie accessCookie = registerAndExtractAccessCookie("quiz_reader", "secret123");

		mockMvc.perform(get("/api/patterns/strategy/quiz")
			.cookie(accessCookie))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("strategy"))
			.andExpect(jsonPath("$.passingPercent").value(75))
			.andExpect(jsonPath("$.badgeLabel").value("Badge valide"))
			.andExpect(jsonPath("$.questions", hasSize(10)))
			.andExpect(jsonPath("$.questions[0].points").value(12))
			.andExpect(jsonPath("$.questions[0].type").value("QCM_SINGLE"))
			.andExpect(jsonPath("$.questions[4].type").value("MATCHING"))
			.andExpect(jsonPath("$.questions[9].type").value("QCM_SINGLE"));
	}

	@Test
	void shouldPersistQuizProgressAfterSubmission() throws Exception {
		Cookie accessCookie = registerAndExtractAccessCookie("quiz_runner", "secret123");

		mockMvc.perform(post("/api/patterns/strategy/quiz/submissions")
			.cookie(accessCookie)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "answers": [
				    { "questionId": "strategy-q1", "selectedChoiceIds": ["algorithm"] },
				    { "questionId": "strategy-q2", "selectedChoiceIds": ["true"] },
				    { "questionId": "strategy-q3", "selectedChoiceIds": ["ifelse"] },
				    { "questionId": "strategy-q4", "selectedChoiceIds": ["class"] },
				    {
				      "questionId": "strategy-q5",
				      "matchingAnswers": {
				        "strategy": "behavior",
				        "context": "use",
				        "client": "choose"
				      }
				    },
				    { "questionId": "strategy-q6", "selectedChoiceIds": ["behavioral"] },
				    { "questionId": "strategy-q7", "selectedChoiceIds": ["true"] },
				    { "questionId": "strategy-q8", "selectedChoiceIds": ["payment"] },
				    { "questionId": "strategy-q9", "selectedChoiceIds": ["use"] },
				    { "questionId": "strategy-q10", "selectedChoiceIds": ["flexibility"] }
				  ]
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.correctAnswers").value(10))
			.andExpect(jsonPath("$.correctPercent").value(100))
			.andExpect(jsonPath("$.earnedPoints").value(156))
			.andExpect(jsonPath("$.badgeUnlocked").value(true))
			.andExpect(jsonPath("$.progress.attemptsCount").value(1))
			.andExpect(jsonPath("$.progress.bestPoints").value(156))
			.andExpect(jsonPath("$.progress.badgeUnlocked").value(true));

		mockMvc.perform(get("/api/patterns/strategy/quiz/progress")
			.cookie(accessCookie))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attemptsCount").value(1))
			.andExpect(jsonPath("$.bestCorrectPercent").value(100))
			.andExpect(jsonPath("$.bestPoints").value(156))
			.andExpect(jsonPath("$.badgeUnlocked").value(true));
	}

	@Test
	void shouldExposeQuizDashboardForAuthenticatedUser() throws Exception {
		Cookie accessCookie = registerAndExtractAccessCookie("quiz_dashboard", "secret123");

		mockMvc.perform(post("/api/patterns/factory/quiz/submissions")
			.cookie(accessCookie)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "answers": [
				    { "questionId": "factory-q1", "selectedChoiceIds": ["create"] },
				    { "questionId": "factory-q2", "selectedChoiceIds": ["true"] },
				    { "questionId": "factory-q3", "selectedChoiceIds": ["news"] },
				    { "questionId": "factory-q4", "selectedChoiceIds": ["client"] },
				    {
				      "questionId": "factory-q5",
				      "matchingAnswers": {
				        "factory": "create",
				        "product": "object",
				        "client": "request"
				      }
				    },
				    { "questionId": "factory-q6", "selectedChoiceIds": ["creational"] },
				    { "questionId": "factory-q7", "selectedChoiceIds": ["object"] },
				    { "questionId": "factory-q8", "selectedChoiceIds": ["true"] },
				    { "questionId": "factory-q9", "selectedChoiceIds": ["vehicle"] },
				    { "questionId": "factory-q10", "selectedChoiceIds": ["decouple"] }
				  ]
				}
				"""))
			.andExpect(status().isOk());

		mockMvc.perform(get("/api/quiz/dashboard")
			.cookie(accessCookie))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalPatterns").value(13))
			.andExpect(jsonPath("$.startedPatterns").value(1))
			.andExpect(jsonPath("$.validatedPatterns").value(1))
			.andExpect(jsonPath("$.totalBestPoints").value(130))
			.andExpect(jsonPath("$.patterns", hasSize(13)));
	}

	@Test
	void shouldExecuteAdapterPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "adapter",
				  "parameters": {
				    "mode": "WITH_ADAPTER",
				    "scenario": "VGA_TO_HDMI",
				    "payloadLabel": "Telemetry burst 42"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("adapter"))
			.andExpect(jsonPath("$.output.compatible").value(true))
			.andExpect(jsonPath("$.output.sourceSystem").value("LegacyConsole"))
			.andExpect(jsonPath("$.output.targetSystem").value("SmartScreen"))
			.andExpect(jsonPath("$.output.stepCount").value(3))
			.andExpect(jsonPath("$.output.steps", hasSize(3)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(6)));
	}

	@Test
	void shouldExecuteBuilderPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "builder",
				  "parameters": {
				    "mode": "WITH_BUILDER",
				    "buildName": "Aurora Mk II",
				    "productType": "CAR",
				    "silhouette": "BALANCED",
				    "coreModule": "ELECTRIC",
				    "addonModule": "SUPPORT",
				    "finishStyle": "CLASSIC"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("builder"))
			.andExpect(jsonPath("$.output.productType").value("CAR"))
			.andExpect(jsonPath("$.output.stageCount").value(4))
			.andExpect(jsonPath("$.output.challengeMet").value(true))
			.andExpect(jsonPath("$.output.stages", hasSize(4)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(9)));
	}

	@Test
	void shouldExecuteFacadePattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "facade",
				  "parameters": {
				    "mode": "WITH_FACADE",
				    "routineCode": "CINEMA_MODE",
				    "triggerLabel": "Start"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("facade"))
			.andExpect(jsonPath("$.output.systemsReady").value(true))
			.andExpect(jsonPath("$.output.manualTouchCount").value(1))
			.andExpect(jsonPath("$.output.stepCount").value(6))
			.andExpect(jsonPath("$.output.steps", hasSize(6)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(6)));
	}

	@Test
	void shouldExecuteStrategyPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "strategy",
				  "parameters": {
				    "mode": "WITH_STRATEGY",
				    "amount": 150,
				    "strategy": "PAYPAL"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("strategy"))
			.andExpect(jsonPath("$.logs", hasSize(4)))
			.andExpect(jsonPath("$.output.selectedStrategy").value("PAYPAL"))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(5)));
	}

	@Test
	void shouldExecuteObserverPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "observer",
				  "parameters": {
				    "mode": "WITH_OBSERVER",
				    "subjectName": "ReleasePublisher",
				    "observers": ["Mobile App", "Back Office", "Audit Log"],
				    "message": "Nouvelle version publiee"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("observer"))
			.andExpect(jsonPath("$.output.observerCount").value(3))
			.andExpect(jsonPath("$.output.observers", hasSize(3)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(5)))
			.andExpect(jsonPath("$.visualization.edges", hasSize(4)));
	}

	@Test
	void shouldExecuteFlyweightPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "flyweight",
				  "parameters": {
				    "assetType": "TREE",
				    "objectCount": 3200,
				    "sharedVariantCount": 5,
				    "useFlyweight": true
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("flyweight"))
			.andExpect(jsonPath("$.output.objectCount").value(3200))
			.andExpect(jsonPath("$.output.realInstances").value(5))
			.andExpect(jsonPath("$.output.sharedVariantCount").value(5))
			.andExpect(jsonPath("$.output.variants", hasSize(5)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(8)));
	}

	@Test
	void shouldExecuteSingletonPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "singleton",
				  "parameters": {
				    "mode": "WITH_SINGLETON",
				    "clients": ["UI Panel", "Backend Job", "Analytics Service"],
				    "settingKey": "theme",
				    "settingValue": "emerald"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("singleton"))
			.andExpect(jsonPath("$.output.instanceCount").value(1))
			.andExpect(jsonPath("$.output.clientCount").value(3))
			.andExpect(jsonPath("$.output.coherent").value(true))
			.andExpect(jsonPath("$.output.clientViews", hasSize(3)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(5)));
	}

	@Test
	void shouldExecuteStatePattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "state",
				  "parameters": {
				    "mode": "WITH_STATE",
				    "characterName": "Arena Bot",
				    "initialState": "IDLE",
				    "actions": ["START_RUN", "JUMP", "LAND", "ATTACK", "FINISH_ATTACK"]
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("state"))
			.andExpect(jsonPath("$.output.initialState").value("IDLE"))
			.andExpect(jsonPath("$.output.finalState").value("IDLE"))
			.andExpect(jsonPath("$.output.actionCount").value(5))
			.andExpect(jsonPath("$.output.acceptedTransitions").value(5))
			.andExpect(jsonPath("$.output.timeline", hasSize(5)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(6)));
	}

	@Test
	void shouldExecuteDecoratorPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "decorator",
				  "parameters": {
				    "mode": "WITH_DECORATOR",
				    "characterName": "Ember Knight",
				    "baseType": "WARRIOR",
				    "decorators": ["FIRE", "ICE"]
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("decorator"))
			.andExpect(jsonPath("$.output.attack").value(20))
			.andExpect(jsonPath("$.output.defense").value(12))
			.andExpect(jsonPath("$.output.decoratorCount").value(2))
			.andExpect(jsonPath("$.output.challengeMet").value(true))
			.andExpect(jsonPath("$.output.stack", hasSize(3)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(4)));
	}

	@Test
	void shouldExecuteCommandPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "command",
				  "parameters": {
				    "mode": "WITH_COMMAND",
				    "boardName": "Arena Grid",
				    "actorName": "Pixel Bot",
				    "actions": ["ADD_BEACON", "MOVE_RIGHT", "MOVE_UP", "UNDO", "REDO", "DELETE_BEACON"]
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("command"))
			.andExpect(jsonPath("$.output.positionX").value(1))
			.andExpect(jsonPath("$.output.positionY").value(1))
			.andExpect(jsonPath("$.output.beaconCount").value(0))
			.andExpect(jsonPath("$.output.history", hasSize(6)))
			.andExpect(jsonPath("$.output.undoStack", hasSize(4)))
			.andExpect(jsonPath("$.output.successfulControlCommands").value(2))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(6)));
	}

	@Test
	void shouldExecuteChainPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "chain",
				  "parameters": {
				    "mode": "WITH_CHAIN",
				    "requestName": "Export mensuel",
				    "tokenState": "VALID",
				    "payloadState": "VALID",
				    "processingTarget": "REPORT_EXPORT"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("chain"))
			.andExpect(jsonPath("$.output.accepted").value(true))
			.andExpect(jsonPath("$.output.finalDecision").value("ACCEPTED"))
			.andExpect(jsonPath("$.output.visitedHandlers", hasSize(3)))
			.andExpect(jsonPath("$.output.steps", hasSize(3)))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(6)));
	}

	@Test
	void shouldExecuteMediatorPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "mediator",
				  "parameters": {
				    "mode": "WITH_MEDIATOR",
				    "roomName": "Arena Chat",
				    "participants": ["Luna", "Kiro", "Nova"],
				    "senderName": "Luna",
				    "message": "Focus target center lane"
				  }
				}
				"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.patternCode").value("mediator"))
			.andExpect(jsonPath("$.output.participantCount").value(3))
			.andExpect(jsonPath("$.output.recipientCount").value(2))
			.andExpect(jsonPath("$.output.deliveredCount").value(2))
			.andExpect(jsonPath("$.output.senderCouplingCount").value(1))
			.andExpect(jsonPath("$.visualization.nodes", hasSize(5)));
	}

	private Cookie registerAndExtractAccessCookie(String username, String password) throws Exception {
		MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "username": "%s",
				  "password": "%s"
				}
				""".formatted(username, password)))
			.andExpect(status().isOk())
			.andReturn();

		return cookie("dpp_access_token", extractCookieValue(registerResult, "dpp_access_token"));
	}

	private Cookie cookie(String name, String value) {
		Cookie cookie = new Cookie(name, value);
		cookie.setPath("/");
		return cookie;
	}

	private String extractCookieValue(MvcResult result, String cookieName) {
		List<String> setCookieHeaders = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);

		for (String header : setCookieHeaders) {
			String prefix = cookieName + "=";
			if (header.startsWith(prefix)) {
				int valueEnd = header.indexOf(';');
				return valueEnd >= 0
					? header.substring(prefix.length(), valueEnd)
					: header.substring(prefix.length());
			}
		}

		throw new IllegalStateException("Cookie introuvable: " + cookieName);
	}
}
