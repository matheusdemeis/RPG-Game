import * as Phaser from 'phaser';
import { generateTextures } from '../art/textures';
import { GameSession } from '../state/GameSession';
import { areas, toTiled } from '../data/maps';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    generateTextures(this);
    for (const area of Object.values(areas)) this.cache.tilemap.add(area.id, { format: Phaser.Tilemaps.Formats.TILED_JSON, data: toTiled(area) });
    this.registry.set('session', new GameSession());
    this.scene.start('Title');
  }
}
