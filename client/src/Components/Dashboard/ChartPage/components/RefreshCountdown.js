import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RefreshCountdown = React.memo(({ weatherTimestamp, onRefreshAvailable }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!weatherTimestamp) return;

    const updateTimer = () => {
      const tenMinutes = 10 * 60 * 1000;
      const elapsed = Date.now() - weatherTimestamp;
      const remaining = Math.max(0, tenMinutes - elapsed);

      setTimeLeft(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        onRefreshAvailable();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [weatherTimestamp, onRefreshAvailable]);

  if (timeLeft <= 0) return null;

  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;

  return (
    <div className="text-center text-xs text-gray-400 mb-2">
      {`Refresh available in ${minutesLeft}m ${secondsLeft}s `}
      <motion.span
        animate={{ rotateY: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="inline-block"
      >
        🔄
      </motion.span>
    </div>
  );
});

export default RefreshCountdown;
