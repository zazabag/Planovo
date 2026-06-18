(function () {
  "use strict";

  var section = null;
  var wrap = null;
  var svg = null;
  var pathTrack = null;
  var pathGlow = null;
  var pathLine = null;
  var pathDot = null;
  var pathDotHalo = null;
  var pathNodes = [];
  var stepSlots = [];
  var stepEls = [];
  var pathLength = 0;
  var rafId = 0;
  var scrollActive = false;
  var reducedMotion = false;
  var displayProgress = 0;

  var LAYOUT = {
    desktop: [
      { top: "0%", left: "0%", width: "44%" },
      { top: "26%", right: "0%", left: "auto", width: "44%" },
      { top: "52%", left: "3%", width: "44%" },
      { bottom: "0%", right: "0%", left: "auto", top: "auto", width: "44%" },
    ],
    mobile: [
      { top: "0%", left: "0%", width: "100%" },
      { top: "25%", left: "0%", width: "100%" },
      { top: "50%", left: "0%", width: "100%" },
      { bottom: "0%", left: "0%", top: "auto", width: "100%" },
    ],
  };

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function createSvgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  /** Catmull-Rom → cubic Bézier — плавная органическая кривая (scroll-storyteller draw-path) */
  function smoothPath(points) {
    if (points.length < 2) return "";
    var d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);

    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[Math.max(i - 1, 0)];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[Math.min(i + 2, points.length - 1)];
      var cp1x = p1.x + (p2.x - p0.x) / 6;
      var cp1y = p1.y + (p2.y - p0.y) / 6;
      var cp2x = p2.x - (p3.x - p1.x) / 6;
      var cp2y = p2.y - (p3.y - p1.y) / 6;
      d +=
        " C " +
        cp1x.toFixed(1) +
        " " +
        cp1y.toFixed(1) +
        " " +
        cp2x.toFixed(1) +
        " " +
        cp2y.toFixed(1) +
        " " +
        p2.x.toFixed(1) +
        " " +
        p2.y.toFixed(1);
    }

    return d;
  }

  /** Дуги между якорями шагов — линия проходит через каждый badge */
  function buildPathPoints(anchors) {
    if (anchors.length < 2) return anchors.slice();

    var points = [anchors[0]];
    var bulge = isMobile() ? 22 : 56;

    for (var i = 1; i < anchors.length; i++) {
      var prev = anchors[i - 1];
      var curr = anchors[i];
      var midX = (prev.x + curr.x) / 2;
      var midY = (prev.y + curr.y) / 2;
      var dx = curr.x - prev.x;
      var dy = curr.y - prev.y;
      var len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len;
      var ny = dx / len;
      var side = isMobile() ? 1 : i % 2 === 0 ? -1 : 1;

      points.push({
        x: midX + nx * bulge * side,
        y: midY + ny * bulge * side * 0.65,
      });
      points.push(curr);
    }

    return points;
  }

  function buildSvg() {
    var ns = "http://www.w3.org/2000/svg";
    var root = document.createElementNS(ns, "svg");
    root.setAttribute("class", "process-path-svg");
    root.setAttribute("aria-hidden", "true");

    var defs = document.createElementNS(ns, "defs");
    var grad = createSvgEl("linearGradient", {
      id: "planovoProcessGrad",
      gradientUnits: "userSpaceOnUse",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "800",
    });
    grad.innerHTML =
      '<stop offset="0%" stop-color="#6366f1"/>' +
      '<stop offset="45%" stop-color="#8b5cf6"/>' +
      '<stop offset="100%" stop-color="#06b6d4"/>';

    var glowFilter = createSvgEl("filter", {
      id: "planovoProcessGlow",
      x: "-30%",
      y: "-30%",
      width: "160%",
      height: "160%",
    });
    glowFilter.innerHTML =
      '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>';

    defs.appendChild(grad);
    defs.appendChild(glowFilter);
    root.appendChild(defs);

    pathTrack = createSvgEl("path", { class: "process-path-track" });
    pathGlow = createSvgEl("path", {
      class: "process-path-glow draw-path",
      filter: "url(#planovoProcessGlow)",
    });
    pathLine = createSvgEl("path", { class: "process-path-line draw-path" });
    pathDotHalo = createSvgEl("circle", {
      class: "process-path-dot-halo",
      r: "14",
      cx: "0",
      cy: "0",
    });
    pathDot = createSvgEl("circle", {
      class: "process-path-dot",
      r: "7",
      cx: "0",
      cy: "0",
    });

    root.appendChild(pathTrack);
    root.appendChild(pathGlow);
    root.appendChild(pathLine);
    root.appendChild(pathDotHalo);
    root.appendChild(pathDot);

    return root;
  }

  function ensurePathNodes(count) {
    while (pathNodes.length < count) {
      var node = createSvgEl("circle", {
        class: "process-path-node",
        r: "5",
        cx: "0",
        cy: "0",
      });
      svg.insertBefore(node, pathDotHalo);
      pathNodes.push(node);
    }
    while (pathNodes.length > count) {
      var removed = pathNodes.pop();
      if (removed && removed.parentNode) removed.parentNode.removeChild(removed);
    }
  }

  function applyStepLayout() {
    var layout = isMobile() ? LAYOUT.mobile : LAYOUT.desktop;
    stepSlots.forEach(function (slot, i) {
      var pos = layout[i] || layout[layout.length - 1];
      slot.style.top = pos.top || "auto";
      slot.style.left = pos.left || "auto";
      slot.style.right = pos.right || "auto";
      slot.style.bottom = pos.bottom || "auto";
      slot.style.width = pos.width || "auto";
    });
  }

  function getAnchorPoints() {
    if (!wrap) return [];
    var wrapRect = wrap.getBoundingClientRect();
    return stepEls
      .map(function (step) {
        var badge = step.querySelector(".process-step-badge");
        if (!badge) return null;
        var r = badge.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - wrapRect.left,
          y: r.top + r.height / 2 - wrapRect.top,
        };
      })
      .filter(Boolean);
  }

  function prepareDrawPaths() {
    if (!pathLine) return;
    pathLength = pathLine.getTotalLength();
    pathLine.style.strokeDasharray = String(pathLength);
    if (pathGlow) pathGlow.style.strokeDasharray = String(pathLength);
    if (!reducedMotion) {
      pathLine.style.strokeDashoffset = String(pathLength);
      if (pathGlow) pathGlow.style.strokeDashoffset = String(pathLength);
    }
  }

  function rebuildPath() {
    if (!wrap || !pathTrack || !pathLine) return;

    applyStepLayout();

    var wrapRect = wrap.getBoundingClientRect();
    var w = wrapRect.width;
    var h = wrapRect.height;
    if (w < 10 || h < 10) return;

    var anchors = getAnchorPoints();
    if (anchors.length < 2) return;

    svg.setAttribute("viewBox", "0 0 " + w + " " + h);

    var grad = svg.querySelector("#planovoProcessGrad");
    if (grad) grad.setAttribute("y2", String(h));

    var d = smoothPath(buildPathPoints(anchors));
    pathTrack.setAttribute("d", d);
    pathGlow.setAttribute("d", d);
    pathLine.setAttribute("d", d);

    prepareDrawPaths();

    ensurePathNodes(anchors.length);
    anchors.forEach(function (pt, i) {
      pathNodes[i].setAttribute("cx", String(pt.x));
      pathNodes[i].setAttribute("cy", String(pt.y));
    });

    if (reducedMotion) {
      pathLine.style.strokeDashoffset = "0";
      pathGlow.style.strokeDashoffset = "0";
    }

    updateScroll(true);
  }

  /**
   * ScrollTrigger-style scrub: прогресс привязан к прохождению блока через viewport.
   * start: верх wrap ≈ 78% экрана → 0; end: низ wrap ≈ 28% экрана → 1.
   */
  function getScrollProgress() {
    if (!wrap) return 0;

    var rect = wrap.getBoundingClientRect();
    var vh = window.innerHeight;
    var startLine = vh * 0.78;
    var endLine = vh * 0.28;
    var travel = rect.height - (endLine - startLine);

    if (travel <= 0) {
      return rect.bottom <= endLine ? 1 : 0;
    }

    return clamp((startLine - rect.top) / travel, 0, 1);
  }

  function updateActiveStep(progress) {
    if (!stepEls.length) return;

    var n = stepEls.length;
    var idx = Math.min(n - 1, Math.floor(progress * n));
    if (progress >= 0.97) idx = n - 1;

    stepEls.forEach(function (step, i) {
      step.classList.toggle("is-active", i === idx);
      step.classList.toggle("is-complete", i < idx);
    });

    pathNodes.forEach(function (node, i) {
      node.classList.toggle("is-active", i === idx);
      node.classList.toggle("is-complete", i < idx);
      node.setAttribute("r", i === idx ? "7" : "5");
    });
  }

  function applyPathProgress(progress) {
    if (!pathLine || pathLength <= 0) return;

    var offset = pathLength * (1 - progress);
    pathLine.style.strokeDashoffset = String(offset);
    if (pathGlow) pathGlow.style.strokeDashoffset = String(offset);

    var pt = pathLine.getPointAtLength(pathLength * progress);
    pathDot.setAttribute("cx", String(pt.x));
    pathDot.setAttribute("cy", String(pt.y));
    if (pathDotHalo) {
      pathDotHalo.setAttribute("cx", String(pt.x));
      pathDotHalo.setAttribute("cy", String(pt.y));
    }
  }

  function updateScroll(instant) {
    if (!wrap || !pathLine) return;

    var target = getScrollProgress();

    if (section) {
      section.classList.toggle("is-in-view", scrollActive);
      section.style.setProperty("--process-progress", String(target));
    }

    if (reducedMotion) {
      displayProgress = target;
      applyPathProgress(1);
      updateActiveStep(target);
      return;
    }

    if (instant) {
      displayProgress = target;
    } else {
      displayProgress = lerp(displayProgress, target, 0.18);
    }

    applyPathProgress(displayProgress);
    updateActiveStep(displayProgress);

    if (Math.abs(displayProgress - target) > 0.002 && scrollActive) {
      if (!rafId) {
        rafId = requestAnimationFrame(function () {
          rafId = 0;
          updateScroll(false);
        });
      }
    }
  }

  function onScroll() {
    if (!scrollActive || rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      updateScroll(false);
    });
  }

  function setupStepReveals() {
    if (typeof IntersectionObserver === "undefined") {
      stepEls.forEach(function (step) {
        step.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    stepEls.forEach(function (step) {
      io.observe(step);
    });
  }

  function enhanceSteps() {
    var wrappers = Array.prototype.slice.call(
      section.querySelectorAll(".steps > div")
    );

    stepSlots = wrappers.filter(function (w) {
      return w.querySelector(".step");
    });

    stepEls = stepSlots.map(function (wrapper) {
      return wrapper.querySelector(".step");
    });

    stepSlots.forEach(function (slot, i) {
      slot.classList.add("process-step-slot");
      var step = stepEls[i];
      if (!step) return;

      step.dataset.processStep = String(i);
      step.classList.remove("active");

      var num = step.querySelector(".step-number");
      if (num && !step.querySelector(".process-step-badge")) {
        var badge = document.createElement("div");
        badge.className = "process-step-badge";
        num.parentNode.insertBefore(badge, num);
        badge.appendChild(num);
        var ring = document.createElement("span");
        ring.className = "process-step-ring";
        ring.setAttribute("aria-hidden", "true");
        badge.appendChild(ring);
        var check = document.createElement("span");
        check.className = "process-step-check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = "✓";
        badge.appendChild(check);
      }
    });

    section.querySelectorAll(".step-connector").forEach(function (node) {
      node.style.display = "none";
    });

    setupStepReveals();
  }

  function init() {
    section = document.querySelector(".how-it-works");
    if (!section || section.dataset.processReady === "1") return;

    var stepsRoot = section.querySelector(".steps");
    if (!stepsRoot || !stepsRoot.querySelector(".step")) return;

    section.dataset.processReady = "1";
    section.classList.add("process-enhanced");

    enhanceSteps();

    wrap = document.createElement("div");
    wrap.className = "process-timeline-wrap";
    stepsRoot.parentNode.insertBefore(wrap, stepsRoot);

    svg = buildSvg();
    wrap.appendChild(svg);
    wrap.appendChild(stepsRoot);

    reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    applyStepLayout();
    rebuildPath();

    var rebuildDebounced = debounce(rebuildPath, 200);
    window.addEventListener("resize", rebuildDebounced);

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(rebuildDebounced);
      ro.observe(wrap);
    }

    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(
        function (entries) {
          scrollActive = entries[0].isIntersecting;
          if (scrollActive) updateScroll(false);
        },
        { rootMargin: "80px 0px", threshold: 0 }
      );
      io.observe(wrap);
    } else {
      scrollActive = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll(true);
  }

  window.PlanovoProcessScroll = { init: init };
})();
