/* Camada cinematográfica do site inteiro: abertura, rolagem suave, barra de progresso,
   títulos palavra por palavra e transição entre páginas. */
(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raiz = document.documentElement;

  /* 1 · Abertura com a logo (uma vez por visita) */
  let jaViu = false;
  try { jaViu = sessionStorage.getItem("abertura-vista") === "1"; sessionStorage.setItem("abertura-vista", "1"); } catch (e) {}
  if (!reduzir && !jaViu) {
    const cortina = document.createElement("div");
    cortina.className = "abertura";
    cortina.innerHTML = '<img src="assets/logo.png" alt=""><span class="abertura-linha"></span>';
    document.body.appendChild(cortina);
    const sair = () => { cortina.classList.add("sai"); setTimeout(() => cortina.remove(), 1300); };
    if (document.readyState === "complete") setTimeout(sair, 1100);
    else addEventListener("load", () => setTimeout(sair, 700));
    setTimeout(sair, 3500); // nunca prende a página
  }

  /* 2 · Rolagem suave (Lenis), se a biblioteca carregou */
  if (!reduzir && window.Lenis && !matchMedia("(pointer: coarse)").matches) {
    const lenis = new Lenis({ duration: 0.75, smoothWheel: true });
    const quadro = (t) => { lenis.raf(t); requestAnimationFrame(quadro); };
    requestAnimationFrame(quadro);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (alvo) { e.preventDefault(); lenis.scrollTo(alvo, { offset: -70 }); }
    }));
    window.__lenis = lenis;
  }

  /* 3 · Barra de progresso da leitura */
  const barra = document.createElement("div");
  barra.className = "progresso";
  document.body.appendChild(barra);
  const progresso = () => {
    const max = raiz.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener("scroll", () => requestAnimationFrame(progresso), { passive: true });
  progresso();

  /* 4 · Títulos das seções entram palavra por palavra */
  if (!reduzir) {
    document.querySelectorAll(".historia h2, .proprietario h2, .contato h2, .ficha h2, .ficha-titulo h2").forEach((h) => {
      if (h.dataset.dividido) return;
      h.dataset.dividido = "1";
      h.classList.add("cinetitulo");
      h.innerHTML = h.textContent.trim().split(/\s+/)
        .map((w, i) => `<span class="palavra"><span style="transition-delay:${i * 55}ms">${w}</span></span>`).join(" ");
      new IntersectionObserver(([e], o) => { if (e.isIntersecting) { h.classList.add("entrou"); o.disconnect(); } }, { threshold: 0.4 }).observe(h);
    });
  }

  /* 5 · Transição suave entre as páginas do site */
  if (!reduzir && !("onpagereveal" in window)) {
    document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((a) => {
      if (a.target === "_blank" || a.origin !== location.origin) return;
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        raiz.classList.add("saindo");
        setTimeout(() => (location.href = a.href), 420);
      });
    });
    addEventListener("pageshow", () => raiz.classList.remove("saindo"));
  }
})();

/* ── Rodapé interativo e carrossel de "Outras acomodações" no celular (todas as páginas) ── */
(() => {
  const painel = document.querySelector(".rodape-painel");
  if (painel) {
    const naInicial = !!document.querySelector(".inicio");
    const base = naInicial ? "" : "index.html";
    const links = document.createElement("nav");
    links.className = "rod-links";
    links.setAttribute("aria-label", "Links do rodapé");
    const itens = [["#historia", "Nossa história"], ["#servicos", "Nossa gestão"], ["#perguntas", "Dúvidas"], ["#contato", "Seja parceiro"]];
    links.innerHTML = itens.map(([h, t]) => '<a href="' + base + h + '">' + t + "</a>").join("") +
      '<a href="acomodacoes.html">Acomodações</a><a href="https://wa.me/5548991451520?text=Ol%C3%A1%21%20Vim%20pelo%20site%20do%20Anfitri%C3%A3o%20do%20Litoral%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es." target="_blank" rel="noopener">WhatsApp</a>';
    painel.appendChild(links);
    const topo = document.createElement("button");
    topo.type = "button";
    topo.className = "rod-topo";
    topo.setAttribute("aria-label", "Voltar ao topo");
    topo.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
    topo.addEventListener("click", () => (window.__lenis ? window.__lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" })));
    painel.appendChild(topo);
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { painel.classList.add("rod-visto"); o.disconnect(); } }, { threshold: 0.3 }).observe(painel);
  }

  const mini = document.querySelector(".vitrine--mini");
  if (mini && matchMedia("(max-width: 760px)").matches) {
    const cards = [...mini.children];
    const dica = document.createElement("div");
    dica.className = "mini-dica";
    dica.innerHTML = '<svg viewBox="0 0 22 14"><path d="M2 7h18M15 2l5 5-5 5"/></svg>Deslize para ver mais';
    mini.before(dica);
    const pontos = document.createElement("div");
    pontos.className = "mini-pontos";
    pontos.setAttribute("aria-hidden", "true");
    pontos.innerHTML = cards.map(() => "<i></i>").join("");
    mini.after(pontos);
    const bolas = [...pontos.children];
    const marcar = () => {
      const c = mini.scrollLeft + mini.clientWidth / 2;
      let m = 0, d = Infinity;
      cards.forEach((el, k) => { const x = Math.abs(el.offsetLeft + el.offsetWidth / 2 - c); if (x < d) { d = x; m = k; } });
      bolas.forEach((b, k) => b.classList.toggle("ativo", k === m));
    };
    mini.addEventListener("scroll", () => requestAnimationFrame(marcar), { passive: true });
    marcar();
  }
})();
