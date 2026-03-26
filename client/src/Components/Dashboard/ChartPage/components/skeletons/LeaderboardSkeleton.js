import React from 'react';

const LeaderboardSkeleton = () => (
  <div className="group relative">
    <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none" />
    <div className="relative bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg sm:w-4/5 sm:ml-14">
      <div className="h-8 w-48 bg-gray-700 rounded-xl animate-pulse mx-auto mb-6" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-800/40 rounded-3xl p-3 mb-3">
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gray-700 rounded animate-pulse" />
              <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="w-32 h-4 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gray-600 rounded-full animate-pulse" style={{ width: `${80 - i * 15}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default React.memo(LeaderboardSkeleton);
