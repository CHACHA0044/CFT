import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardButton, NewEntryButton, EditDeleteButton, LogoutButton, VisualizeButton } from 'Components/globalbuttons';

const CardNav = lazy(() => import('Components/CardNav'));
const LottieLogo = lazy(() => import('Components/LottieLogoComponent'));

const NavSkeleton = () => (
  <div className="w-10 h-10 bg-gray-500 rounded-full animate-pulse" />
);

const NavSection = React.memo(({
  isMenuOpen,
  setIsMenuOpen,
  showECM,
  allEntries,
  setEntryData,
  setShowECM,
  handleLogout,
  logoutLoading,
  logoutSuccess,
  logoutError,
}) => {
  return (
    <div className="w-auto px-0">
      <Suspense fallback={<NavSkeleton />}>
        <CardNav
          logo={
            <Suspense fallback={<NavSkeleton />}>
              <LottieLogo isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
            </Suspense>
          }
          logoAlt="Animated Menu"
          menuColor="bg-white/20 dark:bg-gray-800/70"
          logoSize="w-25 h-25"
          isMenuOpen={isMenuOpen}
          onToggleMenu={setIsMenuOpen}
        >
          <div className="relative w-full flex flex-col justify-center items-center gap-4 sm:gap-6 mt-2 mb-0">
            <AnimatePresence>
              {showECM && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-16 bg-emerald-500/90 dark:bg-black text-white px-2 py-2 rounded-xl shadow-lg text-shadow-DEFAULT text-sm font-intertight text-center z-50"
                >
                  <div className="flex items-center gap-2">
                    <span>Entry changed! Close menu to view it</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <DashboardButton className="w-40" />
            <NewEntryButton className="w-40" />
            {allEntries.length > 1 && (
              <VisualizeButton
                entries={allEntries}
                onClick={(entry) => {
                  setEntryData(entry);
                  setShowECM(true);
                  setTimeout(() => { setShowECM(false); }, 5000);
                }}
                className="w-40"
              />
            )}
            <EditDeleteButton className="w-40" />
            <LogoutButton
              onLogout={handleLogout}
              loading={logoutLoading}
              success={logoutSuccess}
              error={logoutError}
              className="w-40"
            />
          </div>
        </CardNav>
      </Suspense>
    </div>
  );
});

export default NavSection;
