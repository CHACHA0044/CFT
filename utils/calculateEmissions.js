function calculateEmissions(data) {
  const MAX_FOOD_KG = 500; // monthly limit
  const MAX_TRANSPORT_KM = 10000;
  const MAX_ELECTRICITY_KWH = 2000;
  const MAX_WASTE_KG = 1000;

  let capped = false;

  // --- FOOD ---
  let foodEmission = 0;
  
  const foodWithEmission = data.food ? (() => {
    let amountKg = data.food.amountKg || 0;
    if (amountKg > MAX_FOOD_KG) {
      capped = true;
      amountKg = MAX_FOOD_KG;
    }
    const factorMap = {
      "Animal based": 6.0,
      "Plant based": 1.5,
      "Both": 3.8
    };
    const factor = factorMap[data.food.type] || 3.0;
    const emissionKg = amountKg * factor;
    foodEmission = emissionKg;
    return { ...data.food, amountKg, emissionKg };
  })() : null;

  // --- TRANSPORT ---
  let transportTotal = 0;

  const transportWithEmissions = (data.transport || []).map(item => {
    let distanceKm = item.distanceKm || 0;
    if (distanceKm > MAX_TRANSPORT_KM) {
      capped = true;
      distanceKm = MAX_TRANSPORT_KM;
    }
    const factor = {
      Car: 0.192,
      Bike: 0.016,
      Bus: 0.089,
      Metro: 0.041,
      Walking: 0.00,
      Train: 0.049,
      Flights: distanceKm > 1500 ? 0.150 : 0.254
    }[item.mode] || 0;

    const emissionKg = factor * distanceKm;
    transportTotal += emissionKg;
    return { ...item, distanceKm, emissionKg };
  });

  // --- ELECTRICITY ---
  let electricityTotal = 0;
  const electricityWithEmissions = (data.electricity || []).map(item => {
    let consumptionKwh = item.consumptionKwh || 0;
    if (consumptionKwh > MAX_ELECTRICITY_KWH) {
      capped = true;
      consumptionKwh = MAX_ELECTRICITY_KWH;
    }
    const factor = {
      Coal: 0.94,
      Solar: 0.05,
      Wind: 0.01,
      Hydro: 0.02,
      Mixed: 0.45
    }[item.source] || 0.45;

    const emissionKg = factor * consumptionKwh;
    electricityTotal += emissionKg;
    return { ...item, consumptionKwh, emissionKg };
  });

  // --- WASTE ---
  let wasteTotal = 0;
  const wasteWithEmissions = (data.waste || []).map(item => {
    let plasticKg = item.plasticKg || 0;
    let paperKg = item.paperKg || 0;
    let foodWasteKg = item.foodWasteKg || 0;

    if (plasticKg > MAX_WASTE_KG || paperKg > MAX_WASTE_KG || foodWasteKg > MAX_WASTE_KG) {
      capped = true;
      plasticKg = Math.min(plasticKg, MAX_WASTE_KG);
      paperKg = Math.min(paperKg, MAX_WASTE_KG);
      foodWasteKg = Math.min(foodWasteKg, MAX_WASTE_KG);
    }

    const emissionKg =
      plasticKg * 5.8 +
      paperKg * 1.3 +
      foodWasteKg * 2.5;

    wasteTotal += emissionKg;
    return { ...item, plasticKg, paperKg, foodWasteKg, emissionKg };
  });

  // --- TOTAL ---
  const totalEmissionKg = parseFloat(
    (foodEmission + transportTotal + electricityTotal + wasteTotal).toFixed(2)
  );

  // --- DYNAMIC SUGGESTIONS ---
  let suggestions = capped
    ? "⚠️ <strong>Note:</strong> Some unusually high values were capped to ensure realistic monthly estimates.\n\n"
    : "";

  const categories = [
    { name: "Food", value: foodEmission, emoji: "🥗", percentage: (foodEmission / totalEmissionKg * 100).toFixed(1) },
    { name: "Transport", value: transportTotal, emoji: "🚗", percentage: (transportTotal / totalEmissionKg * 100).toFixed(1) },
    { name: "Electricity", value: electricityTotal, emoji: "⚡", percentage: (electricityTotal / totalEmissionKg * 100).toFixed(1) },
    { name: "Waste", value: wasteTotal, emoji: "🗑️", percentage: (wasteTotal / totalEmissionKg * 100).toFixed(1) }
  ].sort((a, b) => b.value - a.value);

  // Global average: ~390-400 kg/month
  const globalAverage = 450;
  const difference = totalEmissionKg - globalAverage;
  const percentDiff = ((difference / globalAverage) * 100).toFixed(0);

  // Opening assessment
  if (totalEmissionKg <= 250) {
    suggestions += `🌟 <strong>Excellent work!</strong> Your monthly footprint of <strong>${totalEmissionKg} kg CO₂</strong> is ${Math.abs(percentDiff)}% below the global average (${globalAverage} kg). You're leading by example — keep these sustainable habits strong!\n\n`;
  } else if (totalEmissionKg <= 392) {
    suggestions += `🌿 <strong>Well done!</strong> At <strong>${totalEmissionKg} kg CO₂</strong> per month, you're ${Math.abs(percentDiff)}% below the global average (${globalAverage} kg). Small optimizations in your top categories can push you even lower.\n\n`;
  } else if (totalEmissionKg <= 600) {
    suggestions += `📊 <strong>You're slightly above average.</strong> Your monthly footprint is <strong>${totalEmissionKg} kg CO₂</strong> — about ${percentDiff}% higher than the global average (${globalAverage} kg). Focus on your biggest contributors below for quick wins.\n\n`;
  } else {
    suggestions += `🔥 <strong>Time to take action!</strong> At <strong>${totalEmissionKg} kg CO₂</strong> per month, you're ${percentDiff}% above the global average (${globalAverage} kg). The good news? Your top emission sources offer the biggest opportunities for reduction.\n\n`;
  }

  suggestions += `<strong>📍 Your Emission Breakdown:</strong>\n`;
  
  // Show breakdown
  categories.forEach((c) => {
    if (c.value > 0) {
      suggestions += `${c.emoji} <strong>${c.name}:</strong> ${c.value.toFixed(1)} kg CO₂ (${c.percentage}%)\n`;
    }
  });

  suggestions += `\n<strong>💡 Targeted Action Steps:</strong>\n`;

  // Category-specific suggestions (only for significant contributors)
  categories.forEach((c) => {
    if (c.value / totalEmissionKg > 0.15) { // Only suggest if >15% of total
      if (c.name === "Food") {
        const reductionPotential = (c.value * 0.3).toFixed(1);
        suggestions += `\n${c.emoji} <strong>Food (${c.percentage}% of total):</strong>\n`;
        suggestions += `• Swap 2-3 meat meals per week with plant-based options → Save ~${reductionPotential} kg CO₂/month\n`;
        suggestions += `• Buy local & seasonal produce to cut transport emissions\n`;
        suggestions += `• Meal plan to reduce food waste by 20-30%\n`;
      }
      
      if (c.name === "Transport") {
        const reductionPotential = (c.value * 0.25).toFixed(1);
        suggestions += `\n${c.emoji} <strong>Transport (${c.percentage}% of total):</strong>\n`;
        suggestions += `• Replace 1-2 car trips per week with public transit → Save ~${reductionPotential} kg CO₂/month\n`;
        suggestions += `• Carpool for commutes or combine errands into single trips\n`;
        suggestions += `• Walk/bike for trips under 3 km — zero emissions + health benefits\n`;
      }
      
      if (c.name === "Electricity") {
        const reductionPotential = (c.value * 0.2).toFixed(1);
        suggestions += `\n${c.emoji} <strong>Electricity (${c.percentage}% of total):</strong>\n`;
        suggestions += `• Switch to LED bulbs & unplug idle electronics → Save ~${reductionPotential} kg CO₂/month\n`;
        suggestions += `• Set AC/heating 2°C higher/lower to cut usage by 10-15%\n`;
        suggestions += `• Explore solar panels or switch to a renewable energy provider\n`;
      }
      
      if (c.name === "Waste") {
        const reductionPotential = (c.value * 0.35).toFixed(1);
        suggestions += `\n${c.emoji} <strong>Waste (${c.percentage}% of total):</strong>\n`;
        suggestions += `• Compost food scraps to prevent methane emissions → Save ~${reductionPotential} kg CO₂/month\n`;
        suggestions += `• Recycle plastic & paper correctly — improper disposal doubles impact\n`;
        suggestions += `• Carry reusable bags, bottles, and containers to cut single-use plastics\n`;
      }
    }
  });

  // Closing motivation
  suggestions += `\n<strong>🎯 Your Next Step:</strong> Start with just <strong>one action</strong> from your highest category this week. Track progress next month and watch your footprint shrink. Small, consistent changes create lasting impact! 🌍💚`;

  return {
    totalEmissionKg,
    suggestions,
    capped,
    foodWithEmission,
    transportWithEmissions,
    electricityWithEmissions,
    wasteWithEmissions
  };
}

module.exports = calculateEmissions;