import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('version validation integration in workflow', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/release.yml');

  it('should have a version validation step', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const validationStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('version') &&
      step.name.toLowerCase().includes('validat')
    );

    expect(validationStep).toBeDefined();
    expect(validationStep.run).toBeDefined();
  });

  it('should call validate-version.sh script', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const validationStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('version') &&
      step.name.toLowerCase().includes('validat')
    );

    expect(validationStep.run).toContain('validate-version.sh');
  });

  it('should validate version after extraction but before build', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const steps = workflow.jobs.release.steps;

    const versionExtractIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('extract') &&
      step.name.toLowerCase().includes('version')
    );

    const validationIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('version') &&
      step.name.toLowerCase().includes('validat')
    );

    const buildIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('build')
    );

    expect(versionExtractIndex).toBeGreaterThan(-1);
    expect(validationIndex).toBeGreaterThan(-1);
    expect(buildIndex).toBeGreaterThan(-1);

    // Validation should be after version extraction but before build
    expect(validationIndex).toBeGreaterThan(versionExtractIndex);
    expect(buildIndex).toBeGreaterThan(validationIndex);
  });

  it('should pass TAG_VERSION to validation script', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const validationStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('version') &&
      step.name.toLowerCase().includes('validat')
    );

    // Should reference the TAG_VERSION environment variable
    expect(validationStep.run).toContain('TAG_VERSION');
  });

  it('should fail workflow on validation error', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const validationStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('version') &&
      step.name.toLowerCase().includes('validat')
    );

    // The step should not have continue-on-error: true
    // If the script exits non-zero, the workflow should fail
    expect(validationStep['continue-on-error']).not.toBe(true);
  });

  it('should provide clear error context in validation step', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const validationStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('version') &&
      step.name.toLowerCase().includes('validat')
    );

    // Should have logging or error output
    expect(validationStep.run).toMatch(/echo|group|error/i);
  });
});
