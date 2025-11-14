/**
 * ErrorDisplay
 *
 * Formats and displays error messages and warnings for diagram rendering.
 * Uses Obsidian CSS variables for consistent styling.
 *
 * Implements: IErrorDisplay contract
 * FRs: FR-006 (enhanced error display), FR-007 (clear errors), FR-014 (empty warnings)
 */

import type { RenderError, ValidationError } from '../types';
import type { IErrorDisplay } from '../contracts/IErrorDisplay';

export class ErrorDisplay implements IErrorDisplay {
  /**
   * Create an error display element
   *
   * @param error - Error details to display
   * @returns HTMLElement with formatted error message
   */
  createErrorElement(error: RenderError): HTMLElement {
    const container = document.createElement('div');
    container.className = 'sqjs-error';
    container.style.cssText = `
      padding: 12px;
      margin: 8px 0;
      border-left: 4px solid var(--text-error);
      background-color: var(--background-modifier-error);
      border-radius: 4px;
      font-family: var(--font-interface);
    `;

    // Error icon and title
    const title = container.createEl('div', {
      cls: 'error-title',
    });
    title.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--text-normal);
      margin-bottom: 4px;
    `;

    const icon = title.createEl('span', {
      text: '⚠ ',
      cls: 'error-icon'
    });

    title.createEl('span', { text: 'Syntax Error' });

    // Add line number badge if available
    if (error.lineNumber) {
      const badge = title.createEl('span', {
        text: `Line ${error.lineNumber}`,
        cls: 'error-line-badge'
      });
      badge.style.cssText = `
        background-color: var(--text-error);
        color: var(--text-normal);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.85em;
        font-weight: 500;
      `;
    }

    // Error message
    const message = container.createEl('div', {
      cls: 'error-message',
      text: error.message,
    });
    message.style.cssText = `
      color: var(--text-normal);
      margin-bottom: 4px;
      font-size: 0.9em;
    `;

    // Suggestion (if provided)
    if (error.suggestion) {
      const suggestion = container.createEl('div', {
        cls: 'error-suggestion',
      });
      suggestion.style.cssText = `
        color: var(--text-muted);
        font-size: 0.85em;
        font-style: italic;
      `;
      suggestion.createEl('strong', { text: 'Suggestion: ' });
      suggestion.createSpan({ text: error.suggestion });
    }

    return container;
  }

  /**
   * Create an error display from validation error
   *
   * @param validationError - Validation error from DiagramParser
   * @returns HTMLElement with formatted validation error
   */
  createValidationErrorElement(validationError: ValidationError): HTMLElement {
    // Convert ValidationError to RenderError format
    const renderError: RenderError = {
      type: 'syntax',
      message: validationError.message,
      lineNumber: validationError.lineNumber,
      suggestion: validationError.suggestion,
    };
    return this.createErrorElement(renderError);
  }

  /**
   * Create a warning display element (for empty/info messages)
   *
   * @param message - Warning message text
   * @returns HTMLElement with formatted warning
   */
  createWarningElement(message: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'sqjs-warning sqjs-info'; // Keep sqjs-warning for tests, sqjs-info for styling
    container.style.cssText = `
      padding: 12px;
      margin: 8px 0;
      border-left: 4px solid #0891b2;
      background-color: rgba(8, 145, 178, 0.1);
      border-radius: 4px;
      font-family: var(--font-interface);
      font-size: 0.9em;
    `;

    // Info icon and message container
    const content = container.createEl('div', {
      cls: 'sqjs-info-content',
    });
    content.style.cssText = `
      display: flex;
      align-items: start;
      gap: 8px;
    `;

    const icon = content.createEl('span', { text: 'ℹ️' });
    icon.style.cssText = `
      font-size: 1.1em;
      flex-shrink: 0;
    `;

    const text = content.createEl('span', { text: message });
    text.style.cssText = `
      color: var(--text-normal);
      line-height: 1.5;
    `;

    return container;
  }

  /**
   * Create a performance warning element
   *
   * @param participantCount - Number of participants
   * @param messageCount - Number of messages
   * @returns HTMLElement with performance warning
   */
  createPerformanceWarning(
    participantCount: number,
    messageCount: number
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'sqjs-performance-warning';
    container.style.cssText = `
      padding: 12px;
      margin: 8px 0;
      border-left: 4px solid #f59e0b;
      background-color: rgba(245, 158, 11, 0.1);
      border-radius: 4px;
      font-family: var(--font-interface);
      font-size: 0.9em;
    `;

    const title = container.createEl('div', {
      cls: 'sqjs-warning-title',
    });
    title.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: #d97706;
      margin-bottom: 6px;
    `;
    title.createEl('span', { text: '⚡' });
    title.createEl('span', { text: 'Large Diagram Warning' });

    const message = container.createEl('div', {
      cls: 'sqjs-warning-message',
    });
    message.style.cssText = `
      color: var(--text-normal);
      line-height: 1.5;
    `;

    let details = 'This diagram is complex: ';
    const reasons = [];

    if (participantCount > 15) {
      reasons.push(`${participantCount} participants`);
    }
    if (messageCount > 50) {
      reasons.push(`${messageCount} messages`);
    }

    details += reasons.join(', ');
    details += '. Rendering may take longer than usual.';

    message.setText(details);

    return container;
  }
}
