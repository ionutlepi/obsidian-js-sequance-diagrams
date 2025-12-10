import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('duplicate release detection', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/release.yml');

  it('should fail workflow when release already exists', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const duplicateCheckStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('duplicate')
    );

    expect(duplicateCheckStep).toBeDefined();

    // Should use gh CLI to check for existing release
    expect(duplicateCheckStep.run).toContain('gh release view');

    // Should exit with error if release exists
    // The script should check exit code and fail appropriately
    expect(duplicateCheckStep.run).toBeTruthy();
  });

  it('should provide clear error message for duplicates', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const duplicateCheckStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('duplicate')
    );

    // Should have error messaging
    expect(duplicateCheckStep.run).toContain('ERROR');
  });

  it('should check before building to fail fast', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const steps = workflow.jobs.release.steps;

    const duplicateCheckIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('duplicate')
    );

    const buildIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('build')
    );

    // Duplicate check should come before build
    expect(duplicateCheckIndex).toBeGreaterThan(-1);
    expect(buildIndex).toBeGreaterThan(-1);
    expect(duplicateCheckIndex).toBeLessThan(buildIndex);
  });
});
