/* Camada "viva" do site inteiro: ícones que pulam, traços que se desenham, ondas e sons curtos.
   Cada grupo anima quando entra na tela e soa uma vez. Os sons são gerados no navegador (sem arquivos).
   Regra dos navegadores: som só depois do primeiro toque/clique/tecla na página. Até lá a animação roda
   em silêncio; no primeiro toque, os grupos que estão na tela e ainda não soaram tocam na hora. */
(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Motor de som compartilhado ───────────────────────────────────────── */
  let ctx = null, livreEm = 0;
  const audio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };
  const somLiberado = () => ctx && ctx.state === "running";
  const tom = (c, t, freq, vol, dur, tipo = "sine", subir = 1) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq * subir, t);
    if (subir !== 1) o.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  };
  const SONS = {
    plim: (c, t, f) => { tom(c, t, f, 0.12, 0.32, "sine", 0.8); tom(c, t, f * 2, 0.03, 0.18); },
    tique: (c, t, f) => { tom(c, t, f * 2, 0.07, 0.07, "triangle"); tom(c, t + 0.01, f * 3, 0.025, 0.05); },
    brilho: (c, t, f) => [0, 1, 2, 3].forEach((k) => tom(c, t + k * 0.045, f * [2, 2.5, 3, 4][k], 0.035, 0.22)),
  };
  const ESCALA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; // dó ré mi sol lá dó
  // Toca uma sequência de notas, sem encavalar com a anterior
  const tocar = (tipo, quantas, passo) => {
    if (!tipo) return true;
    const c = audio();
    if (!c || c.state !== "running") return false;
    let t = Math.max(c.currentTime + 0.04, livreEm);
    const n = Math.min(quantas, ESCALA.length);
    for (let i = 0; i < n; i++) SONS[tipo](c, t + i * passo, ESCALA[i]);
    livreEm = t + n * passo * 0.6;
    return true;
  };

  /* ── Grupos animados ──────────────────────────────────────────────────── */
  // grupo: contêiner · item: cada elemento · icone: o que pula (vazio = o próprio item entra) · som · passo (s)
  const GRUPOS = [
    { grupo: ".cuidados", item: ".cuidado", icone: ".cuidado-icone", som: "plim", passo: 0.16 },
    { grupo: ".etapas", item: ".etapa", icone: ".etapa-num", som: "plim", passo: 0.2 },
    { grupo: ".canais", item: ".canal", icone: ".canal-icone", som: "plim", passo: 0.14 },
    { grupo: ".destaques-apto", item: ".destaque-apto", icone: "strong", som: "tique", passo: 0.13 },
    { grupo: ".numeros", item: "li", icone: "strong", som: "tique", passo: 0.18 },
    { grupo: ".comodidades", item: ".comod", icone: ".comod-icone", som: "plim", passo: 0.12, porItem: true },
    { grupo: ".reserva-fichas, .fichas", item: "li", icone: "", som: "brilho", passo: 0.06 },
    { grupo: ".chips", item: "li", icone: "", som: null, passo: 0.05 },
  ];

  const prepararIcone = (el) => {
    el.classList.add("vida-icone");
    el.querySelectorAll("path, circle, rect, line, polyline, ellipse").forEach((s) => s.setAttribute("pathLength", "1"));
  };

  const pendentes = new Set(); // alvos na tela que ainda não soaram
  const registrar = (alvo, itens, cfg) => {
    itens.forEach((it, i) => it.style.setProperty("--vi", i));
    alvo.style.setProperty("--vp", cfg.passo + "s");
    alvo.classList.add("vida-grupo", cfg.icone ? "vida--icones" : "vida--itens");
    if (!reduzir) alvo.classList.add("vida-pronto");
    let animou = false, soou = false;
    const soar = () => {
      if (soou) return;
      if (tocar(cfg.som, cfg.som === "brilho" ? 1 : itens.length, cfg.passo)) { soou = true; pendentes.delete(alvo); }
    };
    alvo._vidaSoar = soar;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!animou) { animou = true; alvo.classList.add("vivo"); }
        if (!soou) { pendentes.add(alvo); if (somLiberado()) soar(); }
      } else pendentes.delete(alvo);
    }, { rootMargin: "-12% 0px -12% 0px" }).observe(alvo);
  };

  GRUPOS.forEach((cfg) => {
    document.querySelectorAll(cfg.grupo).forEach((g) => {
      if (g.closest(".historia-fatos, .filme-cartao") || g.dataset.vida) return;
      g.dataset.vida = "1";
      const itens = [...g.querySelectorAll(":scope > " + cfg.item)];
      if (!itens.length) return;
      if (cfg.icone) itens.forEach((it) => { const ic = it.querySelector(cfg.icone); if (ic) prepararIcone(ic); });
      if (cfg.porItem) itens.forEach((it) => registrar(it, [it], { ...cfg, passo: 0 }));
      else registrar(g, itens, cfg);
    });
  });

  /* ── Primeiro toque destrava o som e toca o que está na tela ─────────── */
  const destravar = () => {
    const c = audio();
    if (!c) return;
    const vai = () => pendentes.forEach((a) => a._vidaSoar && a._vidaSoar());
    if (c.state === "running") vai(); else c.resume().then(vai).catch(() => {});
  };
  ["pointerup", "touchend", "click", "keydown"].forEach((ev) => addEventListener(ev, destravar, { passive: true }));
})();
