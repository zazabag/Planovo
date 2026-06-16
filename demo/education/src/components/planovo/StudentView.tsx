"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScheduleStore } from "@/store/schedule-store";
import { GROUPS, DAYS, TIME_SLOTS, groupByCode } from "@/lib/schedule/mock-data";
import type { PairInfo, Parity, NowInfo } from "@/lib/schedule/types";
import { PairCard } from "./PairCard";

function getNowInfo(): NowInfo {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const currentDay = dayMap[dayOfWeek] ?? "mon";
  const minutes = now.getHours() * 60 + now.getMinutes();

  let currentSlot: number | null = null;
  let nextSlot: number | null = null;
  let isLive = false;
  let timeToNext = 0;

  for (const slot of TIME_SLOTS) {
    if (minutes >= slot.startMinutes && minutes <= slot.endMinutes) {
      currentSlot = slot.index;
      isLive = true;
      timeToNext = slot.endMinutes - minutes;
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
      if (minutes < slot.startMinutes) {
        nextSlot = slot.index;
        timeToNext = slot.startMinutes - minutes;
        break;
      }
    }
  }

  return { currentSlot, nextSlot, currentDay, isLive, timeToNext };
}

export function StudentView() {
  const {
    selectedGroupCode,
    setSelectedGroupCode,
    currentParity,
    setCurrentParity,
    getGroupWeekSchedule,
  } = useScheduleStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileDay, setMobileDay] = useState("mon");
  const [nowInfo, setNowInfo] = useState<NowInfo>({
    currentSlot: null,
    nextSlot: null,
    currentDay: "mon",
    isLive: false,
    timeToNext: 0,
  });

  useEffect(() => {
    const update = () => setNowInfo(getNowInfo());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const weekSchedule = useMemo(() => {
    if (!selectedGroupCode) return null;
    return getGroupWeekSchedule(selectedGroupCode);
  }, [selectedGroupCode, getGroupWeekSchedule]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return GROUPS;
    const q = searchQuery.toLowerCase();
    return GROUPS.filter(
      (g) =>
        g.code.toLowerCase().includes(q) ||
        g.direction.toLowerCase().includes(q) ||
        g.label.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedGroup = selectedGroupCode
    ? groupByCode.get(selectedGroupCode)
    : null;

  // Get the active parity pair for a slot
  const getActivePair = (
    dayKey: string,
    slotIndex: number,
    parity: Parity
  ): PairInfo | null => {
    if (!weekSchedule?.[dayKey]?.[slotIndex]) return null;
    return weekSchedule[dayKey][slotIndex][parity] ?? null;
  };

  // Get the pair to display (prefer current parity, fallback to other)
  const getDisplayPair = (
    dayKey: string,
    slotIndex: number
  ): PairInfo | null => {
    const pair = getActivePair(dayKey, slotIndex, currentParity);
    if (pair) return pair;
    const otherParity: Parity = currentParity === "even" ? "odd" : "even";
    return getActivePair(dayKey, slotIndex, otherParity);
  };

  const isCurrentDay = (dayKey: string) => nowInfo.currentDay === dayKey;
  const isCurrentSlot = (slotIndex: number) => nowInfo.currentSlot === slotIndex;
  const isNowPair = (dayKey: string, slotIndex: number) =>
    isCurrentDay(dayKey) && isCurrentSlot(slotIndex);

  // Now indicator pair info
  const nowPair = useMemo(() => {
    if (!nowInfo.isLive || !weekSchedule || !selectedGroupCode) return null;
    const slotIndex = nowInfo.currentSlot ?? 0;
    const dayKey = nowInfo.currentDay;
    const pair = weekSchedule?.[dayKey]?.[slotIndex]?.[currentParity] ?? null;
    if (pair) return pair;
    const otherParity: Parity = currentParity === "even" ? "odd" : "even";
    return weekSchedule?.[dayKey]?.[slotIndex]?.[otherParity] ?? null;
  }, [nowInfo, weekSchedule, selectedGroupCode, currentParity]);

  if (!selectedGroupCode) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="planovo-gradient rounded-2xl p-4 mb-4">
          <Search className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">Выберите группу</h2>
        <p className="text-muted-foreground text-center">
          Выберите группу для просмотра расписания
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Group selector */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск группы..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {filteredGroups.map((group) => (
            <Button
              key={group.code}
              variant={selectedGroupCode === group.code ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGroupCode(group.code)}
              className={
                selectedGroupCode === group.code
                  ? "planovo-gradient text-white border-0 shadow-md shrink-0"
                  : "shrink-0 hover:border-planovo-light"
              }
            >
              <span className="font-semibold">{group.code}</span>
              <span className="text-[10px] ml-1 opacity-70">
                {group.course} курс
              </span>
            </Button>
          ))}
        </div>
      </section>

      {/* Parity selector */}
      <section className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Неделя:</span>
        <div className="flex gap-2">
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

      {/* Now indicator */}
      {nowInfo.isLive && (
        <Card className="border-planovo-light bg-planovo/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="relative">
              <span className="flex h-3 w-3">
                <span className="animate-planovo-pulse absolute inline-flex h-full w-full rounded-full bg-planovo opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-planovo" />
              </span>
            </div>
            <div className="flex-1">
              {nowPair ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Сейчас:</span>
                  <span
                    className="font-bold text-sm"
                    style={{ color: nowPair.subject.color }}
                  >
                    {nowPair.subject.name}
                  </span>
                  <Badge className="text-[10px] bg-planovo/10 text-planovo hover:bg-planovo/10">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    до {TIME_SLOTS[nowInfo.currentSlot ?? 0]?.end}
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Окно — сейчас нет занятия
                </p>
              )}
            </div>
            {nowInfo.nextSlot !== null && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                След: {TIME_SLOTS[nowInfo.nextSlot]?.label}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected group info */}
      {selectedGroup && (
        <div className="flex items-center gap-2">
          <Badge className="bg-planovo/10 text-planovo hover:bg-planovo/10">
            {selectedGroup.code}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {selectedGroup.direction} • {selectedGroup.course} курс
          </span>
        </div>
      )}

      {/* Desktop schedule grid */}
      <section className="hidden lg:block">
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
                    <div>{day.full}</div>
                    {isCurrentDay(day.key) && (
                      <Badge className="mt-0.5 text-[9px] px-1 py-0 h-3.5 bg-planovo text-white hover:bg-planovo">
                        Сегодня
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {TIME_SLOTS.slice(0, 6).map((slot) => (
                <div
                  key={slot.index}
                  className={`grid grid-cols-[80px_repeat(6,1fr)] border-b border-border last:border-b-0 ${
                    isCurrentSlot(slot.index) ? "bg-planovo/3" : ""
                  }`}
                >
                  {/* Time cell */}
                  <div
                    className={`p-2 text-[10px] border-r border-border flex flex-col justify-center ${
                      isCurrentSlot(slot.index)
                        ? "text-planovo font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>
                      {slot.start}-{slot.end}
                    </span>
                    <span className="text-[9px] opacity-70">{slot.label}</span>
                  </div>

                  {/* Day cells */}
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
                            isNow={isNowPair(day.key, slot.index)}
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
      </section>

      {/* Mobile schedule - day tabs */}
      <section className="lg:hidden">
        <Tabs value={mobileDay} onValueChange={setMobileDay}>
          <ScrollArea className="w-full">
            <TabsList className="w-max">
              {DAYS.map((day) => (
                <TabsTrigger
                  key={day.key}
                  value={day.key}
                  className={`relative ${
                    isCurrentDay(day.key) ? "text-planovo" : ""
                  }`}
                >
                  {day.short}
                  {isCurrentDay(day.key) && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-planovo" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {DAYS.map((day) => (
            <TabsContent key={day.key} value={day.key} className="mt-4">
              <div className="space-y-3">
                {TIME_SLOTS.slice(0, 6).map((slot) => {
                  const pair = getDisplayPair(day.key, slot.index);
                  return (
                    <div key={slot.index}>
                      {/* Time label */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-xs font-medium ${
                            isNowPair(day.key, slot.index)
                              ? "text-planovo"
                              : "text-muted-foreground"
                          }`}
                        >
                          {slot.start}–{slot.end}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {slot.label}
                        </span>
                        {isNowPair(day.key, slot.index) && (
                          <Badge className="text-[9px] px-1.5 py-0 h-4 bg-planovo text-white hover:bg-planovo">
                            Сейчас
                          </Badge>
                        )}
                      </div>
                      {pair ? (
                        <PairCard
                          pair={pair}
                          variant="full"
                          isNow={isNowPair(day.key, slot.index)}
                          currentParity={currentParity}
                        />
                      ) : (
                        <div className="p-4 rounded-2xl border border-dashed border-border/50 bg-muted/30">
                          <p className="text-xs text-muted-foreground text-center">
                            Нет занятия
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
