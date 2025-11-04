/**
 * Contract: ISQJSCodeBlockProcessor
 *
 * Purpose: Main entry point for processing sqjs code blocks in reading mode
 *
 * Implements: FR-001 (detect sqjs blocks), FR-003 (render in reading mode),
 *             FR-006 (handle multiple blocks independently)
 */

import { MarkdownPostProcessorContext } from 'obsidian';

export interface ISQJSCodeBlockProcessor {
  /**
   * Process a single sqjs code block
   *
   * @param source - Raw text content from the code block
   * @param el - Container element where diagram should be rendered
   * @param ctx - Obsidian context for the markdown processing
   *
   * Behavior:
   * - Called by Obsidian when rendering a ```sqjs code block in reading mode
   * - Generates unique blockId from source hash + position
   * - Checks for empty content and displays warning if needed
   * - Renders diagram or error message into el
   * - Handles render cancellation on mode switch
   * - Adds copy-to-clipboard functionality if render succeeds
   *
   * Error Handling:
   * - Empty/whitespace: Display warning message
   * - Syntax error: Display formatted error with line number
   * - Library failure: Display error notice
   * - Never throws - all errors handled gracefully
   */
  process(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): Promise<void>;

  /**
   * Cancel all pending render operations
   *
   * Called when:
   * - User switches from reading mode to editing mode
   * - Note is closed
   * - Plugin is unloaded
   *
   * Behavior:
   * - Aborts all in-flight render operations
   * - Clears active operation tracking
   */
  cancelAllRenders(): void;
}
