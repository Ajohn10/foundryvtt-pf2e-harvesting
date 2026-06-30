import { formatDegreeLabel } from "../logic/degreeOfSuccess";
import type { HarvestResult } from "../logic/types";

export async function postHarvestChatMessage(result: HarvestResult): Promise<void> {
  const materials = result.materials.length > 0
    ? `<ul>${result.materials.map((entry) => `<li>${entry}</li>`).join("")}</ul>`
    : "<p>None</p>";

  const content = `
    <section class="pf2e-monster-harvest">
      <h3>Monster Harvest Result</h3>
      <p><strong>Creature:</strong> ${result.creatureName}</p>
      <p><strong>Skill Used:</strong> ${capitalize(result.skill)}</p>
      <p><strong>DC:</strong> ${result.dc}</p>
      <p><strong>Roll Result:</strong> ${result.rollTotal} (d20: ${result.d20})</p>
      <p><strong>Degree of Success:</strong> ${formatDegreeLabel(result.degree)}</p>
      <p><strong>Harvested Materials:</strong></p>
      ${materials}
      <p><strong>Total Material Value:</strong> ${formatGp(result.totalValue)}</p>
    </section>
  `;

  const chatData = ChatMessage.applyRollMode({
    speaker: ChatMessage.getSpeaker(),
    content
  }, "roll");

  await ChatMessage.create(chatData);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatGp(value: number): string {
  const normalized = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  return `${normalized} gp`;
}
