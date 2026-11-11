import * as Phaser from 'phaser';
import type { Facing } from '../types';

const outfits = {
  player: {
    shirt: '#4d9591',
    shadow: '#315e64',
    hair: '#69503d',
    skin: '#e7b68b',
    trim: '#e3c17c',
  },
  researcher: {
    shirt: '#e1e4cc',
    shadow: '#9bad9e',
    hair: '#bfcac0',
    skin: '#dca578',
    trim: '#5d9994',
  },
  resident: {
    shirt: '#bd8190',
    shadow: '#835867',
    hair: '#79503d',
    skin: '#eac099',
    trim: '#e2cda1',
  },
  ranger: {
    shirt: '#84946b',
    shadow: '#536d58',
    hair: '#443f33',
    skin: '#bd8c64',
    trim: '#d1b77b',
  },
};

/** All facing/stride frames share a foot anchor, so art changes do not alter movement or collision. */
export function generateCharacters(scene: Phaser.Scene) {
  for (const [skin, palette] of Object.entries(outfits)) {
    for (const facing of ['down', 'up', 'left', 'right'] as Facing[]) {
      for (let frame = 0; frame < 3; frame++) {
        const texture = scene.textures.createCanvas(`${skin}-${facing}-${frame}`, 32, 44)!;
        const c = texture.context;
        c.imageSmoothingEnabled = false;
        const r = (color: string, x: number, y: number, w: number, h: number) => {
          c.fillStyle = color;
          c.fillRect(x, y, w, h);
        };
        // A quiet ground shadow remains still while the body rises with each stride.
        r('#466347', 9, 40, 16, 2);
        r('#4f6c4b', 6, 39, 22, 2);
        c.save();
        if (facing === 'right') {
          c.translate(32, 0);
          c.scale(-1, 1);
        }
        const side = facing === 'left' || facing === 'right',
          back = facing === 'up';
        const stride = frame === 1 ? -2 : frame === 2 ? 2 : 0;
        r('#2b3f40', side ? 12 : 10, 31, side ? 7 : 5, 8 + stride);
        r('#2b3f40', side ? 18 : 19, 31, 5, 8 - stride);
        r('#554b3d', side ? 10 : 9, 37 + stride, 8, 3);
        r('#554b3d', 18, 37 - stride, 8, 3);
        r('#a59269', side ? 10 : 9, 37 + stride, 6, 1);
        r('#a59269', 18, 37 - stride, 6, 1);
        c.translate(0, frame === 0 ? 0 : -1);
        // Tunic outline and sleeve overlap give the figure a continuous silhouette.
        r('#2e4946', side ? 11 : 8, 21, side ? 13 : 18, 14);
        r(palette.shadow, side ? 12 : 9, 22, side ? 11 : 16, 12);
        r(palette.shirt, side ? 12 : 10, 21, side ? 8 : 13, 10);
        r(palette.trim, side ? 12 : 10, 21, side ? 7 : 13, 2);
        r('#e0b784', side ? 10 : 6, 27 + stride, 4, 5);
        if (!side) r(palette.skin, 24, 27 - stride, 4, 5);
        r(palette.shadow, side ? 11 : 7, 23 + stride, 4, 6);
        if (!side) r(palette.shirt, 23, 23 - stride, 4, 6);
        r('#e8caa1', side ? 10 : 6, 28 + stride, 2, 2);
        if (skin === 'resident') {
          r(palette.shirt, 8, 30, 18, 6);
          r(palette.trim, side ? 12 : 12, 26, side ? 6 : 10, 9);
          r('#f0dec0', 12, 27, side ? 2 : 8, 2);
        }
        if (skin === 'researcher') {
          r('#f0efd9', 9, 24, 4, 11);
          r('#cdd5be', 21, 24, 4, 11);
          r('#315d60', 14, 24, 6, 9);
          r('#9b9270', 8, 31, 6, 5);
        }
        if (skin === 'ranger') {
          r('#ddc78e', side ? 18 : 12, 26, side ? 3 : 9, 2);
          r('#567366', 13, 22, 3, 8);
        }
        if (skin === 'player') {
          r('#f0d390', side ? 17 : 21, 22, 3, 5 + (frame % 2));
          r('#c7b17e', side ? 20 : 23, 29, 5, 6);
        }
        if (back) {
          r('#4f5141', 10, 23, 14, 12);
          r('#b69b67', 11, 23, 12, 11);
          r('#dbc18b', 12, 23, 10, 3);
          r('#806b4e', 12, 28, 10, 1);
          r('#e6ca89', 16, 28, 3, 2);
        } else if (side && skin === 'player') {
          r('#645a42', 22, 22, 5, 12);
          r('#c0a778', 23, 23, 3, 9);
        }
        // Rounded head: side views have one eye, a nose, an ear and a rear hair edge.
        r('#3f483e', side ? 9 : 8, 9, 17, 13);
        r(palette.hair, side ? 10 : 9, 7, 15, 15);
        if (!back) {
          r('#bb8a67', side ? 9 : 10, 12, side ? 13 : 14, 9);
          r(palette.skin, side ? 8 : 10, 12, side ? 13 : 13, 7);
          r('#f0cda2', side ? 8 : 11, 12, side ? 9 : 10, 3);
          if (side) {
            r(palette.skin, 6, 16, 4, 3);
            r('#263e3c', 10, 15, 2, 3);
            r(palette.hair, 20, 11, 4, 8);
            r('#f0c69a', 19, 16, 3, 3);
          } else {
            r('#263e3c', 12, 15, 2, 3);
            r('#263e3c', 20, 15, 2, 3);
            r('#b97f65', 15, 20, 4, 1);
          }
          if (skin === 'researcher') {
            r('#4b6662', 10, 14, 5, 1);
            r('#4b6662', 10, 17, 5, 1);
            r('#4b6662', 10, 14, 1, 4);
            if (!side) {
              r('#4b6662', 19, 14, 5, 1);
              r('#4b6662', 19, 17, 5, 1);
              r('#4b6662', 23, 14, 1, 4);
              r('#4b6662', 15, 15, 4, 1);
            }
          }
        } else {
          r(palette.hair, 9, 12, 16, 9);
          r('#9a7c53', 10, 20, 14, 2);
        }
        if (skin === 'player' || skin === 'ranger') {
          const hat = skin === 'player' ? '#c8af72' : '#778c60';
          r('#526047', 7, 7, 18, 6);
          r(hat, 8, 5, 16, 7);
          r(skin === 'player' ? '#e7cd8c' : '#9aac77', 10, 5, 11, 2);
          r('#686247', 5, 11, 24, 3);
          r(hat, 5, 10, 24, 2);
          r('#6a6550', 8, 8, 16, 2);
          if (skin === 'ranger') {
            r('#cfb97c', 20, 6, 2, 4);
          }
        } else if (skin === 'resident') {
          r('#6b4938', 10, 6, 13, 6);
          r('#8d6347', 12, 5, 9, 4);
          r('#b88459', 12, 5, 5, 1);
          r('#684936', side ? 22 : 24, 9, 4, 8);
          r('#e5bf86', side ? 23 : 25, 9, 2, 2);
        } else {
          r('#e5e7cf', 10, 6, 12, 5);
          r('#c0cdbd', 7, 9, 4, 9);
          r('#98ada0', 23, 10, 3, 10);
          r('#edf0dc', 9, 8, 5, 3);
        }
        c.restore();
        texture.refresh();
      }
    }
  }
}
