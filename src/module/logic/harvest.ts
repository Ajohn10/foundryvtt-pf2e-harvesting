import { determineDegreeOfSuccess, getHarvestOutcome } from "./degreeOfSuccess";
import { getHarvestValue } from "../config/wealth";
import { getMaterialsForTraits, getPf2eLevelDc } from "./tables";
import type { HarvestResult, HarvestSkillSlug } from "./types";

type SkillMap = Record<string, { mod?: number }>;

interface Pf2eSystemData {
  details?: {
    level?: {
      value?: number;
    };
  };
  traits?: {
    value?: string[];
  };
  skills?: SkillMap;
}

interface ActorWithPf2eFields {
  system?: Pf2eSystemData;
  skills?: SkillMap;
}

export async function executeHarvest(actor: Actor, performerId: string, skill: HarvestSkillSlug): Promise<HarvestResult | null> {
  const target = actor as ActorWithPf2eFields;
  const level = Number(target.system?.details?.level?.value ?? 0);
  const traits = target.system?.traits?.value ?? [];
  const dc = getPf2eLevelDc(level);

  const harvester = game.actors?.get(performerId);
  if (!harvester) {
    ui.notifications?.warn("Select a performer actor before harvesting.");
    return null;
  }

  const modifier = getSkillModifier(harvester, skill);
  const roll = await new Roll("1d20 + @mod", { mod: modifier }).evaluate();
  const d20 = Number(roll.dice[0]?.results?.[0]?.result ?? 0);
  const total = roll.total ?? d20 + modifier;

  const degree = determineDegreeOfSuccess({ total, d20, dc });
  const outcome = getHarvestOutcome(degree);
  const materialPool = getMaterialsForTraits(traits);
  const partValue = getHarvestValue(level);

  const materials: string[] = [];
  for (let index = 0; index < outcome.partCount; index += 1) {
    materials.push(drawMaterial(materialPool));
  }
  for (let index = 0; index < outcome.damagedCount; index += 1) {
    materials.push(`Damaged ${drawMaterial(materialPool)}`);
  }

  const totalValue = outcome.partCount * partValue + outcome.damagedCount * (partValue / 2);

  return {
    creatureName: actor.name ?? "Unknown Creature",
    skill,
    dc,
    rollTotal: total,
    d20,
    degree,
    materials,
    totalValue
  };
}

function getSkillModifier(actor: Actor, skill: HarvestSkillSlug): number {
  const typedActor = actor as ActorWithPf2eFields;

  const fromTopLevel = typedActor.skills?.[skill]?.mod;
  if (typeof fromTopLevel === "number") return fromTopLevel;

  const fromSystem = typedActor.system?.skills?.[skill]?.mod;
  if (typeof fromSystem === "number") return fromSystem;

  return 0;
}

function drawMaterial(pool: string[]): string {
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? "Monster Material";
}
