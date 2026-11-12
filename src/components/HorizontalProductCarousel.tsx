import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const SECTION_CONTAINER_CLASS =
  "relative mx-auto w-full max-w-7xl 2xl:max-w-[1560px] 3xl:max-w-[1840px] 4xl:max-w-[2160px] px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16";

export const CAROUSEL_CARD_WIDTH_CLASS =
  "shrink-0 grow-0 snap-start flex w-[calc((100%-14px)/1.62)] xs:w-[calc((100%-14px)/1.85)] sm:w-[calc((100%-40px)/3.25)] md:w-[calc((100%-60px)/3.65)] lg:w-[calc((100%-80px)/4.35)] xl:w-[calc((100%-100px)/5.35)] 2xl:w-[calc((100%-120px)/6.25)] 3xl:w-[calc((100%-140px)/7.25)] 4xl:w-[calc((100%-160px)/8.25)]";

export function useHorizontalCarousel(deps: unknown[] = [], resetKey?: string | number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    didDrag: false,
  });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(maxScrollLeft > 4 && el.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (el && resetKey !== undefined) {
      el.scrollTo({ left: 0, behavior: "auto" });
    }
    const raf = requestAnimationFrame(() => updateScrollState());
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, updateScrollState, ...deps]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateScrollState())
        : null;
    ro?.observe(el);

    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateScrollState, ...deps]);

  const scrollBy = useCallback(
    (direction: -1 | 1) => {
      const el = trackRef.current;
      if (!el) return;
      const step = Math.max(el.clientWidth * 0.75, 260);
      el.scrollBy({
        left: direction * step,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion]
  );

  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => updateScrollState());
  }, [updateScrollState]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      didDrag: false,
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    const el = trackRef.current;
    if (!state.active || !el) return;

    const deltaX = e.clientX - state.startX;
    if (!state.didDrag && Math.abs(deltaX) > 6) {
      state.didDrag = true;
      setIsDragging(true);
    }
    if (state.didDrag) {
      e.preventDefault();
      el.scrollLeft = state.startScrollLeft - deltaX * 1.15;
    }
  }, []);

  const endDrag = useCallback(() => {
    dragStateRef.current.active = false;
    setIsDragging(false);
    requestAnimationFrame(() => {
      dragStateRef.current.didDrag = false;
    });
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStateRef.current.didDrag) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    trackRef,
    canScrollPrev,
    canScrollNext,
    isDragging,
    scrollBy,
    trackProps: {
      onScroll: handleScroll,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: endDrag,
      onMouseLeave: endDrag,
      onClickCapture: handleClickCapture,
    },
  };
}

interface HorizontalCarouselTrackProps {
  trackRef: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  trackProps: {
    onScroll: () => void;
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onClickCapture: (e: React.MouseEvent<HTMLDivElement>) => void;
  };
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  canScrollPrev?: boolean;
  canScrollNext?: boolean;
  onScrollPrev?: () => void;
  onScrollNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
}

export const HorizontalCarouselTrack: React.FC<HorizontalCarouselTrackProps> = ({
  trackRef,
  isDragging,
  trackProps,
  ariaLabel,
  children,
  className,
  canScrollPrev = false,
  canScrollNext = false,
  onScrollPrev,
  onScrollNext,
  prevLabel = "Scroll previous items",
  nextLabel = "Scroll next items",
}) => (
  <div role="region" aria-label={ariaLabel} className="relative group/carousel">
    {/* Side Left Arrow (Vertically centered beside the cards across all screens) */}
    {onScrollPrev && (
      <button
        type="button"
        onClick={onScrollPrev}
        disabled={!canScrollPrev}
        aria-label={prevLabel}
        aria-hidden={!canScrollPrev}
        tabIndex={canScrollPrev ? 0 : -1}
        className={cn(
          "absolute left-1 sm:-left-3 lg:-left-4 2xl:-left-5 top-[38%] -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 3xl:h-11 3xl:w-11 items-center justify-center rounded-full border border-[#E3D8CD] bg-white/95 text-[#2A2420] shadow-[0_6px_18px_rgba(30,27,24,0.14)] backdrop-blur-md transition-all duration-200 hover:border-[#D68BA4] hover:bg-white hover:text-[#BE185D] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D]",
          canScrollPrev
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      </button>
    )}

    <div
      ref={trackRef}
      {...trackProps}
      className={cn(
        "flex flex-nowrap items-stretch gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar py-1 touch-pan-x overscroll-x-contain",
        isDragging
          ? "cursor-grabbing select-none snap-none scroll-auto"
          : "cursor-grab snap-x snap-mandatory scroll-smooth",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>

    {/* Side Right Arrow (Vertically centered beside the cards across all screens) */}
    {onScrollNext && (
      <button
        type="button"
        onClick={onScrollNext}
        disabled={!canScrollNext}
        aria-label={nextLabel}
        aria-hidden={!canScrollNext}
        tabIndex={canScrollNext ? 0 : -1}
        className={cn(
          "absolute right-1 sm:-right-3 lg:-right-4 2xl:-right-5 top-[38%] -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 3xl:h-11 3xl:w-11 items-center justify-center rounded-full border border-[#E3D8CD] bg-white/95 text-[#2A2420] shadow-[0_6px_18px_rgba(30,27,24,0.14)] backdrop-blur-md transition-all duration-200 hover:border-[#D68BA4] hover:bg-white hover:text-[#BE185D] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D]",
          canScrollNext
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
      </button>
    )}
  </div>
);
