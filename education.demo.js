const {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} = React;

// ═══════════════════════════════════════════════
// PRNG: mulberry32 seeded by FNV-1a hash
// ═══════════════════════════════════════════════
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
function mulberry32(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = state + 0x6d2b79f5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════
const TIME_SLOTS = [{
  index: 0,
  start: "08:20",
  end: "09:50",
  label: "1 пара",
  startMin: 500,
  endMin: 590
}, {
  index: 1,
  start: "10:00",
  end: "11:30",
  label: "2 пара",
  startMin: 600,
  endMin: 690
}, {
  index: 2,
  start: "11:40",
  end: "13:10",
  label: "3 пара",
  startMin: 700,
  endMin: 790
}, {
  index: 3,
  start: "13:30",
  end: "15:00",
  label: "4 пара",
  startMin: 810,
  endMin: 900
}, {
  index: 4,
  start: "15:10",
  end: "16:40",
  label: "5 пара",
  startMin: 910,
  endMin: 1000
}, {
  index: 5,
  start: "16:50",
  end: "18:20",
  label: "6 пара",
  startMin: 1010,
  endMin: 1100
}, {
  index: 6,
  start: "18:30",
  end: "20:00",
  label: "7 пара",
  startMin: 1110,
  endMin: 1200
}, {
  index: 7,
  start: "20:10",
  end: "21:40",
  label: "8 пара",
  startMin: 1210,
  endMin: 1300
}];
const DAYS = [{
  key: "mon",
  short: "Пн",
  full: "Понедельник"
}, {
  key: "tue",
  short: "Вт",
  full: "Вторник"
}, {
  key: "wed",
  short: "Ср",
  full: "Среда"
}, {
  key: "thu",
  short: "Чт",
  full: "Четверг"
}, {
  key: "fri",
  short: "Пт",
  full: "Пятница"
}, {
  key: "sat",
  short: "Сб",
  full: "Суббота"
}];
// Demoplan: compact demo window (see docs/Demoplan.md)
const DEMO_DAY_KEYS = ["mon", "wed"];
const DEMO_DAYS = DAYS.filter((d) => DEMO_DAY_KEYS.includes(d.key));
const DEMO_SLOT_COUNT = 2;
const DEMO_SLOTS = TIME_SLOTS.slice(0, DEMO_SLOT_COUNT);
function pickDemoDay(rng) {
  return DEMO_DAY_KEYS[Math.floor(rng() * DEMO_DAY_KEYS.length)];
}
const GROUPS = [{
  code: "ОЭ-11",
  direction: "Экономика и право",
  course: 1,
  label: "ОЭ-11 (1 курс)"
}, {
  code: "ОЭ-12",
  direction: "Экономика и право",
  course: 1,
  label: "ОЭ-12 (1 курс)"
}, {
  code: "ОЭ-21",
  direction: "Экономика и право",
  course: 2,
  label: "ОЭ-21 (2 курс)"
}, {
  code: "ОЭ-22",
  direction: "Экономика и право",
  course: 2,
  label: "ОЭ-22 (2 курс)"
}, {
  code: "ОЭ-31",
  direction: "Экономика и право",
  course: 3,
  label: "ОЭ-31 (3 курс)"
}, {
  code: "ОЭ-32",
  direction: "Экономика и право",
  course: 3,
  label: "ОЭ-32 (3 курс)"
}];
const DEMO_GROUPS = GROUPS.filter((g) => g.code === "ОЭ-11" || g.code === "ОЭ-12");
const TEACHERS = [{
  id: "t1",
  surname: "Буфеев",
  initials: "И.В.",
  full: "Буфеев И.В.",
  maxDaily: 4,
  maxWeekly: 18
}, {
  id: "t2",
  surname: "Малый",
  initials: "С.Н.",
  full: "Малый С.Н.",
  maxDaily: 4,
  maxWeekly: 18
}, {
  id: "t3",
  surname: "Карпова",
  initials: "Е.А.",
  full: "Карпова Е.А.",
  maxDaily: 4,
  maxWeekly: 18
}, {
  id: "t4",
  surname: "Смирнов",
  initials: "А.П.",
  full: "Смирнов А.П.",
  maxDaily: 4,
  maxWeekly: 20
}, {
  id: "t5",
  surname: "Лебедева",
  initials: "Н.Г.",
  full: "Лебедева Н.Г.",
  maxDaily: 3,
  maxWeekly: 16
}, {
  id: "t6",
  surname: "Козлов",
  initials: "Д.В.",
  full: "Козлов Д.В.",
  maxDaily: 4,
  maxWeekly: 18
}, {
  id: "t7",
  surname: "Новикова",
  initials: "М.И.",
  full: "Новикова М.И.",
  maxDaily: 4,
  maxWeekly: 20
}, {
  id: "t8",
  surname: "Волков",
  initials: "С.А.",
  full: "Волков С.А.",
  maxDaily: 3,
  maxWeekly: 16
}, {
  id: "t9",
  surname: "Морозова",
  initials: "Т.К.",
  full: "Морозова Т.К.",
  maxDaily: 4,
  maxWeekly: 18
}, {
  id: "t10",
  surname: "Соколов",
  initials: "В.М.",
  full: "Соколов В.М.",
  maxDaily: 4,
  maxWeekly: 18
}, {
  id: "t11",
  surname: "Зайцева",
  initials: "Л.Р.",
  full: "Зайцева Л.Р.",
  maxDaily: 3,
  maxWeekly: 16
}, {
  id: "t12",
  surname: "Павлов",
  initials: "Г.Е.",
  full: "Павлов Г.Е.",
  maxDaily: 4,
  maxWeekly: 20
}];
const SUBJECTS = [{
  id: "s1",
  name: "Математика",
  short: "Матем.",
  type: "pr",
  color: "#6366f1"
}, {
  id: "s2",
  name: "Экономика",
  short: "Экон.",
  type: "lek",
  color: "#8b5cf6"
}, {
  id: "s3",
  name: "Правоведение",
  short: "Право",
  type: "lek",
  color: "#06b6d4"
}, {
  id: "s4",
  name: "Физкультура",
  short: "Физ-ра",
  type: "pr",
  color: "#10b981"
}, {
  id: "s5",
  name: "Информатика",
  short: "Информ.",
  type: "pr",
  color: "#f59e0b"
}, {
  id: "s6",
  name: "Философия",
  short: "Филос.",
  type: "lek",
  color: "#ec4899"
}, {
  id: "s7",
  name: "Английский язык",
  short: "Англ.",
  type: "pr",
  color: "#14b8a6"
}, {
  id: "s8",
  name: "Статистика",
  short: "Стат.",
  type: "lek",
  color: "#f97316"
}, {
  id: "s9",
  name: "Бухгалтерский учёт",
  short: "Бухуч.",
  type: "lek",
  color: "#ef4444"
}, {
  id: "s10",
  name: "Менеджмент",
  short: "Мендж.",
  type: "lek",
  color: "#a855f7"
}, {
  id: "s11",
  name: "История",
  short: "Истор.",
  type: "lek",
  color: "#0ea5e9"
}, {
  id: "s12",
  name: "Финансы",
  short: "Фин.",
  type: "lek",
  color: "#84cc16"
}, {
  id: "s13",
  name: "Маркетинг",
  short: "Марк.",
  type: "lek",
  color: "#d946ef"
}, {
  id: "s14",
  name: "Лаб. информатика",
  short: "Лаб.Инф.",
  type: "pr",
  color: "#eab308"
}, {
  id: "s15",
  name: "Гражданское право",
  short: "Гр.право",
  type: "lek",
  color: "#22d3ee"
}, {
  id: "s16",
  name: "Экология",
  short: "Экол.",
  type: "lek",
  color: "#34d399"
}];
const ROOMS = [{
  id: "r1",
  name: "21",
  capacity: 30,
  type: "lecture"
}, {
  id: "r2",
  name: "22",
  capacity: 30,
  type: "lecture"
}, {
  id: "r3",
  name: "23",
  capacity: 30,
  type: "lecture"
}, {
  id: "r4",
  name: "24",
  capacity: 25,
  type: "lecture"
}, {
  id: "r5",
  name: "25",
  capacity: 25,
  type: "lecture"
}, {
  id: "r6",
  name: "31",
  capacity: 30,
  type: "lecture"
}, {
  id: "r7",
  name: "32",
  capacity: 30,
  type: "lecture"
}, {
  id: "r8",
  name: "33",
  capacity: 25,
  type: "lecture"
}, {
  id: "r9",
  name: "34",
  capacity: 25,
  type: "lecture"
}, {
  id: "r10",
  name: "35",
  capacity: 20,
  type: "lecture"
}, {
  id: "r11",
  name: "Лаб-1",
  capacity: 15,
  type: "lab"
}, {
  id: "r12",
  name: "Лаб-2",
  capacity: 15,
  type: "lab"
}];

// Lookup maps
const subjectMap = new Map(SUBJECTS.map(s => [s.id, s]));
const teacherMap = new Map(TEACHERS.map(t => [t.id, t]));
const roomMap = new Map(ROOMS.map(r => [r.id, r]));
const groupMap = new Map(GROUPS.map(g => [g.code, g]));

// Teacher-subject assignments
const TEACHER_SUBJECTS = [{
  teacherId: "t1",
  subjectId: "s1",
  groupCodes: ["ОЭ-11", "ОЭ-12"]
}, {
  teacherId: "t2",
  subjectId: "s5",
  groupCodes: ["ОЭ-11", "ОЭ-12"]
}, {
  teacherId: "t3",
  subjectId: "s7",
  groupCodes: ["ОЭ-11", "ОЭ-12"]
}, {
  teacherId: "t4",
  subjectId: "s11",
  groupCodes: ["ОЭ-11", "ОЭ-12"]
}, {
  teacherId: "t5",
  subjectId: "s4",
  groupCodes: ["ОЭ-11", "ОЭ-12"]
}, {
  teacherId: "t6",
  subjectId: "s6",
  groupCodes: ["ОЭ-11", "ОЭ-12"]
}, {
  teacherId: "t1",
  subjectId: "s8",
  groupCodes: ["ОЭ-21", "ОЭ-22"]
}, {
  teacherId: "t7",
  subjectId: "s2",
  groupCodes: ["ОЭ-21", "ОЭ-22"]
}, {
  teacherId: "t8",
  subjectId: "s9",
  groupCodes: ["ОЭ-21", "ОЭ-22"]
}, {
  teacherId: "t9",
  subjectId: "s10",
  groupCodes: ["ОЭ-21", "ОЭ-22"]
}, {
  teacherId: "t5",
  subjectId: "s4",
  groupCodes: ["ОЭ-21", "ОЭ-22"]
}, {
  teacherId: "t2",
  subjectId: "s14",
  groupCodes: ["ОЭ-21", "ОЭ-22"]
}, {
  teacherId: "t10",
  subjectId: "s12",
  groupCodes: ["ОЭ-31", "ОЭ-32"]
}, {
  teacherId: "t11",
  subjectId: "s13",
  groupCodes: ["ОЭ-31", "ОЭ-32"]
}, {
  teacherId: "t12",
  subjectId: "s3",
  groupCodes: ["ОЭ-31", "ОЭ-32"]
}, {
  teacherId: "t7",
  subjectId: "s2",
  groupCodes: ["ОЭ-31", "ОЭ-32"]
}, {
  teacherId: "t3",
  subjectId: "s15",
  groupCodes: ["ОЭ-31", "ОЭ-32"]
}, {
  teacherId: "t6",
  subjectId: "s16",
  groupCodes: ["ОЭ-31", "ОЭ-32"]
}];

// ═══════════════════════════════════════════════
// Schedule generation (deterministic)
// ═══════════════════════════════════════════════
let _cellCounter = 0;
function nextCellId() {
  return `cell-${++_cellCounter}`;
}
function generateSchedule(seed = "planovo-demo-2025") {
  _cellCounter = 0;
  const rng = mulberry32(fnv1a(seed));
  const cells = [];
  const LECTURE_ROOMS = ROOMS.filter(r => r.type === "lecture").map(r => r.id);
  const LAB_ROOMS = ROOMS.filter(r => r.type === "lab").map(r => r.id);
  const teacherDailyLoad = {};
  for (const t of TEACHERS) {
    teacherDailyLoad[t.id] = {};
    for (const d of DAYS) teacherDailyLoad[t.id][d.key] = 0;
  }
  const groupDailyLoad = {};
  for (const g of GROUPS) {
    groupDailyLoad[g.code] = {};
    for (const d of DAYS) groupDailyLoad[g.code][d.key] = 0;
  }
  const teacherSlotOccupied = {};
  for (const t of TEACHERS) teacherSlotOccupied[t.id] = new Set();
  function pickRoom(subjectId) {
    const s = subjectMap.get(subjectId);
    if (s && (s.id === "s14" || s.name.toLowerCase().includes("лаб"))) return LAB_ROOMS[Math.floor(rng() * LAB_ROOMS.length)];
    return LECTURE_ROOMS[Math.floor(rng() * LECTURE_ROOMS.length)];
  }
  for (const tsa of TEACHER_SUBJECTS) {
    const {
      teacherId,
      subjectId,
      groupCodes
    } = tsa;
    const teacher = teacherMap.get(teacherId);
    for (const groupCode of groupCodes) {
      const useParity = rng() < 0.25;
      const parities = useParity ? rng() < 0.5 ? ["even"] : ["odd"] : ["even", "odd"];
      let placed = false;
      let attempt = 0;
      while (!placed && attempt < 50) {
        attempt++;
        const dayKey = pickDemoDay(rng);
        const maxSlot = DEMO_SLOT_COUNT;
        const slotIndex = Math.floor(rng() * maxSlot);
        if ((teacherDailyLoad[teacherId][dayKey] || 0) >= teacher.maxDaily) continue;
        const currentWeekly = Object.values(teacherDailyLoad[teacherId]).reduce((a, b) => a + b, 0);
        if (currentWeekly >= teacher.maxWeekly) break;
        if ((groupDailyLoad[groupCode][dayKey] || 0) >= DEMO_SLOT_COUNT) continue;
        let slotOk = true;
        for (const p of parities) {
          if (teacherSlotOccupied[teacherId].has(`${dayKey}:${slotIndex}:${p}`)) {
            slotOk = false;
            break;
          }
        }
        if (!slotOk) continue;
        const existing = cells.find(c => c.groupCode === groupCode && c.dayKey === dayKey && c.slotIndex === slotIndex && parities.includes(c.parity));
        if (existing) continue;
        const roomId = pickRoom(subjectId);
        for (const parity of parities) {
          cells.push({
            id: nextCellId(),
            groupCode,
            dayKey,
            slotIndex,
            parity,
            subjectId,
            teacherId,
            roomId,
            combined: false
          });
          teacherSlotOccupied[teacherId].add(`${dayKey}:${slotIndex}:${parity}`);
        }
        teacherDailyLoad[teacherId][dayKey] = (teacherDailyLoad[teacherId][dayKey] || 0) + 1;
        groupDailyLoad[groupCode][dayKey] = (groupDailyLoad[groupCode][dayKey] || 0) + 1;
        placed = true;
      }
    }
  }

  // Combined pairs
  const combinedPairs = [[["ОЭ-11", "ОЭ-12"], {
    subjectId: "s2",
    teacherId: "t7"
  }], [["ОЭ-21", "ОЭ-22"], {
    subjectId: "s11",
    teacherId: "t4"
  }], [["ОЭ-31", "ОЭ-32"], {
    subjectId: "s6",
    teacherId: "t6"
  }]];
  for (const [groups, info] of combinedPairs) {
    const dayKey = pickDemoDay(rng);
    const slotIndex = Math.floor(rng() * DEMO_SLOT_COUNT);
    const roomId = pickRoom(info.subjectId);
    const combinedKey = `combined-${groups[0]}-${groups[1]}-${info.subjectId}`;
    for (const g of groups) {
      const idx = cells.findIndex(c => c.groupCode === g && c.dayKey === dayKey && c.slotIndex === slotIndex);
      if (idx >= 0) {
        const removed = cells.splice(idx, 1)[0];
        teacherSlotOccupied[removed.teacherId]?.delete(`${removed.dayKey}:${removed.slotIndex}:${removed.parity}`);
      }
    }
    for (const parity of ["even", "odd"]) {
      const tSlotKey = `${dayKey}:${slotIndex}:${parity}`;
      if (!teacherSlotOccupied[info.teacherId].has(tSlotKey)) {
        for (const groupCode of groups) {
          cells.push({
            id: nextCellId(),
            groupCode,
            dayKey,
            slotIndex,
            parity,
            subjectId: info.subjectId,
            teacherId: info.teacherId,
            roomId,
            combined: true,
            combinedKey
          });
        }
        teacherSlotOccupied[info.teacherId].add(tSlotKey);
      }
    }
  }

  // Parity-only subjects
  const parityOnly = [{
    groupCode: "ОЭ-11",
    subjectId: "s14",
    teacherId: "t2"
  }, {
    groupCode: "ОЭ-12",
    subjectId: "s14",
    teacherId: "t2"
  }, {
    groupCode: "ОЭ-21",
    subjectId: "s3",
    teacherId: "t12"
  }, {
    groupCode: "ОЭ-22",
    subjectId: "s3",
    teacherId: "t12"
  }, {
    groupCode: "ОЭ-31",
    subjectId: "s9",
    teacherId: "t8"
  }, {
    groupCode: "ОЭ-32",
    subjectId: "s9",
    teacherId: "t8"
  }];
  for (const pos of parityOnly) {
    const parity = rng() < 0.5 ? "even" : "odd";
    const dayKey = pickDemoDay(rng);
    const slotIndex = Math.floor(rng() * DEMO_SLOT_COUNT);
    const roomId = pickRoom(pos.subjectId);
    const existing = cells.find(c => c.groupCode === pos.groupCode && c.dayKey === dayKey && c.slotIndex === slotIndex && c.parity === parity);
    if (existing) continue;
    const tSlotKey = `${dayKey}:${slotIndex}:${parity}`;
    if (teacherSlotOccupied[pos.teacherId].has(tSlotKey)) continue;
    cells.push({
      id: nextCellId(),
      groupCode: pos.groupCode,
      dayKey,
      slotIndex,
      parity,
      subjectId: pos.subjectId,
      teacherId: pos.teacherId,
      roomId,
      combined: false
    });
    teacherSlotOccupied[pos.teacherId].add(tSlotKey);
  }
  return cells;
}
function generateAvailability(seed = "planovo-avail-2025") {
  const rng = mulberry32(fnv1a(seed));
  const result = {};
  for (const teacher of TEACHERS) {
    const blockedSlots = new Set();
    const numBlocked = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < numBlocked; i++) {
      blockedSlots.add(`${pickDemoDay(rng)}:${Math.floor(rng() * DEMO_SLOT_COUNT)}`);
    }
    const cells = [];
    for (const day of DEMO_DAYS) {
      for (let si = 0; si < DEMO_SLOT_COUNT; si++) {
        if (!blockedSlots.has(`${day.key}:${si}`)) {
          cells.push({
            dayKey: day.key,
            slotIndex: si,
            parity: "even"
          });
          cells.push({
            dayKey: day.key,
            slotIndex: si,
            parity: "odd"
          });
        }
      }
    }
    result[teacher.id] = {
      teacherId: teacher.id,
      cells,
      submittedParities: ["even", "odd"]
    };
  }
  return result;
}

// ═══════════════════════════════════════════════
// Build schedule from cells
// ═══════════════════════════════════════════════
function buildEmptyWeek() {
  const week = {};
  for (const d of DAYS) {
    week[d.key] = {};
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      week[d.key][i] = {
        even: null,
        odd: null
      };
    }
  }
  return week;
}
function buildGroupSchedule(cells, groupCode) {
  const week = buildEmptyWeek();
  const groupCells = cells.filter(c => c.groupCode === groupCode);
  const combinedKeyGroups = {};
  for (const cell of cells) {
    if (cell.combinedKey) {
      if (!combinedKeyGroups[cell.combinedKey]) combinedKeyGroups[cell.combinedKey] = [];
      if (!combinedKeyGroups[cell.combinedKey].includes(cell.groupCode)) combinedKeyGroups[cell.combinedKey].push(cell.groupCode);
    }
  }
  for (const cell of groupCells) {
    const subject = subjectMap.get(cell.subjectId);
    const teacher = teacherMap.get(cell.teacherId);
    const room = roomMap.get(cell.roomId);
    if (!subject || !teacher || !room) continue;
    const extraGroups = cell.combinedKey ? combinedKeyGroups[cell.combinedKey] : undefined;
    week[cell.dayKey][cell.slotIndex][cell.parity] = {
      subject,
      teacher,
      room,
      parity: cell.parity,
      combined: cell.combined,
      groups: extraGroups
    };
  }
  return week;
}
function buildTeacherSchedule(cells, teacherId) {
  const week = buildEmptyWeek();
  const teacherCells = cells.filter(c => c.teacherId === teacherId);
  for (const cell of teacherCells) {
    const subject = subjectMap.get(cell.subjectId);
    const teacher = teacherMap.get(cell.teacherId);
    const room = roomMap.get(cell.roomId);
    if (!subject || !teacher || !room) continue;
    const sameSlotCells = cells.filter(c2 => c2.dayKey === cell.dayKey && c2.slotIndex === cell.slotIndex && c2.parity === cell.parity && c2.teacherId === teacherId);
    const groupCodes = [...new Set(sameSlotCells.map(c => c.groupCode))];
    week[cell.dayKey][cell.slotIndex][cell.parity] = {
      subject,
      teacher,
      room,
      parity: cell.parity,
      combined: cell.combined,
      groups: groupCodes
    };
  }
  return week;
}
function getConflicts(cells, availabilities) {
  const conflicts = [];
  const slotMap = {};
  for (const cell of cells) {
    const key = `${cell.dayKey}:${cell.slotIndex}:${cell.parity}`;
    if (!slotMap[key]) slotMap[key] = [];
    slotMap[key].push(cell);
  }
  for (const [slotKey, slotCells] of Object.entries(slotMap)) {
    // Group conflicts
    const byGroup = {};
    for (const c of slotCells) {
      if (!byGroup[c.groupCode]) byGroup[c.groupCode] = [];
      byGroup[c.groupCode].push(c);
    }
    for (const [gc, gcCells] of Object.entries(byGroup)) {
      if (gcCells.length > 1) {
        const nonCombined = gcCells.filter(c => !c.combinedKey);
        if (nonCombined.length > 1) conflicts.push({
          severity: "error",
          msg: `Группа ${gc}: конфликт — ${gcCells.length} занятий в ${slotKey}`
        });
      }
    }
    // Teacher conflicts
    const byTeacher = {};
    for (const c of slotCells) {
      if (!byTeacher[c.teacherId]) byTeacher[c.teacherId] = [];
      byTeacher[c.teacherId].push(c);
    }
    for (const [tid, tcCells] of Object.entries(byTeacher)) {
      const teacher = teacherMap.get(tid);
      const nonCombined = tcCells.filter(c => !c.combinedKey);
      if (nonCombined.length > 1) conflicts.push({
        severity: "error",
        msg: `${teacher?.full || tid}: конфликт в ${slotKey}`
      });
    }
  }
  // Availability warnings
  for (const cell of cells) {
    const avail = availabilities[cell.teacherId];
    if (avail) {
      const isAvailable = avail.cells.some(ac => ac.dayKey === cell.dayKey && ac.slotIndex === cell.slotIndex && ac.parity === cell.parity);
      if (!isAvailable) {
        const teacher = teacherMap.get(cell.teacherId);
        conflicts.push({
          severity: "warning",
          msg: `${teacher?.full || cell.teacherId}: занятие вне доступного времени`
        });
      }
    }
  }
  return conflicts;
}

// ═══════════════════════════════════════════════
// Now info
// ═══════════════════════════════════════════════
function getNowInfo() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const currentDay = dayMap[dayOfWeek] || "mon";
  const minutes = now.getHours() * 60 + now.getMinutes();
  let currentSlot = null,
    nextSlot = null,
    isLive = false,
    timeToNext = 0;
  for (const slot of TIME_SLOTS) {
    if (minutes >= slot.startMin && minutes <= slot.endMin) {
      currentSlot = slot.index;
      isLive = true;
      timeToNext = slot.endMin - minutes;
    }
  }
  if (currentSlot !== null) {
    for (let i = currentSlot + 1; i < TIME_SLOTS.length; i++) {
      if (TIME_SLOTS[i]) {
        nextSlot = i;
        break;
      }
    }
  } else {
    for (const slot of TIME_SLOTS) {
      if (minutes < slot.startMin) {
        nextSlot = slot.index;
        timeToNext = slot.startMin - minutes;
        break;
      }
    }
  }
  return {
    currentSlot,
    nextSlot,
    currentDay,
    isLive,
    timeToNext
  };
}

// ═══════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════

function PairCardCompact({
  pair,
  isNow,
  currentParity,
  showGroup
}) {
  const isParitySpecific = currentParity && pair.parity !== currentParity;
  const isLecture = pair.subject.type === "lek";
  return /*#__PURE__*/React.createElement("div", {
    className: `pair-card ${isNow ? 'now' : ''}`,
    style: isParitySpecific ? {
      opacity: 0.6
    } : {}
  }, isNow && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -4,
      right: -4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: 'var(--primary)',
      boxShadow: '0 0 0 3px rgba(99,102,241,0.3)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "subject-line"
  }, /*#__PURE__*/React.createElement("div", {
    className: "color-dot",
    style: {
      backgroundColor: pair.subject.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "subject-name",
    style: {
      color: pair.subject.color
    }
  }, pair.subject.short), /*#__PURE__*/React.createElement("span", {
    className: `type-badge ${isLecture ? 'type-lek' : 'type-pr'}`
  }, isLecture ? 'Лек' : 'Пр'))), /*#__PURE__*/React.createElement("div", {
    className: "info-line"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-user"
  }), showGroup && pair.groups ? /*#__PURE__*/React.createElement("span", null, pair.groups.join(', ')) : /*#__PURE__*/React.createElement("span", null, pair.teacher.surname)), /*#__PURE__*/React.createElement("div", {
    className: "info-line"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map-marker-alt"
  }), /*#__PURE__*/React.createElement("span", null, "Ауд. ", pair.room.name)), /*#__PURE__*/React.createElement("div", {
    className: "extra-badges"
  }, pair.combined && /*#__PURE__*/React.createElement("span", {
    className: "extra-badge badge-combined"
  }, "Совмещ."), isParitySpecific && /*#__PURE__*/React.createElement("span", {
    className: "extra-badge badge-parity"
  }, pair.parity === 'even' ? 'Чёт' : 'Нечёт'), isNow && /*#__PURE__*/React.createElement("span", {
    className: "extra-badge badge-now"
  }, "Сейчас")));
}
function PairCardFull({
  pair,
  isNow,
  currentParity,
  showGroup
}) {
  const isParitySpecific = currentParity && pair.parity !== currentParity;
  const isLecture = pair.subject.type === "lek";
  return /*#__PURE__*/React.createElement("div", {
    className: `pair-full ${isNow ? 'now' : ''}`,
    style: isParitySpecific ? {
      opacity: 0.6
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    className: "subject-line"
  }, /*#__PURE__*/React.createElement("div", {
    className: "color-dot",
    style: {
      backgroundColor: pair.subject.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "subject-name",
    style: {
      color: pair.subject.color
    }
  }, pair.subject.name), /*#__PURE__*/React.createElement("span", {
    className: `type-badge ${isLecture ? 'type-lek' : 'type-pr'}`
  }, isLecture ? 'Лекция' : 'Практика')))), /*#__PURE__*/React.createElement("div", {
    className: "info-line"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-user",
    style: {
      color: 'var(--secondary)'
    }
  }), showGroup && pair.groups ? /*#__PURE__*/React.createElement("span", null, "Группы: ", pair.groups.join(', ')) : /*#__PURE__*/React.createElement("span", null, pair.teacher.full)), /*#__PURE__*/React.createElement("div", {
    className: "info-line"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map-marker-alt",
    style: {
      color: 'var(--accent)'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Ауд. ", pair.room.name)), /*#__PURE__*/React.createElement("div", {
    className: "extra-badges"
  }, pair.combined && /*#__PURE__*/React.createElement("span", {
    className: "extra-badge-full",
    style: {
      background: '#fef3c7',
      color: '#b45309'
    }
  }, "Совмещённая пара"), isParitySpecific && /*#__PURE__*/React.createElement("span", {
    className: "extra-badge-full",
    style: {
      background: '#f3f4f6',
      color: '#6b7280'
    }
  }, pair.parity === 'even' ? 'Чётная неделя' : 'Нечётная неделя'), isNow && /*#__PURE__*/React.createElement("span", {
    className: "extra-badge-full",
    style: {
      background: 'var(--primary)',
      color: '#fff'
    }
  }, "Сейчас")));
}

// ── Student View ──
function StudentView({
  cells,
  currentParity,
  selectedGroupCode,
  setSelectedGroupCode
}) {
  const [mobileDay, setMobileDay] = useState('mon');
  const [nowInfo, setNowInfo] = useState({
    currentSlot: null,
    nextSlot: null,
    currentDay: 'mon',
    isLive: false,
    timeToNext: 0
  });
  useEffect(() => {
    const update = () => setNowInfo(getNowInfo());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);
  const weekSchedule = useMemo(() => {
    if (!selectedGroupCode) return null;
    return buildGroupSchedule(cells, selectedGroupCode);
  }, [cells, selectedGroupCode]);
  const filteredGroups = DEMO_GROUPS;
  const getDisplayPair = (dayKey, slotIndex) => {
    if (!weekSchedule?.[dayKey]?.[slotIndex]) return null;
    const pair = weekSchedule[dayKey][slotIndex][currentParity];
    if (pair) return pair;
    const otherParity = currentParity === "even" ? "odd" : "even";
    return weekSchedule[dayKey][slotIndex][otherParity] ?? null;
  };
  const isCurrentDay = dk => nowInfo.currentDay === dk;
  const isCurrentSlot = si => nowInfo.currentSlot === si;
  const isNowPair = (dk, si) => isCurrentDay(dk) && isCurrentSlot(si);
  const nowPair = useMemo(() => {
    if (!nowInfo.isLive || !weekSchedule || !selectedGroupCode) return null;
    const si = nowInfo.currentSlot ?? 0;
    const dk = nowInfo.currentDay;
    return weekSchedule?.[dk]?.[si]?.[currentParity] ?? weekSchedule?.[dk]?.[si]?.[currentParity === "even" ? "odd" : "even"] ?? null;
  }, [nowInfo, weekSchedule, selectedGroupCode, currentParity]);
  const selectedGroup = groupMap.get(selectedGroupCode);
  if (!selectedGroupCode) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 56,
        height: 56,
        borderRadius: 16,
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-search",
      style: {
        color: '#fff',
        fontSize: 22
      }
    })), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 8
      }
    }, "Выберите группу"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--gray-500)',
        textAlign: 'center'
      }
    }, "Выберите группу для просмотра расписания"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-selector"
  }, filteredGroups.map(g => /*#__PURE__*/React.createElement("button", {
    key: g.code,
    className: `group-btn ${selectedGroupCode === g.code ? 'active' : ''}`,
    onClick: () => setSelectedGroupCode(g.code)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, g.code), /*#__PURE__*/React.createElement("span", {
    className: "course"
  }, g.course, " курс"))))), /*#__PURE__*/React.createElement("div", {
    className: "section"
  }, /*#__PURE__*/React.createElement("p", {
    className: "demo-schedule-hint",
    style: {
      fontSize: 13,
      color: 'var(--gray-500)',
      marginBottom: 12
    }
  }, "Демо: фрагмент расписания · Понедельник и Среда")), nowInfo.isLive && /*#__PURE__*/React.createElement("div", {
    className: "now-indicator"
  }, /*#__PURE__*/React.createElement("div", {
    className: "now-pulse"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, nowPair ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, "Сейчас:"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: nowPair.subject.color
    }
  }, nowPair.subject.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      padding: '2px 8px',
      borderRadius: 100,
      background: 'rgba(99,102,241,0.1)',
      color: 'var(--primary)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-clock",
    style: {
      marginRight: 4
    }
  }), "до ", TIME_SLOTS[nowInfo.currentSlot ?? 0]?.end)) : /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)'
    }
  }, "Окно — сейчас нет занятия")), nowInfo.nextSlot !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--gray-400)',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-chevron-right"
  }), "След: ", TIME_SLOTS[nowInfo.nextSlot]?.label)), selectedGroup && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 10px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 600,
      background: 'rgba(99,102,241,0.1)',
      color: 'var(--primary)'
    }
  }, selectedGroup.code), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)'
    }
  }, selectedGroup.direction, " • ", selectedGroup.course, " курс")), /*#__PURE__*/React.createElement("div", {
    className: "desktop-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.key,
    className: `grid-header-cell ${isCurrentDay(d.key) ? 'today' : ''}`
  }, /*#__PURE__*/React.createElement("div", null, d.full), isCurrentDay(d.key) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      fontSize: 9,
      padding: '1px 6px',
      borderRadius: 4,
      background: 'var(--primary)',
      color: '#fff',
      fontWeight: 600,
      display: 'inline-block'
    }
  }, "Сегодня")))), DEMO_SLOTS.map(slot => /*#__PURE__*/React.createElement("div", {
    key: slot.index,
    className: `grid-row ${isCurrentSlot(slot.index) ? 'current-slot' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: `time-cell ${isCurrentSlot(slot.index) ? 'current' : ''}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, slot.label)), DEMO_DAYS.map(d => {
    const pair = getDisplayPair(d.key, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: d.key,
      className: `day-cell ${isCurrentDay(d.key) ? 'today-col' : ''}`
    }, pair ? /*#__PURE__*/React.createElement(PairCardCompact, {
      pair: pair,
      isNow: isNowPair(d.key, slot.index),
      currentParity: currentParity
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-cell"
    }, /*#__PURE__*/React.createElement("div", {
      className: "empty-dots"
    }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "empty-dot"
    })))));
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-day-tabs"
  }, DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("button", {
    key: d.key,
    className: `mobile-day-tab ${mobileDay === d.key ? 'active' : ''}`,
    onClick: () => setMobileDay(d.key)
  }, d.short, isCurrentDay(d.key) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--primary)',
      marginLeft: 4
    }
  })))), /*#__PURE__*/React.createElement("div", null, DEMO_SLOTS.map(slot => {
    const pair = getDisplayPair(mobileDay, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: slot.index,
      className: "mobile-slot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mobile-slot-header"
    }, /*#__PURE__*/React.createElement("span", {
      className: `mobile-slot-time ${isNowPair(mobileDay, slot.index) ? '' : ''}`,
      style: isNowPair(mobileDay, slot.index) ? {
        color: 'var(--primary)'
      } : {}
    }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
      className: "mobile-slot-label"
    }, slot.label), isNowPair(mobileDay, slot.index) && /*#__PURE__*/React.createElement("span", {
      className: "mobile-slot-now"
    }, "Сейчас")), pair ? /*#__PURE__*/React.createElement(PairCardFull, {
      pair: pair,
      isNow: isNowPair(mobileDay, slot.index),
      currentParity: currentParity
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-slot"
    }, /*#__PURE__*/React.createElement("p", null, "Нет занятия")));
  }))));
}

// ── Teacher View ──
function TeacherView({
  cells,
  currentParity,
  selectedTeacherId,
  setSelectedTeacherId,
  availabilities,
  setAvailability,
  showcase = false,
  showcaseFixedTab = null
}) {
  const [availParity, setAvailParity] = useState('even');
  const [localAvail, setLocalAvail] = useState({});
  const [activeTab, setActiveTab] = useState('schedule');
  const [saved, setSaved] = useState(false);
  const tab = showcaseFixedTab || activeTab;
  const weekSchedule = useMemo(() => {
    if (!selectedTeacherId) return null;
    return buildTeacherSchedule(cells, selectedTeacherId);
  }, [cells, selectedTeacherId]);
  const teacherAvail = selectedTeacherId ? availabilities[selectedTeacherId] : null;
  const initLocalAvail = useCallback(() => {
    if (!teacherAvail) return;
    const map = {};
    for (const day of DEMO_DAYS) {
      for (let si = 0; si < DEMO_SLOT_COUNT; si++) {
        const key = `${day.key}:${si}:${availParity}`;
        map[key] = teacherAvail.cells.some(c => c.dayKey === day.key && c.slotIndex === si && c.parity === availParity);
      }
    }
    setLocalAvail(map);
  }, [teacherAvail, availParity]);
  useEffect(() => {
    initLocalAvail();
  }, [initLocalAvail]);
  const toggleAvailCell = (dayKey, slotIndex) => {
    const key = `${dayKey}:${slotIndex}:${availParity}`;
    setLocalAvail(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const submitAvailability = () => {
    if (!selectedTeacherId) return;
    const newCells = [];
    for (const day of DEMO_DAYS) {
      for (let si = 0; si < DEMO_SLOT_COUNT; si++) {
        for (const p of ["even", "odd"]) {
          const key = `${day.key}:${si}:${p}`;
          if (p === availParity) {
            if (localAvail[key]) newCells.push({
              dayKey: day.key,
              slotIndex: si,
              parity: p
            });
          } else {
            const isAvail = teacherAvail?.cells.some(c => c.dayKey === day.key && c.slotIndex === si && c.parity === p);
            if (isAvail) newCells.push({
              dayKey: day.key,
              slotIndex: si,
              parity: p
            });
          }
        }
      }
    }
    setAvailability(selectedTeacherId, {
      teacherId: selectedTeacherId,
      cells: newCells,
      submittedParities: [...new Set([...(teacherAvail?.submittedParities || []), availParity])]
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const copyFromOtherParity = () => {
    const otherParity = availParity === "even" ? "odd" : "even";
    const newLocalAvail = {
      ...localAvail
    };
    for (const day of DEMO_DAYS) {
      for (let si = 0; si < DEMO_SLOT_COUNT; si++) {
        const targetKey = `${day.key}:${si}:${availParity}`;
        const sourceAvail = teacherAvail?.cells.some(c => c.dayKey === day.key && c.slotIndex === si && c.parity === otherParity);
        newLocalAvail[targetKey] = !!sourceAvail;
      }
    }
    setLocalAvail(newLocalAvail);
  };
  const getDisplayPair = (dayKey, slotIndex) => {
    if (!weekSchedule?.[dayKey]?.[slotIndex]) return null;
    const pair = weekSchedule[dayKey][slotIndex][currentParity];
    if (pair) return pair;
    return weekSchedule[dayKey][slotIndex][currentParity === "even" ? "odd" : "even"] ?? null;
  };
  const isCurrentDay = dk => {
    const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return dayMap[new Date().getDay()] === dk;
  };
  if (!selectedTeacherId) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 16px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--gray-500)'
      }
    }, "Выберите преподавателя"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, (!showcaseFixedTab || showcase) && /*#__PURE__*/React.createElement("div", {
    className: "admin-header"
  }, /*#__PURE__*/React.createElement("select", {
    className: "teacher-select",
    value: selectedTeacherId,
    onChange: e => setSelectedTeacherId(e.target.value)
  }, (showcase ? DEMO_TEACHERS : TEACHERS).map(t => /*#__PURE__*/React.createElement("option", {
    key: t.id,
    value: t.id
  }, t.full))), !showcase && /*#__PURE__*/React.createElement("div", {
    className: "parity-selector"
  }, /*#__PURE__*/React.createElement("span", {
    className: "parity-label"
  }, "Неделя:"), /*#__PURE__*/React.createElement("button", {
    className: `parity-btn ${currentParity === 'even' ? 'active' : ''}`
  }, "Чётная"), /*#__PURE__*/React.createElement("button", {
    className: `parity-btn ${currentParity === 'odd' ? 'active' : ''}`
  }, "Нечётная"))), !showcaseFixedTab && /*#__PURE__*/React.createElement("div", {
    className: "tab-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'schedule' ? 'active' : ''}`,
    onClick: () => setActiveTab('schedule')
  }, "Моё расписание"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'availability' ? 'active' : ''}`,
    onClick: () => setActiveTab('availability')
  }, "Доступность")), tab === 'schedule' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "desktop-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.key,
    className: `grid-header-cell ${isCurrentDay(d.key) ? 'today' : ''}`
  }, d.full))), DEMO_SLOTS.map(slot => /*#__PURE__*/React.createElement("div", {
    key: slot.index,
    className: "grid-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, slot.label)), DEMO_DAYS.map(d => {
    const pair = getDisplayPair(d.key, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: d.key,
      className: `day-cell ${isCurrentDay(d.key) ? 'today-col' : ''}`
    }, pair ? /*#__PURE__*/React.createElement(PairCardCompact, {
      pair: pair,
      currentParity: currentParity,
      showGroup: true
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-cell"
    }, /*#__PURE__*/React.createElement("div", {
      className: "empty-dots"
    }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "empty-dot"
    })))));
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "mobile-schedule"
  }, DEMO_DAYS.map(day => {
    const dayPairs = DEMO_SLOTS.map(slot => ({
      slot,
      pair: getDisplayPair(day.key, slot.index)
    })).filter(item => item.pair !== null);
    if (dayPairs.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: day.key,
      className: "card",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 16px',
        borderBottom: '1px solid var(--gray-200)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-clock",
      style: {
        color: 'var(--primary)',
        fontSize: 14
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, day.full)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, dayPairs.map(({
      slot,
      pair
    }) => /*#__PURE__*/React.createElement("div", {
      key: slot.index
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: 'var(--gray-400)'
      }
    }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement(PairCardFull, {
      pair: pair,
      currentParity: currentParity,
      showGroup: true
    })))));
  }))), tab === 'availability' && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, "Доступность преподавателя"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)'
    }
  }, "Неделя:"), /*#__PURE__*/React.createElement("button", {
    className: `parity-btn btn-sm ${availParity === 'even' ? 'active' : ''}`,
    onClick: () => setAvailParity('even')
  }, "Чётная"), /*#__PURE__*/React.createElement("button", {
    className: `parity-btn btn-sm ${availParity === 'odd' ? 'active' : ''}`,
    onClick: () => setAvailParity('odd')
  }, "Нечётная"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)',
      marginBottom: 16
    }
  }, "Нажмите на ячейку, чтобы указать доступность.", ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: 3,
      background: '#d1fae5',
      border: '1px solid #6ee7b7'
    }
  }), " — доступен"), ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: 3,
      background: '#f3f4f6',
      border: '1px solid #d1d5db'
    }
  }), " — недоступен")), /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avail-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell",
    style: {
      padding: 8
    }
  }, "Время"), DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.key,
    className: "grid-header-cell",
    style: {
      padding: 8
    }
  }, d.short))), DEMO_SLOTS.map(slot => /*#__PURE__*/React.createElement("div", {
    key: slot.index,
    className: "grid-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell",
    style: {
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start, "–", slot.end)), DEMO_DAYS.map(d => {
    const key = `${d.key}:${slot.index}:${availParity}`;
    const isAvailable = localAvail[key] ?? false;
    return /*#__PURE__*/React.createElement("div", {
      key: d.key,
      className: "day-cell",
      style: {
        padding: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: `avail-btn ${isAvailable ? 'available' : 'unavailable'}`,
      onClick: () => toggleAvailCell(d.key, slot.index),
      title: isAvailable ? 'Доступен' : 'Недоступен'
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isAvailable ? 'fa-check' : 'fa-times'}`
    })));
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      borderTop: '1px solid var(--gray-200)',
      paddingTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: submitAvailability
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-paper-plane"
  }), saved ? 'Сохранено ✓' : 'Отправить учебной части'), !showcase && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: copyFromOtherParity
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-copy"
  }), "Скопировать с ", availParity === 'even' ? 'нечётной' : 'чётной')))));
}

// ── Admin View ──
function AdminView({
  cells,
  setCells,
  currentParity,
  availabilities,
  showcase = false,
  showcaseFixedTab = null
}) {
  const [adminGroupCode, setAdminGroupCode] = useState('ОЭ-11');
  const [adminDayKey, setAdminDayKey] = useState('mon');
  const [adminParity, setAdminParity] = useState('even');
  const [activeTab, setActiveTab] = useState('constructor');
  const tab = showcaseFixedTab || activeTab;
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState([]);
  const [genResult, setGenResult] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    subjectId: '',
    teacherId: '',
    roomId: ''
  });
  const conflicts = useMemo(() => getConflicts(cells, availabilities), [cells, availabilities]);
  const weekSchedule = useMemo(() => {
    return buildGroupSchedule(cells, adminGroupCode);
  }, [cells, adminGroupCode]);
  const stats = useMemo(() => {
    const totalCells = cells.length;
    const uniqueSubjects = new Set(cells.map(c => c.subjectId)).size;
    const uniqueTeachers = new Set(cells.map(c => c.teacherId)).size;
    const uniqueRooms = new Set(cells.map(c => c.roomId)).size;
    return {
      totalCells,
      uniqueSubjects,
      uniqueTeachers,
      uniqueRooms
    };
  }, [cells]);
  const autoGenerate = () => {
    setIsGenerating(true);
    setGenProgress([]);
    setGenResult(null);
    const progress = [];
    const addStep = msg => {
      progress.push(msg);
      setGenProgress([...progress]);
    };
    setTimeout(() => {
      addStep("Инициализация генератора расписания...");
      setTimeout(() => {
        addStep("Обработка ограничений...");
        setTimeout(() => {
          addStep("Закреплено 0 занятий");
          setTimeout(() => {
            const newCells = generateSchedule(`autogen-${Date.now()}`);
            addStep(`Сгенерировано ${newCells.length} ячеек расписания`);
            setCells(newCells);
            setTimeout(() => {
              addStep(`Итого: ${newCells.length} занятий в расписании`);
              addStep("Проверка конфликтов...");
              setTimeout(() => {
                const newConflicts = getConflicts(newCells, availabilities);
                addStep(newConflicts.length === 0 ? "Конфликтов не обнаружено ✓" : `Обнаружено ${newConflicts.length} конфликтов`);
                setGenResult({
                  success: newConflicts.filter(c => c.severity === 'error').length === 0,
                  conflicts: newConflicts
                });
                setIsGenerating(false);
              }, 400);
            }, 300);
          }, 400);
        }, 400);
      }, 400);
    }, 300);
  };
  const handleAddCell = () => {
    if (!addForm.subjectId || !addForm.teacherId || !addForm.roomId) return;
    const newCell = {
      id: `manual-${Date.now()}`,
      groupCode: adminGroupCode,
      dayKey: adminDayKey,
      slotIndex: 0,
      parity: adminParity,
      subjectId: addForm.subjectId,
      teacherId: addForm.teacherId,
      roomId: addForm.roomId,
      combined: false
    };
    setCells([...cells, newCell]);
    setShowAddModal(false);
    setAddForm({
      subjectId: '',
      teacherId: '',
      roomId: ''
    });
  };
  const getDisplayPair = (dayKey, slotIndex) => {
    if (!weekSchedule?.[dayKey]?.[slotIndex]) return null;
    const pair = weekSchedule[dayKey][slotIndex][adminParity];
    if (pair) return pair;
    return weekSchedule[dayKey][slotIndex][adminParity === "even" ? "odd" : "even"] ?? null;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fade-in"
  }, !showcase && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 16,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.totalCells), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Занятий в расписании")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.uniqueSubjects), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Дисциплин")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, stats.uniqueTeachers), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, "Преподавателей")), /*#__PURE__*/React.createElement("div", {
    className: "stat-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, conflicts.length), /*#__PURE__*/React.createElement("div", {
    className: "stat-label",
    style: {
      color: conflicts.length > 0 ? 'var(--error)' : undefined
    }
  }, "Конфликтов"))), showcase && conflicts.length > 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)',
      marginBottom: 16
    }
  }, "Конфликтов в демо: ", /*#__PURE__*/React.createElement("strong", null, conflicts.length)), !showcaseFixedTab && /*#__PURE__*/React.createElement("div", {
    className: "tab-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'constructor' ? 'active' : ''}`,
    onClick: () => setActiveTab('constructor')
  }, showcase ? "Расписание" : "Конструктор"), !showcase && /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'autogen' ? 'active' : ''}`,
    onClick: () => setActiveTab('autogen')
  }, "Автогенерация"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeTab === 'conflicts' ? 'active' : ''}`,
    onClick: () => setActiveTab('conflicts')
  }, "Конфликты")), tab === 'constructor' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "admin-header"
  }, /*#__PURE__*/React.createElement("select", {
    className: "teacher-select",
    value: adminGroupCode,
    onChange: e => setAdminGroupCode(e.target.value)
  }, (showcase ? DEMO_GROUPS : GROUPS).map(g => /*#__PURE__*/React.createElement("option", {
    key: g.code,
    value: g.code
  }, g.label))), /*#__PURE__*/React.createElement("select", {
    className: "teacher-select",
    value: adminDayKey,
    onChange: e => setAdminDayKey(e.target.value)
  }, DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("option", {
    key: d.key,
    value: d.key
  }, d.full))), !showcase && /*#__PURE__*/React.createElement("div", {
    className: "parity-selector"
  }, /*#__PURE__*/React.createElement("button", {
    className: `parity-btn btn-sm ${adminParity === 'even' ? 'active' : ''}`,
    onClick: () => setAdminParity('even')
  }, "Чётная"), /*#__PURE__*/React.createElement("button", {
    className: `parity-btn btn-sm ${adminParity === 'odd' ? 'active' : ''}`,
    onClick: () => setAdminParity('odd')
  }, "Нечётная")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setShowAddModal(true)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-plus"
  }), " Добавить занятие"), showcase && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: () => {
      setActiveTab("autogen");
      autoGenerate();
    },
    disabled: isGenerating
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-wand-magic-sparkles"
  }), " Автогенерация")), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "schedule-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-header-cell"
  }, "Время"), DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.key,
    className: "grid-header-cell"
  }, d.full))), DEMO_SLOTS.map(slot => /*#__PURE__*/React.createElement("div", {
    key: slot.index,
    className: "grid-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, slot.label)), DEMO_DAYS.map(d => {
    const pair = getDisplayPair(d.key, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: d.key,
      className: "day-cell"
    }, pair ? /*#__PURE__*/React.createElement(PairCardCompact, {
      pair: pair,
      currentParity: adminParity
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-cell"
    }, /*#__PURE__*/React.createElement("div", {
      className: "empty-dots"
    }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "empty-dot"
    })))));
  })))))), showAddModal && /*#__PURE__*/React.createElement("div", {
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
      marginBottom: 16
    }
  }, "Добавить занятие"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "teacher-select",
    value: addForm.subjectId,
    onChange: e => setAddForm({
      ...addForm,
      subjectId: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Выберите дисциплину"), SUBJECTS.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.name))), /*#__PURE__*/React.createElement("select", {
    className: "teacher-select",
    value: addForm.teacherId,
    onChange: e => setAddForm({
      ...addForm,
      teacherId: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Выберите преподавателя"), TEACHERS.map(t => /*#__PURE__*/React.createElement("option", {
    key: t.id,
    value: t.id
  }, t.full))), /*#__PURE__*/React.createElement("select", {
    className: "teacher-select",
    value: addForm.roomId,
    onChange: e => setAddForm({
      ...addForm,
      roomId: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Выберите аудиторию"), ROOMS.map(r => /*#__PURE__*/React.createElement("option", {
    key: r.id,
    value: r.id
  }, r.name, " (", r.type === 'lecture' ? 'лекция' : 'лаб.', ")")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleAddCell
  }, "Добавить"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setShowAddModal(false)
  }, "Отмена"))))), tab === 'autogen' && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Автоматическая генерация расписания"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)',
      marginBottom: 20
    }
  }, "Создайте расписание автоматически с учётом доступности преподавателей и ограничений."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: autoGenerate,
    disabled: isGenerating
  }, isGenerating ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      display: 'inline-block'
    }
  }), " Генерация...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-bolt"
  }), " Сгенерировать расписание")), genProgress.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "progress-list"
  }, genProgress.map((step, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `progress-item ${i < genProgress.length - 1 || !isGenerating ? 'done' : ''}`
  }, i === genProgress.length - 1 && isGenerating && /*#__PURE__*/React.createElement("span", {
    className: "spinner"
  }), step))), genResult && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      padding: 16,
      borderRadius: 12,
      background: genResult.success ? '#d1fae5' : '#fef2f2',
      border: `1px solid ${genResult.success ? '#6ee7b7' : '#fecaca'}`
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 700,
      color: genResult.success ? '#059669' : '#dc2626',
      fontSize: 14
    }
  }, genResult.success ? '✓ Расписание успешно сгенерировано' : '⚠ Расписание сгенерировано с ошибками'), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--gray-600)',
      marginTop: 4
    }
  }, "Конфликтов: ", genResult.conflicts.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      borderTop: '1px solid var(--gray-200)',
      paddingTop: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 8
    }
  }, "Публикация"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--gray-500)',
      marginBottom: 12
    }
  }, isPublished ? 'Расписание опубликовано и доступно студентам и преподавателям.' : 'Опубликуйте расписание, чтобы оно стало доступно.'), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setIsPublished(true),
    disabled: isPublished,
    style: isPublished ? {
      opacity: 0.5,
      cursor: 'default'
    } : {}
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-globe"
  }), " ", isPublished ? 'Опубликовано ✓' : 'Опубликовать расписание')))), tab === 'conflicts' && /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 12
    }
  }, "Проверка конфликтов"), conflicts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      borderRadius: 12,
      background: '#d1fae5',
      border: '1px solid #6ee7b7',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-check-circle",
    style: {
      fontSize: 32,
      color: '#059669',
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 700,
      color: '#059669'
    }
  }, "Конфликтов не обнаружено")) : /*#__PURE__*/React.createElement("div", {
    className: "conflict-list"
  }, (showcase ? conflicts.slice(0, 2) : conflicts).map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `conflict-item ${c.severity === 'error' ? 'conflict-error' : 'conflict-warning'}`
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${c.severity === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}`
  }), c.msg))))));
}

// ═══════════════════════════════════════════════
// EDUCATION SHOWCASE (visual example + commentary)
// ═══════════════════════════════════════════════
const STUDENT_SHOWCASE_BLOCKS = [{
  n: 1,
  icon: "fa-calendar-day",
  title: "День из расписания",
  text: "Ученик открывает ссылку и сразу видит пары на день: во сколько, какой предмет, кто ведёт и в какой аудитории. Всё в карточках — не вложение в чате группы."
}, {
  n: 2,
  icon: "fa-users",
  title: "Своя группа",
  text: "Каждый ученик видит расписание своего потока. Переключите группу — в первом блоке обновятся пары (в продукте список групп у каждого свой)."
}, {
  n: 3,
  icon: "fa-table-columns",
  title: "Фрагмент недели",
  text: "Понедельник и среда на одном экране — удобно на телефоне, без горизонтального скролла всей недели."
}];
const SHOWCASE_FOOTER_NOTE = {
  icon: "fa-layer-group",
  title: "В полной версии",
  text: "Преподаватели отмечают доступность, учебная часть собирает сетку и видит конфликты. Переключите вкладку в шапке — там упрощённые примеры."
};
const TEACHER_SHOWCASE_NOTES = [{
  n: 1,
  icon: "fa-calendar-days",
  title: "Моё расписание",
  text: "Преподаватель видит только свои пары — по дням и времени, без лишних групп и кабинетов чужих потоков."
}, {
  n: 2,
  icon: "fa-users",
  title: "Группы в карточках",
  text: "Если ведёт несколько групп, они указаны на карточке. Удобно, когда один преподаватель закреплён за разными потоками."
}, {
  n: 3,
  icon: "fa-check-square",
  title: "Доступность",
  text: "Во вкладке «Доступность» отмечает, когда свободен. Учебная часть учитывает это при сборке сетки — не нужно обзванивать по списку."
}, {
  n: 4,
  icon: "fa-paper-plane",
  title: "Отправка в учебную часть",
  text: "Один клик — и окна переданы методистам. Не файл в почте, а живые данные в системе."
}];
const ADMIN_SHOWCASE_NOTES = [{
  n: 1,
  icon: "fa-table-columns",
  title: "Конструктор расписания",
  text: "Методист видит сетку группы и может добавить или поправить занятие. Всё на одном экране вместо разрозненных файлов и переписок."
}, {
  n: 2,
  icon: "fa-triangle-exclamation",
  title: "Конфликты сразу видны",
  text: "Система подсвечивает пересечения: один преподаватель в двух местах, занятая аудитория. Не нужно вручную сверять документы."
}, {
  n: 3,
  icon: "fa-wand-magic-sparkles",
  title: "Автогенерация черновика",
  text: "Кнопка «Автогенерация» собирает первый вариант сетки по правилам. Методист дорабатывает вручную, а не начинает с пустого листа."
}, {
  n: 4,
  icon: "fa-bullhorn",
  title: "Публикация для всех",
  text: "Готовое расписание ученики и преподаватели открывают по ссылке — всегда одна актуальная версия."
}];
const DEMO_TEACHERS = TEACHERS.slice(0, 4);
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
function ShowcaseDayList({
  dayKey,
  getDisplayPair,
  currentParity,
  groupCode
}) {
  const day = DEMO_DAYS.find(d => d.key === dayKey) || DAYS.find(d => d.key === dayKey);
  return /*#__PURE__*/React.createElement("div", {
    className: "card showcase-day-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "showcase-day-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-calendar-day"
  }), /*#__PURE__*/React.createElement("span", null, day?.full || dayKey), groupCode && /*#__PURE__*/React.createElement("span", {
    className: "showcase-panel-meta"
  }, "· ", groupCode)), /*#__PURE__*/React.createElement("div", {
    className: "showcase-day-slots"
  }, DEMO_SLOTS.map(slot => {
    const pair = getDisplayPair(dayKey, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: slot.index,
      className: "showcase-day-slot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "showcase-day-slot-time"
    }, /*#__PURE__*/React.createElement("span", {
      className: "time"
    }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
      className: "label"
    }, slot.label)), pair ? /*#__PURE__*/React.createElement(PairCardFull, {
      pair: pair,
      currentParity: currentParity
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-slot"
    }, /*#__PURE__*/React.createElement("p", null, "Нет занятия")));
  })));
}
function ShowcaseScheduleGrid({
  getDisplayPair,
  currentParity
}) {
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
    key: d.key,
    className: "grid-header-cell"
  }, d.full))), DEMO_SLOTS.map(slot => /*#__PURE__*/React.createElement("div", {
    key: slot.index,
    className: "grid-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "time-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "time"
  }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, slot.label)), DEMO_DAYS.map(d => {
    const pair = getDisplayPair(d.key, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: d.key,
      className: "day-cell"
    }, pair ? /*#__PURE__*/React.createElement(PairCardCompact, {
      pair: pair,
      currentParity: currentParity
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-cell"
    }, /*#__PURE__*/React.createElement("div", {
      className: "empty-dots"
    }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "empty-dot"
    })))));
  }))))));
}
function ShowcaseMobileSchedule({
  getDisplayPair,
  currentParity,
  mobileDay,
  setMobileDay
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mobile-schedule"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mobile-day-tabs"
  }, DEMO_DAYS.map(d => /*#__PURE__*/React.createElement("button", {
    key: d.key,
    type: "button",
    className: `mobile-day-tab ${mobileDay === d.key ? "active" : ""}`,
    onClick: () => setMobileDay(d.key)
  }, d.short))), /*#__PURE__*/React.createElement("div", null, DEMO_SLOTS.map(slot => {
    const pair = getDisplayPair(mobileDay, slot.index);
    return /*#__PURE__*/React.createElement("div", {
      key: slot.index,
      className: "mobile-slot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mobile-slot-header"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mobile-slot-time"
    }, slot.start, "–", slot.end), /*#__PURE__*/React.createElement("span", {
      className: "mobile-slot-label"
    }, slot.label)), pair ? /*#__PURE__*/React.createElement(PairCardFull, {
      pair: pair,
      currentParity: currentParity
    }) : /*#__PURE__*/React.createElement("div", {
      className: "empty-slot"
    }, /*#__PURE__*/React.createElement("p", null, "Нет занятия")));
  })));
}
function EducationShowcase({
  cells
}) {
  const [selectedGroupCode, setSelectedGroupCode] = useState("ОЭ-11");
  const currentParity = "even";
  const weekSchedule = useMemo(() => buildGroupSchedule(cells, selectedGroupCode), [cells, selectedGroupCode]);
  const selectedGroup = groupMap.get(selectedGroupCode);
  const getDisplayPair = (dayKey, slotIndex) => {
    if (!weekSchedule?.[dayKey]?.[slotIndex]) return null;
    return weekSchedule[dayKey][slotIndex][currentParity] ?? null;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: STUDENT_SHOWCASE_BLOCKS[0]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-graduation-cap",
    label: "Ученик",
    meta: selectedGroup ? `· ${selectedGroup.code}` : null
  }), /*#__PURE__*/React.createElement(ShowcaseDayList, {
    dayKey: "mon",
    getDisplayPair: getDisplayPair,
    currentParity: currentParity,
    groupCode: selectedGroupCode
  })), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: STUDENT_SHOWCASE_BLOCKS[1]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-list",
    label: "Выбор группы"
  }), /*#__PURE__*/React.createElement("div", {
    className: "group-selector"
  }, DEMO_GROUPS.map(g => /*#__PURE__*/React.createElement("button", {
    key: g.code,
    type: "button",
    className: `group-btn ${selectedGroupCode === g.code ? "active" : ""}`,
    onClick: () => setSelectedGroupCode(g.code)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, g.code), /*#__PURE__*/React.createElement("span", {
    className: "course"
  }, g.course, " курс"))))), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: STUDENT_SHOWCASE_BLOCKS[2]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-table-columns",
    label: "Фрагмент недели",
    meta: "· Пн и Ср"
  }), /*#__PURE__*/React.createElement("div", {
    className: "card showcase-card"
  }, /*#__PURE__*/React.createElement(ShowcaseScheduleGrid, {
    getDisplayPair: getDisplayPair,
    currentParity: currentParity
  }))), /*#__PURE__*/React.createElement("p", {
    className: "showcase-footer-hint"
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${SHOWCASE_FOOTER_NOTE.icon}`
  }), " ", /*#__PURE__*/React.createElement("strong", null, SHOWCASE_FOOTER_NOTE.title), " — ", SHOWCASE_FOOTER_NOTE.text));
}
function TeacherShowcase({
  cells,
  availabilities,
  setAvailability
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState("t1");
  const teacher = teacherMap.get(selectedTeacherId);
  const currentParity = "even";
  const teacherViewProps = {
    showcase: true,
    cells: cells,
    currentParity: currentParity,
    selectedTeacherId: selectedTeacherId,
    setSelectedTeacherId: setSelectedTeacherId,
    availabilities: availabilities,
    setAvailability: setAvailability
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: TEACHER_SHOWCASE_NOTES[0]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-book-open",
    label: "Моё расписание",
    meta: teacher ? `· ${teacher.surname}` : null
  }), /*#__PURE__*/React.createElement(TeacherView, Object.assign({
    showcaseFixedTab: "schedule"
  }, teacherViewProps))), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: TEACHER_SHOWCASE_NOTES[2]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-check-square",
    label: "Доступность",
    meta: teacher ? `· ${teacher.surname}` : null
  }), /*#__PURE__*/React.createElement(TeacherView, Object.assign({
    showcaseFixedTab: "availability"
  }, teacherViewProps))));
}
function AdminShowcase({
  cells,
  setCells,
  availabilities
}) {
  const currentParity = "even";
  const adminViewProps = {
    showcase: true,
    cells: cells,
    setCells: setCells,
    currentParity: currentParity,
    availabilities: availabilities
  };
  const desktopNote = /*#__PURE__*/React.createElement("div", {
    className: "admin-desktop-note"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-desktop"
  }), /*#__PURE__*/React.createElement("span", null, "Учебная часть — рабочее место за компьютером. На телефоне показываем превью с горизонтальной прокруткой, потому что конструктор с группами, аудиториями и преподавателями честно удобнее на большом экране."));
  const desktopFrame = tab => /*#__PURE__*/React.createElement("div", {
    className: "admin-demo-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-desktop-shell"
  }, /*#__PURE__*/React.createElement(AdminView, Object.assign({
    showcaseFixedTab: tab
  }, adminViewProps))));
  return /*#__PURE__*/React.createElement("div", {
    className: "showcase-walkthrough"
  }, /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: ADMIN_SHOWCASE_NOTES[0]
  }, desktopNote, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-table-columns",
    label: "Конструктор",
    meta: "· desktop-кабинет"
  }), desktopFrame("constructor")), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: ADMIN_SHOWCASE_NOTES[2]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-wand-magic-sparkles",
    label: "Автогенерация",
    meta: "· первый черновик"
  }), desktopFrame("autogen")), /*#__PURE__*/React.createElement(ShowcaseBlock, {
    note: ADMIN_SHOWCASE_NOTES[1]
  }, /*#__PURE__*/React.createElement(ShowcaseDemoChrome, {
    icon: "fa-triangle-exclamation",
    label: "Конфликты",
    meta: "· проверка перед публикацией"
  }), desktopFrame("conflicts")));
}
// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
function App() {
  const [role, setRole] = useState("student");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cells, setCells] = useState(() => generateSchedule());
  const [availabilities, setAvailabilities] = useState(() => generateAvailability());
  const setAvailability = (teacherId, avail) => {
    setAvailabilities(prev => ({
      ...prev,
      [teacherId]: avail
    }));
  };
  const roles = [{
    key: "student",
    label: "Ученик",
    icon: "fa-graduation-cap",
    desc: "Расписание с телефона"
  }, {
    key: "teacher",
    label: "Преподаватель",
    icon: "fa-book-open",
    desc: "Мои пары и доступность"
  }, {
    key: "admin",
    label: "Учебная часть",
    icon: "fa-shield-alt",
    desc: "Desktop-конструктор"
  }];
  const activeRole = roles.find(r => r.key === role) || roles[0];
  const introByRole = {
    student: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "Ученик"), " открывает ссылку с телефона и сразу видит актуальные пары, аудитории и преподавателей."),
    teacher: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "Преподаватель"), " смотрит своё расписание и отправляет доступность учебной части без переписок."),
    admin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "Учебная часть"), " работает в desktop-кабинете: собирает сетку, запускает черновик, проверяет конфликты и публикует.")
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
  }, "Визуальный пример · Учебные заведения"))), /*#__PURE__*/React.createElement("div", {
    className: "role-tabs-desktop role-tabs"
  }, roles.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.key,
    className: `role-tab ${role === r.key ? "active" : ""}`,
    onClick: () => setRole(r.key)
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${r.icon}`
  }), " ", r.label))), /*#__PURE__*/React.createElement("button", {
    className: "mobile-menu-btn",
    onClick: () => setMobileMenuOpen(!mobileMenuOpen)
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`
  }))), mobileMenuOpen && /*#__PURE__*/React.createElement("div", {
    className: "role-tabs-mobile",
    style: {
      paddingBottom: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, roles.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.key,
    className: `role-tab ${role === r.key ? "active" : ""}`,
    onClick: () => {
      setRole(r.key);
      setMobileMenuOpen(false);
    },
    style: {
      justifyContent: "flex-start"
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
    className: "back-link",
    "aria-label": "Вернуться на главную страницу сайта"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-arrow-left"
  }), " Вернуться на сайт"), /*#__PURE__*/React.createElement("section", {
    className: "demo-hero",
    "aria-labelledby": "demo-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "demo-hero-copy"
  }, /*#__PURE__*/React.createElement("span", {
    className: "demo-kicker"
  }, "Интерактивная демоверсия"), /*#__PURE__*/React.createElement("h1", {
    className: "demo-title",
    id: "demo-title"
  }, "Планово для ", /*#__PURE__*/React.createElement("span", null, "учебного учреждения")), /*#__PURE__*/React.createElement("p", {
    className: "demo-lead"
  }, "Показываем полный сценарий на примере колледжа: ученик видит расписание, преподаватель отдаёт доступность, учебная часть собирает и публикует сетку."), /*#__PURE__*/React.createElement("div", {
    className: "demo-hero-actions",
    "aria-label": "Ключевые сценарии"
  }, /*#__PURE__*/React.createElement("span", {
    className: "demo-chip"
  }, "мобильный ученик"), /*#__PURE__*/React.createElement("span", {
    className: "demo-chip"
  }, "мобильный преподаватель"), /*#__PURE__*/React.createElement("span", {
    className: "demo-chip"
  }, "desktop учебной части"))), /*#__PURE__*/React.createElement("div", {
    className: "demo-hero-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "demo-panel-title"
  }, "Выберите роль"), /*#__PURE__*/React.createElement("div", {
    className: "demo-role-switch",
    role: "tablist",
    "aria-label": "Роли демоверсии"
  }, roles.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.key,
    type: "button",
    role: "tab",
    "aria-selected": role === r.key,
    className: `demo-role-button ${role === r.key ? "active" : ""}`,
    onClick: () => setRole(r.key)
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${r.icon}`
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, r.label), /*#__PURE__*/React.createElement("span", null, r.desc))))), /*#__PURE__*/React.createElement("div", {
    className: "demo-chip",
    style: {
      alignSelf: "flex-start"
    }
  }, "Сейчас: ", activeRole.label))), /*#__PURE__*/React.createElement("p", {
    className: "demo-role-context"
  }, introByRole[role]), role === "student" && /*#__PURE__*/React.createElement(EducationShowcase, {
    cells: cells
  }), role === "teacher" && /*#__PURE__*/React.createElement(TeacherShowcase, {
    cells: cells,
    availabilities: availabilities,
    setAvailability: setAvailability
  }), role === "admin" && /*#__PURE__*/React.createElement(AdminShowcase, {
    cells: cells,
    setCells: setCells,
    availabilities: availabilities
  }))), /*#__PURE__*/React.createElement(Footer, null));
}

// ═══════════════════════════════════════════════
// LEGEND / GUIDE COMPONENT
// ═══════════════════════════════════════════════
function LegendGuide({
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
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
      maxWidth: 500,
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Справка по расписанию"), /*#__PURE__*/React.createElement("button", {
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: 18,
      color: 'var(--gray-400)'
    },
    onClick: onClose
  }, "×")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--primary)'
    }
  }, "Типы занятий"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: '#f3e8ff',
      color: '#7c3aed'
    }
  }, "Лек"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--gray-600)'
    }
  }, "Лекция — теоретическое занятие для группы")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: '#dbeafe',
      color: '#2563eb'
    }
  }, "Пр"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--gray-600)'
    }
  }, "Практика — практическое/семинарское занятие")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--primary)'
    }
  }, "Бейджи"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: '#fef3c7',
      color: '#b45309'
    }
  }, "Совмещ."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--gray-600)'
    }
  }, "Совмещённая пара — две группы вместе")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: '#f3f4f6',
      color: '#6b7280'
    }
  }, "Чёт / Нечёт"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--gray-600)'
    }
  }, "Занятие только на чётной или нечётной неделе")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: 'var(--primary)',
      color: '#fff'
    }
  }, "Сейчас"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--gray-600)'
    }
  }, "Текущее занятие (пульсирующий индикатор)")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--primary)'
    }
  }, "Навигация"), /*#__PURE__*/React.createElement("ul", {
    style: {
      fontSize: 13,
      color: 'var(--gray-600)',
      paddingLeft: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Ученик:"), " выберите группу для просмотра расписания. Переключайте чёт/нечёт неделю."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Преподаватель:"), " выберите себя из списка для просмотра расписания и редактирования доступности."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Учебная часть:"), " конструктор расписания, автогенерация, проверка конфликтов."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--primary)'
    }
  }, "Дисциплины"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, SUBJECTS.map(s => /*#__PURE__*/React.createElement("span", {
    key: s.id,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 500,
      background: `${s.color}10`,
      color: s.color,
      border: `1px solid ${s.color}30`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: s.color
    }
  }), s.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--primary)'
    }
  }, "Группы"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, GROUPS.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.code,
    style: {
      padding: 8,
      borderRadius: 8,
      background: 'var(--gray-50)',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, g.code), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gray-500)',
      marginLeft: 6
    }
  }, g.course, " курс • ", g.direction))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--primary)'
    }
  }, "Преподаватели"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, TEACHERS.map(t => /*#__PURE__*/React.createElement("span", {
    key: t.id,
    style: {
      padding: '3px 10px',
      borderRadius: 8,
      background: 'var(--gray-50)',
      fontSize: 12,
      fontWeight: 500
    }
  }, t.full)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--primary)'
    }
  }, "Аудитории"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, ROOMS.map(r => /*#__PURE__*/React.createElement("span", {
    key: r.id,
    style: {
      padding: '3px 10px',
      borderRadius: 8,
      background: 'var(--gray-50)',
      fontSize: 12,
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map-marker-alt",
    style: {
      marginRight: 4,
      fontSize: 10,
      color: 'var(--gray-400)'
    }
  }), "Ауд. ", r.name, " (", r.capacity, " чел., ", r.type === 'lecture' ? 'лекция' : 'лаб.', ")")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: onClose
  }, "Понятно"))));
}

// ═══════════════════════════════════════════════
// SUBJECT MANAGEMENT COMPONENT (Admin)
// ═══════════════════════════════════════════════
function SubjectManagement({
  cells
}) {
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Calculate hours per subject per group
  const subjectStats = useMemo(() => {
    const stats = {};
    for (const subject of SUBJECTS) {
      const subjectCells = cells.filter(c => c.subjectId === subject.id);
      const byGroup = {};
      for (const cell of subjectCells) {
        if (!byGroup[cell.groupCode]) byGroup[cell.groupCode] = 0;
        byGroup[cell.groupCode]++;
      }
      const teachers = [...new Set(subjectCells.map(c => c.teacherId))];
      stats[subject.id] = {
        totalHours: subjectCells.length,
        groups: Object.entries(byGroup).map(([code, hours]) => ({
          code,
          hours
        })),
        teachers: teachers.map(tid => teacherMap.get(tid)).filter(Boolean)
      };
    }
    return stats;
  }, [cells]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Управление дисциплинами"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, SUBJECTS.map(s => {
    const stat = subjectStats[s.id];
    const isExpanded = selectedSubject === s.id;
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      className: "card",
      style: {
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'var(--transition)'
      },
      onClick: () => setSelectedSubject(isExpanded ? null : s.id)
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: s.color,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)'
      }
    }, stat.totalHours, " ч/нед • ", stat.groups.length, " групп • ", stat.teachers.length, " преподав.")), /*#__PURE__*/React.createElement("span", {
      style: {
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        background: s.type === 'lek' ? '#f3e8ff' : '#dbeafe',
        color: s.type === 'lek' ? '#7c3aed' : '#2563eb'
      }
    }, s.type === 'lek' ? 'Лекция' : 'Практика'), /*#__PURE__*/React.createElement("i", {
      className: `fas fa-chevron-${isExpanded ? 'up' : 'down'}`,
      style: {
        color: 'var(--gray-400)',
        fontSize: 12
      }
    })), isExpanded && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 16px 16px',
        borderTop: '1px solid var(--gray-100)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--gray-500)',
        marginBottom: 8
      }
    }, "Группы и часы"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, stat.groups.map(g => /*#__PURE__*/React.createElement("div", {
      key: g.code,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px',
        borderRadius: 6,
        background: 'var(--gray-50)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 600
      }
    }, g.code), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--gray-500)'
      }
    }, g.hours, " ч"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--gray-500)',
        marginBottom: 8
      }
    }, "Преподаватели"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }
    }, stat.teachers.map(t => /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 8px',
        borderRadius: 6,
        background: 'var(--gray-50)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'var(--primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700
      }
    }, t.surname[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 500
      }
    }, t.full))))))));
  })));
}

// ═══════════════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════════════
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--dark)',
      color: '#fff',
      padding: '32px 0',
      marginTop: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "logo.png",
    alt: "",
    className: "planovo-logo-img",
    width: 44,
    height: 44,
    decoding: "async",
    style: {
      display: 'block',
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 16,
      background: 'var(--gradient-primary)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
  }, "Планово")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--gray-400)',
      lineHeight: 1.6
    }
  }, "Умное расписание для учебных учреждений, спортивных секций и клубов.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Решения"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "education.html",
    style: {
      fontSize: 12,
      color: 'var(--gray-400)',
      textDecoration: 'none',
      transition: 'color 0.2s'
    }
  }, "Учебные учреждения"), /*#__PURE__*/React.createElement("a", {
    href: "sports.html",
    style: {
      fontSize: 12,
      color: 'var(--gray-400)',
      textDecoration: 'none',
      transition: 'color 0.2s'
    }
  }, "Спортивные секции"), /*#__PURE__*/React.createElement("a", {
    href: "clubs.html",
    style: {
      fontSize: 12,
      color: 'var(--gray-400)',
      textDecoration: 'none',
      transition: 'color 0.2s'
    }
  }, "Клубы и мероприятия"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Контакты"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--gray-400)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-envelope",
    style: {
      marginRight: 6
    }
  }), "info@planovo.app"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--gray-400)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-phone",
    style: {
      marginRight: 6
    }
  }), "+7 (800) 123-45-67"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Демо"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--gray-400)',
      lineHeight: 1.6
    }
  }, "Это интерактивная демо-версия. Все данные сгенерированы автоматически."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      paddingTop: 16,
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--gray-500)'
    }
  }, "© 2025 Планово. Все права защищены."), /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    style: {
      fontSize: 11,
      color: 'var(--gray-500)',
      textDecoration: 'none'
    }
  }, "Вернуться на сайт →"))));
}

// ═══════════════════════════════════════════════
// QUICK STATS BAR
// ═══════════════════════════════════════════════
function QuickStatsBar({
  cells
}) {
  const stats = useMemo(() => {
    const totalPairs = cells.length;
    const lecturePairs = cells.filter(c => subjectMap.get(c.subjectId)?.type === 'lek').length;
    const practicePairs = totalPairs - lecturePairs;
    const combinedPairs = cells.filter(c => c.combined).length;
    const paritySplit = cells.filter(c => {
      const sameSlotOther = cells.find(c2 => c2.groupCode === c.groupCode && c2.dayKey === c.dayKey && c2.slotIndex === c.slotIndex && c2.parity !== c.parity && c2.subjectId === c.subjectId);
      return !sameSlotOther;
    }).length;
    const uniqueSubjects = new Set(cells.map(c => c.subjectId)).size;
    const busyRooms = new Set(cells.map(c => c.roomId)).size;
    return {
      totalPairs,
      lecturePairs,
      practicePairs,
      combinedPairs,
      uniqueSubjects,
      busyRooms
    };
  }, [cells]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 12,
      marginBottom: 24,
      padding: 16,
      borderRadius: 16,
      background: 'var(--gray-50)',
      border: '1px solid var(--gray-200)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      background: 'var(--gradient-primary)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
  }, stats.totalPairs), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--gray-500)',
      fontWeight: 600
    }
  }, "Всего занятий")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#7c3aed'
    }
  }, stats.lecturePairs), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--gray-500)',
      fontWeight: 600
    }
  }, "Лекций")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#2563eb'
    }
  }, stats.practicePairs), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--gray-500)',
      fontWeight: 600
    }
  }, "Практик")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#b45309'
    }
  }, stats.combinedPairs), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--gray-500)',
      fontWeight: 600
    }
  }, "Совмещённых")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: 'var(--primary)'
    }
  }, stats.uniqueSubjects), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--gray-500)',
      fontWeight: 600
    }
  }, "Дисциплин")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: 'var(--accent)'
    }
  }, stats.busyRooms), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--gray-500)',
      fontWeight: 600
    }
  }, "Аудиторий")));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));

// ═══════════════════════════════════════════════
// SERVICE WORKER REGISTRATION (optional, for offline)
// ═══════════════════════════════════════════════
// This demo does not use a service worker, but in production
// you would register one here for offline capabilities.

// ═══════════════════════════════════════════════
// END OF APPLICATION
// ═══════════════════════════════════════════════
// This is a standalone demo page for the Planovo
// education scheduling system. It uses React 18
// via CDN with Babel standalone for JSX transformation.
//
// Features:
// - Student view with weekly schedule grid
// - Teacher view with personal schedule and availability editor
// - Admin view with constructor, auto-generation, and conflict detection
// - Deterministic schedule generation using mulberry32 PRNG
// - 6 groups, 12 teachers, 16 subjects, 12 rooms
// - Responsive design for mobile and desktop
// - Inter font, Planovo design system colors
// - All text in Russian
