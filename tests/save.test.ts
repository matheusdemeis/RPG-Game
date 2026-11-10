import { describe, expect, it } from 'vitest';
import {
  loadGame,
  parseSave,
  SAVE_KEY,
  saveGame,
  serializeSave,
  validateSave,
} from '../src/game/systems/SaveSystem';
import { newGame } from '../src/game/state/GameSession';
import { createCreature } from '../src/game/systems/CreatureSystem';

function progressed() {
  const s = newGame();
  const c = createCreature('brooklet');
  s.starter = 'brooklet';
  s.creatures = [c, createCreature('mossling', 3)];
  s.activeUid = c.uid;
  s.quest = 'return';
  s.battlesWon = 2;
  s.player = { map: 'trail', x: 20, y: 8, facing: 'up' };
  s.inventory.prisms = 4;
  return s;
}
describe('versioned saves', () => {
  it('round-trips a new game and complete progress without shared references', () => {
    expect(parseSave(serializeSave(newGame()))).toEqual(newGame());
    const s = progressed();
    const restored = parseSave(serializeSave(s));
    expect(restored).toEqual(s);
    expect(restored?.creatures).not.toBe(s.creatures);
  });
  it.each(['{bad', 'null', '[]', '{}', '42', '"save"'])(
    'rejects corrupted or incomplete data: %s',
    (raw) => expect(parseSave(raw)).toBeNull(),
  );
  it('rejects unsupported versions, invalid maps and obstructed positions', () => {
    const s = progressed();
    expect(validateSave({ ...s, version: 2 })).toBeNull();
    expect(validateSave({ ...s, player: { ...s.player, map: 'missing' } })).toBeNull();
    expect(validateSave({ ...s, player: { ...s.player, x: 0, y: 0 } })).toBeNull();
  });
  it('rejects invalid stats, levels, duplicate IDs, and missing party leaders', () => {
    const s = progressed();
    for (const field of [
      { hp: -1 },
      { hp: 999 },
      { level: 0 },
      { level: 31 },
      { xp: 9000 },
      { level: NaN },
      { species: 'unknown' },
    ])
      expect(validateSave({ ...s, creatures: [{ ...s.creatures[0], ...field }] })).toBeNull();
    expect(validateSave({ ...s, creatures: [s.creatures[0], s.creatures[0]] })).toBeNull();
    expect(validateSave({ ...s, activeUid: 'missing' })).toBeNull();
  });
  it('rejects impossible quest states and invalid inventory', () => {
    const s = progressed();
    expect(validateSave({ ...s, battlesWon: 0 })).toBeNull();
    expect(validateSave({ ...s, quest: 'meet' })).toBeNull();
    expect(validateSave({ ...s, inventory: { prisms: -1, tonics: 1 } })).toBeNull();
    expect(validateSave({ ...s, inventory: { prisms: 1.2, tonics: 1 } })).toBeNull();
  });
  it('discards unknown properties and limits oversized input', () => {
    const s = progressed();
    expect(validateSave({ ...s, unexpected: 'discard' })).toEqual(s);
    expect(parseSave(' '.repeat(100001))).toBeNull();
  });
  it('writes and loads from storage, and distinguishes missing and corrupt data', () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
    };
    expect(loadGame(storage)).toEqual({ ok: false, reason: 'missing' });
    expect(saveGame(progressed(), storage).ok).toBe(true);
    expect(loadGame(storage).ok).toBe(true);
    map.set(SAVE_KEY, 'broken');
    expect(loadGame(storage)).toEqual({ ok: false, reason: 'invalid' });
  });
  it('handles blocked or full browser storage without crashing', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(loadGame(storage)).toEqual({ ok: false, reason: 'unavailable' });
    expect(saveGame(newGame(), storage).ok).toBe(false);
  });
});
