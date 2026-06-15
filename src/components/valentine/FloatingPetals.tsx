import React, { useMemo } from 'react';

interface FloatingPetalsProps {
  count?: number;
  enabled?: boolean;
}

const FloatingPetals: React.FC<FloatingPetalsProps> = ({ count = 15, enabled = true }) => {
  const petals = useMemo(() => {
    if (!enabled) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      type: Math.random() > 0.5 ? 'rose' : 'heart',
      duration: `${7 + Math.random() * 8}s`,
      delay: `${Math.random() * 12}s`,
      size: 0.6 + Math.random() * 0.8,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, [count, enabled]);

  if (!enabled || petals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className={`valentine-petal valentine-petal--${petal.type}`}
          style={{
            left: petal.left,
            '--petal-duration': petal.duration,
            '--petal-delay': petal.delay,
            transform: `scale(${petal.size})`,
            opacity: petal.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default FloatingPetals;
