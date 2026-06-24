import React, { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import api from "../services/api";
import { cn } from "@/lib/utils";

interface VideoData {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  ctaText?: string;
  ctaLink?: string;
  isFeatured?: boolean;
}

// Single Video Card Component
const VideoCard = ({ video, index }: { video: VideoData; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Autoplay video only when in view
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.6, // Trigger play when 60% of card is visible
  });

  // Combine refs
  const setRefs = (node: HTMLDivElement) => {
    inViewRef(node);
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (inView) {
      // Play when in view
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasStarted(true);
          })
          .catch((error) => {
            console.log("Autoplay was prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      // Pause when out of view
      videoEl.pause();
      setIsPlaying(false);
    }
  }, [inView]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isPlaying) {
      videoEl.pause();
      setIsPlaying(false);
    } else {
      videoEl.play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        })
        .catch((err) => console.log(err));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = !videoEl.muted;
    setIsMuted(videoEl.muted);
  };

  return (
    <div
      ref={setRefs}
      className={cn(
        "relative flex-none w-[280px] sm:w-[320px] aspect-[9/16] rounded-2xl overflow-hidden group shadow-lg snap-start border border-white/10 bg-slate-950 transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl",
        video.isFeatured && "ring-2 ring-pink-400 ring-offset-2 ring-offset-slate-950"
      )}
    >
      {/* Thumbnail / Poster Image before playback starts */}
      {(!hasStarted || isLoading) && (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 filter brightness-95"
          loading="lazy"
        />
      )}

      {/* Actual HTML5 Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload={index === 0 ? "auto" : "metadata"}
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={() => setIsLoading(false)}
        onClick={togglePlay}
      />

      {/* Premium Glassmorphic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none z-20" />

      {/* Play/Pause Control State HUD in Center (appearing on hover) */}
      <div
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer"
      >
        <button className="p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg hover:bg-white/40">
          {isPlaying ? <Pause className="h-8 w-8 fill-white" /> : <Play className="h-8 w-8 fill-white ml-0.5" />}
        </button>
      </div>

      {/* Featured Badge */}
      {video.isFeatured && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-white/20">
          <Sparkles className="h-3 w-3 animate-pulse" />
          Featured
        </div>
      )}

      {/* Floating Mute/Unmute toggle (bottom-right) */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800 transition-colors shadow-md"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
      </button>

      {/* Bottom Content Area (Glassmorphism Overlay) */}
      <div className="absolute bottom-0 inset-x-0 p-5 z-25 flex flex-col gap-3">
        <div className="space-y-1">
          <h3 className="text-white font-bold text-base sm:text-lg leading-snug drop-shadow-md">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-slate-200/90 text-xs sm:text-sm line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
              {video.description}
            </p>
          )}
        </div>

        {/* Optional Call to Action Button */}
        {video.ctaText && video.ctaLink && (
          <a
            href={video.ctaLink}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white text-center text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 shadow-md shadow-rose-950/20 active:scale-[0.98] border border-white/10 hover:shadow-lg hover:shadow-pink-500/20"
          >
            {video.ctaText}
          </a>
        )}
      </div>
    </div>
  );
};

// Main Showcase Component
export const VideoShowcase = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActiveVideos = async () => {
      try {
        setLoading(true);
        const res = await api.get("/homepage-videos/active");
        setVideos(res.data || []);
      } catch (err) {
        console.error("Failed to load active vertical videos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveVideos();
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 340; // Card width + gap
    const targetScroll = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  // If loading, display loading skeletons
  if (loading) {
    return (
      <div className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-800 rounded-md animate-pulse" />
              <div className="h-8 w-64 bg-slate-800 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex gap-6 overflow-x-hidden">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex-none w-[280px] sm:w-[320px] aspect-[9/16] rounded-2xl bg-slate-800/40 border border-slate-800/80 animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  <div className="h-6 w-3/4 bg-slate-800 rounded-md" />
                  <div className="h-4 w-full bg-slate-800 rounded-md" />
                  <div className="h-10 w-full bg-slate-800 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If there are no active videos, do not render this section on the homepage
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden relative">
      {/* Decorative floral backgrounds */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-pink-400" />
              Visual Stories
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
              Premium Floral Showcase
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed">
              Explore bouquet creation secrets, premium gifting experiences, and live client delivery smiles through our social-reels gallery.
            </p>
          </div>

          {/* Navigation Arrows for Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="p-3 rounded-full bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-sm cursor-pointer"
              title="Previous videos"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 rounded-full bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-sm cursor-pointer"
              title="Next videos"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Reels Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video, idx) => (
            <VideoCard key={video._id} video={video} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoShowcase;
