/**
 * Contract: IErrorDisplay
 *
 * Purpose: Format and display error messages for failed diagram renders
 *
 * Implements: FR-007 (clear error messages), FR-014 (empty block warnings)
 */

import { RenderError } from '../types';

export interface IErrorDisplay {
  /**
   * Create an error display element
   *
   * @param error - Error details to display
   * @returns HTMLElement containing formatted error message
   *
   * Behavior:
   * - Creates styled div with error icon and message
   * - Includes line number if available
   * - Shows suggestion if provided
   * - Uses Obsidian CSS variables for styling
   *
   * Example output:
   * ┌─────────────────────────────────────┐
   * │ ⚠ Syntax Error (Line 5)            │
   * │ Unexpected token: expected '->'     │
   * │ Suggestion: Check for missing quotes│
   * └─────────────────────────────────────┘
   */
  createErrorElement(error: RenderError): HTMLElement;

  /**
   * Create a warning display element (non-fatal issues)
   *
   * @param message - Warning message text
   * @returns HTMLElement containing formatted warning
   *
   * Used for:
   * - Empty content warnings
   * - Performance warnings for large diagrams
   */
  createWarningElement(message: string): HTMLElement;

  /**
   * Create a performance warning element
   *
   * @param participantCount - Number of participants in diagram
   * @param messageCount - Number of messages in diagram
   * @returns HTMLElement with performance warning message
   *
   * Displayed when DiagramMetrics.exceedsThreshold is true
   */
  createPerformanceWarning(
    participantCount: number,
    messageCount: number
  ): HTMLElement;
}
