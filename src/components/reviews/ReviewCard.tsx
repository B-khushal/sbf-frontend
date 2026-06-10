import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Review } from '@/services/reviewService';
import {
  CalendarDays,
  CheckCheck,
  HeartHandshake,
  Image as ImageIcon,
  Loader2,
  MessageSquareReply,
  Pencil,
  Trash2,
} from 'lucide-react';
import RatingStars from './RatingStars';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  showStatusBadge?: boolean;
  allowReply?: boolean;
  onHelpfulToggle?: (review: Review) => Promise<void>;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => Promise<void>;
  onReply?: (review: Review, message: string, parentReplyId?: string) => Promise<void>;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const reviewStatusLabel: Record<Review['status'], string> = {
  pending: 'Pending Approval',
  approved: 'Published',
  rejected: 'Needs Revision',
  spam: 'Spam',
};

const ThreadReplies = ({
  replies,
  onReply,
  review,
}: {
  replies: NonNullable<Review['replies']>;
  onReply?: (review: Review, message: string, parentReplyId?: string) => Promise<void>;
  review: Review;
}) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!replies.length) {
    return null;
  }

  const submitReply = async (parentReplyId: string) => {
    if (!onReply || !replyText.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onReply(review, replyText.trim(), parentReplyId);
      setReplyText('');
      setActiveReplyId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <div key={reply._id} className="space-y-3">
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                  reply.isAdminReply
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                )}
              >
                {reply.isAdminReply ? 'SBF Team' : reply.authorName}
              </Badge>
              <span className="text-xs text-slate-400">{formatDate(reply.createdAt)}</span>
            </div>
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{reply.message}</p>
            {onReply && reply.isAdminReply && (
              <button
                type="button"
                onClick={() =>
                  setActiveReplyId((current) => (current === reply._id ? null : reply._id))
                }
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-600 transition hover:text-rose-700 dark:text-rose-300"
              >
                <MessageSquareReply className="h-3.5 w-3.5" />
                Reply
              </button>
            )}
          </div>

          {activeReplyId === reply._id && onReply && (
            <div className="rounded-3xl border border-rose-100 bg-rose-50/80 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
              <Textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                rows={3}
                placeholder="Continue the conversation..."
                className="rounded-2xl border-rose-100 bg-white dark:border-slate-800 dark:bg-slate-950"
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setActiveReplyId(null);
                    setReplyText('');
                  }}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => submitReply(reply._id)}
                  disabled={isSubmitting || !replyText.trim()}
                  className="rounded-full"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Reply
                </Button>
              </div>
            </div>
          )}

          {reply.children?.length ? (
            <div className="ml-4 border-l border-dashed border-slate-200 pl-4 dark:border-slate-800">
              <ThreadReplies replies={reply.children} review={review} onReply={onReply} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const ReviewCard = ({
  review,
  currentUserId,
  showStatusBadge = false,
  allowReply = true,
  onHelpfulToggle,
  onEdit,
  onDelete,
  onReply,
}: ReviewCardProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = useMemo(() => {
    const reviewUserId = review.user?._id;
    return Boolean(currentUserId && reviewUserId && currentUserId === reviewUserId);
  }, [currentUserId, review.user?._id]);

  const statusTone =
    review.status === 'pending'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-100'
      : review.status === 'rejected'
        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100'
        : review.status === 'spam'
          ? 'bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100';

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(review);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHelpfulToggle = async () => {
    if (!onHelpfulToggle) {
      return;
    }

    try {
      setIsLiking(true);
      await onHelpfulToggle(review);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
      <article className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.1)] dark:border-slate-800/90 dark:bg-slate-950/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-semibold text-rose-700 dark:from-rose-950/60 dark:to-orange-950/50 dark:text-rose-200">
              {initialsFromName(review.user?.name || review.name || 'A')}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {review.user?.name || review.name}
                </h3>
                {review.isVerifiedPurchase && (
                  <Badge className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                    Verified Purchase
                  </Badge>
                )}
                {showStatusBadge && (
                  <Badge className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', statusTone)}>
                    {reviewStatusLabel[review.status]}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars value={review.rating} />
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (onEdit || onDelete) ? (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(review)}
                  className="rounded-full"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-full text-rose-600 hover:text-rose-700"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          <h4 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {review.title}
          </h4>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{review.comment}</p>

          {(review.pros?.length || review.cons?.length) && (
            <div className="grid gap-3 md:grid-cols-2">
              {review.pros?.length ? (
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
                    Highlights
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.pros.map((pro) => (
                      <Badge key={pro} className="rounded-full bg-white text-emerald-700 dark:bg-slate-900 dark:text-emerald-200">
                        {pro}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {review.cons?.length ? (
                <div className="rounded-3xl border border-amber-100 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-100">
                    Improvement Notes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.cons.map((con) => (
                      <Badge key={con} className="rounded-full bg-white text-amber-700 dark:bg-slate-900 dark:text-amber-100">
                        {con}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {review.images?.length ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 transition hover:text-rose-800 dark:text-rose-300"
              >
                <ImageIcon className="h-4 w-4" />
                {review.images.length} review image{review.images.length > 1 ? 's' : ''}
              </button>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {review.images.slice(0, 4).map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => {
                      setSelectedImage(index);
                      setIsGalleryOpen(true);
                    }}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <img
                      src={image}
                      alt={`${review.title} review image ${index + 1}`}
                      className="h-28 w-full object-cover transition hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {review.replies?.length ? (
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/50">
              <ThreadReplies replies={review.replies} review={review} onReply={allowReply ? onReply : undefined} />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-full',
                review.likedByViewer
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200'
                  : 'text-slate-600 dark:text-slate-300'
              )}
              onClick={handleHelpfulToggle}
              disabled={isLiking || !onHelpfulToggle}
            >
              {isLiking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartHandshake className="mr-2 h-4 w-4" />}
              Helpful ({review.helpfulVotes || 0})
            </Button>
            {allowReply && onReply && !review.replies?.some((reply) => reply.isAdminReply === false) && review.response ? (
              <Badge variant="secondary" className="rounded-full">
                You can reply to the SBF team below
              </Badge>
            ) : null}
          </div>
        </div>
      </article>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-4 text-white shadow-none">
          <div className="space-y-4">
            <div className="text-sm font-medium text-white/80">
              {selectedImage + 1} / {review.images.length}
            </div>
            <div className="flex items-center justify-center">
              <img
                src={review.images[selectedImage]}
                alt={`${review.title} review image ${selectedImage + 1}`}
                className="max-h-[72vh] rounded-3xl object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {review.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'overflow-hidden rounded-2xl border transition',
                    selectedImage === index
                      ? 'border-white'
                      : 'border-white/20 opacity-70 hover:opacity-100'
                  )}
                >
                  <img
                    src={image}
                    alt={`${review.title} thumbnail ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewCard;
