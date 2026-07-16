(function () {
  "use strict";

  var DEMO_KEYS = ["education"];
  var DEMO_FILES = ["education.html"];

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
    var demosGrid = card.closest(".demos-grid");
    if (demosGrid) {
      var demoCards = demosGrid.querySelectorAll(".demo-card");
      var demoIndex = Array.prototype.indexOf.call(demoCards, card);
      return demoIndex >= 0 && DEMO_FILES[demoIndex]
        ? demoPage(DEMO_FILES[demoIndex])
        : "";
    }
    var nichesGrid = card.closest(".niches-grid");
    if (nichesGrid) {
      var nicheCards = nichesGrid.querySelectorAll(".niche-card");
      var nicheIndex = Array.prototype.indexOf.call(nicheCards, card);
      return nicheIndex >= 0 && DEMO_FILES[nicheIndex]
        ? demoPage(DEMO_FILES[nicheIndex])
        : "";
    }
    return "";
  }

  function wireNicheCards() {
    var grid = document.querySelector(".niches-grid");
    if (!grid) return;

    grid.querySelectorAll(".niche-card").forEach(function (card, index) {
      var key = DEMO_KEYS[index];
      if (key) card.setAttribute("data-demo-key", key);

      var btn = card.querySelector(".niche-demo-btn, .demo-card-btn");
      if (!btn) return;

      var href = demoPage(DEMO_FILES[index]);
      if (!href) return;

      if (btn.tagName === "A") {
        if (!isDemoPageHref(btn.getAttribute("href"))) {
          btn.setAttribute("href", href);
        }
        if (key) btn.setAttribute("data-demo-key", key);
      }
    });
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
    if (!btn) return;

    var nicheCard = btn.closest(".niche-card");
    if (nicheCard && btn.closest(".niches-grid")) {
      var hrefAttr = btn.getAttribute("href");
      var nicheUrl = isDemoPageHref(hrefAttr) ? hrefAttr : urlForCard(nicheCard);
      if (!nicheUrl) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.assign(nicheUrl);
      return;
    }

    if (!btn.closest(".demos-grid")) return;

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
    wireNicheCards();
    document.addEventListener("click", onClick, true);
    document.addEventListener("click", onClick, false);

    var demosGrid = document.querySelector(".demos-grid");
    if (demosGrid && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        if (demosGrid.querySelector("button.demo-card-btn")) wireCards();
      }).observe(demosGrid, { childList: true, subtree: true });
    }

    var nichesGrid = document.querySelector(".niches-grid");
    if (nichesGrid && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        wireNicheCards();
      }).observe(nichesGrid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
