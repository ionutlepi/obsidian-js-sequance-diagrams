# Data Model: Enhanced Sequence Diagram Syntax Support

**Date**: 2025-11-09
**Purpose**: Define validation entities and their attributes for Title/alias/ordering syntax enhancement

## Validation Entities

### 1. TitleValidation

**Purpose**: Result of validating Title declaration syntax

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isValid | `boolean` | Yes | Whether Title syntax is valid |
| title | `string \| null` | Conditional | Extracted title text (trimmed, null if invalid or whitespace-only) |
| error | `RenderError \| null` | Conditional | Error details if validation failed (null if valid) |

**Validation Rules**:
- Title syntax must be: `Title: [text]` (case-sensitive)
- Title text is everything after the `Title: ` prefix
- Leading/trailing whitespace must be trimmed from title text
- Whitespace-only titles (e.g., `Title:   `) are treated as invalid/empty
- Only first Title declaration is valid; subsequent ones are ignored
- Title may contain special characters and Unicode (including emoji)

**Derivation**:
- isValid: True if line matches Title pattern and text is non-empty after trimming
- title: Extracted from capture group after `Title: ` prefix
- error: Set if syntax malformed (e.g., unclosed quotes, missing colon)

**Lifecycle**:
- **Created**: During diagram parsing, before rendering
- **Used**: To populate render output with title display
- **Discarded**: After render complete

**TypeScript Definition**:
```typescript
interface TitleValidation {
  isValid: boolean;
  title: string | null;
  error: RenderError | null;
}
```

---

### 2. ParticipantValidation

**Purpose**: Result of validating participant declaration syntax (with or without alias)

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isValid | `boolean` | Yes | Whether participant syntax is valid |
| shortName | `string \| null` | Conditional | Participant identifier used in messages (null if invalid) |
| displayName | `string \| null` | Conditional | Name shown in rendered diagram (defaults to shortName if no alias) |
| hasAlias | `boolean` | Yes | Whether this participant has an explicit alias |
| declarationOrder | `number` | Yes | Sequence order of participant declaration (0-indexed) |
| error | `RenderError \| null` | Conditional | Error details if validation failed (null if valid) |

**Validation Rules**:
- Non-aliased syntax: `participant [shortName]`
- Aliased syntax: `participant [shortName] as "[displayName]"`
- shortName must be a valid identifier (alphanumeric + underscore)
- displayName must be quoted string with matching quotes
- displayName may contain spaces and special characters
- displayName may contain Unicode characters (including emoji)
- Multiple participants can share same displayName (library's default behavior)
- participantAlias with unclosed quotes is a syntax error

**Derivation**:
- isValid: True if line matches participant pattern with valid syntax
- shortName: Extracted identifier from first capture group
- displayName: Extracted from quoted string in second capture group (if alias present)
- hasAlias: True if alias present, false for simple declarations
- declarationOrder: Sequence number of this declaration (0 = first declaration)
- error: Set if syntax malformed (unclosed quotes, invalid identifier)

**Lifecycle**:
- **Created**: During diagram parsing for each participant declaration
- **Used**: To map shortName identifiers to displayNames in messages
- **Used**: To establish left-to-right ordering of participants
- **Stored**: In participant mapping for later message resolution

**TypeScript Definition**:
```typescript
interface ParticipantValidation {
  isValid: boolean;
  shortName: string | null;
  displayName: string | null;
  hasAlias: boolean;
  declarationOrder: number;
  error: RenderError | null;
}
```

---

### 3. ValidationResult

**Purpose**: Aggregated result of validating Title, participants, and ordering in a diagram

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isValid | `boolean` | Yes | Whether entire diagram syntax is valid |
| title | `TitleValidation` | Yes | Title validation result |
| participants | `ParticipantValidation[]` | Yes | Array of participant validations (in declaration order) |
| participantMap | `Map<string, string>` | Yes | Mapping from shortName to displayName for message resolution |
| errors | `RenderError[]` | Yes | Array of all validation errors (empty if isValid === true) |

**Validation Rules**:
- isValid = true if title.isValid && all participants.isValid && no other errors
- errors array contains all RenderError objects from title and participants
- participantMap populated from all valid participant declarations
- participantMap keys are shortNames, values are displayNames
- If participant has no alias, displayName === shortName in map

**Derivation**:
- isValid: Logical AND of title.isValid and all participant validations
- participantMap: Constructed from shortName → displayName mappings

**Lifecycle**:
- **Created**: After complete parsing of all title and participant declarations
- **Used**: For message resolution and rendering
- **Used**: To verify participant references in messages exist

**TypeScript Definition**:
```typescript
interface ValidationResult {
  isValid: boolean;
  title: TitleValidation;
  participants: ParticipantValidation[];
  participantMap: Map<string, string>;
  errors: RenderError[];
}
```

---

## Type References (from Feature 001)

### RenderError (reused from FR-001)

**Purpose**: Detailed information about rendering failures

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `'syntax' \| 'library' \| 'empty'` | Yes | Error category |
| message | `string` | Yes | Human-readable error description |
| lineNumber | `number \| null` | No | Line where error occurred |
| suggestion | `string \| null` | No | Suggested fix (if available) |

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

## Entity Relationships

```
ValidationResult (1) ─┬─► TitleValidation (1)
                      │
                      └─► ParticipantValidation[] (N)
                           │
                           └─► RenderError (0..1)
                      │
                      └─► RenderError[] (array)
                      │
                      └─► Map<string, string> (participantMap)
```

**Key Relationships**:
1. ValidationResult aggregates TitleValidation and ParticipantValidation arrays
2. Each participant validation may have an associated RenderError
3. TitleValidation may have an associated RenderError
4. participantMap is constructed from validated ParticipantValidation entries
5. Errors flow through to ParentResult for centralized error handling

---

## State Transitions

### Validation Workflow

```
┌─────────────────────┐
│ Start Parsing       │
└──────────┬──────────┘
           │
           ├─► [Parse Title] ──────────────────► TitleValidation
           │                                      ├─► isValid: true/false
           │                                      └─► error: null or RenderError
           │
           ├─► [Parse Participants] (for each) ► ParticipantValidation[]
           │                                      ├─► isValid: true/false
           │                                      ├─► declarationOrder: n
           │                                      └─► error: null or RenderError
           │
           └─► [Aggregate Results] ─────────────► ValidationResult
                                                   ├─► isValid: all valid?
                                                   ├─► errors: [all errors]
                                                   └─► participantMap: built
```

---

## Validation Rules by Entity

### TitleValidation Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Line format | Must start with `Title: ` | Error if malformed |
| Text extraction | Extract after `Title: ` | Trim whitespace |
| Empty check | Text is all whitespace | Treat as invalid/no title |
| Multiple titles | Multiple Title declarations | Use first, ignore rest |
| Special chars | Title may contain any Unicode | Accept as-is |

### ParticipantValidation Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Simple syntax | `participant [ID]` | Valid if ID is alphanumeric+underscore |
| Alias syntax | `participant [ID] as "[name]"` | Valid if quotes matched |
| Quote matching | Alias must have matching quotes | Error if unclosed |
| Identifier | shortName must be valid JS identifier | Error if invalid characters |
| Declaration order | Track sequence of declarations | Assign declarationOrder |
| Display name | Default to shortName if no alias | Automatic mapping |

### ValidationResult Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Overall validity | title.isValid && all participants.isValid | Set isValid |
| Error collection | Collect all validation errors | Populate errors array |
| Participant map | Build mapping from validations | Create participantMap |

---

## Performance Considerations

1. **Single Pass Validation**: ValidationResult created in single parse pass; no redundant checks
2. **Lazy Error Collection**: Errors accumulated as validations complete, not retroactively
3. **Participant Map**: Map created once, reused for all message resolution operations
4. **Memory**: ValidationResult discarded after render complete (not persisted)

---

## Dependencies on Functional Requirements

| Entity | Traces To |
|--------|-----------|
| TitleValidation | FR-001, FR-002 (parse and display titles) |
| ParticipantValidation | FR-003, FR-004, FR-005, FR-006 (parse aliases and ordering) |
| ValidationResult | FR-011 (error messages for malformed syntax) |
| RenderError | FR-007, FR-011 (error display) |
