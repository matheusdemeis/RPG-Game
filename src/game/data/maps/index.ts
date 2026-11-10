import type { MapId } from '../../types';

export const TILE = 32;
export const WIDTH = 40;
export const HEIGHT = 30;
export const enum Ground {
  Meadow,
  Path,
  Grass,
  Water,
  Flowers,
  Stone,
}
export interface WorldObject {
  kind: 'tree' | 'house' | 'lab' | 'rock' | 'crystal' | 'sign' | 'fence';
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface NpcData {
  id: 'researcher' | 'resident' | 'ranger';
  name: string;
  x: number;
  y: number;
  skin: string;
}
export interface Area {
  id: MapId;
  name: string;
  subtitle: string;
  ground: number[][];
  blocked: boolean[][];
  objects: WorldObject[];
  npcs: NpcData[];
  exit: { x: number; y: number; to: MapId; spawnX: number; spawnY: number };
}

function makeArea(id: MapId): Area {
  const ground: number[][] = Array.from({ length: HEIGHT }, () =>
    Array<number>(WIDTH).fill(Ground.Meadow),
  );
  const blocked = Array.from({ length: HEIGHT }, () => Array<boolean>(WIDTH).fill(false));
  const objects: WorldObject[] = [];
  const paint = (x: number, y: number, w: number, h: number, tile: Ground) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) ground[j]![i] = tile;
  };
  const object = (kind: WorldObject['kind'], x: number, y: number, w = 1, h = 1) => {
    objects.push({ kind, x, y, w, h });
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) blocked[j]![i] = true;
  };
  paint(19, 0, 3, HEIGHT, Ground.Path);
  for (let x = 0; x < WIDTH; x += 2) {
    if (x < 18 || x > 22) {
      object('tree', x, 0, 2, 2);
      object('tree', x, 28, 2, 2);
    }
  }
  for (let y = 2; y < 28; y += 2) {
    object('tree', 0, y, 2, 2);
    object('tree', 38, y, 2, 2);
  }
  let npcs: NpcData[];
  if (id === 'willowmere') {
    paint(5, 17, 30, 3, Ground.Path);
    paint(13, 14, 11, 7, Ground.Path);
    paint(6, 11, 4, 7, Ground.Path);
    paint(29, 12, 3, 7, Ground.Path);
    paint(6, 23, 8, 3, Ground.Flowers);
    paint(26, 21, 8, 5, Ground.Water);
    paint(25, 23, 10, 1, Ground.Stone);
    object('lab', 13, 8, 6, 6);
    object('house', 5, 8, 5, 5);
    object('house', 28, 8, 5, 5);
    object('house', 6, 20, 5, 4);
    for (const [x, y] of [
      [3, 4],
      [7, 3],
      [11, 3],
      [25, 3],
      [29, 3],
      [34, 4],
      [3, 22],
      [15, 24],
      [23, 25],
      [35, 20],
      [34, 12],
    ] as const)
      object('tree', x, y, 2, 2);
    for (let x = 4; x < 13; x++) object('fence', x, 15);
    object('sign', 23, 11);
    object('rock', 24, 22);
    npcs = [
      { id: 'researcher', name: 'Dr. Liora', x: 16, y: 15, skin: 'researcher' },
      { id: 'resident', name: 'Maren', x: 27, y: 18, skin: 'resident' },
    ];
  } else {
    paint(8, 19, 24, 2, Ground.Path);
    paint(13, 13, 14, 6, Ground.Grass);
    paint(7, 23, 8, 4, Ground.Grass);
    paint(27, 7, 7, 6, Ground.Grass);
    paint(5, 6, 7, 8, Ground.Water);
    paint(15, 4, 11, 6, Ground.Stone);
    paint(16, 24, 2, 3, Ground.Flowers);
    for (const [x, y] of [
      [3, 3],
      [12, 3],
      [27, 3],
      [33, 4],
      [3, 17],
      [7, 16],
      [10, 17],
      [28, 17],
      [33, 16],
      [34, 22],
      [25, 24],
      [29, 26],
      [4, 25],
      [12, 10],
    ] as const)
      object('tree', x, y, 2, 2);
    for (const [x, y] of [
      [14, 7],
      [26, 6],
      [25, 10],
      [12, 22],
      [29, 21],
    ] as const)
      object('rock', x, y);
    object('crystal', 20, 6, 1, 2);
    object('sign', 22, 26);
    npcs = [{ id: 'ranger', name: 'Ranger Fen', x: 18, y: 22, skin: 'ranger' }];
  }
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      if (
        ground[y]![x] === Ground.Water ||
        x === 0 ||
        x === WIDTH - 1 ||
        y === 0 ||
        y === HEIGHT - 1
      )
        blocked[y]![x] = true;
    }
  return {
    id,
    name: id === 'willowmere' ? 'Willowmere Village' : 'Whispering Trail',
    subtitle:
      id === 'willowmere' ? 'Where every journey takes root' : 'Follow the song of the forest',
    ground,
    blocked,
    objects,
    npcs,
    exit:
      id === 'willowmere'
        ? { x: 20, y: 1, to: 'trail', spawnX: 20, spawnY: 27 }
        : { x: 20, y: 28, to: 'willowmere', spawnX: 20, spawnY: 2 },
  };
}

export const areas: Record<MapId, Area> = {
  willowmere: makeArea('willowmere'),
  trail: makeArea('trail'),
};
export function canWalk(area: Area, x: number, y: number): boolean {
  return (
    x >= 0 &&
    y >= 0 &&
    x < WIDTH &&
    y < HEIGHT &&
    !area.blocked[y]![x] &&
    !area.npcs.some((n) => n.x === x && n.y === y)
  );
}

/** Standard orthogonal Tiled JSON, including collision and semantic object layers. */
export function toTiled(area: Area) {
  return {
    type: 'map',
    version: 1.1,
    tiledversion: '1.11.0',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    width: WIDTH,
    height: HEIGHT,
    tilewidth: TILE,
    tileheight: TILE,
    infinite: false,
    tilesets: [
      {
        firstgid: 1,
        name: 'auralis',
        tilewidth: TILE,
        tileheight: TILE,
        tilecount: 6,
        columns: 6,
        image: 'auralis.png',
        imagewidth: 192,
        imageheight: 32,
        margin: 0,
        spacing: 0,
      },
    ],
    layers: [
      {
        id: 1,
        name: 'Ground',
        type: 'tilelayer',
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,
        opacity: 1,
        visible: true,
        data: area.ground.flat().map((t) => t + 1),
      },
      {
        id: 2,
        name: 'Collision',
        type: 'tilelayer',
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,
        opacity: 1,
        visible: false,
        data: area.blocked.flat().map((t) => (t ? 1 : 0)),
      },
      {
        id: 3,
        name: 'Objects',
        type: 'objectgroup',
        opacity: 1,
        visible: true,
        objects: area.objects.map((o, i) => ({
          id: i + 1,
          name: o.kind,
          type: o.kind,
          x: o.x * TILE,
          y: o.y * TILE,
          width: o.w * TILE,
          height: o.h * TILE,
        })),
      },
    ],
  };
}
