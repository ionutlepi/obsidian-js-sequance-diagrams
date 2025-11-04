/**
 * Vitest setup file
 *
 * Sets up test environment for browser-based code
 *
 * CRITICAL: These mocks MUST run at module load time (not in beforeAll)
 * because Raphael imports run during module loading, before hooks execute.
 */

// Mock SVG methods that Raphael needs - IMMEDIATELY at module load
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Mock document.implementation.hasFeature
  if (!document.implementation.hasFeature) {
    document.implementation.hasFeature = () => true;
  }

  // Mock SVG creation if needed
  if (!document.createElementNS) {
    (document as any).createElementNS = (ns: string, tagName: string) => {
      return document.createElement(tagName);
    };
  }

  // Mock Obsidian's createEl method on HTMLElement
  if (!HTMLElement.prototype.createEl) {
    (HTMLElement.prototype as any).createEl = function (
      tag: string,
      options?: { text?: string; cls?: string; attr?: Record<string, string> }
    ): HTMLElement {
      const el = document.createElement(tag);
      if (options?.text) el.textContent = options.text;
      if (options?.cls) el.className = options.cls;
      if (options?.attr) {
        Object.entries(options.attr).forEach(([key, value]) => {
          el.setAttribute(key, value);
        });
      }
      this.appendChild(el);
      return el;
    };
  }

  // Mock Obsidian's createSpan method on HTMLElement
  if (!HTMLElement.prototype.createSpan) {
    (HTMLElement.prototype as any).createSpan = function (
      options?: { text?: string; cls?: string; attr?: Record<string, string> }
    ): HTMLSpanElement {
      const el = document.createElement('span');
      if (options?.text) el.textContent = options.text;
      if (options?.cls) el.className = options.cls;
      if (options?.attr) {
        Object.entries(options.attr).forEach(([key, value]) => {
          el.setAttribute(key, value);
        });
      }
      this.appendChild(el);
      return el;
    };
  }

  // Mock Obsidian's empty method on HTMLElement
  if (!HTMLElement.prototype.empty) {
    (HTMLElement.prototype as any).empty = function (): void {
      this.innerHTML = '';
    };
  }
}
