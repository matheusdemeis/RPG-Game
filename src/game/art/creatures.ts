import * as Phaser from 'phaser';
import type { SpeciesId } from '../types';

// Hand-authored 32px silhouettes. The same original art is used for combat and the field journal.
const art: Record<SpeciesId, string[]> = {
  solkit: [
    '     oo            oo           ',
    '     ooo          ooo           ',
    '     oddo        oddo           ',
    '     odddoooooooodddo           ',
    '      offooooooooffo            ',
    '      offffffffffoo            ',
    '     offfffffffffffo           ',
    '    offfwfffffffwfffo          ',
    '    offfkfffffffkfffo          ',
    '    offfkfffffffkfffo          ',
    '    offccccckccccfffo          ',
    '     ofccccccccccfoo      y    ',
    '      oofccccccffoo      yy    ',
    '       ooffffffoo      yyfy    ',
    '      offffffffco     yyffy    ',
    '      offffffccccoo  yfffcy    ',
    '     offffffccccccooffffcy     ',
    '     offffffccccccoffffco      ',
    '     offdfffcccccofffcco       ',
    '     offdfffcccccoffcco        ',
    '     odddfffccccooocco         ',
    '      oddoooofffoo             ',
    '      occo  occco              ',
  ],
  brooklet: [
    '        tt            tt       ',
    '       tllt          tllt      ',
    '       tlltttttttttttllt       ',
    '      tllllllbbbblllllllt      ',
    '     tllllbbbbbbbbbblllllt     ',
    '    tlllbbbbbbbbbbbbbblllt     ',
    '   tlllwwbbbbbbbbbbwwllllt     ',
    '   tlllwkbbbbbbbbbbkwllllt     ',
    '   tlllkkbbbbbbbbbbkkllllt     ',
    '    tllbbbbbbbbbbbbbbbllt      ',
    '     tbbcccccbbcccccbbt        ',
    '      tbccccccccccccbt         ',
    '     tbbbccccccccccbbbt        ',
    '    tbbbbbbbbbbbbbbbbbbt       ',
    '   tllbbbbbccccccbbbblllt      ',
    '   tllbbbbccccccccbbblllt  tt  ',
    '    ttbbbbccccccccbbbtt tlllt  ',
    '     tbbbbccccccccbbbbttlllt   ',
    '     tbbbbbccccccbbbbbbbllt    ',
    '      tbbbbbccccbbbbbbbbt     ',
    '     tlllltbbbbbbtllllt        ',
    '    tllllllt    tllllllt       ',
    '     tttttt      tttttt        ',
  ],
  mossling: [
    '              gg              ',
    '        ggg  gllg             ',
    '       glllg gllg   pp        ',
    '       gllllgllg   pwwp       ',
    '        glllllg     pp        ',
    '      ggggllggggggggg         ',
    '    ggllllgllllllllllgg       ',
    '   gllllllggllllllgglllg      ',
    '   glllllllllllllgllllllg     ',
    '  gllllgggggggggggglllllg     ',
    '  glllgbbbbbbbbbbbbggllllg    ',
    '  gllgbbbbwbbbbbwbbbbglllg    ',
    '   glgbbbbkbbbbbkbbbbgllg     ',
    '    ggbbbbkbcccbbkbbbggg      ',
    '     gbbbbbbbbbbbbbbbg        ',
    '    gllbbbccccccccbbllg       ',
    '   glllbbbbccccccbbblllg      ',
    '   glllbbbbbbbbbbbbblllg      ',
    '    gggbbbbbbbbbbbbbggg       ',
    '      gbbbbbggbbbbbgg         ',
    '      gddddg  gddddg          ',
    '       gggg    gggg           ',
  ],
};
const palettes: Record<SpeciesId, Record<string, string>> = {
  solkit: {
    o: '#653f38',
    d: '#a85a43',
    f: '#ed9557',
    c: '#ffe0a0',
    k: '#293f3f',
    w: '#fff9dc',
    y: '#f6c966',
  },
  brooklet: { t: '#2c5966', l: '#72c6c0', b: '#509dad', c: '#c8e3c2', k: '#233c4d', w: '#f5f2d4' },
  mossling: {
    g: '#365745',
    l: '#88ad60',
    b: '#c3ba80',
    c: '#e8d9a5',
    d: '#8c7c55',
    k: '#273f3c',
    w: '#fcf0d5',
    p: '#e8ad9e',
  },
};
export function generateCreatures(scene: Phaser.Scene) {
  for (const id of Object.keys(art) as SpeciesId[]) {
    const texture = scene.textures.createCanvas(id, 40, 36)!;
    const c = texture.context;
    art[id].forEach((row, y) =>
      [...row].forEach((pixel, x) => {
        if (pixel !== ' ') {
          c.fillStyle = palettes[id][pixel]!;
          c.fillRect(x + 3, y + 6, 1, 1);
        }
      }),
    );
    texture.refresh();
  }
}
export function creatureImage(scene: Phaser.Scene, id: SpeciesId): string {
  return scene.textures.getBase64(id);
}
