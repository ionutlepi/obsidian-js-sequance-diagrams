/**
 * Settings Tab
 *
 * Obsidian settings UI for SQJS Sequence Diagram Renderer.
 * Allows users to configure theme and other plugin options.
 *
 * Implements: User Story 3 - Theme Configuration
 * FRs: FR-009 (theme selection UI)
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import type SQJSPlugin from './main';

export class SQJSSettingsTab extends PluginSettingTab {
  plugin: SQJSPlugin;

  constructor(app: App, plugin: SQJSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Header
    containerEl.createEl('h2', { text: 'SQJS Sequence Diagram Settings' });

    // Theme setting
    new Setting(containerEl)
      .setName('Diagram theme')
      .setDesc('Choose the visual style for rendered sequence diagrams')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('simple', 'Simple (clean geometric shapes)')
          .addOption('hand-drawn', 'Hand-drawn (sketchy style)')
          .setValue(this.plugin.settings.theme)
          .onChange(async (value) => {
            // Validate and set theme
            if (value === 'simple' || value === 'hand-drawn') {
              await this.plugin.themeManager.setTheme(value);

              // Note: Existing diagrams will use the new theme after
              // switching to edit mode and back to reading mode
            }
          });
      });

    // Info text
    containerEl.createEl('p', {
      text: 'Note: Theme changes apply to newly rendered diagrams. Switch to edit mode and back to reading mode to see updated diagrams.',
      cls: 'setting-item-description',
    });
  }
}
