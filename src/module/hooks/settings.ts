import {
  HARVEST_WEALTH_TIER,
  HARVEST_WEALTH_TIER_SETTING_KEY,
  MODULE_ID,
  type HarvestWealthTier
} from "../config/wealth";
import { registerSetting } from "../foundry/settings";

export function registerSettings(): void {
  registerSetting(MODULE_ID, HARVEST_WEALTH_TIER_SETTING_KEY, {
    name: "Harvest Wealth Tier",
    hint: "Determines the amount of value generated from harvested monster parts.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      [HARVEST_WEALTH_TIER.CONSERVATIVE]: "Conservative",
      [HARVEST_WEALTH_TIER.STANDARD]: "Standard",
      [HARVEST_WEALTH_TIER.HARVEST_CENTRIC]: "Harvest-Centric"
    },
    default: HARVEST_WEALTH_TIER.CONSERVATIVE as HarvestWealthTier
  });
}
