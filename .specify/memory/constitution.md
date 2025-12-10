<!--
SYNC IMPACT REPORT
==================
Version Change: 1.1.0 → 1.1.1
Modified Principles: None
Added Sections: None
Removed Sections: None
Enhanced Sections:
  - Development Guidance - Added test resources reference

Templates Status:
  ✅ spec-template.md - No changes required
  ✅ plan-template.md - No changes required
  ✅ tasks-template.md - No changes required
  ✅ All templates align with constitution

Follow-up TODOs: None

Rationale for v1.1.1 PATCH bump:
  - Clarification of existing development workflow
  - Added reference to test-resources/ directory for test examples
  - Non-breaking enhancement to developer guidance
  - No principle changes or new requirements
==================
-->

# Obsidian-SequanceJS Constitution

## Core Principles

### I. Plugin-First Architecture

Every feature must be designed as a modular, independently testable plugin component that integrates with Obsidian's extension system.

**Rules**:
- All functionality must be self-contained within clear plugin boundaries
- Each plugin module must have a single, well-defined purpose
- Dependencies between plugins must be explicit and documented via contracts
- No organizational-only plugins - every plugin must deliver user-facing value
- Plugin APIs must be stable and versioned

**Rationale**: Plugin architecture ensures maintainability, testability, and allows users to selectively enable/disable features. Clear boundaries prevent tight coupling and enable independent development of features.

### II. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory for all code. Tests must be written first, approved by stakeholders, verified to fail, and only then implemented using the Red-Green-Refactor cycle.

**Rules**:
- Tests MUST be written before implementation code
- Tests MUST be reviewed and approved by product owner/stakeholder
- Tests MUST fail initially (proving they test the right thing)
- Implementation proceeds ONLY after tests fail as expected
- Red-Green-Refactor cycle strictly enforced:
  1. **Red**: Write failing test
  2. **Green**: Write minimal code to pass
  3. **Refactor**: Improve design while keeping tests green
- No production code without corresponding tests
- Test coverage gates block merging untested code

**Rationale**: TDD ensures we build exactly what's specified, prevents over-engineering, provides living documentation, and catches regressions immediately. The fail-first requirement proves tests actually validate the feature.

### III. Specification-Driven Development

All features begin with a complete specification (spec.md) defining user scenarios, requirements, and success criteria before any design or implementation.

**Rules**:
- Every feature MUST have an approved specification before planning begins
- Specifications MUST include:
  - Prioritized, independently testable user stories (P1, P2, P3...)
  - Functional requirements with clear acceptance criteria
  - Success criteria with measurable outcomes
  - Edge cases and error scenarios
- Specifications are technology-agnostic (what, not how)
- Specifications require stakeholder approval before proceeding
- Changes to requirements require specification amendments
- Implementation plans (plan.md) must reference and trace to spec.md requirements

**Rationale**: Specifications ensure shared understanding between stakeholders and developers, prevent scope creep, enable parallel work streams, and provide the foundation for test-first development.

### IV. Knowledge Retention & Lessons Learned

All significant insights, problems solved, and mistakes made must be captured in persistent memory to prevent recurring issues and accelerate future development.

**Rules**:
- When asked to "remember this" or "lesson learned for the future", insights MUST be recorded in `.specify/memory/lessons-learned.md`
- Each lesson MUST include:
  - **Context**: What feature/task/situation prompted the lesson
  - **Problem**: What went wrong or what insight was discovered
  - **Solution**: How it was resolved or what should be done differently
  - **Impact**: Why this matters for future work
  - **Date**: When the lesson was captured
- Lessons MUST be categorized by topic (Testing, Architecture, Dependencies, Workflow, etc.)
- Review lessons-learned.md at the start of each new feature planning phase
- Agents MUST proactively consult lessons-learned.md when encountering similar problems
- Duplicate lessons should update/reference existing entries rather than creating new ones
- Lessons remain in memory indefinitely unless explicitly deprecated

**Rationale**: Software development generates valuable experiential knowledge that is easily lost. Systematic capture of lessons learned prevents teams from repeatedly solving the same problems, accelerates onboarding, and compounds learning over time. This principle transforms tactical problem-solving into strategic organizational knowledge.

## Development Workflow

All feature development follows this mandatory workflow:

1. **Specify** (`/speckit.specify`): Create feature specification with user stories and requirements
2. **Clarify** (`/speckit.clarify`): Identify and resolve ambiguities in the specification
3. **Plan** (`/speckit.plan`): Research and design the technical implementation approach
4. **Tasks** (`/speckit.tasks`): Generate dependency-ordered, story-aligned task breakdown
5. **Implement** (`/speckit.implement`): Execute tasks following TDD discipline
6. **Analyze** (`/speckit.analyze`): Verify consistency across spec, plan, and tasks

**Workflow Rules**:
- Each phase must complete before the next begins
- Phase outputs are immutable once approved (amendments require formal process)
- Constitution compliance verified at Plan phase (Constitution Check gate)
- User stories must be independently implementable and testable
- Tasks organized by user story priority for incremental delivery

## Quality Gates

### Constitution Check Gate

**Trigger**: Before Phase 0 research in plan.md, re-checked after Phase 1 design

**Verification**:
- [ ] Plugin-First: Feature designed as independent plugin module
- [ ] Test-First: Test tasks precede implementation tasks in tasks.md
- [ ] Specification-Driven: Complete spec.md exists and approved
- [ ] All complexity violations documented and justified

**Action on Failure**: Implementation blocked until violations resolved or justified

### Test-First Enforcement

**Trigger**: Every task involving production code

**Verification**:
- [ ] Corresponding test task exists and precedes implementation task
- [ ] Test files created before implementation files
- [ ] Tests initially fail (Red phase documented)
- [ ] Tests pass after implementation (Green phase documented)
- [ ] Code refactored while maintaining green tests

**Action on Failure**: Code review blocks merge, requires test-first rework

### Specification Traceability

**Trigger**: Plan and task generation, code review

**Verification**:
- [ ] Every functional requirement in spec.md has implementation task(s)
- [ ] Every task references specific user story or requirement
- [ ] User stories testable independently
- [ ] Success criteria measurable and verified

**Action on Failure**: Plan/tasks rejected, requires specification alignment

## Governance

### Amendment Process

1. **Proposal**: Document proposed change with rationale and impact analysis
2. **Review**: All stakeholders review and provide feedback
3. **Migration Plan**: For breaking changes, document migration path for existing code
4. **Approval**: Requires consensus from project leadership
5. **Version Update**: Constitution version bumped per semantic versioning rules
6. **Propagation**: Update all dependent templates and documentation
7. **Announcement**: Communicate changes to all contributors

### Versioning Policy

Constitution uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Backward incompatible changes (principle removal/redefinition)
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Review

- All pull requests MUST verify constitution compliance
- Code reviews explicitly check principle adherence
- Quarterly constitution audit reviews for systemic violations
- Complexity violations require documented justification

### Conflict Resolution

- Constitution supersedes all other practices, guidelines, and conventions
- When principles conflict, Test-First (Principle II) takes precedence
- Ambiguities resolved by project leadership with documented rationale
- Interpretation disputes documented as amendments for clarity

### Development Guidance

For runtime development workflow and command usage, agents should consult the command files in `.specify/templates/commands/*.md` and related documentation.

**Test Resources**: Manual test examples, sample diagrams, and quick test guides are available in `test-resources/`. These resources complement automated unit tests and provide real-world usage scenarios for validation. See `test-resources/QUICKTEST.md` for 5-minute validation procedures and `test-resources/SAMPLE-DIAGRAMS.md` for comprehensive test data.

**Version**: 1.1.1 | **Ratified**: 2025-10-30 | **Last Amended**: 2025-12-02
