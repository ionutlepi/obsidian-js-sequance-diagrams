// CRITICAL: Initialize globals FIRST before ANY other imports
import './init-globals';

// NOW import everything else
import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './types';
import { DiagramRenderer } from './renderer/DiagramRenderer';
import { ErrorDisplay } from './renderer/ErrorDisplay';
import { ThemeManager } from './renderer/ThemeManager';
import { ClipboardHandler } from './utils/ClipboardHandler';
import { SQJSCodeBlockProcessor } from './processors/SQJSCodeBlockProcessor';
import { SQJSSettingsTab } from './settings';

/**
 * SQJS Sequence Diagram Renderer Plugin
 *
 * Main plugin entry point for rendering sequence diagrams from sqjs code blocks
 */
export default class SQJSPlugin extends Plugin {
  settings: PluginSettings;
  themeManager: ThemeManager;
  private processor: SQJSCodeBlockProcessor | null = null;
  private renderer: DiagramRenderer | null = null;

  async onload() {
    console.log('Loading SQJS Sequence Diagram Renderer');

    // Load settings
    await this.loadSettings();

    // Initialize components
    this.renderer = new DiagramRenderer();
    const errorDisplay = new ErrorDisplay();
    const clipboardHandler = new ClipboardHandler();

    // Create theme manager with cache invalidation callback
    this.themeManager = new ThemeManager(
      this.settings,
      () => this.saveSettings(),
      () => this.renderer?.clearCache() // Invalidate cache on theme change
    );

    // Create code block processor
    this.processor = new SQJSCodeBlockProcessor(
      this.renderer,
      errorDisplay,
      clipboardHandler,
      this.settings.theme
    );

    // Register markdown code block processor for 'sqjs'
    this.registerMarkdownCodeBlockProcessor('sqjs', (source, el, ctx) => {
      if (this.processor) {
        // Update processor theme from current settings
        this.processor.setTheme(this.themeManager.getCurrentTheme());
        this.processor.process(source, el, ctx);
      }
    });

    // Register settings tab
    this.addSettingTab(new SQJSSettingsTab(this.app, this));
  }

  onunload() {
    console.log('Unloading SQJS Sequence Diagram Renderer');

    // Cancel all pending render operations
    if (this.processor) {
      this.processor.cancelAllRenders();
    }

    // Clean up resources
    this.processor = null;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
