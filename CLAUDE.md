# obsidian-sequancejs Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-30

## Active Technologies
- TypeScript 5.x (existing plugin infrastructure) (002-title-alias-support)
- Plugin settings via Obsidian's data.json (no new storage requirements) (002-title-alias-support)
- TypeScript 5.3.0 (existing plugin infrastructure) + GitHub Actions workflows, esbuild (existing build system), git CLI (001-github-release)
- N/A (workflow operates on git repository and GitHub Releases API) (001-github-release)

- TypeScript 5.x (required for Obsidian plugin development) (001-sqjs-renderer)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (required for Obsidian plugin development): Follow standard conventions

## Recent Changes
- 001-github-release: Added TypeScript 5.3.0 (existing plugin infrastructure) + GitHub Actions workflows, esbuild (existing build system), git CLI
- 002-title-alias-support: Added TypeScript 5.x (existing plugin infrastructure)

- 001-sqjs-renderer: Added TypeScript 5.x (required for Obsidian plugin development)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
