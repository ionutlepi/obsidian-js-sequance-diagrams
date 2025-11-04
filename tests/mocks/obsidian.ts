/**
 * Mock Obsidian API for testing
 *
 * Provides minimal type-compatible mocks of Obsidian interfaces
 * so tests can import types without requiring full Obsidian environment
 */

export interface MarkdownPostProcessorContext {
  docId: string;
  sourcePath: string;
  frontmatter: Record<string, any> | null;
  addChild(child: any): void;
  getSectionInfo(el: HTMLElement): any;
}

export class Plugin {
  app: any;
  manifest: any;

  constructor(app: any, manifest: any) {
    this.app = app;
    this.manifest = manifest;
  }

  async loadData(): Promise<any> {
    return {};
  }

  async saveData(data: any): Promise<void> {}

  registerMarkdownCodeBlockProcessor(
    language: string,
    handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => void
  ): void {}

  addSettingTab(tab: any): void {}
}

export class PluginSettingTab {
  app: any;
  plugin: any;
  containerEl: HTMLElement;

  constructor(app: any, plugin: any) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
  }

  display(): void {}
  hide(): void {}
}

export class Setting {
  settingEl: HTMLElement;

  constructor(containerEl: HTMLElement) {
    this.settingEl = document.createElement('div');
  }

  setName(name: string): this {
    return this;
  }

  setDesc(desc: string): this {
    return this;
  }

  addText(cb: (text: any) => void): this {
    return this;
  }

  addDropdown(cb: (dropdown: any) => void): this {
    return this;
  }

  addToggle(cb: (toggle: any) => void): this {
    return this;
  }
}
