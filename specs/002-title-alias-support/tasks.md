# Task Breakdown: Enhanced Sequence Diagram Syntax Support

**Feature**: 002-title-alias-support | **Branch**: `002-title-alias-support`
**Status**: Ready for Implementation | **Generated**: 2025-11-09

---

## Overview

This feature enhances the existing SQJS renderer with validation and testing for three syntax elements natively supported by js-sequence-diagrams v2.0.1:

1. **Titles (P1)**: Display descriptive titles above diagrams
2. **Participant Aliasing (P2)**: Map short identifiers to full display names
3. **Participant Ordering (P3)**: Control left-to-right participant placement

**Key Insight from Research**: All three features are already supported by the library. This enhancement focuses on:
- Validation for helpful error messages
- Comprehensive test coverage
- Documentation and examples
- Caching for performance

---

## Implementation Strategy

### MVP Scope (User Story 1 - Titles)

Deliver Title syntax validation and testing first. This provides immediate value for documentation clarity.

**Milestone 1 (MVP)**: Titles working with validation and tests → **Shippable**

### Incremental Delivery

- **Phase 1**: User Story 1 (P1 - Titles) → MVP release
- **Phase 2**: User Story 2 (P2 - Aliases) → Minor release
- **Phase 3**: User Story 3 (P3 - Ordering) → Minor release

Each phase is independently testable and deployable.

---

## Task Summary

| Phase | Task Count | Parallelizable | Description |
|-------|------------|----------------|-------------|
| Setup | 3 | 2 | Project initialization and test infrastructure |
| Foundational | 6 | 4 | Shared validation types and base infrastructure |
| User Story 1 (P1 - Titles) | 11 | 7 | Title validation, testing, and caching |
| User Story 2 (P2 - Aliases) | 12 | 8 | Alias validation, testing, and error handling |
| User Story 3 (P3 - Ordering) | 9 | 6 | Ordering validation and integration tests |
| Polish | 8 | 5 | Documentation, cross-platform testing, release prep |
| **Total** | **49** | **32** | Full feature implementation |

---

## Dependencies & Execution Order

### User Story Independence

```
Foundation
    ↓
    ├─► User Story 1 (P1 - Titles) ────────────► MVP Release
    │
    ├─► User Story 2 (P2 - Aliases) ───────────► Minor Release
    │
    └─► User Story 3 (P3 - Ordering) ──────────► Minor Release
         ↓
      Polish Phase ──────────────────────────────► Final Release
```

**Key Dependencies**:
- User Story 1, 2, 3 can be implemented in any order after Foundation
- Each story is independently testable
- Polish phase requires all stories complete

**No Blocking Dependencies Between Stories**: Titles, aliases, and ordering are orthogonal features.

---

## Phase 1: Setup

**Goal**: Initialize project structure and test infrastructure for validation enhancement

**Duration**: ~1 hour

### Tasks

- [X] T001 Review existing codebase structure in src/ and tests/ to understand integration points for validation
- [X] T002 [P] Create validation types file at src/types/validation.ts with TitleValidation, ParticipantValidation, ValidationResult interfaces per data-model.md
- [X] T003 [P] Create test fixtures file at tests/fixtures/syntax-examples.ts with Title, alias, and ordering examples

**Verification**: Types compile without errors, test fixtures loadable

---

## Phase 2: Foundational Infrastructure

**Goal**: Build shared validation infrastructure and types used by all user stories

**Duration**: ~2-3 hours

**Independent Test**: Foundational validation types exist and compile correctly

### Tasks

- [X] T004 [P] Create base RenderError type extension in src/types/validation.ts for syntax error details (lineNumber, suggestion fields)
- [X] T005 [P] Create ValidationCache class in src/validators/ValidationCache.ts with hash-based caching per FR-016
- [X] T006 [P] Create base ISyntaxValidator interface in src/validators/ISyntaxValidator.ts matching contracts/ISyntaxValidator.ts specification
- [X] T007 Create SyntaxValidator class skeleton in src/validators/SyntaxValidator.ts implementing ISyntaxValidator interface
- [X] T008 [P] Add unit tests for ValidationCache in tests/unit/ValidationCache.test.ts (cache hit/miss, hash computation)
- [X] T009 Run foundational tests to verify cache and type infrastructure works correctly

**Verification**:
- All types compile
- ValidationCache tests pass (cache hit/miss)
- SyntaxValidator skeleton implements interface

---

## Phase 3: User Story 1 - Diagram Titles (P1)

**Goal**: Implement Title syntax validation with helpful error messages and caching

**Priority**: P1 (MVP)

**Independent Test**: Can create sqjs block with `Title: Test Diagram`, switch to reading mode, and verify title appears above diagram

**Acceptance Criteria** (from spec.md):
1. Title displays above diagram when present
2. Title syntax errors show helpful messages
3. Empty titles ignored (FR-014)
4. Multiple titles use first only (FR-015)
5. Case-insensitive keyword support (FR-001)

### Tasks

- [X] T010 [P] [US1] Write unit tests for SyntaxValidator.validateTitle() in tests/unit/SyntaxValidator.test.ts covering valid titles per quickstart.md lines 26-56
- [X] T011 [P] [US1] Write unit tests for invalid Title syntax in tests/unit/SyntaxValidator.test.ts covering empty, missing colon, wrong case per quickstart.md lines 59-77
- [X] T012 [P] [US1] Write unit tests for Title edge cases in tests/unit/SyntaxValidator.test.ts covering long titles, special chars, Unicode per quickstart.md lines 79-93
- [X] T013 [US1] Implement validateTitle() method in src/validators/SyntaxValidator.ts with regex pattern /^Title:\s*(.*)$/i per research.md:230
- [X] T014 [US1] Add whitespace trimming logic in validateTitle() per FR-013
- [X] T015 [US1] Add empty title detection logic per FR-014 (whitespace-only titles return isValid: false)
- [X] T016 [P] [US1] Write integration tests for Title rendering in tests/integration/syntax-features.test.ts covering FR-001, FR-002
- [X] T017 [P] [US1] Write integration tests for Title case-insensitivity in tests/integration/syntax-features.test.ts (title:, Title:, TITLE: all valid per FR-001)
- [X] T018 [P] [US1] Write integration tests for Title after blank lines in tests/integration/syntax-features.test.ts (first non-empty line per FR-001 clarification)
- [X] T019 [US1] Integrate ValidationCache into validateDiagram() to cache results by diagram source hash per FR-016
- [X] T020 [US1] Run all User Story 1 tests and verify 100% pass rate for Title validation

**Verification**:
- Unit tests: 15+ tests pass (valid, invalid, edge cases, case-insensitivity)
- Integration tests: Title renders correctly in all scenarios
- Caching reduces validation time on repeated renders

**MVP Checkpoint**: ✅ User Story 1 complete → Can ship Title support

---

## Phase 4: User Story 2 - Participant Aliasing (P2)

**Goal**: Implement participant alias validation and mapping for message resolution

**Priority**: P2

**Independent Test**: Can create sqjs block with `participant A as "Authentication Service"` followed by `A->B: Login`, switch to reading mode, and verify "Authentication Service" appears in diagram

**Acceptance Criteria** (from spec.md):
1. Aliases display full names in rendered diagram
2. Messages reference short-name identifiers
3. Quoted strings support spaces and special chars (FR-009)
4. Empty aliases rejected as syntax errors (FR-017)
5. Unclosed quotes show helpful error messages

### Tasks

- [X] T021 [P] [US2] Write unit tests for SyntaxValidator.validateParticipant() simple syntax in tests/unit/SyntaxValidator.test.ts per quickstart.md lines 162-177
- [X] T022 [P] [US2] Write unit tests for aliased participant syntax in tests/unit/SyntaxValidator.test.ts covering "as" keyword, quoted strings per quickstart.md lines 179-217
- [X] T023 [P] [US2] Write unit tests for invalid participant syntax in tests/unit/SyntaxValidator.test.ts covering unclosed quotes, invalid identifiers per quickstart.md lines 219-245
- [X] T024 [P] [US2] Write unit tests for empty alias detection (FR-017) in tests/unit/SyntaxValidator.test.ts (participant A as "" must error)
- [X] T025 [US2] Implement validateParticipant() method in src/validators/SyntaxValidator.ts with simple and aliased patterns per quickstart.md lines 258-336
- [X] T026 [US2] Add unclosed quote detection logic in validateParticipant() with helpful error message per FR-011 and research.md:156-157
- [X] T027 [US2] Add empty alias validation in validateParticipant() per FR-017 (treat as syntax error)
- [X] T028 [US2] Implement validateAliasQuotes() helper method in src/validators/SyntaxValidator.ts per ISyntaxValidator contract lines 82-107
- [X] T029 [P] [US2] Write integration tests for participant alias resolution in tests/integration/syntax-features.test.ts covering FR-003, FR-004, FR-005
- [X] T030 [P] [US2] Write integration tests for mixed aliased/non-aliased participants in tests/integration/syntax-features.test.ts per FR-010
- [X] T031 [P] [US2] Write integration tests for alias error messages in tests/integration/syntax-features.test.ts (unclosed quotes, empty aliases)
- [X] T032 [US2] Run all User Story 2 tests and verify 100% pass rate for alias validation

**Verification**:
- Unit tests: 20+ tests pass (simple, aliased, invalid, empty alias)
- Integration tests: Aliases resolve correctly, error messages helpful
- Mixed aliased/non-aliased participants work together

**Release Checkpoint**: ✅ User Story 2 complete → Can ship alias support

---

## Phase 5: User Story 3 - Participant Ordering (P3)

**Goal**: Validate and document explicit participant ordering behavior

**Priority**: P3

**Independent Test**: Can create sqjs block with participants declared as `participant C`, `participant B`, `participant A`, and verify diagram displays participants left-to-right in that order (not alphabetical)

**Acceptance Criteria** (from spec.md):
1. Participants render in declaration order (FR-007)
2. Declared participants appear before undeclared ones
3. Order maintained regardless of message flow
4. Backward compatibility: diagrams without declarations use message order

### Tasks

- [X] T033 [P] [US3] Write unit tests for validateDiagram() participant ordering in tests/unit/SyntaxValidator.test.ts per quickstart.md lines 351-419
- [X] T034 [P] [US3] Write unit tests for mixed declared/undeclared participants in tests/unit/SyntaxValidator.test.ts (declared first, undeclared after)
- [X] T035 [P] [US3] Write unit tests for backward compatibility in tests/unit/SyntaxValidator.test.ts (no Title/participants still works)
- [X] T036 [US3] Implement validateDiagram() method in src/validators/SyntaxValidator.ts aggregating Title and participant validations per quickstart.md lines 432-492
- [X] T037 [US3] Build participantMap from validated participants in validateDiagram() per data-model.md lines 118-119
- [X] T038 [US3] Add multiple Title handling logic in validateDiagram() per FR-015 (use first, ignore rest)
- [X] T039 [P] [US3] Write integration tests for participant ordering in tests/integration/syntax-features.test.ts covering FR-006, FR-007
- [X] T040 [P] [US3] Write integration tests for combined Title + aliases + ordering in tests/integration/syntax-features.test.ts per quickstart.md lines 557-579
- [X] T041 [US3] Run all User Story 3 tests and verify 100% pass rate for ordering validation

**Verification**:
- Unit tests: 15+ tests pass (ordering, mixed, backward compat)
- Integration tests: Ordering correct, combined features work
- Backward compatibility maintained

**Release Checkpoint**: ✅ User Story 3 complete → All features implemented

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Documentation, performance verification, and release preparation

**Duration**: ~3-4 hours

### Tasks

- [X] T042 [P] Update README.md with Title, alias, and ordering syntax examples from quickstart.md lines 505-579
- [X] T043 [P] Add syntax error examples to README.md showing helpful error messages per research.md lines 213-224
- [X] T044 [P] Create sample vault diagrams in tests/integration/fixtures/ demonstrating all three features
- [X] T045 [P] Run full test suite with coverage analysis: npm run test:coverage
- [X] T046 Verify test coverage meets 96%+ target (matching feature 001 baseline per RELEASE-NOTES.md line 54)
- [ ] T047 [P] Run cross-platform rendering tests on Windows, macOS, Linux per constitution Test-First principle
- [X] T048 Verify performance: validation overhead <10ms per research.md lines 300-307
- [X] T049 Update RELEASE-NOTES.md with feature 002 enhancements and syntax examples

**Verification**:
- Test coverage ≥96%
- README has clear syntax examples
- All cross-platform tests pass
- Performance within budget

---

## Parallel Execution Opportunities

### Within Each User Story

**User Story 1 (Titles)**: Can parallelize test writing
- T010, T011, T012, T016, T017, T018 can all be written simultaneously
- Then T013-T015 implement in sequence
- Then T019-T020 integrate and verify

**User Story 2 (Aliases)**: Can parallelize test writing
- T021, T022, T023, T024, T029, T030, T031 can all be written simultaneously
- Then T025-T028 implement in sequence
- Then T032 verify

**User Story 3 (Ordering)**: Can parallelize test writing
- T033, T034, T035, T039, T040 can all be written simultaneously
- Then T036-T038 implement in sequence
- Then T041 verify

### Across User Stories

After Foundation complete (T009), **all three user stories can be implemented in parallel** by different developers:
- Developer A: User Story 1 (T010-T020)
- Developer B: User Story 2 (T021-T032)
- Developer C: User Story 3 (T033-T041)

**Parallel Speedup**: 3 stories × 11-12 tasks each = ~33 tasks can overlap, reducing implementation time by ~60%

---

## Testing Strategy

### Test Layers (per research.md lines 268-291)

1. **Unit Tests** (`tests/unit/SyntaxValidator.test.ts`, `tests/unit/ValidationCache.test.ts`)
   - Validation logic for Title, participant, alias syntax
   - Error message generation
   - Cache hit/miss behavior
   - **Target**: 40+ unit tests

2. **Integration Tests** (`tests/integration/syntax-features.test.ts`)
   - Title rendering in diagrams
   - Participant alias resolution
   - Participant ordering
   - Combined features (Title + alias + ordering)
   - **Target**: 20+ integration tests

3. **Error Handling Tests** (`tests/integration/error-handling.test.ts`)
   - Empty title errors
   - Unclosed quote errors
   - Empty alias errors (FR-017)
   - Multiple title warnings
   - Malformed alias errors
   - **Target**: 15+ error scenario tests

**Total Test Target**: 75+ tests (vs. 84 in feature 001)

---

## Success Criteria Verification

| Success Criterion | Verification Method | Task Reference |
|-------------------|---------------------|----------------|
| SC-001: Users can add titles | Integration tests T016-T018 | User Story 1 |
| SC-002: Reduce syntax verbosity 30% | Manual verification with alias examples | User Story 2 |
| SC-003: 100% valid syntax renders | All integration tests pass | T020, T032, T041 |
| SC-004: Control ordering 100% | Integration tests T039-T040 | User Story 3 |
| SC-005: 0% regression | Backward compat tests T035 | User Story 3 |
| SC-006: Error messages <2s | Performance tests T048 | Polish |
| SC-007: Performance <2s | Performance tests T048 | Polish |

---

## Complexity Tracking

**No Constitution Violations**:
- ✅ Plugin-First: Enhancement to existing plugin, no new modules
- ✅ Test-First: All tasks follow TDD (tests before implementation)
- ✅ Specification-Driven: All tasks trace to spec.md FRs
- ✅ Knowledge Retention: Lessons learned captured in research.md

---

## Task Checklist Format

**Legend**:
- `[ ]` = Not started
- `[X]` = Completed
- `[P]` = Parallelizable (no blocking dependencies)
- `[US1]`, `[US2]`, `[US3]` = User Story labels

**File Path Convention**: Every task includes exact file path for implementation

---

## Next Steps

1. **Review and approve** this task breakdown
2. **Run** `/speckit.implement` to begin implementation
3. **Track progress** by marking tasks [X] as completed
4. **Ship MVP** after User Story 1 (T020) complete
5. **Iterate** through User Stories 2 and 3
6. **Polish and release** after all stories complete (T049)

---

## Notes

- **Research Finding**: js-sequence-diagrams v2.0.1 natively supports all three features (research.md lines 9-10)
- **Key Insight**: This is primarily a validation and testing enhancement, not new syntax implementation
- **Performance Budget**: <10ms validation overhead (research.md:302)
- **Backward Compatibility**: 100% maintained (research.md:186-208)
- **Test Evidence**: Feature 001 already uses `Title: Authentication Flow` in COMPLEX_DIAGRAM fixture

---

**Total Tasks**: 49
**Parallelizable Tasks**: 32 (65%)
**Estimated Duration**: 3-4 days with TDD approach
**MVP Delivery**: After T020 (~1 day)
