export type PlotUnit = "sqft" | "gaj";

export type FloorOption = "g" | "g+1" | "g+2" | "g+3" | "stilt+2" | "stilt+3";

export type BasementOption = "none" | "half" | "full";

export type PackageTierId = "Silver" | "Gold" | "Platinum" | "Royale";

export interface PackageSpec {
  steel: string;
  cement: string;
  masonry: string;
  flooring: string;
  bathroom: string;
  electrical: string;
  doors: string;
  windows: string;
  paint: string;
  elevation: string;
  ceilingHeight: string;
  warranty: string;
}

export interface PackageTier {
  id: PackageTierId;
  name: string;
  subtitle: string;
  rate: number;
  tagline: string;
  popular: boolean;
  color: string;
  badgeColor: string;
  specs: PackageSpec;
}

export interface CityOption {
  name: string;
  multiplier: number;
  tag: string;
}

export interface AddonOption {
  id: "modularKitchen" | "falseCeiling" | "waterSumpSeptic" | "boundaryGate" | "solarRooftop";
  title: string;
  subtitle: string;
  cost: number | ((area: number) => number);
  icon: string;
}

export interface EstimatorState {
  unit: PlotUnit;
  plotArea: number; // in sqft
  floors: FloorOption;
  basement: BasementOption;
  parkingCars: number;
  balconies: number;
  city: string;
  tier: PackageTierId;
  addons: {
    modularKitchen: boolean;
    falseCeiling: boolean;
    waterSumpSeptic: boolean;
    boundaryGate: boolean;
    solarRooftop: boolean;
  };
}

export interface StageCost {
  name: string;
  percentage: number;
  amount: number;
  description: string;
  iconName: string;
}

export interface MaterialEstimate {
  cementBags: number;
  steelTonnes: number;
  aggregateCuFt: number;
  sandCuFt: number;
  bricksCount: number;
  paintLiters: number;
}

export interface CalculationResult {
  builtUpArea: number;
  groundArea: number;
  upperFloorsArea: number;
  basementArea: number;
  parkingArea: number;
  balconyArea: number;
  baseRatePerSqft: number;
  effectiveRatePerSqft: number;
  baseConstructionCost: number;
  addonsCost: number;
  totalCost: number;
  costMin: number;
  costMax: number;
  cityMultiplier: number;
  timelineMonths: string;
  stages: StageCost[];
  materials: MaterialEstimate;
  paymentMilestones: { milestone: string; percentage: number; amount: number; stage: string }[];
}

export interface CostEstimatorCMSConfig {
  heroBadge?: string;
  heroTitle?: string;
  heroAccent?: string;
  heroDescription?: string;
  freeCalculationsLimit?: number;
  whatsappNumber?: string;
  tiers?: Record<PackageTierId, PackageTier>;
  cities?: CityOption[];
  addons?: {
    modularKitchen?: { title?: string; subtitle?: string; cost?: number };
    falseCeiling?: { title?: string; subtitle?: string; perSqftRate?: number };
    waterSumpSeptic?: { title?: string; subtitle?: string; cost?: number };
    boundaryGate?: { title?: string; subtitle?: string; cost?: number };
    solarRooftop?: { title?: string; subtitle?: string; cost?: number };
  };
  leadModal?: {
    limitReachedTitle?: string;
    limitReachedSubtitle?: string;
  };
}
