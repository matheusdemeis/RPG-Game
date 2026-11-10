export type Element = 'Fire' | 'Water' | 'Nature';
export type SpeciesId = 'solkit' | 'brooklet' | 'mossling';
export type MapId = 'willowmere' | 'trail';
export type Facing = 'down' | 'up' | 'left' | 'right';
export type QuestStage = 'meet' | 'explore' | 'investigate' | 'return' | 'complete';
export interface Creature {
  uid: string;
  species: SpeciesId;
  level: number;
  hp: number;
  xp: number;
}
export interface GameState {
  version: 1;
  player: { map: MapId; x: number; y: number; facing: Facing };
  starter: SpeciesId | null;
  creatures: Creature[];
  activeUid: string | null;
  inventory: { prisms: number; tonics: number };
  quest: QuestStage;
  battlesWon: number;
  playSeconds: number;
}
