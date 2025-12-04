import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeBackGreeting = ({ userName = "User" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user just logged in (first time users won't see this)
    const isFirstTime = sessionStorage.getItem('isFirstTimeUser');
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeBack');
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    // Show only if:
    // 1. NOT a first-time user
    // 2. Haven't seen welcome back message yet in this session
    // 3. User just logged in
    if (!isFirstTime && !hasSeenWelcome && justLoggedIn) {
      setShouldShow(true);
      setIsVisible(true);
      
      // Mark as seen for this session
      sessionStorage.setItem('hasSeenWelcomeBack', 'true');
      sessionStorage.removeItem('justLoggedIn');
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        emoji: "🌅",
        greeting: "Good Morning",
        message: "Rise and shine! Ready to make today count for our planet?",
        color: "from-orange-400 via-yellow-400 to-amber-300",
        shadow: "shadow-orange-500/50",
        particles: "☀️"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        emoji: "☀️",
        greeting: "Good Afternoon",
        message: "Hope your day is going well! Let's keep those green habits strong.",
        color: "from-sky-400 via-blue-400 to-cyan-400",
        shadow: "shadow-blue-500/50",
        particles: "🌤️"
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        emoji: "🌆",
        greeting: "Good Evening",
        message: "Welcome back! Time to check in on your carbon journey today.",
        color: "from-purple-400 via-pink-400 to-rose-400",
        shadow: "shadow-purple-500/50",
        particles: "✨"
      };
    } else {
      return {
        emoji: "🌙",
        greeting: "Good Night",
        message: "Burning the midnight oil? Every small effort adds up, even at night!",
        color: "from-indigo-500 via-purple-500 to-blue-600",
        shadow: "shadow-indigo-500/50",
        particles: "⭐"
      };
    }
  };

  const { emoji, greeting, message, color, shadow, particles } = getTimeBasedGreeting();

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-3xl w-full max-w-5xl mx-auto py-4 px-4 mb-6 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 text-shadow-DEFAULT right-7 z-20 text-emerald-600 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-white transition-colors duration-200"
            aria-label="Close welcome message"
          >
            <motion.span
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="text-2xl font-bold"
            >
              ×
            </motion.span>
          </button>

          {/* Animated background glow */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 blur-2xl`}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Main content container */}
          <motion.div
            className="relative flex items-center justify-center gap-3 p-4 rounded-3xl bg-white/20 dark:bg-gray-800/70 backdrop-blur-md border border-white/20"
          >
            {/* Animated emoji */}
            <motion.div
              className="relative flex-shrink-0"
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.15, 1, 1.1, 1],
                y: [0, -5, 0, -3, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }}
            >
              <motion.span
                className={`absolute inset-0 blur-lg ${shadow}`}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-3xl sm:text-4xl inline-block">{emoji}</span>
              </motion.span>
              <span className="relative text-3xl sm:text-4xl inline-block drop-shadow-lg">
                {emoji}
              </span>
            </motion.div>

            {/* Message with character animations */}
            <motion.div className="relative flex-1 min-w-0">
              {/* Message with character animations */}
            <motion.div className="relative flex-1 min-w-0">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-lg sm:text-2xl font-bold font-intertight tracking-wide text-shadow-DEFAULT text-emerald-600 dark:text-emerald-300 mb-1"
            >
                {greeting}, {userName?.split(" ")[0]}!
            </motion.div>
            </motion.div>
              
              <span className="inline-flex font-intertight tracking-wide flex-wrap text-sm sm:text-base font-semibold text-emerald-500 dark:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {message.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3 + (i * 0.01),
                      duration: 0.3,
                    }}
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </span>
            </motion.div>

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xs opacity-0"
                style={{
                  left: `${15 + i * 18}%`,
                  top: '50%',
                }}
                animate={{
                  y: [-20, -50, -20],
                  x: [0, Math.sin(i) * 15, 0],
                  opacity: [0, 0.7, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
              >
                {particles}
              </motion.div>
            ))}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBackGreeting;