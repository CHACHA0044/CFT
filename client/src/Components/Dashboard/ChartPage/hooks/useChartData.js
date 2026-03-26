import { useState, useEffect, useMemo, useCallback } from 'react';
import API from 'api/api';
import calculateEmissions from 'utils/calculateEmissionsFrontend';
import { globalAverages, units } from '../constants';

const useChartData = (location) => {
  const [entryData, setEntryData] = useState(location.state?.entry || null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [error, setError] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [userInfoError, setUserInfoError] = useState(null);
  const [projectionData, setProjectionData] = useState([]);

  const processed = useMemo(() => {
    if (!entryData) return null;

    if (entryData.totalEmissionKg !== undefined &&
        entryData.foodEmissionKg !== undefined) {
      return {
        totalEmissionKg: entryData.totalEmissionKg,
        foodEmissionKg: entryData.foodEmissionKg,
        transportEmissionKg: entryData.transportEmissionKg,
        electricityEmissionKg: entryData.electricityEmissionKg,
        wasteEmissionKg: entryData.wasteEmissionKg
      };
    }

    return calculateEmissions(entryData);
  }, [entryData]);

  const total = processed?.totalEmissionKg;

  const values = {
    food: processed?.foodEmissionKg,
    transport: processed?.transportEmissionKg,
    electricity: processed?.electricityEmissionKg,
    waste: processed?.wasteEmissionKg,
  };

  const comparison = Object.keys(values).map(cat => ({
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    user: values[cat],
    global: globalAverages[cat]
  }));

  const pieData = Object.entries(values).map(([k, v]) => ({
    x: k.charAt(0).toUpperCase() + k.slice(1),
    y: v,
    unit: units[k.toLowerCase()] || 'kg',
    label: v != null ? `${k}: ${v.toFixed(1)} kg` : `${k}: No data`
  }));

  const yearly = total * 12;

  const yearlyChartData = useMemo(() => {
    if (!total) return [];
    const currentMonth = new Date(entryData?.createdAt || entryData?.updatedAt).getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (currentMonth + i) % 12;
      const cumulativeValue = total * (i + 1);
      return {
        month: i + 1,
        monthName: monthNames[monthIndex],
        fullMonthName: fullMonthNames[monthIndex],
        value: cumulativeValue / 1000,
        cumulativeKg: cumulativeValue
      };
    });
  }, [total, entryData?.createdAt, entryData?.updatedAt]);

  const entryId = typeof entryData?._id === "string" ? entryData._id : entryData?._id?.$oid || entryData?._id?.toString();

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/auth/token-info/me');
        setUser(res.data);
        sessionStorage.setItem('userName', res.data.name);
        setUserInfoError(null);
      } catch (err) {
        console.error('Failed to load user info:', err);
        setUserInfoError("Unable to load user information. Please refresh the page.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setUserInfoError(null), 5000);
      }
    };
    fetchUser();
  }, []);

  // Fetch all entries
  useEffect(() => {
    const fetchAllEntries = async () => {
      try {
        const res = await API.get('/footprint/history');
        const result = res.data;
        const entries = Array.isArray(result) ? result : result.history || [];
        const sortedEntries = entries.sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        setAllEntries(sortedEntries);
      } catch (err) {
        console.error('Failed to fetch entries:', err);
      }
    };
    fetchAllEntries();
  }, []);

  // Calculate projection data
  useEffect(() => {
    if (!total) return;
    const data = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: total + ((i) / 11) * (total * 12 - total)
    }));
    setProjectionData(data);
  }, [total]);

  // Fetch entry + leaderboard data
  useEffect(() => {
    if (!entryId) return;

    const controller = new AbortController();
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setError(null);

        const [entryRes, historyRes] = await Promise.all([
          API.get(`/footprint/${entryId}`, {
            withCredentials: true,
            signal: controller.signal
          }),
          API.get("/footprint/history", {
            withCredentials: true,
            signal: controller.signal
          })
        ]);

        if (!isMounted) return;

        setEntryData(entryRes.data);

        const sorted = [...historyRes.data].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        );

        const index = sorted.findIndex(e => e._id === entryRes.data._id);

        if (index !== -1) {
          const lbRes = await API.get(`/footprint/leaderboard-nth?n=${index}`, {
            withCredentials: true,
            signal: controller.signal
          });

          if (isMounted) {
            setLeaderboard(lbRes.data || []);
            setLeaderboardError(null);
          }
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") {
          setLeaderboardError("Failed to load leaderboard data. Please refresh the page.");
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setLeaderboardError(null), 5000);
        }
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [entryId]);

  // Error auto-clear effects
  useEffect(() => {
    const errorCount = [userInfoError, leaderboardError, error].filter(Boolean).length;
    if (leaderboardError && errorCount === 1) {
      const timer = setTimeout(() => setLeaderboardError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [leaderboardError, userInfoError, error]);

  useEffect(() => {
    const errorCount = [userInfoError, leaderboardError, error].filter(Boolean).length;
    if (userInfoError && errorCount === 1) {
      const timer = setTimeout(() => setUserInfoError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [userInfoError, leaderboardError, error]);

  useEffect(() => {
    const errorCount = [userInfoError, leaderboardError, error].filter(Boolean).length;
    if (error && errorCount === 1) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, userInfoError, leaderboardError]);

  // getDisplayError function
  const getDisplayError = useCallback(() => {
    const errors = [
      { priority: 1, message: userInfoError, type: 'user' },
      { priority: 2, message: leaderboardError, type: 'leaderboard' },
      { priority: 3, message: error, type: 'general' }
    ].filter(e => e.message);

    if (errors.length >= 2) {
      return {
        message: `Multiple system errors detected (${errors.length}). Please refresh the page to resolve.`,
        isPersistent: true,
        count: errors.length
      };
    }

    return errors.length > 0 ? {
      message: errors[0].message,
      isPersistent: false,
      count: 1
    } : null;
  }, [userInfoError, leaderboardError, error]);

  return {
    entryData,
    setEntryData,
    processed,
    user,
    leaderboard,
    allEntries,
    error,
    setError,
    leaderboardError,
    userInfoError,
    total,
    values,
    comparison,
    pieData,
    yearly,
    yearlyChartData,
    projectionData,
    entryId,
    getDisplayError,
  };
};

export default useChartData;
