// import React, { useRef, useEffect, useMemo, useState } from 'react';
// import Lottie from 'lottie-react';
// import HamburgerAnimation from 'animations/Hamburger menu.json';

// const LottieLogo = ({ isOpen, onClick, className = "", colorClass = "text-gray-800 dark:text-gray-100" }) => {
//   const lottieRef = useRef();
//   // FIX: Start with null to prevent rendering until the color is ready.
//   const [computedColor, setComputedColor] = useState(null);

//   // This effect computes the actual color from the Tailwind CSS class.
//   useEffect(() => {
//     const tempElement = document.createElement('div');
//     tempElement.className = colorClass;
//     tempElement.style.display = 'none'; // Keep it hidden
//     document.body.appendChild(tempElement);
//     const color = getComputedStyle(tempElement).color;
//     document.body.removeChild(tempElement);
//     setComputedColor(color);
//   }, [colorClass]);

//   // This memoized function creates a new animation data object with the updated color.
//   const coloredAnimationData = useMemo(() => {
//     // If the color isn't computed yet, return null.
//     if (!computedColor) return null;

//     const anim = JSON.parse(JSON.stringify(HamburgerAnimation));
//     const updateColors = (obj) => {
//       if (obj && typeof obj === 'object') {
//         for (const key in obj) {
//           if (key === 'c' && obj[key]?.k) {
//             const rgb = computedColor.match(/\d+/g)?.map(Number);
//             if (rgb && rgb.length >= 3) {
//               obj[key].k = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1];
//             }
//           } else {
//             updateColors(obj[key]);
//           }
//         }
//       }
//     };
//     updateColors(anim);
//     return anim;
//   }, [computedColor]);

//   // This effect controls the animation playback.
//   useEffect(() => {
//     if (lottieRef.current) {
//       if (isOpen) {
//         lottieRef.current.playSegments([0, 45], true);
//       } else {
//         lottieRef.current.playSegments([45, 97], true);
//       }
//     }
//   }, [isOpen]);
  
//   // FIX: Don't render the Lottie player until the colored data is ready.
//   // This prevents the flash of the default black icon.
//   if (!coloredAnimationData) {
//     // Render a placeholder div to prevent layout shift while color is loading.
//     return <div className={`h-16 w-16 md:h-20 md:w-20 ${className}`} />;
//   }

//   return (
//     <div
//       // FIX 1 & 2: Increased size and added z-index to make it appear on top.
//       className={`relative z-50 h-16 w-16 md:h-20 md:w-20 cursor-pointer ${className}`}
//       onClick={onClick}
//       role="button"
//       aria-label={isOpen ? 'Close menu' : 'Open menu'}
//     >
//       <Lottie
//         lottieRef={lottieRef}
//         animationData={coloredAnimationData} // Use the new colored data
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
  const [computedColor, setComputedColor] = useState(null);

  // This effect computes the actual color from the Tailwind CSS class.
  useEffect(() => {
    const tempElement = document.createElement('div');
    tempElement.className = colorClass;
    tempElement.style.display = 'none';
    document.body.appendChild(tempElement);
    const color = getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);
    setComputedColor(color);
  }, [colorClass]);

  // This memoized function creates a new animation data object with the updated color.
  const coloredAnimationData = useMemo(() => {
    if (!computedColor) return null;

    const anim = JSON.parse(JSON.stringify(HamburgerAnimation));
    const updateColors = (obj) => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (key === 'c' && obj[key]?.k) {
            const rgb = computedColor.match(/\d+/g)?.map(Number);
            if (rgb && rgb.length >= 3) {
              obj[key].k = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1];
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

  // This effect controls the animation playback.
  useEffect(() => {
    if (lottieRef.current) {
      if (isOpen) {
        lottieRef.current.playSegments([0, 45], true);
      } else {
        lottieRef.current.playSegments([45, 97], true);
      }
    }
  }, [isOpen]);

  if (!coloredAnimationData) {
    return <div className={`h-16 w-16 md:h-20 md:w-20 ${className}`} />;
  }

  return (
    <div
      className={`relative z-50 h-16 w-16 md:h-20 md:w-20 cursor-pointer ${className}`}
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
        // FIX: Add this prop to prevent the "ghost" icon from appearing behind.
        rendererSettings={{
          clearCanvas: true,
        }}
      />
    </div>
  );
};

export default LottieLogo;