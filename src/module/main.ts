import { registerActorSheetHooks } from "./hooks/actorSheet";
import { registerSettings } from "./hooks/settings";

Hooks.once("init", () => {
  console.log("PF2e Monster Harvesting | Initializing");
  registerSettings();
  registerActorSheetHooks();
});

Hooks.once("ready", () => {
  console.log("PF2e Monster Harvesting | Ready");
});