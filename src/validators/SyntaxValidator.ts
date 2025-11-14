/**
 * SyntaxValidator - Validates Title, participant alias, and ordering syntax
 * Feature: 002-title-alias-support
 * Implements: ISyntaxValidator interface
 *
 * Provides validation for Title declarations, participant aliases, and ordering
 * with helpful error messages for common syntax mistakes.
 */

import { ISyntaxValidator } from './ISyntaxValidator';
import {
  TitleValidation,
  ParticipantValidation,
  ValidationResult,
} from '../types/validation';
import { RenderError } from '../types';
import { ValidationCache } from './ValidationCache';

export class SyntaxValidator implements ISyntaxValidator {
  private cache: ValidationCache;

  constructor(cache?: ValidationCache) {
    this.cache = cache || new ValidationCache();
  }

  /**
   * Validate Title declaration syntax
   * Implements: FR-001, FR-012, FR-013, FR-014
   */
  validateTitle(line: string): TitleValidation {
    // FR-001: Case-insensitive pattern matching
    const titlePattern = /^(title|Title|TITLE|TiTlE|tItLe|TItLE|tiTLE|TItle):\s*(.*)$/i;
    const match = line.match(titlePattern);

    if (!match) {
      // Not a title line - could be valid diagram syntax, just not a title
      return {
        isValid: false,
        title: null,
        error: {
          type: 'syntax',
          message: 'Invalid Title syntax. Missing colon after "Title" keyword',
          lineNumber: null,
          suggestion: 'Ensure line starts with "Title:" (case-insensitive) followed by a colon and title text',
        },
      };
    }

    // FR-013: Trim whitespace from title text
    const titleText = match[2].trim();

    // FR-014: Empty or whitespace-only title is invalid
    if (!titleText || titleText.length === 0) {
      return {
        isValid: false,
        title: null,
        error: null, // Not an error, just treated as no title
      };
    }

    // FR-012: Unicode support is automatic with JavaScript strings
    return {
      isValid: true,
      title: titleText,
      error: null,
    };
  }

  /**
   * Validate participant declaration syntax
   * Implements: FR-003, FR-004, FR-005, FR-006, FR-009, FR-010, FR-012, FR-013, FR-017
   */
  validateParticipant(
    line: string,
    declarationOrder: number
  ): ParticipantValidation {
    // Actual library syntax (verified by testing):
    // Pattern 1: participant [Full Display Name] as [ShortAlias]
    // Pattern 2: participant [SimpleName]
    // Note: Display name can have spaces, NO quotes needed
    const aliasPattern = /^participant\s+(.+?)\s+as\s+(\w+)\s*$/;
    const simplePattern = /^participant\s+(\w+)\s*$/;

    // Try aliased pattern first
    const aliasMatch = line.match(aliasPattern);
    if (aliasMatch) {
      const [, displayName, shortName] = aliasMatch;

      // FR-013: Trim whitespace from display name
      const trimmedDisplayName = displayName.trim();

      // FR-017: Reject empty aliases
      if (!trimmedDisplayName || trimmedDisplayName.length === 0) {
        return {
          isValid: false,
          shortName: null,
          displayName: null,
          hasAlias: false,
          declarationOrder,
          error: {
            type: 'syntax',
            message: 'empty participant alias not allowed',
            lineNumber: null,
            suggestion: 'Provide a non-empty display name or remove the alias declaration',
          },
        };
      }

      // FR-012: Unicode support is automatic with JavaScript strings
      return {
        isValid: true,
        shortName,
        displayName: trimmedDisplayName,
        hasAlias: true,
        declarationOrder,
        error: null,
      };
    }

    // Try simple pattern
    const simpleMatch = line.match(simplePattern);
    if (simpleMatch) {
      const [, shortName] = simpleMatch;

      // Validate identifier doesn't start with a digit
      if (/^\d/.test(shortName)) {
        return {
          isValid: false,
          shortName: null,
          displayName: null,
          hasAlias: false,
          declarationOrder,
          error: {
            type: 'syntax',
            message: 'Invalid participant identifier. Cannot start with a number',
            lineNumber: null,
            suggestion: 'Participant names must start with a letter or underscore',
          },
        };
      }

      return {
        isValid: true,
        shortName,
        displayName: shortName, // FR-010: displayName defaults to shortName
        hasAlias: false,
        declarationOrder,
        error: null,
      };
    }

    // Check for common errors and provide helpful messages (FR-011)

    // Check for incorrect syntax with "as" keyword
    if (line.includes(' as ')) {
      return {
        isValid: false,
        shortName: null,
        displayName: null,
        hasAlias: false,
        declarationOrder,
        error: {
          type: 'syntax',
          message: 'Invalid participant alias syntax',
          lineNumber: null,
          suggestion: 'Use format: participant [Display Name] as [Alias]  (no quotes needed)',
        },
      };
    }

    // Invalid identifier (starts with number, contains special chars)
    const identifierMatch = line.match(/^participant\s+([^\s]+)/);
    if (identifierMatch) {
      const identifier = identifierMatch[1];

      // Check if starts with a digit
      if (/^\d/.test(identifier)) {
        return {
          isValid: false,
          shortName: null,
          displayName: null,
          hasAlias: false,
          declarationOrder,
          error: {
            type: 'syntax',
            message: 'Invalid participant identifier. Cannot start with a number',
            lineNumber: null,
            suggestion: 'Participant names must start with a letter or underscore',
          },
        };
      }

      // Check if contains invalid characters (anything that's not word character)
      if (!/^\w+$/.test(identifier)) {
        return {
          isValid: false,
          shortName: null,
          displayName: null,
          hasAlias: false,
          declarationOrder,
          error: {
            type: 'syntax',
            message: 'Invalid participant identifier. Must be alphanumeric or underscore only',
            lineNumber: null,
            suggestion: 'Use only letters, numbers, and underscores in participant names',
          },
        };
      }
    }

    // Generic error
    return {
      isValid: false,
      shortName: null,
      displayName: null,
      hasAlias: false,
      declarationOrder,
      error: {
        type: 'syntax',
        message:
          'Invalid participant syntax. Expected: participant [Name] or participant [Display Name] as [Alias]',
        lineNumber: null,
        suggestion: 'Check participant declaration format (no quotes needed)',
      },
    };
  }

  /**
   * Validate participant alias format
   * Implements: FR-009, FR-011, FR-017
   *
   * Note: Quotes are NOT used in js-sequence-diagrams syntax.
   * Display names can contain spaces without quotes.
   */
  validateAliasQuotes(aliasString: string): RenderError | null {
    // FR-017: Empty aliases not allowed
    if (!aliasString || aliasString.trim().length === 0) {
      return {
        type: 'syntax',
        message: 'empty participant alias not allowed',
        lineNumber: null,
        suggestion: 'Provide a non-empty display name or alias',
      };
    }

    // Valid
    return null;
  }

  /**
   * Validate complete diagram syntax
   * Implements: FR-001, FR-003, FR-004, FR-005, FR-006, FR-008, FR-011, FR-015, FR-016
   */
  validateDiagram(diagramSource: string): ValidationResult {
    // FR-016: Check cache first
    const cachedResult = this.cache.get(diagramSource);
    if (cachedResult) {
      return cachedResult;
    }

    const lines = diagramSource.split('\n');
    const errors: RenderError[] = [];
    let titleValidation: TitleValidation | null = null;
    const participants: ParticipantValidation[] = [];
    let participantCount = 0;
    let foundFirstNonEmptyLine = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        continue;
      }

      // FR-001: Title can be on first non-empty line
      if (!foundFirstNonEmptyLine) {
        foundFirstNonEmptyLine = true;

        // Check if this first non-empty line is a Title
        if (trimmed.match(/^(title|Title|TITLE|TiTlE|tItLe|TItLE|tiTLE|TItle):/i)) {
          titleValidation = this.validateTitle(trimmed);
          // Don't add errors for empty titles (FR-014 - just treated as no title)
          if (!titleValidation.isValid && titleValidation.error && titleValidation.error.message.includes('colon')) {
            errors.push(titleValidation.error);
          }
          continue;
        }
      }

      // FR-015: Check for Title (only use first, ignore subsequent)
      if (trimmed.match(/^(title|Title|TITLE|TiTlE|tItLe|TItLE|tiTLE|TItle):/i) && !titleValidation) {
        titleValidation = this.validateTitle(trimmed);
        // Don't add errors for empty titles (FR-014 - just treated as no title)
        if (!titleValidation.isValid && titleValidation.error && titleValidation.error.message.includes('colon')) {
          errors.push(titleValidation.error);
        }
        continue;
      }

      // FR-006, FR-007: Check for participant declaration
      if (trimmed.startsWith('participant')) {
        const participantValidation = this.validateParticipant(
          trimmed,
          participantCount
        );
        participants.push(participantValidation);

        if (!participantValidation.isValid && participantValidation.error) {
          errors.push(participantValidation.error);
        }

        participantCount++;
        continue;
      }
    }

    // Build participant map (empty for now, will be populated in T036)
    const participantMap = new Map<string, string>();
    participants.forEach((p) => {
      if (p.isValid && p.shortName && p.displayName) {
        participantMap.set(p.shortName, p.displayName);
      }
    });

    // FR-008: Missing Title/participants is OK (backward compatibility)
    // FR-014: Empty title doesn't make diagram invalid, just treated as no title
    const isValid =
      participants.every((p) => p.isValid) &&
      errors.length === 0;

    const result: ValidationResult = {
      isValid,
      title: titleValidation || {
        isValid: false,
        title: null,
        error: null,
      },
      participants,
      participantMap,
      errors,
    };

    // FR-016: Cache the result
    this.cache.set(diagramSource, result);

    return result;
  }
}
