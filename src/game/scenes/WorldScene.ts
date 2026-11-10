import * as Phaser from 'phaser';
import { areas, canWalk, TILE, WIDTH, HEIGHT, type Area, type NpcData } from '../data/maps';
import { drawWorld } from '../art/world';
import { GameSession } from '../state/GameSession';
import type { Facing } from '../types';
import { UI, button } from '../ui/UI';
import { DialogueSystem } from '../systems/DialogueSystem';

export class WorldScene extends Phaser.Scene {
  protected session!: GameSession;
  protected ui = new UI();
  protected dialogue = new DialogueSystem();
  protected area!: Area;
  protected player!: Phaser.GameObjects.Image;
  protected moving = false;
  protected modal = false;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private interactHint = '';
  constructor() { super('World'); }
  create() {
    this.session = this.registry.get('session') as GameSession;
    this.area = areas[this.session.state.player.map];
    this.moving = false; this.modal = false; this.dialogue = new DialogueSystem(); this.interactHint = '';
    drawWorld(this,this.area);
    const p = this.session.state.player;
    this.player = this.add.image(p.x*TILE+16,p.y*TILE+30,`player-${p.facing}-0`).setOrigin(0.5,1).setDepth(p.y*TILE+31);
    this.cameras.main.setBounds(0,0,WIDTH*TILE,HEIGHT*TILE).startFollow(this.player,true,0.15,0.15);
    this.cameras.main.fadeIn(350,18,40,39);
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ESC,TAB') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture(['UP','DOWN','LEFT','RIGHT','SPACE']);
    this.renderHud();
    this.time.addEvent({ delay:1000, loop:true, callback:()=>{ this.session.state.playSeconds++; } });
    this.events.once('shutdown',()=> { this.ui.clear(); this.input.keyboard!.removeAllKeys(true); });
  }
  update() {
    if (!this.keys || this.moving) return;
    const pressed = (key: string) => Phaser.Input.Keyboard.JustDown(this.keys[key]!);
    const interact = pressed('E') || pressed('SPACE');
    if (this.dialogue.active) { if (interact) { this.dialogue.advance(); if(this.dialogue.active)this.renderDialogue();else if(!this.modal)this.renderHud(); } return; }
    if (pressed('ESC') || pressed('TAB')) { if(this.modal){this.modal=false;this.renderHud();}else this.openMenu(); return; }
    if (this.modal) return;
    if (interact) { this.interact(); return; }
    const down=(...keys:string[])=>keys.some(k=>this.keys[k]!.isDown);
    if(down('UP','W'))this.step(0,-1,'up');
    else if(down('DOWN','S'))this.step(0,1,'down');
    else if(down('LEFT','A'))this.step(-1,0,'left');
    else if(down('RIGHT','D'))this.step(1,0,'right');
  }
  private step(dx:number,dy:number,facing:Facing) {
    const p=this.session.state.player; p.facing=facing;
    this.player.setTexture(`player-${facing}-0`);
    if(!canWalk(this.area,p.x+dx,p.y+dy))return;
    this.moving=true;
    p.x+=dx;p.y+=dy;
    this.player.setTexture(`player-${facing}-${(p.x+p.y)%2+1}`);
    this.tweens.add({targets:this.player,x:p.x*TILE+16,y:p.y*TILE+30,duration:145,onUpdate:()=>this.player.setDepth(this.player.y+1),onComplete:()=>{
      this.moving=false;this.player.setTexture(`player-${facing}-0`);this.afterStep();
    }});
  }
  protected afterStep() {
    const p=this.session.state.player, exit=this.area.exit;
    if(p.x===exit.x&&p.y===exit.y){p.map=exit.to;p.x=exit.spawnX;p.y=exit.spawnY;this.scene.restart();return;}
    const target=this.nearby(); const hint=target?.label??'';
    if(hint!==this.interactHint){this.interactHint=hint;this.renderHud();}
  }
  private nearby(): {label:string;npc?:NpcData;kind?:string} | undefined {
    const p=this.session.state.player;
    const npc=this.area.npcs.find(n=>Math.abs(n.x-p.x)+Math.abs(n.y-p.y)<=1);
    if(npc)return {label:`Talk to ${npc.name}`,npc};
    const obj=this.area.objects.find(o=>['sign','crystal'].includes(o.kind)&&p.x>=o.x-1&&p.x<=o.x+o.w&&p.y>=o.y-1&&p.y<=o.y+o.h);
    if(obj)return {label:obj.kind==='crystal'?'Investigate crystal':'Read sign',kind:obj.kind};
  }
  protected interact() {
    const target=this.nearby();
    if(target?.npc)this.talk(target.npc);
    else if(target?.kind==='sign')this.say('Trail sign',[this.area.id==='willowmere'?'NORTH — Whispering Trail. Listen closely. Leave only footprints.':'SOUTH — Willowmere Village. Dr. Liora welcomes weary companions.']);
    else if(target?.kind==='crystal')this.say('A strange resonance',['The crystal hums like a half-remembered melody. Its light pulses beneath your fingertips.']);
  }
  protected talk(npc:NpcData) {
    const lines:Record<NpcData['id'],string[]>={
      researcher:['There you are! I’m Liora. I study the echoes that connect every living thing in Auralis.','Something has changed on Whispering Trail. Crystals are growing where the old trees used to sing.'],
      resident:['My grandmother said the forest remembers every kind thing we do.','I leave flowers by the pond. A little kindness never hurt a mysterious forest.'],
      ranger:['Welcome to Whispering Trail! Wild companions hide in the deep grass.','The northern clearing has been glowing all night. Take care up there.'],
    };
    this.say(npc.name,lines[npc.id]);
  }
  protected say(speaker:string,lines:string[],done?:()=>void) { this.dialogue.start(speaker,lines,done);this.renderDialogue(); }
  protected hud() { return `<div class="hud"><div class="location"><small>AURALIS · ${this.area.id==='trail'?'ROUTE 01':'HOME'}</small><strong>${this.area.name}</strong></div>${button('menu','Journal <kbd>Tab</kbd>','class="menu-button"')}</div><div class="objective"><span>✦</span><div><small>THE CRYSTAL DISTURBANCE</small><p>Find Dr. Liora outside the laboratory.</p></div></div><div class="world-controls"><span><kbd>W A S D</kbd> move</span><span><kbd>E</kbd> ${this.interactHint||'interact'}</span><span><kbd>Tab</kbd> journal</span></div>`; }
  protected renderHud(){this.ui.render(this.hud());this.ui.on('menu',()=>this.openMenu());}
  protected renderDialogue(){
    this.ui.render(`${this.hud()}<section class="dialogue" role="dialog" aria-label="Conversation with ${this.dialogue.speaker}"><div class="speaker">${this.dialogue.speaker}</div><p aria-live="polite">${this.dialogue.text}</p>${button('advance',`${this.dialogue.last?'Continue':'Next'} <kbd>E</kbd>`)}</section>`);
    this.ui.on('advance',()=>{this.dialogue.advance();if(this.dialogue.active)this.renderDialogue();else if(!this.modal)this.renderHud();});
  }
  protected openMenu(){
    this.modal=true;this.ui.render(`${this.hud()}<div class="scrim"><section class="modal journal"><div class="eyebrow">FIELD NOTES / AURALIS</div><h2>Your journey</h2><p>Find Dr. Liora outside the laboratory. Head north to explore Whispering Trail.</p>${button('close','Return to the trail','class="primary"')}${button('title','Title screen')}</section></div>`);
    this.ui.on('close',()=>{this.modal=false;this.renderHud();});this.ui.on('title',()=>this.scene.start('Title'));this.ui.focus();
  }
}
