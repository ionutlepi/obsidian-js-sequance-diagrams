# Tasks: SQJS Sequence Diagram Renderer

**Input**: Design documents from `/specs/001-sqjs-renderer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Following TDD (Test-First Development) as mandated by project constitution. All test tasks precede implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single Obsidian plugin**: `src/`, `tests/` at repository root
- Paths shown below use plugin project structure from plan.md

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure and configuration

- [X] T001 Create project directory structure per plan.md (src/, tests/, src/renderer/, src/processors/, src/utils/, src/lib/, tests/integration/, tests/unit/, tests/fixtures/)
- [X] T002 Initialize package.json with Obsidian plugin metadata and dependencies
- [X] T003 [P] Install TypeScript 5.x and configure tsconfig.json targeting ES2018
- [X] T004 [P] Install and configure esbuild in esbuild.config.mjs for plugin bundling
- [X] T005 [P] Install Vitest and @testing-library/dom for testing
- [X] T006 [P] Install Obsidian API type definitions (obsidian package)
- [X] T007 Install js-sequence-diagrams@2.0.1 library dependency
- [X] T008 [P] Create manifest.json with plugin metadata (id, name, version, minAppVersion: 1.0.0)
- [X] T009 [P] Create .gitignore for node_modules, dist, main.js build artifacts
- [X] T010 [P] Configure Vitest in vitest.config.ts with happy-dom environment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create TypeScript type definitions file src/types.ts with PluginSettings, DiagramSource, DiagramMetrics, RenderResult, RenderError, RenderOperation interfaces from data-model.md
- [X] T012 [P] Create contract interface src/contracts/IDiagramRenderer.ts
- [X] T013 [P] Create contract interface src/contracts/IThemeManager.ts
- [X] T014 [P] Create contract interface src/contracts/IErrorDisplay.ts
- [X] T015 [P] Create contract interface src/contracts/ISQJSCodeBlockProcessor.ts
- [X] T016 [P] Create contract interface src/contracts/IClipboardHandler.ts
- [X] T017 Create plugin entry point src/main.ts with basic Plugin class extending Obsidian Plugin
- [X] T018 Implement plugin onload() method in src/main.ts to register markdown code block processor for 'sqjs'
- [X] T019 Implement plugin onunload() method in src/main.ts to clean up resources

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Sequence Diagram Rendering (Priority: P1) 🎯 MVP

**Goal**: Users can write `sqjs` code blocks and see rendered sequence diagrams in reading mode

**Independent Test**: Create a note with `sqjs` code block, switch to reading mode, verify diagram renders. Test with multiple blocks to ensure independence.

### Tests for User Story 1 (TDD - Write FIRST, ensure FAIL before implementation)

- [X] T020 [P] [US1] Create test fixtures in tests/fixtures/sample-diagrams.ts with valid sequence diagram syntax samples
- [X] T021 [P] [US1] Write integration test in tests/integration/rendering.test.ts for basic diagram rendering (should FAIL initially)
- [X] T022 [P] [US1] Write integration test in tests/integration/rendering.test.ts for multiple independent diagrams in same note (should FAIL initially)
- [X] T023 [P] [US1] Write unit test in tests/unit/DiagramRenderer.test.ts for render() method contract compliance (should FAIL initially)
- [X] T024 [P] [US1] Write unit test in tests/unit/ComplexityAnalyzer.test.ts for participant and message counting (should FAIL initially)
- [X] T025 [P] [US1] Write integration test in tests/integration/rendering.test.ts for performance warning on large diagrams (>15 participants or >50 messages) (should FAIL initially)
- [X] T026 [P] [US1] Write integration test for clipboard copy functionality copying diagram as PNG/SVG image (should FAIL initially)

### Implementation for User Story 1

- [X] T027 [P] [US1] Implement ComplexityAnalyzer class in src/utils/ComplexityAnalyzer.ts to count participants and messages
- [X] T028 [P] [US1] Implement RenderCancellation class in src/utils/RenderCancellation.ts using AbortController for operation management
- [X] T029 [US1] Implement DiagramRenderer class in src/renderer/DiagramRenderer.ts implementing IDiagramRenderer contract
- [X] T030 [US1] Add render() method to DiagramRenderer integrating js-sequence-diagrams library
- [X] T031 [US1] Add analyzeComplexity() method to DiagramRenderer using ComplexityAnalyzer
- [X] T032 [US1] Add clearCache() method to DiagramRenderer implementing LRU cache with 50-entry limit
- [X] T033 [US1] Implement SQJSCodeBlockProcessor class in src/processors/SQJSCodeBlockProcessor.ts implementing ISQJSCodeBlockProcessor contract
- [X] T034 [US1] Add process() method to SQJSCodeBlockProcessor to handle sqjs code block rendering with blockId generation
- [X] T035 [US1] Add cancelAllRenders() method to SQJSCodeBlockProcessor for cleanup on mode switch
- [X] T036 [US1] Integrate RenderCancellation into SQJSCodeBlockProcessor to cancel pending operations on mode switch
- [X] T037 [P] [US1] Implement performance warning display in ErrorDisplay for diagrams exceeding thresholds
- [X] T038 [P] [US1] Implement ClipboardHandler class in src/utils/ClipboardHandler.ts implementing IClipboardHandler contract
- [X] T039 [US1] Add copyDiagramAsImage() method to ClipboardHandler converting SVG to PNG and copying to clipboard
- [X] T040 [US1] Add addCopyButton() method to ClipboardHandler creating hover-activated copy button overlay
- [X] T041 [US1] Wire up SQJSCodeBlockProcessor in src/main.ts onload() with registerMarkdownCodeBlockProcessor('sqjs', ...)
- [X] T042 [US1] Verify all User Story 1 tests now PASS (Green phase) - if not, debug and fix implementation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can render diagrams, see performance warnings, and copy diagrams as images.

---

## Phase 4: User Story 2 - Syntax Error Handling (Priority: P2)

**Goal**: Users see helpful error messages instead of broken diagrams when syntax is invalid

**Independent Test**: Create notes with intentionally invalid `sqjs` syntax, verify clear error messages with line numbers appear instead of crashes or silent failures.

### Tests for User Story 2 (TDD - Write FIRST, ensure FAIL before implementation)

- [X] T043 [P] [US2] Write integration test in tests/integration/error-handling.test.ts for syntax error display with line number (should FAIL initially)
- [X] T044 [P] [US2] Write integration test in tests/integration/error-handling.test.ts for empty code block warning message (should FAIL initially)
- [X] T045 [P] [US2] Write integration test in tests/integration/error-handling.test.ts for whitespace-only code block warning (should FAIL initially)
- [X] T046 [P] [US2] Write integration test in tests/integration/error-handling.test.ts for isolated error handling (one invalid block doesn't break others) (should FAIL initially)
- [X] T047 [P] [US2] Write unit test in tests/unit/DiagramParser.test.ts for syntax validation logic (should FAIL initially)
- [X] T048 [P] [US2] Write unit test in tests/unit/ErrorDisplay.test.ts for error message formatting with line numbers (should FAIL initially)

### Implementation for User Story 2

- [X] T049 [P] [US2] Implement ErrorDisplay class in src/renderer/ErrorDisplay.ts implementing IErrorDisplay contract
- [X] T050 [P] [US2] Add createErrorElement() method to ErrorDisplay formatting RenderError with styled div
- [X] T051 [P] [US2] Add createWarningElement() method to ErrorDisplay for non-fatal warnings (empty content)
- [X] T052 [P] [US2] Add createPerformanceWarning() method to ErrorDisplay for complexity threshold warnings
- [X] T053 [P] [US2] Implement DiagramParser class in src/processors/DiagramParser.ts for syntax validation
- [X] T054 [US2] Add parse() method to DiagramParser validating syntax and catching js-sequence-diagrams parser exceptions
- [X] T055 [US2] Add error extraction logic to DiagramParser to parse line numbers from library error messages
- [X] T056 [US2] Integrate DiagramParser into DiagramRenderer render() method with try-catch error handling
- [X] T057 [US2] Add empty content check to DiagramRenderer before parsing (return empty RenderResult)
- [X] T058 [US2] Update SQJSCodeBlockProcessor process() method to display ErrorDisplay elements on render errors
- [X] T059 [US2] Add library initialization failure handling in src/main.ts onload() with graceful degradation
- [X] T060 [US2] Verify all User Story 2 tests now PASS (Green phase) - if not, debug and fix implementation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Error handling is complete.

---

## Phase 5: User Story 3 - Theme and Style Configuration (Priority: P3)

**Goal**: Users can configure diagram theme (simple, hand-drawn) via plugin settings, and all diagrams re-render with new theme

**Independent Test**: Install plugin, verify default theme is 'simple'. Change to 'hand-drawn' in settings, verify all diagrams update without manual refresh.

### Tests for User Story 3 (TDD - Write FIRST, ensure FAIL before implementation)

- [ ] T061 [P] [US3] Write integration test in tests/integration/theme-switching.test.ts for default theme being 'simple' (should FAIL initially)
- [ ] T062 [P] [US3] Write integration test in tests/integration/theme-switching.test.ts for theme change propagating to all diagrams (should FAIL initially)
- [ ] T063 [P] [US3] Write integration test in tests/integration/theme-switching.test.ts for theme persistence across plugin reload (should FAIL initially)
- [ ] T064 [P] [US3] Write unit test in tests/unit/ThemeManager.test.ts for getCurrentTheme() and setTheme() methods (should FAIL initially)
- [ ] T065 [P] [US3] Write unit test in tests/unit/ThemeManager.test.ts for cache invalidation on theme change (should FAIL initially)

### Implementation for User Story 3

- [ ] T066 [P] [US3] Implement PluginSettings interface and DEFAULT_SETTINGS constant in src/types.ts
- [ ] T067 [P] [US3] Implement ThemeManager class in src/renderer/ThemeManager.ts implementing IThemeManager contract
- [ ] T068 [US3] Add getCurrentTheme() method to ThemeManager reading from plugin settings
- [ ] T069 [US3] Add setTheme() method to ThemeManager persisting via Obsidian saveData() and triggering cache clear
- [ ] T070 [US3] Add applyTheme() method to ThemeManager modifying SVG attributes for theme styling
- [ ] T071 [US3] Add isValidTheme() method to ThemeManager with type guard validation
- [ ] T072 [US3] Implement SettingsTab class in src/settings.ts extending Obsidian PluginSettingTab
- [ ] T073 [US3] Add display() method to SettingsTab creating theme dropdown UI with 'simple' and 'hand-drawn' options
- [ ] T074 [US3] Wire theme change handler in SettingsTab to call ThemeManager.setTheme()
- [ ] T075 [US3] Add settings loading in src/main.ts onload() using Obsidian loadData() with DEFAULT_SETTINGS fallback
- [ ] T076 [US3] Add settings tab registration in src/main.ts onload() using addSettingTab()
- [ ] T077 [US3] Integrate ThemeManager into DiagramRenderer to apply theme to rendered SVGs
- [ ] T078 [US3] Connect theme change to cache invalidation in DiagramRenderer
- [ ] T079 [US3] Verify all User Story 3 tests now PASS (Green phase) - if not, debug and fix implementation

**Checkpoint**: All user stories should now be independently functional. Theme configuration is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, and validation

- [ ] T080 [P] Add JSDoc comments to all public methods in src/ for API documentation
- [ ] T081 [P] Review and refactor code for clarity while keeping all tests green
- [ ] T082 [P] Verify plugin bundle size is <500KB using esbuild production build
- [ ] T083 [P] Create README.md in repository root with installation and usage instructions
- [ ] T084 [P] Test plugin in Obsidian test vault on Windows, macOS, and Linux if possible
- [ ] T085 Verify all acceptance scenarios from spec.md are covered by tests
- [ ] T086 Run full test suite with coverage report (target >80% coverage for core rendering logic)
- [ ] T087 Performance test: Verify <2s render time for diagrams with 10 participants and 20 messages
- [ ] T088 Performance test: Verify <3s theme change propagation across vault with 100+ notes
- [ ] T089 Performance test: Verify zero memory leaks after 10 edit/reading mode switches
- [ ] T090 Validate quickstart.md instructions by following setup steps in clean environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 ErrorDisplay but US1 still works without US2
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 DiagramRenderer but US1 works with default theme without US3

**All user stories are independently implementable and testable after Foundational phase completes.**

### Within Each User Story

**TDD Workflow (Constitution II - Test-First Development)**:
1. **Red Phase**: Write tests FIRST → Tests MUST fail
2. **Green Phase**: Implement code → Tests MUST pass
3. **Refactor Phase**: Improve code quality while keeping tests green

**Execution Order within Story**:
- Tests before implementation (NON-NEGOTIABLE per constitution)
- Parallel test writing (all tests marked [P] can be written together)
- Utilities/helpers before services (ComplexityAnalyzer, RenderCancellation before DiagramRenderer)
- Core services before integration (DiagramRenderer before SQJSCodeBlockProcessor)
- Integration last (wire up in main.ts)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005, T006, T008, T009, T010)
- All Foundational contract creation tasks can run in parallel (T012-T016)
- All test writing tasks within a user story marked [P] can run in parallel
- Utility class implementations within a story marked [P] can run in parallel (ComplexityAnalyzer, RenderCancellation)
- Different user stories can be worked on in parallel by different team members after Foundational phase

---

## Parallel Example: User Story 1

```bash
# Red Phase - Launch all test writing together (tests should FAIL):
Task T020: "Create test fixtures"
Task T021: "Write integration test for basic rendering"
Task T022: "Write integration test for multiple diagrams"
Task T023: "Write unit test for DiagramRenderer"
Task T024: "Write unit test for ComplexityAnalyzer"
Task T025: "Write integration test for performance warnings"
Task T026: "Write integration test for clipboard copy"

# Green Phase - Launch utility implementations in parallel:
Task T027: "Implement ComplexityAnalyzer"
Task T028: "Implement RenderCancellation"

# Then sequential core implementation:
Task T029-T032: "Implement DiagramRenderer" (depends on utilities)
Task T033-T036: "Implement SQJSCodeBlockProcessor" (depends on DiagramRenderer)

# Parallel additions:
Task T037: "Implement performance warning display"
Task T038-T040: "Implement ClipboardHandler"

# Integration:
Task T041: "Wire up in main.ts"

# Verify:
Task T042: "Verify tests PASS" (Refactor if needed)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T019) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T020-T042)
4. **STOP and VALIDATE**: Run all US1 tests, verify they pass, test in Obsidian vault
5. Deploy/demo MVP (basic diagram rendering with performance warnings and copy functionality)

**MVP Delivers**: Core value - users can write `sqjs` blocks and see rendered diagrams in reading mode.

### Incremental Delivery

1. Complete Setup + Foundational (T001-T019) → Foundation ready
2. Add User Story 1 (T020-T042) → Test independently → **Deploy/Demo MVP!**
3. Add User Story 2 (T043-T060) → Test independently → Deploy/Demo (error handling added)
4. Add User Story 3 (T061-T079) → Test independently → Deploy/Demo (theme config added)
5. Polish (T080-T090) → Final release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T019)
2. Once Foundational is done:
   - Developer A: User Story 1 (T020-T042)
   - Developer B: User Story 2 (T043-T060)
   - Developer C: User Story 3 (T061-T079)
3. Stories complete and integrate independently
4. Team reunites for Polish (T080-T090)

---

## TDD Compliance (Constitution II)

**Test-First Development is NON-NEGOTIABLE**:

✅ **All test tasks (T020-T026, T043-T048, T061-T065) precede implementation tasks**
✅ **Tests must fail initially** (proving they test the right thing)
✅ **Implementation makes tests pass** (Green phase documented)
✅ **Refactoring preserves green tests** (mentioned in checkpoint tasks T042, T060, T079)

**Verification Points**:
- T042: Verify US1 tests PASS after implementation
- T060: Verify US2 tests PASS after implementation
- T079: Verify US3 tests PASS after implementation
- T086: Full test suite run with coverage report

---

## Notes

- **[P] tasks** = different files, no dependencies within phase - can run in parallel
- **[Story] label** maps task to specific user story for traceability (US1, US2, US3)
- **Each user story is independently completable and testable** after Foundational phase
- **Verify tests FAIL before implementing** (Red phase requirement)
- **Commit after each logical task group** or story completion
- **Stop at any checkpoint to validate story independently**
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

**Total Tasks**: 90 tasks
  - Setup: 10 tasks
  - Foundational: 9 tasks
  - User Story 1: 23 tasks (7 tests + 16 implementation)
  - User Story 2: 18 tasks (6 tests + 12 implementation)
  - User Story 3: 19 tasks (5 tests + 14 implementation)
  - Polish: 11 tasks
