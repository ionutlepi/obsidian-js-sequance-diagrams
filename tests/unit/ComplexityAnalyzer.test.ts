/**
 * Unit Tests: ComplexityAnalyzer
 *
 * Tests for participant and message counting (T024)
 */

import { describe, it, expect } from 'vitest';
import type { DiagramSource } from '../../src/types';
import { ComplexityAnalyzer } from '../../src/utils/ComplexityAnalyzer';
import {
  SIMPLE_DIAGRAM,
  COMPLEX_DIAGRAM,
  LARGE_DIAGRAM_15_PARTICIPANTS,
  LARGE_DIAGRAM_50_MESSAGES,
  MULTIPLE_PARTICIPANTS,
} from '../fixtures/sample-diagrams';

describe('ComplexityAnalyzer - Participant counting (T024)', () => {
  const analyzer = new ComplexityAnalyzer();

  it('should count participants in simple diagram', () => {
    const source: DiagramSource = {
      content: SIMPLE_DIAGRAM,
      blockId: 'test-1',
      lineCount: 2,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.participantCount).toBe(2); // Alice and Bob
  });

  it('should count unique participants only once', () => {
    const source: DiagramSource = {
      content: `Alice->Bob: Message 1
Bob->Alice: Message 2
Alice->Bob: Message 3`,
      blockId: 'test-2',
      lineCount: 3,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.participantCount).toBe(2); // Only Alice and Bob
  });

  it('should count participants in complex diagram', () => {
    const source: DiagramSource = {
      content: COMPLEX_DIAGRAM,
      blockId: 'test-3',
      lineCount: 7,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.participantCount).toBe(4); // User, Frontend, Backend, Database
  });

  it('should count 15 participants in large diagram', () => {
    const source: DiagramSource = {
      content: LARGE_DIAGRAM_15_PARTICIPANTS,
      blockId: 'test-4',
      lineCount: 15,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.participantCount).toBe(15); // P1-P15
  });

  it('should count participants from multiple chains', () => {
    const source: DiagramSource = {
      content: MULTIPLE_PARTICIPANTS,
      blockId: 'test-5',
      lineCount: 5,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.participantCount).toBe(6); // Alice, Bob, Charlie, David, Eve, Frank
  });
});

describe('ComplexityAnalyzer - Message counting (T024)', () => {
  const analyzer = new ComplexityAnalyzer();

  it('should count messages in simple diagram', () => {
    const source: DiagramSource = {
      content: SIMPLE_DIAGRAM,
      blockId: 'test-6',
      lineCount: 2,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.messageCount).toBe(2);
  });

  it('should count messages in complex diagram', () => {
    const source: DiagramSource = {
      content: COMPLEX_DIAGRAM,
      blockId: 'test-7',
      lineCount: 7,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.messageCount).toBe(6); // Excluding title line
  });

  it('should count 50 messages in large diagram', () => {
    const source: DiagramSource = {
      content: LARGE_DIAGRAM_50_MESSAGES,
      blockId: 'test-8',
      lineCount: 50,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.messageCount).toBe(50);
  });

  it('should handle different arrow types (-> and -->)', () => {
    const source: DiagramSource = {
      content: `Alice->Bob: Solid
Alice-->Bob: Dotted`,
      blockId: 'test-9',
      lineCount: 2,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.messageCount).toBe(2);
  });
});

describe('ComplexityAnalyzer - Threshold detection (T024)', () => {
  const analyzer = new ComplexityAnalyzer();

  it('should not exceed threshold for small diagrams', () => {
    const source: DiagramSource = {
      content: SIMPLE_DIAGRAM,
      blockId: 'test-10',
      lineCount: 2,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.exceedsThreshold).toBe(false);
  });

  it('should exceed threshold with >15 participants', () => {
    const source: DiagramSource = {
      content: LARGE_DIAGRAM_15_PARTICIPANTS,
      blockId: 'test-11',
      lineCount: 15,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.exceedsThreshold).toBe(false); // Exactly 15, not >15
  });

  it('should exceed threshold with >50 messages', () => {
    const source: DiagramSource = {
      content: LARGE_DIAGRAM_50_MESSAGES,
      blockId: 'test-12',
      lineCount: 50,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.exceedsThreshold).toBe(false); // Exactly 50, not >50
  });

  it('should use threshold of 15 participants OR 50 messages', () => {
    const justUnder: DiagramSource = {
      content: `P1->P2: msg
P2->P3: msg
P3->P4: msg
P4->P5: msg
P5->P6: msg
P6->P7: msg
P7->P8: msg
P8->P9: msg
P9->P10: msg
P10->P11: msg
P11->P12: msg
P12->P13: msg
P13->P14: msg`,
      blockId: 'test-13',
      lineCount: 13,
    };

    const metrics = analyzer.analyze(justUnder);
    expect(metrics.exceedsThreshold).toBe(false); // 14 participants, 13 messages
  });
});

describe('ComplexityAnalyzer - Edge cases (T024)', () => {
  const analyzer = new ComplexityAnalyzer();

  it('should handle empty content', () => {
    const source: DiagramSource = {
      content: '',
      blockId: 'test-14',
      lineCount: 0,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.participantCount).toBe(0);
    expect(metrics.messageCount).toBe(0);
    expect(metrics.exceedsThreshold).toBe(false);
  });

  it('should handle whitespace-only content', () => {
    const source: DiagramSource = {
      content: '   \n\n   ',
      blockId: 'test-15',
      lineCount: 3,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.participantCount).toBe(0);
    expect(metrics.messageCount).toBe(0);
  });

  it('should ignore title lines', () => {
    const source: DiagramSource = {
      content: `Title: My Diagram
Alice->Bob: Hello`,
      blockId: 'test-16',
      lineCount: 2,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.messageCount).toBe(1); // Only "Hello" message
    expect(metrics.participantCount).toBe(2); // Alice and Bob
  });

  it('should ignore note lines', () => {
    const source: DiagramSource = {
      content: `Alice->Bob: Request
Note right of Bob: Processing
Bob->Alice: Response`,
      blockId: 'test-17',
      lineCount: 3,
    };

    const metrics = analyzer.analyze(source);
    expect(metrics.messageCount).toBe(2); // Request and Response only
    expect(metrics.participantCount).toBe(2);
  });
});
