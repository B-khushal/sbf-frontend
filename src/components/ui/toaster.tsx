import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Check, X, AlertTriangle, Info, ShoppingCart, Heart, User, Package, Truck } from "lucide-react"

const renderLeftElement = (type?: string, image?: string) => {
  if (image) {
    return (
      <div className="relative flex-shrink-0">
        <img
          src={image}
          alt="Product Thumbnail"
          className="w-[52px] h-[52px] rounded-xl object-cover border border-black/5 shadow-sm"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder.jpg";
          }}
        />
        {/* Tiny overlay badge with micro-animations */}
        {type === 'cart' && (
          <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] border-2 border-white flex items-center justify-center text-white shadow-sm animate-cart-bounce">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}
        {type === 'wishlist' && (
          <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-gradient-to-br from-[#ff4d8d] to-[#e11d48] border-2 border-white flex items-center justify-center text-white shadow-sm animate-heart-pulse">
            <Heart className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
      </div>
    )
  }

  let gradientClass = "bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]"
  let IconComponent = Info
  let isWishlist = false

  switch (type) {
    case 'success':
      gradientClass = "bg-gradient-to-br from-[#22c55e] to-[#16a34a]"
      IconComponent = Check
      break
    case 'order_placed':
      gradientClass = "bg-gradient-to-br from-[#22c55e] to-[#16a34a]"
      IconComponent = Package
      break
    case 'order_delivered':
      gradientClass = "bg-gradient-to-br from-[#22c55e] to-[#16a34a]"
      IconComponent = Truck
      break
    case 'cart':
      gradientClass = "bg-gradient-to-br from-[#22c55e] to-[#16a34a]"
      IconComponent = Check
      break
    case 'wishlist':
      gradientClass = "bg-gradient-to-br from-[#ff4d8d] to-[#e11d48]"
      IconComponent = Heart
      isWishlist = true
      break
    case 'error':
      gradientClass = "bg-gradient-to-br from-[#ef4444] to-[#b91c1c]"
      IconComponent = X
      break
    case 'warning':
      gradientClass = "bg-gradient-to-br from-[#f59e0b] to-[#d97706]"
      IconComponent = AlertTriangle
      break
    case 'login':
      gradientClass = "bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]"
      IconComponent = User
      break
    default:
      break
  }

  // Cart/Wishlist Micro-interactions
  const bounceClass = type === 'cart' ? 'animate-cart-bounce' : ''
  const pulseClass = type === 'wishlist' ? 'animate-heart-pulse' : ''

  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm ${gradientClass}`}>
      <IconComponent className={`w-4 h-4 ${bounceClass} ${pulseClass} ${isWishlist ? 'fill-current' : ''}`} />
    </div>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, type, image, ...props }) {
        return (
          <Toast key={id} className="pr-10" {...props}>
            {renderLeftElement(type, image)}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
