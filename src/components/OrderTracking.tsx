import React from 'react';
import { Check, Package, Eye, Wrench, Truck, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface OrderTrackingProps {
  currentStatus: 'order_placed' | 'received' | 'being_made' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingHistory?: {
    status: string;
    timestamp: string;
    message?: string;
  }[];
  className?: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ currentStatus, trackingHistory, className }) => {
  const isDelivered = currentStatus === 'delivered';
  
  const trackingSteps: TrackingStep[] = [
    {
      status: 'order_placed',
      label: 'Order Placed',
      icon: <Package className="w-5 h-5" />,
      description: 'Your order has been placed successfully'
    },
    {
      status: 'received',
      label: 'Order Received',
      icon: <Eye className="w-5 h-5" />,
      description: 'We have received your order and are reviewing it'
    },
    {
      status: 'being_made',
      label: 'Being Prepared',
      icon: <Wrench className="w-5 h-5" />,
      description: 'Your beautiful arrangement is being prepared'
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: <Truck className="w-5 h-5" />,
      description: 'Your order is on its way to you'
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Order has been delivered successfully'
    }
  ];

  const getStepStatus = (stepStatus: string) => {
    if (currentStatus === 'cancelled') {
      return 'cancelled';
    }

    const currentIndex = trackingSteps.findIndex(step => step.status === currentStatus);
    const stepIndex = trackingSteps.findIndex(step => step.status === stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepHistory = (stepStatus: string) => {
    return trackingHistory?.find(history => history.status === stepStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (currentStatus === 'cancelled') {
    return (
      <div className={cn("bg-red-50 border border-red-200 rounded-lg p-6", className)}>
        <div className="flex items-center gap-3 text-red-600">
          <XCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Order Cancelled</h3>
            <p className="text-sm text-red-500">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border p-6 transition-all duration-300",
      isDelivered 
        ? "bg-green-100 border-green-300" 
        : "bg-white border-gray-200",
      className
    )}>
      <h3 className={cn(
        "text-lg font-semibold mb-6 flex items-center gap-2",
        isDelivered ? "text-green-800" : "text-gray-800"
      )}>
        {isDelivered ? (
          <Sparkles className="w-5 h-5 text-green-600" />
        ) : (
          <Package className="w-5 h-5 text-primary" />
        )}
        Order Tracking
        {isDelivered && (
          <span className="ml-2 text-green-600 text-sm font-normal">✓ Complete</span>
        )}
      </h3>
      
      <div className="space-y-6">
        {trackingSteps.map((step, index) => {
          const stepStatus = getStepStatus(step.status);
          const history = getStepHistory(step.status);
          const isCurrentStepDelivered = step.status === 'delivered' && stepStatus === 'current';
          
          return (
            <div key={step.status} className="flex gap-4">
              {/* Step Icon */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    stepStatus === 'completed' && "bg-green-500 border-green-500 text-white",
                    stepStatus === 'current' && !isCurrentStepDelivered && "bg-primary border-primary text-white animate-pulse",
                    isCurrentStepDelivered && "bg-green-500 border-green-500 text-white animate-pulse",
                    stepStatus === 'pending' && "bg-gray-100 border-gray-300 text-gray-400"
                  )}
                >
                  {stepStatus === 'completed' || isCurrentStepDelivered ? (
                    <Check className="w-5 h-5" />
                  ) : stepStatus === 'current' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                {/* Connecting Line */}
                {index < trackingSteps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-12 mt-2 transition-all duration-300",
                      (stepStatus === 'completed' || isCurrentStepDelivered) ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <h4
                    className={cn(
                      "font-medium transition-colors",
                      (stepStatus === 'completed' || isCurrentStepDelivered) && "text-green-600",
                      stepStatus === 'current' && !isCurrentStepDelivered && "text-primary",
                      stepStatus === 'pending' && "text-gray-400"
                    )}
                  >
                    {step.label}
                    {isCurrentStepDelivered && (
                      <span className="ml-2 text-green-500">🎉</span>
                    )}
                  </h4>
                  
                  {history && (
                    <span className={cn(
                      "text-sm",
                      isDelivered ? "text-green-600" : "text-gray-500"
                    )}>
                      {formatDate(history.timestamp)}
                    </span>
                  )}
                </div>
                
                <p
                  className={cn(
                    "text-sm mt-1 transition-colors",
                    (stepStatus === 'completed' || isCurrentStepDelivered) && "text-green-600",
                    stepStatus === 'current' && !isCurrentStepDelivered && "text-gray-700",
                    stepStatus === 'pending' && "text-gray-400"
                  )}
                >
                  {history?.message || step.description}
                  {isCurrentStepDelivered && " Thank you for choosing us! 🌸"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Delivered Order Special Message */}
      {isDelivered && (
        <div className="mt-6 p-4 bg-green-200 border border-green-300 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">Order Successfully Delivered!</p>
          </div>
          <p className="text-sm text-green-700 mt-1">
            We hope you loved your beautiful arrangement. Thank you for choosing Spring Blossoms Florist! 🌹
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking; 