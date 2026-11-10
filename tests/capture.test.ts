import { describe, expect, it } from 'vitest';
import { captureChance, canCapture, COLLECTION_LIMIT } from '../src/game/systems/CaptureSystem';
import { createCreature, chooseLead, stats } from '../src/game/systems/CreatureSystem';
import { newGame } from '../src/game/state/GameSession';
import { BattleSystem } from '../src/game/systems/BattleSystem';

function setup(random:()=>number){const state=newGame();const c=createCreature('solkit');state.creatures=[c];state.starter='solkit';state.activeUid=c.uid;state.quest='explore';return new BattleSystem(state,createCreature('brooklet',3),random);}
describe('capture and inventory',()=>{
  it('increases capture chance as HP falls and forbids fainted targets',()=>{
    const c=createCreature('mossling');const full=captureChance(c);expect(full).toBeCloseTo(.22);
    c.hp=1;expect(captureChance(c)).toBeGreaterThan(full);expect(captureChance(c)).toBeLessThanOrEqual(.9);
    c.hp=0;expect(captureChance(c)).toBe(0);
  });
  it('consumes one prism, adds the creature, and advances the quest on success',()=>{
    const b=setup(()=>0);b.capture();expect(b.outcome).toBe('captured');expect(b.state.inventory.prisms).toBe(7);expect(b.state.creatures).toHaveLength(2);expect(b.state.quest).toBe('investigate');
    b.capture();expect(b.state.inventory.prisms).toBe(7);expect(b.state.creatures).toHaveLength(2);
  });
  it('spends a failed capture turn and permits retaliation',()=>{
    const b=setup(()=>.5),hp=b.player.hp;b.capture();expect(b.outcome).toBe('active');expect(b.player.hp).toBeLessThan(hp);expect(b.state.inventory.prisms).toBe(7);expect(b.state.creatures).toHaveLength(1);
  });
  it('prevents attempts without prisms or when the collection is full',()=>{
    const b=setup(()=>0);b.state.inventory.prisms=0;b.capture();expect(b.outcome).toBe('active');expect(b.state.inventory.prisms).toBe(0);
    b.state.inventory.prisms=2;while(b.state.creatures.length<COLLECTION_LIMIT)b.state.creatures.push(createCreature('mossling'));
    expect(canCapture(b.state,b.wild)).toBe(false);
  });
  it('uses tonics only when needed and never exceeds maximum HP',()=>{
    const b=setup(()=>.99);b.tonic();expect(b.state.inventory.tonics).toBe(3);
    b.player.hp-=10;b.tonic();expect(b.state.inventory.tonics).toBe(2);expect(b.player.hp).toBeLessThanOrEqual(stats(b.player).hp);
  });
  it('allows healthy collection members to lead, but refuses fainted creatures',()=>{
    const b=setup(()=>0);const c=createCreature('mossling');b.state.creatures.push(c);
    expect(chooseLead(b.state,c.uid)).toBe(true);expect(b.state.activeUid).toBe(c.uid);
    c.hp=0;expect(chooseLead(b.state,c.uid)).toBe(false);expect(chooseLead(b.state,'missing')).toBe(false);
  });
  it('switches a fainted leader without giving the incoming creature a free move',()=>{
    const b=setup(()=>.1);b.player.hp=1;const backup=createCreature('mossling');b.state.creatures.push(backup);
    b.wild.level=25;const hp=b.wild.hp;b.act('ember');expect(b.outcome).toBe('active');expect(b.state.activeUid).toBe(backup.uid);expect(b.wild.hp).toBe(hp);
  });
});
