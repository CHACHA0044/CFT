import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLoading } from 'context/LoadingContext';
import PageWrapper from 'common/PageWrapper';
const Home = ({ isLoggedIn, user }) => {
  const { setLoading } = useLoading(); 
  useEffect(() => {
}, []);

  return (
    <motion.div
            initial={{ x:100, opacity: 0}}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full h-full"
          >
    <PageWrapper backgroundImage="/images/home-bk.webp">
      <div className="w-full flex flex-col text-emerald-500 dark:text-gray-100 transition-colors duration-500 px-6 py-6 overflow-y-auto">
        {/* Header */}
        <header className="w-full fixed top-0 left-0 z-40 justify-between items-center px-6 py-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-green-800 dark:text-green-300">
            Carbon Footprint Tracker
          </div>

          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="text-sm font-medium hover:underline active:scale-75 rounded-lg">Login</Link>
                <Link to="/register" className="text-sm font-medium hover:underline active:scale-75 rounded-lg">Register</Link>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">Hi, {user?.name || 'User'}</span>
                <Link to="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
              </>
            )}
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 py-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            Your Carbon Story
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-6">
           Ever wondered your carbon footprint? Our Carbon Calculator makes it easy. Quick, clear, and actionable insights to help you live greener. Find out your impact and how to reduce it, starting today.
          </p>

          {!isLoggedIn ? (
            <p className="text-base italic text-emerald-700 dark:text-white rounded-xl shadow-lg transition duration-300">
              Please login to access the Carbon Calculator.
            </p>
          ) : (
            <Link
              to="/footprint"
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg rounded-xl shadow-lg transition duration-300"
            >
              Go to Carbon Calculator
            </Link>
          )}
        </main>

        {/* Footer 
        <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-base italic">
        Carbon down. Future up. v0.0.1
        </footer>*/}
      </div>
    </PageWrapper>
    </motion.div>
  );
};


export default Home;
