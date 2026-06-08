import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EnhancedContextualDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  triggerRef?: React.RefObject<HTMLElement | null>
  useContextualPositioning?: boolean
}

const EnhancedContextualDialog = Dialog

const EnhancedContextualDialogTrigger = DialogTrigger

const EnhancedContextualDialogPortal = DialogPortal

const EnhancedContextualDialogOverlay = DialogOverlay

const EnhancedContextualDialogClose = DialogClose

const EnhancedContextualDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  EnhancedContextualDialogContentProps
>(({ triggerRef: _triggerRef, useContextualPositioning: _useContextualPositioning, ...props }, ref) => (
  <DialogContent ref={ref} {...props} />
))
EnhancedContextualDialogContent.displayName = "EnhancedContextualDialogContent"

const EnhancedContextualDialogHeader = DialogHeader
const EnhancedContextualDialogFooter = DialogFooter
const EnhancedContextualDialogTitle = DialogTitle
const EnhancedContextualDialogDescription = DialogDescription

export {
  EnhancedContextualDialog,
  EnhancedContextualDialogClose,
  EnhancedContextualDialogContent,
  EnhancedContextualDialogDescription,
  EnhancedContextualDialogFooter,
  EnhancedContextualDialogHeader,
  EnhancedContextualDialogOverlay,
  EnhancedContextualDialogPortal,
  EnhancedContextualDialogTitle,
  EnhancedContextualDialogTrigger,
}
