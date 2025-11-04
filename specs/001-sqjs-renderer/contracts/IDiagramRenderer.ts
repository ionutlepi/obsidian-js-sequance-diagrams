/**
 * Contract: IDiagramRenderer
 *
 * Purpose: Core interface for rendering sequence diagrams from SQJS source
 *
 * Implements: FR-003 (render diagrams), FR-016 (performance warnings),
 *             FR-017 (render cancellation)
 */

import { DiagramSource, RenderResult, DiagramMetrics } from '../data-model';

export interface IDiagramRenderer {
  /**
   * Render a sequence diagram from source
   *
   * @param source - The diagram source code and metadata
   * @param theme - Rendering theme ('simple' | 'hand-drawn')
   * @param signal - AbortSignal for cancellation support
   * @returns Promise resolving to render result (success, error, or empty)
   *
   * Behavior:
   * - Returns { status: 'empty' } if source.content is empty/whitespace
   * - Returns { status: 'error' } if syntax is invalid
   * - Returns { status: 'success' } with SVG and metrics if render succeeds
   * - Respects abort signal and throws AbortError if cancelled
   * - Analyzes complexity and includes metrics in result
   */
  render(
    source: DiagramSource,
    theme: 'simple' | 'hand-drawn',
    signal?: AbortSignal
  ): Promise<RenderResult>;

  /**
   * Analyze diagram complexity without rendering
   *
   * @param source - The diagram source code
   * @returns Complexity metrics (participant count, message count, threshold exceeded)
   *
   * Behavior:
   * - Counts unique participants via regex matching
   * - Estimates message count from line count
   * - Marks exceedsThreshold if >15 participants or >50 messages
   */
  analyzeComplexity(source: DiagramSource): DiagramMetrics;

  /**
   * Clear all cached renders
   *
   * Called when theme changes globally to invalidate cache
   */
  clearCache(): void;
}
