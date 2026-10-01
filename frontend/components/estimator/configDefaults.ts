import { CITIES, TIERS } from "./constants";
import { CostEstimatorCMSConfig } from "./types";

export const DEFAULT_ADDONS = {
  modularKitchen: {
    title: "Designer Modular Kitchen",
    subtitle: "Marine-ply carcass, acrylic/PU shutters, quartz/granite top, soft-close Blum/Hettich fittings",
    cost: 210000,
  },
  falseCeiling: {
    title: "Designer False Ceiling & Ambient Lighting",
    subtitle: "Saint-Gobain Gyproc false ceiling with Philips/Havells warm white LED COB downlights & cove lighting",
    perSqftRate: 75,
  },
  waterSumpSeptic: {
    title: "10,000L RCC Sump & Septic Tank",
    subtitle: "Heavy RCC underground rainwater/municipal storage tank + 3-chamber biological septic tank",
    cost: 135000,
  },
  boundaryGate: {
    title: "Boundary Wall & Designer Gate",
    subtitle: "Plastered 9-inch brick boundary wall with coping + heavy MS laser-cut designer main gate",
    cost: 145000,
  },
  solarRooftop: {
    title: "3kW On-Grid Rooftop Solar Power",
    subtitle: "Tier-1 Mono PERC half-cut solar panels + grid-tie inverter + net-metering liaisoning assistance",
    cost: 185000,
  },
};

export const DEFAULT_ESTIMATOR_CMS_CONFIG: CostEstimatorCMSConfig = {
  heroBadge: "Rajasthan Construction Intelligence Engine",
  heroTitle: "House Construction Cost Calculator",
  heroAccent: "& Itemized BOQ Engine",
  heroDescription:
    "Plan your dream home with Rajasthan's most transparent construction estimation tool. Get instant, engineer-verified material breakdowns, package specifications, and milestone budgets for Bhilwara, Jaipur, Udaipur & beyond.",
  freeCalculationsLimit: 2,
  whatsappNumber: "7597000601",
  tiers: {
    Silver: { ...TIERS.Silver },
    Gold: { ...TIERS.Gold },
    Platinum: { ...TIERS.Platinum },
    Royale: { ...TIERS.Royale },
  },
  cities: [...CITIES],
  addons: { ...DEFAULT_ADDONS },
  leadModal: {
    limitReachedTitle: "Unlock Unlimited Calculations",
    limitReachedSubtitle: "You've viewed your 2 free calculations. Enter your WhatsApp number to unlock unlimited estimates, live materials BOM, and full BOQ access.",
  },
};

export function mergeEstimatorConfig(
  custom?: Partial<CostEstimatorCMSConfig> | null
): CostEstimatorCMSConfig {
  if (!custom) return DEFAULT_ESTIMATOR_CMS_CONFIG;

  return {
    heroBadge: custom.heroBadge || DEFAULT_ESTIMATOR_CMS_CONFIG.heroBadge,
    heroTitle: custom.heroTitle || DEFAULT_ESTIMATOR_CMS_CONFIG.heroTitle,
    heroAccent: custom.heroAccent || DEFAULT_ESTIMATOR_CMS_CONFIG.heroAccent,
    heroDescription: custom.heroDescription || DEFAULT_ESTIMATOR_CMS_CONFIG.heroDescription,
    freeCalculationsLimit:
      typeof custom.freeCalculationsLimit === "number"
        ? custom.freeCalculationsLimit
        : DEFAULT_ESTIMATOR_CMS_CONFIG.freeCalculationsLimit,
    whatsappNumber: custom.whatsappNumber || DEFAULT_ESTIMATOR_CMS_CONFIG.whatsappNumber,
    tiers: {
      Silver: custom.tiers?.Silver
        ? { ...TIERS.Silver, ...custom.tiers.Silver }
        : { ...TIERS.Silver },
      Gold: custom.tiers?.Gold
        ? { ...TIERS.Gold, ...custom.tiers.Gold }
        : { ...TIERS.Gold },
      Platinum: custom.tiers?.Platinum
        ? { ...TIERS.Platinum, ...custom.tiers.Platinum }
        : { ...TIERS.Platinum },
      Royale: custom.tiers?.Royale
        ? { ...TIERS.Royale, ...custom.tiers.Royale }
        : { ...TIERS.Royale },
    },
    cities:
      Array.isArray(custom.cities) && custom.cities.length > 0
        ? custom.cities
        : [...CITIES],
    addons: {
      modularKitchen: {
        title: custom.addons?.modularKitchen?.title || DEFAULT_ADDONS.modularKitchen.title,
        subtitle: custom.addons?.modularKitchen?.subtitle || DEFAULT_ADDONS.modularKitchen.subtitle,
        cost: typeof custom.addons?.modularKitchen?.cost === "number" ? custom.addons.modularKitchen.cost : DEFAULT_ADDONS.modularKitchen.cost,
      },
      falseCeiling: {
        title: custom.addons?.falseCeiling?.title || DEFAULT_ADDONS.falseCeiling.title,
        subtitle: custom.addons?.falseCeiling?.subtitle || DEFAULT_ADDONS.falseCeiling.subtitle,
        perSqftRate: typeof custom.addons?.falseCeiling?.perSqftRate === "number" ? custom.addons.falseCeiling.perSqftRate : DEFAULT_ADDONS.falseCeiling.perSqftRate,
      },
      waterSumpSeptic: {
        title: custom.addons?.waterSumpSeptic?.title || DEFAULT_ADDONS.waterSumpSeptic.title,
        subtitle: custom.addons?.waterSumpSeptic?.subtitle || DEFAULT_ADDONS.waterSumpSeptic.subtitle,
        cost: typeof custom.addons?.waterSumpSeptic?.cost === "number" ? custom.addons.waterSumpSeptic.cost : DEFAULT_ADDONS.waterSumpSeptic.cost,
      },
      boundaryGate: {
        title: custom.addons?.boundaryGate?.title || DEFAULT_ADDONS.boundaryGate.title,
        subtitle: custom.addons?.boundaryGate?.subtitle || DEFAULT_ADDONS.boundaryGate.subtitle,
        cost: typeof custom.addons?.boundaryGate?.cost === "number" ? custom.addons.boundaryGate.cost : DEFAULT_ADDONS.boundaryGate.cost,
      },
      solarRooftop: {
        title: custom.addons?.solarRooftop?.title || DEFAULT_ADDONS.solarRooftop.title,
        subtitle: custom.addons?.solarRooftop?.subtitle || DEFAULT_ADDONS.solarRooftop.subtitle,
        cost: typeof custom.addons?.solarRooftop?.cost === "number" ? custom.addons.solarRooftop.cost : DEFAULT_ADDONS.solarRooftop.cost,
      },
    },
    leadModal: {
      limitReachedTitle:
        custom.leadModal?.limitReachedTitle ||
        DEFAULT_ESTIMATOR_CMS_CONFIG.leadModal?.limitReachedTitle,
      limitReachedSubtitle:
        custom.leadModal?.limitReachedSubtitle ||
        DEFAULT_ESTIMATOR_CMS_CONFIG.leadModal?.limitReachedSubtitle,
    },
  };
}
