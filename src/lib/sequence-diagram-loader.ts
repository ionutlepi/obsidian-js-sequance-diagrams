/**
 * Sequence Diagram Loader
 *
 * Loads js-sequence-diagram AFTER globals are initialized
 */

// CRITICAL: Ensure globals are set FIRST
import '../init-globals';

// Now it's safe to import js-sequence-diagram
// @ts-ignore - No types available
import Diagram from 'js-sequence-diagram';

export default Diagram;
