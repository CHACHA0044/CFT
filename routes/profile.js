const express = require('express');
const User = require('../models/user');
const CarbonEntry = require('../models/CarbonEntry');
const authenticateToken = require('../middleware/authmiddleware');
const redisClient = require('../RedisClient');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// HELPER FUNCTIONS FOR REDIS CACHING
const getCachedData = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      const ttl = await redisClient.ttl(key);
      return { data: JSON.parse(data), ttl };
    }
    return null;
  } catch (err) {
    console.error(`[REDIS READ ERROR] Key: ${key}`, err.message);
    return null;
  }
};

const setCachedData = async (key, data, ttl) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`[REDIS WRITE ERROR] Key: ${key}`, err.message);
    return false;
  }
};

const deleteKey = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.error(`[REDIS DELETE ERROR] Key: ${key}`, err.message);
    return false;
  }
};

// Image URL validation helper
const validateImageUrl = (url) => {
  try {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'Invalid URL format' };
    }

    if (url.length > 2048) {
      return { valid: false, error: 'URL too long (max 2048 characters)' };
    }

    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs allowed' };
    }

    const hostname = parsed.hostname.toLowerCase();
    const blockedPatterns = [
      'localhost', '127.0.0.1', '0.0.0.0', '[::]', '::1',
      '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.',
      '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.',
      '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.',
      'metadata'
    ];

    if (blockedPatterns.some(pattern => hostname.includes(pattern))) {
      return { valid: false, error: 'Internal/private URLs not allowed' };
    }

    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext => 
      parsed.pathname.toLowerCase().endsWith(ext)
    );

    const trustedDomains = ['imgur.com', 'cloudinary.com', 'unsplash.com'];
    const isTrustedDomain = trustedDomains.some(domain => 
      hostname.includes(domain)
    );

    if (!hasValidExtension && !isTrustedDomain) {
      return { 
        valid: false, 
        error: 'URL must point to an image file (.jpg, .png, .gif, .webp, .svg)' 
      };
    }

    parsed.hash = '';
    const sanitizedUrl = parsed.toString();

    return { valid: true, sanitizedUrl };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Rate limiter for profile updates
const profileUpdateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Too many profile updates. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// GET PROFILE
router.get('/me', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  console.log('\n👤 [/profile/me] Request received');

  try {
    const userId = req.user.userId;
    const cacheKey = `user:profile:${userId}`;
    
    // Check cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
      const responseTime = Date.now() - startTime;
      console.log(`⚡ [RESPONSE] Profile from cache in ${responseTime}ms`);
      console.log('📦 Cached data:', JSON.stringify(cached.data, null, 2));
      return res.json({
        ...cached.data,
        fromCache: true,
        cacheTTL: cached.ttl,
        responseTime: `${responseTime}ms`
      });
    }

    // Fetch from database
    console.log(`🔍 [DATABASE] Fetching profile...`);
    const user = await User.findById(userId).select(
      'name email isVerified provider profilePicture bio profileLastUpdated createdAt feedbackGiven'
    );

    if (!user) {
      console.log(`❌ [DATABASE] User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('👤 User data from DB:', {
      email: user.email,
      feedbackGiven: user.feedbackGiven,
      createdAt: user.createdAt
    });

    // Fetch carbon entries count
    const carbonDoc = await CarbonEntry.findOne({ email: user.email });
    const totalEntries = carbonDoc?.entries?.length || 0;
    
    console.log('📝 Total entries found:', totalEntries);

    // Calculate days since joining
    const daysSinceJoined = Math.max(1, Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ));
    
    console.log('📅 Days since joined:', daysSinceJoined);

    const profileData = {
      name: user.name,
      email: user.email,
      verified: user.isVerified,
      provider: user.provider,
      profilePicture: user.profilePicture,
      bio: user.bio || '',
      profileLastUpdated: user.profileLastUpdated,
      memberSince: user.createdAt,
      feedbackGiven: user.feedbackGiven || false,
      totalEntries: totalEntries,
      daysSinceJoined: daysSinceJoined
    };

    console.log('📤 Sending profile data:', JSON.stringify(profileData, null, 2));

    // Cache for 30 minutes
    await setCachedData(cacheKey, profileData, 1800);

    const responseTime = Date.now() - startTime;
    console.log(`✅ [RESPONSE] Profile from database in ${responseTime}ms`);
    
    res.json({
      ...profileData,
      fromCache: false,
      responseTime: `${responseTime}ms`
    });

  } catch (err) {
    console.error('❌ [SERVER ERROR] /profile/me error:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// UPDATE PROFILE NAME
router.patch('/update-name', authenticateToken, profileUpdateLimiter, async (req, res) => {
  console.log('\n✏️ [/profile/update-name] Request received');

  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Name too long (max 100 characters)' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name.trim();
    user.profileLastUpdated = new Date();
    await user.save();

    const cacheKey = `user:profile:${userId}`;
    await deleteKey(cacheKey);
    console.log(`🗑️ [CACHE] Profile cache invalidated`);

    console.log(`✅ [UPDATE] Name updated to: ${name}`);
    res.json({ 
      message: 'Name updated successfully',
      name: user.name,
      profileLastUpdated: user.profileLastUpdated
    });

  } catch (err) {
    console.error('❌ [SERVER ERROR] /update-name error:', err);
    res.status(500).json({ error: 'Server error updating name' });
  }
});

// UPDATE PROFILE PHOTO URL
router.patch('/update-photo-url', authenticateToken, profileUpdateLimiter, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (photoUrl === null) {
      user.profilePicture = null;
      user.profileLastUpdated = new Date();
      await user.save();
      await deleteKey(`user:profile:${userId}`);
      return res.json({ message: 'Profile photo removed' });
    }

    const validation = validateImageUrl(photoUrl);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.length > 2048) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    user.profilePicture = validation.sanitizedUrl;
    user.profileLastUpdated = new Date();
    await user.save();

    await deleteKey(`user:profile:${userId}`);
    res.json({ message: 'Photo URL updated successfully' });
  } catch (err) {
    console.error('❌ Photo URL update error:', err);
    res.status(500).json({ error: 'Server error updating photo' });
  }
});

// DELETE PROFILE PHOTO
router.delete('/delete-photo', authenticateToken, async (req, res) => {
  console.log('\n🗑️ [/profile/delete-photo] Request received');

  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.profilePicture = null;
    user.profileLastUpdated = new Date();
    await user.save();

    const cacheKey = `user:profile:${userId}`;
    await deleteKey(cacheKey);
    console.log(`🗑️ [CACHE] Profile cache invalidated`);

    console.log(`✅ [DELETE] Profile photo removed`);
    res.json({ 
      message: 'Profile photo deleted successfully',
      profileLastUpdated: user.profileLastUpdated
    });

  } catch (err) {
    console.error('❌ [SERVER ERROR] /delete-photo error:', err);
    res.status(500).json({ error: 'Server error deleting photo' });
  }
});

// UPDATE BIO
router.patch('/update-bio', authenticateToken, async (req, res) => {
  console.log('\n📝 [/profile/update-bio] Request received');

  try {
    const { bio } = req.body;
    const userId = req.user.userId;

    if (bio && bio.length > 500) {
      return res.status(400).json({ error: 'Bio too long (max 500 characters)' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.bio = bio || '';
    user.profileLastUpdated = new Date();
    await user.save();

    const cacheKey = `user:profile:${userId}`;
    await deleteKey(cacheKey);

    console.log(`✅ [UPDATE] Bio updated`);
    res.json({ 
      message: 'Bio updated successfully',
      bio: user.bio,
      profileLastUpdated: user.profileLastUpdated
    });

  } catch (err) {
    console.error('❌ [SERVER ERROR] /update-bio error:', err);
    res.status(500).json({ error: 'Server error updating bio' });
  }
});

// UPDATE ENTIRE PROFILE (bulk update)
router.patch('/update', authenticateToken, profileUpdateLimiter, async (req, res) => {
  console.log('\n🔄 [/profile/update] Bulk update request received');

  try {
    const { name, bio, photoData } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name !== undefined) {
      if (name.trim().length === 0) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({ error: 'Name too long (max 100 characters)' });
      }
      user.name = name.trim();
    }

    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({ error: 'Bio too long (max 500 characters)' });
      }
      user.bio = bio;
    }

    if (photoData !== undefined) {
      if (photoData === null) {
        user.profilePicture = null;
      } else {
        const validation = validateImageUrl(photoData);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }
        user.profilePicture = validation.sanitizedUrl;
      }
    }

    user.profileLastUpdated = new Date();
    await user.save();

    const cacheKey = `user:profile:${userId}`;
    await deleteKey(cacheKey);
    console.log(`🗑️ [CACHE] Profile cache invalidated`);

    console.log(`✅ [UPDATE] Profile updated successfully`);
    res.json({ 
      message: 'Profile updated successfully',
      profile: {
        name: user.name,
        bio: user.bio,
        profilePicture: user.profilePicture,
        profileLastUpdated: user.profileLastUpdated
      }
    });

  } catch (err) {
    console.error('❌ [SERVER ERROR] /profile/update error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;