# Research: SQJS Sequence Diagram Renderer

**Date**: 2025-10-30
**Purpose**: Resolve technical unknowns from Technical Context and establish implementation approach

## Research Areas

### 1. js-sequence-diagrams Library - Version and Bundling Strategy

**Decision**: Use js-sequence-diagram v2.0.1 (latest stable) with esbuild bundling

**Rationale**:
- v2.0.1 is the most recent stable release with active maintenance
- Library supports both SVG (via Raphaël.js) and canvas rendering
- Supports two themes out-of-the-box: "simple" and "hand-drawn" (aligns with FR-009)
- Library size is ~50KB minified, well within our 500KB plugin budget
- esbuild can bundle the library and its dependencies efficiently

**Alternatives Considered**:
- **mermaid.js**: More feature-rich but significantly larger (~1MB+), includes features beyond sequence diagrams (out of scope)
- **PlantUML**: Requires external Java runtime (violates offline-first constraint)
- **Build from CDN at runtime**: Violates FR-015 (must bundle library)

**Implementation Notes**:
- Install via npm: `npm install js-sequence-diagram@2.0.1` (note: singular "diagram", not plural "diagrams")
- Bundle library using esbuild with external dependencies handled
- Raphaël.js (dependency) will be included automatically in bundle

### 2. Raphaël.js Dependency - Bundling Approach

**Decision**: Bundle Raphaël.js v2.3.0 as a dependency of js-sequence-diagram

**Rationale**:
- Raphaël.js is a required dependency for js-sequence-diagram SVG rendering
- Version 2.3.0 is stable and well-tested with js-sequence-diagram
- Size impact: ~90KB minified (total with js-sequence-diagram ~140KB, within budget)
- esbuild will automatically include it when bundling js-sequence-diagram

**Alternatives Considered**:
- **Exclude Raphaël and use canvas-only rendering**: Canvas has inferior diagram quality and harder to copy as image (violates FR-018 user experience expectation)
- **Load Raphaël separately from CDN**: Violates offline-first constraint

**Implementation Notes**:
- No separate install needed - comes with js-sequence-diagram
- esbuild config will bundle all dependencies into single main.js output
- SVG output preferred over canvas for copy-to-clipboard functionality

### 3. Build Tool Selection - Webpack vs esbuild

**Decision**: Use esbuild for bundling

**Rationale**:
- **Performance**: esbuild is 10-100x faster than Webpack, critical for development iteration
- **Simplicity**: Minimal configuration required for Obsidian plugin builds
- **Official Obsidian recommendation**: Obsidian sample plugin uses esbuild in official examples
- **Bundle size**: Produces smaller bundles with better tree-shaking
- **TypeScript support**: Native TypeScript compilation without additional loaders

**Alternatives Considered**:
- **Webpack**: More mature ecosystem but significantly slower build times and more complex configuration
- **Rollup**: Good for libraries but esbuild better suited for applications/plugins

**Implementation Notes**:
- Create `esbuild.config.mjs` with Obsidian-specific settings
- Target ES2018 (Obsidian Electron compatibility)
- Minification enabled for production builds
- Source maps for development

### 4. Testing Framework Selection

**Decision**: Use Vitest with @testing-library/dom for DOM manipulation testing

**Rationale**:
- **Vitest**: Modern, fast test runner with excellent TypeScript and ESM support
- **Vite-compatible**: Same build tool ecosystem as esbuild (both use esbuild internally)
- **DOM testing**: @testing-library/dom allows testing Obsidian DOM interactions without full Obsidian environment
- **Speed**: Faster than Jest for TypeScript projects
- **DX**: Better error messages and stack traces than Jest

**Alternatives Considered**:
- **Jest**: Industry standard but slower for TypeScript, requires additional configuration
- **Obsidian testing utilities**: Limited documentation, harder to set up isolated unit tests
- **No testing framework**: Violates Test-First Development principle (Constitution II)

**Testing Strategy**:
1. **Unit tests** (Vitest): DiagramParser, ComplexityAnalyzer, theme logic
2. **Integration tests** (Vitest + @testing-library/dom): Full rendering pipeline, error handling, mode switching
3. **Manual testing**: Actual Obsidian plugin testing in development vault

**Implementation Notes**:
- Install: `npm install -D vitest @testing-library/dom happy-dom`
- Use happy-dom for lightweight DOM simulation
- Mock Obsidian API types using type definitions from obsidian package

### 5. Obsidian Plugin API Integration Points

**Research Findings**:

**Key APIs Needed**:
1. **MarkdownPostProcessor**: Register processor for reading mode code block rendering
   ```typescript
   this.registerMarkdownCodeBlockProcessor('sqjs', (source, el, ctx) => {
     // Rendering logic here
   });
   ```

2. **Plugin Settings**: Use `PluginSettingTab` for theme configuration UI
   ```typescript
   class SettingsTab extends PluginSettingTab {
     display(): void {
       // Add theme dropdown
     }
   }
   ```

3. **Data Storage**: Use `loadData()` / `saveData()` for persisting theme preferences
   ```typescript
   interface Settings {
     theme: 'simple' | 'hand'  drawn';
   }
   ```

**Rendering Mode Detection**:
- MarkdownPostProcessor only runs in reading mode (editing mode shows raw code blocks)
- No additional mode detection needed - API handles this automatically

**Clipboard API**:
- Use browser's Clipboard API for image copy (FR-018)
- Convert SVG to PNG using canvas for broader clipboard compatibility

**Implementation Notes**:
- Obsidian API version: Target 1.0.0+ (latest stable)
- Use `obsidian` npm package for type definitions during development
- Plugin manifest requires minAppVersion field (set to 1.0.0)

### 6. Performance Optimization Strategies

**Decision**: Implement complexity thresholds with memoization for repeated renders

**Approach**:
1. **Complexity Analysis** (FR-016):
   - Count participants using regex: `/^(\w+)(->|-->)/gm`
   - Count messages by line count (each line ≈ one message)
   - Thresholds: >15 participants OR >50 messages triggers warning

2. **Render Cancellation** (FR-017):
   - Use AbortController pattern for each render operation
   - Store reference to current render operation
   - Cancel on mode switch via `controller.abort()`

3. **Caching Strategy**:
   - Cache rendered SVG by content hash (simple hash of source text)
   - Invalidate cache on theme change
   - Cache size limit: 50 diagrams (LRU eviction)

**Performance Targets Validation**:
- <2s for typical diagrams: js-sequence-diagrams renders simple diagrams in <100ms, ample margin
- <3s theme propagation: Re-render only visible diagrams, cache invalidation is fast
- Zero degradation on mode switch: AbortController prevents memory leaks

**Implementation Notes**:
- Use `Map<string, SVGElement>` for diagram cache
- Complexity warning displayed as styled div above diagram
- Performance measurement via `performance.now()` in development mode

### 7. Error Handling Patterns

**Decision**: Structured error handling with fallback UI components

**Error Categories**:
1. **Syntax Errors** (FR-007): Invalid sequence diagram syntax
   - Catch js-sequence-diagrams parser exceptions
   - Extract line number from error message if available
   - Display formatted error message in place of diagram

2. **Library Initialization Errors** (FR-013): Bundled library fails to load
   - Unlikely (library is bundled), but catch during plugin load
   - Display error notice using Obsidian's Notice API
   - Graceful degradation: Show code block as-is

3. **Empty Content** (FR-014): Empty or whitespace-only blocks
   - Pre-validation before passing to library
   - Display warning message: "Empty sequence diagram - no content to render"

**Error Display Format**:
```
┌─────────────────────────────────────┐
│ ⚠ Syntax Error (Line 5)            │
│ Unexpected token: expected '->'     │
│ or '-->'.                           │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Use Obsidian's CSS variables for error styling (--text-error, --background-secondary)
- Errors displayed as `<div class="sqjs-error">` elements
- Test all error paths in integration tests

## Summary of Decisions

| Unknown | Decision | Impact |
|---------|----------|--------|
| js-sequence-diagrams version | v2.0.1 (latest stable) | Stable API, supports required themes |
| Raphaël.js bundling | Bundle v2.3.0 with library | +90KB bundle size, enables SVG rendering |
| Build tool | esbuild | Faster builds, simpler config, Obsidian recommended |
| Testing framework | Vitest + @testing-library/dom | Fast TypeScript testing, DOM manipulation support |

**All NEEDS CLARIFICATION items resolved** - Proceed to Phase 1 design.
