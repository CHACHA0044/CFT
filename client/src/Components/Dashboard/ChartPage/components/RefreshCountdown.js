import React, { useEffect } from 'react';

const RefreshCountdown = React.memo(({ weatherTimestamp, onRefreshAvailable }) => {
  useEffect(() => {
    if (!weatherTimestamp) return;

    // Calculate elapsed time since data loaded
    const elapsed = (Date.now() - weatherTimestamp) / 1000;
    const tenMinutes = 600;

    if (elapsed >= tenMinutes) {
      // Already past 10 minutes, call immediately
      onRefreshAvailable();
      return;
    }

    // Schedule callback for when 10 minutes is reached
    const timeoutMs = (tenMinutes - elapsed) * 1000;
    const timeoutId = setTimeout(onRefreshAvailable, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [weatherTimestamp, onRefreshAvailable]);

  // This component is purely logic, renders nothing
  return null;
});

RefreshCountdown.displayName = 'RefreshCountdown';
export default RefreshCountdown;
