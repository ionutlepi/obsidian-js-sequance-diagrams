import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('generate-release-notes.sh', () => {
  const scriptPath = path.join(__dirname, '../../scripts/release/generate-release-notes.sh');
  const tempDir = '/tmp/release-notes-test';
  const outputFile = path.join(tempDir, 'release-notes.md');

  beforeEach(() => {
    // Ensure script exists (will fail initially in TDD)
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found: ${scriptPath} - implement it to pass this test`);
    }

    // Create temp directory for test outputs
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup temp files
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
  });

  it('should filter out merge commits', () => {
    // Create a mock git log output with merge commits
    const mockLog = `feat: add new feature
Merge pull request #123 from branch
fix: fix bug
Merge branch 'main' into feature`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    // Should include feature and fix
    expect(notes).toContain('add new feature');
    expect(notes).toContain('fix bug');

    // Should NOT include merge commits
    expect(notes).not.toContain('Merge pull request');
    expect(notes).not.toContain('Merge branch');
  });

  it('should filter out CI commits', () => {
    const mockLog = `feat: add feature
ci: update workflow
chore(deps): bump version
fix: fix issue`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    expect(notes).toContain('add feature');
    expect(notes).toContain('fix issue');
    expect(notes).not.toContain('ci:');
    expect(notes).not.toContain('chore(deps)');
  });

  it('should categorize feat: commits as Features', () => {
    const mockLog = `feat: implement user authentication
feat: add dark mode support`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    expect(notes).toContain('## Features');
    expect(notes).toContain('implement user authentication');
    expect(notes).toContain('add dark mode support');
  });

  it('should categorize fix: commits as Fixes', () => {
    const mockLog = `fix: resolve memory leak
fix: correct typo in error message`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    expect(notes).toContain('## Fixes');
    expect(notes).toContain('resolve memory leak');
    expect(notes).toContain('correct typo');
  });

  it('should categorize uncategorized commits as Other Changes', () => {
    const mockLog = `docs: update README
refactor: improve code structure
perf: optimize database queries`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    expect(notes).toContain('## Other Changes');
    expect(notes).toContain('docs: update README');
    expect(notes).toContain('refactor: improve code structure');
    expect(notes).toContain('perf: optimize database queries');
  });

  it('should strip conventional commit prefixes in output', () => {
    const mockLog = `feat: add new feature
fix: fix bug
docs: update docs`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    // Commit messages should appear without prefixes
    expect(notes).toContain('add new feature');
    expect(notes).toContain('fix bug');
    expect(notes).toContain('update docs');

    // Should not have the prefix format in the bullet points
    expect(notes).not.toMatch(/- feat:/);
    expect(notes).not.toMatch(/- fix:/);
  });

  it('should omit empty sections', () => {
    const mockLog = `feat: add feature`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    expect(notes).toContain('## Features');
    expect(notes).not.toContain('## Fixes');
    expect(notes).not.toContain('## Other Changes');
  });

  it('should handle empty commit range gracefully', () => {
    const mockLog = '';

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    // Should create valid markdown even with no commits
    expect(notes).toBeTruthy();
    expect(notes.trim().length).toBeGreaterThan(0);
  });

  it('should write to specified output file', () => {
    const customOutput = path.join(tempDir, 'custom-notes.md');
    const mockLog = 'feat: test feature';

    try {
      execSync(
        `echo "${mockLog}" | ${scriptPath} --stdin --output ${customOutput}`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      expect(fs.existsSync(customOutput)).toBe(true);
      const notes = fs.readFileSync(customOutput, 'utf-8');
      expect(notes).toContain('test feature');
    } finally {
      if (fs.existsSync(customOutput)) {
        fs.unlinkSync(customOutput);
      }
    }
  });

  it('should handle multiple categories in one release', () => {
    const mockLog = `feat: add authentication
fix: resolve login bug
feat: add profile page
docs: update API docs
fix: correct validation`;

    const result = execSync(
      `echo "${mockLog}" | ${scriptPath} --stdin --output ${outputFile}`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    const notes = fs.readFileSync(outputFile, 'utf-8');

    // Should have all three sections
    expect(notes).toContain('## Features');
    expect(notes).toContain('## Fixes');
    expect(notes).toContain('## Other Changes');

    // Features section should come before Fixes
    const featuresIndex = notes.indexOf('## Features');
    const fixesIndex = notes.indexOf('## Fixes');
    const otherIndex = notes.indexOf('## Other Changes');

    expect(featuresIndex).toBeGreaterThan(-1);
    expect(fixesIndex).toBeGreaterThan(featuresIndex);
    expect(otherIndex).toBeGreaterThan(fixesIndex);
  });
});
