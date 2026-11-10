import type { Creature, GameState } from '../types';
import { stats } from './CreatureSystem';

export const COLLECTION_LIMIT = 60;
export function captureChance(creature: Creature): number {
  if (creature.hp <= 0) return 0;
  const health = Math.min(1, creature.hp / stats(creature).hp);
  return Math.min(0.9, 0.22 + (1 - health) * 0.68);
}
export function canCapture(state: GameState, wild: Creature): boolean {
  return state.inventory.prisms > 0 && wild.hp > 0 && state.creatures.length < COLLECTION_LIMIT;
}
