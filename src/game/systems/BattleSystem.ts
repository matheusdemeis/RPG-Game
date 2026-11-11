import type { Creature, Element, GameState } from '../types';
import { species } from '../data/creatures';
import { moves, type Move } from '../data/moves';
import { activeCreature, gainExperience, stats } from './CreatureSystem';
import { advanceQuest } from './QuestSystem';
import { canCapture, captureChance } from './CaptureSystem';

export type BattleOutcome = 'active' | 'victory' | 'captured' | 'defeat' | 'escaped';
export type BattleSide = 'player' | 'wild';
export interface BattleEvent {
  kind:
    | 'damage'
    | 'heal'
    | 'miss'
    | 'faint'
    | 'switch'
    | 'capture'
    | 'capture-fail'
    | 'escape'
    | 'reward'
    | 'notice';
  text: string;
  actor?: BattleSide;
  target?: BattleSide;
  amount?: number;
  element?: Element | null;
  player: Creature;
  wild: Creature;
  outcome: BattleOutcome;
}
export function effectiveness(attack: Element | null, defense: Element): number {
  if (!attack || attack === defense) return 1;
  return ({ Fire: 'Nature', Nature: 'Water', Water: 'Fire' } as const)[attack] === defense
    ? 1.6
    : 0.65;
}
export function damage(attacker: Creature, defender: Creature, move: Move, roll = 0.5): number {
  if (move.kind !== 'damage') return 0;
  const a = stats(attacker),
    d = stats(defender);
  const base = (((2 * attacker.level) / 5 + 2) * move.power * a.attack) / d.defense / 14 + 2;
  return Math.max(
    1,
    Math.floor(
      base *
        effectiveness(move.element, species[defender.species].element) *
        (0.9 + Math.min(1, Math.max(0, roll)) * 0.2),
    ),
  );
}
export function turnOrder(a: Creature, b: Creature): ['player', 'wild'] | ['wild', 'player'] {
  return stats(a).speed >= stats(b).speed ? ['player', 'wild'] : ['wild', 'player'];
}

/** Rules mutate only the provided session. Presentation consumes the returned event text. */
export class BattleSystem {
  outcome: BattleOutcome = 'active';
  /** Ordered snapshots of the last action, independent of the renderer and mutable session. */
  events: BattleEvent[] = [];
  constructor(
    readonly state: GameState,
    readonly wild: Creature,
    protected random: () => number = Math.random,
  ) {}
  get player() {
    return activeCreature(this.state)!;
  }
  private record(
    logs: string[],
    text: string,
    details: Pick<BattleEvent, 'kind' | 'actor' | 'target' | 'amount' | 'element'>,
  ) {
    logs.push(text);
    this.events.push({
      ...details,
      text,
      player: { ...this.player },
      wild: { ...this.wild },
      outcome: this.outcome,
    });
  }
  private notice(text: string): string[] {
    const logs: string[] = [];
    this.record(logs, text, { kind: 'notice' });
    return logs;
  }
  act(moveId: string): string[] {
    this.events = [];
    if (this.outcome !== 'active') return [];
    const move = moves[moveId];
    if (!move || !species[this.player.species].moves.includes(moveId))
      return this.notice('That move is unavailable.');
    const logs: string[] = [];
    for (const actor of turnOrder(this.player, this.wild)) {
      if (this.outcome !== 'active') break;
      const originalLead = this.state.activeUid;
      if (actor === 'player') this.strike(this.player, this.wild, move, logs);
      else this.wildTurn(logs);
      this.checkEnd(logs);
      if (this.state.activeUid !== originalLead) break;
    }
    return logs;
  }
  protected strike(attacker: Creature, defender: Creature, move: Move, logs: string[]) {
    const name = species[attacker.species].name;
    const actor: BattleSide = attacker === this.wild ? 'wild' : 'player';
    const target: BattleSide = actor === 'wild' ? 'player' : 'wild';
    if (attacker.hp <= 0) return;
    if (move.kind === 'restore') {
      const amount = Math.min(
        stats(attacker).hp - attacker.hp,
        Math.ceil(stats(attacker).hp * 0.3),
      );
      attacker.hp += amount;
      this.record(logs, `${name} used ${move.name} and recovered ${amount} HP.`, {
        kind: 'heal',
        actor,
        target: actor,
        amount,
      });
      return;
    }
    if (this.random() >= move.accuracy) {
      this.record(logs, `${name} used ${move.name}, but it missed!`, {
        kind: 'miss',
        actor,
        target,
      });
      return;
    }
    const hit = damage(attacker, defender, move, this.random());
    defender.hp = Math.max(0, defender.hp - hit);
    const effect = effectiveness(move.element, species[defender.species].element);
    this.record(
      logs,
      `${name} used ${move.name}! ${hit} damage.${effect > 1 ? ' A powerful match!' : effect < 1 ? ' The element was resisted.' : ''}`,
      { kind: 'damage', actor, target, amount: hit, element: move.element },
    );
  }
  protected wildTurn(logs: string[]) {
    const available = species[this.wild.species].moves.filter((id) => moves[id]!.kind === 'damage');
    const move =
      moves[
        available[Math.min(available.length - 1, Math.floor(this.random() * available.length))]!
      ]!;
    this.strike(this.wild, this.player, move, logs);
  }
  protected checkEnd(logs: string[]) {
    if (this.wild.hp <= 0) {
      this.outcome = 'victory';
      this.record(logs, `Wild ${species[this.wild.species].name} settled down.`, {
        kind: 'faint',
        target: 'wild',
      });
      this.reward(logs);
    } else if (this.player.hp <= 0) {
      const next = this.state.creatures.find((c) => c.hp > 0);
      if (next) {
        this.record(logs, `${species[this.player.species].name} needs a rest.`, {
          kind: 'faint',
          target: 'player',
        });
        this.state.activeUid = next.uid;
        this.record(logs, `${species[next.species].name} steps forward!`, {
          kind: 'switch',
          target: 'player',
        });
      } else {
        this.outcome = 'defeat';
        this.record(
          logs,
          'Your companions need a rest. Ranger Fen will help you back to Willowmere.',
          { kind: 'faint', target: 'player' },
        );
      }
    }
  }
  protected reward(logs: string[]) {
    const xp = this.wild.level * 12;
    const levels = gainExperience(this.player, xp);
    this.state.battlesWon++;
    this.state.quest = advanceQuest(this.state.quest, 'battle');
    this.record(
      logs,
      `${species[this.player.species].name} gained ${xp} experience.${levels ? ` Level ${this.player.level}!` : ''}`,
      { kind: 'reward', target: 'player', amount: xp },
    );
  }
  flee(): string[] {
    this.events = [];
    if (this.outcome !== 'active') return [];
    this.outcome = 'escaped';
    const logs: string[] = [];
    this.record(logs, 'You slipped back into the trees. There will be other chances.', {
      kind: 'escape',
    });
    return logs;
  }
  capture(): string[] {
    this.events = [];
    if (this.outcome !== 'active') return [];
    if (!canCapture(this.state, this.wild))
      return this.notice('You cannot offer a prism now. Check your supplies and collection space.');
    this.state.inventory.prisms--;
    const logs: string[] = [];
    if (this.random() < captureChance(this.wild)) {
      this.outcome = 'captured';
      this.state.creatures.push({ ...this.wild });
      this.record(
        logs,
        `The prism rings clear. ${species[this.wild.species].name} chose to join you!`,
        { kind: 'capture', target: 'wild' },
      );
      this.reward(logs);
    } else {
      this.record(logs, 'A flicker, a chime… the wild creature slipped free!', {
        kind: 'capture-fail',
        target: 'wild',
      });
      this.wildTurn(logs);
      this.checkEnd(logs);
    }
    return logs;
  }
  tonic(): string[] {
    this.events = [];
    if (this.outcome !== 'active') return [];
    const missing = stats(this.player).hp - this.player.hp;
    if (this.state.inventory.tonics <= 0 || missing <= 0)
      return this.notice('A tonic cannot be used right now.');
    this.state.inventory.tonics--;
    const amount = Math.min(30, missing);
    this.player.hp += amount;
    const logs: string[] = [];
    this.record(
      logs,
      `${species[this.player.species].name} recovered ${amount} HP with a meadow tonic.`,
      { kind: 'heal', target: 'player', amount },
    );
    this.wildTurn(logs);
    this.checkEnd(logs);
    return logs;
  }
}
