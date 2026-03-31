package com.designpatternplayground.backend.pattern.api;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PatternCatalogControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void shouldExposeSeededPatterns() throws Exception {
		mockMvc.perform(get("/api/patterns"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].slug", notNullValue()))
			.andExpect(jsonPath("$[0].name", notNullValue()))
			.andExpect(jsonPath("$[0].intent", notNullValue()));
	}

	@Test
	void shouldExposePreviewStrategies() throws Exception {
		mockMvc.perform(get("/api/patterns/strategy/preview").param("format", "checklist"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.format").value("checklist"))
			.andExpect(jsonPath("$.lines[0]", notNullValue()));
	}
}
