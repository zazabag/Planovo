// Time slots configuration
export interface TimeSlot {
  index: number;
  start: string; // "08:20"
  end: string; // "09:50"
  label: string; // "1 пара"
  startMinutes: number; // 500
  endMinutes: number; // 590
}

// Days of the week
export interface DayInfo {
  key: string; // "mon"
  short: string; // "Пн"
  full: string; // "Понедельник"
}

// Subject types
export type SubjectType = "lek" | "pr";

// Subject
export interface Subject {
  id: string;
  name: string;
  shortName: string;
  type: SubjectType;
  color: string; // hex color for visual display
}

// Teacher
export interface Teacher {
  id: string;
  surname: string;
  initials: string;
  full: string; // "Буфеев И.В."
  maxDailyLoad: number;
  maxWeeklyLoad: number;
}

// Room
export interface Room {
  id: string;
  name: string; // "21"
  capacity?: number;
  type: "lecture" | "lab" | "any";
}

// Student Group
export interface Group {
  code: string; // "ОЭ-11"
  direction: string; // "Экономика"
  course: number;
  groupNo: number;
  label: string; // "ОЭ-11 (1 курс)"
}

// Week parity
export type Parity = "even" | "odd";

// Schedule Cell - the core data unit
export interface ScheduleCell {
  id: string;
  groupCode: string;
  dayKey: string;
  slotIndex: number;
  parity: Parity;
  subjectId: string;
  teacherId: string;
  roomId: string;
  combined: boolean;
  combinedKey?: string;
}

// For display in the viewer
export interface PairInfo {
  subject: Subject;
  teacher: Teacher;
  room: Room;
  parity: Parity;
  combined: boolean;
  groups?: string[]; // for combined pairs or teacher view
  isReplacement?: boolean;
  exception?: string;
}

// Day schedule - per slot, for a group or teacher
export interface DaySchedule {
  [slotIndex: number]: {
    even: PairInfo | null;
    odd: PairInfo | null;
  };
}

// Week schedule
export interface WeekSchedule {
  [dayKey: string]: DaySchedule;
}

// Teacher availability
export interface AvailabilityCell {
  dayKey: string;
  slotIndex: number;
  parity: Parity;
}

export interface TeacherAvailability {
  teacherId: string;
  cells: AvailabilityCell[];
  submittedParities: Parity[];
  updatedAt: string;
}

// Conflict types
export type ConflictType =
  | "group-conflict"
  | "teacher-conflict"
  | "room-conflict"
  | "incomplete-teacher"
  | "incomplete-room"
  | "availability-warning";

export interface Conflict {
  type: ConflictType;
  severity: "error" | "warning";
  message: string;
  cellIds: string[];
}

// Auto-generation input
export interface AutoGenConfig {
  periodsPerDay: number;
  saturdayPeriods: number;
  workingDays: string[];
  breakAfterPeriod: number;
}

export interface AutoGenSubject {
  subjectId: string;
  teacherId: string;
  roomId: string;
  groupCode: string;
  hoursPerWeek: number;
  type: SubjectType;
  isPaired?: boolean;
  pairedSubjectId?: string;
}

export interface AutoGenConstraint {
  type: "fixed" | "blocked" | "preferred";
  dayKey: string;
  slotIndex?: number;
  subjectId?: string;
  teacherId?: string;
  roomId?: string;
  groupCode?: string;
}

export interface AutoGenResult {
  success: boolean;
  cells: ScheduleCell[];
  conflicts: Conflict[];
  diagnostics: string[];
  solverMode: "strict" | "partial";
  partialSchedule: boolean;
}

// Role for the demo
export type UserRole = "student" | "teacher" | "admin";

// Now indicator
export interface NowInfo {
  currentSlot: number | null;
  nextSlot: number | null;
  currentDay: string;
  isLive: boolean;
  timeToNext: number; // minutes
}
