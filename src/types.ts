/** Tipos centrais do jogo. */

export type InteractKind = 'sit' | 'play' | 'draw';

/** Um móvel/objeto do catálogo (definido em dados, fácil de expandir). */
export interface CatalogItem {
  id: string;
  name: string;
  /** tamanho de exibição em px (a textura é gerada nesse tamanho) */
  w: number;
  h: number;
  /** preço na lojinha */
  price: number;
  /** moedas ganhas ao posicionar */
  reward: number;
  /** quantidade no inventário inicial do jogador */
  starter?: number;
  /** interação possível do personagem com o item */
  interact?: InteractKind;
  /** ao sentar: fração da altura do item onde fica o "assento" (0 = centro) */
  seatFrac?: number;
  /** fases onde o item aparece em destaque ('casa' | 'escola' | 'loja' | 'estudio') */
  tags: string[];
}

export interface FloorDef {
  /** linha do chão (y onde os pés do personagem ficam) */
  y: number;
  xMin: number;
  xMax: number;
}

export interface StairsDef {
  bottomX: number;
  topX: number;
  lower: number;
  upper: number;
}

export interface LevelDef {
  id: string;
  name: string;
  subtitle: string;
  /** chave da textura do ícone no menu */
  icon: string;
  floors: FloorDef[];
  stairs?: StairsDef;
  /** área onde itens podem ser posicionados */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** fase com o cavalete de pintura (estúdio de arte) */
  hasArt?: boolean;
}

export interface CharacterConfig {
  skin: number;
  hairStyle: number;
  hairColor: number;
  shirt: number;
  pants: number;
  accessory: number;
}

/** Um item posicionado numa fase (persistido). */
export interface PlacedItemData {
  uid: string;
  itemId: string;
  x: number;
  y: number;
  flip: boolean;
}

export interface LevelSave {
  placed: PlacedItemData[];
  /** maior nº simultâneo de cada item já recompensado (anti-farm de moedas) */
  rewarded: Record<string, number>;
  /** arte criada no estúdio (dataURL png) */
  art?: string;
}

export interface SaveData {
  version: number;
  coins: number;
  inventory: Record<string, number>;
  character: CharacterConfig;
  levels: Record<string, LevelSave>;
}
