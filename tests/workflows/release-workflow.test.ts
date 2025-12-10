import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('release.yml workflow', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/release.yml');

  beforeAll(() => {
    // Verify workflow file exists
    if (!fs.existsSync(workflowPath)) {
      throw new Error(`Workflow not found: ${workflowPath} - implement it to pass this test`);
    }
  });

  it('should exist and be valid YAML', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');

    expect(() => {
      yaml.load(content);
    }).not.toThrow();
  });

  it('should trigger on version tag push', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    expect(workflow.on).toBeDefined();
    expect(workflow.on.push).toBeDefined();
    expect(workflow.on.push.tags).toBeDefined();
    expect(workflow.on.push.tags).toContain('v*.*.*');
  });

  it('should have a release job', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    expect(workflow.jobs).toBeDefined();
    expect(workflow.jobs.release).toBeDefined();
  });

  it('should checkout with full git history', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const checkoutStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('actions/checkout')
    );

    expect(checkoutStep).toBeDefined();
    expect(checkoutStep.with).toBeDefined();
    expect(checkoutStep.with['fetch-depth']).toBe(0);
  });

  it('should setup Node.js 20', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const nodeStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('actions/setup-node')
    );

    expect(nodeStep).toBeDefined();
    expect(nodeStep.with).toBeDefined();
    expect(nodeStep.with['node-version']).toBe('20');
    expect(nodeStep.with.cache).toBe('npm');
  });

  it('should extract version from tag', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const versionStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('version')
    );

    expect(versionStep).toBeDefined();
    expect(versionStep.run).toBeDefined();
    expect(versionStep.run).toContain('GITHUB_REF');
  });

  it('should check for duplicate releases', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const duplicateStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('duplicate')
    );

    expect(duplicateStep).toBeDefined();
    expect(duplicateStep.run).toContain('gh release view');
  });

  it('should build artifacts', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const buildStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('build')
    );

    expect(buildStep).toBeDefined();
    expect(buildStep.run).toContain('npm ci');
    expect(buildStep.run).toContain('npm run build');
  });

  it('should validate artifacts', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const validateStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('artifact')
    );

    expect(validateStep).toBeDefined();
    expect(validateStep.run).toContain('main.js');
    expect(validateStep.run).toContain('manifest.json');
  });

  it('should create GitHub release', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    expect(releaseStep).toBeDefined();
    expect(releaseStep.with).toBeDefined();
    expect(releaseStep.with.artifacts).toBeDefined();
    expect(releaseStep.with.artifacts).toContain('main.js');
    expect(releaseStep.with.artifacts).toContain('manifest.json');
  });

  it('should use GITHUB_TOKEN for authentication', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    expect(releaseStep).toBeDefined();
    expect(releaseStep.with.token).toContain('GITHUB_TOKEN');
  });

  it('should have workflow logging configured', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    // Check that steps use GitHub Actions log groups or echo statements
    const stepsWithLogging = workflow.jobs.release.steps.filter((step: any) =>
      step.run && (step.run.includes('::group::') || step.run.includes('echo'))
    );

    expect(stepsWithLogging.length).toBeGreaterThan(0);
  });
});
