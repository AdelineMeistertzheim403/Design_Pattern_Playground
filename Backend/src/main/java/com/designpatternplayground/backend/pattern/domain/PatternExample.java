package com.designpatternplayground.backend.pattern.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "pattern_examples")
public class PatternExample {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 80)
	private String slug;

	@Column(nullable = false, length = 120)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private PatternCategory category;

	@Column(nullable = false, length = 500)
	private String intent;

	@Column(nullable = false, length = 500)
	private String backendFocus;

	@Column(nullable = false, length = 500)
	private String frontendFocus;

	@Column(nullable = false, length = 1200)
	private String notes;

	protected PatternExample() {
	}

	public PatternExample(
		String slug,
		String name,
		PatternCategory category,
		String intent,
		String backendFocus,
		String frontendFocus,
		String notes
	) {
		this.slug = slug;
		this.name = name;
		this.category = category;
		this.intent = intent;
		this.backendFocus = backendFocus;
		this.frontendFocus = frontendFocus;
		this.notes = notes;
	}

	public Long getId() {
		return id;
	}

	public String getSlug() {
		return slug;
	}

	public String getName() {
		return name;
	}

	public PatternCategory getCategory() {
		return category;
	}

	public String getIntent() {
		return intent;
	}

	public String getBackendFocus() {
		return backendFocus;
	}

	public String getFrontendFocus() {
		return frontendFocus;
	}

	public String getNotes() {
		return notes;
	}
}
