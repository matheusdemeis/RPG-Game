import type { MapId } from '../../types';

export interface Planting {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'garden' | 'fern' | 'flowers';
}

// Low, walkable planting: visual composition never changes collision or encounter tiles.
export const plantings: Record<MapId, Planting[]> = {
  willowmere: [
    { x: 4, y: 13, w: 9, h: 2, kind: 'garden' },
    { x: 11, y: 8, w: 2, h: 6, kind: 'flowers' },
    { x: 23, y: 13, w: 5, h: 4, kind: 'garden' },
    { x: 28, y: 13, w: 6, h: 3, kind: 'flowers' },
    { x: 4, y: 24, w: 11, h: 3, kind: 'garden' },
    { x: 24, y: 20, w: 2, h: 7, kind: 'fern' },
    { x: 34, y: 21, w: 3, h: 5, kind: 'flowers' },
    { x: 22, y: 4, w: 3, h: 6, kind: 'fern' },
  ],
  trail: [
    { x: 3, y: 4, w: 2, h: 12, kind: 'fern' },
    { x: 12, y: 5, w: 3, h: 8, kind: 'fern' },
    { x: 23, y: 10, w: 4, h: 3, kind: 'flowers' },
    { x: 29, y: 14, w: 6, h: 4, kind: 'fern' },
    { x: 3, y: 20, w: 4, h: 8, kind: 'flowers' },
    { x: 23, y: 22, w: 3, h: 6, kind: 'fern' },
    { x: 15, y: 21, w: 3, h: 5, kind: 'flowers' },
  ],
};
