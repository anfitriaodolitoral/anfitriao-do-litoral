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

  /* ── Brilho do sol na água: pontinhos que piscam ── */
  const cint = document.querySelector(".cintilar");
  if (cint && !reduzir) {
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("i");
      s.style.left = (52 + Math.random() * 40).toFixed(1) + "%";
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
