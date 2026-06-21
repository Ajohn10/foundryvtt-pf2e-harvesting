import type { HarvestSkillSlug } from "../logic/types";

interface SkillOption {
  slug: HarvestSkillSlug;
  label: string;
  isDefault: boolean;
}

interface PerformerOption {
  id: string;
  label: string;
  isDefault: boolean;
}

export interface HarvestPromptResult {
  performerId: string;
  skill: HarvestSkillSlug;
}

const SKILL_OPTIONS: SkillOption[] = [
  { slug: "survival", label: "Survival", isDefault: true },
  { slug: "crafting", label: "Crafting", isDefault: true },
  { slug: "arcana", label: "Arcana", isDefault: false },
  { slug: "nature", label: "Nature", isDefault: false },
  { slug: "occultism", label: "Occultism", isDefault: false },
  { slug: "religion", label: "Religion", isDefault: false }
];

export async function promptHarvest(creatureName: string): Promise<HarvestPromptResult | null> {
  return new Promise<HarvestPromptResult | null>((resolve) => {
    let settled = false;
    const performerOptions = getPerformerOptions();
    const performerMarkup = performerOptions.map((option) => {
      const selected = option.isDefault ? " selected" : "";
      const tag = option.isDefault ? " (selected)" : "";
      return `<option value="${option.id}"${selected}>${option.label}${tag}</option>`;
    }).join("");
    const options = SKILL_OPTIONS.map((option) => {
      const selected = option.isDefault ? " selected" : "";
      const tag = option.isDefault ? " (default)" : "";
      return `<option value="${option.slug}"${selected}>${option.label}${tag}</option>`;
    }).join("");

    const dialog = new Dialog({
      title: `Harvest Monster Parts: ${creatureName}`,
      content: `
        <form>
          <div class="form-group">
            <label for="pf2e-harvest-performer">Performing Actor</label>
            <select id="pf2e-harvest-performer" name="performer">${performerMarkup}</select>
          </div>
          <div class="form-group">
            <label for="pf2e-harvest-skill">Skill</label>
            <select id="pf2e-harvest-skill" name="skill">${options}</select>
          </div>
        </form>
      `,
      buttons: {
        roll: {
          label: "Roll Harvest",
          callback: (html) => {
            const performerValue = html.find("#pf2e-harvest-performer").val();
            const value = html.find("#pf2e-harvest-skill").val();
            settled = true;
            resolve({
              performerId: typeof performerValue === "string" ? performerValue : performerOptions[0]?.id ?? "",
              skill: (typeof value === "string" ? value : "survival") as HarvestSkillSlug
            });
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
            settled = true;
            resolve(null);
          }
        }
      },
      default: "roll",
      close: () => {
        if (!settled) resolve(null);
      }
    });

    dialog.render(true);
  });
}

function getPerformerOptions(): PerformerOption[] {
  const actors = game.actors?.contents ?? [];
  const defaultActorId = game.user?.character?.id;

  return actors
    .map((actor) => {
      const type = getActorType(actor);
      return {
        id: actor.id,
        type,
        label: `${actor.name ?? "Unnamed Actor"} (${type})`,
        isDefault: actor.id === defaultActorId
      };
    })
    .filter((actor) => actor.type === "character" || actor.type === "npc")
    .sort((left, right) => {
      const leftRank = left.type === "character" ? 0 : 1;
      const rightRank = right.type === "character" ? 0 : 1;

      if (leftRank !== rightRank) return leftRank - rightRank;
      return left.label.localeCompare(right.label);
    })
    .map(({ id, label, isDefault }) => ({ id, label, isDefault }));
}

function getActorType(actor: Actor): string {
  return (actor as { type?: string }).type ?? "base";
}
