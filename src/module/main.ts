import { registerActorSheetHooks } from "./hooks/actorSheet";

Hooks.once("init", () => {
  console.log("PF2e Monster Harvesting | Initializing");
  registerActorSheetHooks();
});

Hooks.once("ready", () => {
  console.log("PF2e Monster Harvesting | Ready");
});