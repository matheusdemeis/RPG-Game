import { describe, expect, it } from 'vitest';
import { BattleSystem } from '../src/game/systems/BattleSystem';
import { createCreature } from '../src/game/systems/CreatureSystem';
import { newGame } from '../src/game/state/GameSession';

function battle() {
  const state = newGame(),
    player = createCreature('solkit');
  state.creatures = [player];
  state.starter = 'solkit';
  state.activeUid = player.uid;
  state.quest = 'explore';
  return new BattleSystem(state, createCreature('mossling', 4), () => 0.1);
}
describe('battle presentation events', () => {
  it('keeps ordered, detached HP snapshots for each combatant', () => {
    const b = battle(),
      start = b.player.hp;
    const text = b.act('nudge');
    expect(b.events.map((e) => e.text)).toEqual(text);
    expect(b.events.map((e) => e.target)).toEqual(['wild', 'player']);
    expect(b.events[0]!.player.hp).toBe(start);
    expect(b.events[1]!.player.hp).toBeLessThan(start);
    const firstHp = b.events[0]!.wild.hp;
    b.wild.hp = 1;
    expect(b.events[0]!.wild.hp).toBe(firstHp);
  });
  it('presents a final hit before fainting and rewards', () => {
    const b = battle();
    b.wild.hp = 1;
    b.act('ember');
    expect(b.events.map((e) => e.kind)).toEqual(['damage', 'faint', 'reward']);
    expect(b.events[0]!.outcome).toBe('active');
    expect(b.events[1]!.outcome).toBe('victory');
    expect(b.events[2]!.player.xp).toBe(48);
    b.act('ember');
    expect(b.events).toEqual([]);
  });
  it('distinguishes self healing from retaliation', () => {
    const b = battle();
    b.player.hp = 10;
    b.tonic();
    expect(b.events[0]).toMatchObject({ kind: 'heal', target: 'player', amount: 30 });
    expect(b.events[0]!.player.hp).toBe(40);
    expect(b.events[1]).toMatchObject({ kind: 'damage', target: 'player' });
  });
  it('does not emit a damage event for a miss', () => {
    const state = newGame(),
      c = createCreature('solkit');
    state.creatures = [c];
    state.activeUid = c.uid;
    const b = new BattleSystem(state, createCreature('mossling'), () => 0.99);
    b.act('flare');
    expect(b.events.every((e) => e.kind === 'miss')).toBe(true);
  });
  it('records successful capture before experience without a retaliation', () => {
    const b = battle();
    b.capture();
    expect(b.events.map((e) => e.kind)).toEqual(['capture', 'reward']);
    expect(b.events[0]!.outcome).toBe('captured');
  });
  it('keeps fainted and incoming leader snapshots separate', () => {
    const b = battle(),
      old = b.player.uid,
      next = createCreature('brooklet');
    b.state.creatures.push(next);
    b.player.hp = 1;
    b.wild.level = 25;
    b.act('nudge');
    expect(b.events.map((e) => e.kind)).toEqual(['damage', 'faint', 'switch']);
    expect(b.events[1]!.player.uid).toBe(old);
    expect(b.events[1]!.player.hp).toBe(0);
    expect(b.events[2]!.player.uid).toBe(next.uid);
    expect(b.events[2]!.player.hp).toBe(next.hp);
  });
});
