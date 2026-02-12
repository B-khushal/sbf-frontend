import * as React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { useContextualPopup } from "@/hooks/use-contextual-popup"
import { createPortal } from 'react-dom'

interface EnhancedContextualPopupProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCloseButton?: boolean;
  variant?: 'default' | 'popup';
  className?: string;
  preventScroll?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  sideOffset?: number;
  alignOffset?: number;
}

const EnhancedContextualPopup: React.FC<EnhancedContextualPopupProps> = ({
  children,
  trigger,
  isOpen: controlledIsOpen,
  onOpenChange,
  showCloseButton = true,
  variant = 'default',
  className,
  preventScroll = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  sideOffset = 8,
  alignOffset = 0,
}) => {
  const {
    isOpen: uncontrolledIsOpen,
    position,
    triggerRef,
    popupRef,
    open,
    close,
    toggle,
  } = useContextualPopup({
    preventScroll,
    closeOnEscape,
    closeOnOutsideClick,
  });

  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;
  const handleOpenChange = onOpenChange || (controlledIsOpen !== undefined ? undefined : toggle);

  // Handle trigger click
  const handleTriggerClick = () => {
    if (controlledIsOpen !== undefined) {
      handleOpenChange?.(!isOpen);
    } else {
      toggle();
    }
  };

  // Handle close
  const handleClose = () => {
    if (controlledIsOpen !== undefined) {
      handleOpenChange?.(false);
    } else {
      close();
    }
  };

  // Clone trigger element with ref and click handler
  const triggerElement = React.cloneElement(trigger as React.ReactElement, {
    ref: triggerRef,
    onClick: handleTriggerClick,
  });

  return (
    <>
      {triggerElement}
      
      {isOpen && createPortal(
        <div
          ref={popupRef}
          className={cn(
            "absolute z-dropdown w-auto max-w-[90vw] max-h-[80vh] overflow-y-auto",
            "border bg-background shadow-lg",
            variant === 'default' && "p-6 rounded-lg",
            variant === 'popup' && "p-0 rounded-xl",
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div
            className={cn(
              variant === 'popup' && "relative bg-gradient-to-br from-background to-muted rounded-xl overflow-hidden shadow-2xl"
            )}
          >
            {children}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className={cn(
                  "absolute right-4 top-4 rounded-sm transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
                  variant === 'default' && "opacity-70 ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                  variant === 'popup' && "text-current opacity-70 hover:opacity-100 z-10 bg-black/10 hover:bg-black/20 rounded-full p-2 hover:rotate-90 duration-300"
                )}
              >
                <X className={cn(
                  variant === 'default' && "h-4 w-4",
                  variant === 'popup' && "h-5 w-5"
                )} />
                <span className="sr-only">Close</span>
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Header component
const ContextualPopupHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

// Footer component
const ContextualPopupFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

// Title component
const ContextualPopupTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

// Description component
const ContextualPopupDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

export {
  EnhancedContextualPopup,
  ContextualPopupHeader,
  ContextualPopupFooter,
  ContextualPopupTitle,
  ContextualPopupDescription,
}; 