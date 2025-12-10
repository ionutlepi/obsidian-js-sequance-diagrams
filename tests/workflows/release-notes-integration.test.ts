import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('release notes integration in workflow', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/release.yml');

  it('should have a step to generate release notes', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseNotesStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('release notes')
    );

    expect(releaseNotesStep).toBeDefined();
    expect(releaseNotesStep.run).toBeDefined();
  });

  it('should call generate-release-notes.sh script', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseNotesStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('release notes')
    );

    expect(releaseNotesStep.run).toContain('generate-release-notes.sh');
  });

  it('should generate notes after build but before release creation', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const steps = workflow.jobs.release.steps;

    const buildIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('build')
    );

    const notesIndex = steps.findIndex((step: any) =>
      step.name && step.name.toLowerCase().includes('release notes')
    );

    const releaseIndex = steps.findIndex((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    expect(buildIndex).toBeGreaterThan(-1);
    expect(notesIndex).toBeGreaterThan(-1);
    expect(releaseIndex).toBeGreaterThan(-1);

    // Notes should be after build but before release creation
    expect(notesIndex).toBeGreaterThan(buildIndex);
    expect(releaseIndex).toBeGreaterThan(notesIndex);
  });

  it('should include release notes in GitHub release', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseStep = workflow.jobs.release.steps.find((step: any) =>
      step.uses && step.uses.includes('release-action')
    );

    expect(releaseStep).toBeDefined();
    expect(releaseStep.with).toBeDefined();

    // Should have either bodyFile or body that references release notes
    const hasBodyFile = releaseStep.with.bodyFile !== undefined;
    const hasBodyWithNotes = releaseStep.with.body &&
      releaseStep.with.body.includes('release-notes');

    expect(hasBodyFile || hasBodyWithNotes).toBe(true);
  });

  it('should use current tag for generating notes', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseNotesStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('release notes')
    );

    // Should reference the TAG environment variable
    expect(releaseNotesStep.run).toContain('TAG');
  });

  it('should store release notes output', () => {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const workflow: any = yaml.load(content);

    const releaseNotesStep = workflow.jobs.release.steps.find((step: any) =>
      step.name && step.name.toLowerCase().includes('release notes')
    );

    // Should write to a file (release-notes.md or similar)
    expect(releaseNotesStep.run).toMatch(/release-notes\.md|notes\.md/);
  });
});
