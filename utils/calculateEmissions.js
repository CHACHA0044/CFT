function calculateEmissions(data) {
  const MAX_FOOD_KG = 100; // monthly limit
  const MAX_TRANSPORT_KM = 5000;
  const MAX_ELECTRICITY_KWH = 1200;
  const MAX_WASTE_KG = 150;

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
  const globalAverage = 400;
  const difference = totalEmissionKg - globalAverage;
  const percentDiff = ((difference / globalAverage) * 100).toFixed(0);

  // Opening assessment
  if (totalEmissionKg <= 150) {
  suggestions += `🌎 <strong>Outstanding!</strong> Your footprint of <strong>${totalEmissionKg} kg CO₂</strong> is a remarkable ${Math.abs(percentDiff)}% below the global average (${globalAverage} kg). This is well within the range of sustainable living — you're truly a climate leader!\n\n`;
  } 
  else if (totalEmissionKg <= 300) {
    suggestions += `🌿 <strong>Great job!</strong> Your emissions are ${Math.abs(percentDiff)}% lower than the global average (${globalAverage} kg/month). You’re living efficiently — small steps like waste control or renewable energy could make you carbon-light!\n\n`;
  } 
  else if (totalEmissionKg > 300 && totalEmissionKg <= 450) {
    suggestions += `📈 <strong>You're around the global average.</strong> With <strong>${totalEmissionKg} kg CO₂</strong>/month, you're within ±${Math.abs(percentDiff)}% of the world norm (${globalAverage} kg). Minor tweaks in your highest category can make you a below-average emitter.\n\n`;
  } 
  else if (totalEmissionKg > 450 && totalEmissionKg <= 700) {
    suggestions += `⚠️ <strong>Slightly above global norms.</strong> Your monthly footprint (<strong>${totalEmissionKg} kg CO₂</strong>) is roughly ${percentDiff}% higher than the global average (${globalAverage} kg). Reducing private transport or improving home energy efficiency can close the gap.\n\n`;
  } 
  else if (totalEmissionKg > 700 && totalEmissionKg <= 1000) {
    suggestions += `🔥 <strong>High emissions detected.</strong> At <strong>${totalEmissionKg} kg CO₂</strong>/month, you're ${percentDiff}% above the global average (${globalAverage} kg). Focusing on your biggest categories could quickly bring you in line with sustainable levels.\n\n`;
  } 
  else {
    suggestions += `🚨 <strong>Critical zone!</strong> Your footprint of <strong>${totalEmissionKg} kg CO₂</strong>/month is ${percentDiff}% above the global average (${globalAverage} kg). You’re emitting more than most people worldwide — but your top two categories hold major reduction opportunities.\n\n`;
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

   // Enhanced category-specific suggestions with new logic
  categories.forEach((c) => {
    const percent = Math.round(c.percentage);
    const reductionPotential = (c.value * 0.3).toFixed(1);
    const level =
      c.percentage < 15
        ? "low"
        : c.percentage < 30
        ? "moderate"
        : c.percentage < 50
        ? "high"
        : "extreme";

    if (c.value / totalEmissionKg > 0.15) { // Only suggest if >15% of total
      suggestions += `\n${c.emoji} <strong>${c.name} (~${percent}% of total):</strong>\n`;

      // 🥗 FOOD SECTION
      if (c.name === "Food") {
        const diet = data.food?.type;

        if (level === "low") {
          suggestions += `• Your food emissions are low — keep focusing on local and seasonal produce.\n`;
        } else if (level === "moderate") {
          suggestions += `• Moderate food footprint — great! You can reduce it further by reducing waste and limiting high-impact foods.\n`;
        } else if (level === "high") {
          suggestions += `• High food footprint detected. Try meal-planning and mindful protein swaps to cut CO₂ by ~${reductionPotential} kg/month.\n`;
        } else {
          suggestions += `• Food emissions are extremely high — big changes like switching diets or reducing meat portions could save massive CO₂.\n`;
        }

        if (diet === "Animal based") {
          suggestions += `• Try one or two meat-free days weekly.\n• Explore lentils, tofu, or eggs as lower-impact protein sources.\n`;
        } else if (diet === "Both") {
          suggestions += `• Replace half your animal-based meals with plant options — substantial savings!\n`;
        } else if (diet === "Plant based") {
          suggestions += `• Excellent choice 🌱 Focus on waste reduction and locally grown foods.\n`;
        } else {
          suggestions += `• Track your diet choices to estimate food emissions more precisely.\n`;
        }
      }

      // 🚗 TRANSPORT SECTION
      if (c.name === "Transport") {
        const modes = data.transport?.map((t) => t.mode) || [];
        const totalTransport = data.transport?.length || 0;

        if (level === "low") {
          suggestions += `• Efficient travel habits detected — keep choosing sustainable options.\n`;
        } else if (level === "moderate") {
          suggestions += `• Your transport footprint is moderate — a few simple swaps could reduce emissions significantly.\n`;
        } else if (level === "high") {
          suggestions += `• Transport is a major emission source — reducing private vehicle use could save ~${reductionPotential} kg/month.\n`;
        } else {
          suggestions += `• Extremely high transport emissions — consider offsetting and long-term lifestyle changes.\n`;
        }

        if (modes.includes("Flights")) {
          suggestions += `• Limit short flights or combine trips; trains emit up to 80% less CO₂.\n`;
        }
        if (modes.includes("Car")) {
          suggestions += `• Carpool or use EV alternatives when possible.\n• Regular maintenance can improve mileage and cut emissions.\n`;
        }
        if (modes.includes("Bus") || modes.includes("Metro") || modes.includes("Train")) {
          suggestions += `• You're using efficient public transport — keep it up! 🚆\n`;
        }
        if (modes.includes("Bike") || modes.includes("Walking")) {
          suggestions += `• Active transport is the best — zero emissions and good health 🚲🚶‍♂️\n`;
        }

        if (totalTransport === 0) {
          suggestions += `• No transport data found — add your travel patterns for better analysis.\n`;
        }
      }

      // ⚡ ELECTRICITY SECTION
      if (c.name === "Electricity") {
        const sources = data.electricity?.map((e) => e.source) || [];
        const totalElectric = data.electricity?.length || 0;

        if (level === "low") {
          suggestions += `• Excellent — your electricity footprint is already efficient.\n`;
        } else if (level === "moderate") {
          suggestions += `• Moderate energy use — unplug idle devices and use smart power strips.\n`;
        } else if (level === "high") {
          suggestions += `• High energy footprint. Switching 25% to renewables could save ~${reductionPotential} kg/month.\n`;
        } else {
          suggestions += `• Extremely high usage — consider solar panels or community energy programs.\n`;
        }

        if (sources.includes("Coal")) {
          suggestions += `• Coal-based power increases CO₂ — explore green power subscriptions.\n`;
        }
        if (sources.includes("Mixed")) {
          suggestions += `• Mixed sources: prioritizing renewables can reduce footprint.\n`;
        }
        if (sources.includes("Solar") || sources.includes("Wind") || sources.includes("Hydro")) {
          suggestions += `• Great job incorporating renewables ⚡\n`;
        }

        if (totalElectric === 0) {
          suggestions += `• No electricity data yet — add your monthly usage for accurate insights.\n`;
        }
      }

      // 🗑️ WASTE SECTION
      if (c.name === "Waste") {
        const waste = data.waste?.[0] || {};

        if (level === "low") {
          suggestions += `• Low waste footprint — maintain your eco-friendly habits ♻️\n`;
        } else if (level === "moderate") {
          suggestions += `• Moderate waste levels — separate recyclables consistently.\n`;
        } else if (level === "high") {
          suggestions += `• High waste generation — compost and recycle more to cut ~${reductionPotential} kg/month.\n`;
        } else {
          suggestions += `• Extremely high waste levels — rethink purchases, reuse, and compost aggressively.\n`;
        }

        if (waste.foodWasteKg > waste.paperKg && waste.foodWasteKg > waste.plasticKg) {
          suggestions += `• Composting food waste could reduce your footprint notably.\n`;
        }
        if (waste.plasticKg > waste.paperKg && waste.plasticKg > waste.foodWasteKg) {
          suggestions += `• Reduce plastic packaging, bring your own containers.\n`;
        }
        if (waste.paperKg > 0) {
          suggestions += `• Recycle paper and go digital when possible.\n`;
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
    wasteWithEmissions,
    foodEmissionKg: foodEmission,
    transportEmissionKg: transportTotal,
    electricityEmissionKg: electricityTotal,
    wasteEmissionKg: wasteTotal
  };
}

module.exports = calculateEmissions;