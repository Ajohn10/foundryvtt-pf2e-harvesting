const TRAIT_MATERIALS: Record<string, string[]> = {
  // Core Creature Types
  animal: ["Hide", "Tooth", "Claw", "Pelt", "Sinew"],
  beast: ["Hide", "Bone", "Organ", "Fang", "Hide Scrap"],
  humanoid: ["Bone", "Blood", "Hair", "Organ"],
  dragon: ["Scale", "Fang", "Heartblood", "Draconic Hide", "Eye"],
  undead: ["Bone", "Grave Dust", "Ectoplasm", "Rot Ichor"],
  construct: ["Gear", "Crystal", "Core", "Metal Plating"],
  elemental: ["Core", "Essence", "Condensed Energy"],
  fiend: ["Horn", "Ichor", "Essence", "Hellfire Residue"],
  celestial: ["Radiant Feather", "Divine Essence", "Halo Fragment"],
  monitor: ["Planar Dust", "Balanced Essence"],
  fey: ["Glamour Dust", "Fey Wing", "Whimsy Essence"],
  ooze: ["Slime", "Gel Core", "Acidic Residue"],
  plant: ["Sap", "Fiber", "Blossom", "Root", "Spore"],
  fungus: ["Spore", "Mycelium", "Fungal Sap"],
  aberration: ["Eye", "Tentacle", "Brain Tissue", "Strange Organ"],

  // Magical / Tradition Traits
  arcane: ["Arcane Residue", "Mana Crystal"],
  divine: ["Sacred Oil", "Blessed Essence"],
  occult: ["Mind Essence", "Whisper Fragment"],
  primal: ["Wild Essence", "Spirit Sap"],

  // Energy Traits
  fire: ["Cinder", "Ember Core", "Burning Essence"],
  cold: ["Frozen Core", "Frost Crystal", "Rime Dust"],
  electricity: ["Storm Core", "Charged Filament"],
  acid: ["Corrosive Slime", "Acidic Gland"],
  sonic: ["Resonant Crystal", "Echo Shard"],
  force: ["Force Residue", "Arcane Pressure Node"],
  poison: ["Venom Sac", "Toxic Ichor"],
  mental: ["Dream Fragment", "Psychic Residue"],
  negative: ["Void Essence", "Necrotic Dust"],
  positive: ["Vital Spark", "Life Essence"],

  // Physical / Body Traits
  aquatic: ["Scale", "Gill", "Pearl"],
  amphibious: ["Moist Hide", "Gill Fragment"],
  insect: ["Chitin", "Mandible", "Wing"],
  swarm: ["Swarm Husk", "Hive Residue"],
  reptile: ["Scale", "Venom Gland"],
  avian: ["Feather", "Beak Fragment", "Talons"],

  // Planar / Rare Traits
  air: ["Bottled Breeze", "Sky Essence"],
  earth: ["Stone Core", "Crystal Shard"],
  water: ["Pure Droplet", "Tidal Essence"],
  metal: ["Ore Fragment", "Metallic Core"],
  wood: ["Living Bark", "Ancient Sap"],

  // Rare Creature Tags
  incorporeal: ["Ectoplasm", "Phantom Essence"],
  spirit: ["Spirit Fragment", "Ancestor Ash"],
  shadow: ["Shadow Essence", "Umbral Dust"],
  time: ["Temporal Shard"],
  dream: ["Dream Vapor"],
  illusion: ["Mirage Dust"],

  // Fallback Generic
  magical: ["Magical Residue", "Enchanted Fragment"]
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

export function getMatchedHarvestTraits(traits: string[]): string[] {
  const matchedTraits = new Set<string>();

  for (const trait of traits) {
    if (TRAIT_MATERIALS[trait]) matchedTraits.add(trait);
  }

  return Array.from(matchedTraits);
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
