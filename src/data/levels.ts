import Phaser from 'phaser';
import type { LevelDef } from '../types';

/**
 * As 4 fases. Coordenadas no mundo de 1280x720:
 * - HUD ocupa o topo (~60px) e o painel de inventário o rodapé (y >= 600).
 * - floors[n].y é a linha onde os pés do personagem ficam.
 */
export const LEVELS: LevelDef[] = [
  {
    id: 'casa',
    name: 'Casa Vitoriana',
    subtitle: 'Dois andares para decorar',
    icon: 'icon-casa',
    floors: [
      { y: 592, xMin: 165, xMax: 960 },
      { y: 368, xMin: 165, xMax: 1115 },
    ],
    stairs: { bottomX: 990, topX: 1115, lower: 0, upper: 1 },
    bounds: { minX: 150, minY: 190, maxX: 1130, maxY: 596 },
  },
  {
    id: 'escola',
    name: 'Sala de Aula',
    subtitle: 'Uma escola bem divertida',
    icon: 'icon-escola',
    floors: [{ y: 586, xMin: 150, xMax: 1130 }],
    bounds: { minX: 135, minY: 170, maxX: 1145, maxY: 590 },
  },
  {
    id: 'loja',
    name: 'Loja do Shopping',
    subtitle: 'Roupas e brinquedos',
    icon: 'icon-loja',
    floors: [{ y: 586, xMin: 150, xMax: 1130 }],
    bounds: { minX: 135, minY: 170, maxX: 1145, maxY: 590 },
  },
  {
    id: 'estudio',
    name: 'Estúdio de Arte',
    subtitle: 'Crie suas próprias obras',
    icon: 'icon-estudio',
    floors: [{ y: 586, xMin: 150, xMax: 1130 }],
    bounds: { minX: 135, minY: 170, maxX: 1145, maxY: 590 },
    hasArt: true,
  },
];

export function levelById(id: string): LevelDef {
  const def = LEVELS.find((l) => l.id === id);
  if (!def) throw new Error(`Fase desconhecida: ${id}`);
  return def;
}

// ---------------------------------------------------------------------------
// Desenho dos cenários (fundo de cada fase)
// ---------------------------------------------------------------------------

type Scene = Phaser.Scene;

const OUT = 0x5d4037;

function woodStrip(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  g.fillStyle(0xb07b4f, 1);
  g.fillRect(x, y, w, h);
  g.lineStyle(3, OUT, 1);
  g.strokeRect(x, y, w, h);
  g.lineStyle(2, 0x96663f, 1);
  for (let i = x + 80; i < x + w; i += 80) g.lineBetween(i, y + 3, i, y + h - 3);
}

function windowPane(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  g.fillStyle(0xbfe7ff, 1);
  g.fillRoundedRect(x, y, w, h, 8);
  g.lineStyle(4, 0xffffff, 1);
  g.strokeRoundedRect(x, y, w, h, 8);
  g.lineStyle(3, 0xffffff, 0.9);
  g.lineBetween(x + w / 2, y + 4, x + w / 2, y + h - 4);
  g.lineBetween(x + 4, y + h / 2, x + w - 4, y + h / 2);
}

function sky(g: Phaser.GameObjects.Graphics): void {
  // fill sólido primeiro: fillGradientStyle só existe no WebGL
  g.fillStyle(0xaeddf5, 1);
  g.fillRect(0, 0, 1280, 720);
  g.fillGradientStyle(0x8ecdf2, 0x8ecdf2, 0xe8f7ff, 0xe8f7ff, 1);
  g.fillRect(0, 0, 1280, 720);
  // sol
  g.fillStyle(0xffe082, 1);
  g.fillCircle(95, 95, 42);
  // nuvens
  g.fillStyle(0xffffff, 0.9);
  for (const [cx, cy] of [
    [320, 90],
    [1080, 120],
  ]) {
    g.fillCircle(cx, cy, 26);
    g.fillCircle(cx + 30, cy - 8, 30);
    g.fillCircle(cx + 62, cy, 24);
  }
}

function drawCasa(scene: Scene): void {
  const g = scene.add.graphics().setDepth(-10);
  sky(g);

  // telhado
  g.fillStyle(0x7e57c2, 1);
  g.fillTriangle(100, 168, 640, 50, 1180, 168);
  g.lineStyle(5, OUT, 1);
  g.strokeTriangle(100, 168, 640, 50, 1180, 168);

  // corpo da casa
  g.fillStyle(0xfff3e0, 1);
  g.fillRect(120, 168, 1040, 444);
  g.lineStyle(5, OUT, 1);
  g.strokeRect(120, 168, 1040, 444);

  // andar de cima: papel de parede listrado azul
  g.fillStyle(0xddeefc, 1);
  g.fillRect(132, 178, 1016, 178);
  g.fillStyle(0xc4dff5, 1);
  for (let x = 152; x < 1130; x += 64) g.fillRect(x, 178, 26, 178);
  woodStrip(g, 132, 356, 1016, 22);

  // andar de baixo: papel de parede rosinha com bolinhas
  g.fillStyle(0xfde7ef, 1);
  g.fillRect(132, 378, 1016, 202);
  g.fillStyle(0xf7c8da, 1);
  for (let x = 170; x < 1120; x += 90)
    for (let y = 405; y < 570; y += 70) g.fillCircle(x + ((y / 70) % 2) * 38, y, 9);
  woodStrip(g, 132, 580, 1016, 22);

  // janelas dos dois andares
  windowPane(g, 230, 210, 90, 110);
  windowPane(g, 640, 210, 90, 110);
  windowPane(g, 230, 420, 90, 115);
  windowPane(g, 640, 420, 90, 115);

  // escada (canto direito): degraus do chão de baixo até o de cima
  const steps = 8;
  const x0 = 985;
  const x1 = 1140;
  const y0 = 580;
  const y1 = 368;
  g.lineStyle(3, OUT, 1);
  for (let i = 0; i < steps; i++) {
    const sx = x0 + ((x1 - x0) / steps) * i;
    const sy = y0 - ((y0 - y1) / steps) * i;
    const sw = (x1 - x0) / steps + 8;
    g.fillStyle(0xc58b5d, 1);
    g.fillRect(sx, sy - 14, sw, y0 - sy + 14);
    g.strokeRect(sx, sy - 14, sw, y0 - sy + 14);
  }
}

function drawEscola(scene: Scene): void {
  const g = scene.add.graphics().setDepth(-10);
  // parede verde-menta
  g.fillStyle(0xdcf2e4, 1);
  g.fillRect(0, 0, 1280, 720);
  g.fillStyle(0xc4e8d2, 1);
  g.fillRect(0, 440, 1280, 130); // meia-parede
  g.lineStyle(4, 0x9ccfb0, 1);
  g.lineBetween(0, 440, 1280, 440);
  woodStrip(g, 0, 570, 1280, 26);
  g.fillStyle(0xd9a06b, 1);
  g.fillRect(0, 596, 1280, 124);

  // janelas com céu
  windowPane(g, 150, 200, 150, 170);
  windowPane(g, 420, 200, 150, 170);
  g.fillStyle(0xffe082, 1);
  g.fillCircle(205, 250, 18); // solzinho na janela

  // porta
  g.fillStyle(0xb07b4f, 1);
  g.fillRoundedRect(1060, 360, 110, 210, { tl: 12, tr: 12, bl: 0, br: 0 });
  g.lineStyle(4, OUT, 1);
  g.strokeRoundedRect(1060, 360, 110, 210, { tl: 12, tr: 12, bl: 0, br: 0 });
  g.fillStyle(0xffd54f, 1);
  g.fillCircle(1080, 470, 6);

  // bandeirinhas no alto
  const colors = [0xff8a80, 0xffd54f, 0x80deea, 0xb39ddb, 0xa5d6a7];
  g.lineStyle(3, 0x8d6e63, 1);
  g.lineBetween(0, 130, 1280, 110);
  for (let i = 0; i < 14; i++) {
    const x = 40 + i * 90;
    const y = 130 - (x / 1280) * 20;
    g.fillStyle(colors[i % colors.length], 1);
    g.fillTriangle(x, y, x + 44, y, x + 22, y + 40);
  }

  // relógio
  g.fillStyle(0xffffff, 1);
  g.fillCircle(880, 230, 34);
  g.lineStyle(4, OUT, 1);
  g.strokeCircle(880, 230, 34);
  g.lineStyle(3, OUT, 1);
  g.lineBetween(880, 230, 880, 208);
  g.lineBetween(880, 230, 896, 236);
}

function drawLoja(scene: Scene): void {
  const g = scene.add.graphics().setDepth(-10);
  // parede lilás
  g.fillStyle(0xe9defa, 1);
  g.fillRect(0, 0, 1280, 720);

  // faixa da loja (letreiro)
  g.fillStyle(0xff7eb6, 1);
  g.fillRect(0, 96, 1280, 70);
  g.lineStyle(4, 0xd95c95, 1);
  g.strokeRect(-4, 96, 1288, 70);

  // luzes do teto
  for (const x of [260, 640, 1020]) {
    g.lineStyle(3, 0xb6a3d8, 1);
    g.lineBetween(x, 0, x, 40);
    g.fillStyle(0xfff59d, 1);
    g.fillCircle(x, 52, 14);
    g.lineStyle(3, OUT, 1);
    g.strokeCircle(x, 52, 14);
  }

  // vitrine à esquerda
  g.fillStyle(0xcfe8ff, 0.85);
  g.fillRoundedRect(60, 210, 200, 330, 10);
  g.lineStyle(5, 0xffffff, 1);
  g.strokeRoundedRect(60, 210, 200, 330, 10);
  g.lineStyle(2, 0xffffff, 0.7);
  g.lineBetween(80, 240, 180, 520);

  // piso quadriculado
  const tile = 64;
  for (let x = 0; x < 1280; x += tile) {
    for (let y = 570; y < 720; y += tile) {
      const even = (x / tile + Math.floor(y / tile)) % 2 === 0;
      g.fillStyle(even ? 0xf8f4ff : 0xd6c8ef, 1);
      g.fillRect(x, y, tile, tile);
    }
  }
  g.lineStyle(3, 0xb6a3d8, 1);
  g.lineBetween(0, 570, 1280, 570);

  // letreiro (texto)
  scene.add
    .text(640, 131, '✦ ROUPAS & BRINQUEDOS ✦', {
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      fontSize: '38px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setDepth(-9);
}

function drawEstudio(scene: Scene): void {
  const g = scene.add.graphics().setDepth(-10);
  // parede creme
  g.fillStyle(0xfdf6e3, 1);
  g.fillRect(0, 0, 1280, 720);

  // claraboia
  g.fillStyle(0xbfe7ff, 1);
  g.fillRoundedRect(420, 30, 440, 110, 16);
  g.lineStyle(5, 0xffffff, 1);
  g.strokeRoundedRect(420, 30, 440, 110, 16);
  g.lineStyle(3, 0xffffff, 0.9);
  for (let x = 530; x < 860; x += 110) g.lineBetween(x, 34, x, 136);

  // mural de cortiça com desenhos
  g.fillStyle(0xd9a06b, 1);
  g.fillRoundedRect(120, 200, 280, 180, 10);
  g.lineStyle(4, OUT, 1);
  g.strokeRoundedRect(120, 200, 280, 180, 10);
  const papers = [
    [150, 225, 0xffffff],
    [250, 230, 0xfff9c4],
    [330, 225, 0xffffff],
    [185, 300, 0xe1f5fe],
    [290, 305, 0xffffff],
  ] as const;
  for (const [px, py, pc] of papers) {
    g.fillStyle(pc, 1);
    g.fillRect(px, py, 56, 62);
    g.lineStyle(2, 0xcccccc, 1);
    g.strokeRect(px, py, 56, 62);
  }
  // rabiscos nos papéis
  g.lineStyle(3, 0xef5350, 1);
  g.strokeCircle(178, 252, 14);
  g.lineStyle(3, 0x42a5f5, 1);
  g.lineBetween(338, 240, 376, 275);
  g.lineBetween(338, 275, 376, 240);

  // piso de madeira clara com respingos de tinta
  g.fillStyle(0xe8cda4, 1);
  g.fillRect(0, 570, 1280, 150);
  g.lineStyle(3, 0xc9a87e, 1);
  g.lineBetween(0, 570, 1280, 570);
  for (let i = 600; i < 1280; i += 160) g.lineBetween(i, 570, i, 720);
  const splats = [
    [320, 630, 0xef5350],
    [520, 660, 0x42a5f5],
    [840, 640, 0xffca28],
    [1080, 665, 0x66bb6a],
  ] as const;
  for (const [sx, sy, sc] of splats) {
    g.fillStyle(sc, 0.75);
    g.fillEllipse(sx, sy, 46, 16);
    g.fillCircle(sx + 30, sy - 8, 6);
  }
}

export function drawLevelBackground(scene: Scene, levelId: string): void {
  switch (levelId) {
    case 'casa':
      return drawCasa(scene);
    case 'escola':
      return drawEscola(scene);
    case 'loja':
      return drawLoja(scene);
    case 'estudio':
      return drawEstudio(scene);
  }
}
