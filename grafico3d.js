/* Gráfico 3D de crescimento: colunas por ano (IBGE) e uma seta 3D que sobe pelo topo delas. */
import * as THREE from "three";

const SER = window.RO_SERIES;
const gsap = window.gsap;
const ST = window.ScrollTrigger;
const secao = document.getElementById("crescimento");
const canvas = document.getElementById("cresce-canvas");
const caixa = canvas.parentElement;
const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const nf = (v, d = 1) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v) => (v >= 0 ? "+" : "−") + nf(Math.abs(v), Math.abs(v) < 10 ? 1 : 0) + "%";

const SERIES = {
  pib: {
    dados: SER ? SER.pib : [],
    ramp: ["#f4d57a", "#e3ae35", "#bf820f"],
    fmt: (v) => "R$ " + nf(v / 1e9) + " bilhões",
    curto: (v) => "R$ " + nf(v / 1e9) + " bi",
    frase: "O PIB de Rondônia mais que triplicou entre 2010 e 2023: de <strong>R$ 23,9 bilhões</strong> para <strong>R$ 76,5 bilhões</strong>.",
    nota: "Valores a preços correntes, sem descontar a inflação. Fonte: IBGE, PIB dos Municípios.",
  },
  boi: {
    dados: SER ? SER.boi : [],
    ramp: ["#f3b393", "#e47f56", "#c4542b"],
    fmt: (v) => nf(v / 1e6) + " milhões de cabeças",
    curto: (v) => nf(v / 1e6) + " mi",
    frase: "O rebanho bovino foi de <strong>11,8 milhões</strong> de cabeças em 2010 a <strong>17,1 milhões</strong> em 2025, com pico de 18,2 milhões em 2024.",
    nota: "Efetivo de bovinos em 31 de dezembro de cada ano. Fonte: IBGE, Pesquisa da Pecuária Municipal.",
  },
};

const elAno = document.getElementById("leitura-ano");
const elValor = document.getElementById("leitura-valor");
const elVar = document.getElementById("leitura-var");
const elFrase = document.getElementById("cresce-frase");
const elNota = document.getElementById("cresce-nota");
const elAnos = document.getElementById("cresce-anos");
const elMarca = document.getElementById("cresce-marca");
const tabela = document.getElementById("cresce-tabela");
const botoes = [...secao.querySelectorAll(".cresce__series button")];
let serieAtual = "pib";

function leitura(i) {
  const s = SERIES[serieAtual];
  const d = s.dados;
  const [ano, v] = d[i];
  elAno.textContent = ano;
  elValor.textContent = s.fmt(v);
  if (i === d.length - 1) elVar.textContent = pct((v / d[0][1] - 1) * 100) + " desde " + d[0][0];
  else if (i === 0) elVar.textContent = "ano inicial da série";
  else elVar.textContent = pct((v / d[i - 1][1] - 1) * 100) + " sobre " + d[i - 1][0];
  elVar.dataset.sinal = i > 0 && v < d[i - 1][1] && i !== d.length - 1 ? "neg" : "pos";
}
function textos() {
  const s = SERIES[serieAtual];
  elFrase.innerHTML = s.frase;
  elNota.textContent = s.nota;
  tabela.innerHTML = `<caption>${serieAtual === "pib" ? "PIB de Rondônia por ano" : "Rebanho bovino de Rondônia por ano"}</caption>` +
    `<tr><th scope="col">Ano</th><th scope="col">Valor</th></tr>` +
    s.dados.map(([a, v]) => `<tr><td>${a}</td><td>${s.fmt(v)}</td></tr>`).join("");
  leitura(s.dados.length - 1);
}

function temWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) {
    return false;
  }
}

function trocaSerie(nome, aoTrocar) {
  serieAtual = nome;
  botoes.forEach((b) => {
    const on = b.dataset.serie === nome;
    b.setAttribute("aria-checked", String(on));
    b.tabIndex = on ? 0 : -1;
  });
  textos();
  if (aoTrocar) aoTrocar();
}
botoes.forEach((b, i) => {
  b.addEventListener("click", () => trocaSerie(b.dataset.serie, window.__cresceRefaz));
  b.addEventListener("keydown", (e) => {
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const o = botoes[(i + 1) % botoes.length];
      o.focus();
      o.click();
    }
  });
});

if (!SER) {
  secao.hidden = true;
} else {
  textos();
  if (!temWebGL()) barras2D();
  else {
    // só cria o WebGL quando a seção chega perto da tela
    const io = new IntersectionObserver((ents) => {
      if (ents[0].isIntersecting) { io.disconnect(); try { iniciar(); } catch (e) { console.error(e); barras2D(); } }
    }, { rootMargin: "400px 0px" });
    io.observe(secao);
  }
}

/* Reserva sem WebGL: colunas em HTML */
function barras2D() {
  secao.classList.add("cresce--sem3d");
  const desenha = () => {
    const d = SERIES[serieAtual].dados;
    const max = Math.max(...d.map((x) => x[1]));
    caixa.querySelector(".cresce__barras2d")?.remove();
    const wrap = document.createElement("div");
    wrap.className = "cresce__barras2d";
    wrap.innerHTML = d.map(([a, v], i) =>
      `<button type="button" style="--h:${(v / max) * 100}%;--c:${SERIES[serieAtual].ramp[1]}" data-i="${i}" aria-label="${a}: ${SERIES[serieAtual].fmt(v)}"><span>${String(a).slice(2)}</span></button>`).join("");
    wrap.addEventListener("pointerover", (e) => { const b = e.target.closest("button"); if (b) leitura(+b.dataset.i); });
    wrap.addEventListener("focusin", (e) => { const b = e.target.closest("button"); if (b) leitura(+b.dataset.i); });
    caixa.appendChild(wrap);
  };
  window.__cresceRefaz = desenha;
  desenha();
}

function iniciar() {
  secao.classList.add("cresce--3d");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  cena.add(new THREE.HemisphereLight(0xe6f2ff, 0x0b2a40, 1.3));
  const sol = new THREE.DirectionalLight(0xffffff, 2.3);
  sol.position.set(5, 10, 7);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  Object.assign(sol.shadow.camera, { left: -9, right: 9, top: 8, bottom: -3, near: 1, far: 30 });
  sol.shadow.bias = -0.0005;
  cena.add(sol);
  const contra = new THREE.DirectionalLight(0x9fd0ff, 0.8);
  contra.position.set(-6, 4, -6);
  cena.add(contra);

  const chao = new THREE.Mesh(
    new THREE.CircleGeometry(11, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f3653, roughness: 0.95, metalness: 0 })
  );
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  cena.add(chao);
  const grade = new THREE.GridHelper(20, 26, 0x2d5674, 0x1b4462);
  grade.position.y = 0.002;
  grade.material.transparent = true;
  grade.material.opacity = 0.45;
  cena.add(grade);

  const ESP = 0.78;
  const HMAX = 3.4;
  let colunas = [];
  let seta = null;
  let cabeca = null;
  let curva = null;
  let grupo = new THREE.Group();
  cena.add(grupo);
  const est = { cresce: reduz ? 1 : 0, seta: reduz ? 1 : 0 };
  let animando = false;

  const caixaGeo = new THREE.BoxGeometry(0.52, 1, 0.52);
  caixaGeo.translate(0, 0.5, 0);

  function monta() {
    cena.remove(grupo);
    grupo.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry && o.geometry !== caixaGeo) o.geometry.dispose(); });
    grupo = new THREE.Group();
    cena.add(grupo);
    const s = SERIES[serieAtual];
    const d = s.dados;
    const n = d.length;
    const max = Math.max(...d.map((x) => x[1]));
    const c0 = new THREE.Color(s.ramp[0]);
    const c1 = new THREE.Color(s.ramp[2]);
    colunas = d.map(([ano, v], i) => {
      const mat = new THREE.MeshStandardMaterial({ color: c0.clone().lerp(c1, i / (n - 1)), roughness: 0.45, metalness: 0.08 });
      const m = new THREE.Mesh(caixaGeo, mat);
      m.position.x = (i - (n - 1) / 2) * ESP;
      m.castShadow = m.receiveShadow = true;
      m.userData = { i, h: (v / max) * HMAX, ano, v };
      m.scale.y = 0.001;
      grupo.add(m);
      return m;
    });
    // seta: curva suave que passa logo acima do topo das colunas e termina apontando para cima
    const pts = [];
    const x0 = colunas[0].position.x;
    pts.push(new THREE.Vector3(x0 - 0.6, colunas[0].userData.h * 0.75, 0.45));
    colunas.forEach((c) => pts.push(new THREE.Vector3(c.position.x, c.userData.h + 0.42, 0.45)));
    const ult = colunas[n - 1];
    pts.push(new THREE.Vector3(ult.position.x + 0.55, ult.userData.h + 1.05, 0.45));
    pts.push(new THREE.Vector3(ult.position.x + 0.8, ult.userData.h + 1.85, 0.45));
    curva = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
    const matSeta = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x9fd0ff, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.1 });
    seta = new THREE.Mesh(new THREE.TubeGeometry(curva, 300, 0.075, 14, false), matSeta);
    seta.castShadow = true;
    grupo.add(seta);
    const coneGeo = new THREE.ConeGeometry(0.22, 0.5, 24);
    coneGeo.translate(0, 0.2, 0);
    cabeca = new THREE.Mesh(coneGeo, matSeta);
    cabeca.castShadow = true;
    grupo.add(cabeca);
    anos();
  }

  /* Anos sob as colunas (DOM projetado) */
  function anos() {
    const d = SERIES[serieAtual].dados;
    elAnos.innerHTML = d.map(([a], i) => `<span data-i="${i}" class="${i === d.length - 1 || (i % 3 === 0 && d.length - 1 - i >= 2) ? "" : "par"}">${a}</span>`).join("");
  }

  /* Câmera e tamanho */
  let W = 1, H = 1;
  function redimensiona() {
    W = caixa.clientWidth;
    H = caixa.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = W < 600 ? 40 : 30;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(redimensiona).observe(caixa);
  redimensiona();
  const mouse = { x: 0, y: 0, ax: 0, ay: 0 };

  /* Interação */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let foco = -1;
  function realca(i) {
    if (foco === i) return;
    colunas.forEach((c, j) => c.material.emissive.setHex(j === i ? 0x3a3020 : 0x000000));
    foco = i;
    leitura(i < 0 ? colunas.length - 1 : i);
    elAnos.querySelectorAll("span").forEach((s, j) => s.classList.toggle("ativo", j === i));
    elMarca.hidden = i < 0;
  }
  function aponta(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    mouse.x = ndc.x;
    mouse.y = ndc.y;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(colunas, false)[0];
    realca(hit ? hit.object.userData.i : -1);
    canvas.style.cursor = hit ? "pointer" : "default";
  }
  canvas.addEventListener("pointermove", aponta);
  canvas.addEventListener("pointerdown", aponta);
  canvas.addEventListener("pointerleave", () => { realca(-1); mouse.x = mouse.y = 0; });

  /* Rolagem: colunas sobem uma a uma, a seta se desenha atrás */
  let st = null;
  if (!reduz && ST) {
    gsap.registerPlugin(ST);
    st = ST.create({
      trigger: secao,
      start: "top 78%",
      end: "center 50%",
      scrub: 0.8,
      onUpdate: (self) => {
        if (animando) return;
        est.cresce = self.progress;
        est.seta = Math.min(1, Math.max(0, (self.progress - 0.2) / 0.8));
      },
    });
  }

  window.__cresceRefaz = () => {
    monta();
    realca(-1);
    if (reduz) { est.cresce = est.seta = 1; return; }
    animando = true;
    gsap.fromTo(est, { cresce: 0, seta: 0 }, {
      cresce: 1, seta: 1, duration: 2, ease: "power2.inOut",
      onComplete: () => { animando = false; if (st) st.update(); },
    });
  };
  monta();

  /* Laço */
  let visivel = false;
  new IntersectionObserver((ents) => { visivel = ents[0].isIntersecting; }, { threshold: 0 }).observe(caixa);
  const alvo = new THREE.Vector3(0.35, 2.35, 0);
  const tmp = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let tempo = 0;
  function quadro(t) {
    requestAnimationFrame(quadro);
    if (!visivel) return;
    tempo = t / 1000;
    const n = colunas.length;
    colunas.forEach((c, i) => {
      const g = Math.min(1, Math.max(0, (est.cresce * (n + 4) - i) / 4));
      const ge = 1 - Math.pow(1 - g, 3);
      c.scale.y = Math.max(0.001, c.userData.h * ge);
    });
    // seta: recorte do tubo e cabeça na ponta
    const ts = Math.max(0.002, est.seta);
    const total = seta.geometry.index.count;
    const porSeg = 14 * 6;
    seta.geometry.setDrawRange(0, Math.floor((total / porSeg) * ts) * porSeg);
    const p = curva.getPointAt(ts);
    const tg = curva.getTangentAt(ts);
    cabeca.position.copy(p);
    cabeca.quaternion.setFromUnitVectors(up, tg);
    const pulso = reduz ? 1 : 1 + Math.sin(tempo * 3) * 0.06 * (est.seta >= 1 ? 1 : 0);
    cabeca.scale.setScalar((est.seta > 0.01 ? 1 : 0) * pulso);
    seta.visible = est.seta > 0.01;

    // câmera com leve paralaxe e respiração
    mouse.ax += (mouse.x - mouse.ax) * 0.05;
    mouse.ay += (mouse.y - mouse.ay) * 0.05;
    const az = -0.2 + mouse.ax * 0.2 + (reduz ? 0 : Math.sin(tempo * 0.25) * 0.05);
    const pol = 1.2 - mouse.ay * 0.1;
    const dist = (W < 600 ? 17 : 17.5) * Math.max(1, 1.3 / (W / H));
    camera.position.set(alvo.x + dist * Math.sin(pol) * Math.sin(az), alvo.y + dist * Math.cos(pol), dist * Math.sin(pol) * Math.cos(az));
    camera.lookAt(alvo);

    // anos e marcador projetados
    const spans = elAnos.children;
    colunas.forEach((c, i) => {
      tmp.set(c.position.x, 0, 0.5).project(camera);
      const s = spans[i];
      if (s) s.style.transform = `translate(${((tmp.x + 1) / 2) * W}px, ${((1 - tmp.y) / 2) * H + 10}px) translateX(-50%)`;
    });
    if (foco >= 0) {
      const c = colunas[foco];
      tmp.set(c.position.x, c.scale.y + 0.15, 0).project(camera);
      elMarca.textContent = `${c.userData.ano} · ${SERIES[serieAtual].curto(c.userData.v)}`;
      elMarca.style.transform = `translate(${((tmp.x + 1) / 2) * W}px, ${((1 - tmp.y) / 2) * H}px) translate(-50%, -100%)`;
    }
    renderer.render(cena, camera);
  }
  requestAnimationFrame(quadro);
}
