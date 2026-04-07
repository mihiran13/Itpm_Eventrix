import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="countdown-timer ended">
        <span className="countdown-label">Event has started!</span>
      </div>
    );
  }

  return (
    <div className="countdown-timer">
      <span className="countdown-label">Event starts in</span>
      <div className="countdown-blocks">
        <div className="countdown-block">
          <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="countdown-unit">Days</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-block">
          <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="countdown-unit">Hours</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-block">
          <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="countdown-unit">Min</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-block">
          <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="countdown-unit">Sec</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
