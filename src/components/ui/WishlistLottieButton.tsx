import React, { useRef, useEffect, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

interface WishlistLottieButtonProps {
  isInWishlist: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

// Cache the animation data so we only fetch once
let cachedAnimationData: object | null = null;

const WishlistLottieButton: React.FC<WishlistLottieButtonProps> = ({
  isInWishlist,
  onClick,
  size = 24,
  className = '',
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const prevInWishlist = useRef(isInWishlist);
  const [animationData, setAnimationData] = useState<object | null>(cachedAnimationData);

  // Load animation JSON from public folder
  useEffect(() => {
    if (cachedAnimationData) {
      setAnimationData(cachedAnimationData);
      return;
    }
    fetch('/animations/like.json')
      .then(res => res.json())
      .then(data => {
        cachedAnimationData = data;
        setAnimationData(data);
      })
      .catch(err => console.error('Failed to load like animation:', err));
  }, []);

  useEffect(() => {
    if (!lottieRef.current || !animationData) return;

    if (isInWishlist && !prevInWishlist.current) {
      // Just added to wishlist — play the full animation
      lottieRef.current.goToAndPlay(0, true);
    } else if (isInWishlist) {
      // Already in wishlist on mount — show last frame
      const totalFrames = lottieRef.current.getDuration(true) || 1;
      lottieRef.current.goToAndStop(totalFrames - 1, true);
    } else {
      // Not in wishlist — show first frame (empty heart)
      lottieRef.current.goToAndStop(0, true);
    }

    prevInWishlist.current = isInWishlist;
  }, [isInWishlist, animationData]);

  if (!animationData) return null;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{ width: size, height: size, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default WishlistLottieButton;
