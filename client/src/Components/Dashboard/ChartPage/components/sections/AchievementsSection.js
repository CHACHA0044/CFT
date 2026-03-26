import React from 'react';
import { motion } from 'framer-motion';

const AchievementsSection = React.memo(({ processed, yearly, leaderboard, user }) => {
  const badges = [];
  const yearlyTonnes = yearly / 1000;
  const isTopPerformer = leaderboard.findIndex(u => u.email === user?.email) < leaderboard.length * 0.1;

  if (isTopPerformer) {
    badges.push({
      emoji: '🏆', emojiClass: 'animate-trophy',
      title: 'Top 10%', desc: 'Elite Performer',
      color: 'from-yellow-500/20 to-amber-500/20'
    });
  }

  if (yearlyTonnes <= 4) {
    badges.push({
      emoji: '🌱', emojiClass: 'animate-seedling',
      title: 'Eco Champion', desc: 'Sustainably Low',
      color: 'from-green-500/20 to-emerald-500/20'
    });
  }

  if (processed.transportEmissionKg < 80) {
    badges.push({
      emoji: '🚶', emojiClass: 'animate-walk',
      title: 'Green Traveler', desc: 'Low Transport',
      color: 'from-blue-500/20 to-cyan-500/20'
    });
  }

  if (processed.electricityEmissionKg < 70) {
    badges.push({
      emoji: '⚡', emojiClass: 'animate-electric',
      title: 'Energy Saver', desc: 'Low Power Use',
      color: 'from-yellow-500/20 to-orange-500/20'
    });
  }

  while (badges.length < 4) {
    badges.push({
      emoji: '🔒', emojiClass: 'animate-lock',
      title: 'Locked', desc: 'Keep improving',
      color: 'from-gray-500/20 to-gray-600/20',
      locked: true
    });
  }

  return (
    <div className="group relative hidden sm:block">
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

      <motion.div
        className="relative bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />

        <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-6 text-center text-emerald-500 dark:text-gray-100">
          <span className="animate-trophy-shine">🏆</span> Achievements
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-shadow-DEFAULT tracking-wide font-intertight">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              className={`bg-gradient-to-r ${badge.color} rounded-xl p-4 text-center backdrop-blur-sm ${!badge.locked ? 'cursor-pointer' : 'opacity-50'}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={!badge.locked ? { scale: 1.05 } : {}}
              whileTap={!badge.locked ? { scale: 0.95 } : {}}
            >
              <div className={`text-4xl mb-2 ${badge.emojiClass || ''}`}>
                {badge.emoji}
              </div>
              <div className="text-sm sm:text-base font-medium text-emerald-500 dark:text-white mb-1">{badge.title}</div>
              <div className="text-xs text-gray-300">{badge.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

export default AchievementsSection;
