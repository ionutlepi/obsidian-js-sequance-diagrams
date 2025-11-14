# Feature Specification: Enhanced Sequence Diagram Syntax Support

**Feature Branch**: `002-title-alias-support`
**Created**: 2025-11-07
**Status**: Draft
**Input**: User description: "The diagrams must also support syntax for title and aliasing the actors using the js-sequance-diagram spec"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Diagram Titles (Priority: P1)

A user creating documentation needs to add descriptive titles to their sequence diagrams to provide context. They write `Title: Login Flow` at the beginning of their sqjs code block and expect to see the title displayed prominently above the rendered diagram.

**Why this priority**: Titles are essential for documentation clarity and are already part of the js-sequence-diagrams syntax specification. Without proper title support, users cannot create self-documenting diagrams that are easy to understand in larger documents.

**Independent Test**: Can be fully tested by creating a sqjs code block with `Title: Test Diagram` as the first line, switching to reading mode, and verifying the title appears above the diagram. Delivers immediate value by allowing users to label their diagrams without external annotations.

**Acceptance Scenarios**:

1. **Given** a sqjs code block starting with `Title: User Authentication`, **When** viewed in reading mode, **Then** the text "User Authentication" appears as a title above the diagram
2. **Given** a sqjs code block with no Title declaration, **When** viewed in reading mode, **Then** the diagram renders without a title and no error is shown
3. **Given** a sqjs code block with `Title:` followed by special characters (e.g., `Title: API Flow (v2.0)`), **When** viewed in reading mode, **Then** the title displays correctly with all special characters preserved
4. **Given** multiple sqjs diagrams in one note, each with different titles, **When** viewed in reading mode, **Then** each diagram shows its own title correctly without interference
5. **Given** a sqjs code block with `Title:` on a line followed by diagram syntax, **When** the title text is very long (>100 characters), **Then** the title wraps appropriately and remains readable

---

### User Story 2 - Participant Aliasing (Priority: P2)

A user documenting a complex system interaction needs to use shortened identifiers in the diagram syntax while displaying full, descriptive names in the rendered diagram. They use participant aliasing syntax like `participant DB as "User Database"` to map short codes to readable names.

**Why this priority**: Participant aliasing reduces syntax verbosity in complex diagrams while maintaining readability in the visual output. This is particularly valuable for diagrams with long service names or when following naming conventions that require abbreviated identifiers in code.

**Independent Test**: Can be tested by creating a sqjs code block with `participant A as "Authentication Service"` followed by messages using `A->B: Login`, switching to reading mode, and verifying "Authentication Service" appears in the diagram while the syntax uses the short form `A`.

**Acceptance Scenarios**:

1. **Given** a sqjs code block with `participant A as "Alice"`, **When** messages reference `A` (e.g., `A->B: Hello`), **Then** the rendered diagram shows "Alice" as the participant name
2. **Given** multiple participant aliases (e.g., `participant DB as "Database"`, `participant API as "API Gateway"`), **When** viewed in reading mode, **Then** all aliases display their full names correctly in the diagram
3. **Given** a participant declaration without an alias (e.g., `participant Bob`), **When** viewed alongside aliased participants, **Then** both aliased and non-aliased participants render correctly
4. **Given** a participant alias with quoted text containing special characters (e.g., `participant SVC as "Payment Service (v2)"`), **When** viewed in reading mode, **Then** the full name including special characters displays correctly
5. **Given** a message referencing an undeclared participant (e.g., `Charlie->David: Message` without prior `participant` declaration), **When** viewed in reading mode, **Then** the diagram renders with auto-generated participant names and no error is shown
6. **Given** a participant declared but never used in messages, **When** viewed in reading mode, **Then** the participant appears in the diagram with no messages

---

### User Story 3 - Participant Ordering (Priority: P3)

A user creating a sequence diagram needs to control the left-to-right order of participants to match their system architecture or logical flow. They declare participants in their desired order using `participant` statements before defining messages.

**Why this priority**: Participant ordering improves diagram clarity by allowing users to arrange actors in a logical sequence (e.g., User → Frontend → Backend → Database) rather than relying on automatic ordering based on first appearance in messages.

**Independent Test**: Can be tested by creating a sqjs code block with participant declarations in a specific order (e.g., `participant C`, `participant B`, `participant A`) followed by messages, and verifying the diagram displays participants in the declared order rather than alphabetical or message-order.

**Acceptance Scenarios**:

1. **Given** a sqjs code block with participants declared as `participant C`, `participant B`, `participant A`, **When** viewed in reading mode, **Then** the diagram shows participants in the order C, B, A from left to right
2. **Given** a mix of declared and undeclared participants (e.g., `participant Z` declared, then `A->B: Message` using undeclared participants), **When** viewed in reading mode, **Then** declared participants appear first in declaration order, followed by undeclared participants in appearance order
3. **Given** participant declarations combined with aliases (e.g., `participant SVC as "Service"`, `participant DB as "Database"` in that order), **When** viewed in reading mode, **Then** participants appear in the declared order with their aliased names
4. **Given** a diagram with only messages and no explicit participant declarations, **When** viewed in reading mode, **Then** participants appear in the order they first appear in messages (existing behavior preserved)

---

### Edge Cases

- What happens when a title contains only whitespace (e.g., `Title:   `)? → Treat as no title, render diagram without title header (FR-014)
- What happens when multiple `Title:` declarations exist in one diagram? → Use the first Title declaration, ignore subsequent ones (FR-015)
- What happens when a participant alias is empty (e.g., `participant A as ""`)? → Display syntax error indicating empty aliases are not allowed (FR-017)
- What happens when a participant alias uses the same name as an existing participant (e.g., `participant A as "Alice"` and `participant Alice`)? → Render both participants separately with their respective names (library's default behavior)
- How does the system handle participant aliases with unclosed quotes (e.g., `participant A as "Alice`)? → Display syntax error with helpful message indicating unclosed quote (FR-011)
- What happens when a Title or participant alias contains emoji or Unicode characters? → Render correctly preserving all Unicode characters (FR-012)
- How does the plugin handle very long participant alias names (>50 characters)? → Display full name with text wrapping if needed based on diagram width
- What happens when participant order conflicts with message flow (e.g., declaring `participant B` before `participant A` but messages go `A->B`)? → Honor declared order, render participants in declaration order regardless of message flow (FR-007)
- What happens when Title appears on line 3 after blank lines? → Title is recognized if it's on first non-empty line (FR-001)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Plugin MUST recognize and parse `Title: [text]` syntax (case-insensitive) on the first non-empty line of sqjs code blocks
- **FR-002**: Plugin MUST display the title text above the rendered sequence diagram when Title syntax is present
- **FR-003**: Plugin MUST support participant alias syntax `participant [short-name] as "[display-name]"`
- **FR-004**: Plugin MUST render aliased participant names using their display names in the visual diagram
- **FR-005**: Plugin MUST allow messages to reference participants by their short-name identifiers when aliases are defined
- **FR-006**: Plugin MUST support explicit participant ordering via `participant [name]` declarations
- **FR-007**: Plugin MUST render participants in the order they are declared when explicit participant statements are present
- **FR-008**: Plugin MUST preserve existing behavior for diagrams without Title or participant declarations (backward compatibility)
- **FR-009**: Plugin MUST handle quoted strings in participant aliases, including strings with spaces and special characters
- **FR-010**: Plugin MUST support mixing aliased and non-aliased participants in the same diagram
- **FR-011**: Plugin MUST validate participant alias syntax and display helpful error messages for malformed declarations
- **FR-012**: Plugin MUST support Unicode characters (including emoji) in titles and participant aliases
- **FR-013**: Plugin MUST trim leading/trailing whitespace from title text and participant names
- **FR-014**: Plugin MUST ignore empty Title declarations (Title: with only whitespace)
- **FR-015**: Plugin MUST handle multiple Title declarations by using only the first one
- **FR-016**: Plugin MUST cache validation results keyed by diagram source hash to avoid re-validation when diagram content is unchanged
- **FR-017**: Plugin MUST treat empty participant aliases (e.g., `participant A as ""`) as syntax errors and display helpful error messages

### Assumptions

- Users are familiar with basic js-sequence-diagrams syntax (participant declarations, message syntax)
- Users will reference the js-sequence-diagrams documentation for advanced syntax examples
- The bundled js-sequence-diagrams library (v2.0.1) already includes parser support for Title and participant syntax
- Titles and participant declarations are optional enhancements; diagrams without them should continue to work
- Participant alias display names will typically be short enough to fit in standard diagram widths (plugin doesn't control line wrapping in rendered SVG)

### Key Entities

- **Title Declaration**: A syntax element at the start of a diagram: `Title: [text]` (case-insensitive). Attributes: title text (string, trimmed), position (first non-empty line of diagram). Validation: must be on its own line, text is everything after "Title:" prefix, keyword is case-insensitive.

- **Participant Declaration**: A syntax element defining a participant: `participant [short-name]` or `participant [short-name] as "[display-name]"`. Attributes: short-name (identifier used in messages), display-name (text shown in diagram, defaults to short-name if no alias), declaration order (integer for ordering). Validation: display-name cannot be empty string.

- **Participant Alias Mapping**: The relationship between a short-name identifier and its display-name. Used during message parsing to substitute short-names with full display-names in the rendered output.

- **Validation Cache**: A hash-keyed cache mapping diagram source content to validation results. Prevents redundant re-validation when diagram content is unchanged between renders. Cache key is computed from diagram source text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add titles to diagrams that display prominently above the rendered output
- **SC-002**: Users can reduce diagram syntax verbosity by at least 30% in complex diagrams with long participant names using aliases
- **SC-003**: 100% of valid js-sequence-diagrams Title and participant syntax renders correctly without errors
- **SC-004**: Users can control participant ordering in 100% of cases where explicit participant declarations are used
- **SC-005**: Existing diagrams without Title or participant declarations continue to render identically (0% regression)
- **SC-006**: Syntax errors in Title or participant declarations provide clear error messages indicating the specific problem within 2 seconds
- **SC-007**: Diagrams with titles and aliases render within the same performance targets as basic diagrams (<2s for diagrams with ≤10 participants)

## Constraints

- Must maintain backward compatibility with existing sqjs diagrams that don't use Title or participant syntax
- Title and participant syntax must follow js-sequence-diagrams specification exactly (no custom extensions)
- Plugin must not modify the underlying js-sequence-diagrams library parsing logic
- Performance must not degrade for diagrams using these features compared to basic diagrams

## Dependencies

- **js-sequence-diagrams library v2.0.1**: Must confirm library includes parser support for Title and participant alias syntax
- **Existing SQJS plugin**: This feature enhances the existing rendering plugin (feature 001-sqjs-renderer)
- **DiagramParser module**: May need updates to validate Title and participant syntax before passing to renderer

## Out of Scope

The following are explicitly excluded from this feature:

- Custom title styling beyond what js-sequence-diagrams library provides (font size, color, position)
- Participant grouping or swimlanes
- Conditional participant declarations based on message flow
- Multi-line titles or title formatting (bold, italic, etc.)
- Participant icons or avatars
- Dynamic participant naming based on note metadata
- Export of participant alias mappings for reuse across diagrams
- Validation of participant name uniqueness (library handles conflicts)
- Custom ordering rules beyond explicit declaration order
