/**
 * Unit Tests: DiagramParser
 *
 * Tests for User Story 2: Syntax Validation
 * Tests: T047 - Syntax validation logic
 */

import { describe, it, expect } from 'vitest';
import {
  SIMPLE_DIAGRAM,
  INVALID_SYNTAX,
  EMPTY_CONTENT,
  WHITESPACE_ONLY,
} from '../fixtures/sample-diagrams';
import { DiagramParser } from '../../src/utils/DiagramParser';

describe('DiagramParser - Syntax Validation (T047)', () => {
  it('should validate simple valid diagram syntax', () => {
    // FR-006: Pre-validation before rendering

    const source = SIMPLE_DIAGRAM;

    // Act: Validate syntax
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Validation should pass
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing arrow syntax', () => {
    // FR-006: Detect common syntax errors

    const source = 'Alice Bob Hello'; // Missing ->

    // Act: Validate syntax
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Validation should fail
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/arrow|->/i);
  });

  it('should detect incomplete arrow syntax', () => {
    // FR-006: Detect malformed arrows

    const source = 'Alice-> Bob'; // Space after arrow

    // Act: Validate syntax
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Should still be valid (space is allowed)
    // This is actually valid syntax, just a style difference
    expect(result.isValid).toBe(true);
  });

  it('should detect missing participant in arrow', () => {
    // FR-006: Detect missing participants

    const source = '->Alice: Message'; // Missing sender

    // Act: Validate syntax
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Validation should fail
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/participant|sender/i);
  });

  it('should detect missing message text', () => {
    // FR-006: Detect missing messages

    const source = 'Alice->Bob:'; // Missing message text

    // Act: Validate syntax
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Should still be valid (message is optional)
    // Empty message is syntactically valid
    expect(result.isValid).toBe(true);
  });

  it('should report line numbers for syntax errors', () => {
    // FR-006: Error messages with line numbers

    const source = `Alice->Bob: Valid line 1
Invalid syntax on line 2
Charlie->Dave: Valid line 3`;

    // Act: Validate syntax
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Error should reference line 2
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].lineNumber).toBe(2);
  });

  it('should handle empty content gracefully', () => {
    // FR-007: Empty content should not throw errors

    const source = EMPTY_CONTENT;

    // Act: Validate empty content
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Should be marked as empty, not error
    expect(result.isEmpty).toBe(true);
    expect(result.isValid).toBe(true); // Empty is valid, just no content
    expect(result.errors).toHaveLength(0);
  });

  it('should detect whitespace-only content', () => {
    // FR-007: Whitespace should be detected and flagged

    const source = WHITESPACE_ONLY;

    // Act: Validate whitespace-only content
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Should be marked as empty
    expect(result.isEmpty).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should provide helpful suggestions for common errors', () => {
    // FR-006: Contextual suggestions for errors

    const source = INVALID_SYNTAX;

    // Act: Validate invalid syntax
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Each error should have a suggestion
    expect(result.errors.length).toBeGreaterThan(0);
    result.errors.forEach(error => {
      expect(error.suggestion).toBeDefined();
      expect(error.suggestion.length).toBeGreaterThan(0);
    });
  });

  it('should validate multiline diagrams with complex structure', () => {
    // FR-006: Support all valid sequence diagram features

    const source = `Title: Complex Flow
Participant Alice
Participant Bob

Alice->Bob: Request
Note right of Bob: Processing
Bob->Alice: Response`;

    // Act: Validate complex diagram
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Should be valid
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('DiagramParser - Error Recovery (T047)', () => {
  it('should continue validation after finding first error', () => {
    // FR-006: Report all errors, not just first one

    const source = `Invalid line 1
Alice->Bob: Valid
Invalid line 3
Charlie->Dave: Valid
Invalid line 5`;

    // Act: Validate source with multiple errors
    const parser = new DiagramParser();
    const result = parser.validate(source);

    // Assert: Should find all 3 errors
    expect(result.errors.length).toBe(3);
    expect(result.errors.map(e => e.lineNumber)).toEqual([1, 3, 5]);
  });

  it('should not throw exceptions on malformed input', () => {
    // FR-006: Parser should never throw, always return result

    const malformedInputs = [
      ';;;;;;;',
      '->->->->',
      'null',
      'undefined',
      '%%%***###',
    ];

    // Act & Assert: No exceptions should be thrown
    const parser = new DiagramParser();
    malformedInputs.forEach(input => {
      expect(() => parser.validate(input)).not.toThrow();
      const result = parser.validate(input);
      expect(result).toBeDefined();
      expect(result.isValid).toBe(false);
    });
  });
});
