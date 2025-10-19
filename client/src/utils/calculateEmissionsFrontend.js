//backend/client/src/utils/calculateEmissionsFrontend.js
export default function calculateEmissions(entry) {
  if (!entry || typeof entry !== "object") {
    return {
      totalEmissionKg: 0,
      foodEmissionKg: 0,
      transportEmissionKg: 0,
      electricityEmissionKg: 0,
      wasteEmissionKg: 0
    };
  }

  // --- FOOD ---
  const food = entry.food || {};
  const foodFactor = {
    "Animal based": 6.0,
    "Plant based": 1.5,
    "Both": 3.8
  }[food.type] || 3.0;
  const foodEmissionKg = (food.amountKg || 0) * foodFactor;

  // --- TRANSPORT ---
  const transportEmissionKg = (entry.transport || []).reduce((sum, item) => {
    const factor = {
      Car: 0.192,
      Bike: 0.016,
      Bus: 0.089,
      Metro: 0.041,
      Walking: 0.0,
      Train: 0.049,
      Flights: (item.distanceKm || 0) > 1500 ? 0.150 : 0.254
    }[item.mode] || 0;
    return sum + (item.distanceKm || 0) * factor;
  }, 0);

  // --- ELECTRICITY ---
  const electricityEmissionKg = (entry.electricity || []).reduce((sum, item) => {
    const factor = {
      Coal: 0.94,
      Solar: 0.05,
      Wind: 0.01,
      Hydro: 0.02,
      Mixed: 0.45
    }[item.source] || 0.45;
    return sum + (item.consumptionKwh || 0) * factor;
  }, 0);

  // --- WASTE ---
  const wasteEmissionKg = (entry.waste || []).reduce((sum, item) => {
    const { plasticKg = 0, paperKg = 0, foodWasteKg = 0 } = item;
    return sum + plasticKg * 5.8 + paperKg * 1.3 + foodWasteKg * 2.5;
  }, 0);

  // --- TOTAL ---
  const totalEmissionKg = parseFloat(
    (foodEmissionKg + transportEmissionKg + electricityEmissionKg + wasteEmissionKg).toFixed(2)
  );

  return {
    totalEmissionKg,
    foodEmissionKg,
    transportEmissionKg,
    electricityEmissionKg,
    wasteEmissionKg
  };
}
