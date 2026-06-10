import { Skeleton } from '@/components/ui/skeleton';

const ReviewSkeleton = () => {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
};

export default ReviewSkeleton;
