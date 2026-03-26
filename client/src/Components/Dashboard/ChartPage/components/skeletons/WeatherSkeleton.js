import React from 'react';

const WeatherSkeleton = () => (
  <div className="group relative">
    <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none" />
    <div className="relative bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg sm:w-4/5 sm:ml-14">
      <div className="h-8 w-56 bg-gray-700 rounded-xl animate-pulse mx-auto mb-6" />
      <div className="bg-gray-800/30 rounded-3xl p-4 mb-4">
        <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mx-auto mb-3" />
        <div className="h-5 w-60 bg-gray-700 rounded animate-pulse mx-auto" />
      </div>
      <div className="bg-gray-800/30 rounded-3xl p-4">
        <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mx-auto mb-3" />
        <div className="h-5 w-48 bg-gray-700 rounded animate-pulse mx-auto" />
      </div>
    </div>
  </div>
);

export default React.memo(WeatherSkeleton);
