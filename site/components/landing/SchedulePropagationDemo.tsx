"use client";

import {
  ArrowRight,
  Building2,
  Check,
  CircleAlert,
  GraduationCap,
  Send,
  UserRound,
} from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { useState } from "react";

type Phase = "change" | "check" | "published";

const phaseCopy: Record<
  Phase,
  { label: string; live: string; version: string; status: string }
> = {
  change: {
    label: "Изменение",
    live:
      "Учебная часть переносит занятие на 13:20 в аудиторию 312. Черновик ожидает проверки.",
    version: "v18 · черновик",
    status: "Перенос на 13:20",
  },
  check: {
    label: "Конфликт",
    live:
      "Группа и преподаватель свободны, но аудитория 312 занята. Доступна аудитория 214.",
    version: "v18 · проверка",
    status: "312 занята · 214 свободна",
  },
  published: {
    label: "Публикация",
    live:
      "Версия 19 опубликована. Занятие в 13:20, аудитория 214, доступно преподавателю и учащимся.",
    version: "v19 · опубликовано",
    status: "Новая версия доступна ролям",
  },
};

const phaseOrder: Phase[] = ["change", "check", "published"];

export function SchedulePropagationDemo() {
  const [phase, setPhase] = useState<Phase>("change");
  const reduceMotion = useReducedMotion();
  const current = phaseCopy[phase];
  const isPublished = phase === "published";

  return (
    <LazyMotion features={domAnimation}>
      <div className={`schedule-demo schedule-demo--${phase}`}>
        <div className="schedule-demo__chrome">
          <div className="schedule-demo__topline">
            <div>
              <span className="schedule-demo__app-dot" aria-hidden="true" />
              <span>Конструктор · Группа ИС-21</span>
            </div>
            <span className="mono">{current.version}</span>
          </div>

          <div className="schedule-demo__stage" aria-hidden="true">
            <div className="schedule-grid">
              <div className="schedule-grid__header">
                <span>Время</span>
                <span>Среда, 12 марта</span>
                <span>Ограничения</span>
              </div>
              <div className="schedule-grid__row schedule-grid__row--quiet">
                <time>10:00</time>
                <div>
                  <span>Веб-разработка</span>
                  <small>Ауд. 307 · А. В. Лебедев</small>
                </div>
                <span className="grid-state grid-state--quiet">Без изменений</span>
              </div>
              <div className="schedule-grid__row schedule-grid__row--active">
                <time>13:20</time>
                <m.div
                  className="lesson-cell"
                  initial={false}
                  animate={{
                    y: phase === "change" ? 0 : 8,
                    scale: phase === "check" ? 1.015 : 1,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.52, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <span className="lesson-cell__tag">
                    {isPublished
                      ? "Опубликовано"
                      : phase === "check"
                        ? "Конфликт"
                        : "Перенос"}
                  </span>
                  <strong>Проектирование ИС</strong>
                  <small>
                    {isPublished ? "Ауд. 214" : "Ауд. 312"} · Е. Р. Волкова
                  </small>
                </m.div>
                <div className="constraint-state">
                  {phase === "change" ? (
                    <>
                      <CircleAlert size={15} />
                      <span>Ожидает проверки</span>
                    </>
                  ) : phase === "check" ? (
                    <>
                      <CircleAlert size={15} />
                      <span>312 занята</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Опубликовано</span>
                    </>
                  )}
                </div>
              </div>
              <div className="schedule-grid__row schedule-grid__row--quiet">
                <time>15:00</time>
                <div>
                  <span>Практика</span>
                  <small>Лаб. 204 · М. О. Кравцов</small>
                </div>
                <span className="grid-state grid-state--quiet">Без изменений</span>
              </div>
            </div>

            <div className="constraint-rail">
              <div className={phase === "change" ? "" : "is-complete"}>
                <UserRound />
                <span>Преподаватель</span>
                <strong>{phase === "change" ? "проверяем" : "свободен"}</strong>
              </div>
              <div className={phase === "change" ? "" : "is-complete"}>
                <GraduationCap />
                <span>Группа</span>
                <strong>{phase === "change" ? "проверяем" : "свободна"}</strong>
              </div>
              <div
                className={
                  phase === "change"
                    ? ""
                    : phase === "check"
                      ? "is-conflict"
                      : "is-complete"
                }
              >
                <Building2 />
                <span>Аудитория</span>
                <strong>
                  {phase === "change"
                    ? "проверяем"
                    : phase === "check"
                      ? "312 занята · 214 свободна"
                      : "214 свободна"}
                </strong>
              </div>
            </div>

            <div className="receiver-stack">
              <m.div
                className="receiver receiver--teacher"
                animate={{
                  opacity: isPublished ? 1 : 0.56,
                  x: isPublished && !reduceMotion ? 0 : 8,
                }}
                transition={{ duration: reduceMotion ? 0 : 0.42 }}
              >
                <span className="receiver__icon">
                  <UserRound />
                </span>
                <span>
                  <small>Преподаватель</small>
                  <strong>{isPublished ? "Сегодня · 13:20" : "Сегодня · 11:40"}</strong>
                </span>
                {isPublished ? <Check className="receiver__check" /> : null}
              </m.div>
              <m.div
                className="receiver receiver--student"
                animate={{
                  opacity: isPublished ? 1 : 0.56,
                  x: isPublished && !reduceMotion ? 0 : 8,
                }}
                transition={{
                  duration: reduceMotion ? 0 : 0.42,
                  delay: reduceMotion ? 0 : 0.09,
                }}
              >
                <span className="receiver__icon">
                  <GraduationCap />
                </span>
                <span>
                  <small>Группа ИС-21</small>
                  <strong>{isPublished ? "Пара перенесена" : "Текущая версия"}</strong>
                </span>
                {isPublished ? <Send className="receiver__check" /> : null}
              </m.div>
            </div>

            <AnimatePresence mode="wait">
              <m.div
                key={phase}
                className="schedule-demo__signal"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: reduceMotion ? 0 : 0.32 }}
              >
                <span>{current.label}</span>
                <strong>{current.status}</strong>
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="schedule-demo__controls" aria-label="Этапы сценария">
          {phaseOrder.map((item, index) => (
            <button
              key={item}
              type="button"
              className={phase === item ? "is-active" : ""}
              aria-pressed={phase === item}
              onClick={() => setPhase(item)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {phaseCopy[item].label}
              {index < phaseOrder.length - 1 ? (
                <ArrowRight aria-hidden="true" size={14} />
              ) : null}
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {current.live}
        </p>
      </div>
    </LazyMotion>
  );
}
