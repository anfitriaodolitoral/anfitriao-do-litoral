/* Pop-up "Por que reservar com o Anfitrião do Litoral?" — página inicial.
   Aparece uma vez por sessão, quando o visitante chega na seção Acomodações. */
(function () {
  var CHAVE = "anf-popup-visto";
  var ATRASO = 900; /* ms parado na seção antes de abrir */

  try { if (sessionStorage.getItem(CHAVE)) return; } catch (e) {}

  var whats = (window.SITE && window.SITE.whatsapp && window.SITE.whatsapp.numero) || "5548991451520";
  var msg = encodeURIComponent("Olá! Vim pelo site do Anfitrião do Litoral e gostaria de reservar direto com vocês.");

  var icones = {
    economia: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    suporte: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M19.5 19a3 3 0 0 1-3 3H13"/></svg>',
    checkin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8 20 3M17 6l2.5 2.5M14.5 8.5 16.5 10.5"/></svg>'
  };

  var el = document.createElement("div");
  el.className = "popup-porque";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "popup-porque-titulo");
  el.hidden = true;
  el.innerHTML =
    '<div class="popup-porque__fundo" data-fechar></div>' +
    '<div class="popup-porque__caixa">' +
      '<div class="popup-porque__capa">' +
        '<button class="popup-porque__fechar" type="button" aria-label="Fechar" data-fechar>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
        '<span class="popup-porque__selo">Reserva direta</span>' +
      '</div>' +
      '<div class="popup-porque__corpo">' +
        '<h2 id="popup-porque-titulo">Por que reservar com o <em>Anfitrião do Litoral</em>?</h2>' +
        '<ul class="popup-porque__lista">' +
          '<li><span class="popup-porque__icone">' + icones.economia + '</span><p><strong>Economize na tarifa.</strong> Reserve direto, sem taxas extras de plataformas.</p></li>' +
          '<li><span class="popup-porque__icone">' + icones.suporte + '</span><p><strong>Suporte 24h</strong> do check-in ao check-out, com atendimento humanizado.</p></li>' +
          '<li><span class="popup-porque__icone">' + icones.checkin + '</span><p><strong>Check-in facilitado,</strong> simples e sem burocracia.</p></li>' +
        '</ul>' +
        '<div class="popup-porque__acoes">' +
          '<a class="popup-porque__botao" href="acomodacoes.html">Ver acomodações</a>' +
          '<a class="popup-porque__whats" href="https://wa.me/' + whats + '?text=' + msg + '" target="_blank" rel="noopener">ou reserve pelo WhatsApp</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  var anterior = null;

  function abrir() {
    try { sessionStorage.setItem(CHAVE, "1"); } catch (e) {}
    anterior = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add("aberto"); });
    document.documentElement.classList.add("popup-aberto");
    if (window.__lenis) window.__lenis.stop();
    el.querySelector(".popup-porque__fechar").focus({ preventScroll: true });
    document.addEventListener("keydown", tecla);
  }

  function fechar() {
    el.classList.remove("aberto");
    document.documentElement.classList.remove("popup-aberto");
    if (window.__lenis) window.__lenis.start();
    document.removeEventListener("keydown", tecla);
    setTimeout(function () { el.hidden = true; }, 400);
    if (anterior && anterior.focus) anterior.focus({ preventScroll: true });
  }

  function tecla(e) { if (e.key === "Escape") fechar(); }

  el.addEventListener("click", function (e) {
    if (e.target.closest("[data-fechar]")) fechar();
  });
  el.querySelectorAll(".popup-porque__acoes a").forEach(function (a) {
    a.addEventListener("click", function () { if (a.target !== "_blank") fechar(); });
  });

  function iniciar() {
    document.body.appendChild(el);
    var secao = document.getElementById("acomodacoes");
    if (!secao || !("IntersectionObserver" in window)) return;
    var timer = null;
    var obs = new IntersectionObserver(function (itens) {
      var visivel = itens[0].isIntersecting;
      if (visivel && !timer) {
        timer = setTimeout(function () { obs.disconnect(); abrir(); }, ATRASO);
      } else if (!visivel && timer) {
        clearTimeout(timer); timer = null;
      }
    }, { threshold: 0, rootMargin: "0px 0px -40% 0px" }); /* seção ocupando a parte de cima da tela */
    obs.observe(secao);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
