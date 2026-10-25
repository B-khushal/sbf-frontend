import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  Camera,
  Trash2,
  AlertCircle,
  Truck,
  HeartHandshake,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import usePendingReviewStore from '@/hooks/use-pending-review';
import { createProductReview, PendingDeliveredReviewItem } from '@/services/reviewService';
import { uploadImage } from '@/services/uploadService';
import ProtectedImage from '@/components/ui/ProtectedImage';
import { cn } from '@/lib/utils';

const RATING_EMOTIONS: Record<number, { label: string; emoji: string; color: string }> = {
  5: { label: 'Exceptional & Fresh! Loved it', emoji: '🌟', color: 'text-amber-500' },
  4: { label: 'Very Good! Beautiful blooms', emoji: '🌸', color: 'text-rose-500' },
  3: { label: 'Average / Met expectations', emoji: '🌿', color: 'text-emerald-500' },
  2: { label: 'Below expectations', emoji: '🥀', color: 'text-amber-600' },
  1: { label: 'Disappointed / Needs improvement', emoji: '⚠️', color: 'text-red-500' },
};

export const DeliveredOrderReviewDrawer: React.FC = () => {
  const { toast } = useToast();
  const {
    hasPendingReview,
    pendingItems,
    isDrawerOpen,
    activeItem,
    blockReason,
    closeDrawer,
    setActiveItem,
    markItemReviewed,
  } = usePendingReviewStore();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [freshnessRating, setFreshnessRating] = useState<number>(5);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When activeItem changes, reset form
  useEffect(() => {
    if (activeItem) {
      setRating(5);
      setHoverRating(0);
      setFreshnessRating(5);
      setDeliveryRating(5);
      setTitle('');
      setComment('');
      setUploadedImages([]);
      setErrorMsg(null);
      setIsSuccess(false);
    }
  }, [activeItem?.orderId, activeItem?.productId]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toast({
        title: 'Upload Limit',
        description: 'You can upload up to 5 photos per review.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await uploadImage(formData, 'review');
        return res?.imageUrl || res?.url;
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(Boolean);
      setUploadedImages((prev) => [...prev, ...validUrls]);
      toast({
        title: 'Photo Uploaded',
        description: 'Bouquet photo attached to your review.',
      });
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload photo. You can still submit your review without photos.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    if (!rating || rating < 1) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 4) {
      setErrorMsg('Please enter a review headline of at least 4 characters.');
      return;
    }

    const trimmedComment = comment.trim();
    if (!trimmedComment || trimmedComment.length < 10) {
      setErrorMsg('Please share a few words about your experience (minimum 10 characters).');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await createProductReview(activeItem.productId, {
        orderId: activeItem.orderId,
        rating,
        title: trimmedTitle,
        comment: trimmedComment,
        qualityRating: freshnessRating,
        deliveryRating: deliveryRating,
        images: uploadedImages,
        source: 'order_history',
      });

      setIsSuccess(true);
      markItemReviewed(activeItem.orderId, activeItem.productId);

      toast({
        title: 'Review Published! 🎉',
        description: 'Thank you for your feedback! You can now continue your next purchase.',
      });

      // Auto close after celebratory feedback
      setTimeout(() => {
        setIsSuccess(false);
        closeDrawer();
      }, 2200);
    } catch (err: any) {
      console.error('Review submit failed:', err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to submit review right now. Please try again.';
      setErrorMsg(backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDrawerOpen || !activeItem) {
    return null;
  }

  const currentEmotion = RATING_EMOTIONS[hoverRating || rating] || RATING_EMOTIONS[5];
  const formattedDeliveredDate = activeItem.deliveredAt
    ? new Date(activeItem.deliveredAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Delivery';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] overflow-hidden">
        {/* Backdrop overlay with blur */}
        <motion.div
          key="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            if (!isSubmitting) closeDrawer();
          }}
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Slide-over Drawer Panel */}
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
          <motion.div
            key="drawer-panel"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.6 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.9,
            }}
            className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-stone-900 shadow-2xl flex flex-col border-l border-stone-200/80 dark:border-stone-800 sm:rounded-l-[28px] overflow-hidden"
          >
            {/* Top Glowing Gradient Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 shrink-0" />

            {/* Header Section */}
            <div className="p-5 sm:p-6 border-b border-stone-150 dark:border-stone-800 shrink-0 relative bg-stone-50/70 dark:bg-stone-900/90 backdrop-blur-md">
              <button
                type="button"
                onClick={closeDrawer}
                disabled={isSubmitting}
                className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
                aria-label="Close review drawer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  <Sparkles className="w-3 h-3 text-rose-500 animate-pulse" />
                  <span>Verified Purchase</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Delivered</span>
                </span>
              </div>

              {/* Exact Header Title from User Sketch */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
                Review your purchase here
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Your bouquet was delivered! Please share your review to unlock access to your next purchase.
              </p>

              {/* Block / Notice Banner */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">
                  {blockReason || 'Review is required before purchasing another bouquet.'}
                </span>
              </div>

              {/* Multiple Pending Items Selector Tabs */}
              {pendingItems.length > 1 && (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-stone-400 shrink-0">
                    Pending ({pendingItems.length}):
                  </span>
                  {pendingItems.map((item, idx) => (
                    <button
                      key={`${item.orderId}_${item.productId}`}
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                        item.orderId === activeItem.orderId && item.productId === activeItem.productId
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                      )}
                    >
                      Bouquet #{idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Delivered Bouquet Preview Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-50/40 via-stone-50 to-pink-50/30 dark:from-stone-850 dark:via-stone-900 dark:to-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-center gap-3.5 shadow-xs group">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200/60 dark:border-stone-700 relative shadow-xs">
                  <ProtectedImage
                    src={activeItem.productImage || '/images/default-flower.jpg'}
                    alt={activeItem.productTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300&q=80';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Delivered
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400">
                    <Truck className="w-3 h-3 text-emerald-500" />
                    <span>Delivered on {formattedDeliveredDate}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-snug truncate mt-0.5">
                    {activeItem.productTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      ₹{activeItem.productPrice.toLocaleString('en-IN')}
                    </span>
                    <span>•</span>
                    <span>Order #{activeItem.orderNumber}</span>
                  </div>
                </div>
              </div>

              {/* Success Celebratory Message */}
              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 px-6 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                    Thank You For Your Review!
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                    Your feedback has been recorded. All purchase restrictions have been removed. You can now purchase your next bouquet!
                  </p>
                  <Button
                    onClick={closeDrawer}
                    className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-md hover:opacity-95"
                  >
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                /* Review Form */
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Interactive Star Rating */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800 text-center space-y-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                      Overall Experience Rating
                    </label>

                    <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverRating || rating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 rounded-full transition-all duration-150 transform hover:scale-125 active:scale-95 focus:outline-hidden"
                            aria-label={`Rate ${star} star`}
                          >
                            <Star
                              className={cn(
                                'w-8 h-8 sm:w-10 sm:h-10 transition-colors drop-shadow-xs',
                                isFilled
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300 dark:text-stone-700'
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                      <span>{currentEmotion.emoji}</span>
                      <span className={currentEmotion.color}>{currentEmotion.label}</span>
                    </div>
                  </div>

                  {/* Sub-criteria Ratings (Freshness & Delivery) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                          Flower Freshness
                        </span>
                        <span className="font-bold text-amber-500">{freshnessRating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setFreshnessRating(st)}
                            className="p-0.5 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={cn(
                                'w-4 h-4',
                                st <= freshnessRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300 dark:text-stone-700'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                          Delivery on Time
                        </span>
                        <span className="font-bold text-amber-500">{deliveryRating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setDeliveryRating(st)}
                            className="p-0.5 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={cn(
                                'w-4 h-4',
                                st <= deliveryRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300 dark:text-stone-700'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Review Headline Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span>Review Headline</span>
                      <span className="text-[10px] text-stone-400 font-normal">Min 4 characters</span>
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Stunning fresh roses, made their birthday unforgettable!"
                      className="rounded-xl text-xs sm:text-sm h-10 border-stone-200 dark:border-stone-700 focus-visible:ring-rose-500"
                      maxLength={100}
                    />
                  </div>

                  {/* Review Comments Textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                      <span>Detailed Feedback</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {comment.trim().length} / 1500 chars (Min 10)
                      </span>
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about the flower quality, scent, packaging, arrangement, and the recipient's reaction..."
                      rows={4}
                      className="rounded-xl text-xs sm:text-sm border-stone-200 dark:border-stone-700 focus-visible:ring-rose-500 resize-none"
                      maxLength={1500}
                    />
                  </div>

                  {/* Optional Photo Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-rose-500" />
                        <span>Bouquet Photos (Optional)</span>
                      </label>
                      <span className="text-[10px] text-stone-400">Up to 5 images</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {uploadedImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 relative group shrink-0"
                        >
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute inset-0 bg-stone-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}

                      {uploadedImages.length < 5 && (
                        <label className="w-14 h-14 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-rose-400 flex flex-col items-center justify-center text-stone-400 hover:text-rose-500 cursor-pointer transition-colors shrink-0">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isUploading}
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <Camera className="w-4 h-4" />
                          <span className="text-[8px] font-bold mt-0.5">
                            {isUploading ? '...' : '+ Photo'}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Error Message Alert */}
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isUploading || title.trim().length < 4 || comment.trim().length < 10}
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Publishing Review...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Review & Unlock Purchases</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Safe Note */}
            <div className="px-5 py-3 border-t border-stone-150 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 text-center shrink-0">
              <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                <span>Thank you for helping us keep our flower arrangements fresh & premium</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default DeliveredOrderReviewDrawer;
