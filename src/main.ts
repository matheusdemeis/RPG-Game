import * as Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/scenes/BootScene';
import { TitleScene } from './game/scenes/TitleScene';
import { WorldScene } from './game/scenes/WorldScene';
import { BattleScene } from './game/scenes/BattleScene';

export const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: 960, height: 600,
  pixelArt: true, roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, WorldScene, BattleScene],
});

// Development inspection only; omitted from production builds.
if (import.meta.env.DEV) Object.assign(window, { __ECHOWILD__: game });
