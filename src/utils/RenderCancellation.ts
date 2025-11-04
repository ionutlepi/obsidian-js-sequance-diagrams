/**
 * RenderCancellation
 *
 * Manages render operation cancellation using AbortController.
 * Allows cancelling pending renders when switching from reading to editing mode.
 *
 * Implements: FR-005 (cancel renders on mode switch)
 */

import type { RenderOperation } from '../types';

export class RenderCancellation {
  private operations: Map<string, AbortController>;

  constructor() {
    this.operations = new Map();
  }

  /**
   * Start tracking a new render operation
   *
   * @param blockId - Unique identifier for the diagram block
   * @returns AbortSignal to pass to render operation
   */
  start(blockId: string): AbortSignal {
    // Cancel existing operation for this block if any
    this.cancel(blockId);

    // Create new AbortController
    const controller = new AbortController();
    this.operations.set(blockId, controller);

    return controller.signal;
  }

  /**
   * Cancel a specific render operation
   *
   * @param blockId - Identifier of the operation to cancel
   */
  cancel(blockId: string): void {
    const controller = this.operations.get(blockId);
    if (controller) {
      controller.abort();
      this.operations.delete(blockId);
    }
  }

  /**
   * Cancel all pending render operations
   *
   * Called when:
   * - Switching from reading to editing mode
   * - Note is closed
   * - Plugin is unloaded
   */
  cancelAll(): void {
    for (const controller of this.operations.values()) {
      controller.abort();
    }
    this.operations.clear();
  }

  /**
   * Complete a render operation (remove from tracking)
   *
   * @param blockId - Identifier of the completed operation
   */
  complete(blockId: string): void {
    this.operations.delete(blockId);
  }

  /**
   * Get number of pending operations
   *
   * @returns Count of active render operations
   */
  getPendingCount(): number {
    return this.operations.size;
  }
}
