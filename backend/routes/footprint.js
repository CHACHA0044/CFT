const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authmiddleware');
const CarbonEntry = require('../models/CarbonEntry');
const calculateEmissions = require('../utils/calculateEmissions');
const mongoose = require('mongoose');
const User = require('../models/user');
//  POST: Create entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const data = req.body;

    const updatedDoc = await CarbonEntry.findOneAndUpdate(
      { email },
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
      { email: req.user.email },
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
    const doc = await CarbonEntry.findOne({ email: req.user.email });
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
 
// Leaderboard - compare nth entry
router.get('/leaderboard-nth', authenticateToken, async (req, res) => {
  try {
    const n = parseInt(req.query.n);
    if (isNaN(n) || n < 0) {
      return res.status(400).json({ error: 'Invalid entry index' });
    }

    const currentUser = await User.findOne({ email: req.user.email });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allUsers = await User.find({});
    const leaderboard = [];

    for (const user of allUsers) {
      const carbonEntry = await CarbonEntry.findOne({ email: user.email });
      if (!carbonEntry || !carbonEntry.entries.length) continue;

      // Sorting entries newest to oldest
      const sorted = [...carbonEntry.entries].sort((a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );

      let selectedEntry = null;
      for (let i = n; i >= 0; i--) {
        if (sorted[i]) {
          selectedEntry = sorted[i];
          break;
        }
      }

      if (selectedEntry) {
        const processed = calculateEmissions(selectedEntry); 
        leaderboard.push({
          name: user.name,
          email: user.email,
          totalEmission: processed.totalEmissionKg,
        });
      }
    }

    // Sorting by total emissions ascending
    leaderboard.sort((a, b) => a.totalEmission - b.totalEmission);

    res.json(leaderboard);
  } catch (err) {
    console.error('❌ Leaderboard error:', err);
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
  { email: req.user.email, "entries._id": new mongoose.Types.ObjectId(req.params.id) },
  { "entries.$": 1 }
);
 // console.log("📄 Query result:", doc);

    if (!doc || doc.entries.length === 0)
      return res.status(404).json({ error: 'Entry not found' });

    const entry = doc.entries[0];
    const { totalEmissionKg, suggestions } = calculateEmissions(entry);

    res.json({ ...entry.toObject(), totalEmissionKg, suggestions });
  } catch (err) {
    console.error('❌ GET /:id error:', err);
    res.status(500).json({ error: 'Error fetching entry' });
  }
});

//  UPDATE entry 
router.put('/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const email = req.user.email;
    const data = req.body;

    const updatedDoc = await CarbonEntry.findOneAndUpdate(
      { email, "entries._id": entryId },
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
    const email = req.user.email;
    const { entryId } = req.params;

    const updatedDoc = await CarbonEntry.findOneAndUpdate(
      { email },
      { $pull: { entries: { _id: entryId } } },
      { new: true }
    );

    res.json({ message: 'Entry deleted', data: updatedDoc });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting entry' });
  }
});


module.exports = router;
