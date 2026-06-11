import Phaser from 'phaser';
import { CATALOG } from '../data/catalog';

type G = Phaser.GameObjects.Graphics;
type Scene = Phaser.Scene;

export const OUT = 0x5d4037;

function make(scene: Scene, key: string, w: number, h: number, draw: (g: G, w: number, h: number) => void): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}

type Radius = number | { tl: number; tr: number; bl: number; br: number };

/** retângulo arredondado com contorno padrão */
function rr(g: G, x: number, y: number, w: number, h: number, r: Radius, fill: number, line = 3): void {
  g.fillStyle(fill, 1);
  g.fillRoundedRect(x, y, w, h, r);
  if (line > 0) {
    g.lineStyle(line, OUT, 1);
    g.strokeRoundedRect(x, y, w, h, r);
  }
}

function circ(g: G, x: number, y: number, r: number, fill: number, line = 3): void {
  g.fillStyle(fill, 1);
  g.fillCircle(x, y, r);
  if (line > 0) {
    g.lineStyle(line, OUT, 1);
    g.strokeCircle(x, y, r);
  }
}

// ---------------------------------------------------------------------------
// Desenho de cada item do catálogo (key: id do item)
// ---------------------------------------------------------------------------

const drawers: Record<string, (g: G, w: number, h: number) => void> = {
  sofa(g, w, h) {
    rr(g, 4, 4, w - 8, h * 0.55, 14, 0xff8a80); // encosto
    rr(g, 10, h * 0.42, w - 20, h * 0.4, 10, 0xff8a80); // assento
    g.lineStyle(3, OUT, 0.5);
    g.lineBetween(w / 2, h * 0.46, w / 2, h * 0.78);
    rr(g, 2, h * 0.3, 22, h * 0.55, 10, 0xef5350); // braços
    rr(g, w - 24, h * 0.3, 22, h * 0.55, 10, 0xef5350);
    g.fillStyle(OUT, 1);
    g.fillRect(14, h - 7, 10, 7);
    g.fillRect(w - 24, h - 7, 10, 7);
  },
  armchair(g, w, h) {
    rr(g, 8, 4, w - 16, h * 0.55, 14, 0x80cbc4);
    rr(g, 12, h * 0.42, w - 24, h * 0.4, 10, 0x80cbc4);
    rr(g, 2, h * 0.32, 18, h * 0.52, 9, 0x4db6ac);
    rr(g, w - 20, h * 0.32, 18, h * 0.52, 9, 0x4db6ac);
    g.fillStyle(OUT, 1);
    g.fillRect(12, h - 7, 9, 7);
    g.fillRect(w - 21, h - 7, 9, 7);
  },
  chair(g, w, h) {
    rr(g, w * 0.18, 2, w * 0.2, h * 0.62, 6, 0xffb74d); // encosto
    rr(g, w * 0.12, h * 0.55, w * 0.76, 12, 5, 0xffa726); // assento
    g.fillStyle(OUT, 1);
    g.fillRect(w * 0.18, h * 0.65, 6, h * 0.33);
    g.fillRect(w * 0.72, h * 0.65, 6, h * 0.33);
  },
  table(g, w, h) {
    rr(g, 2, 6, w - 4, 16, 7, 0xbf8a5c);
    g.fillStyle(0xa9744b, 1);
    g.fillRect(12, 22, 12, h - 24);
    g.fillRect(w - 24, 22, 12, h - 24);
    g.lineStyle(3, OUT, 1);
    g.strokeRect(12, 22, 12, h - 24);
    g.strokeRect(w - 24, 22, 12, h - 24);
  },
  coffeetable(g, w, h) {
    rr(g, 2, 4, w - 4, 14, 6, 0xd7a86e);
    g.fillStyle(0xb98a58, 1);
    g.fillRect(10, 18, 10, h - 20);
    g.fillRect(w - 20, 18, 10, h - 20);
    g.lineStyle(3, OUT, 1);
    g.strokeRect(10, 18, 10, h - 20);
    g.strokeRect(w - 20, 18, 10, h - 20);
  },
  bed(g, w, h) {
    rr(g, 2, 2, 26, h - 10, 8, 0xa9744b); // cabeceira
    rr(g, 16, h * 0.4, w - 20, h * 0.42, 8, 0xfafafa); // colchão
    rr(g, w * 0.4, h * 0.34, w * 0.57, h * 0.5, 10, 0x9fa8da); // coberta
    g.lineStyle(3, OUT, 0.4);
    g.lineBetween(w * 0.4, h * 0.55, w * 0.97, h * 0.55);
    rr(g, 24, h * 0.36, w * 0.18, h * 0.22, 8, 0xffffff); // travesseiro
    g.fillStyle(OUT, 1);
    g.fillRect(20, h - 8, 10, 8);
    g.fillRect(w - 26, h - 8, 10, 8);
  },
  rug(g, w, h) {
    g.fillStyle(0xce93d8, 1);
    g.fillEllipse(w / 2, h / 2, w - 6, h - 6);
    g.lineStyle(3, 0xab47bc, 1);
    g.strokeEllipse(w / 2, h / 2, w - 6, h - 6);
    g.fillStyle(0xf3e5f5, 1);
    g.fillEllipse(w / 2, h / 2, w * 0.55, h * 0.5);
  },
  plant(g, w, h) {
    rr(g, w * 0.25, h * 0.66, w * 0.5, h * 0.3, 6, 0xef9a9a); // vaso
    g.fillStyle(0x66bb6a, 1);
    g.fillCircle(w * 0.5, h * 0.3, w * 0.3);
    g.fillCircle(w * 0.26, h * 0.45, w * 0.22);
    g.fillCircle(w * 0.74, h * 0.45, w * 0.22);
    g.lineStyle(3, 0x388e3c, 1);
    g.strokeCircle(w * 0.5, h * 0.3, w * 0.3);
  },
  lamp(g, w, h) {
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(w / 2 - 4, h * 0.28, 8, h * 0.62);
    rr(g, w * 0.18, h * 0.88, w * 0.64, 9, 4, 0x8d6e63);
    rr(g, w * 0.08, 2, w * 0.84, h * 0.28, { tl: 14, tr: 14, bl: 4, br: 4 }, 0xfff176);
  },
  bookshelf(g, w, h) {
    rr(g, 2, 2, w - 4, h - 4, 8, 0xbf8a5c);
    const colors = [0xef5350, 0x42a5f5, 0x66bb6a, 0xffca28, 0xab47bc];
    for (let row = 0; row < 3; row++) {
      const ry = 12 + row * ((h - 24) / 3);
      const rh = (h - 24) / 3 - 10;
      g.fillStyle(0x96663f, 1);
      g.fillRect(8, ry + rh, w - 16, 6);
      for (let b = 0; b < 4; b++) {
        g.fillStyle(colors[(row * 2 + b) % colors.length], 1);
        g.fillRect(12 + b * ((w - 26) / 4), ry + 6, (w - 26) / 4 - 5, rh - 6);
      }
    }
  },
  picture(g, w, h) {
    rr(g, 2, 2, w - 4, h - 4, 6, 0xffd54f, 4);
    g.fillStyle(0xb3e5fc, 1);
    g.fillRect(10, 10, w - 20, h - 20);
    g.fillStyle(0x81c784, 1);
    g.fillTriangle(10, h - 10, w * 0.45, h * 0.4, w * 0.7, h - 10);
    g.fillStyle(0xffe082, 1);
    g.fillCircle(w - 22, 22, 8);
  },
  tv(g, w, h) {
    rr(g, 2, 2, w - 4, h * 0.74, 8, 0x37474f);
    g.fillStyle(0x80deea, 1);
    g.fillRect(8, 8, w - 16, h * 0.74 - 12);
    g.fillStyle(0x546e7a, 1);
    g.fillRect(w / 2 - 6, h * 0.74, 12, h * 0.14);
    rr(g, w * 0.25, h * 0.86, w * 0.5, 8, 4, 0x546e7a, 0);
  },
  mirror(g, w, h) {
    rr(g, w * 0.1, 2, w * 0.8, h * 0.78, 20, 0xffd54f, 4);
    g.fillStyle(0xcfd8dc, 1);
    g.fillEllipse(w / 2, h * 0.4, w * 0.56, h * 0.62);
    g.lineStyle(3, 0xffffff, 0.8);
    g.lineBetween(w * 0.38, h * 0.2, w * 0.6, h * 0.55);
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(w / 2 - 4, h * 0.8, 8, h * 0.12);
    rr(g, w * 0.2, h * 0.92, w * 0.6, 7, 3, 0x8d6e63);
  },
  toybox(g, w, h) {
    rr(g, 2, h * 0.3, w - 4, h * 0.66, 8, 0x4fc3f7);
    g.lineStyle(3, OUT, 1);
    g.lineBetween(4, h * 0.5, w - 4, h * 0.5);
    circ(g, w * 0.3, h * 0.22, 11, 0xef5350); // bola
    g.fillStyle(0xffca28, 1);
    g.fillRect(w * 0.5, h * 0.06, 18, 18); // bloco
    g.lineStyle(3, OUT, 1);
    g.strokeRect(w * 0.5, h * 0.06, 18, 18);
  },
  teddy(g, w, h) {
    circ(g, w * 0.28, h * 0.2, 8, 0xbc8a5f); // orelhas
    circ(g, w * 0.72, h * 0.2, 8, 0xbc8a5f);
    circ(g, w * 0.5, h * 0.32, 14, 0xd0a070); // cabeça
    circ(g, w * 0.5, h * 0.68, 16, 0xd0a070); // corpo
    g.fillStyle(0x4e342e, 1);
    g.fillCircle(w * 0.44, h * 0.3, 2);
    g.fillCircle(w * 0.56, h * 0.3, 2);
    g.fillCircle(w * 0.5, h * 0.37, 2.5);
  },
  schooldesk(g, w, h) {
    rr(g, 2, h * 0.3, w - 4, 12, 5, 0x81d4fa); // tampo
    g.fillStyle(0x90a4ae, 1);
    g.fillRect(8, h * 0.3 + 12, 7, h * 0.6);
    g.fillRect(w - 15, h * 0.3 + 12, 7, h * 0.6);
    rr(g, w * 0.3, h * 0.06, w * 0.34, h * 0.16, 4, 0xffffff); // caderno
  },
  blackboard(g, w, h) {
    rr(g, 2, 2, w - 4, h - 14, 8, 0xbf8a5c, 4);
    g.fillStyle(0x2e7d59, 1);
    g.fillRect(12, 12, w - 24, h - 36);
    g.lineStyle(3, 0xffffff, 0.9);
    g.lineBetween(24, 34, 70, 34);
    g.lineBetween(24, 54, 96, 54);
    g.strokeCircle(w - 44, 44, 14);
    rr(g, w * 0.3, h - 14, w * 0.4, 9, 4, 0xa9744b);
  },
  teacherdesk(g, w, h) {
    rr(g, 2, 6, w - 4, 16, 7, 0xd7a86e);
    rr(g, 8, 22, w * 0.4, h - 26, 6, 0xbf8a5c);
    g.lineStyle(3, OUT, 0.6);
    g.lineBetween(12, h * 0.55, w * 0.4, h * 0.55);
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(w * 0.24, h * 0.42, 4);
    g.fillCircle(w * 0.24, h * 0.7, 4);
    g.fillStyle(0xa9744b, 1);
    g.fillRect(w - 22, 22, 12, h - 24);
    g.lineStyle(3, OUT, 1);
    g.strokeRect(w - 22, 22, 12, h - 24);
  },
  globe(g, w, h) {
    circ(g, w / 2, h * 0.38, w * 0.36, 0x4fc3f7);
    g.fillStyle(0x66bb6a, 1);
    g.fillCircle(w * 0.4, h * 0.3, 7);
    g.fillCircle(w * 0.62, h * 0.45, 8);
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(w / 2 - 3, h * 0.72, 6, h * 0.16);
    rr(g, w * 0.22, h * 0.86, w * 0.56, 8, 4, 0x8d6e63);
  },
  abc(g, w, h) {
    rr(g, 2, 2, w - 4, h - 4, 8, 0xfff9c4);
    const colors = [0xef5350, 0x42a5f5, 0x66bb6a];
    for (let i = 0; i < 3; i++) {
      rr(g, 10 + i * ((w - 24) / 3), 12, (w - 24) / 3 - 6, h - 28, 6, colors[i], 2);
    }
  },
  rack(g, w, h) {
    g.fillStyle(0x90a4ae, 1);
    g.fillRect(6, 6, 7, h - 6);
    g.fillRect(w - 13, 6, 7, h - 6);
    g.fillRect(6, 6, w - 12, 7);
    g.lineStyle(3, OUT, 1);
    g.strokeRect(6, 6, w - 12, 7);
    const colors = [0xff8a80, 0x80deea, 0xffd54f, 0xb39ddb];
    for (let i = 0; i < 4; i++) {
      const cx = 22 + i * ((w - 44) / 3);
      g.lineStyle(3, 0x78909c, 1);
      g.lineBetween(cx, 13, cx, 26);
      rr(g, cx - 11, 26, 22, h * 0.45, { tl: 4, tr: 4, bl: 8, br: 8 }, colors[i], 2);
    }
  },
  shelfunit(g, w, h) {
    rr(g, 2, 2, w - 4, h - 4, 8, 0xf8bbd0);
    const colors = [0x80deea, 0xffd54f, 0xb39ddb, 0xa5d6a7, 0xff8a80, 0x90caf9];
    for (let row = 0; row < 3; row++) {
      const ry = 12 + row * ((h - 24) / 3);
      const rh = (h - 24) / 3 - 10;
      g.fillStyle(0xe491b2, 1);
      g.fillRect(8, ry + rh, w - 16, 6);
      for (let b = 0; b < 3; b++) {
        g.fillStyle(colors[(row * 3 + b) % colors.length], 1);
        g.fillRoundedRect(12 + b * ((w - 26) / 3), ry + rh - 18, (w - 26) / 3 - 6, 16, 3);
      }
    }
  },
  mannequin(g, w, h) {
    circ(g, w / 2, 12, 9, 0xeeeeee, 2);
    g.fillStyle(0xff7eb6, 1); // vestido
    g.fillTriangle(w / 2 - 12, 26, w / 2 + 12, 26, w / 2 + 22, h * 0.62);
    g.fillTriangle(w / 2 - 12, 26, w / 2 - 22, h * 0.62, w / 2 + 22, h * 0.62);
    g.fillRect(w / 2 - 12, 24, 24, 14);
    g.fillStyle(0x90a4ae, 1);
    g.fillRect(w / 2 - 3, h * 0.62, 6, h * 0.26);
    rr(g, w * 0.16, h * 0.88, w * 0.68, 8, 4, 0x90a4ae);
  },
  register(g, w, h) {
    rr(g, 2, h * 0.4, w - 4, h * 0.56, 6, 0xd7a86e); // balcão
    rr(g, w * 0.18, 6, w * 0.5, h * 0.36, 6, 0x78909c);
    g.fillStyle(0xb2ebf2, 1);
    g.fillRect(w * 0.24, 12, w * 0.22, h * 0.2);
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(w * 0.78, h * 0.28, 7);
  },
  toyshelf(g, w, h) {
    rr(g, 2, 2, w - 4, h - 4, 8, 0x90caf9);
    for (let row = 0; row < 3; row++) {
      const ry = 12 + row * ((h - 24) / 3);
      const rh = (h - 24) / 3 - 10;
      g.fillStyle(0x64b5f6, 1);
      g.fillRect(8, ry + rh, w - 16, 6);
      if (row === 0) {
        circ(g, w * 0.3, ry + rh - 10, 9, 0xef5350, 2);
        circ(g, w * 0.6, ry + rh - 10, 9, 0xffca28, 2);
      } else if (row === 1) {
        g.fillStyle(0x66bb6a, 1);
        g.fillRect(w * 0.2, ry + rh - 18, 16, 16);
        g.fillStyle(0xab47bc, 1);
        g.fillRect(w * 0.5, ry + rh - 18, 16, 16);
      } else {
        circ(g, w * 0.35, ry + rh - 12, 8, 0xd0a070, 2); // ursinho
        circ(g, w * 0.35, ry + rh - 22, 6, 0xd0a070, 2);
      }
    }
  },
  paintshelf(g, w, h) {
    rr(g, 2, 2, w - 4, h - 4, 8, 0xbf8a5c);
    const colors = [0xef5350, 0x42a5f5, 0xffca28, 0x66bb6a, 0xab47bc, 0xff7043];
    for (let row = 0; row < 2; row++) {
      const ry = 14 + row * ((h - 28) / 2);
      const rh = (h - 28) / 2 - 10;
      g.fillStyle(0x96663f, 1);
      g.fillRect(8, ry + rh, w - 16, 6);
      for (let b = 0; b < 3; b++) {
        const bx = 16 + b * ((w - 32) / 3);
        g.fillStyle(colors[row * 3 + b], 1);
        g.fillRoundedRect(bx, ry + rh - 26, 18, 24, 4);
        g.fillStyle(0xeeeeee, 1);
        g.fillRect(bx + 3, ry + rh - 31, 12, 6);
      }
    }
  },
  sculpture(g, w, h) {
    rr(g, w * 0.15, h * 0.6, w * 0.7, h * 0.36, 6, 0xbcaaa4); // pedestal
    g.fillStyle(0xffb74d, 1);
    g.fillCircle(w * 0.5, h * 0.32, w * 0.26);
    g.fillCircle(w * 0.34, h * 0.48, w * 0.16);
    g.fillCircle(w * 0.66, h * 0.48, w * 0.16);
    g.lineStyle(3, OUT, 1);
    g.strokeCircle(w * 0.5, h * 0.32, w * 0.26);
  },
  artdesk(g, w, h) {
    rr(g, 2, 10, w - 4, 16, 7, 0xd7a86e);
    g.fillStyle(0xffffff, 1);
    g.fillRect(w * 0.2, 2, w * 0.34, 13); // papel
    g.lineStyle(2, 0xef5350, 1);
    g.lineBetween(w * 0.25, 9, w * 0.45, 9);
    g.fillStyle(0xb98a58, 1);
    g.fillRect(12, 26, 11, h - 28);
    g.fillRect(w - 23, 26, 11, h - 28);
    g.lineStyle(3, OUT, 1);
    g.strokeRect(12, 26, 11, h - 28);
    g.strokeRect(w - 23, 26, 11, h - 28);
  },
  canvasrack(g, w, h) {
    rr(g, 6, 14, w - 30, h - 18, 4, 0xffffff, 3);
    rr(g, 20, 6, w - 30, h - 18, 4, 0xfafafa, 3);
    g.fillStyle(0x80deea, 1);
    g.fillCircle(w * 0.55, h * 0.4, 12);
    g.fillStyle(0xffca28, 1);
    g.fillTriangle(w * 0.4, h * 0.75, w * 0.55, h * 0.5, w * 0.72, h * 0.75);
  },
};

// ---------------------------------------------------------------------------

/** Cavalete fixo do estúdio (não removível). Área da tela exportada para exibir a arte. */
export const EASEL = { w: 150, h: 185, artX: 75, artY: 62, artW: 104, artH: 84 };

function drawEasel(g: G): void {
  const { w, h } = EASEL;
  // pernas do tripé
  g.lineStyle(7, 0x8d6e63, 1);
  g.lineBetween(w / 2 - 28, 30, 18, h - 4);
  g.lineBetween(w / 2 + 28, 30, w - 18, h - 4);
  g.lineBetween(w / 2, 40, w / 2, h - 10);
  // tela
  rr(g, EASEL.artX - EASEL.artW / 2 - 6, EASEL.artY - EASEL.artH / 2 - 6, EASEL.artW + 12, EASEL.artH + 12, 4, 0xd7a86e);
  g.fillStyle(0xffffff, 1);
  g.fillRect(EASEL.artX - EASEL.artW / 2, EASEL.artY - EASEL.artH / 2, EASEL.artW, EASEL.artH);
  // bandeja com tintas
  rr(g, w / 2 - 40, EASEL.artY + EASEL.artH / 2 + 10, 80, 10, 4, 0xa9744b);
  for (const [i, c] of [0xef5350, 0x42a5f5, 0xffca28].entries()) {
    g.fillStyle(c, 1);
    g.fillCircle(w / 2 - 22 + i * 22, EASEL.artY + EASEL.artH / 2 + 14, 6);
  }
}

function drawMenuIcons(scene: Scene): void {
  make(scene, 'icon-casa', 96, 96, (g) => {
    g.fillStyle(0x7e57c2, 1);
    g.fillTriangle(6, 44, 48, 8, 90, 44);
    g.lineStyle(4, OUT, 1);
    g.strokeTriangle(6, 44, 48, 8, 90, 44);
    rr(g, 14, 44, 68, 44, 4, 0xfff3e0, 4);
    rr(g, 40, 58, 18, 30, { tl: 6, tr: 6, bl: 0, br: 0 }, 0xb07b4f, 3);
    g.fillStyle(0xbfe7ff, 1);
    g.fillRect(20, 52, 14, 14);
    g.fillRect(64, 52, 14, 14);
  });
  make(scene, 'icon-escola', 96, 96, (g) => {
    rr(g, 8, 16, 80, 56, 6, 0xbf8a5c, 4);
    g.fillStyle(0x2e7d59, 1);
    g.fillRect(16, 24, 64, 40);
    g.lineStyle(3, 0xffffff, 0.9);
    g.lineBetween(24, 38, 52, 38);
    g.lineBetween(24, 50, 64, 50);
    rr(g, 32, 72, 32, 8, 4, 0xa9744b, 3);
  });
  make(scene, 'icon-loja', 96, 96, (g) => {
    rr(g, 18, 30, 60, 54, 8, 0xff7eb6, 4);
    g.lineStyle(6, 0xd95c95, 1);
    g.beginPath();
    g.arc(48, 32, 16, Math.PI, 0, false);
    g.strokePath();
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(36, 52, 5);
    g.fillCircle(60, 52, 5);
  });
  make(scene, 'icon-estudio', 96, 96, (g) => {
    g.fillStyle(0xd7a86e, 1);
    g.fillEllipse(48, 52, 76, 60);
    g.lineStyle(4, OUT, 1);
    g.strokeEllipse(48, 52, 76, 60);
    g.fillStyle(0xfdf6e3, 1);
    g.fillEllipse(62, 62, 22, 18);
    const dots = [
      [32, 38, 0xef5350],
      [50, 32, 0x42a5f5],
      [68, 40, 0x66bb6a],
      [28, 58, 0xffca28],
    ] as const;
    for (const [x, y, c] of dots) {
      g.fillStyle(c, 1);
      g.fillCircle(x, y, 7);
    }
  });
}

/** Gera todas as texturas do jogo (chamado uma vez no BootScene). */
export function generateTextures(scene: Scene): void {
  for (const item of CATALOG) {
    const draw = drawers[item.id];
    if (!draw) {
      // fallback: caixa colorida com o tamanho certo
      make(scene, `item-${item.id}`, item.w, item.h, (g, w, h) => rr(g, 2, 2, w - 4, h - 4, 8, 0xb0bec5));
      continue;
    }
    make(scene, `item-${item.id}`, item.w, item.h, draw);
  }

  make(scene, 'easel', EASEL.w, EASEL.h, (g) => drawEasel(g));

  // pincel da tela de pintura (círculo branco, tingido com a cor escolhida)
  make(scene, 'dot', 32, 32, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 16, 16);
  });

  drawMenuIcons(scene);
}
