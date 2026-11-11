/* Acomodações (fundo branco): cena de praia em traço que se desenha, sol que se põe e barco que navega
   com a rolagem, objetos de praia que se desenham e flutuam, e a faixa de cinema final que se abre. */
(() => {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const topo = document.querySelector(".ab-topo");
  const objs = [...document.querySelectorAll(".obj")];
  const fim = document.querySelector(".ab-final");

  if (topo) requestAnimationFrame(() => setTimeout(() => topo.classList.add("desenhou"), 150));

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add(e.target === fim ? "aberta" : "desenhou"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -15% 0px" });
  objs.forEach((o) => io.observe(o));
  if (fim) io.observe(fim);

  if (reduzir) { objs.forEach((o) => o.classList.add("desenhou")); fim && fim.classList.add("aberta"); return; }

  let pedido = false;
  const tela = fim && fim.querySelector(".ab-tela");
  const atualizar = () => {
    pedido = false;
    if (topo) topo.style.setProperty("--rol", Math.min(1, scrollY / (topo.offsetHeight || 1)).toFixed(3));
    objs.forEach((o) => {
      const v = +o.dataset.v || 0;
      o.style.transform = `translateY(${(scrollY * v).toFixed(1)}px) rotate(${(scrollY * v * 0.08).toFixed(1)}deg)`;
    });
    if (tela) {
      const r = tela.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      tela.style.setProperty("--fim", p.toFixed(3));
    }
  };
  addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(atualizar); } }, { passive: true });
  addEventListener("resize", atualizar);
  atualizar();
})();
