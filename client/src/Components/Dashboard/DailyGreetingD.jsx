import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const DailyGreetingD = () => {
  const [isHovered, setIsHovered] = useState(false);
  const glowControls = useAnimation();

const dailyMessages = {
  0: { 
    emoji: "🌞",
    message: "Sunday Reset : Take a deep breath , look back at your week’s eco-journey , and plant the seeds of greener goals for the days ahead.",
    color: "from-yellow-400 via-orange-400 to-red-400",
    shadow: "shadow-yellow-500/50",
    particles: "🌟"
  },
  1: { 
    emoji: "💪",
    message: "Mindful Monday : Begin your week with purpose   —   each eco-choice you make today becomes a ripple that nurtures our planet’s tomorrow.",
    color: "from-blue-400 via-indigo-400 to-purple-400",
    shadow: "shadow-blue-500/50",
    particles: "⚡"
  },
  2: { 
    emoji: "🌱",
    message: "Green Tuesday : Let your actions grow like leaves in sunlight   —   every sustainable habit adds life to the forests, oceans, and skies we share.",
    color: "from-green-400 via-emerald-400 to-teal-400",
    shadow: "shadow-green-500/50",
    particles: "🍃"
  },
  3: { 
    emoji: "🌍",
    message: "Midweek Momentum : The Earth turns , and so do your efforts  —  each mindful step you take keeps our shared home thriving and full of wonder.",
    color: "from-cyan-400 via-blue-400 to-indigo-400",
    shadow: "shadow-cyan-500/50",
    particles: "💧"
  },
  4: { 
    emoji: "♻️",
    message: "Thoughtful Thursday : Let today be a quiet reminder that recycling, reusing, and rethinking are the roots of a truly regenerative world.",
    color: "from-teal-400 via-green-400 to-lime-400",
    shadow: "shadow-teal-500/50",
    particles: "✨"
  },
  5: { 
    emoji: "🎉",
    message: "Freedom Friday : Step outside, chase sunsets, and celebrate your week of conscious choices that honored the Earth’s wild beauty and balance.",
    color: "from-pink-400 via-rose-400 to-red-400",
    shadow: "shadow-pink-500/50",
    particles: "🎊"
  },
  6: { 
    emoji: "🚴",
    message: "Active Saturday : Ride, walk, and wander  freely — let your adventures paint trails of joy without leaving behind a single carbon footprint.",
    color: "from-indigo-400 via-purple-400 to-pink-400",
    shadow: "shadow-purple-500/50",
    particles: "🌈"
  }
};


  const testDay = null; // Set to null to use real day, or 0-6 to test specific day
  const today = testDay !== null ? testDay : new Date().getDay();
  const { emoji, message, color, shadow, particles } = dailyMessages[today];

  useEffect(() => {
    glowControls.start({
      opacity: [0.2, 0.4, 0.2],
      scale: [1, 1.3, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [glowControls]);

  return (
    <div className="relative rounded-3xl w-full max-w-5xl mx-auto py-6 px-4 overflow-hidden mt-4 mb-8">
      {/* Animated wave background */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Multiple layered glow effects */}
      <motion.div
        className={`absolute  inset-0 bg-gradient-to-r ${color} opacity-0 blur-2xl`}
        animate={glowControls}
      />
      <motion.div
        className={`absolute inset-0 bg-gradient-to-l ${color} opacity-0 blur-xl`}
        animate={{
          opacity: [0, 0.2, 0],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Main content container */}
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 12,
          delay: 0.3
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative flex items-center justify-center gap-3 p-4 rounded-3xl cursor-default bg-gray-900/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20"
        style={{ perspective: 1000 }}
      >
        {/* Animated emoji container with 3D effect */}
        <motion.div
          className="relative flex-shrink-0"
          animate={{
            rotate: isHovered ? [0, 360] : [0, 15, -15, 15, 0],
            scale: isHovered ? 1.3 : [1, 1.25, 1, 1.2, 1],
            y: isHovered ? -10 : [0, -8, 0, -5, 0],
            rotateY: isHovered ? 360 : 0,
          }}
          transition={{
            rotate: { duration: isHovered ? 0.6 : 3, repeat: isHovered ? 0 : Infinity, repeatDelay: 2 },
            scale: { duration: 2.5, repeat: isHovered ? 0 : Infinity, repeatDelay: 2, ease: "easeInOut" },
            y: { duration: 2.5, repeat: isHovered ? 0 : Infinity, repeatDelay: 2, ease: "easeInOut" },
            rotateY: { duration: 0.6 }
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Multiple emoji glow layers */}
          <motion.span
            className={`absolute inset-0 blur-lg ${shadow}`}
            animate={{
              opacity: isHovered ? [0.6, 1, 0.6] : [0.3, 0.7, 0.3],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-3xl sm:text-4xl inline-block">{emoji}</span>
          </motion.span>
          <motion.span
            className="absolute inset-0 blur-md"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          >
            <span className="text-3xl sm:text-4xl inline-block">{emoji}</span>
          </motion.span>
          <span className="relative text-3xl sm:text-4xl inline-block drop-shadow-lg">
            {emoji}
          </span>
        </motion.div>

        {/* Message with advanced character animations */}
        <motion.div className="relative flex-1 min-w-0">
          <span className={`inline-flex font-intertight tracking-wide text-shadow-DEFAULT flex-wrap text-sm sm:text-base md:text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]`}>
            {message.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30, rotateX: -90 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                }}
                transition={{
                  delay: 0.5 + (i * 0.015),
                  duration: 0.4,
                  ease: [0.33, 1, 0.68, 1]
                }}
                whileHover={{
                  scale: 1.3,
                  y: -5,
                  textShadow: "0 0 8px currentColor",
                  transition: { duration: 0.2 }
                }}
                className="inline-block hover:cursor-pointer"
                style={{ 
                  transformStyle: "preserve-3d",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>

          {/* Underline animation */}
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${color}`}
            initial={{ width: "0%" }}
            animate={{ width: isHovered ? "100%" : "0%" }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        {/* Enhanced floating particles with emoji */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xs opacity-0"
            style={{
              left: `${15 + i * 15}%`,
              top: '50%',
            }}
            animate={{
              y: [-30, -60, -30],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1.2, 0],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            {particles}
          </motion.div>
        ))}

        {/* Sparkle effects on hover */}
        {isHovered && [...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${color}`}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1,
              scale: 0
            }}
            animate={{
              x: Math.cos(i * 30 * Math.PI / 180) * 100,
              y: Math.sin(i * 30 * Math.PI / 180) * 100,
              opacity: 0,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }}
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        ))}

        {/* Pulse ring effect */}
        <motion.div
          className={`absolute inset-0 border-2 rounded-3xl bg-gradient-to-r ${color} opacity-20`}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Bottom shine effect */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${color}`}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default DailyGreetingD;