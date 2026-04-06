import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { boxglowD } from 'utils/styles';

const ReviewLoopCarousel = ({ isVisible = true, onAutoLoop = true }) => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch reviews from public/reviews.json
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/reviews.json');
        const data = await response.json();
        setReviews(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load reviews:', error);
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-rotate reviews every 3.5 seconds (paused on hover)
  useEffect(() => {
    if (!onAutoLoop || reviews.length === 0 || !isVisible || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3500); // 3.5 seconds

    return () => clearInterval(interval);
  }, [reviews.length, onAutoLoop, isVisible, isHovered]);

  if (isLoading || reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentIndex];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const reviewCardVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const emojiVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        delay: 0.1,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="review-carousel"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-3xl mx-auto mb-8"
        >
          <div className={`${boxglowD} relative p-8 sm:p-10 md:p-12 rounded-3xl  h-[320px] sm:h-[360px]`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-30">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-blue-500/20 animate-pulse"></div>
            </div>

            {/* Content container */}
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={reviewCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center space-y-4"
                >
                  {/* Emoji */}
                  <motion.div
                    variants={emojiVariants}
                    className="text-5xl sm:text-6xl flex justify-center"
                  >
                    {currentReview.emoji}
                  </motion.div>

                  {/* Review text */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.15,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="text-lg sm:text-xl text-gray-100 font-intertight leading-relaxed text-shadow-DEFAULT italic"
                  >
                    "{currentReview.review}"
                  </motion.p>

                  {/* Author name */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.25,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                    <span className="text-emerald-400 dark:text-sky-300 font-semibold font-germania text-lg tracking-wide">
                      {currentReview.firstName}
                    </span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
                
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center mt-8 sm:mt-10"
              >
                {/* Progress indicators - larger dots */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {reviews.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.6, opacity: 0.4 }}
                      animate={{
                        scale: index === currentIndex ? 1.2 : index === (currentIndex - 1 + reviews.length) % reviews.length || index === (currentIndex + 1) % reviews.length ? 0.9 : 0.7,
                        opacity: index === currentIndex ? 1 : index === (currentIndex - 1 + reviews.length) % reviews.length || index === (currentIndex + 1) % reviews.length ? 0.7 : 0.4,
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="rounded-full cursor-pointer"
                      onClick={() => setCurrentIndex(index)}
                      style={{
                        width: index === currentIndex ? '40px' : '12px',
                        height: '12px',
                        background:
                          index === currentIndex
                            ? 'linear-gradient(90deg, #10b981 0%, #0ea5e9 100%)'
                            : 'rgba(255, 255, 255, 0.2)',
                        boxShadow:
                          index === currentIndex
                            ? '0 0 16px rgba(16, 185, 129, 0.8)'
                            : 'none',
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Review counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center mt-6 text-sm text-gray-400"
              >
                <span className="font-intertight">
                  <span className="text-emerald-400 font-semibold">
                    {currentIndex + 1}
                  </span>{' '}
                  / {reviews.length} reviews
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewLoopCarousel;
