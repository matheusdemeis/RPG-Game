import * as Phaser from 'phaser';
import { areas } from '../data/maps';
import { drawWorld } from '../art/world';
import { UI, button } from '../ui/UI';
import { GameSession } from '../state/GameSession';
import { loadGame } from '../systems/SaveSystem';

export class TitleScene extends Phaser.Scene {
  private ui = new UI();
  constructor() { super('Title'); }
  create() {
    drawWorld(this, areas.willowmere);
    this.cameras.main.setScroll(175,120);
    this.cameras.main.setZoom(1.15);
    this.cameras.main.fadeIn(700,15,36,36);
    this.renderTitle();
    this.events.once('shutdown',()=>this.ui.clear());
  }
  private renderTitle(){
    const saved=loadGame();
    const note=saved.ok?`${saved.state.creatures.length} companions · ${Math.floor(saved.state.playSeconds/60)} min explored`:saved.reason==='invalid'?'This save is unreadable or from an unsupported version. Start a new journey.':saved.reason==='unavailable'?'Browser storage is unavailable. You can play, but saving may not work.':'Your adventure starts here. No account needed.';
    this.ui.render(`<div class="title-screen"><div class="title-copy"><div class="eyebrow">THE AURALIS CHRONICLES</div><h1>ECHO<span>WILD</span></h1><div class="title-rule">✦</div><p>A quiet village. A strange new song.<br>A companion for the road ahead.</p><div class="title-menu">${button('new','New journey <span>→</span>','class="primary"')}${button('continue','Continue journey <span>↗</span>',saved.ok?'':'disabled')}</div><div class="save-note">${note}</div><div class="title-note">CHAPTER ONE <b>The Crystal Disturbance</b></div></div><div class="title-stamp"><span>EXPLORE · BEFRIEND · DISCOVER</span><small>A world worth getting lost in.</small></div></div>`);
    const start=()=>{(this.registry.get('session') as GameSession).reset();this.scene.start('World');};
    this.ui.on('new',()=> {
      if(!saved.ok){start();return;}
      this.ui.render(`<div class="scrim"><section class="modal journal"><div class="eyebrow">A FRESH PAGE</div><h2>Begin a new journey?</h2><p>Your current save stays safe until you save this new adventure. Saving later will replace it.</p>${button('confirm','Begin again','class="primary"')}${button('cancel','Keep my journey')}</section></div>`);
      this.ui.on('confirm',start);this.ui.on('cancel',()=>this.renderTitle());this.ui.focus();
    });
    this.ui.on('continue',()=>{if(saved.ok){(this.registry.get('session') as GameSession).state=saved.state;this.scene.start('World');}});
    this.ui.focus();
  }
}
