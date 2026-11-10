import * as Phaser from 'phaser';
import './style.css';

class FoundationScene extends Phaser.Scene {
  create() {
    this.cameras.main.setBackgroundColor('#173d3c');
    this.add.text(480, 270, 'ECHOWILD', { fontFamily: 'Georgia', fontSize: '64px', color: '#f6e9c5' }).setOrigin(0.5);
    this.add.text(480, 330, 'Auralis awaits', { fontSize: '18px', color: '#a4c4a6' }).setOrigin(0.5);
  }
}

new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: 960, height: 600,
  pixelArt: true, roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [FoundationScene],
});
