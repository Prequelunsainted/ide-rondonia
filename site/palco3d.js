/* Palco 3D: os 52 municípios de Rondônia como colunas sobre a imagem de satélite.
   Zoom de entrada, capítulos guiados pela rolagem, giro com o mouse e clique no município. */
import * as THREE from "three";

const RO = window.RO;
const SAT = window.RO_SAT;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const palco = document.querySelector(".palco");
const fixo = palco.querySelector(".palco__fixo");
const canvas = document.getElementById("palco-canvas");
const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function temWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

if (!RO || !SAT || !gsap || !temWebGL()) {
  palco.classList.add("palco--sem3d");
  if (window.IDE_iniciarVideo) window.IDE_iniciarVideo();
} else {
  try {
    iniciar();
  } catch (e) {
    console.error(e);
    palco.classList.remove("palco--3d", "palco--pin");
    palco.classList.add("palco--sem3d");
    if (window.IDE_iniciarVideo) window.IDE_iniciarVideo();
  }
}

function iniciar() {
  palco.classList.add("palco--3d");
  let sujo = true; // força um novo desenho (textura carregada, tamanho mudou, voltou à tela)

  /* ---------- Dados e escalas ---------- */
  const S = 0.01;
  const CX = RO.meta.w / 2;
  const CY = RO.meta.h / 2;
  const wx = (x) => (x - CX) * S;
  const wz = (y) => (y - CY) * S;

  const IND = [
    { nome: "População", ramp: ["#dcecf7", "#a6cde9", "#62a7d6", "#2477b9", "#00508a"], v: (m) => m.pop, fmt: (v) => Math.round(v).toLocaleString("pt-BR") + " habitantes" },
    { nome: "PIB", ramp: ["#fbefc6", "#f4d57a", "#e3ae35", "#bf820f", "#8a5604"], v: (m) => m.pib * 1000, fmt: (v) => (v >= 1e9 ? "R$ " + (v / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " bilhões" : "R$ " + Math.round(v / 1e6).toLocaleString("pt-BR") + " milhões") },
    { nome: "Rebanho bovino", ramp: ["#fbe2d4", "#f3b393", "#e47f56", "#c4542b", "#8f3213"], v: (m) => m.boi, fmt: (v) => (v >= 1e6 ? (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + (v < 2e6 ? " milhão" : " milhões") + " de cabeças" : Math.round(v / 1000).toLocaleString("pt-BR") + " mil cabeças") },
  ];
  IND.forEach((ind) => {
    const vals = RO.muns.map(ind.v).sort((a, b) => a - b);
    ind.cortes = [1, 2, 3, 4].map((i) => vals[Math.floor((vals.length * i) / 5)]);
    ind.lmin = Math.log(vals[0]);
    ind.lmax = Math.log(vals[vals.length - 1]);
    ind.cores = ind.ramp.map((c) => new THREE.Color(c));
  });
  const classe = (ind, v) => ind.cortes.reduce((k, c) => k + (v >= c ? 1 : 0), 0);
  // altura em escala logarítmica: Porto Velho não achata os demais
  const altura = (ind, v) => 0.05 + ((Math.log(v) - ind.lmin) / (ind.lmax - ind.lmin)) * 1.15;

  /* ---------- Renderizador, cena, luz ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const leve = window.innerWidth < 720 || (navigator.hardwareConcurrency || 8) <= 4;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, leve ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const FUNDO = new THREE.Color("#08161f");
  const cena = new THREE.Scene();
  cena.background = FUNDO;
  cena.fog = new THREE.Fog(FUNDO, 20, 36);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);

  cena.add(new THREE.HemisphereLight(0xe8f3ff, 0x223322, 1.25));
  const sol = new THREE.DirectionalLight(0xfff4e6, 2.4);
  sol.position.set(-4.5, 9, 5);
  sol.castShadow = true;
  sol.shadow.mapSize.set(leve ? 1024 : 2048, leve ? 1024 : 2048);
  Object.assign(sol.shadow.camera, { left: -7.5, right: 7.5, top: 7.5, bottom: -7.5, near: 1, far: 30 });
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  cena.add(sol);

  /* Chão: satélite real, alinhado à malha */
  const textura = new THREE.TextureLoader().load("assets/satelite-ro-3d.jpg", () => {
    pronto.textura = true;
    sujo = true;
    revela();
  });
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry((SAT.x1 - SAT.x0) * S, (SAT.y1 - SAT.y0) * S),
    new THREE.MeshStandardMaterial({ map: textura, roughness: 1, metalness: 0, color: 0x9fb0aa })
  );
  chao.rotation.x = -Math.PI / 2;
  chao.position.set(wx((SAT.x0 + SAT.x1) / 2), 0, wz((SAT.y0 + SAT.y1) / 2));
  chao.receiveShadow = true;
  cena.add(chao);

  /* Colunas dos municípios */
  function formas(d) {
    return d.split("M").filter(Boolean).map((seg) => {
      const pts = seg.replace("Z", "").split("L").map((p) => p.trim().split(/\s+/).map(Number));
      const forma = new THREE.Shape();
      pts.forEach(([x, y], i) => (i ? forma.lineTo(wx(x), -wz(y)) : forma.moveTo(wx(x), -wz(y))));
      return forma;
    });
  }
  const linhaMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  const minX = Math.min(...RO.muns.map((m) => m.c[0]));
  const maxX = Math.max(...RO.muns.map((m) => m.c[0]));
  const colunas = RO.muns.map((m) => {
    const geo = new THREE.ExtrudeGeometry(formas(m.d), { depth: 1, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05, emissive: 0x000000 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 0.003;
    // contorno só no topo da coluna (a escala em y leva a linha junto)
    formas(m.d).forEach((f) => {
      const pts = f.getPoints().map((p) => new THREE.Vector3(p.x, 1.001, -p.y));
      mesh.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), linhaMat));
    });
    const centro = new THREE.Vector3();
    geo.boundingBox.getCenter(centro);
    mesh.userData = {
      mun: m,
      centro,
      atraso: (m.c[0] - minX) / (maxX - minX),
      alt: IND.map((ind) => altura(ind, ind.v(m))),
      cor: IND.map((ind) => ind.cores[classe(ind, ind.v(m))]),
    };
    cena.add(mesh);
    return mesh;
  });
  const pvh = colunas.find((c) => c.userData.mun.nome === "Porto Velho");
  const pvhSede = new THREE.Vector3(wx(RO.meta.pvh[0]), 0, wz(RO.meta.pvh[1]));

  /* ---------- Estado animável ---------- */
  const est = { cresce: reduz ? 1 : 0, entrada: reduz ? 1 : 0, prog: 0, mix: 0 };
  const usuario = { az: 0, pol: 0, azAlvo: 0, polAlvo: 0, px: 0, py: 0, pxAlvo: 0, pyAlvo: 0 };

  // poses de câmera: [alvo x, alvo z, distância, inclinação (rad), giro (rad)]
  const TOPO = [0, 0.3, 28, 0.02, 0];
  const POSES = [
    [0, 0.5, 19.5, 0.84, -0.38],
    [0.2, 0.3, 17.5, 0.76, 0.3],
    [pvhSede.x + 0.6, pvhSede.z + 1.2, 9.6, 0.86, -0.22],
    [0.4, 0.6, 18, 1.0, -0.85],
  ];
  const suave = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  function poseDaRolagem(p) {
    const seg = Math.min(2.999, p * 3);
    const i = Math.floor(seg);
    const t = suave(seg - i);
    return POSES[i].map((v, k) => lerp(v, POSES[i + 1][k], t));
  }
  function mixDaRolagem(p) {
    // população até 0,4; PIB de 0,4 a 0,62; rebanho de 0,72 a 0,92
    const a = Math.min(1, Math.max(0, (p - 0.4) / 0.22));
    const b = Math.min(1, Math.max(0, (p - 0.72) / 0.2));
    return suave(a) + suave(b);
  }

  /* ---------- Tamanho e enquadramento ---------- */
  let W = 1, H = 1;
  function redimensiona() {
    W = fixo.clientWidth;
    H = fixo.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const largo = W > 1080;
    // empurra o mapa para a direita (desktop) ou para baixo (celular), longe do texto
    camera.setViewOffset(W, H, largo ? -W * 0.2 : 0, largo ? 0 : -H * 0.2, W, H);
    camera.fov = largo ? 34 : 46;
    camera.updateProjectionMatrix();
    sujo = true;
  }
  new ResizeObserver(redimensiona).observe(fixo);
  redimensiona();

  /* ---------- Legenda do HUD ---------- */
  const legNome = document.getElementById("palco-legenda-nome");
  const legEscala = document.getElementById("palco-escala");
  let indLegenda = -1;
  function legenda(i) {
    if (i === indLegenda) return;
    indLegenda = i;
    legNome.textContent = IND[i].nome;
    legEscala.innerHTML = IND[i].ramp.map((c) => `<i style="background:${c}"></i>`).join("");
  }
  legenda(0);

  /* ---------- Rótulo do líder e dica do mouse ---------- */
  const rotulo = document.getElementById("palco-rotulo");
  const rotuloValor = rotulo.querySelector("span");
  const tip = document.getElementById("palco-tip");
  const v3 = new THREE.Vector3();
  function naTela(v) {
    v3.copy(v).project(camera);
    return { x: (v3.x + 1) / 2 * W, y: (1 - v3.y) / 2 * H, dentro: v3.z < 1 };
  }

  /* ---------- Interação: girar, passar o mouse, clicar ---------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let sobre = null;
  let arrasto = null;
  function alvoDoPonteiro(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(colunas, false)[0];
    return hit ? hit.object : null;
  }
  function destaca(col) {
    if (sobre === col) return;
    if (sobre) sobre.material.emissive.setHex(0x000000);
    sobre = col;
    if (sobre) sobre.material.emissive.setHex(0x2a3a44);
    canvas.style.cursor = sobre ? "pointer" : "grab";
  }
  canvas.style.cursor = "grab";
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    usuario.pxAlvo = ((e.clientX - r.left) / r.width - 0.5) * 2;
    usuario.pyAlvo = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (arrasto && e.pointerType === "mouse") {
      const dx = e.clientX - arrasto.x;
      const dy = e.clientY - arrasto.y;
      arrasto.mov += Math.abs(dx) + Math.abs(dy);
      arrasto.x = e.clientX;
      arrasto.y = e.clientY;
      usuario.azAlvo = Math.max(-1.4, Math.min(1.4, usuario.azAlvo - dx * 0.006));
      usuario.polAlvo = Math.max(-0.45, Math.min(0.3, usuario.polAlvo - dy * 0.004));
      canvas.style.cursor = "grabbing";
      tip.hidden = true;
      return;
    }
    if (est.entrada < 1) return;
    const col = alvoDoPonteiro(e);
    destaca(col);
    if (col) {
      const i = Math.round(est.mix);
      const m = col.userData.mun;
      tip.innerHTML = `<b>${m.nome}</b><span>${IND[i].nome}: ${IND[i].fmt(IND[i].v(m))}</span><small>Clique para ver a ficha</small>`;
      tip.style.left = e.clientX - r.left + "px";
      tip.style.top = e.clientY - r.top + "px";
      tip.hidden = false;
    } else {
      tip.hidden = true;
    }
  });
  canvas.addEventListener("pointerleave", () => {
    destaca(null);
    tip.hidden = true;
    usuario.pxAlvo = usuario.pyAlvo = 0;
  });
  canvas.addEventListener("pointerdown", (e) => {
    arrasto = { x: e.clientX, y: e.clientY, mov: 0, tipo: e.pointerType };
    if (e.pointerType === "mouse") canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointerup", (e) => {
    const a = arrasto;
    arrasto = null;
    canvas.style.cursor = sobre ? "pointer" : "grab";
    if (!a || a.mov > 6) return;
    const col = alvoDoPonteiro(e);
    if (!col) return;
    if (window.IDE_seleciona) window.IDE_seleciona(col.userData.mun.id);
    document.getElementById("explorar").scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "start" });
  });

  /* ---------- Entrada: zoom de cima para a vista inclinada ---------- */
  const pronto = { textura: false, revelado: false };
  function revela() {
    if (pronto.revelado) return;
    pronto.revelado = true;
    palco.classList.add("palco--pronto");
    if (reduz) return;
    gsap.to(est, { entrada: 1, duration: 2.8, ease: "expo.inOut", delay: 0.15 });
    gsap.to(est, { cresce: 1, duration: 2.6, ease: "none", delay: 0.75 });
    gsap.fromTo(".palco__intro > *", { y: 26, opacity: 0, filter: "blur(6px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "expo.out", stagger: 0.09, delay: 0.25, clearProps: "filter" });
  }
  setTimeout(revela, 2500); // se a textura demorar, entra assim mesmo

  /* ---------- Capítulos guiados pela rolagem ---------- */
  const caps = [...palco.querySelectorAll(".capitulo")];
  const botoesCap = [...palco.querySelectorAll(".palco__progresso button")];
  let st = null;
  const fixa = !reduz && !!ScrollTrigger;
  if (fixa) {
    gsap.registerPlugin(ScrollTrigger);
    palco.classList.add("palco--pin");
    const alturaTopo = () => document.querySelector(".topo").offsetHeight;
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(est, { prog: 1, duration: 1, ease: "none" }, 0);
    tl.to(".palco__intro", { autoAlpha: 0, y: -50, filter: "blur(6px)", duration: 0.1, ease: "power2.in" }, 0.03);
    const janelas = [[0.14, 0.38], [0.46, 0.68], [0.78, 1.01]];
    caps.forEach((c, i) => {
      const [a, b] = janelas[i];
      tl.fromTo(c, { autoAlpha: 0, y: 60, rotateX: -18, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, rotateX: 0, filter: "blur(0px)", duration: 0.07 }, a);
      if (i < caps.length - 1) tl.to(c, { autoAlpha: 0, y: -50, filter: "blur(6px)", duration: 0.06, ease: "power2.in" }, b);
    });
    st = ScrollTrigger.create({
      trigger: palco,
      start: () => "top " + alturaTopo() + "px",
      end: "+=260%",
      pin: fixo,
      scrub: 0.7,
      animation: tl,
      invalidateOnRefresh: true,
      onUpdate: (self) => marcaCap(self.progress),
    });
    botoesCap.forEach((b, i) =>
      b.addEventListener("click", () => {
        const alvo = [0, 0.27, 0.58, 0.9][i];
        window.scrollTo({ top: st.start + (st.end - st.start) * alvo, behavior: "smooth" });
      })
    );
  } else {
    // movimento reduzido: capítulos ficam visíveis e trocam o indicador com um clique
    caps.forEach((c, i) => {
      c.tabIndex = 0;
      c.addEventListener("click", () => { est.mix = i; marcaCap([0.27, 0.58, 0.9][i]); });
    });
    botoesCap.forEach((b, i) => b.addEventListener("click", () => { est.mix = Math.max(0, i - 1); marcaCap([0, 0.27, 0.58, 0.9][i]); }));
  }
  function marcaCap(p) {
    const i = p < 0.14 ? 0 : p < 0.44 ? 1 : p < 0.76 ? 2 : 3;
    botoesCap.forEach((b, j) => b.setAttribute("aria-current", j === i ? "step" : "false"));
  }
  marcaCap(0);

  /* ---------- Laço de desenho ---------- */
  let visivel = true;
  let ultimaAssinatura = "";
  // observa a seção inteira (inclui o espaço da rolagem fixa), não só o palco fixado
  new IntersectionObserver((ents) => { visivel = ents[0].isIntersecting; if (visivel) sujo = true; }, { threshold: 0 }).observe(palco);

  const corTmp = new THREE.Color();
  const alvo = new THREE.Vector3();
  function quadro() {
    requestAnimationFrame(quadro);
    if (!visivel) return;

    if (fixa) est.mix = mixDaRolagem(est.prog);
    const a = Math.floor(est.mix);
    const b = Math.min(2, a + 1);
    const f = est.mix - a;
    legenda(Math.round(est.mix));

    // colunas: altura e cor interpoladas entre indicadores; crescimento de oeste para leste
    for (const c of colunas) {
      const u = c.userData;
      const g = Math.min(1, Math.max(0, (est.cresce - u.atraso * 0.5) / 0.5));
      const ge = 1 - Math.pow(1 - g, 3);
      c.scale.y = Math.max(0.001, lerp(u.alt[a], u.alt[b], f) * ge);
      corTmp.copy(u.cor[a]).lerp(u.cor[b], f);
      c.material.color.copy(corTmp);
    }

    // câmera
    usuario.az += (usuario.azAlvo - usuario.az) * 0.08;
    usuario.pol += (usuario.polAlvo - usuario.pol) * 0.08;
    usuario.px += (usuario.pxAlvo - usuario.px) * 0.05;
    usuario.py += (usuario.pyAlvo - usuario.py) * 0.05;
    const pose = poseDaRolagem(est.prog);
    const e = est.entrada;
    const [tx, tz, dist, pol0, az0] = TOPO.map((v, k) => lerp(v, pose[k], e));
    const az = az0 + (usuario.az + (reduz ? 0 : usuario.px * 0.07)) * e;
    const pol = Math.max(0.02, Math.min(1.3, pol0 + (usuario.pol + (reduz ? 0 : usuario.py * 0.04)) * e));
    alvo.set(tx, 0.35, tz);
    camera.position.set(
      tx + dist * Math.sin(pol) * Math.sin(az),
      dist * Math.cos(pol),
      tz + dist * Math.sin(pol) * Math.cos(az)
    );
    camera.lookAt(alvo);

    // rótulo de Porto Velho, preso ao topo da coluna
    if (e > 0.85) {
      const i = Math.round(est.mix);
      const topo = pvhSede.clone();
      topo.y = pvh.scale.y + 0.05;
      const s = naTela(topo);
      // no celular o rótulo só aparece depois que o texto de abertura sai
      rotulo.hidden = !s.dentro || (W < 720 && est.prog < 0.12);
      const x = Math.max(96, Math.min(W - 96, s.x));
      rotulo.style.transform = `translate(${x}px, ${s.y}px) translate(-50%, calc(-100% - 26px))`;
      rotuloValor.textContent = IND[i].fmt(IND[i].v(pvh.userData.mun));
      rotulo.style.opacity = String(Math.min(1, (e - 0.85) / 0.15));
    }

    // só redesenha quando algo mudou: câmera, mistura de indicadores, crescimento ou destaque
    const assinatura = camera.position.x.toFixed(4) + camera.position.y.toFixed(4) + camera.position.z.toFixed(4) +
      est.mix.toFixed(4) + est.cresce.toFixed(4) + (sobre ? sobre.id : "-");
    if (!sujo && assinatura === ultimaAssinatura) return;
    ultimaAssinatura = assinatura;
    sujo = false;
    renderer.render(cena, camera);
  }
  quadro();
}
