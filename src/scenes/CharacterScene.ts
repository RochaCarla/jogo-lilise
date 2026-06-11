import Phaser from 'phaser';
import { state } from '../core/state';
import {
  ACCESSORIES,
  ensureCharTexture,
  HAIR_COLORS,
  HAIR_STYLES,
  PANTS,
  SHIRTS,
  SKINS,
} from '../core/charTexture';
import { circleButton, floatText, pillButton, FONT } from '../ui/widgets';
import type { CharacterConfig } from '../types';

interface BackData {
  back: 'Menu' | 'Play';
  levelId?: string;
}

type RowKind = 'swatch' | 'name';

interface Row {
  label: string;
  kind: RowKind;
  size: number;
  colors?: number[];
  names?: string[];
  get: () => number;
  set: (v: number) => void;
}

/** Editor do personagem: pele, cabelo, roupa e acessórios. */
export class CharacterScene extends Phaser.Scene {
  private backData: BackData = { back: 'Menu' };
  private cfg!: CharacterConfig;
  private preview!: Phaser.GameObjects.Image;
  private rows: Row[] = [];
  private rowDisplays: Array<{ swatch?: Phaser.GameObjects.Graphics; name?: Phaser.GameObjects.Text }> = [];

  constructor() {
    super('Character');
  }

  init(data: Partial<BackData>): void {
    this.backData = { back: data.back ?? 'Menu', levelId: data.levelId };
  }

  create(): void {
    this.cfg = state.character;

    const g = this.add.graphics();
    // fill sólido primeiro: fillGradientStyle só existe no WebGL
    g.fillStyle(0x80cbc4, 1);
    g.fillRect(0, 0, 1280, 720);
    g.fillGradientStyle(0x4db6ac, 0x4db6ac, 0xb2dfdb, 0xb2dfdb, 1);
    g.fillRect(0, 0, 1280, 720);

    this.add
      .text(640, 64, '🙂 Meu Personagem', {
        fontFamily: FONT,
        fontSize: '44px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#00695c',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    // palco do preview
    const stage = this.add.graphics();
    stage.fillStyle(0xfff8ef, 0.95);
    stage.fillRoundedRect(120, 130, 420, 510, 24);
    stage.lineStyle(4, 0x5d4037, 1);
    stage.strokeRoundedRect(120, 130, 420, 510, 24);
    stage.fillStyle(0xd7ccc8, 1);
    stage.fillEllipse(330, 580, 220, 36);

    this.preview = this.add.image(330, 580, ensureCharTexture(this, this.cfg)).setOrigin(0.5, 1).setScale(3.4);
    this.tweens.add({ targets: this.preview, y: 572, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.InOut' });

    this.rows = [
      { label: 'Pele', kind: 'swatch', size: SKINS.length, colors: SKINS, get: () => this.cfg.skin, set: (v) => (this.cfg.skin = v) },
      { label: 'Cabelo', kind: 'name', size: HAIR_STYLES.length, names: HAIR_STYLES, get: () => this.cfg.hairStyle, set: (v) => (this.cfg.hairStyle = v) },
      { label: 'Cor do cabelo', kind: 'swatch', size: HAIR_COLORS.length, colors: HAIR_COLORS, get: () => this.cfg.hairColor, set: (v) => (this.cfg.hairColor = v) },
      { label: 'Camiseta', kind: 'swatch', size: SHIRTS.length, colors: SHIRTS, get: () => this.cfg.shirt, set: (v) => (this.cfg.shirt = v) },
      { label: 'Calça', kind: 'swatch', size: PANTS.length, colors: PANTS, get: () => this.cfg.pants, set: (v) => (this.cfg.pants = v) },
      { label: 'Acessório', kind: 'name', size: ACCESSORIES.length, names: ACCESSORIES, get: () => this.cfg.accessory, set: (v) => (this.cfg.accessory = v) },
    ];

    const panelX = 620;
    const startY = 165;
    const stepY = 76;

    const panel = this.add.graphics();
    panel.fillStyle(0xfff8ef, 0.95);
    panel.fillRoundedRect(panelX - 20, 130, 580, 510, 24);
    panel.lineStyle(4, 0x5d4037, 1);
    panel.strokeRoundedRect(panelX - 20, 130, 580, 510, 24);

    this.rows.forEach((row, i) => {
      const y = startY + i * stepY;
      this.add
        .text(panelX + 10, y, row.label, {
          fontFamily: FONT,
          fontSize: '23px',
          color: '#4e342e',
          fontStyle: 'bold',
        })
        .setOrigin(0, 0.5);

      circleButton(this, panelX + 330, y, '◀', () => this.cycle(i, -1), 22);
      circleButton(this, panelX + 520, y, '▶', () => this.cycle(i, 1), 22);

      const display: { swatch?: Phaser.GameObjects.Graphics; name?: Phaser.GameObjects.Text } = {};
      if (row.kind === 'swatch') {
        display.swatch = this.add.graphics();
      } else {
        display.name = this.add
          .text(panelX + 425, y, '', { fontFamily: FONT, fontSize: '20px', color: '#6d4c41' })
          .setOrigin(0.5);
      }
      this.rowDisplays.push(display);
      this.refreshRow(i, panelX + 425, y);
    });

    pillButton(this, 910, 600, '✔ Pronto!', () => this.saveAndBack(), { w: 220, h: 58, bg: 0xa5d6a7 });
    circleButton(this, 42, 42, '←', () => this.saveAndBack());
  }

  private cycle(rowIdx: number, dir: number): void {
    const row = this.rows[rowIdx];
    row.set(Phaser.Math.Wrap(row.get() + dir, 0, row.size));
    this.preview.setTexture(ensureCharTexture(this, this.cfg));
    const panelX = 620;
    this.refreshRow(rowIdx, panelX + 425, 165 + rowIdx * 76);
  }

  private refreshRow(rowIdx: number, x: number, y: number): void {
    const row = this.rows[rowIdx];
    const display = this.rowDisplays[rowIdx];
    if (row.kind === 'swatch' && display.swatch && row.colors) {
      display.swatch.clear();
      display.swatch.fillStyle(row.colors[row.get()], 1);
      display.swatch.fillCircle(x, y, 18);
      display.swatch.lineStyle(3, 0x5d4037, 1);
      display.swatch.strokeCircle(x, y, 18);
    } else if (display.name && row.names) {
      display.name.setText(row.names[row.get()]);
    }
  }

  private saveAndBack(): void {
    state.setCharacter(this.cfg);
    floatText(this, 330, 300, 'Salvo! ✓', '#2e7d32');
    this.time.delayedCall(350, () => {
      if (this.backData.back === 'Play' && this.backData.levelId) {
        this.scene.start('Play', { levelId: this.backData.levelId });
      } else {
        this.scene.start('Menu');
      }
    });
  }
}
