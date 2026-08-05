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
import { AlertTriangle, ShoppingBag, ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/config';

const MixedCartModal: React.FC = () => {
  const { 
    items,
    showMixedCartModal, 
    closeMixedCartModal, 
    clearAndAddConflictingProduct,
    conflictingProduct,
    isLoading
  } = useCart();

  const isIncomingValentine = conflictingProduct?.isValentineProduct || conflictingProduct?.productType === 'valentine';
  const cartHasValentine = items.some(i => i.isValentineProduct || i.productType === 'valentine');

  return (
    <Dialog open={showMixedCartModal} onOpenChange={(open) => !open && closeMixedCartModal()}>
      <DialogContent className="max-w-md rounded-3xl p-6 border-slate-100 bg-white shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900 font-serif">
            Delivery Schedule Conflict
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
            Valentine Special products (delivered Feb 8 - Feb 15) and Regular products follow different delivery schedules and cannot be ordered together.
          </DialogDescription>
        </DialogHeader>

        {conflictingProduct && (
          <div className="my-3 space-y-3">
            {/* Current Cart */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Cart</p>
                <p className="text-sm font-bold text-slate-800">
                  {items.length} {items.length === 1 ? 'item' : 'items'} ({cartHasValentine ? 'Valentine Specials' : 'Regular Products'})
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                In Cart
              </span>
            </div>

            {/* New Product to Add */}
            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center space-x-3 text-left">
              <div className="h-12 w-12 rounded-xl bg-white overflow-hidden flex-shrink-0 shadow-sm border border-slate-200">
                <img 
                  src={getImageUrl(conflictingProduct.image || conflictingProduct.images?.[0])} 
                  alt={conflictingProduct.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider">
                  New Addition • {isIncomingValentine ? 'Valentine Special' : 'Regular Product'}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {conflictingProduct.title}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-1/2 h-11 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
            onClick={closeMixedCartModal}
            disabled={isLoading}
          >
            Keep Existing Cart
          </Button>
          <Button
            type="button"
            className="w-full sm:w-1/2 h-11 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 font-semibold text-xs shadow-md shadow-rose-200"
            onClick={() => {
              clearAndAddConflictingProduct();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Clear & Add ${isIncomingValentine ? 'Valentine' : 'Item'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MixedCartModal;
