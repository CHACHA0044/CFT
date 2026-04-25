import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WeatherCountdown = React.memo(({ weatherTimestamp, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [minutesAgo, setMinutesAgo] = useState(0);

  useEffect(() => {
    if (!weatherTimestamp) return;

    const updateTimer = () => {
      const thirtyMinutes = 30 * 60 * 1000;
      const elapsed = Date.now() - weatherTimestamp;
      const remaining = Math.max(0, thirtyMinutes - elapsed);

      setTimeLeft(Math.floor(remaining / 1000));
      setMinutesAgo(Math.floor(elapsed / 60000));

      if (remaining <= 0) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [weatherTimestamp, onExpire]);

  if (timeLeft <= 0) return " ";

  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  return (
    <>
      <div className="text-xs text-gray-400 mb-1">
        🕐 Updated {minutesAgo} minute{minutesAgo !== 1 ? 's' : ''} ago
      </div>
      <div>
        {`Weather data expires in ${minutesLeft}m ${secondsLeft}s `}
        <motion.span
          animate={{ rotateX: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="inline-block"
        >
          ⌛
        </motion.span>
      </div>
    </>
  );
});

export default WeatherCountdown;
