import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/services/uploadService';
import {
  CreateReviewData,
  Review,
  ReviewViewerState,
  createProductReview,
  updateReview,
} from '@/services/reviewService';
import RatingStars from './RatingStars';

interface ReviewComposerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productTitle: string;
  viewer?: ReviewViewerState | null;
  defaultReview?: Review | null;
  source?: CreateReviewData['source'];
  onSaved: (review: Review) => void;
}

const splitTags = (value: string) =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const ReviewComposer = ({
  isOpen,
  onOpenChange,
  productId,
  productTitle,
  viewer,
  defaultReview,
  source = 'product_reviews_page',
  onSaved,
}: ReviewComposerProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [qualityRating, setQualityRating] = useState<string>('none');
  const [valueRating, setValueRating] = useState<string>('none');
  const [deliveryRating, setDeliveryRating] = useState<string>('none');
  const [orderId, setOrderId] = useState('');
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const eligibleOrderOptions = viewer?.eligibleOrders || [];

  const selectedOrderPlaceholder = useMemo(() => {
    if (defaultReview?.orderId) {
      return typeof defaultReview.orderId === 'string'
        ? defaultReview.orderId
        : defaultReview.orderId.orderNumber || defaultReview.orderId._id;
    }

    return eligibleOrderOptions.find((order) => !order.hasReview)?.orderNumber || '';
  }, [defaultReview?.orderId, eligibleOrderOptions]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRating(defaultReview?.rating || 0);
    setTitle(defaultReview?.title || '');
    setComment(defaultReview?.comment || '');
    setQualityRating(
      defaultReview?.qualityRating ? String(defaultReview.qualityRating) : 'none'
    );
    setValueRating(defaultReview?.valueRating ? String(defaultReview.valueRating) : 'none');
    setDeliveryRating(
      defaultReview?.deliveryRating ? String(defaultReview.deliveryRating) : 'none'
    );
    setProsInput((defaultReview?.pros || []).join(', '));
    setConsInput((defaultReview?.cons || []).join(', '));
    setImageUrls(defaultReview?.images || []);

    if (defaultReview?.orderId) {
      setOrderId(
        typeof defaultReview.orderId === 'string'
          ? defaultReview.orderId
          : defaultReview.orderId._id
      );
    } else {
      setOrderId(eligibleOrderOptions.find((order) => !order.hasReview)?._id || '');
    }
  }, [defaultReview, eligibleOrderOptions, isOpen]);

  const canSubmitNewReview =
    Boolean(defaultReview) || viewer?.canReview || eligibleOrderOptions.some((order) => !order.hasReview);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    if (imageUrls.length + files.length > 6) {
      toast({
        title: 'Too Many Images',
        description: 'You can upload up to 6 review images.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await uploadImage(formData, 'review');
        uploadedUrls.push(response.imageUrl);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      toast({
        title: 'Images Uploaded',
        description: `${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} added to your review.`,
      });
    } catch (error) {
      console.error('Review image upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'We could not upload your review images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: 'Rating Required',
        description: 'Please choose a star rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast({
        title: 'Review Incomplete',
        description: 'Please add both a title and the details of your review.',
        variant: 'destructive',
      });
      return;
    }

    if (!defaultReview && !orderId) {
      toast({
        title: 'Delivered Order Required',
        description: 'Please select the delivered order this review belongs to.',
        variant: 'destructive',
      });
      return;
    }

    const payload: CreateReviewData = {
      orderId: orderId || undefined,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      qualityRating: qualityRating === 'none' ? undefined : Number(qualityRating),
      valueRating: valueRating === 'none' ? undefined : Number(valueRating),
      deliveryRating: deliveryRating === 'none' ? undefined : Number(deliveryRating),
      pros: splitTags(prosInput),
      cons: splitTags(consInput),
      images: imageUrls,
      source,
    };

    try {
      setIsSubmitting(true);
      const response = defaultReview
        ? await updateReview(defaultReview._id, payload)
        : await createProductReview(productId, payload);

      toast({
        title: defaultReview ? 'Review Updated' : 'Review Submitted',
        description:
          response.message ||
          (defaultReview
            ? 'Your review has been updated successfully.'
            : 'Your review has been sent for approval.'),
      });

      onSaved(response.review);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save review:', error);
      toast({
        title: 'Could Not Save Review',
        description: error.response?.data?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-0 bg-white/95 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.16)] dark:bg-slate-950/95 sm:max-w-3xl">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(255,228,219,0.9),_transparent_48%),linear-gradient(180deg,_rgba(255,247,243,0.98),_rgba(255,255,255,0.98))] px-6 py-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(98,46,41,0.42),_transparent_48%),linear-gradient(180deg,_rgba(24,17,16,0.98),_rgba(15,23,42,0.98))]">
          <DialogHeader className="space-y-3 text-left">
            <Badge className="w-fit rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {defaultReview ? 'Edit Review' : 'Write a Review'}
            </Badge>
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {productTitle}
            </DialogTitle>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Share the bouquet quality, freshness, delivery experience, and any photos that will
              help future customers shop with confidence.
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6">
          {!canSubmitNewReview && !defaultReview && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              Reviews are only available for customers with a delivered purchase of this product.
            </div>
          )}

          {!defaultReview && eligibleOrderOptions.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Delivered Order
              </label>
              <Select value={orderId} onValueChange={setOrderId}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <SelectValue placeholder={`Select order ${selectedOrderPlaceholder}`} />
                </SelectTrigger>
                <SelectContent>
                  {eligibleOrderOptions
                    .filter((order) => !order.hasReview)
                    .map((order) => (
                      <SelectItem key={order._id} value={order._id}>
                        {order.orderNumber}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Overall Rating
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <RatingStars
                value={hoveredRating || rating}
                size={28}
                interactive
                onChange={setRating}
                onHoverChange={setHoveredRating}
              />
              {rating > 0 && (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  {rating === 5
                    ? 'Exceptional'
                    : rating === 4
                      ? 'Beautiful'
                      : rating === 3
                        ? 'Good'
                        : rating === 2
                          ? 'Needs Improvement'
                          : 'Disappointed'}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                label: 'Bouquet Quality',
                value: qualityRating,
                setter: setQualityRating,
              },
              {
                label: 'Value for Money',
                value: valueRating,
                setter: setValueRating,
              },
              {
                label: 'Delivery Experience',
                value: deliveryRating,
                setter: setDeliveryRating,
              },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {metric.label}
                </label>
                <Select value={metric.value} onValueChange={metric.setter}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Skip</SelectItem>
                    {[5, 4, 3, 2, 1].map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option} Star{option > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Review Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: The roses arrived fresh and elegant"
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Your Experience
            </label>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Tell us about the floral freshness, packaging, presentation, and delivery."
              rows={6}
              className="rounded-2xl border-slate-200 dark:border-slate-800"
              maxLength={1500}
            />
            <p className="text-right text-xs text-slate-400">{comment.length}/1500</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Highlights
              </label>
              <Input
                value={prosInput}
                onChange={(event) => setProsInput(event.target.value)}
                placeholder="Fresh flowers, premium wrapping, on-time delivery"
                className="h-11 rounded-2xl border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Anything To Improve
              </label>
              <Input
                value={consInput}
                onChange={(event) => setConsInput(event.target.value)}
                placeholder="Smaller bouquet than expected, card text alignment"
                className="h-11 rounded-2xl border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Review Photos
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Upload Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading || imageUrls.length >= 6}
                />
              </label>
            </div>

            {imageUrls.length === 0 ? (
              <div className="flex min-h-32 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  Add up to 6 images
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {imageUrls.map((url) => (
                  <div
                    key={url}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <img src={url} alt="Review upload" className="h-36 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls((prev) => prev.filter((item) => item !== url))}
                      className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || (!canSubmitNewReview && !defaultReview)}
              className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {defaultReview ? 'Save Review' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewComposer;
