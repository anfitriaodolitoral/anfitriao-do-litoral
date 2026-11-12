/* Profundidade na faixa de cinema das páginas de imóvel */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const faixas = [...document.querySelectorAll(".cine-faixa")];
  if (!faixas.length) return;
  let pedido = false;
  const mover = () => {
    pedido = false;
    const vh = innerHeight;
    faixas.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / (vh + r.height); // -0.5 .. 0.5
      f.style.setProperty("--py", (p * -18).toFixed(2) + "%");
    });
  };
  addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(mover); } }, { passive: true });
  addEventListener("resize", mover);
  mover();
})();
