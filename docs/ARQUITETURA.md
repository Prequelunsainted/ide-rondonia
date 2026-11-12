# Arquitetura

A página é estática: HTML, CSS e JavaScript sem build. Bibliotecas externas vêm de CDN com versão fixa.

## Ordem de carregamento

`site/index.html` carrega, no fim do `<body>`:

1. **GSAP 3.12.5** + **ScrollTrigger** + **Flip** (cdnjs), como scripts clássicos.
2. Dados gerados: `assets/ro-data.js` (`window.RO`), `assets/ro-sat.js` (`window.RO_SAT`),
   `assets/ro-series.js` (`window.RO_SERIES`).
3. `icones.js` (`window.IDE_ICONES`) e `app.js` (script clássico, roda na hora).
4. Um **import map** que aponta `three` para `three@0.160.0` no jsDelivr.
5. `palco3d.js` e `grafico3d.js` como **módulos ES** (rodam depois do HTML pronto).

Como `app.js` roda antes dos módulos, a comunicação entre eles é feita por funções globais:

| Função | Definida em | Usada por | Para quê |
|---|---|---|---|
| `window.IDE_seleciona(id)` | `app.js` | `palco3d.js` | clique num município do 3D abre a ficha no explorador |
| `window.IDE_iniciarVideo()` | `app.js` | `palco3d.js` | sem WebGL, liga o vídeo de reserva |
| `window.__cresceRefaz()` | `grafico3d.js` | botões de série | refaz as colunas e a seta ao trocar PIB/rebanho |

## Módulos

### `palco3d.js`: abertura 3D

- Cena three.js com o **chão de satélite** (`satelite-ro-3d.jpg`, alinhado à malha por `ro-sat.js`) e
  **52 colunas** extrudadas a partir dos caminhos SVG de `ro-data.js` (`THREE.Shape` + `ExtrudeGeometry`).
- Altura em **escala logarítmica** (para Porto Velho não achatar os outros) e cor por **quintil**.
- **Entrada:** a câmera vai de uma vista de cima para a vista inclinada (`est.entrada`), enquanto as colunas
  crescem de oeste para leste (`est.cresce`).
- **Rolagem:** um `ScrollTrigger` fixa o palco por 260% da altura da tela. O progresso (`est.prog`) move a
  câmera entre 4 poses e mistura os indicadores (`est.mix`: 0 população, 1 PIB, 2 rebanho), interpolando
  altura e cor de cada coluna.
- **Interação:** arrasto com mouse gira a câmera; `Raycaster` mostra a dica do município; clique chama
  `IDE_seleciona` e rola até o explorador.
- **Reservas:** sem WebGL → classe `palco--sem3d` e vídeo; movimento reduzido → sem fixar a rolagem,
  capítulos clicáveis lado a lado.

### `grafico3d.js`: "Uma economia que cresce"

- Criado só quando a seção chega a 400 px da tela (`IntersectionObserver`).
- Colunas `BoxGeometry` por ano, altura proporcional ao valor (escala linear a partir de zero).
- **Seta 3D:** `CatmullRomCurve3` passando acima do topo das colunas + `TubeGeometry`; o desenho
  progressivo usa `geometry.setDrawRange` e a ponta (`ConeGeometry`) segue `curve.getPointAt(t)`.
- Rolagem (`ScrollTrigger` com `scrub`) controla o crescimento das colunas e o avanço da seta.
- Os anos e o marcador de valor são elementos HTML posicionados projetando pontos 3D na tela.
- Sem WebGL: colunas em HTML (`.cresce__barras2d`).

### `app.js`

- **Catálogo de temas** gerado a partir do array `TEMAS` (nome, pergunta, itens, fonte, página do painel).
- **Filtro** com pílula deslizante e reorganização via **GSAP Flip**; a altura da lista anima junto.
- **Busca** (combobox acessível) sobre temas e "extras", ignorando acentos.
- **Explorador de município:** mapa SVG coroplético (5 faixas por quantil), seletor de indicador
  (radiogroup), ficha com ranking; contagem animada com valor final garantido por `setTimeout`
  (o `requestAnimationFrame` congela em aba de fundo).
- **Ícones animados:** tocam ao aparecer (`IntersectionObserver`) e ao passar o mouse (classe `.anima`).
- **Passos:** laço de 5 s em CSS, ligado só enquanto o passo está visível (classe `.visivel`).
  O passo 2 desenha a malha real e destaca Ji-Paraná.
- **Faixa de fontes:** hover/toque mostra a descrição em `#fita-info`.
- **Fluxo "Do dado ao mapa":** linhas SVG calculadas a partir da posição dos cartões (horizontal no
  desktop, vertical no celular), pontos de luz via `getPointAtLength` e municípios que acendem.
- **Trilho de rolagem:** barra fixa na margem direita; remede a página quando a altura muda (a área
  fixa do 3D aumenta a página depois do carregamento); pista clicável e arrastável.
- **Animações de apoio** (só sem movimento reduzido): títulos que sobem girando, listas em sequência,
  cartão do explorador que "pousa" em 3D, números que contam, botão magnético.

### `icones.js`

Dez desenhos SVG 48×48. O estado sem animação é o desenho final; as classes `i-sobe`, `i-traca`,
`i-pop`, `i-acende`, `i-folha`, `i-orelha`, `i-copa`, `i-brilho`, `i-onda`, `i-gota` recebem
`@keyframes` em `dinamico.css` quando o contêiner tem `.anima`.

## CSS

| Arquivo | Conteúdo |
|---|---|
| `styles.css` | tokens (`:root`), base, botões, topo, temas, explorador, passos, rodapé, responsivo |
| `palco.css` | abertura 3D: véu, intro, capítulos, HUD, progresso, rótulo, dica; ícones com espessura |
| `dinamico.css` | gráfico 3D, trilho, filtros, fita de fontes, ícones animados, passos, fluxo |

## Testes

Feitos com **puppeteer-core** e o Chrome do sistema em modo headless (WebGL via SwiftShader:
`--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`), em 1440×900 e 390×844:
capturas em vários pontos da rolagem, hover e clique no 3D, arrasto, troca de série do gráfico,
filtro de temas, faixa de fontes e `prefers-reduced-motion: reduce`. Nenhum erro de JavaScript.
