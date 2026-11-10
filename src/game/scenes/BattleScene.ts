import * as Phaser from 'phaser';
import { UI, button } from '../ui/UI';
import { GameSession } from '../state/GameSession';
import { BattleSystem } from '../systems/BattleSystem';
import { createCreature, healParty, stats, xpToNext } from '../systems/CreatureSystem';
import { species, speciesIds } from '../data/creatures';
import { moves } from '../data/moves';
import type { Creature } from '../types';
import { canCapture, captureChance } from '../systems/CaptureSystem';

export class BattleScene extends Phaser.Scene {
  protected ui = new UI();
  protected battle!: BattleSystem;
  protected session!: GameSession;
  private playerSprite!: Phaser.GameObjects.Image;
  private wildSprite!: Phaser.GameObjects.Image;
  private busy=false;
  private message='';
  constructor(){super('Battle');}
  create(){
    this.session=this.registry.get('session') as GameSession;
    const level=Math.min(12,Math.max(3,(this.session.state.creatures.find(c=>c.uid===this.session.state.activeUid)?.level??5)-1));
    const wild=createCreature(speciesIds[Phaser.Math.Between(0,2)]!,level);
    this.battle=new BattleSystem(this.session.state,wild);this.busy=false;
    this.drawClearing();
    this.playerSprite=this.add.image(260,368,this.battle.player.species).setScale(6).setOrigin(.5,1);
    this.wildSprite=this.add.image(700,246,wild.species).setScale(4.6).setOrigin(.5,1).setFlipX(true);
    this.tweens.add({targets:[this.playerSprite,this.wildSprite],y:'-=5',duration:1600,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.message=`A wild ${species[wild.species].name} emerges from the whispering grass!`;
    this.cameras.main.fadeIn(350,24,51,40);
    this.render();
    const keyboard=this.input.keyboard!;
    keyboard.on('keydown',this.onKey,this);
    this.events.once('shutdown',()=>{this.ui.clear();keyboard.off('keydown',this.onKey,this);});
  }
  private onKey(event:KeyboardEvent){
    if(this.busy)return;
    const index=Number(event.key)-1;
    if(index>=0&&index<4&&this.battle.outcome==='active')this.play(this.battle.act(species[this.battle.player.species].moves[index]!));
    if(event.key==='Escape'&&this.battle.outcome==='active')this.play(this.battle.flee());
    if(event.key.toLowerCase()==='c'&&this.battle.outcome==='active')this.play(this.battle.capture());
    if(event.key.toLowerCase()==='t'&&this.battle.outcome==='active')this.play(this.battle.tonic());
    if((event.key==='e'||event.key==='E')&&this.battle.outcome!=='active')this.finish();
  }
  private drawClearing(){
    this.cameras.main.setBackgroundColor('#98b4a1');
    const g=this.add.graphics();
    g.fillStyle(0xb7cbb0);g.fillRect(0,0,960,180);
    g.fillStyle(0x7c9a7c);g.fillRect(0,180,960,420);
    for(let i=0;i<18;i++)this.add.image(i*68-30,185+(i%3)*10,'tree').setScale(1.6).setTint(0x7c9b87);
    g.fillStyle(0xa0b287);g.fillEllipse(690,237,338,90);
    g.fillStyle(0x526f53);g.fillEllipse(256,367,360,90);
    g.fillStyle(0x8eaa74);g.fillEllipse(256,355,360,82);
    // Draw foreground platforms after the distant tree line.
    const platforms=this.add.graphics();platforms.fillStyle(0xa3b486);platforms.fillEllipse(700,240,330,72);platforms.fillStyle(0x91a775);platforms.fillEllipse(260,364,360,80);
    for(let i=0;i<28;i++){const x=(i*137)%960,y=270+(i*31)%140;this.add.image(x,y,'mote').setAlpha(.4);}
  }
  private status(c:Creature,side:'ally'|'enemy'){
    const def=species[c.species],max=stats(c).hp,ratio=c.hp/max;
    return `<section class="battle-status ${side}" aria-label="${side==='ally'?'Your':'Wild'} ${def.name}"><div><strong>${def.name}</strong><span>Lv. ${c.level}</span></div><small class="type ${def.element.toLowerCase()}">${def.element}</small><div class="hp-row"><span>HP</span><div class="hp-track"><i style="width:${ratio*100}%;background:${ratio<.25?'#ce785f':ratio<.5?'#d2b26a':'#88b77b'}"></i></div><b>${c.hp} / ${max}</b></div>${side==='ally'?`<div class="xp-track"><i style="width:${c.xp/xpToNext(c.level)*100}%"></i></div>`:''}</section>`;
  }
  protected extraActions():string{
    const chance=Math.round(captureChance(this.battle.wild)*100);
    return `${button('capture',`Prism ×${this.session.state.inventory.prisms} <small>${chance}%</small> <kbd>C</kbd>`,this.busy||!canCapture(this.session.state,this.battle.wild)?'disabled':'')}${button('tonic',`Tonic ×${this.session.state.inventory.tonics} <kbd>T</kbd>`,this.busy||this.session.state.inventory.tonics<=0||this.battle.player.hp===stats(this.battle.player).hp?'disabled':'')}`;
  }
  protected bindExtraActions(){
    this.ui.on('capture',()=>{if(!this.busy)this.play(this.battle.capture());});
    this.ui.on('tonic',()=>{if(!this.busy)this.play(this.battle.tonic());});
  }
  protected render(){
    const active=this.battle.outcome==='active',disabled=this.busy?'disabled':'';
    this.playerSprite.setTexture(this.battle.player.species);
    this.ui.render(`<div class="battle-heading"><span>WHISPERING TRAIL</span><b>Wild encounter</b></div>${this.status(this.battle.wild,'enemy')}${this.status(this.battle.player,'ally')}<section class="battle-console"><div class="battle-message" role="status" aria-live="polite"><small>${active?'MAKE YOUR MOVE':this.battle.outcome==='victory'?'A LITTLE STRONGER':'THE JOURNEY CONTINUES'}</small><p>${this.message}</p><div class="battle-tools">${active?`${this.extraActions()}${button('run','Leave <kbd>Esc</kbd>',disabled)}`:''}</div></div><div class="move-grid">${active?species[this.battle.player.species].moves.map((id,i)=>{const m=moves[id]!;return button(`move-${id}`,`<span>${i+1} <b>${m.name}</b></span><small>${m.kind==='restore'?'RECOVER 30% HP':`${m.element??'Neutral'} · ${m.power} power · ${m.accuracy*100}%`}</small>`,`class="move ${m.element?.toLowerCase()??'neutral'}" title="${m.description}" ${disabled}`);}).join(''):button('finish','Back to the trail <span>→</span>','class="primary finish" '+disabled)}</div></section>`);
    for(const id of species[this.battle.player.species].moves)this.ui.on(`move-${id}`,()=>{if(!this.busy)this.play(this.battle.act(id));});
    this.ui.on('run',()=>{if(!this.busy)this.play(this.battle.flee());});
    this.ui.on('finish',()=>this.finish());this.bindExtraActions();
  }
  protected play(lines:string[]){
    if(!lines.length)return;
    this.busy=true;
    this.tweens.add({targets:this.wildSprite,alpha:.35,duration:90,yoyo:true,repeat:1});
    let index=0;
    const next=()=>{
      this.message=lines[index++]!;this.render();
      if(index<lines.length)this.time.delayedCall(700,next);
      else this.time.delayedCall(450,()=>{this.busy=false;this.render();});
    };next();
  }
  private finish(){
    if(this.busy)return;
    if(this.battle.outcome==='defeat'){
      healParty(this.session.state);this.session.state.player={map:'willowmere',x:16,y:17,facing:'up'};
    }
    this.registry.set('encounterGrace',true);this.scene.start('World');
  }
}
