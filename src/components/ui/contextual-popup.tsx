import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { X } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"

const ContextualPopup = PopoverPrimitive.Root

const ContextualPopupTrigger = PopoverPrimitive.Trigger

interface ContextualPopupContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  showCloseButton?: boolean;
  variant?: 'default' | 'popup';
  triggerRef?: React.RefObject<HTMLElement>;
}

const ContextualPopupContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  ContextualPopupContentProps
>(({ 
  className, 
  children, 
  showCloseButton = true, 
  variant = 'default',
  triggerRef,
  align = "center", 
  sideOffset = 8,
  alignOffset = 0,
  side = "bottom",
  avoidCollisions = true,
  collisionBoundary,
  collisionPadding = 8,
  ...props 
}, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      side={side}
      avoidCollisions={avoidCollisions}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      className={cn(
        "z-50 w-auto max-w-[90vw] max-h-[80vh] overflow-y-auto",
        "border bg-background shadow-lg",
        variant === 'default' && "p-6 rounded-lg",
        variant === 'popup' && "p-0 rounded-xl",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          variant === 'popup' && "relative bg-gradient-to-br from-background to-muted rounded-xl overflow-hidden shadow-2xl"
        )}
      >
        {children}
        {showCloseButton && (
          <PopoverPrimitive.Close 
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
          </PopoverPrimitive.Close>
        )}
      </div>
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
))
ContextualPopupContent.displayName = PopoverPrimitive.Content.displayName

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
)
ContextualPopupHeader.displayName = "ContextualPopupHeader"

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
)
ContextualPopupFooter.displayName = "ContextualPopupFooter"

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
))
ContextualPopupTitle.displayName = "ContextualPopupTitle"

const ContextualPopupDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ContextualPopupDescription.displayName = "ContextualPopupDescription"

export {
  ContextualPopup,
  ContextualPopupTrigger,
  ContextualPopupContent,
  ContextualPopupHeader,
  ContextualPopupFooter,
  ContextualPopupTitle,
  ContextualPopupDescription,
} 