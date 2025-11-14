/**
 * ISyntaxValidator Interface
 * Feature: 002-title-alias-support
 *
 * Validation interface for Title, participant alias, and ordering syntax
 *
 * Implements: FR-001 (parse Title), FR-003, FR-004, FR-005, FR-006 (parse aliases/ordering),
 *             FR-011 (validation error messages), FR-012 (Unicode support)
 */

import {
  TitleValidation,
  ParticipantValidation,
  ValidationResult,
} from '../types/validation';
import { RenderError } from '../types';

export interface ISyntaxValidator {
  /**
   * Validate Title declaration syntax
   *
   * @param line - A single line of diagram source code
   * @returns TitleValidation with parse result and any errors
   *
   * Behavior:
   * - Returns { isValid: true, title: "extracted text" } if line is valid Title
   * - Returns { isValid: false, error: RenderError } if syntax is malformed
   * - Trims leading/trailing whitespace from title text
   * - Treats whitespace-only titles as invalid (returns isValid: false)
   * - Handles Unicode characters (emoji, international chars) in title text
   * - Case-insensitive keyword matching (title:, Title:, TITLE: all valid)
   *
   * Example:
   * - "Title: User Login Flow" → { isValid: true, title: "User Login Flow" }
   * - "title: lowercase" → { isValid: true, title: "lowercase" }
   * - "Title:   " → { isValid: false, title: null }
   *
   * FR-001: Recognize and parse Title syntax (case-insensitive, first non-empty line)
   * FR-012: Support Unicode characters including emoji
   * FR-013: Trim leading/trailing whitespace
   * FR-014: Ignore empty Title declarations
   */
  validateTitle(line: string): TitleValidation;

  /**
   * Validate participant declaration syntax (with or without alias)
   *
   * @param line - A single line of diagram source code
   * @param declarationOrder - Sequence number of this participant declaration (0-indexed)
   * @returns ParticipantValidation with parse result and any errors
   *
   * Behavior:
   * - Returns { isValid: true, shortName: "A", displayName: "Alice" } for valid alias
   * - Returns { isValid: true, shortName: "Bob", displayName: "Bob" } for simple declaration
   * - Returns { isValid: false, error: RenderError } if syntax is malformed
   * - Validates identifier format (alphanumeric + underscore only)
   * - Validates quoted string format in alias (matching quotes required)
   * - Handles Unicode characters in displayName
   * - displayName defaults to shortName if no alias provided
   * - Stores declarationOrder for left-to-right participant ordering
   * - Rejects empty aliases (e.g., `participant A as ""`) per FR-017
   *
   * Example:
   * - "participant Alice" → { isValid: true, shortName: "Alice", displayName: "Alice" }
   * - "participant A as \"Alice\"" → { isValid: true, shortName: "A", displayName: "Alice" }
   * - "participant A as \"\"" → { isValid: false, error: "Empty alias not allowed" }
   * - "participant A as \"unclosed" → { isValid: false, error: RenderError }
   *
   * FR-003, FR-004, FR-005: Parse participant syntax and aliases
   * FR-006, FR-007: Establish ordering via declarationOrder
   * FR-009: Support quoted strings with spaces and special characters
   * FR-010: Support mixing aliased and non-aliased participants
   * FR-012: Support Unicode in participant names
   * FR-013: Trim whitespace from names
   * FR-017: Treat empty aliases as syntax errors
   */
  validateParticipant(
    line: string,
    declarationOrder: number
  ): ParticipantValidation;

  /**
   * Validate participant alias quoted string format
   *
   * @param quotedString - The quoted string portion of alias (e.g., "\"Alice\"")
   * @returns RenderError or null if valid
   *
   * Behavior:
   * - Returns null if quotes are properly matched and non-empty
   * - Returns RenderError with helpful message if quotes don't match or string is empty
   * - Supports double quotes (")
   * - Must use same quote type for opening and closing
   * - Empty quoted strings (e.g., "") are invalid per FR-017
   *
   * Example:
   * - "\"Alice\"" → null (valid)
   * - "\"Alice" → RenderError (unclosed)
   * - "\"\"" → RenderError (empty alias per FR-017)
   *
   * FR-009: Support quoted strings with spaces and special characters
   * FR-011: Display helpful error messages for malformed declarations
   * FR-017: Reject empty aliases
   */
  validateAliasQuotes(quotedString: string): RenderError | null;

  /**
   * Validate complete diagram syntax (Title + participants + ordering)
   *
   * @param diagramSource - Complete diagram source code (may be multi-line)
   * @returns ValidationResult aggregating all validations
   *
   * Behavior:
   * - Parses all Title declarations (uses first, ignores duplicates)
   * - Parses all participant declarations in order
   * - Builds participantMap from valid declarations
   * - Aggregates all errors into errors array
   * - Returns isValid = true only if title and all participants are valid
   * - Preserves declaration order of participants
   * - Handles mixed valid/invalid declarations (may have partial results)
   *
   * Example workflow:
   * - Parse line-by-line for Title and participant declarations
   * - Validate each using validateTitle/validateParticipant
   * - Build participantMap from valid participants
   * - Return aggregated ValidationResult
   *
   * FR-001, FR-003, FR-004, FR-005, FR-006: Parse and validate all syntax
   * FR-008: Preserve backward compatibility (missing Title/participants is OK)
   * FR-011: Aggregate errors for reporting
   * FR-015: Handle multiple Title declarations (use first)
   * FR-016: Cache results by source hash
   */
  validateDiagram(diagramSource: string): ValidationResult;
}
