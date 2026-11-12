/* Ícones da "Nossa história": entram em sequência, cada um com um "plim" e o último ("Mais rentabilidade")
   com a nota que fala, moedas e um cha-ching. Os sons são gerados no navegador, sem arquivo de áudio.
   Regra dos navegadores: som só depois do primeiro toque/clique na página. O som sai sozinho quando os
   ícones aparecem; se a pessoa ainda não tocou na página, ele sai no primeiro toque com os ícones na tela. */
(() => {
  const lista = document.querySelector(".inicio .historia-fatos");
  if (!lista) return;
  const itens = [...lista.children];
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PASSO = 0.42; // segundos entre um ícone e outro (igual ao CSS)

  itens.forEach((li, i) => li.style.setProperty("--i", i));
  lista.querySelectorAll(".fato-icone path").forEach((p) => p.setAttribute("pathLength", "1"));
  if (!reduzir) lista.classList.add("fatos-anima");

  /* ── Som ── */
  let ctx = null;
  const audio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };
  const tom = (c, t, freq, vol, dur, tipo = "sine") => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  };
  const plim = (c, t, freq) => { // gotinha: sobe um pouco no início
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * 0.8, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + 0.4);
    tom(c, t, freq * 2, 0.04, 0.2);
  };
  const sino = (c, t, freq, vol, dur) => [1, 2.76, 5.4].forEach((m, k) => tom(c, t, freq * m, vol / (k + 1), dur / (k + 1), k ? "sine" : "triangle"));
  const gaveta = (c, t) => {
    const n = c.createBuffer(1, Math.floor(c.sampleRate * 0.12), c.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = n; f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 0.8; g.gain.value = 0.45;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  };
  const chaChing = (c, t) => {
    gaveta(c, t);
    sino(c, t + 0.09, 1568, 0.17, 0.35);
    sino(c, t + 0.22, 2093, 0.2, 1.1);
    for (let i = 0; i < 5; i++) sino(c, t + 0.35 + i * 0.07 + Math.random() * 0.03, 3200 + Math.random() * 1800, 0.045, 0.16);
  };
  const notas = [523.25, 659.25, 783.99]; // dó, mi, sol
  const trilha = (c) => {
    const t0 = c.currentTime + 0.05;
    itens.forEach((li, i) => {
      const t = t0 + i * PASSO;
      if (li.classList.contains("fato-renda")) chaChing(c, t + 0.45);
      else plim(c, t + 0.1, notas[i % notas.length]);
    });
  };

  /* ── Moedas do último ícone ── */
  const moedas = () => {
    const alvo = lista.querySelector(".fato-moedas");
    if (!alvo || reduzir) return;
    alvo.textContent = "";
    const atraso = (itens.length - 1) * PASSO + 0.5;
    for (let i = 0; i < 10; i++) {
      const m = document.createElement("span");
      m.className = "fato-moeda";
      const ang = (-90 + (Math.random() * 150 - 75)) * Math.PI / 180, dist = 34 + Math.random() * 30;
      m.style.setProperty("--x", (Math.cos(ang) * dist * 1.4).toFixed(0) + "px");
      m.style.setProperty("--y", (Math.sin(ang) * dist).toFixed(0) + "px");
      m.style.setProperty("--r", (Math.random() * 360 - 180).toFixed(0) + "deg");
      m.style.setProperty("--t", (9 + Math.random() * 6).toFixed(0) + "px");
      m.style.setProperty("--a", (atraso + Math.random() * 0.25).toFixed(2) + "s");
      m.style.setProperty("--d", (1 + Math.random() * 0.5).toFixed(2) + "s");
      alvo.appendChild(m);
    }
    setTimeout(() => (alvo.textContent = ""), (atraso + 2) * 1000);
  };

  /* ── Orquestra ── */
  let naTela = false, somTocado = false;
  const animar = () => {
    lista.classList.remove("vivo");
    void lista.offsetWidth;
    lista.classList.add("vivo");
    moedas();
  };
  const tentarSom = () => {
    if (somTocado || !naTela) return false;
    const c = audio();
    if (!c) return false;
    const vai = () => { if (somTocado || c.state !== "running") return; somTocado = true; trilha(c); };
    if (c.state === "running") vai(); else c.resume().then(vai).catch(() => {});
    return true;
  };

  let jaAnimou = false;
  new IntersectionObserver(([e]) => {
    naTela = e.isIntersecting;
    if (!naTela) return;
    if (!jaAnimou) { jaAnimou = true; animar(); }
    const ativo = !navigator.userActivation || navigator.userActivation.hasBeenActive;
    if (ativo) tentarSom();
  }, { threshold: 0.5 }).observe(lista);

  // Primeiro toque/clique/tecla em qualquer lugar: destrava o áudio; se os ícones estão na tela e ainda não soaram, toca já (com a animação junto)
  const destravar = () => {
    audio();
    if (naTela && !somTocado) { animar(); tentarSom(); }
  };
  ["pointerup", "touchend", "click", "keydown"].forEach((ev) => addEventListener(ev, destravar, { passive: true }));
})();
