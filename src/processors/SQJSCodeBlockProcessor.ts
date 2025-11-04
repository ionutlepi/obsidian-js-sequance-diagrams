/**
 * SQJSCodeBlockProcessor
 *
 * Main entry point for processing sqjs code blocks in reading mode.
 * Handles rendering, error display, and operation cancellation.
 *
 * Implements: ISQJSCodeBlockProcessor contract
 * FRs: FR-001 (detect blocks), FR-003 (render), FR-006 (independence)
 */

import type { MarkdownPostProcessorContext } from 'obsidian';
import type { DiagramSource } from '../types';
import type { ISQJSCodeBlockProcessor } from '../contracts/ISQJSCodeBlockProcessor';
import type { IDiagramRenderer } from '../contracts/IDiagramRenderer';
import type { IErrorDisplay } from '../contracts/IErrorDisplay';
import type { IClipboardHandler } from '../contracts/IClipboardHandler';
import { RenderCancellation } from '../utils/RenderCancellation';
import { DiagramParser } from '../utils/DiagramParser';

export class SQJSCodeBlockProcessor implements ISQJSCodeBlockProcessor {
  private renderer: IDiagramRenderer;
  private errorDisplay: IErrorDisplay;
  private clipboardHandler: IClipboardHandler;
  private parser: DiagramParser;
  private cancellation: RenderCancellation;
  private theme: 'simple' | 'hand-drawn';

  constructor(
    renderer: IDiagramRenderer,
    errorDisplay: IErrorDisplay,
    clipboardHandler: IClipboardHandler,
    theme: 'simple' | 'hand-drawn' = 'simple'
  ) {
    this.renderer = renderer;
    this.errorDisplay = errorDisplay;
    this.clipboardHandler = clipboardHandler;
    this.parser = new DiagramParser();
    this.cancellation = new RenderCancellation();
    this.theme = theme;
  }

  /**
   * Process a single sqjs code block
   *
   * @param source - Raw text content from code block
   * @param el - Container element for rendering
   * @param ctx - Obsidian markdown processing context
   */
  async process(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): Promise<void> {
    // Generate unique blockId from content hash + position
    const blockId = this.generateBlockId(source, ctx);

    // Create DiagramSource object
    const diagramSource: DiagramSource = {
      content: source,
      blockId,
      lineCount: source.split('\n').length,
    };

    // Start render operation with cancellation support
    const signal = this.cancellation.start(blockId);

    try {
      // Validate syntax before rendering
      const validation = this.parser.validate(source);

      // Handle empty content
      if (validation.isEmpty) {
        const warning = this.errorDisplay.createWarningElement(
          'Empty sequence diagram block. Add diagram content to render.'
        );
        el.appendChild(warning);
        this.cancellation.complete(blockId);
        return;
      }

      // Display validation errors if any
      if (!validation.isValid && validation.errors.length > 0) {
        // Show all validation errors
        validation.errors.forEach((error) => {
          const errorElement = this.errorDisplay.createValidationErrorElement(error);
          el.appendChild(errorElement);
        });
        this.cancellation.complete(blockId);
        return;
      }

      // Render diagram
      const result = await this.renderer.render(diagramSource, this.theme, signal);

      // Handle result based on status
      if (result.status === 'success' && result.svgElement) {
        // Check for performance warning
        if (result.metrics?.exceedsThreshold) {
          const warning = this.errorDisplay.createPerformanceWarning(
            result.metrics.participantCount,
            result.metrics.messageCount
          );
          el.appendChild(warning);
        }

        // Create container for diagram
        const diagramContainer = el.createEl('div', {
          cls: 'sqjs-diagram-container',
        });

        // Append SVG
        diagramContainer.appendChild(result.svgElement);

        // Add copy button
        this.clipboardHandler.addCopyButton(diagramContainer, result.svgElement);

        // Store blockId for debugging
        diagramContainer.setAttribute('data-block-id', blockId);
      } else if (result.status === 'error' && result.error) {
        // Display error
        const errorElement = this.errorDisplay.createErrorElement(result.error);
        el.appendChild(errorElement);
      } else if (result.status === 'empty') {
        // Display empty warning
        const warning = this.errorDisplay.createWarningElement(
          'Empty sequence diagram block.'
        );
        el.appendChild(warning);
      }

      // Mark operation as complete
      this.cancellation.complete(blockId);
    } catch (error) {
      // Handle cancellation or unexpected errors
      if (error instanceof Error && error.message.includes('abort')) {
        // Render was cancelled - this is normal, don't show error
        return;
      }

      // Display unexpected error
      const errorElement = this.errorDisplay.createErrorElement({
        message: error instanceof Error ? error.message : 'Unknown error',
        lineNumber: null,
        suggestion: 'An unexpected error occurred during rendering',
      });
      el.appendChild(errorElement);

      this.cancellation.complete(blockId);
    }
  }

  /**
   * Cancel all pending render operations
   *
   * Called when:
   * - User switches from reading to editing mode
   * - Note is closed
   * - Plugin is unloaded
   */
  cancelAllRenders(): void {
    this.cancellation.cancelAll();
  }

  /**
   * Update theme for future renders
   *
   * @param theme - New theme to use
   */
  setTheme(theme: 'simple' | 'hand-drawn'): void {
    this.theme = theme;
  }

  /**
   * Generate unique block ID from content and position
   *
   * @param source - Diagram source content
   * @param ctx - Markdown context with position info
   * @returns Unique block identifier
   */
  private generateBlockId(
    source: string,
    ctx: MarkdownPostProcessorContext
  ): string {
    // Simple hash of content
    const contentHash = this.simpleHash(source);

    // Get section info for position
    const sectionInfo = ctx.getSectionInfo(ctx.el);
    const lineStart = sectionInfo?.lineStart ?? 0;

    // Combine for unique ID
    return `sqjs-${contentHash}-${lineStart}`;
  }

  /**
   * Generate simple hash of string
   *
   * @param str - String to hash
   * @returns Numeric hash
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
