import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import HamburgerAnimation from 'animations/Hamburger menu.json';

// --- Color logic is now done only once, outside the component ---

// Deep copy the original animation data to avoid modifying the imported file.
const animationDataWithColor = JSON.parse(JSON.stringify(HamburgerAnimation));
// The RGB values for Tailwind's `text-gray-100` are 243, 244, 246.
// Lottie format requires these to be divided by 255.
const newColor = [243 / 255, 244 / 255, 246 / 255, 1];

// This function finds and replaces the color in the Lottie JSON data.
const updateColors = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'c' && obj[key]?.k) {
        obj[key].k = newColor; // Set the hardcoded color
      } else {
        updateColors(obj[key]); // Continue searching through the object
      }
    }
  }
};
updateColors(animationDataWithColor); // Apply the color change

// --- The simplified component begins here ---

const LottieLogo = ({ isOpen, onClick, className = "" }) => {
  const lottieRef = useRef();

  // This effect controls the animation playback based on the `isOpen` prop.
  useEffect(() => {
    if (lottieRef.current) {
      if (isOpen) {
        // Play forward to the 'cross' state
        lottieRef.current.playSegments([0, 45], true);
      } else {
        // Play backward to the 'hamburger' state
        lottieRef.current.playSegments([45, 97], true);
      }
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed z-50 h-16 w-16 md:h-20 md:w-20 cursor-pointer ${className}`}
      onClick={onClick}
      role="button"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationDataWithColor} // Use the pre-colored animation data
        loop={false}
        autoplay={false}
        style={{ width: '100%', height: '100%' }}
        rendererSettings={{
          clearCanvas: true, // Prevents "ghosting" of the previous icon
        }}
      />
    </div>
  );
};

export default LottieLogo;