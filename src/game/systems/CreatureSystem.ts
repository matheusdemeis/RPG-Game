import { species } from '../data/creatures';
import type { Creature, GameState, SpeciesId } from '../types';

export const MAX_LEVEL = 30;
export function stats(c: Creature) {
  const b = species[c.species].base;
  return {
    hp: b.hp + c.level * 4,
    attack: b.attack + c.level * 2,
    defense: b.defense + c.level * 2,
    speed: b.speed + c.level,
  };
}
export function createCreature(id: SpeciesId, level = 5): Creature {
  const creature: Creature = { uid: crypto.randomUUID(), species: id, level, hp: 0, xp: 0 };
  creature.hp = stats(creature).hp;
  return creature;
}
export const xpToNext = (level: number) => level * 16;
export function gainExperience(c: Creature, amount: number): number {
  if (c.level >= MAX_LEVEL) return 0;
  c.xp += Math.max(0, Math.floor(amount));
  let levels = 0;
  while (c.level < MAX_LEVEL && c.xp >= xpToNext(c.level)) {
    c.xp -= xpToNext(c.level);
    const oldMax = stats(c).hp;
    c.level++;
    levels++;
    c.hp = Math.min(stats(c).hp, c.hp + stats(c).hp - oldMax);
  }
  if (c.level === MAX_LEVEL) c.xp = 0;
  return levels;
}
export function activeCreature(state: GameState): Creature | undefined {
  return state.creatures.find((c) => c.uid === state.activeUid);
}
export function healParty(state: GameState) {
  for (const c of state.creatures) c.hp = stats(c).hp;
}
export function chooseLead(state: GameState, uid: string): boolean {
  const c = state.creatures.find((c) => c.uid === uid);
  if (!c || c.hp <= 0) return false;
  state.activeUid = uid;
  return true;
}
