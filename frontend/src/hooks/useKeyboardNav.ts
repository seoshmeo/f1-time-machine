import { useEffect } from 'react';

export interface KeyboardNavCallbacks {
  onPrev?: () => void;
  onNext?: () => void;
  onJumpPrev?: () => void;
  onJumpNext?: () => void;
}

export function useKeyboardNav(callbacks: KeyboardNavCallbacks, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (e.shiftKey && callbacks.onJumpPrev) {
            e.preventDefault();
            callbacks.onJumpPrev();
          } else if (callbacks.onPrev) {
            e.preventDefault();
            callbacks.onPrev();
          }
          break;

        case 'ArrowRight':
          if (e.shiftKey && callbacks.onJumpNext) {
            e.preventDefault();
            callbacks.onJumpNext();
          } else if (callbacks.onNext) {
            e.preventDefault();
            callbacks.onNext();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callbacks, enabled]);
}
