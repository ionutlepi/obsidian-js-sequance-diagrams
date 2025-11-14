/**
 * Unit Tests for ValidationCache
 * Feature: 002-title-alias-support
 * Tests: FR-016 (validation result caching)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationCache } from '../../src/validators/ValidationCache';
import { ValidationResult } from '../../src/types/validation';

describe('ValidationCache', () => {
  let cache: ValidationCache;

  beforeEach(() => {
    cache = new ValidationCache(10, 1000); // Small cache, 1 second TTL for testing
  });

  describe('hash computation', () => {
    it('should generate consistent hashes for same content', () => {
      const source = 'Title: Test\nAlice->Bob: Hello';
      const result1 = createMockValidationResult(true);
      const result2 = createMockValidationResult(true);

      cache.set(source, result1);
      const cached = cache.get(source);

      expect(cached).not.toBeNull();
      expect(cached?.isValid).toBe(result1.isValid);
    });

    it('should generate different hashes for different content', () => {
      const source1 = 'Title: Test 1';
      const source2 = 'Title: Test 2';
      const result = createMockValidationResult(true);

      cache.set(source1, result);

      expect(cache.get(source1)).not.toBeNull();
      expect(cache.get(source2)).toBeNull();
    });
  });

  describe('cache hit/miss', () => {
    it('should return cached result on cache hit', () => {
      const source = 'Title: Test\nAlice->Bob: Message';
      const result = createMockValidationResult(true);

      cache.set(source, result);
      const cached = cache.get(source);

      expect(cached).toEqual(result);
    });

    it('should return null on cache miss', () => {
      const source = 'Title: Not Cached';
      const cached = cache.get(source);

      expect(cached).toBeNull();
    });

    it('should handle multiple cache entries', () => {
      const source1 = 'Title: Test 1';
      const source2 = 'Title: Test 2';
      const source3 = 'Title: Test 3';

      const result1 = createMockValidationResult(true);
      const result2 = createMockValidationResult(false);
      const result3 = createMockValidationResult(true);

      cache.set(source1, result1);
      cache.set(source2, result2);
      cache.set(source3, result3);

      expect(cache.get(source1)?.isValid).toBe(true);
      expect(cache.get(source2)?.isValid).toBe(false);
      expect(cache.get(source3)?.isValid).toBe(true);
    });
  });

  describe('TTL expiration', () => {
    it('should return null for expired entries', async () => {
      const source = 'Title: Test';
      const result = createMockValidationResult(true);

      cache.set(source, result);

      // Wait for TTL to expire (1 second + buffer)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const cached = cache.get(source);
      expect(cached).toBeNull();
    });

    it('should return valid result before TTL expires', async () => {
      const source = 'Title: Test';
      const result = createMockValidationResult(true);

      cache.set(source, result);

      // Wait less than TTL
      await new Promise((resolve) => setTimeout(resolve, 500));

      const cached = cache.get(source);
      expect(cached).not.toBeNull();
      expect(cached?.isValid).toBe(true);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when cache is full', () => {
      const cache = new ValidationCache(3, 10000); // Max 3 entries

      cache.set('source1', createMockValidationResult(true));
      cache.set('source2', createMockValidationResult(true));
      cache.set('source3', createMockValidationResult(true));

      expect(cache.size()).toBe(3);
      expect(cache.get('source1')).not.toBeNull();

      // Add 4th entry, should evict first
      cache.set('source4', createMockValidationResult(true));

      expect(cache.size()).toBe(3);
      expect(cache.get('source1')).toBeNull(); // Evicted
      expect(cache.get('source2')).not.toBeNull();
      expect(cache.get('source3')).not.toBeNull();
      expect(cache.get('source4')).not.toBeNull();
    });

    it('should not evict when updating existing entry', () => {
      const cache = new ValidationCache(2, 10000);

      cache.set('source1', createMockValidationResult(true));
      cache.set('source2', createMockValidationResult(false));

      expect(cache.size()).toBe(2);

      // Update source1
      cache.set('source1', createMockValidationResult(false));

      expect(cache.size()).toBe(2);
      expect(cache.get('source1')?.isValid).toBe(false);
      expect(cache.get('source2')).not.toBeNull();
    });
  });

  describe('cache management', () => {
    it('should clear all entries on clear()', () => {
      cache.set('source1', createMockValidationResult(true));
      cache.set('source2', createMockValidationResult(true));
      cache.set('source3', createMockValidationResult(true));

      expect(cache.size()).toBe(3);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('source1')).toBeNull();
      expect(cache.get('source2')).toBeNull();
      expect(cache.get('source3')).toBeNull();
    });

    it('should report correct size()', () => {
      expect(cache.size()).toBe(0);

      cache.set('source1', createMockValidationResult(true));
      expect(cache.size()).toBe(1);

      cache.set('source2', createMockValidationResult(true));
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should cleanup expired entries', async () => {
      const cache = new ValidationCache(10, 500); // 500ms TTL

      cache.set('source1', createMockValidationResult(true));
      cache.set('source2', createMockValidationResult(true));

      expect(cache.size()).toBe(2);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 600));

      cache.cleanup();

      expect(cache.size()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty source string', () => {
      const result = createMockValidationResult(true);
      cache.set('', result);

      const cached = cache.get('');
      expect(cached).not.toBeNull();
    });

    it('should handle very long source strings', () => {
      const longSource = 'Title: Test\n' + 'Alice->Bob: Message\n'.repeat(1000);
      const result = createMockValidationResult(true);

      cache.set(longSource, result);

      const cached = cache.get(longSource);
      expect(cached).not.toBeNull();
    });

    it('should handle Unicode characters in source', () => {
      const unicodeSource = 'Title: 🔐 Auth Flow\nparticipant A as "Alice 👤"';
      const result = createMockValidationResult(true);

      cache.set(unicodeSource, result);

      const cached = cache.get(unicodeSource);
      expect(cached).not.toBeNull();
    });
  });
});

// Helper function to create mock ValidationResult
function createMockValidationResult(isValid: boolean): ValidationResult {
  return {
    isValid,
    title: {
      isValid,
      title: isValid ? 'Test Title' : null,
      error: null,
    },
    participants: [],
    participantMap: new Map(),
    errors: [],
  };
}
