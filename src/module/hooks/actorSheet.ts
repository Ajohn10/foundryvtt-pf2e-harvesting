import { executeHarvest } from "../logic/harvest";
import { postHarvestChatMessage } from "../ui/chat";
import { promptHarvest } from "../ui/harvestDialog";

const HARVEST_BUTTON_CLASS = "pf2e-monster-harvest-button";

interface SheetAppLike {
  actor?: Actor;
}

export function registerActorSheetHooks(): void {
  Hooks.on("renderActorSheet", (_app: unknown, html: JQuery, data: unknown) => {
    void addHarvestButton(_app as SheetAppLike, html, data);
  });
}

async function addHarvestButton(app: SheetAppLike, html: JQuery, _data: unknown): Promise<void> {
  const actor = app.actor;
  if (!actor || !isNpcActor(actor)) return;

  const root = html[0] as HTMLElement | undefined;
  if (!root) return;

  if (root.querySelector(`.${HARVEST_BUTTON_CLASS}`)) return;

  const target = findButtonTarget(root);
  if (!target) return;

  const button = document.createElement("a");
  button.className = `header-button control ${HARVEST_BUTTON_CLASS}`;
  button.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>Harvest ';

  button.addEventListener("click", async () => {
    const promptResult = await promptHarvest(actor.name ?? "Creature");
    if (!promptResult) return;

    const result = await executeHarvest(actor, promptResult.performerId, promptResult.skill);
    if (!result) return;

    await postHarvestChatMessage(result);
  });

  target.parentElement?.insertBefore(button, target);
}

function isNpcActor(actor: Actor): boolean {
  const typed = actor as { type?: string };
  return typed.type === "npc";
}

function findButtonTarget(root: HTMLElement): HTMLElement | null {
  const closeButton = root.querySelector(".window-header .close");
  return closeButton instanceof HTMLElement ? closeButton : null;
}
