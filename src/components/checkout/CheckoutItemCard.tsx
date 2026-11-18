import React from 'react';
import { Heart, Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/config';
import { useCurrency } from '@/contexts/CurrencyContext';

import type { CartItem } from '@/utils/cartManager';

export interface CheckoutItemCardProps {
  item: CartItem & { name?: string; originalPrice?: number };
  isUpdating?: boolean;
  isInWishlist?: boolean;
  onUpdateQuantity: (itemId: string, nextQty: number) => void;
  onRemove: (itemId: string) => void;
  onMoveToWishlist?: (item: CartItem) => void;
}

export const CheckoutItemCard: React.FC<CheckoutItemCardProps> = ({
  item,
  isUpdating = false,
  isInWishlist = false,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
}) => {
  const { formatPrice, convertPrice } = useCurrency();
  const itemId = item._id || item.id || item.productId;
  const rawImage =
    (Array.isArray(item.images) && item.images[0]) || item.image || '/placeholder.svg';
  const imageSrc = rawImage.startsWith('/') ? rawImage : getImageUrl(rawImage, { width: 240, height: 240, crop: 'fill' });

  const unitPrice = Number(item.price || 0);
  const originalUnitPrice = Number(item.originalPrice || 0);
  const hasDiscount = originalUnitPrice > unitPrice && unitPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
    : 0;
  const lineTotal = unitPrice * (item.quantity || 1);
  const originalLineTotal = originalUnitPrice * (item.quantity || 1);

  const variantLabel =
    item.selectedVariant?.label ||
    item.selectedVariant?.name ||
    item.selectedVariant?.size ||
    item.customizations?.cakeWeight ||
    item.customizations?.weight ||
    null;

  const cust = item.customizations;

  return (
    <div className="flex gap-3 sm:gap-4 rounded-2xl border border-[#EDE5DD] bg-white p-3 sm:p-4 shadow-[0_2px_10px_rgba(30,27,24,0.03)]">
      {/* Consistent Square / 4:5 Thumbnail */}
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-[#F5F0EA] border border-[#EDE5DD]">
        <img
          src={imageSrc}
          alt={item.title || 'Floral Gift'}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {hasDiscount && discountPct > 0 && (
          <span className="absolute left-1 top-1 rounded-full bg-[#FFF7F9]/95 px-1.5 py-0.5 text-[9px] font-bold text-[#BE185D] border border-[#F5CBD8]">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Product Info + Controls */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-[15px] font-semibold leading-snug text-[#1E1B18] line-clamp-2 break-words">
              {item.title || item.name}
            </h4>
            {variantLabel && (
              <p className="mt-0.5 text-xs font-medium text-[#7A7168] truncate">
                Variant: <span className="text-[#3C342E]">{variantLabel}</span>
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm sm:text-base font-bold text-[#1E1B18] tabular-nums">
              {formatPrice(convertPrice(lineTotal))}
            </p>
            {hasDiscount && (
              <p className="text-[11px] text-[#9A9086] line-through tabular-nums">
                {formatPrice(convertPrice(originalLineTotal))}
              </p>
            )}
            {(item.quantity || 1) > 1 && (
              <p className="text-[10px] text-[#8A8076] tabular-nums">
                {formatPrice(convertPrice(unitPrice))} each
              </p>
            )}
          </div>
        </div>

        {/* Customizations Summary */}
        {cust && (
          <div className="space-y-0.5 text-[11px] text-[#6F665E]">
            {(cust.cakeFlavor || cust.flavor || cust.eggless !== undefined || cust.isEggless !== undefined) && (
              <p className="truncate">
                {[
                  cust.cakeFlavor || cust.flavor,
                  cust.eggless !== undefined || cust.isEggless !== undefined
                    ? (cust.eggless ?? cust.isEggless)
                      ? '100% Eggless'
                      : 'Contains Egg'
                    : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            )}
            {cust.cakeMessage && (
              <p className="italic truncate">Cake Note: "{cust.cakeMessage}"</p>
            )}
            {cust.personalization?.value && (
              <p className="truncate">
                {cust.personalization.label || 'Custom Text'}:{' '}
                <span className="font-semibold text-[#2E2824]">{cust.personalization.value}</span>
              </p>
            )}
            {Array.isArray(cust.addons) && cust.addons.length > 0 && (
              <p className="truncate text-[#8E244D]">
                Add-ons: {cust.addons.map((a: { name?: string; title?: string }) => a.name || a.title).join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Bottom Row: Touch-Friendly Quantity Stepper + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div
            className="inline-flex items-center rounded-xl border border-[#E5DDD5] bg-[#FAF8F5] p-0.5"
            aria-label={`Quantity for ${item.title}`}
          >
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateQuantity(itemId, (item.quantity || 1) - 1)}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3C342E] transition-colors hover:bg-white active:scale-95 disabled:opacity-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2rem] text-center text-xs sm:text-sm font-semibold text-[#1E1B18] tabular-nums">
              {item.quantity || 1}
            </span>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateQuantity(itemId, (item.quantity || 1) + 1)}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3C342E] transition-colors hover:bg-white active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {onMoveToWishlist && item.productModel !== 'AddonProduct' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onMoveToWishlist(item)}
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors',
                  isInWishlist
                    ? 'bg-[#FFF0F5] text-[#BE185D]'
                    : 'text-[#7A7168] hover:bg-[#FAF8F5] hover:text-[#BE185D]'
                )}
                aria-label={`Save ${item.title} to wishlist`}
              >
                <Heart className={cn('h-3.5 w-3.5', isInWishlist && 'fill-[#BE185D]')} />
                <span className="hidden xs:inline">Wishlist</span>
              </button>
            )}

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onRemove(itemId)}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-[#7A7168] transition-colors hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Remove ${item.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutItemCard;
