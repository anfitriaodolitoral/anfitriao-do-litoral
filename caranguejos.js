/* Caranguejos que andam de lado pela página conforme a rolagem e interagem:
   deixam pegadas, correm e levantam areia na rolagem rápida, se encontram e comemoram,
   acenam quando a rolagem para e pulam quando tocados. Sons curtos gerados no navegador
   (só depois do primeiro toque/clique na página, regra dos navegadores). */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const SVG = `<svg viewBox="0 0 80 56" aria-hidden="true">
    <ellipse class="cg-sombra" cx="40" cy="52" rx="26" ry="3.5" fill="#6E4F2E" opacity=".25"/>
    <g class="cg-corpo">
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
    <path class="cg-boca" d="M36 38 Q40 41 44 38" stroke="var(--cg-escuro)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;

  const BICHOS = [
    { top: 30, tam: 46, vel: 0.55, dir: 1, ini: 0.1, cor: "#E0613F", escuro: "#B9472A", luz: "#F08A68" },
    { top: 82, tam: 50, vel: 0.42, dir: 1, ini: 0.4, cor: "#3D7FB8", escuro: "#285C8A", luz: "#7FB2DC" },
  ];
  const FALAS = ["Oi!", "Bem-vindo à praia!", "Escolhe uma casa!", "Que dia lindo!", "Vem pra Garopaba!", "Tem lugar pra você!"];

  /* ── som ── */
  let ctx = null;
  const audio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };
  ["pointerup", "touchend", "click", "keydown"].forEach((ev) => addEventListener(ev, audio, { passive: true }));
  const tom = (t, f, v, d, tipo = "sine", de = 1) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f * de, t);
    if (de !== 1) o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
  };
  const som = (tipo) => {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.02;
    if (tipo === "tec") [0, 1, 2].forEach((k) => tom(t + k * 0.06, 1900 + k * 140, 0.03, 0.04, "square"));
    if (tipo === "oi") { tom(t, 880, 0.06, 0.16, "sine", 0.7); tom(t + 0.12, 1175, 0.06, 0.2, "sine", 0.85); }
    if (tipo === "festa") [0, 1, 2, 3].forEach((k) => tom(t + k * 0.07, [784, 988, 1175, 1568][k], 0.05, 0.16));
    if (tipo === "pulo") tom(t, 660, 0.07, 0.18, "sine", 0.5);
    if (tipo === "tec1") tom(t, 2400 + Math.random() * 500, 0.018, 0.03, "square");
    if (tipo === "chega") { tom(t, 392, 0.05, 0.5, "sine", 0.6); tom(t + 0.1, 587, 0.04, 0.6); }
  };

  /* ── criação ── */
  const bichos = BICHOS.map((b, i) => {
    const el = document.createElement("span");
    el.className = "caranguejo";
    el.style.top = b.top + "%";
    el.style.width = b.tam + "px";
    el.style.setProperty("--cg-cor", b.cor); el.style.setProperty("--cg-escuro", b.escuro); el.style.setProperty("--cg-luz", b.luz);
    el.style.setProperty("--atraso", (i * 0.13).toFixed(2) + "s");
    el.innerHTML = SVG + '<span class="cg-balao"></span>';
    document.body.appendChild(el);
    return { ...b, el, balao: el.querySelector(".cg-balao"), x: 0, ultimaPegada: null, ocupado: false };
  });

  const efeito = (cls, x, y, html = "", vida = 1600) => {
    const e = document.createElement("span");
    e.className = cls; e.innerHTML = html;
    e.style.left = x + "px"; e.style.top = y + "px";
    document.body.appendChild(e);
    setTimeout(() => e.remove(), vida);
    return e;
  };
  const CORACAO = '<svg viewBox="0 0 24 22"><path d="M12 21 C5 15 1 11 1 6.5 A5.5 5.5 0 0 1 12 4 A5.5 5.5 0 0 1 23 6.5 C23 11 19 15 12 21Z" fill="#E8564A"/></svg>';

  const noMeio = (b) => b.x > innerWidth * 0.25 && b.x + b.tam < innerWidth * 0.75;
  const falar = (b, texto, ms = 1800) => {
    if (!noMeio(b)) return;
    b.balao.textContent = texto;
    b.el.classList.remove("falando"); void b.el.offsetWidth; b.el.classList.add("falando");
    clearTimeout(b.tFala); b.tFala = setTimeout(() => b.el.classList.remove("falando"), ms);
  };
  const acao = (b, cls, ms) => {
    b.el.classList.remove(cls); void b.el.offsetWidth; b.el.classList.add(cls);
    b.ocupado = true;
    setTimeout(() => { b.el.classList.remove(cls); b.ocupado = false; }, ms);
  };

  /* ── movimento + interações ── */
  let parado = null, pedido = false, ultimoY = scrollY, ultimoEncontro = 0, ultimaFala = 0;
  const posY = (b) => innerHeight * b.top / 100;
  const mover = () => {
    pedido = false;
    const delta = Math.abs(scrollY - ultimoY); ultimoY = scrollY;
    const rapido = delta > 34;
    const largura = innerWidth + 120;
    bichos.forEach((b, i) => {
      const anda = scrollY * b.vel * b.dir + b.ini * largura;
      const x = ((anda % largura) + largura) % largura - 60;
      const pulo = Math.sin(scrollY / 40 + i) * 2;
      b.x = x;
      if (b === naFrente) { // vai para o centro da tela para o convite ficar inteiro
        const cx = innerWidth / 2 - b.tam / 2;
        const s = innerWidth > 860 ? 1.9 : 1.7;
        b.el.style.transform = `translate3d(${cx.toFixed(1)}px, 0, 0) scale(${s})`;
        b.x = cx; return;
      }
      b.el.style.transform = `translate3d(${x.toFixed(1)}px, ${pulo.toFixed(1)}px, 0)`;
      b.el.classList.toggle("correndo", rapido);
      // pegadas na areia
      const pe = x + b.tam / 2, y = posY(b) + b.tam * 0.62;
      if (b.ultimaPegada === null || Math.abs(pe - b.ultimaPegada) > 22) {
        if (b.ultimaPegada !== null && Math.abs(pe - b.ultimaPegada) < 200) efeito("cg-pegada", pe, y + (Math.random() * 4 - 2), "<i></i><i></i>", 2200);
        b.ultimaPegada = pe;
      }
      // areia levantada quando corre
      if (rapido && Math.random() < 0.35) {
        const a = efeito("cg-areia", pe - b.dir * b.tam * 0.4, y, "<i></i><i></i><i></i>", 700);
        a.style.setProperty("--lado", -b.dir);
      }
    });
    // encontro: dois caranguejos se cruzam na horizontal
    const agora = performance.now();
    if (agora - ultimoEncontro > 2500) {
      for (let i = 0; i < bichos.length; i++) for (let j = i + 1; j < bichos.length; j++) {
        const a = bichos[i], c = bichos[j];
        if (Math.abs(a.x - c.x) < 34 && a.x > 0 && a.x < innerWidth - 40) {
          ultimoEncontro = agora;
          acao(a, "festa", 1100); acao(c, "festa", 1100);
          const mx = (a.x + c.x) / 2 + 20, my = (posY(a) + posY(c)) / 2;
          som("festa");
          i = bichos.length; break;
        }
      }
    }
  };

  /* ── 2 aparições na frente dos cartões, com o convite ── */
  const MARCOS = [0.22, 0.62];
  const FRASES = ["Oi! Venha se hospedar com o Anfitrião do Litoral!", "Escolha sua casa e reserve pelo WhatsApp."];
  const cena = document.createElement("div");
  cena.className = "cg-cena";
  document.body.appendChild(cena);
  const digitar = (b, texto, fim) => {
    const balao = b.el.querySelector(".cg-balao");
    balao.textContent = "";
    b.el.classList.add("falando-fixo");
    let k = 0;
    const passo = () => {
      balao.textContent = texto.slice(0, ++k);
      if (k % 2 === 0) som("tec1");
      if (k < texto.length) setTimeout(passo, 38); else setTimeout(fim, 1900);
    };
    passo();
  };
  const feitos = new Set();
  let naFrente = null;
  let falasFeitas = 0;
  const aparecer = () => {
    const visiveis = bichos.filter((b) => b.x > 0 && b.x < innerWidth - 40);
    const b = visiveis.length ? visiveis[0] : bichos[falasFeitas % bichos.length];
    const texto = FRASES[falasFeitas++ % FRASES.length];
    naFrente = b;
    b.ocupado = true;
    b.el.classList.add("na-frente", "andando");
    cena.style.setProperty("--fx", "50%");
    cena.style.setProperty("--fy", "calc(" + b.top + "% + 10px)");
    cena.classList.add("on");
    requestAnimationFrame(mover);
    som("chega");
    const balao = b.el.querySelector(".cg-balao");
    balao.classList.add("cg-balao--longo");
    setTimeout(() => {
      if (naFrente !== b) return;
      b.el.classList.remove("andando");
      b.el.classList.add("acena");
      digitar(b, texto, () => {
        b.el.classList.remove("falando-fixo", "acena", "na-frente");
        balao.classList.remove("cg-balao--longo");
        cena.classList.remove("on");
        naFrente = null; b.ocupado = false;
        requestAnimationFrame(mover);
      });
    }, 900);
  };
  const conferirMarcos = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const p = scrollY / max;
    MARCOS.forEach((m, i) => { if (!feitos.has(i) && p >= m && !naFrente) { feitos.add(i); aparecer(); } });
  };

  addEventListener("scroll", () => {
    conferirMarcos();
    bichos.forEach((b) => { b.el.classList.add("andando"); if (b !== naFrente) b.el.classList.remove("acena"); });
    clearTimeout(parado);
    parado = setTimeout(() => {
      bichos.forEach((b) => b.el.classList.remove("andando", "correndo"));
      // pausa: um caranguejo visível acena e fala
      const agora = performance.now();
      if (agora - ultimaFala < 2600) return;
      if (naFrente) return;
      const visiveis = bichos.filter((b) => noMeio(b) && !b.ocupado);
      if (!visiveis.length) return;
      const b = visiveis[Math.floor(Math.random() * visiveis.length)];
      ultimaFala = agora;
      acao(b, "acena", 1600);
    }, 650);
    if (!pedido) { pedido = true; requestAnimationFrame(mover); }
  }, { passive: true });

  // tocar no caranguejo
  bichos.forEach((b) => b.el.addEventListener("click", () => {
    audio();
    acao(b, "pulo", 700);
    setTimeout(() => som("pulo"), 30);
    setTimeout(() => som("tec"), 260);
  }));

  addEventListener("resize", mover);
  mover();
  requestAnimationFrame(() => bichos.forEach((b) => b.el.classList.add("chegou")));
  // chegada: o primeiro dá oi

})();
