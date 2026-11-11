import * as Phaser from 'phaser';
import { UI, button } from '../ui/UI';
import { GameSession } from '../state/GameSession';
import { BattleSystem, type BattleOutcome } from '../systems/BattleSystem';
import { createCreature, healParty, stats, xpToNext } from '../systems/CreatureSystem';
import { species, speciesIds } from '../data/creatures';
import { moves } from '../data/moves';
import type { Creature } from '../types';
import { canCapture, captureChance } from '../systems/CaptureSystem';
import { reducedMotion } from '../art/motion';
import { drawBattlefield } from '../art/battlefield';
import { BattleEffects } from '../ui/BattleEffects';

export class BattleScene extends Phaser.Scene {
  protected ui = new UI();
  protected battle!: BattleSystem;
  protected session!: GameSession;
  private playerSprite!: Phaser.GameObjects.Image;
  private wildSprite!: Phaser.GameObjects.Image;
  private busy = false;
  private message = '';
  private displayPlayer!: Creature;
  private displayWild!: Creature;
  private shownOutcome: BattleOutcome = 'active';
  private effects!: BattleEffects;
  private selectedMove = '';
  private turn = 1;
  constructor() {
    super('Battle');
  }
  create() {
    this.session = this.registry.get('session') as GameSession;
    const level = Math.min(
      12,
      Math.max(
        3,
        (this.session.state.creatures.find((c) => c.uid === this.session.state.activeUid)?.level ??
          5) - 1,
      ),
    );
    const wild = createCreature(speciesIds[Phaser.Math.Between(0, 2)]!, level);
    this.battle = new BattleSystem(this.session.state, wild);
    this.busy = false;
    this.displayPlayer = { ...this.battle.player };
    this.displayWild = { ...wild };
    this.shownOutcome = 'active';
    this.selectedMove = '';
    this.turn = 1;
    drawBattlefield(this);
    this.playerSprite = this.add
      .image(260, 368, this.battle.player.species)
      .setScale(6)
      .setOrigin(0.5, 0.82);
    this.wildSprite = this.add
      .image(700, 246, wild.species)
      .setScale(4.6)
      .setOrigin(0.5, 0.82)
      .setFlipX(true);
    if (!reducedMotion())
      for (const sprite of [this.playerSprite, this.wildSprite])
        this.tweens.add({
          targets: sprite,
          scaleY: '-=0.06',
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
    this.effects = new BattleEffects(this, { player: this.playerSprite, wild: this.wildSprite });
    if (!reducedMotion()) {
      this.playerSprite.setX(215);
      this.wildSprite.setX(745);
      this.tweens.add({ targets: this.playerSprite, x: 260, duration: 460, ease: 'Cubic.easeOut' });
      this.tweens.add({ targets: this.wildSprite, x: 700, duration: 460, ease: 'Cubic.easeOut' });
    }
    this.message = `A wild ${species[wild.species].name} emerges from the whispering grass!`;
    this.cameras.main.fadeIn(reducedMotion() ? 0 : 350, 24, 51, 40);
    this.render();
    const keyboard = this.input.keyboard!;
    keyboard.on('keydown', this.onKey, this);
    this.events.once('shutdown', () => {
      this.ui.clear();
      keyboard.off('keydown', this.onKey, this);
    });
  }
  private onKey(event: KeyboardEvent) {
    if (this.busy) return;
    const index = Number(event.key) - 1;
    if (index >= 0 && index < 4 && this.battle.outcome === 'active')
      this.chooseMove(species[this.battle.player.species].moves[index]!);
    if (event.key === 'Escape' && this.battle.outcome === 'active') this.utility('flee');
    if (event.key.toLowerCase() === 'c' && this.battle.outcome === 'active')
      this.utility('capture');
    if (event.key.toLowerCase() === 't' && this.battle.outcome === 'active') this.utility('tonic');
    if ((event.key === 'e' || event.key === 'E') && this.battle.outcome !== 'active') this.finish();
  }
  private status(c: Creature, side: 'ally' | 'enemy') {
    const def = species[c.species],
      max = stats(c).hp,
      ratio = c.hp / max;
    return `<section class="battle-status ${side}" data-health="${side === 'ally' ? 'player' : 'wild'}" aria-label="${side === 'ally' ? 'Your' : 'Wild'} ${def.name}"><div><strong>${def.name}</strong><span>Lv. ${c.level}</span></div><small class="type ${def.element.toLowerCase()}">${def.element}</small><div class="hp-row"><span>HP</span><div class="hp-track" role="progressbar" aria-label="${def.name} health" aria-valuenow="${c.hp}" aria-valuemax="${max}" aria-valuemin="0"><i style="width:${ratio * 100}%;background:${ratio < 0.25 ? '#ce785f' : ratio < 0.5 ? '#d2b26a' : '#88b77b'}"></i></div><b class="hp-value">${c.hp} / ${max}</b></div>${side === 'ally' ? `<div class="xp-track"><i style="width:${(c.xp / xpToNext(c.level)) * 100}%"></i></div>` : ''}</section>`;
  }
  protected extraActions(): string {
    const chance = Math.round(captureChance(this.battle.wild) * 100);
    return `${button('capture', `Prism ×${this.session.state.inventory.prisms} <small>${chance}%</small> <kbd>C</kbd>`, this.busy || !canCapture(this.session.state, this.battle.wild) ? 'disabled' : '')}${button('tonic', `Tonic ×${this.session.state.inventory.tonics} <kbd>T</kbd>`, this.busy || this.session.state.inventory.tonics <= 0 || this.battle.player.hp === stats(this.battle.player).hp ? 'disabled' : '')}`;
  }
  protected bindExtraActions() {
    this.ui.on('capture', () => {
      if (!this.busy) this.utility('capture');
    });
    this.ui.on('tonic', () => {
      if (!this.busy) this.utility('tonic');
    });
  }
  protected render() {
    const active = this.shownOutcome === 'active',
      disabled = this.busy ? 'disabled' : '';
    this.playerSprite.setTexture(this.displayPlayer.species);
    this.ui.render(
      `<div class="battle-heading"><span>WHISPERING TRAIL</span><b>Wild encounter</b><small>TURN ${String(this.turn).padStart(2, '0')}</small></div>${this.status(this.displayWild, 'enemy')}${this.status(this.displayPlayer, 'ally')}<section class="battle-console"><div class="battle-message" role="status" aria-live="polite"><small>${this.busy ? 'THE FOREST LISTENS' : active ? 'CHOOSE YOUR NEXT MOVE' : this.shownOutcome === 'victory' ? 'A LITTLE STRONGER' : this.shownOutcome === 'captured' ? 'A NEW COMPANION' : 'THE JOURNEY CONTINUES'}</small><p>${this.message}</p><div class="battle-tools">${active ? `${this.extraActions()}${button('run', 'Leave <kbd>Esc</kbd>', disabled)}` : ''}</div></div><div class="move-grid">${
        active
          ? species[this.battle.player.species].moves
              .map((id, i) => {
                const m = moves[id]!;
                return button(
                  `move-${id}`,
                  `<span>${i + 1} <b>${m.name}</b></span><small>${m.kind === 'restore' ? 'RECOVER 30% HP' : `${m.element ?? 'Neutral'} · ${m.power} power · ${m.accuracy * 100}%`}</small>`,
                  `class="move ${m.element?.toLowerCase() ?? 'neutral'} ${this.selectedMove === id ? 'selected' : ''}" title="${m.description}" ${disabled}`,
                );
              })
              .join('')
          : button(
              'finish',
              'Back to the trail <span>→</span>',
              'class="primary finish" ' + disabled,
            )
      }</div></section>`,
    );
    for (const id of species[this.battle.player.species].moves)
      this.ui.on(`move-${id}`, () => {
        if (!this.busy) this.chooseMove(id);
      });
    this.ui.on('run', () => {
      if (!this.busy) this.utility('flee');
    });
    this.ui.on('finish', () => this.finish());
    this.bindExtraActions();
  }
  private utility(action: 'flee' | 'capture' | 'tonic') {
    this.selectedMove = '';
    this.play(this.battle[action]());
  }
  private chooseMove(id: string) {
    this.selectedMove = id;
    this.play(this.battle.act(id));
  }
  protected play(lines: string[]) {
    if (!lines.length || this.busy) return;
    this.busy = true;
    const events = [...this.battle.events];
    let index = 0;
    const next = () => {
      const event = events[index++];
      if (!event) {
        this.busy = false;
        this.shownOutcome = this.battle.outcome;
        this.turn++;
        this.render();
        return;
      }
      const previousPlayer = this.displayPlayer,
        previousWild = this.displayWild;
      this.displayPlayer = event.player;
      this.displayWild = event.wild;
      this.shownOutcome = event.outcome;
      this.message = event.text;
      this.render();
      this.effects.health(this.ui.root, 'player', previousPlayer, this.displayPlayer);
      this.effects.health(this.ui.root, 'wild', previousWild, this.displayWild);
      this.effects.play(event);
      const delay = Math.min(1800, Math.max(950, event.text.length * 18));
      this.time.delayedCall(delay, () => {
        if (index < events.length) next();
        else {
          this.busy = false;
          this.shownOutcome = this.battle.outcome;
          this.turn++;
          this.render();
          const selector =
            this.shownOutcome === 'active'
              ? `[data-action="move-${this.selectedMove}"]`
              : '[data-action="finish"]';
          this.ui.root.querySelector<HTMLButtonElement>(selector)?.focus({ preventScroll: true });
        }
      });
    };
    next();
  }
  private finish() {
    if (this.busy) return;
    if (this.battle.outcome === 'defeat') {
      healParty(this.session.state);
      this.session.state.player = { map: 'willowmere', x: 16, y: 17, facing: 'up' };
    }
    this.registry.set('encounterGrace', true);
    this.scene.start('World');
  }
}
