/**
 * DiagramParser
 *
 * Validates sequence diagram syntax before rendering.
 * Provides detailed error messages with line numbers and suggestions.
 *
 * Implements: User Story 2 - Enhanced Error Handling
 * FRs: FR-006 (syntax validation), FR-007 (empty content handling)
 */

import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types';

/**
 * Pattern for valid sequence diagram syntax
 * Format: Participant->Participant: Message
 * Also supports: Participant-->Participant (dotted arrow)
 */
const ARROW_PATTERN = /^([^-]+)(-{1,2}>+)([^:]*):?\s*(.*)$/;

/**
 * Special keywords that are valid diagram syntax
 * Note: Title and participant are checked case-insensitively in isSpecialKeyword()
 */
const SPECIAL_KEYWORDS = [
  'Note left of',
  'Note right of',
  'Note over',
];

export class DiagramParser {
  /**
   * Validate diagram syntax
   *
   * @param content - Diagram source content
   * @returns Validation result with errors and warnings
   */
  validate(content: string): ValidationResult {
    try {
      // Check for empty content
      if (!content || content.trim().length === 0) {
        return {
          isValid: true,
          isEmpty: true,
          errors: [],
          warnings: [],
        };
      }

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      const lines = content.split('\n');

      // Validate each line
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        // Skip empty lines
        if (trimmedLine.length === 0) {
          return;
        }

        // Check if line is a special keyword
        if (this.isSpecialKeyword(trimmedLine)) {
          // Validate special keyword format
          const keywordWarnings = this.validateSpecialKeyword(
            trimmedLine,
            lineNumber
          );
          warnings.push(...keywordWarnings);
          return;
        }

        // Validate arrow syntax
        const arrowError = this.validateArrowSyntax(trimmedLine, lineNumber);
        if (arrowError) {
          errors.push(arrowError);
        }
      });

      return {
        isValid: errors.length === 0,
        isEmpty: false,
        errors,
        warnings,
      };
    } catch (error) {
      // Never throw - always return a result
      return {
        isValid: false,
        isEmpty: false,
        errors: [
          {
            message: 'Unexpected error during validation',
            lineNumber: null,
            suggestion: 'Please check your diagram syntax',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Check if line is a special keyword
   *
   * @param line - Trimmed line content
   * @returns True if line starts with a special keyword
   */
  private isSpecialKeyword(line: string): boolean {
    // Case-insensitive check for Title: (v0.10.0)
    if (/^(title|Title|TITLE):/i.test(line)) {
      return true;
    }

    // Case-insensitive check for participant (v0.10.0)
    if (/^(participant|Participant|PARTICIPANT)\s/i.test(line)) {
      return true;
    }

    // Check other keywords (case-sensitive for backward compatibility)
    return SPECIAL_KEYWORDS.some((keyword) =>
      line.startsWith(keyword)
    );
  }

  /**
   * Validate special keyword format
   *
   * @param line - Line with special keyword
   * @param lineNumber - Line number in source
   * @returns Array of warnings (if any)
   */
  private validateSpecialKeyword(
    line: string,
    lineNumber: number
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for missing content after "Title:" (case-insensitive in v0.10.0)
    const titleMatch = line.match(/^(title|Title|TITLE):\s*$/i);
    if (titleMatch) {
      warnings.push({
        message: 'Title has no text',
        lineNumber,
      });
    }

    // Check for incomplete "Note" syntax
    if (line.startsWith('Note') && !line.includes(':')) {
      warnings.push({
        message: 'Note syntax incomplete - should be "Note [position]: text"',
        lineNumber,
      });
    }

    return warnings;
  }

  /**
   * Validate arrow syntax
   *
   * @param line - Line to validate
   * @param lineNumber - Line number in source
   * @returns Validation error if invalid, null if valid
   */
  private validateArrowSyntax(
    line: string,
    lineNumber: number
  ): ValidationError | null {
    const match = line.match(ARROW_PATTERN);

    if (!match) {
      // No arrow found - check for common mistakes
      return this.detectCommonErrors(line, lineNumber);
    }

    const [, sender, arrow, receiver, message] = match;

    // Validate sender
    if (!sender || sender.trim().length === 0) {
      return {
        message: 'Missing sender participant before arrow',
        lineNumber,
        suggestion: 'Format should be: Participant->Other: Message',
      };
    }

    // Validate receiver
    if (!receiver || receiver.trim().length === 0) {
      return {
        message: 'Missing receiver participant after arrow',
        lineNumber,
        suggestion: 'Format should be: Participant->Other: Message',
      };
    }

    // Check for malformed arrow (space after arrow)
    if (receiver.startsWith(' ') && receiver.trim().length > 0) {
      // This is actually valid, just a style issue - don't error
      return null;
    }

    // Validate message (optional, but warn if missing)
    if (message && message.trim().length === 0 && line.includes(':')) {
      // Warning, not error - handled by warnings array in parent
      return null;
    }

    return null;
  }

  /**
   * Detect common syntax errors
   *
   * @param line - Line that doesn't match arrow pattern
   * @param lineNumber - Line number in source
   * @returns Validation error with helpful suggestion
   */
  private detectCommonErrors(
    line: string,
    lineNumber: number
  ): ValidationError {
    // Check for missing arrow
    if (!line.includes('->') && !line.includes('-->')) {
      return {
        message: 'Invalid syntax - missing arrow',
        lineNumber,
        suggestion: 'Check for missing arrows (->) or colons (:)',
      };
    }

    // Check for incomplete arrow (e.g., "Alice->" without receiver)
    if (line.includes('->') && line.endsWith('->')) {
      return {
        message: 'Incomplete arrow - missing receiver',
        lineNumber,
        suggestion: 'Add a participant after the arrow: Participant->Other',
      };
    }

    // Check for arrow at start (missing sender)
    if (line.startsWith('->') || line.startsWith('-->')) {
      return {
        message: 'Missing sender participant',
        lineNumber,
        suggestion: 'Add a participant before the arrow: Sender->Receiver',
      };
    }

    // Generic syntax error
    return {
      message: 'Invalid syntax',
      lineNumber,
      suggestion: 'Verify all messages follow the format: Participant->Other: Message',
    };
  }
}
