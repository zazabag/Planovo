(function () {
  "use strict";

  var DEMO_KEYS = ["education", "sports", "clubs"];
  var DEMO_FILES = ["education.html", "sports.html", "clubs.html"];

  function getBase() {
    var path = location.pathname.replace(/\/?index\.html$/, "");
    if (path.endsWith("/")) path = path.slice(0, -1);
    if (!path || path === "/") return "";
    return path;
  }

  function demoPage(file) {
    return getBase() + "/" + file.replace(/^\//, "");
  }

  function isDemoPageHref(href) {
    if (!href || href === "#") return false;
    if (/^javascript:/i.test(href)) return false;
    return /\/(education|sports|clubs)\.html(?:$|[?#])/i.test(href);
  }

  function urlForCard(card) {
    if (!card) return "";
    var key = card.getAttribute("data-demo-key");
    if (key) {
      var i = DEMO_KEYS.indexOf(key);
      if (i >= 0) return demoPage(DEMO_FILES[i]);
    }
    var grid = card.closest(".demos-grid");
    var cards = grid ? grid.querySelectorAll(".demo-card") : [];
    var index = Array.prototype.indexOf.call(cards, card);
    return index >= 0 && DEMO_FILES[index] ? demoPage(DEMO_FILES[index]) : "";
  }

  function wireCards() {
    var grid = document.querySelector(".demos-grid");
    if (!grid) return;

    grid.querySelectorAll(".demo-card").forEach(function (card, index) {
      var key = DEMO_KEYS[index];
      if (key) card.setAttribute("data-demo-key", key);

      var btn = card.querySelector(".demo-card-btn");
      if (!btn) return;

      var href = demoPage(DEMO_FILES[index]);
      if (!href) return;

      if (btn.tagName === "A") {
        if (!isDemoPageHref(btn.getAttribute("href"))) {
          btn.setAttribute("href", href);
        }
        if (key) btn.setAttribute("data-demo-key", key);
        return;
      }

      var link = document.createElement("a");
      link.className = btn.className;
      link.href = href;
      if (key) link.setAttribute("data-demo-key", key);
      var style = btn.getAttribute("style");
      if (style) link.setAttribute("style", style);
      link.innerHTML = btn.innerHTML;
      btn.parentNode.replaceChild(link, btn);
    });
  }

  function onClick(e) {
    var btn = e.target.closest(".demo-card-btn");
    if (!btn || !btn.closest(".demos-grid")) return;

    var card = btn.closest(".demo-card");
    if (!card) return;

    var hrefAttr = btn.getAttribute("href");
    var url = isDemoPageHref(hrefAttr) ? hrefAttr : urlForCard(card);
    if (!url) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    window.location.assign(url);
  }

  function boot() {
    if (/\/(education|sports|clubs)\.html$/i.test(location.pathname)) return;
    wireCards();
    document.addEventListener("click", onClick, true);
    document.addEventListener("click", onClick, false);

    var grid = document.querySelector(".demos-grid");
    if (grid && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        if (grid.querySelector("button.demo-card-btn")) wireCards();
      }).observe(grid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
