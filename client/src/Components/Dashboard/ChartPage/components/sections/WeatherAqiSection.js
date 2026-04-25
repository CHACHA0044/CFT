import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WeatherCountdown from '../WeatherCountdown';
import RefreshCountdown from '../RefreshCountdown';
import { WeatherButton } from 'Components/globalbuttons';
import { getTimeOfDay } from '../../utils';

const WeatherAqiSection = ({
  data,
  weatherRequested,
  loadingWeather,
  weatherTimestamp,
  showRefreshButton,
  refreshCooldown,
  weatherError,
  weatherRefreshSuccess,
  expandedWeatherSection,
  setExpandedWeatherSection,
  pm25,
  aqiGradient,
  weatherGradient,
  fetchWeatherAndAqi,
  handleGetWeatherInfo,
  handleRefreshAvailable,
  isWeatherDataExpired,
  setWeatherRequested,
  setData,
  setWeatherTimestamp,
  setShowRefreshButton,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every 60 seconds for relative time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="group relative">
      {/* Static glow */}
      <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 dark:bg-gray-100/5 blur-lg pointer-events-none transition-all duration-500 group-hover:blur-xl" />

      <motion.div
        className="relative  bg-gray-900/80 sm:w-4/5 sm:ml-14 backdrop-blur-xl p-6 rounded-3xl shadow-lg
                   transition-transform duration-500 group-hover:scale-105"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Hover animated border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0
                        group-hover:opacity-100 animate-borderFlow
                        border-emerald-500 dark:border-gray-100 pointer-events-none" />
                        <h3 className="sm:text-3xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider mb-4 text-center text-emerald-500 dark:text-gray-100"><span className="animate-weather-drift">🌦️</span>Weather and AQI</h3>
    {weatherRequested && data && weatherTimestamp ? (
      <div className="mt-4 space-y-4">
        {/* Weather Section */}
        <motion.div
          key={weatherGradient}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${weatherGradient} rounded-3xl p-4 mb-6 backdrop-blur-md`}
        >
          <motion.div
            className="cursor-pointer"
            onClick={() => setExpandedWeatherSection(prev => prev === 'weather' ? null : 'weather')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2 text-center">
              <h2 className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider text-emerald-500 dark:text-gray-100">
                🌤️ Weather
              </h2>
              <span className="text-emerald-500 dark:text-gray-100 sm:text-2xl">
                {expandedWeatherSection === 'weather' ? '▽' : '▷'}
              </span>
            </div>

            {/* Collapsed: Overall condition only */}
            {expandedWeatherSection !== 'weather' && (
      <div className="text-center mt-3">
        <div className="text-sm font-light text-white/90 text-shadow-DEFAULT">
          {(() => {
            const code = data.weather?.weather_code || 0;
            const uvIndex = data.air_quality?.uv_index || 0;
            const visibility = data.weather?.visibility || 10;
            const temp = data.weather?.temperature_2m !== undefined ? Math.round(data.weather.temperature_2m) : 'N/A';
            const feelsLike = data.weather?.apparent_temperature !== undefined ? Math.round(data.weather.apparent_temperature) : 'N/A';
            const windSpeed = data.weather?.windspeed_10m !== undefined ? data.weather.windspeed_10m.toFixed(1) : 'N/A';
            const windDeg = data.weather?.wind_direction;
            
            let windDir = '';
            if (windDeg !== undefined) {
              if (windDeg < 22.5 || windDeg >= 337.5) windDir = 'N';
              else if (windDeg < 67.5) windDir = 'NE';
              else if (windDeg < 112.5) windDir = 'E';
              else if (windDeg < 157.5) windDir = 'SE';
              else if (windDeg < 202.5) windDir = 'S';
              else if (windDeg < 247.5) windDir = 'SW';
              else if (windDeg < 292.5) windDir = 'W';
              else windDir = 'NW';
            }

            // Get condition emoji and text
            const isFogCode = (code >= 45 && code <= 48) || code === 2100;
            const isFoggy = isFogCode && visibility < 1.5 && uvIndex < 2;
            let emoji = '☁️';
            let condition = 'Overcast';

            if (isFoggy) {
              emoji = '🌫️';
              condition = 'Foggy';
            } else if (code === 0) {
              emoji = uvIndex > 3 ? '☀️' : '🌙';
              condition = uvIndex > 3 ? 'Clear' : 'Clear night';
            } else if (code <= 3) {
              emoji = uvIndex > 2 ? '⛅' : '☁️';
              condition = uvIndex > 2 ? 'Partly cloudy' : 'Cloudy';
            } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
              emoji = '🌧️';
              condition = 'Rainy';
            } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
              emoji = '❄️';
              condition = 'Snowy';
            } else if (code >= 95 && code <= 99) {
              emoji = '⛈️';
              condition = 'Thunderstorm';
            } else {
              emoji = uvIndex > 3 ? '🌤️' : '☁️';
              condition = uvIndex > 3 ? 'Fair' : 'Overcast';
            }

            return `${emoji} ${condition}, ${temp}°C · Feels ${feelsLike}°C · ${windSpeed} km/h ${windDir}`;
          })()}
        </div>
      </div>
    )}
          </motion.div>

          {/* Expanded */}
          <motion.div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              expandedWeatherSection === 'weather' ? 'max-h-[1500px] opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 font-intertight font-light text-shadow-DEFAULT items-start">
              {/* Temperature */}
              <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                <div className="text-xl mb-0.5">🌡️</div>
                <div className="text-sm font-semibold text-white leading-tight">{data.weather?.temperature_2m !== undefined ? Math.round(data.weather.temperature_2m) : 'N/A'}°C</div>
                <div className="text-xs text-gray-300 leading-tight">Temperature</div>
              </div>

              {/* Feels Like */}
              <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                <div className="text-xl mb-0.5">
                  {data.weather?.apparent_temperature !== undefined ? (() => {
                    const rounded = Math.round(data.weather.apparent_temperature);
                    if (rounded < 0) return "🥶";
                    if (rounded < 10) return "❄️";
                    if (rounded < 20) return "🧥";
                    if (rounded < 30) return "😊";
                    if (rounded < 40) return "🫠";
                    return "🥵";
                  })() : "🌡️"}
                </div>
                <div className="text-sm font-semibold text-white leading-tight">
                  {data.weather?.apparent_temperature !== undefined && data.weather?.temperature_2m !== undefined ? (() => {
                    const roundedApparent = Math.round(data.weather.apparent_temperature);
                    const roundedTemp = Math.round(data.weather.temperature_2m);
                    const diff = roundedApparent - roundedTemp;
                    let hint = "Same";
                    if (Math.abs(diff) >= 1) {
                      if (diff > 0) hint = "Hotter";
                      else hint = "Cooler";
                    }
                    return `${roundedApparent}°C · ${hint}`;
                  })() : "N/A"}
                </div>
                <div className="text-xs text-gray-300 leading-tight">Feels Like</div>
              </div>

              {/* Wind Speed + Direction Combined */}
              <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                <div className="text-xl mb-0.5">💨</div>
                <div className="text-sm font-semibold text-white leading-tight">
                  {data.weather?.windspeed_10m?.toFixed(1) || 'N/A'} km/h {(() => {
                    const deg = data.weather?.wind_direction;
                    if (deg === undefined) return '';
                    if (deg < 22.5 || deg >= 337.5) return 'N';
                    if (deg < 67.5) return 'NE';
                    if (deg < 112.5) return 'E';
                    if (deg < 157.5) return 'SE';
                    if (deg < 202.5) return 'S';
                    if (deg < 247.5) return 'SW';
                    if (deg < 292.5) return 'W';
                    return 'NW';
                  })()}
                </div>
                <div className="text-emerald-400 text-base leading-tight">
                  {(() => {
                    const deg = data.weather?.wind_direction;
                    if (deg === undefined) return '';
                    if (deg < 22.5 || deg >= 337.5) return '↑';
                    if (deg < 67.5) return '↗';
                    if (deg < 112.5) return '→';
                    if (deg < 157.5) return '↘';
                    if (deg < 202.5) return '↓';
                    if (deg < 247.5) return '↙';
                    if (deg < 292.5) return '←';
                    return '↖';
                  })()}
                </div>
                <div className="text-xs text-gray-300 leading-tight">Wind</div>
              </div>

              {/* Humidity */}
              <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                <div className="text-xl mb-0.5">💧</div>
                <div className="text-sm font-semibold text-white leading-tight">{data.weather?.relative_humidity_2m || 'N/A'}%</div>
                <div className="text-xs text-gray-300 leading-tight">Humidity</div>
              </div>

              {/* Visibility */}
              <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                <div className="text-xl mb-0.5">👁️</div>
                <div className="text-sm font-semibold text-white leading-tight">{data.weather?.visibility || 'N/A'} km</div>
                <div className="text-xs text-gray-300 leading-tight">Visibility</div>
              </div>

              {/* Dew Point */}
              {data.weather?.temperature_2m !== undefined && data.weather?.relative_humidity_2m !== undefined && (() => {
                const calculateDewPoint = (temp, humidity) => {
                  const a = 17.27;
                  const b = 237.7;
                  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
                  return (b * alpha) / (a - alpha);
                };
                const dewPoint = Math.round(calculateDewPoint(data.weather.temperature_2m, data.weather.relative_humidity_2m));
                const getComfortLevel = (dp) => {
                  if (dp > 24) return "Uncomfortable";
                  if (dp >= 16) return "Comfortable";
                  return "Dry";
                };
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">💧</div>
                    <div className="text-sm font-semibold text-white leading-tight">{dewPoint}°C · {getComfortLevel(dewPoint)}</div>
                    <div className="text-xs text-gray-300 leading-tight">Dew Point</div>
                  </div>
                );
              })()}

              {/* Air Pressure */}
              {data.weather?.pressure_sea_level !== undefined && (() => {
                const getPressureStatus = (pressure) => {
                  if (pressure < 1000) return "Low";
                  if (pressure <= 1020) return "Normal";
                  return "High";
                };
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">🌊</div>
                    <div className="text-sm font-semibold text-white leading-tight">{Math.round(data.weather.pressure_sea_level)} hPa</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{getPressureStatus(data.weather.pressure_sea_level)}</div>
                    <div className="text-xs text-gray-300 leading-tight">Pressure</div>
                  </div>
                );
              })()}

              {/* Wet Bulb Temperature - Always show */}
              {data.weather?.temperature_2m !== undefined && data.weather?.relative_humidity_2m !== undefined && (() => {
                const calculateWetBulbTemperature = (temp, humidity) => {
                  const wetBulb = temp * Math.atan(0.151977 * Math.sqrt(humidity + 8.313659)) + Math.atan(temp + humidity) 
                    - Math.atan(humidity - 1.676331) + 0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity)
                    - 4.686035;
                  return Math.round(wetBulb * 10) / 10;
                };
                const wetBulb = calculateWetBulbTemperature(data.weather.temperature_2m, data.weather.relative_humidity_2m);
                const getCaution = (wb) => {
                  if (wb < 16) return "Safe";
                  if (wb < 24) return "Caution";
                  if (wb < 29) return "Extreme";
                  return "Danger";
                };
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">💦</div>
                    <div className="text-sm font-semibold text-white leading-tight">{wetBulb}°C</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{getCaution(wetBulb)}</div>
                    <div className="text-xs text-gray-300 leading-tight">Wet Bulb</div>
                  </div>
                );
              })()}

              {/* UV Index */}
              {getTimeOfDay() === 'day' && data.air_quality?.uv_index !== undefined && data.air_quality.uv_index > 0 && (
                <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                  <div className="text-xl mb-0.5">☀️</div>
                  <div className="text-sm font-semibold text-white leading-tight">{data.air_quality.uv_index}</div>
                  <div className="text-[10px] text-gray-400 leading-tight">
                    {(() => {
                      const uvIndex = data.air_quality.uv_index;
                      const localHour = new Date().getHours();
                      
                      // Show "Peak was earlier" if low UV and after 2 PM
                      if (uvIndex < 2 && localHour >= 14) {
                        return 'Peak was earlier';
                      }
                      
                      // Show UV category
                      if (uvIndex < 3) return 'Low';
                      if (uvIndex < 6) return 'Moderate';
                      if (uvIndex < 8) return 'High';
                      if (uvIndex < 11) return 'Very High';
                      return 'Extreme';
                    })()}
                  </div>
                  <div className="text-xs text-gray-300 leading-tight">UV Index</div>
                </div>
              )}

              {/* Sunrise */}
              {data.weather?.sunrise_time && (() => {
                const sunriseDate = new Date(data.weather.sunrise_time);
                const now = new Date(currentTime);
                const sunriseMsUntil = sunriseDate.getTime() - now.getTime();
                const isSunRisen = sunriseMsUntil < 0;
                const absMsTime = Math.abs(sunriseMsUntil);
                const hoursTime = Math.floor(absMsTime / (1000 * 60 * 60));
                const minsTime = Math.floor((absMsTime % (1000 * 60 * 60)) / (1000 * 60));
                
                const sunsetDate = data.weather?.sunset_time ? new Date(data.weather.sunset_time) : null;
                const daylightMs = sunsetDate ? sunsetDate.getTime() - sunriseDate.getTime() : null;
                const daylightHours = daylightMs ? Math.floor(daylightMs / (1000 * 60 * 60)) : 0;
                const daylightMins = daylightMs ? Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60)) : 0;
                
                const timeStr = sunriseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const relStr = isSunRisen ? `rose ${hoursTime}h ${minsTime}m ago` : `rises in ${hoursTime}h ${minsTime}m`;
                
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">🌅</div>
                    <div className="text-sm font-semibold text-white leading-tight">{timeStr}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{relStr}</div>
                    <div className="text-xs text-gray-300 leading-tight">Sunrise</div>
                  </div>
                );
              })()}

              {/* Sunset */}
              {data.weather?.sunset_time && (() => {
                const sunsetDate = new Date(data.weather.sunset_time);
                const now = new Date(currentTime);
                const sunsetMsUntil = sunsetDate.getTime() - now.getTime();
                const isSunSet = sunsetMsUntil < 0;
                const absMsTime = Math.abs(sunsetMsUntil);
                const hoursTime = Math.floor(absMsTime / (1000 * 60 * 60));
                const minsTime = Math.floor((absMsTime % (1000 * 60 * 60)) / (1000 * 60));
                const isGoldenHour = !isSunSet && sunsetMsUntil <= 45 * 60 * 1000;
                
                const timeStr = sunsetDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const relStr = isGoldenHour ? '✨ Golden hour' : isSunSet ? `set ${hoursTime}h ${minsTime}m ago` : `sets in ${hoursTime}h ${minsTime}m`;
                
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">🌇</div>
                    <div className="text-sm font-semibold text-white leading-tight">{timeStr}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{relStr}</div>
                    <div className="text-xs text-gray-300 leading-tight">Sunset</div>
                  </div>
                );
              })()}

              {/* Moon Phase */}
              {getTimeOfDay() === "night" && data.weather?.moonPhase && (
                <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                  <div className="text-xl mb-0.5">{data.weather.moonPhase.emoji}</div>
                  <div className="text-sm font-semibold text-white leading-tight">{data.weather.moonPhase.name}</div>
                  <div className="text-[10px] text-gray-400 leading-tight">{data.weather.moonPhase.illumination}% lit</div>
                  <div className="text-xs text-gray-300 leading-tight">Moon Phase</div>
                </div>
              )}

              {/* Rain Intensity */}
              {data.weather?.rain_intensity !== undefined && data.weather.rain_intensity > 0 && (() => {
                const intensity = data.weather.rain_intensity < 0.5 ? '🌦️' : data.weather.rain_intensity < 2 ? '🌧️' : data.weather.rain_intensity < 10 ? '⛈️' : '🌊';
                const label = data.weather.rain_intensity < 0.5 ? 'Light' : data.weather.rain_intensity < 2 ? 'Moderate' : data.weather.rain_intensity < 10 ? 'Heavy' : 'Very Heavy';
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">{intensity}</div>
                    <div className="text-sm font-semibold text-white leading-tight">{data.weather.rain_intensity.toFixed(1)} mm/h</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{label}</div>
                    <div className="text-xs text-gray-300 leading-tight">Rain</div>
                  </div>
                );
              })()}

              {/* Precipitation Type */}
              {data.weather?.precipitation_type && data.weather.precipitation_type !== "None" && (
                <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                  <div className="text-xl mb-0.5">☔</div>
                  <div className="text-sm font-semibold text-white leading-tight">{data.weather.precipitation_type}</div>
                  <div className="text-xs text-gray-300 leading-tight">Precip Type</div>
                </div>
              )}

              {/* Precipitation Probability */}
              {data.weather?.precipitation_probability !== undefined &&
              data.weather.precipitation_probability > 10 && (
                <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                  <div className="text-xl mb-0.5">💧</div>
                  <div className="text-sm font-semibold text-white leading-tight">{data.weather.precipitation_probability}%</div>
                  <div className="text-xs text-gray-300 leading-tight">Rain Prob</div>
                </div>
              )}

              {/* Pressure Sea Level */}
              {data.weather?.pressure_sea_level !== undefined &&
              data.weather.rain_intensity > 0.3 && (
                <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                  <div className="text-xl mb-0.5">🌊</div>
                  <div className="text-sm font-semibold text-white leading-tight">{data.weather.pressure_sea_level.toFixed(0)} hPa</div>
                  <div className="text-xs text-gray-300 leading-tight">Sea Pressure</div>
                </div>
              )}

              {/* Pressure Surface Level */}
              {data.weather?.pressure_surface_level !== undefined &&
              data.weather.rain_intensity > 0.3 && (
                <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                  <div className="text-xl mb-0.5">📍</div>
                  <div className="text-sm font-semibold text-white leading-tight">{data.weather.pressure_surface_level.toFixed(0)} hPa</div>
                  <div className="text-xs text-gray-300 leading-tight">Sfc Pressure</div>
                </div>
              )}

              {/* Cloud Cover - Conditional (>15%) */}
              {data.weather?.cloudCover !== undefined && data.weather.cloudCover > 15 && (() => {
                const getCoverLevel = (cloudCover) => {
                  if (cloudCover < 25) return "Light";
                  if (cloudCover < 50) return "Partly";
                  if (cloudCover < 85) return "Mostly";
                  return "Overcast";
                };
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">☁️</div>
                    <div className="text-sm font-semibold text-white leading-tight">{data.weather.cloudCover.toFixed(0)}%</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{getCoverLevel(data.weather.cloudCover)}</div>
                    <div className="text-xs text-gray-300 leading-tight">Cloud Cover</div>
                  </div>
                );
              })()}

              {/* Solar Radiation - Conditional (>50 W/m²) */}
              {data.weather?.solarGHI !== undefined && data.weather.solarGHI > 50 && (() => {
                const getRadiationLevel = (ghi) => {
                  if (ghi < 200) return "Low";
                  if (ghi < 400) return "Moderate";
                  if (ghi < 700) return "High";
                  return "Very High";
                };
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">☀️</div>
                    <div className="text-sm font-semibold text-white leading-tight">{data.weather.solarGHI.toFixed(0)} W/m²</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{getRadiationLevel(data.weather.solarGHI)}</div>
                    <div className="text-xs text-gray-300 leading-tight">Solar Rad</div>
                  </div>
                );
              })()}

              {/* Thunderstorm Probability - Conditional (>10%) */}
              {data.weather?.thunderstormProbability !== undefined && data.weather.thunderstormProbability > 10 && (() => {
                const getThunderstormRisk = (prob) => {
                  if (prob < 25) return "Low";
                  if (prob < 50) return "Medium";
                  if (prob < 75) return "High";
                  return "Very High";
                };
                return (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">⚡</div>
                    <div className="text-sm font-semibold text-white leading-tight">{data.weather.thunderstormProbability.toFixed(0)}%</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{getThunderstormRisk(data.weather.thunderstormProbability)}</div>
                    <div className="text-xs text-gray-300 leading-tight">Thunderstorm</div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </motion.div>

        {/* Air Quality Section */}
        <motion.div
          key={aqiGradient}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`${aqiGradient} rounded-3xl p-4 mb-6 backdrop-blur-md`}
        >
          <motion.div
            className="cursor-pointer"
            onClick={() => setExpandedWeatherSection(prev => prev === 'airquality' ? null : 'airquality')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2 text-center">
              <h2 className="sm:text-2xl md:text-4xl text-shadow-DEFAULT font-intertight font-medium sm:tracking-wider text-emerald-500 dark:text-gray-100">
                🌬️ Air Quality
              </h2>
              <span className="text-emerald-500 dark:text-gray-100 sm:text-2xl">
                {expandedWeatherSection === 'airquality' ? '▽' : '▷'}
              </span>
            </div>

            {/* Collapsed: Overall AQI only */}
            {expandedWeatherSection !== 'airquality' && (
              <div className="text-center mt-3">
                <div className="text-sm font-intertight font-extralight text-shadow-DEFAULT sm:text-2xl mb-2">
                  {(() => {
                    const aqi = Number(data?.air_quality?.aqi) || 0;
                    if (aqi <= 50) return '🌟';
                    if (aqi <= 100) return '😊';
                    if (aqi <= 150) return '😐';
                    if (aqi <= 200) return '😷';
                    if (aqi <= 300) return '🔥';
                    return '☠️';
                  })()}
                  {(() => {
                    const aqi = Number(data?.air_quality?.aqi) || 0;
                    if (aqi <= 50) return 'Good';
                    if (aqi <= 100) return 'Moderate';
                    if (aqi <= 150) return 'Poor';
                    if (aqi <= 200) return 'Unhealthy';
                    if (aqi <= 300) return 'Severe';
                    return 'Hazardous';
                  })()} air quality
                  , AQI: {data?.air_quality?.aqi ?? 'N/A'}
                  <span className="text-xs opacity-70"> (US EPA Standard)</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Expanded: All air quality details */}
          <motion.div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              expandedWeatherSection === 'airquality' ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4">
              {/* Health Recommendation */}
              <div className="bg-white/10 rounded-xl p-4 text-center text-shadow-DEFAULT font-intertight tracking-wide">
                <div className="text-sm text-white">
                  {(() => {
                    const aqi = Number(data?.air_quality?.aqi) || 0;
                    if (aqi <= 50) return "🌿 Good air quality. Perfect for outdoor activities and exercise.";
                    if (aqi <= 100) return "🙂 Moderate air quality. Sensitive individuals may feel slight discomfort.";
                    if (aqi <= 150) return "😐 Poor air quality. Children, elderly, and people with breathing issues should limit outdoor exposure.";
                    if (aqi <= 200) return "😷 Unhealthy air. Avoid prolonged outdoor activities. Wear a mask if needed.";
                    if (aqi <= 300) return "🔥 Severe air pollution. Stay indoors as much as possible.";
                    return "☠️ Hazardous air quality! Avoid going outside. Use air purifiers if available.";
                  })()}
                </div>
              </div>

              {/* Dominant Pollutant - Full width banner (NOT a card in grid) */}
              {(() => {
                const pm25 = data.air_quality?.pm2_5 || 0;
                const pm10 = data.air_quality?.pm10 || 0;
                const co = data.air_quality?.carbon_monoxide || 0;
                const o3 = data.air_quality?.ozone || 0;
                const no2 = data.air_quality?.nitrogen_dioxide || 0;
                const so2 = data.air_quality?.sulphur_dioxide || 0;

                const pollutants = [
                  { name: 'PM2.5', value: pm25 },
                  { name: 'PM10', value: pm10 },
                  { name: 'CO', value: co },
                  { name: 'O₃', value: o3 },
                  { name: 'NO₂', value: no2 },
                  { name: 'SO₂', value: so2 },
                ];

                const dominant = pollutants.reduce((a, b) => a.value > b.value ? a : b);

                return (
                  <div className="bg-white/15 rounded-xl p-3 text-center text-shadow-DEFAULT">
                    <div className="text-xs text-gray-400 mb-1">Dominant Pollutant</div>
                    <div className="text-lg font-semibold text-amber-400">{dominant.name} · {dominant.value.toFixed(1)} μg/m³</div>
                  </div>
                );
              })()}

              {/* AQI Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 font-intertight font-light text-shadow-DEFAULT items-start">
                {/* PM2.5 Card */}
                {(() => {
                  const pm25 = data.air_quality?.pm2_5 || 0;
                  const getColor = (val) => {
                    if (val <= 12) return '🟢';
                    if (val <= 35.4) return '🟡';
                    if (val <= 55.4) return '🟠';
                    if (val <= 150.4) return '🔴';
                    if (val <= 250.4) return '🟣';
                    return '🟣';
                  };
                  const getHealth = (val) => {
                    if (val <= 12) return 'Good';
                    if (val <= 35.4) return 'Moderate';
                    if (val <= 55.4) return 'Unhealthy';
                    if (val <= 150.4) return 'Very Bad';
                    if (val <= 250.4) return 'Hazardous';
                    return 'Hazardous';
                  };
                  return (
                    <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                      <div className="text-xl mb-0.5">�</div>
                      <div className="text-sm font-semibold text-white leading-tight">{pm25.toFixed(1)} μg/m³</div>
                      <div className="text-lg leading-tight">{getColor(pm25)}</div>
                      <div className="text-[10px] text-gray-400 leading-tight">{getHealth(pm25)}</div>
                      <div className="text-xs text-gray-300 leading-tight">PM2.5</div>
                    </div>
                  );
                })()}

                {/* PM10 Card */}
                {(() => {
                  const pm10 = data.air_quality?.pm10 || 0;
                  const getColor = (val) => {
                    if (val <= 54) return '🟢';
                    if (val <= 154) return '🟡';
                    if (val <= 254) return '🟠';
                    if (val <= 354) return '🔴';
                    if (val <= 424) return '🟣';
                    return '🟣';
                  };
                  const getHealth = (val) => {
                    if (val <= 54) return 'Good';
                    if (val <= 154) return 'Moderate';
                    if (val <= 254) return 'Unhealthy';
                    if (val <= 354) return 'Very Bad';
                    if (val <= 424) return 'Hazardous';
                    return 'Hazardous';
                  };
                  return (
                    <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                      <div className="text-xl mb-0.5">🌪️</div>
                      <div className="text-sm font-semibold text-white leading-tight">{pm10.toFixed(1)} μg/m³</div>
                      <div className="text-lg leading-tight">{getColor(pm10)}</div>
                      <div className="text-[10px] text-gray-400 leading-tight">{getHealth(pm10)}</div>
                      <div className="text-xs text-gray-300 leading-tight">PM10</div>
                    </div>
                  );
                })()}

                {/* CO Card */}
                <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                  <div className="text-xl mb-0.5">☠️</div>
                  <div className="text-sm font-semibold text-white leading-tight">{(data.air_quality?.carbon_monoxide || 0).toFixed(0)} μg/m³</div>
                  <div className="text-[10px] text-gray-400 leading-tight">CO · Exhaust</div>
                  <div className="text-xs text-gray-300 leading-tight">CO</div>
                </div>

                {/* O₃ Card */}
                {data.air_quality?.ozone !== undefined && (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">🌍</div>
                    <div className="text-sm font-semibold text-white leading-tight">{data.air_quality.ozone.toFixed(1)} μg/m³</div>
                    <div className="text-[10px] text-gray-400 leading-tight">O<sub>3</sub> · Ozone</div>
                    <div className="text-xs text-gray-300 leading-tight">O₃</div>
                  </div>
                )}

                {/* NO₂ Card */}
                {data.air_quality?.nitrogen_dioxide !== undefined && (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">🚗</div>
                    <div className="text-sm font-semibold text-white leading-tight">{data.air_quality.nitrogen_dioxide.toFixed(1)} μg/m³</div>
                    <div className="text-[10px] text-gray-400 leading-tight">NO<sub>2</sub> · Traffic</div>
                    <div className="text-xs text-gray-300 leading-tight">NO₂</div>
                  </div>
                )}

                {/* SO₂ Card */}
                {data.air_quality?.sulphur_dioxide !== undefined && (
                  <div className="bg-white/10 rounded-xl p-3 text-center flex flex-col items-center justify-center h-24 w-full">
                    <div className="text-xl mb-0.5">🏭</div>
                    <div className="text-sm font-semibold text-white leading-tight">{data.air_quality.sulphur_dioxide.toFixed(1)} μg/m³</div>
                    <div className="text-[10px] text-gray-400 leading-tight">SO<sub>2</sub> · Industry</div>
                    <div className="text-xs text-gray-300 leading-tight">SO₂</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Data Source Info */}
        <div className="text-center text-xs text-gray-400 mb-2">
          Data from: {data.source}
          {data.weather?.sunrise_time && ' + Sunrise-Sunset.org'}
          {data.weather?.moon_phase_name && ' + Astronomical Calculation'}
          {' • Location: ' + (data.location_source === 'browser' ? 'Device GPS' : 'IP Address')}
          {data.refreshed && ' • Force Refreshed'}
        </div>

        {/* Location Display */}
        {(data.locationCity || data.locationRegion) && (
          <div className="text-center text-xs text-gray-400 mb-2">
            📍 {data.locationCity}{data.locationCity && data.locationRegion ? ', ' : ''}{data.locationRegion}
          </div>
        )}

        {/* Success message after refresh */}
        {weatherRefreshSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-3"
          >
            <div className="font-intertight inline-block bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium">
              ✅ Weather data refreshed successfully!
            </div>
          </motion.div>
        )}

        {/* Error message with retry button */}
        {weatherError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-3 flex items-center justify-center gap-3 flex-wrap"
          >
            <div className="font-intertight inline-block bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-sm font-medium">
              ⚠️ {weatherError}
            </div>
            <button
              onClick={handleGetWeatherInfo}
              disabled={loadingWeather}
              className="font-intertight text-sm font-medium px-3 py-2 rounded-xl bg-emerald-500/30 text-emerald-400 hover:bg-emerald-500/40 disabled:opacity-50 transition-colors"
            >
              {loadingWeather ? "Retrying..." : "Try Again"}
            </button>
          </motion.div>
        )}

        {/* Refresh button */}
        {showRefreshButton && (
          <div className="justify-center">
            <WeatherButton
              textMobile="Refresh Data"
              textDesktop="Refresh Weather & AQI Data"
              iconType="weather"
              onClick={() => fetchWeatherAndAqi(true)}
              loading={loadingWeather}
              expired={false}
            />
          </div>
        )}
      </div>
    ) : (
      <div className="mt-4 text-center">
        <div className="space-y-2">
          <div className="items-center">
            <WeatherButton
              textDesktop="Get Weather & Air Quality Info"
              textMobile="Get Weather Info"
              iconType="weather"
              onClick={handleGetWeatherInfo}
              loading={loadingWeather}
              expired={weatherRequested && data && isWeatherDataExpired()}
            />
          </div>
        </div>
      </div>
    )}
      {/* Weather expiry countdown */}
        <div className="text-center text-xs text-gray-400 mb-2">
          <WeatherCountdown
            weatherTimestamp={weatherTimestamp}
            onExpire={() => {
              setWeatherRequested(false);
              setData(null);
              setWeatherTimestamp(null);
              setShowRefreshButton(false);
            }}
          />
          {!showRefreshButton && (
            <RefreshCountdown
              weatherTimestamp={weatherTimestamp}
              onRefreshAvailable={handleRefreshAvailable}
            />
          )}
        </div>
        </motion.div>
    </div>
  );
};

export default React.memo(WeatherAqiSection);
