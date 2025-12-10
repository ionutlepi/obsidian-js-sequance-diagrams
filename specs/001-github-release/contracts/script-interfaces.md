# Script Interfaces Contract

**Feature**: 001-github-release
**Version**: 1.0.0
**Date**: 2025-11-30

## Overview

This contract defines the interface for reusable bash scripts used by the release workflow.

## Script 1: validate-version.sh

### Purpose

Validate that version numbers are consistent across manifest.json, package.json, and git tag.

### Interface

```bash
#!/bin/bash
# Usage: ./validate-version.sh <tag-version>
# Exit codes: 0 = success, 1 = validation failed, 2 = file error
```

### Inputs

**Positional Arguments**:
- `$1`: Tag version (e.g., "1.2.3") - REQUIRED

**Expected Files** (in current directory):
- `manifest.json` - Plugin manifest file
- `package.json` - NPM package file

### Outputs

**stdout**:
- Validation progress messages
- Version comparison results
- Success confirmation or error details

**Environment Variables** (exported):
- `MANIFEST_VERSION`: Version from manifest.json
- `PACKAGE_VERSION`: Version from package.json

**Exit Codes**:
- `0`: All versions match successfully
- `1`: Version mismatch detected
- `2`: Required file missing or invalid JSON

### Example Usage

```bash
# Success case
$ ./validate-version.sh "1.2.3"
Validating version consistency...
Tag version: 1.2.3
Manifest version: 1.2.3
Package version: 1.2.3
✓ All versions match: 1.2.3

$ echo $?
0

# Failure case - mismatch
$ ./validate-version.sh "1.2.4"
Validating version consistency...
Tag version: 1.2.4
Manifest version: 1.2.3
Package version: 1.2.3
ERROR: Tag version (1.2.4) does not match manifest.json (1.2.3)

$ echo $?
1

# Failure case - missing file
$ ./validate-version.sh "1.2.3"
ERROR: manifest.json not found

$ echo $?
2
```

### Implementation Contract

```bash
#!/bin/bash
set -euo pipefail

validate_version() {
  local tag_version="$1"

  # Validate input
  if [ -z "$tag_version" ]; then
    echo "ERROR: Tag version required as first argument"
    exit 2
  fi

  # Check required files exist
  if [ ! -f "manifest.json" ]; then
    echo "ERROR: manifest.json not found"
    exit 2
  fi

  if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found"
    exit 2
  fi

  # Parse versions
  local manifest_version
  local package_version

  manifest_version=$(jq -r '.version' manifest.json) || {
    echo "ERROR: Failed to parse manifest.json"
    exit 2
  }

  package_version=$(jq -r '.version' package.json) || {
    echo "ERROR: Failed to parse package.json"
    exit 2
  }

  # Export for workflow use
  export MANIFEST_VERSION="$manifest_version"
  export PACKAGE_VERSION="$package_version"

  echo "Validating version consistency..."
  echo "Tag version: $tag_version"
  echo "Manifest version: $manifest_version"
  echo "Package version: $package_version"

  # Compare versions
  if [ "$tag_version" != "$manifest_version" ]; then
    echo "ERROR: Tag version ($tag_version) does not match manifest.json ($manifest_version)"
    exit 1
  fi

  if [ "$tag_version" != "$package_version" ]; then
    echo "ERROR: Tag version ($tag_version) does not match package.json ($package_version)"
    exit 1
  fi

  echo "✓ All versions match: $tag_version"
  exit 0
}

# Execute
validate_version "$1"
```

### Testing Contract

**Test Cases Required**:
1. All versions match → exit 0
2. Tag ≠ manifest → exit 1
3. Tag ≠ package → exit 1
4. manifest.json missing → exit 2
5. package.json missing → exit 2
6. Invalid JSON in manifest → exit 2
7. Invalid JSON in package → exit 2
8. Missing version field in manifest → exit 2
9. Missing version field in package → exit 2

---

## Script 2: generate-release-notes.sh

### Purpose

Generate categorized release notes from git commit history.

### Interface

```bash
#!/bin/bash
# Usage: ./generate-release-notes.sh <tag> [output-file]
# Exit codes: 0 = success, 1 = generation failed
```

### Inputs

**Positional Arguments**:
- `$1`: Current tag (e.g., "v1.2.3") - REQUIRED
- `$2`: Output file path (default: "release-notes.md") - OPTIONAL

**Expected Environment**:
- Git repository with full history (`git log` available)
- At least one commit

### Outputs

**File Output**:
- Markdown file with categorized release notes
- Default path: `release-notes.md`

**stdout**:
- Generation progress
- Commit range used
- Category summaries

**Exit Codes**:
- `0`: Release notes generated successfully
- `1`: Git operation failed or no commits found

### Example Usage

```bash
# Generate notes for v1.2.3
$ ./generate-release-notes.sh "v1.2.3"
Generating release notes for v1.2.3...
Previous tag: v1.2.2
Commit range: v1.2.2..HEAD
Found 12 commits:
  - 3 features
  - 2 fixes
  - 7 other changes
✓ Release notes written to release-notes.md

$ cat release-notes.md
## Release v1.2.3

### Features
- Add pre-release support
- Implement retry logic
- Add version validation

### Fixes
- Fix release notes formatting
- Correct duplicate detection

### Other Changes
- Update documentation
- Improve logging
- Refactor build script
- Clean up dependencies
- Update README
- Add examples
- Improve error messages

# Custom output path
$ ./generate-release-notes.sh "v2.0.0" "notes.md"
✓ Release notes written to notes.md
```

### Implementation Contract

```bash
#!/bin/bash
set -euo pipefail

generate_release_notes() {
  local tag="$1"
  local output_file="${2:-release-notes.md}"

  echo "Generating release notes for $tag..."

  # Find previous tag
  local prev_tag
  prev_tag=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

  local commit_range
  if [ -z "$prev_tag" ]; then
    echo "First release - using all commits"
    commit_range="HEAD"
  else
    echo "Previous tag: $prev_tag"
    commit_range="$prev_tag..HEAD"
    echo "Commit range: $commit_range"
  fi

  # Extract and categorize commits
  local features
  local fixes
  local other

  features=$(git log "$commit_range" --pretty=format:"%s" | \
             grep -E "^feat:" | \
             sed 's/^feat: /- /' || true)

  fixes=$(git log "$commit_range" --pretty=format:"%s" | \
          grep -E "^fix:" | \
          sed 's/^fix: /- /' || true)

  other=$(git log "$commit_range" --pretty=format:"%s" | \
          grep -Ev "^(feat:|fix:|Merge|ci:|chore\(deps\))" | \
          sed 's/^/- /' || true)

  # Count commits
  local feat_count fix_count other_count
  feat_count=$(echo "$features" | grep -c "^- " || echo 0)
  fix_count=$(echo "$fixes" | grep -c "^- " || echo 0)
  other_count=$(echo "$other" | grep -c "^- " || echo 0)

  echo "Found $((feat_count + fix_count + other_count)) commits:"
  echo "  - $feat_count features"
  echo "  - $fix_count fixes"
  echo "  - $other_count other changes"

  # Generate markdown
  {
    echo "## Release $tag"
    echo ""

    if [ -n "$features" ]; then
      echo "### Features"
      echo "$features"
      echo ""
    fi

    if [ -n "$fixes" ]; then
      echo "### Fixes"
      echo "$fixes"
      echo ""
    fi

    if [ -n "$other" ]; then
      echo "### Other Changes"
      echo "$other"
    fi
  } > "$output_file"

  echo "✓ Release notes written to $output_file"
  exit 0
}

# Execute
if [ $# -lt 1 ]; then
  echo "ERROR: Tag required as first argument"
  echo "Usage: $0 <tag> [output-file]"
  exit 1
fi

generate_release_notes "$@"
```

### Filtering Rules

**Excluded Patterns** (case-insensitive):
- `^Merge branch`
- `^Merge pull request`
- `^ci:`
- `^chore(deps):`
- `^chore(deps-dev):`

**Categorization Rules**:
- `^feat:` → Features section
- `^fix:` → Fixes section
- Everything else (not excluded) → Other Changes section

### Testing Contract

**Test Cases Required**:
1. No previous tag (first release) → all commits
2. Previous tag exists → commits since prev tag
3. Only features → Features section only
4. Only fixes → Fixes section only
5. Mixed commits → all sections present
6. No commits → empty notes (still valid)
7. Merge commits filtered out
8. CI commits filtered out
9. Conventional commit prefixes stripped
10. Custom output path works

---

## Script 3: retry-with-backoff.sh

### Purpose

Execute a command with automatic retry and exponential backoff on failure.

### Interface

```bash
#!/bin/bash
# Usage: ./retry-with-backoff.sh [options] -- <command>
# Exit codes: 0 = success, N = command's exit code after retries exhausted
```

### Inputs

**Options**:
- `-m, --max-attempts N`: Maximum retry attempts (default: 3)
- `-i, --initial-timeout N`: Initial timeout in seconds (default: 1)
- `-b, --backoff-multiplier N`: Backoff multiplier (default: 2)

**Positional Arguments**:
- Everything after `--`: Command to execute

### Outputs

**stdout/stderr**:
- Command output (passed through)
- Retry attempt messages
- Final success/failure message

**Exit Codes**:
- `0`: Command succeeded (on any attempt)
- `N`: Command's exit code after all retries exhausted

### Example Usage

```bash
# Success on first try
$ ./retry-with-backoff.sh -- curl -f https://api.github.com
{"status":"ok"}
✓ Command succeeded on attempt 1

$ echo $?
0

# Success after retry
$ ./retry-with-backoff.sh -- sh -c 'if [ ! -f /tmp/ready ]; then exit 1; fi'
Attempt 1 failed with exit code 1
Retrying in 1 seconds...
Attempt 2 failed with exit code 1
Retrying in 2 seconds...
✓ Command succeeded on attempt 3

$ echo $?
0

# Failure after all retries
$ ./retry-with-backoff.sh --max-attempts 3 -- false
Attempt 1 failed with exit code 1
Retrying in 1 seconds...
Attempt 2 failed with exit code 1
Retrying in 2 seconds...
Attempt 3 failed with exit code 1
✗ Command failed after 3 attempts

$ echo $?
1

# Custom retry configuration
$ ./retry-with-backoff.sh \
    --max-attempts 5 \
    --initial-timeout 2 \
    --backoff-multiplier 3 \
    -- curl -f https://flaky-api.example.com
```

### Implementation Contract

```bash
#!/bin/bash
set -euo pipefail

retry_with_backoff() {
  local max_attempts=3
  local initial_timeout=1
  local backoff_multiplier=2

  # Parse options
  while [[ $# -gt 0 ]]; do
    case $1 in
      -m|--max-attempts)
        max_attempts="$2"
        shift 2
        ;;
      -i|--initial-timeout)
        initial_timeout="$2"
        shift 2
        ;;
      -b|--backoff-multiplier)
        backoff_multiplier="$2"
        shift 2
        ;;
      --)
        shift
        break
        ;;
      *)
        echo "ERROR: Unknown option $1"
        exit 1
        ;;
    esac
  done

  local attempt=1
  local timeout=$initial_timeout
  local exit_code=0

  while [ $attempt -le $max_attempts ]; do
    # Execute command
    if "$@"; then
      echo "✓ Command succeeded on attempt $attempt"
      return 0
    else
      exit_code=$?
    fi

    # Check if we should retry
    if [ $attempt -lt $max_attempts ]; then
      echo "Attempt $attempt failed with exit code $exit_code"
      echo "Retrying in ${timeout} seconds..."
      sleep $timeout
      timeout=$((timeout * backoff_multiplier))
    fi

    attempt=$((attempt + 1))
  done

  echo "✗ Command failed after $max_attempts attempts"
  return $exit_code
}

# Execute
retry_with_backoff "$@"
```

### Testing Contract

**Test Cases Required**:
1. Command succeeds on first attempt → exit 0, no retry
2. Command fails once, succeeds on retry → exit 0
3. Command fails all attempts → exit N (command's exit code)
4. Backoff timing correct (1s, 2s, 4s with default config)
5. Custom max attempts honored
6. Custom timeout honored
7. Custom backoff multiplier honored
8. Command with arguments passed correctly
9. Command with pipes/redirects works
10. Exit code preserved from failed command

---

## Cross-Script Integration

### Workflow Usage Pattern

```yaml
- name: Validate versions
  run: |
    chmod +x scripts/release/validate-version.sh
    ./scripts/release/validate-version.sh "${{ env.TAG_VERSION }}"

- name: Generate release notes
  run: |
    chmod +x scripts/release/generate-release-notes.sh
    ./scripts/release/generate-release-notes.sh "${{ github.ref_name }}"

- name: Create release with retry
  run: |
    chmod +x scripts/release/retry-with-backoff.sh
    ./scripts/release/retry-with-backoff.sh --max-attempts 3 -- \
      gh release create "${{ github.ref_name }}" \
        --title "Release ${{ github.ref_name }}" \
        --notes-file release-notes.md \
        main.js manifest.json styles.css
```

## Error Handling Standards

All scripts MUST:
1. Use `set -euo pipefail` for strict error handling
2. Validate all required inputs before execution
3. Provide clear error messages on failure
4. Exit with appropriate exit codes (0 = success, 1 = error, 2 = invalid usage)
5. Clean up temporary files on exit (use trap if needed)

## Logging Standards

All scripts MUST:
1. Log progress at major steps
2. Use clear prefixes: `✓` for success, `✗` for error, `...` for progress
3. Include relevant context in error messages
4. Support quiet mode via `QUIET=1` environment variable (future enhancement)

## Versioning

Script interfaces use semantic versioning:
- **Major**: Breaking changes to interface (arguments, exit codes, output format)
- **Minor**: New optional features (new flags, new output)
- **Patch**: Bug fixes, internal improvements

**Current Version**: 1.0.0
