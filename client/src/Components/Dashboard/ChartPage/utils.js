export const getLetterVariants = () => ({
  initial: { y: 0, opacity: 1, scale: 1 },
  fall: {
    y: [0, 20, -10, 100],
    x: [0, 10, -10, 0],
    opacity: [1, 0.7, 0],
    rotate: [0, 10, -10, 0],
    transition: { duration: 2, ease: "easeInOut" },
  },
  reenter: {
    y: [-120, 20, -10, 5, 0],
    x: [0, 4, -4, 2, 0],
    scale: [0.9, 1.2, 0.95, 1.05, 1],
    opacity: [0, 1],
    transition: {
      duration: 1.6,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
});

export const getAqiGradient = (pm25) => {
  if (pm25 <= 12) {
    return "bg-gradient-to-r from-emerald-400/20 via-teal-400/15 to-cyan-400/20";
  }
  if (pm25 <= 35) {
    return "bg-gradient-to-r from-sky-400/20 via-cyan-400/15 to-teal-400/20";
  }
  if (pm25 <= 55) {
    return "bg-gradient-to-r from-slate-300/20 via-sky-300/15 to-cyan-400/20";
  }
  if (pm25 <= 150) {
    return "bg-gradient-to-r from-amber-400/20 via-orange-400/15 to-rose-400/20";
  }
  return "bg-gradient-to-r from-rose-500/25 via-orange-500/20 to-amber-500/20";
};

export const getWeatherGradient = (code, uvIndex, visibility, temp) => {
  if (((code >= 45 && code <= 48) || code === 2100) && visibility < 1.5) {
    return "bg-gradient-to-r from-slate-400/20 via-gray-400/15 to-slate-500/20";
  }
  if (code >= 95 && code <= 99) {
    return "bg-gradient-to-r from-purple-500/25 via-indigo-500/20 to-purple-600/25";
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return "bg-gradient-to-r from-cyan-400/20 via-blue-300/15 to-white/20";
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "bg-gradient-to-r from-blue-500/25 via-indigo-400/20 to-slate-500/20";
  }
  if (code === 0 && uvIndex > 3) {
    return "bg-gradient-to-r from-yellow-400/25 via-orange-400/20 to-amber-500/25";
  }
  if (code === 0 && uvIndex <= 3) {
    return "bg-gradient-to-r from-indigo-500/20 via-purple-400/15 to-blue-600/20";
  }
  if (code <= 3 && uvIndex >= 4) {
    return "bg-gradient-to-r from-yellow-400/25 via-orange-400/20 to-amber-500/25";
  }
  if (code <= 3 && uvIndex > 2) {
    return "bg-gradient-to-r from-sky-400/20 via-blue-400/15 to-cyan-400/20";
  }
  if (code <= 3 && uvIndex <= 2) {
    return "bg-gradient-to-r from-gray-400/20 via-slate-400/15 to-gray-500/20";
  }
  return "bg-gradient-to-r from-indigo-400/20 via-blue-500/15 to-slate-500/20";
};

export const getTimeOfDay = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 6 && currentHour < 18 ? 'day' : 'night';
};
