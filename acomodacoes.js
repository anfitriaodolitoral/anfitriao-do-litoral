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


  /* ── Achados nos cantos dos cartazes: aparecem quando o canto entra na tela, cada um com seu som ── */
  const ACHADOS_SVG = {"estrela": "<svg viewBox=\"0 0 60 60\"><path d=\"M30 3 C33 14 36 20 46 22 C57 24 57 27 48 32 C40 37 40 41 43 52 C45 59 41 59 34 53 C30 49 28 49 23 53 C16 59 13 58 16 51 C20 41 19 37 11 32 C2 27 3 24 14 22 C24 20 27 14 30 3Z\" fill=\"#E8834E\"/><g fill=\"#F6B07E\"><circle cx=\"30\" cy=\"14\" r=\"1.6\"/><circle cx=\"30\" cy=\"22\" r=\"1.6\"/><circle cx=\"44\" cy=\"27\" r=\"1.6\"/><circle cx=\"38\" cy=\"29\" r=\"1.6\"/><circle cx=\"16\" cy=\"27\" r=\"1.6\"/><circle cx=\"22\" cy=\"29\" r=\"1.6\"/><circle cx=\"40\" cy=\"46\" r=\"1.6\"/><circle cx=\"35\" cy=\"39\" r=\"1.6\"/><circle cx=\"20\" cy=\"46\" r=\"1.6\"/><circle cx=\"25\" cy=\"39\" r=\"1.6\"/></g><circle cx=\"30\" cy=\"31\" r=\"3\" fill=\"#D46A37\"/></svg>", "vieira": "<svg viewBox=\"0 0 60 56\"><path d=\"M30 52 C12 50 3 34 6 20 C9 8 22 3 30 3 C38 3 51 8 54 20 C57 34 48 50 30 52Z\" fill=\"#F3D3BE\"/><g stroke=\"#D9A88A\" stroke-width=\"1.6\" fill=\"none\"><path d=\"M30 52 L30 5\"/><path d=\"M30 52 L20 7\"/><path d=\"M30 52 L40 7\"/><path d=\"M30 52 L11 13\"/><path d=\"M30 52 L49 13\"/><path d=\"M30 52 L6 24\"/><path d=\"M30 52 L54 24\"/></g><path d=\"M22 50 L30 56 L38 50Z\" fill=\"#E7B99C\"/></svg>", "buzio": "<svg viewBox=\"0 0 60 60\"><path d=\"M10 50 C8 30 22 10 46 6 C52 5 54 10 50 14 C44 20 46 30 40 40 C34 50 18 56 10 50Z\" fill=\"#EBD2B4\"/><path d=\"M14 46 C22 40 30 30 34 18 M20 50 C28 44 36 34 40 22 M12 38 C20 32 26 24 30 14\" stroke=\"#C9A27E\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M46 6 C52 5 54 10 50 14 C47 12 45 9 46 6Z\" fill=\"#B98B66\"/></svg>", "conchinha": "<svg viewBox=\"0 0 40 30\"><path d=\"M20 28 C8 27 3 18 6 11 C9 4 31 4 34 11 C37 18 32 27 20 28Z\" fill=\"#F7E6DA\"/><path d=\"M20 28 L13 7 M20 28 L20 5 M20 28 L27 7\" stroke=\"#E0B9A4\" stroke-width=\"1.3\"/></svg>", "coral": "<svg viewBox=\"0 0 60 60\"><path d=\"M30 56 L30 34 M30 40 L18 26 M18 26 L12 14 M18 26 L22 12 M30 34 L42 22 M42 22 L48 10 M42 22 L38 10 M30 34 L30 16\" stroke=\"#F08C7A\" stroke-width=\"5\" stroke-linecap=\"round\" fill=\"none\"/><g fill=\"#F6A99B\"><circle cx=\"12\" cy=\"14\" r=\"3\"/><circle cx=\"22\" cy=\"12\" r=\"3\"/><circle cx=\"48\" cy=\"10\" r=\"3\"/><circle cx=\"38\" cy=\"10\" r=\"3\"/><circle cx=\"30\" cy=\"16\" r=\"3\"/></g></svg>", "caranguejo": "<svg viewBox=\"0 0 70 50\"><ellipse cx=\"35\" cy=\"30\" rx=\"16\" ry=\"11\" fill=\"#E0613F\"/><path d=\"M20 30 L8 36 M20 34 L10 42 M50 30 L62 36 M50 34 L60 42\" stroke=\"#C94F30\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M22 24 C14 20 10 12 14 8 C18 4 22 10 20 14 M48 24 C56 20 60 12 56 8 C52 4 48 10 50 14\" stroke=\"#E0613F\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"20\" r=\"3\" fill=\"#fff\"/><circle cx=\"40\" cy=\"20\" r=\"3\" fill=\"#fff\"/><circle cx=\"30\" cy=\"20\" r=\"1.5\" fill=\"#222\"/><circle cx=\"40\" cy=\"20\" r=\"1.5\" fill=\"#222\"/></svg>", "pegadas": "<svg viewBox=\"0 0 50 90\"><g fill=\"#B99467\" opacity=\".55\"><ellipse cx=\"14\" cy=\"62\" rx=\"7\" ry=\"11\"/><circle cx=\"8\" cy=\"47\" r=\"2.2\"/><circle cx=\"12\" cy=\"45\" r=\"2\"/><circle cx=\"16\" cy=\"45\" r=\"2\"/><circle cx=\"20\" cy=\"47\" r=\"1.8\"/><ellipse cx=\"36\" cy=\"28\" rx=\"7\" ry=\"11\"/><circle cx=\"30\" cy=\"13\" r=\"2.2\"/><circle cx=\"34\" cy=\"11\" r=\"2\"/><circle cx=\"38\" cy=\"11\" r=\"2\"/><circle cx=\"42\" cy=\"13\" r=\"1.8\"/></g></svg>"};
  const vit = document.querySelector(".vitrine");
  if (vit) {
    const ordemTipos = ["estrela", "vieira", "caranguejo", "buzio", "conchinha", "coral", "pegadas", "estrela", "vieira", "buzio", "caranguejo", "conchinha"];
    const cantos = ["ie", "sd", "id", "se"]; // inferior esquerdo, superior direito, inferior direito, superior esquerdo
    const pares = [...vit.querySelectorAll(".cartaz")].map((c, i) => {
      const tipo = ordemTipos[i % ordemTipos.length];
      const el = document.createElement("span");
      el.className = "achado achado--canto";
      el.dataset.tipo = tipo;
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = ACHADOS_SVG[tipo];
      const tam = tipo === "conchinha" ? 34 : tipo === "pegadas" ? 40 : tipo === "caranguejo" ? 56 : 48;
      el.style.width = tam + "px";
      el.style.setProperty("--giro", ((i * 47) % 60 - 30) + "deg");
      vit.appendChild(el);
      return { c, el, tam, canto: cantos[i % cantos.length] };
    });
    const posicionar = () => pares.forEach(({ c, el, tam, canto }) => {
      el.style.display = c.hidden ? "none" : "";
      if (c.hidden) return;
      const x = c.offsetLeft + (canto.includes("e") && canto !== "se" && canto !== "ie" ? 0 : 0);
      const esquerda = canto === "ie" || canto === "se";
      const baixo = canto === "ie" || canto === "id";
      el.style.left = (c.offsetLeft + (esquerda ? -tam * 0.35 : c.offsetWidth - tam * 0.65)) + "px";
      el.style.top = (c.offsetTop + (baixo ? c.offsetHeight - tam * 0.55 : -tam * 0.45)) + "px";
    });
    posicionar();
    addEventListener("resize", posicionar);
    addEventListener("load", posicionar);
    document.querySelectorAll(".filtro").forEach((b) => b.addEventListener("click", () => setTimeout(posicionar, 450)));
    const ioC = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { const el = e.target; setTimeout(() => achar(el), 120 + Math.random() * 300); ioC.unobserve(el); }
    }), { rootMargin: "0px 0px -15% 0px" });
    pares.forEach(({ el }) => ioC.observe(el));
  }

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
