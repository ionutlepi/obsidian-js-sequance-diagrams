/**
 * Unit Tests: ThemeManager
 *
 * Tests for User Story 3: Theme Management
 * Tests: T064-T065
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeManager } from '../../src/renderer/ThemeManager';
import type { PluginSettings } from '../../src/types';

describe('ThemeManager - getCurrentTheme() and setTheme() (T064)', () => {
  let themeManager: ThemeManager;
  let mockSettings: PluginSettings;
  let mockSaveData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock plugin settings
    mockSettings = {
      theme: 'simple',
    };

    // Mock save function
    mockSaveData = vi.fn();

    // Create theme manager with mocked dependencies
    themeManager = new ThemeManager(mockSettings, mockSaveData);
  });

  it('should implement getCurrentTheme() method', () => {
    // Contract: IThemeManager must have getCurrentTheme()

    expect(themeManager.getCurrentTheme).toBeDefined();
    expect(typeof themeManager.getCurrentTheme).toBe('function');
  });

  it('should return current theme from settings', () => {
    // FR-009: getCurrentTheme() returns the active theme

    const theme = themeManager.getCurrentTheme();
    expect(theme).toBe('simple');
  });

  it('should implement setTheme() method', () => {
    // Contract: IThemeManager must have setTheme()

    expect(themeManager.setTheme).toBeDefined();
    expect(typeof themeManager.setTheme).toBe('function');
  });

  it('should update theme via setTheme()', async () => {
    // FR-010: setTheme() changes the active theme

    await themeManager.setTheme('hand-drawn');

    const theme = themeManager.getCurrentTheme();
    expect(theme).toBe('hand-drawn');
  });

  it('should persist theme change via saveData callback', async () => {
    // FR-010: Theme changes are saved to plugin settings

    await themeManager.setTheme('hand-drawn');

    expect(mockSaveData).toHaveBeenCalled();
    expect(mockSettings.theme).toBe('hand-drawn');
  });

  it('should implement isValidTheme() type guard', () => {
    // Contract: IThemeManager should validate theme values

    expect(themeManager.isValidTheme).toBeDefined();
    expect(typeof themeManager.isValidTheme).toBe('function');
  });

  it('should validate theme with isValidTheme()', () => {
    // FR-009: Only 'simple' and 'hand-drawn' are valid themes

    expect(themeManager.isValidTheme('simple')).toBe(true);
    expect(themeManager.isValidTheme('hand-drawn')).toBe(true);
    expect(themeManager.isValidTheme('invalid')).toBe(false);
    expect(themeManager.isValidTheme('')).toBe(false);
  });

  it('should reject invalid themes in setTheme()', async () => {
    // FR-009: setTheme() should only accept valid themes

    await expect(async () => {
      await themeManager.setTheme('invalid' as any);
    }).rejects.toThrow();

    // Theme should remain unchanged
    expect(themeManager.getCurrentTheme()).toBe('simple');
  });

  it('should support switching between simple and hand-drawn', async () => {
    // FR-009: Both themes are supported

    // Start with simple
    expect(themeManager.getCurrentTheme()).toBe('simple');

    // Switch to hand-drawn
    await themeManager.setTheme('hand-drawn');
    expect(themeManager.getCurrentTheme()).toBe('hand-drawn');

    // Switch back to simple
    await themeManager.setTheme('simple');
    expect(themeManager.getCurrentTheme()).toBe('simple');

  });
});

describe('Cache invalidation on theme change (T065)', () => {
  let themeManager: ThemeManager;
  let mockSettings: PluginSettings;
  let mockSaveData: ReturnType<typeof vi.fn>;
  let mockClearCache: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSettings = {
      theme: 'simple',
    };
    mockSaveData = vi.fn();
    mockClearCache = vi.fn();

    themeManager = new ThemeManager(mockSettings, mockSaveData);
  });

  it('should accept cache clear callback in constructor', () => {
    // Contract: ThemeManager can trigger cache invalidation

    const themeManagerWithCache = new ThemeManager(
      mockSettings,
      mockSaveData,
      mockClearCache
    );

    expect(themeManagerWithCache).toBeDefined();
  });

  it('should call cache clear callback when theme changes', async () => {
    // FR-010: Cache invalidation on theme change

    const themeManagerWithCache = new ThemeManager(
      mockSettings,
      mockSaveData,
      mockClearCache
    );

    await themeManagerWithCache.setTheme('hand-drawn');

    expect(mockClearCache).toHaveBeenCalledTimes(1);
  });

  it('should not call cache clear if theme is already active', async () => {
    // Optimization: Don't invalidate cache if theme unchanged

    const themeManagerWithCache = new ThemeManager(
      mockSettings,
      mockSaveData,
      mockClearCache
    );

    // Set to same theme (simple)
    await themeManagerWithCache.setTheme('simple');

    expect(mockClearCache).not.toHaveBeenCalled();
  });

  it('should work without cache clear callback (optional)', async () => {
    // Contract: Cache callback is optional

    const themeManagerNoCache = new ThemeManager(mockSettings, mockSaveData);

    // Should not throw when changing theme
    await expect(
      themeManagerNoCache.setTheme('hand-drawn')
    ).resolves.not.toThrow();

  });
});
