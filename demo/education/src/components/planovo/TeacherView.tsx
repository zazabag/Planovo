"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Send, Copy, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useScheduleStore } from "@/store/schedule-store";
import {
  TEACHERS,
  DAYS,
  TIME_SLOTS,
} from "@/lib/schedule/mock-data";
import type { PairInfo, Parity, TeacherAvailability } from "@/lib/schedule/types";
import { PairCard } from "./PairCard";

export function TeacherView() {
  const {
    selectedTeacherId,
    setSelectedTeacherId,
    currentParity,
    setCurrentParity,
    getTeacherWeekSchedule,
    availabilities,
    setAvailability,
  } = useScheduleStore();

  const [availParity, setAvailParity] = useState<Parity>("even");
  const [localAvail, setLocalAvail] = useState<Record<string, boolean>>({});

  const weekSchedule = useMemo(() => {
    if (!selectedTeacherId) return null;
    return getTeacherWeekSchedule(selectedTeacherId);
  }, [selectedTeacherId, getTeacherWeekSchedule]);

  const teacherAvail = selectedTeacherId
    ? availabilities[selectedTeacherId]
    : null;

  // Initialize local availability from store
  const initLocalAvail = useCallback(() => {
    if (!teacherAvail) return;
    const map: Record<string, boolean> = {};
    for (const day of DAYS) {
      const maxSlot = day.key === "sat" ? 3 : TIME_SLOTS.length;
      for (let si = 0; si < maxSlot; si++) {
        const key = `${day.key}:${si}:${availParity}`;
        const isAvailable = teacherAvail.cells.some(
          (c) =>
            c.dayKey === day.key &&
            c.slotIndex === si &&
            c.parity === availParity
        );
        map[key] = isAvailable;
      }
    }
    setLocalAvail(map);
  }, [teacherAvail, availParity]);

  // Reset local avail when teacher or parity changes
  useEffect(() => {
    initLocalAvail();
  }, [initLocalAvail]);

  const toggleAvailCell = (dayKey: string, slotIndex: number) => {
    const key = `${dayKey}:${slotIndex}:${availParity}`;
    setLocalAvail((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const submitAvailability = () => {
    if (!selectedTeacherId) return;

    const cells: { dayKey: string; slotIndex: number; parity: Parity }[] = [];
    for (const day of DAYS) {
      const maxSlot = day.key === "sat" ? 3 : TIME_SLOTS.length;
      for (let si = 0; si < maxSlot; si++) {
        for (const p of ["even", "odd"] as Parity[]) {
          const key = `${day.key}:${si}:${p}`;
          if (p === availParity) {
            if (localAvail[key]) {
              cells.push({ dayKey: day.key, slotIndex: si, parity: p });
            }
          } else {
            // Keep other parity data
            const isAvailable = teacherAvail?.cells.some(
              (c) =>
                c.dayKey === day.key &&
                c.slotIndex === si &&
                c.parity === p
            );
            if (isAvailable) {
              cells.push({ dayKey: day.key, slotIndex: si, parity: p });
            }
          }
        }
      }
    }

    const updated: TeacherAvailability = {
      teacherId: selectedTeacherId,
      cells,
      submittedParities: [
        ...new Set([...(teacherAvail?.submittedParities ?? []), availParity]),
      ],
      updatedAt: new Date().toISOString(),
    };

    setAvailability(selectedTeacherId, updated);
  };

  const copyFromOtherParity = () => {
    const otherParity: Parity = availParity === "even" ? "odd" : "even";
    const newLocalAvail = { ...localAvail };

    for (const day of DAYS) {
      const maxSlot = day.key === "sat" ? 3 : TIME_SLOTS.length;
      for (let si = 0; si < maxSlot; si++) {
        const sourceKey = `${day.key}:${si}:${otherParity}`;
        const targetKey = `${day.key}:${si}:${availParity}`;
        const sourceAvail = teacherAvail?.cells.some(
          (c) =>
            c.dayKey === day.key &&
            c.slotIndex === si &&
            c.parity === otherParity
        );
        newLocalAvail[targetKey] = !!sourceAvail;
      }
    }

    setLocalAvail(newLocalAvail);
  };

  const getDisplayPair = (
    dayKey: string,
    slotIndex: number
  ): PairInfo | null => {
    if (!weekSchedule?.[dayKey]?.[slotIndex]) return null;
    const pair = weekSchedule[dayKey][slotIndex][currentParity];
    if (pair) return pair;
    const otherParity: Parity = currentParity === "even" ? "odd" : "even";
    return weekSchedule[dayKey][slotIndex][otherParity] ?? null;
  };

  const isCurrentDay = (dayKey: string) => {
    const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return dayMap[new Date().getDay()] === dayKey;
  };

  if (!selectedTeacherId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-muted-foreground">Выберите преподавателя</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Teacher selector */}
      <section className="flex items-center gap-3 flex-wrap">
        <Select
          value={selectedTeacherId}
          onValueChange={setSelectedTeacherId}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Выберите преподавателя" />
          </SelectTrigger>
          <SelectContent>
            {TEACHERS.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.full}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Неделя:</span>
          <Button
            variant={currentParity === "even" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentParity("even")}
            className={
              currentParity === "even"
                ? "planovo-gradient text-white border-0"
                : "hover:border-planovo-light"
            }
          >
            Чётная
          </Button>
          <Button
            variant={currentParity === "odd" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentParity("odd")}
            className={
              currentParity === "odd"
                ? "planovo-gradient text-white border-0"
                : "hover:border-planovo-light"
            }
          >
            Нечётная
          </Button>
        </div>
      </section>

      {/* Sub-tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList>
          <TabsTrigger value="schedule">Моё расписание</TabsTrigger>
          <TabsTrigger value="availability">Доступность</TabsTrigger>
        </TabsList>

        {/* Schedule tab */}
        <TabsContent value="schedule" className="mt-4">
          {/* Desktop grid */}
          <div className="hidden lg:block">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[900px]">
                  {/* Header row */}
                  <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border">
                    <div className="p-3 text-xs font-medium text-muted-foreground border-r border-border">
                      Время
                    </div>
                    {DAYS.map((day) => (
                      <div
                        key={day.key}
                        className={`p-3 text-center text-xs font-medium border-r border-border last:border-r-0 ${
                          isCurrentDay(day.key)
                            ? "bg-planovo/5 text-planovo"
                            : "text-muted-foreground"
                        }`}
                      >
                        {day.full}
                      </div>
                    ))}
                  </div>

                  {TIME_SLOTS.slice(0, 6).map((slot) => (
                    <div
                      key={slot.index}
                      className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border last:border-b-0"
                    >
                      <div className="p-2 text-[10px] border-r border-border flex flex-col justify-center text-muted-foreground">
                        <span>
                          {slot.start}-{slot.end}
                        </span>
                        <span className="text-[9px] opacity-70">
                          {slot.label}
                        </span>
                      </div>
                      {DAYS.map((day) => {
                        const pair = getDisplayPair(day.key, slot.index);
                        return (
                          <div
                            key={day.key}
                            className={`p-1.5 border-r border-border last:border-r-0 ${
                              isCurrentDay(day.key) ? "bg-planovo/[0.02]" : ""
                            }`}
                          >
                            {pair ? (
                              <PairCard
                                pair={pair}
                                variant="compact"
                                showGroup
                                currentParity={currentParity}
                              />
                            ) : (
                              <div className="h-full min-h-[60px] flex items-center justify-center">
                                <div className="grid grid-cols-3 gap-1 opacity-20">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="h-1 w-1 rounded-full bg-muted-foreground"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Mobile list */}
          <div className="lg:hidden space-y-4">
            {DAYS.map((day) => {
              const dayPairs = TIME_SLOTS.slice(0, 6)
                .map((slot) => ({
                  slot,
                  pair: getDisplayPair(day.key, slot.index),
                }))
                .filter((item) => item.pair !== null);

              if (dayPairs.length === 0) return null;

              return (
                <Card key={day.key}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-planovo" />
                      {day.full}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {dayPairs.map(({ slot, pair }) => (
                      <div key={slot.index}>
                        <span className="text-[10px] text-muted-foreground">
                          {slot.start}–{slot.end}
                        </span>
                        {pair && (
                          <PairCard
                            pair={pair}
                            variant="full"
                            showGroup
                            currentParity={currentParity}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Availability tab */}
        <TabsContent value="availability" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base">
                  Доступность преподавателя
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Неделя:</span>
                  <Button
                    variant={availParity === "even" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAvailParity("even")}
                    className={
                      availParity === "even"
                        ? "planovo-gradient text-white border-0"
                        : "hover:border-planovo-light"
                    }
                  >
                    Чётная
                  </Button>
                  <Button
                    variant={availParity === "odd" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAvailParity("odd")}
                    className={
                      availParity === "odd"
                        ? "planovo-gradient text-white border-0"
                        : "hover:border-planovo-light"
                    }
                  >
                    Нечётная
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Нажмите на ячейку, чтобы указать доступность.{" "}
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-emerald-100 border border-emerald-300" />{" "}
                  — доступен
                </span>{" "}
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-gray-100 border border-gray-300" />{" "}
                  — недоступен
                </span>
              </p>

              {/* Availability grid */}
              <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[600px]">
                  {/* Header */}
                  <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border">
                    <div className="p-2 text-xs font-medium text-muted-foreground border-r border-border">
                      Время
                    </div>
                    {DAYS.map((day) => (
                      <div
                        key={day.key}
                        className="p-2 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
                      >
                        {day.short}
                      </div>
                    ))}
                  </div>

                  {/* Slots */}
                  {TIME_SLOTS.slice(0, 6).map((slot) => (
                    <div
                      key={slot.index}
                      className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border last:border-b-0"
                    >
                      <div className="p-2 text-[10px] border-r border-border flex items-center text-muted-foreground">
                        <span>
                          {slot.start}-{slot.end}
                        </span>
                      </div>
                      {DAYS.map((day) => {
                        const key = `${day.key}:${slot.index}:${availParity}`;
                        const isAvailable = localAvail[key] ?? false;
                        return (
                          <div
                            key={day.key}
                            className="p-1 border-r border-border last:border-r-0"
                          >
                            <button
                              onClick={() =>
                                toggleAvailCell(day.key, slot.index)
                              }
                              className={`w-full h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                                isAvailable
                                  ? "bg-emerald-100 border-emerald-300 hover:bg-emerald-200"
                                  : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                              }`}
                              title={
                                isAvailable ? "Доступен" : "Недоступен"
                              }
                            >
                              {isAvailable ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <X className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={submitAvailability}
                  className="planovo-gradient text-white border-0"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Отправить учебной части
                </Button>
                <Button variant="outline" onClick={copyFromOtherParity}>
                  <Copy className="h-4 w-4 mr-2" />
                  Скопировать с{" "}
                  {availParity === "even" ? "нечётной" : "чётной"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
