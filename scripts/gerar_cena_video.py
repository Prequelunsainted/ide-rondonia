"""Gera compositions/mapa.html (cena única, 12 s em loop) a partir de assets/video-data.json."""
import json, os, sys

V = sys.argv[1]
data = json.load(open(os.path.join(V, 'assets', 'video-data.json'), encoding='utf-8'))
muns = data['muns']
pvh = next(m for m in muns if m['nome'] == 'Porto Velho')
px, py = data['meta']['pvhxy']
# o centróide de Porto Velho cai no meio do município; a sede fica mais ao norte
# usamos o centróide mesmo, com o rótulo à direita

RAMPS = {
    'pop': ['#d9ecf7', '#a3cde9', '#5ea6d6', '#1f78ba', '#00508a'],
    'pib': ['#fbefc6', '#f4d57a', '#e7b23a', '#c78812', '#935c05'],
    'boi': ['#fbe1d2', '#f4b08e', '#e77d53', '#c9522a', '#953214'],
}

paths = '\n'.join(
    f'        <path class="mun" d="{m["d"]}" data-k0="{m["k"][0]}" data-k1="{m["k"][1]}" data-k2="{m["k"][2]}" fill="{RAMPS["pop"][m["k"][0]]}" />'
    for m in muns)

def legend(key, labels):
    rows = '\n'.join(
        f'          <li><i style="background:{c}"></i><span>{l}</span></li>' for c, l in zip(RAMPS[key], labels))
    return rows

LEG = {
    'pop': ['até 6,5 mil', '6,5 a 9,2 mil', '9,2 a 15,9 mil', '15,9 a 30,7 mil', 'mais de 30,7 mil'],
    'pib': ['até R$ 292 mi', 'R$ 292 a 440 mi', 'R$ 440 a 716 mi', 'R$ 716 mi a 1,2 bi', 'mais de R$ 1,2 bi'],
    'boi': ['até 155 mil', '155 a 243 mil', '243 a 325 mil', '325 a 435 mil', 'mais de 435 mil'],
}

html = f'''<template>
  <style>
    @font-face {{
      font-family: "Figtree";
      src: url("assets/fonts/Figtree-var.woff2") format("woff2");
      font-weight: 300 900;
    }}
    #root {{
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: #0b1a22;
      font-family: "Figtree", sans-serif;
      color: #ffffff;
    }}
    #mapa-sat {{
      position: absolute;
      left: 0;
      top: 0;
      width: 1920px;
      height: 1080px;
      object-fit: cover;
    }}
    #mapa-veu {{
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgba(5, 22, 34, 0.92) 0%, rgba(5, 22, 34, 0.78) 26%, rgba(5, 22, 34, 0.2) 48%, rgba(5, 22, 34, 0.32) 100%);
    }}
    #mapa-svg {{
      position: absolute;
      left: 0;
      top: 0;
      width: 1920px;
      height: 1080px;
    }}
    .mun {{
      fill-opacity: 0.72;
      stroke: #ffffff;
      stroke-opacity: 0.75;
      stroke-width: 1.1;
      stroke-linejoin: round;
    }}
    #mapa-pvh-ring {{
      fill: none;
      stroke: #ffffff;
      stroke-width: 2.5;
    }}
    #mapa-pvh-dot {{
      fill: #ffffff;
      stroke: #0b1a22;
      stroke-width: 3;
    }}
    #mapa-painel {{
      z-index: 3;
      position: absolute;
      left: 112px;
      top: 120px;
      width: 640px;
    }}
    .mapa-ind {{
      position: absolute;
      left: 0;
      top: 0;
      width: 640px;
    }}
    .mapa-ind h2 {{
      font-size: 112px;
      font-weight: 750;
      letter-spacing: -0.03em;
      line-height: 1;
    }}
    .mapa-ind p {{
      margin-top: 24px;
      font-size: 40px;
      font-weight: 500;
      line-height: 1.3;
      color: #cfe0ea;
    }}
    .mapa-ind ul {{
      list-style: none;
      margin-top: 60px;
      display: grid;
      gap: 12px;
    }}
    .mapa-ind li {{
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 34px;
      font-weight: 500;
      color: #e8f1f6;
      font-variant-numeric: tabular-nums;
    }}
    .mapa-ind li i {{
      width: 56px;
      height: 32px;
      border-radius: 4px;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
    }}
    #mapa-fonte {{
      position: absolute;
      left: 112px;
      bottom: 84px;
      font-size: 32px;
      font-weight: 500;
      color: #a9c1cf;
    }}
    #mapa-credito {{
      position: absolute;
      right: 40px;
      bottom: 30px;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(5, 22, 34, 0.7);
      font-size: 15px;
      color: #c9d8e1;
    }}
    #mapa-callout {{
      position: absolute;
      left: {px + 30}px;
      top: {py - 62}px;
      padding: 14px 22px 16px;
      border-radius: 10px;
      background: rgba(5, 22, 34, 0.86);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      min-width: 600px;
      z-index: 4;
    }}
    #mapa-callout b {{
      display: block;
      font-size: 32px;
      font-weight: 600;
      color: #a9c1cf;
    }}
    .mapa-val {{
      display: block;
      height: 66px;
      overflow: hidden;
      position: relative;
    }}
    .mapa-val span {{
      position: absolute;
      left: 0;
      top: 2px;
      white-space: nowrap;
      font-size: 52px;
      font-weight: 750;
      letter-spacing: -0.01em;
      font-variant-numeric: tabular-nums;
    }}
  </style>
  <div id="root" data-composition-id="mapa" data-width="1920" data-height="1080">
    <img id="mapa-sat" src="assets/satelite-ro.jpg" alt="" />
    <div id="mapa-veu"></div>
    <svg id="mapa-svg" viewBox="0 0 1920 1080" data-layout-allow-overflow>
      <g id="mapa-muns">
{paths}
      </g>
      <circle id="mapa-pvh-ring" cx="{px}" cy="{py}" r="14" />
      <circle id="mapa-pvh-dot" cx="{px}" cy="{py}" r="10" />
    </svg>

    <div id="mapa-painel" data-layout-allow-overlap>
      <div class="mapa-ind" id="mapa-ind-pop">
        <h2>População</h2>
        <p>Pessoas por município, Censo 2022</p>
        <ul>
{legend('pop', LEG['pop'])}
        </ul>
      </div>
      <div class="mapa-ind" id="mapa-ind-pib">
        <h2>PIB</h2>
        <p>Produto Interno Bruto por município, 2023</p>
        <ul>
{legend('pib', LEG['pib'])}
        </ul>
      </div>
      <div class="mapa-ind" id="mapa-ind-boi">
        <h2>Rebanho</h2>
        <p>Bovinos por município, 2025</p>
        <ul>
{legend('boi', LEG['boi'])}
        </ul>
      </div>
    </div>

    <div id="mapa-callout" data-layout-allow-overflow>
      <b>Porto Velho</b>
      <div class="mapa-val">
        <span id="mapa-v-pop">460.434 habitantes</span>
        <span id="mapa-v-pib">R$ 25,4 bilhões</span>
        <span id="mapa-v-boi">1,68 milhão de cabeças</span>
      </div>
    </div>

    <div id="mapa-fonte">Fonte: IBGE · 52 municípios de Rondônia</div>
    <div id="mapa-credito" data-layout-ignore>Imagem: Esri, Maxar, Earthstar Geographics</div>
  </div>
  <script>
    const RAMPS = {json.dumps([RAMPS['pop'], RAMPS['pib'], RAMPS['boi']])};
    const IND = ["pop", "pib", "boi"];
    const tl = gsap.timeline({{ paused: true }});
    const muns = gsap.utils.toArray("#mapa-muns .mun");
    // ordem da varredura: oeste para leste, pelo início do path
    const xOf = (el) => parseFloat(el.getAttribute("d").slice(1));
    const minX = Math.min(...muns.map(xOf));
    const maxX = Math.max(...muns.map(xOf));
    const delayOf = (el) => ((xOf(el) - minX) / (maxX - minX)) * 0.7;

    // estado inicial (= estado final, para o loop fechar sem salto)
    gsap.set(".mapa-ind", {{ opacity: 0, y: 24 }});
    gsap.set("#mapa-ind-pop", {{ opacity: 1, y: 0 }});
    gsap.set(".mapa-val span", {{ yPercent: 110, opacity: 0 }});
    gsap.set("#mapa-v-pop", {{ yPercent: 0, opacity: 1 }});
    tl.set(".mapa-ind", {{ opacity: 0, y: 24 }}, 0);
    tl.set("#mapa-ind-pop", {{ opacity: 1, y: 0 }}, 0);
    tl.set(".mapa-val span", {{ yPercent: 110, opacity: 0 }}, 0);
    tl.set("#mapa-v-pop", {{ yPercent: 0, opacity: 1 }}, 0);

    // pulso do ponto de Porto Velho, um por indicador
    [0.4, 3.6, 6.8, 9.8].forEach((t) => {{
      tl.fromTo("#mapa-pvh-ring", {{ attr: {{ r: 12 }}, opacity: 0.9 }}, {{ attr: {{ r: 46 }}, opacity: 0, duration: 1.6, ease: "power2.out", immediateRender: false }}, t);
    }});

    function troca(de, para, t) {{
      muns.forEach((el) => {{
        const k = +el.dataset["k" + para];
        tl.to(el, {{ fill: RAMPS[para][k], duration: 0.6, ease: "power2.inOut" }}, t + delayOf(el));
      }});
      tl.to("#mapa-ind-" + IND[de], {{ opacity: 0, y: -24, duration: 0.4, ease: "power2.in" }}, t);
      tl.fromTo("#mapa-ind-" + IND[para], {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.7, ease: "expo.out", immediateRender: false }}, t + 0.45);
      tl.to("#mapa-v-" + IND[de], {{ yPercent: -110, opacity: 0, duration: 0.4, ease: "power2.in" }}, t + 0.2);
      tl.fromTo("#mapa-v-" + IND[para], {{ yPercent: 110, opacity: 0 }}, {{ yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out", immediateRender: false }}, t + 0.6);
    }}

    troca(0, 1, 3.0);
    troca(1, 2, 6.2);
    troca(2, 0, 9.2);
    tl.set({{}}, {{}}, 12);

    window.__timelines["mapa"] = tl;
  </script>
</template>
'''
open(os.path.join(V, 'compositions', 'mapa.html'), 'w', encoding='utf-8').write(html)
print('ok', len(html))
