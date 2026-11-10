import type { Element, SpeciesId } from '../types';

export interface Species {
  id: SpeciesId;
  name: string;
  element: Element;
  subtitle: string;
  description: string;
  base: { hp: number; attack: number; defense: number; speed: number };
  moves: [string, string, string, string];
}
export const species: Record<SpeciesId, Species> = {
  solkit: {
    id: 'solkit',
    name: 'Solkit',
    element: 'Fire',
    subtitle: 'The ember-hearted explorer',
    description: 'A bright spark with an even brighter spirit. Its warm tail lights the way home.',
    base: { hp: 27, attack: 12, defense: 9, speed: 13 },
    moves: ['nudge', 'ember', 'nest', 'flare'],
  },
  brooklet: {
    id: 'brooklet',
    name: 'Brooklet',
    element: 'Water',
    subtitle: 'The little river guardian',
    description:
      'Patient, curious, and happiest in the rain. It keeps smooth pebbles as souvenirs.',
    base: { hp: 31, attack: 10, defense: 12, speed: 9 },
    moves: ['nudge', 'ripple', 'nest', 'surge'],
  },
  mossling: {
    id: 'mossling',
    name: 'Mossling',
    element: 'Nature',
    subtitle: 'A small, steadfast sprout',
    description: 'A gentle forest wanderer. Tiny flowers bloom on its back when it feels at home.',
    base: { hp: 30, attack: 11, defense: 11, speed: 10 },
    moves: ['nudge', 'leaf', 'nest', 'bloom'],
  },
};
export const speciesIds = Object.keys(species) as SpeciesId[];
