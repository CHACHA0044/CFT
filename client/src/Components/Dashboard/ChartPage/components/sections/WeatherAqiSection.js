import React from 'react';
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
        <div className="text-sm font-intertight font-extralight text-shadow-DEFAULT sm:text-2xl mb-2">
          {(() => {
            const code = data.weather?.weather_code || 0;
            const uvIndex = data.air_quality?.uv_index || 0;
            const visibility = data.weather?.visibility || 10;

            const isFogCode = (code >= 45 && code <= 48) || code === 2100;
            const isFoggy = isFogCode && visibility < 1.5 && uvIndex < 2;

            if (isFoggy) return '🌫️';
            if (code === 0) return uvIndex > 3 ? '☀️' : '🌙';
            if (code <= 3) return uvIndex > 2 ? '⛅' : '☁️';
            if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
            if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '❄️';
            if (code >= 95 && code <= 99) return '⛈️';
            return uvIndex > 3 ? '🌤️' : '☁️';
          })()}
          {(() => {
            const code = data.weather?.weather_code || 0;
            const uvIndex = data.air_quality?.uv_index || 0;
            const visibility = data.weather?.visibility || 10;

            const isFogCode = (code >= 45 && code <= 48) || code === 2100;
            const isFoggy = isFogCode && visibility < 1.5 && uvIndex < 2;

            if (isFoggy) return 'Foggy conditions';
            if (code === 0) return uvIndex > 3 ? 'Clear and sunny' : 'Clear night';
            if (code <= 3) return uvIndex > 2 ? 'Partly cloudy' : 'Cloudy';
            if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rainy weather';
            if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow expected';
            if (code >= 95 && code <= 99) return 'Thunderstorm';
            return uvIndex > 3 ? 'Fair weather' : 'Overcast';
          })()}, {data.weather?.temperature_2m || 'N/A'}°C
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
            <div className="grid grid-rows-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-intertight font-light text-shadow-DEFAULT">
              {/* Temperature */}
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🌡️</div>
                <div className="text-lg font-semibold text-white">{data.weather?.temperature_2m || 'N/A'}°C</div>
                <div className="text-xs text-gray-300">Temperature</div>
              </div>

              {/* Feels Like */}
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">
                  {data.weather?.apparent_temperature !== undefined ? (
                    data.weather.apparent_temperature < 0 ? "🥶" :
                    data.weather.apparent_temperature < 10 ? "❄️" :
                    data.weather.apparent_temperature < 20 ? "🧥" :
                    data.weather.apparent_temperature < 30 ? "😊" :
                    data.weather.apparent_temperature < 40 ? "🫠" : "🥵"
                  ) : "🌡️"}
                </div>
                <div className="text-lg font-semibold text-white">
                  {data.weather?.apparent_temperature !== undefined ? `${data.weather.apparent_temperature}°C` : "N/A"}
                </div>
                <div className="text-xs text-gray-300">Feels Like</div>
              </div>

              {/* Wind Speed */}
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">💨</div>
                <div className="text-lg font-semibold text-white">{data.weather?.windspeed_10m?.toFixed(1) || 'N/A'} km/h</div>
                <div className="text-xs text-gray-300">Wind Speed</div>
              </div>

              {/* Humidity */}
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">💧</div>
                <div className="text-lg font-semibold text-white">{data.weather?.relative_humidity_2m || 'N/A'}%</div>
                <div className="text-xs text-gray-300">Humidity</div>
              </div>

              {/* Visibility */}
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">👁️</div>
                <div className="text-lg font-semibold text-white">{data.weather?.visibility || 'N/A'} km</div>
                <div className="text-xs text-gray-300">Visibility</div>
              </div>

              {/* UV Index */}
              {getTimeOfDay() === 'day' && data.air_quality?.uv_index !== undefined && data.air_quality.uv_index > 0 && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">☀️</div>
                  <div className="text-lg font-semibold text-white">{data.air_quality.uv_index}</div>
                  <div className="text-xs text-gray-300">UV Index</div>
                </div>
              )}

              {/* Sunrise */}
              {data.weather?.sunrise_time && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🌅</div>
                  <div className="text-lg font-semibold text-white">
                    {new Date(data.weather.sunrise_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="text-xs text-gray-300">Sunrise</div>
                </div>
              )}

              {/* Sunset */}
              {data.weather?.sunset_time && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🌇</div>
                  <div className="text-lg font-semibold text-white">
                    {new Date(data.weather.sunset_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="text-xs text-gray-300">Sunset</div>
                </div>
              )}

              {/* Moon Phase */}
              {getTimeOfDay() === "night" && data.weather?.moonPhase && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{data.weather.moonPhase.emoji}</div>
                  <div className="text-lg font-semibold text-white">{data.weather.moonPhase.name}</div>
                  <div className="text-xs text-gray-300">{data.weather.moonPhase.illumination}% illuminated</div>
                </div>
              )}

              {/* Rain Intensity */}
              {data.weather?.rain_intensity !== undefined && data.weather.rain_intensity > 0 && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">
                    {data.weather.rain_intensity < 0.5 ? '🌦️' :
                    data.weather.rain_intensity < 2 ? '🌧️' :
                    data.weather.rain_intensity < 10 ? '⛈️' : '🌊'}
                  </div>
                  <div className="text-lg font-semibold text-white">{data.weather.rain_intensity.toFixed(1)} mm/h</div>
                  <div className="text-xs text-gray-300">
                    {data.weather.rain_intensity < 0.5 ? 'Light Drizzle' :
                    data.weather.rain_intensity < 2 ? 'Moderate Rain' :
                    data.weather.rain_intensity < 10 ? 'Heavy Rain' : 'Very Heavy Rain'}
                  </div>
                </div>
              )}

              {/* Precipitation Type */}
              {data.weather?.precipitation_type && data.weather.precipitation_type !== "None" && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">☔</div>
                  <div className="text-lg font-semibold text-white">{data.weather.precipitation_type}</div>
                  <div className="text-xs text-gray-300">Precipitation</div>
                </div>
              )}

              {/* Precipitation Probability */}
              {data.weather?.precipitation_probability !== undefined &&
              data.weather.precipitation_probability > 10 && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-lg font-semibold text-white">{data.weather.precipitation_probability}%</div>
                  <div className="text-xs text-gray-300">Rain Probability</div>
                </div>
              )}

              {/* Pressure Sea Level */}
              {data.weather?.pressure_sea_level !== undefined &&
              data.weather.rain_intensity > 0.3 && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🌊</div>
                  <div className="text-lg font-semibold text-white">{data.weather.pressure_sea_level.toFixed(1)} hPa</div>
                  <div className="text-xs text-gray-300">Sea Level Pressure</div>
                </div>
              )}

              {/* Pressure Surface Level */}
              {data.weather?.pressure_surface_level !== undefined &&
              data.weather.rain_intensity > 0.3 && (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">📍</div>
                  <div className="text-lg font-semibold text-white">{data.weather.pressure_surface_level.toFixed(1)} hPa</div>
                  <div className="text-xs text-gray-300">Surface Pressure</div>
                </div>
              )}
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

              {/* Air Quality Metrics Grid */}
              <div className="grid sm:grid-cols-3 gap-3 grid-rows-1 font-intertight font-light text-shadow-DEFAULT">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🔬</div>
                  <div className="text-lg font-semibold text-white">{data.air_quality?.pm2_5?.toFixed(1) || 'N/A'} μg/m³</div>
                  <div className="text-xs text-gray-300">PM2.5</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🌪️</div>
                  <div className="text-lg font-semibold text-white">{data.air_quality?.pm10?.toFixed(1) || 'N/A'} μg/m³</div>
                  <div className="text-xs text-gray-300">PM10</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">☠️</div>
                  <div className="text-lg font-semibold text-white">{data.air_quality?.carbon_monoxide?.toFixed(0) || 'N/A'} μg/m³</div>
                  <div className="text-xs text-gray-300">Carbon Monoxide</div>
                </div>
                {data.air_quality?.ozone && (
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🌍</div>
                    <div className="text-lg font-semibold text-white">{data.air_quality.ozone.toFixed(1)} μg/m³</div>
                    <div className="text-xs text-gray-300">Ozone</div>
                  </div>
                )}
                {data.air_quality?.nitrogen_dioxide && (
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🚗</div>
                    <div className="text-lg font-semibold text-white">{data.air_quality.nitrogen_dioxide.toFixed(1)} μg/m³</div>
                    <div className="text-xs text-gray-300">NO₂</div>
                  </div>
                )}
                {data.air_quality?.sulphur_dioxide && (
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🏭</div>
                    <div className="text-lg font-semibold text-white">{data.air_quality.sulphur_dioxide.toFixed(1)} μg/m³</div>
                    <div className="text-xs text-gray-300">SO₂</div>
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
