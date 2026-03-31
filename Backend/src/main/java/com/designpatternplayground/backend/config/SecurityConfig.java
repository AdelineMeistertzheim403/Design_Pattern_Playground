package com.designpatternplayground.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
				.requestMatchers(
					"/api/auth/register",
					"/api/auth/login",
					"/api/auth/refresh",
					"/api/auth/logout",
					"/api/patterns/**",
					"/h2-console/**"
				).permitAll()
				.requestMatchers("/api/auth/me").authenticated()
				.anyRequest().permitAll()
			)
			.headers(headers ->
				headers.frameOptions(frame -> frame.sameOrigin())
			)
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
