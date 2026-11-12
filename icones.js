/* Ícones animados dos temas (SVG 48 x 48). O estado final é o desenho parado;
   a classe .anima no contêiner toca a animação (ver dinamico.css, "ÍCONES ANIMADOS"). */
window.IDE_ICONES = {
  // barras de população subindo
  social: `
    <path class="i-linha" d="M8 39.5h32"/>
    <rect class="i-cheio i-sobe" style="--d:0s" x="10" y="27" width="7" height="12" rx="1.6" opacity=".45"/>
    <rect class="i-cheio i-sobe" style="--d:.12s" x="20.5" y="19" width="7" height="20" rx="1.6" opacity=".7"/>
    <rect class="i-cheio i-sobe" style="--d:.24s" x="31" y="11" width="7" height="28" rx="1.6"/>
    <circle class="i-cheio i-pop" style="--d:.55s" cx="34.5" cy="6.5" r="2.4"/>`,

  // globo com rota de exportação se desenhando
  comex: `
    <circle class="i-linha" cx="22" cy="26" r="13"/>
    <path class="i-linha" d="M9 26h26M22 13c3.6 3.5 5.3 8 5.3 13S25.6 35.5 22 39M22 13c-3.6 3.5-5.3 8-5.3 13s1.7 9.5 5.3 13" opacity=".55"/>
    <path class="i-linha i-traca" style="--d:.15s" pathLength="1" d="M14 33c4-14 18-24 28-22"/>
    <path class="i-cheio i-pop" style="--d:.85s" d="M42 11l-4.6-2.2.9 3.4-2.7 1.9z"/>
    <circle class="i-cheio i-pop" style="--d:.1s" cx="14" cy="33" r="2.2"/>`,

  // prédios com janelas acendendo
  empresas: `
    <path class="i-linha" d="M7 40.5h34M10 40.5V13l13-4.5v32M23 19h15v21.5"/>
    <rect class="i-cheio i-acende" style="--d:0s" x="14" y="16" width="3.5" height="3.5" rx=".6"/>
    <rect class="i-cheio i-acende" style="--d:.18s" x="14" y="23" width="3.5" height="3.5" rx=".6"/>
    <rect class="i-cheio i-acende" style="--d:.36s" x="14" y="30" width="3.5" height="3.5" rx=".6"/>
    <rect class="i-cheio i-acende" style="--d:.09s" x="27.5" y="24" width="3.5" height="3.5" rx=".6"/>
    <rect class="i-cheio i-acende" style="--d:.27s" x="32" y="24" width="3.5" height="3.5" rx=".6"/>
    <rect class="i-cheio i-acende" style="--d:.45s" x="27.5" y="31" width="3.5" height="3.5" rx=".6"/>
    <rect class="i-cheio i-acende" style="--d:.54s" x="32" y="31" width="3.5" height="3.5" rx=".6"/>`,

  // linha de admissões subindo, com seta
  empregos: `
    <path class="i-linha" d="M8 8v32h32" opacity=".55"/>
    <path class="i-linha i-traca" pathLength="1" d="M12 34l7-8 6 4 7-11 6-6"/>
    <path class="i-linha i-pop" style="--d:.8s" d="M33 13h6v6"/>
    <circle class="i-cheio i-pop" style="--d:.2s" cx="19" cy="26" r="1.9"/>
    <circle class="i-cheio i-pop" style="--d:.45s" cx="25" cy="30" r="1.9"/>`,

  // broto crescendo do chão
  agricultura: `
    <path class="i-linha" d="M9 40.5h30"/>
    <path class="i-linha i-traca" pathLength="1" d="M24 40V19"/>
    <path class="i-cheio i-folha" style="--d:.35s; --o: 0% 100%" d="M24 28c0-6.5 4.5-10.5 12-10.5 0 6.8-4.6 10.5-12 10.5z"/>
    <path class="i-cheio i-folha" style="--d:.55s; --o: 100% 100%" opacity=".7" d="M24 33c0-5.4-3.6-8.8-10-8.8 0 5.6 3.8 8.8 10 8.8z"/>
    <circle class="i-cheio i-pop" style="--d:.8s" cx="24" cy="16.5" r="2.4"/>`,

  // cabeça de boi balançando as orelhas
  pecuaria: `
    <path class="i-linha" d="M16.5 15.5c-3.5-.2-6-2.3-7-6M31.5 15.5c3.5-.2 6-2.3 7-6"/>
    <path class="i-linha i-orelha" style="--o: 100% 50%" d="M15.5 19.5l-7 1.5 6 3.5"/>
    <path class="i-linha i-orelha i-orelha--d" style="--o: 0% 50%" d="M32.5 19.5l7 1.5-6 3.5"/>
    <path class="i-linha" d="M15.5 15.5h17l-1.7 13.2C30.3 33 27.5 37 24 37s-6.3-4-6.8-8.3z"/>
    <ellipse class="i-cheio" cx="24" cy="32.6" rx="4.6" ry="3.1" opacity=".35"/>
    <circle class="i-cheio i-pisca" cx="20.2" cy="23.2" r="1.3"/>
    <circle class="i-cheio i-pisca" cx="27.8" cy="23.2" r="1.3"/>`,

  // árvore com a copa balançando ao vento
  protegidas: `
    <path class="i-linha" d="M9 40.5h30M24 40.5V33"/>
    <g class="i-copa">
      <path class="i-cheio" opacity=".35" d="M24 7l-10 12.5h5L12.5 28h7L13 35.5h22L28.5 28h7L29 19.5h5z"/>
      <path class="i-linha" d="M24 7l-10 12.5h5L12.5 28h7L13 35.5h22L28.5 28h7L29 19.5h5z"/>
    </g>
    <circle class="i-cheio i-pop" style="--d:.6s" cx="37" cy="10" r="1.6" opacity=".7"/>`,

  // gema com brilho
  minerais: `
    <path class="i-cheio" opacity=".25" d="M15 13h18l7 9-16 18L8 22z"/>
    <path class="i-linha" d="M15 13h18l7 9-16 18L8 22zM8 22h32M19 13l-3 9 8 18 8-18-3-9"/>
    <path class="i-cheio i-brilho" style="--d:.2s" d="M38 5l1.4 3.6L43 10l-3.6 1.4L38 15l-1.4-3.6L33 10l3.6-1.4z"/>
    <path class="i-cheio i-brilho" style="--d:.55s" d="M10 6l.9 2.1L13 9l-2.1.9L10 12l-.9-2.1L7 9l2.1-.9z"/>`,

  // gota caindo e ondas na água
  geoambiental: `
    <ellipse class="i-linha i-onda" style="--d:.45s" cx="24" cy="38" rx="14" ry="3.2"/>
    <ellipse class="i-linha i-onda" style="--d:.7s" cx="24" cy="38" rx="14" ry="3.2"/>
    <g class="i-gota">
      <path class="i-cheio" opacity=".3" d="M24 7s9 9.6 9 16a9 9 0 0 1-18 0c0-6.4 9-16 9-16z"/>
      <path class="i-linha" d="M24 7s9 9.6 9 16a9 9 0 0 1-18 0c0-6.4 9-16 9-16z"/>
      <path class="i-linha" d="M19.8 23.5a4.3 4.3 0 0 0 4.2 4.2"/>
    </g>`,

  // batimento cardíaco
  saude: `
    <rect class="i-linha" x="7" y="10" width="34" height="28" rx="5" opacity=".45"/>
    <path class="i-linha i-traca" pathLength="1" d="M10 25h7l3-7 4.5 13 3.5-9 2 3h8"/>
    <path class="i-cheio i-pop i-pulsa" style="--d:.8s" d="M36.5 14.2h2v-2h1.8v2h2V16h-2v2h-1.8v-2h-2z"/>`,

  camadas: `<path class="i-linha" d="M24 8l17 9-17 9-17-9z"/><path class="i-linha" d="M7 25l17 9 17-9M7 32l17 9 17-9" opacity=".6"/>`,
};
