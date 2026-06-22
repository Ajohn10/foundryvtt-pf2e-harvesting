import { isNpcActor, startHarvestWorkflow } from "../ui/harvestWorkflow";

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
  button.innerHTML = '<i class="fa-solid fa-drumstick-bite"></i>Harvest ';

  button.addEventListener("click", async () => {
    await startHarvestWorkflow(actor);
  });

  target.parentElement?.insertBefore(button, target);
}

function findButtonTarget(root: HTMLElement): HTMLElement | null {
  const closeButton = root.querySelector(".window-header .close");
  return closeButton instanceof HTMLElement ? closeButton : null;
}
