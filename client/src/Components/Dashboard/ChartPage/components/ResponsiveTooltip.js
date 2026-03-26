import React, { useState, useEffect } from 'react';
import { Tooltip } from 'recharts';

const ResponsiveTooltip = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 760);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Tooltip
      {...props}
      position={isMobile ? { y: 0, x: 5 } : undefined}
      wrapperStyle={{
        maxWidth: isMobile ? "90vw" : "auto",
        whiteSpace: "normal",
      }}
    />
  );
};

export default ResponsiveTooltip;
