import React from 'react';
import { motion } from 'framer-motion';
import { VictoryPie } from 'victory';

const PieChartSection = React.memo(({ pieData, selectedIndex, handleLegendClick }) => {
  return (
    <div className="group relative w-full">
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

      <motion.div
        className="relative bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl px-4 pt-6 pb-2 rounded-3xl shadow-lg text-center transition-transform duration-500 group-hover:scale-105 overflow-visible"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />

        <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-0 text-emerald-500 dark:text-gray-100">
          <span className="pancake-wrapper pancake-steam">🥞</span>  Emission Breakdown CO₂( <span className="hidden sm:inline-block text-white"><span
            className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
            style={{ '--random': Math.random() }}
          >
            e
          </span></span>
          <span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
            e
          </span> )
        </h3>

        <div className="w-full flex justify-center items-center overflow-visible sm:h-96">
          <VictoryPie
            width={400}
            height={400}
            innerRadius={80}
            padAngle={1.5}
            data={pieData.map((d, i) => ({
              ...d,
              customRadius:
                selectedIndex === null
                  ? 160
                  : selectedIndex === i
                  ? 175
                  : 150
            }))}
            x="x"
            y="y"
            radius={({ datum }) => datum.customRadius}
            colorScale={['#34d399', '#60a5fa', '#facc15', '#f87171']}
            labels={[]}
            labelComponent={<></>}
            animate={{
              duration: 400,
              easing: "cubicInOut",
              onLoad: { duration: 600 }
            }}
            style={{
              data: {
                fillOpacity: ({ index }) =>
                  selectedIndex === null || selectedIndex === index ? 1 : 0.3,
                stroke: ({ index }) =>
                  selectedIndex === index ? "#ffffff" : "#ffffff55",
                strokeWidth: ({ index }) =>
                  selectedIndex === index ? 3 : 1,
                filter: ({ index }) =>
                  selectedIndex === index
                    ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))"
                    : "drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))",
                transition: "all 0.4s ease"
              }
            }}
            events={[
              {
                target: "data",
                eventHandlers: {
                  onClick: () => {
                    return [
                      {
                        target: "data",
                        mutation: (props) => {
                          handleLegendClick(props.index);
                          return null;
                        }
                      }
                    ];
                  }
                }
              }
            ]}
          />
        </div>

        <div className="flex sm:flex-wrap justify-center mt-0 gap-4 sm:mb-3 mb-1">
          {pieData.map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                onClick={(e) => {
                  e.stopPropagation();
                  handleLegendClick(index);
                }}
                className={`cursor-pointer text-sm md:text-base font-medium flex flex-col items-center
                  ${selectedIndex === index
                    ? 'text-emerald-400 dark:text-emerald-300 animate-pulse'
                    : 'text-emerald-500 dark:text-gray-200 hover:text-emerald-400 dark:hover:text-emerald-300'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  layout
                  initial={false}
                  animate={{
                    scale: selectedIndex === index ? 1.15 : 1,
                    color: selectedIndex === index ? '#34d399' : '',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={`-mb-2 transition-colors duration-300 ease-in-out sm:text-xl text-shadow-DEFAULT font-intertight font-light tracking-normal ${
                    selectedIndex === index ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {item.x} <span className="text-xs opacity-70">({item.unit})</span>
                </motion.span>

                <motion.span
                  initial={false}
                  animate={{
                    opacity: selectedIndex === index ? 1 : 0,
                    scale: selectedIndex === index ? 1 : 0.9,
                    y: selectedIndex === index ? 0 : -5,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-xs mt-1 text-emerald-500 dark:text-emerald-400 h-4"
                >
                  <span>
                    {window.innerWidth < 640
                      ? Math.round(item.y)
                      : item.y.toFixed(1)}
                  </span>
                </motion.span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

export default PieChartSection;
