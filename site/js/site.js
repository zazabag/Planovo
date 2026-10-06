/* Планово — главная страница. Чистый JS без библиотек. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var TELEGRAM_URL = 'https://t.me/planovosells_bot?start=site';
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var mqPhone = window.matchMedia ? window.matchMedia('(max-width: 860px)') : { matches: false };
  var hasIO = 'IntersectionObserver' in window;

  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function onMq(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }
  function rafThrottle(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  /* ---------- Появление элементов при входе экрана ---------- */
  function initReveal() {
    var els = $$('[data-reveal]');
    if (reduceMotion || !hasIO) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var shown = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      shown.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      shown.forEach(function (el, i) {
        var delay = Math.min(i, 6) * 70;
        io.unobserve(el);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        setTimeout(function () {
          el.style.transitionDelay = '';
          el.removeAttribute('data-reveal');
        }, 800 + delay);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Вписывание макетов и телефонов в свободное место экрана ---------- */
  function initFit() {
    var boxes = $$('[data-fit]');
    if (!boxes.length) return;

    function fit(box) {
      var stage = box.querySelector('.fit__stage');
      if (!stage) return;
      var W = box.clientWidth;
      var H = box.clientHeight;
      if (!W || !H) return;
      var max = parseFloat(box.getAttribute('data-fit-max')) || 1;
      var s;
      if (box.getAttribute('data-fit') === 'fluid') {
        var maxW = parseFloat(box.getAttribute('data-fit-maxw')) || Infinity;
        var w = Math.min(W, maxW);
        stage.style.width = w + 'px';
        s = Math.min(max, W / w, H / stage.offsetHeight);
        // Если пришлось уменьшить по высоте — даём макету стать шире, чтобы он занял всю ширину.
        for (var k = 0; k < 4 && s < 0.985; k++) {
          var w2 = Math.min(maxW, Math.floor(W / s));
          if (Math.abs(w2 - w) < 2) break;
          stage.style.width = w2 + 'px';
          w = w2;
          s = Math.min(max, W / w, H / stage.offsetHeight);
        }
      } else {
        s = Math.min(max, W / stage.offsetWidth, H / stage.offsetHeight);
      }
      stage.style.transform = 'translate(-50%, -50%) scale(' + s.toFixed(4) + ')';
      box.classList.add('is-fit');
    }

    var queue = [];
    var flush = rafThrottle(function () {
      var list = queue;
      queue = [];
      list.forEach(fit);
    });
    function schedule(box) {
      if (queue.indexOf(box) === -1) queue.push(box);
      flush();
    }

    boxes.forEach(fit);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (e) {
          var box = e.target.hasAttribute('data-fit') ? e.target : e.target.closest('[data-fit]');
          if (box) schedule(box);
        });
      });
      boxes.forEach(function (box) {
        ro.observe(box);
        var stage = box.querySelector('.fit__stage');
        if (stage) ro.observe(stage);
      });
    } else {
      window.addEventListener('resize', function () { boxes.forEach(schedule); });
    }
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { boxes.forEach(schedule); });
  }

  /* ---------- 2. Демо: поставьте замену сами ---------- */
  function initDemo() {
    var box = doc.querySelector('[data-demo]');
    if (!box) return;

    function L(subj, teacher, room) { return { kind: 'lesson', subj: subj, teacher: teacher, room: room }; }
    var F = { kind: 'free' };
    var V = { kind: 'vacated' };
    var B = { kind: 'busy' };
    var CELLS = [
      [L('Математика', 'Иванова', '204'), L('Литература', 'Орлова', '207'), L('Информ.', 'Соколова', '410'), L('Физкультура', 'Ким', 'зал')],
      [L('Математика', 'Иванова', '204'), V, L('Англ. яз.', 'Белова', '215'), F],
      [L('Физика', 'Громов', '302'), L('Математика', 'Иванова', '204'), B, L('Литература', 'Орлова', '207')],
      [L('Информ.', 'Соколова', '410'), F, L('Физкультура', 'Ким', 'зал'), F],
      [L('История', 'Петренко', '118'), L('Физика', 'Громов', '302'), L('Англ. яз.', 'Белова', '215'), F]
    ];
    var INITIAL = { picked: false, hover: null, placed: null, conflict: null, msg: null, published: false, toast: false };
    var st = assign({}, INITIAL);

    function q(sel) { return box.querySelector(sel); }
    var el = {
      tile: q('[data-demo-tile]'),
      reset: q('[data-demo-reset]'),
      hint: q('[data-demo-hint]'),
      publish: q('[data-demo-publish]'),
      badge: q('[data-demo-badge]'),
      badgeDot: q('[data-demo-badge-dot]'),
      msgBox: q('[data-demo-msg-box]'),
      msg: q('[data-demo-msg]'),
      toast: q('[data-demo-toast]'),
      phoneNotif: q('[data-demo-phone-notif]'),
      phoneRow: q('[data-demo-phone-row]'),
      phoneTitle: q('[data-demo-phone-title]'),
      phoneSub: q('[data-demo-phone-sub]'),
      floatNotif: q('[data-demo-float-notif]')
    };
    var cells = {};
    $$('.cell', box).forEach(function (c) { cells[c.getAttribute('data-d') + '-' + c.getAttribute('data-s')] = c; });

    var autoTimers = [];
    var uiTimers = [];
    var touched = false;
    var autoDirty = false;

    function assign(target, src) { for (var k in src) target[k] = src[k]; return target; }
    function later(fn, ms, list) {
      var t = setTimeout(function () {
        var i = list.indexOf(t);
        if (i > -1) list.splice(i, 1);
        fn();
      }, ms);
      list.push(t);
      return t;
    }
    function clear(list) { list.forEach(clearTimeout); list.length = 0; }
    function set(patch) { assign(st, patch); render(); }

    // Первое касание останавливает автосценарий. Если сценарий успел что-то поменять,
    // посетитель начинает с чистой сетки (кроме нажатий «Опубликовать» и «Сбросить»).
    function touch(keepState) {
      if (touched) return;
      touched = true;
      clear(autoTimers);
      if (autoDirty && !keepState) {
        clear(uiTimers);
        el.tile.classList.remove('is-shake');
        st = assign({}, INITIAL);
        render();
      }
    }

    function runDemo() {
      if (touched) return;
      autoDirty = true;
      set({ picked: true, msg: null });
      later(function () { set({ hover: { d: 1, s: 1 } }); }, 1100, autoTimers);
      later(function () { place(1, 1); }, 2000, autoTimers);
      later(function () { publish(); }, 3400, autoTimers);
      later(function () { reset(); }, 8600, autoTimers);
      later(runDemo, 10400, autoTimers);
    }

    function place(d, s) {
      if (!st.picked) return;
      var c = CELLS[d][s];
      if (c.kind === 'lesson') return conflict(d, s, 'У ИС-21 в это время уже ' + c.subj + ' (' + c.teacher + '). Две пары в одну клетку поставить нельзя.');
      if (c.kind === 'busy') return conflict(d, s, 'Петренко в это время ведёт у ПКС-32 в 118. Накладку поставить нельзя — конструктор не пропустил.');
      set({ placed: { d: d, s: s }, picked: false, hover: null, conflict: null, msg: { type: 'ok', text: 'Петренко свободна, аудитория 118 свободна. Накладок нет — можно публиковать.' } });
    }
    function conflict(d, s, text) {
      var node = cells[d + '-' + s];
      if (node) { node.classList.remove('is-conflict'); void node.offsetWidth; }
      el.tile.classList.remove('is-shake'); void el.tile.offsetWidth;
      set({ conflict: { d: d, s: s }, hover: null, msg: { type: 'err', text: text } });
      el.tile.classList.add('is-shake');
      later(function () { el.tile.classList.remove('is-shake'); set({ conflict: null }); }, 1500, uiTimers);
    }
    function publish() {
      if (!st.placed || st.published) return;
      set({ published: true, toast: true, msg: { type: 'ok', text: 'Опубликовано. ИС-21 и Петренко получили уведомление.' } });
      later(function () { set({ toast: false }); }, 4200, uiTimers);
    }
    function reset() {
      clear(uiTimers);
      el.tile.classList.remove('is-shake');
      set({ placed: null, published: false, picked: false, hover: null, conflict: null, msg: null, toast: false });
    }

    function text(node, value) { if (node && node.textContent !== value) node.textContent = value; }

    function renderCell(d, s) {
      var node = cells[d + '-' + s];
      if (!node) return;
      var c = CELLS[d][s];
      var isPlaced = !!(st.placed && st.placed.d === d && st.placed.s === s);
      var isHover = !!(st.picked && st.hover && st.hover.d === d && st.hover.s === s);
      var isConf = !!(st.conflict && st.conflict.d === d && st.conflict.s === s);
      var cls = 'cell' + (d >= 3 ? ' wide-only' : '');
      var title = '';
      var sub = '';
      var tag = '';
      if (isPlaced) { cls += ' cell--placed'; title = 'История'; sub = 'Петренко · 118'; tag = 'Замена'; }
      else if (c.kind === 'lesson') { cls += ' cell--lesson'; title = c.subj; sub = c.teacher + ' · ' + c.room; }
      else if (c.kind === 'vacated') { cls += ' cell--vacated'; title = 'Физика'; sub = 'Громов · 302'; tag = 'отменена'; }
      else { cls += ' cell--free'; title = 'Окно'; }
      if (st.picked && c.kind !== 'lesson' && !isPlaced) cls += ' cell--target';
      if (isHover) cls += ' is-hover';
      if (isConf) cls += ' is-conflict';
      if (node.className !== cls) node.className = cls;
      text(node.querySelector('.cell__title'), title);
      text(node.querySelector('.cell__sub'), sub);
      text(node.querySelector('.cell__tag'), tag);
    }

    function render() {
      var placedOk = !!st.placed;
      box.classList.toggle('is-picking', st.picked);

      el.tile.hidden = placedOk;
      el.tile.classList.toggle('is-picked', st.picked);
      el.tile.setAttribute('aria-pressed', st.picked ? 'true' : 'false');
      el.reset.hidden = !placedOk;
      text(el.hint, st.published
        ? (mqPhone.matches
          ? 'Опубликовано. Студенты и Петренко уже видят новую версию.'
          : 'Опубликовано. Студенты и Петренко уже видят новую версию — смотрите на телефон справа.')
        : placedOk
          ? 'История стоит во вторник, 10:10. Пока это черновик — студенты его не видят. Нажмите «Опубликовать».'
          : 'Вместо его Физики во вторник нужна История с Петренко. Перетащите карточку в сетку — или нажмите на неё, а потом на клетку.');

      text(el.publish, st.published ? 'Опубликовано ✓' : 'Опубликовать');
      el.publish.classList.toggle('is-ready', placedOk && !st.published);
      el.publish.classList.toggle('is-done', st.published);
      el.publish.setAttribute('aria-disabled', placedOk && !st.published ? 'false' : 'true');
      text(el.badge, st.published ? 'Опубликовано' : 'Черновик');
      el.badgeDot.classList.toggle('is-ok', st.published);

      for (var d = 0; d < 5; d++) for (var s = 0; s < 4; s++) renderCell(d, s);

      el.msgBox.setAttribute('data-type', st.msg ? st.msg.type : 'idle');
      text(el.msg, st.msg ? st.msg.text : '');

      el.toast.classList.toggle('is-on', st.toast);
      el.phoneNotif.classList.toggle('is-on', st.published);
      el.phoneRow.classList.toggle('is-on', st.published);
      text(el.phoneTitle, st.published ? 'История' : 'Физика');
      text(el.phoneSub, st.published ? 'Петренко · 118' : 'Громов · 302');
      el.floatNotif.classList.toggle('is-on', st.toast);
      root.classList.toggle('has-demo-notif', st.toast && mqPhone.matches);
    }

    // Карточка: перетаскивание и «тап — взять»
    el.tile.addEventListener('dragstart', function (e) {
      touch();
      try { e.dataTransfer.setData('text/plain', 'tile'); e.dataTransfer.effectAllowed = 'copyMove'; } catch (_) { /* старые браузеры */ }
      set({ picked: true, msg: null });
    });
    el.tile.addEventListener('dragend', function () { if (!st.placed) set({ picked: false, hover: null }); });
    el.tile.addEventListener('click', function () { touch(); set({ picked: !st.picked, msg: null, hover: null }); });
    el.tile.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.tile.click(); }
    });
    el.publish.addEventListener('click', function () { touch(true); publish(); });
    el.reset.addEventListener('click', function () { touch(true); reset(); });

    Object.keys(cells).forEach(function (key) {
      var node = cells[key];
      var d = +node.getAttribute('data-d');
      var s = +node.getAttribute('data-s');
      node.addEventListener('dragover', function (e) {
        e.preventDefault();
        var h = st.hover;
        if (st.picked && !(h && h.d === d && h.s === s)) set({ hover: { d: d, s: s } });
      });
      node.addEventListener('dragleave', function () {
        var h = st.hover;
        if (h && h.d === d && h.s === s) set({ hover: null });
      });
      node.addEventListener('drop', function (e) { e.preventDefault(); touch(); place(d, s); });
      node.addEventListener('click', function () {
        touch();
        if (st.picked) place(d, s);
        else if (CELLS[d][s].kind === 'vacated' && !st.placed) set({ msg: { type: 'hint', text: 'Сначала возьмите карточку «История» над сеткой.' } });
      });
    });

    onMq(mqPhone, render);
    render();

    // Автосценарий: через 3,5 с после того, как экран с демо показался, если посетитель ничего не трогал.
    // При настройке «уменьшить движение» демо само не играет.
    if (reduceMotion) return;
    if (hasIO) {
      var started = false;
      var io = new IntersectionObserver(function (entries) {
        if (started || !entries.some(function (e) { return e.isIntersecting; })) return;
        started = true;
        io.disconnect();
        later(runDemo, 3500, autoTimers);
      }, { threshold: 0.5 });
      io.observe(box);
    } else {
      later(runDemo, 3500, autoTimers);
    }
  }

  /* ---------- 8. Темы экрана студента ---------- */
  function initThemes() {
    var screen = doc.querySelector('[data-theme-screen]');
    var device = doc.querySelector('[data-theme-device]');
    if (!screen || !device) return;
    var THEMES = {
      primer: { bg: '#F3EFE8', surface: '#FFFDF9', text: '#221E1A', muted: '#6B615A', line: '#C9BFB0', accent: '#8A3B64', onAccent: '#FFFFFF', subst: '#FAE9B9', substText: '#6B5200', ok: '#45875A', dark: false },
      vesna: { bg: '#EEF6EE', surface: '#FFFFFF', text: '#1E2A22', muted: '#5F7466', line: '#CFDDD2', accent: '#2F7D4F', onAccent: '#FFFFFF', subst: '#FCE4EC', substText: '#8A2F4A', ok: '#2F7D4F', dark: false },
      noch: { bg: '#15171C', surface: '#1F2229', text: '#F2F2F2', muted: '#9AA0AB', line: '#2F333C', accent: '#8FB7FF', onAccent: '#0E1420', subst: '#3A3320', substText: '#F6D06F', ok: '#7FD39A', dark: true }
    };
    var buttons = $$('[data-theme]');
    var input = doc.querySelector('[data-theme-custom]');
    var label = doc.querySelector('[data-theme-custom-label]');
    var supportsMix = !!(window.CSS && CSS.supports && CSS.supports('color', 'color-mix(in srgb, red 7%, white)'));

    function mixWithWhite(hex, pct) {
      var n = parseInt(hex.slice(1), 16);
      var ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
        return Math.round(v * pct / 100 + 255 * (1 - pct / 100));
      });
      return 'rgb(' + ch.join(',') + ')';
    }
    function customTheme(c) {
      return {
        bg: supportsMix ? 'color-mix(in srgb, ' + c + ' 7%, #FFFFFF)' : mixWithWhite(c, 7),
        surface: '#FFFFFF', text: '#1C1C1E', muted: '#6B6B70',
        line: supportsMix ? 'color-mix(in srgb, ' + c + ' 25%, #FFFFFF)' : mixWithWhite(c, 25),
        accent: c, onAccent: '#FFFFFF', subst: '#FAE9B9', substText: '#6B5200', ok: '#45875A', dark: false
      };
    }
    function apply(key) {
      var t = key === 'custom' ? customTheme(input.value) : THEMES[key];
      if (!t) return;
      var vars = {
        '--th-bg': t.bg, '--th-surface': t.surface, '--th-text': t.text, '--th-muted': t.muted,
        '--th-line': t.line, '--th-accent': t.accent, '--th-on-accent': t.onAccent,
        '--th-subst': t.subst, '--th-subst-text': t.substText, '--th-ok': t.ok
      };
      for (var k in vars) screen.style.setProperty(k, vars[k]);
      device.classList.toggle('iphone--dark', !!t.dark);
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-theme') === key;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (label) label.classList.toggle('is-on', key === 'custom');
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-theme')); });
    });
    if (input) {
      input.addEventListener('input', function () { apply('custom'); });
      input.addEventListener('change', function () { apply('custom'); });
      input.addEventListener('click', function () { apply('custom'); });
    }
  }

  /* ---------- Карусели на телефоне (экраны 3 и 15) ---------- */
  function initCarousels() {
    $$('[data-carousel]').forEach(function (car) {
      var track = car.querySelector('[data-carousel-track]');
      var dotsBox = car.querySelector('[data-carousel-dots]');
      if (!track || !dotsBox) return;
      var items = Array.prototype.slice.call(track.children);
      var dots = items.map(function (item, i) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'carousel__dot';
        b.setAttribute('aria-label', 'Карточка ' + (i + 1) + ' из ' + items.length);
        b.addEventListener('click', function () {
          track.scrollTo({ left: item.offsetLeft - items[0].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
        dotsBox.appendChild(b);
        return b;
      });
      function update() {
        var x = track.scrollLeft;
        var best = 0;
        var bestDist = Infinity;
        items.forEach(function (it, i) {
          var dist = Math.abs(it.offsetLeft - items[0].offsetLeft - x);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        if (x > 0 && x >= track.scrollWidth - track.clientWidth - 2) best = items.length - 1;
        dots.forEach(function (b, i) { b.setAttribute('aria-current', i === best ? 'true' : 'false'); });
      }
      track.addEventListener('scroll', rafThrottle(update), { passive: true });
      window.addEventListener('resize', rafThrottle(update));
      update();
    });
  }

  /* ---------- 17. Счётчики КЭМС ---------- */
  function initCounters() {
    var box = doc.querySelector('[data-counters]');
    if (!box || reduceMotion || !hasIO) return;
    var nums = $$('[data-count]', box);
    function draw(k) {
      nums.forEach(function (n) {
        var target = +n.getAttribute('data-count');
        var step = +(n.getAttribute('data-count-step') || 1);
        var v = Math.round(target * k / step) * step;
        n.textContent = (n.getAttribute('data-count-prefix') || '') + v.toLocaleString('ru-RU');
      });
    }
    draw(0);
    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      var t0 = performance.now();
      var dur = 1400;
      (function step(now) {
        var x = Math.min(1, (now - t0) / dur);
        draw(1 - Math.pow(1 - x, 3));
        if (x < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.3 });
    io.observe(box);
  }

  /* ---------- 20. Вопросы: открыт один за раз ---------- */
  function initFaq() {
    var items = $$('.faq details');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d && o.open) o.open = false; });
      });
    });
  }

  /* ---------- Плавающая кнопка Telegram ----------
     Прячется на экране связи, а также на любом экране, где в покое она закрыла бы текст или макет
     (на невысоких экранах содержимое занимает всю высоту). */
  function initFab() {
    var fab = doc.querySelector('[data-tg-fab]');
    var zone = doc.getElementById('svyaz');
    if (!fab) return;
    var CONTENT = 'p, h1, h2, h3, li, summary, label, input, textarea, button, a:not([data-tg-fab]), ' +
      '.card, .feat, .mock, .iphone, .ios-notif, .conclusion, .tray, .demo-msg, .counter, .step, ' +
      '.rows__item, .contact, .lead-form, .site-footer, .pill, .theme-switch, .carousel__dots, ' +
      '.split__text, .intro__text, .sec-head, .badge, .eyebrow';
    var inContact = false;
    var covering = false;

    function apply() { fab.classList.toggle('is-hidden', inContact || covering); }
    function check() {
      // Геометрия без учёта сдвига при скрытии
      var x0 = fab.offsetLeft, y0 = fab.offsetTop, w = fab.offsetWidth, h = fab.offsetHeight;
      var vw = root.clientWidth, vh = window.innerHeight;
      var hit = false;
      for (var ix = 0; ix <= 3 && !hit; ix++) {
        for (var iy = 0; iy <= 3 && !hit; iy++) {
          var x = x0 - 6 + (w + 12) * ix / 3;
          var y = y0 - 6 + (h + 12) * iy / 3;
          if (x < 0 || y < 0 || x >= vw || y >= vh) continue;
          var stack = doc.elementsFromPoint(x, y);
          for (var k = 0; k < stack.length; k++) {
            if (fab.contains(stack[k])) continue;
            if (stack[k].closest(CONTENT)) hit = true;
            break;
          }
        }
      }
      covering = hit;
      apply();
    }

    var settleTimer = null;
    var revealTimer = null;
    function settle() {
      clearTimeout(settleTimer);
      clearTimeout(revealTimer);
      settleTimer = setTimeout(check, 140);
      revealTimer = setTimeout(check, 950);
    }
    window.addEventListener('scroll', settle, { passive: true });
    window.addEventListener('resize', settle);
    doc.addEventListener('click', function () { setTimeout(check, 120); });
    doc.addEventListener('toggle', function () { setTimeout(check, 60); }, true);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(check);
    settle();

    if (zone && hasIO) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { inContact = e.isIntersecting; });
        apply();
      }, { threshold: 0.15 });
      io.observe(zone);
    }
  }

  /* ---------- 21. Форма заявки ---------- */
  function initForm() {
    var form = doc.querySelector('[data-lead-form]');
    if (!form) return;
    var status = form.querySelector('[data-lead-status]');
    var button = form.querySelector('[type="submit"]');
    var f = form.elements;

    function show(kind, html) {
      status.hidden = false;
      status.className = 'lead-form__status is-' + kind;
      status.innerHTML = html;
    }
    function fail() {
      show('err', 'Не удалось отправить, <a href="' + TELEGRAM_URL + '" target="_blank" rel="noopener">напишите в Telegram</a>.');
    }

    f.namedItem('contact').addEventListener('input', function () { this.removeAttribute('aria-invalid'); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var contact = f.namedItem('contact').value.trim();
      if (!contact) {
        f.namedItem('contact').setAttribute('aria-invalid', 'true');
        show('err', 'Укажите телефон или почту, чтобы мы могли ответить.');
        f.namedItem('contact').focus();
        return;
      }
      if (!f.namedItem('consent').checked) {
        show('err', 'Отметьте согласие на обработку персональных данных.');
        return;
      }
      var data = {
        name: f.namedItem('name').value.trim(),
        organization: f.namedItem('organization').value.trim(),
        contact: contact,
        message: f.namedItem('message').value.trim(),
        page: location.href
      };
      var endpoint = window.PLANOVO_LEAD_ENDPOINT;
      if (!endpoint || !window.fetch) { fail(); return; }

      button.disabled = true;
      button.textContent = 'Отправляем…';
      status.hidden = true;
      var ctrl = 'AbortController' in window ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          show('ok', 'Заявка отправлена. Ответим в тот же день.');
        })
        .catch(fail)
        .then(function () {
          if (timer) clearTimeout(timer);
          button.disabled = false;
          button.textContent = 'Отправить';
        });
    });
  }

  /* ---------- Пока человек печатает, прилипание экранов выключено ---------- */
  function initTypingGuard() {
    function isField(t) { return t && t.matches && t.matches('input:not([type="checkbox"]):not([type="color"]), textarea'); }
    doc.addEventListener('focusin', function (e) { if (isField(e.target)) root.classList.add('no-snap'); });
    doc.addEventListener('focusout', function (e) { if (isField(e.target)) root.classList.remove('no-snap'); });
  }

  function init() {
    initReveal();
    initFit();
    initDemo();
    initThemes();
    initCarousels();
    initCounters();
    initFaq();
    initFab();
    initForm();
    initTypingGuard();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
