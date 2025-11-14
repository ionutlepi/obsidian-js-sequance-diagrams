/**
 * Integration Tests for Title/Alias/Ordering Syntax Features
 * Feature: 002-title-alias-support
 * Tests: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SyntaxValidator } from '../../src/validators/SyntaxValidator';
import * as fixtures from '../fixtures/syntax-examples';

describe('Title Rendering Integration Tests', () => {
  let validator: SyntaxValidator;

  beforeEach(() => {
    validator = new SyntaxValidator();
  });

  describe('FR-001, FR-002: Title parsing and display', () => {
    it('should validate simple title diagram', () => {
      const result = validator.validateDiagram(fixtures.SIMPLE_TITLE);
      expect(result.isValid).toBe(true);
      expect(result.title.isValid).toBe(true);
      expect(result.title.title).toBe('User Login Flow');
    });

    it('should validate title with special characters', () => {
      const result = validator.validateDiagram(fixtures.TITLE_WITH_SPECIAL_CHARS);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('API Flow (v2.0) - Production');
    });

    it('should validate title with Unicode/emoji', () => {
      const result = validator.validateDiagram(fixtures.TITLE_WITH_UNICODE);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('🔐 Authentication Flow');
    });

    it('should validate very long title', () => {
      const result = validator.validateDiagram(fixtures.TITLE_WITH_LONG_TEXT);
      expect(result.isValid).toBe(true);
      expect(result.title.title?.length).toBe(150);
    });
  });

  describe('FR-001: Case-insensitive title keyword', () => {
    it('should accept lowercase "title:"', () => {
      const result = validator.validateDiagram(fixtures.TITLE_CASE_INSENSITIVE_LOWERCASE);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('lowercase test');
    });

    it('should accept uppercase "TITLE:"', () => {
      const result = validator.validateDiagram(fixtures.TITLE_CASE_INSENSITIVE_UPPERCASE);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('uppercase test');
    });

    it('should accept mixed case "TiTlE:"', () => {
      const result = validator.validateDiagram(fixtures.TITLE_CASE_INSENSITIVE_MIXED);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('mixed case test');
    });
  });

  describe('FR-001: Title on first non-empty line', () => {
    it('should accept title after blank lines', () => {
      const result = validator.validateDiagram(fixtures.TITLE_AFTER_BLANK_LINES);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Title After Blank Lines');
    });
  });

  describe('FR-014: Empty title handling', () => {
    it('should treat empty title as invalid', () => {
      const result = validator.validateDiagram(fixtures.EMPTY_TITLE);
      // Diagram should still be valid (backward compat), but title invalid
      expect(result.isValid).toBe(true);
      expect(result.title.isValid).toBe(false);
    });
  });

  describe('FR-015: Multiple title handling', () => {
    it('should use first title and ignore subsequent ones', () => {
      const result = validator.validateDiagram(fixtures.MULTIPLE_TITLES);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('First Title');
    });
  });

  describe('FR-008: Backward compatibility', () => {
    it('should handle diagrams without title', () => {
      const result = validator.validateDiagram(fixtures.NO_TITLE_NO_PARTICIPANTS);
      expect(result.isValid).toBe(true);
      expect(result.title.isValid).toBe(false);
      expect(result.title.title).toBeNull();
    });

    it('should handle diagrams with only messages', () => {
      const result = validator.validateDiagram(fixtures.ONLY_MESSAGES);
      expect(result.isValid).toBe(true);
      expect(result.title.isValid).toBe(false);
    });
  });
});

// ===== PARTICIPANT ALIAS INTEGRATION TESTS (User Story 2) =====

describe('Participant Alias Integration Tests - T029, T030', () => {
  let validator: SyntaxValidator;

  beforeEach(() => {
    validator = new SyntaxValidator();
  });

  describe('FR-003, FR-004, FR-005: Participant alias resolution', () => {
    it('should resolve simple alias in diagram', () => {
      const result = validator.validateDiagram(fixtures.SIMPLE_ALIAS);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].shortName).toBe('A');
      expect(result.participants[0].displayName).toBe('Alice');
      expect(result.participantMap.get('A')).toBe('Alice');
    });

    it('should resolve multiple aliases', () => {
      const result = validator.validateDiagram(fixtures.MULTIPLE_ALIASES);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(3);
      expect(result.participantMap.get('UI')).toBe('User Interface');
      expect(result.participantMap.get('API')).toBe('REST API');
      expect(result.participantMap.get('DB')).toBe('PostgreSQL Database');
    });

    it('should handle alias with special characters', () => {
      const result = validator.validateDiagram(fixtures.ALIAS_WITH_SPECIAL_CHARS);
      expect(result.isValid).toBe(true);
      expect(result.participantMap.get('SVC')).toBe('Payment Service (v2)');
      expect(result.participantMap.get('DB')).toBe('User Database [prod]');
    });

    it('should handle alias with Unicode/emoji', () => {
      const result = validator.validateDiagram(fixtures.ALIAS_WITH_UNICODE);
      expect(result.isValid).toBe(true);
      expect(result.participantMap.get('Client')).toBe('Web Client 🌐');
      expect(result.participantMap.get('Auth')).toBe('Auth Service 🔐');
    });
  });

  describe('FR-010: Mixed aliased and non-aliased participants', () => {
    it('should handle mix of aliased and simple participants', () => {
      const result = validator.validateDiagram(fixtures.MIXED_ALIAS_AND_SIMPLE);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(3);

      // Check aliased participants
      expect(result.participantMap.get('A')).toBe('Alice');
      expect(result.participantMap.get('C')).toBe('Charlie');

      // Check non-aliased participant
      expect(result.participantMap.get('Bob')).toBe('Bob');
    });
  });

  describe('FR-009, FR-012: Special characters and Unicode support', () => {
    it('should preserve special characters in alias names', () => {
      const diagram = `participant REST API (v2.0) [Production] as API
API->DB: Query`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participantMap.get('API')).toBe('REST API (v2.0) [Production]');
    });

    it('should support emoji in participant names', () => {
      const diagram = `participant User 👤 as U
participant Server 🖥️ as S
U->S: Request`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.participantMap.get('U')).toBe('User 👤');
      expect(result.participantMap.get('S')).toBe('Server 🖥️');
    });
  });
});

// ===== ERROR HANDLING TESTS (User Story 2) =====

describe('Participant Alias Error Handling - T031', () => {
  let validator: SyntaxValidator;

  beforeEach(() => {
    validator = new SyntaxValidator();
  });

  describe('FR-011: Helpful error messages', () => {
    it('should accept quotes as part of display name', () => {
      // Quotes are not special syntax, just part of the name
      const result = validator.validateDiagram(fixtures.UNCLOSED_QUOTE_ALIAS);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(1);
      expect(result.participants[0].displayName).toBe('"Alice');
    });

    it('should provide helpful error for empty display name', () => {
      const result = validator.validateDiagram(fixtures.EMPTY_ALIAS);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid participant');
    });

    it('should accept valid syntax without quotes', () => {
      const result = validator.validateDiagram(fixtures.MISSING_QUOTES_IN_ALIAS);
      expect(result.isValid).toBe(true);
      expect(result.participants).toHaveLength(1);
      expect(result.participantMap.get('A')).toBe('Alice');
    });

    it('should provide helpful error for invalid identifier', () => {
      const result = validator.validateDiagram(fixtures.INVALID_IDENTIFIER);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

// ===== PARTICIPANT ORDERING INTEGRATION TESTS (User Story 3) =====

describe('Participant Ordering Integration Tests - T039, T040', () => {
  let validator: SyntaxValidator;

  beforeEach(() => {
    validator = new SyntaxValidator();
  });

  describe('FR-006, FR-007: Participant ordering', () => {
    it('should render participants in declaration order', () => {
      const diagram = `Title: Ordering Test
participant C
participant B
participant A
A->B: Message 1
B->C: Message 2`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Ordering Test');
      expect(result.participants).toHaveLength(3);

      // Verify order: C, B, A (not alphabetical A, B, C)
      expect(result.participants[0].shortName).toBe('C');
      expect(result.participants[1].shortName).toBe('B');
      expect(result.participants[2].shortName).toBe('A');
    });

    it('should maintain order with aliased participants', () => {
      const diagram = `participant Zulu Service as Z
participant Alpha Service as A
participant Mike Service as M
Z->A: Request
A->M: Process
M->Z: Response`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);

      // Verify order: Z, A, M (not alphabetical)
      expect(result.participants[0].shortName).toBe('Z');
      expect(result.participants[0].displayName).toBe('Zulu Service');
      expect(result.participants[1].shortName).toBe('A');
      expect(result.participants[1].displayName).toBe('Alpha Service');
      expect(result.participants[2].shortName).toBe('M');
      expect(result.participants[2].displayName).toBe('Mike Service');
    });

    it('should preserve order regardless of message flow', () => {
      const diagram = `participant Last
participant Middle
participant First
First->Middle: A
Middle->Last: B
Last->First: C`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);

      // Order should be Last, Middle, First (declaration order)
      expect(result.participants[0].shortName).toBe('Last');
      expect(result.participants[1].shortName).toBe('Middle');
      expect(result.participants[2].shortName).toBe('First');
    });
  });

  describe('Combined features: Title + Aliases + Ordering - T040', () => {
    it('should handle all three features together', () => {
      const diagram = `Title: Complete Feature Test
participant User Interface as UI
participant REST API Gateway as API
participant PostgreSQL Database as DB
UI->API: HTTP Request
API->DB: SQL Query
DB->API: Result Set
API->UI: JSON Response`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);

      // Verify title
      expect(result.title.title).toBe('Complete Feature Test');

      // Verify participants in declaration order
      expect(result.participants).toHaveLength(3);
      expect(result.participants[0].shortName).toBe('UI');
      expect(result.participants[1].shortName).toBe('API');
      expect(result.participants[2].shortName).toBe('DB');

      // Verify aliases resolved correctly
      expect(result.participantMap.get('UI')).toBe('User Interface');
      expect(result.participantMap.get('API')).toBe('REST API Gateway');
      expect(result.participantMap.get('DB')).toBe('PostgreSQL Database');
    });

    it('should handle title with mixed aliased/simple participants', () => {
      const diagram = `Title: Mixed Participant Types
participant Service Z as Z
participant Y
participant Service X as X
participant W`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Mixed Participant Types');
      expect(result.participants).toHaveLength(4);

      // Verify order and aliases
      expect(result.participants[0].shortName).toBe('Z');
      expect(result.participants[0].hasAlias).toBe(true);
      expect(result.participants[1].shortName).toBe('Y');
      expect(result.participants[1].hasAlias).toBe(false);
      expect(result.participants[2].shortName).toBe('X');
      expect(result.participants[2].hasAlias).toBe(true);
      expect(result.participants[3].shortName).toBe('W');
      expect(result.participants[3].hasAlias).toBe(false);
    });

    it('should handle complex real-world diagram', () => {
      const diagram = `Title: 🔐 Authentication Flow (v2.0)
participant Web Browser as Client
participant Load Balancer as LB
participant Auth Service 🔒 as Auth
participant User Database as DB
participant Redis Cache as Cache
Client->LB: POST /login
LB->Auth: Forward request
Auth->Cache: Check session
Cache->Auth: Miss
Auth->DB: Validate credentials
DB->Auth: User found
Auth->Cache: Store session
Cache->Auth: OK
Auth->LB: JWT token
LB->Client: 200 OK + token`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);

      // Verify title with emoji and special chars
      expect(result.title.title).toBe('🔐 Authentication Flow (v2.0)');

      // Verify 5 participants in declaration order
      expect(result.participants).toHaveLength(5);
      expect(result.participants[0].shortName).toBe('Client');
      expect(result.participants[1].shortName).toBe('LB');
      expect(result.participants[2].shortName).toBe('Auth');
      expect(result.participants[3].shortName).toBe('DB');
      expect(result.participants[4].shortName).toBe('Cache');

      // Verify aliases with special chars and emoji
      expect(result.participantMap.get('Auth')).toBe('Auth Service 🔒');
      expect(result.participantMap.get('Cache')).toBe('Redis Cache');
    });

    it('should handle title after blank lines with ordered participants', () => {
      const diagram = `

Title: Title After Blanks
participant Third
participant Second
participant First`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Title After Blanks');
      expect(result.participants[0].shortName).toBe('Third');
      expect(result.participants[1].shortName).toBe('Second');
      expect(result.participants[2].shortName).toBe('First');
    });
  });

  describe('Backward compatibility with ordering', () => {
    it('should work with old diagrams (no title, no participants)', () => {
      const diagram = `Alice->Bob: Hello
Bob->Charlie: Forward
Charlie->Alice: Reply`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.isValid).toBe(false);
      expect(result.participants).toHaveLength(0);
    });

    it('should work with only title (no participant declarations)', () => {
      const diagram = `Title: Simple Flow
A->B: Message`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.title).toBe('Simple Flow');
      expect(result.participants).toHaveLength(0);
    });

    it('should work with only participants (no title)', () => {
      const diagram = `participant A
participant B
participant C`;

      const result = validator.validateDiagram(diagram);
      expect(result.isValid).toBe(true);
      expect(result.title.isValid).toBe(false);
      expect(result.participants).toHaveLength(3);
    });
  });
});
