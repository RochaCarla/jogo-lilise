import Phaser from 'phaser';
import { bus, state } from '../core/state';
import { circleButton, pillButton, FONT } from './widgets';

export type GameMode = 'decor' | 'play';

export interface HudCallbacks {
  onBack: () => void;
  onShop: () => void;
  onCharacter: () => void;
  onModeChange: (mode: GameMode) => void;
}

/** Barra superior: voltar, nome da fase, modo, moedas, lojinha, personagem. */
export class Hud {
  readonly container: Phaser.GameObjects.Container;
  private coinsText!: Phaser.GameObjects.Text;
  private modeBtn!: ReturnType<typeof pillButton>;
  private mode: GameMode = 'decor';

  constructor(scene: Phaser.Scene, levelName: string, cb: HudCallbacks) {
    this.container = scene.add.container(0, 0).setDepth(100);

    this.container.add(circleButton(scene, 42, 42, '←', cb.onBack));

    const name = scene.add
      .text(86, 42, levelName, {
        fontFamily: FONT,
        fontSize: '26px',
        color: '#4e342e',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6,
      })
      .setOrigin(0, 0.5);
    this.container.add(name);

    this.modeBtn = pillButton(scene, 640, 42, '', () => {
      this.setMode(this.mode === 'decor' ? 'play' : 'decor');
      cb.onModeChange(this.mode);
    }, { w: 210, h: 50, bg: 0xfff3e0 });
    this.refreshModeLabel();
    this.container.add(this.modeBtn);

    // pílula de moedas
    const coinsBg = scene.add.graphics();
    coinsBg.fillStyle(0xfff3e0, 0.95);
    coinsBg.fillRoundedRect(960, 18, 150, 48, 24);
    coinsBg.lineStyle(3, 0x5d4037, 1);
    coinsBg.strokeRoundedRect(960, 18, 150, 48, 24);
    this.coinsText = scene.add
      .text(1035, 42, `🪙 ${state.coins}`, {
        fontFamily: FONT,
        fontSize: '24px',
        color: '#b86e00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.container.add([coinsBg, this.coinsText]);

    this.container.add(circleButton(scene, 1158, 42, '🛍️', cb.onShop));
    this.container.add(circleButton(scene, 1226, 42, '🙂', cb.onCharacter));

    const onCoins = (coins: number) => {
      this.coinsText.setText(`🪙 ${coins}`);
      scene.tweens.add({ targets: this.coinsText, scale: { from: 1.25, to: 1 }, duration: 200 });
    };
    bus.on('coins', onCoins);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bus.off('coins', onCoins));
  }

  get currentMode(): GameMode {
    return this.mode;
  }

  setMode(mode: GameMode): void {
    this.mode = mode;
    this.refreshModeLabel();
  }

  private refreshModeLabel(): void {
    this.modeBtn.setLabel(this.mode === 'decor' ? '🛋️ Decorando' : '🧍 Brincando');
  }
}
