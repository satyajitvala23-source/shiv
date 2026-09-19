/**
 * Desktop Browser Zoom Prevention Utility
 * 
 * Prevents accidental browser zooming on desktop/laptop browsers:
 * - Prevents Ctrl + Mouse Wheel & Trackpad Pinch from zooming the website
 * - Prevents Ctrl + "+" (and Ctrl + "=") from increasing browser zoom
 * - Prevents Ctrl + "-" (and Ctrl + "_") from decreasing browser zoom
 * - Prevents Ctrl + "0" from changing the browser zoom level
 * - Prevents accidental zoom gestures on trackpads (gesturestart / gesturechange)
 * 
 * Important Non-Breaking Guarantees:
 * - Standard mouse-wheel vertical and horizontal scrolling is 100% preserved
 * - Text selection and form input interactions remain fully functional
 * - Standard responsive layout is preserved at 100% zoom
 * - Compatible with Chrome, Edge, Firefox, Opera, and Safari
 */

export function setupDesktopZoomPrevention(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  /**
   * 1. Prevent Ctrl + Mouse Wheel and Trackpad Pinch Zoom
   * Modern desktop browsers (Chrome, Edge, Firefox) fire the 'wheel' event
   * with e.ctrlKey = true when either:
   *   a) User scrolls the mouse wheel while holding the Ctrl key
   *   b) User performs a two-finger pinch gesture on a laptop trackpad
   * When Ctrl (or Meta on macOS) is NOT pressed, normal scrolling is unaffected.
   */
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  };

  /**
   * 2. Prevent Keyboard Zoom Shortcuts
   * - Ctrl + "+" (increase zoom)
   * - Ctrl + "-" (decrease zoom)
   * - Ctrl + "0" (reset zoom to default)
   * We also check Meta key for macOS users (Cmd + / Cmd - / Cmd 0).
   * We exclude AltGr (where ctrlKey & altKey are both true) to avoid blocking
   * special character typing on international keyboard layouts.
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only intercept if Ctrl or Command is pressed without Alt
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode || e.which;

      // Zoom In: Ctrl + "+" or Ctrl + "=" or Numpad "+"
      const isZoomIn =
        key === '+' ||
        key === '=' ||
        code === 'Equal' ||
        code === 'NumpadAdd' ||
        keyCode === 187 ||
        keyCode === 107;

      // Zoom Out: Ctrl + "-" or Ctrl + "_" or Numpad "-"
      const isZoomOut =
        key === '-' ||
        key === '_' ||
        code === 'Minus' ||
        code === 'NumpadSubtract' ||
        keyCode === 189 ||
        keyCode === 109;

      // Zoom Reset: Ctrl + "0" or Numpad "0"
      const isZoomReset =
        key === '0' ||
        code === 'Digit0' ||
        code === 'Numpad0' ||
        keyCode === 48 ||
        keyCode === 96;

      if (isZoomIn || isZoomOut || isZoomReset) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  /**
   * 3. Prevent Trackpad Gesture Zoom (macOS Safari & WebKit)
   */
  const handleGesture = (e: Event) => {
    e.preventDefault();
  };

  // Register non-passive wheel listeners on both window and document
  window.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('wheel', handleWheel, { passive: false });

  // Register keydown listener in capture phase to intercept before browser defaults
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  document.addEventListener('keydown', handleKeyDown, { capture: true });

  // Register gesture listeners for trackpad pinch events in WebKit
  document.addEventListener('gesturestart', handleGesture, { passive: false });
  document.addEventListener('gesturechange', handleGesture, { passive: false });
  document.addEventListener('gestureend', handleGesture, { passive: false });

  // Return clean teardown function
  return () => {
    window.removeEventListener('wheel', handleWheel);
    document.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('gesturestart', handleGesture);
    document.removeEventListener('gesturechange', handleGesture);
    document.removeEventListener('gestureend', handleGesture);
  };
}
