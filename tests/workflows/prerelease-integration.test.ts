import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('pre-release workflow integration', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/release.yml');

  it('should mark release as pre-release when IS_PRERELEASE is true', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    expect(releaseStep).toBeDefined();
    expect(releaseStep.with).toBeDefined();
    expect(releaseStep.with.prerelease).toBeDefined();

    // Should use the IS_PRERELEASE environment variable
    expect(releaseStep.with.prerelease).toContain('IS_PRERELEASE');
  });

  it('should pass IS_PRERELEASE flag to release action', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    // Should reference env variable using GitHub Actions syntax
    expect(releaseStep.with.prerelease).toMatch(/\$\{\{.*IS_PRERELEASE.*\}\}/);
  });

  it('should have pre-release detection before release creation', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const steps = workflow.jobs.release.steps;

    const versionExtractIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    const releaseIndex = steps.findIndex((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    expect(versionExtractIndex).toBeGreaterThan(-1);
    expect(releaseIndex).toBeGreaterThan(-1);

    // Version extraction (which includes pre-release detection) should come before release creation
    expect(releaseIndex).toBeGreaterThan(versionExtractIndex);
  });

  it('should allow GitHub to filter pre-releases', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    // GitHub will automatically mark release with pre-release badge
    // and allow users to filter by pre-release vs stable
    expect(releaseStep.with.prerelease).toBeDefined();
  });

  it('should handle both stable and pre-release versions', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    // Should have both branches: true and false for IS_PRERELEASE
    expect(versionStep.run).toContain('IS_PRERELEASE=true');
    expect(versionStep.run).toContain('IS_PRERELEASE=false');
  });

  it('should log pre-release detection status', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    // Should echo information about whether pre-release was detected
    expect(versionStep.run).toMatch(/echo.*[Pp]re-?release/);
  });
});
