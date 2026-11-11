/* Página de acomodações: sol que nasce e se põe com a rolagem, filtro por cidade e pôr do sol final. */
(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raiz = document.documentElement;
  const topo = document.querySelector(".vt-cine");
  const pds = document.querySelector(".por-do-sol");

  /* ── Rolagem: o sol desce e o céu esquenta; no fim, o sol se põe no mar ── */
  if (!reduzir) {
    let pedido = false;
    const atualizar = () => {
      pedido = false;
      if (topo) {
        const h = topo.offsetHeight || 1;
        const p = Math.min(1, Math.max(0, scrollY / h));
        topo.style.setProperty("--rol", p.toFixed(3));
      }
      if (pds) {
        const r = pds.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height * 0.4)));
        pds.style.setProperty("--pds", p.toFixed(3));
      }
    };
    addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
    addEventListener("resize", atualizar);
    atualizar();
  }
  requestAnimationFrame(() => topo && topo.classList.add("amanheceu"));

  /* ── Som dos achados (gerado no navegador). Só toca depois do primeiro toque/clique na página. ── */
  let ctx = null, livreEm = 0;
  const audio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };
  ["pointerup", "touchend", "click", "keydown"].forEach((ev) => addEventListener(ev, audio, { passive: true }));
  const tom = (c, t, f, v, d, tipo = "sine", de = 1) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f * de, t);
    if (de !== 1) o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.03);
  };
  const SONS = {
    estrela: (c, t) => { tom(c, t, 1318.5, 0.09, 0.4, "sine", 0.85); tom(c, t + 0.07, 1975.5, 0.05, 0.35); },          // plim brilhante
    vieira: (c, t) => { tom(c, t, 2637, 0.05, 0.12, "triangle"); tom(c, t + 0.05, 3136, 0.04, 0.12, "triangle"); },     // tilintar de concha
    conchinha: (c, t) => { tom(c, t, 3520, 0.04, 0.09, "triangle"); tom(c, t + 0.04, 2960, 0.03, 0.1, "triangle"); },
    buzio: (c, t) => { tom(c, t, 660, 0.07, 0.5, "sine", 0.7); tom(c, t, 990, 0.025, 0.4); },                           // "uuu" de búzio
    coral: (c, t) => [0, 1, 2].forEach((k) => tom(c, t + k * 0.05, [1568, 2093, 2637][k], 0.04, 0.18)),               // cascatinha
    caranguejo: (c, t) => [0, 1, 2, 3].forEach((k) => tom(c, t + k * 0.06, 1800 + k * 120, 0.035, 0.04, "square")),    // tec-tec-tec
    pegadas: (c, t) => [0, 1].forEach((k) => { tom(c, t + k * 0.16, 220, 0.06, 0.08, "sine", 1.6); }),                 // passinhos na areia
  };
  const somDoAchado = (el) => {
    if (!ctx || ctx.state !== "running") return;
    const tipo = el.dataset.tipo; if (!SONS[tipo]) return;
    const t = Math.max(ctx.currentTime + 0.02, livreEm);
    SONS[tipo](ctx, t);
    livreEm = t + 0.12; // não encavala quando vários aparecem juntos
  };
  const achar = (el) => { if (el.classList.contains("achou")) return; el.classList.add("achou"); somDoAchado(el); };

  /* ── A água se recolhe para o meio conforme a rolagem; os achados aparecem na areia descoberta ── */
  const mar = document.querySelector(".mar-fixo");
  const agua = document.querySelector(".agua");
  const achadosAgua = [...document.querySelectorAll(".achado--agua")];
  const achadosPraia = [...document.querySelectorAll(".achado--praia")];
  if (mar && agua) {
    let pedido2 = false;
    const suave = (x) => x * x * (3 - 2 * x);
    const secar = () => {
      pedido2 = false;
      const r = agua.getBoundingClientRect();
      // começa quando o topo da água chega ao meio da tela; termina perto do fim dos cartazes
      const p = (innerHeight * 0.5 - r.top) / (r.height * 0.85);
      const seca = reduzir ? (p > 0.5 ? 1 : 0) : suave(Math.min(1, Math.max(0, p)));
      mar.style.setProperty("--seca", seca.toFixed(4));
      raiz.style.setProperty("--seca", seca.toFixed(4));
      const descoberto = seca * 50; // % de areia descoberta em cada lado
      achadosAgua.forEach((a) => {
        if (a.classList.contains("achou")) return;
        const ar = a.getBoundingClientRect();
        if (descoberto > +a.dataset.d + 1.5 && ar.top < innerHeight * 0.92 && ar.bottom > 0) achar(a);
      });
    };
    addEventListener("scroll", () => { if (!pedido2) { pedido2 = true; requestAnimationFrame(secar); } }, { passive: true });
    addEventListener("resize", secar);
    secar();
  }
  if (achadosPraia.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { const el = e.target; setTimeout(() => achar(el), Math.random() * 400); io.unobserve(el); }
    }), { rootMargin: "0px 0px -12% 0px" });
    achadosPraia.forEach((a) => io.observe(a));
  }

  /* ── Brilho do sol na água: pontinhos que piscam ── */
  const cint = document.querySelector(".cintilar");
  if (cint && !reduzir) {
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("i");
      s.style.left = (45.5 + Math.random() * 9).toFixed(1) + "%";
      s.style.top = (Math.random() * 100).toFixed(1) + "%";
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
      s.style.animationDuration = (1.6 + Math.random() * 2).toFixed(2) + "s";
      s.style.setProperty("--w", (6 + Math.random() * 18).toFixed(0) + "px");
      cint.appendChild(s);
    }
  }

  /* ── Filtro por cidade ── */
  const vitrine = document.querySelector(".vitrine");
  const botoes = [...document.querySelectorAll(".filtro")];
  if (vitrine && botoes.length) {
    const cartazes = [...vitrine.querySelectorAll(".cartaz:not(.cartaz--prop)")];
    const cidadeDe = (c) => {
      const t = (c.querySelector(".cartaz-local")?.textContent || "").toLowerCase();
      if (t.includes("mariscal") || t.includes("bombinhas")) return "mariscal";
      if (t.includes("itapema")) return "itapema";
      return "garopaba";
    };
    cartazes.forEach((c) => (c.dataset.cidade = cidadeDe(c)));
    // some botão de cidade sem nenhum imóvel
    botoes.forEach((b) => { const k = b.dataset.cidade; if (k !== "todas" && !cartazes.some((c) => c.dataset.cidade === k)) b.hidden = true; });

    const filtrar = (k) => {
      botoes.forEach((b) => { const on = b.dataset.cidade === k; b.classList.toggle("ativo", on); b.setAttribute("aria-pressed", String(on)); });
      let ordem = 0;
      cartazes.forEach((c) => {
        const mostra = k === "todas" || c.dataset.cidade === k;
        if (mostra) {
          c.hidden = false;
          c.classList.remove("saindo");
          c.classList.add("visto");
          c.style.setProperty("--ordem", ordem++);
          c.classList.remove("entrando"); void c.offsetWidth; c.classList.add("entrando");
        } else if (!c.hidden) {
          c.classList.add("saindo");
          setTimeout(() => { if (c.classList.contains("saindo")) c.hidden = true; }, reduzir ? 0 : 380);
        }
      });
    };
    botoes.forEach((b) => b.addEventListener("click", () => {
      filtrar(b.dataset.cidade);
      const alvo = vitrine.getBoundingClientRect().top + scrollY - 110;
      if (scrollY < alvo - 40) setTimeout(() => scrollTo({ top: alvo, behavior: reduzir ? "auto" : "smooth" }), 120);
    }));
  }
})();
