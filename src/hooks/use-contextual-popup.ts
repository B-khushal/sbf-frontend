import { useState, useEffect, useCallback, useRef } from 'react';

interface UseContextualPopupOptions {
  preventScroll?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  margin?: number; // Minimum margin from viewport edges
}

interface PopupPosition {
  top: number;
  left: number;
  side: 'top' | 'bottom' | 'left' | 'right' | 'center';
  align: 'start' | 'center' | 'end';
}

export function useContextualPopup(options: UseContextualPopupOptions = {}) {
  const {
    preventScroll = true,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    margin = 16,
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PopupPosition>({
    top: 0,
    left: 0,
    side: 'bottom',
    align: 'center',
  });
  const triggerRef = useRef<HTMLElement>(null);
  const popupRef = useRef<HTMLElement>(null);

  // Helper: clamp value between min and max
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

  // Calculate optimal position for popup
  const calculatePosition = useCallback((triggerElement: HTMLElement, popupElement: HTMLElement) => {
    const triggerRect = triggerElement.getBoundingClientRect();
    const popupRect = popupElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Available space in each direction
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = viewportWidth - triggerRect.right;
    const spaceLeft = triggerRect.left;

    // Try all directions, prefer the one with most space
    const directions: Array<'bottom' | 'top' | 'right' | 'left'> = [
      'bottom', 'top', 'right', 'left'
    ];
    const spaceMap = {
      bottom: spaceBelow,
      top: spaceAbove,
      right: spaceRight,
      left: spaceLeft,
    };
    // Sort directions by available space (descending)
    directions.sort((a, b) => spaceMap[b] - spaceMap[a]);

    let chosenSide: PopupPosition['side'] = 'bottom';
    let top = 0;
    let left = 0;
    let align: PopupPosition['align'] = 'center';
    let foundFit = false;

    for (const side of directions) {
      switch (side) {
        case 'bottom':
          if (spaceBelow >= popupRect.height + margin) {
            top = triggerRect.bottom + scrollY + 8;
            left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);
            chosenSide = 'bottom';
            foundFit = true;
          }
          break;
        case 'top':
          if (spaceAbove >= popupRect.height + margin) {
            top = triggerRect.top + scrollY - popupRect.height - 8;
            left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);
            chosenSide = 'top';
            foundFit = true;
          }
          break;
        case 'right':
          if (spaceRight >= popupRect.width + margin) {
            top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
            left = triggerRect.right + scrollX + 8;
            chosenSide = 'right';
            foundFit = true;
          }
          break;
        case 'left':
          if (spaceLeft >= popupRect.width + margin) {
            top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
            left = triggerRect.left + scrollX - popupRect.width - 8;
            chosenSide = 'left';
            foundFit = true;
          }
          break;
      }
      if (foundFit) break;
    }

    // If no direction fits, fallback to the direction with the most space and clamp
    if (!foundFit) {
      const bestSide = directions[0];
      switch (bestSide) {
        case 'bottom':
          top = triggerRect.bottom + scrollY + 8;
          left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);
          chosenSide = 'bottom';
          break;
        case 'top':
          top = triggerRect.top + scrollY - popupRect.height - 8;
          left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);
          chosenSide = 'top';
          break;
        case 'right':
          top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
          left = triggerRect.right + scrollX + 8;
          chosenSide = 'right';
          break;
        case 'left':
          top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
          left = triggerRect.left + scrollX - popupRect.width - 8;
          chosenSide = 'left';
          break;
      }
    }

    // Clamp to viewport with margin
    left = clamp(left, scrollX + margin, scrollX + viewportWidth - popupRect.width - margin);
    top = clamp(top, scrollY + margin, scrollY + viewportHeight - popupRect.height - margin);

    // If popup is still out of bounds, fallback to centered
    if (
      left < scrollX + margin ||
      left + popupRect.width > scrollX + viewportWidth - margin ||
      top < scrollY + margin ||
      top + popupRect.height > scrollY + viewportHeight - margin
    ) {
      // Centered fallback
      left = scrollX + (viewportWidth - popupRect.width) / 2;
      top = scrollY + (viewportHeight - popupRect.height) / 2;
      chosenSide = 'center';
      align = 'center';
    }

    return { top, left, side: chosenSide, align };
  }, [margin]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]);

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, closeOnOutsideClick]);

  // Prevent background scroll when popup is open
  useEffect(() => {
    if (!isOpen || !preventScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, preventScroll]);

  // Update position when popup opens or window resizes
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !popupRef.current) return;

    const updatePosition = () => {
      const newPosition = calculatePosition(triggerRef.current!, popupRef.current!);
      setPosition(newPosition);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, calculatePosition]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    position,
    triggerRef,
    popupRef,
    open,
    close,
    toggle,
  };
} 