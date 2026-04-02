package com.designpatternplayground.backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final List<String> allowedOriginPatterns;

	public WebConfig(
		@Value("${app.security.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000}") List<String> allowedOriginPatterns
	) {
		this.allowedOriginPatterns = allowedOriginPatterns.stream()
			.map(String::trim)
			.filter(origin -> !origin.isEmpty())
			.toList();
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
			.allowedOriginPatterns(allowedOriginPatterns.toArray(String[]::new))
			.allowedMethods("GET", "POST", "OPTIONS")
			.allowedHeaders("*")
			.allowCredentials(true);
	}
}
