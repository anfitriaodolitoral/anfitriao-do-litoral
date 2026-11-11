/* "Mais rentabilidade": anima quando aparece e faz um cha-ching (gerado no navegador, sem arquivo de áudio).
   O navegador só libera som depois de um toque/clique na página; tocar no cartão sempre toca o som. */
(() => {
  const el = document.querySelector(".renda");
  if (!el) return;
  const chuva = el.querySelector(".renda-chuva");
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ctx = null;
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const dica = el.querySelector(".renda-som");
    if (dica && dica.lastChild) dica.lastChild.textContent = "Clique para ouvir";
    el.setAttribute("aria-label", "Mais rentabilidade. Clique para ouvir.");
  }

  const audio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };

  const sino = (c, t, freq, vol, dur) => {
    [1, 2.76, 5.4].forEach((m, k) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = k ? "sine" : "triangle";
      o.frequency.setValueAtTime(freq * m, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol / (k + 1), t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (k + 1));
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + dur);
    });
  };
  const gaveta = (c, t) => { // "clack" da caixa registradora
    const n = c.createBuffer(1, Math.floor(c.sampleRate * 0.12), c.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = n; f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 0.8; g.gain.value = 0.5;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  };
  const chaChing = () => {
    const c = audio();
    if (!c) return;
    const go = () => {
      const t = c.currentTime + 0.02;
      gaveta(c, t);
      sino(c, t + 0.09, 1568, 0.18, 0.35);  // "cha"
      sino(c, t + 0.22, 2093, 0.22, 1.2);   // "ching"
      for (let i = 0; i < 6; i++) sino(c, t + 0.35 + i * 0.07 + Math.random() * 0.03, 3200 + Math.random() * 1800, 0.05, 0.18); // moedinhas
    };
    if (c.state === "running") go();
    else c.resume().then(() => c.state === "running" && go()).catch(() => {});
  };

  const moedas = () => {
    if (reduzir) return;
    chuva.textContent = "";
    for (let i = 0; i < 16; i++) {
      const m = document.createElement("span");
      m.className = "moeda" + (i % 5 === 0 ? " moeda--nota" : "");
      m.textContent = "R$";
      const ang = (-90 + (Math.random() * 140 - 70)) * Math.PI / 180, dist = 70 + Math.random() * 70;
      m.style.setProperty("--x", (Math.cos(ang) * dist * 1.6).toFixed(0) + "px");
      m.style.setProperty("--y", (Math.sin(ang) * dist).toFixed(0) + "px");
      m.style.setProperty("--r", (Math.random() * 360 - 180).toFixed(0) + "deg");
      m.style.setProperty("--t", (16 + Math.random() * 12).toFixed(0) + "px");
      m.style.setProperty("--a", (0.15 + Math.random() * 0.35).toFixed(2) + "s");
      m.style.setProperty("--d", (1.3 + Math.random() * 0.6).toFixed(2) + "s");
      chuva.appendChild(m);
    }
    setTimeout(() => (chuva.textContent = ""), 2600);
  };

  let fim = null;
  const tocar = (comSom) => {
    el.classList.remove("tocando", "tocou");
    void el.offsetWidth;
    el.classList.add("tocando");
    moedas();
    if (comSom) setTimeout(chaChing, 120);
    clearTimeout(fim);
    fim = setTimeout(() => { el.classList.add("tocou"); el.classList.remove("tocando"); }, 2800);
  };

  // Ao aparecer: anima; o som sai se a pessoa já tocou/clicou na página antes
  const jaInteragiu = () => !navigator.userActivation || navigator.userActivation.hasBeenActive;
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    tocar(jaInteragiu());
  }, { threshold: 0.6 }).observe(el);

  // O primeiro toque em qualquer lugar já destrava o áudio para depois
  addEventListener("pointerdown", () => audio(), { once: true, passive: true });

  el.addEventListener("click", () => { audio(); tocar(true); });
})();
