import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from 'common/PageWrapper';
import API from 'api/api';
import useAuthRedirect from 'hooks/useAuthRedirect';
import { NewEntryButton, LogoutButton, DashboardButton, FeedbackButton, ProfileEditButton, UpdateButton, CancelButton } from 'Components/globalbuttons';
import CardNav from 'Components/CardNav';  
import LottieLogo from 'Components/LottieLogoComponent';
import ProfilePhotoUpload from './ProfilePhotoUpload';

const sentence = "Your Profile";
const words = sentence.split(" ");

const getLetterVariants = () => ({
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

const AnimatedHeadline = React.memo(() => {
  const [activeBurstIndex, setActiveBurstIndex] = useState(null);
  const [bursting, setBursting] = useState(false);
  const [fallingLetters, setFallingLetters] = useState([]);

  const triggerBurst = (index) => {
    setActiveBurstIndex(index);
    setBursting(true);
    setTimeout(() => {
      setBursting(false);
      setActiveBurstIndex(null);
    }, 1800);
  };

  return (
    <div className="relative overflow-visible w-full flex justify-center items-center mt-2 mb-4 px-4">
      <motion.div
        className="flex flex-wrap justify-center gap-3 text-4xl sm:text-6xl md:text-8xl font-black font-germania tracking-widest text-shadow-DEFAULT text-emerald-500 dark:text-white transition-colors duration-500"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3,
            },
          },
        }}
      >
        {words.map((word, wordIndex) => (
          <motion.span
            key={wordIndex}
            onMouseEnter={() => {
              if (!bursting && activeBurstIndex === null) triggerBurst(wordIndex);
            }}
            onClick={() => {
              if (!bursting && activeBurstIndex === null) triggerBurst(wordIndex);
            }}
            className="relative inline-block cursor-pointer"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {word.split("").map((char, i) => {
              const allChars = sentence.replace(/\s/g, "").split("");
              const charIndex = allChars.findIndex(
                (_, idx) => idx === i + words.slice(0, wordIndex).join("").length
              );

              const isBursting = activeBurstIndex === wordIndex;
              const randomDelay = Math.random() * 0.5 + i * 0.05;

              return (
                <AnimatePresence key={`${char}-${i}`}>
                  <motion.span
                    className="inline-block relative"
                    initial={{
                      x: 0,
                      y: 0,
                      rotate: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    animate={
                      isBursting
                        ? {
                            x: Math.random() * 80 - 40,
                            y: Math.random() * 60 - 30,
                            rotate: Math.random() * 180 - 90,
                            opacity: [1, 0],
                            scale: [1, 1.2, 0.4],
                            transition: {
                              duration: 0.8,
                              delay: randomDelay,
                              ease: "easeOut",
                            },
                          }
                        : fallingLetters.includes(charIndex)
                        ? "reenter"
                        : "initial"
                    }
                    variants={getLetterVariants()}
                  >
                    {char}
                    {isBursting && (
                      <span className="absolute top-1/2 left-1/2 z-[-1]">
                        {[...Array(5)].map((_, j) => {
                          const confX = Math.random() * 30 - 15;
                          const confY = Math.random() * 30 - 15;
                          return (
                            <motion.span
                              key={j}
                              className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                              initial={{ opacity: 1, scale: 1 }}
                              animate={{
                                x: confX,
                                y: confY,
                                opacity: [1, 0],
                                scale: [1, 0.4],
                              }}
                              transition={{
                                duration: 0.6,
                                delay: randomDelay,
                                ease: "easeOut",
                              }}
                            />
                          );
                        })}
                      </span>
                    )}
                  </motion.span>
                </AnimatePresence>
              );
            })}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
});

const ProfilePage = () => {
  useAuthRedirect();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // User data state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const animatedHeadline = useMemo(() => <AnimatedHeadline />, []);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // UI states
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [logoutSuccess, setLogoutSuccess] = useState('');
  
  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  // // Debug useEffect to track user state changes
  // useEffect(() => {
  //   console.log('🔄 User state changed:', user);
  //   if (user) {
  //     console.log('📊 User metrics:', {
  //       totalEntries: user.totalEntries,
  //       daysSinceJoined: user.daysSinceJoined,
  //       feedbackGiven: user.feedbackGiven,
  //       verified: user.verified
  //     });
  //   }
  // }, [user]);

  const handleLogout = async () => {
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

      setTimeout(() => {
        navigate('/home');
      }, 600);
    } catch (err) {
      console.error('Logout error:', err);
      setLogoutError('❌ Logout failed');
    } finally {
      setLogoutLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      if (!user) {
        setLoading(true);
      }
      
      //console.log('🔍 Fetching profile...');
      const res = await API.get('/profile/me');
      
      //console.log('📦 Full API response:', res.data);
      
      const userData = res.data;
      
      // profile data with all fields
      const profileData = {
        name: userData.name || '',
        email: userData.email || '',
        verified: userData.verified ?? false,
        provider: userData.provider || 'email',
        profilePicture: userData.profilePicture || null,
        bio: userData.bio || '',
        profileLastUpdated: userData.profileLastUpdated,
        memberSince: userData.memberSince || userData.createdAt,
        feedbackGiven: userData.feedbackGiven ?? false,
        totalEntries: userData.totalEntries ?? 0,
        daysSinceJoined: userData.daysSinceJoined ?? 0,
        createdAt: userData.createdAt,
        fromCache: userData.fromCache
      };
      
     // console.log('✅ Processed profile data:', profileData);
      
      // Set all states
      setUser(profileData);
      setName(profileData.name);
      setBio(profileData.bio);
      setProfilePicture(profileData.profilePicture);
      
      setError('');
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdate = async (imageUrl) => {
    try {
      setSaveLoading(true);
      setPhotoError('');
      
      await API.patch('/profile/update-photo-url', {
        photoUrl: imageUrl
      });
      
      setProfilePicture(imageUrl);
      await fetchProfile();
      showSuccess('Profile photo updated!');
    } catch (err) {
      console.error('Photo URL update error:', err);
      throw new Error(err.response?.data?.error || 'Failed to update photo URL');
    } finally {
      setSaveLoading(false);
    }
  };

  const openDeleteConfirm = () => setShowDeleteConfirm(true);
  const cancelDeleteConfirm = () => setShowDeleteConfirm(false);

  const handlePhotoDelete = async () => {
    try {
      setSaveLoading(true);
      await API.delete('/profile/delete-photo');
      setProfilePicture(null);
      await fetchProfile();
      showSuccess("Profile photo removed");
    } catch (err) {
      setPhotoError("Failed to delete photo");
    } finally {
      setSaveLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaveLoading(true);
      setError('');

      // Update name if changed
      if (name.trim() !== user?.name) {
        if (!name.trim()) {
          setError('Name cannot be empty');
          setSaveLoading(false);
          return;
        }
        await API.patch('/profile/update-name', { name: name.trim() });
        sessionStorage.setItem('userName', name.trim());
      }

      // Update bio if changed
      if (bio !== user?.bio) {
        await API.patch('/profile/update-bio', { bio });
      }

      // Refresh profile data
      await fetchProfile();
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setBio(user?.bio || '');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <PageWrapper backgroundImage="/images/dashboard-bk.webp">
        <motion.div
          className="flex items-center justify-center min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xl text-emerald-600 dark:text-white">
            Loading profile...
          </p>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full h-full"
    >
      <PageWrapper backgroundImage="/images/profile-bk.webp">
        <div className="w-full max-w-3xl mx-auto px-4 py-4 font-intertight tracking-wide text-shadow-DEFAULT">
          <CardNav
            logo={<LottieLogo isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />}
            logoAlt="Animated Menu"
            menuColor="bg-white/20 dark:bg-gray-800/70"
            logoSize="w-25 h-25"
            isMenuOpen={isMenuOpen}
            onToggleMenu={setIsMenuOpen}
          >
            <NewEntryButton className="w-40" />
            <DashboardButton className="w-40" />
            <LogoutButton onLogout={handleLogout} loading={logoutLoading} success={logoutSuccess} error={logoutError} className="w-40" />
          </CardNav>

          <div id="app-container" className="w-auto px-0">
            {animatedHeadline}

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg"
                >
                  ✅ {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
                ❌ {error}
              </div>
            )}

            {/* Profile Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/20 dark:bg-gray-800/80 rounded-3xl p-8 shadow-xl"
            >
              {/* Profile Picture Section */}
              <div className="mb-8">
                <ProfilePhotoUpload 
                  currentPhoto={profilePicture} 
                  onPhotoUpdate={handlePhotoUpdate} 
                  onPhotoDelete={openDeleteConfirm} 
                  userName={user?.name} 
                />
                {photoError && (
                  <p className="text-red-500 text-sm mt-3 text-center">{photoError}</p>
                )}
              </div>

              {/* Name Section */}
              <div className="mb-6">
                <label className="block text-emerald-600 dark:text-white font-semibold mb-2">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    className="w-full px-4 py-2 text-shadow-DEFAULT tracking-wide font-intertight rounded-lg bg-white/50 dark:bg-gray-700/50 text-emerald-900 dark:text-white border border-emerald-300 dark:border-gray-600"
                    placeholder="Your name"
                  />
                ) : (
                  <p className="text-lg text-emerald-900 dark:text-gray-100">
                    {user?.name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="mb-6">
                <label className="block text-emerald-600 dark:text-white font-semibold mb-2">
                  Email
                </label>
                <p className="text-lg text-emerald-900 dark:text-gray-100">
                  {user?.email}
                </p>
              </div>

              {/* Bio Section */}
              <div className="mb-6">
                <label className="block text-emerald-600 dark:text-white font-semibold mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="px-4 font-intertight text-shadow-DEFAULT tracking-wide py-2 rounded-lg bg-white/50 dark:bg-gray-700/50 text-emerald-900 dark:text-white border border-emerald-300 dark:border-gray-600"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {bio.length}/500 characters
                    </div>
                  </div>
                ) : (
                  <p className="text-emerald-900 dark:text-gray-100 whitespace-pre-wrap">
                    {user?.bio || 'No bio yet'}
                  </p>
                )}
              </div>

              {/* Edit/Save Buttons */}
              <div className="flex justify-center gap-3 mt-8 mb-6">
                {isEditing ? (
                  <>
                    <UpdateButton 
                      onClick={handleSaveAll}
                      disabled={saveLoading}
                    />
                    <CancelButton onClick={handleCancelEdit} />
                  </>
                ) : (
                  <ProfileEditButton onClick={() => setIsEditing(true)} />
                )}
              </div>

              {/* Account Insights */}
              <div className="pt-6 border-t text-shadow-DEFAULT font-intertight tracking-wide border-emerald-300 dark:border-gray-600 space-y-4">
                <h3 className="text-lg font-bold text-emerald-600 dark:text-white mb-3">
                  Account Insights
                </h3>
                
                {/* Grid Layout for Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Entries */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-emerald-50 dark:bg-gray-700/50 rounded-xl p-4 border border-emerald-200 dark:border-gray-600"
                  >
                    <div className="text-3xl mb-1">📝</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {user?.totalEntries ?? 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Entries
                    </div>
                  </motion.div>

                  {/* Days Active */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-50 dark:bg-gray-700/50 rounded-xl p-4 border border-blue-200 dark:border-gray-600"
                  >
                    <div className="text-3xl mb-1">📅</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {user?.daysSinceJoined ?? 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Days Active
                    </div>
                  </motion.div>

                  {/* Feedback Status */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-xl p-4 border ${
                      user?.feedbackGiven
                        ? 'bg-green-50 dark:bg-gray-700/50 border-green-200 dark:border-gray-600'
                        : 'bg-orange-50 dark:bg-gray-700/50 border-orange-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-1">
                      {user?.feedbackGiven ? '✅' : '💬'}
                    </div>
                    <div className={`text-lg font-bold ${
                      user?.feedbackGiven
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {user?.feedbackGiven ? 'Given' : 'Pending'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Feedback
                    </div>
                  </motion.div>

                  {/* Account Status */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-purple-50 dark:bg-gray-700/50 rounded-xl p-4 border border-purple-200 dark:border-gray-600"
                  >
                    <div className="text-3xl mb-1">
                      {user?.verified ? '✓' : '⏳'}
                    </div>
                    <div className={`text-lg font-bold ${
                      user?.verified
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {user?.verified ? 'Verified' : 'Pending'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </div>
                  </motion.div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="text-lg">🔐</span>
                    <span>Provider: <strong>{user?.provider === 'google' ? 'Google' : 'Email'}</strong></span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="text-lg">🎂</span>
                    <span>Member since: <strong>{user?.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}</strong></span>
                  </p>
                  {user?.profileLastUpdated && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="text-lg">🔄</span>
                      <span>Last updated: <strong>{new Date(user.profileLastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                    </p>
                  )}
                </div>

                {/* Activity Insights */}
                {user?.totalEntries > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-gray-700/30 dark:to-gray-700/30 rounded-xl border border-emerald-200 dark:border-gray-600"
                  >
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                      🌱 Environmental Impact Tracker
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      You've logged {user.totalEntries} {user.totalEntries === 1 ? 'entry' : 'entries'} in {user.daysSinceJoined} {user.daysSinceJoined === 1 ? 'day' : 'days'}.
                      {user.totalEntries > 0 && user.daysSinceJoined > 0 && (
                        <span className="ml-1">
                          That's an average of <strong>{(user.totalEntries / user.daysSinceJoined).toFixed(2)}</strong> entries per day! 🎯
                        </span>
                      )}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Delete Photo Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div 
                className="fixed inset-0 bg-black/60 font-intertight text-shadow-DEFAULT tracking-wide backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="bg-gray-900/90 p-6 rounded-xl w-[90%] max-w-sm text-center border border-white/10 shadow-xl"
                  initial={{ scale: 0.9 }} 
                  animate={{ scale: 1 }} 
                  exit={{ scale: 0.9 }}
                >
                  <h2 className="text-lg font-bold text-white mb-2">Delete Profile Photo?</h2>
                  <p className="text-gray-300 text-sm mb-5">This cannot be undone.</p>

                  <div className="flex justify-center gap-3">
                    <CancelButton onClick={cancelDeleteConfirm} />
                    <UpdateButton 
                      onClick={handlePhotoDelete}
                      disabled={saveLoading}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center mt-6">
            <FeedbackButton userEmail={user?.email} />
          </div>
        </div>
      </PageWrapper>
    </motion.div>
  );
};

export default ProfilePage;