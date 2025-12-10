# Tasks: GitHub Release Process Integration

**Input**: Design documents from `/specs/001-github-release/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Following Test-First Development (Constitution Principle II), test tasks precede implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Paths based on plan.md structure:
- Workflows: `.github/workflows/`
- Scripts: `scripts/release/`
- Tests: `tests/workflows/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and initialize supporting tools

- [x] T001 Create `.github/workflows/` directory for GitHub Actions workflow files
- [x] T002 Create `scripts/release/` directory for reusable release automation scripts
- [x] T003 [P] Create `tests/workflows/` directory for CI/CD script unit tests
- [x] T004 [P] Make scripts executable: `chmod +x scripts/release/*.sh`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utility scripts that multiple user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Write unit tests for retry-with-backoff.sh in `tests/workflows/retry-with-backoff.test.ts`
- [x] T006 Implement retry-with-backoff.sh utility script in `scripts/release/retry-with-backoff.sh` (supports exponential backoff with max 3 attempts)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automated Release Creation (Priority: P1) 🎯 MVP

**Goal**: Enable maintainers to create GitHub releases by pushing version tags, with automatic building and asset uploading

**Independent Test**: Trigger workflow with a version tag and verify GitHub release is created with all required artifacts (main.js, manifest.json, styles.css)

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Write integration test for complete release workflow in `tests/workflows/release-workflow.test.ts` (mocks git tag push, verifies workflow creates release)
- [x] T008 [P] [US1] Write test for duplicate release detection in `tests/workflows/duplicate-detection.test.ts` (verifies workflow fails when release exists)

### Implementation for User Story 1

- [x] T009 [US1] Create release.yml GitHub Actions workflow in `.github/workflows/release.yml` with:
  - Trigger on push tags matching `v*.*.*` pattern
  - Job: checkout with full git history (fetch-depth: 0)
  - Job: setup Node.js 20 with npm cache
- [x] T010 [US1] Add step to extract version from tag in `.github/workflows/release.yml`:
  - Parse `$GITHUB_REF` to extract version
  - Store TAG_VERSION in environment variable
- [x] T011 [US1] Add step to check for duplicate release in `.github/workflows/release.yml`:
  - Use `gh release view` to check if release exists
  - Fail with clear error if duplicate detected
- [x] T012 [US1] Add build step in `.github/workflows/release.yml`:
  - Run `npm ci` to install dependencies
  - Run `npm run build` to generate production artifacts
- [x] T013 [US1] Add artifact validation step in `.github/workflows/release.yml`:
  - Verify main.js, manifest.json exist
  - Check file sizes (fail if > 100MB)
  - Validate manifest.json is valid JSON
- [x] T014 [US1] Add release creation step in `.github/workflows/release.yml`:
  - Use ncipollo/release-action@v1
  - Attach main.js, manifest.json, styles.css as assets
  - Configure automatic retries via retry-with-backoff.sh wrapper
- [x] T015 [US1] Add workflow logging with log groups:
  - Use `::group::` for collapsible sections
  - Log all inputs, outputs, and decisions
  - Use `::notice::` for success, `::error::` for failures
- [x] T016 [US1] Add notification step in `.github/workflows/release.yml`:
  - GitHub Actions automatically notifies on completion
  - Verify workflow status visible in Actions tab

**Checkpoint**: At this point, User Story 1 should be fully functional - maintainers can push tags and get releases with artifacts

---

## Phase 4: User Story 2 - Release Notes Generation (Priority: P2)

**Goal**: Automatically generate categorized release notes from commit messages

**Independent Test**: Create release and verify release notes contain commits organized by category (Features, Fixes, Other Changes) with merge commits filtered out

### Tests for User Story 2

- [x] T017 [P] [US2] Write unit tests for generate-release-notes.sh in `tests/workflows/release-notes.test.ts`:
  - Test commit filtering (excludes merges, CI commits)
  - Test conventional commit categorization (feat:, fix:)
  - Test uncategorized commits go to "Other Changes"
  - Test empty commit range handled gracefully
- [x] T018 [P] [US2] Write integration test for release notes in workflow in `tests/workflows/release-notes-integration.test.ts`:
  - Verify release notes file generated
  - Verify release includes notes content

### Implementation for User Story 2

- [x] T019 [P] [US2] Implement generate-release-notes.sh in `scripts/release/generate-release-notes.sh`:
  - Parse command line arguments (tag, optional output path)
  - Find previous tag using `git describe --tags --abbrev=0 HEAD^`
  - Extract commits with `git log` since previous tag
- [x] T020 [US2] Add commit filtering to generate-release-notes.sh:
  - Filter out: `^Merge`, `^ci:`, `^chore(deps)`
  - Use grep to apply filter patterns
- [x] T021 [US2] Add commit categorization to generate-release-notes.sh:
  - Categorize `^feat:` → Features section
  - Categorize `^fix:` → Fixes section
  - All other (not filtered) → Other Changes section
  - Strip conventional commit prefixes in output
- [x] T022 [US2] Add markdown generation to generate-release-notes.sh:
  - Generate sections: Features, Fixes, Other Changes
  - Omit empty sections
  - Write to output file (default: release-notes.md)
- [x] T023 [US2] Integrate generate-release-notes.sh into release.yml:
  - Add step after build, before release creation
  - Call script with current tag
  - Store output in release-notes.md
- [x] T024 [US2] Update release creation step to include notes:
  - Add `bodyFile: release-notes.md` to ncipollo/release-action
  - Verify notes appear in GitHub release description

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - releases have automated, categorized release notes

---

## Phase 5: User Story 3 - Version Validation (Priority: P2)

**Goal**: Validate version consistency across manifest.json, package.json, and git tag before release

**Independent Test**: Attempt release with mismatched versions and verify workflow fails with clear error message

### Tests for User Story 3

- [x] T025 [P] [US3] Write unit tests for validate-version.sh in `tests/workflows/validate-version.test.ts`:
  - Test all versions match → exit 0
  - Test tag ≠ manifest → exit 1 with error
  - Test tag ≠ package → exit 1 with error
  - Test missing files → exit 2
  - Test invalid JSON → exit 2
- [x] T026 [P] [US3] Write integration test for version validation in workflow in `tests/workflows/version-validation-integration.test.ts`:
  - Verify workflow fails on version mismatch
  - Verify error message is clear and actionable

### Implementation for User Story 3

- [x] T027 [P] [US3] Implement validate-version.sh in `scripts/release/validate-version.sh`:
  - Accept tag version as first argument
  - Validate argument is provided
  - Use `set -euo pipefail` for strict error handling
- [x] T028 [US3] Add file existence checks to validate-version.sh:
  - Check manifest.json exists (exit 2 if missing)
  - Check package.json exists (exit 2 if missing)
- [x] T029 [US3] Add version parsing to validate-version.sh:
  - Parse manifest.json version using `jq -r '.version'`
  - Parse package.json version using `jq -r '.version'`
  - Handle jq errors (exit 2 for invalid JSON)
- [x] T030 [US3] Add version comparison to validate-version.sh:
  - Compare tag_version vs manifest_version
  - Compare tag_version vs package_version
  - Exit 1 with clear error message if mismatch
  - Exit 0 with success message if all match
- [x] T031 [US3] Integrate validate-version.sh into release.yml:
  - Add validation step after version extraction
  - Run BEFORE build step (fail fast)
  - Pass TAG_VERSION to script
  - Workflow fails if script exits non-zero

**Checkpoint**: All releases now validate version consistency before building artifacts

---

## Phase 6: User Story 4 - Pre-release Support (Priority: P3)

**Goal**: Enable creation of pre-release versions (alpha, beta, rc) marked appropriately on GitHub

**Independent Test**: Create release with pre-release tag (e.g., v1.0.0-beta.1) and verify it's marked as pre-release on GitHub

### Tests for User Story 4

- [x] T032 [P] [US4] Write unit tests for pre-release detection in `tests/workflows/prerelease-detection.test.ts`:
  - Test v1.0.0 → isPrerelease = false
  - Test v1.0.0-alpha → isPrerelease = true
  - Test v1.0.0-beta.1 → isPrerelease = true
  - Test v1.0.0-rc.2 → isPrerelease = true
- [x] T033 [P] [US4] Write integration test for pre-release workflow in `tests/workflows/prerelease-integration.test.ts`:
  - Trigger workflow with pre-release tag
  - Verify release marked as pre-release in GitHub

### Implementation for User Story 4

- [x] T034 [US4] Add pre-release detection to release.yml:
  - After version extraction step
  - Use regex to detect `-` in version (e.g., `v1.0.0-beta.1`)
  - Set IS_PRERELEASE=true or false
  - Store in environment variable
- [x] T035 [US4] Update release creation step to handle pre-releases:
  - Add `prerelease: ${{ env.IS_PRERELEASE }}` to ncipollo/release-action
  - GitHub automatically marks release with pre-release flag
- [x] T036 [US4] Update release title to include pre-release identifier:
  - If pre-release, title: "Release $TAG (Pre-release)"
  - If stable, title: "Release $TAG"
- [x] T037 [US4] Verify pre-release distinction in GitHub UI:
  - Pre-releases show with "Pre-release" badge
  - Users can filter by pre-release vs stable

**Checkpoint**: All user stories should now be independently functional - complete release automation with notes, validation, and pre-release support

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T038 [P] Add workflow documentation in `.github/workflows/release.yml`:
  - Comment each step with purpose
  - Document expected inputs and outputs
  - Link to quickstart.md for maintainer guide
- [ ] T039 [P] Update README.md with release process section:
  - Link to quickstart.md
  - Document version bumping workflow
  - Troubleshooting common issues
- [x] T040 [P] Add error handling edge cases to release.yml:
  - Handle detached HEAD state
  - Handle large asset files (>100MB warning)
  - Validate GitHub token has required permissions
- [ ] T041 Test complete release workflow end-to-end:
  - Create test tag on feature branch
  - Verify all steps execute successfully
  - Verify release created with all artifacts and notes
  - Delete test release and tag
- [x] T042 [P] Run all test suites and ensure passing:
  - Run `npm test tests/workflows/`
  - Verify coverage for all scripts
  - Fix any failing tests
- [ ] T043 Validate against quickstart.md:
  - Follow quickstart guide step-by-step
  - Verify all instructions accurate
  - Update quickstart if any discrepancies found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 workflow but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 workflow but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Extends US1 workflow but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Scripts before workflow integration
- Validation steps before release creation
- Core implementation before edge case handling

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- Tests T007 and T008 for US1 can run in parallel
- Tests T017 and T018 for US2 can run in parallel
- Script implementation tasks T019-T022 within US2 can be partially parallel (T019 first, then T020-T022)
- Tests T025 and T026 for US3 can run in parallel
- Script implementation tasks T027-T030 within US3 can be partially parallel (T027 first, then T028-T030)
- Tests T032 and T033 for US4 can run in parallel
- All Polish tasks (T038-T043) can run in parallel except T041 depends on T040

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write integration test for complete release workflow in tests/workflows/release-workflow.test.ts"
Task: "Write test for duplicate release detection in tests/workflows/duplicate-detection.test.ts"

# After tests fail, implement workflow:
Task: "Create release.yml GitHub Actions workflow in .github/workflows/release.yml"
```

## Parallel Example: User Story 2

```bash
# Launch both tests together:
Task: "Write unit tests for generate-release-notes.sh in tests/workflows/release-notes.test.ts"
Task: "Write integration test for release notes in workflow in tests/workflows/release-notes-integration.test.ts"

# After tests fail, implement script internals in parallel:
Task: "Add commit filtering to generate-release-notes.sh"
Task: "Add commit categorization to generate-release-notes.sh"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Directories created
2. Complete Phase 2: Foundational → Retry utility available
3. Complete Phase 3: User Story 1 → Basic release automation working
4. **STOP and VALIDATE**: Push a test tag, verify release created
5. Demo to stakeholders

**Estimated MVP effort**: ~8 tasks (T001-T016 excluding optional parallelization)

### Incremental Delivery

1. **Foundation** (T001-T006) → Directory structure and retry utility ready
2. **User Story 1** (T007-T016) → Test independently → **MVP deployed!**
   - Value: Maintainers can create releases by pushing tags
3. **User Story 2** (T017-T024) → Test independently → Deploy
   - Added value: Releases have automatic changelog
4. **User Story 3** (T025-T031) → Test independently → Deploy
   - Added value: Prevents version mismatch releases
5. **User Story 4** (T032-T037) → Test independently → Deploy
   - Added value: Pre-release support for beta testing
6. **Polish** (T038-T043) → Final validation → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T006)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T007-T016)
   - **Developer B**: User Story 2 (T017-T024) - can start immediately
   - **Developer C**: User Story 3 (T025-T031) - can start immediately
   - **Developer D**: User Story 4 (T032-T037) - can start immediately
3. Stories complete and merge independently (workflow steps combine)
4. Team collaborates on Polish (T038-T043)

---

## Task Summary

**Total Tasks**: 43

**Tasks by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 2 tasks
- Phase 3 (User Story 1 - P1): 10 tasks (2 tests + 8 implementation)
- Phase 4 (User Story 2 - P2): 8 tasks (2 tests + 6 implementation)
- Phase 5 (User Story 3 - P2): 7 tasks (2 tests + 5 implementation)
- Phase 6 (User Story 4 - P3): 6 tasks (2 tests + 4 implementation)
- Phase 7 (Polish): 6 tasks

**Parallelizable Tasks**: 20 tasks marked with [P]

**Independent Test Criteria**:
- **US1**: Push tag → release created with artifacts
- **US2**: Release contains categorized changelog
- **US3**: Mismatched versions rejected
- **US4**: Pre-release tags marked appropriately

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 16 tasks

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests MUST fail before implementing (TDD requirement)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All scripts use `set -euo pipefail` for strict error handling
- All bash scripts should be tested with Vitest using child_process to execute them
