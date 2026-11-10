import { describe, expect, it } from 'vitest';
import { BattleSystem, damage, effectiveness, turnOrder } from '../src/game/systems/BattleSystem';
import { createCreature, gainExperience, stats, xpToNext } from '../src/game/systems/CreatureSystem';
import { EncounterSystem } from '../src/game/systems/EncounterSystem';
import { moves } from '../src/game/data/moves';
import { newGame } from '../src/game/state/GameSession';

function setup(){const state=newGame();const player=createCreature('solkit');state.creatures=[player];state.activeUid=player.uid;state.starter='solkit';state.quest='explore';return {state,player};}
describe('combat rules',()=>{
  it('forms the Fire > Nature > Water > Fire cycle',()=>{
    expect(effectiveness('Fire','Nature')).toBe(1.6);expect(effectiveness('Nature','Water')).toBe(1.6);expect(effectiveness('Water','Fire')).toBe(1.6);
    expect(effectiveness('Fire','Water')).toBe(.65);expect(effectiveness('Fire','Fire')).toBe(1);expect(effectiveness(null,'Fire')).toBe(1);
  });
  it('scales damage by defense and effectiveness with a floor of one',()=>{
    const fire=createCreature('solkit'),nature=createCreature('mossling'),water=createCreature('brooklet');
    expect(damage(fire,nature,moves.ember!)).toBeGreaterThan(damage(fire,water,moves.ember!));
    expect(damage(fire,nature,moves.nudge!)).toBeGreaterThan(0);
    expect(damage(fire,nature,moves.nest!)).toBe(0);
    const highDefense=createCreature('mossling',20);expect(damage(fire,nature,moves.nudge!)).toBeGreaterThan(damage(fire,highDefense,moves.nudge!));
  });
  it('orders by speed, with deterministic player advantage on ties',()=>{
    expect(turnOrder(createCreature('solkit'),createCreature('brooklet'))).toEqual(['player','wild']);
    expect(turnOrder(createCreature('brooklet'),createCreature('solkit'))).toEqual(['wild','player']);
    expect(turnOrder(createCreature('solkit'),createCreature('solkit'))[0]).toBe('player');
  });
  it('resolves victory without retaliation or duplicate rewards',()=>{
    const {state,player}=setup();const wild=createCreature('mossling',3);wild.hp=1;
    const battle=new BattleSystem(state,wild,()=>.1);battle.act('ember');
    expect(battle.outcome).toBe('victory');expect(player.hp).toBe(stats(player).hp);expect(state.quest).toBe('investigate');
    const xp=player.xp;expect(battle.act('ember')).toEqual([]);expect(player.xp).toBe(xp);expect(state.battlesWon).toBe(1);
  });
  it('prevents fainted creatures from attacking and reports defeat',()=>{
    const {state,player}=setup();player.hp=1;const wild=createCreature('brooklet',20);const hp=wild.hp;
    const battle=new BattleSystem(state,wild,()=>.1);battle.act('ember');expect(battle.outcome).toBe('defeat');expect(wild.hp).toBe(hp);
  });
  it('allows misses and caps recovery at max HP',()=>{
    const {state}=setup();const wild=createCreature('mossling');const battle=new BattleSystem(state,wild,()=>.99);
    expect(battle.act('flare')[0]).toContain('missed');
    battle.player.hp=stats(battle.player).hp;expect(battle.act('nest')[0]).toContain('0 HP');
  });
});
describe('progression',()=>{
  it('carries experience across multiple levels and preserves HP deficit',()=>{
    const c=createCreature('solkit');c.hp-=10;
    expect(gainExperience(c,xpToNext(5)+xpToNext(6)+7)).toBe(2);expect(c.level).toBe(7);expect(c.xp).toBe(7);expect(stats(c).hp-c.hp).toBe(10);
  });
  it('caps level and discards excess experience at the cap',()=>{const c=createCreature('brooklet',29);gainExperience(c,50000);expect(c.level).toBe(30);expect(c.xp).toBe(0);});
  it('avoids encounters without a starter and guarantees an introductory encounter',()=>{
    const e=new EncounterSystem(()=>1);for(let i=0;i<20;i++)expect(e.step(true,false,true)).toBe(false);
    expect(e.step(true,true,true)).toBe(false);expect(e.step(true,true,true)).toBe(false);expect(e.step(true,true,true)).toBe(true);
    e.protect(4);for(let i=0;i<4;i++)expect(e.step(true,true,true)).toBe(false);
  });
});
