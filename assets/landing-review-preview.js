(function () {
  "use strict";

  function isPreviewMode() {
    return document.documentElement.classList.contains("landing-preview-root");
  }

  function isLandingPage() {
    return !!document.querySelector(".landing-page");
  }

  if (!isLandingPage()) return;

  var PATCHED = "data-review-preview";
  var attempts = 0;
  var maxAttempts = 15;
  var reinsertTimer = null;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setHtml(el, html) {
    if (!el) return;
    el.innerHTML = html;
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function setButtonLabel(button, text) {
    if (!button) return;
    var icon = button.querySelector("svg");
    button.textContent = text;
    if (icon) button.appendChild(icon);
  }

  function ensureRibbon() {
    if (!isPreviewMode()) return;
    if (document.getElementById("landingPreviewRibbon")) return;
    var ribbon = document.createElement("div");
    ribbon.id = "landingPreviewRibbon";
    ribbon.className = "landing-preview-ribbon";
    ribbon.textContent =
      "PREVIEW — локальная версия с правками по рецензии (не продакшн)";
    document.body.insertBefore(ribbon, document.body.firstChild);
  }

  function patchHero(page) {
    var hero = qs(".hero", page);
    if (!hero) return;

    var subtitle = qs(".hero-subtitle", hero);
    if (subtitle) {
      setText(
        subtitle,
        "Меняете занятие один раз — студенты, преподаватели и администраторы сразу видят актуальную версию с телефона."
      );
    }

    if (hero.getAttribute(PATCHED + "-hero")) return;

    var badge = qs(".hero-badge", hero);
    if (badge) {
      var dot = badge.querySelector(".badge-dot");
      badge.textContent = "";
      if (dot) badge.appendChild(dot);
      badge.appendChild(document.createTextNode("Для расписаний, где много изменений"));
    }

    var title = qs(".hero-title", hero);
    setHtml(
      title,
      'Планово держит <span class="gradient-text">расписание</span> в порядке'
    );

    var buttons = qs(".hero-buttons", hero);
    if (buttons) {
      var primary = buttons.querySelector(".btn-primary");
      var secondary = buttons.querySelector(".btn-secondary");
      if (primary) setButtonLabel(primary, "Открыть демо");
      if (secondary) setButtonLabel(secondary, "Оставить заявку");
    }

    var navCta = qs(".nav-cta", page);
    if (navCta) setText(navCta, "Открыть демо");

    if (!qs(".hero-schedule-preview", hero)) {
      var preview = document.createElement("div");
      preview.className = "hero-schedule-preview";
      preview.innerHTML =
        '<div class="hero-schedule-top">' +
        '<span>Сегодня</span>' +
        '<strong>Группа 2А</strong>' +
        "</div>" +
        '<div class="hero-schedule-list">' +
        '<div class="hero-schedule-row"><time>09:00</time><span>Математика</span><em>А-101</em></div>' +
        '<div class="hero-schedule-row is-change"><time>11:00</time><span>Замена: английский</span><em>А-105</em></div>' +
        '<div class="hero-schedule-row"><time>13:00</time><span>Проектная работа</span><em>Л-305</em></div>' +
        "</div>" +
        '<div class="hero-schedule-status">Обновлено только что</div>';
      if (buttons) buttons.before(preview);
      else hero.appendChild(preview);
    }

    if (!qs(".hero-note", hero)) {
      var note = document.createElement("p");
      note.className = "hero-note";
      note.innerHTML =
        "<strong>Демо без регистрации</strong> — за 30 секунд покажем сценарий администратора и участника.";
      if (buttons) buttons.after(note);
    }

    hero.setAttribute(PATCHED + "-hero", "1");
  }

  function patchProblem(page) {
    var section = qs("section.problem", page);
    if (!section || section.getAttribute(PATCHED + "-problem")) return;

    setHtml(
      qs(".section-title", section),
      'Почему расписание быстро становится <span class="highlight">головной болью</span>'
    );

    var cards = section.querySelectorAll(".problem-card");
    var copy = [
      ["Правки в разных местах", "Одну замену приходится повторять в чатах, на сайте и во внутренних документах. Где актуальная версия — непонятно."],
      ["Конфликты и накладки", "Аудитория, преподаватель или группа могут пересечься, а ошибка всплывает уже в день занятия."],
      ["Участники не видят изменения", "Студент или клиент открывает старую ссылку, приходит не туда и пишет администратору."],
      ["Нет единого процесса", "Колледж, секция или клуб решают задачу по-своему, хотя всем нужен один понятный источник расписания."],
    ];

    cards.forEach(function (card, i) {
      if (!copy[i]) return;
      var h3 = card.querySelector("h3");
      var p = card.querySelector("p");
      if (h3) setText(h3, copy[i][0]);
      if (p) setText(p, copy[i][1]);
    });

    section.setAttribute(PATCHED + "-problem", "1");
  }

  function patchSolution(page) {
    var section = qs("section.solution", page);
    if (!section) return;

    var tag = qs(".solution-text .section-tag", section) || qs(".section-tag", section);
    if (tag && tag.closest(".solution")) setText(tag, "Как это выглядит");

    if (!section.getAttribute(PATCHED + "-solution-v2")) {
      setHtml(
        qs(".section-title", section),
        'Обновление расписания <span class="gradient-text">за пару минут</span>'
      );

      setText(
        qs(".solution-description", section),
        "Открыл — изменил занятие — нажал «Опубликовать». Все роли видят актуальную версию."
      );

      section.setAttribute(PATCHED + "-solution-v2", "1");
    }

    buildSolutionCards(section);
    patchSolutionMockup(section);
  }

  function buildSolutionCards(section) {
    var host = section.querySelector(".solution-text");
    if (!host) return;

    var cards = [
      { title: "Понятно без обучения", text: "Логика календаря, короткие действия и видимый результат" },
      { title: "Конфликты сразу видны", text: "Накладки подсвечиваются до публикации" },
    ];

    var wrap = host.querySelector(".solution-cards");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "solution-cards reveal active";
      var oldPoints = host.querySelector(".solution-points");
      if (oldPoints) oldPoints.after(wrap);
      else host.appendChild(wrap);
    }

    wrap.innerHTML = cards
      .map(function (card) {
        return (
          '<div class="solution-card">' +
          "<strong>" +
          card.title +
          "</strong>" +
          "<span>" +
          card.text +
          "</span></div>"
        );
      })
      .join("");

    var legacyPoints = host.querySelector(".solution-points");
    if (legacyPoints) legacyPoints.hidden = true;
  }

  function patchSolutionMockup(section) {
    var title = section.querySelector(".mockup-title");
    if (title) setText(title, "Расписание на одном экране");

    section.querySelectorAll(".mockup-btn").forEach(function (btn) {
      if (/Опубликовать/i.test(btn.textContent || "")) {
        btn.classList.add("mockup-btn-publish");
      }
    });

    var visual = section.querySelector(".solution-visual");
    if (!visual || section.querySelector(".mockup-caption-wrap")) return;

    var wrap = document.createElement("div");
    wrap.className = "mockup-caption-wrap reveal active";
    wrap.innerHTML =
      '<p class="mockup-caption">Нажмите «Опубликовать» — ученики и преподаватели видят обновление на телефоне.</p>' +
      '<a href="#niches" class="mockup-caption-link">Попробовать сами →</a>';
    visual.appendChild(wrap);
  }

  function easeStripHtml(chip, text) {
    return (
      '<div class="landing-container">' +
      '<div class="ease-strip-inner">' +
      (chip ? '<span class="ease-strip-chip">' + chip + "</span>" : "") +
      '<p class="ease-strip-text">' +
      text +
      "</p></div></div>"
    );
  }

  function insertEaseStrip(afterEl, id, chip, text) {
    if (!afterEl || !afterEl.parentNode) return null;
    var existing = id ? document.getElementById(id) : null;
    if (existing) return existing;

    var section = document.createElement("section");
    section.className = "ease-strip reveal active";
    if (id) section.id = id;
    section.innerHTML = easeStripHtml(chip, text);
    afterEl.insertAdjacentElement("afterend", section);
    return section;
  }

  function insertBeforeAfter(page) {
    var existing = document.getElementById("ease");
    if (existing) {
      var sub = existing.querySelector(".section-subtitle");
      if (sub) setText(sub, "Так меняется рабочий день");
      return;
    }

    var solution = qs("section.solution", page);
    if (!solution) return;

    var section = document.createElement("section");
    section.className = "before-after reveal active";
    section.id = "ease";
    section.innerHTML =
      '<div class="landing-container">' +
      '<div class="section-header center">' +
      '<span class="section-tag section-tag-success">Было / Стало</span>' +
      '<h2 class="section-title">От хаоса к\u00a0<span class="highlight-success">спокойствию</span></h2>' +
      '<p class="section-subtitle">Так меняется рабочий день</p>' +
      "</div>" +
      '<div class="before-after-grid">' +
      '<div class="ba-card ba-before reveal active">' +
      "<h3>Было</h3>" +
      "<ul>" +
      "<li>Правки повторяются в нескольких местах</li>" +
      "<li>В чатах постоянно спрашивают: «а где актуально?»</li>" +
      "<li>Участники открывают устаревшую версию</li>" +
      "<li>Накладки замечаете постфактум</li>" +
      "</ul></div>" +
      '<div class="ba-arrow" aria-hidden="true">→</div>' +
      '<div class="ba-card ba-after reveal active">' +
      "<h3>Стало</h3>" +
      "<ul>" +
      "<li>Изменение — пара минут, не пара дней</li>" +
      "<li>Одна ссылка — все роли видят своё</li>" +
      "<li>Версия обновляется сразу на телефоне</li>" +
      "<li>Конфликты ловятся до публикации</li>" +
      "</ul></div></div>" +
      '<div class="ba-visual">' +
      '<div class="ba-step"><div class="ba-step-icon">1</div><h4>Добавили</h4><p>Занятие в сетке — как в календаре</p></div>' +
      '<div class="ba-step"><div class="ba-step-icon">2</div><h4>Проверили</h4><p>Система подсветила накладки</p></div>' +
      '<div class="ba-step"><div class="ba-step-icon">3</div><h4>Опубликовали</h4><p>Все участники уже видят</p></div>' +
      "</div></div>";

    var strip = document.getElementById("ease-strip-after-solution");
    if (strip) {
      strip.insertAdjacentElement("afterend", section);
    } else {
      solution.insertAdjacentElement("afterend", section);
    }
  }

  function insertDailyUse(page) {
    if (document.getElementById("daily-use")) return;

    var niches = qs("section.niches", page);
    if (!niches) return;

    var section = document.createElement("section");
    section.className = "daily-use reveal active";
    section.id = "daily-use";
    section.innerHTML =
      '<div class="landing-container">' +
      '<div class="section-header center">' +
      '<span class="section-tag section-tag-success">Простота</span>' +
      '<h2 class="section-title">Как вы\u00a0<span class="gradient-text">пользуетесь</span> каждый день</h2>' +
      '<p class="section-subtitle">Три понятных шага для администратора, без лишних экранов и долгого обучения.</p>' +
      "</div>" +
      '<div class="daily-steps">' +
      '<div class="daily-step reveal active">' +
      '<div class="daily-step-num">1</div>' +
      "<h3>Открыли — понятно</h3>" +
      "<p>Видите день, группы, аудитории и ближайшие изменения без лишних переходов.</p></div>" +
      '<div class="daily-step reveal active">' +
      '<div class="daily-step-num">2</div>' +
      "<h3>Изменили — система помогла</h3>" +
      "<p>Конфликты аудиторий и преподавателей видны сразу, до публикации.</p></div>" +
      '<div class="daily-step reveal active">' +
      '<div class="daily-step-num">3</div>' +
      "<h3>Нажали «Опубликовать»</h3>" +
      "<p>Студенты, преподаватели и админы видят актуальное — с телефона.</p></div>" +
      "</div>" +
      '<div class="daily-use-cta">' +
      '<a href="#niches" class="btn btn-primary btn-large">Открыть демо — 30 секунд</a>' +
      "</div></div>";

    niches.insertAdjacentElement("beforebegin", section);
  }

  function patchNiches(page) {
    var section = qs("section.niches", page);
    if (!section || section.getAttribute(PATCHED + "-niches")) return;

    setHtml(
      qs(".section-title", section),
      'Для кого\u00a0<span class="gradient-text">Планово</span>'
    );

    var subtitle = qs(".section-subtitle", section);
    if (subtitle) {
      setText(
        subtitle,
        "Три ниши — один принцип: простое расписание. Подробности — в интерактивном демо."
      );
    }

    section.querySelectorAll(".niche-card").forEach(function (card) {
      if (card.querySelector(".niche-more-hint")) return;
      var footer = card.querySelector(".niche-footer");
      if (!footer) return;
      var hint = document.createElement("p");
      hint.className = "niche-more-hint";
      hint.textContent = "+ ещё возможности — в демо";
      footer.after(hint);
    });

    section.querySelectorAll(".niche-demo-btn, .demo-card-btn").forEach(function (btn) {
      setButtonLabel(btn, "Открыть демо 30 секунд");
    });

    section.setAttribute(PATCHED + "-niches", "1");
  }

  function patchHowItWorks(page) {
    var section = qs("section.how-it-works", page);
    if (!section || section.getAttribute(PATCHED + "-process")) return;

    var tag = qs(".section-tag", section);
    if (tag) setText(tag, "Запуск");

    setHtml(
      qs(".section-title", section),
      'Как мы\u00a0<span class="gradient-text">запускаем</span> Планово'
    );

    var subtitle = qs(".section-subtitle", section);
    if (subtitle) {
      setText(
        subtitle,
        "От первой встречи до работающей системы — мы ведём процесс, вам не нужно «разбираться в IT»."
      );
    }

    var steps = section.querySelectorAll(".step-content h3");
    var titles = [
      "Узнаём, как у вас сейчас",
      "Настраиваем под вас",
      "Показываем и правим вместе",
      "Запускаем и остаёмся на связи",
    ];
    steps.forEach(function (h3, i) {
      if (titles[i]) setText(h3, titles[i]);
    });

    var descs = section.querySelectorAll(".step-content p");
    var descCopy = [
      "15–30 минут разговора — без технического жаргона.",
      "Готовое ядро + ваш интерфейс. Не пишем с нуля полгода.",
      "Вы тестируете сами — пока сценарий не станет понятным вашей команде.",
      "Обучаем за один день. Поддержка — в Telegram.",
    ];
    descs.forEach(function (p, i) {
      if (descCopy[i]) setText(p, descCopy[i]);
    });

    section.setAttribute(PATCHED + "-process", "1");
  }

  function patchFeatures(page) {
    var section = qs("section.features", page);
    if (!section || section.getAttribute(PATCHED + "-features")) return;

    setHtml(
      qs(".section-title", section),
      'Что\u00a0<span class="gradient-text">облегчает</span> работу'
    );

    var cards = section.querySelectorAll(".feature-card");
    var copy = [
      ["Мгновенная публикация", "Одна кнопка — и расписание у всех. Без рассылок и устаревших копий."],
      ["Защита от ошибок", "Конфликты видны до публикации — не после звонка от преподавателя."],
      ["С телефона", "Участник открыл — увидел своё. Как мессенджер, не как архив документов."],
      ["Каждому своё", "Админ — всё. Преподаватель — свою загрузку. Ученик — только свою группу."],
      ["Без долгого внедрения", "Ядро готово — адаптируем быстрее, чем писать с нуля."],
      ["Понятная аналитика", "Загрузка аудиторий и посещаемость — цифры, а не догадки."],
    ];
    cards.forEach(function (card, i) {
      if (!copy[i]) return;
      var h3 = card.querySelector("h3");
      var p = card.querySelector("p");
      if (h3) setText(h3, copy[i][0]);
      if (p) setText(p, copy[i][1]);
    });

    section.setAttribute(PATCHED + "-features", "1");
  }

  function patchLead(page) {
    var intro = qs(".lead-intro", page);
    if (!intro || intro.getAttribute(PATCHED + "-lead")) return;

    setHtml(
      qs(".section-title", intro),
      'Обсудим без\u00a0<span class="gradient-text">сложных терминов</span>'
    );

    var text = qs(".lead-intro-text", intro);
    if (text) {
      setText(
        text,
        "Расскажите, как у вас сейчас устроено расписание — покажем, какие экраны нужны вашей команде и где вы теряете время."
      );
    }

    var submit = qs(".lead-submit", page);
    if (submit) setText(submit, "Получить консультацию");

    intro.setAttribute(PATCHED + "-lead", "1");
  }

  function patchNav(page) {
    var nav = qs("#navLinks", page);
    if (!nav || nav.getAttribute(PATCHED + "-nav")) return;

    var howLink = nav.querySelector('a[href="#how-it-works"]');
    if (howLink) setText(howLink, "Запуск");

    if (!nav.querySelector('a[href="#daily-use"]')) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#daily-use";
      a.textContent = "Простота";
      if (howLink && howLink.parentNode) {
        howLink.parentNode.before(li);
      } else {
        nav.appendChild(li);
      }
      li.appendChild(a);
    }

    nav.setAttribute(PATCHED + "-nav", "1");
  }

  function patchSalesCtas(page) {
    var labels = [
      [".nav-cta", "Открыть демо"],
      [".hero-buttons .btn-primary", "Открыть демо"],
      [".hero-buttons .btn-secondary", "Оставить заявку"],
      [".daily-use-cta .btn", "Открыть демо — 30 секунд"],
      [".niche-demo-btn", "Открыть демо 30 секунд"],
      [".demo-card-btn", "Открыть демо 30 секунд"],
      [".lead-submit", "Получить консультацию"],
    ];

    labels.forEach(function (item) {
      page.querySelectorAll(item[0]).forEach(function (el) {
        setButtonLabel(el, item[1]);
      });
    });
  }

  var PURPLE_HEX = /#(?:6366f1|818cf8|8b5cf6|a855f7|4f46e5|667eea|764ba2)(?:[0-9a-f]{2})?/gi;

  var YELLOW_MAP = {
    "#6366f1cc": "#d4c469cc",
    "#6366f115": "#f5f0dc",
    "#6366f1": "#d4c469",
    "#818cf8": "#f2ebc4",
    "#8b5cf6": "#e5dba8",
    "#a855f7": "#c4b888",
    "#4f46e5": "#afa052",
    "#667eea": "#f2ebc4",
    "#764ba2": "#8a8248",
  };

  function replacePurpleInStyle(style) {
    if (!style) return style;
    var out = style;
    Object.keys(YELLOW_MAP).forEach(function (from) {
      out = out.split(from).join(YELLOW_MAP[from]);
      out = out.split(from.toUpperCase()).join(YELLOW_MAP[from]);
    });
    return out.replace(PURPLE_HEX, function (match) {
      return YELLOW_MAP[match.toLowerCase()] || "#d4c469";
    });
  }

  function ensureRevealVisible(page) {
    page.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("active");
    });
  }

  function countCoreSections(page) {
    return [
      "section.hero",
      "section.problem",
      "section.solution",
      "section.niches",
      "section.how-it-works",
      "section.features",
      "section.lead-section",
      "footer.landing-footer",
    ].filter(function (sel) {
      return !!page.querySelector(sel);
    }).length;
  }

  function patchPurpleToYellow(page) {
    if (!page || page.getAttribute(PATCHED + "-colors-v2")) return;
    page.setAttribute(PATCHED + "-colors-v2", "1");

    page.querySelectorAll("[style]").forEach(function (el) {
      var style = el.getAttribute("style");
      var next = replacePurpleInStyle(style);
      if (next !== style) el.setAttribute("style", next);
    });

    page.querySelectorAll("stop").forEach(function (stop) {
      var color = stop.getAttribute("stop-color");
      if (!color) return;
      var lower = color.toLowerCase();
      if (YELLOW_MAP[lower]) {
        stop.setAttribute("stop-color", YELLOW_MAP[lower]);
      } else if (/6366f1|8b5cf6|818cf8|a855f7/i.test(color)) {
        stop.setAttribute("stop-color", "#d4c469");
      }
    });

    page.querySelectorAll(".process-path-progress").forEach(function (path) {
      path.setAttribute("stroke", "#d4c469");
    });
  }

  function patchMeta() {
    if (!isPreviewMode()) return;
    document.title = "Планово — расписание для учебных заведений (PREVIEW)";
    var desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        "Простое онлайн-расписание для учебных заведений, секций и клубов. Быстрое обновление, роли и мобильный доступ. PREVIEW."
      );
    }
  }

  function applyAllPatches() {
    var page = qs(".landing-page");
    if (!page) return false;

    page.classList.add("landing-preview");
    ensureRibbon();

    var coreCount = countCoreSections(page);
    if (coreCount < 5) {
      return false;
    }

    patchMeta();
    patchHero(page);
    patchProblem(page);
    patchSolution(page);
    patchNiches(page);
    patchHowItWorks(page);
    patchFeatures(page);
    patchLead(page);
    patchNav(page);
    patchSalesCtas(page);
    patchPurpleToYellow(page);

    var solution = qs("section.solution", page);
    insertEaseStrip(
      solution,
      "ease-strip-after-solution",
      "Комфорт в 2 клика",
      "<strong>Без тяжёлого внедрения.</strong> Просто расписание, которое команда понимает с первого дня."
    );

    insertBeforeAfter(page);
    insertDailyUse(page);

    var dailyUse = document.getElementById("daily-use");
    insertEaseStrip(
      dailyUse,
      "ease-strip-before-niches",
      "−80% ручных правок",
      "<strong>Меньше рутины — больше контроля.</strong> Учебная часть разберётся за один день."
    );

    ensureRevealVisible(page);

    return true;
  }

  function schedulePatch() {
    if (attempts >= maxAttempts) return;
    attempts += 1;
    var ok = applyAllPatches();

    var page = qs(".landing-page");
    var hero = qs(".hero-title");
    var needRetry =
      !ok ||
      !hero ||
      hero.textContent.indexOf("Планово держит") === -1 ||
      (page && countCoreSections(page) < 7);

    if (needRetry) {
      setTimeout(schedulePatch, 800);
    }
  }

  function scheduleReinsertOnly() {
    if (reinsertTimer) clearTimeout(reinsertTimer);
    reinsertTimer = setTimeout(function () {
      var page = qs(".landing-page");
      if (!page) return;
      insertBeforeAfter(page);
      insertDailyUse(page);
      patchSalesCtas(page);
      var solution = qs("section.solution", page);
      insertEaseStrip(
        solution,
        "ease-strip-after-solution",
        "Комфорт в 2 клика",
        "<strong>Без тяжёлого внедрения.</strong> Просто расписание, которое команда понимает с первого дня."
      );
      var dailyUse = document.getElementById("daily-use");
      insertEaseStrip(
        dailyUse,
        "ease-strip-before-niches",
        "−80% ручных правок",
        "<strong>Меньше рутины — больше контроля.</strong> Учебная часть разберётся за один день."
      );
      ensureRevealVisible(page);
    }, 120);
  }

  function watchInjectedSections() {
    var page = qs(".landing-page");
    if (!page || page.getAttribute(PATCHED + "-watch")) return;
    page.setAttribute(PATCHED + "-watch", "1");

    var observer = new MutationObserver(function (mutations) {
      var removedInjected = mutations.some(function (m) {
        return (
          m.type === "childList" &&
          m.removedNodes.length &&
          Array.prototype.some.call(m.removedNodes, function (node) {
            if (node.nodeType !== 1) return false;
            var id = node.id || "";
            return (
              id === "ease" ||
              id === "daily-use" ||
              id.indexOf("ease-strip") === 0 ||
              (node.classList &&
                (node.classList.contains("before-after") ||
                  node.classList.contains("daily-use") ||
                  node.classList.contains("ease-strip")))
            );
          })
        );
      });
      if (removedInjected) scheduleReinsertOnly();
    });
    observer.observe(page, { childList: true, subtree: false });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(schedulePatch, 300);
      watchInjectedSections();
    });
  } else {
    setTimeout(schedulePatch, 300);
    watchInjectedSections();
  }

  window.addEventListener(
    "load",
    function () {
      [600, 1500, 3000, 5000].forEach(function (ms) {
        setTimeout(schedulePatch, ms);
      });
    },
    { once: true }
  );
})();
