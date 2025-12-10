# Workflow Interface Contract

**Feature**: 001-github-release
**Version**: 1.0.0
**Date**: 2025-11-30

## Overview

This contract defines the inputs, outputs, and behavior of the GitHub release workflow.

## Workflow Trigger

**Event**: `push` to `refs/tags/v*`

**Pattern**: Any tag matching `v[0-9]+.[0-9]+.[0-9]+` with optional pre-release suffix

**Examples**:
- `v1.0.0` ✅ (stable release)
- `v1.2.3` ✅ (stable release)
- `v2.0.0-alpha` ✅ (pre-release)
- `v1.0.0-beta.1` ✅ (pre-release)
- `v0.9.0-rc.2` ✅ (pre-release)
- `1.0.0` ❌ (missing 'v' prefix - will not trigger)
- `release-1.0.0` ❌ (wrong format - will not trigger)

## Workflow Inputs

### GitHub Context (Automatic)

```yaml
inputs:
  GITHUB_REF: string              # refs/tags/v1.2.3
  GITHUB_REPOSITORY: string       # owner/repo-name
  GITHUB_TOKEN: string            # Automatic GitHub token
  GITHUB_SHA: string              # Commit SHA that was tagged
```

### Environment Configuration

```yaml
env:
  NODE_VERSION: "20"              # Node.js version for build
  RUNNER_OS: ubuntu-latest        # GitHub Actions runner
```

## Workflow Outputs

### Success Scenario

```yaml
outputs:
  release_id: number              # GitHub release ID
  release_url: string             # HTML URL to release page
  release_tag: string             # Tag name (e.g., "v1.2.3")
  release_name: string            # Release title
  asset_count: number             # Number of uploaded assets
  duration_seconds: number        # Total execution time
```

**Example**:
```json
{
  "release_id": 123456789,
  "release_url": "https://github.com/owner/repo/releases/tag/v1.2.3",
  "release_tag": "v1.2.3",
  "release_name": "Release v1.2.3",
  "asset_count": 3,
  "duration_seconds": 142
}
```

### Failure Scenario

```yaml
outputs:
  error_message: string           # Human-readable error description
  failed_step: string             # Step name that failed
  exit_code: number               # Non-zero exit code
```

**Example**:
```json
{
  "error_message": "Version mismatch: manifest.json has 1.2.3 but tag is v1.2.4",
  "failed_step": "Validate versions",
  "exit_code": 1
}
```

## Workflow Steps Contract

### Step 1: Checkout

**Purpose**: Clone repository with full git history

**Inputs**:
- Repository ref (automatic from trigger)
- Fetch depth: 0 (full history for release notes)

**Outputs**:
- Working directory with full git history

**Failure Conditions**:
- Repository not accessible (permissions issue)
- Network error

**Contract**:
```typescript
interface CheckoutStep {
  action: "actions/checkout@v4";
  with: {
    fetch-depth: 0;
  };
}
```

### Step 2: Setup Node.js

**Purpose**: Install Node.js and npm for building

**Inputs**:
- Node version: 20
- Cache strategy: npm

**Outputs**:
- Node.js and npm available in PATH
- npm dependencies cached (if available)

**Failure Conditions**:
- Node version not available
- Cache restore failure (non-fatal)

**Contract**:
```typescript
interface SetupNodeStep {
  action: "actions/setup-node@v4";
  with: {
    "node-version": "20";
    cache: "npm";
  };
}
```

### Step 3: Extract Version from Tag

**Purpose**: Parse semantic version from git tag

**Inputs**:
- `$GITHUB_REF` environment variable

**Outputs**:
- `TAG_VERSION` environment variable (e.g., "1.2.3")
- `IS_PRERELEASE` environment variable ("true" or "false")

**Script**:
```bash
TAG=${GITHUB_REF#refs/tags/}
VERSION=${TAG#v}
echo "TAG_VERSION=$VERSION" >> $GITHUB_ENV

if [[ "$TAG" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+-(.+)$ ]]; then
  echo "IS_PRERELEASE=true" >> $GITHUB_ENV
else
  echo "IS_PRERELEASE=false" >> $GITHUB_ENV
fi
```

**Failure Conditions**:
- Tag doesn't match expected pattern (should not happen if trigger pattern is correct)

### Step 4: Validate Version Consistency

**Purpose**: Ensure tag version matches manifest.json and package.json

**Inputs**:
- `TAG_VERSION` from previous step
- `manifest.json` file
- `package.json` file

**Outputs**:
- Success (exit 0) if all versions match
- Failure (exit 1) with error message if mismatch

**Script Contract**:
```bash
#!/bin/bash
validate_version() {
  TAG_VERSION=$1
  MANIFEST_VERSION=$(jq -r '.version' manifest.json)
  PACKAGE_VERSION=$(jq -r '.version' package.json)

  echo "Tag version: $TAG_VERSION"
  echo "Manifest version: $MANIFEST_VERSION"
  echo "Package version: $PACKAGE_VERSION"

  if [ "$TAG_VERSION" != "$MANIFEST_VERSION" ]; then
    echo "ERROR: Tag version ($TAG_VERSION) does not match manifest.json ($MANIFEST_VERSION)"
    exit 1
  fi

  if [ "$TAG_VERSION" != "$PACKAGE_VERSION" ]; then
    echo "ERROR: Tag version ($TAG_VERSION) does not match package.json ($PACKAGE_VERSION)"
    exit 1
  fi

  echo "✓ All versions match: $TAG_VERSION"
}
```

**Failure Conditions**:
- Version mismatch between any files
- manifest.json or package.json not found
- Invalid JSON in manifest or package files

### Step 5: Check for Duplicate Release

**Purpose**: Prevent re-releasing same version

**Inputs**:
- `TAG_VERSION` from Step 3
- GitHub repository context

**Outputs**:
- Success (exit 0) if no existing release
- Failure (exit 1) if release already exists

**Script Contract**:
```bash
#!/bin/bash
check_duplicate_release() {
  TAG=$1

  if gh release view "$TAG" &>/dev/null; then
    echo "ERROR: Release $TAG already exists"
    echo "URL: $(gh release view "$TAG" --json url -q '.url')"
    echo "To re-release, manually delete the existing release first"
    exit 1
  fi

  echo "✓ No existing release for $TAG"
}
```

**Failure Conditions**:
- Release with same tag already exists
- GitHub API error (retried with backoff)

### Step 6: Install Dependencies and Build

**Purpose**: Build production-ready plugin artifacts

**Inputs**:
- `package.json` and `package-lock.json`
- Build configuration (`esbuild.config.mjs`)

**Outputs**:
- `main.js` (built plugin)
- `manifest.json` (unchanged, validated)
- `styles.css` (if exists)

**Commands**:
```bash
npm ci
npm run build
```

**Validation**:
```bash
# Verify required files exist
test -f main.js || { echo "ERROR: main.js not generated"; exit 1; }
test -f manifest.json || { echo "ERROR: manifest.json missing"; exit 1; }

# Validate manifest.json is valid JSON
jq empty manifest.json || { echo "ERROR: manifest.json is invalid JSON"; exit 1; }

# Check file sizes
main_size=$(stat -f%z main.js)
if [ $main_size -gt 104857600 ]; then  # 100MB
  echo "ERROR: main.js exceeds 100MB limit"
  exit 1
fi

echo "✓ Build artifacts validated"
```

**Failure Conditions**:
- npm install fails
- Build command fails
- Required artifacts missing
- Artifacts exceed size limits

### Step 7: Generate Release Notes

**Purpose**: Create changelog from commit messages since last release

**Inputs**:
- Full git history (from Step 1)
- Current tag

**Outputs**:
- `release-notes.md` file with categorized changes

**Script Contract**:
```bash
#!/bin/bash
generate_release_notes() {
  TAG=$1
  OUTPUT_FILE="release-notes.md"

  # Get previous tag
  PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

  if [ -z "$PREV_TAG" ]; then
    echo "First release - using all commits"
    COMMIT_RANGE="HEAD"
  else
    echo "Generating notes for $PREV_TAG..$TAG"
    COMMIT_RANGE="$PREV_TAG..HEAD"
  fi

  # Get commits, filter, and categorize
  {
    echo "## Release $TAG"
    echo ""

    # Features
    FEATURES=$(git log $COMMIT_RANGE --pretty=format:"%s" | grep -E "^feat:" | sed 's/^feat: /- /')
    if [ -n "$FEATURES" ]; then
      echo "### Features"
      echo "$FEATURES"
      echo ""
    fi

    # Fixes
    FIXES=$(git log $COMMIT_RANGE --pretty=format:"%s" | grep -E "^fix:" | sed 's/^fix: /- /')
    if [ -n "$FIXES" ]; then
      echo "### Fixes"
      echo "$FIXES"
      echo ""
    fi

    # Other (not merge commits, not CI)
    OTHER=$(git log $COMMIT_RANGE --pretty=format:"%s" | grep -Ev "^(feat:|fix:|Merge|ci:|chore\(deps\))" | sed 's/^/- /')
    if [ -n "$OTHER" ]; then
      echo "### Other Changes"
      echo "$OTHER"
    fi
  } > "$OUTPUT_FILE"

  echo "✓ Release notes generated: $OUTPUT_FILE"
}
```

**Failure Conditions**:
- Git history unavailable
- No commits in range (should still produce minimal notes)

### Step 8: Create GitHub Release (with Retry)

**Purpose**: Publish release with artifacts to GitHub

**Inputs**:
- Tag name
- Release notes content
- Pre-release flag
- Artifact files (main.js, manifest.json, styles.css)

**Outputs**:
- GitHub release created
- Assets uploaded and attached

**Action Contract**:
```yaml
- name: Create Release
  uses: ncipollo/release-action@v1
  with:
    tag: ${{ env.TAG }}
    name: Release ${{ env.TAG }}
    bodyFile: release-notes.md
    prerelease: ${{ env.IS_PRERELEASE }}
    artifacts: "main.js,manifest.json,styles.css"
    token: ${{ secrets.GITHUB_TOKEN }}
    allowUpdates: false
    draft: false
```

**Retry Logic**:
- Automatic retries built into ncipollo/release-action
- Maximum 3 attempts with exponential backoff
- Retry on: network errors, 502/503 responses, rate limits

**Failure Conditions**:
- GitHub API error after retries exhausted
- Authentication failure
- Asset upload failure
- Release already exists (prevented by Step 5)

## Error Handling Contract

### Error Response Format

All failures must output:
1. Clear error message to stdout
2. Failed step name
3. Non-zero exit code

**Example**:
```bash
echo "::error::Version mismatch detected in Validate Version step"
echo "Tag: v1.2.4, Manifest: 1.2.3"
exit 1
```

### Retry Conditions

Steps that MUST support retry with backoff:
- GitHub API calls (duplicate check, release creation)
- Asset uploads
- Network operations

Steps that MUST NOT retry (fail fast):
- Version validation (deterministic)
- Build failures (deterministic)
- File existence checks (deterministic)

## Performance Contract

### Timing Targets

| Step | Target | Maximum |
|------|--------|---------|
| Checkout | 10s | 30s |
| Setup Node | 10s | 30s |
| Version Extract | 1s | 5s |
| Version Validate | 2s | 10s |
| Duplicate Check | 5s | 15s |
| Build | 30s | 120s |
| Release Notes | 10s | 30s |
| Create Release | 30s | 180s |
| **Total** | **< 2min** | **< 5min** |

### Resource Constraints

- Memory: < 2GB (GitHub Actions default)
- Disk: < 5GB (build artifacts + dependencies)
- Network: Standard GitHub Actions bandwidth

## Observability Contract

### Required Logs

Each step MUST log:
1. Step start (with inputs)
2. Key decision points
3. Step completion (with outputs)
4. Errors (with context)

**Example**:
```bash
echo "::group::Validating versions"
echo "Tag version: $TAG_VERSION"
echo "Manifest version: $MANIFEST_VERSION"
echo "Package version: $PACKAGE_VERSION"
echo "::endgroup::"
```

### Notifications

**On Success**:
- GitHub UI shows green checkmark
- Release published notification (if user subscribed)

**On Failure**:
- GitHub UI shows red X
- Email to workflow initiator (if enabled)
- Detailed logs available in Actions tab

## Versioning

This contract uses semantic versioning:
- **Major**: Breaking changes to workflow interface
- **Minor**: New optional features
- **Patch**: Bug fixes, documentation updates

**Current Version**: 1.0.0
