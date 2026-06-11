import Phaser from 'phaser';
import { CATALOG, itemById, itemTexture } from '../data/catalog';
import { bus, state } from '../core/state';
import { circleButton, floatText, FONT } from './widgets';

const COLS = 4;
const ROWS = 2;
const PER_PAGE = COLS * ROWS;
const CELL_W = 250;
const CELL_H = 212;
const GRID_X = 640 - ((COLS - 1) / 2) * CELL_W;
const GRID_Y = 305;

/** Lojinha de móveis (overlay). Compra com moedas → vai para o inventário. */
export class ShopPanel {
  readonly container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private grid: Phaser.GameObjects.Container;
  private page = 0;
  private pageText!: Phaser.GameObjects.Text;
  private items = CATALOG;

  constructor(scene: Phaser.Scene, levelTag: string) {
    this.scene = scene;
    // itens da fase atual primeiro
    this.items = [...CATALOG].sort((a, b) => {
      const at = a.tags.includes(levelTag) ? 0 : 1;
      const bt = b.tags.includes(levelTag) ? 0 : 1;
      return at - bt || a.price - b.price;
    });

    this.container = scene.add.container(0, 0).setDepth(150).setVisible(false);

    const dim = scene.add.rectangle(640, 360, 1280, 720, 0x2c1a3d, 0.55).setInteractive();
    dim.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.getDistance() < 12) this.close();
    });
    this.container.add(dim);

    const panel = scene.add.graphics();
    panel.fillStyle(0xfff8ef, 1);
    panel.fillRoundedRect(90, 80, 1100, 560, 26);
    panel.lineStyle(4, 0x5d4037, 1);
    panel.strokeRoundedRect(90, 80, 1100, 560, 26);
    panel.fillStyle(0xff7eb6, 1);
    panel.fillRoundedRect(90, 80, 1100, 64, { tl: 26, tr: 26, bl: 0, br: 0 });
    this.container.add(panel);
    // bloqueia cliques dentro do painel de fechar o overlay
    this.container.add(scene.add.zone(640, 360, 1100, 560).setInteractive());

    this.container.add(
      scene.add
        .text(640, 112, '🛍️ Lojinha de Móveis', {
          fontFamily: FONT,
          fontSize: '30px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    );

    this.container.add(circleButton(scene, 1158, 112, '✕', () => this.close(), 24));
    this.container.add(circleButton(scene, 130, 390, '◀', () => this.turnPage(-1)));
    this.container.add(circleButton(scene, 1150, 390, '▶', () => this.turnPage(1)));
    this.pageText = scene.add
      .text(640, 612, '', { fontFamily: FONT, fontSize: '18px', color: '#8d6e63' })
      .setOrigin(0.5);
    this.container.add(this.pageText);

    this.grid = scene.add.container(0, 0);
    this.container.add(this.grid);

    const refresh = () => {
      if (this.container.visible) this.rebuild();
    };
    bus.on('inventory', refresh);
    bus.on('coins', refresh);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off('inventory', refresh);
      bus.off('coins', refresh);
    });
  }

  open(): void {
    this.container.setVisible(true);
    this.rebuild();
  }

  close(): void {
    this.container.setVisible(false);
  }

  get isOpen(): boolean {
    return this.container.visible;
  }

  private turnPage(dir: number): void {
    const pages = Math.max(1, Math.ceil(this.items.length / PER_PAGE));
    this.page = Phaser.Math.Wrap(this.page + dir, 0, pages);
    this.rebuild();
  }

  private rebuild(): void {
    const scene = this.scene;
    this.grid.removeAll(true);

    const pages = Math.max(1, Math.ceil(this.items.length / PER_PAGE));
    this.pageText.setText(`página ${this.page + 1} de ${pages}`);

    const pageItems = this.items.slice(this.page * PER_PAGE, this.page * PER_PAGE + PER_PAGE);

    pageItems.forEach((item, i) => {
      const cx = GRID_X + (i % COLS) * CELL_W;
      const cy = GRID_Y + Math.floor(i / COLS) * CELL_H;

      const cell = scene.add.graphics();
      cell.fillStyle(0xffe9d2, 1);
      cell.fillRoundedRect(cx - 112, cy - 92, 224, 188, 16);
      cell.lineStyle(2.5, 0xd7a86e, 1);
      cell.strokeRoundedRect(cx - 112, cy - 92, 224, 188, 16);
      this.grid.add(cell);

      const scale = Math.min(110 / item.w, 78 / item.h);
      this.grid.add(scene.add.image(cx, cy - 40, itemTexture(item.id)).setScale(scale));

      this.grid.add(
        scene.add
          .text(cx, cy + 22, item.name, { fontFamily: FONT, fontSize: '15px', color: '#5d4037' })
          .setOrigin(0.5)
      );

      const owned = state.invCount(item.id);
      if (owned > 0) {
        this.grid.add(
          scene.add
            .text(cx + 96, cy - 78, `x${owned}`, {
              fontFamily: FONT,
              fontSize: '15px',
              color: '#2e7d32',
              fontStyle: 'bold',
            })
            .setOrigin(1, 0.5)
        );
      }

      const affordable = state.coins >= item.price;
      const btn = scene.add.graphics();
      btn.fillStyle(affordable ? 0x66bb6a : 0xbdbdbd, 1);
      btn.fillRoundedRect(cx - 70, cy + 40, 140, 44, 22);
      btn.lineStyle(2.5, 0x5d4037, affordable ? 1 : 0.4);
      btn.strokeRoundedRect(cx - 70, cy + 40, 140, 44, 22);
      this.grid.add(btn);
      this.grid.add(
        scene.add
          .text(cx, cy + 62, `🪙 ${item.price}`, {
            fontFamily: FONT,
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
      );

      const hit = scene.add.zone(cx, cy + 62, 140, 44).setInteractive({ useHandCursor: affordable });
      hit.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (pointer.getDistance() >= 12) return;
        if (state.buy(item.id)) {
          floatText(scene, cx, cy + 30, `+1 ${itemById(item.id).name}!`, '#2e7d32');
        } else {
          floatText(scene, cx, cy + 30, 'Moedas insuficientes 😅', '#c62828');
        }
      });
      this.grid.add(hit);
    });
  }
}
