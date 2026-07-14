(function () {
  "use strict";

  var CONSENT_KEY = "planovo_cookie_consent";
  var CONSENT_VERSION = "1";
  var LEADS_KEY = "planovo_leads";
  var TELEGRAM_URL = "https://t.me/planovoo";
  var CONTACT_EMAIL = "an.shpar@mail.ru";
  var landingObserver = null;

  function getBase() {
    var path = location.pathname.replace(/\/?index\.html$/, "");
    if (path.endsWith("/")) path = path.slice(0, -1);
    if (!path || path === "/") return "";
    return path;
  }

  function asset(path) {
    return getBase() + "/" + path.replace(/^\//, "");
  }

  function page(path) {
    return asset(path);
  }

  window.PlanovoLegal = { getBase: getBase, asset: asset, page: page };

  function ensureLegalStyles() {
    var href = asset("assets/site-legal.css");
    if (!document.querySelector('link[href*="site-legal.css"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }

    var bgHref = asset("assets/landing-background.css");
    if (!document.querySelector('link[href*="landing-background.css"]')) {
      var bgLink = document.createElement("link");
      bgLink.rel = "stylesheet";
      bgLink.href = bgHref;
      document.head.appendChild(bgLink);
    }

    var mobileLandingHref = asset("assets/site-mobile-landing.css");
    if (!document.querySelector('link[href*="site-mobile-landing.css"]')) {
      var mobileLink = document.createElement("link");
      mobileLink.rel = "stylesheet";
      mobileLink.href = mobileLandingHref;
      mobileLink.media = "(max-width: 768px)";
      document.head.appendChild(mobileLink);
    }
  }

  var mobileLayoutMq = null;

  function syncMobileLandingLayout() {
    var page = document.querySelector(".landing-page");
    if (!page) return;

    if (!mobileLayoutMq) {
      mobileLayoutMq = window.matchMedia("(max-width: 768px)");
    }

    function apply() {
      page.classList.toggle("mobile-layout", mobileLayoutMq.matches);
      document.documentElement.classList.toggle("planovo-mobile", mobileLayoutMq.matches);
      initNicheCarousel();
    }

    apply();

    if (mobileLayoutMq.__planovoBound) return;
    mobileLayoutMq.__planovoBound = true;

    if (mobileLayoutMq.addEventListener) {
      mobileLayoutMq.addEventListener("change", apply);
    } else if (mobileLayoutMq.addListener) {
      mobileLayoutMq.addListener(apply);
    }
  }

  function getLeadSectionHTML() {
    return (
      '<div class="landing-container"><div class="lead-grid">' +
      '<div class="lead-intro"><span class="section-tag">Первый шаг</span>' +
      '<h2 class="section-title">Начните с <span class="gradient-text">бесплатного разбора</span></h2>' +
      '<p class="lead-intro-text">Расскажите, как у вас устроено расписание. За 20–30 минут онлайн покажем, где команда теряет время и какие экраны нужны именно вам.</p>' +
      '<div class="lead-contacts-mini cta-buttons">' +
      '<a href="' + TELEGRAM_URL + '" class="btn btn-primary" target="_blank" rel="noopener noreferrer">✈️ Написать в Telegram</a>' +
      '<a href="mailto:' + CONTACT_EMAIL + '" class="btn btn-secondary">✉️ ' + CONTACT_EMAIL + '</a>' +
      "</div></div>" +
      '<div class="lead-form-card"><h3>Заявка на бесплатный разбор</h3>' +
      "<p>Заполните форму — вернёмся с ответом в течение рабочего дня.</p>" +
      '<form id="planovoLeadForm" class="lead-form" novalidate>' +
      '<div class="lead-form-row"><div class="lead-field"><label for="leadName">Имя <span class="req">*</span></label>' +
      '<input type="text" id="leadName" name="name" required autocomplete="name" placeholder="Как к вам обращаться" /></div>' +
      '<div class="lead-field"><label for="leadOrg">Организация</label>' +
      '<input type="text" id="leadOrg" name="organization" autocomplete="organization" placeholder="Колледж, школа, вуз" /></div></div>' +
      '<div class="lead-form-row"><div class="lead-field"><label for="leadEmail">Email</label>' +
      '<input type="email" id="leadEmail" name="email" autocomplete="email" placeholder="name@example.ru" inputmode="email" /></div>' +
      '<div class="lead-field"><label for="leadPhone">Телефон <span class="req">*</span></label>' +
      '<input type="tel" id="leadPhone" name="phone" required autocomplete="tel" placeholder="+7 (___) ___-__-__" inputmode="tel" /></div></div>' +
      '<div class="lead-field"><label for="leadNiche">Тип учреждения</label><select id="leadNiche" name="niche">' +
      '<option value="">Выберите тип</option>' +
      '<option value="college">Колледж / техникум</option>' +
      '<option value="school">Школа</option>' +
      '<option value="university">Вуз</option>' +
      '<option value="other">Другое (доп. образование и т.п.)</option></select></div>' +
      '<div class="lead-field"><label for="leadMessage">Сообщение</label>' +
      '<textarea id="leadMessage" name="message" placeholder="Кратко опишите задачу и текущие боли с расписанием"></textarea></div>' +
      '<div class="lead-checkboxes">' +
      '<label class="lead-checkbox"><input type="checkbox" id="leadConsentPdn" name="consentPdn" required />' +
      "<span>Даю <a href=\"" +
      page("consent-pdn.html") +
      '" target="_blank" rel="noopener">согласие на обработку персональных данных</a> в соответствии с <a href="' +
      page("privacy.html") +
      '" target="_blank" rel="noopener">Политикой обработки ПДн</a> <span class="req">*</span></span></label>' +
      '<label class="lead-checkbox"><input type="checkbox" id="leadMarketing" name="marketing" />' +
      "<span>Согласен(на) получать информационные материалы о продукте «Планово» (необязательно)</span></label></div>" +
      '<div id="leadFormMessage" class="lead-form-message" role="status" aria-live="polite"></div>' +
      '<button type="submit" class="lead-submit" id="leadSubmitBtn" disabled>Получить бесплатный разбор</button>' +
      "</form></div></div></div>"
    );
  }

  function activateLeadSection(section) {
    if (!section) return;
    section.querySelectorAll(".reveal").forEach(function (node) {
      node.classList.add("active");
    });
  }

  function createLeadSectionElement() {
    var section = document.createElement("section");
    section.className = "lead-section";
    section.id = "contact";
    section.setAttribute("data-planovo-lead", "1");
    section.innerHTML = getLeadSectionHTML();
    activateLeadSection(section);
    return section;
  }

  function injectLeadSection() {
    if (document.getElementById("planovoLeadForm")) {
      activateLeadSection(document.querySelector("section.lead-section#contact"));
      return false;
    }

    var landingPage = document.querySelector(".landing-page");
    if (!landingPage) return false;

    var footer = landingPage.querySelector("footer.landing-footer");
    var oldCta = landingPage.querySelector("section.cta#contact, section.cta");
    var emptyLead = landingPage.querySelector("section.lead-section#contact");

    if (oldCta) {
      var replacement = createLeadSectionElement();
      oldCta.replaceWith(replacement);
      return true;
    }

    if (emptyLead && !emptyLead.querySelector("#planovoLeadForm")) {
      emptyLead.innerHTML = getLeadSectionHTML();
      activateLeadSection(emptyLead);
      return true;
    }

    if (!footer) return false;

    landingPage.insertBefore(createLeadSectionElement(), footer);
    return true;
  }

  function injectFooterLegal() {
    var footer = document.querySelector("footer.landing-footer");
    if (!footer) return;

    footer.querySelectorAll(".footer-column").forEach(function (col) {
      var h4 = col.querySelector("h4");
      if (h4 && /документ/i.test(h4.textContent)) {
        col.remove();
      }
    });

    var oldLegal = footer.querySelector(".footer-legal");
    if (oldLegal) oldLegal.remove();

    var contactsCol = null;
    var cols = footer.querySelectorAll(".footer-links .footer-column, .footer-content .footer-column");
    for (var i = 0; i < cols.length; i++) {
      var title = cols[i].querySelector("h4");
      if (title && /контакт/i.test(title.textContent)) {
        contactsCol = cols[i];
        break;
      }
    }

    if (!contactsCol) return;

    var list = contactsCol.querySelector("ul");
    if (!list) return;

    var legalItems = [
      { href: page("privacy.html"), text: "Политика ПДн", match: "privacy" },
      { href: page("consent-pdn.html"), text: "Согласие ПДн", match: "consent-pdn" },
      { href: page("cookies.html"), text: "Cookie", match: "cookies" },
    ];

    legalItems.forEach(function (item) {
      var existing = list.querySelector('a[href*="' + item.match + '"]');
      if (existing) {
        existing.href = item.href;
        return;
      }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.text;
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function injectFooterRequisites() {
    var bottom = document.querySelector(".landing-footer .footer-bottom");
    if (!bottom || bottom.querySelector(".footer-requisites")) return;

    var p = document.createElement("p");
    p.className = "footer-requisites";
    p.textContent =
      "ИП Шпарага Андрей Дмитриевич · ИНН 781457531980 · ОГРНИП 326784700129638";
    bottom.appendChild(p);
  }

  function injectNavLink() {
    if (document.querySelector('.nav-links a[href="#contact"], nav a[href="#contact"]')) return;

    var demosLink = document.querySelector('.nav-links a[href="#demos"], nav a[href="#demos"]');
    if (!demosLink || !demosLink.parentNode) return;

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#contact";
    a.textContent = "Заявка";
    li.appendChild(a);
    demosLink.parentNode.parentNode.insertBefore(li, demosLink.parentNode);
  }

  var DEMO_PAGE_URLS = ["education.html", "sports.html", "clubs.html"];
  var DEMO_KEYS = ["education", "sports", "clubs"];
  var DEMO_BTN_ARROW =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right demo-btn-arrow" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
  var NICHE_DEMO_ROWS = [
    { target: "Для: учебной части, преподавателей, студентов", color: "#6366f1", key: "education" },
    { target: "Для: руководителей секций, тренеров, спортсменов", color: "#10b981", key: "sports" },
    { target: "Для: организаторов, администраторов, участников", color: "#f59e0b", key: "clubs" },
  ];
  var demoCaptureInstalled = false;
  var demoGridObserver = null;
  var nicheDemoObserver = null;
  var nicheCarousel = { index: 0, mq: null, bound: false };

  function nicheCarouselNextSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>'
    );
  }

  function syncNicheCarouselHeights(grid) {
    if (!grid) return;
    var cards = grid.querySelectorAll(".niche-card");
    if (!cards.length) return;

    var viewport = grid.closest(".niches-carousel-viewport");
    var slideW = viewport ? viewport.clientWidth : 0;
    if (viewport && slideW > 0) {
      viewport.style.setProperty("--niche-slide-w", slideW + "px");
      grid.style.setProperty("--niche-slide-w", slideW + "px");
    }

    cards.forEach(function (card) {
      card.style.minHeight = "";
    });

    var max = 0;
    cards.forEach(function (card) {
      max = Math.max(max, card.offsetHeight);
    });

    if (max > 0) {
      cards.forEach(function (card) {
        card.style.minHeight = max + "px";
      });
    }

    updateNicheCarouselSlide(grid);
  }

  function updateNicheCarouselSlide(grid) {
    var cards = grid.querySelectorAll(".niche-card");
    if (!cards.length) return;

    var viewport = grid.closest(".niches-carousel-viewport");
    var slideW = viewport ? viewport.clientWidth : grid.clientWidth;
    if (slideW <= 0) slideW = grid.clientWidth;

    var idx =
      ((nicheCarousel.index % cards.length) + cards.length) % cards.length;
    nicheCarousel.index = idx;

    if (viewport && slideW > 0) {
      viewport.style.setProperty("--niche-slide-w", slideW + "px");
      grid.style.setProperty("--niche-slide-w", slideW + "px");
    }

    grid.style.transform = "translate3d(-" + idx * slideW + "px, 0, 0)";

    cards.forEach(function (card, i) {
      var active = i === idx;
      card.classList.toggle("is-niche-active", active);
      card.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function teardownNicheCarousel() {
    var carousel = document.querySelector(".niches-carousel");
    if (!carousel) return;

    var grid = carousel.querySelector(".niches-grid");
    if (!grid) return;

    grid.style.transform = "";
    grid.querySelectorAll(".niche-card").forEach(function (card) {
      card.style.minHeight = "";
      card.classList.remove("is-niche-active");
      card.removeAttribute("aria-hidden");
    });

    carousel.parentNode.insertBefore(grid, carousel);
    carousel.remove();
    nicheCarousel.index = 0;
  }

  function mountNicheCarousel(grid) {
    if (grid.closest(".niches-carousel")) {
      syncNicheCarouselHeights(grid);
      updateNicheCarouselSlide(grid);
      return;
    }

    var wrap = document.createElement("div");
    wrap.className = "niches-carousel";
    var viewport = document.createElement("div");
    viewport.className = "niches-carousel-viewport";
    var parent = grid.parentNode;

    parent.insertBefore(wrap, grid);
    viewport.appendChild(grid);
    wrap.appendChild(viewport);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "niches-carousel-next";
    btn.setAttribute("aria-label", "Следующая ниша");
    btn.innerHTML = nicheCarouselNextSvg();
    btn.addEventListener("click", function () {
      var cards = grid.querySelectorAll(".niche-card");
      if (!cards.length) return;
      nicheCarousel.index = (nicheCarousel.index + 1) % cards.length;
      updateNicheCarouselSlide(grid);
    });
    wrap.appendChild(btn);

    requestAnimationFrame(function () {
      syncNicheCarouselHeights(grid);
      updateNicheCarouselSlide(grid);
    });
  }

  function initNicheCarousel() {
    var section = document.querySelector("section.niches#niches, section#niches");
    if (!section) return;

    var grid = section.querySelector(".niches-grid");
    if (!grid || !grid.querySelectorAll(".niche-card").length) return;

    if (!nicheCarousel.mq) {
      nicheCarousel.mq = window.matchMedia("(max-width: 768px)");
    }

    if (nicheCarousel.mq.matches) {
      mountNicheCarousel(grid);
    } else {
      teardownNicheCarousel();
    }

    if (nicheCarousel.bound) return;
    nicheCarousel.bound = true;

    var resizeTimer;
    function onLayoutChange() {
      initNicheCarousel();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var activeGrid =
          document.querySelector(".niches-carousel .niches-grid") ||
          document.querySelector("section#niches .niches-grid");
        if (activeGrid && nicheCarousel.mq && nicheCarousel.mq.matches) {
          syncNicheCarouselHeights(activeGrid);
        }
      }, 200);
    }

    if (nicheCarousel.mq.addEventListener) {
      nicheCarousel.mq.addEventListener("change", onLayoutChange);
    } else if (nicheCarousel.mq.addListener) {
      nicheCarousel.mq.addListener(onLayoutChange);
    }

    window.addEventListener("resize", onLayoutChange);
  }

  function getDemoPageUrl(index) {
    var file = DEMO_PAGE_URLS[index];
    return file ? page(file) : null;
  }

  function isDemoPageHref(href) {
    if (!href || href === "#") return false;
    if (/^javascript:/i.test(href)) return false;
    return /\/(education|sports|clubs)\.html(?:$|[?#])/i.test(href);
  }

  function getDemoUrlFromNicheCard(card) {
    if (!card) return null;

    var key = card.getAttribute("data-demo-key");
    if (key) {
      var i = DEMO_KEYS.indexOf(key);
      if (i >= 0) return getDemoPageUrl(i);
    }

    var grid = card.closest(".niches-grid");
    var cards = grid ? grid.querySelectorAll(".niche-card") : [];
    var index = Array.prototype.indexOf.call(cards, card);
    return getDemoPageUrl(index);
  }

  function nicheDemoBtnHtml(color, key, href) {
    return (
      '<a class="niche-demo-btn demo-card-btn" href="' +
      href +
      '" data-demo-key="' +
      key +
      '" style="background:linear-gradient(135deg, ' +
      color +
      ", " +
      color +
      'cc)">Попробовать демо' +
      DEMO_BTN_ARROW +
      "</a>"
    );
  }

  function injectNicheDemoButtons() {
    var section = document.querySelector("section.niches#niches, section#niches");
    if (!section) return false;

    var grid = section.querySelector(".niches-grid");
    if (!grid) return false;

    var cards = grid.querySelectorAll(".niche-card");
    if (!cards.length) return false;

    cards.forEach(function (card, index) {
      var row = NICHE_DEMO_ROWS[index];
      if (!row) return;

      card.setAttribute("data-demo-key", row.key);

      if (card.querySelector(".niche-demo-btn")) return;

      var href = getDemoPageUrl(index);
      if (!href) return;

      var wrap = document.createElement("div");
      wrap.innerHTML = nicheDemoBtnHtml(row.color, row.key, href);
      card.appendChild(wrap.firstChild);
    });

    section.querySelectorAll(".niches-demo-caption").forEach(function (el) {
      el.remove();
    });

    initNicheCarousel();
    return true;
  }

  function hideDemosSection() {
    var section = document.querySelector("section.demos#demos, section#demos");
    if (!section) return;
    section.setAttribute("hidden", "");
    section.setAttribute("aria-hidden", "true");
  }

  function patchDemoNavAnchors() {
    document.querySelectorAll('a[href="#demos"]').forEach(function (a) {
      a.setAttribute("href", "#niches");
    });
  }

  function watchNicheDemoButtons() {
    injectNicheDemoButtons();
    hideDemosSection();
    patchDemoNavAnchors();

    if (nicheDemoObserver) return;

    var grid = document.querySelector(".niches-grid");
    if (!grid || typeof MutationObserver === "undefined") return;

    nicheDemoObserver = new MutationObserver(function () {
      injectNicheDemoButtons();
    });
    nicheDemoObserver.observe(grid, { childList: true, subtree: true });
  }

  function getDemoUrlFromCard(card) {
    if (!card) return null;

    var key = card.getAttribute("data-demo-key");
    if (key) {
      var i = DEMO_KEYS.indexOf(key);
      if (i >= 0) return getDemoPageUrl(i);
    }

    var grid = card.closest(".demos-grid");
    var cards = grid ? grid.querySelectorAll(".demo-card") : [];
    var index = Array.prototype.indexOf.call(cards, card);
    return getDemoPageUrl(index);
  }

  function resolveDemoNavUrl(btn, card) {
    if (!card) return null;

    var hrefAttr = btn && btn.getAttribute ? btn.getAttribute("href") : "";
    if (btn && btn.tagName === "A" && isDemoPageHref(hrefAttr)) {
      return hrefAttr;
    }

    return getDemoUrlFromCard(card);
  }

  function wireDemoCardLinks() {
    var grid = document.querySelector(".demos-grid");
    if (!grid) return;

    grid.querySelectorAll(".demo-card").forEach(function (card, index) {
      var key = DEMO_KEYS[index];
      if (key) card.setAttribute("data-demo-key", key);

      var btn = card.querySelector(".demo-card-btn");
      if (!btn) return;

      var href = getDemoPageUrl(index);
      if (!href) return;

      if (btn.tagName === "A") {
        btn.setAttribute("href", href);
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

  function wireFooterDemoLinks() {
    var footer = document.querySelector("footer.landing-footer");
    if (!footer) return;

    footer.querySelectorAll('a[href="#demos"]').forEach(function (a) {
      var text = (a.textContent || "").trim();
      var key = null;
      if (/учебн/i.test(text)) key = "education";
      else if (/спорт/i.test(text)) key = "sports";
      else if (/клуб/i.test(text)) key = "clubs";
      if (!key) return;

      var i = DEMO_KEYS.indexOf(key);
      if (i < 0) return;

      var href = getDemoPageUrl(i);
      if (!href) return;

      a.setAttribute("href", href);
      a.setAttribute("data-demo-key", key);
    });
  }

  function watchDemoGrid() {
    var grid = document.querySelector(".demos-grid");
    if (!grid) return;

    wireDemoCardLinks();

    if (demoGridObserver) return;

    demoGridObserver = new MutationObserver(function () {
      if (grid.querySelector("button.demo-card-btn")) {
        wireDemoCardLinks();
      }
    });
    demoGridObserver.observe(grid, { childList: true, subtree: true });
  }

  function handleDemoNavClick(e) {
    var btn = e.target.closest(".demo-card-btn");
    var footerLink = e.target.closest("footer.landing-footer a[data-demo-key]");

    if (footerLink && footerLink.closest(".demos-grid") === null) {
      var footerKey = footerLink.getAttribute("data-demo-key");
      var footerIndex = DEMO_KEYS.indexOf(footerKey);
      var footerUrl =
        footerIndex >= 0
          ? getDemoPageUrl(footerIndex)
          : resolveDemoNavUrl(footerLink, null);
      if (!footerUrl) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.assign(footerUrl);
      return;
    }

    if (!btn) return;

    var nicheCard = btn.closest(".niche-card");
    if (nicheCard && btn.closest(".niches-grid")) {
      var nicheUrl = resolveDemoNavUrl(btn, nicheCard) || getDemoUrlFromNicheCard(nicheCard);
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

    var url = resolveDemoNavUrl(btn, card);
    if (!url) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    window.location.assign(url);
  }

  function installDemoLinkCapture() {
    if (demoCaptureInstalled || isDemoPage()) return;
    demoCaptureInstalled = true;

    /* capture + bubble — иначе React (bubble на root) всё равно вызывает setView */
    document.addEventListener("click", handleDemoNavClick, true);
    document.addEventListener("click", handleDemoNavClick, false);
  }

  function simplifyDemosSection() {
    var section = document.querySelector("section.demos#demos, section#demos");
    if (!section) return false;

    var tag = section.querySelector(".section-header .section-tag");
    if (tag) tag.textContent = "Демо";

    var title = section.querySelector(".section-header .section-title");
    if (title) {
      title.innerHTML =
        'Попробуйте <span class="gradient-text">интерактивное демо</span>';
    }

    var subtitle = section.querySelector(".section-header .section-subtitle");
    if (subtitle) {
      subtitle.textContent = "Чтобы увидеть, как Планово работает изнутри.";
    }

    /* Списки скрыты через CSS — не удаляем из DOM (иначе ломается React) */
    return true;
  }

  var demosCopyPatchTimer = null;
  var demosCopyPatchAttempts = 0;
  var demosCopyPatchStarted = false;

  function scheduleDemosCopyPatch() {
    if (demosCopyPatchAttempts > 8) return;
    demosCopyPatchAttempts += 1;
    simplifyDemosSection();
    var subtitle = document.querySelector("section#demos .section-subtitle");
    if (
      subtitle &&
      subtitle.textContent.indexOf("Чтобы увидеть") !== -1
    ) {
      return;
    }
    demosCopyPatchTimer = setTimeout(scheduleDemosCopyPatch, 900);
  }

  function startDemosCopyPatchAfterHydration() {
    if (demosCopyPatchStarted) return;
    demosCopyPatchStarted = true;
    demosCopyPatchAttempts = 0;
    if (demosCopyPatchTimer) clearTimeout(demosCopyPatchTimer);
    setTimeout(scheduleDemosCopyPatch, 800);
    setTimeout(scheduleDemosCopyPatch, 2200);
    setTimeout(scheduleDemosCopyPatch, 4500);
  }

  function upgradeLeadContacts() {
    var mini = document.querySelector(".lead-contacts-mini");
    if (!mini) return;

    mini.classList.add("cta-buttons");

    var telegram = mini.querySelector('a[href*="t.me"]');
    var email = mini.querySelector('a[href^="mailto:"]');

    if (telegram) {
      telegram.href = TELEGRAM_URL;
      telegram.className = "btn btn-primary";
      telegram.textContent = "✈️ Написать в Telegram";
      if (!telegram.getAttribute("rel")) {
        telegram.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (email) {
      email.href = "mailto:" + CONTACT_EMAIL;
      email.className = "btn btn-secondary";
      email.textContent = "✉️ " + CONTACT_EMAIL;
    }

    if (telegram && email && telegram.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING) {
      mini.insertBefore(telegram, email);
    }
  }

  var mockupInitScheduled = false;

  function scheduleMockupInit() {
    if (mockupInitScheduled) return;
    mockupInitScheduled = true;

    function run() {
      if (window.PlanovoLandingMockup) {
        try {
          window.PlanovoLandingMockup.init();
        } catch (e) {
          /* ignore */
        }
      }
    }

    if (document.readyState === "complete") {
      setTimeout(run, 500);
    } else {
      window.addEventListener(
        "load",
        function () {
          setTimeout(run, 500);
        },
        { once: true }
      );
    }
  }

  function ensureLandingMockupAssets() {
    if (isDemoPage()) return;

    var cssHref = asset("assets/landing-mockup.css");
    if (!document.querySelector('link[href*="landing-mockup.css"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }

    if (window.PlanovoLandingMockup) {
      scheduleMockupInit();
      return;
    }

    if (document.querySelector('script[src*="landing-mockup.js"]')) return;

    var script = document.createElement("script");
    script.src = asset("assets/landing-mockup.js");
    script.async = true;
    script.onload = function () {
      scheduleMockupInit();
    };
    document.body.appendChild(script);
  }

  function isProcessInitialized() {
    var section = document.querySelector(".how-it-works");
    return !!(
      section &&
      section.dataset.processReady === "1" &&
      section.querySelector(".process-timeline-wrap")
    );
  }

  function runProcessInit() {
    if (isProcessInitialized()) return;
    if (!window.PlanovoProcessScroll) return;
    try {
      window.PlanovoProcessScroll.init();
    } catch (e) {
      /* ignore */
    }
  }

  function tryProcessInit() {
    if (isProcessInitialized()) return;
    loadProcessScript();
  }

  function loadProcessScript() {
    if (window.PlanovoProcessScroll) {
      runProcessInit();
      return;
    }
    var existing = document.querySelector('script[src*="process-scroll.js"]');
    if (existing) {
      if (window.PlanovoProcessScroll) {
        runProcessInit();
      } else {
        existing.addEventListener("load", runProcessInit, { once: true });
      }
      return;
    }

    var script = document.createElement("script");
    script.src = asset("assets/process-scroll.js");
    script.async = true;
    script.onload = runProcessInit;
    document.body.appendChild(script);
  }

  function bindProcessIntersection() {
    var target = document.querySelector(".how-it-works");
    if (!target || target.dataset.processIoBound === "1") return;
    if (typeof IntersectionObserver === "undefined") return;

    target.dataset.processIoBound = "1";

    var io = new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        tryProcessInit();
        if (isProcessInitialized()) io.disconnect();
      },
      { rootMargin: "280px 0px", threshold: 0 }
    );
    io.observe(target);
  }

  function scheduleProcessInit() {
    function bootProcess() {
      tryProcessInit();
      bindProcessIntersection();
    }

    if (document.readyState === "complete") {
      bootProcess();
    } else {
      window.addEventListener("load", bootProcess, { once: true });
    }

    [400, 1200, 2500].forEach(function (ms) {
      setTimeout(bootProcess, ms);
    });
  }

  function ensureProcessScrollAssets() {
    if (isDemoPage()) return;

    var cssHref = asset("assets/process-scroll.css");
    if (!document.querySelector('link[href*="process-scroll.css"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }

    scheduleProcessInit();
  }

  function runProblemAuraInit() {
    if (window.PlanovoProblemAura) {
      try {
        window.PlanovoProblemAura.init();
      } catch (e) {
        /* ignore */
      }
    }
  }

  function ensureProblemAuraAssets() {
    if (isDemoPage()) return;

    var cssHref = asset("assets/problem-aura.css");
    if (!document.querySelector('link[href*="problem-aura.css"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }

    if (window.PlanovoProblemAura) {
      runProblemAuraInit();
      return;
    }

    if (document.querySelector('script[src*="problem-aura.js"]')) return;

    var script = document.createElement("script");
    script.src = asset("assets/problem-aura.js");
    script.async = true;
    script.onload = runProblemAuraInit;
    document.body.appendChild(script);
  }

  function syncFavicon() {
    var href = asset("favicon-32.png");
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(function (link) {
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);
      if (!link.getAttribute("type")) link.setAttribute("type", "image/png");
    });
    if (!document.querySelector('link[rel="icon"]')) {
      var link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.sizes = "32x32";
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function upgradeLandingLogo() {
    document.querySelectorAll(".landing-page .logo-icon").forEach(function (icon) {
      var current = icon.querySelector("img.planovo-logo-img");
      if (current && /logo\.png/i.test(current.getAttribute("src") || "")) return;

      icon.textContent = "";
      var img = document.createElement("img");
      img.src = asset("logo.png");
      img.alt = "";
      img.className = "planovo-logo-img";
      img.width = 60;
      img.height = 60;
      img.decoding = "async";
      icon.appendChild(img);
      icon.style.background = "transparent";
      icon.style.boxShadow = "none";
      icon.style.width = "60px";
      icon.style.height = "60px";
    });
  }

  var logoObserver = null;

  function watchLandingLogo() {
    upgradeLandingLogo();

    var nav = document.querySelector(".landing-page .landing-navbar");
    if (!nav || logoObserver) return;
    if (typeof MutationObserver === "undefined") return;

    logoObserver = new MutationObserver(function () {
      upgradeLandingLogo();
    });
    logoObserver.observe(nav, { childList: true, subtree: true });
  }

  function removeHeroStats() {
    document.querySelectorAll(".landing-page .hero-stats").forEach(function (el) {
      el.remove();
    });
  }

  var heroStatsObserver = null;

  function watchHeroStatsRemoval() {
    removeHeroStats();

    var hero = document.querySelector(".landing-page .hero");
    if (!hero || heroStatsObserver) return;

    if (typeof MutationObserver === "undefined") return;

    heroStatsObserver = new MutationObserver(function () {
      removeHeroStats();
    });
    heroStatsObserver.observe(hero, { childList: true, subtree: true });
  }

  function enhanceLanding() {
    ensureLegalStyles();
    syncMobileLandingLayout();
    ensureLandingMockupAssets();
    ensureProcessScrollAssets();
    ensureProblemAuraAssets();
    removeHeroStats();
    watchHeroStatsRemoval();
    upgradeLandingLogo();
    watchLandingLogo();
    syncFavicon();
    var injected = injectLeadSection();
    injectFooterLegal();
    injectFooterRequisites();
    injectNavLink();
    patchFooterLinks();
    patchTelegramLinks();
    patchContactEmail();
    watchDemoGrid();
    watchNicheDemoButtons();
    wireFooterDemoLinks();
    upgradeLeadContacts();
    if (injected || document.getElementById("planovoLeadForm")) {
      initLeadForm();
    }
  }

  function watchLandingPage() {
    var landingPage = document.querySelector(".landing-page");
    if (!landingPage || landingObserver) return;

    landingObserver = new MutationObserver(function () {
      syncMobileLandingLayout();
      var hasForm = document.getElementById("planovoLeadForm");
      var landingFooter = landingPage.querySelector("footer.landing-footer");
      if (!hasForm && landingFooter) {
        enhanceLanding();
      } else if (hasForm) {
        activateLeadSection(document.querySelector("section.lead-section#contact"));
        initLeadForm();
      }
      watchDemoGrid();
      watchNicheDemoButtons();
      tryProcessInit();
      wireFooterDemoLinks();
    });
    landingObserver.observe(landingPage, { childList: true, subtree: true });
  }

  var landingEnhancementsScheduled = false;

  function scheduleLandingEnhancements() {
    if (landingEnhancementsScheduled) return;
    landingEnhancementsScheduled = true;

    initCookieBanner();
    enhanceLanding();
    watchLandingPage();
    watchCookieBanner();
    startDemosCopyPatchAfterHydration();

    [400, 1200, 2500].forEach(function (ms) {
      setTimeout(function () {
        initCookieBanner();
        enhanceLanding();
      }, ms);
    });
  }

  /* ── Cookie banner ── */
  var cookieObserver = null;

  function hasCookieConsent() {
    try {
      var stored = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
      return !!(stored && stored.version === CONSENT_VERSION);
    } catch (e) {
      return false;
    }
  }

  function showCookieBanner(banner) {
    if (!banner) return;
    banner.classList.add("is-visible");
    requestAnimationFrame(function () {
      banner.classList.add("is-visible");
    });
    setTimeout(function () {
      banner.classList.add("is-visible");
    }, 50);
  }

  function initCookieBanner() {
    if (hasCookieConsent()) return;

    var existing = document.getElementById("planovoCookieBanner");
    if (existing) {
      showCookieBanner(existing);
      return;
    }

    var banner = document.createElement("div");
    banner.id = "planovoCookieBanner";
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Уведомление о cookie");
    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
      '<p class="cookie-banner-text">Мы используем файлы cookie и аналогичные технологии для работы сайта. ' +
      "Необязательные cookie (аналитика) подключаются только после вашего согласия. " +
      'Подробнее — в <a href="' +
      page("cookies.html") +
      '">Политике cookie</a> и <a href="' +
      page("privacy.html") +
      '">Политике обработки ПДн</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="cookie-btn cookie-btn-reject" data-action="reject">Отклонить необязательные</button>' +
      '<button type="button" class="cookie-btn cookie-btn-accept" data-action="accept">Принять все</button>' +
      "</div></div>";

    document.body.appendChild(banner);
    showCookieBanner(banner);

    function save(choice) {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          version: CONSENT_VERSION,
          choice: choice,
          at: new Date().toISOString(),
        })
      );
      banner.classList.remove("is-visible");
      setTimeout(function () {
        banner.remove();
      }, 400);
      if (choice === "accept" && typeof window.planovoLoadAnalytics === "function") {
        window.planovoLoadAnalytics();
      }
    }

    banner.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      save(btn.getAttribute("data-action") === "accept" ? "accept" : "reject");
    });
  }

  function watchCookieBanner() {
    if (cookieObserver || isDemoPage()) return;

    cookieObserver = new MutationObserver(function () {
      if (hasCookieConsent()) return;
      if (!document.getElementById("planovoCookieBanner")) {
        initCookieBanner();
      }
    });
    cookieObserver.observe(document.body, { childList: true });
  }

  /* ── Lead form ── */
  function normalizePhone(phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "8") {
      digits = "7" + digits.slice(1);
    } else if (digits.length === 10) {
      digits = "7" + digits;
    }
    return digits;
  }

  function isValidPhone(phone) {
    return /^7\d{10}$/.test(normalizePhone(phone));
  }

  function isValidEmail(email) {
    var value = String(email || "").trim();
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function setFieldState(input, valid, errorText) {
    if (!input) return valid;
    var wrap = input.closest(".lead-field");
    if (!wrap) return valid;

    wrap.classList.toggle("is-invalid", !valid);
    var err = wrap.querySelector(".lead-field-error");
    if (!valid && errorText) {
      if (!err) {
        err = document.createElement("span");
        err.className = "lead-field-error";
        err.setAttribute("role", "alert");
        wrap.appendChild(err);
      }
      err.textContent = errorText;
    } else if (err) {
      err.remove();
    }
    return valid;
  }

  function validateNameInput(input) {
    var value = (input && input.value) || "";
    if (!value.trim()) {
      return setFieldState(input, false, "Укажите, пожалуйста, ваше имя.");
    }
    return setFieldState(input, true);
  }

  function validatePhoneInput(input) {
    var value = (input && input.value) || "";
    if (!value.trim()) {
      return setFieldState(input, false, "Укажите номер телефона для связи.");
    }
    if (!isValidPhone(value)) {
      return setFieldState(
        input,
        false,
        "Введите телефон в формате +7 (XXX) XXX-XX-XX или 10 цифр без кода страны."
      );
    }
    return setFieldState(input, true);
  }

  function validateEmailInput(input) {
    var value = (input && input.value) || "";
    if (!value.trim()) {
      return setFieldState(input, true);
    }
    if (!isValidEmail(value)) {
      return setFieldState(input, false, "Проверьте корректность email (например, name@example.ru).");
    }
    return setFieldState(input, true);
  }

  function showLeadFormMessage(type, text) {
    var message = document.getElementById("leadFormMessage");
    if (!message) return;
    message.className = "lead-form-message is-visible " + type;
    message.textContent = text;
  }

  function syncLeadSubmitButton() {
    var submitBtn = document.getElementById("leadSubmitBtn");
    var consent = document.getElementById("leadConsentPdn");
    if (!submitBtn || !consent) return;
    submitBtn.disabled = !consent.checked;
  }

  function resetLeadFormState(form) {
    if (!form) return;
    form.reset();
    var consent = document.getElementById("leadConsentPdn");
    if (consent) consent.checked = false;
    form.querySelectorAll(".lead-field.is-invalid").forEach(function (wrap) {
      wrap.classList.remove("is-invalid");
    });
    form.querySelectorAll(".lead-field-error").forEach(function (err) {
      err.remove();
    });
    form.querySelectorAll("[data-interacted]").forEach(function (el) {
      delete el.dataset.interacted;
    });
    syncLeadSubmitButton();
  }

  function handleLeadFormSubmit(e) {
    e.preventDefault();

    var form = document.getElementById("planovoLeadForm");
    if (!form) return;

    var consent = document.getElementById("leadConsentPdn");
    var submitBtn = document.getElementById("leadSubmitBtn");
    var nameInput = document.getElementById("leadName");
    var phoneInput = document.getElementById("leadPhone");
    var emailInput = document.getElementById("leadEmail");

    if (!consent || !consent.checked) {
      showLeadFormMessage("error", "Для отправки заявки необходимо согласие на обработку персональных данных.");
      return;
    }

    var nameOk = validateNameInput(nameInput);
    var phoneOk = validatePhoneInput(phoneInput);
    var emailOk = validateEmailInput(emailInput);
    if (nameInput) nameInput.dataset.interacted = "1";
    if (phoneInput) phoneInput.dataset.interacted = "1";
    if (emailInput) emailInput.dataset.interacted = "1";
    if (!nameOk || !phoneOk || !emailOk) {
      showLeadFormMessage("error", "Проверьте обязательные поля и формат телефона или email.");
      return;
    }

    var data = {
      name: (form.name && form.name.value.trim()) || "",
      email: (form.email && form.email.value.trim()) || "",
      phone: (form.phone && form.phone.value.trim()) || "",
      phoneNormalized: normalizePhone(form.phone && form.phone.value),
      organization: (form.organization && form.organization.value) || "",
      niche: (form.niche && form.niche.value) || "",
      message: (form.message && form.message.value) || "",
      marketing: form.marketing && form.marketing.checked,
      consentPdn: true,
      consentVersion: "2026-06-16",
      submittedAt: new Date().toISOString(),
      page: location.href,
    };

    var leads = [];
    try {
      leads = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    } catch (err) {
      leads = [];
    }
    leads.push(data);
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads.slice(-50)));
    } catch (err2) {
      /* ignore quota */
    }

    function onSuccess() {
      showLeadFormMessage(
        "success",
        "Спасибо! Заявка принята. Мы свяжемся с вами в течение рабочего дня. Ответим без спама — только по делу."
      );
      resetLeadFormState(form);
    }

    var endpoint = window.PLANOVO_LEAD_ENDPOINT;
    if (endpoint) {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка…";
      }
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          onSuccess();
        })
        .catch(function () {
          showLeadFormMessage(
            "error",
            "Не удалось отправить заявку автоматически. Напишите нам на " + CONTACT_EMAIL + " — мы на связи."
          );
          if (submitBtn) {
            submitBtn.disabled = !consent.checked;
            submitBtn.textContent = "Получить бесплатный разбор";
          }
        });
      return;
    }

    var subject = encodeURIComponent("Заявка с сайта Планово — " + data.name);
    var body = encodeURIComponent(
      "Имя: " +
        data.name +
        "\nEmail: " +
        data.email +
        "\nТелефон: " +
        data.phone +
        "\nОрганизация: " +
        data.organization +
        "\nНиша: " +
        data.niche +
        "\n\nСообщение:\n" +
        data.message +
        "\n\n---\nСогласие на обработку ПДн: да\nРекламная рассылка: " +
        (data.marketing ? "да" : "нет")
    );

    onSuccess();

    var mailto = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    var opened = false;
    try {
      var a = document.createElement("a");
      a.href = mailto;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      opened = true;
    } catch (mailErr) {
      opened = false;
    }

    if (!opened) {
      showLeadFormMessage(
        "success",
        "Заявка сохранена. Если почтовый клиент не открылся — напишите на " + CONTACT_EMAIL + " с темой «Заявка с сайта»."
      );
    }
  }

  var leadFormDelegationReady = false;

  function installLeadFormDelegation() {
    if (leadFormDelegationReady) return;
    leadFormDelegationReady = true;

    document.addEventListener("input", function (e) {
      var el = e.target;
      if (!el || !el.closest || !el.closest("#planovoLeadForm")) return;
      el.dataset.interacted = "1";
      if (el.id === "leadName") validateNameInput(el);
      else if (el.id === "leadPhone") validatePhoneInput(el);
      else if (el.id === "leadEmail") validateEmailInput(el);
    });

    document.addEventListener(
      "focusout",
      function (e) {
        var el = e.target;
        if (!el || !el.closest || !el.closest("#planovoLeadForm")) return;
        if (el.id === "leadName") validateNameInput(el);
        else if (el.id === "leadPhone") validatePhoneInput(el);
        else if (el.id === "leadEmail") validateEmailInput(el);
      },
      true
    );

    document.addEventListener("change", function (e) {
      if (e.target && e.target.id === "leadConsentPdn") {
        syncLeadSubmitButton();
      }
    });

    document.addEventListener(
      "submit",
      function (e) {
        var form = e.target;
        if (!form || form.id !== "planovoLeadForm") return;
        handleLeadFormSubmit(e);
      },
      true
    );
  }

  function initLeadForm() {
    if (!document.getElementById("planovoLeadForm")) return;
    syncLeadSubmitButton();
  }

  function patchContactEmail() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.indexOf("hello@planovo") !== -1) {
        a.href = href.replace(/hello@planovo\.ru/g, CONTACT_EMAIL);
      }
      if (a.textContent.indexOf("hello@planovo") !== -1) {
        a.textContent = a.textContent.replace(/hello@planovo\.ru/g, CONTACT_EMAIL);
      }
    });
    document.querySelectorAll("footer.landing-footer a[href^='mailto:']").forEach(function (a) {
      var q = (a.getAttribute("href") || "").indexOf("?");
      var suffix = q >= 0 ? a.getAttribute("href").slice(q) : "";
      a.href = "mailto:" + CONTACT_EMAIL + suffix;
      if (!a.textContent.trim() || /hello@planovo|✉️/.test(a.textContent)) {
        a.textContent = CONTACT_EMAIL;
      }
    });
  }

  function patchTelegramLinks() {
    document.querySelectorAll('a[href*="t.me"]').forEach(function (a) {
      a.href = TELEGRAM_URL;
      if (!a.getAttribute("target")) a.setAttribute("target", "_blank");
      if (!a.getAttribute("rel")) a.setAttribute("rel", "noopener noreferrer");
    });
  }

  function patchFooterLinks() {
    var footer = document.querySelector("footer.landing-footer");
    if (!footer) return;
    var links = [
      { href: page("privacy.html"), match: "privacy" },
      { href: page("consent-pdn.html"), match: "consent-pdn" },
      { href: page("cookies.html"), match: "cookies" },
    ];
    links.forEach(function (item) {
      var a = footer.querySelector('a[href*="' + item.match + '"]');
      if (a) a.href = item.href;
    });
  }

  function isDemoPage() {
    return /\/(education|sports|clubs)\.html$/i.test(location.pathname);
  }

  function boot() {
    if (isDemoPage()) return;
    installDemoLinkCapture();
    watchDemoGrid();
    installLeadFormDelegation();
    initCookieBanner();
    scheduleLandingEnhancements();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", function () {
    if (!isDemoPage()) {
      initCookieBanner();
      scheduleLandingEnhancements();
    }
  });
})();
