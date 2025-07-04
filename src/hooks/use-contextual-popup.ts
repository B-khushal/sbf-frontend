import { useState, useEffect, useCallback, useRef } from 'react';

interface UseContextualPopupOptions {
  preventScroll?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

interface PopupPosition {
  top: number;
  left: number;
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export function useContextualPopup(options: UseContextualPopupOptions = {}) {
  const {
    preventScroll = true,
    closeOnEscape = true,
    closeOnOutsideClick = true,
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
    const spaceRight = viewportWidth - triggerRect.left;
    const spaceLeft = triggerRect.right;

    // Determine optimal side
    let side: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    let align: 'start' | 'center' | 'end' = 'center';

    if (spaceBelow >= popupRect.height || spaceBelow > spaceAbove) {
      side = 'bottom';
    } else if (spaceAbove >= popupRect.height) {
      side = 'top';
    } else if (spaceRight >= popupRect.width || spaceRight > spaceLeft) {
      side = 'right';
    } else if (spaceLeft >= popupRect.width) {
      side = 'left';
    } else {
      // Fallback to center if no space available
      side = 'bottom';
    }

    // Calculate position based on side
    let top = 0;
    let left = 0;

    switch (side) {
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8; // 8px offset
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);
        break;
      case 'top':
        top = triggerRect.top + scrollY - popupRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popupRect.width / 2);
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
        left = triggerRect.right + scrollX + 8;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popupRect.height / 2);
        left = triggerRect.left + scrollX - popupRect.width - 8;
        break;
    }

    // Ensure popup stays within viewport bounds
    if (left < scrollX) {
      left = scrollX + 8;
      align = 'start';
    } else if (left + popupRect.width > scrollX + viewportWidth) {
      left = scrollX + viewportWidth - popupRect.width - 8;
      align = 'end';
    }

    if (top < scrollY) {
      top = scrollY + 8;
    } else if (top + popupRect.height > scrollY + viewportHeight) {
      top = scrollY + viewportHeight - popupRect.height - 8;
    }

    return { top, left, side, align };
  }, []);

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