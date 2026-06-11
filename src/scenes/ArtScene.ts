import Phaser from 'phaser';
import { state } from '../core/state';
import { circleButton, floatText, pillButton, FONT } from '../ui/widgets';

const CAN_X = 320;
const CAN_Y = 110;
const CAN_W = 640;
const CAN_H = 420;

const COLORS = [
  0xe53935, 0xfb8c00, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa, 0xf06292, 0x8d6e63, 0x37474f, 0xffffff,
];
const SIZES = [10, 22, 40];

/** Ateliê de pintura do estúdio: desenhe com o dedo e salve no cavalete. */
export class ArtScene extends Phaser.Scene {
  private levelId = 'estudio';
  private rt!: Phaser.GameObjects.RenderTexture;
  private brush!: Phaser.GameObjects.Graphics;
  private color = COLORS[0];
  private size = SIZES[1];
  private painting = false;
  private last: { x: number; y: number } | null = null;
  private colorRing!: Phaser.GameObjects.Graphics;
  private sizeRing!: Phaser.GameObjects.Graphics;

  constructor() {
    super('Art');
  }

  init(data: { levelId?: string }): void {
    this.levelId = data.levelId ?? 'estudio';
  }

  create(): void {
    const g = this.add.graphics();
    g.fillStyle(0xfdf6e3, 1);
    g.fillRect(0, 0, 1280, 720);
    g.fillStyle(0xffe0b2, 1);
    g.fillRect(0, 0, 1280, 72);

    this.add
      .text(640, 36, '🎨 Ateliê — pinte com o dedo!', {
        fontFamily: FONT,
        fontSize: '30px',
        color: '#5d4037',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // moldura + tela de pintura
    const frame = this.add.graphics();
    frame.fillStyle(0xd7a86e, 1);
    frame.fillRoundedRect(CAN_X - 14, CAN_Y - 14, CAN_W + 28, CAN_H + 28, 10);
    frame.lineStyle(4, 0x5d4037, 1);
    frame.strokeRoundedRect(CAN_X - 14, CAN_Y - 14, CAN_W + 28, CAN_H + 28, 10);

    this.rt = this.add.renderTexture(CAN_X, CAN_Y, CAN_W, CAN_H).setOrigin(0, 0);
    this.rt.fill(0xffffff);

    // arte já existente entra como ponto de partida
    const existing = state.art(this.levelId);
    if (existing) {
      const key = `art-edit-${Math.random().toString(36).slice(2, 8)}`;
      const onAdd = (addedKey: string) => {
        if (addedKey !== key) return;
        this.textures.off(Phaser.Textures.Events.ADD, onAdd);
        this.rt.drawFrame(key, undefined, 0, 0);
      };
      this.textures.on(Phaser.Textures.Events.ADD, onAdd);
      this.textures.addBase64(key, existing);
    }

    // pincel como Graphics: tint de imagem não funciona no renderer Canvas
    this.brush = this.make.graphics({ x: 0, y: 0 }, false);
    this.updateBrush();

    // paleta de cores
    this.colorRing = this.add.graphics().setDepth(5);
    COLORS.forEach((c, i) => {
      const x = 180 + i * 62;
      const y = 600;
      const swatch = this.add.graphics();
      swatch.fillStyle(c, 1);
      swatch.fillCircle(x, y, 22);
      swatch.lineStyle(3, 0x5d4037, 1);
      swatch.strokeCircle(x, y, 22);
      const hit = this.add.zone(x, y, 52, 52).setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => {
        this.color = c;
        this.updateBrush();
        this.refreshRings();
      });
    });

    // tamanhos do pincel
    this.sizeRing = this.add.graphics().setDepth(5);
    SIZES.forEach((s, i) => {
      const x = 880 + i * 64;
      const y = 600;
      const swatch = this.add.graphics();
      swatch.fillStyle(0x8d6e63, 1);
      swatch.fillCircle(x, y, s / 2.4 + 5);
      const hit = this.add.zone(x, y, 56, 56).setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => {
        this.size = s;
        this.updateBrush();
        this.refreshRings();
      });
    });
    this.refreshRings();

    // botões
    circleButton(this, 1090, 600, '🗑️', () => {
      this.rt.clear();
      this.rt.fill(0xffffff);
      floatText(this, 1090, 560, 'Tela limpa!', '#5d4037');
    });
    circleButton(this, 1226, 36, '✕', () => this.closeScene());
    pillButton(this, 1150, 672, '✔ Salvar', () => this.save(), { w: 200, h: 52, bg: 0xa5d6a7 });
    this.add
      .text(56, 672, 'O desenho fica no cavalete do estúdio 🖼️', {
        fontFamily: FONT,
        fontSize: '17px',
        color: '#8d6e63',
      })
      .setOrigin(0, 0.5);

    // pintura
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (this.inCanvas(p)) {
        this.painting = true;
        this.last = null;
        this.stamp(p.worldX, p.worldY);
      }
    });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
      if (this.painting && p.isDown) this.stampLine(p.worldX, p.worldY);
    });
    this.input.on(Phaser.Input.Events.POINTER_UP, () => {
      this.painting = false;
      this.last = null;
    });
  }

  private refreshRings(): void {
    this.colorRing.clear();
    const ci = COLORS.indexOf(this.color);
    this.colorRing.lineStyle(4, 0xff7043, 1);
    this.colorRing.strokeCircle(180 + ci * 62, 600, 28);

    this.sizeRing.clear();
    const si = SIZES.indexOf(this.size);
    this.sizeRing.lineStyle(4, 0xff7043, 1);
    this.sizeRing.strokeCircle(880 + si * 64, 600, 30);
  }

  private inCanvas(p: Phaser.Input.Pointer): boolean {
    return (
      p.worldX >= CAN_X && p.worldX <= CAN_X + CAN_W && p.worldY >= CAN_Y && p.worldY <= CAN_Y + CAN_H
    );
  }

  private updateBrush(): void {
    this.brush.clear();
    this.brush.fillStyle(this.color, 1);
    this.brush.fillCircle(0, 0, this.size / 2);
  }

  private stamp(wx: number, wy: number): void {
    const lx = Phaser.Math.Clamp(wx - CAN_X, 0, CAN_W);
    const ly = Phaser.Math.Clamp(wy - CAN_Y, 0, CAN_H);
    this.rt.draw(this.brush, lx, ly);
    this.last = { x: lx, y: ly };
  }

  private stampLine(wx: number, wy: number): void {
    const lx = Phaser.Math.Clamp(wx - CAN_X, 0, CAN_W);
    const ly = Phaser.Math.Clamp(wy - CAN_Y, 0, CAN_H);
    if (!this.last) {
      this.stamp(wx, wy);
      return;
    }
    const from = this.last;
    const dist = Phaser.Math.Distance.Between(from.x, from.y, lx, ly);
    const steps = Math.max(1, Math.ceil(dist / (this.size * 0.35)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.rt.draw(this.brush, Phaser.Math.Linear(from.x, lx, t), Phaser.Math.Linear(from.y, ly, t));
    }
    this.last = { x: lx, y: ly };
  }

  private save(): void {
    this.rt.snapshot((img) => {
      const src = (img as HTMLImageElement).src;
      if (src) {
        state.setArt(this.levelId, src);
        this.game.events.emit('art-saved', this.levelId);
      }
      this.closeScene();
    });
  }

  private closeScene(): void {
    this.scene.stop();
    this.scene.resume('Play');
  }
}
