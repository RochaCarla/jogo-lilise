import Phaser from 'phaser';

export const FONT = 'Trebuchet MS, Verdana, sans-serif';

/** Botão redondo com emoji/símbolo. */
export function circleButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onTap: () => void,
  radius = 26,
  bg = 0xffffff
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(bg, 0.95);
  g.fillCircle(0, 0, radius);
  g.lineStyle(3, 0x5d4037, 1);
  g.strokeCircle(0, 0, radius);
  const t = scene.add
    .text(0, 0, label, { fontFamily: FONT, fontSize: `${Math.round(radius * 1.05)}px`, color: '#444' })
    .setOrigin(0.5);
  c.add([g, t]);
  c.setSize(radius * 2, radius * 2);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    if (pointer.getDistance() < 12) {
      scene.tweens.add({ targets: c, scale: { from: 0.85, to: 1 }, duration: 140, ease: 'Back.Out' });
      onTap();
    }
  });
  return c;
}

/** Botão "pílula" com texto. */
export function pillButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onTap: () => void,
  opts: { w?: number; h?: number; bg?: number; color?: string; fontSize?: number } = {}
): Phaser.GameObjects.Container & { setLabel: (s: string) => void } {
  const w = opts.w ?? 190;
  const h = opts.h ?? 52;
  const c = scene.add.container(x, y) as Phaser.GameObjects.Container & { setLabel: (s: string) => void };
  const g = scene.add.graphics();
  g.fillStyle(opts.bg ?? 0xffffff, 0.95);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  g.lineStyle(3, 0x5d4037, 1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  const t = scene.add
    .text(0, 0, label, {
      fontFamily: FONT,
      fontSize: `${opts.fontSize ?? 22}px`,
      color: opts.color ?? '#4e342e',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);
  c.add([g, t]);
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    if (pointer.getDistance() < 12) {
      scene.tweens.add({ targets: c, scale: { from: 0.92, to: 1 }, duration: 140, ease: 'Back.Out' });
      onTap();
    }
  });
  c.setLabel = (s: string) => t.setText(s);
  return c;
}

/**
 * Botão de tela cheia (some no app nativo, onde já é tela cheia).
 * Em celulares, ao entrar em tela cheia também trava a orientação em paisagem.
 */
export function fullscreenButton(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container | null {
  const isNativeApp = Boolean((window as never as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
  if (isNativeApp || !scene.scale.fullscreen.available) return null;
  return circleButton(scene, x, y, '⛶', () => {
    if (scene.scale.isFullscreen) {
      scene.scale.stopFullscreen();
    } else {
      scene.scale.startFullscreen();
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (o: string) => Promise<void>;
      };
      orientation.lock?.('landscape').catch(() => {
        /* alguns navegadores não permitem; sem problema */
      });
    }
  });
}

/** Texto flutuante (+12 🪙, ⭐...) que sobe e some. */
export function floatText(scene: Phaser.Scene, x: number, y: number, msg: string, color = '#ff9800'): void {
  const t = scene.add
    .text(x, y, msg, {
      fontFamily: FONT,
      fontSize: '30px',
      color,
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 5,
    })
    .setOrigin(0.5)
    .setDepth(200);
  scene.tweens.add({
    targets: t,
    y: y - 70,
    alpha: { from: 1, to: 0 },
    duration: 1100,
    ease: 'Cubic.Out',
    onComplete: () => t.destroy(),
  });
}

/** Pequena explosão de emojis (corações, estrelas...). */
export function emojiBurst(scene: Phaser.Scene, x: number, y: number, emoji: string, count = 3): void {
  for (let i = 0; i < count; i++) {
    const t = scene.add
      .text(x + (i - (count - 1) / 2) * 26, y, emoji, { fontSize: '26px' })
      .setOrigin(0.5)
      .setDepth(200);
    scene.tweens.add({
      targets: t,
      y: y - 50 - i * 14,
      alpha: { from: 1, to: 0 },
      scale: { from: 0.6, to: 1.2 },
      duration: 900 + i * 150,
      ease: 'Cubic.Out',
      onComplete: () => t.destroy(),
    });
  }
}
