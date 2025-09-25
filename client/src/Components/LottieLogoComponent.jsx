import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import HamburgerAnimation from 'animations/Hamburger menu.json';

const animationDataWithColor = JSON.parse(JSON.stringify(HamburgerAnimation));
const newColor = [243 / 255, 244 / 255, 246 / 255, 1];
const updateColors = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'c' && obj[key]?.k) {
        obj[key].k = newColor; 
      } else {
        updateColors(obj[key]); 
      }
    }
  }
};
updateColors(animationDataWithColor); 

const LottieLogo = ({ isOpen, onClick, className = "" }) => {
  const lottieRef = useRef();

  useEffect(() => {
    if (lottieRef.current) {
      if (isOpen) {
        lottieRef.current.playSegments([0, 45], true);
      } else {
        lottieRef.current.playSegments([45, 97], true);
      }
    }
  }, [isOpen]);

  return (
    <div
      className={`relative z-50 h-16 w-16 md:h-20 md:w-20 cursor-pointer ${className}`}
      onClick={onClick}
      role="button"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationDataWithColor} 
        loop={false}
        autoplay={false}
        style={{ width: '100%', height: '100%' }}
        rendererSettings={{
          clearCanvas: true, 
        }}
      />
    </div>
  );
};

export default LottieLogo;