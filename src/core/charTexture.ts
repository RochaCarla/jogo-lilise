import Phaser from 'phaser';
import type { CharacterConfig } from '../types';

/** Paletas de customização do personagem. */
export const SKINS = [0xffe3c8, 0xf2c79b, 0xd09a63, 0x9c6b3f, 0x6e4a2e];
export const HAIR_COLORS = [0x5b3a29, 0x2b2b2b, 0xf6c453, 0xd2622a, 0x9b59b6, 0x3b6fd4];
export const SHIRTS = [0xff7eb6, 0x67c9ff, 0x7ddf8a, 0xffd166, 0xb39df3, 0xff8a65];
export const PANTS = [0x4a69bd, 0x6d4c41, 0x37474f, 0xe84393, 0x2e8b57];
export const HAIR_STYLES = ['Curtinho', 'Longo', 'Chiquinhas', 'Cacheado'];
export const ACCESSORIES = ['Nenhum', 'Óculos', 'Laço', 'Boné'];

export const CHAR_W = 64;
export const CHAR_H = 96;

export function charTextureKey(c: CharacterConfig): string {
  return `char-${c.skin}-${c.hairStyle}-${c.hairColor}-${c.shirt}-${c.pants}-${c.accessory}`;
}

/** Gera (se necessário) a textura do personagem para a config dada. */
export function ensureCharTexture(scene: Phaser.Scene, c: CharacterConfig): string {
  const key = charTextureKey(c);
  if (scene.textures.exists(key)) return key;

  const skin = SKINS[c.skin % SKINS.length];
  const hair = HAIR_COLORS[c.hairColor % HAIR_COLORS.length];
  const shirt = SHIRTS[c.shirt % SHIRTS.length];
  const pants = PANTS[c.pants % PANTS.length];
  const style = c.hairStyle % HAIR_STYLES.length;
  const acc = c.accessory % ACCESSORIES.length;
  const OUT = 0x4e342e;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // cabelo "atrás" da cabeça (longo / chiquinhas)
  if (style === 1) {
    g.fillStyle(hair, 1);
    g.fillRoundedRect(12, 18, 11, 32, 5);
    g.fillRoundedRect(41, 18, 11, 32, 5);
  } else if (style === 2) {
    g.fillStyle(hair, 1);
    g.fillCircle(9, 20, 8);
    g.fillCircle(55, 20, 8);
  }

  // pernas e sapatos
  g.fillStyle(pants, 1);
  g.fillRoundedRect(20, 62, 11, 26, 4);
  g.fillRoundedRect(33, 62, 11, 26, 4);
  g.fillStyle(0x5d4037, 1);
  g.fillRoundedRect(17, 86, 15, 9, 4);
  g.fillRoundedRect(32, 86, 15, 9, 4);

  // corpo (camiseta) + braços
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(15, 40, 34, 28, 9);
  g.fillRoundedRect(8, 42, 9, 18, 4);
  g.fillRoundedRect(47, 42, 9, 18, 4);
  g.lineStyle(2.5, OUT, 1);
  g.strokeRoundedRect(15, 40, 34, 28, 9);
  // mãos
  g.fillStyle(skin, 1);
  g.fillCircle(12, 62, 4.5);
  g.fillCircle(52, 62, 4.5);

  // cabeça
  g.fillStyle(skin, 1);
  g.fillCircle(32, 24, 17);
  g.lineStyle(2.5, OUT, 1);
  g.strokeCircle(32, 24, 17);

  // cabelo "na frente"
  g.fillStyle(hair, 1);
  if (style === 3) {
    for (const [hx, hy] of [
      [18, 13],
      [28, 8],
      [40, 9],
      [48, 15],
      [14, 20],
      [50, 22],
    ]) {
      g.fillCircle(hx, hy, 8);
    }
  } else {
    // franja em meia-lua (todos os outros estilos)
    g.slice(32, 22, 17.5, Math.PI, Math.PI * 2, false);
    g.fillPath();
    if (style === 1 || style === 2) {
      g.fillRect(14.5, 20, 7, 8);
      g.fillRect(42.5, 20, 7, 8);
    }
  }

  // rosto
  g.fillStyle(0x33271f, 1);
  g.fillCircle(26, 25, 2.4);
  g.fillCircle(38, 25, 2.4);
  g.fillStyle(0xff9e9e, 0.55);
  g.fillCircle(22, 31, 3.2);
  g.fillCircle(42, 31, 3.2);
  g.lineStyle(2.4, 0x6d3b2e, 1);
  g.beginPath();
  g.arc(32, 28, 6, Math.PI * 0.18, Math.PI * 0.82, false);
  g.strokePath();

  // acessório
  if (acc === 1) {
    // óculos
    g.lineStyle(2.4, 0x37474f, 1);
    g.strokeCircle(26, 25, 5.5);
    g.strokeCircle(38, 25, 5.5);
    g.lineBetween(31, 25, 33, 25);
  } else if (acc === 2) {
    // laço
    g.fillStyle(0xff4f7e, 1);
    g.fillTriangle(38, 8, 46, 3, 46, 13);
    g.fillTriangle(54, 8, 46, 3, 46, 13);
    g.fillCircle(46, 8, 3.5);
  } else if (acc === 3) {
    // boné
    g.fillStyle(0x3b6fd4, 1);
    g.slice(32, 18, 16, Math.PI, Math.PI * 2, false);
    g.fillPath();
    g.fillRoundedRect(32, 13, 24, 7, 3);
  }

  g.generateTexture(key, CHAR_W, CHAR_H);
  g.destroy();
  return key;
}
