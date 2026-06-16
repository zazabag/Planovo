"use client";

import { Calendar, GraduationCap, BookOpen, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScheduleStore } from "@/store/schedule-store";
import type { UserRole } from "@/lib/schedule/types";
import { useState } from "react";

const ROLES: { key: UserRole; label: string; icon: typeof GraduationCap }[] = [
  { key: "student", label: "Ученик", icon: GraduationCap },
  { key: "teacher", label: "Преподаватель", icon: BookOpen },
  { key: "admin", label: "Учебная часть", icon: Shield },
];

export function PlanovoHeader() {
  const { role, setRole } = useScheduleStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="planovo-gradient rounded-xl p-2 shadow-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="planovo-gradient-text font-bold text-lg leading-tight">
                Планово
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                Демо: Учебные учреждения
              </p>
            </div>
          </div>

          {/* Desktop role selector */}
          <div className="hidden md:flex items-center gap-2">
            {ROLES.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={role === key ? "default" : "outline"}
                size="sm"
                onClick={() => setRole(key)}
                className={
                  role === key
                    ? "planovo-gradient text-white border-0 shadow-md hover:shadow-lg transition-all"
                    : "hover:border-planovo-light transition-all"
                }
              >
                <Icon className="h-4 w-4 mr-1.5" />
                {label}
              </Button>
            ))}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile role selector */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2 animate-fade-in-up">
            {ROLES.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={role === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setRole(key);
                  setMobileMenuOpen(false);
                }}
                className={
                  role === key
                    ? "planovo-gradient text-white border-0 shadow-md justify-start"
                    : "justify-start hover:border-planovo-light"
                }
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
