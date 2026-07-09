const {
  useState,
  useMemo,
  useEffect,
  useRef
} = React;

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const TIME_SLOTS = [{
  start: "09:00",
  end: "10:30"
}, {
  start: "11:00",
  end: "12:30"
}, {
  start: "13:00",
  end: "14:30"
}, {
  start: "15:00",
  end: "16:30"
}, {
  start: "17:00",
  end: "18:30"
}, {
  start: "19:00",
  end: "20:30"
}, {
  start: "21:00",
  end: "22:30"
}];
const ROOMS = [{
  id: "ra",
  name: "Зал А",
  capacity: 50,
  type: "hall"
}, {
  id: "rb",
  name: "Зал Б",
  capacity: 30,
  type: "hall"
}, {
  id: "rc",
  name: "Переговорная",
  capacity: 12,
  type: "meeting"
}, {
  id: "rd",
  name: "Коворкинг",
  capacity: 20,
  type: "coworking"
}];
const CLUBS = [{
  id: "club1",
  name: "Книжный клуб",
  icon: "fa-book-open",
  color: "#6366f1",
  gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  description: "Обсуждение книг, литературные встречи, читательские марафоны"
}, {
  id: "club2",
  name: "Клуб настольных игр",
  icon: "fa-chess",
  color: "#f59e0b",
  gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
  description: "Настольные игры, турниры, вечеринки с играми"
}, {
  id: "club3",
  name: "Йога-студия",
  icon: "fa-spa",
  color: "#10b981",
  gradient: "linear-gradient(135deg,#10b981,#06b6d4)",
  description: "Йога, медитация, дыхательные практики"
}];
const MEMBERS = [{
  id: "m1",
  name: "Алексей Петров",
  avatar: "#6366f1"
}, {
  id: "m2",
  name: "Мария Сидорова",
  avatar: "#ec4899"
}, {
  id: "m3",
  name: "Дмитрий Козлов",
  avatar: "#f59e0b"
}, {
  id: "m4",
  name: "Елена Волкова",
  avatar: "#10b981"
}, {
  id: "m5",
  name: "Иван Новиков",
  avatar: "#ef4444"
}, {
  id: "m6",
  name: "Ольга Лебедева",
  avatar: "#8b5cf6"
}, {
  id: "m7",
  name: "Сергей Морозов",
  avatar: "#06b6d4"
}, {
  id: "m8",
  name: "Наталья Карпова",
  avatar: "#f97316"
}, {
  id: "m9",
  name: "Павел Соколов",
  avatar: "#14b8a6"
}, {
  id: "m10",
  name: "Анна Зайцева",
  avatar: "#d946ef"
}, {
  id: "m11",
  name: "Виктор Буфеев",
  avatar: "#0ea5e9"
}, {
  id: "m12",
  name: "Кристина Павлова",
  avatar: "#84cc16"
}, {
  id: "m13",
  name: "Тимофей Орлов",
  avatar: "#eab308"
}, {
  id: "m14",
  name: "Вера Лисицына",
  avatar: "#a855f7"
}, {
  id: "m15",
  name: "Артём Громов",
  avatar: "#22d3ee"
}];
const EVENTS = [
// Monday
{
  id: "e1",
  clubId: "club3",
  name: "Утренняя йога",
  day: 0,
  slot: 0,
  room: "ra",
  type: "regular",
  recurring: "Каждый Пн 09:00",
  maxAttendees: 25,
  attendees: ["m1", "m4", "m6", "m8", "m10"],
  rsvp: {
    m1: "going",
    m4: "going",
    m6: "maybe",
    m8: "going",
    m10: "going"
  }
}, {
  id: "e2",
  clubId: "club2",
  name: "Открытый игровой вечер",
  day: 0,
  slot: 4,
  room: "rb",
  type: "regular",
  recurring: "Каждый Пн 17:00",
  maxAttendees: 30,
  attendees: ["m2", "m3", "m5", "m7", "m9", "m11"],
  rsvp: {
    m2: "going",
    m3: "going",
    m5: "maybe",
    m7: "going",
    m9: "going",
    m11: "going"
  }
}, {
  id: "e3",
  clubId: "club1",
  name: "Обсуждение: «Мастер и Маргарита»",
  day: 0,
  slot: 5,
  room: "rc",
  type: "regular",
  recurring: "Каждый Пн 19:00",
  maxAttendees: 12,
  attendees: ["m1", "m2", "m6", "m12"],
  rsvp: {
    m1: "going",
    m2: "going",
    m6: "going",
    m12: "maybe"
  }
},
// Tuesday
{
  id: "e4",
  clubId: "club3",
  name: "Медитация для начинающих",
  day: 1,
  slot: 1,
  room: "rd",
  type: "workshop",
  recurring: null,
  maxAttendees: 15,
  attendees: ["m4", "m8", "m10"],
  rsvp: {
    m4: "going",
    m8: "going",
    m10: "maybe"
  }
}, {
  id: "e5",
  clubId: "club2",
  name: "Турнир по шахматам",
  day: 1,
  slot: 4,
  room: "rc",
  type: "one-time",
  recurring: null,
  maxAttendees: 12,
  attendees: ["m3", "m5", "m7", "m9", "m11", "m13"],
  rsvp: {
    m3: "going",
    m5: "going",
    m7: "going",
    m9: "going",
    m11: "going",
    m13: "maybe"
  }
},
// Wednesday
{
  id: "e6",
  clubId: "club3",
  name: "Виньяса-флоу",
  day: 2,
  slot: 0,
  room: "ra",
  type: "regular",
  recurring: "Каждая Ср 09:00",
  maxAttendees: 25,
  attendees: ["m1", "m4", "m6", "m8", "m10", "m14"],
  rsvp: {
    m1: "going",
    m4: "going",
    m6: "going",
    m8: "maybe",
    m10: "going",
    m14: "going"
  }
}, {
  id: "e7",
  clubId: "club2",
  name: "Партия в Мачи Коро",
  day: 2,
  slot: 3,
  room: "rd",
  type: "regular",
  recurring: "Каждая Ср 15:00",
  maxAttendees: 20,
  attendees: ["m2", "m3", "m7"],
  rsvp: {
    m2: "going",
    m3: "maybe",
    m7: "going"
  }
}, {
  id: "e8",
  clubId: "club1",
  name: "Книжный марафон",
  day: 2,
  slot: 5,
  room: "rb",
  type: "workshop",
  recurring: null,
  maxAttendees: 30,
  attendees: ["m1", "m2", "m6", "m12", "m15"],
  rsvp: {
    m1: "going",
    m2: "going",
    m6: "going",
    m12: "going",
    m15: "maybe"
  }
},
// Thursday
{
  id: "e9",
  clubId: "club3",
  name: "Йога нидра",
  day: 3,
  slot: 5,
  room: "ra",
  type: "regular",
  recurring: "Каждый Чт 19:00",
  maxAttendees: 25,
  attendees: ["m4", "m8", "m10", "m14"],
  rsvp: {
    m4: "going",
    m8: "going",
    m10: "maybe",
    m14: "going"
  }
}, {
  id: "e10",
  clubId: "club2",
  name: "Вечер настолок",
  day: 3,
  slot: 4,
  room: "rb",
  type: "regular",
  recurring: "Каждый Чт 17:00",
  maxAttendees: 30,
  attendees: ["m2", "m3", "m5", "m9", "m11", "m13"],
  rsvp: {
    m2: "going",
    m3: "going",
    m5: "going",
    m9: "maybe",
    m11: "going",
    m13: "going"
  }
}, {
  id: "e11",
  clubId: "club1",
  name: "Встреча с автором",
  day: 3,
  slot: 5,
  room: "rc",
  type: "one-time",
  recurring: null,
  maxAttendees: 12,
  attendees: ["m1", "m6", "m12"],
  rsvp: {
    m1: "going",
    m6: "going",
    m12: "going"
  }
},
// Friday
{
  id: "e12",
  clubId: "club3",
  name: "Дыхательные практики",
  day: 4,
  slot: 1,
  room: "rd",
  type: "workshop",
  recurring: null,
  maxAttendees: 15,
  attendees: ["m4", "m8"],
  rsvp: {
    m4: "going",
    m8: "maybe"
  }
}, {
  id: "e13",
  clubId: "club2",
  name: "Турнир по Экивоки",
  day: 4,
  slot: 4,
  room: "rb",
  type: "one-time",
  recurring: null,
  maxAttendees: 20,
  attendees: ["m3", "m5", "m7", "m9", "m15"],
  rsvp: {
    m3: "going",
    m5: "maybe",
    m7: "going",
    m9: "going",
    m15: "going"
  }
}, {
  id: "e14",
  clubId: "club1",
  name: "Обсуждение: «1984»",
  day: 4,
  slot: 5,
  room: "rc",
  type: "regular",
  recurring: "Каждая Пт 19:00",
  maxAttendees: 12,
  attendees: ["m1", "m2", "m6", "m12", "m15"],
  rsvp: {
    m1: "going",
    m2: "going",
    m6: "maybe",
    m12: "going",
    m15: "going"
  }
},
// Saturday
{
  id: "e15",
  clubId: "club3",
  name: "Йога на свежем воздухе",
  day: 5,
  slot: 0,
  room: "ra",
  type: "regular",
  recurring: "Каждая Сб 09:00",
  maxAttendees: 30,
  attendees: ["m1", "m4", "m6", "m8", "m10", "m14"],
  rsvp: {
    m1: "going",
    m4: "going",
    m6: "going",
    m8: "going",
    m10: "going",
    m14: "maybe"
  }
}, {
  id: "e16",
  clubId: "club2",
  name: "Семейный игровой день",
  day: 5,
  slot: 2,
  room: "rb",
  type: "regular",
  recurring: "Каждая Сб 13:00",
  maxAttendees: 50,
  attendees: ["m2", "m3", "m5", "m7", "m9", "m11", "m13", "m15"],
  rsvp: {
    m2: "going",
    m3: "going",
    m5: "going",
    m7: "maybe",
    m9: "going",
    m11: "going",
    m13: "going",
    m15: "going"
  }
}];
function getNowInfo() {
  const now = new Date();
  const dow = now.getDay();
  const dayMap = [6, 0, 1, 2, 3, 4, 5];
  return {
    currentDay: dayMap[dow],
    isWeekend: dow === 0 || dow === 6
  };
}

// ═══════════════════════════════════════════
// CLUBS SHOWCASE (visual example + commentary)
// ═══════════════════════════════════════════
const DAY_FULL = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const DEMO_DAY_INDICES = [0, 2];
const DEMO_DAYS = DEMO_DAY_INDICES.map(i => ({
  index: i,
  short: DAYS[i],
  full: DAY_FULL[i]
}));
const DEMO_CLUBS = CLUBS.filter(c => c.id === "club1" || c.id === "club2");
const DEMO_SLOT_INDICES = [4, 5];
const DEMO_SLOTS = DEMO_SLOT_INDICES.map(i => ({
  index: i,
  start: TIME_SLOTS[i].start,
  end: TIME_SLOTS[i].end
}));
const MEMBER_SHOWCASE_BLOCKS = [{
  n: 1,
  icon: "fa-calendar-day",
  title: "День встреч",
  text: "Участник открывает ссылку и видит события на день: во сколько, какой клуб, где проходит и сколько человек идёт — без переписки в чате."
}, {
  n: 2,
  icon: "fa-users",
  title: "Свой клуб",
  text: "Каждый видит встречи своих клубов. Переключите клуб — в первом блоке обновятся события (в продукте список клубов у каждого свой)."
}, {
  n: 3,
  icon: "fa-table-columns",
  title: "Фрагмент недели",
  text: "Понедельник и среда на одном экране — удобно с телефона, без горизонтального скролла всей недели."
}];
const CLUBS_SHOWCASE_FOOTER = {
  icon: "fa-layer-group",
  title: "В полной версии",
  text: "Организатор создаёт события и видит RSVP, участники отмечают «Иду» или «Может». Переключите вкладку в шапке — там упрощённые примеры."
};
const ORGANIZER_SHOWCASE_NOTES = [{
  n: 1,
  icon: "fa-calendar-days",
  title: "Календарь клуба",
  text: "Организатор видит все встречи на неделе — по клубам, времени и залам. Не нужно сводить таблицы вручную."
}, {
  n: 2,
  icon: "fa-chart-line",
  title: "Сегодня и ближайшие",
  text: "На дашборде — события сегодня и запись участников. Видно, сколько мест занято, до начала встречи."
}];
function getClub(id) {
  return CLUBS.find(c => c.id === id);
}
function getRoomName(roomId) {
  return ROOMS.find(r => r.id === roomId)?.name || roomId;
}
function getGoingCount(event) {
  return Object.values(event.rsvp || {}).filter(v => v === "going").length;
}
function getEventsForClubDay(clubId, dayIndex, limit = 2) {
  return EVENTS.filter(e => e.clubId === clubId && e.day === dayIndex).sort((a, b) => a.slot - b.slot).slice(0, limit);
}
function getEventAt(clubId, dayIndex, slotIndex) {
  return EVENTS.find(e => e.clubId === clubId && e.day === dayIndex && e.slot === slotIndex) || null;
}
function ShowcaseBlock({
  note,
  children
}) {
  const accent = note.n === 2;
  return /*#__PURE__*/React.createElement("section", {
    className: "showcase-block" + (accent ? " showcase-block-accent" : "")
  }, /*#__PURE__*/React.createElement("aside", {
    className: "showcase-block-note",
    "aria-label": note.title
  }, /*#__PURE__*/React.createElement("div", {
    className: "showcase-block-note-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "showcase-note-num"
  }, note.n), /*#__PURE__*/React.createElement("i", {
    className: `fas ${note.icon} showcase-note-icon`
  })), /*#__PURE__*/React.createElement("h3", {
    className: "showcase-block-title"
  }, note.title), /*#__PURE__*/React.createElement("p", {
    className: "showcase-block-text"
  }, note.text)), /*#__PURE__*/React.createElement("div", {
    className: "showcase-block-demo"
  }, children));
}
function ShowcaseDemoChrome({
  icon,
  label,
  meta
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-demo-chrome"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${icon}`
  }), /*#__PURE__*/React.createElement("span", null, label), meta && /*#__PURE__*/React.createElement("span", {
    className: "showcase-panel-meta"
  }, meta));
}
function ShowcaseEventFull({
  event,
  club,
  rsvpStatus = "going"
}) {
  const slot = TIME_SLOTS[event.slot];
  const going = getGoingCount(event);
  return /*#__PURE__*/React.createElement("div", {
    className: "event-full showcase-event-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ef-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ef-color",
    style: {
      background: club?.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ef-name",
    style: {
      color: club?.color
    }
  }, event.name), /*#__PURE__*/React.createElement("div", {
    className: "ef-meta"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-clock"
  }), " ", slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map-marker-alt"
  }), " ", getRoomName(event.room)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-users"
  }), " ", going, "/", event.maxAttendees)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `rsvp-badge rsvp-${rsvpStatus}`
  }, rsvpStatus === "going" ? "Иду" : "Может"), /*#__PURE__*/React.createElement("span", {
    className: "rsvp-badge rsvp-none",
    style: {
      opacity: 0.55
    }
  }, "Не иду")))));
}
function ShowcaseDayListClubs({
  dayIndex,
  clubId
}) {
  const day = DEMO_DAYS.find(d => d.index === dayIndex) || {
    full: DAY_FULL[dayIndex],
    short: DAYS[dayIndex]
  };
  const club = getClub(clubId);
  const events = getEventsForClubDay(clubId, dayIndex, 2);
  return /*#__PURE__*/React.createElement("div", {
    className: "card showcase-day-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "showcase-day-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-calendar-day"
  }), /*#__PURE__*/React.createElement("span", null, day.full), club && /*#__PURE__*/React.createElement("span", {
    className: "showcase-panel-meta"
  }, "· ", club.name)), /*#__PURE__*/React.createElement("div", {
    className: "showcase-day-slots"
  }, events.length ? events.map(ev => /*#__PURE__*/React.createElement(ShowcaseEventFull, {
    key: ev.id,
    event: ev,
    club: club,
    rsvpStatus: ev.id === "e3" || ev.id === "e2" ? "going" : "maybe"
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px dashed var(--gray-200)",
      textAlign: "center",
      color: "var(--gray-400)",
      fontSize: 13
    }
  }, "Нет встреч")));
}
function ShowcaseScheduleGridClubs({
  clubId
}) {
  const club = getClub(clubId);
  return /*#__PURE__*/React.createElement("div", {
    className: "desktop-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.index,
    className: "grid-header-cell"
  }, d.short))), DEMO_SLOTS.map(slot => /*#__PURE__*/React.createElement("div", {
    key: slot.index,
    className: "grid-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start)), DEMO_DAYS.map(d => {
    const ev = getEventAt(clubId, d.index, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: d.index,
      className: "day-cell"
    }, ev ? /*#__PURE__*/React.createElement("div", {
      className: "event-card",
      style: {
        borderLeftColor: club?.color,
        background: `${club?.color}08`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ec-name",
      style: {
        color: club?.color
      }
    }, ev.name), /*#__PURE__*/React.createElement("div", {
      className: "ec-room"
    }, getRoomName(ev.room)), /*#__PURE__*/React.createElement("div", {
      className: "ec-rsvp"
    }, getGoingCount(ev), "/", ev.maxAttendees)) : /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--gray-300)",
        fontSize: 10
      }
    }, "—"));
  }))))));
}
function MemberShowcase() {
  const [selectedClubId, setSelectedClubId] = useState("club1");
  const club = getClub(selectedClubId);
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: MEMBER_SHOWCASE_BLOCKS[0]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-user",
    label: "Участник",
    meta: club ? `· ${club.name}` : null
  }), /*#__PURE__*/React.createElement(ShowcaseDayListClubs, {
    dayIndex: 0,
    clubId: selectedClubId
  })), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: MEMBER_SHOWCASE_BLOCKS[1]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-list",
    label: "Выбор клуба"
  }), /*#__PURE__*/React.createElement("div", {
    className: "group-selector"
  }, DEMO_CLUBS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    type: "button",
    className: `group-btn ${selectedClubId === c.id ? "active" : ""}`,
    onClick: () => setSelectedClubId(c.id)
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${c.icon}`,
    style: {
      marginRight: 6
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, c.name))))), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: MEMBER_SHOWCASE_BLOCKS[2]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-table-columns",
    label: "Фрагмент недели",
    meta: "· Пн и Ср"
  }), /*#__PURE__*/React.createElement("div", {
    className: "card showcase-card"
  }, /*#__PURE__*/React.createElement(ShowcaseScheduleGridClubs, {
    clubId: selectedClubId
  }))), /*#__PURE__*/React.createElement("p", {
    className: "showcase-footer-hint"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${CLUBS_SHOWCASE_FOOTER.icon}`
  }), " ", /*#__PURE__*/React.createElement("strong", null, CLUBS_SHOWCASE_FOOTER.title), " — ", CLUBS_SHOWCASE_FOOTER.text));
}
function OrganizerShowcase() {
  const orgProps = {
    showcase: true
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: ORGANIZER_SHOWCASE_NOTES[0]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-calendar-check",
    label: "Календарь организатора"
  }), /*#__PURE__*/React.createElement(OrganizerView, Object.assign({
    showcaseFixedTab: "calendar"
  }, orgProps))), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: ORGANIZER_SHOWCASE_NOTES[1]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-chart-line",
    label: "Дашборд"
  }), /*#__PURE__*/React.createElement(OrganizerView, Object.assign({
    showcaseFixedTab: "dashboard"
  }, orgProps))));
}

// ═══════════════════════════════════════════
// ORGANIZER VIEW
// ═══════════════════════════════════════════
function OrganizerView({
  showcase = false,
  showcaseFixedTab = null
} = {}) {
  const [activeTab, setActiveTab] = useState('calendar');
  const tab = showcaseFixedTab || activeTab;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [checkIn, setCheckIn] = useState({});
  const [newEvent, setNewEvent] = useState({
    name: '',
    clubId: 'club1',
    day: 0,
    slot: 0,
    room: 'ra',
    type: 'regular',
    recurring: '',
    maxAttendees: 20
  });
  const nowInfo = getNowInfo();
  const handleCreateEvent = () => {
    const ev = {
      id: `e-${Date.now()}`,
      clubId: newEvent.clubId,
      name: newEvent.name,
      day: newEvent.day,
      slot: newEvent.slot,
      room: newEvent.room,
      type: newEvent.type,
      recurring: newEvent.recurring || null,
      maxAttendees: newEvent.maxAttendees,
      attendees: [],
      rsvp: {}
    };
    EVENTS.push(ev);
    setShowCreateModal(false);
    setNewEvent({
      name: '',
      clubId: 'club1',
      day: 0,
      slot: 0,
      room: 'ra',
      type: 'regular',
      recurring: '',
      maxAttendees: 20
    });
  };
  const filteredEvents = selectedClub ? EVENTS.filter(e => e.clubId === selectedClub) : showcase ? EVENTS.filter(e => DEMO_CLUBS.some(c => c.id === e.clubId)) : EVENTS;

  // Today's events
  const todayEvents = filteredEvents.filter(e => e.day === nowInfo.currentDay).sort((a, b) => a.slot - b.slot);
  const demoTodayEvents = filteredEvents.filter(e => e.day === 0).sort((a, b) => a.slot - b.slot);
  const displayTodayEvents = showcase ? demoTodayEvents : todayEvents;
  const demoUpcomingEvents = filteredEvents.filter(e => DEMO_DAY_INDICES.includes(e.day) && e.day > 0).sort((a, b) => a.day - b.day || a.slot - b.slot).slice(0, 3);

  // Upcoming events (next 3 days)
  const upcomingEvents = showcase ? demoUpcomingEvents : filteredEvents.filter(e => e.day > nowInfo.currentDay).sort((a, b) => a.day - b.day || a.slot - b.slot).slice(0, 5);
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, !showcaseFixedTab && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `role-tab ${!selectedClub ? 'active' : ''}`,
    onClick: () => setSelectedClub(null)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-layer-group"
  }), " Все"), (showcase ? DEMO_CLUBS : CLUBS).map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: `role-tab ${selectedClub === c.id ? 'active' : ''}`,
    onClick: () => setSelectedClub(c.id),
    style: selectedClub === c.id ? {
      background: c.gradient
    } : {}
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${c.icon}`
  }), " ", c.name))), !showcaseFixedTab && /*#__PURE__*/React.createElement("div", {
    className: "tab-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'calendar' ? 'active' : ''}`,
    onClick: () => setActiveTab('calendar')
  }, "Календарь"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`,
    onClick: () => setActiveTab('dashboard')
  }, "Дашборд"), !showcase && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'members' ? 'active' : ''}`,
    onClick: () => setActiveTab('members')
  }, "Участники"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'rooms' ? 'active' : ''}`,
    onClick: () => setActiveTab('rooms')
  }, "Помещения"))), tab === 'calendar' && /*#__PURE__*/React.createElement("div", null, !showcase && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setShowCreateModal(true)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-plus"
  }), " Создать событие")), showcase ? /*#__PURE__*/React.createElement("div", {
    className: "card showcase-card"
  }, /*#__PURE__*/React.createElement(ShowcaseScheduleGridClubs, {
    clubId: selectedClub || "club1"
  })) : /*#__PURE__*/React.createElement("div", {
    className: "desktop-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 900
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DAYS.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `grid-header-cell ${nowInfo.currentDay === i ? 'today' : ''}`
  }, d))), TIME_SLOTS.map((slot, si) => /*#__PURE__*/React.createElement("div", {
    key: si,
    className: "grid-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start)), DAYS.map((_, di) => {
    const dayEvents = filteredEvents.filter(e => e.day === di && e.slot === si);
    return /*#__PURE__*/React.createElement("div", {
      key: di,
      className: `day-cell ${nowInfo.currentDay === di ? 'today-col' : ''}`
    }, dayEvents.map(ev => {
      const club = CLUBS.find(c => c.id === ev.clubId);
      const goingCount = Object.values(ev.rsvp).filter(v => v === 'going').length;
      return /*#__PURE__*/React.createElement("div", {
        key: ev.id,
        className: "event-card",
        style: {
          borderLeftColor: club?.color,
          background: `${club?.color}08`
        },
        onClick: () => setShowEventModal(ev)
      }, /*#__PURE__*/React.createElement("div", {
        className: "ec-name",
        style: {
          color: club?.color
        }
      }, ev.name), /*#__PURE__*/React.createElement("div", {
        className: "ec-room"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-map-marker-alt",
        style: {
          marginRight: 2,
          fontSize: 8
        }
      }), ROOMS.find(r => r.id === ev.room)?.name), /*#__PURE__*/React.createElement("div", {
        className: "ec-rsvp",
        style: {
          color: goingCount > 0 ? 'var(--success)' : 'var(--gray-400)'
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-users",
        style: {
          marginRight: 2,
          fontSize: 8
        }
      }), goingCount, "/", ev.maxAttendees), ev.recurring && /*#__PURE__*/React.createElement("span", {
        className: "recurring-badge",
        style: {
          marginTop: 2
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-redo",
        style: {
          fontSize: 8
        }
      }), ev.recurring));
    }));
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-schedule"
  }, /*#__PURE__*/React.createElement(MobileCalendar, {
    events: filteredEvents
  }))), tab === 'dashboard' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, showcase ? "Понедельник (пример)" : "Сегодня"), displayTodayEvents.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body",
    style: {
      textAlign: 'center',
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--gray-400)'
    }
  }, "Нет запланированных событий"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, displayTodayEvents.map(ev => {
    const club = CLUBS.find(c => c.id === ev.clubId);
    const goingCount = Object.values(ev.rsvp).filter(v => v === 'going').length;
    const fillPct = Math.round(goingCount / ev.maxAttendees * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: ev.id,
      className: "event-full",
      onClick: () => setShowEventModal(ev)
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-color",
      style: {
        background: club?.color
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-name",
      style: {
        color: club?.color
      }
    }, ev.name), /*#__PURE__*/React.createElement("div", {
      className: "ef-meta"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-clock"
    }), TIME_SLOTS[ev.slot]?.start), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-map-marker-alt"
    }), ROOMS.find(r => r.id === ev.room)?.name), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users"
    }), goingCount, "/", ev.maxAttendees, " (", fillPct, "%)")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        borderRadius: 2,
        background: 'var(--gray-100)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        borderRadius: 2,
        background: club?.gradient || 'var(--gradient-primary)',
        width: `${fillPct}%`,
        transition: 'width 0.3s ease'
      }
    }))))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, "Ближайшие события"), upcomingEvents.map(ev => {
    const club = CLUBS.find(c => c.id === ev.clubId);
    return /*#__PURE__*/React.createElement("div", {
      key: ev.id,
      className: "event-full",
      onClick: () => setShowEventModal(ev)
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-color",
      style: {
        background: club?.color
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-name",
      style: {
        color: club?.color
      }
    }, ev.name), /*#__PURE__*/React.createElement("div", {
      className: "ef-meta"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-calendar"
    }), DAYS[ev.day]), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-clock"
    }), TIME_SLOTS[ev.slot]?.start), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-map-marker-alt"
    }), ROOMS.find(r => r.id === ev.room)?.name)))));
  })), activeTab === 'members' && !showcase && /*#__PURE__*/React.createElement("div", null, showEventModal ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: () => setShowEventModal(null)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-arrow-left"
  }), " Назад"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, showEventModal.name)), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Отметить присутствие"), showEventModal.attendees.map(mid => {
    const member = MEMBERS.find(m => m.id === mid);
    const rsvpStatus = showEventModal.rsvp[mid] || 'none';
    const isChecked = checkIn[`${showEventModal.id}-${mid}`];
    return /*#__PURE__*/React.createElement("div", {
      key: mid,
      className: "member-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "member-avatar",
      style: {
        background: member?.avatar || 'var(--gray-300)'
      }
    }, member?.name.split(' ').map(n => n[0]).join('')), /*#__PURE__*/React.createElement("div", {
      className: "member-name"
    }, member?.name), /*#__PURE__*/React.createElement("span", {
      className: `rsvp-badge rsvp-${rsvpStatus}`
    }, rsvpStatus === 'going' ? 'Идёт' : rsvpStatus === 'maybe' ? 'Может' : 'Не ответил'), /*#__PURE__*/React.createElement("button", {
      className: `btn btn-sm ${isChecked ? 'btn-primary' : ''}`,
      onClick: () => setCheckIn(prev => ({
        ...prev,
        [`${showEventModal.id}-${mid}`]: !isChecked
      }))
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isChecked ? 'fa-check-circle' : 'fa-circle'}`
    })));
  })))) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)',
      marginBottom: 16
    }
  }, "Нажмите на событие в календаре, чтобы отметить посещаемость."), CLUBS.map(club => {
    const clubEvents = EVENTS.filter(e => e.clubId === club.id);
    const clubMembers = new Set();
    clubEvents.forEach(e => e.attendees.forEach(a => clubMembers.add(a)));
    return /*#__PURE__*/React.createElement("div", {
      key: club.id,
      className: "card",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: club.gradient
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "card-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "club-icon",
      style: {
        background: club.gradient,
        width: 40,
        height: 40,
        fontSize: 16,
        marginBottom: 0
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${club.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 15,
        fontWeight: 700
      }
    }, club.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)'
      }
    }, clubMembers.size, " участников • ", clubEvents.length, " событий/нед"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
      }
    }, [...clubMembers].map(mid => {
      const m = MEMBERS.find(mm => mm.id === mid);
      return m ? /*#__PURE__*/React.createElement("span", {
        key: mid,
        style: {
          padding: '4px 10px',
          borderRadius: 8,
          background: `${m.avatar}10`,
          color: m.avatar,
          fontSize: 12,
          fontWeight: 600
        }
      }, m.name) : null;
    }))));
  }))), tab === 'rooms' && !showcase && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Бронирование помещений"), ROOMS.map(room => {
    const roomEvents = EVENTS.filter(e => e.room === room.id);
    const busySlots = roomEvents.length;
    const totalSlots = 7 * 7;
    const freePct = Math.round((1 - busySlots / totalSlots) * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: room.id,
      className: "card",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "card-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 16,
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-door-open",
      style: {
        marginRight: 8,
        color: 'var(--primary)'
      }
    }), room.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)'
      }
    }, "Вместимость: ", room.capacity, " чел. • Тип: ", room.type === 'hall' ? 'Зал' : room.type === 'meeting' ? 'Переговорная' : 'Коворкинг')), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 800,
        color: 'var(--primary)'
      }
    }, freePct, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--gray-500)'
      }
    }, "Свободно"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "Занятость на неделю:"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
      }
    }, roomEvents.map(ev => {
      const club = CLUBS.find(c => c.id === ev.clubId);
      return /*#__PURE__*/React.createElement("span", {
        key: ev.id,
        style: {
          padding: '3px 8px',
          borderRadius: 6,
          background: `${club?.color}10`,
          fontSize: 11,
          fontWeight: 500,
          color: club?.color,
          borderLeft: `3px solid ${club?.color}`
        }
      }, DAYS[ev.day], " ", TIME_SLOTS[ev.slot]?.start, " — ", ev.name);
    })))));
  })), showCreateModal && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: () => setShowCreateModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Создать событие"), /*#__PURE__*/React.createElement("div", {
    className: "create-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Название"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "Введите название...",
    value: newEvent.name,
    onChange: e => setNewEvent({
      ...newEvent,
      name: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Клуб"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: newEvent.clubId,
    onChange: e => setNewEvent({
      ...newEvent,
      clubId: e.target.value
    })
  }, CLUBS.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "День"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: newEvent.day,
    onChange: e => setNewEvent({
      ...newEvent,
      day: parseInt(e.target.value)
    })
  }, DAYS.map((d, i) => /*#__PURE__*/React.createElement("option", {
    key: i,
    value: i
  }, d)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Время"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: newEvent.slot,
    onChange: e => setNewEvent({
      ...newEvent,
      slot: parseInt(e.target.value)
    })
  }, TIME_SLOTS.map((s, i) => /*#__PURE__*/React.createElement("option", {
    key: i,
    value: i
  }, s.start))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Помещение"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: newEvent.room,
    onChange: e => setNewEvent({
      ...newEvent,
      room: e.target.value
    })
  }, ROOMS.map(r => /*#__PURE__*/React.createElement("option", {
    key: r.id,
    value: r.id
  }, r.name)))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Тип"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: newEvent.type,
    onChange: e => setNewEvent({
      ...newEvent,
      type: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "regular"
  }, "Регулярное"), /*#__PURE__*/React.createElement("option", {
    value: "one-time"
  }, "Разовое"), /*#__PURE__*/React.createElement("option", {
    value: "workshop"
  }, "Мастер-класс")))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Повторение (напр. «Каждый Вт 19:00»)"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    placeholder: "Оставьте пустым для разового события",
    value: newEvent.recurring,
    onChange: e => setNewEvent({
      ...newEvent,
      recurring: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Макс. участников"), /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    type: "number",
    value: newEvent.maxAttendees,
    onChange: e => setNewEvent({
      ...newEvent,
      maxAttendees: parseInt(e.target.value) || 20
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleCreateEvent,
    disabled: !newEvent.name
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-plus"
  }), " Создать"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setShowCreateModal(false)
  }, "Отмена")))), showEventModal && activeTab === 'calendar' && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: () => setShowEventModal(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, (() => {
    const ev = showEventModal;
    const club = CLUBS.find(c => c.id === ev.clubId);
    const goingCount = Object.values(ev.rsvp).filter(v => v === 'going').length;
    const maybeCount = Object.values(ev.rsvp).filter(v => v === 'maybe').length;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: club?.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 16
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${club?.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: club?.color
      }
    }, ev.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)'
      }
    }, club?.name))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "room-badge"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-calendar"
    }), DAYS[ev.day]), /*#__PURE__*/React.createElement("span", {
      className: "room-badge"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-clock"
    }), TIME_SLOTS[ev.slot]?.start, "–", TIME_SLOTS[ev.slot]?.end), /*#__PURE__*/React.createElement("span", {
      className: "room-badge"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-map-marker-alt"
    }), ROOMS.find(r => r.id === ev.room)?.name), ev.recurring && /*#__PURE__*/React.createElement("span", {
      className: "recurring-badge"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-redo"
    }), ev.recurring)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "rsvp-badge rsvp-going"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-check"
    }), goingCount, " идут"), /*#__PURE__*/React.createElement("span", {
      className: "rsvp-badge rsvp-maybe"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-question"
    }), maybeCount, " могут"), /*#__PURE__*/React.createElement("span", {
      className: "rsvp-badge rsvp-none"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users"
    }), ev.maxAttendees, " мест")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 8
      }
    }, "Участники:"), ev.attendees.map(mid => {
      const m = MEMBERS.find(mm => mm.id === mid);
      const rsvp = ev.rsvp[mid] || 'none';
      return /*#__PURE__*/React.createElement("div", {
        key: mid,
        className: "member-row"
      }, /*#__PURE__*/React.createElement("div", {
        className: "member-avatar",
        style: {
          background: m?.avatar || 'var(--gray-300)',
          width: 28,
          height: 28,
          fontSize: 10
        }
      }, m?.name.split(' ').map(n => n[0]).join('')), /*#__PURE__*/React.createElement("div", {
        className: "member-name",
        style: {
          fontSize: 12
        }
      }, m?.name), /*#__PURE__*/React.createElement("span", {
        className: `rsvp-badge rsvp-${rsvp}`,
        style: {
          fontSize: 10
        }
      }, rsvp === 'going' ? 'Идёт' : rsvp === 'maybe' ? 'Может' : '—'));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setShowEventModal(null)
    }, "Закрыть")));
  })())));
}

// Mobile calendar component
function MobileCalendar({
  events
}) {
  const [day, setDay] = useState(0);
  const nowInfo = getNowInfo();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mobile-day-tabs"
  }, DAYS.map((d, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: `mobile-day-tab ${day === i ? 'active' : ''}`,
    onClick: () => setDay(i)
  }, d, nowInfo.currentDay === i && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--primary)',
      marginLeft: 4
    }
  })))), events.filter(e => e.day === day).sort((a, b) => a.slot - b.slot).map(ev => {
    const club = CLUBS.find(c => c.id === ev.clubId);
    const goingCount = Object.values(ev.rsvp).filter(v => v === 'going').length;
    return /*#__PURE__*/React.createElement("div", {
      key: ev.id,
      className: "event-full"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-color",
      style: {
        background: club?.color
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-name",
      style: {
        color: club?.color
      }
    }, ev.name), /*#__PURE__*/React.createElement("div", {
      className: "ef-meta"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-clock"
    }), TIME_SLOTS[ev.slot]?.start, "–", TIME_SLOTS[ev.slot]?.end), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-map-marker-alt"
    }), ROOMS.find(r => r.id === ev.room)?.name), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users"
    }), goingCount, "/", ev.maxAttendees)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 6
      }
    }, ev.recurring && /*#__PURE__*/React.createElement("span", {
      className: "recurring-badge"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-redo",
      style: {
        fontSize: 8
      }
    }), ev.recurring), /*#__PURE__*/React.createElement("span", {
      className: "rsvp-badge rsvp-going",
      style: {
        fontSize: 10
      }
    }, goingCount, " идут")))));
  }), events.filter(e => e.day === day).length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body",
    style: {
      textAlign: 'center',
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--gray-400)'
    }
  }, "Нет событий"))));
}

// ═══════════════════════════════════════════
// MEMBER VIEW
// ═══════════════════════════════════════════
function MemberView() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [myRsvp, setMyRsvp] = useState({
    'e1': 'going',
    'e6': 'going',
    'e15': 'maybe',
    'e2': 'going',
    'e10': 'maybe'
  });
  const [myBookings, setMyBookings] = useState(['e1', 'e6', 'e15', 'e2', 'e10']);
  const [notifs, setNotifs] = useState({
    reminders: true,
    newEvents: false,
    changes: true
  });
  const nowInfo = getNowInfo();
  const handleRsvp = (eventId, status) => {
    setMyRsvp(prev => ({
      ...prev,
      [eventId]: status
    }));
    if (status === 'going' && !myBookings.includes(eventId)) {
      setMyBookings(prev => [...prev, eventId]);
    } else if (status !== 'going' && myBookings.includes(eventId)) {
      setMyBookings(prev => prev.filter(id => id !== eventId));
    }
  };
  const myEvents = EVENTS.filter(e => myBookings.includes(e.id));
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'calendar' ? 'active' : ''}`,
    onClick: () => setActiveTab('calendar')
  }, "Календарь"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'browse' ? 'active' : ''}`,
    onClick: () => setActiveTab('browse')
  }, "Секции"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'bookings' ? 'active' : ''}`,
    onClick: () => setActiveTab('bookings')
  }, "Мои записи"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'settings' ? 'active' : ''}`,
    onClick: () => setActiveTab('settings')
  }, "Настройки")), activeTab === 'calendar' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Мой календарь"), /*#__PURE__*/React.createElement("div", {
    className: "desktop-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 900
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DAYS.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `grid-header-cell ${nowInfo.currentDay === i ? 'today' : ''}`
  }, d))), TIME_SLOTS.map((slot, si) => /*#__PURE__*/React.createElement("div", {
    key: si,
    className: "grid-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start)), DAYS.map((_, di) => {
    const dayEvents = myEvents.filter(e => e.day === di && e.slot === si);
    return /*#__PURE__*/React.createElement("div", {
      key: di,
      className: `day-cell ${nowInfo.currentDay === di ? 'today-col' : ''}`
    }, dayEvents.map(ev => {
      const club = CLUBS.find(c => c.id === ev.clubId);
      const myStatus = myRsvp[ev.id] || 'none';
      return /*#__PURE__*/React.createElement("div", {
        key: ev.id,
        className: "event-card",
        style: {
          borderLeftColor: club?.color,
          background: `${club?.color}08`
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "ec-name",
        style: {
          color: club?.color
        }
      }, ev.name), /*#__PURE__*/React.createElement("div", {
        className: "ec-room"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-map-marker-alt",
        style: {
          marginRight: 2,
          fontSize: 8
        }
      }), ROOMS.find(r => r.id === ev.room)?.name), /*#__PURE__*/React.createElement("div", {
        className: "ec-rsvp"
      }, /*#__PURE__*/React.createElement("span", {
        className: `rsvp-badge rsvp-${myStatus}`,
        style: {
          fontSize: 9,
          padding: '1px 6px'
        }
      }, myStatus === 'going' ? '✓ Иду' : myStatus === 'maybe' ? '? Может' : '—')));
    }));
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-schedule"
  }, /*#__PURE__*/React.createElement(MobileCalendar, {
    events: myEvents
  }))), activeTab === 'browse' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Доступные секции и мероприятия"), CLUBS.map(club => {
    const clubEvents = EVENTS.filter(e => e.clubId === club.id);
    return /*#__PURE__*/React.createElement("div", {
      key: club.id,
      style: {
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "club-icon",
      style: {
        background: club.gradient,
        marginBottom: 0
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${club.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 16,
        fontWeight: 700
      }
    }, club.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)'
      }
    }, club.description))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
        gap: 12
      }
    }, clubEvents.map(ev => {
      const myStatus = myRsvp[ev.id];
      const goingCount = Object.values(ev.rsvp).filter(v => v === 'going').length;
      return /*#__PURE__*/React.createElement("div", {
        key: ev.id,
        className: "card"
      }, /*#__PURE__*/React.createElement("div", {
        className: "card-body",
        style: {
          padding: 16
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: club.color
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: 14,
          color: club.color
        }
      }, ev.name)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--gray-500)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-calendar",
        style: {
          marginRight: 3
        }
      }), DAYS[ev.day]), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-clock",
        style: {
          marginRight: 3
        }
      }), TIME_SLOTS[ev.slot]?.start), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-map-marker-alt",
        style: {
          marginRight: 3
        }
      }), ROOMS.find(r => r.id === ev.room)?.name)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "rsvp-badge rsvp-going",
        style: {
          fontSize: 10
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-check",
        style: {
          fontSize: 8
        }
      }), goingCount, " идут"), ev.recurring && /*#__PURE__*/React.createElement("span", {
        className: "recurring-badge",
        style: {
          fontSize: 9
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-redo",
        style: {
          fontSize: 8
        }
      }), ev.recurring), /*#__PURE__*/React.createElement("span", {
        className: "room-badge",
        style: {
          fontSize: 9
        }
      }, ev.type === 'regular' ? 'Регулярное' : ev.type === 'workshop' ? 'Мастер-класс' : 'Разовое')), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6
        }
      }, myStatus === 'going' ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--success)'
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-check-circle",
        style: {
          marginRight: 4
        }
      }), "Вы идёте") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "btn btn-primary btn-sm",
        onClick: () => handleRsvp(ev.id, 'going')
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-check"
      }), " Иду"), /*#__PURE__*/React.createElement("button", {
        className: "btn btn-sm",
        onClick: () => handleRsvp(ev.id, 'maybe')
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-question"
      }), " Может")))));
    })));
  })), activeTab === 'bookings' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Мои записи"), myBookings.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body",
    style: {
      textAlign: 'center',
      padding: 32
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--gray-400)'
    }
  }, "У вас пока нет записей"))) : myBookings.map(eid => {
    const ev = EVENTS.find(e => e.id === eid);
    if (!ev) return null;
    const club = CLUBS.find(c => c.id === ev.clubId);
    const myStatus = myRsvp[ev.id] || 'none';
    return /*#__PURE__*/React.createElement("div", {
      key: eid,
      className: "event-full"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-color",
      style: {
        background: club?.color
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ef-name",
      style: {
        color: club?.color
      }
    }, ev.name), /*#__PURE__*/React.createElement("div", {
      className: "ef-meta"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-calendar"
    }), DAYS[ev.day]), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-clock"
    }), TIME_SLOTS[ev.slot]?.start, "–", TIME_SLOTS[ev.slot]?.end), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-map-marker-alt"
    }), ROOMS.find(r => r.id === ev.room)?.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginTop: 8,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: `rsvp-badge rsvp-${myStatus}`
    }, myStatus === 'going' ? '✓ Иду' : myStatus === 'maybe' ? '? Может' : '—'), myStatus === 'going' && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      onClick: () => handleRsvp(ev.id, 'none')
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-times"
    }), " Отменить"), myStatus === 'maybe' && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => handleRsvp(ev.id, 'going')
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-check"
    }), " Подтвердить")))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      alert('Экспорт в .ics файл (демо)');
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-download"
  }), " Экспорт в календарь"))), activeTab === 'settings' && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Настройки уведомлений"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, "Напоминания о событиях"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--gray-500)'
    }
  }, "Получать уведомления за 1 час до начала")), /*#__PURE__*/React.createElement("div", {
    className: `toggle ${notifs.reminders ? 'on' : ''}`,
    onClick: () => setNotifs(p => ({
      ...p,
      reminders: !p.reminders
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, "Новые события"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--gray-500)'
    }
  }, "Уведомлять о новых мероприятиях в моих клубах")), /*#__PURE__*/React.createElement("div", {
    className: `toggle ${notifs.newEvents ? 'on' : ''}`,
    onClick: () => setNotifs(p => ({
      ...p,
      newEvents: !p.newEvents
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, "Изменения расписания"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--gray-500)'
    }
  }, "Уведомлять об отменах и переносах")), /*#__PURE__*/React.createElement("div", {
    className: `toggle ${notifs.changes ? 'on' : ''}`,
    onClick: () => setNotifs(p => ({
      ...p,
      changes: !p.changes
    }))
  }))))));
}

// ═══════════════════════════════════════════════
// GUIDED SCENARIO v2 (TASK-28)
// Движок шагов — общий для education/sports/clubs.demo.js;
// при правках синхронизировать вручную (docs/Demoplan.md §Guided v2).
// Файл правится ТОЛЬКО руками: скрипты пересборки (rebuild-demos.js,
// compile-demos.js) удалены в TASK-28 — они восстанавливали файл из
// старых git-коммитов и стёрли бы guided-код.
// ═══════════════════════════════════════════════

const gEl = React.createElement;
const GUIDED_STORAGE_KEY = "planovo.guided.clubs";

const GUIDED_STEPS = [{
  id: "open-event",
  target: "event-card",
  title: "Пятница, 19:00 — покерный турнир",
  text: "Осталось 2 места из 20. Нажмите на событие, чтобы записаться.",
  placement: "bottom"
}, {
  id: "rsvp",
  target: "rsvp-going",
  title: "Запишитесь в один клик",
  text: "Нажмите «Иду» — место закрепится за вами мгновенно, без переписки с администратором.",
  placement: "bottom"
}];

function prefersReducedMotion() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useGuidedScenario(steps, storageKey, onReset) {
  const [stepIndex, setStepIndex] = useState(0);
  const [wasCompleted] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch (e) {
      return false;
    }
  });
  const [mode, setMode] = useState(wasCompleted ? "replay" : "running");
  const step = mode === "running" ? steps[stepIndex] : null;
  const complete = stepId => {
    if (mode !== "running" || !step || step.id !== stepId) return;
    if (stepIndex + 1 >= steps.length) {
      setMode("done");
      try {
        localStorage.setItem(storageKey, "1");
      } catch (e) {}
    } else {
      setStepIndex(stepIndex + 1);
    }
  };
  const skip = () => setMode("free");
  const explore = () => setMode("free");
  const restart = () => {
    if (onReset) onReset();
    setStepIndex(0);
    setMode("running");
  };
  return {
    steps,
    stepIndex,
    step,
    mode,
    complete,
    skip,
    explore,
    restart
  };
}

function guidedTargetProps(engine, id, baseClass) {
  const active = engine.step && engine.step.target === id;
  return {
    "data-guide": id,
    className: (baseClass || "") + (active ? " guide-target" : "")
  };
}

function GuidedProgress({
  engine
}) {
  if (engine.mode === "done") return null;
  const total = engine.steps.length;
  return gEl("div", {
    className: "guided-topbar"
  }, gEl("div", {
    className: "guided-progress"
  }, engine.mode === "running" ? gEl("span", null, "Шаг ", engine.stepIndex + 1, " из ", total) : gEl("span", null, "Свободный режим — управляйте записью"), engine.mode === "running" && gEl("div", {
    className: "guided-dots"
  }, engine.steps.map((s, i) => gEl("span", {
    key: s.id,
    className: "guided-dot" + (i < engine.stepIndex ? " done" : i === engine.stepIndex ? " current" : "")
  })))), engine.mode === "running" ? gEl("button", {
    type: "button",
    className: "guided-skip",
    onClick: engine.skip
  }, "Пропустить сценарий") : gEl("button", {
    type: "button",
    className: "guided-skip",
    onClick: engine.restart
  }, "Пройти сценарий заново"));
}

function GuidedFrame({
  engine,
  children
}) {
  const stageRef = useRef(null);
  const [mark, setMark] = useState(null);
  const step = engine.step;
  const targetId = step ? step.target : null;
  const placement = step ? step.placement || "bottom" : "bottom";

  useEffect(() => {
    if (!targetId) {
      setMark(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const el = stage.querySelector('[data-guide="' + targetId + '"]');
      if (!el) {
        setMark(null);
        return;
      }
      if (window.matchMedia("(max-width: 767px)").matches) {
        setMark({
          sheet: true
        });
        return;
      }
      const sRect = stage.getBoundingClientRect();
      const tRect = el.getBoundingClientRect();
      const width = Math.min(280, sRect.width - 16);
      let left = tRect.left - sRect.left + tRect.width / 2 - width / 2;
      left = Math.max(8, Math.min(left, sRect.width - width - 8));
      const top = placement === "top" ? tRect.top - sRect.top - 12 : tRect.bottom - sRect.top + 12;
      const arrowLeft = Math.max(14, Math.min(tRect.left - sRect.left + tRect.width / 2 - left - 6, width - 26));
      setMark({
        top,
        left,
        width,
        placement,
        arrowLeft
      });
    };
    measure();
    // Повторные замеры: поздняя загрузка шрифтов/картинок сдвигает layout
    const t1 = setTimeout(measure, 400);
    const t2 = setTimeout(measure, 1200);
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("load", measure);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measure);
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
    };
  }, [targetId, placement]);

  useEffect(() => {
    if (!targetId || engine.stepIndex === 0) return;
    const stage = stageRef.current;
    if (!stage) return;
    const el = stage.querySelector('[data-guide="' + targetId + '"]');
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({
        block: "center",
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    }
  }, [targetId]);

  return gEl("div", {
    className: "guided-stage",
    ref: stageRef
  }, children, step && gEl("div", {
    className: "guided-stage-overlay",
    "aria-hidden": "true"
  }), step && mark && gEl("div", {
    className: "guided-coachmark placement-" + (mark.sheet ? "sheet" : mark.placement),
    role: "status",
    style: mark.sheet ? undefined : {
      top: mark.top,
      left: mark.left,
      width: mark.width,
      transform: mark.placement === "top" ? "translateY(-100%)" : undefined
    }
  }, !mark.sheet && gEl("div", {
    className: "guided-coachmark-arrow",
    style: {
      left: mark.arrowLeft
    }
  }), gEl("div", {
    className: "guided-coachmark-title"
  }, step.title), gEl("div", {
    className: "guided-coachmark-text"
  }, step.text)));
}

// --- Данные сценария clubs: запись на ивент с лимитом мест ---
// Отдельный объект: общий массив EVENTS не мутируем.
const SCENARIO_EVENT = {
  id: "gsc-poker",
  clubId: "club2",
  name: "Покерный турнир",
  day: 4,
  slot: 5,
  room: "rb",
  maxAttendees: 20,
  baseGoing: 18
};

function ClubsGuidedStage({
  engine
}) {
  const [expanded, setExpanded] = useState(false);
  const [myStatus, setMyStatus] = useState("none"); // none | going | maybe
  const club = getClub(SCENARIO_EVENT.clubId);
  const slot = TIME_SLOTS[SCENARIO_EVENT.slot];
  const going = SCENARIO_EVENT.baseGoing + (myStatus === "going" ? 1 : 0);
  const spotsLeft = SCENARIO_EVENT.maxAttendees - going;
  const fillPct = Math.round(going / SCENARIO_EVENT.maxAttendees * 100);
  const handleCardClick = () => {
    setExpanded(!expanded);
    engine.complete("open-event");
  };
  const handleRsvpGoing = () => {
    // семантика handleRsvp из MemberView: повторный клик снимает статус
    setMyStatus(myStatus === "going" ? "none" : "going");
    engine.complete("rsvp");
  };
  const handleRsvpMaybe = () => {
    setMyStatus(myStatus === "maybe" ? "none" : "maybe");
  };
  return gEl(React.Fragment, null, gEl(GuidedFrame, {
    engine
  }, gEl("div", {
    className: "showcase-day-header",
    style: {
      marginBottom: 12
    }
  }, gEl("i", {
    className: "fas fa-calendar-day"
  }), gEl("span", null, "Пятница"), gEl("span", {
    className: "showcase-panel-meta"
  }, "· ", club.name)), gEl("button", Object.assign({
    type: "button",
    onClick: handleCardClick,
    "aria-label": SCENARIO_EVENT.name + ", пятница " + slot.start + ", осталось " + spotsLeft + " мест",
    style: {
      borderLeft: "3px solid " + club.color
    }
  }, guidedTargetProps(engine, "event-card", "guided-item-card")), gEl("div", {
    className: "guided-item-time"
  }, slot.start, "–", slot.end, " · Зал Б", myStatus === "going" && gEl("span", {
    className: "phone-badge-updated",
    style: {
      marginLeft: 8,
      marginBottom: 0
    }
  }, "✓ Вы записаны")), gEl("div", {
    className: "guided-item-title",
    style: {
      color: club.color
    }
  }, gEl("i", {
    className: "fas " + club.icon,
    style: {
      marginRight: 6
    }
  }), SCENARIO_EVENT.name), gEl("div", {
    className: "guided-item-meta"
  }, gEl("i", {
    className: "fas fa-users",
    style: {
      marginRight: 4
    }
  }), going, "/", SCENARIO_EVENT.maxAttendees, spotsLeft > 0 ? " · Осталось " + spotsLeft + (spotsLeft === 1 ? " место" : " места") : " · Мест нет"), gEl("div", {
    className: "guided-fill-bar"
  }, gEl("span", {
    style: {
      width: fillPct + "%"
    }
  }))), expanded && gEl("div", {
    className: "guided-actionbar"
  }, gEl("button", Object.assign({
    type: "button",
    onClick: handleRsvpGoing,
    disabled: myStatus !== "going" && spotsLeft <= 0
  }, guidedTargetProps(engine, "rsvp-going", "guided-primary-btn")), myStatus === "going" ? "Вы идёте ✓ (отменить)" : "Иду"), gEl("button", {
    type: "button",
    className: "guided-secondary-btn",
    onClick: handleRsvpMaybe
  }, myStatus === "maybe" ? "Может быть ✓" : "Может быть"), engine.mode !== "running" && gEl("span", {
    className: "guided-free-hint"
  }, "Повторный клик снимает запись — счётчик обновляется сразу."))), engine.mode === "done" && gEl("div", {
    className: "guided-success-panel"
  }, gEl("div", null, gEl("div", {
    className: "guided-success-headline"
  }, gEl("i", {
    className: "fas fa-circle-check"
  }), "Место забронировано — за 2 клика"), gEl("p", {
    className: "guided-success-text"
  }, "Никакой переписки с администратором: вы в списке, счётчик обновился, а организатор уже видит вашу запись."), gEl("div", {
    className: "guided-success-actions"
  }, gEl("a", {
    className: "guided-cta",
    href: "index.html#contact"
  }, gEl("i", {
    className: "fas fa-arrow-right"
  }), "Получить бесплатный разбор"), gEl("button", {
    type: "button",
    className: "guided-secondary-btn",
    onClick: engine.explore
  }, "Исследовать свободно"), gEl("button", {
    type: "button",
    className: "guided-secondary-btn",
    onClick: engine.restart
  }, "Пройти ещё раз"))), gEl("div", null, gEl("div", {
    className: "showcase-demo-chrome",
    style: {
      marginBottom: 10
    }
  }, gEl("i", {
    className: "fas fa-user-tie"
  }), gEl("span", null, "Вид организатора"), gEl("span", {
    className: "showcase-panel-meta"
  }, "· обновился сам")), gEl("div", {
    className: "guided-item-card",
    style: {
      cursor: "default",
      borderLeft: "3px solid " + club.color
    }
  }, gEl("div", {
    className: "guided-item-title",
    style: {
      color: club.color
    }
  }, SCENARIO_EVENT.name), gEl("div", {
    className: "guided-item-meta"
  }, "Пятница · ", slot.start, " · Зал Б"), gEl("div", {
    className: "guided-item-meta",
    style: {
      marginTop: 6
    }
  }, "Заполненность: ", going, "/", SCENARIO_EVENT.maxAttendees, " (", fillPct, "%)"), gEl("div", {
    className: "guided-fill-bar"
  }, gEl("span", {
    style: {
      width: fillPct + "%"
    }
  }))), gEl("div", {
    className: "guided-notif-row"
  }, gEl("i", {
    className: "fas fa-bell"
  }), gEl("span", null, "Новая запись: вы · только что")))));
}

function GuidedScenarioSection() {
  const [runId, setRunId] = useState(0);
  const engine = useGuidedScenario(GUIDED_STEPS, GUIDED_STORAGE_KEY, () => setRunId(r => r + 1));
  return gEl("section", {
    className: "guided-section",
    "aria-label": "Интерактивный сценарий"
  }, gEl("span", {
    className: "guided-kicker"
  }, gEl("i", {
    className: "fas fa-hand-pointer"
  }), "Попробуйте сами · 2 клика"), gEl("h2", {
    className: "guided-title"
  }, "Сценарий: запишитесь на турнир"), gEl("p", {
    className: "guided-sub"
  }, "Займите одно из последних мест — и посмотрите, как запись мгновенно доходит до организатора."), engine.mode === "replay" ? gEl("div", {
    className: "guided-replay-banner"
  }, gEl("span", null, "Вы уже проходили этот сценарий."), gEl("div", {
    className: "guided-replay-actions"
  }, gEl("button", {
    type: "button",
    className: "guided-primary-btn",
    onClick: engine.restart
  }, "Пройти ещё раз"), gEl("button", {
    type: "button",
    className: "guided-secondary-btn",
    onClick: engine.explore
  }, "Смотреть свободно"))) : gEl(GuidedProgress, {
    engine
  }), engine.mode !== "replay" && gEl(ClubsGuidedStage, {
    key: runId,
    engine
  }), gEl("div", {
    className: "guided-divider"
  }, "Ниже — витрина по ролям"));
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
function App() {
  const [role, setRole] = useState('member');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const roles = [{
    key: 'member',
    label: 'Участник',
    icon: 'fa-user'
  }, {
    key: 'organizer',
    label: 'Организатор',
    icon: 'fa-calendar-check'
  }];
  const introByRole = {
    member: /*#__PURE__*/React.createElement(React.Fragment, null, "Три блока: ", /*#__PURE__*/React.createElement("strong", null, "пояснение слева"), ", пример интерфейса справа. Во втором блоке можно переключить клуб."),
    organizer: /*#__PURE__*/React.createElement(React.Fragment, null, "Календарь и дашборд организатора — ", /*#__PURE__*/React.createElement("strong", null, "отдельными блоками"), " с пояснениями слева.")
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "app-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-inner"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    className: "logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "logo-icon"
  }, /*#__PURE__*/React.createElement("img", {
    src: "logo.png",
    alt: "",
    className: "planovo-logo-img",
    width: 60,
    height: 60,
    decoding: "async"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "logo-text"
  }, "Планово"), /*#__PURE__*/React.createElement("div", {
    className: "logo-sub"
  }, "Визуальный пример · Клубы и мероприятия"))), /*#__PURE__*/React.createElement("div", {
    className: "role-tabs-desktop role-tabs"
  }, roles.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.key,
    className: `role-tab ${role === r.key ? 'active' : ''}`,
    onClick: () => setRole(r.key)
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${r.icon}`
  }), " ", r.label))), /*#__PURE__*/React.createElement("button", {
    className: "mobile-menu-btn",
    onClick: () => setMobileMenuOpen(!mobileMenuOpen)
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`
  }))), mobileMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "role-tabs-mobile",
    style: {
      paddingBottom: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, roles.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.key,
    className: `role-tab ${role === r.key ? 'active' : ''}`,
    onClick: () => {
      setRole(r.key);
      setMobileMenuOpen(false);
    },
    style: {
      justifyContent: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${r.icon}`
  }), " ", r.label))))), /*#__PURE__*/React.createElement("main", {
    className: "main-content",
    style: {
      flex: 1
    },
    id: "main-content",
    role: "main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    className: "back-link"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-arrow-left"
  }), " Вернуться на сайт"), /*#__PURE__*/React.createElement(GuidedScenarioSection, null), /*#__PURE__*/React.createElement("p", {
    className: "showcase-intro"
  }, introByRole[role]), role === 'member' && /*#__PURE__*/React.createElement(MemberShowcase, null), role === 'organizer' && /*#__PURE__*/React.createElement(OrganizerShowcase, null))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));