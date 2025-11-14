/**
 * ValidationCache - Hash-based caching for validation results
 * Feature: 002-title-alias-support
 * Implements: FR-016 (validation result caching)
 *
 * Caches validation results keyed by diagram source hash to avoid redundant
 * re-validation when diagram content is unchanged between renders.
 */

import { ValidationResult, ValidationCacheEntry } from '../types/validation';

export class ValidationCache {
  private cache: Map<string, ValidationCacheEntry>;
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(maxSize: number = 1000, ttlMs: number = 300000) {
    // Default: 1000 entries, 5 minute TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  /**
   * Compute hash of diagram source content
   * Uses simple FNV-1a hash for fast computation
   */
  private computeHash(source: string): string {
    let hash = 2166136261; // FNV offset basis

    for (let i = 0; i < source.length; i++) {
      hash ^= source.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return (hash >>> 0).toString(36); // Convert to base36 string
  }

  /**
   * Get cached validation result if exists and not expired
   * Returns null if cache miss or entry expired
   */
  get(source: string): ValidationResult | null {
    const hash = this.computeHash(source);
    const entry = this.cache.get(hash);

    if (!entry) {
      return null; // Cache miss
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttlMs) {
      this.cache.delete(hash);
      return null; // Expired
    }

    return entry.result; // Cache hit
  }

  /**
   * Store validation result in cache
   * Implements LRU eviction when cache is full
   */
  set(source: string, result: ValidationResult): void {
    const hash = this.computeHash(source);

    // If cache is full, evict oldest entry (first entry in Map)
    if (this.cache.size >= this.maxSize && !this.cache.has(hash)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    const entry: ValidationCacheEntry = {
      sourceHash: hash,
      result,
      timestamp: Date.now(),
    };

    this.cache.set(hash, entry);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [hash, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        keysToDelete.push(hash);
      }
    }

    keysToDelete.forEach((hash) => this.cache.delete(hash));
  }
}
