"use client";

import { MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PairInfo, Parity } from "@/lib/schedule/types";

interface PairCardProps {
  pair: PairInfo;
  variant?: "compact" | "full";
  showGroup?: boolean;
  isNow?: boolean;
  currentParity?: Parity;
}

export function PairCard({
  pair,
  variant = "compact",
  showGroup = false,
  isNow = false,
  currentParity,
}: PairCardProps) {
  const { subject, teacher, room, parity, combined, groups } = pair;

  const isParitySpecific = currentParity && parity !== currentParity;
  const isLecture = subject.type === "lek";

  if (variant === "compact") {
    return (
      <div
        className={`schedule-cell relative p-2 rounded-xl border transition-all ${
          isNow
            ? "ring-2 ring-planovo shadow-md bg-planovo/5 border-planovo-light"
            : "bg-white border-border hover:border-planovo-light"
        } ${isParitySpecific ? "opacity-60" : ""}`}
      >
        {/* Now indicator */}
        {isNow && (
          <div className="absolute -top-1 -right-1">
            <span className="flex h-4 w-4">
              <span className="animate-planovo-pulse absolute inline-flex h-full w-full rounded-full bg-planovo opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-planovo" />
            </span>
          </div>
        )}

        {/* Subject name */}
        <div className="flex items-start gap-1.5">
          <div
            className="mt-0.5 h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: subject.color }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="font-semibold text-xs leading-tight truncate"
              style={{ color: subject.color }}
            >
              {subject.shortName}
            </p>
            {/* Type badge */}
            <Badge
              variant="secondary"
              className={`mt-1 text-[10px] px-1.5 py-0 h-4 ${
                isLecture
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {isLecture ? "Лек" : "Пр"}
            </Badge>
          </div>
        </div>

        {/* Teacher / Group */}
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground truncate">
          {showGroup && groups ? (
            <>
              <Users className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{groups.join(", ")}</span>
            </>
          ) : (
            <span className="truncate">{teacher.surname}</span>
          )}
        </div>

        {/* Room */}
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span>{room.name}</span>
        </div>

        {/* Badges row */}
        <div className="mt-1 flex flex-wrap gap-1">
          {combined && (
            <Badge className="text-[9px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
              Совмещ.
            </Badge>
          )}
          {isParitySpecific && (
            <Badge className="text-[9px] px-1 py-0 h-3.5 bg-gray-100 text-gray-600 hover:bg-gray-100">
              {parity === "even" ? "Чёт" : "Нечёт"}
            </Badge>
          )}
        </div>

        {/* Now label */}
        {isNow && (
          <div className="mt-1 flex items-center gap-0.5 text-[9px] text-planovo font-medium">
            <Clock className="h-2.5 w-2.5" />
            Сейчас
          </div>
        )}
      </div>
    );
  }

  // Full variant for list/mobile view
  return (
    <div
      className={`schedule-cell relative p-4 rounded-2xl border transition-all ${
        isNow
          ? "ring-2 ring-planovo shadow-md bg-planovo/5 border-planovo-light"
          : "bg-white border-border hover:border-planovo-light"
      } ${isParitySpecific ? "opacity-60" : ""}`}
    >
      {/* Now indicator */}
      {isNow && (
        <div className="absolute -top-2 -right-2">
          <span className="flex h-5 w-5">
            <span className="animate-planovo-pulse absolute inline-flex h-full w-full rounded-full bg-planovo opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-planovo items-center justify-center">
              <span className="text-white text-[8px] font-bold">!</span>
            </span>
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Color indicator */}
        <div
          className="mt-1 h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: subject.color }}
        />

        <div className="flex-1 min-w-0">
          {/* Subject + type */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className="font-bold text-sm leading-tight"
              style={{ color: subject.color }}
            >
              {subject.name}
            </h4>
            <Badge
              className={`text-[10px] px-2 py-0.5 h-5 ${
                isLecture
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {isLecture ? "Лекция" : "Практика"}
            </Badge>
          </div>

          {/* Teacher or Group */}
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            {showGroup && groups ? (
              <>
                <Users className="h-3.5 w-3.5 shrink-0 text-planovo-secondary" />
                <span>Группы: {groups.join(", ")}</span>
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5 shrink-0 text-planovo-secondary" />
                <span>{teacher.full}</span>
              </>
            )}
          </div>

          {/* Room */}
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-planovo-accent" />
            <span>Ауд. {room.name}</span>
          </div>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {combined && (
              <Badge className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 hover:bg-amber-100">
                Совмещённая пара
              </Badge>
            )}
            {isParitySpecific && (
              <Badge className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 hover:bg-gray-100">
                {parity === "even" ? "Чётная неделя" : "Нечётная неделя"}
              </Badge>
            )}
            {isNow && (
              <Badge className="text-[10px] px-2 py-0.5 bg-planovo text-white hover:bg-planovo">
                Сейчас
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
