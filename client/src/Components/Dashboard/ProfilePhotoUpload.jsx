import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, AlertCircle } from 'lucide-react';
import { UpdateButton, CancelButton } from 'Components/globalbuttons';

const ProfilePhotoUpload = ({ 
  currentPhoto, 
  onPhotoUpdate, 
  onPhotoDelete,
  userName = 'User'
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
   if (!urlPattern.test(imageUrl.trim())) {
     setError("Invalid image URL format (must end in .jpg .png etc)");
     return;
   }
    setUploading(true);
    setError('');

    try {
      // Just send the URL directly to backend
      await onPhotoUpdate(imageUrl.trim());
      
      setShowUrlInput(false);
      setImageUrl('');
    } catch (err) {
      setError(err.message || 'Failed to update photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowUrlInput(false);
    setImageUrl('');
    setError('');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Profile Picture Display */}
      <div className="relative group">
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 dark:border-gray-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-emerald-500 dark:border-gray-300">
            {userName?.charAt(0).toUpperCase() || '?'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-0 right-0 flex gap-2">
          <button
            onClick={() => setShowUrlInput(true)}
            disabled={uploading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Set image URL"
            type="button"
          >
            <Camera size={20} />
          </button>
          {currentPhoto && (
            <button
              onClick={onPhotoDelete}
              disabled={uploading}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete photo"
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && !showUrlInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-2 max-w-sm"
        >
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {/* URL Input Modal */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 font-intertight text-shadow-DEFAULT tracking-wide bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Enter Image URL
              </h3>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Link to your eco-friendly avatar 🌱"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && imageUrl.trim()) {
                    handleUrlSubmit();
                  }
                }}
              />

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                ℹ️ Paste any image URL. Supported: JPG, PNG, GIF, WEBP, SVG
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300 text-center">{error}</p>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <CancelButton onClick={handleCancel} disabled={uploading} />
                <UpdateButton onClick={handleUrlSubmit} disabled={uploading || !imageUrl.trim()} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePhotoUpload;