// import React, { useRef, useEffect } from 'react';
// import Lottie from 'lottie-react';
// import HamburgerAnimation from 'animations/Hamburger menu.json';
// // ../animations/Hamburger menu.json
// const LottieLogo = ({ isOpen, onClick, className = "h-auto w-auto" }) => {
//   const lottieRef = useRef();

//   useEffect(() => {
//     if (lottieRef.current) {
//       if (isOpen) {
//         // Play forward to cross state (frames 0-45)
//         lottieRef.current.playSegments([0, 45], true);
//       } else {
//         // Play reverse to hamburger state (frames 45-97)
//         lottieRef.current.playSegments([45, 97], true);
//       }
//     }
//   }, [isOpen]);

//   return (
//     <div 
//       className={`${className} cursor-pointer`} 
//       onClick={onClick}
//       role="button"
//       aria-label={isOpen ? 'Close menu' : 'Open menu'}
//     >
//       <Lottie 
//         lottieRef={lottieRef}
//         animationData={HamburgerAnimation}
//         loop={false}
//         autoplay={false}
//         style={{ width: '100%', height: '100%' }}
//       />
//     </div>
//   );
// };

// export default LottieLogo;
import React, { useRef, useEffect, useMemo, useState } from 'react';
import Lottie from 'lottie-react';
import HamburgerAnimation from 'animations/Hamburger menu.json';

const LottieLogo = ({ isOpen, onClick, className = "", colorClass = "text-gray-800 dark:text-gray-100" }) => {
  const lottieRef = useRef();
  const [computedColor, setComputedColor] = useState("rgb(5 150 105)"); // Default emerald as fallback

  // Convert Tailwind color class to actual color
  useEffect(() => {
    const getComputedColor = () => {
      // Create a temporary element to compute the color
      const temp = document.createElement('div');
      temp.style.position = 'absolute';
      temp.style.opacity = '0';
      temp.className = colorClass;
      document.body.appendChild(temp);
      const color = getComputedStyle(temp).color;
      document.body.removeChild(temp);
      return color;
    };

    setComputedColor(getComputedColor());
  }, [colorClass]);

  const coloredAnimationData = useMemo(() => {
    // Deep copy to avoid mutating original animation
    const anim = JSON.parse(JSON.stringify(HamburgerAnimation));

    // Recursively update all layers' fill colors
    const updateColors = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          if (key === 'c' && obj[key]?.k) {
            // Extract RGB values from computed color
            const rgb = computedColor.match(/\d+/g)?.map(Number);
            if (rgb && rgb.length >= 3) {
              // Convert to Lottie's normalized RGB format [r, g, b, a] (0-1)
              obj[key].k = [rgb[0]/255, rgb[1]/255, rgb[2]/255, 1];
            }
          } else {
            updateColors(obj[key]);
          }
        }
      }
    };

    updateColors(anim);
    return anim;
  }, [computedColor]);

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
      className={`h-10 w-10 md:h-12 md:w-12 cursor-pointer ${className}`} 
      onClick={onClick}
      role="button"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <Lottie 
        lottieRef={lottieRef}
        animationData={coloredAnimationData}
        loop={false}
        autoplay={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieLogo;