package com.designpatternplayground.backend.progress.domain;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class ProgressBadgeCatalog {

	private ProgressBadgeCatalog() {
	}

	public static final List<BadgeDefinition> BADGES = List.of(
		new BadgeDefinition("first_steps", "Premier pas", "Terminer la premiere demo.", ProgressBadgeCategory.DISCOVERY, false),
		new BadgeDefinition("collector", "Collectionneur", "Lancer au moins une demo pour chaque pattern.", ProgressBadgeCategory.DISCOVERY, false),
		new BadgeDefinition("quiz_passed", "Quiz valide", "Reussir un quiz avec au moins 75%.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("perfect_quiz", "Sans faute", "Reussir un quiz avec 100%.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("streak_3", "Serie gagnante", "Reussir 3 validations d affilee.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("mission_solver", "Esprit logique", "Reussir 5 missions.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("architect_confirmed", "Architecte confirme", "Reussir 10 missions.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("fusion_success", "Fusion reussie", "Reussir une mission multi-pattern.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("fusion_master", "Combo expert", "Reussir 5 missions multi-pattern.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("untouchable", "Intouchable", "Reussir 3 missions difficiles sans echec.", ProgressBadgeCategory.PERFORMANCE, false),
		new BadgeDefinition("master_strategy", "Stratege", "Maitriser completement Strategy.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_observer", "Observateur attentif", "Maitriser completement Observer.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_singleton", "Gardien unique", "Maitriser completement Singleton.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_state", "Architecte des etats", "Maitriser completement State.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_decorator", "Alchimiste des decorateurs", "Maitriser completement Decorator.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_flyweight", "Maitre des optimisations", "Maitriser completement Flyweight.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_builder", "Batisseur methodique", "Maitriser completement Builder.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_command", "Commandant du controle", "Maitriser completement Command.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_mediator", "Messager central", "Maitriser completement Mediator.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("master_visitor", "Analyste de structures", "Maitriser completement Visitor.", ProgressBadgeCategory.MASTERY, false),
		new BadgeDefinition("playground_archivist", "Archiviste du Playground", "Debloquer 20 badges.", ProgressBadgeCategory.LEGENDARY, true),
		new BadgeDefinition("playground_master", "Maitre du Playground", "Maitriser tous les patterns.", ProgressBadgeCategory.LEGENDARY, true)
	);

	public static final Map<String, BadgeDefinition> BY_CODE = BADGES.stream()
		.collect(Collectors.toMap(BadgeDefinition::code, Function.identity()));
}
