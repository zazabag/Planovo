import type {
  TimeSlot,
  DayInfo,
  Group,
  Teacher,
  Subject,
  Room,
  ScheduleCell,
  TeacherAvailability,
  Parity,
} from "./types";

// ──────────────────────────────────────────────
// Deterministic PRNG: mulberry32 seeded by FNV-1a hash
// ──────────────────────────────────────────────

function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ──────────────────────────────────────────────
// TIME SLOTS — matching ScheduleKEMS
// ──────────────────────────────────────────────

export const TIME_SLOTS: TimeSlot[] = [
  { index: 0, start: "08:20", end: "09:50", label: "1 пара", startMinutes: 500, endMinutes: 590 },
  { index: 1, start: "10:00", end: "11:30", label: "2 пара", startMinutes: 600, endMinutes: 690 },
  { index: 2, start: "11:40", end: "13:10", label: "3 пара", startMinutes: 700, endMinutes: 790 },
  { index: 3, start: "13:30", end: "15:00", label: "4 пара", startMinutes: 810, endMinutes: 900 },
  { index: 4, start: "15:10", end: "16:40", label: "5 пара", startMinutes: 910, endMinutes: 1000 },
  { index: 5, start: "16:50", end: "18:20", label: "6 пара", startMinutes: 1010, endMinutes: 1100 },
  { index: 6, start: "18:30", end: "20:00", label: "7 пара", startMinutes: 1110, endMinutes: 1200 },
  { index: 7, start: "20:10", end: "21:40", label: "8 пара", startMinutes: 1210, endMinutes: 1300 },
];

// ──────────────────────────────────────────────
// DAYS
// ──────────────────────────────────────────────

export const DAYS: DayInfo[] = [
  { key: "mon", short: "Пн", full: "Понедельник" },
  { key: "tue", short: "Вт", full: "Вторник" },
  { key: "wed", short: "Ср", full: "Среда" },
  { key: "thu", short: "Чт", full: "Четверг" },
  { key: "fri", short: "Пт", full: "Пятница" },
  { key: "sat", short: "Сб", full: "Суббота" },
];

// ──────────────────────────────────────────────
// GROUPS
// ──────────────────────────────────────────────

export const GROUPS: Group[] = [
  { code: "ОЭ-11", direction: "Экономика и право", course: 1, groupNo: 1, label: "ОЭ-11 (1 курс)" },
  { code: "ОЭ-12", direction: "Экономика и право", course: 1, groupNo: 2, label: "ОЭ-12 (1 курс)" },
  { code: "ОЭ-21", direction: "Экономика и право", course: 2, groupNo: 1, label: "ОЭ-21 (2 курс)" },
  { code: "ОЭ-22", direction: "Экономика и право", course: 2, groupNo: 2, label: "ОЭ-22 (2 курс)" },
  { code: "ОЭ-31", direction: "Экономика и право", course: 3, groupNo: 1, label: "ОЭ-31 (3 курс)" },
  { code: "ОЭ-32", direction: "Экономика и право", course: 3, groupNo: 2, label: "ОЭ-32 (3 курс)" },
];

// ──────────────────────────────────────────────
// TEACHERS
// ──────────────────────────────────────────────

export const TEACHERS: Teacher[] = [
  { id: "t1", surname: "Буфеев", initials: "И.В.", full: "Буфеев И.В.", maxDailyLoad: 4, maxWeeklyLoad: 18 },
  { id: "t2", surname: "Малый", initials: "С.Н.", full: "Малый С.Н.", maxDailyLoad: 4, maxWeeklyLoad: 18 },
  { id: "t3", surname: "Карпова", initials: "Е.А.", full: "Карпова Е.А.", maxDailyLoad: 4, maxWeeklyLoad: 18 },
  { id: "t4", surname: "Смирнов", initials: "А.П.", full: "Смирнов А.П.", maxDailyLoad: 4, maxWeeklyLoad: 20 },
  { id: "t5", surname: "Лебедева", initials: "Н.Г.", full: "Лебедева Н.Г.", maxDailyLoad: 3, maxWeeklyLoad: 16 },
  { id: "t6", surname: "Козлов", initials: "Д.В.", full: "Козлов Д.В.", maxDailyLoad: 4, maxWeeklyLoad: 18 },
  { id: "t7", surname: "Новикова", initials: "М.И.", full: "Новикова М.И.", maxDailyLoad: 4, maxWeeklyLoad: 20 },
  { id: "t8", surname: "Волков", initials: "С.А.", full: "Волков С.А.", maxDailyLoad: 3, maxWeeklyLoad: 16 },
  { id: "t9", surname: "Морозова", initials: "Т.К.", full: "Морозова Т.К.", maxDailyLoad: 4, maxWeeklyLoad: 18 },
  { id: "t10", surname: "Соколов", initials: "В.М.", full: "Соколов В.М.", maxDailyLoad: 4, maxWeeklyLoad: 18 },
  { id: "t11", surname: "Зайцева", initials: "Л.Р.", full: "Зайцева Л.Р.", maxDailyLoad: 3, maxWeeklyLoad: 16 },
  { id: "t12", surname: "Павлов", initials: "Г.Е.", full: "Павлов Г.Е.", maxDailyLoad: 4, maxWeeklyLoad: 20 },
];

// ──────────────────────────────────────────────
// SUBJECTS
// ──────────────────────────────────────────────

export const SUBJECTS: Subject[] = [
  { id: "s1", name: "Математика", shortName: "Матем.", type: "pr", color: "#6366f1" },
  { id: "s2", name: "Экономика", shortName: "Экон.", type: "lek", color: "#8b5cf6" },
  { id: "s3", name: "Правоведение", shortName: "Право", type: "lek", color: "#06b6d4" },
  { id: "s4", name: "Физкультура", shortName: "Физ-ра", type: "pr", color: "#10b981" },
  { id: "s5", name: "Информатика", shortName: "Информ.", type: "pr", color: "#f59e0b" },
  { id: "s6", name: "Философия", shortName: "Филос.", type: "lek", color: "#ec4899" },
  { id: "s7", name: "Английский язык", shortName: "Англ.", type: "pr", color: "#14b8a6" },
  { id: "s8", name: "Статистика", shortName: "Стат.", type: "lek", color: "#f97316" },
  { id: "s9", name: "Бухгалтерский учёт", shortName: "Бухуч.", type: "lek", color: "#ef4444" },
  { id: "s10", name: "Менеджмент", shortName: "Мендж.", type: "lek", color: "#a855f7" },
  { id: "s11", name: "История", shortName: "Истор.", type: "lek", color: "#0ea5e9" },
  { id: "s12", name: "Финансы", shortName: "Фин.", type: "lek", color: "#84cc16" },
  { id: "s13", name: "Маркетинг", shortName: "Марк.", type: "lek", color: "#d946ef" },
  { id: "s14", name: "Лаб. информатика", shortName: "Лаб.Инф.", type: "pr", color: "#eab308" },
  { id: "s15", name: "Гражданское право", shortName: "Гр.право", type: "lek", color: "#22d3ee" },
  { id: "s16", name: "Экология", shortName: "Экол.", type: "lek", color: "#34d399" },
];

// ──────────────────────────────────────────────
// ROOMS
// ──────────────────────────────────────────────

export const ROOMS: Room[] = [
  { id: "r1", name: "21", capacity: 30, type: "lecture" },
  { id: "r2", name: "22", capacity: 30, type: "lecture" },
  { id: "r3", name: "23", capacity: 30, type: "lecture" },
  { id: "r4", name: "24", capacity: 25, type: "lecture" },
  { id: "r5", name: "25", capacity: 25, type: "lecture" },
  { id: "r6", name: "31", capacity: 30, type: "lecture" },
  { id: "r7", name: "32", capacity: 30, type: "lecture" },
  { id: "r8", name: "33", capacity: 25, type: "lecture" },
  { id: "r9", name: "34", capacity: 25, type: "lecture" },
  { id: "r10", name: "35", capacity: 20, type: "lecture" },
  { id: "r11", name: "Лаб-1", capacity: 15, type: "lab" },
  { id: "r12", name: "Лаб-2", capacity: 15, type: "lab" },
];

// ──────────────────────────────────────────────
// Lookup helpers
// ──────────────────────────────────────────────

export const subjectById = new Map(SUBJECTS.map((s) => [s.id, s]));
export const teacherById = new Map(TEACHERS.map((t) => [t.id, t]));
export const roomById = new Map(ROOMS.map((r) => [r.id, r]));
export const groupByCode = new Map(GROUPS.map((g) => [g.code, g]));

// ──────────────────────────────────────────────
// Teacher → Subject assignments (deterministic)
// Each teacher teaches 2-3 subjects across groups
// ──────────────────────────────────────────────

export interface TeacherSubjectAssignment {
  teacherId: string;
  subjectId: string;
  groupCodes: string[];
}

export const TEACHER_SUBJECTS: TeacherSubjectAssignment[] = [
  // Course 1
  { teacherId: "t1", subjectId: "s1", groupCodes: ["ОЭ-11", "ОЭ-12"] }, // Буфеев → Математика
  { teacherId: "t2", subjectId: "s5", groupCodes: ["ОЭ-11", "ОЭ-12"] }, // Малый → Информатика
  { teacherId: "t3", subjectId: "s7", groupCodes: ["ОЭ-11", "ОЭ-12"] }, // Карпова → Английский
  { teacherId: "t4", subjectId: "s11", groupCodes: ["ОЭ-11", "ОЭ-12"] }, // Смирнов → История
  { teacherId: "t5", subjectId: "s4", groupCodes: ["ОЭ-11", "ОЭ-12"] }, // Лебедева → Физкультура
  { teacherId: "t6", subjectId: "s6", groupCodes: ["ОЭ-11", "ОЭ-12"] }, // Козлов → Философия

  // Course 2
  { teacherId: "t1", subjectId: "s8", groupCodes: ["ОЭ-21", "ОЭ-22"] }, // Буфеев → Статистика
  { teacherId: "t7", subjectId: "s2", groupCodes: ["ОЭ-21", "ОЭ-22"] }, // Новикова → Экономика
  { teacherId: "t8", subjectId: "s9", groupCodes: ["ОЭ-21", "ОЭ-22"] }, // Волков → Бухучёт
  { teacherId: "t9", subjectId: "s10", groupCodes: ["ОЭ-21", "ОЭ-22"] }, // Морозова → Менеджмент
  { teacherId: "t5", subjectId: "s4", groupCodes: ["ОЭ-21", "ОЭ-22"] }, // Лебедева → Физкультура (also course 2)
  { teacherId: "t2", subjectId: "s14", groupCodes: ["ОЭ-21", "ОЭ-22"] }, // Малый → Лаб. информатика

  // Course 3
  { teacherId: "t10", subjectId: "s12", groupCodes: ["ОЭ-31", "ОЭ-32"] }, // Соколов → Финансы
  { teacherId: "t11", subjectId: "s13", groupCodes: ["ОЭ-31", "ОЭ-32"] }, // Зайцева → Маркетинг
  { teacherId: "t12", subjectId: "s3", groupCodes: ["ОЭ-31", "ОЭ-32"] }, // Павлов → Правоведение
  { teacherId: "t7", subjectId: "s2", groupCodes: ["ОЭ-31", "ОЭ-32"] }, // Новикова → Экономика (also course 3)
  { teacherId: "t3", subjectId: "s15", groupCodes: ["ОЭ-31", "ОЭ-32"] }, // Карпова → Гражданское право
  { teacherId: "t6", subjectId: "s16", groupCodes: ["ОЭ-31", "ОЭ-32"] }, // Козлов → Экология
];

// ──────────────────────────────────────────────
// Room assignment preferences
// ──────────────────────────────────────────────

const LECTURE_ROOMS = ROOMS.filter((r) => r.type === "lecture").map((r) => r.id);
const LAB_ROOMS = ROOMS.filter((r) => r.type === "lab").map((r) => r.id);

function preferredRoomId(subjectId: string, rng: () => number): string {
  const subject = subjectById.get(subjectId);
  if (!subject) return LECTURE_ROOMS[0];
  if (subject.id === "s14") return LAB_ROOMS[Math.floor(rng() * LAB_ROOMS.length)];
  // Lab-type subjects need lab rooms
  if (subject.name.toLowerCase().includes("лаб")) return LAB_ROOMS[Math.floor(rng() * LAB_ROOMS.length)];
  return LECTURE_ROOMS[Math.floor(rng() * LECTURE_ROOMS.length)];
}

// ──────────────────────────────────────────────
// generateMockSchedule — deterministic seeded generator
// ──────────────────────────────────────────────

let _cellCounter = 0;
function nextCellId(): string {
  return `cell-${++_cellCounter}`;
}

export function generateMockSchedule(seed: string = "planovo-demo-2025"): ScheduleCell[] {
  _cellCounter = 0;
  const rng = mulberry32(fnv1a(seed));
  const cells: ScheduleCell[] = [];

  // Track teacher daily load: teacherId -> dayKey -> count
  const teacherDailyLoad: Record<string, Record<string, number>> = {};
  for (const t of TEACHERS) {
    teacherDailyLoad[t.id] = {};
    for (const d of DAYS) {
      teacherDailyLoad[t.id][d.key] = 0;
    }
  }

  // Track room daily load: roomId -> dayKey+slotIndex -> count
  const roomSlotLoad: Record<string, Record<string, number>> = {};
  for (const r of ROOMS) {
    roomSlotLoad[r.id] = {};
  }

  // Track group daily load: groupCode -> dayKey -> count
  const groupDailyLoad: Record<string, Record<string, number>> = {};
  for (const g of GROUPS) {
    groupDailyLoad[g.code] = {};
    for (const d of DAYS) {
      groupDailyLoad[g.code][d.key] = 0;
    }
  }

  // Track teacher-slot occupancy: teacherId -> dayKey:slotIndex:parity -> boolean
  const teacherSlotOccupied: Record<string, Set<string>> = {};
  for (const t of TEACHERS) {
    teacherSlotOccupied[t.id] = new Set();
  }

  // Combined pairs definition — some pairs where two groups share a lecture
  const combinedPairs: Array<{
    groupCodes: [string, string];
    subjectId: string;
    teacherId: string;
    dayKey: string;
    slotIndex: number;
    parity: Parity;
    roomId: string;
  }> = [];

  // We'll process each teacher-subject assignment
  for (const tsa of TEACHER_SUBJECTS) {
    const { teacherId, subjectId, groupCodes } = tsa;
    const teacher = teacherById.get(teacherId)!;
    const subject = subjectById.get(subjectId)!;

    // Each group gets 1-2 hours per week of this subject
    const hoursPerGroup = subject.type === "lek" ? 1 : 1;

    for (const groupCode of groupCodes) {
      for (let h = 0; h < hoursPerGroup; h++) {
        // Determine parity: most pairs are "even", some are split by parity
        const useParity = rng() < 0.25; // 25% chance of parity-specific pair
        const parities: Parity[] = useParity ? (rng() < 0.5 ? ["even"] : ["odd"]) : ["even", "odd"];

        // Try to find a valid slot
        let placed = false;
        const maxAttempts = 50;
        let attempt = 0;

        while (!placed && attempt < maxAttempts) {
          attempt++;

          // Pick a day (weighted: weekdays more likely than Saturday)
          const isSaturday = rng() < 0.15;
          const dayKey = isSaturday
            ? "sat"
            : DAYS[Math.floor(rng() * 5)].key;

          const isSatDay = dayKey === "sat";
          const maxSlot = isSatDay ? 3 : 5; // Saturday: 2-3 slots, Weekday: 4-5
          const slotIndex = Math.floor(rng() * maxSlot);

          // Check teacher daily load
          if ((teacherDailyLoad[teacherId][dayKey] || 0) >= teacher.maxDailyLoad) continue;

          // Check teacher weekly load
          const currentWeekly = Object.values(teacherDailyLoad[teacherId]).reduce((a, b) => a + b, 0);
          if (currentWeekly >= teacher.maxWeeklyLoad) break;

          // Check group daily load
          if ((groupDailyLoad[groupCode][dayKey] || 0) >= (isSatDay ? 3 : 5)) continue;

          // Check teacher not already occupied at this slot+parity
          let slotOk = true;
          for (const p of parities) {
            const slotKey = `${dayKey}:${slotIndex}:${p}`;
            if (teacherSlotOccupied[teacherId].has(slotKey)) {
              slotOk = false;
              break;
            }
          }
          if (!slotOk) continue;

          // Check for existing group cell at this slot+parity
          const existingGroupCell = cells.find(
            (c) =>
              c.groupCode === groupCode &&
              c.dayKey === dayKey &&
              c.slotIndex === slotIndex &&
              parities.includes(c.parity)
          );
          if (existingGroupCell) continue;

          // Find a room
          const roomId = preferredRoomId(subjectId, rng);
          const roomSlotKey = `${dayKey}:${slotIndex}`;

          // Place the cell for each parity
          for (const parity of parities) {
            const cell: ScheduleCell = {
              id: nextCellId(),
              groupCode,
              dayKey,
              slotIndex,
              parity,
              subjectId,
              teacherId,
              roomId,
              combined: false,
            };
            cells.push(cell);

            // Update tracking
            const tSlotKey = `${dayKey}:${slotIndex}:${parity}`;
            teacherSlotOccupied[teacherId].add(tSlotKey);
          }

          teacherDailyLoad[teacherId][dayKey] = (teacherDailyLoad[teacherId][dayKey] || 0) + 1;
          groupDailyLoad[groupCode][dayKey] = (groupDailyLoad[groupCode][dayKey] || 0) + 1;
          roomSlotLoad[roomId][roomSlotKey] = (roomSlotLoad[roomId][roomSlotKey] || 0) + 1;
          placed = true;
        }
      }
    }
  }

  // Add some combined pairs — 2-3 per week
  // Combined: two groups of the same course share a lecture
  const combinedCourseGroups: Array<[string, string]> = [
    ["ОЭ-11", "ОЭ-12"],
    ["ОЭ-21", "ОЭ-22"],
    ["ОЭ-31", "ОЭ-32"],
  ];

  const combinedSubjects: Array<{ subjectId: string; teacherId: string }> = [
    { subjectId: "s2", teacherId: "t7" }, // Экономика - Новикова
    { subjectId: "s11", teacherId: "t4" }, // История - Смирнов
    { subjectId: "s6", teacherId: "t6" }, // Философия - Козлов
  ];

  for (let i = 0; i < combinedCourseGroups.length; i++) {
    const [g1, g2] = combinedCourseGroups[i];
    const { subjectId, teacherId } = combinedSubjects[i % combinedSubjects.length];
    const subject = subjectById.get(subjectId)!;

    // Pick a day and slot for the combined pair
    const dayKey = DAYS[Math.floor(rng() * 5)].key;
    const slotIndex = Math.floor(rng() * 4); // slots 0-3
    const roomId = preferredRoomId(subjectId, rng);
    const combinedKey = `combined-${g1}-${g2}-${subjectId}`;

    // Remove existing cells for these groups at this slot to make room for combined
    for (const g of [g1, g2]) {
      const existingIdx = cells.findIndex(
        (c) =>
          c.groupCode === g &&
          c.dayKey === dayKey &&
          c.slotIndex === slotIndex
      );
      if (existingIdx >= 0) {
        const removed = cells.splice(existingIdx, 1)[0];
        // Undo teacher slot tracking
        const tSlotKey = `${removed.dayKey}:${removed.slotIndex}:${removed.parity}`;
        teacherSlotOccupied[removed.teacherId]?.delete(tSlotKey);
      }
    }

    // Place combined cells for both parities
    for (const parity of ["even", "odd"] as Parity[]) {
      const tSlotKey = `${dayKey}:${slotIndex}:${parity}`;
      if (!teacherSlotOccupied[teacherId].has(tSlotKey)) {
        for (const groupCode of [g1, g2]) {
          cells.push({
            id: nextCellId(),
            groupCode,
            dayKey,
            slotIndex,
            parity,
            subjectId,
            teacherId,
            roomId,
            combined: true,
            combinedKey,
          });
        }
        teacherSlotOccupied[teacherId].add(tSlotKey);
      }
    }
  }

  // Add extra pairs for parity-splitting: some subjects only on even or odd weeks
  // This adds a few more entries to make the schedule feel more realistic
  const parityOnlySubjects: Array<{
    groupCode: string;
    subjectId: string;
    teacherId: string;
  }> = [
    { groupCode: "ОЭ-11", subjectId: "s14", teacherId: "t2" }, // Лаб. информатика
    { groupCode: "ОЭ-12", subjectId: "s14", teacherId: "t2" },
    { groupCode: "ОЭ-21", subjectId: "s3", teacherId: "t12" }, // Правоведение
    { groupCode: "ОЭ-22", subjectId: "s3", teacherId: "t12" },
    { groupCode: "ОЭ-31", subjectId: "s9", teacherId: "t8" }, // Бухучёт
    { groupCode: "ОЭ-32", subjectId: "s9", teacherId: "t8" },
  ];

  for (const pos of parityOnlySubjects) {
    const parity: Parity = rng() < 0.5 ? "even" : "odd";
    const dayKey = DAYS[Math.floor(rng() * 5)].key;
    const slotIndex = Math.floor(rng() * 4);
    const subject = subjectById.get(pos.subjectId)!;
    const roomId = preferredRoomId(pos.subjectId, rng);

    // Check if the slot is already taken for this group at this parity
    const existing = cells.find(
      (c) =>
        c.groupCode === pos.groupCode &&
        c.dayKey === dayKey &&
        c.slotIndex === slotIndex &&
        c.parity === parity
    );
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
      combined: false,
    });
    teacherSlotOccupied[pos.teacherId].add(tSlotKey);
  }

  return cells;
}

// ──────────────────────────────────────────────
// generateMockAvailability
// ──────────────────────────────────────────────

export function generateMockAvailability(seed: string = "planovo-avail-2025"): Record<string, TeacherAvailability> {
  const rng = mulberry32(fnv1a(seed));
  const result: Record<string, TeacherAvailability> = {};

  for (const teacher of TEACHERS) {
    const cells: { dayKey: string; slotIndex: number; parity: Parity }[] = [];

    // Each teacher is available most slots, with a few blocked
    const blockedSlots = new Set<string>();

    // Block 2-4 random slots per teacher
    const numBlocked = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < numBlocked; i++) {
      const dayKey = DAYS[Math.floor(rng() * DAYS.length)].key;
      const slotIndex = Math.floor(rng() * TIME_SLOTS.length);
      blockedSlots.add(`${dayKey}:${slotIndex}`);
    }

    // Build availability from all non-blocked slots
    for (const day of DAYS) {
      const maxSlot = day.key === "sat" ? 3 : TIME_SLOTS.length;
      for (let si = 0; si < maxSlot; si++) {
        if (!blockedSlots.has(`${day.key}:${si}`)) {
          cells.push({ dayKey: day.key, slotIndex: si, parity: "even" });
          cells.push({ dayKey: day.key, slotIndex: si, parity: "odd" });
        }
      }
    }

    result[teacher.id] = {
      teacherId: teacher.id,
      cells,
      submittedParities: ["even", "odd"],
      updatedAt: new Date().toISOString(),
    };
  }

  return result;
}
