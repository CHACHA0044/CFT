import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sentence, words } from '../constants';
import { getLetterVariants } from '../utils';

const AnimatedHeadline = React.memo(() => {
  const [activeBurstIndex, setActiveBurstIndex] = useState(null);
  const [bursting, setBursting] = useState(false);
  const [fallingLetters, setFallingLetters] = useState([]);
  const [hoveredWordIndex, setHoveredWordIndex] = useState(null);
  const isMobile = window.innerWidth < 640;

  const triggerBurst = (index) => {
    if (isMobile) return;

    setActiveBurstIndex(index);
    setBursting(true);
    setTimeout(() => {
      setBursting(false);
      setActiveBurstIndex(null);
    }, 1800);
  };

  if (isMobile) {
    return (
      <h1 className="text-4xl font-black font-germania text-white text-center tracking-wider text-shadow-DEFAULT">
        Your  Emission<br />Trends
      </h1>
    );
  }

  return (
    <div className="relative overflow-visible w-full flex justify-center items-center mt-2 sm:mb-4 mb-2 px-4">
      <motion.div
        className="flex sm:flex-nowrap flex-wrap justify-center gap-3 text-4xl sm:text-6xl md:text-8xl font-black font-germania tracking-widest text-shadow-DEFAULT text-white"
        initial={false}
        animate={false}
      >
        {words.map((word, wordIndex) => {
          const isHovered = hoveredWordIndex === wordIndex;
          const shouldDim = words.length > 1 && hoveredWordIndex !== null && hoveredWordIndex !== wordIndex;

          return (
            <motion.span
              key={wordIndex}
              onMouseEnter={() => setHoveredWordIndex(wordIndex)}
              onMouseLeave={() => setHoveredWordIndex(null)}
              onClick={() => {
                if (!bursting && activeBurstIndex === null) triggerBurst(wordIndex);
              }}
              animate={{
                scale: isHovered ? 1.15 : 1,
                y: isHovered ? -8 : 0,
                opacity: shouldDim ? 0.4 : 1,
              }}
              transition={{
                scale: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                },
                y: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                },
                opacity: {
                  duration: 0.35,
                  ease: [0.4, 0, 0.2, 1],
                }
              }}
              className="relative inline-block cursor-pointer whitespace-nowrap will-change-transform"
              style={{
                filter: isHovered
                  ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6))'
                  : 'none',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              {word.split("").map((char, i) => {
                const allChars = sentence.replace(/\s/g, "").split("");
                const charIndex = allChars.findIndex(
                  (_, idx) => idx === i + words.slice(0, wordIndex).join("").length
                );

                const isBursting = activeBurstIndex === wordIndex;
                const randomDelay = Math.random() * 0.5 + i * 0.05;

                return (
                  <AnimatePresence key={`${char}-${i}`}>
                    <motion.span
                      className="inline-block relative whitespace-nowrap will-change-transform"
                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                      animate={
                        isBursting
                          ? {
                              x: Math.random() * 80 - 40,
                              y: Math.random() * 60 - 30,
                              rotate: Math.random() * 180 - 90,
                              opacity: [1, 0],
                              scale: [1, 1.2, 0.4],
                              transition: {
                                duration: 0.8,
                                delay: randomDelay,
                                ease: [0.4, 0, 0.2, 1],
                              },
                            }
                          : isHovered
                          ? {
                              y: [0, -3, 0],
                              rotate: [0, i % 2 === 0 ? 5 : -5, 0],
                              transition: {
                                duration: 0.5,
                                delay: i * 0.025,
                                ease: [0.4, 0, 0.2, 1],
                              },
                            }
                          : fallingLetters.includes(charIndex)
                          ? "reenter"
                          : "initial"
                      }
                      variants={getLetterVariants()}
                    >
                      {char === "o" && wordIndex === 2 ? (
                        <span className="block">{char}</span>
                      ) : (
                        char
                      )}

                      {isBursting && (
                        <span className="absolute top-1/2 left-1/2 z-[-1]">
                          {[...Array(5)].map((_, j) => {
                            const confX = Math.random() * 30 - 15;
                            const confY = Math.random() * 30 - 15;

                            return (
                              <motion.span
                                key={j}
                                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                                initial={{ opacity: 1, scale: 1 }}
                                animate={{
                                  x: confX,
                                  y: confY,
                                  opacity: [1, 0],
                                  scale: [1, 0.4],
                                }}
                                transition={{
                                  duration: 0.6,
                                  delay: randomDelay,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                              />
                            );
                          })}
                        </span>
                      )}
                    </motion.span>
                  </AnimatePresence>
                );
              })}
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
});

export default AnimatedHeadline;
