import * as Phaser from 'phaser';
import { reducedMotion } from '../art/motion';
import type { BattleEvent, BattleSide } from '../systems/BattleSystem';
import type { Creature } from '../types';
import { stats } from '../systems/CreatureSystem';

export class BattleEffects {
  constructor(
    private scene: Phaser.Scene,
    private sprites: Record<BattleSide, Phaser.GameObjects.Image>,
  ) {}
  health(root: HTMLElement, side: BattleSide, before: Creature, after: Creature) {
    const panel = root.querySelector<HTMLElement>(`[data-health="${side}"]`);
    const bar = panel?.querySelector<HTMLElement>('.hp-track i'),
      value = panel?.querySelector<HTMLElement>('.hp-value');
    if (!bar || !value || before.uid !== after.uid || before.hp === after.hp || reducedMotion())
      return;
    const max = stats(after).hp;
    bar.style.width = `${(before.hp / max) * 100}%`;
    value.textContent = `${before.hp} / ${max}`;
    this.scene.tweens.addCounter({
      from: before.hp,
      to: after.hp,
      duration: 390,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        const hp = Math.round(tween.getValue() ?? after.hp);
        bar.style.width = `${(hp / max) * 100}%`;
        value.textContent = `${hp} / ${max}`;
      },
    });
  }
  play(event: BattleEvent) {
    const target = event.target ? this.sprites[event.target] : undefined;
    const actor = event.actor ? this.sprites[event.actor] : undefined;
    const colors = { Fire: 0xe9aa76, Water: 0x8ed6d3, Nature: 0xc1d686 };
    const color = event.element ? colors[event.element] : 0xf0d8a3;
    if (event.kind === 'damage' && target) {
      this.float(target, `−${event.amount}`, '#fff0cf');
      if (!reducedMotion()) {
        if (actor)
          this.scene.tweens.add({
            targets: actor,
            x: actor.x + (event.actor === 'player' ? 14 : -14),
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut',
          });
        target.setTint(color);
        this.scene.time.delayedCall(180, () => target.clearTint());
        this.scene.tweens.add({
          targets: target,
          alpha: 0.45,
          duration: 85,
          yoyo: true,
          repeat: 1,
        });
        this.burst(target, color);
        this.scene.cameras.main.shake(110, 0.0012);
      }
    } else if (event.kind === 'heal' && target) {
      this.float(target, `+${event.amount} HP`, '#d9efbd');
      if (!reducedMotion()) this.burst(target, 0xc5e5a4);
    } else if (event.kind === 'miss' && target) {
      this.float(target, 'Miss', '#e3e0c7');
    } else if (event.kind === 'faint' && target) {
      this.scene.tweens.killTweensOf(target);
      if (reducedMotion()) target.setAlpha(0.28);
      else
        this.scene.tweens.add({
          targets: target,
          alpha: 0.15,
          scaleY: target.scaleY * 0.8,
          duration: 450,
          ease: 'Sine.easeIn',
        });
    } else if (event.kind === 'switch' && target) {
      target.setTexture(event.player.species).setScale(6).setAlpha(1);
      if (!reducedMotion())
        this.scene.tweens.add({
          targets: target,
          scaleY: 5.94,
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      this.float(target, 'Let’s go!', '#e7d79e');
    } else if ((event.kind === 'capture' || event.kind === 'capture-fail') && target) {
      if (reducedMotion()) {
        if (event.kind === 'capture') target.setAlpha(0.35);
        this.float(target, event.kind === 'capture' ? 'Befriended!' : 'Slipped free', '#e7dcad');
        return;
      }
      const prism = this.scene.add.image(330, 330, 'crystal').setScale(0.22).setDepth(3000);
      this.scene.tweens.add({
        targets: prism,
        x: target.x,
        y: target.y - 65,
        angle: 160,
        duration: 260,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.burst(target, 0xc9c8ed);
          if (event.kind === 'capture')
            this.scene.tweens.add({ targets: target, alpha: 0.2, duration: 250 });
          this.float(target, event.kind === 'capture' ? 'Befriended!' : 'Slipped free', '#f1e4b8');
          this.scene.tweens.add({
            targets: prism,
            alpha: 0,
            duration: 250,
            onComplete: () => prism.destroy(),
          });
        },
      });
    } else if (event.kind === 'reward') {
      this.float(this.sprites.player, `+${event.amount} EXP`, '#e7cf8e');
    }
  }
  private float(sprite: Phaser.GameObjects.Image, label: string, color: string) {
    const text = this.scene.add
      .text(sprite.x, sprite.y - sprite.displayHeight * 0.68, label, {
        fontFamily: 'Georgia',
        fontSize: '23px',
        fontStyle: 'bold',
        color,
        stroke: '#2d4c3d',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(4000);
    if (reducedMotion()) {
      this.scene.time.delayedCall(600, () => text.destroy());
      return;
    }
    this.scene.tweens.add({
      targets: text,
      y: text.y - 22,
      alpha: 0,
      delay: 200,
      duration: 650,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy(),
    });
  }
  private burst(sprite: Phaser.GameObjects.Image, color: number) {
    const g = this.scene.add
      .graphics()
      .setPosition(sprite.x, sprite.y - 75)
      .setDepth(3000);
    g.lineStyle(2, color, 0.9);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      g.lineBetween(
        Math.cos(angle) * 20,
        Math.sin(angle) * 20,
        Math.cos(angle) * 34,
        Math.sin(angle) * 34,
      );
    }
    this.scene.tweens.add({
      targets: g,
      scale: 1.5,
      alpha: 0,
      duration: 330,
      onComplete: () => g.destroy(),
    });
  }
}
