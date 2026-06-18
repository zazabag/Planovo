(function () {
  "use strict";

  var section = null;
  var cards = [];
  var rafId = 0;
  var scrollActive = false;
  var reducedMotion = false;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  /** 0 вне экрана; 1 когда центр карточки в центре viewport */
  function getCardAuraIntensity(card) {
    var rect = card.getBoundingClientRect();
    var vh = window.innerHeight;

    if (rect.bottom <= 0 || rect.top >= vh) return 0;

    var center = rect.top + rect.height * 0.5;
    var viewCenter = vh * 0.5;
    var half = vh * 0.48;

    var align = 1 - Math.abs(center - viewCenter) / half;
    align = clamp(align, 0, 1);
    return align * align;
  }

  function updateAura() {
    if (!cards.length) return;

    if (reducedMotion) {
      cards.forEach(function (card) {
        card.style.setProperty("--card-aura", "0");
      });
      return;
    }

    cards.forEach(function (card) {
      var intensity = scrollActive ? getCardAuraIntensity(card) : 0;
      card.style.setProperty("--card-aura", intensity.toFixed(3));
    });
  }

  function onScroll() {
    if (!scrollActive || rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      updateAura();
    });
  }

  function clearAura() {
    cards.forEach(function (card) {
      card.style.setProperty("--card-aura", "0");
    });
  }

  function init() {
    section = document.querySelector("section.problem, #about.problem, .problem#about");
    if (!section || section.dataset.problemAuraReady === "1") return;

    cards = Array.prototype.slice.call(
      section.querySelectorAll(".problem-card")
    );
    if (!cards.length) return;

    section.dataset.problemAuraReady = "1";
    section.classList.add("problem-aura-enhanced");

    reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(
        function (entries) {
          scrollActive = entries[0].isIntersecting;
          if (scrollActive) updateAura();
          else clearAura();
        },
        { rootMargin: "80px 0px", threshold: 0 }
      );
      io.observe(section);
    } else {
      scrollActive = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateAura();
  }

  window.PlanovoProblemAura = { init: init };
})();
