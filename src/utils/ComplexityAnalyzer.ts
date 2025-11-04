/**
 * ComplexityAnalyzer
 *
 * Analyzes sequence diagrams to count participants and messages,
 * and determine if complexity exceeds performance thresholds.
 *
 * Implements: FR-008 (performance warnings)
 */

import type { DiagramSource, DiagramMetrics } from '../types';

/**
 * Thresholds for performance warnings
 */
const PARTICIPANT_THRESHOLD = 15;
const MESSAGE_THRESHOLD = 50;

export class ComplexityAnalyzer {
  /**
   * Analyze diagram complexity
   *
   * @param source - Diagram source to analyze
   * @returns Metrics with participant count, message count, and threshold status
   */
  analyze(source: DiagramSource): DiagramMetrics {
    const content = source.content.trim();

    // Handle empty content
    if (!content) {
      return {
        participantCount: 0,
        messageCount: 0,
        exceedsThreshold: false,
      };
    }

    const participants = this.extractParticipants(content);
    const messageCount = this.countMessages(content);

    return {
      participantCount: participants.size,
      messageCount,
      exceedsThreshold:
        participants.size > PARTICIPANT_THRESHOLD ||
        messageCount > MESSAGE_THRESHOLD,
    };
  }

  /**
   * Extract unique participants from diagram content
   *
   * @param content - Diagram source content
   * @returns Set of unique participant names
   */
  private extractParticipants(content: string): Set<string> {
    const participants = new Set<string>();
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines, titles, and notes
      if (!trimmed || this.isNonMessageLine(trimmed)) {
        continue;
      }

      // Match arrows: -> or -->
      const arrowMatch = trimmed.match(/^([^-]+)--?>([^:]+):/);
      if (arrowMatch) {
        const left = arrowMatch[1].trim();
        const right = arrowMatch[2].trim();

        if (left) participants.add(left);
        if (right) participants.add(right);
      }
    }

    return participants;
  }

  /**
   * Count message lines in diagram
   *
   * @param content - Diagram source content
   * @returns Number of message lines
   */
  private countMessages(content: string): number {
    const lines = content.split('\n');
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines, titles, and notes
      if (!trimmed || this.isNonMessageLine(trimmed)) {
        continue;
      }

      // Check if line contains an arrow (-> or -->)
      if (/--?>/.test(trimmed)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Check if line is a non-message line (Title, Note, etc.)
   *
   * @param line - Line to check
   * @returns True if line is not a message
   */
  private isNonMessageLine(line: string): boolean {
    // Title lines start with "Title:"
    if (/^Title:/i.test(line)) {
      return true;
    }

    // Note lines start with "Note"
    if (/^Note\s+(left|right|over)\s+of/i.test(line)) {
      return true;
    }

    return false;
  }
}
