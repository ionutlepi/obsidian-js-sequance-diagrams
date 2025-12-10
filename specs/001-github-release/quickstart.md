# Quickstart: GitHub Release Process

**Feature**: 001-github-release
**Date**: 2025-11-30
**Audience**: Maintainers who want to create new plugin releases

## Overview

This guide shows you how to create a new release of the Obsidian plugin. The release process is fully automated once you push a version tag.

## Prerequisites

Before creating a release, ensure:

1. ✅ All changes are committed and merged to `main` branch
2. ✅ Tests are passing (`npm test`)
3. ✅ Build is successful (`npm run build`)
4. ✅ Version numbers are updated in:
   - `manifest.json` (`.version` field)
   - `package.json` (`.version` field)
5. ✅ CHANGELOG or release notes prepared (optional but recommended)

## Quick Release (3 Steps)

### Step 1: Update Version Numbers

Edit both `manifest.json` and `package.json` to have the **same** version number:

```bash
# Example: updating to version 1.2.3
# Edit manifest.json
{
  "version": "1.2.3",  # ← Update this
  ...
}

# Edit package.json
{
  "version": "1.2.3",  # ← Update this to match
  ...
}
```

**Important**: Both files MUST have identical version numbers, or the release will fail.

### Step 2: Commit Version Bump

```bash
git add manifest.json package.json
git commit -m "chore: bump version to 1.2.3"
git push origin main
```

### Step 3: Create and Push Tag

```bash
# Create tag (must start with 'v')
git tag v1.2.3

# Push tag to trigger release workflow
git push origin v1.2.3
```

**That's it!** The automated workflow will:
- Build the plugin
- Validate versions
- Generate release notes
- Create GitHub release
- Upload plugin files

## Monitoring the Release

### Check Workflow Status

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Find the "Release" workflow run for your tag
4. Watch real-time progress (typically completes in 2-3 minutes)

### Success Indicators

✅ Green checkmark on the workflow
✅ New release visible at `https://github.com/[owner]/[repo]/releases`
✅ Release contains:
   - `main.js`
   - `manifest.json`
   - `styles.css`
   - Generated release notes

### If Something Goes Wrong

❌ If the workflow fails:

1. Click on the failed workflow run
2. Expand the failed step to see error details
3. Common issues:
   - **Version mismatch**: manifest.json and package.json don't match
   - **Duplicate release**: Tag already exists (see "Fixing Mistakes" below)
   - **Build failure**: Run `npm run build` locally to debug

## Creating Pre-Releases

For beta, alpha, or RC versions:

```bash
# Update versions to include pre-release suffix
# manifest.json and package.json:
{
  "version": "1.3.0-beta.1",
  ...
}

# Create tag with same suffix
git tag v1.3.0-beta.1
git push origin v1.3.0-beta.1
```

Pre-releases are automatically detected and marked in GitHub, preventing users from accidentally installing unstable versions.

**Supported Formats**:
- `v1.0.0-alpha`
- `v1.0.0-beta.1`
- `v1.0.0-rc.2`

## Fixing Mistakes

### Wrong Version Number

If you pushed a tag with the wrong version:

```bash
# Delete local tag
git tag -d v1.2.3

# Delete remote tag
git push origin :refs/tags/v1.2.3

# If release was already created, delete it manually on GitHub:
# https://github.com/[owner]/[repo]/releases → Edit → Delete release

# Then create correct tag
git tag v1.2.4
git push origin v1.2.4
```

### Version Numbers Don't Match

If workflow fails with "version mismatch":

```bash
# Fix the version numbers
vim manifest.json  # Update version
vim package.json   # Update to match

# Commit fix
git add manifest.json package.json
git commit -m "fix: correct version numbers"
git push origin main

# Delete and recreate tag
git tag -d v1.2.3
git push origin :refs/tags/v1.2.3
git tag v1.2.3
git push origin v1.2.3
```

### Release Already Exists

If workflow fails with "Release already exists":

1. Go to GitHub releases page
2. Find the existing release
3. Click "Delete" (this is intentional - prevents accidents)
4. Re-run the workflow or push the tag again

## Advanced: Manual Release Notes

By default, release notes are auto-generated from commit messages. For better control:

### Use Conventional Commits

Structure your commit messages to auto-categorize:

```bash
feat: add new diagram theme        # → Features section
fix: correct color rendering        # → Fixes section
docs: update README                 # → Other Changes section
chore(deps): update dependencies    # → Filtered out (not shown)
```

### Writing Good Commit Messages for Releases

✅ **Good** (will appear in release notes):
```
feat: add title alias support
fix: correct version validation logic
perf: optimize diagram rendering
```

❌ **Will be filtered out**:
```
Merge pull request #123
ci: update GitHub Actions
chore(deps): bump dependencies
```

## Testing the Workflow (Safely)

Before creating a production release, test on a feature branch:

1. Create feature branch: `git checkout -b test-release-workflow`
2. Update version to test version (e.g., `0.0.1-test`)
3. Push tag: `git tag v0.0.1-test && git push origin v0.0.1-test`
4. Verify workflow runs successfully
5. Delete test release and tag when done
6. Return to main for real release

## Troubleshooting

### Workflow Not Triggering

**Problem**: Pushed tag but no workflow run appears

**Causes**:
- Tag doesn't start with `v` → Add `v` prefix
- Tag doesn't match semver pattern → Use `v1.2.3` format
- GitHub Actions disabled → Check repository settings

**Solution**:
```bash
# Correct format
git tag v1.2.3  # ✅ Triggers workflow
git tag 1.2.3   # ❌ Won't trigger
git tag release-1.2.3  # ❌ Wrong prefix
```

### Build Fails During Workflow

**Problem**: Workflow fails at "Build" step

**Causes**:
- Dependencies out of sync
- esbuild configuration issue
- TypeScript compilation errors

**Solution**:
```bash
# Test build locally first
npm ci
npm run build

# Fix any errors, commit, then retry release
```

### Workflow Times Out

**Problem**: Workflow runs for >5 minutes and times out

**Causes**:
- Network issues (rare)
- GitHub API rate limits (very rare)
- Extremely large assets

**Solution**:
- Wait a few minutes and retry
- Check GitHub Status: https://www.githubstatus.com/
- If assets are large (>50MB), consider optimization

## Release Checklist

Use this checklist before each release:

```markdown
- [ ] All changes committed and pushed to main
- [ ] Tests passing: `npm test`
- [ ] Build successful: `npm run build`
- [ ] Version updated in manifest.json
- [ ] Version updated in package.json
- [ ] Both versions match exactly
- [ ] Tag format correct (v1.2.3)
- [ ] Commit messages follow conventions (optional)
- [ ] No existing release for this version
- [ ] Ready to push tag!
```

## Getting Help

- **Workflow logs**: Check GitHub Actions tab for detailed error messages
- **Script source**: See `scripts/release/` for validation and release note scripts
- **Issues**: Report problems at repository issues page
- **Documentation**: Full planning docs in `specs/001-github-release/`

## Next Steps

After a successful release:

1. ✅ Verify release appears on GitHub
2. ✅ Test plugin installation from release
3. ✅ Announce release (if applicable)
4. ✅ Start working on next version

---

**Remember**: The workflow automatically handles:
- Building plugin artifacts
- Generating release notes
- Creating GitHub release
- Uploading assets
- Retry on transient failures
- Notifications on completion

You only need to: **update versions** → **commit** → **tag** → **push** 🚀
