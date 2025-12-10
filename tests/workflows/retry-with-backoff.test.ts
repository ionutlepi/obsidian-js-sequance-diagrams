import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('retry-with-backoff.sh', () => {
  const scriptPath = path.join(__dirname, '../../scripts/release/retry-with-backoff.sh');

  beforeEach(() => {
    // Ensure script exists (will fail initially in TDD)
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found: ${scriptPath} - implement it to pass this test`);
    }
  });

  it('should succeed on first attempt when command succeeds', () => {
    const result = execSync(`${scriptPath} -- echo "success"`, { encoding: 'utf-8' });

    expect(result).toContain('success');
    expect(result).toContain('✓ Command succeeded on attempt 1');
  });

  it('should exit with 0 when command succeeds', () => {
    try {
      execSync(`${scriptPath} -- true`, { encoding: 'utf-8' });
      // If we reach here, exit code was 0
      expect(true).toBe(true);
    } catch (error) {
      // Should not throw
      expect(error).toBeUndefined();
    }
  });

  it('should retry failed command with exponential backoff', () => {
    // Create a temporary counter file
    const counterFile = '/tmp/retry-test-counter';
    fs.writeFileSync(counterFile, '0');

    try {
      // Command that fails twice, succeeds on third attempt
      const command = `bash -c 'count=$(cat ${counterFile}); count=$((count + 1)); echo $count > ${counterFile}; if [ $count -lt 3 ]; then exit 1; fi; echo "success"'`;

      const result = execSync(`${scriptPath} -- ${command}`, { encoding: 'utf-8', stdio: 'pipe' });
      const fullOutput = result.toString();

      // Success message goes to stdout
      expect(fullOutput).toContain('success');
      expect(fullOutput).toContain('✓ Command succeeded on attempt 3');

      // Note: Retry messages go to stderr, so they won't appear in stdout
      // This is correct behavior - the script outputs retries to stderr
    } finally {
      // Cleanup
      if (fs.existsSync(counterFile)) {
        fs.unlinkSync(counterFile);
      }
    }
  });

  it('should fail after max attempts exhausted', () => {
    try {
      execSync(`${scriptPath} -- false`, { encoding: 'utf-8', stdio: 'pipe' });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stderr.toString()).toContain('✗ Command failed after');
      expect(error.stderr.toString()).toContain('attempts');
    }
  });

  it('should respect custom max attempts option', () => {
    try {
      execSync(`${scriptPath} --max-attempts 2 -- false`, { encoding: 'utf-8', stdio: 'pipe' });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(1);
      const output = error.stderr.toString();
      expect(output).toContain('failed after 2 attempts');
    }
  });

  it('should use exponential backoff timing', () => {
    const startTime = Date.now();

    try {
      // Command always fails, so we'll hit all retries
      execSync(`${scriptPath} --max-attempts 3 --initial-timeout 1 -- false`, {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 10000
      });
    } catch (error: any) {
      const elapsed = (Date.now() - startTime) / 1000;

      // With 3 attempts, initial timeout 1s, backoff 2x:
      // Attempt 1: fail immediately
      // Wait 1s
      // Attempt 2: fail immediately
      // Wait 2s
      // Attempt 3: fail immediately
      // Total: ~3 seconds minimum
      expect(elapsed).toBeGreaterThanOrEqual(2.5);
      expect(elapsed).toBeLessThan(5);
    }
  });

  it('should preserve command exit code on failure', () => {
    try {
      execSync(`${scriptPath} -- sh -c 'exit 42'`, { encoding: 'utf-8', stdio: 'pipe' });
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.status).toBe(42);
    }
  });

  it('should handle commands with arguments correctly', () => {
    const result = execSync(`${scriptPath} -- echo "hello" "world"`, { encoding: 'utf-8' });

    expect(result).toContain('hello world');
  });

  it('should handle custom initial timeout', () => {
    const startTime = Date.now();

    try {
      execSync(`${scriptPath} --max-attempts 2 --initial-timeout 2 -- false`, {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 10000
      });
    } catch (error: any) {
      const elapsed = (Date.now() - startTime) / 1000;

      // Attempt 1 fails, wait 2s, Attempt 2 fails
      // Total: ~2 seconds minimum
      expect(elapsed).toBeGreaterThanOrEqual(1.8);
    }
  });

  it('should handle custom backoff multiplier', () => {
    const startTime = Date.now();

    try {
      execSync(`${scriptPath} --max-attempts 3 --initial-timeout 1 --backoff-multiplier 3 -- false`, {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 15000
      });
    } catch (error: any) {
      const elapsed = (Date.now() - startTime) / 1000;

      // With multiplier 3x: wait 1s, then 3s = 4s total minimum
      expect(elapsed).toBeGreaterThanOrEqual(3.5);
    }
  });
});
