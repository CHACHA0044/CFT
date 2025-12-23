import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GetStartedButton, AboutButton } from 'Components/globalbuttons';
const FirstTimeWelcome = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user is first-time (flag set during registration/login)
    const isFirstTime = sessionStorage.getItem('isFirstTimeUser');
    
    if (isFirstTime === 'true') {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    // Mark as seen so it never shows again
    sessionStorage.removeItem('isFirstTimeUser');
    localStorage.setItem('welcomeMessageSeen', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full rounded-3xl max-w-5xl mx-auto mb-6 relative"
        >
          <div className="dark:bg-gray-800/70 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-emerald-300/30 dark:border-emerald-500/30">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-6 text-emerald-600 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-white transition-colors duration-200"
              aria-label="Close welcome message"
            >
              <motion.span
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-2xl sm:text-5xl text-shadow-DEFAULT font-bold"
              >
                ×
              </motion.span>
            </button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <motion.span
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-4xl"
              >
                🎉
              </motion.span>
              <h2 className="text-2xl sm:text-3xl font-bold font-germania text-emerald-600 dark:text-emerald-300 tracking-wide text-shadow-DEFAULT">
                Welcome to Your Climate Journey!
              </h2>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 text-sm sm:text-base text-emerald-700 dark:text-gray-100 font-intertight"
            >
              <p className="leading-relaxed tracking-wide text-shadow-DEFAULT">
                <strong className="text-emerald-800 dark:text-emerald-300">Carbon Footprint Tracker (CFT)</strong> helps you understand and reduce your environmental impact. Here's how to get started:
              </p>

              {/* Steps */}
              <div className="space-y-3 pl-2  tracking-wide text-shadow-DEFAULT">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-xl mt-0.5">🔎</span>
                  <div>
                    <strong>What is CFT:</strong> CFT lets you track your carbon emissions based on your daily lifestly.
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-xl mt-0.5">📝</span>
                  <div>
                    <strong>Enter Your Data:</strong> Click "New Entry" to log your monthly food, transport, electricity, and waste habits.
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-xl mt-0.5">📊</span>
                  <div>
                    <strong>View Insights:</strong> See your carbon footprint breakdown and get personalized reduction tips.
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-xl mt-0.5">🎯</span>
                  <div>
                    <strong>Track Progress:</strong> Compare your impact over time and see how you rank on the community leaderboard.
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-xl mt-0.5">📈</span>
                  <div>
                    <strong>Visualize Data:</strong> Use interactive charts to explore your emissions across different categories.
                  </div>
                </motion.div>
              </div>

              {/* Footer note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
                className="pt-3 text-xs sm:text-sm italic text-emerald-600 dark:text-white border-t border-emerald-300/30 dark:border-emerald-500/30"
              >
                💡 <strong>Tip:</strong> You can store up to 5 entries. Delete older ones to add new data. Every action counts in fighting climate change! 🌱
              </motion.p>
            </motion.div>

            {/* Action button */}
             {/* Action buttons */}
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              className="mt-6 flex flex-row items-center justify-center gap-4"
            >
              <GetStartedButton onDismiss={handleDismiss} compact={true} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstTimeWelcome;
