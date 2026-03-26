import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { select, zoom, scaleLinear } from 'd3';
import ResponsiveTooltip from '../ResponsiveTooltip';

const YearlyProjectionSection = React.memo(({
  total,
  yearly,
  yearlyChartData,
  entryData,
  projectionData,
}) => {
  const chartRef = useRef(null);
  const svgRef = useRef(null);
  const [zoomRange, setZoomRange] = useState([1, 12]);

  const handleZoom = useCallback((e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const rect = chartRef.current.getBoundingClientRect();
    const scale = scaleLinear().domain([rect.left, rect.right]).range([zoomRange[0], zoomRange[1]]);
    const pointerX = e.clientX;
    const pointerMonth = scale(pointerX);
    const range = zoomRange[1] - zoomRange[0];
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    const newRange = range * zoomFactor;
    const newMin = Math.max(1, pointerMonth - (pointerMonth - zoomRange[0]) * zoomFactor);
    const newMax = Math.min(12, newMin + newRange);
    setZoomRange([newMin, newMax]);
  }, [zoomRange]);

  // Wheel zoom handler
  useEffect(() => {
    const ref = chartRef.current;
    if (!ref) return;
    ref.addEventListener("wheel", handleZoom, { passive: false });
    return () => ref.removeEventListener("wheel", handleZoom);
  }, [handleZoom]);

  // D3 zoom behavior
  useEffect(() => {
    if (!chartRef.current || !projectionData.length) return;

    const svg = select(svgRef.current);
    const zoomBehavior = zoom()
      .scaleExtent([1, 3])
      .translateExtent([[0, 0], [chartRef.current.offsetWidth, chartRef.current.offsetHeight]])
      .on('zoom', (e) => {
        const zoomScale = e.transform.rescaleX(scaleLinear().domain([1, 12]).range([1, 12]));
        const newMin = Math.max(1, zoomScale(1));
        const newMax = Math.min(12, zoomScale(12));
        setZoomRange([newMin, newMax]);
      });

    svg.call(zoomBehavior);
    return () => svg.on('.zoom', null);
  }, [projectionData]);

  // Animation frame effect
  useEffect(() => {
    if (!total) return;
    let raf;
    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 1000, 1);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  return (
    <div className="group relative">
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

      <motion.div
        className="relative bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-105"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />

        <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-6 text-center text-emerald-500 dark:text-gray-100">
          <span className="animate-glow-up">📈</span> Yearly Projection
        </h3>

        {/* Current Year Summary */}
        <motion.div
          className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl p-4 mb-6 text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="sm:text-lg md:text-xl text-shadow-DEFAULT font-intertight font-medium text-emerald-500 dark:text-white mb-2">
            {(() => {
              const entryDate = new Date(entryData.createdAt || entryData.updatedAt);
              const currentMonth = entryDate.getMonth();
              const currentYear = entryDate.getFullYear();

              if (currentMonth === 0) {
                return `${currentYear}`;
              } else {
                return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
              }
            })()} Projected Total
          </div>
          <div className="sm:text-2xl md:text-3xl text-shadow-DEFAULT font-intertight font-bold">
            {(() => {
              const yearlyTonnes = yearly / 1000;
              let style = {
                color: 'text-green-400',
                emoji: '🌱',
                animation: 'animate-gentle-grow'
              };

              if (yearlyTonnes > 4 && yearlyTonnes <= 7) {
                style = { color: 'text-yellow-400', emoji: '⚠️', animation: 'animate-warning-shake' };
              } else if (yearlyTonnes > 7 && yearlyTonnes <= 10) {
                style = { color: 'text-orange-400', emoji: '🔥', animation: 'animate-flame-flicker' };
              } else if (yearlyTonnes > 10) {
                style = { color: 'text-red-400', emoji: '💥', animation: 'animate-explode-pop' };
              }

              const [intPart, decimalPart] = yearlyTonnes.toFixed(2).split('.');

              return (
                <>
                  <span className={`${style.animation} ${style.color} text-2xl mr-2`}>{style.emoji}</span>
                  <span className={style.color}>
                    {intPart}
                    <span className="hidden sm:inline">.{decimalPart}</span> tonnes CO
                    <span className="hidden sm:inline-block"><span
                      className="animated-co2 ml-[-1px] sm:ml-[1px] inline-block text-[1em] align-sub"
                      style={{ '--random': Math.random() }}
                    >
                      2
                    </span></span>
                    <span className="inline sm:hidden ml-[1px] text-[1em] align-sub">
                      2
                    </span>
                  </span>
                </>
              );
            })()}
          </div>
        </motion.div>

        {/* Interactive Chart */}
        <div
          ref={chartRef}
          className="relative h-80 w-full bg-gray-800/30 rounded-xl p-4 overflow-hidden"
          style={{
            outline: 'none',
            border: 'none',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none'
          }}
          onFocus={(e) => e.target.blur()}
        >
          <svg ref={svgRef} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }} />
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
              data={yearlyChartData}
            >
              <CartesianGrid
                strokeDasharray="4,4"
                stroke="#6b7280"
                opacity={0.5}
              />
              <XAxis
                dataKey="monthName"
                stroke="#f3f4f6"
                fontSize={14}
                fontWeight="bold"
                style={{ fill: '#f3f4f6' }}
              />
              <YAxis
                stroke="#f3f4f6"
                fontSize={14}
                fontWeight="bold"
                style={{ fill: '#f3f4f6' }}
                tickFormatter={(value) => `${value.toFixed(1)}t`}
              />
              <ResponsiveTooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #34d399',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
                formatter={(value, name) => [
                  `${value.toFixed(2)} t CO₂`,
                  'Cumulative Emissions'
                ]}
                labelFormatter={(label, payload) => {
                  const currentMonth = new Date().getMonth();
                  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${fullMonthNames[currentMonth]} -> ${data.fullMonthName} : ${data.cumulativeKg.toFixed(0)} kg`;
                  }
                  return label;
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#34d399"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#34d399',
                  stroke: '#ffffff',
                  strokeWidth: 1
                }}
                activeDot={{
                  r: 8,
                  fill: '#34d399',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <motion.div
          className="mt-4 text-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>Starting from {(() => {
            const entryDate = new Date(entryData.createdAt || entryData.updatedAt);
            const currentMonth = entryDate.getMonth();
            const currentYear = entryDate.getFullYear();
            const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                     'July', 'August', 'September', 'October', 'November', 'December'];
            return `${fullMonthNames[currentMonth]} ${currentYear}`;
          })()} • Probable yearly emission if you keep similar emissions monthly</p>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default YearlyProjectionSection;
