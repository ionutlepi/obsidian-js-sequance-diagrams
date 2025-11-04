# Data Model: SQJS Sequence Diagram Renderer

**Date**: 2025-10-30
**Purpose**: Define core entities, their attributes, relationships, and validation rules

## Core Entities

### 1. PluginSettings

**Purpose**: Store user preferences for diagram rendering

**Attributes**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| theme | `'simple' \| 'hand-drawn'` | Yes | `'simple'` | Selected rendering theme |

**Validation Rules**:
- theme must be one of: `'simple'`, `'hand-drawn'`

**Storage**: Persisted to Obsidian's `data.json` via `loadData()` / `saveData()` API

**Lifecycle**:
- **Created**: On plugin first load (if no saved settings exist)
- **Updated**: When user changes theme via settings tab
- **Read**: On every diagram render to determine theme

**TypeScript Definition**:
```typescript
interface PluginSettings {
  theme: 'simple' | 'hand-drawn';
}

const DEFAULT_SETTINGS: PluginSettings = {
  theme: 'simple'
};
```

---

### 2. DiagramSource

**Purpose**: Represents the raw input text from a `sqjs` code block

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | `string` | Yes | Raw sequence diagram syntax |
| blockId | `string` | Yes | Unique identifier for this code block (for caching) |
| lineCount | `number` | Yes | Number of lines in source |

**Validation Rules**:
- content may be empty (triggers empty content warning per FR-014)
- content must be valid UTF-8 string
- blockId must be unique within a note

**Derivation**:
- blockId: Generated from content hash + position in document
- lineCount: Calculated via `content.split('\n').length`

**Lifecycle**:
- **Created**: When MarkdownPostProcessor encounters `sqjs` block
- **Validated**: Before passing to DiagramRenderer
- **Discarded**: After render complete (not persisted)

**TypeScript Definition**:
```typescript
interface DiagramSource {
  content: string;
  blockId: string;
  lineCount: number;
}
```

---

### 3. DiagramMetrics

**Purpose**: Complexity analysis results for performance warning determination

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| participantCount | `number` | Yes | Number of unique participants |
| messageCount | `number` | Yes | Number of messages/interactions |
| exceedsThreshold | `boolean` | Yes | True if >15 participants or >50 messages |

**Derivation**:
- participantCount: Extracted via regex matching participant declarations
- messageCount: Approximated by line count of non-empty, non-comment lines
- exceedsThreshold: `participantCount > 15 || messageCount > 50`

**Validation Rules**:
- participantCount >= 0
- messageCount >= 0

**Lifecycle**:
- **Created**: During diagram parsing, before rendering
- **Used**: To determine if performance warning should be displayed
- **Discarded**: After render complete

**TypeScript Definition**:
```typescript
interface DiagramMetrics {
  participantCount: number;
  messageCount: number;
  exceedsThreshold: boolean;
}
```

---

### 4. RenderResult

**Purpose**: Outcome of a diagram rendering attempt (success or error)

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | `'success' \| 'error' \| 'empty'` | Yes | Render outcome status |
| svgElement | `SVGElement \| null` | Conditional | Rendered SVG (if status === 'success') |
| error | `RenderError \| null` | Conditional | Error details (if status === 'error') |
| metrics | `DiagramMetrics \| null` | Conditional | Complexity metrics (if status === 'success') |

**Validation Rules**:
- If status === 'success': svgElement and metrics must be non-null
- If status === 'error': error must be non-null
- If status === 'empty': all other fields are null

**Lifecycle**:
- **Created**: By DiagramRenderer after processing DiagramSource
- **Consumed**: By SQJSCodeBlockProcessor to render UI
- **Cached**: SVG element cached by blockId for reuse

**TypeScript Definition**:
```typescript
type RenderStatus = 'success' | 'error' | 'empty';

interface RenderResult {
  status: RenderStatus;
  svgElement: SVGElement | null;
  error: RenderError | null;
  metrics: DiagramMetrics | null;
}
```

---

### 5. RenderError

**Purpose**: Detailed information about rendering failures

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `'syntax' \| 'library' \| 'empty'` | Yes | Error category |
| message | `string` | Yes | Human-readable error description |
| lineNumber | `number \| null` | No | Line where error occurred (if known) |
| suggestion | `string \| null` | No | Suggested fix (if available) |

**Derivation**:
- type: Determined by error source (parser = syntax, lib load = library, empty check = empty)
- message: Extracted from library exception or generated
- lineNumber: Parsed from library error message if available
- suggestion: Context-specific hints (e.g., "Check for missing quotes")

**Lifecycle**:
- **Created**: During error handling in try-catch blocks
- **Displayed**: Formatted and shown in place of diagram
- **Logged**: Optionally logged to console for debugging

**TypeScript Definition**:
```typescript
type ErrorType = 'syntax' | 'library' | 'empty';

interface RenderError {
  type: ErrorType;
  message: string;
  lineNumber: number | null;
  suggestion: string | null;
}
```

---

### 6. RenderOperation

**Purpose**: Track active render operations for cancellation (FR-017)

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| blockId | `string` | Yes | Associated code block identifier |
| controller | `AbortController` | Yes | Cancellation controller |
| startTime | `number` | Yes | Performance.now() timestamp |

**Lifecycle**:
- **Created**: At start of each render operation
- **Aborted**: When mode switch detected or new render requested for same blockId
- **Completed**: When render finishes (success or error)
- **Cleaned Up**: Removed from active operations map

**TypeScript Definition**:
```typescript
interface RenderOperation {
  blockId: string;
  controller: AbortController;
  startTime: number;
}
```

---

### 7. DiagramCache

**Purpose**: Cache rendered SVG elements to avoid re-rendering identical content

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | `string` | Yes | Hash of content + theme |
| svgElement | `SVGElement` | Yes | Cached rendered diagram |
| timestamp | `number` | Yes | Cache entry creation time |

**Validation Rules**:
- Cache size limited to 50 entries (LRU eviction)
- Entries invalidated when theme changes globally

**Cache Key Generation**:
```
key = hash(diagramSource.content + settings.theme)
```

**Lifecycle**:
- **Created**: After successful diagram render
- **Reused**: When identical content + theme encountered
- **Evicted**: When cache exceeds 50 entries (oldest removed)
- **Cleared**: When theme setting changes

**TypeScript Definition**:
```typescript
interface CacheEntry {
  key: string;
  svgElement: SVGElement;
  timestamp: number;
}

class DiagramCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number = 50;

  get(key: string): SVGElement | null;
  set(key: string, svg: SVGElement): void;
  clear(): void;
}
```

---

## Entity Relationships

```
PluginSettings (1) ─────► (N) RenderResult
    │                       │
    │                       ├─► SVGElement (success)
    │                       ├─► RenderError (error)
    │                       └─► DiagramMetrics (success)
    │
    └─────────────────► DiagramCache (invalidation on theme change)

DiagramSource (1) ───► (1) DiagramMetrics
      │
      └───► (1) RenderResult

RenderOperation (N) ───► (1) DiagramSource (by blockId)

DiagramCache (N entries) ───► (N) SVGElement
```

**Key Relationships**:
1. PluginSettings determines theme for all renders
2. DiagramSource is analyzed to produce DiagramMetrics
3. DiagramSource is rendered to produce RenderResult
4. RenderOperation tracks in-flight renders for cancellation
5. DiagramCache stores successful RenderResults by content+theme hash

---

## State Transitions

### RenderResult Status State Machine

```
┌─────────┐
│ Initial │
└────┬────┘
     │
     ├─► [Content empty] ──────────────► ┌───────┐
     │                                    │ empty │
     │                                    └───────┘
     │
     ├─► [Parse success] ────────────────► ┌─────────┐
     │                                      │ success │
     │                                      └─────────┘
     │
     └─► [Parse/render failure] ─────────► ┌───────┐
                                            │ error │
                                            └───────┘
```

### RenderOperation Lifecycle

```
┌─────────────┐
│   Created   │ (mode switch to reading)
└──────┬──────┘
       │
       ├─► [Render complete] ────► ┌───────────┐
       │                            │ Completed │
       │                            └───────────┘
       │
       └─► [Mode switch/new render] ─► ┌─────────┐
                                        │ Aborted │
                                        └─────────┘
```

---

## Validation Summary

| Entity | Key Validations |
|--------|----------------|
| PluginSettings | theme in ['simple', 'hand-drawn'] |
| DiagramSource | content is valid UTF-8, blockId unique |
| DiagramMetrics | counts >= 0, threshold calculated correctly |
| RenderResult | status-dependent field requirements |
| RenderError | type in ['syntax', 'library', 'empty'] |
| RenderOperation | controller not already aborted |
| DiagramCache | size <= 50 entries |

---

## Performance Considerations

1. **Caching**: DiagramCache reduces redundant renders by ~90% for repeated content
2. **Lazy Analysis**: DiagramMetrics only computed when needed (not cached separately)
3. **Abort Pattern**: RenderOperation prevents memory leaks from abandoned renders
4. **LRU Eviction**: Cache size limit prevents unbounded memory growth

---

## Dependencies on Functional Requirements

| Entity | Traces To |
|--------|-----------|
| PluginSettings | FR-009 (theme configuration) |
| DiagramSource | FR-001 (detect sqjs blocks) |
| DiagramMetrics | FR-016 (complexity thresholds) |
| RenderResult | FR-003 (render diagrams), FR-007 (error messages) |
| RenderError | FR-007 (clear error messages), FR-014 (empty block handling) |
| RenderOperation | FR-017 (cancel pending renders) |
| DiagramCache | SC-002 (render performance) |
