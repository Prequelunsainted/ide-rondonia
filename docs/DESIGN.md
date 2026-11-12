# Design: IDE Rondônia (landing page)

Mundo visual: **padrão de portal de dados de governo**, escolhido pelo usuário, executado com capricho. Régua de acabamento: Esri ArcGIS Hub. Fonte de verdade: `site/styles.css`.

## Cores

| Token | Valor | Uso |
|---|---|---|
| `--azul` | `#005b96` | Ações primárias, marcadores de passo, faixa de chamada (azul do cabeçalho da IDE) |
| `--azul-forte` | `#00467a` | Hover das ações |
| `--azul-profundo` | `#0b2a40` | Títulos, rodapé, filtro ativo, dica do mapa |
| `--azul-claro` | `#e7f0f7` | Fundo do topo da página, hover de navegação, ícones de tema |
| `--tinta` / `--tinta-2` / `--tinta-3` | `#13222d` / `#3d505d` / `#5d6f7c` | Texto principal, secundário, metadado |
| `--linha` / `--linha-forte` | `#d9e2e9` / `#c3d0da` | Divisórias e bordas |
| `--fundo-2` | `#f3f6f8` | Seções alternadas e chips |

Rampas coropléticas (5 classes por quantil, claro → escuro):
- População: `#dcecf7 #a6cde9 #62a7d6 #2477b9 #00508a`
- Densidade: `#e0eef2 #acd3de #6fb0c4 #2f87a3 #0e5f7a`
- PIB: `#fbefc6 #f4d57a #e3ae35 #bf820f #8a5604`
- Rebanho: `#fbe2d4 #f3b393 #e47f56 #c4542b #8f3213`

Os ícones de tema usam o tom do grupo: economia (azul), rural (`#8a5d04` sobre `#f6efdc`), território (`#23704a` sobre `#e3f1ea`), saúde (`#a0401b` sobre `#f8e7e0`).

## Tipografia

- **Figtree** (Google Fonts, 400–800) em tudo; números sempre `tabular-nums`.
- H1 `clamp(2.35rem … 4rem)`, peso 750, tracking −0.035em. H2 de seção `clamp(1.9rem … 2.75rem)`. Corpo 17px / 1.6.

## Forma

- Raio 10px (cartões), 6px (botões, campos), 14px (vídeo, mapa, ficha).
- Sombras sempre com deslocamento e desfoque (`--sombra`, `--sombra-alta`).
- Foco: anel duplo branco + azul (`--foco`). Seleção de texto em azul claro.
- Ícones: SVG próprios, traço 1,7–1,8, cantos arredondados, grade 24.

## Componentes

- **Botões:** primário azul, secundário branco com borda azul clara, claro (sobre azul). Altura mínima 48px (40px no topo).
- **Busca com resultados ao vivo** (combobox com setas, Enter e Esc).
- **Catálogo de temas em lista** (não grade de cartões): ícone + pergunta | chips de conteúdo + fonte | ações.
- **Filtros em pílula** com contagem; ativo em azul profundo.
- **Explorador de município:** seletor de indicador (radiogroup), mapa SVG coroplético com varredura oeste → leste ao trocar de indicador, ficha com valores, ranking e fonte.

## Abertura 3D (palco)

- WebGL com three.js 0.160: os 52 municípios viram colunas extrudadas sobre a imagem de satélite Esri alinhada à malha (`assets/satelite-ro-3d.jpg` + `ro-sat.js`). Altura em escala logarítmica e cor por quintil, nas mesmas rampas do explorador.
- Fundo do palco `#08161f`, véu escuro à esquerda para o texto, HUD com legenda e progresso dos capítulos à direita.
- Cartões de capítulo: fundo `rgba(8,22,31,.86)`, borda branca 13%, raio 16px.

## Movimento

- **Momento autoral:** zoom de entrada de cima para a vista inclinada, com as colunas subindo de oeste para leste; depois a rolagem fixa o palco e guia a câmera por três capítulos (população → PIB com zoom em Porto Velho → rebanho), trocando alturas e cores.
- Interação: arrastar gira a câmera (só mouse; no toque a rolagem continua livre), passar o mouse mostra o município, clicar abre a ficha no explorador.
- Apoio (GSAP + ScrollTrigger 3.12.5): títulos sobem girando em X, listas entram em sequência, o cartão do explorador "pousa" em 3D com a rolagem, ícones de tema e cartões dos passos inclinam seguindo o mouse, números contam.
- Curva padrão `cubic-bezier(0.16, 1, 0.3, 1)` / `expo.out`.
- **Movimento reduzido:** sem fixar a rolagem nem animação de entrada; os capítulos ficam visíveis lado a lado e trocam o indicador com um clique. **Sem WebGL:** o palco mostra o vídeo em loop com botão de pausa.

## Versão 3: página toda dinâmica

- **Gráfico 3D "Uma economia que cresce"** (`site/grafico3d.js`): colunas por ano (PIB 2010–2023 ou rebanho 2010–2025, IBGE) que sobem uma a uma com a rolagem e uma **seta 3D** (tubo + cone) que se desenha pelo topo e termina apontando para cima. Hover mostra ano, valor e variação. Fundo da seção `#0b2a40`; selo de variação verde `#86e3b6` (alta) e salmão `#f6b799` (queda).
- **Trilho na margem direita** (`.trilho`): substitui a barra de rolagem em telas com mouse. Preenchimento em gradiente azul que corre, cabeça com pulso enquanto rola, rótulo da seção atual, marcos clicáveis e pista arrastável. No celular vira uma linha fina só de leitura.
- **Filtro de temas:** pílula azul desliza até o filtro ativo; as linhas se reorganizam com GSAP Flip e a lista muda de altura suavemente.
- **Fita de fontes:** nomes das fontes oficiais correndo em letra vazada, pausa ao passar o mouse.
- **Chamada final:** botão magnético; logo da GEODE vira em 3D ao entrar.

## Versão 4: ícones, passos, fontes e fluxo

- **Ícones dos temas** (`site/icones.js`): mini ilustrações SVG 48×48 por assunto (barras de população, globo com rota, prédios acendendo, linha de empregos, broto, boi balançando a orelha, árvore ao vento, gema com brilho, gota com ondas, batimento). Tocam uma vez ao aparecer e de novo ao passar o mouse (classe `.anima`).
- **Passos de "Como usar":** laço de 5 s só enquanto visível. Passo 1: cursor escolhe tema e barras sobem. Passo 2: mapa real de RO, clique em Ji-Paraná, o município sobe em 3D e mostra "124.333 hab.". Passo 3: selo "FONTE · IBGE 2022" carimbado.
- **Fontes:** sem a lista repetida; a faixa em movimento explica cada fonte no hover/toque (lista mantida só para leitores de tela).
- **"Do dado ao mapa"** no lugar de "Quem mantém a IDE": fontes → GEODE · SEDEC → mapa de RO → você, com linhas tracejadas, pontos de luz correndo e municípios acendendo. Sem repetir o logo.

