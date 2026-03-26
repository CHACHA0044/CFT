import React from 'react';
import { motion } from 'framer-motion';
import { VictoryChart, VictoryGroup, VictoryBar, VictoryAxis, VictoryTooltip } from 'victory';

const ComparisonChartSection = React.memo(({ comparison, userName, entryName }) => {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

      <motion.div
        className="relative bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />

        <h3 className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-4 text-center text-emerald-500 dark:text-gray-100">
          <div className="relative inline-block" style={{ "--angle": "15deg" }}>
            <span className="inline-block relative z-20">🚀</span>
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                left: "0px",
                top: "2px",
                width: "30px",
                height: "30px",
                transform: "rotate(var(--angle))",
                transformOrigin: "left top"
              }}
            >
              <span className="smoke-puff" style={{ left: "6px", top: "0px", fontSize: "14px", animationDelay: "0s" }}>☁️</span>
              <span className="smoke-puff" style={{ left: "12px", top: "6px", fontSize: "12px", animationDelay: "0.18s" }}>☁️</span>
              <span className="smoke-puff" style={{ left: "2px", top: "12px", fontSize: "10px", animationDelay: "0.36s" }}>☁️</span>
            </div>
            <style>{`
              @keyframes smokeExit {
                0% {
                  transform: translateX(0) translateY(0) scale(1);
                  opacity: 0.85;
                  filter: blur(0px);
                }
                60% {
                  opacity: 0.35;
                  filter: blur(0.6px);
                }
                100% {
                  transform: translateX(-10px) translateY(36px) scale(1.2);
                  opacity: 0;
                  filter: blur(1.6px);
                }
              }
              .smoke-puff {
                position: absolute;
                display: inline-block;
                transform-origin: center;
                will-change: transform, opacity;
                animation: smokeExit 1.6s cubic-bezier(.22,.9,.37,1) infinite;
                pointer-events: none;
                user-select: none;
              }
            `}</style>
          </div>
          {' '}{userName} <span className="text-white"> v<span className="animate-vs-slash">/</span>s</span> Global Averages
        </h3>

        <VictoryChart
          domainPadding={{ x: 40 }}
          padding={{ top: 20, bottom: 40, left: 60, right: 30 }}
          animate={{ duration: 1200, easing: "bounce" }}
        >
          <VictoryAxis
            style={{
              axis: { stroke: '#e5e7eb', strokeWidth: 1 },
              tickLabels: { fill: '#f3f4f6', fontSize: 14, fontWeight: 'bold' },
              grid: { stroke: '#6b7280', strokeDasharray: '4,4', opacity: 0.5 }
            }}
          />
          <VictoryAxis
            dependentAxis
            scale="log"
            tickFormat={(x) => `${x} kg`}
            style={{
              axis: { stroke: '#e5e7eb', strokeWidth: 1 },
              tickLabels: { fill: '#f3f4f6', fontSize: 14, fontWeight: 'bold' },
              grid: { stroke: '#6b7280', strokeDasharray: '4,4', opacity: 0.5 }
            }}
          />
          <VictoryGroup offset={25} colorScale={['#34d399', '#f87171']}>
            <VictoryBar
              data={comparison}
              x="category"
              y={(datum) => datum.user + 20}
              labels={({ datum }) => `${entryName || 'You'}: ${datum.user.toFixed(1)} kg`}
              className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-normal sm:tracking-wider"
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{ fill: '#111827', stroke: '#34d399', strokeWidth: 1 }}
                  style={{ fill: '#f3f4f6', fontSize: 12 }}
                />
              }
              animate={{ onLoad: { duration: 1000 } }}
              style={{ data: { fill: '#34d399', width: 18, cursor: 'pointer' } }}
            />
            <VictoryBar
              data={comparison}
              x="category"
              y={(datum) => datum.global + 50}
              labels={({ datum }) => `Global: ${datum.global.toFixed(1)} kg`}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{ fill: '#111827', stroke: '#f87171', strokeWidth: 1 }}
                  style={{ fill: '#f3f4f6', fontSize: 12 }}
                />
              }
              animate={{ onLoad: { duration: 1000 } }}
              style={{ data: { fill: '#f87171', width: 18, cursor: 'pointer' } }}
            />
          </VictoryGroup>
        </VictoryChart>
      </motion.div>
    </div>
  );
});

export default ComparisonChartSection;
