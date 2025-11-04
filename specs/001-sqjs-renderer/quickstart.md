# Quickstart Guide: SQJS Sequence Diagram Renderer

**For**: Developers implementing this feature
**Prerequisites**: TypeScript knowledge, basic familiarity with Obsidian plugin development

## Development Environment Setup

### 1. Initialize Project

```bash
cd obsidian-sequancejs

# Install dependencies
npm install

# Install dev dependencies
npm install -D typescript @types/node esbuild vitest @testing-library/dom happy-dom

# Install Obsidian dependencies
npm install -D obsidian@latest

# Install rendering library
npm install js-sequence-diagrams@2.0.1
```

### 2. Configure TypeScript

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests"]
}
```

### 3. Configure esbuild

**esbuild.config.mjs**:
```javascript
import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  minify: prod,
  outfile: 'main.js',
}).catch(() => process.exit(1));
```

### 4. Create Plugin Manifest

**manifest.json**:
```json
{
  "id": "sqjs-sequence-diagrams",
  "name": "SQJS Sequence Diagram Renderer",
  "version": "1.0.0",
  "minAppVersion": "1.0.0",
  "description": "Render sequence diagrams from sqjs code blocks using js-sequence-diagrams",
  "author": "Your Name",
  "authorUrl": "https://github.com/ionutlepi",
  "isDesktopOnly": true
}
```

### 5. Configure Testing

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## Project Structure Overview

```
src/
├── main.ts                     # Plugin entry point - start here
├── settings.ts                  # Settings tab UI
├── renderer/
│   ├── DiagramRenderer.ts       # Implements IDiagramRenderer
│   ├── ThemeManager.ts          # Implements IThemeManager
│   └── ErrorDisplay.ts          # Implements IErrorDisplay
├── processors/
│   ├── SQJSCodeBlockProcessor.ts  # Implements ISQJSCodeBlockProcessor
│   └── DiagramParser.ts         # Syntax validation
├── utils/
│   ├── RenderCancellation.ts    # AbortController management
│   └── ComplexityAnalyzer.ts    # Metrics calculation
└── lib/
    └── js-sequence-diagrams/    # Bundled library

tests/
├── integration/                 # End-to-end tests
├── unit/                        # Component tests
└── fixtures/                    # Test data
```

## Implementation Workflow (Test-First)

### Step 1: Write Tests First ✅

For each component, **always write tests before implementation**:

```typescript
// tests/unit/DiagramRenderer.test.ts
import { describe, it, expect } from 'vitest';
import { DiagramRenderer } from '../../src/renderer/DiagramRenderer';

describe('DiagramRenderer', () => {
  it('should return empty status for empty content', async () => {
    const renderer = new DiagramRenderer();
    const result = await renderer.render(
      { content: '', blockId: 'test-1', lineCount: 0 },
      'simple'
    );

    expect(result.status).toBe('empty');
  });

  // More failing tests...
});
```

**Run tests** (they should fail):
```bash
npm test
```

### Step 2: Implement Component ✅

Only after tests fail, implement the code to make them pass:

```typescript
// src/renderer/DiagramRenderer.ts
import { IDiagramRenderer } from '../contracts/IDiagramRenderer';
import { DiagramSource, RenderResult } from '../data-model';

export class DiagramRenderer implements IDiagramRenderer {
  async render(
    source: DiagramSource,
    theme: 'simple' | 'hand-drawn',
    signal?: AbortSignal
  ): Promise<RenderResult> {
    // Check for empty content
    if (!source.content.trim()) {
      return { status: 'empty', svgElement: null, error: null, metrics: null };
    }

    // Implementation continues...
  }

  // Other methods...
}
```

### Step 3: Verify Tests Pass ✅

```bash
npm test
```

All tests should now pass (Green phase).

### Step 4: Refactor ♻️

Improve code quality while keeping tests green:
- Extract helper functions
- Improve naming
- Remove duplication

## Development Commands

```bash
# Build for development (with source maps)
npm run dev

# Build for production (minified)
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint
```

## Testing in Obsidian

### 1. Create Test Vault

```bash
mkdir test-vault
cd test-vault
mkdir .obsidian/plugins/sqjs-sequence-diagrams -p
```

### 2. Link Plugin for Development

```bash
# From project root
ln -s $(pwd)/main.js test-vault/.obsidian/plugins/sqjs-sequence-diagrams/
ln -s $(pwd)/manifest.json test-vault/.obsidian/plugins/sqjs-sequence-diagrams/
```

### 3. Create Test Note

Create `test-vault/Test Diagram.md`:

````markdown
# Test Sequence Diagram

```sqjs
Alice->Bob: Hello Bob, how are you?
Note right of Bob: Bob thinks
Bob-->Alice: I am good thanks!
```
````

### 4. Open Obsidian

1. Open Obsidian
2. Open `test-vault` as vault
3. Enable "SQJS Sequence Diagram Renderer" in Settings → Community plugins
4. View "Test Diagram" note in reading mode
5. Verify diagram renders

## Key Implementation Notes

### 1. Registering the Code Block Processor

**src/main.ts**:
```typescript
import { Plugin } from 'obsidian';
import { SQJSCodeBlockProcessor } from './processors/SQJSCodeBlockProcessor';

export default class SQJSPlugin extends Plugin {
  processor: SQJSCodeBlockProcessor;

  async onload() {
    this.processor = new SQJSCodeBlockProcessor(this);

    // Register markdown post processor for sqjs blocks
    this.registerMarkdownCodeBlockProcessor(
      'sqjs',
      (source, el, ctx) => this.processor.process(source, el, ctx)
    );
  }

  onunload() {
    this.processor.cancelAllRenders();
  }
}
```

### 2. Handling Theme Changes

When theme changes in settings:
1. Update saved settings
2. Clear render cache
3. Trigger re-render of visible diagrams

```typescript
// src/settings.ts
import { PluginSettingTab, Setting } from 'obsidian';

export class SettingsTab extends PluginSettingTab {
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Diagram Theme')
      .setDesc('Choose rendering style for sequence diagrams')
      .addDropdown(dropdown => dropdown
        .addOption('simple', 'Simple')
        .addOption('hand-drawn', 'Hand-drawn')
        .setValue(this.plugin.settings.theme)
        .onChange(async (value) => {
          await this.plugin.themeManager.setTheme(value);
        })
      );
  }
}
```

### 3. Render Cancellation Pattern

```typescript
// src/utils/RenderCancellation.ts
export class RenderOperationManager {
  private operations = new Map<string, AbortController>();

  start(blockId: string): AbortController {
    // Cancel existing operation for this block
    this.cancel(blockId);

    // Create new operation
    const controller = new AbortController();
    this.operations.set(blockId, controller);
    return controller;
  }

  cancel(blockId: string): void {
    const controller = this.operations.get(blockId);
    if (controller) {
      controller.abort();
      this.operations.delete(blockId);
    }
  }

  cancelAll(): void {
    this.operations.forEach(controller => controller.abort());
    this.operations.clear();
  }
}
```

## Debugging Tips

### 1. Enable Source Maps

In development builds, source maps allow debugging TypeScript directly:
```bash
npm run dev
```

### 2. Console Logging

```typescript
// src/renderer/DiagramRenderer.ts
console.log('[SQJS] Rendering diagram:', source.blockId);
console.log('[SQJS] Metrics:', metrics);
```

### 3. Obsidian Developer Tools

Open developer console: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)

### 4. Test Specific Cases

```bash
# Run single test file
npm test -- DiagramRenderer.test.ts

# Run tests matching pattern
npm test -- --grep "empty content"
```

## Common Pitfalls

### ❌ Don't: Modify Note Content

```typescript
// WRONG - violates FR-004
source = source.replace('sqjs', 'sequence');
```

### ✅ Do: Transform for Display Only

```typescript
// CORRECT - read-only transformation
const processed = parseSequenceDiagram(source);
renderToElement(el, processed);
```

### ❌ Don't: Block UI Thread

```typescript
// WRONG - synchronous heavy operation
const result = renderDiagramSync(largeSource); // Freezes Obsidian
```

### ✅ Do: Use Async Operations

```typescript
// CORRECT - async with cancellation
const result = await renderDiagramAsync(source, signal);
```

### ❌ Don't: Leak Memory on Mode Switch

```typescript
// WRONG - abandoned renders accumulate
startRender(source); // Old renders never cancelled
```

### ✅ Do: Cancel Pending Operations

```typescript
// CORRECT - clean up on mode switch
operationManager.cancel(blockId);
const controller = operationManager.start(blockId);
await renderDiagram(source, controller.signal);
```

## Next Steps

1. Run `/speckit.tasks` to generate task breakdown
2. Follow TDD workflow: Write test → Verify failure → Implement → Verify pass → Refactor
3. Start with User Story 1 (P1): Basic rendering
4. Proceed to User Story 2 (P2): Error handling
5. Finish with User Story 3 (P3): Theme configuration

## Resources

- [Obsidian Plugin API Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [js-sequence-diagrams Documentation](https://bramp.github.io/js-sequence-diagrams/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For questions during implementation:
- Review contracts in `contracts/` directory
- Check data model in `data-model.md`
- Refer to research decisions in `research.md`
- Consult constitution for development workflow
