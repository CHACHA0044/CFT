import { useState, useCallback, useRef, useEffect } from 'react';
import API from 'api/api';
import { getAqiGradient, getWeatherGradient } from '../utils';

const useWeather = () => {
  const [data, setData] = useState(null);
  const [weatherRequested, setWeatherRequested] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherTimestamp, setWeatherTimestamp] = useState(() => {
    const stored = sessionStorage.getItem('weatherTimestamp');
    return stored ? parseInt(stored) : null;
  });
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherRefreshSuccess, setWeatherRefreshSuccess] = useState(false);
  const [expandedWeatherSection, setExpandedWeatherSection] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchWeatherDebounced = useRef(null);

  const pm25 = data?.air_quality?.pm2_5 ?? 0;
  const aqiGradient = getAqiGradient(pm25);

  const weatherGradient = data?.weather
    ? getWeatherGradient(
        data.weather.weather_code || 0,
        data.air_quality?.uv_index || 0,
        data.weather.visibility || 10,
        data.weather.temperature_2m || 20
      )
    : "bg-gradient-to-r from-indigo-400/20 via-blue-500/15 to-slate-500/20";

  const fetchWeatherAndAqi = useCallback(async (forceRefresh = false) => {
    setLoadingWeather(true);
    let lat, lon;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Geolocation timeout")), 10000);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              clearTimeout(timer);
              resolve(position);
            },
            (err) => {
              clearTimeout(timer);
              reject(err);
            }
          );
        });

        lat = Math.round(pos.coords.latitude * 100) / 100;
        lon = Math.round(pos.coords.longitude * 100) / 100;
      } catch (err) {
        console.warn("Geolocation unavailable, using IP location");
      }
    }

    try {
      const params = new URLSearchParams();
      if (lat && lon) {
        params.append("lat", lat);
        params.append("lon", lon);
      }

      if (forceRefresh) {
        params.append("refresh", "true");
      }

      const queryString = params.toString();

      const res = await API.get(`/auth/weather-aqi?${queryString}`, {
        headers: { "x-api-key": process.env.INTERNAL_API_KEY }
      });

      setData(res.data);
      setWeatherRequested(true);

      const backendTimestamp = res.data.timestamp ? new Date(res.data.timestamp).getTime() : Date.now();
      setWeatherTimestamp(backendTimestamp);
      sessionStorage.setItem('weatherTimestamp', backendTimestamp.toString());

      if (forceRefresh) {
        setShowRefreshButton(false);
        setRefreshCooldown(600);

        setWeatherRefreshSuccess(true);
        setTimeout(() => {
          setWeatherRefreshSuccess(false);
        }, 3000);
      }

      if (res.data.refreshAllowedIn !== undefined) {
        setRefreshCooldown(res.data.refreshAllowedIn);
      } else {
        setRefreshCooldown(0);
      }
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      setWeatherError("Unable to fetch weather data. Please try again later.");
      setTimeout(() => setWeatherError(null), 8000);
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  const handleGetWeatherInfo = useCallback(async () => {
    if (loadingWeather) return;

    if (fetchWeatherDebounced.current) {
      clearTimeout(fetchWeatherDebounced.current);
    }

    fetchWeatherDebounced.current = setTimeout(async () => {
      await fetchWeatherAndAqi();
    }, 300);
  }, [loadingWeather, fetchWeatherAndAqi]);

  const handleRefreshAvailable = useCallback(() => {
    setShowRefreshButton(true);
  }, []);

  const isWeatherDataExpired = useCallback(() => {
    if (!weatherTimestamp) return true;
    const thirtyMinutes = 30 * 60 * 1000;
    return (currentTime - weatherTimestamp) > thirtyMinutes;
  }, [weatherTimestamp, currentTime]);

  // Weather error auto-clear (8 seconds to give users time to read)
  useEffect(() => {
    if (weatherError) {
      const timer = setTimeout(() => setWeatherError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [weatherError]);

  // Update currentTime every 60 seconds for reactive expiry detection
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    setData,
    weatherRequested,
    setWeatherRequested,
    loadingWeather,
    weatherTimestamp,
    setWeatherTimestamp,
    showRefreshButton,
    setShowRefreshButton,
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
  };
};

export default useWeather;
