# Dados

Todos os números da página vêm de fontes públicas. As respostas brutas da API do IBGE usadas no build
estão em `dados/ibge/` (baixadas em 12/11/2026).

## API do IBGE (sem chave)

Rondônia tem código **11**. `N6[N3[11]]` pede todos os municípios do estado; `N3[11]` pede o estado.

| Arquivo | Conteúdo | Endpoint |
|---|---|---|
| `mun.geojson` | malha dos 52 municípios | `/api/v3/malhas/estados/11?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=municipio` |
| `nomes.json` | nomes e códigos | `/api/v1/localidades/estados/11/municipios` |
| `pop.json` | população, Censo 2022 | `/api/v3/agregados/4709/periodos/2022/variaveis/93?localidades=N6[N3[11]]` |
| `pib.json` | PIB 2023, mil R$ | `/api/v3/agregados/5938/periodos/-1/variaveis/37?localidades=N6[N3[11]]` |
| `boi.json` | bovinos 2025, cabeças | `/api/v3/agregados/3939/periodos/-1/variaveis/105?localidades=N6[N3[11]]&classificacao=79[2670]` |
| `area.json` | área, km² | `/api/v3/agregados/4714/periodos/2022/variaveis/6318?localidades=N6[N3[11]]` |
| `pib-serie.json` | PIB do estado 2010–2023 | `/api/v3/agregados/5938/periodos/2010-2023/variaveis/37?localidades=N3[11]` |
| `boi-serie.json` | bovinos do estado 2010–2025 | `/api/v3/agregados/3939/periodos/2010-2025/variaveis/105?localidades=N3[11]&classificacao=79[2670]` |

Base: `https://servicodados.ibge.gov.br`. No `curl`, use `-g` (os colchetes viram glob).
`periodos/-1` traz o último ano disponível: confira o ano no JSON.

## Processamento

### `scripts/gerar_ro_data.py` → `site/assets/ro-data.js`

- Projeção equiretangular com correção do cosseno na latitude média (−10,9°), escalada para 1000 px de largura.
- Simplificação Douglas-Peucker (tolerância 0,9 px). O anel fechado é dividido em duas metades antes,
  porque o primeiro ponto é igual ao último e o algoritmo colapsaria o anel.
- Cada município leva: código, nome, caminho SVG `d`, centróide aproximado `c`, `pop`, `pib` (mil R$),
  `boi`, `area`. A meta traz anos, totais e a posição da sede de Porto Velho.

### `scripts/gerar_series.py` → `site/assets/ro-series.js`

PIB convertido de mil reais para reais; rebanho em cabeças.

### `scripts/gerar_satelite_3d.py` → `satelite-ro-3d.jpg` + `ro-sat.js`

Exporta a imagem Esri World Imagery em lon/lat (EPSG:4326) cobrindo RO com margem e grava os limites
da imagem nas mesmas coordenadas de `ro-data.js`, para o chão do 3D casar com a malha.

### Vídeo: `gerar_dados_video.py` e `gerar_cena_video.py`

Projeção Web Mercator no quadro 1920×1080, classes por quantil (5 faixas) para população, PIB e rebanho,
imagem Esri exportada no mesmo enquadramento, e a cena HyperFrames gerada com os caminhos embutidos.

## Como os valores aparecem

| Onde | Regra |
|---|---|
| Cores dos mapas | 5 faixas com o mesmo número de municípios (quantis) |
| Altura das colunas do mapa 3D | escala logarítmica entre o menor e o maior valor |
| Altura das colunas do gráfico 3D | proporcional ao valor (linear, a partir de zero) |
| Densidade | população 2022 ÷ área 2022 |
| Ranking | posição entre os 52 municípios, do maior para o menor |

## Números citados no texto (conferidos em 12/11/2026)

- População de RO em 2022: **1.581.196**; Porto Velho: **460.434** (29%).
- PIB de RO: **R$ 23,9 bi** (2010) → **R$ 76,5 bi** (2023), +220%, a preços correntes; Porto Velho: R$ 25,4 bi (33%).
- Rebanho bovino: **11,8 mi** (2010) → **17,1 mi** (2025), +44%; pico de **18,2 mi** em 2024.
- Exemplo do passo 2: Ji-Paraná, **124.333** habitantes (Censo 2022).

## Conteúdo da IDE

Os 10 temas, as visões e os links dos painéis vieram do `config.json` público do app ArcGIS Experience
Builder (`https://geo.sedec.ro.gov.br/cdn/1/config.json`): 42 dashboards, 2 visualizadores 3D e 24 mapas web.
Os botões "Ver no mapa" abrem a visão do mapa de cada tema na própria IDE com o parâmetro `views` do
Experience Builder (ex.: `https://geo.sedec.ro.gov.br/?views=view_45` para Econômico-social). Os códigos
ficam no campo `mapa` de cada tema em `site/app.js`:

| Tema | Visão do mapa |
|---|---|
| Econômico-social | `view_45` |
| Comércio exterior | `view_51` |
| Empresas | `view_66` |
| Empregos | `view_76` |
| Agricultura | `view_99` |
| Pecuária | `view_157` |
| Áreas protegidas | `view_168` |
| Recursos minerais | `view_179` |
| Geoambiental | `view_170` |
| Saúde | `view_191` |

Os botões "Abrir painel" usam o formato
`https://geointeligencia.ro.gov.br/portal/apps/experiencebuilder/experience/?id=728e3f3abe054a79bd43b595002a112a&page=<Tema>`.
