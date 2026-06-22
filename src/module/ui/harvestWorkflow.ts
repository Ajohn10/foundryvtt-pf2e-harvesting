import { executeHarvest } from "../logic/harvest";
import { postHarvestChatMessage } from "./chat";
import { promptHarvest } from "./harvestDialog";

export interface HarvestWorkflowOptions {
  preferredPerformerId?: string;
  performerIds?: string[];
}

export async function startHarvestWorkflow(targetActor: Actor, token?: Token): Promise<void> {
  const performerIds = getHarvestPerformerIds();
  if (performerIds.length === 0) {
    ui.notifications?.warn("No valid harvester available. Select a token or assign a user character.");
    return;
  }

  const promptResult = await promptHarvest(targetActor.name ?? "Creature", {
    preferredPerformerId: performerIds[0],
    performerIds
  });
  if (!promptResult) return;

  const result = await executeHarvest(targetActor, promptResult.performerId, promptResult.skill);
  if (!result) return;

  await postHarvestChatMessage(result);
}

export function isNpcActor(actor: Actor): boolean {
  return getActorType(actor) === "npc";
}

export function isHarvestableActor(actor: Actor): boolean {
  if (!isNpcActor(actor)) return false;

  const hp = getActorHpValue(actor);
  if (hp === null) return true;

  if (hp >= 0) return true;
  return hasRecentDeathCondition(actor);
}

export function resolvePreferredHarvesterId(): string | undefined {
  const controlledActorId = canvas?.tokens?.controlled?.[0]?.actor?.id;
  if (controlledActorId) return controlledActorId;

  const userCharacterId = game.user?.character?.id;
  if (userCharacterId) return userCharacterId;

  return undefined;
}

export function getOwnedCharacterIds(): string[] {
  const actors = game.actors?.contents ?? [];
  return actors
    .filter((actor) => getActorType(actor) === "character" && actor.isOwner)
    .map((actor) => actor.id);
}

function getHarvestPerformerIds(): string[] {
  return uniqueIds([
    ...(resolvePreferredHarvesterId() ? [resolvePreferredHarvesterId() as string] : []),
    ...getOwnedCharacterIds()
  ]);
}

function getActorHpValue(actor: Actor): number | null {
  const typed = actor as {
    system?: {
      attributes?: {
        hp?: {
          value?: number;
        };
      };
    };
  };

  const value = typed.system?.attributes?.hp?.value;
  return typeof value === "number" ? value : null;
}

function hasRecentDeathCondition(actor: Actor): boolean {
  const typed = actor as {
    itemTypes?: {
      condition?: Array<{ slug?: string }>;
    };
  };

  const conditions = typed.itemTypes?.condition ?? [];
  return conditions.some((condition) => {
    const slug = condition.slug ?? "";
    return slug === "dead" || slug === "dying" || slug === "unconscious";
  });
}

function getActorType(actor: Actor): string {
  return (actor as { type?: string }).type ?? "base";
}

function uniqueIds(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.length > 0)));
}
