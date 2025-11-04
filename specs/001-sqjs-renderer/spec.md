# Feature Specification: SQJS Sequence Diagram Renderer

**Feature Branch**: `001-sqjs-renderer`
**Created**: 2025-10-30
**Status**: Draft
**Input**: User description: "Create an obsidian plugin that allows to represent under code blocks ```sqjs and to render them visually using https://bramp.github.io/js-sequence-diagrams/"

## Clarifications

### Session 2025-10-30

- Q: Library distribution strategy (bundled vs CDN)? → A: Bundle library with plugin (self-contained, works offline immediately, larger plugin size ~100-200KB)
- Q: Empty code block behavior (empty or whitespace-only `sqjs` blocks)? → A: Show warning/error message indicating block has no content to render
- Q: Large diagram handling (extremely large diagrams with many participants/messages)? → A: Render with degraded performance warning after threshold (e.g., >15 participants or >50 messages)
- Q: Rapid mode switching behavior (switching between edit/reading mode before rendering completes)? → A: Cancel pending renders and start fresh on each mode switch (prevents resource buildup)
- Q: Diagram copy behavior (when user copies a rendered diagram)? → A: Copy as image (PNG/SVG) - most useful for pasting into docs/slides

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Sequence Diagram Rendering (Priority: P1)

A user writing technical documentation needs to include sequence diagrams to illustrate system interactions. They write sequence diagram notation in a code block marked with `sqjs` and expect to see it rendered as a visual diagram when viewing the note in reading mode.

**Why this priority**: This is the core MVP functionality. Without basic rendering, the plugin has no value. Every other feature depends on this working correctly.

**Independent Test**: Can be fully tested by creating a note with a single `sqjs` code block containing valid sequence diagram syntax, switching to reading mode, and verifying a visual diagram appears. Delivers immediate value by allowing users to view sequence diagrams without external tools.

**Acceptance Scenarios**:

1. **Given** a note in editing mode with a code block marked `sqjs`, **When** the user switches to reading mode, **Then** the code block is replaced with a rendered sequence diagram
2. **Given** a note with multiple `sqjs` code blocks, **When** viewed in reading mode, **Then** each code block renders independently as separate diagrams
3. **Given** a note with valid sequence diagram syntax in a `sqjs` code block, **When** rendered, **Then** all participants, messages, and arrows appear correctly according to the syntax
4. **Given** a rendered sequence diagram, **When** the user switches back to editing mode, **Then** the original `sqjs` code block text is preserved and editable
5. **Given** a `sqjs` code block with more than 15 participants or 50 messages, **When** viewed in reading mode, **Then** the diagram renders with a visible performance warning message
6. **Given** a rendered sequence diagram in reading mode, **When** the user copies the diagram, **Then** it is copied to clipboard as an image (PNG or SVG) that can be pasted into external applications

---

### User Story 2 - Syntax Error Handling (Priority: P2)

A user writes sequence diagram syntax but makes a typo or syntax error. Instead of seeing a broken diagram or nothing at all, they see a clear error message that helps them understand what went wrong and how to fix it.

**Why this priority**: Error handling is critical for user experience but the plugin can function without it. This prevents user frustration and reduces support burden.

**Independent Test**: Can be tested by intentionally creating invalid `sqjs` syntax (missing quotes, invalid keywords, etc.) and verifying helpful error messages appear instead of broken diagrams or silent failures.

**Acceptance Scenarios**:

1. **Given** a `sqjs` code block with invalid syntax, **When** viewed in reading mode, **Then** an error message displays explaining what went wrong
2. **Given** a syntax error in line 5 of a `sqjs` block, **When** the error message is shown, **Then** it indicates the line number where the error occurred
3. **Given** an error in one `sqjs` block in a note with multiple blocks, **When** viewed, **Then** only the invalid block shows an error while other valid blocks render correctly
4. **Given** a `sqjs` block that was previously valid but becomes invalid after editing, **When** switched to reading mode, **Then** the error message appears instead of the last valid rendering
5. **Given** a `sqjs` code block that is empty or contains only whitespace, **When** viewed in reading mode, **Then** a warning message displays: "Empty sequence diagram - no content to render"

---

### User Story 3 - Theme and Style Configuration (Priority: P3)

A user wants their sequence diagrams to match their note aesthetic. They configure the diagram rendering style (simple, hand-drawn) through plugin settings and all diagrams render with the chosen style.

**Why this priority**: Aesthetic customization enhances user satisfaction but isn't required for core functionality. Most users will be satisfied with a sensible default.

**Independent Test**: Can be tested by opening plugin settings, changing the theme option, and verifying all `sqjs` diagrams in all notes re-render with the new style without requiring manual updates.

**Acceptance Scenarios**:

1. **Given** plugin settings with a theme selector, **When** the user selects "simple" theme, **Then** all sequence diagrams render with clean, geometric shapes
2. **Given** plugin settings with "hand-drawn" theme selected, **When** viewing any note with `sqjs` blocks, **Then** diagrams render with sketchy, hand-drawn styling
3. **Given** multiple notes open with rendered diagrams, **When** the theme setting is changed, **Then** all visible diagrams update immediately without refreshing
4. **Given** a user who hasn't configured theme settings, **When** they first install the plugin, **Then** diagrams render with a sensible default theme (simple)

---

### Edge Cases

- What happens when a `sqjs` code block is empty (no content)? → Display warning message: "Empty sequence diagram - no content to render"
- What happens when a `sqjs` code block contains only whitespace or comments? → Display warning message: "Empty sequence diagram - no content to render"
- How does the system handle extremely large diagrams with dozens of participants or hundreds of messages? → Render the diagram with a performance warning displayed when complexity exceeds thresholds (>15 participants or >50 messages)
- What happens when the note contains nested code blocks or the `sqjs` syntax includes triple backticks?
- How does the plugin behave when the bundled js-sequence-diagrams library fails to initialize?
- What happens when a user copies a rendered diagram (does it copy as image, text, or both)? → Copy as image (PNG or SVG format) to clipboard for pasting into external applications
- How does the plugin handle rapid switching between edit and reading mode before rendering completes? → Cancel any pending render operations and start fresh with the current state to prevent resource buildup and race conditions
- What happens when a note has both `sqjs` and other code block types (e.g., `js`, `python`)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Plugin MUST detect code blocks marked with `sqjs` language identifier in Obsidian notes
- **FR-002**: Plugin MUST parse the content of `sqjs` code blocks according to js-sequence-diagrams syntax specification
- **FR-003**: Plugin MUST render detected `sqjs` code blocks as visual sequence diagrams in reading mode
- **FR-004**: Plugin MUST preserve original code block content in editing mode (no modification of source)
- **FR-005**: Plugin MUST support standard sequence diagram syntax elements: participants, messages, arrows, notes, and loops
- **FR-006**: Plugin MUST handle multiple `sqjs` code blocks in a single note independently
- **FR-007**: Plugin MUST display clear error messages when `sqjs` syntax is invalid, including line number if possible
- **FR-008**: Plugin MUST prevent invalid syntax from breaking the rendering of other diagrams in the same note
- **FR-009**: Plugin MUST provide theme/style configuration options in plugin settings (minimum: simple and hand-drawn themes)
- **FR-010**: Plugin MUST apply the selected theme consistently to all diagrams across all notes
- **FR-011**: Plugin MUST render diagrams only in reading mode, leaving code blocks editable in editing mode
- **FR-012**: Plugin MUST integrate with Obsidian's plugin system following standard plugin architecture
- **FR-013**: Plugin MUST gracefully degrade if the rendering library fails to load (show error, don't crash)
- **FR-014**: Plugin MUST handle empty or whitespace-only `sqjs` blocks by displaying a warning message indicating no content to render
- **FR-015**: Plugin MUST bundle the js-sequence-diagrams library to ensure offline-first functionality without external network dependencies
- **FR-016**: Plugin MUST display a performance warning when rendering diagrams that exceed complexity thresholds (>15 participants or >50 messages) while still rendering the diagram
- **FR-017**: Plugin MUST cancel any pending render operations when switching modes (edit to reading or vice versa) and start fresh with the current state to prevent resource buildup and race conditions
- **FR-018**: Plugin MUST support copying rendered diagrams to clipboard as images (PNG or SVG format) for pasting into external applications

### Assumptions

- Users are familiar with basic sequence diagram concepts (participants, messages, ordering)
- Users will refer to js-sequence-diagrams documentation for syntax reference (plugin doesn't need to teach syntax)
- Primary use case is viewing diagrams in reading mode; real-time preview in edit mode is not required for MVP
- Diagrams are primarily for documentation and communication, not for programmatic generation
- The js-sequence-diagrams library will be bundled with the plugin, enabling offline-first functionality without network dependencies
- Obsidian API stability is maintained across minor version updates

### Key Entities

- **SQJS Code Block**: A code block in an Obsidian note with the language identifier `sqjs`, containing sequence diagram notation following js-sequence-diagrams syntax. Attributes include: raw text content, line numbers, position in note, validation state (valid/invalid).

- **Rendered Diagram**: The visual representation of a SQJS Code Block, rendered as SVG or canvas element. Attributes include: visual theme (simple, hand-drawn), dimensions (width, height), participant count, message count, rendering state (success, error, pending).

- **Theme Configuration**: User-selected styling preference stored in plugin settings. Attributes include: theme name (simple, hand-drawn, etc.), apply globally flag, theme-specific options (colors, fonts, etc. if supported by library).

- **Error Message**: Information displayed when a SQJS Code Block contains invalid syntax. Attributes include: error type, line number, description, suggested fix (if applicable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and view sequence diagrams in reading mode without leaving Obsidian or using external tools
- **SC-002**: Sequence diagrams render within 2 seconds for diagrams with up to 10 participants and 20 messages
- **SC-003**: 95% of valid js-sequence-diagrams syntax renders correctly without errors
- **SC-004**: Users can identify and fix syntax errors within 30 seconds using error messages (reduces trial-and-error time)
- **SC-005**: Theme changes apply to all diagrams in under 3 seconds across a vault with 100+ notes
- **SC-006**: Plugin installs and activates successfully on 95% of Obsidian installations (desktop: Windows, Mac, Linux)
- **SC-007**: Users can switch between editing and reading mode 10 times without diagram rendering degradation, errors, or resource accumulation (memory leaks)
- **SC-008**: Multiple `sqjs` blocks in a single note (up to 5 diagrams) render independently without affecting each other's output

## Constraints

- Plugin must be compatible with Obsidian API version 1.0.0 or later
- Plugin must not modify user's note content (read-only transformation for display)
- Plugin must not require external services or network requests (library bundled, no CDN dependencies)
- Plugin must work in offline mode from first installation (no internet required)
- Rendering must not block Obsidian UI or cause performance degradation with typical usage (1-5 diagrams per note)

## Dependencies

- **js-sequence-diagrams library**: Required for rendering sequence diagrams (https://bramp.github.io/js-sequence-diagrams/). Library will be bundled with the plugin to ensure offline-first functionality.
- **Obsidian Plugin API**: Required for detecting code blocks, rendering in reading mode, and providing settings UI
- **Obsidian CodeMirror integration**: Required for detecting `sqjs` language identifier in code blocks

## Out of Scope

The following are explicitly excluded from this feature:

- Real-time preview in editing mode (may be future enhancement)
- Custom syntax extensions beyond js-sequence-diagrams specification
- Export diagrams as standalone image files (Obsidian's screenshot/export handles this)
- Collaborative editing of diagrams with conflict resolution
- Animation or interactive sequence playback
- Integration with other diagram types (flowcharts, UML class diagrams, etc.)
- Syntax highlighting for `sqjs` code blocks in editing mode
- Auto-completion or intellisense for sequence diagram syntax
- Diagram versioning or history tracking beyond Obsidian's file history
