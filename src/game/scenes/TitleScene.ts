import * as Phaser from 'phaser';
import { areas } from '../data/maps';
import { drawWorld } from '../art/world';
import { UI, button } from '../ui/UI';
import { GameSession } from '../state/GameSession';

export class TitleScene extends Phaser.Scene {
  private ui = new UI();
  constructor() { super('Title'); }
  create() {
    drawWorld(this, areas.willowmere);
    this.cameras.main.setScroll(175,120);
    this.cameras.main.setZoom(1.15);
    this.cameras.main.fadeIn(700,15,36,36);
    this.ui.render(`<div class="title-screen"><div class="title-copy"><div class="eyebrow">THE AURALIS CHRONICLES</div><h1>ECHO<span>WILD</span></h1><div class="title-rule">✦</div><p>A quiet village. A strange new song.<br>A companion for the road ahead.</p><div class="title-menu">${button('new','Begin your journey <span>→</span>','class="primary"')}</div><div class="title-note">CHAPTER ONE <b>The Crystal Disturbance</b></div></div><div class="title-stamp"><span>EXPLORE · BEFRIEND · DISCOVER</span><small>A world worth getting lost in.</small></div></div>`);
    this.ui.on('new',()=> { (this.registry.get('session') as GameSession).reset(); this.scene.start('World'); });
    this.ui.focus();
    this.events.once('shutdown',()=>this.ui.clear());
  }
}
