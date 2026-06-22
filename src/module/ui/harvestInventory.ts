import { MODULE_ID } from "../config/wealth";
import type { HarvestResult } from "../logic/types";

interface CoinValueLike {
  cp?: number;
  sp?: number;
  gp?: number;
  pp?: number;
}

export async function createOrUpdateHarvestInventoryItem(performerId: string, result: HarvestResult): Promise<void> {
  const performer = game.actors?.get(performerId);
  if (!performer) return;

  const harvestedCopper = gpToCopper(result.totalValue);
  if (harvestedCopper <= 0) return;

  const itemName = `${result.creatureName} Materials`;
  const existingItem = performer.items?.getName(itemName);
  const harvestFlags = {
    creatureName: result.creatureName,
    degree: result.degree,
    matchedTraits: result.matchedTraits,
    materials: result.materials,
    skill: result.skill
  };

  if (existingItem) {
    const currentCopper = getTreasureCopperValue(existingItem);
    const nextCopper = currentCopper + harvestedCopper;
    const updateData: Record<string, unknown> = {};
    foundry.utils.setProperty(updateData, "system.price.value", copperToCoinValue(nextCopper));
    foundry.utils.setProperty(updateData, `flags.${MODULE_ID}.harvest`, harvestFlags);
    await existingItem.update(updateData);
    return;
  }

  const createData: { name: string; type: string } & Record<string, unknown> = {
    name: itemName,
    type: "treasure"
  };
  foundry.utils.setProperty(createData, "system.price.value", copperToCoinValue(harvestedCopper));
  foundry.utils.setProperty(createData, `flags.${MODULE_ID}.harvest`, harvestFlags);
  const actorDocument = performer as unknown as {
    createEmbeddedDocuments(embeddedName: string, data: object[]): Promise<unknown>;
  };
  await actorDocument.createEmbeddedDocuments("Item", [createData]);
}

function getTreasureCopperValue(item: Item): number {
  const value = (item as { system?: { price?: { value?: unknown } } }).system?.price?.value;
  if (typeof value === "number") return gpToCopper(value);
  if (typeof value === "string") return gpToCopper(Number(value) || 0);
  if (isCoinValueLike(value)) {
    const cp = Number(value.cp ?? 0);
    const sp = Number(value.sp ?? 0);
    const gp = Number(value.gp ?? 0);
    const pp = Number(value.pp ?? 0);
    return cp + sp * 10 + gp * 100 + pp * 1000;
  }
  return 0;
}

function gpToCopper(gpValue: number): number {
  return Math.round(gpValue * 100);
}

function copperToCoinValue(totalCopper: number): CoinValueLike {
  const safeCopper = Math.max(0, Math.floor(totalCopper));
  const gp = Math.floor(safeCopper / 100);
  const spRemainder = safeCopper % 100;
  const sp = Math.floor(spRemainder / 10);
  const cp = spRemainder % 10;

  return {
    ...(gp > 0 ? { gp } : {gp : 0}),
    ...(sp > 0 ? { sp } : {sp : 0}),
    ...(cp > 0 ? { cp } : {cp : 0})
  };
}

function isCoinValueLike(value: unknown): value is CoinValueLike {
  return typeof value === "object" && value !== null;
}