
/* ── Botão de som: um toque libera todos os sons da página (regra dos navegadores) e depois permite silenciar ── */
(() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const contextos = [];
  let mudo = false;
  try { mudo = localStorage.getItem("som-mudo") === "1"; } catch (e) {}
  // registra cada AudioContext criado pelos efeitos do site, para poder ligar/desligar todos juntos
  const Orig = AC;
  const Novo = function (...a) {
    const c = new Orig(...a);
    contextos.push(c);
    const resumeOrig = c.resume.bind(c);
    c.resume = () => (mudo ? Promise.resolve() : resumeOrig());
    if (mudo) c.suspend().catch(() => {});
    return c;
  };
  Novo.prototype = Orig.prototype;
  window.AudioContext = Novo;
  if (window.webkitAudioContext) window.webkitAudioContext = Novo;

  const bt = document.createElement("button");
  bt.type = "button";
  bt.className = "som-bt";
  const ICONE_ON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICONE_OFF = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/></svg>';
  let liberado = false;
  const pintar = () => {
    if (!liberado && !mudo) { bt.innerHTML = ICONE_ON + "<span>Ativar sons</span>"; bt.classList.add("convite"); bt.setAttribute("aria-label", "Ativar sons do site"); }
    else { bt.classList.remove("convite"); bt.innerHTML = mudo ? ICONE_OFF : ICONE_ON; bt.setAttribute("aria-label", mudo ? "Ligar sons" : "Silenciar sons"); }
    bt.classList.toggle("mudo", mudo);
  };
  const liberar = () => { liberado = true; pintar(); };
  ["pointerup", "touchend", "keydown"].forEach((ev) => addEventListener(ev, liberar, { once: true, passive: true }));
  bt.addEventListener("click", (e) => {
    if (!liberado || bt.classList.contains("convite")) { liberado = true; mudo = false; }
    else mudo = !mudo;
    try { localStorage.setItem("som-mudo", mudo ? "1" : "0"); } catch (er) {}
    contextos.forEach((c) => (mudo ? c.suspend() : c.resume()).catch(() => {}));
    if (!mudo) { // confirmação sonora
      const c = contextos[0] || new window.AudioContext();
      c.resume().then(() => {
        const t = c.currentTime + 0.02, o = c.createOscillator(), g = c.createGain();
        o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1320, t + 0.12);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.32);
      }).catch(() => {});
    }
    pintar();
  });
  pintar();
  document.body.appendChild(bt);
  setTimeout(() => bt.classList.add("visivel"), 1600);
})();
