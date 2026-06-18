const {
  useState,
  useMemo,
  useEffect,
  useCallback
} = React;

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const TIME_SLOTS = [{
  start: "08:00",
  end: "09:30",
  label: "Утро"
}, {
  start: "10:00",
  end: "11:30",
  label: "День 1"
}, {
  start: "12:00",
  end: "13:30",
  label: "День 2"
}, {
  start: "14:00",
  end: "15:30",
  label: "День 3"
}, {
  start: "16:00",
  end: "17:30",
  label: "Вечер 1"
}, {
  start: "18:00",
  end: "19:30",
  label: "Вечер 2"
}, {
  start: "20:00",
  end: "21:30",
  label: "Поздний"
}];
const SECTIONS = [{
  id: "s1",
  name: "Борьба",
  icon: "fa-hand-fist",
  color: "#ef4444",
  gradient: "linear-gradient(135deg,#ef4444,#dc2626)",
  trainer: "Иванов А.С.",
  maxStudents: 15,
  age: "8+",
  description: "Классическая и вольная борьба для детей и взрослых"
}, {
  id: "s2",
  name: "Плавание",
  icon: "fa-person-swimming",
  color: "#0ea5e9",
  gradient: "linear-gradient(135deg,#0ea5e9,#0284c7)",
  trainer: "Петрова М.В.",
  maxStudents: 12,
  age: "6+",
  description: "Обучение плаванию, спортивное плавание, аквааэробика"
}, {
  id: "s3",
  name: "Танцы",
  icon: "fa-music",
  color: "#ec4899",
  gradient: "linear-gradient(135deg,#ec4899,#db2777)",
  trainer: "Сидорова Е.Н.",
  maxStudents: 20,
  age: "5+",
  description: "Хип-хоп, контемпорари, бальные танцы"
}, {
  id: "s4",
  name: "Гимнастика",
  icon: "fa-person",
  color: "#8b5cf6",
  gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  trainer: "Козлов Д.В.",
  maxStudents: 10,
  age: "4+",
  description: "Художественная и спортивная гимнастика"
}, {
  id: "s5",
  name: "Фитнес",
  icon: "fa-dumbbell",
  color: "#f59e0b",
  gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
  trainer: "Морозова Т.К.",
  maxStudents: 25,
  age: "16+",
  description: "Кроссфит, функциональная тренировка, йога"
}];
const CLIENTS = [{
  id: "c1",
  name: "Алексей Смирнов",
  age: 14,
  sectionId: "s1",
  subscription: {
    total: 12,
    used: 7
  }
}, {
  id: "c2",
  name: "Мария Иванова",
  age: 10,
  sectionId: "s1",
  subscription: {
    total: 12,
    used: 11
  }
}, {
  id: "c3",
  name: "Дмитрий Козлов",
  age: 16,
  sectionId: "s1",
  subscription: {
    total: 8,
    used: 3
  }
}, {
  id: "c4",
  name: "Анна Петрова",
  age: 8,
  sectionId: "s2",
  subscription: {
    total: 12,
    used: 5
  }
}, {
  id: "c5",
  name: "Иван Сидоров",
  age: 12,
  sectionId: "s2",
  subscription: {
    total: 12,
    used: 9
  }
}, {
  id: "c6",
  name: "Елена Волкова",
  age: 25,
  sectionId: "s2",
  subscription: {
    total: 8,
    used: 2
  }
}, {
  id: "c7",
  name: "Ольга Новикова",
  age: 9,
  sectionId: "s3",
  subscription: {
    total: 12,
    used: 8
  }
}, {
  id: "c8",
  name: "Никита Морозов",
  age: 11,
  sectionId: "s3",
  subscription: {
    total: 12,
    used: 6
  }
}, {
  id: "c9",
  name: "Софья Лебедева",
  age: 7,
  sectionId: "s3",
  subscription: {
    total: 8,
    used: 1
  }
}, {
  id: "c10",
  name: "Артём Зайцев",
  age: 6,
  sectionId: "s4",
  subscription: {
    total: 12,
    used: 10
  }
}, {
  id: "c11",
  name: "Полина Павлова",
  age: 5,
  sectionId: "s4",
  subscription: {
    total: 12,
    used: 4
  }
}, {
  id: "c12",
  name: "Виктория Соколова",
  age: 8,
  sectionId: "s4",
  subscription: {
    total: 8,
    used: 7
  }
}, {
  id: "c13",
  name: "Андрей Буфеев",
  age: 30,
  sectionId: "s5",
  subscription: {
    total: 8,
    used: 5
  }
}, {
  id: "c14",
  name: "Наталья Карпова",
  age: 28,
  sectionId: "s5",
  subscription: {
    total: 8,
    used: 3
  }
}, {
  id: "c15",
  name: "Сергей Малый",
  age: 35,
  sectionId: "s5",
  subscription: {
    total: 12,
    used: 9
  }
}, {
  id: "c16",
  name: "Кристина Волкова",
  age: 22,
  sectionId: "s5",
  subscription: {
    total: 12,
    used: 2
  }
}, {
  id: "c17",
  name: "Павел Громов",
  age: 12,
  sectionId: "s1",
  subscription: {
    total: 8,
    used: 6
  }
}, {
  id: "c18",
  name: "Вера Лисицына",
  age: 7,
  sectionId: "s3",
  subscription: {
    total: 12,
    used: 3
  }
}, {
  id: "c19",
  name: "Тимофей Орлов",
  age: 9,
  sectionId: "s2",
  subscription: {
    total: 12,
    used: 7
  }
}, {
  id: "c20",
  name: "Алиса Белова",
  age: 11,
  sectionId: "s4",
  subscription: {
    total: 8,
    used: 4
  }
}];

// Training schedule: dayIndex -> slotIndex -> [{sectionId, groupId}]
const SCHEDULE_DATA = {
  "0": [{
    0: [{
      sectionId: "s1",
      group: "Младшая"
    }],
    5: [{
      sectionId: "s1",
      group: "Старшая"
    }],
    1: [{
      sectionId: "s2",
      group: "Дети"
    }],
    6: [{
      sectionId: "s5",
      group: "Взрослые"
    }],
    2: [{
      sectionId: "s3",
      group: "Младшая"
    }],
    4: [{
      sectionId: "s4",
      group: "Основная"
    }]
  }],
  "1": [{
    1: [{
      sectionId: "s2",
      group: "Взрослые"
    }],
    3: [{
      sectionId: "s4",
      group: "Младшая"
    }],
    5: [{
      sectionId: "s3",
      group: "Старшая"
    }],
    6: [{
      sectionId: "s5",
      group: "Утренний"
    }]
  }],
  "2": [{
    0: [{
      sectionId: "s1",
      group: "Младшая"
    }],
    5: [{
      sectionId: "s1",
      group: "Старшая"
    }],
    2: [{
      sectionId: "s2",
      group: "Дети"
    }],
    4: [{
      sectionId: "s3",
      group: "Младшая"
    }],
    6: [{
      sectionId: "s5",
      group: "Взрослые"
    }]
  }],
  "3": [{
    1: [{
      sectionId: "s2",
      group: "Дети"
    }],
    3: [{
      sectionId: "s4",
      group: "Основная"
    }],
    5: [{
      sectionId: "s3",
      group: "Старшая"
    }],
    6: [{
      sectionId: "s5",
      group: "Утренний"
    }]
  }],
  "4": [{
    0: [{
      sectionId: "s1",
      group: "Общая"
    }],
    2: [{
      sectionId: "s2",
      group: "Взрослые"
    }],
    4: [{
      sectionId: "s4",
      group: "Младшая"
    }],
    5: [{
      sectionId: "s3",
      group: "Общая"
    }]
  }],
  "5": [{
    0: [{
      sectionId: "s4",
      group: "Основная"
    }],
    1: [{
      sectionId: "s2",
      group: "Дети"
    }],
    3: [{
      sectionId: "s1",
      group: "Младшая"
    }],
    5: [{
      sectionId: "s5",
      group: "Взрослые"
    }]
  }]
};

// Build flat schedule from SCHEDULE_DATA
function buildSchedule() {
  const result = [];
  for (const [dayIdx, slots] of Object.entries(SCHEDULE_DATA)) {
    for (const slotObj of slots) {
      for (const [slotIdx, trainings] of Object.entries(slotObj)) {
        for (const t of trainings) {
          result.push({
            dayIndex: parseInt(dayIdx),
            slotIndex: parseInt(slotIdx),
            ...t
          });
        }
      }
    }
  }
  return result;
}
const ALL_TRAININGS = buildSchedule();

// ═══════════════════════════════════════════
// Now info
// ═══════════════════════════════════════════
function getNowInfo() {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // Mon=0
  const currentDay = dayMap[dow];
  const mins = now.getHours() * 60 + now.getMinutes();
  let currentSlot = null;
  for (let i = 0; i < TIME_SLOTS.length; i++) {
    if (mins >= parseInt(TIME_SLOTS[i].start.split(':')[0]) * 60 + parseInt(TIME_SLOTS[i].start.split(':')[1]) && mins <= parseInt(TIME_SLOTS[i].end.split(':')[0]) * 60 + parseInt(TIME_SLOTS[i].end.split(':')[1])) {
      currentSlot = i;
      break;
    }
  }
  return {
    currentDay,
    currentSlot,
    isWeekend: dow === 0
  };
}

// ═══════════════════════════════════════════
// SPORTS SHOWCASE (visual example + commentary)
// ═══════════════════════════════════════════
const DAY_FULL = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const DEMO_DAY_INDICES = [0, 2];
const DEMO_DAYS = DEMO_DAY_INDICES.map(i => ({
  index: i,
  short: DAYS[i],
  full: DAY_FULL[i]
}));
const DEMO_SLOT_INDICES = [0, 6];
const DEMO_SLOTS = DEMO_SLOT_INDICES.map(i => ({
  index: i,
  start: TIME_SLOTS[i].start,
  end: TIME_SLOTS[i].end,
  label: TIME_SLOTS[i].label
}));
const DEMO_SECTIONS = SECTIONS.filter(s => s.id === "s1" || s.id === "s5");
const CLIENT_SHOWCASE_BLOCKS = [{
  n: 1,
  icon: "fa-calendar-day",
  title: "День тренировок",
  text: "Клиент открывает ссылку и видит занятия на день: во сколько, какая секция и группа, кто тренер и сколько мест занято — без звонка администратору."
}, {
  n: 2,
  icon: "fa-dumbbell",
  title: "Своя секция",
  text: "У каждого клиента своё расписание. Переключите секцию — в первом блоке обновятся тренировки (в продукте список секций у каждого свой)."
}, {
  n: 3,
  icon: "fa-table-columns",
  title: "Фрагмент недели",
  text: "Понедельник и среда на одном экране — удобно с телефона, без горизонтального скролла всей недели."
}];
const SPORTS_SHOWCASE_FOOTER = {
  icon: "fa-layer-group",
  title: "В полной версии",
  text: "Тренеры отмечают посещаемость, администрация видит загрузку секций и абонементы. Переключите вкладку в шапке — там упрощённые примеры."
};
const COACH_SHOWCASE_NOTES = [{
  n: 1,
  icon: "fa-calendar-days",
  title: "Расписание секции",
  text: "Тренер видит только свои группы — по дням и времени, без чужих секций и залов."
}, {
  n: 2,
  icon: "fa-clipboard-check",
  title: "Посещаемость",
  text: "После тренировки отмечает, кто был на занятии. Данные сразу в системе — не таблица в блокноте."
}];
const ADMIN_SHOWCASE_NOTES = [{
  n: 1,
  icon: "fa-chart-pie",
  title: "Обзор зала",
  text: "Администратор видит ключевые цифры: клиенты, секции, активные абонементы — без десятка Excel-файлов."
}, {
  n: 2,
  icon: "fa-layer-group",
  title: "Загрузка секций",
  text: "По каждой секции — сколько записано, сколько тренировок в неделю, средняя посещаемость."
}];
function getTrainingAt(sectionId, dayIndex, slotIndex) {
  return ALL_TRAININGS.find(t => t.sectionId === sectionId && t.dayIndex === dayIndex && t.slotIndex === slotIndex) || null;
}
function getSectionFill(sectionId) {
  const section = SECTIONS.find(s => s.id === sectionId);
  const enrolled = CLIENTS.filter(c => c.sectionId === sectionId).length;
  return {
    enrolled,
    max: section?.maxStudents || 0
  };
}
function ShowcaseBlock({
  note,
  children
}) {
  const accent = note.n === 1 || note.n === 3;
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
function ShowcaseTrainingFull({
  training,
  section
}) {
  const slot = TIME_SLOTS[training.slotIndex];
  const fill = getSectionFill(section.id);
  return /*#__PURE__*/React.createElement("div", {
    className: "client-slot showcase-training-card",
    style: {
      borderLeft: `3px solid ${section.color}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cs-time"
  }, slot.start, "–", slot.end, " · ", slot.label), /*#__PURE__*/React.createElement("div", {
    className: "cs-name",
    style: {
      color: section.color
    }
  }, section.name, " — ", training.group), /*#__PURE__*/React.createElement("div", {
    className: "cs-trainer"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-user",
    style: {
      marginRight: 4,
      fontSize: 10
    }
  }), section.trainer), /*#__PURE__*/React.createElement("span", {
    className: "training-card tc-count",
    style: {
      marginTop: 8,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-users",
    style: {
      fontSize: 8
    }
  }), " ", fill.enrolled, "/", fill.max));
}
function ShowcaseDayListSports({
  dayIndex,
  sectionId
}) {
  const day = DEMO_DAYS.find(d => d.index === dayIndex) || {
    full: DAY_FULL[dayIndex],
    short: DAYS[dayIndex]
  };
  const section = SECTIONS.find(s => s.id === sectionId);
  return /*#__PURE__*/React.createElement("div", {
    className: "card showcase-day-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "showcase-day-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-calendar-day"
  }), /*#__PURE__*/React.createElement("span", null, day.full), section && /*#__PURE__*/React.createElement("span", {
    className: "showcase-panel-meta"
  }, "· ", section.name)), /*#__PURE__*/React.createElement("div", {
    className: "showcase-day-slots"
  }, DEMO_SLOTS.map(slot => {
    const training = getTrainingAt(sectionId, dayIndex, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: slot.index,
      className: "showcase-day-slot"
    }, training ? /*#__PURE__*/React.createElement(ShowcaseTrainingFull, {
      training: training,
      section: section
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-slot",
      style: {
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px dashed var(--gray-200)",
        textAlign: "center",
        color: "var(--gray-400)",
        fontSize: 13
      }
    }, "Нет тренировки"));
  })));
}
function ShowcaseScheduleGridSports({
  sectionId
}) {
  const section = SECTIONS.find(s => s.id === sectionId);
  const fill = getSectionFill(sectionId);
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
  }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
    className: "label",
    style: {
      fontSize: 9,
      color: "var(--gray-400)"
    }
  }, slot.label)), DEMO_DAYS.map(d => {
    const training = getTrainingAt(sectionId, d.index, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: d.index,
      className: "day-cell"
    }, training ? /*#__PURE__*/React.createElement("div", {
      className: "training-card",
      style: {
        borderLeft: `3px solid ${section?.color}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tc-name"
    }, training.group), /*#__PURE__*/React.createElement("div", {
      className: "tc-info"
    }, section?.trainer), /*#__PURE__*/React.createElement("div", {
      className: "tc-count"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users",
      style: {
        fontSize: 8
      }
    }), " ", fill.enrolled, "/", fill.max)) : /*#__PURE__*/React.createElement("div", {
      className: "empty-cell",
      style: {
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--gray-300)",
        fontSize: 10
      }
    }, "—"));
  }))))));
}
function ClientShowcase() {
  const [selectedSectionId, setSelectedSectionId] = useState("s1");
  const section = SECTIONS.find(s => s.id === selectedSectionId);
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: CLIENT_SHOWCASE_BLOCKS[0]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-user",
    label: "Клиент",
    meta: section ? `· ${section.name}` : null
  }), /*#__PURE__*/React.createElement(ShowcaseDayListSports, {
    dayIndex: 0,
    sectionId: selectedSectionId
  })), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: CLIENT_SHOWCASE_BLOCKS[1]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-list",
    label: "Выбор секции"
  }), /*#__PURE__*/React.createElement("div", {
    className: "group-selector"
  }, DEMO_SECTIONS.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    type: "button",
    className: `group-btn ${selectedSectionId === s.id ? "active" : ""}`,
    onClick: () => setSelectedSectionId(s.id)
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${s.icon}`,
    style: {
      marginRight: 6
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    className: "course"
  }, s.age))))), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: CLIENT_SHOWCASE_BLOCKS[2]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-table-columns",
    label: "Фрагмент недели",
    meta: "· Пн и Ср"
  }), /*#__PURE__*/React.createElement("div", {
    className: "card showcase-card"
  }, /*#__PURE__*/React.createElement(ShowcaseScheduleGridSports, {
    sectionId: selectedSectionId
  }))), /*#__PURE__*/React.createElement("p", {
    className: "showcase-footer-hint"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${SPORTS_SHOWCASE_FOOTER.icon}`
  }), " ", /*#__PURE__*/React.createElement("strong", null, SPORTS_SHOWCASE_FOOTER.title), " — ", SPORTS_SHOWCASE_FOOTER.text));
}
function CoachShowcase() {
  const coachProps = {
    showcase: true
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: COACH_SHOWCASE_NOTES[0]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-whistle",
    label: "Расписание тренера"
  }), /*#__PURE__*/React.createElement(CoachView, Object.assign({
    showcaseFixedTab: "schedule"
  }, coachProps))), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: COACH_SHOWCASE_NOTES[1]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-clipboard-check",
    label: "Посещаемость"
  }), /*#__PURE__*/React.createElement(CoachView, Object.assign({
    showcaseFixedTab: "attendance"
  }, coachProps))));
}
function AdminShowcase() {
  const adminProps = {
    showcase: true
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: ADMIN_SHOWCASE_NOTES[0]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-chart-pie",
    label: "Обзор"
  }), /*#__PURE__*/React.createElement(AdminView, Object.assign({
    showcaseFixedTab: "dashboard"
  }, adminProps))), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: ADMIN_SHOWCASE_NOTES[1]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-layer-group",
    label: "Секции"
  }), /*#__PURE__*/React.createElement(AdminView, Object.assign({
    showcaseFixedTab: "sections"
  }, adminProps))));
}

// ═══════════════════════════════════════════
// COACH VIEW
// ═══════════════════════════════════════════
function CoachView({
  showcase = false,
  showcaseFixedTab = null
} = {}) {
  const [selectedSection, setSelectedSection] = useState("s1");
  const [mobileDay, setMobileDay] = useState(0);
  const [attendance, setAttendance] = useState({});
  const [activeTab, setActiveTab] = useState('schedule');
  const tab = showcaseFixedTab || activeTab;
  const nowInfo = getNowInfo();
  const section = SECTIONS.find(s => s.id === selectedSection);
  const sectionClients = CLIENTS.filter(c => c.sectionId === selectedSection);
  const sectionTrainings = ALL_TRAININGS.filter(t => t.sectionId === selectedSection);

  // Find next training
  const nextTraining = useMemo(() => {
    const now = new Date();
    const dow = now.getDay();
    const dayMap = [6, 0, 1, 2, 3, 4, 5];
    const today = dayMap[dow];
    const mins = now.getHours() * 60 + now.getMinutes();
    // Find today's upcoming
    let todayTrainings = sectionTrainings.filter(t => t.dayIndex === today).sort((a, b) => a.slotIndex - b.slotIndex);
    for (const t of todayTrainings) {
      const slot = TIME_SLOTS[t.slotIndex];
      if (slot) {
        const startMins = parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1]);
        if (startMins > mins) return {
          ...t,
          when: "Сегодня",
          time: slot.start
        };
      }
    }
    // Find next day
    for (let d = 1; d < 7; d++) {
      const nextDay = (today + d) % 7;
      const dayTrainings = sectionTrainings.filter(t => t.dayIndex === nextDay).sort((a, b) => a.slotIndex - b.slotIndex);
      if (dayTrainings.length > 0) {
        const t = dayTrainings[0];
        const slot = TIME_SLOTS[t.slotIndex];
        return {
          ...t,
          when: DAYS[nextDay],
          time: slot?.start || ""
        };
      }
    }
    return null;
  }, [sectionTrainings]);
  const toggleAttendance = (clientId, sessionId) => {
    const key = `${clientId}-${sessionId}`;
    setAttendance(prev => ({
      ...prev,
      [key]: prev[key] === 'present' ? 'absent' : prev[key] === 'absent' ? null : 'present'
    }));
  };
  const getAttendance = (clientId, sessionId) => {
    return attendance[`${clientId}-${sessionId}`] || null;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, (showcase ? DEMO_SECTIONS : SECTIONS).map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    className: `role-tab ${selectedSection === s.id ? 'active' : ''}`,
    onClick: () => setSelectedSection(s.id),
    style: selectedSection === s.id ? {
      background: s.gradient
    } : {}
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${s.icon}`
  }), " ", s.name))), !showcase && nextTraining && /*#__PURE__*/React.createElement("div", {
    className: "next-training"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nt-icon",
    style: {
      background: section?.gradient
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${section?.icon}`
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "nt-label"
  }, "Следующая тренировка"), /*#__PURE__*/React.createElement("div", {
    className: "nt-name"
  }, section?.name, " — ", nextTraining.group), /*#__PURE__*/React.createElement("div", {
    className: "nt-time"
  }, nextTraining.when, ", ", nextTraining.time))), !showcaseFixedTab && /*#__PURE__*/React.createElement("div", {
    className: "tab-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'schedule' ? 'active' : ''}`,
    onClick: () => setActiveTab('schedule')
  }, "Расписание"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'attendance' ? 'active' : ''}`,
    onClick: () => setActiveTab('attendance')
  }, "Посещаемость"), !showcase && /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'groups' ? 'active' : ''}`,
    onClick: () => setActiveTab('groups')
  }, "Группы")), tab === 'schedule' && /*#__PURE__*/React.createElement("div", null, showcase ? /*#__PURE__*/React.createElement("div", {
    className: "card showcase-card"
  }, /*#__PURE__*/React.createElement(ShowcaseScheduleGridSports, {
    sectionId: selectedSection
  })) : /*#__PURE__*/React.createElement("div", {
    className: "desktop-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-grid",
    style: {
      gridTemplateColumns: '80px repeat(7,1fr)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header",
    style: {
      gridTemplateColumns: '80px repeat(7,1fr)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DAYS.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `grid-header-cell ${nowInfo.currentDay === i ? 'today' : ''}`
  }, d))), TIME_SLOTS.map((slot, si) => /*#__PURE__*/React.createElement("div", {
    key: si,
    className: "grid-row",
    style: {
      gridTemplateColumns: '80px repeat(7,1fr)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start, /*#__PURE__*/React.createElement("br", null), slot.end)), DAYS.map((_, di) => {
    const trainings = sectionTrainings.filter(t => t.dayIndex === di && t.slotIndex === si);
    return /*#__PURE__*/React.createElement("div", {
      key: di,
      className: `day-cell ${nowInfo.currentDay === di ? 'today-col' : ''}`
    }, trainings.map(t => /*#__PURE__*/React.createElement("div", {
      key: t.group,
      className: "training-card",
      style: {
        borderLeft: `3px solid ${section?.color}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tc-name"
    }, t.group), /*#__PURE__*/React.createElement("div", {
      className: "tc-info"
    }, section?.trainer), /*#__PURE__*/React.createElement("div", {
      className: "tc-count"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users",
      style: {
        fontSize: 8
      }
    }), " ", sectionClients.length, "/", section?.maxStudents))));
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-day-tabs"
  }, DAYS.map((d, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: `mobile-day-tab ${mobileDay === i ? 'active' : ''}`,
    onClick: () => setMobileDay(i)
  }, d))), TIME_SLOTS.map((slot, si) => {
    const trainings = sectionTrainings.filter(t => t.dayIndex === mobileDay && t.slotIndex === si);
    if (trainings.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: si,
      className: "client-slot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cs-time"
    }, slot.start, "–", slot.end), trainings.map(t => /*#__PURE__*/React.createElement("div", {
      key: t.group
    }, /*#__PURE__*/React.createElement("div", {
      className: "cs-name",
      style: {
        color: section?.color
      }
    }, section?.name, " — ", t.group), /*#__PURE__*/React.createElement("div", {
      className: "cs-trainer"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-user",
      style: {
        marginRight: 4,
        fontSize: 10
      }
    }), section?.trainer))));
  }))), tab === 'attendance' && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Посещаемость — ", section?.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: '8px 12px',
      borderRadius: 8,
      background: 'var(--gray-50)',
      fontSize: 12,
      color: 'var(--gray-500)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-info-circle",
    style: {
      marginRight: 4
    }
  }), "Нажмите на кнопку для отметки: ✓ — присутствие, ✗ — отсутствие"), sectionClients.map(client => {
    const sessionId = `${selectedSection}-today`;
    const att = getAttendance(client.id, sessionId);
    return /*#__PURE__*/React.createElement("div", {
      key: client.id,
      className: "attendance-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "att-avatar"
    }, client.name.split(' ').map(n => n[0]).join('')), /*#__PURE__*/React.createElement("div", {
      className: "att-name"
    }, client.name, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--gray-400)',
        marginLeft: 8
      }
    }, client.age, " лет")), /*#__PURE__*/React.createElement("button", {
      className: `att-btn ${att === 'present' ? 'present' : ''}`,
      onClick: () => toggleAttendance(client.id, sessionId),
      title: "Присутствие"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-check"
    })), /*#__PURE__*/React.createElement("button", {
      className: `att-btn ${att === 'absent' ? 'absent' : ''}`,
      onClick: () => {
        const key = `${client.id}-${sessionId}`;
        setAttendance(prev => ({
          ...prev,
          [key]: prev[key] === 'absent' ? null : 'absent'
        }));
      },
      title: "Отсутствие"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-times"
    })));
  }))), tab === 'groups' && !showcase && /*#__PURE__*/React.createElement("div", null, ["Младшая", "Старшая", "Общая", "Дети", "Взрослые", "Утренний", "Основная"].map(groupName => {
    const groupTrainings = sectionTrainings.filter(t => t.group === groupName);
    if (groupTrainings.length === 0) return null;
    const groupClients = sectionClients.slice(0, Math.floor(sectionClients.length / groupTrainings.length) || sectionClients.length);
    return /*#__PURE__*/React.createElement("div", {
      key: groupName,
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
        gap: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: section?.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${section?.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 15,
        fontWeight: 700
      }
    }, groupName), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)'
      }
    }, "Расписание: ", groupTrainings.map(t => `${DAYS[t.dayIndex]} ${TIME_SLOTS[t.slotIndex]?.start}`).join(', ')))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)',
        marginBottom: 8
      }
    }, "Участники (", groupClients.length, "):"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
      }
    }, groupClients.map(c => /*#__PURE__*/React.createElement("span", {
      key: c.id,
      style: {
        padding: '3px 10px',
        borderRadius: 8,
        background: 'var(--gray-50)',
        fontSize: 12,
        fontWeight: 500
      }
    }, c.name)))));
  })));
}

// ═══════════════════════════════════════════
// CLIENT VIEW
// ═══════════════════════════════════════════
function ClientView() {
  const [activeTab, setActiveTab] = useState('browse');
  const [enrolledSections, setEnrolledSections] = useState(["s1", "s5"]);
  const [showTrialModal, setShowTrialModal] = useState(null);
  const [mobileDay, setMobileDay] = useState(0);
  const nowInfo = getNowInfo();
  const enrolledClients = CLIENTS.filter(c => enrolledSections.includes(c.sectionId));
  const myTrainings = ALL_TRAININGS.filter(t => enrolledSections.includes(t.sectionId));
  const enroll = sectionId => {
    if (!enrolledSections.includes(sectionId)) {
      setEnrolledSections([...enrolledSections, sectionId]);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'browse' ? 'active' : ''}`,
    onClick: () => setActiveTab('browse')
  }, "Секции"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'schedule' ? 'active' : ''}`,
    onClick: () => setActiveTab('schedule')
  }, "Моё расписание"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`,
    onClick: () => setActiveTab('subscriptions')
  }, "Абонементы")), activeTab === 'browse' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Доступные секции"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 16
    }
  }, SECTIONS.map(s => {
    const isEnrolled = enrolledSections.includes(s.id);
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      className: "section-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-icon",
      style: {
        background: s.gradient
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${s.icon}`
    })), /*#__PURE__*/React.createElement("h3", null, s.name), /*#__PURE__*/React.createElement("p", null, s.description), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-badge",
      style: {
        background: 'rgba(245,158,11,0.1)',
        color: '#d97706'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-user",
      style: {
        marginRight: 4
      }
    }), s.trainer), /*#__PURE__*/React.createElement("span", {
      className: "section-badge",
      style: {
        background: 'rgba(16,185,129,0.1)',
        color: '#059669'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users",
      style: {
        marginRight: 4
      }
    }), CLIENTS.filter(c => c.sectionId === s.id).length, "/", s.maxStudents), /*#__PURE__*/React.createElement("span", {
      className: "section-badge",
      style: {
        background: 'rgba(99,102,241,0.1)',
        color: '#4f46e5'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-child",
      style: {
        marginRight: 4
      }
    }), s.age)), isEnrolled ? /*#__PURE__*/React.createElement("span", {
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
    }), "Вы записаны") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => enroll(s.id)
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-plus"
    }), " Записаться"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      onClick: () => setShowTrialModal(s.id)
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-eye"
    }), " Пробное")));
  })), showTrialModal && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 24,
      maxWidth: 400,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Записаться на пробное занятие"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)',
      marginBottom: 16
    }
  }, "Секция: ", SECTIONS.find(s => s.id === showTrialModal)?.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginBottom: 16
    }
  }, ALL_TRAININGS.filter(t => t.sectionId === showTrialModal).slice(0, 4).map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: 10,
      borderRadius: 10,
      border: '1px solid var(--gray-200)',
      cursor: 'pointer',
      transition: 'var(--transition)'
    },
    className: "client-slot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cs-time"
  }, DAYS[t.dayIndex], ", ", TIME_SLOTS[t.slotIndex]?.start), /*#__PURE__*/React.createElement("div", {
    className: "cs-name",
    style: {
      fontSize: 13
    }
  }, t.group)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-success",
    onClick: () => {
      enroll(showTrialModal);
      setShowTrialModal(null);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-check"
  }), " Записаться"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setShowTrialModal(null)
  }, "Закрыть"))))), activeTab === 'schedule' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Моё расписание"), /*#__PURE__*/React.createElement("div", {
    className: "desktop-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-grid",
    style: {
      gridTemplateColumns: '80px repeat(7,1fr)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header",
    style: {
      gridTemplateColumns: '80px repeat(7,1fr)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DAYS.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `grid-header-cell ${nowInfo.currentDay === i ? 'today' : ''}`
  }, d))), TIME_SLOTS.map((slot, si) => /*#__PURE__*/React.createElement("div", {
    key: si,
    className: "grid-row",
    style: {
      gridTemplateColumns: '80px repeat(7,1fr)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start, /*#__PURE__*/React.createElement("br", null), slot.end)), DAYS.map((_, di) => {
    const trainings = myTrainings.filter(t => t.dayIndex === di && t.slotIndex === si);
    return /*#__PURE__*/React.createElement("div", {
      key: di,
      className: `day-cell ${nowInfo.currentDay === di ? 'today-col' : ''}`
    }, trainings.map(t => {
      const sec = SECTIONS.find(s => s.id === t.sectionId);
      return /*#__PURE__*/React.createElement("div", {
        key: t.group,
        className: "training-card",
        style: {
          borderLeft: `3px solid ${sec?.color}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "tc-name",
        style: {
          color: sec?.color
        }
      }, sec?.name), /*#__PURE__*/React.createElement("div", {
        className: "tc-info"
      }, t.group));
    }));
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-day-tabs"
  }, DAYS.map((d, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: `mobile-day-tab ${mobileDay === i ? 'active' : ''}`,
    onClick: () => setMobileDay(i)
  }, d))), TIME_SLOTS.map((slot, si) => {
    const trainings = myTrainings.filter(t => t.dayIndex === mobileDay && t.slotIndex === si);
    if (trainings.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: si,
      className: "client-slot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cs-time"
    }, slot.start, "–", slot.end), trainings.map(t => {
      const sec = SECTIONS.find(s => s.id === t.sectionId);
      return /*#__PURE__*/React.createElement("div", {
        key: t.group
      }, /*#__PURE__*/React.createElement("div", {
        className: "cs-name",
        style: {
          color: sec?.color
        }
      }, sec?.name, " — ", t.group), /*#__PURE__*/React.createElement("div", {
        className: "cs-trainer"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-user",
        style: {
          marginRight: 4,
          fontSize: 10
        }
      }), sec?.trainer));
    }));
  }))), activeTab === 'subscriptions' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Мои абонементы"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 16
    }
  }, enrolledSections.map(sid => {
    const sec = SECTIONS.find(s => s.id === sid);
    const clients = CLIENTS.filter(c => c.sectionId === sid);
    const sub = clients[0]?.subscription || {
      total: 12,
      used: 0
    };
    const remaining = sub.total - sub.used;
    const pct = Math.round(sub.used / sub.total * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: sid,
      className: "sub-card"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: sec?.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 16
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${sec?.icon}`
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "sub-name"
    }, sec?.name), /*#__PURE__*/React.createElement("div", {
      className: "sub-visits"
    }, "Осталось ", remaining, " из ", sub.total, " занятий"))), /*#__PURE__*/React.createElement("div", {
      className: "sub-progress"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sub-progress-bar",
      style: {
        width: `${pct}%`
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 8,
        fontSize: 11,
        color: 'var(--gray-400)'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Использовано: ", sub.used), /*#__PURE__*/React.createElement("span", null, pct, "%")), remaining <= 2 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        padding: '6px 10px',
        borderRadius: 8,
        background: '#fef3c7',
        border: '1px solid #fde68a',
        fontSize: 11,
        color: '#92400e',
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-exclamation-triangle",
      style: {
        marginRight: 4
      }
    }), "Абонемент заканчивается! Продлите."));
  }))));
}

// ═══════════════════════════════════════════
// ADMIN VIEW
// ═══════════════════════════════════════════
function AdminView({
  showcase = false,
  showcaseFixedTab = null
} = {}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const tab = showcaseFixedTab || activeTab;
  const stats = useMemo(() => ({
    totalClients: CLIENTS.length,
    totalSections: SECTIONS.length,
    totalTrainings: ALL_TRAININGS.length,
    activeSubs: CLIENTS.filter(c => c.subscription.total - c.subscription.used > 0).length,
    expiringSubs: CLIENTS.filter(c => {
      const r = c.subscription.total - c.subscription.used;
      return r > 0 && r <= 2;
    }).length,
    expiredSubs: CLIENTS.filter(c => c.subscription.total - c.subscription.used <= 0).length
  }), []);
  const sectionStats = useMemo(() => {
    return SECTIONS.map(s => {
      const clients = CLIENTS.filter(c => c.sectionId === s.id);
      const trainings = ALL_TRAININGS.filter(t => t.sectionId === s.id);
      const totalVisits = clients.reduce((sum, c) => sum + c.subscription.used, 0);
      const totalPossible = clients.reduce((sum, c) => sum + c.subscription.total, 0);
      return {
        ...s,
        clients: clients.length,
        trainings: trainings.length,
        avgAttendance: totalPossible > 0 ? Math.round(totalVisits / totalPossible * 100) : 0
      };
    });
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, (!showcaseFixedTab || tab === 'dashboard') && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
      gap: 16,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.totalClients), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Клиентов")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.totalSections), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Секций")), !showcase && /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.totalTrainings), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Тренировок/нед")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value",
    style: {
      background: 'linear-gradient(135deg,#10b981,#059669)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text'
    }
  }, stats.activeSubs), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, showcase ? "Активных абонементов" : "Активных абонементов")), !showcase && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value",
    style: {
      background: 'linear-gradient(135deg,#f59e0b,#d97706)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text'
    }
  }, stats.expiringSubs), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Заканчивающихся")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value",
    style: {
      background: 'linear-gradient(135deg,#ef4444,#dc2626)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text'
    }
  }, stats.expiredSubs), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Истёкших")))), !showcaseFixedTab && /*#__PURE__*/React.createElement("div", {
    className: "tab-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`,
    onClick: () => setActiveTab('dashboard')
  }, "Обзор"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'sections' ? 'active' : ''}`,
    onClick: () => setActiveTab('sections')
  }, "Секции"), !showcase && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`,
    onClick: () => setActiveTab('subscriptions')
  }, "Абонементы"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'reports' ? 'active' : ''}`,
    onClick: () => setActiveTab('reports')
  }, "Отчёты"))), tab === 'dashboard' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Обзор по секциям"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 16
    }
  }, sectionStats.filter(s => !showcase || DEMO_SECTIONS.some(d => d.id === s.id)).map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: "card",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: s.gradient
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
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: s.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${s.icon}`
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--gray-500)'
    }
  }, s.trainer))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      borderRadius: 8,
      background: 'var(--gray-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 18,
      color: s.color
    }
  }, s.clients), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--gray-500)'
    }
  }, "клиентов")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      borderRadius: 8,
      background: 'var(--gray-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 18,
      color: s.color
    }
  }, s.trainings), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--gray-500)'
    }
  }, "тренировок"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11,
      color: 'var(--gray-500)',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Ср. посещаемость"), /*#__PURE__*/React.createElement("span", null, s.avgAttendance, "%")), /*#__PURE__*/React.createElement("div", {
    className: "sub-progress"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sub-progress-bar",
    style: {
      width: `${s.avgAttendance}%`,
      background: s.gradient
    }
  })))))))), tab === 'sections' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Управление секциями"), (showcase ? DEMO_SECTIONS : SECTIONS).map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
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
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 12,
      background: s.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 22
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${s.icon}`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, s.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)'
    }
  }, s.description), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-badge",
    style: {
      background: 'rgba(245,158,11,0.1)',
      color: '#d97706'
    }
  }, s.trainer), /*#__PURE__*/React.createElement("span", {
    className: "section-badge",
    style: {
      background: 'rgba(16,185,129,0.1)',
      color: '#059669'
    }
  }, "Макс. ", s.maxStudents, " чел."), /*#__PURE__*/React.createElement("span", {
    className: "section-badge",
    style: {
      background: 'rgba(99,102,241,0.1)',
      color: '#4f46e5'
    }
  }, "Возраст: ", s.age))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-edit"
  }), " Редактировать")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--gray-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 8
    }
  }, "Расписание:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, ALL_TRAININGS.filter(t => t.sectionId === s.id).map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      padding: '3px 8px',
      borderRadius: 6,
      background: 'var(--gray-50)',
      fontSize: 11,
      fontWeight: 500
    }
  }, DAYS[t.dayIndex], " ", TIME_SLOTS[t.slotIndex]?.start, " (", t.group, ")")))))))), !showcase && tab === 'subscriptions' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Управление абонементами"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 16
    }
  }, CLIENTS.map(client => {
    const sec = SECTIONS.find(s => s.id === client.sectionId);
    const remaining = client.subscription.total - client.subscription.used;
    const pct = Math.round(client.subscription.used / client.subscription.total * 100);
    const isExpiring = remaining > 0 && remaining <= 2;
    const isExpired = remaining <= 0;
    return /*#__PURE__*/React.createElement("div", {
      key: client.id,
      className: "sub-card",
      style: isExpiring ? {
        borderColor: '#fde68a'
      } : isExpired ? {
        borderColor: '#fecaca'
      } : {}
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "att-avatar",
      style: {
        background: sec ? `${sec.color}20` : 'var(--gray-100)',
        color: sec?.color || 'var(--gray-500)',
        fontSize: 11
      }
    }, client.name.split(' ').map(n => n[0]).join('')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 13
      }
    }, client.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--gray-400)'
      }
    }, sec?.name, " • ", client.age, " лет"))), /*#__PURE__*/React.createElement("div", {
      className: "sub-progress"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sub-progress-bar",
      style: {
        width: `${pct}%`,
        background: isExpired ? '#ef4444' : isExpiring ? '#f59e0b' : sec?.gradient || 'var(--gradient-primary)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 6,
        fontSize: 11,
        color: 'var(--gray-400)'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Использовано: ", client.subscription.used, "/", client.subscription.total), /*#__PURE__*/React.createElement("span", {
      style: {
        color: isExpired ? 'var(--error)' : isExpiring ? 'var(--warning)' : 'var(--success)',
        fontWeight: 600
      }
    }, isExpired ? 'Истёк' : isExpiring ? 'Заканчивается' : 'Активен')));
  }))), !showcase && tab === 'reports' && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Отчёт по посещаемости"), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: auto
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: '2px solid var(--gray-200)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 10,
      textAlign: 'left',
      fontWeight: 600,
      color: 'var(--gray-500)'
    }
  }, "Секция"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 10,
      textAlign: 'center',
      fontWeight: 600,
      color: 'var(--gray-500)'
    }
  }, "Клиентов"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 10,
      textAlign: 'center',
      fontWeight: 600,
      color: 'var(--gray-500)'
    }
  }, "Тренировок"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 10,
      textAlign: 'center',
      fontWeight: 600,
      color: 'var(--gray-500)'
    }
  }, "Ср. посещ."), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 10,
      textAlign: 'center',
      fontWeight: 600,
      color: 'var(--gray-500)'
    }
  }, "Выручка (проп.)"))), /*#__PURE__*/React.createElement("tbody", null, sectionStats.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    style: {
      borderBottom: '1px solid var(--gray-100)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: s.color
    }
  }), s.name)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center'
    }
  }, s.clients), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center'
    }
  }, s.trainings), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: s.avgAttendance > 70 ? 'var(--success)' : s.avgAttendance > 40 ? 'var(--warning)' : 'var(--error)'
    }
  }, s.avgAttendance, "%")), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center',
      fontWeight: 600
    }
  }, s.clients * 2500, " ₽")))), /*#__PURE__*/React.createElement("tfoot", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderTop: '2px solid var(--gray-200)',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10
    }
  }, "Итого"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center'
    }
  }, stats.totalClients), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center'
    }
  }, stats.totalTrainings), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center'
    }
  }, Math.round(sectionStats.reduce((s, x) => s + x.avgAttendance, 0) / sectionStats.length), "%"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: 10,
      textAlign: 'center'
    }
  }, stats.totalClients * 2500, " ₽"))))))));
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
function App() {
  const [role, setRole] = useState('client');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const roles = [{
    key: 'client',
    label: 'Клиент',
    icon: 'fa-user'
  }, {
    key: 'coach',
    label: 'Тренер',
    icon: 'fa-whistle'
  }, {
    key: 'admin',
    label: 'Администрация',
    icon: 'fa-shield-alt'
  }];
  const introByRole = {
    client: /*#__PURE__*/React.createElement(React.Fragment, null, "Три блока: ", /*#__PURE__*/React.createElement("strong", null, "пояснение слева"), ", пример интерфейса справа. Во втором блоке можно переключить секцию."),
    coach: /*#__PURE__*/React.createElement(React.Fragment, null, "Расписание и посещаемость тренера — ", /*#__PURE__*/React.createElement("strong", null, "отдельными блоками"), " с пояснениями слева."),
    admin: /*#__PURE__*/React.createElement(React.Fragment, null, "Обзор зала и загрузка секций — ", /*#__PURE__*/React.createElement("strong", null, "по блокам"), ", как в кабинете администратора.")
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
  }, "Визуальный пример · Спортивные секции"))), /*#__PURE__*/React.createElement("div", {
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
  }), " Вернуться на сайт"), /*#__PURE__*/React.createElement("p", {
    className: "showcase-intro"
  }, introByRole[role]), role === 'client' && /*#__PURE__*/React.createElement(ClientShowcase, null), role === 'coach' && /*#__PURE__*/React.createElement(CoachShowcase, null), role === 'admin' && /*#__PURE__*/React.createElement(AdminShowcase, null))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));