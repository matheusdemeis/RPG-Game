import * as Phaser from 'phaser';

type Ctx = CanvasRenderingContext2D;
const rect = (c: Ctx, color: string, x: number, y: number, w: number, h: number) => {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
};
function poly(c: Ctx, color: string, points: number[][]) {
  c.fillStyle = color;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x!, y!) : c.moveTo(x!, y!)));
  c.closePath();
  c.fill();
}
function make(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void) {
  const texture = scene.textures.createCanvas(key, w, h)!;
  const c = texture.context;
  c.imageSmoothingEnabled = false;
  draw(c);
  texture.refresh();
}

export function generateTextures(scene: Phaser.Scene) {
  make(scene, 'tiles', 192, 32, (c) => {
    const colors = ['#779b61', '#c7b887', '#54864d', '#508c94', '#779b61', '#9fa58b'];
    for (let t = 0; t < 6; t++) {
      c.save();
      c.translate(t * 32, 0);
      rect(c, colors[t]!, 0, 0, 32, 32);
      for (let i = 0; i < 18; i++) {
        const x = (i * 13 + t * 7) % 30,
          y = (i * 7 + t * 3) % 30;
        rect(
          c,
          t === 1 ? '#baaa7e' : t === 3 ? '#6da7ab' : t === 5 ? '#b3b69a' : '#86a76b',
          x,
          y,
          t === 3 ? 7 : 2,
          1,
        );
      }
      if (t === 2)
        for (let y = 3; y < 32; y += 8)
          for (let x = 2; x < 32; x += 7) {
            poly(c, '#315e43', [
              [x, y + 6],
              [x - 1, y],
              [x + 3, y + 3],
              [x + 5, y - 2],
              [x + 5, y + 6],
            ]);
            rect(c, '#9bbb6a', x + 2, y, 1, 4);
          }
      if (t === 4)
        for (const [x, y] of [
          [5, 7],
          [22, 19],
          [12, 25],
        ]) {
          rect(c, '#e9d9a5', x!, y!, 4, 4);
          rect(c, '#e5ae6e', x! + 1, y! + 1, 2, 2);
        }
      if (t === 5) {
        rect(c, '#888e79', 0, 16, 32, 1);
        rect(c, '#888e79', 16, 0, 1, 16);
        rect(c, '#888e79', 8, 16, 1, 16);
      }
      c.restore();
    }
  });
  make(scene, 'tree', 80, 104, (c) => {
    rect(c, '#43674c', 12, 86, 60, 10);
    rect(c, '#4d4935', 32, 62, 15, 32);
    rect(c, '#827047', 35, 66, 6, 25);
    const clusters = [
      [16, 39, 48, 39],
      [5, 32, 68, 34],
      [12, 17, 56, 35],
      [23, 6, 34, 30],
      [9, 51, 62, 22],
    ];
    for (const [x, y, w, h] of clusters) {
      rect(c, '#234f42', x!, y!, w!, h!);
      rect(c, '#396c4e', x! + 3, y! + 2, w! - 8, h! - 7);
    }
    for (const [x, y, w, h] of [
      [25, 10, 28, 12],
      [15, 23, 33, 9],
      [10, 37, 25, 10],
      [37, 30, 26, 9],
      [22, 51, 37, 10],
    ])
      rect(c, '#58875a', x!, y!, w!, h!);
    for (const [x, y] of [
      [28, 11],
      [18, 24],
      [14, 39],
      [39, 33],
      [27, 54],
    ])
      rect(c, '#80a263', x!, y!, 10, 3);
    rect(c, '#a6b776', 30, 8, 11, 3);
  });
  for (const kind of ['house', 'lab'])
    make(scene, kind, kind === 'lab' ? 192 : 160, kind === 'lab' ? 206 : 174, (c) => {
      const w = c.canvas.width,
        h = c.canvas.height,
        roof = kind === 'lab' ? '#647e86' : '#ad6a50';
      rect(c, '#52674d', 5, h - 15, w - 7, 15);
      rect(c, '#7e694d', 10, 75, w - 20, h - 89);
      rect(c, '#dccb9d', 14, 80, w - 28, h - 101);
      rect(c, '#b9a67e', 14, h - 35, w - 28, 16);
      rect(c, '#897450', 20, 78, 6, h - 105);
      rect(c, '#897450', w - 26, 78, 6, h - 105);
      poly(c, '#3d4541', [
        [0, 83],
        [30, 22],
        [w - 30, 22],
        [w, 83],
        [w, 91],
        [0, 91],
      ]);
      poly(c, roof, [
        [3, 79],
        [32, 24],
        [w - 32, 24],
        [w - 3, 79],
      ]);
      for (let y = 32; y < 78; y += 9) {
        const inset = Math.max(4, 30 - (y - 24) / 2);
        rect(c, kind === 'lab' ? '#8ba0a0' : '#c68b62', inset, y, w - inset * 2, 2);
        for (let x = 32; x < w - 20; x += 22)
          rect(c, kind === 'lab' ? '#506c78' : '#92593f', x + (y % 2) * 8, y + 2, 2, 6);
      }
      rect(c, '#756b58', w - 46, 9, 17, 32);
      rect(c, '#b8a488', w - 48, 9, 21, 5);
      for (const x of [31, w - 56]) {
        rect(c, '#665c47', x - 3, 101, 29, 31);
        rect(c, '#608b8b', x, 104, 23, 24);
        rect(c, '#b6d3ba', x + 3, 106, 8, 8);
        rect(c, '#c7b789', x + 10, 104, 3, 24);
        rect(c, '#c7b789', x, 115, 23, 3);
        rect(c, '#70684b', x - 5, 132, 34, 4);
        rect(c, '#648157', x - 2, 135, 28, 6);
        rect(c, '#d9ab7d', x + 3, 134, 4, 3);
      }
      rect(c, '#615541', w / 2 - 14, h - 66, 28, 46);
      rect(c, '#8f7952', w / 2 - 11, h - 62, 22, 40);
      rect(c, '#d6bc7e', w / 2 + 5, h - 43, 3, 3);
      rect(c, '#a9a38a', w / 2 - 22, h - 20, 44, 7);
      rect(c, '#c6bda0', w / 2 - 26, h - 13, 52, 6);
      if (kind === 'lab') {
        rect(c, '#294f4f', w / 2 - 24, 92, 48, 17);
        rect(c, '#a5cbba', w / 2 - 3, 95, 6, 11);
        rect(c, '#a5cbba', w / 2 - 8, 99, 16, 3);
      }
    });
  make(scene, 'rock', 32, 36, (c) => {
    poly(c, '#566858', [
      [2, 28],
      [7, 12],
      [22, 8],
      [30, 20],
      [28, 31],
      [5, 34],
    ]);
    poly(c, '#9ca48c', [
      [5, 26],
      [10, 13],
      [22, 12],
      [27, 22],
      [22, 28],
    ]);
    rect(c, '#c1c4a5', 12, 14, 9, 3);
  });
  make(scene, 'crystal', 64, 100, (c) => {
    poly(c, '#67747c', [
      [5, 85],
      [16, 73],
      [48, 73],
      [60, 87],
      [45, 95],
      [16, 94],
    ]);
    poly(c, '#7064a8', [
      [19, 69],
      [15, 32],
      [32, 3],
      [47, 30],
      [43, 72],
      [32, 86],
    ]);
    poly(c, '#c7c7f3', [
      [32, 3],
      [47, 30],
      [32, 44],
      [15, 32],
    ]);
    poly(c, '#928ed1', [
      [32, 44],
      [47, 30],
      [43, 72],
      [32, 86],
    ]);
    poly(c, '#a9e3e2', [
      [32, 3],
      [32, 44],
      [15, 32],
    ]);
    poly(c, '#6e81b6', [
      [15, 32],
      [32, 44],
      [32, 86],
      [19, 69],
    ]);
    poly(c, '#c0d8ed', [
      [4, 58],
      [12, 44],
      [20, 59],
      [18, 79],
      [11, 87],
    ]);
    poly(c, '#8d92ca', [
      [44, 62],
      [52, 45],
      [60, 60],
      [55, 82],
      [46, 88],
    ]);
    rect(c, '#eff9e6', 30, 18, 3, 15);
  });
  make(scene, 'sign', 32, 42, (c) => {
    rect(c, '#625941', 14, 20, 5, 22);
    rect(c, '#685d43', 1, 4, 30, 22);
    rect(c, '#d4c08d', 3, 6, 26, 17);
    rect(c, '#7b7756', 7, 10, 17, 2);
    rect(c, '#7b7756', 7, 15, 12, 2);
  });
  make(scene, 'fence', 32, 32, (c) => {
    rect(c, '#695c44', 0, 11, 32, 5);
    rect(c, '#b6a074', 0, 9, 32, 4);
    rect(c, '#8b7953', 4, 4, 5, 25);
    rect(c, '#cebc8d', 4, 4, 3, 24);
  });
  for (const skin of ['player', 'researcher', 'resident', 'ranger'])
    for (const dir of ['down', 'up', 'left', 'right'])
      for (let frame = 0; frame < 3; frame++) {
        make(scene, `${skin}-${dir}-${frame}`, 32, 44, (c) => {
          const step = frame === 1 ? -2 : frame === 2 ? 2 : 0;
          rect(c, '#466047', 7, 38, 20, 5);
          rect(c, '#3c3e3b', 9, 31, 6, 8 + step);
          rect(c, '#3c3e3b', 18, 31, 6, 8 - step);
          rect(
            c,
            skin === 'researcher'
              ? '#e1dec4'
              : skin === 'resident'
                ? '#ac7182'
                : skin === 'ranger'
                  ? '#ac9b64'
                  : '#488b8b',
            8,
            20,
            17,
            15,
          );
          rect(c, '#e0ad7f', 6, 23 + step, 4, 10);
          rect(c, '#e0ad7f', 24, 23 - step, 4, 10);
          rect(c, '#654c3b', 8, 7, 17, 16);
          rect(c, '#e7b98b', 10, 10, 14, 12);
          rect(c, '#efd0a0', 11, 10, 10, 4);
          if (dir === 'up') {
            rect(c, '#654c3b', 9, 10, 16, 13);
            rect(c, '#b29965', 10, 22, 13, 11);
            rect(c, '#dac08b', 12, 22, 9, 3);
          } else {
            rect(c, '#283c3c', dir === 'left' ? 10 : dir === 'right' ? 21 : 12, 16, 2, 3);
            if (dir === 'down') rect(c, '#283c3c', 20, 16, 2, 3);
          }
          const hat =
            skin === 'researcher'
              ? '#d5dbcf'
              : skin === 'resident'
                ? '#735644'
                : skin === 'ranger'
                  ? '#7e8555'
                  : '#cfb877';
          rect(c, hat, 8, 4, 18, 7);
          rect(c, hat, 4, 10, 25, 4);
          rect(c, '#f2db9b', 10, 4, 12, 2);
          if (skin === 'player') {
            rect(c, '#d9b36b', 8, 20, 17, 3);
            rect(c, '#d9b36b', 22, 22, 3, 6);
          }
        });
      }
  make(scene, 'mote', 3, 3, (c) => rect(c, '#eee2a2', 0, 0, 3, 3));
}
