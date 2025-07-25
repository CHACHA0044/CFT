const mongoose = require('mongoose');

const carbonEntrySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // link to user
  entries: [
    {
      food: {
        type: {
          type: String,
          enum: ["Animal based", "Plant based", "Both"],
          required: true
        },
        amountKg: { type: Number, required: true }
      },
      transport: [
        {
          mode: {
            type: String,
            enum: ["Car", "Bike", "Bus", "Metro", "Walking", "Train", "Flights"],
            required: true
          },
          distanceKm: { type: Number, required: true }
        }
      ],
      electricity: [
        {
          consumptionKwh: { type: Number, required: true },
          source: {
            type: String,
            enum: ["Coal", "Solar", "Wind", "Hydro", "Mixed"],
            required: true
          }
        }
      ],
      waste: [
        {
          plasticKg: { type: Number, default: 0 },
          paperKg: { type: Number, default: 0 },
          foodWasteKg: { type: Number, default: 0 }
        }
      ],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('CarbonEntry', carbonEntrySchema);
