#!/bin/bash
set -euo pipefail

#############################################################################
# retry-with-backoff.sh
#
# Executes a command with automatic retry and exponential backoff on failure.
#
# Usage: ./retry-with-backoff.sh [options] -- <command>
#
# Options:
#   -m, --max-attempts N        Maximum retry attempts (default: 3)
#   -i, --initial-timeout N     Initial timeout in seconds (default: 1)
#   -b, --backoff-multiplier N  Backoff multiplier (default: 2)
#
# Exit codes:
#   0: Command succeeded (on any attempt)
#   N: Command's exit code after all retries exhausted
#
# Example:
#   ./retry-with-backoff.sh -- curl -f https://api.github.com
#   ./retry-with-backoff.sh --max-attempts 5 -- npm install
#############################################################################

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
        echo "ERROR: Unknown option $1" >&2
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
      echo "Attempt $attempt failed with exit code $exit_code" >&2
      echo "Retrying in ${timeout} seconds..." >&2
      sleep $timeout
      timeout=$((timeout * backoff_multiplier))
    fi

    attempt=$((attempt + 1))
  done

  echo "✗ Command failed after $max_attempts attempts" >&2
  return $exit_code
}

# Execute
retry_with_backoff "$@"
