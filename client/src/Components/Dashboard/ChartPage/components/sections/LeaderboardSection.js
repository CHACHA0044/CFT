import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import IceAnimation from 'animations/Ice.json';
import FireAnimation from 'animations/Fire.json';
import DragonAnimation from 'animations/Dragon.json';
import SunAnimation from 'animations/Sun.json';
import calculateEmissions from 'utils/calculateEmissionsFrontend';
import { ShowMoreButton } from 'Components/globalbuttons';

const LeaderboardSection = React.memo(({
  leaderboard,
  displayedUsers,
  hasMore,
  showAllLeaderboard,
  setShowAllLeaderboard,
  expandedLeaderboardUser,
  setExpandedLeaderboardUser,
  expandedLeaderboardCategory,
  setExpandedLeaderboardCategory,
  hoveredIndex,
  setHoveredIndex,
  hoverTimeoutRef,
  leaderboardRef,
  containerVariants,
}) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none" />
      <motion.div
        className="relative bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
        <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-4 text-center text-emerald-500 dark:text-gray-100">
          <span className="animate-trophy-shine">🏆 </span>Leaderboard
        </h3>
        <div ref={leaderboardRef} className="space-y-3">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {displayedUsers.map((u, i, arr) => {
                const max = arr[arr.length - 1]?.totalEmission || 1;
                const pct = Math.min((u.totalEmission / max) * 100, 100);
                const isMe = u.isCurrentUser;
                const isExpanded = expandedLeaderboardUser === i;
                const userProcessed = u.entry ? calculateEmissions(u.entry) : null;

                return (
                  <motion.div
                    key={u.email}
                    className="relative"
                    data-lb-item
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <motion.div
                      layout="position"
                      className={`relative p-3 rounded-3xl mb-3 cursor-pointer sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-normal tracking-normal ${
                        isMe ? 'bg-emerald-700/30' : 'bg-gray-800/40'
                      }`}
                      onMouseEnter={() => {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = setTimeout(() => setHoveredIndex(i), 50);
                      }}
                      onMouseLeave={() => {
                        clearTimeout(hoverTimeoutRef.current);
                        setHoveredIndex(null);
                      }}
                      onClick={(e) => {
                        if (e.target.closest('.category-item')) return;
                        e.stopPropagation();
                        setExpandedLeaderboardUser(isExpanded ? null : i);
                        setExpandedLeaderboardCategory(null);
                      }}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="flex items-center justify-between text-xs sm:text-base md:text-xl text-shadow-DEFAULT font-intertight font-normal tracking-normal mb-2">
                        <span className="flex items-center gap-2">
                          <span className="text-gray-400 min-w-[2ch]">{i + 1}.</span>
                          <span className="truncate">
                            {u.name.split(' ')[0]}{isMe && ''}
                          </span>
                          <motion.div
                            animate={{
                              scale: hoveredIndex === i ? 1.3 : 1,
                              rotate: hoveredIndex === i ? [0, -10, 10, -10, 0] : 0
                            }}
                            transition={{
                              scale: { type: 'spring', stiffness: 300, damping: 15 },
                              rotate: { duration: 0.5, ease: "easeInOut" }
                            }}
                          >
                            <Lottie
                              animationData={
                                u.totalEmission <= 300
                                  ? IceAnimation
                                  : u.totalEmission <= 450
                                  ? SunAnimation
                                  : u.totalEmission <= 800
                                  ? FireAnimation
                                  : DragonAnimation
                              }
                              className="w-8 h-8"
                              loop
                            />
                          </motion.div>
                        </span>
                        <span>{(() => {
                          const [intPart, decimalPart] = u.totalEmission.toFixed(2).split('.');
                          return (
                            <p className="sm:text-lg md:text-2xl text-shadow-DEFAULT font-intertight font-normal sm:tracking-wider text-emerald-500 dark:text-gray-100">
                              {intPart}
                              <span className="hidden sm:inline">.{decimalPart}</span> kg CO<span className="hidden sm:inline-block"><span
                                className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
                                style={{ '--random': Math.random() }}
                              >
                                2
                              </span></span>
                              <span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
                                2
                              </span>
                            </p>
                          );
                        })()}</span>
                      </div>

                      <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: i * 0.05 }}
                          className={`h-full rounded-full relative overflow-hidden
                            ${isMe ? 'bg-gradient-to-r from-green-300 to-green-500' :
                              u.totalEmission <= 300 ? 'bg-gradient-to-r from-blue-300 to-blue-500' :
                              u.totalEmission <= 450 ? 'bg-gradient-to-r from-yellow-300 to-yellow-500' :
                              u.totalEmission <= 800 ? 'bg-gradient-to-r from-red-300 to-red-500' :
                              'bg-gradient-to-r from-purple-400 to-purple-600'}
                          `}
                        >
                          <div className="absolute inset-0 animate-flowing-bar" />
                        </motion.div>
                      </div>

                      {/* Expanded Breakdown Section */}
                      <AnimatePresence mode="wait">
                        {isExpanded && userProcessed && u.entry && (
                          <motion.div
                            key="breakdown"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: 'auto',
                              opacity: 1,
                              transition: {
                                height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                                opacity: { duration: 0.3, delay: 0.1 }
                              }
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                              transition: {
                                height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                                opacity: { duration: 0.2 }
                              }
                            }}
                            className="overflow-visible hidden sm:block"
                          >
                            <div className="mt-4 space-y-2">
                              {/* Food */}
                              {userProcessed.foodEmissionKg > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.05 }}
                                  className="category-item bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedLeaderboardCategory(prev => prev === `${i}-food` ? null : `${i}-food`);
                                  }}
                                  whileHover={{
                                    scale: 1.03,
                                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3)',
                                    transition: { duration: 0.3 }
                                  }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="animate-food-bowl text-2xl">🥗</span>
                                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                        Food
                                      </span>
                                    </div>
                                    <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                      {userProcessed.foodEmissionKg.toFixed(1)} kg
                                    </span>
                                  </div>
                                  <AnimatePresence>
                                    {expandedLeaderboardCategory === `${i}-food` && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                      >
                                        {u.entry?.food && (
                                          <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-1 pt-2 mt-2 border-t border-emerald-500/30">
                                            <div className="flex justify-between items-center">
                                              <span className="font-medium">{u.entry.food.type}</span>
                                              <span>{u.entry.food.amountKg} kg</span>
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              )}

                              {/* Transport */}
                              {userProcessed.transportEmissionKg > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.1 }}
                                  className="category-item bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedLeaderboardCategory(prev => prev === `${i}-transport` ? null : `${i}-transport`);
                                  }}
                                  whileHover={{
                                    scale: 1.03,
                                    boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), 0 0 50px rgba(6, 182, 212, 0.3)',
                                    transition: { duration: 0.3 }
                                  }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="animate-car-drive text-2xl">🚗</span>
                                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                        Transport
                                      </span>
                                    </div>
                                    <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                      {userProcessed.transportEmissionKg.toFixed(1)} kg
                                    </span>
                                  </div>
                                  <AnimatePresence>
                                    {expandedLeaderboardCategory === `${i}-transport` && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                      >
                                        {u.entry?.transport && u.entry.transport.length > 0 && (
                                          <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-blue-500/30">
                                            {u.entry.transport.map((t, idx) => (
                                              <div key={idx} className="flex justify-between items-center">
                                                <span className="font-medium">{t.mode}</span>
                                                <span>{t.distanceKm} km</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              )}

                              {/* Electricity */}
                              {userProcessed.electricityEmissionKg > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.15 }}
                                  className="category-item bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedLeaderboardCategory(prev => prev === `${i}-electricity` ? null : `${i}-electricity`);
                                  }}
                                  whileHover={{
                                    scale: 1.03,
                                    boxShadow: '0 0 25px rgba(249, 115, 22, 0.6), 0 0 50px rgba(249, 115, 22, 0.3)',
                                    transition: { duration: 0.3 }
                                  }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="animate-electricity text-2xl">⚡</span>
                                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                        Electricity
                                      </span>
                                    </div>
                                    <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                      {userProcessed.electricityEmissionKg.toFixed(1)} kg
                                    </span>
                                  </div>
                                  <AnimatePresence>
                                    {expandedLeaderboardCategory === `${i}-electricity` && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                      >
                                        {u.entry?.electricity && u.entry.electricity.length > 0 && (
                                          <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-yellow-500/30">
                                            {u.entry.electricity.map((e, idx) => (
                                              <div key={idx} className="flex justify-between items-center">
                                                <span className="font-medium">{e.source}</span>
                                                <span>{e.consumptionKwh} kWh</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              )}

                              {/* Waste */}
                              {userProcessed.wasteEmissionKg > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.2 }}
                                  className="category-item bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer transition-shadow duration-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedLeaderboardCategory(prev => prev === `${i}-waste` ? null : `${i}-waste`);
                                  }}
                                  whileHover={{
                                    scale: 1.03,
                                    boxShadow: '0 0 25px rgba(236, 72, 153, 0.6), 0 0 50px rgba(236, 72, 153, 0.3)',
                                    transition: { duration: 0.3 }
                                  }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="animate-waste-bin text-2xl">🗑️</span>
                                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                        Waste
                                      </span>
                                    </div>
                                    <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                                      {userProcessed.wasteEmissionKg.toFixed(1)} kg
                                    </span>
                                  </div>
                                  <AnimatePresence>
                                    {expandedLeaderboardCategory === `${i}-waste` && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                      >
                                        {u.entry?.waste && u.entry.waste.length > 0 && (
                                          <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-red-500/30">
                                            {u.entry.waste.map((w, idx) => (
                                              <div key={idx} className="space-y-1">
                                                {w.plasticKg > 0 && (
                                                  <div className="flex justify-between items-center">
                                                    <span>Plastic:</span>
                                                    <span className="font-medium">{w.plasticKg} kg</span>
                                                  </div>
                                                )}
                                                {w.paperKg > 0 && (
                                                  <div className="flex justify-between items-center">
                                                    <span>Paper:</span>
                                                    <span className="font-medium">{w.paperKg} kg</span>
                                                  </div>
                                                )}
                                                {w.foodWasteKg > 0 && (
                                                  <div className="flex justify-between items-center">
                                                    <span>Food Waste:</span>
                                                    <span className="font-medium">{w.foodWasteKg} kg</span>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Show More/Less Controls */}
              {hasMore && (
                <motion.div
                  className="flex flex-col items-center mt-4 mb-6 gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence mode="wait">
                    {!showAllLeaderboard && leaderboard[10] && (
                      <motion.div
                        onClick={() => setShowAllLeaderboard(true)}
                        className="relative w-full cursor-pointer group"
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 0.4, y: 0, height: 'auto', filter: 'blur(2px)' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        whileHover={{ opacity: 0.7, filter: 'blur(1px)', scale: 1.01 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="flex items-center justify-between bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-medium text-sm">11.</span>
                            <span className="text-gray-200 font-medium text-sm sm:text-base">
                              {leaderboard[10].name.split(' ')[0]}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-400">
                            {leaderboard[10].totalEmission.toFixed(2)} kg CO₂
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {!showAllLeaderboard && (
                      <motion.div
                        className="flex justify-center items-center py-3 cursor-pointer"
                        onClick={() => setShowAllLeaderboard(true)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex gap-3 items-center justify-center">
                          {[0, 1, 2].map((dotIdx) => (
                            <motion.span
                              key={dotIdx}
                              className="w-3.5 h-3.5 bg-white rounded-full shadow-md"
                              animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                              transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: dotIdx * 0.3,
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-full flex justify-center">
                    <ShowMoreButton
                      showAll={showAllLeaderboard}
                      totalCount={leaderboard.length}
                      visibleCount={10}
                      onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

export default LeaderboardSection;
