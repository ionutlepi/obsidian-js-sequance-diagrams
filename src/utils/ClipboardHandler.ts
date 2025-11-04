/**
 * ClipboardHandler
 *
 * Handles copying rendered diagrams to clipboard as PNG images.
 * Converts SVG to PNG using canvas before copying.
 *
 * Implements: IClipboardHandler contract
 * FRs: FR-018 (copy diagram as image)
 */

import type { IClipboardHandler } from '../contracts/IClipboardHandler';
import { Notice } from 'obsidian';

export class ClipboardHandler implements IClipboardHandler {
  /**
   * Copy SVG diagram to clipboard as PNG image
   *
   * @param svgElement - The rendered diagram SVG
   * @returns Promise resolving when copy completes
   */
  async copyDiagramAsImage(svgElement: SVGElement): Promise<void> {
    try {
      // Get SVG dimensions
      const bbox = svgElement.getBoundingClientRect();
      const width = bbox.width || 800;
      const height = bbox.height || 600;

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x for better quality
      canvas.height = height * 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Scale for high DPI
      ctx.scale(2, 2);

      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Load SVG as image
      const img = new Image();
      img.onload = async () => {
        try {
          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error('Failed to create blob'));
            }, 'image/png');
          });

          // Write to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);

          // Show success notice
          new Notice('Diagram copied to clipboard');

          // Clean up
          URL.revokeObjectURL(url);
        } catch (error) {
          URL.revokeObjectURL(url);
          throw error;
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        throw new Error('Failed to load SVG as image');
      };

      img.src = url;
    } catch (error) {
      // Show error notice
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to copy diagram to clipboard';
      new Notice(`Error: ${message}`);
      throw error;
    }
  }

  /**
   * Add copy button to diagram container
   *
   * @param container - Element containing the rendered diagram
   * @param svgElement - The SVG to copy when button clicked
   */
  addCopyButton(container: HTMLElement, svgElement: SVGElement): void {
    // Create button
    const button = document.createElement('button');
    button.className = 'sqjs-copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy diagram as image');

    // Style button
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 6px 12px;
      background-color: var(--interactive-accent);
      color: var(--text-on-accent);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.2s;
      font-family: var(--font-interface);
      z-index: 10;
    `;

    // Make container relative for absolute positioning
    container.style.position = 'relative';

    // Show button on hover
    container.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
    });

    container.addEventListener('mouseleave', () => {
      button.style.opacity = '0';
    });

    // Handle button click
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Disable button during copy
      button.disabled = true;
      button.textContent = 'Copying...';

      try {
        await this.copyDiagramAsImage(svgElement);
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
          button.disabled = false;
        }, 2000);
      } catch (error) {
        button.textContent = 'Failed';
        setTimeout(() => {
          button.textContent = 'Copy';
          button.disabled = false;
        }, 2000);
      }
    });

    // Append button to container
    container.appendChild(button);
  }
}
