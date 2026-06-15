import React from 'react';
import useCart from '@/hooks/use-cart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const MixedCartModal: React.FC = () => {
  const { 
    showMixedCartModal, 
    closeMixedCartModal, 
    clearAndAddConflictingProduct,
    conflictingProduct,
    isLoading
  } = useCart();

  return (
    <Dialog open={showMixedCartModal} onOpenChange={(open) => !open && closeMixedCartModal()}>
      <DialogContent className="max-w-md rounded-3xl p-6 border-slate-100 bg-white shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Delivery Schedule Conflict
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 leading-relaxed">
            Valentine Special products and Regular products cannot be checked out together because they follow different delivery schedules.
          </DialogDescription>
        </DialogHeader>

        {conflictingProduct && (
          <div className="my-4 rounded-2xl bg-rose-50/40 p-4 border border-rose-100/50 flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-white overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
              <img 
                src={conflictingProduct.image || conflictingProduct.images?.[0] || '/images/placeholder.jpg'} 
                alt={conflictingProduct.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                {conflictingProduct.isValentineProduct || conflictingProduct.productType === 'valentine' 
                  ? 'Valentine Special' 
                  : 'Regular Product'}
              </p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {conflictingProduct.title}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-1/2 h-11 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            onClick={closeMixedCartModal}
            disabled={isLoading}
          >
            Continue with Cart
          </Button>
          <Button
            type="button"
            className="w-full sm:w-1/2 h-11 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 font-medium shadow-lg shadow-rose-200"
            onClick={() => {
              clearAndAddConflictingProduct();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Clear Cart & Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MixedCartModal;
