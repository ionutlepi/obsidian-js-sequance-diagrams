/**
 * Contract: IThemeManager
 *
 * Purpose: Manage diagram rendering themes and apply styles
 *
 * Implements: FR-009 (theme configuration), FR-010 (consistent theme application)
 */

export interface IThemeManager {
  /**
   * Get current active theme
   *
   * @returns Current theme name
   */
  getCurrentTheme(): 'simple' | 'hand-drawn';

  /**
   * Set active theme
   *
   * @param theme - Theme to activate
   *
   * Behavior:
   * - Persists theme to plugin settings
   * - Triggers re-render of all visible diagrams
   * - Clears render cache to force re-render with new theme
   */
  setTheme(theme: 'simple' | 'hand-drawn'): Promise<void>;

  /**
   * Apply theme styles to an SVG element
   *
   * @param svgElement - SVG to style
   * @param theme - Theme to apply
   *
   * Behavior:
   * - Modifies SVG attributes to match theme (stroke, fill, font)
   * - 'simple': Clean geometric shapes, solid lines
   * - 'hand-drawn': Sketchy appearance, hand-drawn style
   */
  applyTheme(svgElement: SVGElement, theme: 'simple' | 'hand-drawn'): void;

  /**
   * Check if theme is valid
   *
   * @param theme - Theme name to validate
   * @returns True if theme is supported
   */
  isValidTheme(theme: string): theme is 'simple' | 'hand-drawn';
}
