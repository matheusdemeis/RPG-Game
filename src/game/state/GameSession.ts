import type { GameState } from '../types';

export function newGame(): GameState {
  return {
    version: 1, player: { map: 'willowmere', x: 18, y: 20, facing: 'up' },
    starter: null, creatures: [], activeUid: null,
    inventory: { prisms: 8, tonics: 3 }, quest: 'meet', battlesWon: 0, playSeconds: 0,
  };
}

/** One session per Phaser Game; scenes receive the same reference through the registry. */
export class GameSession {
  state = newGame();
  reset() { this.state = newGame(); }
}
