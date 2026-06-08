import * as React from "react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
  showCloseButton?: boolean
}

const Modal = ({
  children,
  className,
  isOpen,
  onClose,
  showCloseButton = true,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        variant="popup"
        showCloseButton={showCloseButton}
        className={cn("max-w-[95vw] sm:max-w-lg", className)}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
