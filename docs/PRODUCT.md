# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and JavaScript, no build step (user's choice, 2026-11-12). Video made with HyperFrames and shipped as MP4.

## Users

Público geral de Rondônia e de fora: cidadãos curiosos sobre o próprio município, jornalistas, pesquisadores e estudantes. Chegam pelo celular ou pelo computador, sem formação em GIS, querendo uma resposta concreta ("quantas empresas abriram em Ji-Paraná?", "onde ficam as terras indígenas?").

## Product Purpose

A landing page apresenta a **Infraestrutura de Dados Espaciais (IDE)** da SEDEC-RO, em https://geo.sedec.ro.gov.br/. Explica o que é, mostra o que dá para descobrir nela e leva a pessoa direto ao mapa ou painel do tema que a interessa. Sucesso: o visitante entende em segundos que a IDE é pública e gratuita e abre um tema.

## Positioning

Os dados econômicos, sociais e ambientais de Rondônia, de várias fontes oficiais, reunidos num só lugar e **lidos no mapa, por município**. Nenhum outro portal junta comércio exterior, empregos, empresas, produção rural, áreas protegidas e saúde de RO na mesma base espacial.

## Operating Context

- A IDE é um app do ArcGIS Experience Builder; os painéis são ArcGIS Dashboards e mapas 3D hospedados no portal `geointeligencia.ro.gov.br/portal`.
- Cada tema oferece **Mapa** (mapa interativo na IDE) e **Painel** (dashboard com gráficos).
- Mantida pela **GEODE (GEO Inteligência de Dados Econômicos)**, núcleo da SEDEC (Secretaria de Estado do Desenvolvimento Econômico de Rondônia).

## Capabilities and Constraints

Temas (com links reais em `content.md`): Econômico-Social, Comércio Exterior, Empresas, Empregos, Agricultura, Pecuária, Áreas Protegidas, Recursos Minerais, Geoambiental, Saúde. Visões extras: Infraestrutura (energia, água, saneamento), Segurança, Educação, Imagens (uso e cobertura do solo, Wayback) e programas da SEDEC (PROAMPE, SISPAR Terceiro Setor, CONSIC, HUB de Inovação).

Fontes citadas no próprio site: IBGE (Censo 2022, PIB, PAM, PPM, aquicultura), IDH, Índice FIRJAN, GINI, comércio exterior (exportação e importação por município), JUCER e Governo Federal (empresas ativas, abertura e fechamento), Novo CAGED, CAGED 2019, SINE-RO 2023, PNADC, IDARON (GTAs, abate), SNIS 2024 (água e esgoto), CNES 2026 (saúde).

Undecided: números agregados (total de camadas, data de atualização). Não inventar.

## Brand Commitments

- Logo da GEODE: globo preto com "GEO / INTELIGÊNCIA / DE DADOS ECONÔMICOS" (arquivo `assets/geologo.png`).
- A IDE usa azul institucional `#005b96` no cabeçalho.
- Esta landing page **não é o site oficial**; não usar brasão nem identidade do Governo de RO como se fosse.
- **Padrão da categoria, por escolha do usuário (2026-11-12):** portal de dados de governo executado com capricho total, sem ironia nem enfeite. Régua de acabamento: **Esri ArcGIS Hub** (busca, temas, mapas embutidos).

## Evidence on Hand

- Estrutura completa da IDE extraída do `config.json` público (temas, visões, fontes, links dos painéis).
- Malha oficial de Rondônia (IBGE) já projetada em SVG.
- Ausente: depoimentos, números de acesso, prêmios. Não fabricar.

## Product Principles

1. Pergunta antes de ferramenta: falar do que se descobre, não de "camadas" e "web maps".
2. Todo tema leva a um link real da IDE.
3. Citar a fonte de cada dado, como o próprio site faz.
4. Rondônia, por município, é o protagonista visual.

## Accessibility & Inclusion

WCAG 2.2 AA. Público amplo e muitos no celular: textos legíveis, alvos de toque grandes, vídeo sem som e com `prefers-reduced-motion` respeitado.
