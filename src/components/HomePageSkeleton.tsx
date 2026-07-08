import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

// Reusable Shimmer Injector
const injectShimmerCSS = () => {
  if (typeof document === "undefined") return;
  const id = "skeleton-shimmer-styles";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.innerHTML = `
    @keyframes skeleton-shimmer-anim {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    .skeleton-shimmer {
      background: linear-gradient(90deg, #F7F7F7 25%, #ECECEC 50%, #F7F7F7 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer-anim 1.5s infinite linear;
    }
    .dark .skeleton-shimmer {
      background: linear-gradient(90deg, #2A2A2A 25%, #3B3B3B 50%, #2A2A2A 75%);
      background-size: 200% 100%;
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton-shimmer {
        animation: none !important;
        background: #F7F7F7 !important;
      }
      .dark .skeleton-shimmer {
        background: #2A2A2A !important;
      }
    }
  `;
  document.head.appendChild(style);
};

// Reusable Helper Component
const ShimmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    injectShimmerCSS();
  }, []);
  return <>{children}</>;
};

export const HeroSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <div className="relative w-full overflow-hidden px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 my-4" aria-hidden="true">
        <div className="skeleton-shimmer w-full h-[260px] md:h-[520px] rounded-[16px] md:rounded-[24px] relative flex flex-col justify-end p-6 md:p-12">
          <div className="space-y-4 max-w-lg mb-8 md:mb-12">
            <div className="h-8 md:h-12 w-3/4 bg-white/25 rounded-lg"></div>
            <div className="h-4 md:h-6 w-1/2 bg-white/20 rounded-lg"></div>
            <div className="h-10 md:h-12 w-full max-w-md bg-white/20 rounded-xl mt-4"></div>
            <div className="flex gap-3 mt-4">
              <div className="h-8 md:h-10 w-24 bg-white/20 rounded-lg"></div>
              <div className="h-8 md:h-10 w-24 bg-white/20 rounded-lg"></div>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="h-2 w-8 bg-white/40 rounded-full"></div>
            <div className="h-2 w-2 bg-white/20 rounded-full"></div>
            <div className="h-2 w-2 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </ShimmerProvider>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto" aria-hidden="true">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 justify-items-center">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "flex flex-col items-center gap-3 w-full text-center",
                idx >= 4 ? "hidden sm:flex" : "",
                idx >= 6 ? "sm:hidden lg:flex" : ""
              )}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full skeleton-shimmer"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
              <div className="h-3.5 w-10 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
            </div>
          ))}
        </div>
      </section>
    </ShimmerProvider>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <div
        className="bg-white dark:bg-[#1E1E1E] rounded-[18px] border border-slate-100 dark:border-neutral-800 p-3 sm:p-4 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between h-full"
        aria-hidden="true"
      >
        <div className="space-y-3">
          <div className="aspect-square w-full rounded-[14px] skeleton-shimmer relative overflow-hidden">
            <div className="absolute top-2.5 left-2.5 h-5 w-12 bg-gray-200 dark:bg-neutral-800 rounded-full skeleton-shimmer"></div>
            <div className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-800 skeleton-shimmer"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-[70%] bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
            <div className="h-4 w-[50%] bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3.5 w-16 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="h-5 w-12 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
            <div className="h-4 w-10 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
          </div>
          <div className="h-4.5 w-28 bg-gray-200 dark:bg-neutral-800 rounded-md skeleton-shimmer"></div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-neutral-800">
          <div className="h-9 flex-1 bg-gray-200 dark:bg-neutral-800 rounded-lg skeleton-shimmer"></div>
          <div className="h-9 flex-1 bg-gray-200 dark:bg-neutral-800 rounded-lg skeleton-shimmer"></div>
        </div>
      </div>
    </ShimmerProvider>
  );
};

export const OccasionSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto" aria-hidden="true">
        <div className="space-y-2 mb-8 text-center md:text-left">
          <div className="h-8 w-64 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto md:mx-0 skeleton-shimmer"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto md:mx-0 skeleton-shimmer"></div>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-3 border-b mb-8">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-10 w-24 sm:w-28 flex-shrink-0 bg-gray-255 dark:bg-neutral-800 rounded-t-xl skeleton-shimmer"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={idx >= 2 ? "hidden md:block" : ""}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    </ShimmerProvider>
  );
};

export const ProductCarouselSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-hidden="true">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-800 rounded-lg skeleton-shimmer"></div>
            <div className="h-4 w-72 bg-gray-200 dark:bg-neutral-800 rounded-lg skeleton-shimmer"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-800 skeleton-shimmer"></div>
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-800 skeleton-shimmer"></div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-neutral-800 rounded-lg ml-2 skeleton-shimmer"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={idx >= 2 ? "hidden md:block" : ""}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    </ShimmerProvider>
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <div className="px-4 sm:px-6 my-8 max-w-7xl mx-auto" aria-hidden="true">
        <div className="skeleton-shimmer w-full h-[180px] sm:h-[260px] md:h-[340px] rounded-[18px] sm:rounded-[24px]"></div>
      </div>
    </ShimmerProvider>
  );
};

export const TestimonialsSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-hidden="true">
        <div className="text-center mb-10 space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto skeleton-shimmer"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto skeleton-shimmer"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-[#1E1E1E] rounded-[18px] border border-slate-100 dark:border-neutral-850 p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full skeleton-shimmer"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
                <div className="h-3 w-[90%] bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
                <div className="h-3 w-[70%] bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ShimmerProvider>
  );
};

export const InstagramSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-hidden="true">
        <div className="text-center mb-8 space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto skeleton-shimmer"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto skeleton-shimmer"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "aspect-square w-full rounded-[14px] skeleton-shimmer",
                idx >= 2 ? "hidden sm:block" : "",
                idx >= 4 ? "sm:hidden lg:block" : ""
              )}
            ></div>
          ))}
        </div>
      </section>
    </ShimmerProvider>
  );
};

export const NewsletterSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <section className="py-12 px-4 sm:px-6 my-8 max-w-4xl mx-auto" aria-hidden="true">
        <div className="bg-slate-50 dark:bg-[#1E1E1E]/50 rounded-[20px] p-6 sm:p-10 text-center space-y-4">
          <div className="h-7 w-64 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto skeleton-shimmer"></div>
          <div className="h-4 w-80 bg-gray-200 dark:bg-neutral-800 rounded-lg mx-auto skeleton-shimmer"></div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-3">
            <div className="h-11 flex-1 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 skeleton-shimmer"></div>
            <div className="h-11 w-full sm:w-28 bg-gray-200 dark:bg-neutral-800 rounded-xl skeleton-shimmer"></div>
          </div>
        </div>
      </section>
    </ShimmerProvider>
  );
};

export const FooterSkeleton: React.FC = () => {
  return (
    <ShimmerProvider>
      <footer className="border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 py-12 sm:py-16 px-4 sm:px-6" aria-hidden="true">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="h-10 w-32 bg-gray-200 dark:bg-neutral-800 rounded-lg skeleton-shimmer"></div>
              <div className="space-y-2 max-w-xs">
                <div className="h-3 w-full bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
                <div className="h-3 w-[80%] bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-4">
                <div className="h-4.5 w-24 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((__, lIdx) => (
                    <div key={lIdx} className="h-3.5 w-20 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="h-4 w-48 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
            <div className="flex gap-4">
              <div className="h-4 w-12 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-neutral-800 rounded skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      </footer>
    </ShimmerProvider>
  );
};

export const HomePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen space-y-6 bg-slate-50/20 dark:bg-neutral-950/20" aria-busy="true">
      <HeroSkeleton />
      <CategorySkeleton />
      <ProductCarouselSkeleton />
      <OccasionSkeleton />
      <BannerSkeleton />
      <TestimonialsSkeleton />
      <InstagramSkeleton />
      <NewsletterSkeleton />
      <FooterSkeleton />
    </div>
  );
};
