import Phaser from 'phaser';
import { itemById, itemTexture } from '../data/catalog';
import { bus, state } from '../core/state';
import { circleButton, FONT } from './widgets';

export const PANEL_TOP = 600;
const SLOTS = 9;
const SLOT_W = 112;
const FIRST_X = 152;
const CENTER_Y = 660;

/**
 * Gaveta de inventário no rodapé. Arraste um item para o cenário para
 * posicioná-lo (o PlayScene cuida do "fantasma" durante o arrasto).
 */
export class ItemPanel {
  readonly container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private slotsLayer: Phaser.GameObjects.Container;
  private page = 0;
  private pageText: Phaser.GameObjects.Text;
  private levelTag: string;
  private onDragStart: (itemId: string, pointer: Phaser.Input.Pointer) => void;

  constructor(
    scene: Phaser.Scene,
    levelTag: string,
    onDragStart: (itemId: string, pointer: Phaser.Input.Pointer) => void
  ) {
    this.scene = scene;
    this.levelTag = levelTag;
    this.onDragStart = onDragStart;

    this.container = scene.add.container(0, 0).setDepth(90);

    const bg = scene.add.graphics();
    bg.fillStyle(0x4e342e, 0.18);
    bg.fillRect(0, PANEL_TOP - 4, 1280, 124);
    bg.fillStyle(0xfff8ef, 0.97);
    bg.fillRoundedRect(8, PANEL_TOP, 1264, 114, 18);
    bg.lineStyle(3, 0x5d4037, 1);
    bg.strokeRoundedRect(8, PANEL_TOP, 1264, 114, 18);
    this.container.add(bg);

    // bloqueia toques "vazando" para o cenário
    const blocker = scene.add
      .zone(640, PANEL_TOP + 60, 1280, 124)
      .setInteractive();
    this.container.add(blocker);

    this.container.add(
      circleButton(scene, 48, CENTER_Y, '◀', () => this.turnPage(-1), 24)
    );
    this.container.add(
      circleButton(scene, 1232, CENTER_Y, '▶', () => this.turnPage(1), 24)
    );
    this.pageText = scene.add
      .text(1185, CENTER_Y + 34, '', { fontFamily: FONT, fontSize: '15px', color: '#8d6e63' })
      .setOrigin(0.5);
    this.container.add(this.pageText);

    this.slotsLayer = scene.add.container(0, 0);
    this.container.add(this.slotsLayer);

    const refresh = () => this.rebuild();
    bus.on('inventory', refresh);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bus.off('inventory', refresh));

    this.rebuild();
  }

  setVisible(v: boolean): void {
    this.container.setVisible(v);
  }

  private entries(): Array<{ itemId: string; count: number }> {
    // itens da fase atual primeiro
    return state.inventoryEntries().sort((a, b) => {
      const at = itemById(a.itemId).tags.includes(this.levelTag) ? 0 : 1;
      const bt = itemById(b.itemId).tags.includes(this.levelTag) ? 0 : 1;
      return at - bt || a.itemId.localeCompare(b.itemId);
    });
  }

  private turnPage(dir: number): void {
    const pages = Math.max(1, Math.ceil(this.entries().length / SLOTS));
    this.page = Phaser.Math.Wrap(this.page + dir, 0, pages);
    this.rebuild();
  }

  private rebuild(): void {
    const scene = this.scene;
    this.slotsLayer.removeAll(true);

    const entries = this.entries();
    const pages = Math.max(1, Math.ceil(entries.length / SLOTS));
    if (this.page >= pages) this.page = pages - 1;
    this.pageText.setText(pages > 1 ? `${this.page + 1}/${pages}` : '');

    const pageEntries = entries.slice(this.page * SLOTS, this.page * SLOTS + SLOTS);

    if (pageEntries.length === 0) {
      const hint = scene.add
        .text(640, CENTER_Y, 'Inventário vazio — visite a lojinha! 🛍️', {
          fontFamily: FONT,
          fontSize: '22px',
          color: '#8d6e63',
        })
        .setOrigin(0.5);
      this.slotsLayer.add(hint);
      return;
    }

    pageEntries.forEach(({ itemId, count }, i) => {
      const x = FIRST_X + i * SLOT_W;
      const item = itemById(itemId);

      const slotBg = scene.add.graphics();
      slotBg.fillStyle(0xffe9d2, 1);
      slotBg.fillRoundedRect(x - 48, CENTER_Y - 48, 96, 96, 14);
      slotBg.lineStyle(2.5, 0xd7a86e, 1);
      slotBg.strokeRoundedRect(x - 48, CENTER_Y - 48, 96, 96, 14);
      this.slotsLayer.add(slotBg);

      const scale = Math.min(72 / item.w, 64 / item.h);
      const icon = scene.add
        .image(x, CENTER_Y - 4, itemTexture(itemId))
        .setScale(scale)
        .setInteractive({ useHandCursor: true });
      icon.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onDragStart(itemId, pointer));
      this.slotsLayer.add(icon);

      const badge = scene.add.graphics();
      badge.fillStyle(0xff7043, 1);
      badge.fillCircle(x + 34, CENTER_Y - 34, 13);
      badge.lineStyle(2, 0xffffff, 1);
      badge.strokeCircle(x + 34, CENTER_Y - 34, 13);
      this.slotsLayer.add(badge);
      this.slotsLayer.add(
        scene.add
          .text(x + 34, CENTER_Y - 34, String(count), {
            fontFamily: FONT,
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold',
          })
          .setOrigin(0.5)
      );

      this.slotsLayer.add(
        scene.add
          .text(x, CENTER_Y + 38, item.name, { fontFamily: FONT, fontSize: '12px', color: '#6d4c41' })
          .setOrigin(0.5)
      );
    });
  }
}
