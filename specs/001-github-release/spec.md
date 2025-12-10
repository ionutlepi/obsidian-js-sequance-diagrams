# Feature Specification: GitHub Release Process Integration

**Feature Branch**: `001-github-release`
**Created**: 2025-11-30
**Status**: Draft
**Input**: User description: "Integrate github release process"

## Clarifications

### Session 2025-11-30

- Q: How should the system handle workflow failures mid-execution (e.g., asset upload fails, API rate limits)? → A: Automatically retry failed steps with exponential backoff (max 3 retries), then fail if unsuccessful
- Q: What logging and monitoring is required for release workflow execution? → A: Workflow must output detailed logs visible during execution and persisted for later review, with notifications on completion/failure
- Q: How should GitHub authentication credentials be managed for release creation? → A: GitHub Actions built-in GITHUB_TOKEN with automatic rotation and scoped permissions
- Q: How should the system handle duplicate tag names or attempts to re-release the same version? → A: Reject duplicate releases entirely - workflow fails if a release already exists for the tag
- Q: How should commit messages be formatted and filtered for release notes generation? → A: Filter out merge commits and CI-related messages; support conventional commit format (feat:, fix:, etc.) for categorization

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automated Release Creation (Priority: P1)

As a maintainer, when I'm ready to publish a new version of the plugin, I need to create a GitHub release with properly built artifacts so that users can download and install the plugin.

**Why this priority**: This is the core functionality that enables plugin distribution. Without this, users cannot install or update the plugin from GitHub releases.

**Independent Test**: Can be fully tested by triggering a release workflow with a version tag and verifying that a GitHub release is created with the required plugin artifacts attached.

**Acceptance Scenarios**:

1. **Given** a new version tag is pushed to the repository, **When** the release workflow executes, **Then** a GitHub release is created with the tag name and includes manifest.json, main.js, and styles.css as downloadable assets
2. **Given** the release workflow completes successfully, **When** a user navigates to the GitHub releases page, **Then** they can see the new release with a version number, release notes, and downloadable plugin files
3. **Given** a release is created, **When** the user downloads the release assets, **Then** all required files for Obsidian plugin installation are present and valid
4. **Given** a release already exists for a version tag, **When** the same tag is pushed again or the workflow is re-triggered, **Then** the workflow fails immediately with a clear error message indicating the release already exists

---

### User Story 2 - Release Notes Generation (Priority: P2)

As a maintainer, I need release notes to be automatically generated from commit messages so that users understand what changed in each version.

**Why this priority**: Release notes provide transparency and help users decide whether to update. This enhances user experience but the release can function without automated notes (they can be added manually).

**Independent Test**: Can be tested by creating a release and verifying that the release description contains meaningful change information extracted from commit messages.

**Acceptance Scenarios**:

1. **Given** commits have been made since the last release, **When** a new release is created, **Then** the release notes include meaningful commits with merge commits and CI-related messages filtered out
2. **Given** commits use conventional commit format (feat:, fix:, etc.), **When** a new release is created, **Then** the release notes are organized by category (Features, Fixes, etc.)
3. **Given** commits without conventional format exist, **When** a new release is created, **Then** they are included in an "Other Changes" category

---

### User Story 3 - Version Validation (Priority: P2)

As a maintainer, I need the system to validate that version numbers are consistent across manifest files and tags to prevent release errors.

**Why this priority**: Version consistency prevents confusion and installation issues, but manual verification is possible if automated validation is not yet implemented.

**Independent Test**: Can be tested by attempting to create a release with mismatched versions and verifying that the workflow fails with a clear error message.

**Acceptance Scenarios**:

1. **Given** a version tag is pushed, **When** the tag version doesn't match manifest.json version, **Then** the release workflow fails with a clear error message
2. **Given** manifest.json and package.json exist, **When** their version numbers differ, **Then** the release workflow prevents the release and reports the discrepancy

---

### User Story 4 - Pre-release Support (Priority: P3)

As a maintainer, I need the ability to create pre-release versions (beta, alpha) so that users can opt into testing new features before stable release.

**Why this priority**: Pre-releases are valuable for testing but not essential for basic plugin distribution. The core release process must work first.

**Independent Test**: Can be tested by creating a release with a pre-release tag (e.g., v1.0.0-beta.1) and verifying it's marked as a pre-release on GitHub.

**Acceptance Scenarios**:

1. **Given** a tag with a pre-release suffix (e.g., -beta, -alpha) is pushed, **When** the release is created, **Then** it is marked as a pre-release on GitHub
2. **Given** a pre-release exists, **When** users browse releases, **Then** they can identify it as a pre-release and understand it's not stable

---

### Edge Cases

- **Workflow failures mid-execution**: System automatically retries failed steps (e.g., asset upload failures, API rate limits) with exponential backoff for a maximum of 3 attempts, then fails with clear error message if unsuccessful
- **Duplicate tag names or re-releasing**: System rejects duplicate releases entirely - workflow fails with clear error if a release already exists for the tag version
- **Missing or malformed manifest.json**: Release workflow must fail early with validation error before attempting to build or upload artifacts
- **Large asset files exceeding GitHub limits**: System must validate asset sizes before upload and fail with clear message if limits exceeded
- **Detached HEAD state**: System must detect detached HEAD and either prevent release creation or ensure tag reference is properly recorded

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST build plugin artifacts (main.js, manifest.json, styles.css) before creating a release
- **FR-002**: System MUST create a GitHub release when a version tag matching the pattern `v*.*.*` is pushed to the repository
- **FR-003**: System MUST attach all required plugin files as downloadable assets to the GitHub release
- **FR-004**: System MUST validate that the tag version matches the version specified in manifest.json
- **FR-005**: System MUST support semantic versioning (MAJOR.MINOR.PATCH format)
- **FR-006**: System MUST generate release notes automatically from commit messages since the last release, filtering out merge commits and CI-related messages, with support for conventional commit format (feat:, fix:, etc.) categorization
- **FR-007**: System MUST identify pre-release versions (tags with suffixes like -beta, -alpha) and mark them appropriately on GitHub
- **FR-008**: System MUST fail the release process with a clear error message if version validation fails
- **FR-009**: System MUST ensure plugin artifacts are built with production-ready settings (minified, optimized)
- **FR-010**: System MUST authenticate with GitHub using the built-in GITHUB_TOKEN (automatically rotated, scoped permissions)
- **FR-011**: System MUST retry failed workflow steps automatically with exponential backoff (maximum 3 attempts) before failing permanently
- **FR-012**: System MUST output detailed logs during workflow execution showing each step's progress, inputs, and results
- **FR-013**: System MUST persist workflow logs for later review and troubleshooting
- **FR-014**: System MUST send notifications to maintainers upon release completion (success or failure)
- **FR-015**: System MUST detect existing releases for a given tag version and reject duplicate release attempts with a clear error message

### Key Entities

- **Release**: Represents a published version of the plugin, containing version number, tag name, release notes, creation timestamp, and associated asset files
- **Version Tag**: A git tag following semantic versioning (e.g., v1.2.3), optionally with pre-release suffix, that triggers release creation
- **Plugin Assets**: The collection of files required for plugin installation (manifest.json describing plugin metadata, main.js containing plugin code, styles.css for styling)
- **Release Notes**: Documentation describing changes in the release, generated from commit history or changelog

## Assumptions & Dependencies

### Assumptions
- The repository is hosted on GitHub
- Maintainers have appropriate permissions to create releases and push tags
- Users installing the plugin have access to GitHub releases page
- Commit messages provide sufficient context for meaningful release notes (conventional commit format recommended but not required)

### Dependencies
- Git version control system for tagging
- GitHub platform for hosting releases and artifacts
- GitHub Actions for workflow execution and built-in GITHUB_TOKEN authentication
- GitHub API access for automated release creation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Maintainers can create a new release by pushing a version tag, with the entire process completing in under 5 minutes
- **SC-002**: 100% of releases include all required plugin files (manifest.json, main.js, styles.css) as downloadable assets
- **SC-003**: Version validation catches 100% of version mismatches between tags and manifest files before release creation
- **SC-004**: Release notes are automatically generated for 100% of releases, reducing manual documentation effort
- **SC-005**: Users can identify pre-release versions and differentiate them from stable releases
- **SC-006**: Zero failed releases due to missing or invalid plugin artifacts
- **SC-007**: Maintainers receive notifications within 1 minute of release completion and can access detailed logs for 100% of workflow executions
