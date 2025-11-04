/**
 * Type definitions for SQJS Sequence Diagram Renderer
 * Based on data-model.md
 */

// Plugin Settings
export interface PluginSettings {
  theme: 'simple' | 'hand-drawn';
}

export const DEFAULT_SETTINGS: PluginSettings = {
  theme: 'simple'
};

// Diagram Source
export interface DiagramSource {
  content: string;
  blockId: string;
  lineCount: number;
}

// Diagram Metrics
export interface DiagramMetrics {
  participantCount: number;
  messageCount: number;
  exceedsThreshold: boolean;
}

// Render Error
export type ErrorType = 'syntax' | 'library' | 'empty';

export interface RenderError {
  type: ErrorType;
  message: string;
  lineNumber: number | null;
  suggestion: string | null;
}

// Render Result
export type RenderStatus = 'success' | 'error' | 'empty';

export interface RenderResult {
  status: RenderStatus;
  svgElement: SVGElement | null;
  error: RenderError | null;
  metrics: DiagramMetrics | null;
}

// Render Operation
export interface RenderOperation {
  blockId: string;
  controller: AbortController;
  startTime: number;
}

// Diagram Cache Entry
export interface CacheEntry {
  key: string;
  svgElement: SVGElement;
  timestamp: number;
}

// Validation Types (User Story 2)
export interface ValidationError {
  message: string;
  lineNumber: number | null;
  suggestion: string;
}

export interface ValidationWarning {
  message: string;
  lineNumber: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  isEmpty: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
