import Phaser from 'phaser';
import { CATALOG, itemById } from '../data/catalog';
import type { CharacterConfig, LevelSave, PlacedItemData, SaveData } from '../types';

const KEY = 'casa-criativa-save-v1';
export const STARTING_COINS = 120;

/** Barramento global de eventos do estado ('coins', 'inventory', 'character'). */
export const bus = new Phaser.Events.EventEmitter();

const DEFAULT_CHARACTER: CharacterConfig = {
  skin: 0,
  hairStyle: 0,
  hairColor: 0,
  shirt: 0,
  pants: 0,
  accessory: 0,
};

function starterInventory(): Record<string, number> {
  const inv: Record<string, number> = {};
  for (const item of CATALOG) if (item.starter) inv[item.id] = item.starter;
  return inv;
}

function freshSave(): SaveData {
  return {
    version: 1,
    coins: STARTING_COINS,
    inventory: starterInventory(),
    character: { ...DEFAULT_CHARACTER },
    levels: {},
  };
}

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as SaveData;
      if (data && data.version === 1) return data;
    }
  } catch (err) {
    console.warn('Save corrompido, começando do zero.', err);
  }
  return freshSave();
}

const data: SaveData = loadSave();

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Não foi possível salvar.', err);
  }
}

function newUid(): string {
  return 'p' + Math.random().toString(36).slice(2, 10);
}

function levelSave(levelId: string): LevelSave {
  let lvl = data.levels[levelId];
  if (!lvl) {
    lvl = { placed: [], rewarded: {} };
    data.levels[levelId] = lvl;
  }
  return lvl;
}

export const state = {
  get coins(): number {
    return data.coins;
  },

  get character(): CharacterConfig {
    return { ...data.character };
  },

  setCharacter(cfg: CharacterConfig): void {
    data.character = { ...cfg };
    persist();
    bus.emit('character');
  },

  invCount(itemId: string): number {
    return data.inventory[itemId] ?? 0;
  },

  /** Itens do inventário com quantidade > 0. */
  inventoryEntries(): Array<{ itemId: string; count: number }> {
    return Object.entries(data.inventory)
      .filter(([, n]) => n > 0)
      .map(([itemId, count]) => ({ itemId, count }));
  },

  addCoins(n: number): void {
    data.coins += n;
    persist();
    bus.emit('coins', data.coins);
  },

  buy(itemId: string): boolean {
    const item = itemById(itemId);
    if (data.coins < item.price) return false;
    data.coins -= item.price;
    data.inventory[itemId] = (data.inventory[itemId] ?? 0) + 1;
    persist();
    bus.emit('coins', data.coins);
    bus.emit('inventory');
    return true;
  },

  placedItems(levelId: string): PlacedItemData[] {
    return [...levelSave(levelId).placed];
  },

  /**
   * Posiciona um item do inventário na fase. Retorna o item criado e a
   * recompensa em moedas (0 se aquele "slot" do item já foi recompensado —
   * recolocar um item removido não gera moedas de novo).
   */
  place(
    levelId: string,
    itemId: string,
    x: number,
    y: number
  ): { placed: PlacedItemData; reward: number } | null {
    if (this.invCount(itemId) <= 0) return null;
    const item = itemById(itemId);
    const lvl = levelSave(levelId);

    data.inventory[itemId] -= 1;
    const placed: PlacedItemData = { uid: newUid(), itemId, x, y, flip: false };
    lvl.placed.push(placed);

    const countNow = lvl.placed.filter((p) => p.itemId === itemId).length;
    const alreadyRewarded = lvl.rewarded[itemId] ?? 0;
    let reward = 0;
    if (countNow > alreadyRewarded) {
      lvl.rewarded[itemId] = countNow;
      reward = item.reward;
      data.coins += reward;
      bus.emit('coins', data.coins);
    }

    persist();
    bus.emit('inventory');
    return { placed, reward };
  },

  move(levelId: string, uid: string, x: number, y: number): void {
    const p = levelSave(levelId).placed.find((p) => p.uid === uid);
    if (p) {
      p.x = x;
      p.y = y;
      persist();
    }
  },

  setFlip(levelId: string, uid: string, flip: boolean): void {
    const p = levelSave(levelId).placed.find((p) => p.uid === uid);
    if (p) {
      p.flip = flip;
      persist();
    }
  },

  /** Remove da fase e devolve ao inventário. */
  remove(levelId: string, uid: string): void {
    const lvl = levelSave(levelId);
    const idx = lvl.placed.findIndex((p) => p.uid === uid);
    if (idx < 0) return;
    const [p] = lvl.placed.splice(idx, 1);
    data.inventory[p.itemId] = (data.inventory[p.itemId] ?? 0) + 1;
    persist();
    bus.emit('inventory');
  },

  art(levelId: string): string | undefined {
    return levelSave(levelId).art;
  },

  setArt(levelId: string, dataUrl: string): void {
    levelSave(levelId).art = dataUrl;
    persist();
  },
};
