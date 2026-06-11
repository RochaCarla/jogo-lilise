import Phaser from 'phaser';
import { LEVELS } from '../data/levels';
import { state } from '../core/state';
import { ensureCharTexture } from '../core/charTexture';
import { fullscreenButton, pillButton, FONT } from '../ui/widgets';

/** Tela inicial: escolha de fase + atalho para o editor de personagem. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const g = this.add.graphics();
    // fill sólido primeiro: fillGradientStyle só existe no WebGL
    g.fillStyle(0x9d6fc9, 1);
    g.fillRect(0, 0, 1280, 720);
    g.fillGradientStyle(0x7e57c2, 0x7e57c2, 0xf48fb1, 0xf48fb1, 1);
    g.fillRect(0, 0, 1280, 720);
    g.fillStyle(0xffffff, 0.12);
    for (const [x, y, r] of [
      [140, 120, 60],
      [1130, 90, 80],
      [220, 620, 90],
      [1180, 600, 70],
      [660, 60, 40],
    ]) {
      g.fillCircle(x, y, r);
    }

    this.add
      .text(640, 110, 'Casa Criativa', {
        fontFamily: FONT,
        fontSize: '72px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#5d4037',
        strokeThickness: 10,
      })
      .setOrigin(0.5);
    this.add
      .text(640, 178, 'Decore, brinque e crie! ✨', {
        fontFamily: FONT,
        fontSize: '28px',
        color: '#fff3e0',
      })
      .setOrigin(0.5);

    // moedas
    const coinsBg = this.add.graphics();
    coinsBg.fillStyle(0xfff3e0, 0.95);
    coinsBg.fillRoundedRect(1080, 20, 170, 50, 25);
    coinsBg.lineStyle(3, 0x5d4037, 1);
    coinsBg.strokeRoundedRect(1080, 20, 170, 50, 25);
    this.add
      .text(1165, 45, `🪙 ${state.coins}`, {
        fontFamily: FONT,
        fontSize: '24px',
        color: '#b86e00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // cards das 4 fases
    LEVELS.forEach((def, i) => {
      const x = 250 + i * 260;
      const y = 410;
      const card = this.add.container(x, y);

      const bg = this.add.graphics();
      bg.fillStyle(0xfff8ef, 0.97);
      bg.fillRoundedRect(-115, -130, 230, 260, 22);
      bg.lineStyle(4, 0x5d4037, 1);
      bg.strokeRoundedRect(-115, -130, 230, 260, 22);
      card.add(bg);

      card.add(this.add.image(0, -55, def.icon));
      card.add(
        this.add
          .text(0, 35, def.name, {
            fontFamily: FONT,
            fontSize: '22px',
            color: '#4e342e',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 200 },
          })
          .setOrigin(0.5)
      );
      card.add(
        this.add
          .text(0, 72, def.subtitle, {
            fontFamily: FONT,
            fontSize: '15px',
            color: '#8d6e63',
            align: 'center',
            wordWrap: { width: 200 },
          })
          .setOrigin(0.5)
      );
      const count = state.placedItems(def.id).length;
      card.add(
        this.add
          .text(0, 105, count > 0 ? `🪑 ${count} ${count === 1 ? 'item' : 'itens'}` : '✨ novo!', {
            fontFamily: FONT,
            fontSize: '15px',
            color: '#ab47bc',
          })
          .setOrigin(0.5)
      );

      card.setSize(230, 260);
      card.setInteractive({ useHandCursor: true });
      card.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (pointer.getDistance() < 14) this.scene.start('Play', { levelId: def.id });
      });
      card.on('pointerover', () => this.tweens.add({ targets: card, scale: 1.04, duration: 120 }));
      card.on('pointerout', () => this.tweens.add({ targets: card, scale: 1, duration: 120 }));
    });

    // personagem + botão de customização
    const charKey = ensureCharTexture(this, state.character);
    const preview = this.add.image(110, 615, charKey).setOrigin(0.5, 1).setScale(1.5);
    this.tweens.add({ targets: preview, y: 609, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.InOut' });

    pillButton(this, 330, 645, '🙂 Meu personagem', () => this.scene.start('Character', { back: 'Menu' }), {
      w: 250,
      h: 56,
    });

    fullscreenButton(this, 42, 45);
  }
}
