/* Caranguejos que andam de lado pela página conforme a rolagem; param quando a rolagem para. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const SVG = `<svg viewBox="0 0 80 56" aria-hidden="true">
    <ellipse class="cg-sombra" cx="40" cy="52" rx="26" ry="3.5" fill="#6E4F2E" opacity=".25"/>
    <g class="cg-pernas cg-pernas--a" stroke="var(--cg-escuro)" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M24 34 L12 40 L8 48"/><path d="M26 38 L16 46 L14 52"/><path d="M56 34 L68 40 L72 48"/><path d="M54 38 L64 46 L66 52"/>
    </g>
    <g class="cg-pernas cg-pernas--b" stroke="var(--cg-escuro)" stroke-width="3" stroke-linecap="round" fill="none">
      <path d="M25 36 L14 43 L11 50"/><path d="M55 36 L66 43 L69 50"/>
    </g>
    <g class="cg-garra cg-garra--e"><path d="M26 26 C18 22 12 16 14 10" stroke="var(--cg-cor)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M14 10 C8 8 6 2 11 1 C15 0 18 4 17 8 Z" fill="var(--cg-cor)"/><path class="cg-pinca" d="M14 10 C10 12 8 9 9 6" stroke="var(--cg-cor)" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <g class="cg-garra cg-garra--d"><path d="M54 26 C62 22 68 16 66 10" stroke="var(--cg-cor)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M66 10 C72 8 74 2 69 1 C65 0 62 4 63 8 Z" fill="var(--cg-cor)"/><path class="cg-pinca" d="M66 10 C70 12 72 9 71 6" stroke="var(--cg-cor)" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <ellipse cx="40" cy="33" rx="18" ry="12" fill="var(--cg-cor)"/>
    <ellipse cx="36" cy="29" rx="9" ry="4" fill="var(--cg-luz)" opacity=".7"/>
    <path d="M34 22 L33 15 M46 22 L47 15" stroke="var(--cg-escuro)" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="33" cy="14" r="3.4" fill="#fff"/><circle cx="47" cy="14" r="3.4" fill="#fff"/>
    <circle class="cg-olho" cx="33.6" cy="14.4" r="1.7" fill="#222"/><circle class="cg-olho" cx="47.6" cy="14.4" r="1.7" fill="#222"/>
    <path d="M36 38 Q40 41 44 38" stroke="var(--cg-escuro)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;

  // topo (% da tela), tamanho, velocidade (px de deslocamento por px rolado), direção, ponto de partida (0–1)
  const BICHOS = [
    { top: 30, tam: 46, vel: 0.55, dir: 1, ini: 0.1, cor: "#E0613F", escuro: "#B9472A", luz: "#F08A68" },   // vermelho-coral
    { top: 58, tam: 40, vel: 0.8, dir: -1, ini: 0.6, cor: "#E9A23B", escuro: "#B97A1F", luz: "#F6C873" },   // âmbar
    { top: 82, tam: 50, vel: 0.42, dir: 1, ini: 0.4, cor: "#3D7FB8", escuro: "#285C8A", luz: "#7FB2DC" },   // azul
  ];

  const els = BICHOS.map((b, i) => {
    const el = document.createElement("span");
    el.className = "caranguejo";
    el.style.top = b.top + "%";
    el.style.width = b.tam + "px";
    el.style.setProperty("--cg-cor", b.cor); el.style.setProperty("--cg-escuro", b.escuro); el.style.setProperty("--cg-luz", b.luz);
    el.style.setProperty("--atraso", (i * 0.13).toFixed(2) + "s");
    el.innerHTML = SVG;
    document.body.appendChild(el);
    return el;
  });

  let parado = null, pedido = false;
  const mover = () => {
    pedido = false;
    const largura = innerWidth + 120;
    BICHOS.forEach((b, i) => {
      const anda = scrollY * b.vel * b.dir + b.ini * largura;
      const x = ((anda % largura) + largura) % largura - 60;
      const pulo = Math.sin(scrollY / 40 + i) * 2;
      els[i].style.transform = `translate3d(${x.toFixed(1)}px, ${pulo.toFixed(1)}px, 0)`;
    });
  };
  addEventListener("scroll", () => {
    els.forEach((e) => e.classList.add("andando"));
    clearTimeout(parado);
    parado = setTimeout(() => els.forEach((e) => e.classList.remove("andando")), 180);
    if (!pedido) { pedido = true; requestAnimationFrame(mover); }
  }, { passive: true });
  addEventListener("resize", mover);
  mover();
  requestAnimationFrame(() => els.forEach((e) => e.classList.add("chegou")));
})();
