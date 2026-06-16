"use client";

import { useEffect } from "react";
import { Calendar } from "lucide-react";
import { useScheduleStore } from "@/store/schedule-store";
import { PlanovoHeader } from "@/components/planovo/PlanovoHeader";
import { StudentView } from "@/components/planovo/StudentView";
import { TeacherView } from "@/components/planovo/TeacherView";
import { AdminView } from "@/components/planovo/AdminView";

export default function Home() {
  const { role, initializeDemo } = useScheduleStore();

  useEffect(() => {
    initializeDemo();
  }, [initializeDemo]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PlanovoHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {role === "student" && <StudentView />}
        {role === "teacher" && <TeacherView />}
        {role === "admin" && <AdminView />}
      </main>

      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="planovo-gradient rounded-md p-1">
                <Calendar className="h-3 w-3 text-white" />
              </div>
              <span className="planovo-gradient-text font-semibold">
                Планово
              </span>
              <span>© 2025</span>
            </div>
            <div className="hidden sm:block">
              Демо системы составления расписания для учебных учреждений
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
