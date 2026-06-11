import type { CatalogItem } from '../types';

/**
 * Catálogo de móveis e objetos. Tudo definido em dados:
 * para adicionar um item novo basta criar uma entrada aqui
 * e uma função de desenho em core/textures.ts (ou uma sprite real no futuro).
 */
export const CATALOG: CatalogItem[] = [
  // ----- casa -----
  { id: 'sofa', name: 'Sofá', w: 150, h: 75, price: 60, reward: 12, starter: 1, interact: 'sit', seatFrac: 0.1, tags: ['casa'] },
  { id: 'armchair', name: 'Poltrona', w: 85, h: 75, price: 40, reward: 10, starter: 1, interact: 'sit', seatFrac: 0.08, tags: ['casa'] },
  { id: 'chair', name: 'Cadeira', w: 55, h: 80, price: 20, reward: 6, starter: 2, interact: 'sit', seatFrac: 0, tags: ['casa', 'escola'] },
  { id: 'table', name: 'Mesa', w: 130, h: 75, price: 45, reward: 10, starter: 1, tags: ['casa'] },
  { id: 'coffeetable', name: 'Mesinha', w: 95, h: 50, price: 25, reward: 6, starter: 1, tags: ['casa'] },
  { id: 'bed', name: 'Cama', w: 160, h: 85, price: 80, reward: 15, starter: 1, interact: 'sit', seatFrac: 0.05, tags: ['casa'] },
  { id: 'rug', name: 'Tapete', w: 140, h: 35, price: 25, reward: 6, starter: 2, tags: ['casa', 'escola', 'loja', 'estudio'] },
  { id: 'plant', name: 'Planta', w: 55, h: 85, price: 20, reward: 5, starter: 2, tags: ['casa', 'escola', 'loja', 'estudio'] },
  { id: 'lamp', name: 'Luminária', w: 50, h: 95, price: 25, reward: 6, starter: 2, tags: ['casa', 'estudio'] },
  { id: 'bookshelf', name: 'Estante', w: 95, h: 135, price: 70, reward: 14, starter: 1, tags: ['casa', 'escola'] },
  { id: 'picture', name: 'Quadro', w: 65, h: 75, price: 30, reward: 8, starter: 2, tags: ['casa', 'loja', 'estudio'] },
  { id: 'tv', name: 'TV', w: 95, h: 65, price: 75, reward: 14, tags: ['casa'] },
  { id: 'mirror', name: 'Espelho', w: 55, h: 95, price: 35, reward: 8, tags: ['casa', 'loja'] },
  { id: 'toybox', name: 'Caixa de brinquedos', w: 80, h: 55, price: 35, reward: 8, starter: 1, interact: 'play', tags: ['casa', 'escola', 'loja'] },
  { id: 'teddy', name: 'Ursinho', w: 45, h: 50, price: 18, reward: 5, starter: 1, interact: 'play', tags: ['casa', 'loja'] },

  // ----- escola -----
  { id: 'schooldesk', name: 'Carteira', w: 75, h: 70, price: 30, reward: 8, starter: 2, interact: 'sit', seatFrac: 0.05, tags: ['escola'] },
  { id: 'blackboard', name: 'Lousa', w: 150, h: 95, price: 55, reward: 12, starter: 1, tags: ['escola'] },
  { id: 'teacherdesk', name: 'Mesa da professora', w: 120, h: 75, price: 45, reward: 10, tags: ['escola'] },
  { id: 'globe', name: 'Globo', w: 50, h: 65, price: 25, reward: 6, interact: 'play', tags: ['escola'] },
  { id: 'abc', name: 'Painel ABC', w: 90, h: 65, price: 25, reward: 6, tags: ['escola'] },

  // ----- loja -----
  { id: 'rack', name: 'Arara de roupas', w: 115, h: 95, price: 50, reward: 11, starter: 1, tags: ['loja'] },
  { id: 'shelfunit', name: 'Prateleira', w: 105, h: 125, price: 55, reward: 12, starter: 1, tags: ['loja'] },
  { id: 'mannequin', name: 'Manequim', w: 55, h: 115, price: 40, reward: 9, tags: ['loja'] },
  { id: 'register', name: 'Caixa registradora', w: 80, h: 65, price: 45, reward: 10, tags: ['loja'] },
  { id: 'toyshelf', name: 'Estante de brinquedos', w: 105, h: 125, price: 60, reward: 12, tags: ['loja'] },

  // ----- estúdio -----
  { id: 'paintshelf', name: 'Estante de tintas', w: 100, h: 115, price: 45, reward: 10, starter: 1, tags: ['estudio'] },
  { id: 'sculpture', name: 'Escultura', w: 60, h: 95, price: 40, reward: 9, tags: ['estudio'] },
  { id: 'artdesk', name: 'Mesa de arte', w: 105, h: 70, price: 40, reward: 9, tags: ['estudio'] },
  { id: 'canvasrack', name: 'Telas', w: 80, h: 70, price: 30, reward: 7, tags: ['estudio'] },
];

const byId = new Map(CATALOG.map((i) => [i.id, i]));

export function itemById(id: string): CatalogItem {
  const item = byId.get(id);
  if (!item) throw new Error(`Item desconhecido no catálogo: ${id}`);
  return item;
}

export function itemTexture(id: string): string {
  return `item-${id}`;
}
