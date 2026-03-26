import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedHeadline from '../AnimatedHeadline';

const TotalEmissionsSection = React.memo(({
  processed,
  total,
  showBreakdown,
  setShowBreakdown,
  expandedCategory,
  setExpandedCategory,
  entryData,
  getDisplayError,
}) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/20 dark:bg-gray-100/10 blur-xl pointer-events-none transition-all duration-500 group-hover:blur-2xl" />
      <AnimatedHeadline />
      {(() => {
        const displayError = getDisplayError();
        if (!displayError) return null;
        return (
          <motion.div
            className={`backdrop-blur-xl rounded-3xl p-4 border shadow-lg ${
              displayError.isPersistent
                ? 'bg-gradient-to-br from-red-500/20 via-orange-500/15 to-rose-500/20 border-red-400/40 shadow-red-500/10'
                : 'bg-gradient-to-br from-amber-400/15 via-orange-400/10 to-rose-400/15 border-amber-300/30 shadow-amber-500/10'
            }`}
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="flex flex-col items-center gap-2">
              <p className={`font-intertight font-medium text-sm sm:text-lg text-center flex items-center justify-center gap-2 tracking-wide ${
                displayError.isPersistent ? 'text-red-300' : 'text-amber-200'
              }`}>
                <span className="text-xl animate-pulse">⚠️</span>
                {displayError.message}
              </p>
              {displayError.isPersistent && (
                <p className="text-xs text-red-400/80 font-intertight">
                  🔒 This error will persist until page refresh
                </p>
              )}
            </div>
          </motion.div>
        );
      })()}
      <motion.div
        className="relative mt-8 bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg text-center transition-transform duration-500 group-hover:scale-105"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
        <h2 className="sm:text-3xl md:text-4xl text-base text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-2 text-emerald-500 dark:text-gray-100">
          <span className="calendar-wrapper calendar-spark">🗓️ </span>Total Monthly Emission
        </h2>

        {(() => {
          const [intPart, decimalPart] = (total ?? 0).toFixed(2).split('.');
          return (
            <p className="sm:text-2xl md:text-3xl text-shadow-DEFAULT font-intertight font-normal sm:tracking-wider text-emerald-500 dark:text-gray-100">
              {intPart}
              <span className="hidden sm:inline">.{decimalPart}</span> kg CO<span className="hidden sm:inline-block"><span
                className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
                style={{ '--random': Math.random() }}
              >
                2
              </span></span>
              <span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
                2
              </span><br />
            </p>
          );
        })()}

        {/* Emission Breakdown (Expandable Section) */}
        <div className="sm:mt-2 block">
          <motion.div
            className="cursor-pointer flex items-center justify-center gap-2 mb-3"
            onClick={() => setShowBreakdown(prev => !prev)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <h3 className="text-base sm:text-xl font-intertight font-normal tracking-wide text-shadow-DEFAULT text-emerald-500 dark:text-gray-100 text-center">
              <span className="animate-chart-orbit text-2xl">📊</span> Emission Breakdown
            </h3>
            <span className="text-gray-100 text-xl">
              {showBreakdown ? "▷" : "▽"}
            </span>
          </motion.div>

          <motion.div
            className="overflow-visible"
            initial={false}
            animate={{
              height: showBreakdown ? "auto" : 0,
              opacity: showBreakdown ? 1 : 0,
              marginTop: showBreakdown ? 12 : 0
            }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <div className="grid grid-cols-1 gap-2 sm:relative">
              <div className="grid grid-cols-1 gap-2 sm:relative">
                {/* Food */}
                {processed.foodEmissionKg > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
                    style={{ gridColumn: expandedCategory === 'food' ? '1 / -1' : 'auto' }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(16, 185, 129, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setExpandedCategory(prev => prev === 'food' ? null : 'food')}
                    layout
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-food-bowl text-2xl">🥗</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Food
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {(processed?.foodEmissionKg ?? 0).toFixed(1)} kg
                      </span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedCategory === 'food' ? 'auto' : 0,
                        opacity: expandedCategory === 'food' ? 1 : 0
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {entryData?.food && (
                        <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-1 pt-2 mt-2 border-t border-emerald-500/30">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{entryData.food.type}</span>
                            <span>{entryData.food.amountKg} kg</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Transport */}
                {processed.transportEmissionKg > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
                    style={{ gridColumn: expandedCategory === 'transport' ? '1 / -1' : 'auto' }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), 0 0 50px rgba(6, 182, 212, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setExpandedCategory(prev => prev === 'transport' ? null : 'transport')}
                    layout
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-car-drive text-2xl">🚗</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Transport
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {processed.transportEmissionKg.toFixed(1)} kg
                      </span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedCategory === 'transport' ? 'auto' : 0,
                        opacity: expandedCategory === 'transport' ? 1 : 0
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {entryData?.transport && entryData.transport.length > 0 && (
                        <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-blue-500/30">
                          {entryData.transport.map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="font-medium">{t.mode}</span>
                              <span>{t.distanceKm} km</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Electricity */}
                {processed.electricityEmissionKg > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
                    style={{ gridColumn: expandedCategory === 'electricity' ? '1 / -1' : 'auto' }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(249, 115, 22, 0.6), 0 0 50px rgba(249, 115, 22, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setExpandedCategory(prev => prev === 'electricity' ? null : 'electricity')}
                    layout
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-electricity text-2xl">⚡</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Electricity
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {processed.electricityEmissionKg.toFixed(1)} kg
                      </span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedCategory === 'electricity' ? 'auto' : 0,
                        opacity: expandedCategory === 'electricity' ? 1 : 0
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {entryData?.electricity && entryData.electricity.length > 0 && (
                        <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-yellow-500/30">
                          {entryData.electricity.map((e, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="font-medium">{e.source}</span>
                              <span>{e.consumptionKwh} kWh</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Waste */}
                {processed.wasteEmissionKg > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-3 backdrop-blur-sm cursor-pointer sm:col-span-1 transition-shadow duration-300"
                    style={{ gridColumn: expandedCategory === 'waste' ? '1 / -1' : 'auto' }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: '0 0 25px rgba(236, 72, 153, 0.6), 0 0 50px rgba(236, 72, 153, 0.3)',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setExpandedCategory(prev => prev === 'waste' ? null : 'waste')}
                    layout
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-waste-bin text-2xl">🗑️</span>
                        <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                          Waste
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-medium tracking-wide text-shadow-DEFAULT font-intertight text-emerald-500 dark:text-gray-100">
                        {processed.wasteEmissionKg.toFixed(1)} kg
                      </span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedCategory === 'waste' ? 'auto' : 0,
                        opacity: expandedCategory === 'waste' ? 1 : 0
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {entryData?.waste && entryData.waste.length > 0 && (
                        <div className="text-xs sm:text-sm text-emerald-500 dark:text-gray-100 space-y-2 pt-2 mt-2 border-t border-red-500/30">
                          {entryData.waste.map((w, idx) => (
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
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
});

export default TotalEmissionsSection;
