import Phaser from 'phaser';

export interface Waypoint {
  x: number;
  y: number;
}

/**
 * O boneco do jogador. Anda por waypoints (permitindo o trajeto pela escada),
 * balança enquanto caminha e pode "sentar" num móvel.
 */
export class Character extends Phaser.GameObjects.Image {
  private waypoints: Waypoint[] = [];
  private onArrive?: () => void;
  private bobT = 0;
  /** uid do item onde está sentado (null = em pé) */
  sittingOn: string | null = null;

  speed = 240; // px/s

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    this.setOrigin(0.5, 1);
    this.setScale(1.15);
    scene.add.existing(this);
  }

  get isWalking(): boolean {
    return this.waypoints.length > 0;
  }

  walk(points: Waypoint[], onArrive?: () => void): void {
    this.sittingOn = null;
    this.setAngle(0);
    this.waypoints = points;
    this.onArrive = onArrive;
  }

  stopWalking(): void {
    this.waypoints = [];
    this.onArrive = undefined;
    this.setAngle(0);
  }

  sitOn(uid: string, x: number, bottomY: number, faceLeft: boolean): void {
    this.stopWalking();
    this.sittingOn = uid;
    this.setPosition(x, bottomY);
    this.setFlipX(faceLeft);
  }

  standUp(): void {
    this.sittingOn = null;
  }

  /** chamado a cada frame pelo update da cena */
  tick(deltaMs: number): void {
    if (this.waypoints.length === 0) return;

    const dt = deltaMs / 1000;
    let remaining = this.speed * dt;

    while (remaining > 0 && this.waypoints.length > 0) {
      const target = this.waypoints[0];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= remaining) {
        this.setPosition(target.x, target.y);
        this.waypoints.shift();
        remaining -= dist;
      } else {
        if (Math.abs(dx) > 2) this.setFlipX(dx < 0);
        this.setPosition(this.x + (dx / dist) * remaining, this.y + (dy / dist) * remaining);
        remaining = 0;
      }
    }

    if (this.waypoints.length === 0) {
      this.setAngle(0);
      const cb = this.onArrive;
      this.onArrive = undefined;
      cb?.();
    } else {
      this.bobT += deltaMs;
      this.setAngle(Math.sin(this.bobT * 0.022) * 4);
    }
  }
}
