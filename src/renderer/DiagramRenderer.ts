/**
 * DiagramRenderer
 *
 * Core renderer for sequence diagrams using js-sequence-diagram library.
 * Implements caching, complexity analysis, and theme support.
 *
 * Implements: IDiagramRenderer contract
 * FRs: FR-003 (rendering), FR-008 (performance), FR-016 (caching)
 */

import type {
  DiagramSource,
  RenderResult,
  DiagramMetrics,
  CacheEntry,
} from '../types';
import type { IDiagramRenderer } from '../contracts/IDiagramRenderer';
import { ComplexityAnalyzer } from '../utils/ComplexityAnalyzer';

// Import via wrapper that sets up global dependencies
import Diagram from '../lib/sequence-diagram-loader';

/**
 * LRU Cache size limit
 */
const CACHE_SIZE = 50;

export class DiagramRenderer implements IDiagramRenderer {
  private cache: Map<string, CacheEntry>;
  private analyzer: ComplexityAnalyzer;

  constructor() {
    this.cache = new Map();
    this.analyzer = new ComplexityAnalyzer();
  }

  /**
   * Render a sequence diagram
   *
   * @param source - Diagram source content and metadata
   * @param theme - Theme to apply ('simple' or 'hand-drawn')
   * @param signal - Optional AbortSignal for cancellation
   * @returns RenderResult with SVG, status, metrics
   */
  async render(
    source: DiagramSource,
    theme: 'simple' | 'hand-drawn',
    signal?: AbortSignal
  ): Promise<RenderResult> {
    // Check for cancellation
    if (signal?.aborted) {
      throw new Error('Render operation aborted');
    }

    // Handle empty content
    if (!source.content.trim()) {
      return {
        status: 'empty',
        svgElement: null,
        error: null,
        metrics: {
          participantCount: 0,
          messageCount: 0,
          exceedsThreshold: false,
        },
      };
    }

    // Check cache
    const cacheKey = this.getCacheKey(source, theme);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      // Update LRU order
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, cached);
      return cached.result;
    }

    // Analyze complexity
    const metrics = this.analyzer.analyze(source);

    try {
      // Check for cancellation before rendering
      if (signal?.aborted) {
        throw new Error('Render operation aborted');
      }

      // Parse and render diagram
      const diagram = Diagram.parse(source.content);

      // Create container for SVG
      const container = document.createElement('div');
      container.style.display = 'none'; // Render off-screen
      document.body.appendChild(container);

      try {
        // Render with theme
        diagram.drawSVG(container, {
          theme: theme === 'hand-drawn' ? 'hand' : 'simple',
        });

        // Extract SVG element
        const svgElement = container.querySelector('svg');
        if (!svgElement) {
          throw new Error('Failed to generate SVG');
        }

        // Clone SVG to detach from temporary container
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Clean up temporary container
        document.body.removeChild(container);

        // Create result
        const result: RenderResult = {
          status: 'success',
          svgElement: clonedSvg,
          error: null,
          metrics,
        };

        // Cache result (with LRU eviction)
        this.addToCache(cacheKey, result);

        return result;
      } finally {
        // Ensure cleanup even if error occurs
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      }
    } catch (error) {
      // Handle parsing/rendering errors
      return {
        status: 'error',
        svgElement: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          lineNumber: this.extractLineNumber(error),
          suggestion: this.getSuggestion(error),
        },
        metrics,
      };
    }
  }

  /**
   * Analyze diagram complexity without rendering
   *
   * @param source - Diagram source to analyze
   * @returns Complexity metrics
   */
  analyzeComplexity(source: DiagramSource): DiagramMetrics {
    return this.analyzer.analyze(source);
  }

  /**
   * Clear the render cache
   *
   * Called when:
   * - Theme changes (force re-render with new theme)
   * - User manually clears cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Generate cache key for a render operation
   *
   * @param source - Diagram source
   * @param theme - Theme name
   * @returns Unique cache key
   */
  private getCacheKey(source: DiagramSource, theme: string): string {
    // Use blockId + theme as key
    // blockId already includes content hash + position
    return `${source.blockId}:${theme}`;
  }

  /**
   * Add result to cache with LRU eviction
   *
   * @param key - Cache key
   * @param result - Render result to cache
   */
  private addToCache(key: string, result: RenderResult): void {
    // If cache is full, remove oldest entry (first in Map)
    if (this.cache.size >= CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    // Add new entry (at end, making it most recent)
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Extract line number from error message
   *
   * @param error - Error object
   * @returns Line number if found, null otherwise
   */
  private extractLineNumber(error: unknown): number | null {
    if (!(error instanceof Error)) return null;

    // Try to extract line number from error message
    const match = error.message.match(/line\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Generate helpful suggestion based on error
   *
   * @param error - Error object
   * @returns Suggestion text
   */
  private getSuggestion(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Check your sequence diagram syntax';
    }

    const message = error.message.toLowerCase();

    if (message.includes('parse') || message.includes('syntax')) {
      return 'Check for missing arrows (->) or colons (:)';
    }

    if (message.includes('unexpected')) {
      return 'Verify all messages follow the format: Participant->Other: Message';
    }

    if (message.includes('abort')) {
      return 'Render was cancelled';
    }

    return 'Check your sequence diagram syntax';
  }
}
