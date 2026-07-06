/* Mobvex Trainer — app router. Auth → Roster → Student → Builders. */
"use client";

import { useEffect, useState } from "react";
import { getSession, logout, subscribeToAuthChanges } from "@mobvex/db";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/components/trainer/Sidebar";
import { Topbar } from "@/components/trainer/Topbar";
import { AuthScreen } from "@/components/screens/AuthScreen";
import { NewStudentScreen } from "@/components/screens/NewStudentScreen";
import { RosterScreen } from "@/components/screens/RosterScreen";
import { StudentScreen } from "@/components/screens/StudentScreen";
import { RoutineBuilder } from "@/components/screens/RoutineBuilder";
import { DietBuilder } from "@/components/screens/DietBuilder";
import { studentById } from "@/lib/data";

type View = "roster" | "newStudent" | "student" | "routine" | "diet";

export default function Page() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("roster");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const student = studentById(studentId);

  useEffect(() => {
    getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoading(false);
    });

    return subscribeToAuthChanges(async (_event, session) => {
      setAuthed(!!session);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg">
        <span className="font-display text-[20px] tracking-[3px] text-muted">
          CARGANDO...
        </span>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="h-screen w-screen bg-bg">
        <AuthScreen onAuth={() => {}} />
      </div>
    );
  }

  const openStudent = (id: string) => {
    setStudentId(id);
    setView("student");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen w-screen bg-bg">
      <Sidebar
        nav="roster"
        onNav={(n) => {
          if (n === "roster") setView("roster");
        }}
        onLogout={handleLogout}
      />
      <main className="flex h-full min-w-0 flex-1 flex-col">
        {view === "roster" && (
          <>
            <Topbar
              title="Mis alumnos"
              subtitle="Gestiona tu equipo y su progreso"
              search={search}
              onSearch={setSearch}
              actions={
                <Button
                  variant="primary"
                  onClick={() => setView("newStudent")}
                  leadingIcon={<Icon name="plus" size={18} color="#0A0A0B" />}
                >
                  Nuevo alumno
                </Button>
              }
            />
            <RosterScreen search={search} onOpenStudent={openStudent} />
          </>
        )}

        {view === "newStudent" && (
          <>
            <Topbar
              title="Nuevo alumno"
              subtitle="Añade a alguien a tu lista"
              onBack={() => setView("roster")}
            />
            <NewStudentScreen
              onDone={openStudent}
              onCancel={() => setView("roster")}
            />
          </>
        )}

        {view === "student" && studentId && (
          <>
            <Topbar
              title="Ficha del alumno"
              subtitle={student?.name}
              onBack={() => setView("roster")}
            />
            <StudentScreen
              studentId={studentId}
              onEditRoutine={() => setView("routine")}
              onEditDiet={() => setView("diet")}
            />
          </>
        )}

        {view === "routine" && studentId && (
          <>
            <Topbar
              title="Editor de rutina"
              subtitle={student ? `Para ${student.name}` : ""}
              onBack={() => setView("student")}
            />
            <RoutineBuilder studentId={studentId} />
          </>
        )}

        {view === "diet" && studentId && (
          <>
            <Topbar
              title="Editor de dieta"
              subtitle={student ? `Para ${student.name}` : ""}
              onBack={() => setView("student")}
            />
            <DietBuilder studentId={studentId} />
          </>
        )}
      </main>
    </div>
  );
}
