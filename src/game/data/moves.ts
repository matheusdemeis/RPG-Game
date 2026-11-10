import type { Element } from '../types';
export interface Move { id: string; name: string; element: Element | null; power: number; accuracy: number; kind: 'damage' | 'restore'; description: string }
export const moves: Record<string,Move> = {
  nudge:{id:'nudge',name:'Nudge',element:null,power:24,accuracy:1,kind:'damage',description:'A reliable, gentle tumble. No type advantage.'},
  ember:{id:'ember',name:'Ember Flick',element:'Fire',power:35,accuracy:1,kind:'damage',description:'A dancing spark. Strong against Nature.'},
  ripple:{id:'ripple',name:'Ripple Jet',element:'Water',power:35,accuracy:1,kind:'damage',description:'A focused splash. Strong against Fire.'},
  leaf:{id:'leaf',name:'Leaf Skim',element:'Nature',power:35,accuracy:1,kind:'damage',description:'A whirling leaf. Strong against Water.'},
  nest:{id:'nest',name:'Take Root',element:null,power:0,accuracy:1,kind:'restore',description:'Rest a moment to recover 30% of maximum HP.'},
  flare:{id:'flare',name:'Sunflare',element:'Fire',power:55,accuracy:.8,kind:'damage',description:'A brilliant blaze. Powerful, but 80% accurate.'},
  surge:{id:'surge',name:'River Surge',element:'Water',power:55,accuracy:.8,kind:'damage',description:'A rolling wave. Powerful, but 80% accurate.'},
  bloom:{id:'bloom',name:'Wild Bloom',element:'Nature',power:55,accuracy:.8,kind:'damage',description:'A burst of petals. Powerful, but 80% accurate.'},
};
