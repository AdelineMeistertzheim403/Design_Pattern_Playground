package com.designpatternplayground.backend.auth.application;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class AuthSchemaMigrationService {

	private final JdbcTemplate jdbcTemplate;

	public AuthSchemaMigrationService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Bean
	ApplicationRunner migrateAuthSchema() {
		return (arguments) -> {
			jdbcTemplate.execute("""
				alter table user_accounts
				add column if not exists role varchar(20) not null default 'USER'
				""");

			jdbcTemplate.execute("""
				alter table user_accounts
				add column if not exists force_password_change boolean not null default false
				""");

			jdbcTemplate.update("""
				update user_accounts
				set role = 'USER'
				where role is null or trim(role) = ''
				""");

			jdbcTemplate.update("""
				update user_accounts
				set force_password_change = false
				where force_password_change is null
				""");
		};
	}
}
