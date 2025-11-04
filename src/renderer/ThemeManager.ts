/**
 * ThemeManager
 *
 * Manages theme selection, persistence, and cache invalidation.
 * Supports 'simple' and 'hand-drawn' themes.
 *
 * Implements: IThemeManager contract
 * FRs: FR-009 (theme configuration), FR-010 (theme application)
 */

import type { PluginSettings } from '../types';
import type { IThemeManager } from '../contracts/IThemeManager';

/**
 * Valid theme types
 */
type Theme = 'simple' | 'hand-drawn';

/**
 * Save data callback function type
 */
type SaveDataFn = () => Promise<void>;

/**
 * Cache clear callback function type
 */
type ClearCacheFn = () => void;

export class ThemeManager implements IThemeManager {
  private settings: PluginSettings;
  private saveData: SaveDataFn;
  private clearCache?: ClearCacheFn;

  /**
   * Create a new ThemeManager
   *
   * @param settings - Plugin settings object (mutable reference)
   * @param saveData - Function to persist settings
   * @param clearCache - Optional callback to invalidate render cache
   */
  constructor(
    settings: PluginSettings,
    saveData: SaveDataFn,
    clearCache?: ClearCacheFn
  ) {
    this.settings = settings;
    this.saveData = saveData;
    this.clearCache = clearCache;
  }

  /**
   * Get the current active theme
   *
   * @returns Current theme ('simple' or 'hand-drawn')
   */
  getCurrentTheme(): Theme {
    return this.settings.theme;
  }

  /**
   * Set a new theme and persist the change
   *
   * @param theme - New theme to activate
   * @throws Error if theme is invalid
   */
  async setTheme(theme: Theme): Promise<void> {
    // Validate theme
    if (!this.isValidTheme(theme)) {
      throw new Error(
        `Invalid theme: "${theme}". Must be "simple" or "hand-drawn".`
      );
    }

    // Check if theme is already active (optimization)
    if (this.settings.theme === theme) {
      // No change needed, don't trigger cache clear or save
      return;
    }

    // Update settings
    this.settings.theme = theme;

    // Persist to disk
    await this.saveData();

    // Invalidate cache so new renders use new theme
    if (this.clearCache) {
      this.clearCache();
    }
  }

  /**
   * Check if a value is a valid theme
   *
   * @param value - Value to check
   * @returns True if value is 'simple' or 'hand-drawn'
   */
  isValidTheme(value: any): value is Theme {
    return value === 'simple' || value === 'hand-drawn';
  }

  /**
   * Apply theme styling to rendered SVG
   *
   * @param svgElement - SVG element to style
   * @returns Modified SVG element
   *
   * Note: js-sequence-diagrams applies theme during rendering,
   * so this method is mainly for post-processing if needed
   */
  applyTheme(svgElement: SVGElement): SVGElement {
    const theme = this.getCurrentTheme();

    // Add theme class for CSS styling
    svgElement.classList.add(`sqjs-theme-${theme}`);

    // Add data attribute for debugging
    svgElement.setAttribute('data-theme', theme);

    return svgElement;
  }
}
