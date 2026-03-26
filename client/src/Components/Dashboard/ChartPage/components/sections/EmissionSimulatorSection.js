import React from 'react';
import { motion } from 'framer-motion';

const EmissionSimulatorSection = React.memo(({
  processed,
  total,
  simTransport,
  setSimTransport,
  simDiet,
  setSimDiet,
  simElectricity,
  setSimElectricity,
  simWaste,
  setSimWaste,
}) => {
  const scale = (value) => {
    if (value === 100) return 1;
    return Math.pow(value / 100, 1.4);
  };

  const simulatedTotal = (
    processed.transportEmissionKg * scale(simTransport) +
    processed.foodEmissionKg * scale(simDiet) +
    processed.electricityEmissionKg * scale(simElectricity) +
    processed.wasteEmissionKg * scale(simWaste)
  );

  const foodSim = processed.foodEmissionKg * scale(simDiet);
  const transportSim = processed.transportEmissionKg * scale(simTransport);
  const electricitySim = processed.electricityEmissionKg * scale(simElectricity);
  const wasteSim = processed.wasteEmissionKg * scale(simWaste);

  const difference = simulatedTotal - total;
  const percentChange = ((difference / total) * 100);

  const getPercentColor = (value) => {
    if (value === 100) return "rgb(255,255,255)";
    if (value > 100) {
      let intensity = Math.min((value - 100) / 100, 1);
      return `rgb(255, ${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))})`;
    } else {
      let intensity = Math.min((100 - value) / 100, 1);
      return `rgb(${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))}, 255)`;
    }
  };

  const getSliderStyle = (value) => ({
    accentColor: getPercentColor(value),
    background: `linear-gradient(
        90deg,
        ${getPercentColor(value)} ${value / 2}%,
        #444 ${value / 2}%
      )`,
    transition: "all 0.3s ease",
  });

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
          <span className="text-2xl animate-crystal-ball">🔮</span> What If
        </h3>

        <div className="space-y-6 mb-6 text-shadow-DEFAULT tracking-wide font-intertight">
          {/* Food Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-white flex items-center gap-2">
                <span className="animate-food-bowl">🥗</span> Food {foodSim.toFixed(1)} kg
              </span>
              <span
                className="text-sm sm:text-base font-semibold transition-colors duration-300"
                style={{ color: getPercentColor(simDiet) }}
              >
                {simDiet}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={simDiet}
              onChange={(e) => setSimDiet(Number(e.target.value))}
              style={getSliderStyle(simDiet)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Transport Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-white flex items-center gap-2">
                <span className="animate-car-drive">🚗</span> Transport {transportSim.toFixed(1)} kg
              </span>
              <span
                className="text-sm sm:text-base font-semibold transition-colors duration-300"
                style={{ color: getPercentColor(simTransport) }}
              >
                {simTransport}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={simTransport}
              onChange={(e) => setSimTransport(Number(e.target.value))}
              style={getSliderStyle(simTransport)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Electricity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-white flex items-center gap-2">
                <span className="animate-electricity">⚡</span> Electricity {electricitySim.toFixed(1)} kg
              </span>
              <span
                className="text-sm sm:text-base font-semibold transition-colors duration-300"
                style={{ color: getPercentColor(simElectricity) }}
              >
                {simElectricity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={simElectricity}
              onChange={(e) => setSimElectricity(Number(e.target.value))}
              style={getSliderStyle(simElectricity)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Waste Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-white flex items-center gap-2">
                <span className="animate-waste-bin">🗑️</span> Waste {wasteSim.toFixed(1)} kg
              </span>
              <span
                className="text-sm sm:text-base font-semibold transition-colors duration-300"
                style={{ color: getPercentColor(simWaste) }}
              >
                {simWaste}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={simWaste}
              onChange={(e) => setSimWaste(Number(e.target.value))}
              style={getSliderStyle(simWaste)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Results */}
        <motion.div
          className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl text-shadow-DEFAULT tracking-wide font-intertight p-4 text-center"
          key={simulatedTotal}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm text-gray-300 mb-2">Simulated Monthly Total</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-500 dark:text-white mb-2">
            {simulatedTotal.toFixed(2)} kg CO<span className="hidden sm:inline-block"><span
              className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
              style={{ '--random': Math.random() }}
            >
              2
            </span></span>
            <span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
              2
            </span>
          </div>
          <div className={`text-sm sm:text-base ${difference < 0 ? 'text-green-400' : difference > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {difference < 0 ? '📉' : difference > 0 ? '📈' : '➡️'}
            {' '}{Math.abs(difference).toFixed(2)} kg ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
            {difference < 0 ? ' saved!' : difference > 0 ? ' increase' : ' no change'}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default EmissionSimulatorSection;
