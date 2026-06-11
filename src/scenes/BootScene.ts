import Phaser from 'phaser';
import { generateTextures } from '../core/textures';
import { ensureCharTexture } from '../core/charTexture';
import { state } from '../core/state';

/** Gera todas as texturas programáticas e abre o menu. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    generateTextures(this);
    ensureCharTexture(this, state.character);

    // atalho de desenvolvimento: abre uma cena direto via hash da URL
    // (#casa, #escola, #loja, #estudio, #char, #arte)
    const hash = window.location.hash.replace('#', '');
    if (['casa', 'escola', 'loja', 'estudio'].includes(hash)) {
      this.scene.start('Play', { levelId: hash });
      return;
    }
    if (hash === 'char') {
      this.scene.start('Character', { back: 'Menu' });
      return;
    }
    if (hash === 'arte') {
      this.scene.start('Art', { levelId: 'estudio' });
      return;
    }
    this.scene.start('Menu');
  }
}
