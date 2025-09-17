import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import HamburgerAnimation from 'animations/Hamburger menu.json';
// ../animations/Hamburger menu.json
const LottieLogo = ({ isOpen, onClick, className = "h-[28px] w-auto" }) => {
  const lottieRef = useRef();

  useEffect(() => {
    if (lottieRef.current) {
      if (isOpen) {
        // Play forward to cross state (frames 0-45)
        lottieRef.current.playSegments([0, 45], true);
      } else {
        // Play reverse to hamburger state (frames 45-97)
        lottieRef.current.playSegments([45, 97], true);
      }
    }
  }, [isOpen]);

  return (
    <div 
      className={`${className} cursor-pointer`} 
      onClick={onClick}
      role="button"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <Lottie 
        lottieRef={lottieRef}
        animationData={HamburgerAnimation}
        loop={false}
        autoplay={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieLogo;