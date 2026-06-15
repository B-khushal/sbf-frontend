import React, { useState, useEffect } from 'react';

interface ValentineCountdownProps {
  targetDate: string | Date;
}

const ValentineCountdown: React.FC<ValentineCountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="text-center">
        <p className="text-2xl md:text-3xl font-bold valentine-gradient-text">
          💕 The celebration has begun!
        </p>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-5">
      {units.map((unit, index) => (
        <div key={unit.label} className="contents">
          <div className="valentine-countdown-digit valentine-glass-dark">
            <div className="digit font-['Playfair_Display']">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="label">{unit.label}</div>
          </div>
          {index < units.length - 1 && (
            <span className="text-2xl md:text-3xl font-light text-rose-300/50 self-start mt-3">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ValentineCountdown;
