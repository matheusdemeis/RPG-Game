import { describe, expect, it } from 'vitest';
import { areas, canWalk, toTiled } from '../src/game/data/maps';
import { DialogueSystem } from '../src/game/systems/DialogueSystem';

describe('world navigation', () => {
  for (const area of Object.values(areas)) {
    it(`${area.id} has a reachable exit and interactable characters`, () => {
      const start = area.id === 'willowmere' ? [18,20] : [20,27];
      const seen = new Set<string>(); const queue = [start];
      while(queue.length) {
        const [x,y] = queue.shift()! as [number,number];
        if(seen.has(`${x},${y}`)||!canWalk(area,x,y))continue;
        seen.add(`${x},${y}`); queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
      }
      expect(seen.has(`${area.exit.x},${area.exit.y}`)).toBe(true);
      for(const npc of area.npcs) expect([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has(`${npc.x+dx!},${npc.y+dy!}`))).toBe(true);
      expect(canWalk(area,-1,0)).toBe(false);
      for(const npc of area.npcs) expect(canWalk(area,npc.x,npc.y)).toBe(false);
      for(const o of area.objects) expect(canWalk(area,o.x,o.y)).toBe(false);
    });
    it(`${area.id} exports valid Tiled layer sizes`,()=>{
      const tiled=toTiled(area);
      expect(tiled.layers[0]!.data).toHaveLength(tiled.width*tiled.height);
      expect(tiled.layers[1]!.data).toHaveLength(tiled.width*tiled.height);
    });
  }
});

it('dialogue finishes once after its last line',()=>{
  const d=new DialogueSystem();let calls=0;
  d.start('Liora',['One','Two'],()=>calls++);
  expect(d.active).toBe(true);d.advance();expect(d.text).toBe('Two');
  d.advance();d.advance();expect(d.active).toBe(false);expect(calls).toBe(1);
});
