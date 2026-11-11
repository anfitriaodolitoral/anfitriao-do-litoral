(() => {
  const visor = document.querySelector(".visor");
  if (!visor) return;
  const img = visor.querySelector("img");
  document.querySelectorAll(".galeria button").forEach((b) => {
    b.addEventListener("click", () => {
      const f = b.querySelector("img");
      img.src = f.currentSrc || f.src;
      img.alt = f.alt;
      visor.showModal();
    });
  });
  visor.querySelector(".visor-fechar").addEventListener("click", () => visor.close());
  visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
})();
