import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  Review,
  deleteReview,
  getProductReviews,
  toggleReviewHelpful,
  addReviewReply,
} from '@/services/reviewService';
import { buildProductReviewUrl } from '@/utils/reviewUrls';
import { Camera, ChevronRight, MessageSquareText, PenSquare, Sparkles } from 'lucide-react';
import ReviewComposer from '@/components/reviews/ReviewComposer';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewSkeleton from '@/components/reviews/ReviewSkeleton';
import RatingStars from '@/components/reviews/RatingStars';

interface ProductReviewsProps {
  productId: string;
  productTitle?: string;
  onReviewSubmit?: () => void;
}

const ProductReviews = ({ productId, productTitle = 'This arrangement', onReviewSubmit }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<Array<{ _id: string; url: string; alt?: string }>>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    verifiedPurchasePercentage: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [viewer, setViewer] = useState<any>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<Review | null>(null);

  const fetchReviewPreview = async () => {
    try {
      setLoading(true);
      const response = await getProductReviews(productId, {
        page: 1,
        limit: 3,
        sort: 'latest',
      });

      setReviews(response.reviews || []);
      setFeaturedReviews(response.featuredReviews?.length ? response.featuredReviews : response.reviews || []);
      setGalleryImages(response.galleryImages || []);
      setStats(response.stats);
      setViewer(response.viewer);
    } catch (error) {
      console.error('Failed to fetch product review preview:', error);
      toast({
        title: 'Could Not Load Reviews',
        description: 'The product reviews are temporarily unavailable.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviewPreview();
  }, [productId]);

  const previewReviews = useMemo(
    () => (featuredReviews.length ? featuredReviews.slice(0, 3) : reviews.slice(0, 3)),
    [featuredReviews, reviews]
  );

  const ownPublishedReview = previewReviews.find((review) => review.user?._id === user?.id);
  const hasOwnReview = Boolean(viewer?.ownReviews?.length);

  const handleReviewSaved = async () => {
    setActiveReview(null);
    await fetchReviewPreview();
    onReviewSubmit?.();
  };

  const handleHelpfulToggle = async (review: Review) => {
    try {
      await toggleReviewHelpful(review._id);
      await fetchReviewPreview();
    } catch (error: any) {
      toast({
        title: 'Could Not Update Helpful Count',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (review: Review) => {
    try {
      await deleteReview(review._id);
      toast({
        title: 'Review Deleted',
        description: 'Your review has been removed successfully.',
      });
      await fetchReviewPreview();
      onReviewSubmit?.();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReply = async (review: Review, message: string, parentReplyId?: string) => {
    try {
      await addReviewReply(review._id, { message, parentReplyId });
      toast({
        title: 'Reply Added',
        description: 'Your reply has been added to the conversation.',
      });
      await fetchReviewPreview();
    } catch (error: any) {
      toast({
        title: 'Reply Failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openDedicatedReviewPage = (orderId?: string) => {
    navigate(buildProductReviewUrl(productId, productTitle, { orderId }));
  };

  return (
    <section className="mt-20 rounded-[36px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/60 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <Badge className="w-fit rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
            Customer Reviews
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Trusted feedback for every floral detail
          </h2>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            Browse verified experiences, bouquet photos, and delivery impressions from customers
            who actually ordered this arrangement.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }

              if (hasOwnReview && !ownPublishedReview) {
                openDedicatedReviewPage(viewer?.ownReviews?.[0]?.orderId);
                return;
              }

              setActiveReview(ownPublishedReview || null);
              setIsComposerOpen(true);
            }}
            className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <PenSquare className="mr-2 h-4 w-4" />
            {ownPublishedReview
              ? 'Edit Your Review'
              : hasOwnReview
                ? 'View Review Status'
                : 'Write a Review'}
          </Button>
          <Button
            variant="outline"
            onClick={() => openDedicatedReviewPage()}
            className="rounded-full border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70"
          >
            View All Reviews
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Inline Review Composer */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-6"
          >
            <ReviewComposer
              isOpen={isComposerOpen}
              onOpenChange={(open) => {
                setIsComposerOpen(open);
                if (!open) {
                  setActiveReview(null);
                }
              }}
              productId={productId}
              productTitle={productTitle}
              viewer={viewer}
              defaultReview={activeReview}
              source="product_page"
              onSaved={handleReviewSaved}
              isInline={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1.95fr]">
        <div className="space-y-5 rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,249,246,0.96),_rgba(255,255,255,0.92))] p-6 dark:border-slate-800/70 dark:bg-[linear-gradient(180deg,_rgba(30,17,16,0.96),_rgba(15,23,42,0.88))]">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {Number(stats.averageRating || 0).toFixed(1)}
              </p>
              <div className="mt-2">
                <RatingStars value={Math.round(stats.averageRating || 0)} size={18} />
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-300">
              <p>
                Based on <span className="font-semibold text-slate-900 dark:text-white">{stats.totalReviews}</span>{' '}
                review{stats.totalReviews === 1 ? '' : 's'}
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {Number(stats.verifiedPurchasePercentage || 0).toFixed(0)}%
                </span>{' '}
                verified purchases
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution?.[star as keyof typeof stats.ratingDistribution] || 0;
              const width = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-8 font-medium text-slate-600 dark:text-slate-300">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-500 dark:text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>

          {galleryImages.length ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Camera className="h-4 w-4" />
                Customer Photos
              </div>
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.slice(0, 6).map((image) => (
                  <button
                    key={image._id}
                    type="button"
                    onClick={() => openDedicatedReviewPage()}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${productTitle} review`}
                      className="h-24 w-full object-cover transition hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              Customer photos will appear here as soon as reviews with images are approved.
            </div>
          )}

          {viewer?.ownReviews?.length ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
              Your latest review status: <strong>{viewer.ownReviews[0].status}</strong>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          {loading ? (
            <>
              <ReviewSkeleton />
              <ReviewSkeleton />
            </>
          ) : previewReviews.length ? (
            <>
              {previewReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={user?.id}
                  onHelpfulToggle={user ? handleHelpfulToggle : undefined}
                  onEdit={user ? (item) => {
                    setActiveReview(item);
                    setIsComposerOpen(true);
                  } : undefined}
                  onDelete={user ? handleDelete : undefined}
                  onReply={user ? handleReply : undefined}
                />
              ))}
            </>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
                <MessageSquareText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No reviews yet</h3>
              <p className="mt-2 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-300">
                Be the first verified customer to share how this bouquet looked on arrival and how
                the delivery experience felt.
              </p>
              <Button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  setActiveReview(null);
                  setIsComposerOpen(true);
                }}
                className="mt-6 rounded-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Write the First Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
