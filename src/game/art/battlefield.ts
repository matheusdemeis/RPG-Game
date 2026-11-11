import * as Phaser from 'phaser';
import { reducedMotion } from './motion';

/** Fixed composition keeps silhouettes and status panels readable against the forest. */
export function drawBattlefield(scene: Phaser.Scene) {
  scene.cameras.main.setBackgroundColor('#839e83');
  const sky = scene.add.graphics();
  sky.fillStyle(0xb9cbb0);
  sky.fillRect(0, 0, 960, 130);
  sky.fillStyle(0x9fb8a0);
  sky.fillRect(0, 130, 960, 90);
  for (let i = 0; i < 13; i++)
    scene.add
      .image(i * 83 - 15, 202 + (i % 3) * 13, 'tree')
      .setScale(1.3)
      .setTint(0xa8b6a2)
      .setAlpha(0.65);
  for (let i = 0; i < 12; i++)
    scene.add
      .image(i * 93 - 35, 253 + (i % 2) * 14, 'tree')
      .setScale(1.6)
      .setTint(0x8da486);
  const floor = scene.add.graphics();
  floor.fillStyle(0x779364);
  floor.fillRect(0, 260, 960, 175);
  floor.fillStyle(0x8fa778);
  floor.fillEllipse(495, 307, 1030, 197);
  // Two worn clearings with a darker rim provide grounding and separation.
  for (const [x, y, w, h] of [
    [700, 242, 314, 66],
    [260, 366, 355, 88],
  ]) {
    floor.fillStyle(0x577751);
    floor.fillEllipse(x!, y! + 5, w! + 8, h! + 8);
    floor.fillStyle(0xb1b888);
    floor.fillEllipse(x!, y!, w!, h!);
    floor.fillStyle(0xc0c294);
    floor.fillEllipse(x! - 12, y! - 7, w! - 35, h! - 20);
    for (let j = 0; j < 25; j++) {
      const px = x! - w! / 2 + 20 + ((j * 47) % (w! - 40)),
        py = y! - h! / 4 + ((j * 11) % (h! / 2));
      floor.fillStyle(j % 3 === 0 ? 0x849363 : 0xd4cc9d);
      floor.fillRect(px, py, 3 + (j % 3), 2);
    }
  }
  for (let i = 0; i < 75; i++) {
    const x = (i * 127) % 960,
      y = 280 + ((i * 23) % 141);
    if ((x > 80 && x < 440 && y > 320) || (x > 540 && x < 860 && y < 280)) continue;
    floor.fillStyle(0x5b8054);
    floor.fillRect(x, y, 2, 7);
    floor.fillRect(x - 3, y + 3, 8, 2);
    floor.fillStyle(i % 7 === 0 ? 0xe1cda4 : 0xb0bf81);
    floor.fillRect(x, y, 2, 2);
  }
  const light = scene.add.graphics();
  light.fillStyle(0xf5e8b1, 0.08);
  light.fillTriangle(530, 0, 620, 0, 810, 430);
  light.fillTriangle(680, 0, 707, 0, 885, 430);
  scene.add.image(-12, 385, 'tree').setScale(2).setTint(0x61805b);
  scene.add.image(985, 365, 'tree').setScale(2.1).setTint(0x61805b);
  for (let i = 0; i < 10; i++) {
    const mote = scene.add
      .image(60 + ((i * 137) % 880), 190 + ((i * 41) % 170), 'mote')
      .setAlpha(0.4);
    if (!reducedMotion())
      scene.tweens.add({
        targets: mote,
        x: mote.x + 14,
        y: mote.y - 12,
        alpha: 0.1,
        duration: 2400 + i * 170,
        yoyo: true,
        repeat: -1,
      });
  }
}
