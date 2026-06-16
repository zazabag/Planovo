import { create } from "zustand";
import type {
  UserRole,
  Parity,
  ScheduleCell,
  TeacherAvailability,
  WeekSchedule,
  DaySchedule,
  PairInfo,
  Conflict,
  AutoGenConfig,
  AutoGenSubject,
  AutoGenConstraint,
  AutoGenResult,
} from "@/lib/schedule/types";
import {
  generateMockSchedule,
  generateMockAvailability,
  subjectById,
  teacherById,
  roomById,
  DAYS,
  TIME_SLOTS,
} from "@/lib/schedule/mock-data";

interface ScheduleStore {
  // ── Role state ──
  role: UserRole;
  setRole: (role: UserRole) => void;

  // ── Student view state ──
  selectedGroupCode: string | null;
  setSelectedGroupCode: (code: string) => void;

  // ── Teacher view state ──
  selectedTeacherId: string | null;
  setSelectedTeacherId: (id: string) => void;

  // ── Admin view state ──
  adminGroupCode: string | null;
  setAdminGroupCode: (code: string) => void;
  adminDayKey: string;
  setAdminDayKey: (key: string) => void;
  adminParity: Parity;
  setAdminParity: (p: Parity) => void;

  // ── Schedule data ──
  cells: ScheduleCell[];
  setCells: (cells: ScheduleCell[]) => void;
  updateCell: (id: string, updates: Partial<ScheduleCell>) => void;
  addCell: (cell: ScheduleCell) => void;
  removeCell: (id: string) => void;

  // ── Teacher availability ──
  availabilities: Record<string, TeacherAvailability>;
  setAvailability: (teacherId: string, avail: TeacherAvailability) => void;

  // ── Schedule generation ──
  isGenerating: boolean;
  generationProgress: string[];
  generationResult: AutoGenResult | null;

  // ── Published state ──
  isPublished: boolean;
  publishedAt: string | null;
  publish: () => void;

  // ── Computed: get group schedule ──
  getGroupWeekSchedule: (groupCode: string) => WeekSchedule;

  // ── Computed: get teacher schedule ──
  getTeacherWeekSchedule: (teacherId: string) => WeekSchedule;

  // ── Computed: get conflicts ──
  getConflicts: () => Conflict[];

  // ── Auto-generate schedule ──
  autoGenerate: (config: AutoGenConfig, subjects: AutoGenSubject[], constraints: AutoGenConstraint[]) => void;

  // ── Week parity ──
  currentParity: Parity;
  setCurrentParity: (p: Parity) => void;

  // ── Initialize with mock data ──
  initializeDemo: () => void;
}

function buildEmptyDaySchedule(): DaySchedule {
  const day: DaySchedule = {};
  for (let i = 0; i < TIME_SLOTS.length; i++) {
    day[i] = { even: null, odd: null };
  }
  return day;
}

function buildEmptyWeekSchedule(): WeekSchedule {
  const week: WeekSchedule = {};
  for (const d of DAYS) {
    week[d.key] = buildEmptyDaySchedule();
  }
  return week;
}

function cellToPairInfo(cell: ScheduleCell, extraGroups?: string[]): PairInfo | null {
  const subject = subjectById.get(cell.subjectId);
  const teacher = teacherById.get(cell.teacherId);
  const room = roomById.get(cell.roomId);
  if (!subject || !teacher || !room) return null;
  return {
    subject,
    teacher,
    room,
    parity: cell.parity,
    combined: cell.combined,
    groups: extraGroups,
  };
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  // ── Role ──
  role: "student",
  setRole: (role) => set({ role }),

  // ── Student view ──
  selectedGroupCode: null,
  setSelectedGroupCode: (code) => set({ selectedGroupCode: code }),

  // ── Teacher view ──
  selectedTeacherId: null,
  setSelectedTeacherId: (id) => set({ selectedTeacherId: id }),

  // ── Admin view ──
  adminGroupCode: null,
  setAdminGroupCode: (code) => set({ adminGroupCode: code }),
  adminDayKey: "mon",
  setAdminDayKey: (key) => set({ adminDayKey: key }),
  adminParity: "even",
  setAdminParity: (p) => set({ adminParity: p }),

  // ── Schedule data ──
  cells: [],
  setCells: (cells) => set({ cells }),
  updateCell: (id, updates) =>
    set((state) => ({
      cells: state.cells.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  addCell: (cell) => set((state) => ({ cells: [...state.cells, cell] })),
  removeCell: (id) =>
    set((state) => ({
      cells: state.cells.filter((c) => c.id !== id),
    })),

  // ── Teacher availability ──
  availabilities: {},
  setAvailability: (teacherId, avail) =>
    set((state) => ({
      availabilities: { ...state.availabilities, [teacherId]: avail },
    })),

  // ── Generation ──
  isGenerating: false,
  generationProgress: [],
  generationResult: null,

  // ── Published ──
  isPublished: false,
  publishedAt: null,
  publish: () =>
    set({
      isPublished: true,
      publishedAt: new Date().toISOString(),
    }),

  // ── Parity ──
  currentParity: "even",
  setCurrentParity: (p) => set({ currentParity: p }),

  // ── Computed: group week schedule ──
  getGroupWeekSchedule: (groupCode) => {
    const { cells } = get();
    const week = buildEmptyWeekSchedule();

    const groupCells = cells.filter((c) => c.groupCode === groupCode);

    // Collect combined groups info
    const combinedKeyGroups: Record<string, string[]> = {};
    for (const cell of groupCells) {
      if (cell.combinedKey) {
        if (!combinedKeyGroups[cell.combinedKey]) {
          combinedKeyGroups[cell.combinedKey] = [];
        }
        if (!combinedKeyGroups[cell.combinedKey].includes(cell.groupCode)) {
          combinedKeyGroups[cell.combinedKey].push(cell.groupCode);
        }
      }
    }

    // Also look at cells from other groups with same combinedKey
    for (const cell of cells) {
      if (cell.combinedKey && !combinedKeyGroups[cell.combinedKey]) {
        if (!combinedKeyGroups[cell.combinedKey]) {
          combinedKeyGroups[cell.combinedKey] = [];
        }
        if (!combinedKeyGroups[cell.combinedKey].includes(cell.groupCode)) {
          combinedKeyGroups[cell.combinedKey].push(cell.groupCode);
        }
      }
    }

    for (const cell of groupCells) {
      const extraGroups = cell.combinedKey
        ? combinedKeyGroups[cell.combinedKey]
        : undefined;
      const info = cellToPairInfo(cell, extraGroups);
      if (info && week[cell.dayKey]?.[cell.slotIndex]) {
        week[cell.dayKey][cell.slotIndex][cell.parity] = info;
      }
    }

    return week;
  },

  // ── Computed: teacher week schedule ──
  getTeacherWeekSchedule: (teacherId) => {
    const { cells } = get();
    const week = buildEmptyWeekSchedule();

    const teacherCells = cells.filter((c) => c.teacherId === teacherId);

    for (const cell of teacherCells) {
      // For teacher view, show which groups they teach
      const sameSlotCells = cells.filter(
        (c2) =>
          c2.dayKey === cell.dayKey &&
          c2.slotIndex === cell.slotIndex &&
          c2.parity === cell.parity &&
          c2.teacherId === teacherId
      );
      const groupCodes = [...new Set(sameSlotCells.map((c) => c.groupCode))];
      const info = cellToPairInfo(cell, groupCodes);
      if (info && week[cell.dayKey]?.[cell.slotIndex]) {
        week[cell.dayKey][cell.slotIndex][cell.parity] = info;
      }
    }

    return week;
  },

  // ── Computed: conflicts ──
  getConflicts: () => {
    const { cells, availabilities } = get();
    const conflicts: Conflict[] = [];

    // Group by dayKey:slotIndex:parity
    const slotMap: Record<string, ScheduleCell[]> = {};
    for (const cell of cells) {
      const key = `${cell.dayKey}:${cell.slotIndex}:${cell.parity}`;
      if (!slotMap[key]) slotMap[key] = [];
      slotMap[key].push(cell);
    }

    for (const [_slotKey, slotCells] of Object.entries(slotMap)) {
      // Group conflicts: same group, same slot+parity, multiple cells
      const byGroup: Record<string, ScheduleCell[]> = {};
      for (const c of slotCells) {
        if (!byGroup[c.groupCode]) byGroup[c.groupCode] = [];
        byGroup[c.groupCode].push(c);
      }
      for (const [groupCode, groupCells] of Object.entries(byGroup)) {
        if (groupCells.length > 1) {
          // If they share a combinedKey, it's not a conflict
          const nonCombined = groupCells.filter((c) => !c.combinedKey);
          const combinedByKey: Record<string, ScheduleCell[]> = {};
          for (const c of groupCells) {
            if (c.combinedKey) {
              if (!combinedByKey[c.combinedKey]) combinedByKey[c.combinedKey] = [];
              combinedByKey[c.combinedKey].push(c);
            }
          }
          const hasConflict =
            nonCombined.length > 1 ||
            Object.values(combinedByKey).some((arr) => arr.length > 1);

          if (hasConflict) {
            conflicts.push({
              type: "group-conflict",
              severity: "error",
              message: `Группа ${groupCode}: конфликт в ${_slotKey.replace(":", " пара ")} — ${groupCells.length} занятий`,
              cellIds: groupCells.map((c) => c.id),
            });
          }
        }
      }

      // Teacher conflicts: same teacher, same slot+parity, different groups (not combined)
      const byTeacher: Record<string, ScheduleCell[]> = {};
      for (const c of slotCells) {
        if (!byTeacher[c.teacherId]) byTeacher[c.teacherId] = [];
        byTeacher[c.teacherId].push(c);
      }
      for (const [teacherId, teacherCells] of Object.entries(byTeacher)) {
        const combinedKeys = new Set(teacherCells.filter((c) => c.combinedKey).map((c) => c.combinedKey!));
        const nonCombined = teacherCells.filter((c) => !c.combinedKey);

        if (nonCombined.length > 1 || (nonCombined.length > 0 && combinedKeys.size > 0)) {
          const teacher = teacherById.get(teacherId);
          conflicts.push({
            type: "teacher-conflict",
            severity: "error",
            message: `Преподаватель ${teacher?.full ?? teacherId}: конфликт в ${_slotKey.replace(":", " пара ")}`,
            cellIds: teacherCells.map((c) => c.id),
          });
        }
      }

      // Room conflicts: same room, same slot+parity, different cells (not combined)
      const byRoom: Record<string, ScheduleCell[]> = {};
      for (const c of slotCells) {
        if (!byRoom[c.roomId]) byRoom[c.roomId] = [];
        byRoom[c.roomId].push(c);
      }
      for (const [roomId, roomCells] of Object.entries(byRoom)) {
        const combinedKeys = new Set(roomCells.filter((c) => c.combinedKey).map((c) => c.combinedKey!));
        const nonCombined = roomCells.filter((c) => !c.combinedKey);

        if (nonCombined.length > 1 || (nonCombined.length > 0 && combinedKeys.size > 0)) {
          const room = roomById.get(roomId);
          conflicts.push({
            type: "room-conflict",
            severity: "error",
            message: `Аудитория ${room?.name ?? roomId}: конфликт в ${_slotKey.replace(":", " пара ")}`,
            cellIds: roomCells.map((c) => c.id),
          });
        }
      }
    }

    // Incomplete references
    for (const cell of cells) {
      if (!teacherById.has(cell.teacherId)) {
        conflicts.push({
          type: "incomplete-teacher",
          severity: "warning",
          message: `Занятие для группы ${cell.groupCode}: преподаватель не найден (${cell.teacherId})`,
          cellIds: [cell.id],
        });
      }
      if (!roomById.has(cell.roomId)) {
        conflicts.push({
          type: "incomplete-room",
          severity: "warning",
          message: `Занятие для группы ${cell.groupCode}: аудитория не найдена (${cell.roomId})`,
          cellIds: [cell.id],
        });
      }
    }

    // Availability warnings
    for (const cell of cells) {
      const avail = availabilities[cell.teacherId];
      if (avail) {
        const isAvailable = avail.cells.some(
          (ac) =>
            ac.dayKey === cell.dayKey &&
            ac.slotIndex === cell.slotIndex &&
            ac.parity === cell.parity
        );
        if (!isAvailable) {
          const teacher = teacherById.get(cell.teacherId);
          conflicts.push({
            type: "availability-warning",
            severity: "warning",
            message: `Преподаватель ${teacher?.full ?? cell.teacherId}: занятие вне доступного времени (${cell.dayKey}, ${cell.parity === "even" ? "чёт" : "нечёт"})`,
            cellIds: [cell.id],
          });
        }
      }
    }

    return conflicts;
  },

  // ── Auto-generate schedule ──
  autoGenerate: (config, subjects, constraints) => {
    set({ isGenerating: true, generationProgress: [], generationResult: null });

    // Simulate generation steps
    const progress: string[] = [];
    progress.push("Инициализация генератора расписания...");
    set({ generationProgress: [...progress] });

    // Apply blocked constraints
    progress.push(`Обработка ${constraints.length} ограничений...`);
    set({ generationProgress: [...progress] });

    // Apply fixed constraints
    const fixedCells: ScheduleCell[] = [];
    for (const constraint of constraints) {
      if (constraint.type === "fixed" && constraint.slotIndex !== undefined) {
        const autoSubject = subjects.find(
          (s) =>
            s.subjectId === constraint.subjectId &&
            s.teacherId === constraint.teacherId
        );
        if (autoSubject) {
          fixedCells.push({
            id: `fixed-${fixedCells.length + 1}`,
            groupCode: autoSubject.groupCode,
            dayKey: constraint.dayKey,
            slotIndex: constraint.slotIndex,
            parity: "even",
            subjectId: autoSubject.subjectId,
            teacherId: autoSubject.teacherId,
            roomId: autoSubject.roomId,
            combined: false,
          });
          fixedCells.push({
            id: `fixed-${fixedCells.length + 1}`,
            groupCode: autoSubject.groupCode,
            dayKey: constraint.dayKey,
            slotIndex: constraint.slotIndex,
            parity: "odd",
            subjectId: autoSubject.subjectId,
            teacherId: autoSubject.teacherId,
            roomId: autoSubject.roomId,
            combined: false,
          });
        }
      }
    }

    progress.push(`Закреплено ${fixedCells.length} занятий`);
    set({ generationProgress: [...progress] });

    // Generate fresh mock schedule and combine with fixed cells
    const generated = generateMockSchedule(`autogen-${Date.now()}`);

    progress.push(`Сгенерировано ${generated.length} ячеек расписания`);
    set({ generationProgress: [...progress] });

    // Merge: prefer fixed cells over generated
    const merged = [...fixedCells];
    const occupiedKeys = new Set(
      fixedCells.map((c) => `${c.groupCode}:${c.dayKey}:${c.slotIndex}:${c.parity}`)
    );
    for (const cell of generated) {
      const key = `${cell.groupCode}:${cell.dayKey}:${cell.slotIndex}:${cell.parity}`;
      if (!occupiedKeys.has(key)) {
        merged.push(cell);
        occupiedKeys.add(key);
      }
    }

    progress.push(`Итого: ${merged.length} занятий в расписании`);
    progress.push("Проверка конфликтов...");

    set({ generationProgress: [...progress] });

    // Set cells and check conflicts
    set({ cells: merged });

    const conflicts = get().getConflicts();

    progress.push(
      conflicts.length === 0
        ? "Конфликтов не обнаружено ✓"
        : `Обнаружено ${conflicts.length} конфликтов`
    );

    const result: AutoGenResult = {
      success: conflicts.filter((c) => c.severity === "error").length === 0,
      cells: merged,
      conflicts,
      diagnostics: progress,
      solverMode: "partial",
      partialSchedule: conflicts.filter((c) => c.severity === "error").length > 0,
    };

    set({
      isGenerating: false,
      generationProgress: progress,
      generationResult: result,
    });
  },

  // ── Initialize demo ──
  initializeDemo: () => {
    const cells = generateMockSchedule();
    const availabilities = generateMockAvailability();

    set({
      cells,
      availabilities,
      selectedGroupCode: "ОЭ-11",
      selectedTeacherId: "t1",
      adminGroupCode: "ОЭ-11",
      role: "student",
      isPublished: false,
      publishedAt: null,
      currentParity: "even",
    });
  },
}));
