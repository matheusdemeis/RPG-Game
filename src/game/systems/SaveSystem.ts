import type { Creature, Facing, GameState, MapId, QuestStage, SpeciesId } from '../types';
import { speciesIds } from '../data/creatures';
import { areas, canWalk } from '../data/maps';
import { MAX_LEVEL, stats, xpToNext } from './CreatureSystem';
import { COLLECTION_LIMIT } from './CaptureSystem';

export const SAVE_KEY = 'echowild.save.v1';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
type LoadResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: 'missing' | 'invalid' | 'unavailable' };
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const integer = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const member = <T extends string>(v: unknown, values: readonly T[]): v is T =>
  typeof v === 'string' && values.includes(v as T);
const validUid = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(v);

/** Parse an untrusted save into a fresh, canonical object. Unknown fields are discarded. */
export function validateSave(value: unknown): GameState | null {
  if (
    !record(value) ||
    value.version !== 1 ||
    !record(value.player) ||
    !record(value.inventory) ||
    !Array.isArray(value.creatures)
  )
    return null;
  const p = value.player,
    i = value.inventory;
  if (
    !member<MapId>(p.map, ['willowmere', 'trail']) ||
    !integer(p.x, 0, 39) ||
    !integer(p.y, 0, 29) ||
    !member<Facing>(p.facing, ['up', 'down', 'left', 'right']) ||
    !canWalk(areas[p.map], p.x, p.y)
  )
    return null;
  if (
    !integer(i.prisms, 0, 999) ||
    !integer(i.tonics, 0, 999) ||
    !integer(value.battlesWon, 0, 1000000) ||
    !integer(value.playSeconds, 0, 1000000000)
  )
    return null;
  if (
    !member<QuestStage>(value.quest, ['meet', 'explore', 'investigate', 'return', 'complete']) ||
    value.creatures.length > COLLECTION_LIMIT
  )
    return null;
  const creatures: Creature[] = [];
  const uids = new Set<string>();
  for (const c of value.creatures) {
    if (
      !record(c) ||
      !validUid(c.uid) ||
      uids.has(c.uid) ||
      !member<SpeciesId>(c.species, speciesIds) ||
      !integer(c.level, 1, MAX_LEVEL) ||
      !integer(c.hp, 0, 200) ||
      !integer(c.xp, 0, xpToNext(c.level) - 1)
    )
      return null;
    const creature: Creature = {
      uid: c.uid,
      species: c.species,
      level: c.level,
      hp: c.hp,
      xp: c.xp,
    };
    if (c.hp > stats(creature).hp || (c.level === MAX_LEVEL && c.xp !== 0)) return null;
    creatures.push(creature);
    uids.add(c.uid);
  }
  const starter = value.starter,
    activeUid = value.activeUid;
  if (starter === null) {
    if (
      creatures.length !== 0 ||
      activeUid !== null ||
      value.quest !== 'meet' ||
      value.battlesWon !== 0
    )
      return null;
  } else {
    if (
      !member<SpeciesId>(starter, speciesIds) ||
      !creatures.some((c) => c.species === starter) ||
      !validUid(activeUid) ||
      !creatures.some((c) => c.uid === activeUid && c.hp > 0) ||
      value.quest === 'meet'
    )
      return null;
  }
  if (['investigate', 'return', 'complete'].includes(value.quest) && value.battlesWon === 0)
    return null;
  return {
    version: 1,
    player: { map: p.map, x: p.x, y: p.y, facing: p.facing },
    starter,
    creatures,
    activeUid,
    inventory: { prisms: i.prisms, tonics: i.tonics },
    quest: value.quest,
    battlesWon: value.battlesWon,
    playSeconds: value.playSeconds,
  };
}
export function serializeSave(state: GameState): string {
  const valid = validateSave(state);
  if (!valid) throw new Error('The current game state cannot be saved.');
  return JSON.stringify(valid);
}
export function parseSave(raw: string): GameState | null {
  if (raw.length > 100000) return null;
  try {
    return validateSave(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}
export function loadGame(storage?: StorageLike): LoadResult {
  try {
    const raw = (storage ?? localStorage).getItem(SAVE_KEY);
    if (raw === null) return { ok: false, reason: 'missing' };
    const state = parseSave(raw);
    return state ? { ok: true, state } : { ok: false, reason: 'invalid' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
export function saveGame(
  state: GameState,
  storage?: StorageLike,
): { ok: boolean; message: string } {
  try {
    (storage ?? localStorage).setItem(SAVE_KEY, serializeSave(state));
    return { ok: true, message: 'Journey saved on this browser.' };
  } catch {
    return {
      ok: false,
      message:
        'Could not save. Browser storage may be unavailable or full. Keep this tab open to continue playing.',
    };
  }
}
