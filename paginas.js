(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Títulos que entram palavra por palavra
  document.querySelectorAll(".dividir").forEach((h) => {
    h.innerHTML = h.textContent.trim().split(/\s+/)
      .map((w, i) => `<span class="palavra"><span style="transition-delay:${120 + i * 70}ms">${w}</span></span>`).join(" ");
    requestAnimationFrame(() => setTimeout(() => h.classList.add("entrou"), 60));
  });

  // Cartazes: fotos trocam ao passar o mouse + inclinação 3D
  document.querySelectorAll(".cartaz").forEach((c) => {
    const fotos = [...c.querySelectorAll(".cartaz-foto img")];
    let t = null, i = 0;
    if (fotos.length > 1 && !reduzir) {
      const pontos = document.createElement("span");
      pontos.className = "cartaz-pontos";
      pontos.innerHTML = fotos.map((_, k) => `<i class="${k ? "" : "on"}"></i>`).join("");
      c.querySelector(".cartaz-foto").appendChild(pontos);
      const dots = [...pontos.children];
      const passo = () => { fotos[i].classList.remove("ativa"); dots[i].classList.remove("on"); i = (i + 1) % fotos.length; fotos[i].loading = "eager"; fotos[i].classList.add("ativa"); dots[i].classList.add("on"); };
      new IntersectionObserver(([e]) => {
        clearInterval(t); t = null;
        if (e.isIntersecting) { fotos.forEach((f) => (f.loading = "eager")); setTimeout(() => { if (!t) t = setInterval(passo, 3400); }, Math.random() * 1500); }
      }, { threshold: 0.5 }).observe(c);
      c.addEventListener("pointerenter", () => { clearInterval(t); passo(); t = setInterval(passo, 1600); });
      c.addEventListener("pointerleave", () => { clearInterval(t); t = setInterval(passo, 3400); });
    }
    if (!reduzir) {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--rx", `${(0.5 - (e.clientY - r.top) / r.height) * 5}deg`);
        c.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 7}deg`);
      });
      c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    }
  });

  // Estreia (topo da página do imóvel): fotos em sequência com barras
  const est = document.querySelector(".estreia");
  if (est) {
    const fotos = [...est.querySelectorAll(".estreia-tela img")];
    const barras = [...est.querySelectorAll(".filme-barras i")];
    const tempo = +est.dataset.intervalo || 5000;
    est.style.setProperty("--tempo", tempo + "ms");
    let i = 0;
    const mostrar = (n) => {
      fotos.forEach((f, k) => { f.classList.toggle("ativa", k === n); if (k === n) { f.loading = "eager"; f.style.animation = "none"; void f.offsetWidth; f.style.animation = ""; } });
      barras.forEach((b, k) => { b.classList.toggle("feita", k < n); b.classList.remove("agora"); if (k === n) { void b.offsetWidth; b.classList.add("agora"); } });
      if (fotos[n + 1]) fotos[n + 1].loading = "eager";
    };
    requestAnimationFrame(() => est.classList.add("no-ar"));
    if (fotos.length > 1) {
      mostrar(0);
      if (!reduzir) setInterval(() => { i = (i + 1) % fotos.length; mostrar(i); }, tempo);
      est.querySelector(".estreia-tela").addEventListener("click", () => { i = (i + 1) % fotos.length; mostrar(i); });
    }
    if (!reduzir) {
      const tela = est.querySelector(".estreia-tela");
      addEventListener("scroll", () => requestAnimationFrame(() => {
        const p = Math.min(1, scrollY / innerHeight);
        tela.style.transform = `translateY(${p * 18}vh) scale(${1 + p * 0.06})`;
      }), { passive: true });
    }
  }
})();

/* ── Textos dinâmicos: digitação, palavra girando, contadores e entradas ── */
(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduzir) return;

  // rótulo digitado letra por letra
  document.querySelectorAll(".digitar").forEach((el) => {
    const txt = el.dataset.texto || el.textContent; el.textContent = ""; el.classList.add("digitando-txt");
    let k = 0; const tick = () => { el.textContent = txt.slice(0, ++k); if (k < txt.length) setTimeout(tick, 45); else el.classList.add("fim"); };
    setTimeout(tick, 350);
  });

  // palavra que gira (Garopaba → Mariscal → Itapema)
  document.querySelectorAll(".giro").forEach((g) => {
    const ps = [...g.querySelectorAll(".giro-palavra")]; let i = 0;
    const ajusta = () => (g.style.width = ps[i].offsetWidth + "px");
    ajusta(); addEventListener("resize", ajusta); document.fonts && document.fonts.ready.then(ajusta);
    setInterval(() => {
      ps[i].classList.remove("ativa"); ps[i].classList.add("sai");
      const velho = ps[i]; setTimeout(() => velho.classList.remove("sai"), 700);
      i = (i + 1) % ps.length; ps[i].classList.add("ativa"); ajusta();
    }, 2400);
  });

  // parágrafo surgindo palavra por palavra
  document.querySelectorAll(".surgir").forEach((p) => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w, i) => `<span style="transition-delay:${500 + i * 28}ms">${w}</span>`).join(" ");
    requestAnimationFrame(() => setTimeout(() => p.classList.add("ok"), 80));
  });

  // contadores
  document.querySelectorAll("[data-conta]").forEach((n) => {
    const fim = +n.dataset.conta, ini = +(n.dataset.de || 0); n.textContent = ini;
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now(), dur = 1600;
      const passo = (t) => { const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3); n.textContent = Math.round(ini + (fim - ini) * ease); if (p < 1) requestAnimationFrame(passo); };
      requestAnimationFrame(passo);
    }, { threshold: 0.6 }).observe(n);
  });

  // títulos dos cards entram palavra por palavra quando o card aparece
  document.querySelectorAll(".cartaz h2, .cartaz h3").forEach((h) => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="pc"><span style="transition-delay:${350 + i * 70}ms">${w}</span></span>`).join(" ");
  });
})();
