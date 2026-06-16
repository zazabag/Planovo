"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  Zap,
  AlertTriangle,
  BarChart3,
  Settings,
  Send,
  Copy,
  Check,
  X,
  Eye,
  Plus,
  Trash2,
  RefreshCw,
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useScheduleStore } from "@/store/schedule-store";
import {
  GROUPS,
  TEACHERS,
  SUBJECTS,
  ROOMS,
  DAYS,
  TIME_SLOTS,
  subjectById,
  teacherById,
  roomById,
} from "@/lib/schedule/mock-data";
import type { Parity, AutoGenConfig, AutoGenSubject, AutoGenConstraint, ScheduleCell } from "@/lib/schedule/types";

export function AdminView() {
  const {
    adminGroupCode,
    setAdminGroupCode,
    adminDayKey,
    setAdminDayKey,
    adminParity,
    setAdminParity,
    cells,
    addCell,
    removeCell,
    updateCell,
    getConflicts,
    autoGenerate,
    isGenerating,
    generationProgress,
    generationResult,
    isPublished,
    publish,
    currentParity,
  } = useScheduleStore();

  const [constructorPairs, setConstructorPairs] = useState<
    Record<number, { subjectId: string; teacherId: string; roomId: string }>
  >({});
  const [genConfig, setGenConfig] = useState<AutoGenConfig>({
    periodsPerDay: 5,
    saturdayPeriods: 3,
    workingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    breakAfterPeriod: 3,
  });
  const [showGenDialog, setShowGenDialog] = useState(false);
  const cellIdCounter = useRef(0);

  const conflicts = useMemo(() => getConflicts(), [getConflicts, cells]);
  const errorConflicts = conflicts.filter((c) => c.severity === "error");
  const warningConflicts = conflicts.filter((c) => c.severity === "warning");

  // Load existing cells for the selected group/day/parity into constructor
  const loadConstructorPairs = useCallback(() => {
    if (!adminGroupCode) return;
    const pairs: Record<
      number,
      { subjectId: string; teacherId: string; roomId: string }
    > = {};
    for (let si = 0; si < 6; si++) {
      const existing = cells.find(
        (c) =>
          c.groupCode === adminGroupCode &&
          c.dayKey === adminDayKey &&
          c.slotIndex === si &&
          c.parity === adminParity
      );
      if (existing) {
        pairs[si] = {
          subjectId: existing.subjectId,
          teacherId: existing.teacherId,
          roomId: existing.roomId,
        };
      }
    }
    setConstructorPairs(pairs);
  }, [adminGroupCode, adminDayKey, adminParity, cells]);

  useEffect(() => {
    loadConstructorPairs();
  }, [loadConstructorPairs]);

  const setPairField = (
    slotIndex: number,
    field: "subjectId" | "teacherId" | "roomId",
    value: string
  ) => {
    setConstructorPairs((prev) => ({
      ...prev,
      [slotIndex]: {
        ...prev[slotIndex],
        [field]: value,
      },
    }));
  };

  const savePair = (slotIndex: number) => {
    if (!adminGroupCode) return;
    const pair = constructorPairs[slotIndex];
    if (!pair || !pair.subjectId || !pair.teacherId || !pair.roomId) return;

    const existing = cells.find(
      (c) =>
        c.groupCode === adminGroupCode &&
        c.dayKey === adminDayKey &&
        c.slotIndex === slotIndex &&
        c.parity === adminParity
    );

    if (existing) {
      updateCell(existing.id, {
        subjectId: pair.subjectId,
        teacherId: pair.teacherId,
        roomId: pair.roomId,
      });
    } else {
      const newCell: ScheduleCell = {
        id: `admin-cell-${++cellIdCounter.current}`,
        groupCode: adminGroupCode,
        dayKey: adminDayKey,
        slotIndex,
        parity: adminParity,
        subjectId: pair.subjectId,
        teacherId: pair.teacherId,
        roomId: pair.roomId,
        combined: false,
      };
      addCell(newCell);
    }
  };

  const deletePair = (slotIndex: number) => {
    if (!adminGroupCode) return;
    const existing = cells.find(
      (c) =>
        c.groupCode === adminGroupCode &&
        c.dayKey === adminDayKey &&
        c.slotIndex === slotIndex &&
        c.parity === adminParity
    );
    if (existing) {
      removeCell(existing.id);
    }
    setConstructorPairs((prev) => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
  };

  const copyFromOtherParity = () => {
    if (!adminGroupCode) return;
    const otherParity: Parity = adminParity === "even" ? "odd" : "even";
    const pairs: Record<
      number,
      { subjectId: string; teacherId: string; roomId: string }
    > = {};
    for (let si = 0; si < 6; si++) {
      const existing = cells.find(
        (c) =>
          c.groupCode === adminGroupCode &&
          c.dayKey === adminDayKey &&
          c.slotIndex === si &&
          c.parity === otherParity
      );
      if (existing) {
        pairs[si] = {
          subjectId: existing.subjectId,
          teacherId: existing.teacherId,
          roomId: existing.roomId,
        };
      }
    }
    setConstructorPairs(pairs);
  };

  const handleAutoGenerate = () => {
    setShowGenDialog(true);

    // Build subjects from TEACHER_SUBJECTS-like data
    const autoSubjects: AutoGenSubject[] = [];
    for (const subject of SUBJECTS) {
      // Find a teacher for this subject (simplified)
      const teacherCell = cells.find((c) => c.subjectId === subject.id);
      if (teacherCell) {
        for (const group of GROUPS) {
          autoSubjects.push({
            subjectId: subject.id,
            teacherId: teacherCell.teacherId,
            roomId: teacherCell.roomId,
            groupCode: group.code,
            hoursPerWeek: 1,
            type: subject.type,
          });
        }
      }
    }

    const constraints: AutoGenConstraint[] = [];
    autoGenerate(genConfig, autoSubjects, constraints);
  };

  const applyGenerated = () => {
    if (generationResult) {
      setShowGenDialog(false);
    }
  };

  // Dashboard stats
  const stats = useMemo(
    () => ({
      groups: GROUPS.length,
      teachers: TEACHERS.length,
      subjects: SUBJECTS.length,
      rooms: ROOMS.length,
      totalCells: cells.length,
      conflicts: conflicts.length,
      errors: errorConflicts.length,
      warnings: warningConflicts.length,
    }),
    [cells.length, conflicts.length, errorConflicts.length, warningConflicts.length]
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Tabs defaultValue="constructor" className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="constructor" className="flex-1 min-w-[100px]">
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Конструктор
          </TabsTrigger>
          <TabsTrigger value="autogen" className="flex-1 min-w-[100px]">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Автогенерация
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex-1 min-w-[100px]">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Обзор
          </TabsTrigger>
        </TabsList>

        {/* ── Constructor Tab ── */}
        <TabsContent value="constructor" className="mt-4 space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Select
                  value={adminGroupCode ?? ""}
                  onValueChange={setAdminGroupCode}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Группа" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUPS.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <Button
                      key={day.key}
                      variant={adminDayKey === day.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAdminDayKey(day.key)}
                      className={
                        adminDayKey === day.key
                          ? "planovo-gradient text-white border-0"
                          : "hover:border-planovo-light"
                      }
                    >
                      {day.short}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-1">
                  <Button
                    variant={adminParity === "even" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdminParity("even")}
                    className={
                      adminParity === "even"
                        ? "planovo-gradient text-white border-0"
                        : "hover:border-planovo-light"
                    }
                  >
                    Чёт
                  </Button>
                  <Button
                    variant={adminParity === "odd" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdminParity("odd")}
                    className={
                      adminParity === "odd"
                        ? "planovo-gradient text-white border-0"
                        : "hover:border-planovo-light"
                    }
                  >
                    Нечёт
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={copyFromOtherParity}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Скопировать с{" "}
                  {adminParity === "even" ? "нечётной" : "чётной"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slot rows */}
          {adminGroupCode && (
            <div className="space-y-3">
              {TIME_SLOTS.slice(0, 6).map((slot) => {
                const pair = constructorPairs[slot.index];
                const subject = pair
                  ? subjectById.get(pair.subjectId)
                  : null;

                return (
                  <Card key={slot.index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Time label */}
                        <div className="w-[90px] shrink-0">
                          <div className="font-medium text-sm">
                            {slot.start}–{slot.end}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {slot.label}
                          </div>
                        </div>

                        {/* Subject picker */}
                        <div className="flex-1 min-w-[160px]">
                          <Select
                            value={pair?.subjectId ?? ""}
                            onValueChange={(v) =>
                              setPairField(slot.index, "subjectId", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Предмет" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBJECTS.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: s.color }}
                                    />
                                    <span>{s.name}</span>
                                    <Badge
                                      className={`text-[9px] px-1 py-0 h-3.5 ${
                                        s.type === "lek"
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {s.type === "lek" ? "Лек" : "Пр"}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Teacher picker */}
                        <div className="flex-1 min-w-[160px]">
                          <Select
                            value={pair?.teacherId ?? ""}
                            onValueChange={(v) =>
                              setPairField(slot.index, "teacherId", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Преподаватель" />
                            </SelectTrigger>
                            <SelectContent>
                              {TEACHERS.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.full}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Room picker */}
                        <div className="w-[120px]">
                          <Select
                            value={pair?.roomId ?? ""}
                            onValueChange={(v) =>
                              setPairField(slot.index, "roomId", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ауд." />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOMS.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  Ауд. {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {pair &&
                            pair.subjectId &&
                            pair.teacherId &&
                            pair.roomId && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => savePair(slot.index)}
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deletePair(slot.index)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Preview of selected subject */}
                      {subject && (
                        <div className="mt-2 flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span
                            className="text-xs font-medium"
                            style={{ color: subject.color }}
                          >
                            {subject.name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Conflict panel */}
          {conflicts.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Конфликты ({conflicts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {errorConflicts.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg bg-red-50 text-red-700 text-xs"
                      >
                        <X className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{c.message}</span>
                      </div>
                    ))}
                    {warningConflicts.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 text-amber-700 text-xs"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{c.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Publish button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={publish}
              className="planovo-gradient text-white border-0"
              disabled={errorConflicts.length > 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Опубликовать
            </Button>
            {isPublished && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <Check className="h-3 w-3 mr-1" />
                Опубликовано
              </Badge>
            )}
          </div>
        </TabsContent>

        {/* ── Auto-generation Tab ── */}
        <TabsContent value="autogen" className="mt-4 space-y-4">
          {/* Feature card */}
          <Card className="border-planovo-light">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="planovo-gradient rounded-xl p-2.5">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Автоматическая генерация расписания
                  </CardTitle>
                  <CardDescription>
                    Интеллектуальный алгоритм создаёт расписание, учитывая
                    ограничения и предпочтения преподавателей
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Config */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Пар в день
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={genConfig.periodsPerDay}
                    onChange={(e) =>
                      setGenConfig((prev) => ({
                        ...prev,
                        periodsPerDay: parseInt(e.target.value) || 5,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Пар в субботу
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={genConfig.saturdayPeriods}
                    onChange={(e) =>
                      setGenConfig((prev) => ({
                        ...prev,
                        saturdayPeriods: parseInt(e.target.value) || 3,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Перерыв после пары
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={genConfig.breakAfterPeriod}
                    onChange={(e) =>
                      setGenConfig((prev) => ({
                        ...prev,
                        breakAfterPeriod: parseInt(e.target.value) || 3,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleAutoGenerate}
                className="planovo-gradient text-white border-0 w-full sm:w-auto"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Сгенерировать расписание
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generation dialog */}
          <Dialog open={showGenDialog} onOpenChange={setShowGenDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-planovo" />
                  Генерация расписания
                </DialogTitle>
                <DialogDescription>
                  {isGenerating
                    ? "Алгоритм создаёт оптимальное расписание..."
                    : generationResult
                    ? generationResult.success
                      ? "Расписание успешно сгенерировано!"
                      : "Генерация завершена с предупреждениями"
                    : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {/* Progress steps */}
                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {generationProgress.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm animate-fade-in-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {i < generationProgress.length - 1 || !isGenerating ? (
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-planovo shrink-0 animate-spin" />
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {isGenerating && (
                  <Progress value={undefined} className="h-2" />
                )}

                {/* Results */}
                {generationResult && !isGenerating && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {generationResult.success ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3 mr-1" />
                            Успешно
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Частично
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {generationResult.cells.length} занятий •{" "}
                          {generationResult.conflicts.length} конфликтов
                        </span>
                      </div>

                      {generationResult.conflicts.length > 0 && (
                        <div className="space-y-1">
                          {generationResult.conflicts.slice(0, 5).map((c, i) => (
                            <div
                              key={i}
                              className={`text-xs p-2 rounded ${
                                c.severity === "error"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {c.message}
                            </div>
                          ))}
                          {generationResult.conflicts.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              ...и ещё {generationResult.conflicts.length - 5}
                            </p>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={applyGenerated}
                        className="planovo-gradient text-white border-0 w-full"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Применить
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── Dashboard Tab ── */}
        <TabsContent value="dashboard" className="mt-4 space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="planovo-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-planovo/10 rounded-lg p-2">
                    <Users className="h-5 w-5 text-planovo" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.groups}</p>
                    <p className="text-xs text-muted-foreground">Групп</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="planovo-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-planovo-secondary/10 rounded-lg p-2">
                    <GraduationCap className="h-5 w-5 text-planovo-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.teachers}</p>
                    <p className="text-xs text-muted-foreground">
                      Преподавателей
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="planovo-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-planovo-accent/10 rounded-lg p-2">
                    <BookOpen className="h-5 w-5 text-planovo-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.subjects}</p>
                    <p className="text-xs text-muted-foreground">Предметов</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="planovo-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 rounded-lg p-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.rooms}</p>
                    <p className="text-xs text-muted-foreground">Аудиторий</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="planovo-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        stats.errors > 0
                          ? "bg-red-100"
                          : "bg-emerald-100"
                      }`}
                    >
                      <Shield
                        className={`h-5 w-5 ${
                          stats.errors > 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Конфликты</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.errors} ошибок, {stats.warnings} предупреждений
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      stats.errors > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  >
                    {stats.errors > 0 ? "Есть ошибки" : "Чисто"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="planovo-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        isPublished
                          ? "bg-emerald-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Send
                        className={`h-5 w-5 ${
                          isPublished
                            ? "text-emerald-600"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Статус</p>
                      <p className="text-xs text-muted-foreground">
                        {isPublished ? "Опубликовано" : "Черновик"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      isPublished
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {isPublished ? "Опубликован" : "Черновик"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total lessons */}
          <Card className="planovo-card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-planovo/10 rounded-lg p-2">
                  <Clock className="h-5 w-5 text-planovo" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.totalCells}</p>
                  <p className="text-xs text-muted-foreground">
                    Всего занятий в расписании
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tabsEl = document.querySelector(
                    '[data-state="active"][value="autogen"]'
                  );
                  if (tabsEl) (tabsEl as HTMLElement).click();
                }}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Сгенерировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={publish}
                disabled={errorConflicts.length > 0}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Опубликовать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const { initializeDemo } = useScheduleStore.getState();
                  initializeDemo();
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Сбросить демо
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
