/* Site sem sons: desliga o áudio antes dos outros scripts carregarem.
   Os efeitos (ícones, achados, carrosséis) continuam animando, só não tocam som. */
(() => {
  try { window.AudioContext = undefined; window.webkitAudioContext = undefined; } catch (e) {}
})();
