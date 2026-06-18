(function () {
  "use strict";

  var DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт"];
  var SLOTS = ["9:00", "11:00", "13:00"];
  var SUBJECTS = [
    "Математика",
    "Физика",
    "Информатика",
    "Английский",
    "Программирование",
    "История",
  ];
  var ROOMS = ["А-101", "А-103", "А-105", "Л-202", "Л-305"];

  var VIEWS = [
    { id: "schedule", label: "Расписание", icon: "📅" },
    { id: "groups", label: "Группы", icon: "👥" },
    { id: "teachers", label: "Преподаватели", icon: "👨‍🏫" },
    { id: "rooms", label: "Аудитории", icon: "🚪" },
    { id: "settings", label: "Настройки", icon: "⚙️" },
  ];

  var GROUPS = [
    { id: "g1", name: "ОЭ-11", students: 28, course: "2 курс" },
    { id: "g2", name: "ОЭ-12", students: 26, course: "2 курс" },
    { id: "g3", name: "ОЭ-21", students: 24, course: "3 курс" },
  ];

  var TEACHERS = [
    { name: "Иванова М.С.", subject: "Математика", hours: 18, max: 24 },
    { name: "Петров А.В.", subject: "Физика", hours: 16, max: 22 },
    { name: "Сидорова Е.К.", subject: "Программирование", hours: 20, max: 24 },
    { name: "Козлова И.П.", subject: "Английский", hours: 14, max: 20 },
  ];

  var ROOM_LIST = [
    { id: "a101", name: "А-101", cap: 30, status: "busy" },
    { id: "a105", name: "А-105", cap: 28, status: "busy" },
    { id: "l202", name: "Л-202", cap: 24, status: "free" },
    { id: "l305", name: "Л-305", cap: 20, status: "busy" },
    { id: "a103", name: "А-103", cap: 32, status: "free" },
  ];

  function init() {
    var containers = document.querySelectorAll(".solution .mockup-container");
    containers.forEach(initContainer);
  }

  function cellKey(day, slot) {
    return day + "-" + slot;
  }

  function parseInitialSchedule(container) {
    var data = {};
    var rows = container.querySelectorAll(".mockup-timetable .mockup-row:not(.header)");
    rows.forEach(function (row, slotIdx) {
      var cells = row.querySelectorAll(".cell");
      cells.forEach(function (cell, dayIdx) {
        if (!cell.classList.contains("filled")) return;
        var subject = cell.textContent.split("\n")[0].trim();
        var roomMatch = cell.innerHTML.match(/<small>([^<]+)<\/small>/);
        var room = roomMatch ? roomMatch[1] : "А-101";
        if (subject) data[cellKey(dayIdx, slotIdx)] = { subject: subject, room: room };
      });
    });
    return data;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(container, message, isError) {
    var toast = container.querySelector(".mockup-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "mockup-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      container.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle("is-error", !!isError);
    toast.classList.add("is-visible");
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function renderSchedule(state) {
    var html = '<div class="mockup-timetable mockup-panel-view">';
    html += '<div class="mockup-row header"><div></div>';
    DAYS.forEach(function (d) {
      html += "<div>" + d + "</div>";
    });
    html += "</div>";

    SLOTS.forEach(function (time, slotIdx) {
      html += '<div class="mockup-row"><div class="time">' + time + "</div>";
      DAYS.forEach(function (_, dayIdx) {
        var k = cellKey(dayIdx, slotIdx);
        var lesson = state.schedule[k];
        var sel = state.selectedCell === k ? " is-selected" : "";
        if (lesson) {
          var newCls = state.lastAdded === k ? " is-new" : "";
          html +=
            '<div class="cell filled' +
            sel +
            newCls +
            '" data-cell="' +
            k +
            '" tabindex="0" role="button">' +
            escapeHtml(lesson.subject) +
            "<br/><small>" +
            escapeHtml(lesson.room) +
            "</small></div>";
        } else {
          html +=
            '<div class="cell empty-slot" data-cell="' +
            k +
            '" tabindex="0" role="button"></div>';
        }
      });
      html += "</div>";
    });
    html += "</div>";
    return html;
  }

  function renderGroups(state) {
    var html = '<div class="mockup-panel-view mockup-list">';
    GROUPS.forEach(function (g) {
      var active = state.selectedGroup === g.id ? " is-active" : "";
      html +=
        '<div class="mockup-list-item' +
        active +
        '" data-group="' +
        g.id +
        '" role="button" tabindex="0">' +
        "<div><strong>" +
        escapeHtml(g.name) +
        '</strong><div class="mockup-list-meta">' +
        escapeHtml(g.course) +
        "</div></div><span>" +
        g.students +
        " чел.</span></div>";
    });
    html += "</div>";
    return html;
  }

  function renderTeachers() {
    var html = '<div class="mockup-panel-view mockup-list">';
    TEACHERS.forEach(function (t) {
      var pct = Math.round((t.hours / t.max) * 100);
      html +=
        '<div class="mockup-list-item" role="presentation">' +
        "<div><strong>" +
        escapeHtml(t.name) +
        '</strong><div class="mockup-list-meta">' +
        escapeHtml(t.subject) +
        " · " +
        t.hours +
        ' ч/нед</div><div class="mockup-meter"><span style="width:' +
        pct +
        '%"></span></div></div></div>';
    });
    html += "</div>";
    return html;
  }

  function renderRooms() {
    var html = '<div class="mockup-panel-view mockup-list">';
    ROOM_LIST.forEach(function (r) {
      var busy = r.status === "busy";
      html +=
        '<div class="mockup-list-item" data-room="' +
        r.id +
        '" role="button" tabindex="0">' +
        "<div><strong>" +
        escapeHtml(r.name) +
        '</strong><div class="mockup-list-meta">до ' +
        r.cap +
        ' мест</div></div><span style="color:' +
        (busy ? "#fca5a5" : "#6ee7b7") +
        '">' +
        (busy ? "Занята" : "Свободна") +
        "</span></div>";
    });
    html += "</div>";
    return html;
  }

  function renderSettings(state) {
    var html = '<div class="mockup-panel-view">';
    [
      { id: "conflicts", label: "Проверка конфликтов", on: state.settings.conflicts },
      { id: "public", label: "Публичная ссылка", on: state.settings.publicLink },
      { id: "notify", label: "Уведомления об изменениях", on: state.settings.notify },
    ].forEach(function (row) {
      html +=
        '<div class="mockup-settings-row"><span>' +
        row.label +
        '</span><button type="button" class="mockup-toggle' +
        (row.on ? " is-on" : "") +
        '" data-setting="' +
        row.id +
        '" aria-pressed="' +
        row.on +
        '"></button></div>';
    });
    html += "</div>";
    return html;
  }

  function renderPanel(state) {
    if (state.view === "groups") return renderGroups(state);
    if (state.view === "teachers") return renderTeachers();
    if (state.view === "rooms") return renderRooms();
    if (state.view === "settings") return renderSettings(state);
    return renderSchedule(state);
  }

  function renderToolbar(state) {
    if (state.view !== "schedule") {
      var view = VIEWS.find(function (v) {
        return v.id === state.view;
      });
      return (
        '<div class="mockup-toolbar" style="margin-bottom:12px;font-size:0.75rem;color:#9ca3af">' +
        escapeHtml(view ? view.label : "") +
        " — демо без отправки данных</div>"
      );
    }
    return (
      '<div class="mockup-toolbar">' +
      '<button type="button" class="mockup-btn" data-action="add">+ Добавить занятие</button>' +
      '<button type="button" class="mockup-btn secondary" data-action="publish"' +
      (state.published ? " disabled" : "") +
      ">Опубликовать</button></div>"
    );
  }

  function closeModal(container) {
    var m = container.querySelector(".mockup-modal-backdrop");
    if (m) m.remove();
  }

  function openModal(state, container, preset) {
    closeModal(container);
    var backdrop = document.createElement("div");
    backdrop.className = "mockup-modal-backdrop";
    backdrop.innerHTML =
      '<div class="mockup-modal" role="dialog" aria-modal="true">' +
      "<h4>" +
      (preset && state.schedule[preset] ? "Изменить занятие" : "Добавить занятие") +
      "</h4>" +
      '<div class="mockup-field"><label>Предмет</label><select data-field="subject">' +
      SUBJECTS.map(function (s) {
        return "<option>" + s + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="mockup-field"><label>Аудитория</label><select data-field="room">' +
      ROOMS.map(function (r) {
        return "<option>" + r + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="mockup-field"><label>День</label><select data-field="day">' +
      DAYS.map(function (d, i) {
        return '<option value="' + i + '">' + d + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="mockup-field"><label>Время</label><select data-field="slot">' +
      SLOTS.map(function (s, i) {
        return '<option value="' + i + '">' + s + "</option>";
      }).join("") +
      "</select></div>" +
      '<div class="mockup-modal-error"></div>' +
      '<div class="mockup-modal-actions">' +
      '<button type="button" class="mockup-modal-cancel">Отмена</button>' +
      '<button type="button" class="mockup-modal-save">Сохранить</button></div></div>';

    container.appendChild(backdrop);

    if (preset) {
      var parts = preset.split("-");
      backdrop.querySelector('[data-field="day"]').value = parts[0];
      backdrop.querySelector('[data-field="slot"]').value = parts[1];
      var existing = state.schedule[preset];
      if (existing) {
        backdrop.querySelector('[data-field="subject"]').value = existing.subject;
        backdrop.querySelector('[data-field="room"]').value = existing.room;
      }
    }

    backdrop.querySelector(".mockup-modal-cancel").addEventListener("click", function () {
      closeModal(container);
    });
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal(container);
    });

    backdrop.querySelector(".mockup-modal-save").addEventListener("click", function () {
      var day = backdrop.querySelector('[data-field="day"]').value;
      var slot = backdrop.querySelector('[data-field="slot"]').value;
      var k = cellKey(day, slot);
      var errEl = backdrop.querySelector(".mockup-modal-error");
      if (state.schedule[k] && k !== preset) {
        errEl.textContent = "Слот занят — выберите другое время.";
        errEl.classList.add("is-visible");
        return;
      }
      state.schedule[k] = {
        subject: backdrop.querySelector('[data-field="subject"]').value,
        room: backdrop.querySelector('[data-field="room"]').value,
      };
      if (preset && preset !== k) delete state.schedule[preset];
      state.lastAdded = k;
      state.selectedCell = k;
      state.published = false;
      container.classList.remove("is-published");
      closeModal(container);
      refresh(state, container);
      showToast(container, "Занятие сохранено в черновике");
    });
  }

  function publishSchedule(state, container, btn) {
    if (state.published) return;
    btn.classList.add("is-loading");
    btn.disabled = true;
    setTimeout(function () {
      btn.classList.remove("is-loading");
      state.published = true;
      container.classList.add("is-published");
      var count = Object.keys(state.schedule).length * 42;
      showToast(container, "Расписание опубликовано · ~" + count + " участников увидят обновление");
      refresh(state, container);
    }, 900);
  }

  function bindPanelEvents(state, container) {
    var main = container.querySelector(".mockup-main");
    if (!main) return;

    main.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        if (action === "add") openModal(state, container, null);
        if (action === "publish") publishSchedule(state, container, btn);
      });
    });

    main.querySelectorAll("[data-cell]").forEach(function (cell) {
      function activate() {
        var k = cell.getAttribute("data-cell");
        if (state.schedule[k]) {
          if (state._lastCellClick === k && Date.now() - (state._lastCellTime || 0) < 450) {
            delete state.schedule[k];
            state.selectedCell = null;
            state.published = false;
            container.classList.remove("is-published");
            refresh(state, container);
            showToast(container, "Занятие удалено (двойной клик)");
            return;
          }
          state._lastCellClick = k;
          state._lastCellTime = Date.now();
        }
        state.selectedCell = k;
        openModal(state, container, k);
      }
      cell.addEventListener("click", activate);
      cell.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });

    main.querySelectorAll("[data-group]").forEach(function (el) {
      el.addEventListener("click", function () {
        state.selectedGroup = el.getAttribute("data-group");
        refresh(state, container);
        var g = GROUPS.find(function (x) {
          return x.id === state.selectedGroup;
        });
        if (g) showToast(container, "Группа " + g.name + " — " + g.students + " студентов");
      });
    });

    main.querySelectorAll("[data-room]").forEach(function (el) {
      el.addEventListener("click", function () {
        var r = ROOM_LIST.find(function (x) {
          return x.id === el.getAttribute("data-room");
        });
        if (r) {
          showToast(
            container,
            r.name + ": " + (r.status === "busy" ? "занята" : "свободна"),
            r.status === "busy"
          );
        }
      });
    });

    main.querySelectorAll("[data-setting]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-setting");
        if (id === "conflicts") state.settings.conflicts = !state.settings.conflicts;
        if (id === "public") state.settings.publicLink = !state.settings.publicLink;
        if (id === "notify") state.settings.notify = !state.settings.notify;
        refresh(state, container);
      });
    });
  }

  function refresh(state, container) {
    var main = container.querySelector(".mockup-main");
    if (!main) return;
    var panelHost = main.querySelector("[data-mockup-panel-host]");
    var toolbarHost = main.querySelector("[data-mockup-toolbar-host]");
    if (toolbarHost) toolbarHost.innerHTML = renderToolbar(state);
    if (panelHost) {
      panelHost.innerHTML = renderPanel(state);
      bindPanelEvents(state, container);
    }
  }

  function switchView(state, container, viewId) {
    state.view = viewId;
    state.selectedCell = null;
    closeModal(container);
    container.querySelectorAll(".mockup-nav-item").forEach(function (item, i) {
      var active = VIEWS[i] && VIEWS[i].id === viewId;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", active ? "true" : "false");
      item.setAttribute("tabindex", active ? "0" : "-1");
    });
    refresh(state, container);
  }

  function initContainer(container) {
    if (!container || container.dataset.mockupReady === "1") return;

    container.classList.add("mockup-interactive");
    container.dataset.mockupReady = "1";

    var state = {
      view: "schedule",
      schedule: parseInitialSchedule(container),
      selectedCell: null,
      selectedGroup: GROUPS[0].id,
      published: false,
      lastAdded: null,
      settings: { conflicts: true, publicLink: true, notify: false },
    };

    var sidebar = container.querySelector(".mockup-sidebar");
    if (sidebar) {
      sidebar.querySelectorAll(".mockup-nav-item").forEach(function (item, i) {
        var view = VIEWS[i];
        if (!view) return;
        item.setAttribute("role", "tab");
        item.setAttribute("aria-selected", item.classList.contains("active") ? "true" : "false");
        item.addEventListener("click", function () {
          switchView(state, container, view.id);
        });
      });
    }

    var main = container.querySelector(".mockup-main");
    if (!main) return;

    var toolbarHost = document.createElement("div");
    toolbarHost.setAttribute("data-mockup-toolbar-host", "");
    toolbarHost.innerHTML = renderToolbar(state);

    var panelHost = document.createElement("div");
    panelHost.setAttribute("data-mockup-panel-host", "");

    main.innerHTML = "";
    main.appendChild(toolbarHost);
    main.appendChild(panelHost);

    refresh(state, container);
  }

  function init() {
    var containers = document.querySelectorAll(".solution .mockup-container");
    containers.forEach(initContainer);
  }

  window.PlanovoLandingMockup = { init: init };
})();
