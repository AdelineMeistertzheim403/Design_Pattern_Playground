package com.designpatternplayground.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.designpatternplayground.backend.auth.security.ApiAuthenticationEntryPoint;
import com.designpatternplayground.backend.auth.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(
		HttpSecurity http,
		JwtAuthenticationFilter jwtAuthenticationFilter,
		ApiAuthenticationEntryPoint authenticationEntryPoint
	) throws Exception {
		http
			// The SPA authenticates via HttpOnly cookies, so the API itself stays stateless
			// and relies on the JWT filter instead of server-side HTTP sessions.
			.csrf(AbstractHttpConfigurer::disable)
			.cors(Customizer.withDefaults())
			.httpBasic(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.logout(AbstractHttpConfigurer::disable)
			.sessionManagement(session ->
				session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			.exceptionHandling(exception ->
				exception.authenticationEntryPoint(authenticationEntryPoint)
			)
				.authorizeHttpRequests(authorize -> authorize
					// Public entry points required before authentication and for local H2 debugging.
					.requestMatchers(
						"/api/auth/register",
						"/api/auth/login",
						"/api/auth/refresh",
						"/api/auth/logout",
						"/h2-console/**"
					).permitAll()
					// Quiz progress, user studio persistence and account bootstrap endpoints are private.
					.requestMatchers("/api/quiz/**").authenticated()
					.requestMatchers(HttpMethod.GET, "/api/patterns/*/quiz").authenticated()
					.requestMatchers("/api/patterns/*/quiz/**").authenticated()
					.requestMatchers("/api/auth/me").authenticated()
					.requestMatchers("/api/uml-studio/**").authenticated()
					.requestMatchers("/api/svg-scene-studio/**").authenticated()
					// Admin editors for UML and SVG scenes stay behind the ADMIN role.
					.requestMatchers("/api/admin/**").hasRole("ADMIN")
					// Pattern catalogue, schemas and public UML overrides remain readable anonymously.
					.requestMatchers("/api/patterns/**").permitAll()
				.anyRequest().permitAll()
			)
			.headers(headers ->
				headers.frameOptions(frame -> frame.sameOrigin())
			)
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
