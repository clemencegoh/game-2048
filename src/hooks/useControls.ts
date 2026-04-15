import { useEffect, useRef } from 'react';
import type { Direction } from '../lib/gameEngine';

export const useControls = (onMove: (direction: Direction) => void) => {
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          onMove('up');
          break;
        case 'ArrowDown':
          onMove('down');
          break;
        case 'ArrowLeft':
          onMove('left');
          break;
        case 'ArrowRight':
          onMove('right');
          break;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) return; // Ignore multi-touch
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling while swiping on the board
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
      
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) > 30) { // Threshold
        if (absX > absY) {
          onMove(deltaX > 0 ? 'right' : 'left');
        } else {
          onMove(deltaY > 0 ? 'down' : 'up');
        }
      }
      
      touchStart.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onMove]);
};
