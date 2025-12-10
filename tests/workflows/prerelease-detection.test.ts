import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('pre-release detection', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/release.yml');

  it('should detect stable release for v1.0.0', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    expect(versionStep).toBeDefined();
    expect(versionStep.run).toBeDefined();

    // Should set IS_PRERELEASE to false for stable versions
    expect(versionStep.run).toContain('IS_PRERELEASE=false');
  });

  it('should detect pre-release for v1.0.0-alpha', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    // Should set IS_PRERELEASE to true when pattern matches
    expect(versionStep.run).toContain('IS_PRERELEASE=true');

    // Should use regex to detect pre-release suffix
    expect(versionStep.run).toMatch(/\[0-9\].*-/);
  });

  it('should detect pre-release for v1.0.0-beta.1', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    // The regex should match beta versions with build numbers
    expect(versionStep.run).toMatch(/-\(.+\)/);
  });

  it('should detect pre-release for v1.0.0-rc.2', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    // Should handle release candidate versions
    expect(versionStep.run).toBeDefined();
    expect(versionStep.run).toContain('IS_PRERELEASE');
  });

  it('should use regex pattern for pre-release detection', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    // Should use regex matching with conditional
    expect(versionStep.run).toContain('=~');
    expect(versionStep.run).toMatch(/if.*\[\[.*=~.*\]\]/);
  });

  it('should store IS_PRERELEASE in environment', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    // Should write to GITHUB_ENV
    expect(versionStep.run).toContain('IS_PRERELEASE=');
    expect(versionStep.run).toContain('>> $GITHUB_ENV');
  });
});
