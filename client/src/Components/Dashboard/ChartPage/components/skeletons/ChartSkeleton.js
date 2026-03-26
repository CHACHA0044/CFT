import React from 'react';

const ChartSkeleton = () => (
  <div className="group relative">
    <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none" />
    <div className="relative bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg sm:w-4/5 sm:ml-14">
      <div className="h-8 w-64 bg-gray-700 rounded-xl animate-pulse mx-auto mb-6" />
      <div className="h-64 w-full bg-gray-800/50 rounded-xl animate-pulse" />
      <div className="flex justify-center gap-4 mt-4">
        <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default React.memo(ChartSkeleton);
