# Clarifications: Enhanced Sequence Diagram Syntax Support

**Feature**: 002-title-alias-support
**Date**: 2025-11-09
**Command**: `/speckit.clarify`
**Status**: Completed

## Executive Summary

Clarification analysis identified **5 minor ambiguities** in the original specification. All were resolved through stakeholder input and incorporated into spec.md as FR-016, FR-017, and updates to FR-001, edge cases, and key entities.

**Result**: Specification is now ready for task generation via `/speckit.tasks`.

---

## Clarification Questions & Resolutions

### 1. Validation Result Persistence (Data Model)

**Ambiguity**: Should validation results be cached or re-computed on every render?

**Impact**: Performance optimization strategy

**Options Presented**:
- A: Always re-validate (simple, guaranteed fresh)
- B: Cache validation results keyed by diagram source hash
- C: No caching (validation is fast enough)

**Stakeholder Decision**: **Option B** - Implement caching keyed by diagram source hash

**Rationale**: Optimization for repeated renders of unchanged diagrams, particularly in large documents with multiple diagrams.

**Specification Update**:
- Added **FR-016**: "Plugin MUST cache validation results keyed by diagram source hash to avoid re-validation when diagram content is unchanged"
- Added **Validation Cache** to Key Entities section

---

### 2. Empty Participant Alias Handling (Edge Cases)

**Ambiguity**: What happens when participant declaration has empty alias (`participant A as ""`)?

**Impact**: Validation logic and error messaging

**Options Presented**:
- A: Treat as syntax error
- B: Fall back to short-name as display name
- C: Display literally as empty string

**Stakeholder Decision**: **Option A** - Treat as syntax error

**Rationale**: Empty aliases provide no value and likely indicate user error. Explicit error helps users fix the mistake.

**Specification Update**:
- Added **FR-017**: "Plugin MUST treat empty participant aliases (e.g., `participant A as ""`) as syntax errors and display helpful error messages"
- Added edge case: "What happens when a participant alias is empty? → Display syntax error indicating empty aliases are not allowed (FR-017)"
- Updated **Participant Declaration** entity: "Validation: display-name cannot be empty string"

---

### 3. Title Position Flexibility (UX Flow)

**Ambiguity**: Must Title be on line 1, or can it appear after blank lines?

**Impact**: Parsing logic and user experience

**Options Presented**:
- A: Literally line 1 only
- B: First non-empty line
- C: Anywhere before first participant/message

**Stakeholder Decision**: **Option B** - First non-empty line

**Rationale**: Allows users to have blank lines for readability while still supporting titles. Most flexible without being ambiguous.

**Specification Update**:
- Updated **FR-001**: "Plugin MUST recognize and parse `Title: [text]` syntax (case-insensitive) on the first non-empty line of sqjs code blocks"
- Added edge case: "What happens when Title appears on line 3 after blank lines? → Title is recognized if it's on first non-empty line (FR-001)"

---

### 4. Error Message Localization (Non-Functional)

**Ambiguity**: Should error messages support i18n or English-only?

**Impact**: Implementation complexity and internationalization support

**Options Presented**:
- English-only (simple, matches ecosystem)
- i18n support (future-proof, broader accessibility)

**Stakeholder Decision**: **Implicitly accepted default** - English-only for this feature

**Rationale**: Obsidian plugin ecosystem is primarily English. i18n can be added in future enhancement if needed. Keeps scope focused.

**Specification Update**: None required (assumption already implicit)

---

### 5. Title Case Sensitivity (Functional Scope)

**Ambiguity**: Should `title:`, `Title:`, and `TITLE:` all be valid?

**Impact**: Parser implementation and user experience

**Research Evidence**: research.md:25 confirms library supports case-insensitive keyword

**Options Presented**:
- Explicitly document case-insensitivity
- Leave implicit (rely on library behavior)

**Stakeholder Decision**: **Any option OK** - Made explicit for clarity

**Rationale**: Explicitly documenting expected behavior prevents confusion and ensures tests cover all cases.

**Specification Update**:
- Updated **FR-001**: Added "(case-insensitive)" to title syntax requirement
- Updated **Title Declaration** entity: "Attributes: ..., keyword is case-insensitive"

---

## Specification Changes Summary

### New Functional Requirements
- **FR-016**: Validation result caching keyed by source hash
- **FR-017**: Empty alias syntax error handling

### Modified Functional Requirements
- **FR-001**: Now explicitly states case-insensitive and first non-empty line

### New Edge Cases
- Empty participant alias → syntax error (FR-017)
- Title after blank lines → recognized on first non-empty line (FR-001)

### Updated Key Entities
- **Title Declaration**: Added case-insensitive clarification
- **Participant Declaration**: Added empty string validation rule
- **Validation Cache**: New entity for performance optimization

### Updated Edge Cases
All edge cases now reference their corresponding FR numbers for traceability.

---

## Impact Assessment

### Implementation Impact
- **Low**: All clarifications are additive enhancements that strengthen the spec
- No changes to core user stories or acceptance scenarios
- All clarifications align with research findings from Phase 0

### Test Coverage Impact
- **New tests required**:
  - FR-016: Validation caching behavior (cache hit/miss scenarios)
  - FR-017: Empty alias error handling
  - FR-001: Title case-insensitivity (`title:`, `Title:`, `TITLE:`)
  - FR-001: Title after blank lines

### Backward Compatibility
- **No impact**: All clarifications relate to new validation features
- Existing diagrams without Title/participant syntax unaffected
- Validation errors only trigger on malformed new syntax

---

## Verification Checklist

- [x] All 5 clarification questions answered
- [x] Stakeholder decisions documented
- [x] Specification updated with all changes
- [x] Edge cases updated with FR traceability
- [x] Key entities updated with validation rules
- [x] No new ambiguities introduced
- [x] All changes align with research.md findings
- [x] Constitution compliance maintained (no architectural changes)

---

## Next Phase

**Status**: ✅ Ready for `/speckit.tasks`

**Reason**: Specification is now unambiguous with clear functional requirements (FR-001 through FR-017), fully traced edge cases, and explicit validation rules.

**Expected Task Impact**:
- ~3-5 additional test tasks for new FRs (FR-016, FR-017, case-insensitivity)
- ~2-3 additional implementation tasks for caching and empty alias validation
- Total estimate increases from 40-50 tasks to 45-55 tasks

---

## References

- Original spec.md (before clarification): 15 functional requirements, 7 edge cases
- Updated spec.md (after clarification): 17 functional requirements, 9 edge cases
- research.md: Lines 25 (case-insensitive), 310-312 (caching strategy)
- plan.md: Lines 26-27 (performance budget)
