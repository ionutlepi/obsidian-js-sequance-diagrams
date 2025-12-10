#!/bin/bash
set -euo pipefail

# Generate release notes from git commits with categorization
# Usage:
#   generate-release-notes.sh [--stdin] [--output FILE]
#   generate-release-notes.sh TAG [--output FILE]

generate_release_notes() {
  local use_stdin=false
  local output_file="release-notes.md"
  local tag=""

  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --stdin)
        use_stdin=true
        shift
        ;;
      --output)
        output_file="$2"
        shift 2
        ;;
      -*)
        echo "ERROR: Unknown option $1" >&2
        exit 1
        ;;
      *)
        tag="$1"
        shift
        ;;
    esac
  done

  # Get commits either from stdin or git log
  local commits
  if [ "$use_stdin" = true ]; then
    commits=$(cat)
  else
    # Find previous tag
    local prev_tag
    prev_tag=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

    if [ -z "$prev_tag" ]; then
      # No previous tag, get all commits
      commits=$(git log --pretty=format:"%s" 2>/dev/null || echo "")
    else
      # Get commits since previous tag
      commits=$(git log --pretty=format:"%s" "${prev_tag}..HEAD" 2>/dev/null || echo "")
    fi
  fi

  # Arrays to store categorized commits
  local -a features=()
  local -a fixes=()
  local -a other=()

  # Process each commit line
  while IFS= read -r line; do
    # Skip empty lines
    [ -z "$line" ] && continue

    # Filter out merge commits
    if [[ "$line" =~ ^Merge ]]; then
      continue
    fi

    # Filter out CI commits
    if [[ "$line" =~ ^ci: ]] || [[ "$line" =~ ^ci\( ]]; then
      continue
    fi

    # Filter out dependency updates
    if [[ "$line" =~ ^chore\(deps\) ]]; then
      continue
    fi

    # Categorize by conventional commit prefix
    if [[ "$line" =~ ^feat:\ (.+)$ ]]; then
      # Extract message without prefix
      local msg="${BASH_REMATCH[1]}"
      features+=("$msg")
    elif [[ "$line" =~ ^feat\(.+\):\ (.+)$ ]]; then
      # Extract message without prefix (with scope)
      local msg="${BASH_REMATCH[1]}"
      features+=("$msg")
    elif [[ "$line" =~ ^fix:\ (.+)$ ]]; then
      # Extract message without prefix
      local msg="${BASH_REMATCH[1]}"
      fixes+=("$msg")
    elif [[ "$line" =~ ^fix\(.+\):\ (.+)$ ]]; then
      # Extract message without prefix (with scope)
      local msg="${BASH_REMATCH[1]}"
      fixes+=("$msg")
    else
      # Keep other commits as-is (they may have other prefixes like docs:, refactor:, etc.)
      other+=("$line")
    fi
  done <<< "$commits"

  # Generate markdown output
  {
    # Only include sections that have commits
    if [ ${#features[@]} -gt 0 ]; then
      echo "## Features"
      echo ""
      for commit in "${features[@]}"; do
        echo "- $commit"
      done
      echo ""
    fi

    if [ ${#fixes[@]} -gt 0 ]; then
      echo "## Fixes"
      echo ""
      for commit in "${fixes[@]}"; do
        echo "- $commit"
      done
      echo ""
    fi

    if [ ${#other[@]} -gt 0 ]; then
      echo "## Other Changes"
      echo ""
      for commit in "${other[@]}"; do
        echo "- $commit"
      done
      echo ""
    fi

    # If no commits at all, output a minimal message
    if [ ${#features[@]} -eq 0 ] && [ ${#fixes[@]} -eq 0 ] && [ ${#other[@]} -eq 0 ]; then
      echo "No changes to report."
      echo ""
    fi
  } > "$output_file"

  echo "✓ Release notes generated: $output_file" >&2
}

generate_release_notes "$@"
