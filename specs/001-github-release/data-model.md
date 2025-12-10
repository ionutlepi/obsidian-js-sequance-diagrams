# Data Model: GitHub Release Process Integration

**Date**: 2025-11-30
**Feature**: 001-github-release
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data entities and structures used by the GitHub release automation workflow. Since this is a CI/CD workflow feature (not application code), the "data model" primarily describes workflow inputs, outputs, and intermediate data structures.

## Entities

### 1. Version Tag

**Description**: A git tag that triggers the release workflow

**Structure**:
```typescript
interface VersionTag {
  // Full tag name as pushed to git (e.g., "v1.2.3", "v1.0.0-beta.1")
  fullTag: string;

  // Semantic version without 'v' prefix (e.g., "1.2.3")
  version: string;

  // Major version number
  major: number;

  // Minor version number
  minor: number;

  // Patch version number
  patch: number;

  // Pre-release identifier (e.g., "beta.1", "alpha", null for stable)
  prerelease: string | null;

  // Whether this is a pre-release
  isPrerelease: boolean;
}
```

**Validation Rules**:
- MUST match pattern: `v?[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?`
- Major, minor, patch MUST be non-negative integers
- Pre-release identifiers MUST be alphanumeric with dots (per semver spec)

**State Transitions**: N/A (immutable once created)

**Example**:
```json
{
  "fullTag": "v1.2.3-beta.1",
  "version": "1.2.3-beta.1",
  "major": 1,
  "minor": 2,
  "patch": 3,
  "prerelease": "beta.1",
  "isPrerelease": true
}
```

### 2. Version Manifest

**Description**: Version information extracted from plugin metadata files

**Structure**:
```typescript
interface VersionManifest {
  // Version from manifest.json
  manifestVersion: string;

  // Version from package.json
  packageVersion: string;

  // Version from git tag
  tagVersion: string;

  // Whether all versions are consistent
  isConsistent: boolean;

  // Detailed validation results
  validation: {
    manifestValid: boolean;
    packageValid: boolean;
    tagValid: boolean;
    allMatch: boolean;
    errors: string[];
  };
}
```

**Validation Rules**:
- All three versions MUST match exactly (string comparison)
- Each version MUST be valid semantic version
- Files MUST exist and be valid JSON

**Example**:
```json
{
  "manifestVersion": "1.2.3",
  "packageVersion": "1.2.3",
  "tagVersion": "1.2.3",
  "isConsistent": true,
  "validation": {
    "manifestValid": true,
    "packageValid": true,
    "tagValid": true,
    "allMatch": true,
    "errors": []
  }
}
```

### 3. Release Notes

**Description**: Generated changelog content for the release

**Structure**:
```typescript
interface ReleaseNotes {
  // Full release notes markdown content
  content: string;

  // Categorized commits
  categories: {
    features: CommitEntry[];
    fixes: CommitEntry[];
    other: CommitEntry[];
  };

  // Commit range used for generation
  commitRange: {
    from: string;  // Previous tag or commit SHA
    to: string;    // Current tag or HEAD
  };

  // Number of commits included
  commitCount: number;
}

interface CommitEntry {
  // Commit SHA (short)
  sha: string;

  // Commit message (subject line only)
  message: string;

  // Conventional commit type (feat, fix, etc.)
  type: string | null;

  // Commit message without type prefix
  description: string;
}
```

**Generation Rules**:
- Filter OUT: merge commits, commits starting with `Merge`, `ci:`, `chore(deps)`
- Categorize BY: conventional commit prefix (feat:, fix:)
- Strip prefix from display (e.g., "feat: Add X" → "Add X")
- Sort by commit date (chronological)

**Example**:
```markdown
## Features
- Add support for pre-release versions
- Implement automatic retry logic

## Fixes
- Fix version validation for patch versions
- Correct release notes formatting

## Other Changes
- Update documentation
- Improve logging output
```

### 4. Build Artifacts

**Description**: Plugin files to be attached to the release

**Structure**:
```typescript
interface BuildArtifacts {
  // All required files present
  complete: boolean;

  // Individual artifact details
  artifacts: {
    mainJs: ArtifactFile;
    manifestJson: ArtifactFile;
    stylesCss: ArtifactFile | null;  // Optional
  };

  // Total size of all artifacts
  totalSizeBytes: number;
}

interface ArtifactFile {
  // File path (relative to repo root)
  path: string;

  // File exists
  exists: boolean;

  // File size in bytes
  sizeBytes: number;

  // File checksum (SHA256)
  checksum: string;
}
```

**Validation Rules**:
- main.js MUST exist and be non-empty
- manifest.json MUST exist and be valid JSON
- styles.css SHOULD exist (warning if missing, not failure)
- No individual file MAY exceed 100MB
- Total size MUST NOT exceed 2GB (GitHub limit)

**Example**:
```json
{
  "complete": true,
  "artifacts": {
    "mainJs": {
      "path": "main.js",
      "exists": true,
      "sizeBytes": 156789,
      "checksum": "a1b2c3..."
    },
    "manifestJson": {
      "path": "manifest.json",
      "exists": true,
      "sizeBytes": 335,
      "checksum": "d4e5f6..."
    },
    "stylesCss": {
      "path": "styles.css",
      "exists": true,
      "sizeBytes": 1024,
      "checksum": "g7h8i9..."
    }
  },
  "totalSizeBytes": 158148
}
```

### 5. Release Result

**Description**: Outcome of the release workflow execution

**Structure**:
```typescript
interface ReleaseResult {
  // Whether release was successful
  success: boolean;

  // GitHub release details (if created)
  release: {
    id: number;
    tagName: string;
    name: string;
    url: string;
    htmlUrl: string;
    createdAt: string;
    assets: AssetInfo[];
  } | null;

  // Workflow execution details
  execution: {
    startTime: string;
    endTime: string;
    durationSeconds: number;
    attempts: number;
  };

  // Error information (if failed)
  error: {
    step: string;
    message: string;
    exitCode: number;
  } | null;
}

interface AssetInfo {
  name: string;
  size: number;
  downloadUrl: string;
  contentType: string;
}
```

**States**:
- `in_progress`: Workflow running
- `success`: Release created successfully
- `failed`: Workflow failed (with error details)

**Example (Success)**:
```json
{
  "success": true,
  "release": {
    "id": 123456,
    "tagName": "v1.2.3",
    "name": "Release v1.2.3",
    "url": "https://api.github.com/repos/owner/repo/releases/123456",
    "htmlUrl": "https://github.com/owner/repo/releases/tag/v1.2.3",
    "createdAt": "2025-11-30T10:30:00Z",
    "assets": [
      {
        "name": "main.js",
        "size": 156789,
        "downloadUrl": "https://github.com/owner/repo/releases/download/v1.2.3/main.js",
        "contentType": "application/javascript"
      }
    ]
  },
  "execution": {
    "startTime": "2025-11-30T10:28:00Z",
    "endTime": "2025-11-30T10:30:15Z",
    "durationSeconds": 135,
    "attempts": 1
  },
  "error": null
}
```

## Data Flow

```
1. Tag Push Event
   ↓
2. Extract VersionTag from GITHUB_REF
   ↓
3. Load VersionManifest (validate consistency)
   ↓
4. Check for existing release (duplicate prevention)
   ↓
5. Build and validate BuildArtifacts
   ↓
6. Generate ReleaseNotes from commit history
   ↓
7. Create GitHub Release with artifacts
   ↓
8. Return ReleaseResult
```

## Persistence

**GitHub Actions Context**: Workflow variables and outputs are stored in GitHub Actions context, accessible via `$GITHUB_OUTPUT` and environment variables.

**GitHub Release**: Once created, release data is persisted by GitHub. Artifacts are stored in GitHub's release asset storage.

**Workflow Logs**: Execution logs are retained by GitHub for 90 days (default retention period).

## Relationships

```
VersionTag
  ↓ (triggers)
VersionManifest (validates against)
  ↓ (if valid)
BuildArtifacts (generates)
  ↓ (builds)
ReleaseNotes (generates)
  ↓ (combines)
ReleaseResult (creates)
```

## Validation Summary

| Entity | Key Validations |
|--------|----------------|
| VersionTag | Semantic version format, pre-release pattern |
| VersionManifest | All versions match, files exist and valid |
| ReleaseNotes | At least 1 commit, valid markdown |
| BuildArtifacts | Required files exist, size within limits |
| ReleaseResult | Release created, all assets uploaded |

## Error Scenarios

1. **Version Mismatch**: VersionManifest.isConsistent = false
2. **Duplicate Release**: Check returns existing release
3. **Build Failure**: BuildArtifacts.complete = false
4. **Upload Failure**: ReleaseResult.success = false (with retry count)
5. **Asset Too Large**: BuildArtifacts validation fails

Each error scenario should set appropriate error details in ReleaseResult and exit workflow with non-zero code.
