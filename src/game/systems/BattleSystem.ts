import type { Creature, Element, GameState } from '../types';
import { species } from '../data/creatures';
import { moves, type Move } from '../data/moves';
import { activeCreature, gainExperience, stats } from './CreatureSystem';
import { advanceQuest } from './QuestSystem';
import { canCapture, captureChance } from './CaptureSystem';

export type BattleOutcome = 'active' | 'victory' | 'captured' | 'defeat' | 'escaped';
export function effectiveness(attack:Element|null,defense:Element):number {
  if(!attack||attack===defense)return 1;
  return ({Fire:'Nature',Nature:'Water',Water:'Fire'} as const)[attack]===defense?1.6:.65;
}
export function damage(attacker:Creature,defender:Creature,move:Move,roll=.5):number {
  if(move.kind!=='damage')return 0;
  const a=stats(attacker),d=stats(defender);
  const base=((2*attacker.level/5+2)*move.power*a.attack/d.defense)/14+2;
  return Math.max(1,Math.floor(base*effectiveness(move.element,species[defender.species].element)*(.9+Math.min(1,Math.max(0,roll))*.2)));
}
export function turnOrder(a:Creature,b:Creature):['player','wild']|['wild','player'] { return stats(a).speed>=stats(b).speed?['player','wild']:['wild','player']; }

/** Rules mutate only the provided session. Presentation consumes the returned event text. */
export class BattleSystem {
  outcome:BattleOutcome='active';
  constructor(readonly state:GameState,readonly wild:Creature,protected random:()=>number=Math.random) {}
  get player(){return activeCreature(this.state)!;}
  act(moveId:string):string[] {
    if(this.outcome!=='active')return [];
    const move=moves[moveId];if(!move||!species[this.player.species].moves.includes(moveId))return ['That move is unavailable.'];
    const logs:string[]=[];
    for(const actor of turnOrder(this.player,this.wild)) {
      if(this.outcome!=='active')break;
      const originalLead=this.state.activeUid;
      if(actor==='player')this.strike(this.player,this.wild,move,logs);
      else this.wildTurn(logs);
      this.checkEnd(logs);
      if(this.state.activeUid!==originalLead)break;
    }
    return logs;
  }
  protected strike(attacker:Creature,defender:Creature,move:Move,logs:string[]) {
    const name=species[attacker.species].name;
    if(attacker.hp<=0)return;
    if(move.kind==='restore') { const amount=Math.min(stats(attacker).hp-attacker.hp,Math.ceil(stats(attacker).hp*.3));attacker.hp+=amount;logs.push(`${name} used ${move.name} and recovered ${amount} HP.`);return; }
    if(this.random()>=move.accuracy){logs.push(`${name} used ${move.name}, but it missed!`);return;}
    const hit=damage(attacker,defender,move,this.random());defender.hp=Math.max(0,defender.hp-hit);
    const effect=effectiveness(move.element,species[defender.species].element);
    logs.push(`${name} used ${move.name}! ${hit} damage.${effect>1?' A powerful match!':effect<1?' The element was resisted.':''}`);
  }
  protected wildTurn(logs:string[]) {
    const available=species[this.wild.species].moves.filter(id=>moves[id]!.kind==='damage');
    const move=moves[available[Math.min(available.length-1,Math.floor(this.random()*available.length))]!]!;
    this.strike(this.wild,this.player,move,logs);
  }
  protected checkEnd(logs:string[]) {
    if(this.wild.hp<=0){this.outcome='victory';logs.push(`Wild ${species[this.wild.species].name} settled down.`);this.reward(logs);}
    else if(this.player.hp<=0){
      const next=this.state.creatures.find(c=>c.hp>0);
      if(next){logs.push(`${species[this.player.species].name} needs a rest. ${species[next.species].name} steps forward!`);this.state.activeUid=next.uid;}
      else{this.outcome='defeat';logs.push('Your companions need a rest. Ranger Fen will help you back to Willowmere.');}
    }
  }
  protected reward(logs:string[]) {
    const xp=this.wild.level*12;const levels=gainExperience(this.player,xp);this.state.battlesWon++;
    this.state.quest=advanceQuest(this.state.quest,'battle');
    logs.push(`${species[this.player.species].name} gained ${xp} experience.${levels?` Level ${this.player.level}!`:''}`);
  }
  flee():string[] { if(this.outcome!=='active')return [];this.outcome='escaped';return ['You slipped back into the trees. There will be other chances.']; }
  capture():string[] {
    if(this.outcome!=='active')return [];
    if(!canCapture(this.state,this.wild))return ['You cannot offer a prism now. Check your supplies and collection space.'];
    this.state.inventory.prisms--;
    const logs:string[]=[];
    if(this.random()<captureChance(this.wild)){
      this.outcome='captured';this.state.creatures.push({...this.wild});
      logs.push(`The prism rings clear. ${species[this.wild.species].name} chose to join you!`);this.reward(logs);
    }else{logs.push('A flicker, a chime… the wild creature slipped free!');this.wildTurn(logs);this.checkEnd(logs);}
    return logs;
  }
  tonic():string[] {
    if(this.outcome!=='active')return [];
    const missing=stats(this.player).hp-this.player.hp;
    if(this.state.inventory.tonics<=0||missing<=0)return ['A tonic cannot be used right now.'];
    this.state.inventory.tonics--;const amount=Math.min(30,missing);this.player.hp+=amount;
    const logs=[`${species[this.player.species].name} recovered ${amount} HP with a meadow tonic.`];
    this.wildTurn(logs);this.checkEnd(logs);return logs;
  }
}
