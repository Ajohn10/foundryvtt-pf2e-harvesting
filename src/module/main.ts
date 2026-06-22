import { registerActorSheetHooks } from "./hooks/actorSheet";
import { registerSettings } from "./hooks/settings";
import { registerTokenContextMenuHooks } from "./ui/token-context";
import "../styles/module.scss";

Hooks.once("init", () => {
  console.log("PF2e Monster Harvesting | Initializing");
  registerSettings();
  registerActorSheetHooks();
  registerTokenContextMenuHooks();
});

Hooks.once("ready", () => {
  console.log("PF2e Monster Harvesting | Ready");
});