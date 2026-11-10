import * as Phaser from 'phaser';
import { reducedMotion } from './motion';

/** A small original woodland diorama, using the same pixel-art vocabulary as the world. */
export function drawTitle(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  const band = (color: number, x: number, y: number, w: number, h: number) => {
    g.fillStyle(color);
    g.fillRect(x, y, w, h);
  };
  band(0x789b8d, 0, 0, 960, 600);
  band(0x99b4a1, 0, 0, 960, 90);
  band(0xaac2a5, 0, 90, 960, 85);
  band(0xcbd2ac, 650, 73, 52, 52);
  band(0xdde0b7, 660, 83, 32, 32);
  const ridge = (color: number, base: number, points: number[][]) => {
    g.fillStyle(color);
    g.beginPath();
    g.moveTo(0, base);
    for (const [x, y] of points) g.lineTo(x!, y!);
    g.lineTo(960, base);
    g.closePath();
    g.fillPath();
  };
  ridge(0x789c8e, 310, [
    [0, 230],
    [130, 170],
    [240, 205],
    [390, 130],
    [490, 183],
    [630, 153],
    [750, 190],
    [870, 120],
    [960, 170],
  ]);
  ridge(0x557f70, 355, [
    [0, 300],
    [100, 230],
    [240, 260],
    [380, 220],
    [540, 268],
    [650, 215],
    [810, 255],
    [960, 210],
  ]);
  band(0x688b60, 0, 325, 960, 275);
  for (let i = 0; i < 22; i++)
    scene.add
      .image(i * 53 - 10, 330 + (i % 4) * 9, 'tree')
      .setScale(1.4)
      .setTint(0x7d9d79);
  const ground = scene.add.graphics();
  ground.fillStyle(0x819660);
  ground.fillEllipse(681, 464, 540, 200);
  ground.fillStyle(0x9da775);
  ground.fillEllipse(691, 421, 330, 86);
  ground.fillStyle(0xc0b88a);
  ground.fillPoints(
    [
      [643, 420],
      [704, 420],
      [735, 462],
      [684, 505],
      [726, 600],
      [580, 600],
      [612, 510],
      [680, 461],
    ].map(([x, y]) => new Phaser.Math.Vector2(x, y)),
    true,
  );
  for (let i = 0; i < 80; i++) {
    const x = 430 + ((i * 73) % 530),
      y = 385 + ((i * 47) % 210);
    ground.fillStyle(i % 5 === 0 ? 0xd5c595 : 0x99ac71);
    ground.fillRect(x, y, 3, 2);
  }
  scene.add.image(734, 395, 'crystal').setScale(1.35).setOrigin(0.5, 1).setAlpha(0.9);
  for (const [x, y, s] of [
    [470, 394, 1.9],
    [908, 400, 2],
    [950, 548, 2.4],
    [445, 592, 2.3],
  ] as const)
    scene.add.image(x, y, 'tree').setScale(s).setOrigin(0.5, 1);
  const friends = [
    scene.add.image(597, 500, 'solkit').setScale(3.9),
    scene.add.image(768, 516, 'brooklet').setScale(3.5),
    scene.add.image(679, 464, 'mossling').setScale(2.5),
  ];
  if (!reducedMotion())
    for (const friend of friends)
      scene.tweens.add({
        targets: friend,
        y: friend.y - 4,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
  for (let i = 0; i < 16; i++) {
    const mote = scene.add
      .image(450 + ((i * 93) % 480), 180 + ((i * 67) % 320), 'mote')
      .setAlpha(0.6);
    if (!reducedMotion())
      scene.tweens.add({
        targets: mote,
        y: mote.y - 18,
        alpha: 0.2,
        duration: 2000 + i * 100,
        yoyo: true,
        repeat: -1,
      });
  }
}
