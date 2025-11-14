# Quickstart Guide: Title/Alias/Ordering Syntax Support

**For**: Developers implementing Title, participant aliasing, and ordering features
**Prerequisites**: Completion of feature 001-sqjs-renderer, TypeScript knowledge, understanding of TDD workflow

## Feature Overview

This feature adds three enhancements to the SQJS renderer:
1. **Titles**: Display descriptive titles above diagrams (`Title: Login Flow`)
2. **Aliases**: Map short identifiers to readable names (`participant A as "Authentication Service"`)
3. **Ordering**: Control left-to-right participant placement via declaration order

All three features leverage js-sequence-diagrams native syntax support.

---

## Development Workflow (Test-Driven)

### Phase 1: Title Validation Testing

#### Step 1: Write Title Validation Tests

Create `tests/unit/SyntaxValidator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { SyntaxValidator } from '../../src/validators/SyntaxValidator';

describe('SyntaxValidator.validateTitle', () => {
  const validator = new SyntaxValidator();

  describe('valid titles', () => {
    it('should parse simple title', () => {
      const result = validator.validateTitle('Title: User Login Flow');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('User Login Flow');
      expect(result.error).toBeNull();
    });

    it('should parse title with special characters', () => {
      const result = validator.validateTitle('Title: API Flow (v2.0)');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('API Flow (v2.0)');
    });

    it('should parse title with Unicode/emoji', () => {
      const result = validator.validateTitle('Title: 🔐 Authentication Flow');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('🔐 Authentication Flow');
    });

    it('should trim whitespace from title text', () => {
      const result = validator.validateTitle('Title:   Padded Title   ');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('Padded Title');
    });
  });

  describe('invalid titles', () => {
    it('should reject whitespace-only title', () => {
      const result = validator.validateTitle('Title:   ');
      expect(result.isValid).toBe(false);
      expect(result.title).toBeNull();
    });

    it('should reject lowercase "title"', () => {
      const result = validator.validateTitle('title: lowercase');
      expect(result.isValid).toBe(false);
      expect(result.error).not.toBeNull();
    });

    it('should reject missing colon', () => {
      const result = validator.validateTitle('Title User Login');
      expect(result.isValid).toBe(false);
      expect(result.error?.suggestion).toContain('colon');
    });
  });

  describe('edge cases', () => {
    it('should handle very long titles', () => {
      const longTitle = 'Title: ' + 'A'.repeat(150);
      const result = validator.validateTitle(longTitle);
      expect(result.isValid).toBe(true);
      expect(result.title?.length).toBe(150);
    });

    it('should handle title with quotes', () => {
      const result = validator.validateTitle('Title: "Quoted Title"');
      expect(result.isValid).toBe(true);
      expect(result.title).toBe('"Quoted Title"');
    });
  });
});
```

**Run tests** (expect failures):
```bash
npm test -- SyntaxValidator.test.ts
```

#### Step 2: Implement Title Validation

Create `src/validators/SyntaxValidator.ts`:

```typescript
import { TitleValidation, RenderError } from '../data-model';

export class SyntaxValidator {
  validateTitle(line: string): TitleValidation {
    // Pattern: Title: [text]
    const titlePattern = /^Title:\s*(.*)$/;
    const match = line.match(titlePattern);

    if (!match) {
      return {
        isValid: false,
        title: null,
        error: {
          type: 'syntax',
          message: 'Invalid Title syntax. Expected format: Title: [text]',
          lineNumber: null,
          suggestion: 'Ensure "Title" is capitalized and followed by a colon'
        }
      };
    }

    const titleText = match[1].trim();

    // Empty or whitespace-only title
    if (!titleText) {
      return {
        isValid: false,
        title: null,
        error: null
      };
    }

    return {
      isValid: true,
      title: titleText,
      error: null
    };
  }

  // Additional methods: validateParticipant, validateAliasQuotes, validateDiagram
}
```

**Verify tests pass**:
```bash
npm test -- SyntaxValidator.test.ts
```

### Phase 2: Participant Alias Testing

#### Step 3: Write Participant Validation Tests

Add to `tests/unit/SyntaxValidator.test.ts`:

```typescript
describe('SyntaxValidator.validateParticipant', () => {
  describe('simple participant', () => {
    it('should parse simple participant declaration', () => {
      const result = validator.validateParticipant('participant Alice', 0);
      expect(result.isValid).toBe(true);
      expect(result.shortName).toBe('Alice');
      expect(result.displayName).toBe('Alice');
      expect(result.hasAlias).toBe(false);
      expect(result.declarationOrder).toBe(0);
    });

    it('should accept identifier with underscores', () => {
      const result = validator.validateParticipant('participant _srv_1', 0);
      expect(result.isValid).toBe(true);
      expect(result.shortName).toBe('_srv_1');
    });
  });

  describe('aliased participant', () => {
    it('should parse participant with alias', () => {
      const result = validator.validateParticipant(
        'participant A as "Alice"',
        0
      );
      expect(result.isValid).toBe(true);
      expect(result.shortName).toBe('A');
      expect(result.displayName).toBe('Alice');
      expect(result.hasAlias).toBe(true);
    });

    it('should parse alias with special characters', () => {
      const result = validator.validateParticipant(
        'participant DB as "User Database (v3)"',
        1
      );
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe('User Database (v3)');
      expect(result.declarationOrder).toBe(1);
    });

    it('should parse alias with Unicode', () => {
      const result = validator.validateParticipant(
        'participant SVC as "🔐 Auth Service"',
        2
      );
      expect(result.isValid).toBe(true);
      expect(result.displayName).toBe('🔐 Auth Service');
    });

    it('should trim whitespace in alias', () => {
      const result = validator.validateParticipant(
        'participant A as "  Alice  "',
        0
      );
      expect(result.displayName).toBe('Alice');
    });
  });

  describe('invalid participants', () => {
    it('should reject unclosed quote in alias', () => {
      const result = validator.validateParticipant(
        'participant A as "Alice',
        0
      );
      expect(result.isValid).toBe(false);
      expect(result.error?.message).toContain('unclosed');
    });

    it('should reject invalid identifier', () => {
      const result = validator.validateParticipant(
        'participant 123Bad',
        0
      );
      expect(result.isValid).toBe(false);
    });

    it('should reject mismatched quotes', () => {
      const result = validator.validateParticipant(
        'participant A as "Alice\'',
        0
      );
      expect(result.isValid).toBe(false);
    });
  });
});
```

**Run tests** (expect failures):
```bash
npm test -- SyntaxValidator.test.ts
```

#### Step 4: Implement Participant Validation

Add to `src/validators/SyntaxValidator.ts`:

```typescript
validateParticipant(line: string, declarationOrder: number): ParticipantValidation {
  // Pattern 1: participant [shortName]
  // Pattern 2: participant [shortName] as "[displayName]"
  const aliasPattern = /^participant\s+(\w+)\s+as\s+"([^"]*)"\s*$/;
  const simplePattern = /^participant\s+(\w+)\s*$/;

  let aliasMatch = line.match(aliasPattern);
  if (aliasMatch) {
    const [, shortName, displayName] = aliasMatch;
    return {
      isValid: true,
      shortName,
      displayName: displayName.trim() || shortName,
      hasAlias: true,
      declarationOrder,
      error: null
    };
  }

  let simpleMatch = line.match(simplePattern);
  if (simpleMatch) {
    const [, shortName] = simpleMatch;
    return {
      isValid: true,
      shortName,
      displayName: shortName,
      hasAlias: false,
      declarationOrder,
      error: null
    };
  }

  // Check for common errors
  if (line.includes('as') && !line.includes('"')) {
    return {
      isValid: false,
      shortName: null,
      displayName: null,
      hasAlias: false,
      declarationOrder,
      error: {
        type: 'syntax',
        message: 'Alias display name must be quoted',
        lineNumber: null,
        suggestion: 'Use format: participant A as "Alice"'
      }
    };
  }

  if (line.includes('"') && !line.match(/"/g)?.length || (line.match(/"/g)?.length || 0) % 2 !== 0) {
    return {
      isValid: false,
      shortName: null,
      displayName: null,
      hasAlias: false,
      declarationOrder,
      error: {
        type: 'syntax',
        message: 'Unclosed quote in participant alias',
        lineNumber: null,
        suggestion: 'Ensure quotes are properly matched'
      }
    };
  }

  return {
    isValid: false,
    shortName: null,
    displayName: null,
    hasAlias: false,
    declarationOrder,
    error: {
      type: 'syntax',
      message: 'Invalid participant syntax. Expected: participant [name] or participant [name] as "[display]"',
      lineNumber: null,
      suggestion: 'Check participant declaration format'
    }
  };
}
```

**Verify tests pass**:
```bash
npm test -- SyntaxValidator.test.ts
```

### Phase 3: Ordering and Integration Testing

#### Step 5: Write Diagram Validation Tests

Add to `tests/unit/SyntaxValidator.test.ts`:

```typescript
describe('SyntaxValidator.validateDiagram', () => {
  it('should parse diagram with title only', () => {
    const source = `Title: Login Flow
Alice->Bob: Hello`;

    const result = validator.validateDiagram(source);
    expect(result.isValid).toBe(true);
    expect(result.title.title).toBe('Login Flow');
    expect(result.participants.length).toBe(0);
  });

  it('should parse diagram with participants in order', () => {
    const source = `participant C
participant B
participant A
C->B: Message 1
B->A: Message 2`;

    const result = validator.validateDiagram(source);
    expect(result.isValid).toBe(true);
    expect(result.participants).toHaveLength(3);
    expect(result.participants[0].shortName).toBe('C');
    expect(result.participants[1].shortName).toBe('B');
    expect(result.participants[2].shortName).toBe('A');
  });

  it('should parse diagram with title and aliased participants', () => {
    const source = `Title: Service Flow
participant SVC as "Auth Service"
participant DB as "Database"
SVC->DB: Query`;

    const result = validator.validateDiagram(source);
    expect(result.isValid).toBe(true);
    expect(result.title.title).toBe('Service Flow');
    expect(result.participantMap.get('SVC')).toBe('Auth Service');
    expect(result.participantMap.get('DB')).toBe('Database');
  });

  it('should handle multiple Title declarations (use first)', () => {
    const source = `Title: First Title
Title: Second Title
Alice->Bob: Hello`;

    const result = validator.validateDiagram(source);
    expect(result.isValid).toBe(true);
    expect(result.title.title).toBe('First Title');
  });

  it('should aggregate errors', () => {
    const source = `title: lowercase
participant 123Bad as "Name"
Alice->Bob: Hello`;

    const result = validator.validateDiagram(source);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should preserve backward compatibility (no Title/participants)', () => {
    const source = `Alice->Bob: Hello
Bob->Charlie: Hi there`;

    const result = validator.validateDiagram(source);
    expect(result.isValid).toBe(true);
    expect(result.title.isValid).toBe(false);
    expect(result.participants.length).toBe(0);
  });
});
```

**Run tests** (expect failures):
```bash
npm test -- SyntaxValidator.test.ts
```

#### Step 6: Implement Full Diagram Validation

Add to `src/validators/SyntaxValidator.ts`:

```typescript
validateDiagram(diagramSource: string): ValidationResult {
  const lines = diagramSource.split('\n');
  const errors: RenderError[] = [];
  let titleValidation: TitleValidation | null = null;
  const participants: ParticipantValidation[] = [];
  let participantCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for Title (only use first)
    if (trimmed.startsWith('Title:') && !titleValidation) {
      titleValidation = this.validateTitle(trimmed);
      if (!titleValidation.isValid && titleValidation.error) {
        errors.push(titleValidation.error);
      }
      continue;
    }

    // Check for participant declaration
    if (trimmed.startsWith('participant')) {
      const participantValidation = this.validateParticipant(
        trimmed,
        participantCount
      );
      participants.push(participantValidation);
      if (!participantValidation.isValid && participantValidation.error) {
        errors.push(participantValidation.error);
      }
      participantCount++;
      continue;
    }
  }

  // Build participant map
  const participantMap = new Map<string, string>();
  participants.forEach(p => {
    if (p.isValid && p.shortName && p.displayName) {
      participantMap.set(p.shortName, p.displayName);
    }
  });

  const isValid =
    (!titleValidation || titleValidation.isValid) &&
    participants.every(p => p.isValid) &&
    errors.length === 0;

  return {
    isValid,
    title: titleValidation || {
      isValid: false,
      title: null,
      error: null
    },
    participants,
    participantMap,
    errors
  };
}
```

**Verify all tests pass**:
```bash
npm test -- SyntaxValidator.test.ts
```

---

## Example Test Cases

### Basic Title Test

**Diagram**:
```sqjs
Title: User Authentication Flow
Alice->Bob: Request
Bob-->Alice: Response
```

**Expected**:
- Title displays above diagram
- Title text: "User Authentication Flow"
- No errors

### Alias Test

**Diagram**:
```sqjs
participant UI as "User Interface"
participant API as "REST API"
participant DB as "PostgreSQL Database"

UI->API: POST /login
API->DB: SELECT user
DB-->API: user row
API-->UI: { token }
```

**Expected**:
- Diagram displays with aliased names
- Participants ordered: UI, API, DB (left to right)
- Short names (UI, API, DB) used in message syntax
- Display names shown in rendered diagram

### Ordering Test

**Diagram**:
```sqjs
participant Database
participant Backend
participant Frontend

Frontend->Backend: request
Backend->Database: query
Database-->Backend: result
Backend-->Frontend: response
```

**Expected**:
- Participants appear left-to-right: Database, Backend, Frontend
- (Not alphabetical, not appearance order - declaration order)

### Combined Test

**Diagram**:
```sqjs
Title: Microservices Communication
participant Client as "Web Client 🌐"
participant Gateway as "API Gateway"
participant Auth as "Authentication Service"
participant Data as "Data Service"

Client->Gateway: Authenticate
Gateway->Auth: Verify credentials
Auth-->Gateway: JWT token
Gateway-->Client: Return token
Client->Gateway: Request data
Gateway->Data: Fetch user data
Data-->Gateway: User object
Gateway-->Client: Response
```

**Expected**:
- Title: "Microservices Communication"
- 4 participants in declared order
- Aliased display names with emoji support
- All messages properly routed

---

## Common Pitfalls

### ❌ Don't: Forget Title Colon

```sqjs
Title User Login  // WRONG - missing colon
```

**Fix**: Add colon after `Title`:
```sqjs
Title: User Login  // CORRECT
```

### ❌ Don't: Use Lowercase "title"

```sqjs
title: Login Flow  // WRONG - lowercase not recognized
```

**Fix**: Capitalize "Title":
```sqjs
Title: Login Flow  // CORRECT
```

### ❌ Don't: Forget Quotes in Alias

```sqjs
participant A as Alice  // WRONG - missing quotes
```

**Fix**: Quote the display name:
```sqjs
participant A as "Alice"  // CORRECT
```

### ❌ Don't: Mismatch Quotes

```sqjs
participant A as "Alice'  // WRONG - mismatched quotes
```

**Fix**: Use matching quotes:
```sqjs
participant A as "Alice"  // CORRECT
```

### ❌ Don't: Forget Participant Declaration for Ordering

```sqjs
// If you want specific order, MUST declare participants
Alice->Bob->Charlie: Flow  // WRONG - order not controllable
```

**Fix**: Declare participants explicitly:
```sqjs
participant Charlie
participant Bob
participant Alice

Alice->Bob: Message
Bob->Charlie: Message
```

### ✅ Do: Handle Backward Compatibility

```sqjs
// Old-style diagrams without Title/participants still work:
Alice->Bob: Hello
Bob->Alice: Hi there
```

### ✅ Do: Mix Aliased and Non-Aliased Participants

```sqjs
participant A as "Alice"
participant Bob  // No alias - uses "Bob" as display name
A->Bob: Hello Bob
```

---

## Integration Testing Checklist

- [ ] Title appears above diagram in reading mode
- [ ] Aliases display correctly in rendered output
- [ ] Participants appear in declared order (left to right)
- [ ] Error messages show for syntax errors (unclosed quotes, invalid identifier)
- [ ] Backward compatibility: diagrams without Title/participants still render
- [ ] Unicode characters (emoji) display in titles and aliases
- [ ] Long titles wrap appropriately
- [ ] Multiple sqjs blocks in same note each handle own Title/aliases independently

---

## Performance Testing

### Target Metrics
- Validation completes in <50ms for typical diagrams (up to 10 participants)
- Title + 5 participants + 20 messages: <2 seconds total render time
- No performance regression vs. feature 001

### Test Command
```bash
npm run test:coverage
```

---

## Development Workflow Summary

1. **Write failing tests** for each component (Title, Participant, Diagram)
2. **Implement validator methods** to make tests pass
3. **Run full test suite** to verify integration
4. **Test in Obsidian** with real vault and sqjs blocks
5. **Verify backward compatibility** with existing diagrams
6. **Check error messages** are helpful and clear

---

## Next Steps

1. Implement `SyntaxValidator` class following TDD workflow above
2. Integrate validator into `DiagramParser` (from feature 001)
3. Pass validation results to renderer
4. Render Title in diagram output
5. Resolve participant aliases in message syntax
6. Enforce participant ordering in output
7. Create integration tests in test vault
8. Verify all acceptance scenarios pass

---

## Resources

- [Feature 002 Specification](./spec.md)
- [Data Model](./data-model.md)
- [ISyntaxValidator Contract](./contracts/ISyntaxValidator.ts)
- [Feature 001 Quickstart](../001-sqjs-renderer/quickstart.md) - Reference for test setup
- [js-sequence-diagrams Documentation](https://bramp.github.io/js-sequence-diagrams/)
- [Vitest Testing Guide](https://vitest.dev/)
