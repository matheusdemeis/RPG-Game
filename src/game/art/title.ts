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
  for (const [x, y, w] of [
    [450, 67, 90],
    [755, 116, 115],
    [570, 156, 60],
  ] as const) {
    const cloud = scene.add.graphics().setPosition(x, y);
    cloud.fillStyle(0xe3e3bd, 0.18);
    cloud.fillRect(0, 8, w, 8);
    cloud.fillRect(12, 3, w - 31, 8);
    cloud.fillRect(25, 0, w - 51, 5);
    if (!reducedMotion())
      scene.tweens.add({
        targets: cloud,
        x: x + 22,
        duration: 24000 + y * 50,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
  }
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
  for (const [x, y, w, h] of [
    [597, 539, 78, 17],
    [768, 528, 72, 16],
    [679, 489, 48, 12],
    [739, 394, 85, 19],
  ] as const) {
    ground.fillStyle(0x294f3a, 0.23);
    ground.fillEllipse(x, y, w, h);
  }
  for (let i = 0; i < 35; i++) {
    const x = 495 + ((i * 73) % 440),
      y = 460 + ((i * 31) % 125);
    if (x > 600 && x < 720) continue;
    ground.fillStyle(0x54774b);
    ground.fillRect(x, y, 2, 7);
    ground.fillRect(x - 3, y + 2, 8, 2);
    ground.fillStyle(i % 5 === 0 ? 0xdac49a : 0xacbd79);
    ground.fillRect(x, y, 2, 2);
  }
  const crystal = scene.add
    .image(734, 395, 'crystal')
    .setScale(1.35)
    .setOrigin(0.5, 1)
    .setAlpha(0.9);
  if (!reducedMotion())
    scene.tweens.add({
      targets: crystal,
      alpha: 0.72,
      duration: 2900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  const foreground: Phaser.GameObjects.Image[] = [];
  for (const [x, y, s] of [
    [470, 394, 1.9],
    [908, 400, 2],
    [950, 548, 2.4],
    [445, 592, 2.3],
  ] as const)
    foreground.push(scene.add.image(x, y, 'tree').setScale(s).setOrigin(0.5, 1));
  const friends = [
    scene.add.image(597, 500, 'solkit').setScale(3.9),
    scene.add.image(768, 492, 'brooklet').setScale(3.5),
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
  if (!reducedMotion()) {
    const origins = foreground.map((sprite) => ({ x: sprite.x, y: sprite.y }));
    let targetX = 0,
      targetY = 0,
      offsetX = 0,
      offsetY = 0;
    const point = (p: Phaser.Input.Pointer) => {
      targetX = (p.x / 960 - 0.5) * 8;
      targetY = (p.y / 600 - 0.5) * 4;
    };
    const reset = () => {
      targetX = 0;
      targetY = 0;
    };
    const update = (_time: number, delta: number) => {
      const blend = 1 - Math.exp(-delta / 180);
      offsetX += (targetX - offsetX) * blend;
      offsetY += (targetY - offsetY) * blend;
      foreground.forEach((sprite, i) =>
        sprite.setPosition(
          Math.round(origins[i]!.x + offsetX),
          Math.round(origins[i]!.y + offsetY),
        ),
      );
    };
    scene.input.on('pointermove', point);
    scene.input.on('gameout', reset);
    scene.events.on('update', update);
    scene.events.once('shutdown', () => {
      scene.input.off('pointermove', point);
      scene.input.off('gameout', reset);
      scene.events.off('update', update);
    });
  }
}
