import { getSetting } from "../foundry/settings";

export const MODULE_ID = "pf2e-monster-harvesting";
export const HARVEST_WEALTH_TIER_SETTING_KEY = "harvestWealthTier";

export const HARVEST_WEALTH_TIER = {
  CONSERVATIVE: "conservative",
  STANDARD: "standard",
  HARVEST_CENTRIC: "harvest-centric"
} as const;

export type HarvestWealthTier = (typeof HARVEST_WEALTH_TIER)[keyof typeof HARVEST_WEALTH_TIER];

interface WealthBracket {
  min: number;
  max: number | null;
  value: number;
}

const SHARED_WEALTH_BRACKETS: Array<{ min: number; max: number | null }> = [
  { min: 0, max: 1 },
  { min: 2, max: 3 },
  { min: 4, max: 5 },
  { min: 6, max: 7 },
  { min: 8, max: 9 },
  { min: 10, max: 11 },
  { min: 12, max: 13 },
  { min: 14, max: 15 },
  { min: 16, max: 17 },
  { min: 18, max: 19 },
  { min: 20, max: null }
];

function buildBrackets(values: number[]): WealthBracket[] {
  return SHARED_WEALTH_BRACKETS.map((range, index) => ({
    min: range.min,
    max: range.max,
    value: values[index] ?? values[values.length - 1] ?? 0
  }));
}

export const HARVEST_WEALTH_TABLES: Record<HarvestWealthTier, WealthBracket[]> = {
  [HARVEST_WEALTH_TIER.CONSERVATIVE]: buildBrackets([1, 2, 5, 10, 15, 25, 40, 50, 100, 200, 500]),
  [HARVEST_WEALTH_TIER.STANDARD]: buildBrackets([3, 5, 15, 25, 50, 75, 125, 200, 400, 800, 2000]),
  [HARVEST_WEALTH_TIER.HARVEST_CENTRIC]: buildBrackets([5, 10, 25, 50, 100, 150, 250, 500, 800, 1500, 5000])
};

export function getHarvestWealthTier(): HarvestWealthTier {
  const value = getSetting(MODULE_ID, HARVEST_WEALTH_TIER_SETTING_KEY);
  if (isHarvestWealthTier(value)) return value;
  return HARVEST_WEALTH_TIER.CONSERVATIVE;
}

export function getHarvestValue(level: number): number {
  const normalizedLevel = Math.max(0, Math.floor(level));
  const tier = getHarvestWealthTier();
  const table = HARVEST_WEALTH_TABLES[tier];

  const bracket = table.find((entry) => {
    if (entry.max === null) return normalizedLevel >= entry.min;
    return normalizedLevel >= entry.min && normalizedLevel <= entry.max;
  });

  return bracket?.value ?? table[table.length - 1]?.value ?? 0;
}

function isHarvestWealthTier(value: unknown): value is HarvestWealthTier {
  return typeof value === "string" && Object.values(HARVEST_WEALTH_TIER).includes(value as HarvestWealthTier);
}
