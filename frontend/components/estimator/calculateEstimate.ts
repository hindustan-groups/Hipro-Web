import { CITIES, FLOOR_CONFIGS, PAYMENT_MILESTONES, STAGE_DISTRIBUTIONS, TIERS } from "./constants";
import { CalculationResult, CostEstimatorCMSConfig, EstimatorState } from "./types";

export function calculateEstimate(
  state: EstimatorState,
  cmsConfig?: CostEstimatorCMSConfig
): CalculationResult {
  const { plotArea, floors, basement, parkingCars, balconies, city, tier, addons } = state;

  const floorConfig = FLOOR_CONFIGS.find((f) => f.id === floors) || FLOOR_CONFIGS[1];
  const citiesList = cmsConfig?.cities || CITIES;
  const tiersList = cmsConfig?.tiers || TIERS;
  const cityConfig = citiesList.find((c) => c.name === city) || citiesList[0];
  const tierConfig = tiersList[tier] || TIERS[tier] || TIERS.Gold;

  // Ground coverage is typically 75-80% of plot area based on bye-laws
  const groundArea = Math.round(plotArea * 0.80);
  
  // Upper floors built-up
  const upperFloorMultiplier = Math.max(0, floorConfig.multiplier - 0.80);
  const upperFloorsArea = Math.round(plotArea * upperFloorMultiplier);

  // Basement area
  let basementArea = 0;
  if (basement === "half") {
    basementArea = Math.round(plotArea * 0.45);
  } else if (basement === "full") {
    basementArea = Math.round(plotArea * 0.85);
  }

  // Parking & Balconies
  const parkingArea = parkingCars * 140;
  const balconyArea = balconies * 45;

  const builtUpArea = Math.max(200, groundArea + upperFloorsArea + basementArea + parkingArea + balconyArea);

  // Cost calculation
  const aboveGroundArea = builtUpArea - basementArea;
  const baseRate = tierConfig.rate;
  const cityMult = cityConfig.multiplier;

  // Above ground construction
  const aboveGroundCost = aboveGroundArea * baseRate * cityMult;

  // Basement construction (higher cost due to excavation, RCC shear walls, bentonite waterproofing)
  const basementRate = (baseRate + 420) * cityMult;
  const basementCost = basementArea * basementRate;

  const baseConstructionCost = Math.round(aboveGroundCost + basementCost);

  // Addons calculation
  const customAddons = cmsConfig?.addons;
  let addonsCost = 0;
  if (addons.modularKitchen) {
    addonsCost +=
      customAddons?.modularKitchen?.cost ??
      ((tier === "Platinum" || tier === "Royale") ? 280000 : 210000);
  }
  if (addons.falseCeiling) {
    const rate = customAddons?.falseCeiling?.perSqftRate ?? 75;
    addonsCost += builtUpArea * rate;
  }
  if (addons.waterSumpSeptic) {
    addonsCost += customAddons?.waterSumpSeptic?.cost ?? 135000;
  }
  if (addons.boundaryGate) {
    addonsCost += customAddons?.boundaryGate?.cost ?? 145000;
  }
  if (addons.solarRooftop) {
    addonsCost += customAddons?.solarRooftop?.cost ?? 185000;
  }

  const totalCost = Math.round(baseConstructionCost + addonsCost);
  const costMin = Math.round(totalCost * 0.97);
  const costMax = Math.round(totalCost * 1.03);
  const effectiveRatePerSqft = Math.round(totalCost / builtUpArea);

  // Stage Breakdown
  const stages = STAGE_DISTRIBUTIONS.map((s) => ({
    name: s.name,
    percentage: s.pct,
    amount: Math.round((baseConstructionCost * s.pct) / 100),
    description: s.desc,
    iconName: s.name.split(" ")[0].toLowerCase(),
  }));

  // Materials BOM
  const materials = {
    cementBags: Math.round(builtUpArea * 0.42),
    steelTonnes: Number(((builtUpArea * 3.85) / 1000).toFixed(2)),
    aggregateCuFt: Math.round(builtUpArea * 1.35),
    sandCuFt: Math.round(builtUpArea * 1.85),
    bricksCount: Math.round(builtUpArea * 18),
    paintLiters: Math.round(builtUpArea * 0.14),
  };

  // Payment Milestones
  const paymentMilestones = PAYMENT_MILESTONES.map((m) => ({
    milestone: m.milestone,
    percentage: m.percentage,
    amount: Math.round((totalCost * m.percentage) / 100),
    stage: m.stage,
  }));

  // Timeline
  let timelineMonths = "7 – 9 Months";
  if (floors === "g") timelineMonths = "5 – 6 Months";
  else if (floors === "g+1") timelineMonths = "7 – 9 Months";
  else if (floors === "g+2" || floors === "stilt+2") timelineMonths = "9 – 11 Months";
  else if (floors === "g+3" || floors === "stilt+3") timelineMonths = "12 – 14 Months";

  return {
    builtUpArea,
    groundArea,
    upperFloorsArea,
    basementArea,
    parkingArea,
    balconyArea,
    baseRatePerSqft: baseRate,
    effectiveRatePerSqft,
    baseConstructionCost,
    addonsCost,
    totalCost,
    costMin,
    costMax,
    cityMultiplier: cityMult,
    timelineMonths,
    stages,
    materials,
    paymentMilestones,
  };
}

export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(amount / 100000).toFixed(2)} Lakhs`;
}

export function formatIndianNumber(val: number): string {
  return new Intl.NumberFormat("en-IN").format(val);
}
