#!/bin/bash
set -euo pipefail

# Validate version consistency across manifest.json, package.json, and git tag
# Usage: validate-version.sh TAG_VERSION
#
# Exit codes:
#   0 - All versions match
#   1 - Version mismatch detected
#   2 - File not found or invalid JSON

validate_version() {
  local tag_version="$1"

  # Validate argument is provided
  if [ -z "$tag_version" ]; then
    echo "ERROR: Tag version argument required" >&2
    echo "Usage: validate-version.sh TAG_VERSION" >&2
    exit 1
  fi

  # Check file existence
  if [ ! -f "manifest.json" ]; then
    echo "ERROR: manifest.json not found" >&2
    exit 2
  fi

  if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found" >&2
    exit 2
  fi

  # Parse versions from JSON files
  local manifest_version
  local package_version

  # Parse manifest.json version
  if ! manifest_version=$(jq -r '.version' manifest.json 2>&1); then
    echo "ERROR: Failed to parse manifest.json - invalid JSON" >&2
    exit 2
  fi

  if [ -z "$manifest_version" ] || [ "$manifest_version" = "null" ]; then
    echo "ERROR: No version field found in manifest.json" >&2
    exit 2
  fi

  # Parse package.json version
  if ! package_version=$(jq -r '.version' package.json 2>&1); then
    echo "ERROR: Failed to parse package.json - invalid JSON" >&2
    exit 2
  fi

  if [ -z "$package_version" ] || [ "$package_version" = "null" ]; then
    echo "ERROR: No version field found in package.json" >&2
    exit 2
  fi

  # Compare versions
  local has_mismatch=false

  if [ "$tag_version" != "$manifest_version" ]; then
    echo "ERROR: Version mismatch in manifest.json" >&2
    echo "  Tag version:      $tag_version" >&2
    echo "  manifest.json:    $manifest_version" >&2
    has_mismatch=true
  fi

  if [ "$tag_version" != "$package_version" ]; then
    echo "ERROR: Version mismatch in package.json" >&2
    echo "  Tag version:      $tag_version" >&2
    echo "  package.json:     $package_version" >&2
    has_mismatch=true
  fi

  if [ "$has_mismatch" = true ]; then
    echo "" >&2
    echo "Please update version numbers to match the tag before releasing" >&2
    exit 1
  fi

  # All versions match
  echo "✓ Version validation passed: all versions match ($tag_version)"
  exit 0
}

# Validate first argument is provided
if [ $# -eq 0 ]; then
  echo "ERROR: Tag version argument required" >&2
  echo "Usage: validate-version.sh TAG_VERSION" >&2
  exit 1
fi

validate_version "$@"
