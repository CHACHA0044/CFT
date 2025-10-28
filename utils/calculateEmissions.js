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
  
  // Show breakdown with user selections
categories.forEach((c) => {
  if (c.value > 0) {
    let userChoice = "";
    if (c.name === "Food" && data.food) {
      userChoice = `(${data.food.type} diet, ${data.food.amountKg} kg food)`;
    } 
    else if (c.name === "Transport" && data.transport?.length > 0) {
      const modes = data.transport.map(t => `${t.mode} (${t.distanceKm} km)`).join(", ");
      userChoice = `(${modes})`;
    } 
    else if (c.name === "Electricity" && data.electricity?.length > 0) {
      const sources = data.electricity.map(e => `${e.source} (${e.consumptionKwh} kWh)`).join(", ");
      userChoice = `(${sources})`;
    } 
    else if (c.name === "Waste" && data.waste?.length > 0) {
      const wasteDetails = data.waste.map(w =>
        `${w.plasticKg} kg plastic, ${w.paperKg} kg paper, ${w.foodWasteKg} kg food waste`
      ).join("; ");
      userChoice = `(${wasteDetails})`;
    }

    suggestions += `${c.emoji} <strong>${c.name}:</strong> ${c.value.toFixed(1)} kg CO₂ (${(c.percentage)}%) ${userChoice}\n`;
  }
});


  suggestions += `\n<strong>💡 Targeted Action Steps:</strong>\n`;

  // Category-specific suggestions (only for significant contributors)
  categories.forEach((c) => {
    if (c.value / totalEmissionKg > 0.15) { // Only suggest if >15% of total
    if (c.name === "Food") {
      const reductionPotential = (c.value * 0.3).toFixed(1);
      const diet = data.food?.type;

      suggestions += `\n${c.emoji} <strong>Food (~${Math.round(c.percentage)}% of total):</strong>\n`;

      if (diet === "Animal based") {
        suggestions += `• Try reducing meat portions or add 2-3 plant-based meals per week → Save ~${reductionPotential} kg CO₂/month\n`;
        suggestions += `• Explore sustainable protein options like lentils, tofu, or eggs\n`;
      } 
      else if (diet === "Both") {
        suggestions += `• Replace half your animal-based meals with plant-based alternatives → Save ~${reductionPotential} kg CO₂/month\n`;
        suggestions += `• Choose local and seasonal produce to reduce indirect emissions\n`;
      } 
      else if (diet === "Plant based") {
        suggestions += `• You're already plant-based 🌱 — great job!\n`;
        suggestions += `• Focus on reducing food waste and choosing local, seasonal ingredients\n`;
      } 
      else {
        suggestions += `• Keep track of your food sources — plant-based options greatly reduce CO₂ impact\n`;
      }
    }

    if (c.name === "Transport") {
      const reductionPotential = (c.value * 0.25).toFixed(1);
      const modes = data.transport?.map(t => t.mode) || [];

      suggestions += `\n${c.emoji} <strong>Transport (~${Math.round(c.percentage)}% of total):</strong>\n`;

      if (modes.includes("Flights")) {
        suggestions += `• Consider reducing short-haul flights — trains emit up to 80% less CO₂\n`;
      }
      if (modes.includes("Car")) {
        suggestions += `• Replace 1–2 car trips per week with public transit or carpooling → Save ~${reductionPotential} kg CO₂/month\n`;
      }
      if (modes.includes("Bus") || modes.includes("Metro") || modes.includes("Train")) {
        suggestions += `• You're already using efficient transport 👍 — keep it up!\n`;
      }
      if (modes.includes("Bike") || modes.includes("Walking")) {
        suggestions += `• Great job choosing low-carbon transport options 🚲🚶\n`;
      }
    }

    if (c.name === "Electricity") {
      const reductionPotential = (c.value * 0.2).toFixed(1);
      const sources = data.electricity?.map(e => e.source) || [];

      suggestions += `\n${c.emoji} <strong>Electricity (~${Math.round(c.percentage)}% of total):</strong>\n`;

      if (sources.includes("Coal") || sources.includes("Mixed")) {
        suggestions += `• Switch part of your usage to renewable sources → Save ~${reductionPotential} kg CO₂/month\n`;
      }
      if (sources.includes("Solar") || sources.includes("Wind") || sources.includes("Hydro")) {
        suggestions += `• Excellent — your clean energy usage is already lowering emissions ⚡\n`;
      }

      suggestions += `• Unplug idle devices & use LED bulbs to improve efficiency\n`;
    }

    if (c.name === "Waste") {
      const reductionPotential = (c.value * 0.35).toFixed(1);
      const waste = data.waste?.[0] || {};

      suggestions += `\n${c.emoji} <strong>Waste (~${Math.round(c.percentage)}% of total):</strong>\n`;

      if (waste.foodWasteKg > waste.paperKg && waste.foodWasteKg > waste.plasticKg) {
        suggestions += `• Compost your food scraps → Save ~${reductionPotential} kg CO₂/month\n`;
      }
      if (waste.plasticKg > waste.paperKg && waste.plasticKg > waste.foodWasteKg) {
        suggestions += `• Reduce plastic packaging & switch to reusable containers\n`;
      }
      if (waste.paperKg > 0) {
        suggestions += `• Recycle paper properly & use digital alternatives when possible\n`;
      }
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