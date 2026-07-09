/**
 * landing-core.js — базовая интерактивность лендинга (без React).
 * Заменяет функциональность, которую раньше давала Next.js-гидратация:
 * 1) бургер-меню в мобильной шапке;
 * 2) reveal-анимации при скролле (параметры 1:1 с прежней React-версией).
 */
(function () {
  "use strict";

  // --- Бургер-меню ---
  var toggle = document.getElementById("mobileToggle");
  var nav = document.getElementById("navLinks");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("active");
    });
    // Закрываем меню по клику на пункт (у React-версии этого не было — QoL)
    nav.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("a") : null;
      if (link) nav.classList.remove("active");
    });
  }

  // --- Reveal-анимации ---
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("active");
    });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );
  reveals.forEach(function (el) {
    io.observe(el);
  });

  // Страховка: карточки в горизонтальных каруселях (ниши на мобильном)
  // могут быть полностью клипнуты и никогда не пересечь viewport —
  // через 3 секунды после загрузки показываем всё, что осталось скрытым.
  window.addEventListener(
    "load",
    function () {
      setTimeout(function () {
        document.querySelectorAll(".reveal:not(.active)").forEach(function (el) {
          el.classList.add("active");
          io.unobserve(el);
        });
      }, 3000);
    },
    { once: true }
  );
})();
