# 🏠 Casa Criativa

Jogo 2D casual de **decoração e design de ambientes** para Android (e navegador).
O jogador customiza seu personagem, decora cenários arrastando móveis, ganha
moedas ao decorar, compra móveis extras na lojinha e — no estúdio de arte —
pinta suas próprias obras. Todo o progresso fica salvo no aparelho.

**Stack:** TypeScript + Phaser 3 + Vite, empacotado como app Android com Capacitor.
Visão lateral estilo "casa de bonecas". Toda a arte atual é gerada por código
(placeholders coloridos), fácil de trocar por sprites depois.

## As 4 fases

| Fase | Destaque |
| --- | --- |
| 🏡 Casa Vitoriana | 2 andares ligados por escada |
| 🏫 Sala de Aula | ambiente escolar lúdico |
| 🛍️ Loja do Shopping | roupas e brinquedos, vitrines |
| 🎨 Estúdio de Arte | cavalete onde o personagem pinta de verdade (desenho com o dedo, salvo no cavalete) |

## Como rodar no navegador (desenvolvimento)

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

Atalhos de desenvolvimento: abra `http://localhost:5173/#casa` (ou `#escola`,
`#loja`, `#estudio`, `#char`, `#arte`) para pular direto para uma cena.

## Como gerar o app Android

Pré-requisitos: Android Studio (com SDK) instalado.

```bash
npm run android:sync   # build web + copia para o projeto android/
npm run android:open   # abre no Android Studio (Run ▶ para instalar no aparelho)
```

Ou direto pela linha de comando (o Capacitor 7 precisa de Java 21 — use o JDK
embutido do Android Studio):

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android && ./gradlew assembleDebug
# APK em android/app/build/outputs/apk/debug/app-debug.apk
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

O app roda travado em paisagem (`sensorLandscape`, definido no
`AndroidManifest.xml`). Nome e id do app ficam em [capacitor.config.ts](capacitor.config.ts).

## Testes

```bash
npm run build                 # typecheck + build
npx vite preview --port 4823  # em um terminal
node scripts/smoke.mjs        # em outro: simula um jogador real no Chrome
```

O teste de fumaça cobre os critérios de aceitação: arrastar/posicionar/remover
itens, ganhar e gastar moedas, persistência após recarregar, pintura no estúdio
e customização do personagem.

## Como funciona (estrutura)

```
src/
  main.ts                  configuração do Phaser (1280x720, escala FIT)
  types.ts                 tipos centrais
  data/
    catalog.ts             catálogo de móveis (dados — adicione itens aqui)
    levels.ts              definição das 4 fases + desenho dos cenários
  core/
    state.ts               estado do jogo + persistência (localStorage) + economia
    textures.ts            texturas dos móveis geradas por código
    charTexture.ts         textura do personagem (pele/cabelo/roupa/acessório)
  objects/
    Character.ts           boneco: anda por waypoints, sobe escada, senta
  scenes/
    BootScene.ts           gera texturas e roteia (suporta #hash de debug)
    MenuScene.ts           seleção de fases
    PlayScene.ts           fase: decoração drag-and-drop + modo brincar + HUD
    CharacterScene.ts      editor de personagem
    ArtScene.ts            ateliê de pintura do estúdio
  ui/
    Hud.ts                 barra superior (moedas, modo, lojinha...)
    ItemPanel.ts           gaveta de inventário (arrastar para decorar)
    ShopPanel.ts           lojinha (overlay)
    widgets.ts             botões, textos flutuantes, emojis
```

### Regras do jogo

- **Modos:** `🛋️ Decorando` (arrastar/mover/espelhar/remover itens) e
  `🧍 Brincando` (tocar para andar; tocar num móvel para interagir — sentar,
  brincar, pintar). Alterna no botão central da HUD.
- **Moedas:** cada item posicionado rende a recompensa do catálogo **uma vez
  por "vaga"** (remover e recolocar o mesmo item não gera moedas de novo).
  Saldo inicial: 120.
- **Inventário:** global (compartilhado entre fases). Remover um item da fase
  devolve ao inventário.
- **Persistência:** tudo (itens por fase, moedas, inventário, personagem e a
  arte pintada) é salvo em `localStorage` a cada mudança.

### Para adicionar um móvel novo

1. Crie a entrada em [src/data/catalog.ts](src/data/catalog.ts) (id, nome,
   tamanho, preço, recompensa, interação opcional).
2. Adicione a função de desenho com o mesmo id em
   [src/core/textures.ts](src/core/textures.ts) — ou nada: sem desenho ele vira
   uma caixa cinza placeholder (útil até a arte ficar pronta).

## Próximos passos sugeridos

- Sons e música (Phaser tem suporte nativo; faltam os assets).
- Trocar os placeholders por sprites desenhados (basta registrar texturas com
  as mesmas chaves `item-<id>` no Boot).
- Mais móveis, mais opções de personagem, objetivos/missões por fase.
- Ícone e splash do app (`npx @capacitor/assets generate`).
