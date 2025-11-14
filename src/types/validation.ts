/**
 * Validation Types for Title/Alias/Ordering Syntax Enhancement
 * Feature: 002-title-alias-support
 *
 * These types support FR-001 through FR-017 from spec.md
 */

import { RenderError } from '../types';

/**
 * Result of validating Title declaration syntax
 * Implements: FR-001, FR-002, FR-012, FR-013, FR-014
 */
export interface TitleValidation {
  /** Whether Title syntax is valid */
  isValid: boolean;

  /** Extracted title text (trimmed, null if invalid or whitespace-only) */
  title: string | null;

  /** Error details if validation failed (null if valid) */
  error: RenderError | null;
}

/**
 * Result of validating participant declaration syntax (with or without alias)
 * Implements: FR-003, FR-004, FR-005, FR-006, FR-009, FR-010, FR-012, FR-013
 */
export interface ParticipantValidation {
  /** Whether participant syntax is valid */
  isValid: boolean;

  /** Participant identifier used in messages (null if invalid) */
  shortName: string | null;

  /** Name shown in rendered diagram (defaults to shortName if no alias) */
  displayName: string | null;

  /** Whether this participant has an explicit alias */
  hasAlias: boolean;

  /** Sequence order of participant declaration (0-indexed) */
  declarationOrder: number;

  /** Error details if validation failed (null if valid) */
  error: RenderError | null;
}

/**
 * Aggregated result of validating Title, participants, and ordering
 * Implements: FR-008, FR-011, FR-015, FR-016
 */
export interface ValidationResult {
  /** Whether entire diagram syntax is valid */
  isValid: boolean;

  /** Title validation result */
  title: TitleValidation;

  /** Array of participant validations (in declaration order) */
  participants: ParticipantValidation[];

  /** Mapping from shortName to displayName for message resolution */
  participantMap: Map<string, string>;

  /** Array of all validation errors (empty if isValid === true) */
  errors: RenderError[];
}

/**
 * Cache entry for validation results
 * Implements: FR-016 (validation result caching)
 */
export interface ValidationCacheEntry {
  /** Hash of diagram source content */
  sourceHash: string;

  /** Cached validation result */
  result: ValidationResult;

  /** Timestamp when this entry was created */
  timestamp: number;
}
