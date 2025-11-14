/**
 * Unit Tests for SyntaxValidator
 * Feature: 002-title-alias-support
 * Tests: Title validation (FR-001, FR-012, FR-013, FR-014, FR-015, FR-017)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SyntaxValidator } from '../../src/validators/SyntaxValidator';

describe('SyntaxValidator.validateTitle', () => {
  let validator: SyntaxValidator;

  beforeEach(() => {
    validator = new SyntaxValidator();
  });

  describe('valid titles', () => {
    it('should parse simple title', () => {
      const result = validator.validateTitle('Title: User Login Flow');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('User Login Flow');
      expect(result.error).toBeNull();
    });

    it('should parse title with special characters', () => {
      const result = validator.validateTitle('Title: API Flow (v2.0)');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('API Flow (v2.0)');
    });

    it('should parse title with Unicode/emoji', () => {
      const result = validator.validateTitle('Title: 🔐 Authentication Flow');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('🔐 Authentication Flow');
    });

    it('should trim whitespace from title text', () => {
      const result = validator.validateTitle('Title:   Padded Title   ');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('Padded Title');
    });

    it('should parse title with quotes', () => {
      const result = validator.validateTitle('Title: "Quoted Title"');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('"Quoted Title"');
    });

    it('should handle very long titles', () => {
      const longTitle = 'Title: ' + 'A'.repeat(150);
      const result = validator.validateTitle(longTitle);
      expect(result.isValid).toBe(true);
      expect(result.title?.length).toBe(150);
    });

    // FR-001: Case-insensitive keyword support
    it('should accept lowercase "title:"', () => {
      const result = validator.validateTitle('title: lowercase test');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('lowercase test');
    });

    it('should accept uppercase "TITLE:"', () => {
      const result = validator.validateTitle('TITLE: uppercase test');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('uppercase test');
    });

    it('should accept mixed case "TiTlE:"', () => {
      const result = validator.validateTitle('TiTlE: mixed case test');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('mixed case test');
    });

    it('should handle title without colon', () => {
      const result = validator.validateTitle('Title Test Without Colon');
      // Per research.md:34, colon is optional in library grammar
      // But our FR-001 requires colon for clarity
      expect(result.isValid).toBe(false);
    });
  });

  describe('invalid titles - FR-014', () => {
    it('should reject whitespace-only title', () => {
      const result = validator.validateTitle('Title:   ');
      expect(result.isValid).toBe(false);
      expect(result.title).toBeNull();
    });

    it('should reject empty title (just colon)', () => {
      const result = validator.validateTitle('Title:');
      expect(result.isValid).toBe(false);
      expect(result.title).toBeNull();
    });

    it('should reject tab-only title', () => {
      const result = validator.validateTitle('Title:\t\t');
      expect(result.isValid).toBe(false);
      expect(result.title).toBeNull();
    });
  });

  describe('malformed syntax', () => {
    it('should reject missing colon', () => {
      const result = validator.validateTitle('Title User Login');
      expect(result.isValid).toBe(false);
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('colon');
    });

    it('should reject non-Title lines', () => {
      const result = validator.validateTitle('Alice->Bob: Message');
      expect(result.isValid).toBe(false);
    });

    it('should reject participant lines', () => {
      const result = validator.validateTitle('participant Alice');
      expect(result.isValid).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle title with multiple colons', () => {
      const result = validator.validateTitle('Title: Time: 10:30 AM');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('Time: 10:30 AM');
    });

    it('should handle title with newline characters in text', () => {
      const result = validator.validateTitle('Title: Test\\nNewline');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('Test\\nNewline');
    });

    it('should handle title with HTML entities', () => {
      const result = validator.validateTitle('Title: &lt;HTML&gt; Entities');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('&lt;HTML&gt; Entities');
    });
  });
});

// ===== PARTICIPANT VALIDATION TESTS (User Story 2) =====

describe('SyntaxValidator.validateParticipant', () => {
  let validator: SyntaxValidator;

  beforeEach(() => {
    validator = new SyntaxValidator();
  });

  describe('simple participant - T021', () => {
    it('should parse simple participant declaration', () => {
      const result = validator.validateParticipant('participant Alice', 0);
      expect(result.isValid).toBe(true);
      expect(result.shortName).toBe('Alice');
      expect(result.displayName).toBe('Alice');
      expect(result.hasAlias).toBe(false);
      expect(result.declarationOrder).toBe(0);
    });

    it('should accept identifier with underscores', () => {
      const result = validator.validateParticipant('participant _srv_1', 0);
      expect(result.isValid).toBe(true);
      expect(result.shortName).toBe('_srv_1');
    });

    it('should preserve declaration order', () => {
      const result1 = validator.validateParticipant('participant Alice', 0);
      const result2 = validator.validateParticipant('participant Bob', 1);
      const result3 = validator.validateParticipant('participant Charlie', 2);

      expect(result1.declarationOrder).toBe(0);
      expect(result2.declarationOrder).toBe(1);
      expect(result3.declarationOrder).toBe(2);
    });
  });

  describe('aliased participant - T022', () => {
    it('should parse participant with alias', () => {
      const result = validator.validateParticipant('participant Alice as A', 0);
      expect(result.isValid).toBe(true);
      expect(result.shortName).toBe('A');
      expect(result.displayName).toBe('Alice');
      expect(result.hasAlias).toBe(true);
    });

    it('should parse alias with special characters', () => {
      const result = validator.validateParticipant(
        'participant User Database (v3) as DB',
        1
      );
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe('User Database (v3)');
      expect(result.declarationOrder).toBe(1);
    });

    it('should parse alias with Unicode/emoji', () => {
      const result = validator.validateParticipant(
        'participant 🔐 Auth Service as SVC',
        2
      );
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe('🔐 Auth Service');
    });

    it('should trim whitespace in alias', () => {
      const result = validator.validateParticipant(
        'participant   Alice   as A',
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe('Alice');
    });

    it('should handle alias with spaces', () => {
      const result = validator.validateParticipant(
        'participant REST API Gateway as API',
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe('REST API Gateway');
    });
  });

  describe('invalid participants - T023', () => {
    it('should accept participant names with special chars as valid', () => {
      // Quotes are just part of the name, not syntax
      const result = validator.validateParticipant('participant "Alice as A', 0);
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe('"Alice');
      expect(result.shortName).toBe('A');
    });

    it('should reject invalid identifier (starts with number)', () => {
      const result = validator.validateParticipant('participant 123Bad', 0);
      expect(result.isValid).toBe(false);
    });

    it('should accept names with quotes as part of the name', () => {
      // Single quotes are just characters in the display name
      const result = validator.validateParticipant(
        "participant 'Alice' as A",
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe("'Alice'");
    });

    it('should accept valid alias syntax (no quotes needed)', () => {
      const result = validator.validateParticipant('participant Alice as A', 0);
      expect(result.isValid).toBe(true);
      expect(result.shortName).toBe('A');
      expect(result.displayName).toBe('Alice');
    });

    it('should reject malformed alias syntax', () => {
      const result = validator.validateParticipant('participant A as', 0);
      expect(result.isValid).toBe(false);
    });
  });

  describe('empty alias validation - FR-017, T024', () => {
    it('should reject empty display name', () => {
      const result = validator.validateParticipant('participant as A', 0);
      expect(result.isValid).toBe(false);
      expect(result.error?.message).toContain('Invalid participant');
    });

    it('should reject whitespace-only display name', () => {
      const result = validator.validateParticipant('participant    as A', 0);
      expect(result.isValid).toBe(false);
      expect(result.error?.message).toContain('empty');
    });
  });
});

// ===== PARTICIPANT ORDERING AND DIAGRAM VALIDATION TESTS (User Story 3) =====

describe('SyntaxValidator.validateDiagram - Participant Ordering', () => {
  let validator: SyntaxValidator;

  beforeEach(() => {
    validator = new SyntaxValidator();
  });

  describe('FR-006, FR-007: Participant ordering - T033', () => {
    it('should preserve participant declaration order', () => {
      const diagram = `participant C
participant B
participant A`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(3);
      expect(result.participants[0].shortName).toBe('C');
      expect(result.participants[0].declarationOrder).toBe(0);
      expect(result.participants[1].shortName).toBe('B');
      expect(result.participants[1].declarationOrder).toBe(1);
      expect(result.participants[2].shortName).toBe('A');
      expect(result.participants[2].declarationOrder).toBe(2);
    });

    it('should preserve declaration order with aliases', () => {
      const diagram = `participant Zulu Service as Z
participant Alpha Service as A
participant Mike Service as M`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants[0].shortName).toBe('Z');
      expect(result.participants[0].declarationOrder).toBe(0);
      expect(result.participants[1].shortName).toBe('A');
      expect(result.participants[1].declarationOrder).toBe(1);
      expect(result.participants[2].shortName).toBe('M');
      expect(result.participants[2].declarationOrder).toBe(2);
    });

    it('should maintain order regardless of message flow', () => {
      const diagram = `participant C
participant B
participant A
A->B: First message
C->A: Second message
B->C: Third message`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants[0].shortName).toBe('C');
      expect(result.participants[1].shortName).toBe('B');
      expect(result.participants[2].shortName).toBe('A');
    });

    it('should handle single participant', () => {
      const diagram = `participant Alice
Alice->Alice: Self message`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].declarationOrder).toBe(0);
    });

    it('should handle many participants in order', () => {
      const diagram = `participant P1
participant P2
participant P3
participant P4
participant P5`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        expect(result.participants[i].shortName).toBe(`P${i + 1}`);
        expect(result.participants[i].declarationOrder).toBe(i);
      }
    });
  });

  describe('mixed declared/undeclared participants - T034', () => {
    it('should handle diagram with only declared participants', () => {
      const diagram = `participant A
participant B
participant C`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(3);
      expect(result.participantMap.size).toBe(3);
    });

    it('should build correct participant map', () => {
      const diagram = `participant User Interface as UI
participant REST API as API
participant Database as DB`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participantMap.get('UI')).toBe('User Interface');
      expect(result.participantMap.get('API')).toBe('REST API');
      expect(result.participantMap.get('DB')).toBe('Database');
    });

    it('should handle mix of simple and aliased participants', () => {
      const diagram = `participant Alice as A
participant Bob
participant Charlie as C`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(3);
      expect(result.participantMap.get('A')).toBe('Alice');
      expect(result.participantMap.get('Bob')).toBe('Bob');
      expect(result.participantMap.get('C')).toBe('Charlie');
    });
  });

  describe('backward compatibility - T035', () => {
    it('should handle diagrams without any declarations', () => {
      const diagram = `Alice->Bob: Hello
Bob->Alice: Hi`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(0);
      expect(result.title.isValid).toBe(false);
    });

    it('should handle diagrams with only messages', () => {
      const diagram = `A->B: Message 1
B->C: Message 2
C->A: Message 3`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(0);
    });

    it('should handle empty diagram', () => {
      const diagram = '';

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(0);
      expect(result.title.isValid).toBe(false);
    });

    it('should handle diagram with only blank lines', () => {
      const diagram = '\n\n\n';

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(0);
    });

    it('should handle title without participants', () => {
      const diagram = `Title: Test Flow
Alice->Bob: Hello`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Test Flow');
      expect(result.participants).toHaveLength(0);
    });

    it('should handle participants without title', () => {
      const diagram = `participant A
participant B
A->B: Message`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.isValid).toBe(false);
      expect(result.participants).toHaveLength(2);
    });
  });

  describe('combined features - FR-015', () => {
    it('should handle multiple titles correctly', () => {
      const diagram = `Title: First Title
Title: Second Title
participant A
A->B: Message`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('First Title');
    });

    it('should handle title + aliases + ordering', () => {
      const diagram = `Title: Complete Diagram
participant Zulu as Z
participant Alpha as A
participant Mike as M`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Complete Diagram');
      expect(result.participants).toHaveLength(3);
      expect(result.participants[0].shortName).toBe('Z');
      expect(result.participants[1].shortName).toBe('A');
      expect(result.participants[2].shortName).toBe('M');
    });

    it('should handle title after blank lines with participants', () => {
      const diagram = `

Title: Test Title
participant A
participant B`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Test Title');
      expect(result.participants).toHaveLength(2);
    });
  });
});
