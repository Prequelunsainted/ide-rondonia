/* IDE Rondônia: landing page. Catálogo, busca, vídeo e mapa de municípios. */
(function () {
  "use strict";

  const IDE = "https://geo.sedec.ro.gov.br/";
  // "Ver no mapa" abre a visão do mapa do tema na própria IDE (parâmetro views do Experience Builder)
  const PAINEL = (pagina) =>
    "https://geointeligencia.ro.gov.br/portal/apps/experiencebuilder/experience/?id=728e3f3abe054a79bd43b595002a112a&page=" + pagina;
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Ícones (traço 1,7, grade 24) ---------- */
  const ICONES = {
    social: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.4-.3 4.2 1.3 4.6 4.3"/>',
    comex: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.4 2.3 3.5 5 3.5 8s-1.1 5.7-3.5 8M12 4c-2.4 2.3-3.5 5-3.5 8s1.1 5.7 3.5 8"/>',
    empresas: '<path d="M4.5 20V6.2L11 4v16M11 9h8.5v11M3 20h18M7.5 9h1M7.5 12.5h1M7.5 16h1M14.5 12.5h1.5M14.5 16h1.5"/>',
    empregos: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 13h17M11 13v1.5h2V13"/>',
    agricultura: '<path d="M12 20v-8M12 12c0-4 2.5-6.5 7-6.5 0 4.2-2.6 6.5-7 6.5ZM12 14.5c0-3.2-2-5.3-6.5-5.3 0 3.4 2.2 5.3 6.5 5.3ZM6.5 20h11"/>',
    pecuaria: '<path d="M6.8 7.2 3.5 5.6M17.2 7.2l3.3-1.6M7 6.6h10l-.9 6.6c-.4 2.9-2 5-4.1 5s-3.7-2.1-4.1-5Z"/><path d="M9.6 15.2h4.8"/><circle cx="10" cy="10.4" r=".7"/><circle cx="14" cy="10.4" r=".7"/>',
    protegidas: '<path d="M12 21v-4.5M12 3 6.2 10.6h3L5.6 16h12.8l-3.6-5.4h3Z"/>',
    minerais: '<path d="M7 4.5h10l3.8 4.8L12 19.8 3.2 9.3ZM3.2 9.3h17.6M9.6 4.5 8 9.3l4 10.5 4-10.5-1.6-4.8"/>',
    geoambiental: '<path d="M12 3.5s6 6.4 6 10.7a6 6 0 0 1-12 0c0-4.3 6-10.7 6-10.7Z"/><path d="M9.2 14.5a2.8 2.8 0 0 0 2.8 2.8"/>',
    saude: '<path d="M10 4.5h4v5.5h5.5v4H14v5.5h-4V14H4.5v-4H10Z"/>',
    camadas: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5Z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
  };
  const svgIcone = (nome) => (window.IDE_ICONES && window.IDE_ICONES[nome]
    ? '<svg class="ico-vivo" viewBox="0 0 48 48" aria-hidden="true">' + window.IDE_ICONES[nome] + "</svg>"
    : '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONES[nome] + "</svg>");
  const SETA_EXTERNA =
    '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  const SETA =
    '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- Temas da IDE (do config público do site) ---------- */
  const TEMAS = [
    {
      id: "economico-social", mapa: "view_45", pagina: "Economico-Social", grupo: "economia", icone: "social",
      nome: "Econômico-social",
      pergunta: "Como vive e quanto produz cada município?",
      itens: ["População (Censo 2022)", "PIB", "IDH", "Índice FIRJAN", "Índice de Gini", "Poder de compra", "Série histórica"],
      fonte: "IBGE, FIRJAN",
      chaves: "pib renda populacao censo habitantes idh desenvolvimento gini desigualdade poder de compra economia indicadores",
    },
    {
      id: "comercio-exterior", mapa: "view_51", pagina: "Comercio-Exterior", grupo: "economia", icone: "comex",
      nome: "Comércio exterior",
      pergunta: "O que Rondônia vende e compra do resto do mundo?",
      itens: ["Exportação por município", "Importação por município", "Balança comercial", "Comparativo de exportação", "Mapas 3D"],
      fonte: "Dados de comércio exterior por município",
      chaves: "exportacao importacao comex balanca comercial soja carne exterior paises vendas economia",
    },
    {
      id: "empresas", mapa: "view_66", pagina: "Empresas", grupo: "economia", icone: "empresas",
      nome: "Empresas",
      pergunta: "Onde se abrem e onde se fecham empresas?",
      itens: ["Empresas ativas (JUCER)", "Empresas ativas (Governo Federal)", "Abertura e fechamento de empresas"],
      fonte: "JUCER, Governo Federal",
      chaves: "empresa cnpj negocio comercio jucer abertura fechamento mei economia",
    },
    {
      id: "empregos", mapa: "view_76", pagina: "Empregos", grupo: "economia", icone: "empregos",
      nome: "Empregos",
      pergunta: "Onde há mais admissões, vagas e atendimentos?",
      itens: ["Novo CAGED", "CAGED 2019", "CAGED Região Norte", "Agências do SINE-RO", "PNAD Contínua (RO e Porto Velho)"],
      fonte: "Novo CAGED, SINE-RO, IBGE",
      chaves: "emprego trabalho vagas carteira caged sine desemprego seguro desemprego admissoes renda economia",
    },
    {
      id: "agricultura", mapa: "view_99", pagina: "Agricultura", grupo: "rural", icone: "agricultura",
      nome: "Agricultura",
      pergunta: "O que se planta em Rondônia, e onde?",
      itens: ["Produção Agrícola Municipal (PAM)", "Principais produtos", "Produção vegetal por produto", "Aptidão agrícola dos solos"],
      fonte: "IBGE (PAM)",
      chaves: "agricultura lavoura soja milho cafe cacau arroz feijao mandioca solo producao rural plantio",
    },
    {
      id: "pecuaria", mapa: "view_157", pagina: "Pecuaria", grupo: "rural", icone: "pecuaria",
      nome: "Pecuária",
      pergunta: "Onde estão os rebanhos e o que eles produzem?",
      itens: ["Produção da Pecuária Municipal (PPM)", "Produtos de origem animal", "Aquicultura", "Quantidade de rebanhos", "IDARON: GTAs, abate e informe de campo"],
      fonte: "IBGE (PPM), IDARON",
      chaves: "pecuaria boi gado bovino rebanho leite peixe aquicultura abate frigorifico idaron gta rural",
    },
    {
      id: "areas-protegidas", mapa: "view_168", pagina: "Areas-Protegidas", grupo: "territorio", icone: "protegidas",
      nome: "Áreas protegidas",
      pergunta: "Onde ficam as unidades de conservação, terras indígenas e quilombos?",
      itens: ["Unidades de conservação", "Terras indígenas", "Comunidades quilombolas"],
      fonte: "Bases oficiais de áreas protegidas",
      chaves: "areas protegidas unidade de conservacao reserva parque floresta terra indigena indigenas quilombola quilombo ambiente territorio",
    },
    {
      id: "recursos-minerais", mapa: "view_179", pagina: "Recursos-Minerais", grupo: "territorio", icone: "minerais",
      nome: "Recursos minerais",
      pergunta: "Onde estão as áreas de recursos minerais?",
      itens: ["Recursos minerais por município", "Consulta de recursos minerais"],
      fonte: "Bases oficiais de mineração",
      chaves: "mineracao minerio garimpo ouro cassiterita estanho recursos minerais territorio",
    },
    {
      id: "geoambiental", mapa: "view_170", pagina: "Geoambiental", grupo: "territorio", icone: "geoambiental",
      nome: "Geoambiental",
      pergunta: "Quanta água se usa, e como é o ambiente de cada região?",
      itens: ["Demanda hídrica (vazão de retirada)", "Dados geoambientais", "Bases de informações ambientais"],
      fonte: "Bases ambientais oficiais",
      chaves: "agua rio hidrica vazao ambiente ambiental clima solo relevo geologia territorio",
    },
    {
      id: "saude", mapa: "view_191", pagina: "Saude", grupo: "social", icone: "saude",
      nome: "Saúde",
      pergunta: "Onde estão hospitais, postos e clínicas?",
      itens: ["Estabelecimentos de saúde (CNES)", "Consulta por tipo de unidade"],
      fonte: "CNES, Ministério da Saúde",
      chaves: "saude hospital posto ubs clinica sus cnes estabelecimentos medico",
    },
  ];

  const EXTRAS = [
    { nome: "Infraestrutura", pergunta: "Energia elétrica, abastecimento de água e saneamento", chaves: "infraestrutura energia eletrica usina agua abastecimento esgoto saneamento aterro snis" },
    { nome: "Segurança", pergunta: "Mapa de segurança pública", chaves: "seguranca crime violencia policia" },
    { nome: "Educação", pergunta: "Mapa de educação", chaves: "educacao escola ensino" },
    { nome: "Programas da SEDEC", pergunta: "PROAMPE, SISPAR Terceiro Setor, CONSIC e HUB de Inovação", chaves: "sedec proampe sispar terceiro setor consic hub inovacao programas credito" },
    { nome: "Imagens de satélite", pergunta: "Uso e cobertura do solo e histórico Wayback", chaves: "imagem satelite uso cobertura solo wayback desmatamento" },
  ];

  /* ---------- Catálogo ---------- */
  const catalogo = document.getElementById("catalogo");
  catalogo.innerHTML = TEMAS.map((t) => `
    <li class="tema" id="tema-${t.id}" data-grupo="${t.grupo}">
      <div class="tema__id">
        <span class="tema-ico" data-cor="${t.grupo}">${svgIcone(t.icone)}</span>
        <div>
          <h3>${t.nome}</h3>
          <p class="tema__pergunta">${t.pergunta}</p>
        </div>
      </div>
      <div>
        <ul class="tema__conteudo" aria-label="Conteúdo do tema ${t.nome}">
          ${t.itens.map((i) => `<li>${i}</li>`).join("")}
        </ul>
        <p class="tema__fonte">Fonte: ${t.fonte}</p>
      </div>
      <div class="tema__acoes">
        <a class="botao botao--primario" href="${PAINEL(t.pagina)}" target="_blank" rel="noopener">Abrir painel ${SETA_EXTERNA}<span class="sr"> de ${t.nome} (abre em nova aba)</span></a>
        <a class="botao botao--secundario" href="${IDE}?views=${t.mapa}" target="_blank" rel="noopener">Ver no mapa ${SETA_EXTERNA}<span class="sr"> de ${t.nome} na IDE (abre em nova aba)</span></a>
      </div>
    </li>`).join("");

  /* Filtros: pílula deslizante e reorganização animada (GSAP Flip) */
  const filtros = document.querySelectorAll(".filtro");
  const caixaFiltros = document.querySelector(".filtros");
  const pilula = document.createElement("span");
  pilula.className = "filtros__pilula";
  pilula.setAttribute("aria-hidden", "true");
  caixaFiltros.prepend(pilula);
  caixaFiltros.classList.add("com-pilula");
  function movePilula() {
    const b = caixaFiltros.querySelector('.filtro[aria-pressed="true"]');
    if (!b) return;
    pilula.style.width = b.offsetWidth + "px";
    pilula.style.height = b.offsetHeight + "px";
    pilula.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
  }
  movePilula();
  window.addEventListener("resize", movePilula);
  if (document.fonts) document.fonts.ready.then(movePilula);

  const FlipP = window.Flip;
  if (FlipP && window.gsap) window.gsap.registerPlugin(FlipP);
  filtros.forEach((b) =>
    b.addEventListener("click", () => {
      if (b.getAttribute("aria-pressed") === "true") return;
      filtros.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      movePilula();
      const g = b.dataset.grupo;
      const anima = FlipP && !reduzMovimento;
      const estado = anima ? FlipP.getState(".tema") : null;
      const alturaAntes = catalogo.offsetHeight;
      catalogo.querySelectorAll(".tema").forEach((li) => {
        li.hidden = g !== "todos" && li.dataset.grupo !== g;
      });
      if (estado) {
        // a lista muda de altura devagar, para a seção de baixo não pular
        window.gsap.fromTo(catalogo, { height: alturaAntes }, { height: catalogo.offsetHeight, duration: 0.6, ease: "power3.inOut", clearProps: "height" });
        FlipP.from(estado, {
          duration: 0.6, ease: "expo.out", absolute: true, stagger: 0.025, nested: true,
          onEnter: (els) => window.gsap.fromTo(els, { opacity: 0, y: 40, rotateX: -25, transformPerspective: 800 },
            { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: "expo.out", stagger: 0.05 }),
          onLeave: (els) => window.gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.25, ease: "power2.in" }),
        });
      }
    })
  );

  /* ---------- Busca ---------- */
  const normaliza = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const escapa = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const indice = TEMAS.map((t) => ({
    nome: t.nome, sub: t.pergunta, icone: t.icone, cor: t.grupo,
    href: "#tema-" + t.id, externo: false,
    texto: normaliza([t.nome, t.pergunta, t.itens.join(" "), t.fonte, t.chaves].join(" ")),
  })).concat(EXTRAS.map((e) => ({
    nome: e.nome, sub: e.pergunta, icone: "camadas", cor: "economia",
    href: IDE, externo: true,
    texto: normaliza([e.nome, e.pergunta, e.chaves].join(" ")),
  })));

  const campo = document.getElementById("busca-campo");
  const lista = document.getElementById("busca-lista");
  const vazio = document.getElementById("busca-vazio");
  let resultados = [];
  let ativo = -1;

  function destaca(texto, termos) {
    let html = escapa(texto);
    termos.forEach((t) => {
      if (t.length < 2) return;
      const n = normaliza(html);
      const i = n.indexOf(t);
      if (i >= 0) html = html.slice(0, i) + "<mark>" + html.slice(i, i + t.length) + "</mark>" + html.slice(i + t.length);
    });
    return html;
  }

  function fecha() {
    lista.hidden = true;
    campo.setAttribute("aria-expanded", "false");
    campo.removeAttribute("aria-activedescendant");
    ativo = -1;
  }

  function busca() {
    const q = normaliza(campo.value.trim());
    if (q.length < 2) { fecha(); vazio.hidden = true; return; }
    const termos = q.split(/\s+/).filter(Boolean);
    resultados = indice.filter((r) => termos.every((t) => r.texto.includes(t))).slice(0, 7);
    if (!resultados.length) { fecha(); vazio.hidden = false; return; }
    vazio.hidden = true;
    lista.innerHTML = resultados.map((r, i) => `
      <li class="busca__item" role="option" id="opcao-${i}" aria-selected="false">
        <a href="${r.href}" ${r.externo ? 'target="_blank" rel="noopener"' : ""} tabindex="-1">
          <span class="tema-ico" data-cor="${r.cor}">${svgIcone(r.icone)}</span>
          <span><b>${destaca(r.nome, termos)}</b><small>${r.externo ? "Na IDE · " : ""}${escapa(r.sub)}</small></span>
          ${r.externo ? SETA_EXTERNA : SETA}
        </a>
      </li>`).join("");
    lista.hidden = false;
    campo.setAttribute("aria-expanded", "true");
    marca(0);
  }

  function marca(i) {
    const itens = lista.querySelectorAll(".busca__item");
    itens.forEach((el, j) => el.setAttribute("aria-selected", String(j === i)));
    ativo = i;
    if (itens[i]) {
      campo.setAttribute("aria-activedescendant", itens[i].id);
      itens[i].scrollIntoView({ block: "nearest" });
    }
  }

  function segue(i) {
    const r = resultados[i];
    if (!r) return;
    if (r.externo) { window.open(r.href, "_blank", "noopener"); return; }
    fecha();
    vaiParaTema(r.href);
  }

  function vaiParaTema(href) {
    // mostra todos os temas antes de rolar, para o alvo nunca estar filtrado
    document.querySelector('.filtro[data-grupo="todos"]').click();
    const alvo = document.querySelector(href);
    if (!alvo) return;
    history.replaceState(null, "", href);
    alvo.scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "start" });
    alvo.style.animation = "none";
    void alvo.offsetWidth;
    alvo.style.animation = "";
    const link = alvo.querySelector("a");
    if (link) link.focus({ preventScroll: true });
  }

  campo.addEventListener("input", busca);
  campo.addEventListener("focus", () => { if (campo.value.trim().length >= 2) busca(); });
  campo.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && !lista.hidden) { e.preventDefault(); marca(Math.min(ativo + 1, resultados.length - 1)); }
    else if (e.key === "ArrowUp" && !lista.hidden) { e.preventDefault(); marca(Math.max(ativo - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (!lista.hidden) segue(Math.max(ativo, 0)); }
    else if (e.key === "Escape") { fecha(); }
  });
  lista.addEventListener("mousedown", (e) => e.preventDefault());
  lista.addEventListener("click", (e) => {
    const li = e.target.closest(".busca__item");
    if (!li) return;
    const i = [...lista.children].indexOf(li);
    if (!resultados[i].externo) { e.preventDefault(); segue(i); }
  });
  campo.addEventListener("blur", () => setTimeout(fecha, 120));
  vazio.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sugestao]");
    if (!b) return;
    campo.value = b.dataset.sugestao;
    campo.focus();
    busca();
  });
  document.querySelectorAll('a[href^="#tema-"]').forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); vaiParaTema(a.getAttribute("href")); })
  );

  /* ---------- Vídeo (reserva quando não há WebGL) ---------- */
  window.IDE_iniciarVideo = function () {
    const video = document.getElementById("video-mapa");
    const controle = document.getElementById("video-controle");
    if (!video || !controle) return;
    const rotulo = controle.querySelector(".sr");
    let pausadoPeloUsuario = reduzMovimento;
    video.preload = "auto";
    function estado() {
      const parado = video.paused;
      controle.setAttribute("aria-pressed", String(parado));
      rotulo.textContent = parado ? "Reproduzir animação" : "Pausar animação";
    }
    controle.addEventListener("click", () => {
      if (video.paused) { pausadoPeloUsuario = false; video.play().catch(() => {}); }
      else { pausadoPeloUsuario = true; video.pause(); }
    });
    video.addEventListener("play", estado);
    video.addEventListener("pause", estado);
    new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting && !pausadoPeloUsuario) video.play().catch(() => {});
      else if (!en.isIntersecting && !video.paused) video.pause();
    }), { threshold: 0.25 }).observe(video);
    estado();
  };

  /* ---------- Mapa de municípios ---------- */
  const RO = window.RO;
  if (!RO) return;
  const muns = RO.muns.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  muns.forEach((m) => { m.dens = m.pop && m.area ? m.pop / m.area : null; });
  const total = RO.meta.total;

  const nf = (n, d = 0) => n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });
  const compacto = (n) => {
    if (n >= 1e9) return nf(n / 1e9, n >= 1e10 ? 1 : 2) + " bi";
    if (n >= 1e6) return nf(n / 1e6, n >= 1e7 ? 1 : 2) + " mi";
    if (n >= 1e3) return nf(n / 1e3, n >= 1e4 ? 0 : 1) + " mil";
    return nf(n);
  };

  const extenso = (n) => {
    if (n >= 1e9) { const v = n / 1e9; return nf(v, v >= 10 ? 1 : 2) + (v < 2 ? " bilhão" : " bilhões"); }
    if (n >= 1e6) { const v = n / 1e6; return nf(v, v >= 10 ? 1 : 2) + (v < 2 ? " milhão" : " milhões"); }
    if (n >= 1e4) return nf(n / 1e3, 0) + " mil";
    return nf(n);
  };
  const de = (s) => (/(milhão|milhões|bilhão|bilhões)$/.test(s) ? s + " de" : s);

  const IND = [
    {
      id: "pop", nome: "População", unidade: "habitantes", ramp: ["#dcecf7", "#a6cde9", "#62a7d6", "#2477b9", "#00508a"],
      valor: (m) => m.pop, total: total.pop,
      fmt: (v) => nf(v) + " hab.", leg: (v) => compacto(v), fonte: "IBGE, Censo 2022",
    },
    {
      id: "dens", nome: "Densidade", unidade: "habitantes por km²", ramp: ["#e0eef2", "#acd3de", "#6fb0c4", "#2f87a3", "#0e5f7a"],
      valor: (m) => m.dens, total: total.pop / total.area,
      fmt: (v) => nf(v, v < 10 ? 1 : 0) + " hab./km²", leg: (v) => nf(v, v < 10 ? 1 : 0), fonte: "IBGE, Censo 2022 e área territorial",
    },
    {
      id: "pib", nome: "PIB", unidade: "reais, a preços correntes", ramp: ["#fbefc6", "#f4d57a", "#e3ae35", "#bf820f", "#8a5604"],
      valor: (m) => (m.pib == null ? null : m.pib * 1000), total: total.pib * 1000,
      fmt: (v) => "R$ " + extenso(v), leg: (v) => "R$ " + compacto(v), fonte: "IBGE, PIB dos Municípios 2023",
    },
    {
      id: "boi", nome: "Rebanho bovino", unidade: "cabeças de gado", ramp: ["#fbe2d4", "#f3b393", "#e47f56", "#c4542b", "#8f3213"],
      valor: (m) => m.boi, total: total.boi,
      fmt: (v) => de(extenso(v)) + " cabeças", leg: (v) => compacto(v), fonte: "IBGE, Pesquisa da Pecuária Municipal 2025",
    },
  ];
  IND.forEach((ind) => {
    const vals = muns.map(ind.valor).filter((v) => v != null).sort((a, b) => a - b);
    ind.cortes = [1, 2, 3, 4].map((i) => vals[Math.floor((vals.length * i) / 5)]);
    ind.min = vals[0];
    ind.max = vals[vals.length - 1];
    ind.rank = new Map();
    muns.slice().filter((m) => ind.valor(m) != null)
      .sort((a, b) => ind.valor(b) - ind.valor(a))
      .forEach((m, i) => ind.rank.set(m.id, i + 1));
  });
  const classe = (ind, v) => ind.cortes.reduce((k, c) => k + (v >= c ? 1 : 0), 0);

  const svg = document.getElementById("mapa-svg");
  const mapa = document.getElementById("mapa");
  const dica = document.getElementById("mapa-dica");
  const NS = "http://www.w3.org/2000/svg";
  svg.setAttribute("viewBox", `0 0 ${RO.meta.w} ${RO.meta.h}`);
  const g = document.createElementNS(NS, "g");
  svg.appendChild(g);
  const xs = muns.map((m) => m.c[0]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const caminhos = new Map();
  muns.forEach((m) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", m.d);
    p.setAttribute("class", "mun");
    p.dataset.id = m.id;
    if (!reduzMovimento) p.style.transitionDelay = (((m.c[0] - minX) / (maxX - minX)) * 0.45).toFixed(3) + "s, 0s";
    g.appendChild(p);
    caminhos.set(m.id, p);
  });

  let indAtual = IND[0];
  let munAtual = null;

  // seletor de indicador (radiogroup com setas)
  const grupoInd = document.getElementById("indicadores");
  grupoInd.innerHTML = IND.map((ind, i) =>
    `<button type="button" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-ind="${ind.id}">${ind.nome}</button>`
  ).join("");
  const botoesInd = [...grupoInd.querySelectorAll("button")];
  function escolheInd(i, foco) {
    indAtual = IND[i];
    botoesInd.forEach((b, j) => { b.setAttribute("aria-checked", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    if (foco) botoesInd[i].focus();
    pinta();
    ficha();
  }
  botoesInd.forEach((b, i) => {
    b.addEventListener("click", () => escolheInd(i));
    b.addEventListener("keydown", (e) => {
      const n = botoesInd.length;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); escolheInd((i + 1) % n, true); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); escolheInd((i - 1 + n) % n, true); }
    });
  });

  function pinta() {
    muns.forEach((m) => {
      const v = indAtual.valor(m);
      caminhos.get(m.id).style.fill = v == null ? "#e6ebef" : indAtual.ramp[classe(indAtual, v)];
    });
    const lim = [indAtual.min].concat(indAtual.cortes);
    document.getElementById("legenda").innerHTML = `
      <div class="legenda__escala" aria-hidden="true">${indAtual.ramp.map((c) => `<i style="background:${c}"></i>`).join("")}</div>
      <div class="legenda__rotulos"><span style="left:0">${indAtual.leg(indAtual.min)}</span>${indAtual.cortes.map((c, i) => `<span class="${i === 1 ? "" : "par"}" style="left:${(i + 1) * 20}%">${indAtual.leg(c)}</span>`).join("")}<span style="left:100%">${indAtual.leg(indAtual.max)}</span></div>
      <p class="legenda__fonte">${indAtual.nome} em ${indAtual.unidade}, cinco faixas com o mesmo número de municípios. Fonte: ${indAtual.fonte}.</p>`;
    document.getElementById("mapa-desc").textContent =
      `Mapa dos 52 municípios de Rondônia colorido por ${indAtual.nome.toLowerCase()}. Valores de ${indAtual.leg(lim[0])} a ${indAtual.leg(indAtual.max)}.`;
  }

  // ficha do município
  const sel = document.getElementById("municipio");
  sel.innerHTML = '<option value="">Rondônia (todos os municípios)</option>' +
    muns.map((m) => `<option value="${m.id}">${escapa(m.nome)}</option>`).join("");
  const nomeEl = document.getElementById("ficha-nome");
  const subEl = document.getElementById("ficha-sub");
  const dadosEl = document.getElementById("ficha-dados");

  function ficha() {
    const m = munAtual;
    nomeEl.textContent = m ? m.nome : "Rondônia";
    subEl.textContent = m ? "Município de Rondônia" : "Soma dos 52 municípios";
    dadosEl.innerHTML = IND.map((ind) => {
      const v = m ? ind.valor(m) : ind.total;
      const rank = m && ind.rank.get(m.id);
      return `<div class="${ind === indAtual ? "atual" : ""}">
        <dt>${ind.nome}</dt>
        <dd><span class="ficha__valor" data-v="${v}" data-ind="${ind.id}">${v == null ? "sem dado" : ind.fmt(v)}</span>
        ${rank ? `<span class="ficha__rank">${rank}º de 52</span>` : ""}</dd>
      </div>`;
    }).join("") + `<p class="ficha__fontes">Fontes: IBGE. Censo 2022, PIB dos Municípios 2023 e Pesquisa da Pecuária Municipal 2025.</p>`;
    document.getElementById("ficha-anuncio").textContent = m
      ? `${m.nome}: ${IND.map((ind) => ind.nome + " " + (ind.valor(m) == null ? "sem dado" : ind.fmt(ind.valor(m)))).join("; ")}.`
      : "";
    if (!reduzMovimento && m) conta();
  }

  let contagem = 0;
  function conta() {
    const els = dadosEl.querySelectorAll(".ficha__valor[data-v]");
    const t0 = performance.now();
    const dur = 650;
    const rodada = ++contagem;
    const final = () => els.forEach((el) => {
      const v = parseFloat(el.dataset.v);
      if (isFinite(v)) el.textContent = IND.find((i) => i.id === el.dataset.ind).fmt(v);
    });
    // garante o valor exato mesmo se o navegador congelar a animação (aba em segundo plano)
    setTimeout(() => { if (rodada === contagem) final(); }, dur + 80);
    function passo(t) {
      if (rodada !== contagem) return;
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(2, -10 * k);
      els.forEach((el) => {
        const v = parseFloat(el.dataset.v);
        if (!isFinite(v)) return;
        const ind = IND.find((i) => i.id === el.dataset.ind);
        el.textContent = ind.fmt(k < 1 ? v * e : v);
      });
      if (k < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  function escolheMun(id) {
    munAtual = muns.find((m) => m.id === id) || null;
    caminhos.forEach((p, k) => p.classList.toggle("ativo", k === id));
    mapa.classList.toggle("tem-ativo", !!munAtual);
    if (munAtual) g.appendChild(caminhos.get(id)); // traz o contorno para a frente
    sel.value = munAtual ? id : "";
    ficha();
  }
  sel.addEventListener("change", () => escolheMun(sel.value));

  // dica e clique
  g.addEventListener("pointermove", (e) => {
    const p = e.target.closest(".mun");
    if (!p) { dica.hidden = true; return; }
    const m = muns.find((x) => x.id === p.dataset.id);
    const v = indAtual.valor(m);
    const r = mapa.getBoundingClientRect();
    dica.innerHTML = `<b>${escapa(m.nome)}</b><span>${v == null ? "sem dado" : indAtual.fmt(v)}</span>`;
    dica.style.left = e.clientX - r.left + "px";
    dica.style.top = e.clientY - r.top + "px";
    dica.hidden = false;
  });
  g.addEventListener("pointerleave", () => { dica.hidden = true; });
  g.addEventListener("click", (e) => {
    const p = e.target.closest(".mun");
    if (!p) return;
    escolheMun(munAtual && munAtual.id === p.dataset.id ? "" : p.dataset.id);
  });


  /* ---------- Ponte com o palco 3D ---------- */
  window.IDE_seleciona = (id) => escolheMun(id);

  /* ---------- Movimento de apoio ---------- */
  const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // inclinação 3D seguindo o mouse (ícones dos temas e cartões dos passos)
  function inclina(el, alvo, forca) {
    if (!fino || reduzMovimento) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      alvo.style.setProperty("--ry", (x * forca).toFixed(2) + "deg");
      alvo.style.setProperty("--rx", (-y * forca).toFixed(2) + "deg");
      alvo.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
      alvo.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
    });
    el.addEventListener("pointerleave", () => {
      alvo.style.setProperty("--rx", "0deg");
      alvo.style.setProperty("--ry", "0deg");
    });
  }
  document.querySelectorAll(".tema").forEach((t) => inclina(t, t.querySelector(".tema-ico"), 34));
  document.querySelectorAll(".cartao3d").forEach((c) => inclina(c, c, 14));

  // passos: as animações em laço só rodam enquanto o passo está na tela
  const NS_SVG = "http://www.w3.org/2000/svg";
  function emVista(seletor, aoEntrar, aoSair, limiar) {
    const els = document.querySelectorAll(seletor);
    if (!("IntersectionObserver" in window)) { els.forEach((el) => aoEntrar(el)); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) aoEntrar(en.target); else if (aoSair) aoSair(en.target);
    }), { threshold: limiar || 0.35 });
    els.forEach((el) => io.observe(el));
  }
  if (!reduzMovimento) {
    emVista(".passos li", (li) => li.classList.add("visivel"), (li) => li.classList.remove("visivel"));
  }

  // ícones dos temas: tocam ao aparecer e de novo ao passar o mouse
  function tocaIcone(ico) {
    if (reduzMovimento || !ico) return;
    ico.classList.remove("anima");
    void ico.getBoundingClientRect();
    ico.classList.add("anima");
  }
  emVista(".catalogo .tema-ico", tocaIcone, null, 0.6);
  document.querySelectorAll(".tema").forEach((t) => t.addEventListener("pointerenter", () => tocaIcone(t.querySelector(".tema-ico"))));

  // passo 2: mapa real de Rondônia, cursor clica em Ji-Paraná e ele sobe
  (function ilustraMapa() {
    const svg = document.getElementById("ilus-mapa");
    if (!svg || !window.RO) return;
    const k = 0.1;
    const ox = 22, oy = 7;
    const alvo = window.RO.muns.find((m) => m.nome === "Ji-Paraná") || window.RO.muns[0];
    const tx = ox + alvo.c[0] * k, ty = oy + alvo.c[1] * k;
    const cx = Math.min(104, tx + 16), cy = Math.max(6, ty - 40);
    const g = (cls, extra) => `<g class="${cls}" ${extra || ""}>`;
    const todos = window.RO.muns.filter((m) => m !== alvo).map((m) => `<path d="${m.d}"/>`).join("");
    svg.insertAdjacentHTML("beforeend",
      `<g transform="translate(${ox + 3} ${oy + 5}) scale(${k})" class="p2-sombra"><path d="${window.RO.muns.map((m) => m.d).join("")}"/></g>` +
      g("p2-muns", `transform="translate(${ox} ${oy}) scale(${k})"`) + todos + "</g>" +
      g("p2-lado", `transform="translate(${ox} ${oy}) scale(${k})"`) + `<path d="${alvo.d}"/></g>` +
      g("p2-topo") + `<g transform="translate(${ox} ${oy}) scale(${k})"><path d="${alvo.d}"/></g></g>` +
      `<g class="p2-cartao"><path class="p2-cartao-linha" d="M${tx} ${ty - 6}L${cx + 8} ${cy + 22}"/>` +
      `<rect x="${cx}" y="${cy}" width="50" height="22" rx="4"/>` +
      `<text x="${cx + 5}" y="${cy + 9}" class="p2-t1">${alvo.nome}</text>` +
      `<text x="${cx + 5}" y="${cy + 17}" class="p2-t2">${Math.round(alvo.pop).toLocaleString("pt-BR")} hab.</text></g>` +
      `<circle cx="${tx}" cy="${ty}" r="7" class="p-onda p2-onda"/>` +
      `<g class="p-cursor p2-cursor" style="--tx:${tx}px;--ty:${ty}px"><path d="M0 0v14l3.6-3.6 2.6 6.2 2.2-1-2.6-5.9h5z"/></g>`);
  })();

  // fontes: a faixa explica o que cada fonte fornece
  (function fita() {
    const info = document.getElementById("fita-info");
    const faixa = document.querySelector(".fita");
    if (!info || !faixa) return;
    if (window.matchMedia("(hover: none)").matches) info.innerHTML = "<b>Toque numa fonte</b> para ver o que ela fornece.";
    const padrao = info.innerHTML;
    let timer;
    function mostra(sp) {
      clearTimeout(timer);
      info.classList.remove("trocando");
      void info.offsetWidth;
      info.innerHTML = `<b>${sp.textContent}</b> ${sp.dataset.desc}`;
      info.classList.add("trocando", "ativo");
      faixa.querySelectorAll("span.foco").forEach((x) => x.classList.remove("foco"));
      faixa.querySelectorAll("span").forEach((x) => { if (x.textContent === sp.textContent) x.classList.add("foco"); });
    }
    faixa.addEventListener("pointerover", (e) => { const sp = e.target.closest("span[data-desc]"); if (sp) mostra(sp); });
    faixa.addEventListener("click", (e) => { const sp = e.target.closest("span[data-desc]"); if (sp) { mostra(sp); faixa.classList.add("parada"); } });
    faixa.addEventListener("pointerleave", () => {
      timer = setTimeout(() => {
        info.innerHTML = padrao;
        info.classList.remove("ativo");
        faixa.classList.remove("parada");
        faixa.querySelectorAll("span.foco").forEach((x) => x.classList.remove("foco"));
      }, 2200);
    });
  })();

  // do dado ao mapa: linhas entre as etapas, pontos de luz correndo e municípios acendendo
  (function fluxo() {
    const caixa = document.getElementById("fluxo");
    const svg = document.getElementById("fluxo-linhas");
    const mapa = document.getElementById("fluxo-mapa");
    if (!caixa || !svg) return;
    if (mapa && window.RO) {
      mapa.setAttribute("viewBox", `0 0 ${window.RO.meta.w} ${window.RO.meta.h}`);
      mapa.innerHTML = window.RO.muns.map((m) => `<path d="${m.d}"/>`).join("");
    }
    const munPaths = mapa ? [...mapa.querySelectorAll("path")] : [];
    let caminhos = [];
    let pontos = [];
    const tela = document.createElement("canvas");
    tela.className = "fluxo__pontos";
    tela.setAttribute("aria-hidden", "true");
    caixa.insertBefore(tela, svg.nextSibling);
    const ctx = tela.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function no(sel) { return caixa.querySelector(sel); }
    function ponta(el, lado) {
      const r = el.getBoundingClientRect();
      const c = caixa.getBoundingClientRect();
      const x = { e: r.left - c.left, d: r.right - c.left, m: r.left - c.left + r.width / 2 }[lado[0]];
      const y = { t: r.top - c.top, b: r.bottom - c.top, m: r.top - c.top + r.height / 2 }[lado[1]];
      return [x, y];
    }
    function curva(a, b, vertical) {
      if (vertical) {
        const my = (a[1] + b[1]) / 2;
        return `M${a[0]} ${a[1]}C${a[0]} ${my} ${b[0]} ${my} ${b[0]} ${b[1]}`;
      }
      const mx = (a[0] + b[0]) / 2;
      return `M${a[0]} ${a[1]}C${mx} ${a[1]} ${mx} ${b[1]} ${b[0]} ${b[1]}`;
    }
    function desenha() {
      const c = caixa.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${c.width} ${c.height}`);
      const geode = no('[data-no="geode"]');
      const mp = no('[data-no="mapa"]');
      const voce = no('[data-no="voce"]');
      const vertical = geode.getBoundingClientRect().top > no(".fluxo__fontes").getBoundingClientRect().bottom - 4;
      const d = [];
      if (vertical) {
        d.push(curva(ponta(no(".fluxo__fontes"), "mb"), ponta(geode, "mt"), true));
        d.push(curva(ponta(geode, "mb"), ponta(mp, "mt"), true));
        d.push(curva(ponta(mp, "mb"), ponta(voce, "mt"), true));
      } else {
        caixa.querySelectorAll('.fluxo__fontes [data-no="fonte"]').forEach((f) => d.push(curva(ponta(f, "dm"), ponta(geode, "em"))));
        d.push(curva(ponta(geode, "dm"), ponta(mp, "em")));
        d.push(curva(ponta(mp, "dm"), ponta(voce, "em")));
      }
      svg.innerHTML = d.map((p, i) => `<path class="fluxo__linha" d="${p}" data-i="${i}"/>`).join("");
      caminhos = [...svg.querySelectorAll(".fluxo__linha")];
      // os pontos de luz vão numa camada <canvas> própria: mover círculos SVG a cada quadro
      // obrigava o navegador a repintar a seção inteira
      tela.width = Math.round(c.width * dpr);
      tela.height = Math.round(c.height * dpr);
      tela.style.width = c.width + "px";
      tela.style.height = c.height + "px";
      pontos = [];
      caminhos.forEach((p, i) => {
        const len = p.getTotalLength();
        const amostras = [];
        for (let k = 0; k <= 160; k++) { const q = p.getPointAtLength((k / 160) * len); amostras.push([q.x, q.y]); }
        pontos.push({ amostras, fase: (i * 0.37) % 1, vel: 0.3, r: 3.4, cor: "#005b96" });
        pontos.push({ amostras, fase: (i * 0.37 + 0.5) % 1, vel: 0.42, r: 2.4, cor: "#62a7d6" });
      });
    }
    desenha();
    window.addEventListener("resize", desenha);
    if (document.fonts) document.fonts.ready.then(desenha);
    window.addEventListener("load", desenha);
    if (reduzMovimento) { munPaths.forEach((p, i) => { if (i % 4 === 0) p.classList.add("aceso"); }); return; }

    let visivel = false;
    emVista("#fluxo", () => { visivel = true; }, () => { visivel = false; }, 0.1);
    let ultimo = 0;
    let acende = 0;
    function quadro(t) {
      requestAnimationFrame(quadro);
      if (!visivel) { ultimo = t; return; }
      const dt = Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, tela.width, tela.height);
      pontos.forEach((pt) => {
        pt.fase = (pt.fase + dt * pt.vel) % 1;
        const [x, y] = pt.amostras[Math.round(pt.fase * (pt.amostras.length - 1))];
        ctx.globalAlpha = Math.min(1, Math.sin(pt.fase * Math.PI) * 1.6);
        ctx.fillStyle = pt.cor;
        ctx.beginPath();
        ctx.arc(x, y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      });
      acende += dt;
      if (acende > 0.45 && munPaths.length) {
        acende = 0;
        const p = munPaths[Math.floor(Math.random() * munPaths.length)];
        p.classList.add("aceso");
        setTimeout(() => p.classList.remove("aceso"), 2600);
      }
    }
    requestAnimationFrame(quadro);
  })();

  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (G && ST && !reduzMovimento) {
    G.registerPlugin(ST);

    // títulos de seção sobem girando de baixo, como uma placa que se levanta
    document.querySelectorAll(".secao__cabeca, .chamada__grade").forEach((cab) => {
      G.from(cab.children, {
        y: 40, opacity: 0, rotateX: -35, transformPerspective: 700, transformOrigin: "50% 100%",
        duration: 1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: cab, start: "top 85%", once: true },
      });
    });

    // temas e fontes entram como lista
    ST.batch(".tema, .passos li, .fluxo__fontes li, .fluxo__no, .fluxo__mapa, .fluxo__voce", {
      start: "top 90%", once: true,
      onEnter: (els) => G.from(els, { y: 34, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.06, overwrite: true }),
    });

    // explorador: o cartão do mapa se deita em 3D e "pousa" conforme a rolagem
    G.fromTo(".explorar__mapa",
      { rotateX: 28, y: 80, scale: 0.92, transformPerspective: 1400, transformOrigin: "50% 100%" },
      { rotateX: 0, y: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".explorar", start: "top 95%", end: "top 35%", scrub: 0.6 } });
    G.fromTo(".ficha",
      { y: 60, opacity: 0.2 },
      { y: 0, opacity: 1, ease: "none",
        scrollTrigger: { trigger: ".explorar", start: "top 85%", end: "top 40%", scrub: 0.6 } });

    // números da faixa contam quando aparecem
    document.querySelectorAll("[data-conta]").forEach((el) => {
      const fim = +el.dataset.conta;
      const o = { v: 0 };
      G.to(o, {
        v: fim, duration: 1.4, ease: "expo.out",
        onUpdate: () => { el.textContent = Math.round(o.v); },
        scrollTrigger: { trigger: el, start: "top 95%", once: true },
      });
    });

    // faixa azul final: leve paralaxe de profundidade no título
    G.fromTo(".chamada h2", { yPercent: 30 }, {
      yPercent: -10, ease: "none",
      scrollTrigger: { trigger: ".chamada", start: "top bottom", end: "bottom top", scrub: true },
    });


    // botão da chamada final é "magnético": puxa na direção do cursor
    const ima = document.querySelector(".chamada .botao--claro");
    const zona = document.querySelector(".chamada");
    if (ima && zona && fino) {
      const mx = G.quickTo(ima, "x", { duration: 0.6, ease: "expo.out" });
      const my = G.quickTo(ima, "y", { duration: 0.6, ease: "expo.out" });
      zona.addEventListener("pointermove", (e) => {
        const r = ima.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        const k = d < 220 ? 0.32 : 0;
        mx(dx * k);
        my(dy * k);
      });
      zona.addEventListener("pointerleave", () => { mx(0); my(0); });
    }

    // texto do gráfico de crescimento entra em sequência
    G.from(".cresce__texto > *", {
      y: 36, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.07,
      scrollTrigger: { trigger: ".cresce", start: "top 75%", once: true },
    });

    window.addEventListener("load", () => ST.refresh());
  }

  /* ---------- Trilho: progresso da página na margem ---------- */
  (function trilho() {
    const nav = document.getElementById("trilho");
    if (!nav) return;
    document.documentElement.classList.add("tem-trilho");
    const pista = document.getElementById("trilho-pista");
    const cheio = document.getElementById("trilho-cheio");
    const cabeca = document.getElementById("trilho-cabeca");
    const rotulo = document.getElementById("trilho-rotulo");
    const listaMarcos = document.getElementById("trilho-marcos");
    const SECOES = [["inicio", "Início"], ["crescimento", "Crescimento"], ["temas", "Temas"], ["explorar", "Explorar"],
      ["como-usar", "Como usar"], ["fontes", "Fontes"], ["sobre", "Do dado ao mapa"]];
    let marcos = [];
    let max = 1;
    const topoDe = (el) => el.getBoundingClientRect().top + window.scrollY - (document.querySelector(".topo").offsetHeight || 0);

    function mede() {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      marcos = SECOES.map(([id, nome]) => {
        const el = document.getElementById(id);
        return el ? { id, nome, y: Math.max(0, topoDe(el)), el } : null;
      }).filter(Boolean);
      listaMarcos.innerHTML = marcos.map((m) =>
        `<li style="top:${Math.min(100, (m.y / max) * 100)}%"><button type="button" data-y="${m.y}" aria-label="Ir para ${m.nome}"><span>${m.nome}</span></button></li>`
      ).join("");
      atualiza();
    }

    let parado;
    let alturaMedida = 0;
    function atualiza() {
      // a área fixa do mapa 3D e o carregamento mudam a altura da página: remede quando mudar
      const alt = document.documentElement.scrollHeight;
      if (alt !== alturaMedida) { alturaMedida = alt; mede(); return; }
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      cheio.style.transform = `scaleY(${p})`;
      cabeca.style.top = p * 100 + "%";
      let atual = marcos[0];
      marcos.forEach((m) => { if (window.scrollY + 40 >= m.y) atual = m; });
      if (atual && rotulo.textContent !== atual.nome) rotulo.textContent = atual.nome;
      listaMarcos.querySelectorAll("button").forEach((b) => b.classList.toggle("passou", window.scrollY + 40 >= +b.dataset.y));
    }
    let pedido = false;
    window.addEventListener("scroll", () => {
      if (!pedido) { pedido = true; requestAnimationFrame(() => { pedido = false; atualiza(); }); }
      nav.classList.add("rolando");
      clearTimeout(parado);
      parado = setTimeout(() => nav.classList.remove("rolando"), 1100);
    }, { passive: true });
    window.addEventListener("resize", mede);
    window.addEventListener("load", mede);
    if (window.ScrollTrigger) window.ScrollTrigger.addEventListener("refresh", mede);
    mede();

    listaMarcos.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) window.scrollTo({ top: +b.dataset.y, behavior: reduzMovimento ? "auto" : "smooth" });
    });
    // arrastar ou clicar na pista rola a página, como uma barra de rolagem
    function rolaPara(e) {
      const r = pista.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      window.scrollTo({ top: p * max, behavior: "auto" });
    }
    pista.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".trilho__marcos")) return;
      pista.setPointerCapture(e.pointerId);
      nav.classList.add("arrastando");
      document.documentElement.style.scrollBehavior = "auto";
      rolaPara(e);
    });
    pista.addEventListener("pointermove", (e) => { if (nav.classList.contains("arrastando")) rolaPara(e); });
    const solta = () => { nav.classList.remove("arrastando"); document.documentElement.style.scrollBehavior = ""; };
    pista.addEventListener("pointerup", solta);
    pista.addEventListener("pointercancel", solta);
  })();

  pinta();
  ficha();
})();
