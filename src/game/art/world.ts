import * as Phaser from 'phaser';
import { TILE, WIDTH, HEIGHT, type Area } from '../data/maps';
import { reducedMotion } from './motion';
import { drawTerrain } from './terrain';

export function drawWorld(scene: Phaser.Scene, area: Area) {
  const map = scene.make.tilemap({ key: area.id });
  const tiles = map.addTilesetImage('auralis', 'tiles')!;
  map.createLayer('Ground', tiles, 0, 0);
  drawTerrain(scene, area);
  for (const o of area.objects) {
    const x = (o.x + o.w / 2) * TILE,
      y = (o.y + o.h) * TILE;
    const scenery = scene.add.image(x, y, o.kind).setOrigin(0.5, 1).setDepth(y);
    if (o.kind === 'tree')
      scenery.setFlipX((o.x + o.y) % 3 === 0).setTint((o.x + o.y) % 4 === 0 ? 0xe4edcf : 0xffffff);
    if (o.kind === 'crystal' && !reducedMotion())
      scene.tweens.add({ targets: scenery, alpha: 0.78, duration: 2100, yoyo: true, repeat: -1 });
  }
  for (const npc of area.npcs) {
    scene.add
      .image(npc.x * TILE + 16, npc.y * TILE + 30, `${npc.skin}-down-0`)
      .setOrigin(0.5, 1)
      .setDepth(npc.y * TILE + 31);
    scene.add
      .text(npc.x * TILE + 16, npc.y * TILE - 18, npc.id === 'researcher' ? '!' : '…', {
        fontFamily: 'Georgia',
        fontSize: '16px',
        color: '#f8e5a9',
        backgroundColor: '#274b3c',
        padding: { x: 5, y: 1 },
      })
      .setOrigin(0.5, 1)
      .setDepth(2000);
  }
  // Fixed seeded placement keeps decoration stable across reloads.
  for (let i = 0; i < 24; i++) {
    const x = (i * 157 + 93) % (WIDTH * TILE),
      y = (i * 89 + 70) % (HEIGHT * TILE);
    const mote = scene.add.image(x, y, 'mote').setAlpha(0.45).setDepth(2000);
    if (!reducedMotion())
      scene.tweens.add({
        targets: mote,
        y: y - 24,
        x: x + 12,
        alpha: 0.1,
        duration: 2800 + (i % 5) * 500,
        yoyo: true,
        repeat: -1,
      });
  }
}
