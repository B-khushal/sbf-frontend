import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import productService from '@/services/productService';
import {
  Review,
  deleteReview,
  getProductReviews,
  toggleReviewHelpful,
  addReviewReply,
} from '@/services/reviewService';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewComposer from '@/components/reviews/ReviewComposer';
import ReviewSkeleton from '@/components/reviews/ReviewSkeleton';
import RatingStars from '@/components/reviews/RatingStars';
import { buildProductReviewUrl } from '@/utils/reviewUrls';
import { getImageUrl } from '@/config';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Filter,
  Loader2,
  Sparkles,
} from 'lucide-react';

type ProductSummary = {
  _id: string;
  title: string;
  images: string[];
  category?: string;
  description?: string;
  rating?: number;
  numReviews?: number;
};

const ProductReviewsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { ref, inView } = useInView({ threshold: 0.1 });

  const [product, setProduct] = useState<ProductSummary | null>(null);
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    hasNext: false,
    totalReviews: 0,
    totalPages: 1,
  });
  const [sort, setSort] = useState<'latest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'>(
    'latest'
  );
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [withImages, setWithImages] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchParams] = useSearchParams();
  const composerRef = useRef<HTMLDivElement>(null);

  // Automatically open the review composer and scroll to it if orderId or writeReview is in the URL
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const writeReview = searchParams.get('writeReview') === 'true';
    if (orderId || writeReview) {
      setIsComposerOpen(true);
      
      // Smooth scroll to the composer container after a brief expansion delay
      setTimeout(() => {
        const element = composerRef.current;
        if (element) {
          const yOffset = -90; // offset for sticky header
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [searchParams]);

  const schemaMarkup = useMemo(() => {
    if (!product) {
      return null;
    }

    const topReview = reviews[0];
    const structured = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: product.images?.length ? product.images.map((image) => getImageUrl(image)) : undefined,
      aggregateRating:
        stats.totalReviews > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: Number(stats.averageRating || 0).toFixed(1),
              reviewCount: stats.totalReviews,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      review: topReview
        ? {
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: topReview.user?.name || topReview.name,
            },
            datePublished: topReview.createdAt,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: topReview.rating,
              bestRating: 5,
            },
            reviewBody: topReview.comment,
            name: topReview.title,
          }
        : undefined,
    };

    return JSON.stringify(structured);
  }, [product, reviews, stats]);

  const hasOwnReview = Boolean(viewer?.ownReviews?.length);

  useEffect(() => {
    if (!productId) {
      navigate('/shop', { replace: true });
      return;
    }

    void (async () => {
      try {
        const productData = await productService.getProductById(productId);
        setProduct({
          _id: productData._id,
          title: productData.title,
          images: productData.images,
          category: productData.category,
          description: productData.description,
          rating: productData.rating,
          numReviews: productData.numReviews,
        });
      } catch (error) {
        console.error('Failed to load product for reviews page:', error);
        navigate('/shop', { replace: true });
      }
    })();
  }, [navigate, productId]);

  const fetchReviews = async (targetPage: number, reset = false) => {
    if (!productId) {
      return;
    }

    try {
      if (targetPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getProductReviews(productId, {
        page: targetPage,
        limit: 8,
        sort,
        rating: ratingFilter === 'all' ? undefined : Number(ratingFilter),
        verified: verifiedOnly || undefined,
        withImages: withImages || undefined,
      });

      setReviews((prev) => {
        if (reset) {
          return response.reviews;
        }

        const existingIds = new Set(prev.map((review) => review._id));
        const merged = [...prev];
        response.reviews.forEach((review) => {
          if (!existingIds.has(review._id)) {
            merged.push(review);
          }
        });
        return merged;
      });

      setFeaturedReviews(response.featuredReviews || []);
      setGalleryImages(response.galleryImages || []);
      setStats(response.stats);
      setViewer(response.viewer);
      setPagination({
        hasNext: response.pagination.hasNext,
        totalReviews: response.pagination.totalReviews,
        totalPages: response.pagination.totalPages,
      });
    } catch (error) {
      console.error('Failed to load product reviews:', error);
      toast({
        title: 'Could Not Load Reviews',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setReviews([]);
    void fetchReviews(1, true);
  }, [productId, sort, ratingFilter, withImages, verifiedOnly]);

  useEffect(() => {
    if (page === 1) {
      return;
    }

    void fetchReviews(page);
  }, [page]);

  useEffect(() => {
    if (inView && pagination.hasNext && !loading && !loadingMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, loadingMore, pagination.hasNext]);

  const handleReviewSaved = async () => {
    setEditingReview(null);
    setPage(1);
    await fetchReviews(1, true);
  };

  const handleHelpfulToggle = async (review: Review) => {
    try {
      await toggleReviewHelpful(review._id);
      await fetchReviews(1, true);
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
      await fetchReviews(1, true);
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
        description: 'Your reply has been added to the review thread.',
      });
      await fetchReviews(1, true);
    } catch (error: any) {
      toast({
        title: 'Reply Failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!productId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,236,229,0.55),_transparent_34%),linear-gradient(180deg,_rgba(252,248,245,1),_rgba(247,240,236,0.9))] pb-16 dark:bg-[radial-gradient(circle_at_top_left,_rgba(88,43,39,0.25),_transparent_34%),linear-gradient(180deg,_rgba(10,12,18,1),_rgba(15,23,42,0.96))]">
      {schemaMarkup ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaMarkup }} />
      ) : null}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(product ? `/product/${product._id}` : '/shop')}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.4fr]">
          <Card className="overflow-hidden rounded-[34px] border-0 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:bg-slate-950/70">
            {product ? (
              <>
                <div className="relative">
                  <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.title}
                    className="h-72 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <Badge className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                      {product.category || 'Luxury Florals'}
                    </Badge>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight">{product.title}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <RatingStars value={Math.round(stats.averageRating || 0)} />
                      <span className="text-sm text-white/90">
                        {Number(stats.averageRating || 0).toFixed(1)} across {stats.totalReviews} review
                        {stats.totalReviews === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {product.description ||
                      'Read every approved review, compare customer photos, and share your own experience if you received this arrangement in a delivered order.'}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Average Rating
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                        {Number(stats.averageRating || 0).toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Total Reviews
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                        {stats.totalReviews}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Verified Rate
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                        {Number(stats.verifiedPurchasePercentage || 0).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = stats.ratingDistribution?.[star as keyof typeof stats.ratingDistribution] || 0;
                      const width = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="w-8 text-slate-600 dark:text-slate-300">{star}★</span>
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

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        if (hasOwnReview) {
                          const visibleOwnReview = reviews.find((review) => review.user?._id === user.id);
                          if (visibleOwnReview) {
                            setEditingReview(visibleOwnReview);
                            setIsComposerOpen(true);
                            return;
                          }
                        }
                        setEditingReview(null);
                        setIsComposerOpen(true);
                      }}
                      className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {hasOwnReview ? 'Update Your Review' : 'Write a Review'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          window.location.origin +
                            buildProductReviewUrl(product._id, product.title, {
                              orderId: viewer?.eligibleOrders?.[0]?._id,
                            })
                        );
                        toast({
                          title: 'Review Link Copied',
                          description: 'The shareable review page URL is now on your clipboard.',
                        });
                      }}
                      className="rounded-full"
                    >
                      Copy Review Link
                    </Button>
                  </div>

                  {viewer?.ownReviews?.length ? (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Your latest review is currently {viewer.ownReviews[0].status}.
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="space-y-4 p-6">
                <Skeleton className="h-72 w-full rounded-[28px]" />
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-5 w-full" />
              </div>
            )}
          </Card>

          <div className="space-y-6">
            {/* Expanded Inline Review Composer */}
            <div ref={composerRef}>
              <AnimatePresence>
                {isComposerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden mb-6"
                  >
                    <ReviewComposer
                      isOpen={isComposerOpen}
                      onOpenChange={(open) => {
                        setIsComposerOpen(open);
                        if (!open) {
                          setEditingReview(null);
                        }
                      }}
                      productId={productId}
                      productTitle={product?.title || 'Product'}
                      viewer={viewer}
                      defaultReview={editingReview}
                      source="product_reviews_page"
                      onSaved={handleReviewSaved}
                      isInline={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Card className="rounded-[34px] border-0 bg-white/80 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)] dark:bg-slate-950/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Filter className="h-4 w-4" />
                    Review Filters
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Sort by freshness, quality, helpfulness, and photo-backed reviews.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Select value={sort} onValueChange={(value: any) => setSort(value)}>
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue placeholder="Sort reviews" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="highest_rating">Highest Rating</SelectItem>
                      <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
                      <SelectItem value="most_helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      {[5, 4, 3, 2, 1].map((ratingOption) => (
                        <SelectItem key={ratingOption} value={String(ratingOption)}>
                          {ratingOption} Stars
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    With Images
                    <Switch checked={withImages} onCheckedChange={setWithImages} />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    Verified Only
                    <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                  </label>
                </div>
              </div>
            </Card>

            {galleryImages.length ? (
              <Card className="rounded-[34px] border-0 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] dark:bg-slate-950/70">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Camera className="h-4 w-4" />
                  Customer Review Gallery
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {galleryImages.map((image) => (
                    <div
                      key={image._id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product?.title} review`}
                        className="h-32 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {featuredReviews.length ? (
              <Card className="rounded-[34px] border-0 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] dark:bg-slate-950/70">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Sparkles className="h-4 w-4" />
                  Featured Reviews
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {featuredReviews.slice(0, 2).map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      currentUserId={user?.id}
                      onHelpfulToggle={user ? handleHelpfulToggle : undefined}
                      onEdit={user ? (item) => {
                        setEditingReview(item);
                        setIsComposerOpen(true);
                      } : undefined}
                      onDelete={user ? handleDelete : undefined}
                      onReply={user ? handleReply : undefined}
                    />
                  ))}
                </div>
              </Card>
            ) : null}

            <div className="space-y-5">
              {loading ? (
                <>
                  <ReviewSkeleton />
                  <ReviewSkeleton />
                  <ReviewSkeleton />
                </>
              ) : reviews.length ? (
                reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    currentUserId={user?.id}
                    showStatusBadge={review.user?._id === user?.id}
                    onHelpfulToggle={user ? handleHelpfulToggle : undefined}
                    onEdit={user ? (item) => {
                      setEditingReview(item);
                      setIsComposerOpen(true);
                    } : undefined}
                    onDelete={user ? handleDelete : undefined}
                    onReply={user ? handleReply : undefined}
                  />
                ))
              ) : (
                <Card className="rounded-[34px] border border-dashed border-slate-200 bg-white/80 p-8 text-center dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    No reviews match these filters yet
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-300">
                    Try resetting the filters, or be the first verified customer to leave a review.
                  </p>
                </Card>
              )}
            </div>

            <div ref={ref} className="flex justify-center py-4">
              {loadingMore ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm dark:bg-slate-950/70 dark:text-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more reviews
                </div>
              ) : pagination.hasNext ? (
                <div className="text-sm text-slate-400">Scroll for more reviews</div>
              ) : reviews.length ? (
                <div className="text-sm text-slate-400">
                  You’ve reached the end of the review feed.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductReviewsPage;
