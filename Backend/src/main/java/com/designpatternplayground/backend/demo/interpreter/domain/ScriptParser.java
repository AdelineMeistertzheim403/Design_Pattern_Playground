package com.designpatternplayground.backend.demo.interpreter.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.designpatternplayground.backend.common.exception.InvalidPatternConfigurationException;

public final class ScriptParser {

	private static final Pattern MOVE_PATTERN = Pattern.compile("^MOVE\\s+(\\d+)$");
	private static final Pattern TURN_PATTERN = Pattern.compile("^TURN\\s+(LEFT|RIGHT)$");
	private static final Pattern REPEAT_PATTERN = Pattern.compile("^REPEAT\\s+(\\d+)\\s*\\{$");

	public List<ScriptExpression> parse(List<String> lines) {
		ParseResult result = parseBlock(lines, 0, false);
		if (result.nextIndex() < lines.size()) {
			throw new InvalidPatternConfigurationException("Fin de script invalide à la ligne " + (result.nextIndex() + 1));
		}
		return result.expressions();
	}

	private ParseResult parseBlock(List<String> lines, int startIndex, boolean insideRepeat) {
		List<ScriptExpression> expressions = new ArrayList<>();
		int index = startIndex;

		while (index < lines.size()) {
			String sourceLine = lines.get(index) == null ? "" : lines.get(index).trim();
			int lineNumber = index + 1;

			if (sourceLine.isBlank()) {
				index++;
				continue;
			}

			if ("}".equals(sourceLine)) {
				if (!insideRepeat) {
					throw new InvalidPatternConfigurationException("Accolade fermante inattendue à la ligne " + lineNumber);
				}
				return new ParseResult(expressions, index + 1);
			}

			Matcher repeatMatcher = REPEAT_PATTERN.matcher(sourceLine.toUpperCase(Locale.ROOT));
			if (repeatMatcher.matches()) {
				int repeatCount = Integer.parseInt(repeatMatcher.group(1));
				ParseResult childResult = parseBlock(lines, index + 1, true);
				expressions.add(new RepeatExpression(lineNumber, sourceLine, repeatCount, childResult.expressions()));
				index = childResult.nextIndex();
				continue;
			}

			expressions.add(parsePrimitive(sourceLine, lineNumber));
			index++;
		}

		if (insideRepeat) {
			throw new InvalidPatternConfigurationException("Bloc REPEAT non ferme avant la fin du script.");
		}

		return new ParseResult(expressions, lines.size());
	}

	private ScriptExpression parsePrimitive(String sourceLine, int lineNumber) {
		String normalized = sourceLine.toUpperCase(Locale.ROOT);

		Matcher moveMatcher = MOVE_PATTERN.matcher(normalized);
		if (moveMatcher.matches()) {
			return new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.MOVE, Integer.parseInt(moveMatcher.group(1)));
		}

		Matcher turnMatcher = TURN_PATTERN.matcher(normalized);
		if (turnMatcher.matches()) {
			return new PrimitiveExpression(
				lineNumber,
				sourceLine,
				"LEFT".equals(turnMatcher.group(1)) ? PrimitiveInstructionType.TURN_LEFT : PrimitiveInstructionType.TURN_RIGHT,
				1
			);
		}

		if ("ATTACK".equals(normalized)) {
			return new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.ATTACK, 1);
		}

		if ("WAIT".equals(normalized)) {
			return new PrimitiveExpression(lineNumber, sourceLine, PrimitiveInstructionType.WAIT, 1);
		}

		throw new InvalidPatternConfigurationException("Instruction Interpreter inconnue à la ligne " + lineNumber + " : " + sourceLine);
	}

	private record ParseResult(
		List<ScriptExpression> expressions,
		int nextIndex
	) {
	}
}
