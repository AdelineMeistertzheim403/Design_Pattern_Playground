package com.designpatternplayground.backend.uml.domain;

import java.time.LocalDateTime;

import com.designpatternplayground.backend.auth.domain.UserAccount;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "user_uml_diagrams",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_user_uml_diagrams_owner_code", columnNames = { "owner_id", "code" })
	}
)
public class UserUmlDiagramDocument {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "owner_id", nullable = false)
	private UserAccount owner;

	@Column(nullable = false, length = 80)
	private String code;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(nullable = false, columnDefinition = "text")
	private String diagramJson;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	protected UserUmlDiagramDocument() {
	}

	public UserUmlDiagramDocument(
		UserAccount owner,
		String code,
		String name,
		String diagramJson,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
	) {
		this.owner = owner;
		this.code = code;
		this.name = name;
		this.diagramJson = diagramJson;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public Long getId() {
		return id;
	}

	public UserAccount getOwner() {
		return owner;
	}

	public void setOwner(UserAccount owner) {
		this.owner = owner;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDiagramJson() {
		return diagramJson;
	}

	public void setDiagramJson(String diagramJson) {
		this.diagramJson = diagramJson;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
