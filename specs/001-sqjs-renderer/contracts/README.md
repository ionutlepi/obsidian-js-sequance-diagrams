# API Contracts

This directory contains TypeScript interface definitions that serve as contracts between components of the SQJS Sequence Diagram Renderer plugin.

## Purpose

Contracts define:
- **What** each component does (not **how** it does it)
- Input/output types for all public methods
- Expected behavior and error handling
- Functional requirements each interface implements

## Contract Overview

| Contract | Purpose | Key FR |
|----------|---------|--------|
| `IDiagramRenderer` | Core rendering logic | FR-003, FR-016, FR-017 |
| `IThemeManager` | Theme configuration and application | FR-009, FR-010 |
| `IErrorDisplay` | Error and warning message formatting | FR-007, FR-014 |
| `ISQJSCodeBlockProcessor` | Main entry point for code block processing | FR-001, FR-003, FR-006 |
| `IClipboardHandler` | Copy diagram as image functionality | FR-018 |

## Usage During Development

### Phase 2 (Tasks Generation)
- Contracts guide task breakdown
- Each interface method becomes one or more implementation tasks
- Test tasks verify contract adherence

### Phase 3 (Implementation)
- Implement concrete classes fulfilling these interfaces
- Write tests validating contract compliance
- Use TypeScript's `implements` keyword to enforce type safety

### Testing Strategy
Contract-based testing ensures:
1. **Unit tests**: Mock dependencies, test interface compliance
2. **Integration tests**: Verify components interact correctly via contracts
3. **Type safety**: TypeScript compiler enforces contract adherence

## Example Implementation

```typescript
// Implementation
class DiagramRenderer implements IDiagramRenderer {
  async render(
    source: DiagramSource,
    theme: 'simple' | 'hand-drawn',
    signal?: AbortSignal
  ): Promise<RenderResult> {
    // Implementation here
  }

  analyzeComplexity(source: DiagramSource): DiagramMetrics {
    // Implementation here
  }

  clearCache(): void {
    // Implementation here
  }
}

// Testing
describe('DiagramRenderer', () => {
  it('should implement IDiagramRenderer contract', () => {
    const renderer: IDiagramRenderer = new DiagramRenderer();
    // Test contract compliance
  });
});
```

## Contract Relationships

```
ISQJSCodeBlockProcessor (entry point)
  │
  ├─► IDiagramRenderer (rendering)
  │     └─► IThemeManager (theming)
  │
  ├─► IErrorDisplay (error formatting)
  │
  └─► IClipboardHandler (copy functionality)
```

## Validation

All contracts:
- ✅ Use TypeScript interfaces (compile-time safety)
- ✅ Include JSDoc comments (runtime documentation)
- ✅ Reference FR numbers (traceability to requirements)
- ✅ Define clear behavior contracts (not implementation details)
- ✅ Specify error handling expectations

## Next Steps

After `/speckit.tasks`:
1. Generate test tasks for each contract method
2. Generate implementation tasks for each contract
3. Ensure tests precede implementation (TDD compliance)
