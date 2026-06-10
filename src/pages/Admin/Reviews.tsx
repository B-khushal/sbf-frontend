import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Review,
  addReviewReply,
  deleteReview,
  getAdminReviewAnalytics,
  getAdminReviews,
  moderateReview,
} from '@/services/reviewService';
import ReviewCard from '@/components/reviews/ReviewCard';
import { getImageUrl } from '@/config';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CheckCircle2,
  Loader2,
  MessageSquareReply,
  Pin,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [rating, setRating] = useState<string>('all');
  const [sort, setSort] = useState<'latest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'>(
    'latest'
  );
  const [withImages, setWithImages] = useState<'all' | 'true' | 'false'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const [reviewsResponse, analyticsResponse] = await Promise.all([
        getAdminReviews({
          page,
          limit: 12,
          search: search || undefined,
          status: status === 'all' ? undefined : (status as Review['status']),
          rating: rating === 'all' ? undefined : Number(rating),
          sort,
          withImages: withImages === 'all' ? undefined : withImages === 'true',
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
        getAdminReviewAnalytics(90),
      ]);

      setReviews(reviewsResponse.reviews);
      setSummary(reviewsResponse.summary);
      setTotalPages(reviewsResponse.pagination.totalPages);
      setAnalytics(analyticsResponse);
    } catch (error) {
      console.error('Failed to fetch admin reviews:', error);
      toast({
        title: 'Could Not Load Reviews Dashboard',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [page, search, status, rating, sort, withImages, dateFrom, dateTo]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchData({ silent: true });
    }, 20000);

    return () => window.clearInterval(interval);
  }, [page, search, status, rating, sort, withImages, dateFrom, dateTo]);

  const overviewCards = useMemo(() => {
    const overview = analytics?.overview || {
      totalReviews: 0,
      approvedReviews: 0,
      pendingReviews: 0,
      spamReviews: 0,
      averageRating: 0,
    };

    return [
      {
        label: 'Total Reviews',
        value: overview.totalReviews,
        icon: Sparkles,
      },
      {
        label: 'Average Rating',
        value: Number(overview.averageRating || 0).toFixed(1),
        icon: Star,
      },
      {
        label: 'Pending',
        value: overview.pendingReviews,
        icon: MessageSquareReply,
      },
      {
        label: 'Spam Flagged',
        value: overview.spamReviews,
        icon: ShieldAlert,
      },
    ];
  }, [analytics]);

  const handleModeration = async (
    reviewId: string,
    payload: Parameters<typeof moderateReview>[1]
  ) => {
    try {
      setActionLoadingId(reviewId);
      await moderateReview(reviewId, payload);
      toast({
        title: 'Review Updated',
        description: 'The moderation state has been saved.',
      });
      await fetchData({ silent: true });
    } catch (error: any) {
      toast({
        title: 'Moderation Failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (review: Review) => {
    try {
      setActionLoadingId(review._id);
      await deleteReview(review._id);
      toast({
        title: 'Review Deleted',
        description: 'The review and its related content were removed.',
      });
      await fetchData({ silent: true });
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReply = async (review: Review) => {
    const message = replyDrafts[review._id]?.trim();
    if (!message) {
      toast({
        title: 'Reply Required',
        description: 'Please enter a reply before sending.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoadingId(review._id);
      await addReviewReply(review._id, { message });
      toast({
        title: 'Reply Sent',
        description: 'The customer has been notified by email.',
      });
      setReplyDrafts((prev) => ({ ...prev, [review._id]: '' }));
      setOpenReplyId(null);
      await fetchData({ silent: true });
    } catch (error: any) {
      toast({
        title: 'Reply Failed',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
            Reviews Dashboard
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Customer Reviews & Ratings Management
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-300">
            Moderate incoming reviews, reply to customers, flag spam, and monitor how product
            sentiment is changing over time.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.label} className="rounded-[28px] border-0 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.05)] dark:bg-slate-950/70">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                <card.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="rounded-[32px] border-0 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.05)] dark:bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Rating Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.ratingTrends || []}>
                <defs>
                  <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 5]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="averageRating"
                  stroke="#ea580c"
                  strokeWidth={3}
                  fill="url(#ratingFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-0 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.05)] dark:bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Most Reviewed Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(analytics?.mostReviewedProducts || []).map((product: any) => (
              <div
                key={product.productId}
                className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/60"
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.title}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{product.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {product.totalReviews} reviews · {product.averageRating.toFixed(1)} avg
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-0 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.05)] dark:bg-slate-950/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Filters & Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <Input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search product, customer, title, or text"
              className="h-11 rounded-2xl xl:col-span-2"
            />
            <Select value={status} onValueChange={(value) => {
              setPage(1);
              setStatus(value);
            }}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rating} onValueChange={(value) => {
              setPage(1);
              setRating(value);
            }}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} Stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value: any) => {
              setPage(1);
              setSort(value);
            }}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="highest_rating">Highest Rating</SelectItem>
                <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
                <SelectItem value="most_helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
            <Select value={withImages} onValueChange={(value) => {
              setPage(1);
              setWithImages(value as typeof withImages);
            }}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Images" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="true">Images Only</SelectItem>
                <SelectItem value="false">No Image Filter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setPage(1);
                setDateFrom(event.target.value);
              }}
              className="h-11 rounded-2xl"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setPage(1);
                setDateTo(event.target.value);
              }}
              className="h-11 rounded-2xl"
            />
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300">
              <span>Pending</span>
              <Badge className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
                {summary.pending}
              </Badge>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300">
              <span>Approved</span>
              <Badge className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
                {summary.approved}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {loading ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-40 rounded-[32px] bg-white/70" />
              <div className="h-40 rounded-[32px] bg-white/70" />
            </div>
            <div className="grid gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-56 rounded-[32px] bg-white/70" />
              ))}
            </div>
          </>
        ) : reviews.length ? (
          reviews.map((review) => (
            <Card
              key={review._id}
              className="rounded-[34px] border-0 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.05)] dark:bg-slate-950/70"
            >
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        {review.product?.title || 'Product'}
                      </Badge>
                      <Badge className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {review.status}
                      </Badge>
                      <Badge className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
                        {review.helpfulVotes} helpful
                      </Badge>
                      {review.pinned ? (
                        <Badge className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
                          Pinned
                        </Badge>
                      ) : null}
                      {review.featured ? (
                        <Badge className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100">
                          Featured
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm leading-7 text-slate-500 dark:text-slate-300">
                      Customer: <strong>{review.user?.name || review.name}</strong> ·{' '}
                      {review.user?.email || review.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleModeration(review._id, { status: 'approved' })}
                      disabled={actionLoadingId === review._id}
                      className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {actionLoadingId === review._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModeration(review._id, { status: 'rejected' })}
                      disabled={actionLoadingId === review._id}
                      className="rounded-full"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModeration(review._id, { status: 'spam' })}
                      disabled={actionLoadingId === review._id}
                      className="rounded-full"
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Spam
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModeration(review._id, { pinned: !review.pinned })}
                      disabled={actionLoadingId === review._id}
                      className="rounded-full"
                    >
                      <Pin className="mr-2 h-4 w-4" />
                      {review.pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModeration(review._id, { featured: !review.featured })}
                      disabled={actionLoadingId === review._id}
                      className="rounded-full"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {review.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(review)}
                      disabled={actionLoadingId === review._id}
                      className="rounded-full text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <ReviewCard review={review} showStatusBadge />

                <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/60">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Admin Reply
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Customers receive an email notification when you reply.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOpenReplyId((current) => (current === review._id ? null : review._id))
                      }
                      className="rounded-full"
                    >
                      <MessageSquareReply className="mr-2 h-4 w-4" />
                      {openReplyId === review._id ? 'Hide Reply' : 'Reply'}
                    </Button>
                  </div>

                  {openReplyId === review._id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={replyDrafts[review._id] || ''}
                        onChange={(event) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [review._id]: event.target.value,
                          }))
                        }
                        rows={4}
                        placeholder="Thank the customer, address their feedback, and offer help if needed."
                        className="rounded-2xl border-slate-200 dark:border-slate-800"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleReply(review)}
                          disabled={actionLoadingId === review._id}
                          className="rounded-full"
                        >
                          {actionLoadingId === review._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <MessageSquareReply className="mr-2 h-4 w-4" />
                          )}
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-[34px] border-0 bg-white/80 p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.05)] dark:bg-slate-950/70">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              No reviews match the current filters
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Try a broader search, or wait for the next approved review batch.
            </p>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded-full"
        >
          Previous
        </Button>
        <span className="text-sm text-slate-500 dark:text-slate-300">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          className="rounded-full"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminReviews;
