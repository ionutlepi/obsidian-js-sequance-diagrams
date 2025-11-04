/**
 * Global Initialization
 *
 * MUST be imported FIRST to set up global dependencies before js-sequence-diagram loads
 */

import * as underscore from 'underscore';
import * as raphael from 'raphael';

// Set up globals immediately when this module loads
if (typeof window !== 'undefined') {
  // Set underscore
  (window as any)._ = underscore;

  // Set Raphael - handle both default export and direct export
  const Raphael = (raphael as any).default || raphael;
  (window as any).Raphael = Raphael;

  console.log('SQJS: Globals initialized', {
    underscore: typeof (window as any)._,
    raphael: typeof (window as any).Raphael
  });
}
