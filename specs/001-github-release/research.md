# Research: GitHub Release Process Integration

**Date**: 2025-11-30
**Feature**: 001-github-release
**Phase**: Phase 0 - Outline & Research

## Overview

This document captures research findings for implementing an automated GitHub release workflow for the Obsidian plugin. The workflow must handle building artifacts, version validation, release notes generation, and GitHub release creation with robust error handling.

## Research Areas

### 1. GitHub Actions Release Workflows

**Decision**: Use GitHub Actions with official actions/create-release or ncipollo/release-action

**Rationale**:
- GitHub Actions provides native integration with GitHub Releases API
- GITHUB_TOKEN is automatically available with appropriate permissions (no secret management needed)
- ubuntu-latest runner has all necessary tools pre-installed (git, node, npm)
- Mature ecosystem with well-tested release actions

**Alternatives Considered**:
- **Manual gh CLI approach**: More flexible but requires more error handling code
- **Third-party CI/CD (CircleCI, Travis)**: Adds external dependency and requires token management
- **Custom script with GitHub API**: Reinvents wheel, harder to maintain

**Best Practices**:
- Use `actions/checkout@v4` with `fetch-depth: 0` to access full git history for release notes
- Use `actions/setup-node@v4` with caching for faster builds
- Use `ncipollo/release-action@v1` - handles retries, supports pre-releases, good error messages
- Pin action versions with SHA for security (or at minimum, major version tags)

### 2. Version Validation Strategy

**Decision**: Parse and compare versions from manifest.json, package.json, and git tag using semantic versioning comparison

**Rationale**:
- Prevents inconsistent releases where tag doesn't match plugin version
- Catches common mistakes before assets are built or uploaded
- Fails fast, saving time and resources

**Alternatives Considered**:
- **Manual validation**: Error-prone, easy to forget
- **Version in single file**: Requires sync scripts, still fragile
- **Post-release validation**: Too late - users may have downloaded incorrect version

**Implementation Approach**:
- Extract version from git tag using parameter expansion: `${GITHUB_REF#refs/tags/v}`
- Parse JSON files using `jq` (pre-installed on GitHub Actions runners)
- Use bash comparison with sort -V for semantic version ordering
- Fail workflow immediately if mismatch detected

**Best Practices**:
- Validate early in workflow (before build step)
- Provide clear error message showing which files have mismatched versions
- Support both `v1.2.3` and `1.2.3` tag formats (normalize by stripping `v` prefix)

### 3. Release Notes Generation from Commits

**Decision**: Use git log with custom formatting, filtered by patterns, organized by conventional commit categories

**Rationale**:
- Native git commands available in all CI environments
- No external dependencies or API rate limits
- Full control over filtering and formatting
- Supports conventional commits (feat:, fix:, etc.) for categorization

**Alternatives Considered**:
- **github-changelog-generator**: Ruby dependency, slower, less flexible
- **conventional-changelog**: npm package, adds build dependency
- **GitHub's auto-generated release notes**: Limited customization, includes all commits (noisy)

**Implementation Approach**:
```bash
# Get commits since last tag
git log $(git describe --tags --abbrev=0 HEAD^)..HEAD --pretty=format:"%s"

# Filter out merge commits and CI messages
grep -Ev "^Merge|^chore\(deps\)|^ci:"

# Categorize by conventional commit prefix
awk '/^feat:/ {features = features $0 "\n"; next}
     /^fix:/ {fixes = fixes $0 "\n"; next}
     {other = other $0 "\n"}
     END {print "## Features\n" features "\n## Fixes\n" fixes "\n## Other\n" other}'
```

**Best Practices**:
- Filter patterns: Exclude `Merge branch`, `Merge pull request`, CI commits, dependency updates
- Support conventional commits but don't require them (uncategorized go to "Other Changes")
- Remove commit prefix in output (e.g., `feat: Add X` → `Add X`)
- Handle empty categories gracefully (omit section if no commits)

### 4. Retry Logic with Exponential Backoff

**Decision**: Implement retry wrapper function in bash with configurable max attempts and backoff multiplier

**Rationale**:
- Handles transient GitHub API failures (rate limits, network issues, 502/503 errors)
- Exponential backoff prevents overwhelming the service during incidents
- Reusable across multiple workflow steps (upload, API calls)

**Alternatives Considered**:
- **GitHub Actions retry action**: Limited customization, less transparent
- **No retries**: Would fail on transient errors
- **Built-in retry in release action**: Not all actions support this

**Implementation Approach**:
```bash
retry_with_backoff() {
    local max_attempts=3
    local timeout=1
    local attempt=1
    local exitCode=0

    while [ $attempt -le $max_attempts ]; do
        if "$@"; then
            return 0
        else
            exitCode=$?
        fi

        if [ $attempt -lt $max_attempts ]; then
            echo "Attempt $attempt failed. Retrying in ${timeout}s..."
            sleep $timeout
            timeout=$((timeout * 2))
        fi
        attempt=$((attempt + 1))
    done

    echo "Command failed after $max_attempts attempts"
    return $exitCode
}
```

**Best Practices**:
- Max 3 attempts (as specified in requirements)
- Initial timeout: 1 second
- Backoff multiplier: 2x (exponential)
- Log each attempt with attempt number and wait time
- Preserve and return original exit code

### 5. Build Process for Release Artifacts

**Decision**: Use existing esbuild configuration with production flag for minification

**Rationale**:
- Project already uses esbuild (configured in esbuild.config.mjs)
- `npm run build` command already exists and generates production-ready main.js
- No additional tooling needed

**Build Command**:
```bash
npm ci              # Clean install (faster, more reliable than npm install)
npm run build       # Runs: node esbuild.config.mjs production
```

**Required Artifacts**:
- `main.js` - Built plugin code (generated by esbuild)
- `manifest.json` - Plugin metadata (source file, copied as-is)
- `styles.css` - Plugin styles (if exists, copied as-is)

**Validation**:
- Verify all required files exist after build
- Check file sizes (warn if main.js > 1MB, fail if any file > 100MB)
- Verify manifest.json is valid JSON

### 6. Pre-release Detection

**Decision**: Detect pre-release from tag suffix using regex pattern matching

**Rationale**:
- Semantic versioning standard defines pre-release format: `1.0.0-alpha`, `1.0.0-beta.1`
- GitHub Releases API has native pre-release flag
- Users need to distinguish stable from pre-release versions

**Detection Logic**:
```bash
if [[ "$TAG" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+-(.+)$ ]]; then
    IS_PRERELEASE="true"
    PRERELEASE_TAG="${BASH_REMATCH[1]}"
else
    IS_PRERELEASE="false"
fi
```

**Supported Formats**:
- `v1.0.0-alpha` → pre-release
- `v1.0.0-beta.1` → pre-release
- `v1.0.0-rc.2` → pre-release
- `v1.0.0` → stable release

**Best Practices**:
- Mark pre-releases clearly in GitHub UI
- Include pre-release identifier in release title (e.g., "v1.0.0-beta.1")
- Document pre-release semantics in release notes

### 7. Duplicate Release Prevention

**Decision**: Check for existing release via GitHub API before attempting creation

**Rationale**:
- Prevents accidental overwrites of published releases
- Enforces semantic versioning immutability principle
- Provides clear feedback when maintainer needs to use new version number

**Implementation Approach**:
```bash
# Check if release exists
response=$(gh release view "$TAG" --json tagName 2>&1)
if [ $? -eq 0 ]; then
    echo "ERROR: Release $TAG already exists"
    echo "To re-release, first delete the existing release manually"
    exit 1
fi
```

**Best Practices**:
- Use `gh` CLI (pre-installed on GitHub Actions)
- Check early in workflow (before build)
- Provide actionable error message
- Suggest manual deletion if truly needed (intentional action)

### 8. Workflow Notifications

**Decision**: Use GitHub Actions built-in notification mechanisms plus optional Slack/Discord webhooks

**Rationale**:
- GitHub UI shows workflow status natively
- Email notifications for workflow failures (configurable in user settings)
- Can extend with custom notifications via webhooks if needed

**GitHub Native Notifications**:
- Workflow status visible on commit/tag in GitHub UI
- Email sent to workflow initiator on failure (if user has email notifications enabled)
- GitHub mobile app push notifications

**Optional Enhancements** (future):
- Slack webhook for release announcements
- Discord webhook for community notifications
- GitHub repository webhook events

**Best Practices**:
- Set workflow name clearly: `name: Release`
- Use job names that describe purpose: `build`, `validate`, `publish`
- Include key information in workflow run title
- Log detailed information for troubleshooting

### 9. Workflow Logging Strategy

**Decision**: Use GitHub Actions built-in logging with structured output and log groups

**Rationale**:
- GitHub Actions logs are automatically persisted
- Collapsible log groups improve readability
- Supports ANSI colors for visual clarity
- Searchable via GitHub UI

**Implementation Approach**:
```bash
echo "::group::Validating version"
echo "Tag version: $TAG_VERSION"
echo "Manifest version: $MANIFEST_VERSION"
echo "::endgroup::"

echo "::notice::Release $TAG created successfully"
echo "::error::Version mismatch detected"
```

**Log Levels**:
- `::debug::` - Verbose debugging info
- `::notice::` - Important info (success messages)
- `::warning::` - Non-fatal issues
- `::error::` - Failures

**Best Practices**:
- Use log groups for multi-line output
- Log inputs/outputs of each major step
- Include timestamps for performance debugging
- Preserve logs for at least 90 days (GitHub default)

## Technology Stack Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| CI/CD Platform | GitHub Actions | Native integration, no external dependencies |
| Workflow Trigger | Tag push (`v*.*.*`) | Standard semantic versioning pattern |
| Build Tool | esbuild (existing) | Already configured, fast builds |
| Release Creation | ncipollo/release-action@v1 | Mature, handles retries, good error messages |
| Version Parsing | jq | Pre-installed, reliable JSON parsing |
| Release Notes | git log + bash | Native tools, full control, no dependencies |
| Retry Logic | Custom bash function | Reusable, configurable, transparent |
| Authentication | GITHUB_TOKEN (auto) | Secure, no manual secret management |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| GitHub API rate limits | Retry with exponential backoff, use GITHUB_TOKEN (higher limits) |
| Build failures | Fail fast before asset upload, validate build output |
| Version inconsistencies | Early validation step before any irreversible actions |
| Transient network issues | Retry logic on upload/API calls |
| Large asset sizes | Validate size before upload, fail if exceeds limits |
| Workflow syntax errors | Test workflow in feature branch before merging |
| Missing required files | Explicit validation of artifact existence |

## Next Steps

With research complete, proceed to Phase 1:
1. Generate data-model.md (minimal - mainly workflow entities)
2. Generate contracts/ (workflow inputs/outputs)
3. Generate quickstart.md (how to trigger releases)
4. Update agent context with new technologies
