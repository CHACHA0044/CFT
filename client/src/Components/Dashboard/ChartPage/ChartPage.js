import React, { useState, useRef, useCallback, useEffect, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
import API from 'api/api';

// Hooks
import useChartData from './hooks/useChartData';
import useWeather from './hooks/useWeather';

// Eager-loaded sections (above fold)
import NavSection from './components/sections/NavSection';
import TotalEmissionsSection from './components/sections/TotalEmissionsSection';
import AnimatedHeadline from './components/AnimatedHeadline';

// Lazy infrastructure
import LazySection from './components/LazySection';
import ChartSkeleton from './components/skeletons/ChartSkeleton';
import LeaderboardSkeleton from './components/skeletons/LeaderboardSkeleton';
import WeatherSkeleton from './components/skeletons/WeatherSkeleton';
import SectionSkeleton from './components/skeletons/SectionSkeleton';

// Lazy-loaded sections (below fold)
const ComparisonChartSection = lazy(() => import('./components/sections/ComparisonChartSection'));
const PieChartSection = lazy(() => import('./components/sections/PieChartSection'));
const LeaderboardSection = lazy(() => import('./components/sections/LeaderboardSection'));
const YearlyProjectionSection = lazy(() => import('./components/sections/YearlyProjectionSection'));
const AchievementsSection = lazy(() => import('./components/sections/AchievementsSection'));
const WeatherAqiSection = lazy(() => import('./components/sections/WeatherAqiSection'));
const EmissionSimulatorSection = lazy(() => import('./components/sections/EmissionSimulatorSection'));
const GlobalComparisonSection = lazy(() => import('./components/sections/GlobalComparisonSection'));

const ChartPage = () => {
  useAuthRedirect();
  const location = useLocation();
  const navigate = useNavigate();

  // Data hooks
  const chartData = useChartData(location);
  const weather = useWeather();

  // UI state
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showECM, setShowECM] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedLeaderboardUser, setExpandedLeaderboardUser] = useState(null);
  const [expandedLeaderboardCategory, setExpandedLeaderboardCategory] = useState(null);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [logoutSuccess, setLogoutSuccess] = useState('');
  const [simTransport, setSimTransport] = useState(100);
  const [simDiet, setSimDiet] = useState(100);
  const [simElectricity, setSimElectricity] = useState(100);
  const [simWaste, setSimWaste] = useState(100);
  const [activePoint, setActivePoint] = useState(null);

  // Refs
  const leaderboardRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Derived
  const { leaderboard, processed, total, entryData, user, allEntries,
          comparison, pieData, yearly, yearlyChartData, projectionData,
          getDisplayError, setEntryData } = chartData;

  const displayedUsers = showAllLeaderboard ? leaderboard : leaderboard.slice(0, 10);
  const hasMore = leaderboard.length > 10;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // Handlers
  const handleLogout = useCallback(async () => {
    setLogoutError('');
    setLogoutSuccess('');
    setLogoutLoading(true);

    try {
      await API.post('/auth/logout');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('sessionToken');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('justVerified');
      setLogoutSuccess('✌ Logged out');
      setTimeout(() => { navigate('/home'); }, 600);
    } catch (err) {
      console.error('Logout error:', err);
      setLogoutError('❌ Logout failed');
    } finally {
      setLogoutLoading(false);
    }
  }, [navigate]);

  const handleLegendClick = useCallback((index) => {
    requestAnimationFrame(() => {
      setSelectedIndex(prev => (prev === index ? null : index));
    });
  }, []);

  // Click outside to deselect pie
  useEffect(() => {
    const handleClickOutside = () => { setSelectedIndex(null); };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Active point auto-clear
  useEffect(() => {
    if (activePoint) {
      const timer = setTimeout(() => setActivePoint(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [activePoint]);

  // Scroll to expanded leaderboard item
  useEffect(() => {
    if (expandedLeaderboardUser !== null && leaderboardRef.current) {
      const timer = setTimeout(() => {
        const items = leaderboardRef.current.querySelectorAll('[data-lb-item]');
        const expandedItem = items[expandedLeaderboardUser];
        if (expandedItem) {
          const rect = expandedItem.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          if (rect.bottom > viewportHeight * 0.7) {
            expandedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [expandedLeaderboardUser]);

  // Combined getDisplayError that includes weather errors
  const getDisplayErrorWithWeather = useCallback(() => {
    const baseError = getDisplayError();
    const weatherErr = weather.weatherError;

    if (!baseError && !weatherErr) return null;

    const errors = [];
    if (baseError) errors.push(baseError);
    if (weatherErr) errors.push({ message: weatherErr, isPersistent: false, count: 1 });

    if (errors.length >= 2) {
      const totalCount = errors.reduce((sum, e) => sum + (e.count || 1), 0);
      return {
        message: `Multiple system errors detected (${totalCount}). Please refresh the page to resolve.`,
        isPersistent: true,
        count: totalCount
      };
    }

    return errors[0] || null;
  }, [getDisplayError, weather.weatherError]);

  if (!processed) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-full">
          <AnimatedHeadline />
          <p>Loading emissions data...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{ touchAction: 'pan-y' }}
      className="min-h-screen text-white"
    >
      <PageWrapper backgroundImage="/images/chart-bk.webp" className="flex-1 flex flex-col">
        <NavSection
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          showECM={showECM}
          allEntries={allEntries}
          setEntryData={setEntryData}
          setShowECM={setShowECM}
          handleLogout={handleLogout}
          logoutLoading={logoutLoading}
          logoutSuccess={logoutSuccess}
          logoutError={logoutError}
        />

        <div className="max-w-4xl mx-auto sm:space-y-12 space-y-6 px-4 pt-4 pb-4">
          {/* Above fold - eager */}
          <TotalEmissionsSection
            processed={processed}
            total={total}
            showBreakdown={showBreakdown}
            setShowBreakdown={setShowBreakdown}
            expandedCategory={expandedCategory}
            setExpandedCategory={setExpandedCategory}
            entryData={entryData}
            getDisplayError={getDisplayErrorWithWeather}
          />

          {/* Below fold - lazy loaded with IntersectionObserver */}
          <LazySection fallback={ChartSkeleton} minHeight="450px">
            <ComparisonChartSection
              comparison={comparison}
              userName={user?.name?.split(' ')[0]}
              entryName={entryData?.name}
            />
          </LazySection>

          <LazySection fallback={ChartSkeleton} minHeight="450px">
            <PieChartSection
              pieData={pieData}
              selectedIndex={selectedIndex}
              handleLegendClick={handleLegendClick}
            />
          </LazySection>

          <LazySection fallback={LeaderboardSkeleton} minHeight="500px">
            <LeaderboardSection
              leaderboard={leaderboard}
              displayedUsers={displayedUsers}
              hasMore={hasMore}
              showAllLeaderboard={showAllLeaderboard}
              setShowAllLeaderboard={setShowAllLeaderboard}
              expandedLeaderboardUser={expandedLeaderboardUser}
              setExpandedLeaderboardUser={setExpandedLeaderboardUser}
              expandedLeaderboardCategory={expandedLeaderboardCategory}
              setExpandedLeaderboardCategory={setExpandedLeaderboardCategory}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              hoverTimeoutRef={hoverTimeoutRef}
              leaderboardRef={leaderboardRef}
              containerVariants={containerVariants}
            />
          </LazySection>

          {total && (
            <LazySection fallback={ChartSkeleton} minHeight="450px">
              <YearlyProjectionSection
                total={total}
                yearly={yearly}
                yearlyChartData={yearlyChartData}
                entryData={entryData}
                projectionData={projectionData}
              />
            </LazySection>
          )}

          <LazySection fallback={SectionSkeleton} minHeight="200px" className="hidden sm:block">
            <AchievementsSection
              processed={processed}
              yearly={yearly}
              leaderboard={leaderboard}
              user={user}
            />
          </LazySection>

          <LazySection fallback={WeatherSkeleton} minHeight="300px">
            <WeatherAqiSection
              data={weather.data}
              weatherRequested={weather.weatherRequested}
              loadingWeather={weather.loadingWeather}
              weatherTimestamp={weather.weatherTimestamp}
              showRefreshButton={weather.showRefreshButton}
              refreshCooldown={weather.refreshCooldown}
              weatherError={weather.weatherError}
              weatherRefreshSuccess={weather.weatherRefreshSuccess}
              expandedWeatherSection={weather.expandedWeatherSection}
              setExpandedWeatherSection={weather.setExpandedWeatherSection}
              pm25={weather.pm25}
              aqiGradient={weather.aqiGradient}
              weatherGradient={weather.weatherGradient}
              fetchWeatherAndAqi={weather.fetchWeatherAndAqi}
              handleGetWeatherInfo={weather.handleGetWeatherInfo}
              handleRefreshAvailable={weather.handleRefreshAvailable}
              isWeatherDataExpired={weather.isWeatherDataExpired}
              setWeatherRequested={weather.setWeatherRequested}
              setData={weather.setData}
              setWeatherTimestamp={weather.setWeatherTimestamp}
              setShowRefreshButton={weather.setShowRefreshButton}
            />
          </LazySection>

          <LazySection fallback={SectionSkeleton} minHeight="350px" className="hidden sm:block">
            <EmissionSimulatorSection
              processed={processed}
              total={total}
              simTransport={simTransport}
              setSimTransport={setSimTransport}
              simDiet={simDiet}
              setSimDiet={setSimDiet}
              simElectricity={simElectricity}
              setSimElectricity={setSimElectricity}
              simWaste={simWaste}
              setSimWaste={setSimWaste}
            />
          </LazySection>

          <LazySection fallback={SectionSkeleton} minHeight="300px">
            <GlobalComparisonSection
              total={total}
              userName={user?.name?.split(' ')[0]}
            />
          </LazySection>
        </div>
      </PageWrapper>
    </motion.div>
  );
};

export default ChartPage;
