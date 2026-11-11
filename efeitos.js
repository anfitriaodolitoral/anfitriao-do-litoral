(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Luz que acompanha o cursor nos cards de "Nossa gestão" + leve inclinação 3D
  const cards = document.querySelectorAll(".cuidado");
  cards.forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty("--mx", `${x * 100}%`);
      c.style.setProperty("--my", `${y * 100}%`);
      c.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
      c.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    });
    c.addEventListener("pointerleave", () => {
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
    });
  });

  // Títulos entram palavra por palavra
  document.querySelectorAll(".servicos h2, .cinema h2").forEach((h) => {
    if (h.dataset.dividido) return;
    h.dataset.dividido = "1";
    h.innerHTML = h.textContent.trim().split(/\s+/)
      .map((w, i) => `<span class="palavra"><span style="transition-delay:${i * 55}ms">${w}</span></span>`).join(" ");
    new IntersectionObserver(([e], o) => {
      if (e.isIntersecting) { h.classList.add("entrou"); o.disconnect(); }
    }, { threshold: 0.4 }).observe(h);
  });
})();

/* ── Acomodações: cenas com troca de fotos, barras e zoom na rolagem ── */
(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const filmes = [...document.querySelectorAll(".filme")];
  if (!filmes.length) return;

  filmes.forEach((f) => {
    const fotos = [...f.querySelectorAll(".filme-tela img")];
    const barras = [...f.querySelectorAll(".filme-barras i")];
    const tempo = +f.dataset.intervalo || 5200;
    f.style.setProperty("--tempo", tempo + "ms");
    let i = 0, timer = null;

    const mostrar = (n) => {
      fotos.forEach((img, k) => {
        img.classList.toggle("ativa", k === n);
        if (k === n) { img.loading = "eager"; img.style.animation = "none"; void img.offsetWidth; img.style.animation = ""; }
      });
      barras.forEach((b, k) => {
        b.classList.toggle("feita", k < n);
        b.classList.remove("agora");
        if (k === n) { void b.offsetWidth; b.classList.add("agora"); }
      });
      // pré-carrega a próxima
      const prox = fotos[(n + 1) % fotos.length]; if (prox) prox.loading = "eager";
    };
    const tocar = () => { if (reduzir || timer) return; timer = setInterval(() => { i = (i + 1) % fotos.length; mostrar(i); }, tempo); };
    const parar = () => { clearInterval(timer); timer = null; };

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { f.classList.add("no-ar"); if (!timer) { mostrar(i); tocar(); } }
      else parar();
    }, { threshold: 0.35 }).observe(f);

    // clicar na cena avança a foto
    f.querySelector(".filme-tela").addEventListener("click", () => { parar(); i = (i + 1) % fotos.length; mostrar(i); tocar(); });
  });

  // zoom suave ligado à rolagem
  if (!reduzir) {
    const telas = filmes.map((f) => [f, f.querySelector(".filme-tela")]);
    const mover = () => {
      for (const [f, t] of telas) {
        const r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
        t.style.setProperty("--zoom", (1.14 - p * 0.14).toFixed(4));
      }
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    mover();
  }
})();

/* ── Céu da seção Acomodações acende conforme a rolagem ── */
(() => {
  const s = document.querySelector(".cinema");
  if (!s || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const atualizar = () => {
    const r = s.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9)));
    s.style.setProperty("--ceu", (p * p * (3 - 2 * p)).toFixed(3));
  };
  addEventListener("scroll", () => requestAnimationFrame(atualizar), { passive: true });
  atualizar();
})();

/* ── Página inicial: carrosséis de deslizar com pontos e "Ler a história" ── */
(() => {
  const celular = matchMedia("(max-width: 760px)");
  document.querySelectorAll(".inicio .cuidados, .inicio .etapas").forEach((trilho) => {
    const itens = [...trilho.children];
    const pontos = document.createElement("div");
    pontos.className = "pontos";
    pontos.setAttribute("aria-hidden", "true");
    pontos.innerHTML = itens.map(() => "<i></i>").join("");
    trilho.after(pontos);
    const bolas = [...pontos.children];
    const marcar = () => {
      const centro = trilho.scrollLeft + trilho.clientWidth / 2;
      let melhor = 0, dist = Infinity;
      itens.forEach((el, k) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centro);
        if (d < dist) { dist = d; melhor = k; }
      });
      itens.forEach((el, k) => el.classList.toggle("em-foco", k === melhor));
      bolas.forEach((b, k) => b.classList.toggle("ativo", k === melhor));
    };
    trilho.addEventListener("scroll", () => requestAnimationFrame(marcar), { passive: true });
    addEventListener("resize", marcar);
    marcar();
    bolas.forEach((b, k) => b.addEventListener("click", () => {
      trilho.scrollTo({ left: itens[k].offsetLeft - (trilho.clientWidth - itens[k].offsetWidth) / 2, behavior: "smooth" });
    }));
    // Dica de gesto: o trilho "espia" o próximo cartão na primeira vez que aparece
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting || !celular.matches) return;
        o.disconnect();
        setTimeout(() => {
          trilho.scrollTo({ left: 70, behavior: "smooth" });
          setTimeout(() => trilho.scrollTo({ left: 0, behavior: "smooth" }), 650);
        }, 500);
      }, { threshold: 0.6 }).observe(trilho);
    }
  });

  document.querySelectorAll(".ler-mais").forEach((b) => b.addEventListener("click", () => {
    const alvo = document.getElementById(b.getAttribute("aria-controls"));
    const aberto = alvo.classList.toggle("aberto");
    b.setAttribute("aria-expanded", String(aberto));
    b.querySelector("span").textContent = aberto ? "Mostrar menos" : "Ler a história completa";
  }));
})();
