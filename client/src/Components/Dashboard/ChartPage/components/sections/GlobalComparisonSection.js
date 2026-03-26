import React from 'react';
import { motion } from 'framer-motion';

const GlobalComparisonSection = React.memo(({ total, userName }) => {
  const worldAvgMonthly = 400;
  const indiaAvgMonthly = 200;

  const userToWorldRatio = (total / worldAvgMonthly) * 50;
  const userToIndiaRatio = (total / indiaAvgMonthly) * 50;

  const worldDiff = ((total - worldAvgMonthly) / worldAvgMonthly) * 100;
  const indiaDiff = ((total - indiaAvgMonthly) / indiaAvgMonthly) * 100;

  const renderCO2 = (value) => {
    const [intPart, decimalPart] = value.toFixed(2).split('.');
    return (
      <>
        {intPart}
        <span className="hidden sm:inline">.{decimalPart}</span> kg CO
        <span className="hidden sm:inline-block"><span
          className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
          style={{ '--random': Math.random() }}
        >
          2
        </span></span>
        <span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
          2
        </span>
      </>
    );
  };

  return (
    <div className="group relative">
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

      <motion.div
        className="relative bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />

        <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-6 text-center text-emerald-500 dark:text-gray-100">
          <span className="text-2xl animate-earth">🌍</span> Global Context
        </h3>

        <div className="space-y-6">
          {/* World Average Section */}
          <motion.div
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl text-shadow-DEFAULT tracking-wide font-intertight p-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-earth">🌎</span>
                  <span className="text-sm sm:text-base text-white font-medium">World Average</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {renderCO2(worldAvgMonthly)}
                </span>
              </div>

              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-blue-300 to-blue-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-cool-face">😎</span>
                  <span className="text-sm sm:text-base text-white font-medium">{userName}</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {renderCO2(total ?? 0)}
                </span>
              </div>

              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(userToWorldRatio, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-green-300 to-green-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>

              <div className={`text-sm text-center ${worldDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(worldDiff).toFixed(0)}% {worldDiff < 0 ? 'less ✨' : 'more 😢'} than world average
              </div>
            </div>
          </motion.div>

          {/* India Average Section */}
          <motion.div
            className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl text-shadow-DEFAULT tracking-wide font-intertight p-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-mosque">🕌</span>
                  <span className="text-sm sm:text-base text-white font-medium">India Average</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {renderCO2(indiaAvgMonthly)}
                </span>
              </div>

              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-yellow-300 to-orange-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-cool-face">😎</span>
                  <span className="text-sm sm:text-base text-white font-medium">{userName}</span>
                </div>
                <span className="text-sm sm:text-base text-white text-shadow-DEFAULT mt-2 sm:mt-0 font-intertight sm:tracking-wide">
                  {renderCO2(total ?? 0)}
                </span>
              </div>

              <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(userToIndiaRatio, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-green-300 to-green-500"
                >
                  <div className="absolute inset-0 animate-flowing-bar" />
                </motion.div>
              </div>

              <div className={`text-sm text-center ${indiaDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(indiaDiff).toFixed(0)}% {indiaDiff < 0 ? 'less 🌟' : 'more 😢'} than India average
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

export default GlobalComparisonSection;
