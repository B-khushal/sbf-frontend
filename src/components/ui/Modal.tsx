import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      
      // Ensure modal is in viewport
      setTimeout(() => {
        if (modalRef.current) {
          const modalRect = modalRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // If modal is not fully visible in viewport, scroll to it
          if (modalRect.top < 0 || modalRect.bottom > viewportHeight) {
            window.scrollTo({
              top: window.scrollY + modalRect.top - (viewportHeight - modalRect.height) / 2,
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
      // Scroll to top when modal closes
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-xl shadow-2xl w-full max-h-full overflow-y-auto ${className}`}
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
