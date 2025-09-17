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
import React, { useRef, useEffect, useMemo } from 'react';
import Lottie from 'lottie-react';
import HamburgerAnimation from 'animations/Hamburger menu.json';

const LottieLogo = ({ isOpen, onClick, className = "h-auto w-auto", colorClass = "text-emerald-600 dark:text-gray-100" }) => {
  const lottieRef = useRef();

  // Convert Tailwind color class to actual color
  const getComputedColor = () => {
    const temp = document.createElement('div');
    temp.className = colorClass;
    document.body.appendChild(temp);
    const color = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    return color;
  };

  const coloredAnimationData = useMemo(() => {
    // Deep copy to avoid mutating original animation
    const anim = JSON.parse(JSON.stringify(HamburgerAnimation));

    const fillColor = getComputedColor();

    // Recursively update all layers' fill colors
    const updateColors = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          if (key === 'c' && obj[key]?.k) {
            // Lottie stores color in normalized RGB array [r, g, b, a] (0-1)
            const rgb = fillColor.match(/\d+/g)?.map(Number);
            if (rgb) obj[key].k = [rgb[0]/255, rgb[1]/255, rgb[2]/255, 1];
          } else {
            updateColors(obj[key]);
          }
        }
      }
    };

    updateColors(anim);
    return anim;
  }, [colorClass]);

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
      className={`${className} cursor-pointer`} 
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
