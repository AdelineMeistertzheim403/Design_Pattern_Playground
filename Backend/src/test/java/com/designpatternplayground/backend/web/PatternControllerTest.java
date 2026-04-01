package com.designpatternplayground.backend.web;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PatternControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void shouldExposeAvailablePatterns() throws Exception {
		mockMvc.perform(get("/api/patterns"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$", hasSize(6)))
			.andExpect(jsonPath("$[0].code", notNullValue()))
			.andExpect(jsonPath("$[0].description", notNullValue()));
	}

	@Test
	void shouldExposeSchemaForStrategy() throws Exception {
		mockMvc.perform(get("/api/patterns/strategy/schema"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.fields", hasSize(2)))
			.andExpect(jsonPath("$.fields[0].name").value("amount"))
			.andExpect(jsonPath("$.fields[1].allowedValues", hasSize(3)));
	}

	@Test
	void shouldExecuteStrategyPattern() throws Exception {
		mockMvc.perform(post("/api/patterns/execute")
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
				{
				  "patternCode": "strategy",
				  "parameters": {
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
}
