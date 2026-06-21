const TRAIT_MATERIALS: Record<string, string[]> = {
  animal: ["Hide", "Tooth", "Claw"],
  beast: ["Hide", "Bone", "Organ"],
  dragon: ["Scale", "Fang", "Heartblood"],
  undead: ["Bone", "Grave Dust"],
  construct: ["Gear", "Crystal", "Core"],
  elemental: ["Core", "Essence"],
  fiend: ["Horn", "Ichor", "Essence"],
  plant: ["Sap", "Fiber", "Blossom"],
  aberration: ["Eye", "Tentacle", "Brain Tissue"]
};

export function getMaterialsForTraits(traits: string[]): string[] {
  const pool = new Set<string>();

  for (const trait of traits) {
    const mapped = TRAIT_MATERIALS[trait];
    if (!mapped) continue;

    for (const material of mapped) {
      pool.add(material);
    }
  }

  return pool.size > 0 ? Array.from(pool) : ["Monster Material"];
}

export function getPartValueByLevel(level: number): number {
  if (level <= 1) return 1;
  if (level <= 3) return 2;
  if (level <= 5) return 5;
  if (level <= 7) return 10;
  if (level <= 9) return 15;
  if (level <= 11) return 25;
  if (level <= 13) return 40;
  if (level <= 15) return 50;
  if (level <= 17) return 100;
  if (level <= 19) return 200;
  return 500;
}

const PF2E_LEVEL_DCS: Record<number, number> = {
  [-1]: 13,
  0: 14,
  1: 15,
  2: 16,
  3: 18,
  4: 19,
  5: 20,
  6: 22,
  7: 23,
  8: 24,
  9: 26,
  10: 27,
  11: 28,
  12: 30,
  13: 31,
  14: 32,
  15: 34,
  16: 35,
  17: 36,
  18: 38,
  19: 39,
  20: 40,
  21: 42,
  22: 44,
  23: 46,
  24: 48,
  25: 50
};

export function getPf2eLevelDc(level: number): number {
  if (level < -1) return 13;
  if (level in PF2E_LEVEL_DCS) return PF2E_LEVEL_DCS[level];
  if (level > 25) return 50 + (level - 25) * 2;
  return 14;
}
