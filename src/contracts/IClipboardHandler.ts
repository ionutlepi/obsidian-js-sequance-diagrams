/**
 * Contract: IClipboardHandler
 *
 * Purpose: Handle copying rendered diagrams to clipboard as images
 *
 * Implements: FR-018 (copy diagram as image)
 */

export interface IClipboardHandler {
  /**
   * Copy SVG diagram to clipboard as PNG image
   *
   * @param svgElement - The rendered diagram SVG
   * @returns Promise resolving when copy completes
   *
   * Behavior:
   * - Converts SVG to PNG using canvas
   * - Copies PNG to clipboard via Clipboard API
   * - Shows success notice on completion
   * - Shows error notice if clipboard access denied
   *
   * Implementation:
   * 1. Create canvas element with SVG dimensions
   * 2. Draw SVG onto canvas using drawImage
   * 3. Convert canvas to Blob
   * 4. Write Blob to clipboard using ClipboardItem
   */
  copyDiagramAsImage(svgElement: SVGElement): Promise<void>;

  /**
   * Add copy button to diagram container
   *
   * @param container - Element containing the rendered diagram
   * @param svgElement - The SVG to copy when button clicked
   *
   * Behavior:
   * - Adds a small "Copy" button overlay on the diagram
   * - Button appears on hover
   * - Clicking button triggers copyDiagramAsImage
   */
  addCopyButton(container: HTMLElement, svgElement: SVGElement): void;
}
