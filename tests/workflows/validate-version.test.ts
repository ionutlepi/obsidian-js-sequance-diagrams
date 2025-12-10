import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('validate-version.sh', () => {
  const scriptPath = path.join(__dirname, '../../scripts/release/validate-version.sh');
  const tempDir = '/tmp/validate-version-test';
  const manifestPath = path.join(tempDir, 'manifest.json');
  const packagePath = path.join(tempDir, 'package.json');

  beforeEach(() => {
    // Ensure script exists (will fail initially in TDD)
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found: ${scriptPath} - implement it to pass this test`);
    }

    // Create temp directory for test files
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup temp files
    if (fs.existsSync(manifestPath)) {
      fs.unlinkSync(manifestPath);
    }
    if (fs.existsSync(packagePath)) {
      fs.unlinkSync(packagePath);
    }
  });

  it('should exit 0 when all versions match', () => {
    // Create matching version files
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.2.3' }));
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.2.3' }));

    try {
      const result = execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.3`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      expect(result).toContain('✓');
      expect(result).toContain('match');
    } catch (error: any) {
      // Should not throw
      expect(error).toBeUndefined();
    }
  });

  it('should exit 1 when tag version does not match manifest', () => {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.2.3' }));
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.2.4' }));

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.4`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stderr.toString()).toContain('manifest.json');
      expect(error.stderr.toString()).toContain('1.2.4');
      expect(error.stderr.toString()).toContain('1.2.3');
    }
  });

  it('should exit 1 when tag version does not match package.json', () => {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.2.3' }));
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.2.4' }));

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.3`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stderr.toString()).toContain('package.json');
      expect(error.stderr.toString()).toContain('1.2.3');
      expect(error.stderr.toString()).toContain('1.2.4');
    }
  });

  it('should exit 2 when manifest.json is missing', () => {
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.2.3' }));
    // Don't create manifest.json

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.3`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(2);
      expect(error.stderr.toString()).toContain('manifest.json');
      expect(error.stderr.toString()).toContain('not found');
    }
  });

  it('should exit 2 when package.json is missing', () => {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.2.3' }));
    // Don't create package.json

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.3`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(2);
      expect(error.stderr.toString()).toContain('package.json');
      expect(error.stderr.toString()).toContain('not found');
    }
  });

  it('should exit 2 when manifest.json is invalid JSON', () => {
    fs.writeFileSync(manifestPath, 'not valid json {');
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.2.3' }));

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.3`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(2);
      expect(error.stderr.toString()).toContain('manifest.json');
      expect(error.stderr.toString()).toMatch(/invalid|parse|JSON/i);
    }
  });

  it('should exit 2 when package.json is invalid JSON', () => {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.2.3' }));
    fs.writeFileSync(packagePath, 'not valid json {');

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.3`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(2);
      expect(error.stderr.toString()).toContain('package.json');
      expect(error.stderr.toString()).toMatch(/invalid|parse|JSON/i);
    }
  });

  it('should require tag version argument', () => {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.2.3' }));
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.2.3' }));

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath}`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBeGreaterThan(0);
      expect(error.stderr.toString()).toContain('version');
    }
  });

  it('should provide clear error messages for version mismatches', () => {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.0.0' }));
    fs.writeFileSync(packagePath, JSON.stringify({ version: '2.0.0' }));

    try {
      execSync(
        `cd ${tempDir} && ${scriptPath} 1.0.0`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );
      expect(true).toBe(false);
    } catch (error: any) {
      const stderr = error.stderr.toString();

      // Should show what was expected and what was found
      expect(stderr).toContain('1.0.0');
      expect(stderr).toContain('2.0.0');

      // Should indicate which file had the mismatch
      expect(stderr).toContain('package.json');
    }
  });

  it('should handle versions with pre-release identifiers', () => {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: '1.2.3-beta.1' }));
    fs.writeFileSync(packagePath, JSON.stringify({ version: '1.2.3-beta.1' }));

    try {
      const result = execSync(
        `cd ${tempDir} && ${scriptPath} 1.2.3-beta.1`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      expect(result).toContain('✓');
    } catch (error: any) {
      expect(error).toBeUndefined();
    }
  });
});
