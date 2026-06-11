import Phaser from 'phaser';
import { itemById, itemTexture } from '../data/catalog';
import { drawLevelBackground, levelById } from '../data/levels';
import { state } from '../core/state';
import { EASEL } from '../core/textures';
import { ensureCharTexture } from '../core/charTexture';
import { Character, type Waypoint } from '../objects/Character';
import { Hud, type GameMode } from '../ui/Hud';
import { ItemPanel, PANEL_TOP } from '../ui/ItemPanel';
import { ShopPanel } from '../ui/ShopPanel';
import { circleButton, emojiBurst, floatText, FONT } from '../ui/widgets';
import type { LevelDef, PlacedItemData } from '../types';

type ItemSprite = Phaser.GameObjects.Image;

/**
 * Cena de uma fase: decoração (drag-and-drop), modo brincar (andar e
 * interagir com os móveis), HUD, lojinha e — no estúdio — pintura.
 */
export class PlayScene extends Phaser.Scene {
  private def!: LevelDef;
  private mode: GameMode = 'decor';
  private hud!: Hud;
  private panel!: ItemPanel;
  private shop!: ShopPanel;
  private char!: Character;

  private ghost: ItemSprite | null = null;
  private ghostItemId = '';

  private selected: ItemSprite | null = null;
  private selUI!: Phaser.GameObjects.Container;

  private easelSprite: ItemSprite | null = null;
  private easelArt: ItemSprite | null = null;
  private artRev = 0;

  constructor() {
    super('Play');
  }

  init(data: { levelId: string }): void {
    this.def = levelById(data.levelId);
  }

  create(): void {
    this.mode = 'decor';
    drawLevelBackground(this, this.def.id);

    const hadItems = state.placedItems(this.def.id).length > 0;
    for (const p of state.placedItems(this.def.id)) this.spawnPlaced(p);

    if (this.def.hasArt) this.createEasel();

    // personagem
    const f0 = this.def.floors[0];
    this.char = new Character(
      this,
      (f0.xMin + f0.xMax) / 2,
      f0.y,
      ensureCharTexture(this, state.character)
    );
    this.char.setDepth(50);

    this.buildSelectionUI();

    this.hud = new Hud(this, this.def.name, {
      onBack: () => this.scene.start('Menu'),
      onShop: () => {
        this.deselect();
        this.shop.open();
      },
      onCharacter: () => this.scene.start('Character', { back: 'Play', levelId: this.def.id }),
      onModeChange: (mode) => this.setMode(mode),
    });
    this.panel = new ItemPanel(this, this.def.id, (itemId, pointer) => this.startGhost(itemId, pointer));
    this.shop = new ShopPanel(this, this.def.id);

    this.input.dragDistanceThreshold = 8;
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    this.input.on(Phaser.Input.Events.DRAG, this.onDrag, this);
    this.input.on(Phaser.Input.Events.DRAG_END, this.onDragEnd, this);

    if (this.def.hasArt) this.loadArt();
    const onArtSaved = (levelId: string) => {
      if (levelId === this.def.id) this.loadArt();
    };
    this.game.events.on('art-saved', onArtSaved);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('art-saved', onArtSaved);
    });

    if (!hadItems) {
      const hint = this.add
        .text(640, 200, 'Arraste os móveis do painel para decorar! ✨', {
          fontFamily: FONT,
          fontSize: '26px',
          color: '#5d4037',
          backgroundColor: '#ffffffcc',
          padding: { x: 18, y: 10 },
        })
        .setOrigin(0.5)
        .setDepth(80);
      this.tweens.add({ targets: hint, alpha: 0, delay: 4200, duration: 700, onComplete: () => hint.destroy() });
    }
  }

  update(_time: number, delta: number): void {
    this.char.tick(delta);
  }

  // -------------------------------------------------------------- modo

  private setMode(mode: GameMode): void {
    this.mode = mode;
    this.deselect();
    this.panel.setVisible(mode === 'decor');
    if (mode === 'play') {
      floatText(this, 640, 540, 'Toque no cenário para passear! 🧍', '#5d4037');
    }
  }

  // -------------------------------------------------------------- itens

  private spawnPlaced(p: PlacedItemData): ItemSprite {
    const s = this.add
      .image(p.x, p.y, itemTexture(p.itemId))
      .setFlipX(p.flip)
      .setDepth(10);
    s.setData('uid', p.uid);
    s.setData('itemId', p.itemId);
    s.setInteractive({ draggable: true, useHandCursor: true });
    s.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (pointer.getDistance() < 12 && !this.ghost && !this.shop.isOpen) this.tapItem(s);
    });
    return s;
  }

  private onDrag(_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject, dragX: number, dragY: number): void {
    if (this.mode !== 'decor' || this.shop.isOpen) return;
    const s = obj as ItemSprite;
    if (!s.getData || !s.getData('uid')) return;
    const b = this.def.bounds;
    s.x = Phaser.Math.Clamp(dragX, b.minX, b.maxX);
    s.y = Phaser.Math.Clamp(dragY, b.minY, b.maxY);
    if (this.selected === s) this.positionSelUI();
  }

  private onDragEnd(_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject): void {
    const s = obj as ItemSprite;
    const uid = s.getData ? (s.getData('uid') as string | undefined) : undefined;
    if (uid) state.move(this.def.id, uid, s.x, s.y);
  }

  private tapItem(s: ItemSprite): void {
    if (this.mode === 'decor') this.select(s);
    else this.interact(s);
  }

  // -------------------------------------------------------------- seleção

  private buildSelectionUI(): void {
    this.selUI = this.add.container(0, 0).setDepth(70).setVisible(false);
    this.selUI.add(
      circleButton(this, -34, 0, '🔄', () => {
        if (!this.selected) return;
        this.selected.setFlipX(!this.selected.flipX);
        state.setFlip(this.def.id, this.selected.getData('uid') as string, this.selected.flipX);
      }, 24)
    );
    this.selUI.add(
      circleButton(this, 34, 0, '🗑️', () => {
        if (!this.selected) return;
        const uid = this.selected.getData('uid') as string;
        if (this.char.sittingOn === uid) {
          this.char.standUp();
          const f = this.def.floors[this.floorIndexFor(this.char.y)];
          this.char.setPosition(this.char.x, f.y);
        }
        state.remove(this.def.id, uid);
        emojiBurst(this, this.selected.x, this.selected.y, '💨', 2);
        this.selected.destroy();
        this.deselect();
      }, 24)
    );
  }

  private select(s: ItemSprite): void {
    this.selected = s;
    this.selUI.setVisible(true);
    this.positionSelUI();
    this.tweens.add({ targets: s, scale: { from: 1.08, to: 1 }, duration: 160 });
  }

  private positionSelUI(): void {
    if (!this.selected) return;
    const top = this.selected.y - this.selected.displayHeight / 2;
    this.selUI.setPosition(this.selected.x, Math.max(90, top - 36));
  }

  private deselect(): void {
    this.selected = null;
    this.selUI.setVisible(false);
  }

  // -------------------------------------------------------------- ghost (arrastar do painel)

  private startGhost(itemId: string, pointer: Phaser.Input.Pointer): void {
    if (this.ghost || this.mode !== 'decor' || this.shop.isOpen) return;
    if (state.invCount(itemId) <= 0) return;
    this.ghostItemId = itemId;
    this.ghost = this.add
      .image(pointer.worldX, pointer.worldY, itemTexture(itemId))
      .setAlpha(0.75)
      .setDepth(60);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.ghost) this.ghost.setPosition(pointer.worldX, pointer.worldY);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]): void {
    if (this.ghost) {
      this.finishGhost(pointer);
      return;
    }
    if (this.shop.isOpen) return;
    if (pointer.getDistance() >= 12) return;
    if (over && over.length > 0) return; // alguém já tratou o toque

    if (this.mode === 'decor') {
      this.deselect();
      return;
    }

    // modo brincar: andar até onde tocou
    if (pointer.worldY > PANEL_TOP + 40) return;
    const floorIdx = this.floorIndexFor(pointer.worldY);
    this.walkTo(pointer.worldX, floorIdx);
  }

  private finishGhost(pointer: Phaser.Input.Pointer): void {
    const ghost = this.ghost!;
    this.ghost = null;
    const b = this.def.bounds;
    const inWorld =
      pointer.worldY < PANEL_TOP - 6 &&
      pointer.worldX >= b.minX - 60 &&
      pointer.worldX <= b.maxX + 60 &&
      pointer.worldY >= b.minY - 60;

    if (inWorld) {
      const x = Phaser.Math.Clamp(pointer.worldX, b.minX, b.maxX);
      const y = Phaser.Math.Clamp(pointer.worldY, b.minY, b.maxY);
      const res = state.place(this.def.id, this.ghostItemId, x, y);
      if (res) {
        const s = this.spawnPlaced(res.placed);
        this.tweens.add({ targets: s, scale: { from: 0.6, to: 1 }, duration: 220, ease: 'Back.Out' });
        if (res.reward > 0) floatText(this, x, y - 60, `+${res.reward} 🪙`);
      }
    }
    ghost.destroy();
  }

  // -------------------------------------------------------------- personagem

  private floorIndexFor(y: number): number {
    let best = 0;
    let bestDist = Infinity;
    this.def.floors.forEach((f, i) => {
      const d = Math.abs(f.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  private walkTo(x: number, floorIdx: number, onArrive?: () => void): void {
    const points: Waypoint[] = [];
    const current = this.floorIndexFor(this.char.y);

    if (current !== floorIdx && this.def.stairs) {
      const st = this.def.stairs;
      if (floorIdx === st.upper) {
        points.push({ x: st.bottomX, y: this.def.floors[st.lower].y });
        points.push({ x: st.topX, y: this.def.floors[st.upper].y });
      } else {
        points.push({ x: st.topX, y: this.def.floors[st.upper].y });
        points.push({ x: st.bottomX, y: this.def.floors[st.lower].y });
      }
    }

    const f = this.def.floors[floorIdx];
    points.push({ x: Phaser.Math.Clamp(x, f.xMin, f.xMax), y: f.y });
    this.char.walk(points, onArrive);
  }

  private interact(s: ItemSprite): void {
    const item = itemById(s.getData('itemId') as string);
    const uid = s.getData('uid') as string;
    const floorIdx = this.floorIndexFor(s.y + item.h / 2);

    this.walkTo(s.x, floorIdx, () => {
      switch (item.interact) {
        case 'sit': {
          const seatY = s.y + item.h * (item.seatFrac ?? 0.08);
          this.char.sitOn(uid, s.x, seatY, this.char.x > s.x);
          emojiBurst(this, s.x, seatY - 130, '💕');
          break;
        }
        case 'play': {
          this.tweens.add({ targets: s, scaleY: { from: 0.85, to: 1 }, duration: 260, ease: 'Bounce.Out' });
          emojiBurst(this, s.x, s.y - item.h, '⭐');
          break;
        }
        default:
          emojiBurst(this, s.x, s.y - item.h / 2 - 20, '✨', 2);
      }
    });
  }

  // -------------------------------------------------------------- estúdio de arte

  private createEasel(): void {
    const f = this.def.floors[0];
    const ex = 1010;
    const ey = f.y + 6;
    this.easelSprite = this.add.image(ex, ey, 'easel').setOrigin(0.5, 1).setDepth(9);
    this.easelSprite.setInteractive({ useHandCursor: true });
    this.easelSprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (pointer.getDistance() < 12 && !this.ghost && !this.shop.isOpen) this.goPaint();
    });

    const label = this.add
      .text(ex, ey - EASEL.h - 14, '🎨 Toque para pintar!', {
        fontFamily: FONT,
        fontSize: '17px',
        color: '#5d4037',
        backgroundColor: '#ffffffbb',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(9);
    this.tweens.add({ targets: label, y: label.y - 6, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.InOut' });
  }

  private artPos(): { x: number; y: number } {
    const e = this.easelSprite!;
    return { x: e.x - EASEL.w / 2 + EASEL.artX, y: e.y - EASEL.h + EASEL.artY };
  }

  private goPaint(): void {
    if (!this.easelSprite) return;
    this.walkTo(this.easelSprite.x - 85, 0, () => {
      emojiBurst(this, this.easelSprite!.x, this.easelSprite!.y - EASEL.h, '🎨', 2);
      this.scene.launch('Art', { levelId: this.def.id });
      this.scene.pause();
    });
  }

  private loadArt(): void {
    const url = state.art(this.def.id);
    if (!url || !this.easelSprite) return;
    const key = `art-${this.def.id}-${++this.artRev}`;

    const onAdd = (addedKey: string) => {
      if (addedKey !== key) return;
      this.textures.off(Phaser.Textures.Events.ADD, onAdd);
      if (!this.sys.isActive() && !this.sys.isPaused()) return;
      const pos = this.artPos();
      if (!this.easelArt) {
        this.easelArt = this.add.image(pos.x, pos.y, key).setDepth(9);
      } else {
        this.easelArt.setTexture(key);
      }
      this.easelArt.setDisplaySize(EASEL.artW, EASEL.artH);
    };
    this.textures.on(Phaser.Textures.Events.ADD, onAdd);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.textures.off(Phaser.Textures.Events.ADD, onAdd));
    this.textures.addBase64(key, url);
  }
}
