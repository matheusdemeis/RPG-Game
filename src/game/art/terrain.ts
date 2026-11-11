import * as Phaser from 'phaser';
import { Ground, TILE, WIDTH, HEIGHT, type Area } from '../data/maps';
import { plantings } from '../data/maps/decoration';

/** Stable visual noise is independent of battle/encounter randomness. */
function sample(x: number, y: number, salt = 0): number {
  let n = Math.imul(x + 371, 374761393) ^ Math.imul(y + salt + 719, 668265263);
  n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** A cached pixel overlay gives the Tiled ground edge treatment, planting, and cast shadows. */
export function drawTerrain(scene: Phaser.Scene, area: Area) {
  const key = `terrain-${area.id}`;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, WIDTH * TILE, HEIGHT * TILE)!;
    const c = texture.context;
    c.imageSmoothingEnabled = false;
    const r = (color: string, x: number, y: number, w: number, h: number) => {
      c.fillStyle = color;
      c.fillRect(Math.round(x), Math.round(y), w, h);
    };
    const tile = (x: number, y: number) => area.ground[y]?.[x];
    const green = (t: number | undefined) => t === Ground.Meadow || t === Ground.Flowers;
    for (let y = 0; y < HEIGHT; y++)
      for (let x = 0; x < WIDTH; x++) {
        const t = tile(x, y),
          px = x * TILE,
          py = y * TILE;
        const seed = sample(x, y);
        if (green(t)) {
          // Clusters and bare intervals make the meadow read as vegetation, not a repeated stamp.
          for (let n = 0; n < 4; n++) {
            const sx = px + Math.floor(sample(x, y, n * 9) * 28),
              sy = py + Math.floor(sample(y, x, n * 13) * 28);
            r(seed > 0.45 ? '#71935d' : '#82a266', sx, sy + 4, 7, 2);
            r('#638953', sx + 2, sy, 1, 5);
            r('#94ad72', sx + 4, sy + 2, 1, 3);
          }
        }
        if (t === Ground.Path) {
          for (let n = 0; n < 3; n++) {
            const sx = px + Math.floor(sample(x, y, n * 15) * 26),
              sy = py + Math.floor(sample(y, x, n * 17) * 28);
            r('#d4c496', sx, sy, 5, 2);
            r('#b2a57e', sx + 4, sy + 2, 3, 1);
          }
        }
        if (t === Ground.Grass) {
          c.globalAlpha = 0.14;
          r(seed > 0.5 ? '#c4d38b' : '#173e36', px, py, TILE, TILE);
          c.globalAlpha = 1;
          r('#a4ba71', px + 8 + Math.floor(seed * 10), py + 5, 2, 5);
        }
        // Directional borders follow existing collision geometry exactly.
        for (const [dx, dy, rotation] of [
          [0, -1, 0],
          [1, 0, 1],
          [0, 1, 2],
          [-1, 0, 3],
        ] as const) {
          const neighbor = tile(x + dx, y + dy);
          if (neighbor === undefined || neighbor === t) continue;
          c.save();
          c.translate(px + 16, py + 16);
          c.rotate((rotation * Math.PI) / 2);
          c.translate(-16, -16);
          if (t === Ground.Path && green(neighbor)) {
            r('#688455', 0, 0, 32, 2);
            r('#a8a373', 0, 2, 32, 2);
            r('#dfcc99', 0, 4, 32, 1);
            for (let n = 0; n < 4; n++) {
              const bx = n * 8 + Math.floor(seed * 4);
              r('#78975d', bx, 0, 3, 3 + (n % 2));
            }
          }
          if (t === Ground.Water && neighbor !== Ground.Water) {
            r('#617b59', 0, 0, 32, 3);
            r('#b3b08a', 0, 3, 32, 3);
            r('#3d7379', 0, 6, 32, 5);
            r('#83b4b0', 0, 11, 32, 1);
            r('#a6cebc', 4, 12, 9, 1);
            r('#a6cebc', 21, 11, 7, 1);
          }
          if (t === Ground.Grass && neighbor !== Ground.Grass) {
            r('#739757', 0, 0, 32, 3);
            for (let n = 0; n < 8; n++) r('#a4ba71', n * 4 + 1, 1, 1, 3 + (n % 3));
          }
          if (t === Ground.Stone && green(neighbor)) {
            r('#6c8060', 0, 0, 32, 3);
            r('#c2bea0', 2, 3, 28, 2);
          }
          c.restore();
        }
        if (t === Ground.Stone && [tile(x, y - 1), tile(x, y + 1)].includes(Ground.Water)) {
          r('#5c654d', px, py, 32, 32);
          r('#ad9569', px, py + 4, 32, 24);
          for (let n = 0; n < 4; n++) {
            r('#dcc494', px + n * 8, py + 4, 1, 24);
            r('#796b4f', px + n * 8 + 7, py + 5, 1, 24);
            r('#786649', px + n * 8 + 3, py + 7, 1, 1);
            r('#786649', px + n * 8 + 3, py + 24, 1, 1);
          }
          r('#d6bf8b', px, py + 2, 32, 3);
          r('#81734e', px, py + 28, 32, 3);
        }
        if (t === Ground.Water && seed > 0.86) {
          r('#397b80', px + 7, py + 17, 16, 4);
          r('#669c7f', px + 8, py + 14, 12, 4);
          r('#9abb8a', px + 10, py + 14, 5, 1);
          if (seed > 0.9) {
            r('#f1d9bd', px + 14, py + 11, 3, 3);
          }
        }
      }
    for (const patch of plantings[area.id])
      for (let y = patch.y; y < patch.y + patch.h; y++)
        for (let x = patch.x; x < patch.x + patch.w; x++) {
          if (!green(tile(x, y)) || area.blocked[y]![x]) continue;
          if (patch.kind !== 'garden' && sample(x, y, 41) < 0.2) continue;
          const px = x * TILE,
            py = y * TILE;
          if (patch.kind === 'garden') {
            r('#72855a', px + 2, py + 3, 28, 25);
            r('#927e57', px + 4, py + 6, 24, 3);
            r('#a38c60', px + 4, py + 19, 24, 3);
          }
          for (let n = 0; n < 4; n++) {
            if (patch.kind !== 'garden' && sample(x, y, n + 7) < 0.25) continue;
            const jitter = patch.kind === 'garden' ? 2 : 9;
            const sx = px + 2 + (n % 2) * 14 + Math.floor(sample(x, y, n) * jitter),
              sy = py + 5 + Math.floor(n / 2) * 12 + Math.floor(sample(y, x, n + 15) * jitter);
            r('#4a714c', sx, sy + 3, 2, 7);
            r('#5b8151', sx - 4, sy + 4, 9, 3);
            r('#a4b873', sx - 3, sy + 3, 3, 1);
            if (patch.kind === 'fern') {
              r('#446c4b', sx - 6, sy + 1, 6, 2);
              r('#a0b575', sx + 1, sy - 1, 5, 2);
              r('#75965b', sx - 4, sy - 2, 3, 2);
            } else {
              const color =
                (x + y + n) % 3 === 0 ? '#dab2a0' : (x + n) % 3 === 0 ? '#d6c77b' : '#e7ddbd';
              r(color, sx - 2, sy - 2, 5, 5);
              r('#eedb94', sx, sy, 1, 1);
            }
          }
        }
    // Bank-side reeds and short weathered posts frame the bridge without blocking it.
    for (let y = 1; y < HEIGHT - 1; y++)
      for (let x = 1; x < WIDTH - 1; x++) {
        if (
          !green(tile(x, y)) ||
          ![tile(x + 1, y), tile(x - 1, y), tile(x, y + 1), tile(x, y - 1)].includes(Ground.Water)
        )
          continue;
        for (let n = 0; n < 3; n++) {
          const sx = x * TILE + 9 + n * 6,
            sy = y * TILE + 20 + (n % 2) * 4;
          r('#4e7454', sx, sy - 12, 2, 14);
          r('#9eac6a', sx + 2, sy - 9, 1, 10);
          r('#9a8050', sx - 1, sy - 15, 3, 6);
        }
      }
    // Consistent north-west sunlight; baked once, rather than per-frame shadow objects.
    c.fillStyle = '#173e32';
    c.globalAlpha = 0.17;
    for (const o of area.objects) {
      const bx = (o.x + o.w / 2) * TILE,
        by = (o.y + o.h) * TILE;
      if (o.kind === 'tree') {
        c.beginPath();
        c.ellipse(bx + 14, by - 2, 35, 13, -0.12, 0, Math.PI * 2);
        c.fill();
      } else if (o.kind === 'house' || o.kind === 'lab') {
        c.beginPath();
        c.moveTo(o.x * TILE + 8, by - 12);
        c.lineTo((o.x + o.w) * TILE - 4, by - 12);
        c.lineTo((o.x + o.w) * TILE + 15, by + 9);
        c.lineTo(o.x * TILE + 28, by + 9);
        c.closePath();
        c.fill();
      } else if (o.kind !== 'fence') c.fillRect(bx - 11, by - 4, 30, 6);
    }
    c.globalAlpha = 1;
    texture.refresh();
  }
  scene.add.image(0, 0, key).setOrigin(0).setDepth(1);
}
