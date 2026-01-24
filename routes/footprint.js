const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authmiddleware');
const CarbonEntry = require('../models/CarbonEntry');
const calculateEmissions = require('../utils/calculateEmissions');
const mongoose = require('mongoose');
const User = require('../models/user');
const rateLimit = require("express-rate-limit");
const leaderboardLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 10,});
//  POST: Create entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    const updatedDoc = await CarbonEntry.findOneAndUpdate(
    { userId },
      {
        $push: {
          entries: {
            food: data.food,
            transport: data.transport,
            electricity: data.electricity,
            waste: data.waste,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: 'Entry added successfully', data: updatedDoc });
  } catch (err) {
    console.error('❌ POST /footprint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE all 
router.delete('/clear/all', authenticateToken, async (req, res) => {
  try {
    const updatedDoc = await CarbonEntry.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { entries: [] } },
      { new: true }
    );
    res.json({ message: 'All entries cleared', data: updatedDoc });
  } catch (err) {
    res.status(500).json({ error: 'Error clearing entries' });
  }
});

// GET all history 
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const doc = await CarbonEntry.findOne({ userId: req.user.userId });
    if (!doc || doc.entries.length === 0) return res.status(200).json([]);

    const enriched = doc.entries
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(entry => {
        const { totalEmissionKg, suggestions } = calculateEmissions(entry);
        return { ...entry.toObject(), totalEmissionKg, suggestions };
      });

    res.status(200).json(enriched);
  } catch (err) {
    console.error('❌ GET /history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard - compare nth entry (with entry data)
router.get('/leaderboard-nth', leaderboardLimiter, authenticateToken, async (req, res) => {
  try {
    const n = parseInt(req.query.n);
    if (isNaN(n) || n < 0) {
      return res.status(400).json({ error: 'Invalid entry index' });
    }
    
    // ✅ ADD THIS LINE - Get current user's userId from JWT
    const currentUserId = req.user.userId;
    
    const currentUser = await User.findOne({ userId: req.user.userId })
      .select('name userId profilePicture')
      .lean();
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const allUsers = await User.find({})
      .select('name userId profilePicture')
      .lean();
    
    const leaderboard = [];
    
    for (const user of allUsers) {
      const carbonEntry = await CarbonEntry.findOne({ userId: user.userId })
        .lean();
      
      if (!carbonEntry || !carbonEntry.entries?.length) continue;
      
      const sortedEntries = [...carbonEntry.entries].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
      
      let selectedEntry = null;
      for (let i = n; i >= 0; i--) {
        if (sortedEntries[i]) {
          selectedEntry = sortedEntries[i];
          break;
        }
      }
      
      if (!selectedEntry) continue;
      
      const processed = calculateEmissions(selectedEntry);
      
      const cleanEntry = {
        _id: selectedEntry._id?.toString(),
        name: selectedEntry.name || user.name,
        food: selectedEntry.food ? {
          type: selectedEntry.food.type,
          amountKg: selectedEntry.food.amountKg
        } : null,
        transport: selectedEntry.transport?.map(t => ({
          mode: t.mode,
          distanceKm: t.distanceKm
        })) || [],
        electricity: selectedEntry.electricity?.map(e => ({
          source: e.source,
          consumptionKwh: e.consumptionKwh
        })) || [],
        waste: selectedEntry.waste?.map(w => ({
          plasticKg: w.plasticKg || 0,
          paperKg: w.paperKg || 0,
          foodWasteKg: w.foodWasteKg || 0
        })) || [],
        createdAt: selectedEntry.createdAt,
        updatedAt: selectedEntry.updatedAt
      };
      
      leaderboard.push({
        name: user.name,
        profilePicture: user.profilePicture || null,
        totalEmission: processed.totalEmissionKg,
        entry: cleanEntry,
        entryId: selectedEntry._id?.toString(),
        isCurrentUser: user.userId === currentUserId, // ✅ ADD THIS LINE
        // userId: user.userId, // ❌ REMOVE THIS LINE (optional, can keep for now)
      });
    }
    
    leaderboard.sort((a, b) => a.totalEmission - b.totalEmission);

    if (leaderboard.length === 0) {
      return res.json([]);
    }

    res.json(leaderboard);
  } catch (err) {
    console.error('[LEADERBOARD] Error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard.' });
  }
});

// GET single entry 
router.get('/:id', authenticateToken, async (req, res) => {
  try {
//     console.log('📦 Attempting to fetch entry with ID:', req.params.id);
//    console.log("🔎 Email from token:", req.user.email);
// console.log("🔎 Entry ID from params:", req.params.id);

  const doc = await CarbonEntry.findOne(
  { userId: req.user.userId, "entries._id": new mongoose.Types.ObjectId(req.params.id) },
  { "entries.$": 1 }
);
 // console.log("📄 Query result:", doc);

    if (!doc || doc.entries.length === 0)
      return res.status(404).json({ error: 'Entry not found' });

    const entry = doc.entries[0];
    const processed = calculateEmissions(entry);

    res.json({ 
      ...entry.toObject(), 
      totalEmissionKg: processed.totalEmissionKg,
      foodEmissionKg: processed.foodEmissionKg,
      transportEmissionKg: processed.transportEmissionKg, 
      electricityEmissionKg: processed.electricityEmissionKg,
      wasteEmissionKg: processed.wasteEmissionKg, 
      suggestions: processed.suggestions 
    });
  } catch (err) {
    console.error('❌ GET /:id error:', err);
    res.status(500).json({ error: 'Error fetching entry' });
  }
});

//  UPDATE entry 
router.put('/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.userId;
    const data = req.body;

    const updatedDoc = await CarbonEntry.findOneAndUpdate(
    { userId, "entries._id": entryId },
      {
        $set: {
          "entries.$.food": data.food,
          "entries.$.transport": data.transport,
          "entries.$.electricity": data.electricity,
          "entries.$.waste": data.waste,
          "entries.$.updatedAt": new Date()
        }
      },
      { new: true }
    );

    if (!updatedDoc) return res.status(404).json({ error: 'Entry not found' });

    res.json({ message: 'Entry updated successfully', data: updatedDoc });
  } catch (err) {
    console.error('❌ PUT /footprint/:entryId error:', err);
    res.status(500).json({ error: 'Error updating entry' });
  }
});

//DELETE single entry 
router.delete('/:entryId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { entryId } = req.params;

    const updatedDoc = await CarbonEntry.findOneAndUpdate(
      { userId },
      { $pull: { entries: { _id: entryId } } },
      { new: true }
    );

    res.json({ message: 'Entry deleted', data: updatedDoc });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting entry' });
  }
});


module.exports = router;
