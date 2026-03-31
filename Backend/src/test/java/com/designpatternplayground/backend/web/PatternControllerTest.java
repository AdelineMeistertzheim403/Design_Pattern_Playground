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
			.andExpect(jsonPath("$", hasSize(3)))
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
}
