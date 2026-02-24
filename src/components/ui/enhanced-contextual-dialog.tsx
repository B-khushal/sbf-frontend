import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { useContextualPopup } from "@/hooks/use-contextual-popup"
import { createPortal } from 'react-dom'

const EnhancedContextualDialog = DialogPrimitive.Root

const EnhancedContextualDialogTrigger = DialogPrimitive.Trigger

interface EnhancedContextualDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  variant?: 'default' | 'popup';
  triggerRef?: React.RefObject<HTMLElement>;
  useContextualPositioning?: boolean;
}

const EnhancedContextualDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  EnhancedContextualDialogContentProps
>(({ 
  className, 
  children, 
  showCloseButton = true, 
  variant = 'default',
  triggerRef,
  useContextualPositioning = true,
  ...props 
}, ref) => {
  const {
    position,
    popupRef,
  } = useContextualPopup({
    preventScroll: true,
    closeOnEscape: true,
    closeOnOutsideClick: true,
  });

  // Use contextual positioning if enabled and trigger ref is provided
  const shouldUseContextual = useContextualPositioning && triggerRef?.current;

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
      />
      
      {shouldUseContextual ? (
        // Contextual positioning
        createPortal(
          <DialogPrimitive.Content
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              if (popupRef) {
                popupRef.current = node;
              }
            }}
            className={cn(
              "absolute z-dropdown w-auto max-w-[90vw] max-h-[80vh] overflow-y-auto",
              "border bg-background shadow-lg",
              variant === 'default' && "p-6 rounded-lg",
              variant === 'popup' && "p-0 rounded-xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              className
            )}
            style={{
              top: position.top,
              left: position.left,
            }}
            {...props}
          >
            <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Dialog content.
            </DialogPrimitive.Description>
            <div
              className={cn(
                variant === 'popup' && "relative bg-gradient-to-br from-background to-muted rounded-xl overflow-hidden shadow-2xl"
              )}
            >
              {children}
              {showCloseButton && (
                <DialogPrimitive.Close 
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
                </DialogPrimitive.Close>
              )}
            </div>
          </DialogPrimitive.Content>,
          document.body
        )
      ) : (
        // Traditional centered positioning
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-4 text-center">
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <DialogPrimitive.Content
              ref={ref}
              className={cn(
                "inline-block align-middle w-full text-left transform transition-all duration-200",
                "max-w-[90vw] max-h-[80vh] overflow-y-auto",
                variant === 'default' && "border bg-background p-6 shadow-lg sm:rounded-lg",
                variant === 'popup' && "p-0",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                className
              )}
              {...props}
            >
              <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                Dialog content.
              </DialogPrimitive.Description>
              <div
                className={cn(
                  variant === 'popup' && "relative bg-gradient-to-br from-background to-muted rounded-xl overflow-hidden shadow-2xl"
                )}
              >
                {children}
                {showCloseButton && (
                  <DialogPrimitive.Close 
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
                  </DialogPrimitive.Close>
                )}
              </div>
            </DialogPrimitive.Content>
          </div>
        </div>
      )}
    </DialogPrimitive.Portal>
  );
});
EnhancedContextualDialogContent.displayName = DialogPrimitive.Content.displayName

const EnhancedContextualDialogHeader = ({
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
)
EnhancedContextualDialogHeader.displayName = "EnhancedContextualDialogHeader"

const EnhancedContextualDialogFooter = ({
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
)
EnhancedContextualDialogFooter.displayName = "EnhancedContextualDialogFooter"

const EnhancedContextualDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
EnhancedContextualDialogTitle.displayName = DialogPrimitive.Title.displayName

const EnhancedContextualDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedContextualDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  EnhancedContextualDialog,
  EnhancedContextualDialogTrigger,
  EnhancedContextualDialogContent,
  EnhancedContextualDialogHeader,
  EnhancedContextualDialogFooter,
  EnhancedContextualDialogTitle,
  EnhancedContextualDialogDescription,
} 
