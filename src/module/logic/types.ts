export type HarvestSkillSlug = "survival" | "crafting" | "arcana" | "nature" | "occultism" | "religion";

export type DegreeOfSuccess = "criticalSuccess" | "success" | "failure" | "criticalFailure";

export interface HarvestRollData {
  total: number;
  d20: number;
  dc: number;
}

export interface HarvestOutcome {
  degree: DegreeOfSuccess;
  partCount: number;
  damagedCount: number;
}

export interface HarvestResult {
  creatureName: string;
  skill: HarvestSkillSlug;
  dc: number;
  rollTotal: number;
  d20: number;
  degree: DegreeOfSuccess;
  matchedTraits: string[];
  materials: string[];
  totalValue: number;
}
